import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const require = createRequire(import.meta.url);
const envLoader = require.resolve('@next/env');
const typescript = require.resolve('typescript');
const authFile = resolve('lib/admin/auth.ts');
const generator = resolve('scripts/admin-password.mjs');
const password = 'temporary-environment-regression';

function generate(ending) {
  const result = spawnSync(process.execPath, [generator], {
    input: password + ending,
    encoding: 'utf8',
  });
  assert.ok(result.status === 0, 'Password generator must succeed; output withheld.');
  const line = result.stdout.trim();
  assert.ok(line.startsWith('ADMIN_PASSWORD_HASH='), 'Generator must output an env assignment; output withheld.');
  const value = line.slice('ADMIN_PASSWORD_HASH='.length);
  assert.ok(/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(value), 'Generated format must match server validation; value withheld.');
  const [salt, digest] = value.split(':');
  assert.ok(timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(digest, 'hex')), 'Generated digest must verify the original input; values withheld.');
  return { value, line };
}

test('password generator accepts stdin LF/CRLF without changing the password', () => {
  for (const ending of ['', '\n', '\r\n']) generate(ending);
  const result = spawnSync(process.execPath, [generator], { input: 'short\n', encoding: 'utf8' });
  assert.ok(result.status !== 0, 'Short passwords must be rejected.');
  assert.ok(result.stdout.length === 0, 'Rejected input must not produce a credential.');
});

test('Next.js loads generated .env.local credentials and the actual admin guard accepts only valid configuration', () => {
  const directory = mkdtempSync(join(tmpdir(), 'altomebay-env-regression-'));
  try {
    const { line } = generate('\n');
    writeFileSync(join(directory, '.env.local'), `${line}\n`, { mode: 0o600 });
    // Each child gets a fresh Next environment cache. Only boolean diagnostics
    // leave the child: never echo a password, digest, or env-file contents.
    const source = `
      const fs = require('node:fs');
      const ts = require(${JSON.stringify(typescript)});
      const { loadEnvConfig } = require(${JSON.stringify(envLoader)});
      loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
      const compiled = ts.transpileModule(fs.readFileSync(${JSON.stringify(authFile)}, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
      }).outputText;
      const loaded = { exports: {} };
      const req = (name) => ['server-only', 'next/headers', './db', './postgres.mjs'].includes(name) ? {} : require(name);
      new Function('require', 'module', 'exports', compiled)(req, loaded, loaded.exports);
      process.stdout.write(JSON.stringify({ present: !!process.env.ADMIN_PASSWORD_HASH, configured: loaded.exports.configured() }));
    `;
    const run = (overrides = {}, cwd = directory) => {
      const environment = { ...process.env, NODE_ENV: 'development' };
      delete environment.ADMIN_PASSWORD_HASH;
      delete environment.__NEXT_PROCESSED_ENV;
      const result = spawnSync(process.execPath, ['-e', source], { cwd, env: { ...environment, ...overrides }, encoding: 'utf8' });
      assert.ok(result.status === 0, 'Environment probe must succeed; process output withheld.');
      return JSON.parse(result.stdout);
    };
    assert.deepEqual(run(), { present: true, configured: true });
    // Real process variables have precedence over .env.local in Next.js.
    assert.deepEqual(run({ ADMIN_PASSWORD_HASH: '' }), { present: false, configured: false });
    assert.deepEqual(run({ ADMIN_PASSWORD_HASH: 'malformed' }), { present: true, configured: false });
    const salt = randomBytes(16).toString('hex');
    const digest = scryptSync(password, salt, 64).toString('hex');
    for (const invalid of [`${salt}:${digest}extra`, `${salt}:${digest} `, `${salt}:`, `ADMIN_PASSWORD_HASH=${salt}:${digest}`]) {
      assert.deepEqual(run({ ADMIN_PASSWORD_HASH: invalid }), { present: true, configured: false });
    }
    const absent = mkdtempSync(join(directory, 'no-env-'));
    assert.deepEqual(run({}, absent), { present: false, configured: false });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
