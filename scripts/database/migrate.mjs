import { applyMigrations, checkSchema } from './migrations.mjs';
import { loadDatabaseEnvironment, migrationPool, reportFailure } from './cli.mjs';
loadDatabaseEnvironment();
let pool;
try {
 pool=migrationPool();const client=await pool.connect();
 try{if(process.argv.includes('--check')){await checkSchema(client);console.log('Schema PostgreSQL sesuai (read-only check).');}else{console.log(JSON.stringify(await applyMigrations(client)));}}finally{client.release();}
}catch(error){reportFailure(error);}finally{await pool?.end();}
