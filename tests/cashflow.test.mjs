import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
import { randomBytes, scryptSync } from 'node:crypto';
const nativeRequire=createRequire(import.meta.url);
const cache=new Map();
const jar=new Map();
const temp=mkdtempSync(join(tmpdir(),'altomebay-test-'));
process.env.ADMIN_DATABASE_PATH=join(temp,'cash.sqlite');
function load(file) {
 const path=resolve(file);if(cache.has(path))return cache.get(path).exports;
 const loaded={exports:{}};cache.set(path,loaded);
 const compiled=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const req=name=>name==='server-only' ? {} : name==='next/headers' ? {cookies:async()=>({get:key=>jar.has(key)?{value:jar.get(key)}:undefined,set:(k,v)=>jar.set(k,v),delete:k=>jar.delete(k)})} : name==='next/navigation' ? {redirect:()=>{throw Error('redirect');}} : name.startsWith('@/') ? load(name.slice(2)+'.ts') : name.startsWith('.') ? load(resolve(path,'..',name+'.ts')) : nativeRequire(name);
 new Function('require','module','exports',compiled)(req,loaded,loaded.exports);return loaded.exports;
}
// Simulate an existing database with duplicate daily sales before initialization.
const {DatabaseSync: SeedDatabase}=nativeRequire('node:sqlite');
const seed=new SeedDatabase(process.env.ADMIN_DATABASE_PATH);
seed.exec(`CREATE TABLE transactions (id TEXT PRIMARY KEY,type TEXT NOT NULL,amount INTEGER NOT NULL,category TEXT NOT NULL,description TEXT,transactionDate TEXT NOT NULL,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL);
INSERT INTO transactions VALUES ('old-a','income',100,'sales',NULL,'2025-01-01','2025-01-01','2025-01-01'),('old-b','income',200,'sales',NULL,'2025-01-01','2025-01-01','2025-01-01');`);
seed.close();
const cash=load('lib/cashflow.ts');
const dates=load('lib/business-date.ts');
const auth=load('lib/admin/auth.ts');
const actions=load('app/admin/actions.ts');
const input={type:'income',amount:150000,category:'sales',description:'Penjualan',transactionDate:cash.todayJakarta()};
test('cashflow validation, Jakarta date, formatting and totals',()=>{
 assert.equal(cash.rupiah(150000),'Rp150.000');
 assert.deepEqual(cash.summarize([{...input},{...input,type:'expense',amount:25000}]),{income:150000,expense:25000,difference:125000});
 for(const change of [{amount:0},{amount:-1},{amount:1.5},{amount:Number.MAX_SAFE_INTEGER+1},{category:'transport'},{category:'toString'},{transactionDate:'2026-02-30'},{transactionDate:'2099-01-01'},{description:'x'.repeat(201)}])assert.throws(()=>cash.validateTransaction({...input,...change}));
 assert.equal(cash.validDate('2026-02-28'),true);
 for (const description of [null, '', '   ', '\t\n']) {
  assert.throws(()=>cash.validateTransaction({...input,type:'expense',category:'operational',description}), /Detail pengeluaran wajib/);
 }
 assert.equal(cash.validateTransaction({...input,type:'expense',category:'operational',description:'  Kantong plastik  '}).description,'Kantong plastik');
 assert.equal(cash.validateTransaction({...input,description:null}).description,null);
});
test('calendar dates retain the Jakarta business day across browser time zones and year boundaries',()=>{
 const previous=process.env.TZ;
 try {
  for(const zone of ['UTC','America/Los_Angeles','Pacific/Honolulu','Asia/Tokyo','Pacific/Kiritimati']) {
   process.env.TZ=zone;
   for(const day of ['2026-01-01','2026-10-28','2026-12-31','2024-02-29']) {
    const date=dates.toCalendarDate(day);
    assert.equal(date.timeZone,'Asia/Jakarta');
    assert.equal(dates.fromCalendarDate(date),day,`${zone}: ${day}`);
   }
  }
  assert.equal(dates.fromCalendarDate(new Date('2026-10-27T17:30:00Z')),'2026-10-28');
  assert.equal(dates.fromCalendarDate(new Date('2026-10-28T16:59:59Z')),'2026-10-28');
 } finally { if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous; }
});
test('server authentication, CRUD, date filtering, persistence and revocation',async()=>{
 await assert.rejects(actions.listTransactions(input.transactionDate));
 await assert.rejects(actions.financialOverview('2025-01-01','2025-02-01'));
 await assert.rejects(actions.dailySales(input.transactionDate));
 await assert.rejects(actions.saveTransaction(input));
 await assert.rejects(actions.deleteTransaction('unknown'));
 assert.equal(await auth.authenticated(),false);
 const salt=randomBytes(16).toString('hex');
 process.env.ADMIN_PASSWORD_HASH=`${salt}:${scryptSync('test-long-password',salt,64).toString('hex')}`;
 assert.ok(await auth.signIn('incorrect'));
 assert.equal(await auth.signIn('test-long-password'),null);
 assert.equal(await auth.authenticated(),true);
 const legacySales=await actions.dailySales('2025-01-01');
 assert.equal(legacySales.length,2,'migration preserves both legacy duplicates');
 assert.equal((await actions.saveTransaction({...legacySales[0],amount:150},legacySales[0].id)).error,null);
 assert.match((await actions.saveTransaction({...input,transactionDate:'2025-01-01'})).error,/Rekap/);
 await actions.deleteTransaction('old-a');await actions.deleteTransaction('old-b');
 await assert.rejects(actions.financialOverview('2025-02-01','2025-01-01'));
 assert.deepEqual((await actions.financialOverview('2025-01-01','2025-02-01')).totals,{income:0,expense:0,difference:0});

 assert.equal((await actions.saveTransaction(input)).error,null);
 assert.match((await actions.saveTransaction(input)).error,/Rekap/);
 const databaseGuard=load('lib/admin/db.ts').db();
 assert.throws(()=>databaseGuard.prepare('INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?)').run('bypass','income',1,'sales',null,input.transactionDate,'now','now'),/daily_sales_duplicate/);
 assert.equal((await actions.saveTransaction({...input,category:'other_income'},'missing')).error,'Transaksi tidak ditemukan. Muat ulang halaman.');
 for(let i=0;i<2;i++)assert.equal((await actions.saveTransaction({...input,category:'other_income',transactionDate:'2025-02-01'})).error,null);
 const others=await actions.listTransactions('2025-02-01');
 assert.equal(others.length,2);
 assert.match((await actions.saveTransaction({...input},others[0].id)).error,/Rekap/);
 const overview=await actions.financialOverview('2025-01-31','2025-02-02');
 assert.equal(overview.rows.length,2);assert.equal(overview.totals.income,300000);
 assert.equal(overview.trend.points.reduce((n,p)=>n+p.income,0),overview.totals.income);
 for(const row of others)await actions.deleteTransaction(row.id);

 assert.equal((await actions.saveTransaction({...input,type:'expense',category:'operational',amount:25000,description:'Beli kantong plastik'})).error,null);
 let rows=await actions.listTransactions(input.transactionDate);
 assert.equal(Object.getPrototypeOf(rows[0]),Object.prototype);assert.equal(rows.length,2);assert.equal(cash.summarize(rows).difference,125000);
 assert.equal((await actions.listTransactions('2026-01-01')).length,0);
 const id=rows.find(r=>r.type==='income').id;
 await actions.saveTransaction({...input,amount:200000},id);
 rows=await actions.listTransactions(input.transactionDate);
 assert.equal(cash.summarize(rows).difference,175000);
 // A separate SQLite connection sees committed records.
 const {DatabaseSync}=nativeRequire('node:sqlite');const independent=new DatabaseSync(process.env.ADMIN_DATABASE_PATH);
 assert.equal(independent.prepare('SELECT COUNT(*) AS count FROM transactions').get().count,2);independent.close();
 assert.equal(rows.find(r=>r.type==='expense').description,'Beli kantong plastik');
 assert.ok((await actions.saveTransaction({...input,amount:0})).error);
 await actions.deleteTransaction(id);assert.equal((await actions.listTransactions(input.transactionDate)).length,1);
 // Old records with no description remain readable; edits require a detail.
 const database=load('lib/admin/db.ts').db();
 const timestamp=new Date().toISOString();
 database.prepare('INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?)').run('legacy-expense','expense',35000,'operational',null,input.transactionDate,timestamp,timestamp);
 let legacy=(await actions.listTransactions(input.transactionDate)).find(r=>r.id==='legacy-expense');
 assert.equal(legacy.description,null);
 assert.match((await actions.saveTransaction(legacy,legacy.id)).error,/Detail pengeluaran wajib/);
 assert.match((await actions.saveTransaction({...input,type:'expense',category:'operational',description:'   '})).error,/Detail pengeluaran wajib/);
 assert.equal((await actions.saveTransaction({...legacy,description:'Beli lakban'},legacy.id)).error,null);
 legacy=(await actions.listTransactions(input.transactionDate)).find(r=>r.id==='legacy-expense');
 assert.equal(legacy.description,'Beli lakban');
 const check=new DatabaseSync(process.env.ADMIN_DATABASE_PATH);
 assert.equal(check.prepare('SELECT description FROM transactions WHERE id=?').get('legacy-expense').description,'Beli lakban');check.close();
 await actions.deleteTransaction(legacy.id);
 assert.equal((await actions.listTransactions(input.transactionDate)).length,1);
 await auth.signOut();await assert.rejects(actions.listTransactions(input.transactionDate));
 for(let i=0;i<5;i++)await auth.signIn('incorrect');
 assert.match(await auth.signIn('test-long-password'),/15 menit/);
 rmSync(temp,{recursive:true,force:true});
});

