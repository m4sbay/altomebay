"use client";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { id } from "react-day-picker/locale";
import { BUSINESS_TIME_ZONE, toCalendarDate, fromCalendarDate } from "@/lib/business-date";
import { presetPeriod, validatePeriod, type Period, type PeriodPreset } from "@/lib/cashflow";
import { Button } from "@/components/ui/Button";
export const shortDate=(day:string)=>new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"short",year:"numeric",timeZone:BUSINESS_TIME_ZONE}).format(toCalendarDate(day));
export function PeriodFilter({period,today,activePreset,onChange}:{period:Period;today:string;activePreset:PeriodPreset|null;onChange:(period:Period,preset?:PeriodPreset)=>void}) {
 const [open,setOpen]=useState(false);
 const [range,setRange]=useState<DateRange|undefined>({from:toCalendarDate(period.start),to:toCalendarDate(period.end)});
 const [error,setError]=useState("");
 return <div className="admin-period"><div className="admin-presets" aria-label="Periode keuangan">{([["today","Hari Ini"],["month","Bulan Ini"],["previous","Bulan Lalu"],["week","7 Hari Terakhir"]] as [PeriodPreset,string][]).map(([key,label])=>{const value=presetPeriod(key,today);return <button key={key} aria-pressed={activePreset===key} onClick={()=>onChange(value,key)}>{label}</button>;})}</div><Popover.Root open={open} onOpenChange={value=>{setOpen(value);if(value){setRange({from:toCalendarDate(period.start),to:toCalendarDate(period.end)});setError("");}}}><Popover.Trigger className="app-control admin-date-trigger"><CalendarDays size={18}/><span><span className="block text-xs text-ink-soft">Rentang Tanggal</span>{shortDate(period.start)} – {shortDate(period.end)}</span></Popover.Trigger><Popover.Portal><Popover.Content className="app-popup admin-calendar-popover" align="end" sideOffset={8} collisionPadding={12} aria-label="Pilih rentang tanggal"><DayPicker className="admin-calendar" mode="range" selected={range} onSelect={setRange} defaultMonth={range?.from} today={toCalendarDate(today)} endMonth={toCalendarDate(today)} disabled={{after:toCalendarDate(today)}} locale={id} timeZone={BUSINESS_TIME_ZONE} weekStartsOn={1} navLayout="around" autoFocus labels={{labelPrevious:()=>"Bulan sebelumnya",labelNext:()=>"Bulan berikutnya"}}/><p className="admin-calendar-note">Pilih tanggal mulai, lalu tanggal akhir · WIB</p>{error && <p role="alert">{error}</p>}<div className="admin-form-actions"><Button disabled={!range?.from || !range.to} onClick={()=>{try{const next=validatePeriod(fromCalendarDate(range!.from!),fromCalendarDate(range!.to!));onChange(next);setOpen(false);}catch(e){setError((e as Error).message);}}}>Terapkan</Button></div></Popover.Content></Popover.Portal></Popover.Root></div>;
}
