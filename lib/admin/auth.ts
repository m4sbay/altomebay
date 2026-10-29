import 'server-only';
import { cookies } from 'next/headers';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from './db';
import { DatabaseError } from './postgres.mjs';
const cookieName='altomebay_admin';
export const credential=()=>process.env.ADMIN_PASSWORD_HASH||'';
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
export function configured(){return /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(credential());}
export async function authenticated(){
 if(!configured())return false;
 const token=(await cookies()).get(cookieName)?.value;
 if(!token)return false;
 return !!(await db().query('SELECT token FROM sessions WHERE token=$1 AND expires>$2 AND credential=$3',[hash(token),Date.now(),hash(credential())])).rows.length;
}
export async function requireAdmin(){if(!(await authenticated()))throw Error('Sesi berakhir. Silakan masuk kembali.');}
export async function signIn(password:string){
 if(!configured())return 'Admin belum dikonfigurasi. Hubungi pengelola server.';
 const [salt,expected]=credential().split(':');
 const token=randomBytes(32).toString('hex');
 try {
  const error=await db().transaction(async client=>{
   // Persist and lock the shared throttle row: concurrent serverless attempts cannot lose increments.
   await client.query('INSERT INTO login_attempts(id,failures,reset) VALUES(1,0,0) ON CONFLICT (id) DO NOTHING');
   const attempt=(await client.query<{failures:number;reset:number}>('SELECT failures,reset FROM login_attempts WHERE id=1 FOR UPDATE')).rows[0];
   const now=Date.now();
   if(attempt.reset>now&&attempt.failures>=5)return 'Terlalu banyak percobaan. Coba kembali dalam 15 menit.';
   const ok=password.length<=1024&&timingSafeEqual(scryptSync(password,salt,64),Buffer.from(expected,'hex'));
   if(!ok){
    await client.query('UPDATE login_attempts SET failures=$1,reset=$2 WHERE id=1',[attempt.reset>now?attempt.failures+1:1,attempt.reset>now?attempt.reset:now+900000]);
    return 'Password tidak sesuai.';
   }
   await client.query('UPDATE login_attempts SET failures=0,reset=0 WHERE id=1');
   await client.query('DELETE FROM sessions WHERE expires<=$1 OR credential<>$2',[now,hash(credential())]);
   await client.query('INSERT INTO sessions(token,expires,credential) VALUES($1,$2,$3)',[hash(token),now+28800000,hash(credential())]);
   return null;
  });
  if(error)return error;
 }catch(error){if(error instanceof DatabaseError)return error.message;throw error;}
 (await cookies()).set(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:28800});
 return null;
}
export async function signOut(){
 const jar=await cookies();const token=jar.get(cookieName)?.value;
 try{if(token)await db().query('DELETE FROM sessions WHERE token=$1',[hash(token)]);}finally{jar.delete(cookieName);}
}
