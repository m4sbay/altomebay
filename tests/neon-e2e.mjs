// Explicit opt-in HTTP smoke test against a separate Neon branch, never production.
// Run after npm run build: node tests/neon-e2e.mjs <private-branch-env.json>
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import nextEnv from '@next/env';
import { connectionTarget, createPostgresPool } from '../lib/admin/postgres.mjs';
// Use the serializer bundled with this Next version, including streaming field order.
const { encodeReply } = createRequire(import.meta.url)('next/dist/compiled/react-server-dom-webpack/client.node');

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
assert.ok(process.argv[2], 'Supply a private JSON file with test branch connection variables');
const branch = JSON.parse(readFileSync(process.argv[2], 'utf8'));
assert.ok(branch.DATABASE_URL && branch.DATABASE_URL_UNPOOLED);
assert.notEqual(connectionTarget(branch.DATABASE_URL), connectionTarget(process.env.DATABASE_URL), 'Use a separate test branch');
assert.equal(connectionTarget(branch.DATABASE_URL), connectionTarget(branch.DATABASE_URL_UNPOOLED));
const password = randomBytes(32).toString('hex');
const salt = randomBytes(16).toString('hex');
const serverEnv = { ...process.env, ...branch, NODE_ENV: 'production', ADMIN_PASSWORD_HASH: salt + ':' + scryptSync(password, salt, 64).toString('hex') };
delete serverEnv.VERCEL;
const manifest = JSON.parse(readFileSync('.next/server/server-reference-manifest.json', 'utf8')).node;
const actionIds = Object.fromEntries(Object.entries(manifest).map(([id, entry]) => [entry.exportedName, id]));
const port = 3101;
const base = 'http://127.0.0.1:' + port;
let server;
let cookie = '';
async function start() {
  // Fail rather than accidentally testing a pre-existing server on this port.
  let occupied = false;
  try { await fetch(base, { signal: AbortSignal.timeout(500) }); occupied = true; } catch {}
  assert.equal(occupied, false, 'Test port must be unused');
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { env: serverEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  let ready = false;
  // Do not forward server logs: a test failure must not disclose configuration.
  server.stdout.on('data', chunk => { if (String(chunk).includes('Ready in')) ready = true; });
  server.stderr.resume();
  for (let attempt = 0; attempt < 100; attempt++) {
    if (ready) return;
    assert.equal(server.exitCode, null, 'Test server stopped before readiness');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error('Test server readiness timed out');
}
async function stop() {
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    await exited;
  }
  server = undefined;
}
async function action(name, args, { form, authenticated = true } = {}) {
  assert.ok(actionIds[name], 'Action absent from current build: ' + name);
  const headers = { Origin: base, 'Next-Action': actionIds[name], Accept: 'text/x-component' };
  if (authenticated && cookie) headers.Cookie = cookie;
  let body;
  if (form) {
    const fields = new FormData();
    fields.set('password', form);
    body = await encodeReply([null, fields]);
  } else {
    headers['Content-Type'] = 'text/plain;charset=UTF-8';
    body = JSON.stringify(args);
  }
  const response = await fetch(base + '/admin', { method: 'POST', headers, body, redirect: 'manual' });
  const setCookie = response.headers.getSetCookie().find(value => value.startsWith('altomebay_admin='));
  if (setCookie) cookie = setCookie.split(';')[0];
  const text = await response.text();
  if (form) {
    console.log('Login HTTP status:', response.status, 'session cookie:', Boolean(setCookie));
    for (const message of ['Password tidak sesuai.', 'Terlalu banyak percobaan.', 'Basis data belum', 'Admin belum dikonfigurasi.']) {
      if (text.includes(message)) console.log('Login diagnostic:', message);
    }
    return response;
  }
  assert.equal(response.status, 200, 'HTTP action failed: ' + name);
  // Next 16 Flight action responses reference their return value from root.a.
  const rows = new Map(text.split('\n').filter(line => /^[0-9a-f]+:/.test(line)).map(line => { const colon = line.indexOf(':'); return [line.slice(0, colon), line.slice(colon + 1)]; }));
  const root = JSON.parse(rows.get('0'));
  const key = root.a?.replace(/^\$@/, '');
  assert.ok(key && rows.has(key), 'Action return value missing: ' + name);
  const value = rows.get(key);
  assert.ok(!value.startsWith('E'), 'Action rejected: ' + name);
  return value === '"$undefined"' ? undefined : JSON.parse(value);
}
function pass(message) { console.log('PASS ' + message); }
const date = '2025-07-17';
const batchId = randomUUID();
const note = 'Neon isolated E2E ' + batchId;
try {
  await start();
  assert.equal((await fetch(base + '/admin')).status, 200);
  await assert.rejects(action('listExpenseTypes', [], { authenticated: false }));
  pass('anonymous database action rejected over HTTP');
  await action('login', [], { form: password });
  assert.ok(cookie.startsWith('altomebay_admin='), 'Sign-in must set session cookie');
  assert.equal((await fetch(base + '/admin', { headers: { Cookie: cookie } })).status, 200);
  const types = await action('listExpenseTypes', []);
  assert.ok(types.length >= 5);
  pass('login and authenticated Postgres reads over HTTP');
  const before = await action('financialOverview', [date, date]);
  const custom = await action('createExpenseType', ['Neon E2E ' + batchId.slice(0, 8), 'operational']);
  assert.equal(custom.error, null);
  const batch = { id: batchId, transactionDate: date, note, items: [{ typeId: types[0].id, amount: 3000 }, { typeId: custom.type.id, amount: 7000 }] };
  const failed = await action('saveExpenseBatch', [{ ...batch, id: randomUUID(), items: [batch.items[0], { typeId: 'missing-e2e-type', amount: 1 }] }]);
  assert.ok(failed.error);
  assert.deepEqual((await action('financialOverview', [date, date])).totals, before.totals);
  pass('batch failure rolls back earlier items');
  assert.equal((await action('saveExpenseBatch', [batch])).error, null);
  assert.equal((await action('saveExpenseBatch', [batch])).error, null);
  assert.ok((await action('saveExpenseBatch', [{ ...batch, note: 'different payload' }])).error);
  let overview = await action('financialOverview', [date, date]);
  assert.equal(overview.totals.expense, before.totals.expense + 10000);
  let items = overview.rows.filter(row => row.batchId === batchId);
  assert.equal(items.length, 2);
  assert.ok(items.every(row => row.batchNote === note));
  pass('custom types, multi-item grouping, date filter and retry idempotency');
  const edited = items.find(row => row.expenseTypeId === custom.type.id);
  assert.equal((await action('saveExpenseItem', [edited.id, custom.type.id, 7500])).error, null);
  overview = await action('financialOverview', [date, date]);
  assert.equal(overview.totals.expense, before.totals.expense + 10500);
  assert.equal(overview.trend.points.reduce((sum, point) => sum + point.expense, 0), overview.totals.expense);
  pass('item editing and KPI/chart totals');
  await stop();
  await start();
  overview = await action('financialOverview', [date, date]);
  items = overview.rows.filter(row => row.batchId === batchId);
  assert.equal(items.length, 2);
  assert.equal(items.reduce((sum, row) => sum + row.amount, 0), 10500);
  const pool = createPostgresPool(branch.DATABASE_URL_UNPOOLED);
  try {
    const result = await pool.query('SELECT count(*)::int AS count, sum(t.amount)::int AS total FROM transactions t JOIN expense_items i ON i."transactionId"=t.id WHERE i."batchId"=$1', [batchId]);
    assert.deepEqual(result.rows[0], { count: 2, total: 10500 });
  } finally { await pool.end(); }
  pass('session and committed transactions survive application restart; independent SQL agrees');
  console.log('Neon HTTP E2E complete; test records retained only on isolated branch.');
} catch {
  console.error('Neon HTTP E2E failed; inspect the last PASS to locate the failed step. Credentials and response bodies omitted.');
  process.exitCode = 1;
} finally {
  await stop();
}
