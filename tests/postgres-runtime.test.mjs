import {test} from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {poolOptions,safeDatabaseError,normalizeRows,DatabaseError} from '../lib/admin/postgres.mjs';

function adapter(fakePool){
 const file=readFileSync('lib/admin/db.ts','utf8');const compiled=ts.transpileModule(file,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const loaded={exports:{}};
 const req=name=>name==='server-only'?{}:name==='@vercel/functions'?{attachDatabasePool(){}}:{createPostgresPool:()=>fakePool,normalizeRows,safeDatabaseError};
 new Function('require','module','exports',compiled)(req,loaded,loaded.exports);
 return loaded.exports.db();
}
test('transactions pin one PostgreSQL client, release on success and roll back on failure',async()=>{
 const calls=[];let releases=0;
 const client={async query(sql){calls.push(sql);return {rows:[{amount:'1000000000000'}],rowCount:1};},release(){releases++;}};
 const database=adapter({async connect(){return client;},query(){throw Error('pool.query must not be used within a transaction');}});
 const result=await database.transaction(async tx=>(await tx.query('SELECT amount FROM transactions')).rows[0].amount);
 assert.equal(result,1000000000000);assert.deepEqual(calls,['BEGIN',"SET LOCAL statement_timeout='15s'",'SELECT amount FROM transactions','COMMIT']);assert.equal(releases,1);
 calls.length=0;
 await assert.rejects(database.transaction(async tx=>{await tx.query('INSERT item');throw new DatabaseError('Item tidak ditemukan.');}),/Item tidak ditemukan/);
 assert.deepEqual(calls,['BEGIN',"SET LOCAL statement_timeout='15s'",'INSERT item','ROLLBACK']);assert.equal(releases,2);
});
test('database errors never disclose credentials, raw SQL or server messages',async()=>{
 const logs=[];const original=console.error;console.error=(...args)=>logs.push(args);
 try {
  const secret='postgresql://private-user:private-secret@private-host/db';
  const error=safeDatabaseError(Object.assign(Error('could not connect '+secret),{code:'ECONNREFUSED',detail:'SELECT private'}));
  assert.ok(error instanceof DatabaseError);assert.ok(!error.message.includes(secret));assert.ok(!JSON.stringify(logs).includes('private'));
  const broken={async connect(){throw Error(secret);}};
  await assert.rejects(adapter(broken).transaction(async()=>{}),error=>!error.message.includes('private')&&error instanceof DatabaseError);
  assert.equal(safeDatabaseError({code:'23505',constraint:'daily_sales_duplicate'}).message.startsWith('Rekap'),true);
 }finally{console.error=original;}
});
test('missing DATABASE_URL fails closed in production regardless of legacy SQLite path',()=>{
 const before={url:process.env.DATABASE_URL,node:process.env.NODE_ENV,vercel:process.env.VERCEL,path:process.env.ADMIN_DATABASE_PATH};
 try {
  delete process.env.DATABASE_URL;process.env.NODE_ENV='production';process.env.VERCEL='1';process.env.ADMIN_DATABASE_PATH='/var/task/data';
  assert.throws(()=>poolOptions(),/DATABASE_URL belum/);
  const opts=poolOptions('postgresql://role:secret@ep-test-pooler.neon.tech/db?sslmode=require');
  assert.equal(opts.ssl.rejectUnauthorized,true);assert.equal(opts.max,2);assert.equal(opts.idleTimeoutMillis,5000);
  assert.equal(Object.hasOwn(opts,'statement_timeout'),false,'PgBouncer must not receive unsupported startup settings');
  assert.throws(()=>poolOptions('postgresql://role:secret@localhost/db?sslmode=disable'),/TLS/);
  assert.throws(()=>poolOptions('sqlite:///var/task/data/admin.sqlite'),/Konfigurasi/);
 }finally{for(const [key,value] of Object.entries({DATABASE_URL:before.url,NODE_ENV:before.node,VERCEL:before.vercel,ADMIN_DATABASE_PATH:before.path})){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
