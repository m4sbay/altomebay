import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
import { testDatabase } from './helpers/postgres.mjs';
import { importSnapshot, tableColumns } from '../scripts/database/sqlite-import.mjs';
import { randomBytes, scryptSync } from 'node:crypto';
const nativeRequire=createRequire(import.meta.url);
const cache=new Map();
const jar=new Map();
const temp=mkdtempSync(join(tmpdir(),'altomebay-test-'));
const postgres=await testDatabase();
const testDb=postgres.database;
function load(file) {
 const path=resolve(file);if(cache.has(path))return cache.get(path).exports;
 const loaded={exports:{}};cache.set(path,loaded);
 const compiled=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const req=name=>name==='server-only' ? {} : name==='next/headers' ? {cookies:async()=>({get:key=>jar.has(key)?{value:jar.get(key)}:undefined,set:(k,v)=>jar.set(k,v),delete:k=>jar.delete(k)})} : name==='next/navigation' ? {redirect:()=>{throw Error('redirect');}} : name==='@/lib/admin/db'||name==='./db' ? {db:()=>testDb} : name.endsWith('.mjs') ? nativeRequire(name.startsWith('@/')?resolve(name.slice(2)):resolve(path,'..',name)) : name.startsWith('@/') ? load(name.slice(2)+'.ts') : name.startsWith('.') ? load(resolve(path,'..',name+'.ts')) : nativeRequire(name);
 new Function('require','module','exports',compiled)(req,loaded,loaded.exports);return loaded.exports;
}
// Import legacy duplicate daily sales through the actual PostgreSQL migration path.
const snapshot=Object.fromEntries(Object.keys(tableColumns).map(table=>[table,[]]));
snapshot.transactions=['old-a','old-b'].map((id,index)=>({id,type:'income',amount:100*(index+1),category:'sales',description:null,transactionDate:'2025-01-01',createdAt:'2025-01-01',updatedAt:'2025-01-01'}));
await importSnapshot(postgres.raw,snapshot);
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
 await assert.rejects(actions.listExpenseTypes());
 await assert.rejects(actions.createExpenseType('Pupuk','stock_purchase'));
 await assert.rejects(actions.saveExpenseBatch({}));
 await assert.rejects(actions.saveExpenseItem('missing','aice',1));
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
 const databaseGuard=testDb;
 await assert.rejects(databaseGuard.query('INSERT INTO transactions VALUES($1,$2,$3,$4,$5,$6,$7,$8)',['bypass','income',1,'sales',null,input.transactionDate,'now','now']),/Rekap/);
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
 // Verify committed PostgreSQL rows independently of the action return values.
 assert.equal(Number((await postgres.raw.query('SELECT COUNT(*) AS count FROM transactions')).rows[0].count),2);
 assert.equal(rows.find(r=>r.type==='expense').description,'Beli kantong plastik');
 assert.ok((await actions.saveTransaction({...input,amount:0})).error);
 await actions.deleteTransaction(id);assert.equal((await actions.listTransactions(input.transactionDate)).length,1);
 // Old records with no description remain readable; edits require a detail.
 const database=testDb;
 const timestamp=new Date().toISOString();
 await database.query('INSERT INTO transactions VALUES($1,$2,$3,$4,$5,$6,$7,$8)',['legacy-expense','expense',35000,'operational',null,input.transactionDate,timestamp,timestamp]);
 let legacy=(await actions.listTransactions(input.transactionDate)).find(r=>r.id==='legacy-expense');
 assert.equal(legacy.description,null);
 assert.match((await actions.saveTransaction(legacy,legacy.id)).error,/Detail pengeluaran wajib/);
 assert.match((await actions.saveTransaction({...input,type:'expense',category:'operational',description:'   '})).error,/Detail pengeluaran wajib/);
 assert.equal((await actions.saveTransaction({...legacy,description:'Beli lakban'},legacy.id)).error,null);
 legacy=(await actions.listTransactions(input.transactionDate)).find(r=>r.id==='legacy-expense');
 assert.equal(legacy.description,'Beli lakban');
 assert.equal((await postgres.raw.query('SELECT description FROM transactions WHERE id=$1',['legacy-expense'])).rows[0].description,'Beli lakban');
 await actions.deleteTransaction(legacy.id);
 assert.equal((await actions.listTransactions(input.transactionDate)).length,1);
 // Reusable types, atomic batches, idempotency, linked CRUD and aggregate accuracy.
 const types=await actions.listExpenseTypes();assert.equal(types.length,5);
 for(const name of ['', '   ', 'x'.repeat(61)])assert.ok((await actions.createExpenseType(name,'stock_purchase')).error);
 assert.ok((await actions.createExpenseType('Pupuk','sales')).error);
 const custom=await actions.createExpenseType('  Belanja Pupuk  ','stock_purchase');
 assert.equal(custom.type.name,'Belanja Pupuk');
 const duplicate=await actions.createExpenseType('belanja pupuk','operational');
 assert.equal(duplicate.type.id,custom.type.id);assert.equal(duplicate.type.category,'stock_purchase');
 assert.equal((await actions.listExpenseTypes()).length,6);
 const batch={id:'test-batch-request-001',transactionDate:input.transactionDate,note:'  Beberapa distributor  ',items:[{typeId:'cigarettes',amount:450000},{typeId:'aice',amount:280000},{typeId:'snacks',amount:175000}]};
 const before=(await actions.financialOverview(input.transactionDate,input.transactionDate)).totals.expense;
 assert.equal((await actions.saveTransaction({...input,category:'other_income',transactionDate:'2025-03-02',amount:777})).error,null);
 for(const amount of [0,-1,1.5,1e12+1])assert.ok((await actions.saveExpenseBatch({...batch,items:[{typeId:'aice',amount}]})).error);
 assert.ok((await actions.saveExpenseBatch({...batch,items:[]})).error);
 assert.ok((await actions.saveExpenseBatch({...batch,items:[{typeId:'',amount:1}]})).error);
 assert.ok((await actions.saveExpenseBatch({...batch,transactionDate:'2099-01-01'})).error);
 const failing={...batch,id:'test-batch-rollback-001',items:[batch.items[0],{typeId:'missing',amount:100}]};
 assert.ok((await actions.saveExpenseBatch(failing)).error);
 assert.equal((await database.query('SELECT id FROM expense_batches WHERE id=$1',[failing.id])).rows[0],undefined);
 assert.equal((await actions.financialOverview(input.transactionDate,input.transactionDate)).totals.expense,before);
 assert.equal((await actions.saveExpenseBatch(batch)).error,null);
 assert.equal((await actions.saveExpenseBatch(batch)).error,null,'retry must not create duplicate entries');
 assert.ok((await actions.saveExpenseBatch({...batch,note:'Changed'})).error);
 let groupedOverview=await actions.financialOverview(input.transactionDate,input.transactionDate);
 let batchRows=groupedOverview.rows.filter(row=>row.batchId===batch.id);
 assert.equal(batchRows.length,3);assert.equal(cash.summarize(batchRows).expense,905000);
 assert.equal(groupedOverview.totals.expense,before+905000);
 assert.ok(groupedOverview.rows.every(row=>row.transactionDate===input.transactionDate),'single-day overview excludes other dates');
 assert.equal(groupedOverview.trend.points.length,1);
 assert.equal(groupedOverview.trend.points[0].date,input.transactionDate);
 assert.equal(groupedOverview.trend.points.reduce((sum,p)=>sum+p.expense,0),before+905000);
 assert.equal(batchRows[0].batchNote,'Beberapa distributor');
 assert.ok(batchRows.every(row=>row.expenseTypeId&&row.description===null));
 const expenses=load('lib/expenses.ts');
 assert.equal(expenses.groupHistory(batchRows).length,1);
 assert.equal(expenses.groupHistory(batchRows).at(0).amount,905000);
 assert.equal(expenses.groupHistory([{...batchRows[0],batchId:null},{...batchRows[1],batchId:null}]).length,2);
 assert.equal((await actions.saveExpenseItem(batchRows[0].id,custom.type.id,100000)).error,null);
 assert.ok((await actions.saveExpenseItem(batchRows[0].id,'missing',1)).error);
 const updated=(await actions.listTransactions(input.transactionDate)).find(row=>row.id===batchRows[0].id);
 assert.equal(updated.amount,100000);assert.equal(updated.expenseTypeName,'Belanja Pupuk');assert.equal(updated.batchId,batch.id);
 assert.ok((await actions.saveTransaction({...updated,description:'Overwrite'},updated.id)).error);
 assert.equal(Number((await postgres.raw.query('SELECT COUNT(*) AS n FROM expense_types')).rows[0].n),6);
 await actions.deleteTransaction(batchRows[1].id);
 batchRows=(await actions.listTransactions(input.transactionDate)).filter(row=>row.batchId===batch.id);
 assert.equal(batchRows.length,2);
 assert.equal((await database.query('SELECT "transactionId" FROM expense_items WHERE "transactionId"=$1',[updated.id])).rows[0].transactionId,updated.id);
 for(const row of batchRows)await actions.deleteTransaction(row.id);
 assert.equal((await actions.saveExpenseBatch(batch)).error,null,'deleted submission retains retry tombstone');
 assert.equal((await actions.listTransactions(input.transactionDate)).filter(row=>row.batchId===batch.id).length,0);
 const single={...batch,id:'test-single-batch-001',note:'',items:[{typeId:'aice',amount:123}]};
 assert.equal((await actions.saveExpenseBatch(single)).error,null);
 const singleRow=(await actions.listTransactions(input.transactionDate)).find(row=>row.batchId===single.id);
 assert.equal(expenses.groupHistory([singleRow]).length,1);await actions.deleteTransaction(singleRow.id);
 await auth.signOut();await assert.rejects(actions.listTransactions(input.transactionDate));
 for(let i=0;i<5;i++)await auth.signIn('incorrect');
 assert.match(await auth.signIn('test-long-password'),/15 menit/);
 await postgres.close();
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

