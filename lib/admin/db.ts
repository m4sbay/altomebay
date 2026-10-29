import 'server-only';
import { attachDatabasePool } from '@vercel/functions';
import type { PoolClient } from 'pg';
import { createPostgresPool, normalizeRows, safeDatabaseError } from './postgres.mjs';

type Value = string | number | null;
export interface DatabaseSession {
 query<T = Record<string, unknown>>(sql: string, values?: Value[]): Promise<{rows:T[];rowCount:number|null}>;
}
export interface Database extends DatabaseSession {
 transaction<T>(work:(session:DatabaseSession)=>Promise<T>):Promise<T>;
}
let pool: ReturnType<typeof createPostgresPool> | undefined;
function connectionPool() {
 if (!pool) {
  pool=createPostgresPool();
  if(process.env.VERCEL)attachDatabasePool(pool);
 }
 return pool;
}
function session(client: Pick<PoolClient,'query'>):DatabaseSession {
 return {async query<T>(sql:string,values:Value[]=[]){
  try{const result=await client.query(sql,values);return {rows:normalizeRows(result.rows) as T[],rowCount:result.rowCount};}
  catch(error){throw safeDatabaseError(error);}
 }};
}
// Lazy pool creation: no filesystem, no SQLite fallback, no DDL on requests/build.
export function db():Database {
 return {
  async query<T>(sql:string,values:Value[]=[]){try{return await session(connectionPool()).query<T>(sql,values);}catch(error){throw safeDatabaseError(error);}},
  async transaction<T>(work:(client:DatabaseSession)=>Promise<T>){
   let client:PoolClient|undefined;
   try {
    client=await connectionPool().connect();
    await client.query('BEGIN');
    // Transaction-local SET is compatible with Neon's PgBouncer; startup GUCs are not.
    await client.query("SET LOCAL statement_timeout='15s'");
    const result=await work(session(client));
    await client.query('COMMIT');
    return result;
   }catch(error){if(client){try{await client.query('ROLLBACK');}catch{client.release(true);client=undefined;}}throw safeDatabaseError(error);}
   finally{client?.release();}
  },
 };
}
