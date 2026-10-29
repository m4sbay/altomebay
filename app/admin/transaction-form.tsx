"use client";
import { startTransition, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AppDialog as Modal } from "@/components/ui/admin/dialog";
import { AppInput, AppTextarea, CurrencyInput } from "@/components/ui/admin/controls";
import { AppSelect } from "@/components/ui/admin/select";
import { Button } from "@/components/ui/Button";
import { categories, rupiah, type CashTransaction, type TransactionType } from "@/lib/cashflow";
import { DatePicker } from "./date-picker";
import { dailySales, saveTransaction } from "./actions";
export function TransactionForm({transaction,type,today,onClose,onSaved,onEdit}:{transaction:CashTransaction|null;type:TransactionType;today:string;onClose:()=>void;onSaved:()=>Promise<void>;onEdit:(row:CashTransaction)=>void}) {
 const fieldId=useId();
 const [date,setDate]=useState(transaction?.transactionDate || today);
 const [amount,setAmount]=useState(transaction ? new Intl.NumberFormat("id-ID").format(transaction.amount) : "");
 const [category,setCategory]=useState(transaction?.category || (type==='income'?'sales':''));
 const [description,setDescription]=useState(transaction?.description || "");
 const [busy,setBusy]=useState(false);const lock=useRef(false);const [error,setError]=useState("");
 const [existing,setExisting]=useState<CashTransaction[]>([]);
 const [lookup,setLookup]=useState<{date:string;error:boolean}|null>(null);
 const sales=type==='income' && category==='sales';
 useEffect(()=>{
  if(!sales)return;
  let alive=true;
  startTransition(async()=>{try{const rows=await dailySales(date);if(alive){setExisting(rows);setLookup({date,error:false});}}catch{if(alive)setLookup({date,error:true});}});
  return()=>{alive=false;};
 },[date,sales]);
 const checking=sales && lookup?.date!==date;
 const conflict=sales && !checking && !lookup?.error && existing.filter(row=>row.id!==transaction?.id);
 // Legacy duplicate rows may be corrected in place, but never silently merged.
 const blocked=Boolean(conflict && conflict.length && (!transaction || transaction.category!=='sales' || transaction.transactionDate!==date));
 const dirty=amount!==(transaction?new Intl.NumberFormat('id-ID').format(transaction.amount):'') || date!==(transaction?.transactionDate||today) || category!==(transaction?.category||(type==='income'?'sales':'')) || description!==(transaction?.description||'');
 function close(){if(!busy && (!dirty || window.confirm('Buang perubahan yang belum disimpan?')))onClose();}
 async function submit(e:FormEvent<HTMLFormElement>) {
  e.preventDefault();if(lock.current || checking || blocked)return;lock.current=true;setBusy(true);setError("");
  startTransition(async()=>{try{const result=await saveTransaction({type,amount:Number(amount.replaceAll(".","")),category,description,transactionDate:date},transaction?.id);if(result.error){setError(result.error);if(sales){setExisting(await dailySales(date));setLookup({date,error:false});}}else await onSaved();}
  catch{setError("Transaksi belum dapat disimpan. Coba lagi atau muat ulang halaman untuk memeriksa sesi.");}finally{setBusy(false);lock.current=false;}});
 }
 const dateField=<DatePicker label="Tanggal" value={date} max={today} onChange={setDate} disabled={busy}/>;
 const amountField=<label>Jumlah {type==='income'?'Pemasukan':'Pengeluaran'} (Rp)<CurrencyInput autoFocus required value={amount} disabled={busy} onValueChange={setAmount}/></label>;
 return <Modal title={`${transaction?'Edit':'Catat'} ${type==='income'?'Pemasukan':'Pengeluaran'}`} onClose={close}><p className="text-sm text-ink-soft mt-2">{type==='income'?'Rekap pemasukan toko secara manual.':'Catat penggunaan uang beserta tujuan pengeluaran.'}</p><form onSubmit={submit} className="admin-form">{dateField}{amountField}{type==='income' ? <><div><label htmlFor={`${fieldId}-source`}>Sumber Pemasukan</label><AppSelect id={`${fieldId}-source`} aria-label="Sumber Pemasukan" value={category} onValueChange={value=>setCategory(value as typeof category)} disabled={busy} options={Object.entries(categories.income).map(([value,label])=>({value,label}))}/></div>{sales && <div className="admin-notice" role="status">{checking ? 'Memeriksa rekap tanggal ini…' : lookup?.error ? 'Rekap belum dapat diperiksa. Coba simpan untuk memeriksa kembali.' : existing.length ? <><p>{existing.length>1 ? 'Ada beberapa rekap lama pada tanggal ini. Tinjau satu per satu; data tetap dipertahankan.' : 'Rekap tanggal ini sudah tercatat.'}</p>{existing.map(row=><div key={row.id} className="flex flex-wrap items-center justify-between gap-2 mt-2"><strong>{rupiah(row.amount)}</strong>{row.id!==transaction?.id && <Button variant="secondary" disabled={busy} onClick={()=>{if(!dirty || window.confirm('Buka rekap lama dan buang isian yang belum disimpan?'))onEdit(row);}}>Edit rekap</Button>}</div>)}</> : 'Satu rekap penjualan utama per tanggal.'}</div>}<details open={description ? true : undefined}><summary>Keterangan (opsional)</summary><label className="mt-3">Keterangan<AppInput value={description} onChange={e=>setDescription(e.target.value)} maxLength={200} disabled={busy} placeholder="Tambahkan catatan bila diperlukan"/></label></details></> : <><div><label htmlFor={`${fieldId}-category`}>Kategori Pengeluaran</label><AppSelect id={`${fieldId}-category`} aria-label="Kategori Pengeluaran" required value={category} onValueChange={value=>setCategory(value as typeof category)} disabled={busy} placeholder="Pilih kategori pengeluaran" options={Object.entries(categories.expense).map(([value,label])=>({value,label}))}/></div><label>Detail Pengeluaran<AppTextarea required rows={3} maxLength={200} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Contoh: Beli kantong plastik" disabled={busy}/><span className="text-xs text-ink-soft font-normal">{description.length}/200 karakter</span></label></>}{error && <p role="alert" className="text-brand text-sm">{error}</p>}<div className="admin-form-actions"><Button variant="secondary" disabled={busy} onClick={close}>Batal</Button><Button type="submit" disabled={busy || checking || blocked}>{busy?'Menyimpan…':`Simpan ${type==='income'?'Pemasukan':'Pengeluaran'}`}</Button></div></form></Modal>;
}
