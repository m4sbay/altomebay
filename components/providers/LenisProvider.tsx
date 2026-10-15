"use client";
import {useEffect,useState,type ReactNode} from "react";
import {ReactLenis} from "lenis/react";
export function LenisProvider({children}:{children:ReactNode}){
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setEnabled(!media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 if(!enabled)return <>{children}</>;
 return <ReactLenis root options={{lerp:0.12,smoothWheel:true,anchors:true}}>{children}</ReactLenis>;
}
export default LenisProvider;
