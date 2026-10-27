"use client";
import {buildWhatsAppLink} from "@/lib/links";
import {useEffect,useRef,useState} from "react";
import {Menu,X,ArrowUpRight} from "lucide-react";
import {AnnouncementBar} from "@/components/layout/AnnouncementBar";
import {navigation} from "@/lib/navigation";
export function Nav(){
 const [open,setOpen]=useState(false); const trigger=useRef<HTMLButtonElement>(null);const panel=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
 const close=()=>{setOpen(false);trigger.current?.focus();};
 const key=(e:KeyboardEvent)=>{if(e.key==="Escape")close();if(e.key==="Tab"){const items=[trigger.current,...Array.from(panel.current?.querySelectorAll<HTMLAnchorElement>('a')??[])].filter(Boolean) as HTMLElement[];const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
 const media=window.matchMedia('(min-width: 900px)');const resize=()=>{if(media.matches)close();};window.addEventListener('keydown',key);media.addEventListener('change',resize);
 return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',key);media.removeEventListener('change',resize);};},[open]);
 const close=()=>{setOpen(false);trigger.current?.focus();};
 return <><AnnouncementBar/><header className="site-header sticky top-0 [z-index:60] [background:#fffffff2] [backdrop-filter:blur(16px)] [border-bottom:1px_solid_var(--color-border)]"><div className="container [width:min(var(--container-page),calc(100%_-_var(--page-gutter)_*_2))] mx-auto nav-inner flex items-center justify-between gap-7 [padding-block:.75rem] flex-wrap"><a className="wordmark" href="#beranda" aria-label="Altomebay, beranda">alto<span>mebay</span><i/></a><nav aria-label="Navigasi utama" className="desktop-nav flex-wrap">{navigation.map(item=><a key={item.href} href={item.href}>{item.label}</a>)}</nav><a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="nav-contact"><span className="button-label inline-flex items-center justify-center [padding-inline:var(--control-label-padding)] min-w-0">Hubungi toko</span><ArrowUpRight size={20}/></a><button ref={trigger} className="menu-toggle [background:transparent] [border:0] [min-width:var(--touch-target)] [min-height:var(--touch-target)] items-center justify-center" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open?"Tutup menu":"Buka menu"} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div>{open&&<div className="mobile-menu" id="mobile-navigation" ref={panel}><nav aria-label="Navigasi ponsel">{navigation.map((item,i)=><a href={item.href} key={item.href} onClick={close}><span>0{i+1}</span>{item.label}<ArrowUpRight size={20}/></a>)}<a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" onClick={close}><span>05</span>Hubungi toko<ArrowUpRight size={20}/></a></nav><p>Kebutuhan harian, dekat di hati.</p></div>}</header></>;
}
