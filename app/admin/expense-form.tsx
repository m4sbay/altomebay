"use client";
import { startTransition, useEffect, useRef, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { rupiah, type CashTransaction } from '@/lib/cashflow';
import type { ExpenseType } from '@/lib/expenses';
import { listExpenseTypes, saveExpenseBatch, saveExpenseItem } from './actions';
import { AppDialog as Modal } from '@/components/ui/admin/dialog';
import { AppTextarea, AppIconButton, CurrencyInput } from '@/components/ui/admin/controls';
import { DatePicker } from './date-picker';
import { ExpenseTypeSelector } from './expense-type-selector';
interface Item {id:string;typeId:string;amount:string}
export function ExpenseForm({transaction,today,onClose,onSaved}:{transaction:CashTransaction|null;today:string;onClose:()=>void;onSaved:()=>Promise<void>}) {
 const [date,setDate]=useState(transaction?.transactionDate||today);const [note,setNote]=useState('');
 const [items,setItems]=useState<Item[]>([{id:'initial',typeId:transaction?.expenseTypeId||'',amount:transaction?new Intl.NumberFormat('id-ID').format(transaction.amount):''}]);
 const [types,setTypes]=useState<ExpenseType[]>([]);const [loaded,setLoaded]=useState(false);const [loadError,setLoadError]=useState('');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const lock=useRef(false);const requestId=useRef('');
 useEffect(()=>{let alive=true;startTransition(async()=>{try{const values=await listExpenseTypes();if(alive){setTypes(values);setLoaded(true);}}catch{if(alive)setLoadError('Pilihan belum dapat dimuat. Tutup dan buka kembali form.');}});return()=>{alive=false;};},[]);
 const dirty=items.length!==1||items[0].typeId!==(transaction?.expenseTypeId||'')||items[0].amount!==(transaction?new Intl.NumberFormat('id-ID').format(transaction.amount):'')||note!==''||date!==(transaction?.transactionDate||today);
 function close(){if(!lock.current&&(!dirty||window.confirm('Buang perubahan yang belum disimpan?')))onClose();}
 function update(id:string,change:Partial<Item>){setItems(rows=>rows.map(row=>row.id===id?{...row,...change}:row));}
 async function submit(e:FormEvent){e.preventDefault();if(lock.current||!loaded)return;setError('');
 const values=items.map(item=>({typeId:item.typeId,amount:Number(item.amount.replaceAll('.',''))}));
 if(values.some(item=>!item.typeId||!Number.isSafeInteger(item.amount)||item.amount<=0||item.amount>1e12)){setError('Lengkapi jenis dan nominal setiap item. Nominal harus lebih dari nol, maksimal Rp1 triliun. Hapus item kosong yang tidak diperlukan.');return;}
 lock.current=true;setBusy(true);if(!requestId.current)requestId.current=crypto.randomUUID();
 startTransition(async()=>{try{const result=transaction?await saveExpenseItem(transaction.id,values[0].typeId,values[0].amount):await saveExpenseBatch({id:requestId.current,transactionDate:date,note,items:values});if(result.error)setError(result.error);else await onSaved();}catch{setError('Pengeluaran belum dapat disimpan. Coba lagi untuk memeriksa pencatatan yang sama.');}finally{lock.current=false;setBusy(false);}});
 }
 const total=items.reduce((sum,item)=>{const amount=Number(item.amount.replaceAll('.',''));return sum+(Number.isSafeInteger(amount)&&amount>0&&amount<=1e12?amount:0);},0);
 return <Modal title={transaction?'Edit Item Pengeluaran':'Catat Pengeluaran'} wide onClose={close}><p className="text-sm text-ink-soft mt-2">{transaction?'Ubah jenis dan nominal item. Tanggal dan catatan mengikuti pencatatan awal.':'Tambahkan pengeluaran toko dalam satu pencatatan.'}</p><form className="admin-form" onSubmit={submit}><DatePicker label="Tanggal Transaksi" value={date} max={today} onChange={setDate} disabled={busy||!!transaction}/>{loadError&&<p role="alert">{loadError}</p>}{!loaded&&!loadError&&<p role="status">Memuat jenis pengeluaran…</p>}
 <div className="expense-items">{items.map((item,index)=><fieldset key={item.id} className="expense-item" disabled={busy}><legend>Pengeluaran {index+1}</legend><div className="flex justify-end"><AppIconButton label={`Hapus Pengeluaran ${index+1}`} disabled={busy||items.length===1||!!transaction} onClick={()=>setItems(rows=>rows.filter(row=>row.id!==item.id))}><Trash2 size={18} aria-hidden="true"/></AppIconButton></div><div className="expense-fields"><ExpenseTypeSelector types={types} value={item.typeId} disabled={busy||!loaded} onChange={typeId=>update(item.id,{typeId})} onCreated={type=>setTypes(rows=>rows.some(row=>row.id===type.id)?rows:[...rows,type])}/><label>Nominal Pengeluaran (Rp)<CurrencyInput required value={item.amount} onValueChange={amount=>update(item.id,{amount})}/></label></div></fieldset>)}</div>
 {!transaction&&<><Button variant="secondary" disabled={busy||items.length>=100} onClick={()=>setItems(rows=>[...rows,{id:crypto.randomUUID(),typeId:'',amount:''}])}>+ Tambah Pengeluaran</Button><label>Catatan Tambahan (Opsional)<AppTextarea rows={3} maxLength={200} value={note} disabled={busy} onChange={e=>setNote(e.target.value)} placeholder="Contoh: Belanja kebutuhan toko dari beberapa distributor."/></label></>}
 {transaction?.batchNote&&<p className="text-sm">Catatan pencatatan: {transaction.batchNote}</p>}<div className="expense-summary" aria-live="polite"><p className="text-sm">Jumlah Pengeluaran: {items.length} item</p><p className="font-semibold mt-2">Total Pengeluaran: <span className="tabular-nums">{rupiah(total)}</span></p></div>{error&&<p role="alert" className="text-brand text-sm">{error}</p>}<div className="admin-form-actions"><Button variant="secondary" disabled={busy} onClick={close}>Batal</Button><Button type="submit" disabled={busy||!loaded}>{busy?'Menyimpan…':transaction?'Simpan Item Pengeluaran':'Simpan Semua Pengeluaran'}</Button></div></form></Modal>;
}
