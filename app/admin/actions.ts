"use server";
import { createHash, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { requireAdmin, signIn, signOut } from "@/lib/admin/auth";
import { categories } from "@/lib/cashflow";
import { expenseName, validateExpenseBatch, validateExpenseItem, type ExpenseType } from "@/lib/expenses";
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
 return db().prepare("SELECT t.*, i.typeId AS expenseTypeId, et.name AS expenseTypeName, i.batchId, b.note AS batchNote FROM transactions t LEFT JOIN expense_items i ON i.transactionId=t.id LEFT JOIN expense_types et ON et.id=i.typeId LEFT JOIN expense_batches b ON b.id=i.batchId WHERE t.transactionDate=? ORDER BY t.createdAt DESC,t.id DESC").all(date).map(row => ({ ...(row as CashTransaction) }));
}
export async function saveTransaction(input: unknown, id?: string) {
 await requireAdmin();
 let v;
 try { v=validateTransaction(input); } catch(e) {return {error:(e as Error).message};}
 const now = new Date().toISOString();
 try {
 if (id) {
  if(typeof id !== 'string')return {error:'ID tidak valid.'};
  if(db().prepare('SELECT transactionId FROM expense_items WHERE transactionId=?').get(id))return {error:'Gunakan editor item pengeluaran untuk transaksi ini.'};
  const result = db().prepare("UPDATE transactions SET type=?,amount=?,category=?,description=?,transactionDate=?,updatedAt=? WHERE id=?").run(v.type,v.amount,v.category,v.description,v.transactionDate,now,id);
  if (!result.changes) return {error:"Transaksi tidak ditemukan. Muat ulang halaman."};
 } else {
  db().prepare("INSERT INTO transactions (id,type,amount,category,description,transactionDate,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?)").run(randomUUID(),v.type,v.amount,v.category,v.description,v.transactionDate,now,now);
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
 const rows=db().prepare("SELECT t.*, i.typeId AS expenseTypeId, et.name AS expenseTypeName, i.batchId, b.note AS batchNote FROM transactions t LEFT JOIN expense_items i ON i.transactionId=t.id LEFT JOIN expense_types et ON et.id=i.typeId LEFT JOIN expense_batches b ON b.id=i.batchId WHERE t.transactionDate BETWEEN ? AND ? ORDER BY t.transactionDate DESC,t.createdAt DESC,t.id DESC").all(period.start,period.end).map(row=>({...row as CashTransaction}));
 return {rows,totals:summarize(rows),trend:cashflowTrend(rows,period)};
}
export async function dailySales(date: string): Promise<CashTransaction[]> {
 await requireAdmin();
 if(!validDate(date)) throw new Error("Tanggal tidak valid.");
 return db().prepare("SELECT * FROM transactions WHERE transactionDate=? AND type='income' AND category='sales' ORDER BY createdAt,id").all(date).map(row=>({...row as CashTransaction}));
}

export async function listExpenseTypes(): Promise<ExpenseType[]> {
 await requireAdmin();
 return db().prepare('SELECT id,name,category FROM expense_types ORDER BY rowid').all().map(row=>({...row as ExpenseType}));
}
export async function createExpenseType(name: unknown, category: unknown) {
 await requireAdmin();
 try {
  const clean=expenseName(name);
  if(typeof category!=='string'||!Object.hasOwn(categories.expense,category))throw Error('Pilih kategori utama pengeluaran.');
  const key=clean.toLocaleLowerCase('id-ID');
  db().prepare('INSERT OR IGNORE INTO expense_types VALUES(?,?,?,?)').run(randomUUID(),clean,key,category);
  const type=db().prepare('SELECT id,name,category FROM expense_types WHERE normalizedName=?').get(key) as ExpenseType;
  return {type:{...type},error:null};
 }catch(e){return {error:(e as Error).message};}
}
export async function saveExpenseBatch(input: unknown) {
 await requireAdmin();
 const database=db();
 try {
  const v=validateExpenseBatch(input);
  const fingerprint=createHash('sha256').update(JSON.stringify(v)).digest('hex');
  database.exec('BEGIN IMMEDIATE');
  try {
   const existing=database.prepare('SELECT fingerprint FROM expense_batches WHERE id=?').get(v.id) as {fingerprint:string}|undefined;
   if(existing){if(existing.fingerprint!==fingerprint)throw Error('Pencatatan ini sudah tersimpan dengan isian berbeda. Muat ulang riwayat.');}
   else {
    const now=new Date().toISOString();
    database.prepare('INSERT INTO expense_batches VALUES(?,?,?,?,?)').run(v.id,v.note,v.transactionDate,fingerprint,now);
    for(const item of v.items){
     const type=database.prepare('SELECT id,name,category FROM expense_types WHERE id=?').get(item.typeId) as ExpenseType|undefined;
     if(!type)throw Error('Jenis pengeluaran tidak ditemukan. Muat ulang pilihan.');
     const id=randomUUID();
     database.prepare('INSERT INTO transactions (id,type,amount,category,description,transactionDate,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?)').run(id,'expense',item.amount,type.category,null,v.transactionDate,now,now);
     database.prepare('INSERT INTO expense_items VALUES(?,?,?)').run(id,type.id,v.id);
    }
   }
   database.exec('COMMIT');
  }catch(e){database.exec('ROLLBACK');throw e;}
  return {error:null};
 }catch(e){return {error:(e as Error).message};}
}
export async function saveExpenseItem(id: string, typeId: string, amount: number) {
 await requireAdmin();
 try {
  validateExpenseItem(typeId,amount);
  if(typeof id!=='string')throw Error('ID tidak valid.');
  const database=db();
  database.exec('BEGIN IMMEDIATE');
  try {
  const result=database.prepare(`UPDATE transactions SET amount=?,category=(SELECT category FROM expense_types WHERE id=?),updatedAt=?
   WHERE id=? AND type='expense' AND EXISTS(SELECT 1 FROM expense_items WHERE transactionId=? AND EXISTS(SELECT 1 FROM expense_types WHERE id=?))`).run(amount,typeId,new Date().toISOString(),id,id,typeId);
  if(!result.changes)throw Error('Item atau jenis tidak ditemukan. Muat ulang halaman.');
  database.prepare('UPDATE expense_items SET typeId=? WHERE transactionId=?').run(typeId,id);
  database.exec('COMMIT');
  }catch(e){database.exec('ROLLBACK');throw e;}
  return {error:null};
 }catch(e){return {error:(e as Error).message};}
}
