import nextEnv from '@next/env';
import { createPostgresPool, safeDatabaseError, connectionTarget, DatabaseError } from '../../lib/admin/postgres.mjs';
export function loadDatabaseEnvironment(){nextEnv.loadEnvConfig(process.cwd(),true,{info(){},error(){}});}
export function migrationPool(){
 if(process.env.DATABASE_URL&&process.env.DATABASE_URL_UNPOOLED&&connectionTarget(process.env.DATABASE_URL)!==connectionTarget(process.env.DATABASE_URL_UNPOOLED))throw new DatabaseError('DATABASE_URL dan DATABASE_URL_UNPOOLED harus menunjuk branch dan database yang sama.');
 return createPostgresPool(process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL);
}
export function reportFailure(error){console.error(safeDatabaseError(error).message);process.exitCode=1;}
