import { createHash } from 'node:crypto';
import { tableColumns, snapshotReport } from './sqlite-import.mjs';
import { normalizeRows, DatabaseError, connectionTarget } from '../../lib/admin/postgres.mjs';
import { checkSchema } from './migrations.mjs';
export async function verificationSnapshot(client,connectionString) {
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 try {
  await checkSchema(client);
  const snapshot=Object.fromEntries(Object.keys(tableColumns).map(table=>[table,[]]));
  for(const table of ['expense_types','expense_batches','transactions','expense_items']){
   snapshot[table]=normalizeRows((await client.query(`SELECT ${tableColumns[table].map(column=>'"'+column+'"').join(',')} FROM "${table}"`)).rows);
  }
  const health=(await client.query("SELECT current_setting('server_version_num') AS version")).rows[0];
  const identity=createHash('sha256').update(connectionTarget(connectionString)).digest('hex');
  const tls=client.connection?.stream?.encrypted===true&&client.connection?.stream?.authorized===true;
  const report=snapshotReport(snapshot);
  await client.query('COMMIT');
  return {identity,postgresVersion:health.version,tls,financialDigest:report.digest,counts:Object.fromEntries(['transactions','expense_types','expense_batches','expense_items'].map(table=>[table,report.counts[table]])),totals:report.totals};
 }catch(error){await client.query('ROLLBACK');throw error;}
}
export function compareVerification(before,after) {
 if(before.identity!==after.identity||before.financialDigest!==after.financialDigest)throw new DatabaseError('Database atau data keuangan berbeda dari baseline. Tinjau environment, branch, dan perubahan transaksi; jangan menghapus data.');
 return {snapshotMatches:true};
}
