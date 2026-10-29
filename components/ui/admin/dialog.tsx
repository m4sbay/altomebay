"use client";
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { AppIconButton } from './controls';
export function AppDialog({title,onClose,children,wide=false,alert=false,descriptionId}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean;alert?:boolean;descriptionId?:string}) {
 const ref=useRef<HTMLDialogElement>(null);const id=useId();
 useEffect(()=>{const el=ref.current;const previous=document.activeElement as HTMLElement;el?.showModal();el?.querySelector<HTMLInputElement>('input:not([type=hidden]):not(:disabled),textarea:not(:disabled)')?.focus();return()=>{el?.close();if(previous?.isConnected)previous.focus();};},[]);
 return <dialog ref={ref} role={alert?'alertdialog':undefined} aria-labelledby={id} aria-describedby={descriptionId} className={`admin-dialog ${wide?'admin-dialog-wide':''}`} data-lenis-prevent onCancel={event=>{event.preventDefault();onClose();}}><div className="flex items-start justify-between gap-4"><h2 id={id}>{title}</h2><AppIconButton label="Tutup dialog" onClick={onClose}><X size={20} aria-hidden="true"/></AppIconButton></div>{children}</dialog>;
}
