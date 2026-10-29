import { DatabaseSync, backup } from 'node:sqlite';
import { parseArgs } from 'node:util';
import { existsSync, mkdirSync, chmodSync, openSync, closeSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { DatabaseError } from '../../lib/admin/postgres.mjs';
import { reportFailure } from './cli.mjs';
let database;
try {
 const {values}=parseArgs({options:{source:{type:'string'},output:{type:'string'}}});
 if(!values.source||!values.output)throw new DatabaseError('Gunakan --source /path/sumber.sqlite --output /path/backup-baru.sqlite.');
 const source=resolve(values.source),output=resolve(values.output);
 if(source===output||existsSync(output))throw new DatabaseError('Tujuan backup harus file baru; file existing tidak akan ditimpa.');
 mkdirSync(dirname(output),{recursive:true,mode:0o700});
 database=new DatabaseSync(source,{readOnly:true});
 closeSync(openSync(output,'wx',0o600));
 await backup(database,output);chmodSync(output,0o600);
 console.log('Backup SQLite konsisten berhasil dibuat; sumber tidak diubah.');
}catch(error){reportFailure(error);}finally{database?.close();}
