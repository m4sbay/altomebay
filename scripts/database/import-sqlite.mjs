import { parseArgs } from 'node:util';
import { DatabaseError } from '../../lib/admin/postgres.mjs';
import { readSqliteSnapshot, snapshotReport, importSnapshot, verifySnapshot } from './sqlite-import.mjs';
import { loadDatabaseEnvironment, migrationPool, reportFailure } from './cli.mjs';
loadDatabaseEnvironment();let pool;
try {
 const {values}=parseArgs({options:{source:{type:'string'},apply:{type:'boolean'},verify:{type:'boolean'}}});
 if(!values.source||values.apply&&values.verify)throw new DatabaseError('Gunakan --source /path/backup.sqlite; pilih --apply atau --verify. Tanpa keduanya hanya dry-run lokal.');
 const snapshot=readSqliteSnapshot(values.source);
 if(!values.apply&&!values.verify){console.log(JSON.stringify({mode:'dry-run',...snapshotReport(snapshot)},null,2));}
 else {
  pool=migrationPool();const client=await pool.connect();
  try{const result=values.apply?await importSnapshot(client,snapshot):await verifySnapshot(client,snapshot);console.log(JSON.stringify({mode:values.apply?'imported-and-verified':'verified',...result},null,2));}finally{client.release();}
 }
}catch(error){reportFailure(error);}finally{await pool?.end();}
