"use client";
import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { login } from "./actions";
export function Login({configured}:{configured:boolean}) {
 const [error,action,pending]=useActionState(login,null);
 return <section className="admin-login admin-panel"><LockKeyhole className="text-brand" size={28}/><h1 className="text-2xl font-bold mt-5">Masuk ke admin</h1><p className="text-ink-soft mt-2">Kelola pencatatan keuangan harian Altomebay.</p>{!configured ? <p role="status" className="admin-notice mt-6">Akses admin belum diaktifkan. Atur ADMIN_PASSWORD_HASH pada server sesuai panduan konfigurasi.</p> : <form action={action} className="mt-6 grid gap-5"><label>Password admin<input name="password" type="password" required autoComplete="current-password" autoFocus maxLength={1024}/></label>{error && <p role="alert" className="text-brand">{error}</p>}<Button type="submit" disabled={pending}>{pending ? "Memproses…" : "Masuk"}</Button></form>}</section>;
}
