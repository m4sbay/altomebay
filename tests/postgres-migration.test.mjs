import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {testDatabase} from './helpers/postgres.mjs';
import {applyMigrations} from '../scripts/database/migrations.mjs';
import {tableColumns,readSqliteSnapshot,importSnapshot,verifySnapshot,snapshotReport} from '../scripts/database/sqlite-import.mjs';
import {compareVerification,verificationSnapshot} from '../scripts/database/verification.mjs';

function sqliteFixture(file){
 const source=new DatabaseSync(file);
 for(const [table,columns] of Object.entries(tableColumns))source.exec(`CREATE TABLE "${table}"(${columns.map(column=>'"'+column+'" '+(['amount','expires','reset','failures'].includes(column)||(table==='login_attempts'&&column==='id')?'INTEGER':'TEXT')).join(',')})`);
 source.exec(`INSERT INTO transactions VALUES('old-a','income',100,'sales',NULL,'2025-01-01','old-time','old-time'),('old-b','income',200,'sales',NULL,'2025-01-01','old-time','old-time'),('e1','expense',175000,'stock_purchase',NULL,'2025-01-01','old-time','old-time'),('e2','expense',280000,'stock_purchase','Legacy detail','2025-01-01','old-time','old-time');
 INSERT INTO expense_types VALUES('cigarettes','Belanja Rokok','belanja rokok','stock_purchase'),('custom','Belanja Pupuk','belanja pupuk','stock_purchase');
 INSERT INTO expense_batches VALUES('legacy-batch','Catatan bersama','2025-01-01','original-fingerprint','old-time');
 INSERT INTO expense_items VALUES('e1','cigarettes','legacy-batch'),('e2','custom','legacy-batch');
 INSERT INTO sessions VALUES('hashed-token',123456789,'credential-fingerprint');
 INSERT INTO login_attempts VALUES('1',3,123456789);`);
 source.close();
}

test('SQLite read-only backup/import preserves financial IDs, amounts, grouping, sessions and legacy duplicates',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'altomebay-pg-migrate-'));const source=join(directory,'source.sqlite');const backup=join(directory,'backup.sqlite');const pg=await testDatabase();
 try {
  sqliteFixture(source);const bytes=readFileSync(source);
  const result=spawnSync(process.execPath,['scripts/database/backup-sqlite.mjs','--source',source,'--output',backup],{encoding:'utf8'});
  assert.equal(result.status,0,'online backup command succeeds; no credentials are printed');
  const second=spawnSync(process.execPath,['scripts/database/backup-sqlite.mjs','--source',source,'--output',backup],{encoding:'utf8'});
  assert.notEqual(second.status,0,'backup refuses to overwrite an existing file');
  const snapshot=readSqliteSnapshot(backup);
  assert.deepEqual(snapshot.transactions.map(row=>row.id),['old-a','old-b','e1','e2']);
  assert.deepEqual(snapshotReport(snapshot).totals,{income:'300',expense:'455000',difference:'-454700'});
  assert.equal(snapshotReport(snapshot).legacyDuplicateSalesDates,1);
  assert.equal((await applyMigrations(pg.raw)).applied,false,'schema rerun is a no-op');
  const imported=await importSnapshot(pg.raw,snapshot);
  assert.equal(imported.counts.transactions,4);
  assert.deepEqual(await importSnapshot(pg.raw,snapshot),imported,'identical import is idempotent');
  assert.deepEqual(await verifySnapshot(pg.raw,snapshot),imported);
  assert.notEqual((await pg.raw.query("SELECT current_setting('altomebay.sqlite_import',true) AS value")).rows[0].value,'on','import exception cannot leak beyond its transaction');
  await assert.rejects(pg.database.query(`INSERT INTO transactions VALUES('new-duplicate','income',100,'sales',NULL,'2025-01-01','now','now')`),/Rekap/);
  await pg.database.query(`UPDATE transactions SET amount=150 WHERE id='old-a'`);
  const changed=structuredClone(snapshot);changed.transactions.unshift({...snapshot.transactions[0],id:'new-before-conflict',category:'other_income'});
  await assert.rejects(importSnapshot(pg.raw,changed),/Data tujuan berbeda/);
  assert.equal((await pg.raw.query("SELECT id FROM transactions WHERE id='new-before-conflict'")).rows.length,0,'earlier inserts roll back after a conflict');
  assert.equal(Number((await pg.raw.query("SELECT amount FROM transactions WHERE id='old-a'")).rows[0].amount),150,'import never overwrites changed target data');
  assert.deepEqual(readFileSync(source),bytes,'source bytes remain untouched');
  assert.equal((await pg.raw.query('SELECT * FROM sessions')).rows[0].token,'hashed-token');
  assert.equal((await pg.raw.query('SELECT COUNT(*) AS n FROM expense_items')).rows[0].n,2);
 }finally{await pg.close();rmSync(directory,{recursive:true,force:true});}
});

test('schema checksum mismatch aborts and failed import leaves no partial records',async()=>{
 const pg=await testDatabase();
 try {
  const snapshot=Object.fromEntries(Object.keys(tableColumns).map(table=>[table,[]]));
  snapshot.transactions=[{id:'expense',type:'expense',amount:1,category:'operational',description:null,transactionDate:'2025-01-01',createdAt:'now',updatedAt:'now'}];
  snapshot.expense_items=[{transactionId:'expense',typeId:'missing',batchId:'missing'}];
  await assert.rejects(importSnapshot(pg.raw,snapshot));
  assert.equal((await pg.raw.query('SELECT COUNT(*) AS n FROM transactions')).rows[0].n,0);
  await pg.raw.query("UPDATE schema_migrations SET checksum='changed' WHERE version=1");
  await assert.rejects(applyMigrations(pg.raw),/Checksum/);
  assert.equal((await pg.raw.query('SELECT COUNT(*) AS n FROM expense_types')).rows[0].n,5);
 }finally{await pg.close();}
});

test('read-only verification detects changed database/data and excludes mutable login sessions',async()=>{
 const pg=await testDatabase();
 try{
  const before=await verificationSnapshot(pg.raw,'postgresql://role:private@ep-test.neon.tech/db?sslmode=require');
  await pg.raw.query("INSERT INTO sessions VALUES('temporary',1,'hash')");
  const after=await verificationSnapshot(pg.raw,'postgresql://role:private@ep-test-pooler.neon.tech/db?sslmode=require');
  assert.deepEqual(compareVerification(before,after),{snapshotMatches:true});
  await pg.raw.query("INSERT INTO transactions VALUES('added','expense',1,'operational',NULL,'2025-01-01','now','now')");
  const changed=await verificationSnapshot(pg.raw,'postgresql://role:private@ep-test.neon.tech/db?sslmode=require');
  assert.throws(()=>compareVerification(before,changed),/berbeda/);
  assert.ok(!JSON.stringify(before).includes('private'));
 }finally{await pg.close();}
});
