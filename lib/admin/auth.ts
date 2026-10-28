import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "./db";
const cookieName = "altomebay_admin";
export const credential = () => process.env.ADMIN_PASSWORD_HASH || "";
const hash = (v: string) => createHash("sha256").update(v).digest("hex");
export function configured() { return /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(credential()); }
export async function authenticated() {
 if (!configured()) return false;
 const token = (await cookies()).get(cookieName)?.value;
 if (!token) return false;
 return !!db().prepare("SELECT token FROM sessions WHERE token=? AND expires>? AND credential=?").get(hash(token),Date.now(),hash(credential()));
}
export async function requireAdmin() { if (!(await authenticated())) throw new Error("Sesi berakhir. Silakan masuk kembali."); }
export async function signIn(password: string) {
 if (!configured()) return "Admin belum dikonfigurasi. Hubungi pengelola server.";
 const now = Date.now();
 const attempt = db().prepare("SELECT failures,reset FROM login_attempts WHERE id=1").get() as {failures:number;reset:number}|undefined;
 if (attempt && attempt.reset > now && attempt.failures >= 5) return "Terlalu banyak percobaan. Coba kembali dalam 15 menit.";
 const [salt,expected] = credential().split(":");
 const ok = password.length <= 1024 && timingSafeEqual(scryptSync(password,salt,64),Buffer.from(expected,"hex"));
 if (!ok) {
  const failures = attempt && attempt.reset > now ? attempt.failures+1 : 1;
  db().prepare("INSERT OR REPLACE INTO login_attempts VALUES(1,?,?)").run(failures,attempt && attempt.reset > now ? attempt.reset : now+900000);
  return "Password tidak sesuai.";
 }
 db().exec("DELETE FROM login_attempts");
 db().prepare("DELETE FROM sessions WHERE expires<=? OR credential<>?").run(now,hash(credential()));
 const token = randomBytes(32).toString("hex");
 db().prepare("INSERT INTO sessions VALUES(?,?,?)").run(hash(token),now+28800000,hash(credential()));
 (await cookies()).set(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"strict",path:"/",maxAge:28800});
 return null;
}
export async function signOut() {
 const jar = await cookies(); const token = jar.get(cookieName)?.value;
 if(token) db().prepare("DELETE FROM sessions WHERE token=?").run(hash(token));
 jar.delete(cookieName);
}
