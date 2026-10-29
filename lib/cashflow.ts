export const categories = {
 income: { sales: "Penjualan Harian", other_income: "Pemasukan Lainnya" },
 expense: { stock_purchase: "Belanja Stok", operational: "Operasional", transport: "Transportasi", other_expense: "Pengeluaran Lainnya" },
} as const;
export type TransactionType = keyof typeof categories;
export type TransactionCategory = keyof typeof categories.income | keyof typeof categories.expense;
export interface CashTransaction {
 expenseTypeId?: string; expenseTypeName?: string; batchId?: string; batchNote?: string;
 id: string; type: TransactionType; amount: number; category: TransactionCategory;
 description: string | null; transactionDate: string; createdAt: string; updatedAt: string;
}
export type TransactionInput = Omit<CashTransaction, "id" | "createdAt" | "updatedAt">;
export const rupiah = (amount: number) => `Rp${new Intl.NumberFormat("id-ID").format(amount)}`;
export const todayJakarta = (now = new Date()) => new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
export const formatDate = (date: string) => new Intl.DateTimeFormat("id-ID", {dateStyle:"full",timeZone:"Asia/Jakarta"}).format(new Date(`${date}T12:00:00+07:00`));
export function validDate(value: unknown): value is string {
 return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value && value <= todayJakarta();
}
export function validateTransaction(value: unknown): TransactionInput {
 if (!value || typeof value !== "object") throw new Error("Data transaksi tidak valid.");
 const v = value as Record<string, unknown>;
 if (v.type !== "income" && v.type !== "expense") throw new Error("Pilih tipe transaksi.");
 if (typeof v.category !== "string" || !Object.hasOwn(categories[v.type], v.category)) throw new Error("Pilih kategori sesuai tipe transaksi.");
 if (typeof v.amount !== "number" || !Number.isSafeInteger(v.amount) || v.amount <= 0 || v.amount > 1_000_000_000_000) throw new Error("Nominal harus berupa Rupiah bulat, lebih dari nol, maksimal Rp1 triliun.");
 if (!validDate(v.transactionDate)) throw new Error("Pilih tanggal yang valid, maksimal hari ini.");
 if (v.description !== null && typeof v.description !== "string") throw new Error("Keterangan tidak valid.");
 if (typeof v.description === "string" && v.description.length > 200) throw new Error("Keterangan maksimal 200 karakter.");
 if (v.type === "expense" && (typeof v.description !== "string" || !v.description.trim())) throw new Error("Detail pengeluaran wajib diisi.");
 return {type:v.type,amount:v.amount,category:v.category as TransactionCategory,description:typeof v.description === "string" ? v.description.trim() || null : null,transactionDate:v.transactionDate};
}
export function summarize(rows: CashTransaction[]) {
 const income = rows.filter(r=>r.type === "income").reduce((n,r)=>n+r.amount,0);
 const expense = rows.filter(r=>r.type === "expense").reduce((n,r)=>n+r.amount,0);
 return {income,expense,difference:income-expense};
}
export const categoryLabel = (row: Pick<CashTransaction,"type"|"category">) => (categories[row.type] as Record<string,string>)[row.category];

export interface Period { start: string; end: string }
export type PeriodPreset = "today" | "month" | "previous" | "week";
export function presetPeriod(preset: PeriodPreset, today = todayJakarta()): Period {
 if (preset === "today") return {start:today,end:today};
 const date = new Date(`${today}T12:00:00Z`);
 if (preset === "week") { date.setUTCDate(date.getUTCDate() - 6); return {start:date.toISOString().slice(0,10),end:today}; }
 if (preset === "previous") {
  date.setUTCDate(0);
  const end=date.toISOString().slice(0,10);
  return {start:`${end.slice(0,7)}-01`,end};
 }
 return {start:`${today.slice(0,7)}-01`,end:today};
}
export function matchingPreset(period: Period, today: string): PeriodPreset | null {
 // Month wins the first-of-month tie so the default remains Bulan Ini.
 return (["month","today","previous","week"] as PeriodPreset[]).find(key=>{
  const value=presetPeriod(key,today);return value.start===period.start&&value.end===period.end;
 })??null;
}
export function validatePeriod(start: unknown, end: unknown): Period {
 if (!validDate(start) || !validDate(end)) throw new Error("Pilih tanggal yang valid, maksimal hari ini.");
 if (end < start) throw new Error("Tanggal akhir tidak boleh sebelum tanggal mulai.");
 return {start,end};
}
export interface TrendPoint { date: string; income: number; expense: number }
export function cashflowTrend(rows: CashTransaction[], period: Period) {
 const days=(Date.parse(period.end)-Date.parse(period.start))/86400000+1;
 const monthly=days>90;
 const points=new Map<string,TrendPoint>();
 const cursor=new Date(`${monthly ? period.start.slice(0,7)+"-01" : period.start}T12:00:00Z`);
 while(cursor.toISOString().slice(0,10)<=period.end) {
  const key=cursor.toISOString().slice(0,monthly?7:10);
  points.set(key,{date:key,income:0,expense:0});
  if(monthly)cursor.setUTCMonth(cursor.getUTCMonth()+1);else cursor.setUTCDate(cursor.getUTCDate()+1);
 }
 for(const row of rows) {const point=points.get(row.transactionDate.slice(0,monthly?7:10));if(point)point[row.type]+=row.amount;}
 return {granularity:monthly ? "monthly" as const : "daily" as const,points:[...points.values()]};
}
