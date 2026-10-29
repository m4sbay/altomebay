import { PGlite } from '@electric-sql/pglite';
import { migrationSql, applyMigrations } from '../../scripts/database/migrations.mjs';
import { normalizeRows, safeDatabaseError } from '../../lib/admin/postgres.mjs';
export async function testDatabase() {
 const engine=new PGlite();
 const raw={async query(sql,values){
  if(sql===migrationSql){await engine.exec(sql);return {rows:[],rowCount:null};}
  const result=await engine.query(sql,values);return {...result,rowCount:result.affectedRows??null};
 }};
 await applyMigrations(raw);
 const session=client=>({async query(sql,values){try{const result=await client.query(sql,values);return {rows:normalizeRows(result.rows),rowCount:result.affectedRows??result.rowCount??null};}catch(error){throw safeDatabaseError(error);}}});
 const database={...session(engine),async transaction(work){try{return await engine.transaction(client=>work(session(client)));}catch(error){throw safeDatabaseError(error);}}};
 return {engine,raw,database,close:()=>engine.close()};
}
