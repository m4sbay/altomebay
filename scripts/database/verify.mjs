import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
import { DatabaseError } from '../../lib/admin/postgres.mjs';
import { loadDatabaseEnvironment, migrationPool, reportFailure } from './cli.mjs';
import { verificationSnapshot, compareVerification } from './verification.mjs';
loadDatabaseEnvironment();let pool;
try {
 const {values}=parseArgs({options:{record:{type:'string'},compare:{type:'string'}}});
 if(values.record&&values.compare)throw new DatabaseError('Pilih --record file-baru.json atau --compare file-baseline.json.');
 pool=migrationPool();const client=await pool.connect();let report;
 try{report=await verificationSnapshot(client,process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL);}finally{client.release();}
 if(!report.tls)throw new DatabaseError('Verifikasi TLS gagal. Gunakan connection string Neon dengan TLS.');
 if(values.record)writeFileSync(values.record,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
 const comparison=values.compare?compareVerification(JSON.parse(readFileSync(values.compare,'utf8')),report):{};
 console.log(JSON.stringify({...report,...comparison},null,2));
}catch(error){reportFailure(error);}finally{await pool?.end();}
