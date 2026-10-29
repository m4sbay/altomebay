"use client";
import { Pencil, Trash2 } from 'lucide-react';
import { AppDropdownMenu } from '@/components/ui/admin/dropdown-menu';
import { categoryLabel, rupiah, type CashTransaction } from '@/lib/cashflow';
import { shortDate } from './period-filter';
export function TransactionActions({row,onEdit,onDelete}:{row:CashTransaction;onEdit:(row:CashTransaction)=>void;onDelete:(row:CashTransaction)=>void}) {
 const item=!!row.batchId;
 const context=`${row.expenseTypeName||row.description||categoryLabel(row)}, ${shortDate(row.transactionDate)}, ${rupiah(row.amount)}`;
 return <AppDropdownMenu label={`Aksi ${item?'item':'transaksi'}: ${context}`} items={[
  {id:'edit',label:item?'Edit Item':'Edit Transaksi',icon:<Pencil size={16} aria-hidden="true"/>,onSelect:()=>onEdit(row)},
  {id:'delete',label:item?'Hapus Item':'Hapus Transaksi',icon:<Trash2 size={16} aria-hidden="true"/>,destructive:true,onSelect:()=>onDelete(row)},
 ]}/>;
}
