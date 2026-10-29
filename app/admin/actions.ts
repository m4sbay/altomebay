"use server";
import { createHash, randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { requireAdmin, signIn, signOut } from '@/lib/admin/auth';
import { db } from '@/lib/admin/db';
import { DatabaseError } from '@/lib/admin/postgres.mjs';
import { categories, validDate, validatePeriod, summarize, cashflowTrend, validateTransaction, type CashTransaction } from '@/lib/cashflow';
import { expenseName, validateExpenseBatch, validateExpenseItem, type ExpenseType } from '@/lib/expenses';

const historySelect=`SELECT t.*, i."typeId" AS "expenseTypeId", et.name AS "expenseTypeName", i."batchId", b.note AS "batchNote"
 FROM transactions t LEFT JOIN expense_items i ON i."transactionId"=t.id
 LEFT JOIN expense_types et ON et.id=i."typeId" LEFT JOIN expense_batches b ON b.id=i."batchId"`;
export async function login(_:string|null,form:FormData) {
 const error=await signIn(String(form.get('password')||''));
 if(error)return error;
 redirect('/admin');
}
export async function logout(){await signOut();redirect('/admin');}
export async function listTransactions(date:string):Promise<CashTransaction[]> {
 await requireAdmin();
 if(!validDate(date))throw Error('Tanggal tidak valid.');
 return (await db().query<CashTransaction>(`${historySelect} WHERE t."transactionDate"=$1 ORDER BY t."createdAt" DESC,t.id DESC`,[date])).rows;
}
export async function saveTransaction(input:unknown,id?:string) {
 await requireAdmin();
 let value;
 try{value=validateTransaction(input);}catch(error){return {error:(error as Error).message};}
 if(id!==undefined&&typeof id!=='string')return {error:'ID tidak valid.'};
 const now=new Date().toISOString();
 try {
  await db().transaction(async client=>{
   if(id){
    const existing=await client.query('SELECT id FROM transactions WHERE id=$1 FOR UPDATE',[id]);
    if(!existing.rows.length)throw new DatabaseError('Transaksi tidak ditemukan. Muat ulang halaman.');
    if((await client.query('SELECT "transactionId" FROM expense_items WHERE "transactionId"=$1',[id])).rows.length)throw new DatabaseError('Gunakan editor item pengeluaran untuk transaksi ini.');
    await client.query('UPDATE transactions SET type=$1,amount=$2,category=$3,description=$4,"transactionDate"=$5,"updatedAt"=$6 WHERE id=$7',[value.type,value.amount,value.category,value.description,value.transactionDate,now,id]);
   }else {
    await client.query('INSERT INTO transactions (id,type,amount,category,description,"transactionDate","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),value.type,value.amount,value.category,value.description,value.transactionDate,now,now]);
   }
  });
  return {error:null};
 }catch(error){return {error:(error as Error).message};}
}
export async function deleteTransaction(id:string) {
 await requireAdmin();
 if(typeof id!=='string')throw Error('ID tidak valid.');
 if(!(await db().query('DELETE FROM transactions WHERE id=$1 RETURNING id',[id])).rows.length)throw Error('Transaksi tidak ditemukan. Muat ulang halaman.');
}
export async function financialOverview(start:string,end:string) {
 await requireAdmin();
 const period=validatePeriod(start,end);
 const rows=(await db().query<CashTransaction>(`${historySelect} WHERE t."transactionDate" BETWEEN $1 AND $2 ORDER BY t."transactionDate" DESC,t."createdAt" DESC,t.id DESC`,[period.start,period.end])).rows;
 return {rows,totals:summarize(rows),trend:cashflowTrend(rows,period)};
}
export async function dailySales(date:string):Promise<CashTransaction[]> {
 await requireAdmin();
 if(!validDate(date))throw Error('Tanggal tidak valid.');
 return (await db().query<CashTransaction>(`SELECT * FROM transactions WHERE "transactionDate"=$1 AND type='income' AND category='sales' ORDER BY "createdAt",id`,[date])).rows;
}
export async function listExpenseTypes():Promise<ExpenseType[]> {
 await requireAdmin();
 return (await db().query<ExpenseType>('SELECT id,name,category FROM expense_types ORDER BY sort_order,id')).rows;
}
export async function createExpenseType(name:unknown,category:unknown) {
 await requireAdmin();
 try {
  const clean=expenseName(name);
  if(typeof category!=='string'||!Object.hasOwn(categories.expense,category))throw Error('Pilih kategori utama pengeluaran.');
  const key=clean.toLocaleLowerCase('id-ID');
  await db().query('INSERT INTO expense_types(id,name,"normalizedName",category) VALUES($1,$2,$3,$4) ON CONFLICT ("normalizedName") DO NOTHING',[randomUUID(),clean,key,category]);
  const type=(await db().query<ExpenseType>('SELECT id,name,category FROM expense_types WHERE "normalizedName"=$1',[key])).rows[0];
  return {type,error:null};
 }catch(error){return {error:(error as Error).message};}
}
export async function saveExpenseBatch(input:unknown) {
 await requireAdmin();
 try {
  const value=validateExpenseBatch(input);
  const fingerprint=createHash('sha256').update(JSON.stringify(value)).digest('hex');
  await db().transaction(async client=>{
   const now=new Date().toISOString();
   // A unique INSERT arbitrates concurrent/retried requests across serverless instances.
   const inserted=await client.query('INSERT INTO expense_batches(id,note,"transactionDate",fingerprint,"createdAt") VALUES($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING RETURNING id',[value.id,value.note,value.transactionDate,fingerprint,now]);
   if(!inserted.rows.length){
    const existing=(await client.query<{fingerprint:string}>('SELECT fingerprint FROM expense_batches WHERE id=$1',[value.id])).rows[0];
    if(existing?.fingerprint!==fingerprint)throw new DatabaseError('Pencatatan ini sudah tersimpan dengan isian berbeda. Muat ulang riwayat.');
    return;
   }
   for(const item of value.items){
    const type=(await client.query<ExpenseType>('SELECT id,name,category FROM expense_types WHERE id=$1 FOR KEY SHARE',[item.typeId])).rows[0];
    if(!type)throw new DatabaseError('Jenis pengeluaran tidak ditemukan. Muat ulang pilihan.');
    const id=randomUUID();
    await client.query('INSERT INTO transactions(id,type,amount,category,description,"transactionDate","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,'expense',item.amount,type.category,null,value.transactionDate,now,now]);
    await client.query('INSERT INTO expense_items("transactionId","typeId","batchId") VALUES($1,$2,$3)',[id,type.id,value.id]);
   }
  });
  return {error:null};
 }catch(error){return {error:(error as Error).message};}
}
export async function saveExpenseItem(id:string,typeId:string,amount:number) {
 await requireAdmin();
 try {
  validateExpenseItem(typeId,amount);
  if(typeof id!=='string')throw Error('ID tidak valid.');
  await db().transaction(async client=>{
   const existing=await client.query(`SELECT id FROM transactions WHERE id=$1 AND type='expense' FOR UPDATE`,[id]);
   const link=await client.query('SELECT "transactionId" FROM expense_items WHERE "transactionId"=$1',[id]);
   const type=(await client.query<ExpenseType>('SELECT id,name,category FROM expense_types WHERE id=$1 FOR KEY SHARE',[typeId])).rows[0];
   if(!existing.rows.length||!link.rows.length||!type)throw new DatabaseError('Item atau jenis tidak ditemukan. Muat ulang halaman.');
   await client.query('UPDATE transactions SET amount=$1,category=$2,"updatedAt"=$3 WHERE id=$4',[amount,type.category,new Date().toISOString(),id]);
   await client.query('UPDATE expense_items SET "typeId"=$1 WHERE "transactionId"=$2',[typeId,id]);
  });
  return {error:null};
 }catch(error){return {error:(error as Error).message};}
}
