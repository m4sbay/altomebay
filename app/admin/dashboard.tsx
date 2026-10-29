"use client";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, ReceiptText } from "lucide-react";
import { groupHistory } from "@/lib/expenses";
import { ExpenseForm } from "./expense-form";
import { ExpenseHistory } from "./expense-history";
import { AppDialog as Modal } from "@/components/ui/admin/dialog";
import { AppSelect } from "@/components/ui/admin/select";
import { Button } from "@/components/ui/Button";
import { categoryLabel, todayJakarta, matchingPreset, presetPeriod, rupiah, validatePeriod, type CashTransaction, type Period, type PeriodPreset, type TransactionType } from "@/lib/cashflow";
import { deleteTransaction, financialOverview } from "./actions";
import { PeriodFilter, shortDate } from "./period-filter";
import { CashflowChart } from "./cashflow-chart";
import { TransactionForm } from "./transaction-form";
type Overview=Awaited<ReturnType<typeof financialOverview>>;
export function Dashboard({today:initialToday,initialPeriod,initialError}:{today:string;initialPeriod:Period;initialError:string}) {
 const [today,setToday]=useState(initialToday);
 const [period,setPeriod]=useState(initialPeriod);
 const [activePreset,setActivePreset]=useState<PeriodPreset|null>(()=>matchingPreset(initialPeriod,initialToday));
 const [data,setData]=useState<Overview|null>(null);
 const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const [notice,setNotice]=useState(initialError);
 const [editor,setEditor]=useState<CashTransaction|TransactionType|null>(null);
 const [deleting,setDeleting]=useState<CashTransaction|null>(null);
 const [busy,setBusy]=useState(false);const deleteLock=useRef(false);
 const [deleteError,setDeleteError]=useState("");
 const [type,setType]=useState('all');const [page,setPage]=useState(1);
 // Refresh at the Jakarta date boundary and when a suspended tab resumes.
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>;
  function refreshDay(){
   const nextDay=todayJakarta();
   if(nextDay!==today){
    setToday(nextDay);
    if(activePreset){const next=presetPeriod(activePreset,nextDay);setPeriod(next);setPage(1);const url=new URL(window.location.href);url.searchParams.set('start',next.start);url.searchParams.set('end',next.end);window.history.replaceState(null,'',url);}
   }
   clearTimeout(timer);
   timer=setTimeout(refreshDay,Math.max(1000,Date.parse(`${nextDay}T00:00:00+07:00`)+86400000-Date.now()+100));
  }
  timer=setTimeout(refreshDay,0);
  window.addEventListener('focus',refreshDay);document.addEventListener('visibilitychange',refreshDay);
  return()=>{clearTimeout(timer);window.removeEventListener('focus',refreshDay);document.removeEventListener('visibilitychange',refreshDay);};
 },[today,activePreset]);
 const sequence=useRef(0);
 const reload=useCallback(async()=>{
  const request=++sequence.current;setLoading(true);setError("");
  try{const next=await financialOverview(period.start,period.end);if(request===sequence.current)setData(next);}
  catch{if(request===sequence.current)setError("Data tidak dapat dimuat. Coba lagi atau muat ulang halaman untuk masuk kembali.");}
  finally{if(request===sequence.current)setLoading(false);}
 },[period]);
 useEffect(()=>{startTransition(()=>void reload());},[reload]);
 useEffect(()=>{function back(){const query=new URLSearchParams(window.location.search);try{const next=query.has('start')||query.has('end')?validatePeriod(query.get('start'),query.get('end')):presetPeriod('month',todayJakarta());setPeriod(next);setActivePreset(matchingPreset(next,todayJakarta()));setPage(1);}catch{setNotice('Rentang URL tidak valid.');}}window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[today]);
 function changePeriod(next:Period,preset?:PeriodPreset){setActivePreset(preset??null);setPeriod(next);setPage(1);const url=new URL(window.location.href);url.searchParams.set('start',next.start);url.searchParams.set('end',next.end);window.history.pushState(null,'',url);}
 function edit(row:CashTransaction){setEditor(row);}
 async function remove(){if(!deleting||deleteLock.current)return;deleteLock.current=true;setBusy(true);setDeleteError('');try{await deleteTransaction(deleting.id);setDeleting(null);setNotice('Transaksi berhasil dihapus.');await reload();}catch{setDeleteError('Transaksi belum terhapus. Coba lagi atau muat ulang halaman.');}finally{setBusy(false);deleteLock.current=false;}}
 const filtered=(data?.rows||[]).filter(row=>type==='all'||row.type===type);
 const grouped=groupHistory(filtered);
 const pages=Math.max(1,Math.ceil(grouped.length/15));const current=Math.min(page,pages);const visible=grouped.slice((current-1)*15,current*15);
 const quickActions=<><Button onClick={()=>setEditor('income')}><ArrowDownLeft size={18}/>Catat Pemasukan</Button><Button variant="secondary" onClick={()=>setEditor('expense')}><ArrowUpRight size={18}/>Catat Pengeluaran</Button></>;
 return <><div className="admin-heading"><div><p className="text-sm text-brand font-semibold mb-2">FINANCIAL OVERVIEW</p><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Ringkasan Keuangan</h1><p className="text-ink-soft mt-3">Pantau pemasukan, pengeluaran, dan arus kas toko.</p></div><div className="admin-heading-actions">{quickActions}</div></div><PeriodFilter period={period} today={today} activePreset={activePreset} onChange={changePeriod}/><p className="text-sm text-ink-soft my-4">{shortDate(period.start)} – {shortDate(period.end)} · Waktu Indonesia Barat</p>{notice && <p role="status" className="admin-notice mb-4">{notice}</p>}<section className="admin-summary" aria-label="Ringkasan keuangan" aria-busy={loading}>{[{label:'Total Pemasukan',value:data?.totals.income,icon:ArrowDownLeft},{label:'Total Pengeluaran',value:data?.totals.expense,icon:ArrowUpRight},{label:'Selisih Periode',value:data?.totals.difference,icon:Wallet}].map((item,i)=><article key={item.label} className={`admin-panel ${i===2?'admin-balance':''}`}><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium">{item.label}</h2><item.icon size={20}/></div><p className="admin-amount">{loading?'…':error?'—':rupiah(item.value??0)}</p><p className="text-xs text-ink-soft">{i===2?'Pemasukan dikurangi pengeluaran':'Total dalam periode terpilih'}</p></article>)}</section><p className="text-xs text-ink-soft mt-3">Selisih periode bukan laba atau saldo kas aktual.</p>{loading ? <div className="admin-panel admin-chart admin-empty" role="status">Memuat ringkasan dan transaksi…</div> : error ? <div className="admin-panel admin-chart admin-empty"><p role="alert">{error}</p><Button onClick={()=>startTransition(()=>void reload())}>Coba lagi</Button></div> : data && <CashflowChart points={data.trend.points} monthly={data.trend.granularity==='monthly'} empty={!data.rows.length}/>}<section className="admin-quick admin-panel" aria-label="Pencatatan transaksi"><div><h2 className="font-semibold">Catat aktivitas toko</h2><p className="text-sm text-ink-soft mt-1">Rekap pemasukan harian atau rincikan pengeluaran.</p></div><div className="admin-quick-actions">{quickActions}</div></section><section className="admin-history admin-panel"><div className="admin-history-heading"><div><h2 className="text-xl font-bold">Riwayat Transaksi</h2><p className="text-sm text-ink-soft mt-1">{loading||error?'Periode terpilih':`${filtered.length} transaksi · terbaru lebih dahulu`}</p></div><div className="admin-type-filter"><label htmlFor="history-type">Tipe transaksi</label><AppSelect id="history-type" aria-label="Tipe transaksi" value={type} onValueChange={value=>{setType(value);setPage(1);}} options={[{value:'all',label:'Semua'},{value:'income',label:'Pemasukan'},{value:'expense',label:'Pengeluaran'}]}/></div></div>{loading ? <p role="status">Memuat transaksi…</p> : error ? <p>Riwayat belum tersedia. Coba muat ulang data di atas.</p> : !filtered.length ? <div className="admin-empty"><ReceiptText size={32}/><h3 className="font-semibold">Belum ada transaksi</h3><p className="text-sm text-ink-soft">Tidak ada transaksi yang sesuai periode dan tipe terpilih.</p></div> : <><ExpenseHistory groups={visible} onEdit={edit} onDelete={row=>{setDeleteError('');setDeleting(row);}}/>{pages>1 && <nav className="admin-pagination" aria-label="Halaman transaksi"><Button variant="secondary" disabled={current===1} onClick={()=>setPage(current-1)}>Sebelumnya</Button><span>{current} / {pages}</span><Button variant="secondary" disabled={current===pages} onClick={()=>setPage(current+1)}>Berikutnya</Button></nav>}</>}</section>{editor && (editor==='expense'||(typeof editor!=='string'&&editor.expenseTypeId) ? <ExpenseForm key={typeof editor==='string'?editor:editor.id} transaction={typeof editor==='string'?null:editor} today={today} onClose={()=>setEditor(null)} onSaved={async()=>{setEditor(null);setNotice('Pengeluaran berhasil disimpan. Riwayat tetap mengikuti periode terpilih.');await reload();}}/> : <TransactionForm key={typeof editor==='string'?editor:editor.id} transaction={typeof editor==='string'?null:editor} type={typeof editor==='string'?editor:editor.type} today={today} onClose={()=>setEditor(null)} onEdit={edit} onSaved={async()=>{setEditor(null);setNotice('Transaksi berhasil disimpan. Riwayat tetap mengikuti periode terpilih.');await reload();}}/>)}{deleting && <Modal alert descriptionId="delete-explanation" title={deleting.batchId?"Hapus item pengeluaran ini?":"Hapus transaksi ini?"} onClose={()=>{if(!busy)setDeleting(null);}}><p id="delete-explanation" className="text-ink-soft mt-3">{deleting.batchId?"Hanya satu item ini yang dihapus. Item lain dalam grup tetap tersimpan. Penghapusan tidak dapat dikembalikan.":"Hanya transaksi ini yang dihapus. Penghapusan tidak dapat dikembalikan."}</p><p className="mt-4 font-semibold">{deleting.expenseTypeName||categoryLabel(deleting)} · {rupiah(deleting.amount)}</p><p className="text-sm mt-2">{shortDate(deleting.transactionDate)}</p>{deleteError && <p role="alert" className="text-brand mt-3">{deleteError}</p>}<div className="admin-form-actions"><Button variant="secondary" disabled={busy} onClick={()=>setDeleting(null)}>Batal</Button><Button variant="destructive" disabled={busy} onClick={()=>startTransition(()=>void remove())}>{busy?'Menghapus…':deleting.batchId?'Hapus Item':'Hapus Transaksi'}</Button></div></Modal>}</>;
}