test('today preset follows Jakarta midnight independently of browser/server timezone',()=>{
 const previous=process.env.TZ;
 try {
  for(const zone of ['UTC','America/Los_Angeles','Pacific/Honolulu','Asia/Tokyo']) {
   process.env.TZ=zone;
   for(const [instant,expected] of [
    ['2026-10-29T16:59:59.999Z','2026-10-29'],
    ['2026-10-29T17:00:00.000Z','2026-10-30'],
    ['2026-12-31T17:00:00.000Z','2027-01-01'],
    ['2024-02-28T17:00:00.000Z','2024-02-29']
   ]) {
    const day=cash.todayJakarta(new Date(instant));
    assert.equal(day,expected,zone);
    const period=cash.presetPeriod('today',day);
    assert.deepEqual(period,{start:expected,end:expected});
    assert.deepEqual(cash.cashflowTrend([],period).points,[{date:expected,income:0,expense:0}]);
   }
  }
  assert.deepEqual(cash.presetPeriod('month','2026-10-29'),{start:'2026-10-01',end:'2026-10-29'});
  assert.equal(cash.matchingPreset({start:'2026-10-01',end:'2026-10-01'},'2026-10-01'),'month');
  assert.equal(cash.matchingPreset({start:'2026-10-29',end:'2026-10-29'},'2026-10-29'),'today');
  assert.equal(cash.matchingPreset({start:'2025-01-01',end:'2025-01-03'},'2026-10-29'),null);
 }finally{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});
