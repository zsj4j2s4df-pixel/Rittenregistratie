'use client';
import {useRef} from 'react';
import type {StoredAddress} from '../../lib/settings-service';
// The form is keyed by authenticated viewer + vehicle by its parent. Explicit
// selection copies a text snapshot, never changes classification/GPS/distance.
export function KnownAddressField({name,label,addresses,disabled}:{name:string;label:string;addresses:StoredAddress[];disabled:boolean}){
 const input=useRef<HTMLInputElement>(null);
 return <div><label>{label}<input ref={input} name={name} maxLength={450} required disabled={disabled}/></label>
  <label>{label} uit centrale locaties<select aria-label={label+' uit centrale locaties'} value="" disabled={disabled} onChange={e=>{const selected=addresses.find(a=>a.id===e.target.value&&a.enabled);if(selected&&input.current)input.current.value=selected.address;}}>
   <option value="">Kies een actieve locatie…</option>
   {(['business','private'] as const).map(kind=><optgroup key={kind} label={kind==='business'?'Zakelijk':'Privé'}>{addresses.filter(a=>a.enabled&&(a.kind??'business')===kind).map(a=><option key={a.id} value={a.id}>{kind==='business'?'Zakelijk':'Privé'} · {a.label}{a.businessRole==='customer'?' · Klant':a.businessRole==='supplier'?' · Leverancier':''}</option>)}</optgroup>)}
  </select></label>
 </div>;
}
