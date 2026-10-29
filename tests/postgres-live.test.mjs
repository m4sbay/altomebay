import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createPostgresPool,connectionTarget} from '../lib/admin/postgres.mjs';
import {applyMigrations} from '../scripts/database/migrations.mjs';
import {importSnapshot,tableColumns} from '../scripts/database/sqlite-import.mjs';

// Explicit opt-in only, using a dedicated disposable database/Neon branch.
const enabled=process.env.RUN_POSTGRES_INTEGRATION==='1'&&!!process.env.TEST_DATABASE_URL;
test('live PostgreSQL concurrent date claims, legacy deletion and batch retry arbitration',{skip:!enabled},async()=>{
 const target=process.env.TEST_DATABASE_URL;
 assert.equal(new URL(target).hostname.includes('-pooler'),false,'use a direct connection for isolated test schema search_path');
 if(process.env.DATABASE_URL)assert.notEqual(connectionTarget(target),connectionTarget(process.env.DATABASE_URL),'test target must differ from the application database');
 const pool=createPostgresPool(target);const schema='altomebay_test_'+randomUUID().replaceAll('-','');
 const connect=async()=>{const client=await pool.connect();await client.query(`SET search_path TO "${schema}",pg_catalog`);return client;};
 let control;
 try {
  control=await pool.connect();await control.query(`CREATE SCHEMA "${schema}"`);await control.query(`SET search_path TO "${schema}",pg_catalog`);await applyMigrations(control);
  // Release control so both concurrent writers have distinct clients even with max=2.
  control.release();control=undefined;
  const writer=async(id)=>{const client=await connect();try{return await client.query("INSERT INTO transactions VALUES($1,'income',1,'sales',NULL,'2025-01-01','now','now')",[id]);}finally{client.release();}};
  const claims=await Promise.allSettled([writer('one'),writer('two')]);
  assert.equal(claims.filter(result=>result.status==='fulfilled').length,1);
  assert.equal(claims.find(result=>result.status==='rejected').reason.constraint,'daily_sales_duplicate');
  const seed=await connect();
  try{
   const snapshot=Object.fromEntries(Object.keys(tableColumns).map(table=>[table,[]]));
   snapshot.transactions=['legacy-a','legacy-b'].map(id=>({id,type:'income',amount:1,category:'sales',description:null,transactionDate:'2025-01-02',createdAt:'now',updatedAt:'now'}));
   await importSnapshot(seed,snapshot);
  }finally{seed.release();}
  const remove=async(id)=>{const client=await connect();try{await client.query('DELETE FROM transactions WHERE id=$1',[id]);}finally{client.release();}};
  await Promise.all([remove('legacy-a'),remove('legacy-b')]);
  const retry=async()=>{const client=await connect();try{
   await client.query('BEGIN');
   const inserted=await client.query("INSERT INTO expense_batches VALUES('shared-request','note','2025-01-01','same-fingerprint','now') ON CONFLICT (id) DO NOTHING RETURNING id");
   if(inserted.rows.length)await client.query("INSERT INTO transactions VALUES('batch-item','expense',905000,'operational',NULL,'2025-01-01','now','now')");
   await client.query('COMMIT');return inserted.rows.length;
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}};
  assert.equal((await Promise.all([retry(),retry()])).reduce((sum,value)=>sum+value,0),1);
  const verify=await connect();
  try{
   await verify.query("INSERT INTO transactions VALUES('after-delete','income',1,'sales',NULL,'2025-01-02','now','now')");
   assert.equal(Number((await verify.query("SELECT SUM(amount) AS total FROM transactions WHERE type='expense'")).rows[0].total),905000);
  }finally{verify.release();}
  // Deliberately no DROP/DELETE cleanup migration: schema remains on the disposable test branch.
  console.log('Live PostgreSQL concurrency checks passed in isolated schema:',schema);
 }finally{control?.release();await pool.end();}
});
