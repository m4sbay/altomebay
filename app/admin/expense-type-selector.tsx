"use client";
import { startTransition, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AppCombobox } from '@/components/ui/admin/combobox';
import { AppInput } from '@/components/ui/admin/controls';
import { AppSelect } from '@/components/ui/admin/select';
import { categories } from '@/lib/cashflow';
import type { ExpenseType } from '@/lib/expenses';
import { createExpenseType } from './actions';
export function ExpenseTypeSelector({types,value,onChange,onCreated,disabled}:{types:ExpenseType[];value:string;onChange:(id:string)=>void;onCreated:(type:ExpenseType)=>void;disabled:boolean}) {
 const id=useId();const [creating,setCreating]=useState(false);const [name,setName]=useState('');const [category,setCategory]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const lock=useRef(false);
 async function create(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const result=await createExpenseType(name,category);if(result.type){onCreated(result.type);onChange(result.type.id);setCreating(false);}else setError(result.error||'Jenis belum dapat disimpan.');}catch{setError('Jenis belum dapat disimpan. Coba lagi.');}finally{setBusy(false);lock.current=false;}}
 return <div className="expense-selector"><label htmlFor={id}>Jenis Pengeluaran</label><AppCombobox id={id} label="Jenis Pengeluaran" options={types.map(type=>({value:type.id,label:type.name}))} value={value} onValueChange={onChange} disabled={disabled||busy} placeholder="Cari atau pilih jenis pengeluaran" createLabel="Tambah Jenis Pengeluaran" onCreate={query=>{setName(query);setCategory('');setError('');setCreating(true);}}/>
 {creating&&<div className="expense-create"><p className="font-semibold text-sm">Tambah Jenis Pengeluaran</p><label>Nama jenis<AppInput value={name} maxLength={60} disabled={disabled||busy} onChange={event=>setName(event.target.value)} error={!!error} aria-describedby={error?`${id}-error`:undefined}/></label><div><label htmlFor={`${id}-category`}>Kategori utama</label><AppSelect id={`${id}-category`} aria-label="Kategori utama" value={category} disabled={disabled||busy} onValueChange={setCategory} placeholder="Pilih kategori utama" options={Object.entries(categories.expense).map(([value,label])=>({value,label}))}/></div>{error&&<p id={`${id}-error`} role="alert">{error}</p>}<div className="flex gap-2 mt-3"><Button variant="secondary" disabled={disabled||busy} onClick={()=>setCreating(false)}>Batal</Button><Button disabled={disabled||busy||!name.trim()||!category} onClick={()=>startTransition(()=>void create())}>{busy?'Menyimpan…':'Simpan Jenis'}</Button></div></div>}
 </div>;
}
