"use client";
import {Navigation} from "lucide-react";
import {Button} from "./Button";
import {buildWhatsAppLink,buildMapsSearchUrl} from "@/lib/links";
import {trackEvent} from "@/lib/analytics";
export function ContactButton({kind="whatsapp",compact=false}:{kind?:"whatsapp"|"maps";compact?:boolean}) {
 const href=kind==="whatsapp"?buildWhatsAppLink():buildMapsSearchUrl();
 return <Button href={href} disabled={!href} external icon={kind==="maps"?"none":kind} variant={kind==="maps"?"secondary":"whatsapp"} onClick={()=>trackEvent(kind==="maps"?"maps_click":"whatsapp_click",{source:"landing"})}>{kind==="maps"&&<Navigation size={20} aria-hidden="true"/>}{href?(kind==="maps"?"Buka di Google Maps":"Chat WhatsApp"):(compact?(kind==="maps"?"Lokasi belum tersedia":"WA belum tersedia"):(kind==="maps"?"Tautan lokasi segera hadir":"WhatsApp segera tersedia"))}</Button>;
}
