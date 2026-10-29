import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { DatabaseError, normalizeRows } from '../../lib/admin/postgres.mjs';
import { checkSchema } from './migrations.mjs';
export const tableColumns = {
 expense_types:['id','name','normalizedName','category'],
 expense_batches:['id','note','transactionDate','fingerprint','createdAt'],
 transactions:['id','type','amount','category','description','transactionDate','createdAt','updatedAt'],
 expense_items:['transactionId','typeId','batchId'],
 sessions:['token','expires','credential'],
 login_attempts:['id','failures','reset'],
};
const keyFor=table=>table==='sessions'?'token':table==='expense_items'?'transactionId':'id';
const quote=value=>'"'+value+'"';
function orderedRows(rows,key){return [...rows].sort((a,b)=>a[key]<b[key]?-1:a[key]>b[key]?1:0);}
function canonical(row,columns){return JSON.stringify(columns.map(column=>row[column]));}
export function snapshotDigest(snapshot){return createHash('sha256').update(JSON.stringify(Object.entries(tableColumns).map(([table,columns])=>[table,orderedRows(snapshot[table],keyFor(table)).map(row=>canonical(row,columns))]))).digest('hex');}
export function readSqliteSnapshot(source) {
 const database=new DatabaseSync(source,{readOnly:true});
 try {
  database.exec('PRAGMA query_only=ON; BEGIN');
  if(database.prepare('PRAGMA quick_check').all().some(row=>row.quick_check!=='ok'))throw new DatabaseError('Integritas sumber SQLite gagal. Hentikan migrasi dan periksa backup.');
  if(database.prepare('PRAGMA foreign_key_check').all().length)throw new DatabaseError('Sumber SQLite memiliki referensi yang tidak valid. Hentikan dan tinjau data.');
  const tables=new Set(database.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row=>row.name));
  if(!tables.has('transactions'))throw new DatabaseError('Tabel transaksi tidak ditemukan pada sumber SQLite.');
  const snapshot={};
  for(const [table,columns] of Object.entries(tableColumns)){
   snapshot[table]=tables.has(table)?database.prepare(`SELECT ${columns.map(quote).join(',')} FROM ${quote(table)}${table==='expense_types'?' ORDER BY rowid':''}`).all().map(row=>({...row})):[];
  }
  validateSnapshot(snapshot);
  database.exec('COMMIT');
  return snapshot;
 }catch(error){try{database.exec('ROLLBACK');}catch{}throw error;}finally{database.close();}
}
export function validateSnapshot(snapshot) {
 for(const [table,columns] of Object.entries(tableColumns)){
  if(!Array.isArray(snapshot[table]))throw new DatabaseError('Snapshot sumber tidak lengkap.');
  for(const row of snapshot[table]){
   if(columns.some(column=>row[column]===undefined))throw new DatabaseError('Kolom sumber tidak lengkap. Hentikan dan tinjau data.');
   for(const column of columns){if(row[column]!==null&&!['string','number'].includes(typeof row[column]))throw new DatabaseError('Tipe data sumber tidak didukung.');}
  }
 }
 for(const row of snapshot.transactions){
  if(!['income','expense'].includes(row.type)||!Number.isSafeInteger(row.amount)||row.amount<=0||row.amount>1e12||!/^\d{4}-\d{2}-\d{2}$/.test(row.transactionDate)||Number.isNaN(Date.parse(row.transactionDate))||new Date(row.transactionDate).toISOString().slice(0,10)!==row.transactionDate)throw new DatabaseError('Ada transaksi sumber tidak valid. Tinjau sumber tanpa mengubah ID atau nominal secara otomatis.');
 }
}
export function snapshotReport(snapshot) {
 const rows=snapshot.transactions;
 const sums={income:0n,expense:0n};for(const row of rows)sums[row.type]+=BigInt(row.amount);
 const sales=new Map();for(const row of rows)if(row.type==='income'&&row.category==='sales')sales.set(row.transactionDate,(sales.get(row.transactionDate)||0)+1);
 return {digest:snapshotDigest(snapshot),counts:Object.fromEntries(Object.keys(tableColumns).map(table=>[table,snapshot[table].length])),totals:{income:sums.income.toString(),expense:sums.expense.toString(),difference:(sums.income-sums.expense).toString()},legacyDuplicateSalesDates:[...sales.values()].filter(count=>count>1).length};
}
export async function verifySnapshot(client,snapshot) {
 for(const [table,columns] of Object.entries(tableColumns)){
  for(const row of snapshot[table]){
   const result=await client.query(`SELECT ${columns.map(quote).join(',')} FROM ${quote(table)} WHERE ${quote(keyFor(table))}=$1`,[row[keyFor(table)]]);
   const target=normalizeRows(result.rows)[0];
   if(!target||canonical(target,columns)!==canonical(row,columns))throw new DatabaseError(`Data tujuan berbeda pada tabel ${table}. Impor dibatalkan; jangan menimpa data tujuan.`);
  }
 }
 return snapshotReport(snapshot);
}
export async function importSnapshot(client,snapshot) {
 validateSnapshot(snapshot);
 await client.query('BEGIN');
 try {
  await checkSchema(client);
  await client.query('SELECT pg_advisory_xact_lock(824102)');
  // Exclusive writer lock plus a transaction-local switch permits historical duplicate sales only during import.
  await client.query('LOCK TABLE transactions,expense_types,expense_batches,expense_items,sessions,login_attempts,daily_sales_dates IN SHARE ROW EXCLUSIVE MODE');
  await client.query("SET LOCAL altomebay.sqlite_import='on'");
  for(const [table,columns] of Object.entries(tableColumns)){
   for(const row of snapshot[table]){
    await client.query(`INSERT INTO ${quote(table)}(${columns.map(quote).join(',')}) VALUES(${columns.map((_,index)=>'$'+(index+1)).join(',')}) ON CONFLICT (${quote(keyFor(table))}) DO NOTHING`,columns.map(column=>row[column]));
   }
  }
  const report=await verifySnapshot(client,snapshot);
  await client.query('INSERT INTO sqlite_imports(digest) VALUES($1) ON CONFLICT DO NOTHING',[report.digest]);
  await client.query('COMMIT');return report;
 }catch(error){await client.query('ROLLBACK');throw error;}
}
