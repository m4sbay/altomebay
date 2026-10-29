"use client";
import { useState, type ComponentProps, type ReactNode } from 'react';

export function AppInput({className='',error=false,...props}:ComponentProps<'input'>&{error?:boolean}) {
 return <input {...props} aria-invalid={error||props['aria-invalid']} className={`app-control ${className}`}/>;
}
export function AppTextarea({className='',error=false,...props}:ComponentProps<'textarea'>&{error?:boolean}) {
 return <textarea {...props} aria-invalid={error||props['aria-invalid']} className={`app-control app-textarea ${className}`}/>;
}
type CurrencyProps=Omit<ComponentProps<typeof AppInput>,'type'|'value'|'defaultValue'|'onChange'> & {
 value?:string;defaultValue?:string;onValueChange?:(formatted:string)=>void;
};
export function CurrencyInput({value,defaultValue='',onValueChange,...props}:CurrencyProps) {
 const [internal,setInternal]=useState(defaultValue);
 return <AppInput {...props} type="text" inputMode="numeric" placeholder={props.placeholder??'0'} maxLength={props.maxLength??22} value={value??internal} onChange={event=>{
  if(!/^[\d.]*$/.test(event.target.value))return;
  const digits=event.target.value.replaceAll('.','');
  const next=digits?new Intl.NumberFormat('id-ID').format(Number(digits)):'';
  if(value===undefined)setInternal(next);onValueChange?.(next);
 }}/>;
}
export function AppIconButton({label,children,className='',...props}:Omit<ComponentProps<'button'>,'aria-label'>&{label:string;children:ReactNode}) {
 return <button {...props} type={props.type??'button'} aria-label={label} title={props.title??label} className={`app-icon-button ${className}`}>{children}</button>;
}
