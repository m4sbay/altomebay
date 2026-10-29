"use client";
import { useRef, useState, type ComponentProps } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
export interface SelectOption {value:string;label:string;disabled?:boolean}
type Props=Omit<ComponentProps<typeof Select.Root>,'children'> & {
 options:SelectOption[];placeholder?:string;id?:string;'aria-label'?:string;'aria-labelledby'?:string;'aria-describedby'?:string;error?:boolean;loading?:boolean;className?:string;
};
export function AppSelect({options,placeholder='Pilih pilihan',id,error=false,loading=false,className='',onOpenChange,...props}:Props) {
 const trigger=useRef<HTMLButtonElement>(null);
 const [container,setContainer]=useState<HTMLElement|null>(null);
 return <Select.Root {...props} disabled={props.disabled||loading} onOpenChange={open=>{if(open)setContainer(trigger.current?.closest('dialog')??null);onOpenChange?.(open);}}>
 <Select.Trigger ref={trigger} id={id} className={`app-control app-select ${className}`} aria-label={props['aria-label']} aria-labelledby={props['aria-labelledby']} aria-describedby={props['aria-describedby']} aria-invalid={error||undefined} aria-busy={loading||undefined}>
 <Select.Value placeholder={loading?'Memuat…':placeholder}/><Select.Icon asChild><ChevronDown size={16} aria-hidden="true"/></Select.Icon>
 </Select.Trigger><Select.Portal container={container}><Select.Content position="popper" sideOffset={6} collisionPadding={12} className="app-popup app-select-popup" onEscapeKeyDown={event=>event.stopPropagation()} data-lenis-prevent><Select.Viewport>{options.map(option=><Select.Item key={option.value} value={option.value} disabled={option.disabled} className="app-option"><Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator className="app-option-check"><Check size={16} aria-hidden="true"/></Select.ItemIndicator></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal>
 </Select.Root>;
}