test('monthly presets, invalid ranges and trend boundaries',()=>{
 assert.deepEqual(cash.presetPeriod('month','2026-10-28'),{start:'2026-10-01',end:'2026-10-28'});
 assert.deepEqual(cash.presetPeriod('previous','2026-01-04'),{start:'2025-12-01',end:'2025-12-31'});
 assert.deepEqual(cash.presetPeriod('previous','2024-03-05'),{start:'2024-02-01',end:'2024-02-29'});
 assert.deepEqual(cash.presetPeriod('week','2026-01-03'),{start:'2025-12-28',end:'2026-01-03'});
 for(const pair of [['bad','2025-01-01'],['2025-02-01','2025-01-01'],['2025-02-30','2025-03-01']])assert.throws(()=>cash.validatePeriod(...pair));
 const rows=[{...input,transactionDate:'2025-01-31'}, {...input,type:'expense',amount:25000,transactionDate:'2025-02-01'}];
 const daily=cash.cashflowTrend(rows,{start:'2025-01-30',end:'2025-02-02'});
 assert.equal(daily.points.length,4);assert.equal(daily.points[0].income,0);assert.equal(daily.points[1].income,150000);assert.equal(daily.points[2].expense,25000);
 const monthly=cash.cashflowTrend(rows,{start:'2025-01-30',end:'2025-05-01'});
 assert.equal(monthly.granularity,'monthly');assert.equal(monthly.points.length,5);
 assert.equal(monthly.points.reduce((n,p)=>n+p.income-p.expense,0),cash.summarize(rows).difference);
});
