import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { authenticated, configured } from "@/lib/admin/auth";
import { Button } from "@/components/ui/Button";
import { logout } from "./actions";
import { todayJakarta, presetPeriod, validatePeriod } from "@/lib/cashflow";
import { Dashboard } from "./dashboard";
import { Login } from "./login";
import "./admin.css";
import "@/components/ui/admin/admin-ui.css";
export const metadata: Metadata = {title:"Ringkasan Keuangan — Altomebay Admin",robots:{index:false,follow:false}};
export const runtime = "nodejs";
export default async function AdminPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 await connection();
 const allowed = await authenticated();
 const today=todayJakarta();let period=presetPeriod("month",today);let error="";
 if(allowed){const query=await searchParams;if(query.start!==undefined || query.end!==undefined){try{period=validatePeriod(query.start,query.end);}catch(e){error=(e as Error).message+" Menampilkan Bulan Ini.";}}}
 return <div className="admin-shell"><header className="admin-header"><Link href="/" aria-label="Altomebay, kembali ke website"><span className="font-extrabold text-xl text-brand">altomebay<span className="text-ink">.</span></span></Link><span className="admin-badge">Admin</span>{allowed && <nav aria-label="Navigasi admin" className="admin-header-nav"><a href="/admin" aria-current="page">Dashboard</a><form action={logout}><Button variant="secondary" type="submit">Keluar</Button></form></nav>}</header><main id="main-content" className="admin-main">{allowed ? <Dashboard today={today} initialPeriod={period} initialError={error}/> : <Login configured={configured()}/>}</main></div>;
}
