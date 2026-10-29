"use client";
import { Fragment, useRef, useState, type ReactNode } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { AppIconButton } from './controls';
export interface AppMenuItem {id:string;label:string;icon?:ReactNode;destructive?:boolean;disabled?:boolean;onSelect:()=>void}
export function AppDropdownMenu({label,items,disabled}:{label:string;items:AppMenuItem[];disabled?:boolean}) {
 const trigger=useRef<HTMLButtonElement>(null);const selecting=useRef(false);
 const [container,setContainer]=useState<HTMLElement|null>(null);
 return <DropdownMenu.Root modal={false} onOpenChange={open=>{if(open)setContainer(trigger.current?.closest('dialog')??null);}}><DropdownMenu.Trigger asChild><AppIconButton ref={trigger} label={label} disabled={disabled}><MoreHorizontal size={18} aria-hidden="true"/></AppIconButton></DropdownMenu.Trigger><DropdownMenu.Portal container={container}><DropdownMenu.Content aria-label={label} className="app-popup app-menu-popup" align="end" sideOffset={6} collisionPadding={12} data-lenis-prevent onEscapeKeyDown={event=>event.stopPropagation()} onCloseAutoFocus={event=>{if(selecting.current){event.preventDefault();selecting.current=false;}}}>{items.map((item,index)=><Fragment key={item.id}>{item.destructive&&index>0&&!items[index-1].destructive&&<DropdownMenu.Separator className="app-menu-separator"/>}<DropdownMenu.Item disabled={item.disabled} className={`app-option ${item.destructive?'app-destructive':''}`} onSelect={()=>{selecting.current=true;trigger.current?.focus();item.onSelect();}}>{item.icon}{item.label}</DropdownMenu.Item></Fragment>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>;
}
