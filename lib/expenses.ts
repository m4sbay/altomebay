import { validDate, type CashTransaction, type TransactionCategory } from './cashflow';
export interface ExpenseType { id: string; name: string; category: TransactionCategory }
export interface ExpenseBatchInput { id: string; transactionDate: string; note: string; items: {typeId:string; amount:number}[] }
export const defaultExpenseTypes: ExpenseType[] = [
 {id:'cigarettes',name:'Belanja Rokok',category:'stock_purchase'},
 {id:'aice',name:'Belanja Es Krim AICE',category:'stock_purchase'},
 {id:'snacks',name:'Belanja Jajan',category:'stock_purchase'},
 {id:'equipment',name:'Belanja Perabot',category:'operational'},
 {id:'other',name:'Belanja Lainnya',category:'other_expense'},
];
export function expenseName(value: unknown) {
 if(typeof value!=='string' || !value.trim() || value.trim().length>60) throw Error('Nama jenis wajib diisi, maksimal 60 karakter.');
 return value.trim();
}
export function validateExpenseBatch(value: unknown): ExpenseBatchInput {
 if(!value || typeof value!=='object')throw Error('Data pengeluaran tidak valid.');
 const v=value as ExpenseBatchInput;
 if(typeof v.id!=='string'||!/^[\w-]{16,80}$/.test(v.id))throw Error('ID pencatatan tidak valid.');
 if(!validDate(v.transactionDate))throw Error('Pilih tanggal yang valid, maksimal hari ini.');
 if(typeof v.note!=='string'||v.note.length>200)throw Error('Catatan maksimal 200 karakter.');
 if(!Array.isArray(v.items)||!v.items.length||v.items.length>100)throw Error('Isi 1–100 item pengeluaran.');
 const items=v.items.map(item=>validateExpenseItem(item?.typeId,item?.amount));
 return {id:v.id,transactionDate:v.transactionDate,note:v.note.trim(),items};
}
export function validateExpenseItem(typeId: unknown, amount: unknown) {
 if(typeof typeId!=='string'||!typeId)throw Error('Pilih jenis setiap pengeluaran.');
 if(typeof amount!=='number'||!Number.isSafeInteger(amount)||amount<=0||amount>1_000_000_000_000)throw Error('Nominal harus berupa Rupiah bulat, lebih dari nol, maksimal Rp1 triliun.');
 return {typeId,amount};
}
export function groupHistory(rows: CashTransaction[]) {
 const groups: {id:string; rows:CashTransaction[]; amount:number}[]=[];
 const batches=new Map<string,typeof groups[number]>();
 for(const row of rows){
  const existing=row.batchId && batches.get(row.batchId);
  if(existing){existing.rows.push(row);existing.amount+=row.amount;}
  else {const group={id:row.batchId||row.id,rows:[row],amount:row.amount};groups.push(group);if(row.batchId)batches.set(row.batchId,group);}
 }
 return groups;
}
