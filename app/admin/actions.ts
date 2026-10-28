"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { requireAdmin, signIn, signOut } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { validDate, validatePeriod, summarize, cashflowTrend, validateTransaction, type CashTransaction } from "@/lib/cashflow";
export async function login(_: string | null, form: FormData) {
 const error = await signIn(String(form.get("password") || ""));
 if (error) return error;
 redirect("/admin");
}
export async function logout() { await signOut(); redirect("/admin"); }
export async function listTransactions(date: string): Promise<CashTransaction[]> {
 await requireAdmin();
 if (!validDate(date)) throw new Error("Tanggal tidak valid.");
 return db().prepare("SELECT * FROM transactions WHERE transactionDate=? ORDER BY createdAt DESC,id DESC").all(date).map(row => ({ ...(row as CashTransaction) }));
}
export async function saveTransaction(input: unknown, id?: string) {
 await requireAdmin();
 let v;
 try { v=validateTransaction(input); } catch(e) {return {error:(e as Error).message};}
 const now = new Date().toISOString();
 try {
 if (id) {
  if(typeof id !== "string") return {error:"ID tidak valid."};
  const result = db().prepare("UPDATE transactions SET type=?,amount=?,category=?,description=?,transactionDate=?,updatedAt=? WHERE id=?").run(v.type,v.amount,v.category,v.description,v.transactionDate,now,id);
  if (!result.changes) return {error:"Transaksi tidak ditemukan. Muat ulang halaman."};
 } else {
  db().prepare("INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(),v.type,v.amount,v.category,v.description,v.transactionDate,now,now);
 }
 } catch(e) {
  if(e instanceof Error && e.message.includes("daily_sales_duplicate")) return {error:"Rekap penjualan tanggal ini sudah ada. Buka rekap yang ada untuk mengedit nominalnya."};
  throw e;
 }
 return {error:null};
}
export async function deleteTransaction(id: string) {
 await requireAdmin();
 if(typeof id !== "string" || !db().prepare("DELETE FROM transactions WHERE id=?").run(id).changes) throw new Error("Transaksi tidak ditemukan. Muat ulang halaman.");
}

export async function financialOverview(start: string, end: string) {
 await requireAdmin();
 const period=validatePeriod(start,end);
 const rows=db().prepare("SELECT * FROM transactions WHERE transactionDate BETWEEN ? AND ? ORDER BY transactionDate DESC,createdAt DESC,id DESC").all(period.start,period.end).map(row=>({...row as CashTransaction}));
 return {rows,totals:summarize(rows),trend:cashflowTrend(rows,period)};
}
export async function dailySales(date: string): Promise<CashTransaction[]> {
 await requireAdmin();
 if(!validDate(date)) throw new Error("Tanggal tidak valid.");
 return db().prepare("SELECT * FROM transactions WHERE transactionDate=? AND type='income' AND category='sales' ORDER BY createdAt,id").all(date).map(row=>({...row as CashTransaction}));
}
