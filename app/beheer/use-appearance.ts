'use client';
import {useSyncExternalStore} from 'react';
const key='ritkompas.appearance.v1',event='ritkompas-appearance';
let fallback:'dark'|'sand'='dark';
function snapshot():'dark'|'sand'{try{const value=localStorage.getItem(key);return value==='Desert'?'sand':value==='Anthracite'?'dark':fallback;}catch{return fallback;}}
function subscribe(notify:()=>void){window.addEventListener('storage',notify);window.addEventListener(event,notify);return()=>{window.removeEventListener('storage',notify);window.removeEventListener(event,notify);};}
// Appearance is non-personal/device-local. Never store addresses, viewers or grants.
export function useAppearance(){
 const theme=useSyncExternalStore(subscribe,snapshot,()=>'dark' as const);
 function toggleTheme(){fallback=theme==='dark'?'sand':'dark';try{localStorage.setItem(key,fallback==='sand'?'Desert':'Anthracite');}catch{}window.dispatchEvent(new Event(event));}
 return {theme,toggleTheme};
}
