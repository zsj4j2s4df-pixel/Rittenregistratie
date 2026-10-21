'use client';
import { useRef, useState } from 'react';
import type { VehicleSettings, StoredAddress } from '../../lib/settings-service';
import type { MileageRate } from '../report-domain';
import { parseRateMicros, replaceSetting } from './settings-manager-domain';

export function SettingsManager({settings,busy,onSave}:{settings:VehicleSettings;busy:boolean;onSave:(next:VehicleSettings,reason:string)=>Promise<void>}){
 const [address,setAddress]=useState<StoredAddress>({id:'',label:'',address:'',enabled:true,note:''});
 const [rate,setRate]=useState({id:'',from:'',until:'',amount:''});
 const [reason,setReason]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[saving,setSaving]=useState(false);
 const inFlight=useRef(false), addressId=useRef(''),rateId=useRef('');
 const locked=busy||saving;
 async function save(make:()=>VehicleSettings,done?:()=>void){
  if(busy||inFlight.current)return;
  inFlight.current=true;setSaving(true);setError('');setNotice('');
  try{
   if(!reason.trim()||reason.length>500)throw Error('Geef een wijzigingsreden van maximaal 500 tekens.');
   await onSave(make(),reason.trim());done?.();setReason('');setNotice('Instellingen centraal opgeslagen. Bestaande rapporten blijven ongewijzigd.');
  }catch(e){setError(e instanceof Error?e.message:'Opslag mislukt. Je invoer blijft behouden.');}
  finally{inFlight.current=false;setSaving(false);}
 }
 function editRate(value:MileageRate){rateId.current=value.id;setRate({id:value.id,from:value.validFrom,until:value.validUntil??'',amount:String(value.microsPerKm/1_000_000)});}
 function resetAddress(){addressId.current='';setAddress({id:'',label:'',address:'',enabled:true,note:''});}
 function resetRate(){rateId.current='';setRate({id:'',from:'',until:'',amount:''});}
 return <section className="panel"><h2>Centrale adressen en tariefperioden</h2>
  <p>Een voorkeursadres classificeert geen rit automatisch. Vul alleen een bekend tarief in; er is geen standaard fiscaal tarief. Tarief-einddatums tellen mee.</p>
  <p>{settings.addresses.length+settings.rates.length} van maximaal 40 adressen en tariefperioden samen.</p>
  <label>Reden adres- of tariefwijziging<input value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} required disabled={locked}/></label>
  {error&&<p role="alert">{error} Controleer na een verbindingsfout eerst de opgeslagen instellingen; probeer daarna met dezelfde invoer opnieuw.</p>}
  {notice&&<p role="status">{notice}</p>}
  {(['business','private'] as const).map(kind=><section key={kind} aria-label={kind==='business'?'Zakelijke locaties':'Privélocaties'}>
   <h3>{kind==='business'?'Zakelijke locaties':'Privélocaties'}</h3>
   <button type="button" disabled={locked} onClick={()=>{addressId.current='';setAddress({id:'',label:'',address:'',enabled:true,note:'',kind});document.getElementById('central-address-label')?.focus();}}>+ {kind==='business'?'Zakelijke locatie':'Privélocatie'} toevoegen</button>
   {!settings.addresses.some(a=>(a.kind??'business')===kind)&&<p>Nog geen locaties van deze soort.</p>}
   {settings.addresses.filter(a=>(a.kind??'business')===kind).map(a=><div className="setting-card" key={a.id}><div><strong>{a.label}</strong><p>{a.address} · {a.enabled?'Actief':'Uitgeschakeld'}{a.businessRole==='customer'?' · Klant':a.businessRole==='supplier'?' · Leverancier':''}</p><p>{a.note}</p></div>
    <button disabled={locked} onClick={()=>{addressId.current=a.id;setAddress({...a});}}>Adres bewerken</button>
    <button disabled={locked} onClick={()=>save(()=>replaceSetting(settings,'address',{...a,enabled:!a.enabled}))}>{a.enabled?'Adres uitschakelen':'Adres inschakelen'}</button>
    <button disabled={locked} onClick={()=>{if(window.confirm(`Voorkeursadres “${a.label}” verwijderen? Bestaande ritten en rapporten blijven behouden.`))void save(()=>({...settings,addresses:settings.addresses.filter(v=>v.id!==a.id)}),()=>{if(address.id===a.id)resetAddress();});}}>Adres verwijderen</button>
   </div>)}
  </section>)}
  <form className="editor-grid" onSubmit={e=>{e.preventDefault();void save(()=>{addressId.current ||=crypto.randomUUID();return replaceSetting(settings,'address',{...address,id:address.id||addressId.current});},resetAddress);}}>
   <label>Soort locatie<select aria-label="Soort locatie" disabled={locked} value={address.kind??'business'} onChange={e=>setAddress({...address,kind:e.target.value as 'business'|'private',businessRole:undefined})}><option value="business">Zakelijk</option><option value="private">Privé</option></select></label>
   {(address.kind??'business')==='business'&&<label>Zakelijke relatie<select aria-label="Zakelijke relatie" disabled={locked} value={address.businessRole??''} onChange={e=>setAddress({...address,businessRole:e.target.value?e.target.value as 'customer'|'supplier':undefined})}><option value="">Overig / niet gekozen</option><option value="customer">Klant</option><option value="supplier">Leverancier</option></select></label>}
   <label>Naam voorkeursadres<input id="central-address-label" required maxLength={100} value={address.label} disabled={locked} onChange={e=>setAddress({...address,label:e.target.value})}/></label>
   <label>Voorkeursadres<input required maxLength={450} value={address.address} disabled={locked} onChange={e=>setAddress({...address,address:e.target.value})}/></label>
   <label>Adresnotitie<textarea maxLength={1000} value={address.note} disabled={locked} onChange={e=>setAddress({...address,note:e.target.value})}/></label>
   <label><input type="checkbox" checked={address.enabled} disabled={locked} onChange={e=>setAddress({...address,enabled:e.target.checked})}/>Adres actief</label>
   <button disabled={locked}>{address.id?'Adreswijziging opslaan':'Voorkeursadres toevoegen'}</button><button type="button" disabled={locked} onClick={resetAddress}>Adresinvoer wissen</button>
  </form>
  <h3>Kilometervergoeding</h3>
  {!settings.rates.length&&<p>Geen tarief ingesteld. Vergoeding blijft onbekend als een geldig tarief ontbreekt.</p>}
  {settings.rates.map(r=><div className="setting-card" key={r.id}><p>€ {r.microsPerKm/1_000_000}/km · {r.validFrom} t/m {r.validUntil??'onbepaald'}</p>
   <button disabled={locked} onClick={()=>editRate(r)}>Tarief bewerken</button><button disabled={locked} onClick={()=>{if(window.confirm('Deze tariefperiode verwijderen? Nieuwe rapporten kunnen daardoor geen vergoeding berekenen; bestaande rapporten blijven behouden.'))void save(()=>({...settings,rates:settings.rates.filter(v=>v.id!==r.id)}),()=>{if(rate.id===r.id)resetRate();});}}>Tarief verwijderen</button>
  </div>)}
  <form className="editor-grid" onSubmit={e=>{e.preventDefault();void save(()=>{rateId.current ||=crypto.randomUUID();return replaceSetting(settings,'rate',{id:rate.id||rateId.current,validFrom:rate.from,...(rate.until?{validUntil:rate.until}:{}),microsPerKm:parseRateMicros(rate.amount)});},resetRate);}}>
   <label>Tarief vanaf<input type="date" required value={rate.from} disabled={locked} onChange={e=>setRate({...rate,from:e.target.value})}/></label>
   <label>Tarief tot en met (optioneel)<input type="date" value={rate.until} disabled={locked} onChange={e=>setRate({...rate,until:e.target.value})}/></label>
   <label>Bedrag euro per kilometer<input required inputMode="decimal" maxLength={32} value={rate.amount} disabled={locked} onChange={e=>setRate({...rate,amount:e.target.value})}/></label>
   <button disabled={locked}>{rate.id?'Tariefwijziging opslaan':'Tarief toevoegen'}</button><button type="button" disabled={locked} onClick={resetRate}>Tariefinvoer wissen</button>
  </form>
 </section>;
}
