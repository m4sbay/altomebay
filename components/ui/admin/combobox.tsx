"use client";
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, Search } from 'lucide-react';
import { AppInput } from './controls';
import type { SelectOption } from './select';
type Props={options:SelectOption[];label:string;value?:string;defaultValue?:string;onValueChange?:(value:string)=>void;onCreate?:(query:string)=>void;placeholder?:string;createLabel?:string;disabled?:boolean;loading?:boolean;error?:boolean;id?:string;'aria-describedby'?:string};
export function AppCombobox({options,label,value,defaultValue='',onValueChange,onCreate,placeholder='Cari atau pilih',createLabel='Tambah pilihan baru',disabled,loading,error,id,'aria-describedby':describedBy}:Props) {
 const generated=useId();const listId=`${generated}-list`;
 const trigger=useRef<HTMLButtonElement>(null);const search=useRef<HTMLInputElement>(null);
 const [container,setContainer]=useState<HTMLElement|null>(null);const [open,setOpen]=useState(false);
 const [internal,setInternal]=useState(defaultValue);const [query,setQuery]=useState('');const [active,setActive]=useState(0);
 const selected=options.find(option=>option.value===(value??internal));
 const normalized=query.trim().toLocaleLowerCase('id-ID');
 const matches=options.filter(option=>option.label.toLocaleLowerCase('id-ID').includes(normalized)&&!option.disabled);
 const canCreate=!!onCreate&&!options.some(option=>option.label.toLocaleLowerCase('id-ID')===normalized);
 const count=matches.length+Number(canCreate);
 function choose(index:number){
  if(index<matches.length){const next=matches[index].value;if(value===undefined)setInternal(next);onValueChange?.(next);setOpen(false);}
  else if(canCreate){setOpen(false);onCreate?.(query.trim());}
 }
 function navigate(event:KeyboardEvent<HTMLInputElement>){
  if(event.key==='ArrowDown'||event.key==='ArrowUp'||event.key==='Home'||event.key==='End'){
   event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?count-1:Math.max(0,Math.min(count-1,active+(event.key==='ArrowDown'?1:-1)));setActive(next);
   document.getElementById(`${generated}-option-${next}`)?.scrollIntoView({block:'nearest'});
  }
  if(event.key==='Enter'){event.preventDefault();if(count)choose(active);}
 }
 return <Popover.Root open={open} onOpenChange={next=>{if(next){setContainer(trigger.current?.closest('dialog')??null);setQuery('');setActive(0);}setOpen(next);}}><Popover.Trigger asChild><button ref={trigger} id={id} type="button" role="combobox" aria-label={label} aria-controls={listId} aria-expanded={open} aria-haspopup="listbox" aria-describedby={describedBy} aria-invalid={error||undefined} aria-busy={loading||undefined} disabled={disabled||loading} className="app-control app-select" data-placeholder={!selected||undefined}><span>{loading?'Memuat…':selected?.label||placeholder}</span><ChevronDown size={16} aria-hidden="true"/></button></Popover.Trigger><Popover.Portal container={container}><Popover.Content className="app-popup app-combobox-popup" align="start" sideOffset={6} collisionPadding={12} data-lenis-prevent onEscapeKeyDown={event=>event.stopPropagation()} onOpenAutoFocus={event=>{event.preventDefault();search.current?.focus();}}><div className="app-combobox-search"><Search size={16} aria-hidden="true"/><AppInput ref={search} role="combobox" aria-label={`Cari ${label.toLowerCase()}`} aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={count?`${generated}-option-${active}`:undefined} value={query} placeholder="Ketik untuk mencari…" onChange={event=>{setQuery(event.target.value);setActive(0);}} onKeyDown={navigate}/></div><div id={listId} role="listbox" aria-label={label} className="app-combobox-options">{matches.map((option,index)=><button key={option.value} id={`${generated}-option-${index}`} type="button" role="option" aria-selected={option.value===(value??internal)} data-highlighted={active===index||undefined} tabIndex={-1} className="app-option" onPointerMove={()=>setActive(index)} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(index)}><span>{option.label}</span>{option.value===(value??internal)&&<Check size={16} aria-hidden="true"/>}</button>)}{canCreate&&<button id={`${generated}-option-${matches.length}`} type="button" role="option" aria-selected="false" data-highlighted={active===matches.length||undefined} tabIndex={-1} className="app-option" onMouseDown={event=>event.preventDefault()} onClick={()=>choose(matches.length)}>+ {query.trim()?`Tambah “${query.trim()}”`:createLabel}</button>}{!count&&<p className="app-empty-options">Tidak ada pilihan yang sesuai.</p>}</div></Popover.Content></Popover.Portal></Popover.Root>;
}
