'use client';
import {useEffect,useRef,useState} from 'react';
import {BackendError,createBackendClient,type Driver} from '../backend-client';
import type {Journey} from '../../lib/journey-service';
import type {MaterializationInput} from '../../lib/journey-materialization';
import ValidatedForm from './validated-form';
const api=createBackendClient();
export default function JourneyMaterialization({journey,vehicleId,viewerId,drivers,busy,onSaved,onDenied,onPending}:{journey:Journey;vehicleId:string;viewerId:string;drivers:Driver[];busy:boolean;onSaved:()=>Promise<void>;onDenied:(message:string)=>void;onPending:(value:boolean)=>void}){
 const [pending,setPending]=useState<MaterializationInput|null>(null),[sending,setSending]=useState(false),[stale,setStale]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');const alive=useRef(true),lock=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 async function send(input:MaterializationInput){
  if(lock.current)return;lock.current=true;setSending(true);setError('');setNotice('');
  try{
   const receipt=await api.materializeJourney(vehicleId,journey.id,input,viewerId);if(!alive.current)return;
   if(receipt.journeyId!==journey.id||receipt.viewerId!==viewerId||receipt.requestId!==input.requestId||receipt.revision!==input.expectedRevision+1||typeof receipt.tripId!=='string'||!receipt.tripId||receipt.tripId.length>128)throw new BackendError(502,'Geen passende bevestiging ontvangen; controleer centraal.');
   setPending(null);onPending(false);setStale(true);setNotice('Rit overgezet naar het logboek. Onbekende gegevens blijven te controleren.');
   // Never restore an acknowledged mutation when only the following read fails.
   try{await onSaved();}catch{if(alive.current)setError('Rit is opgeslagen; vernieuw het centrale ritbewijs en logboek.');}
  }catch(e){
   if(!alive.current)return;const message=e instanceof Error?e.message:'Overzetten is niet gelukt.';setError(message);
   if(e instanceof BackendError&&[401,403,404,409].includes(e.status)){setPending(null);onPending(false);setStale(true);if(e.status!==409)onDenied(message);}
  }finally{lock.current=false;if(alive.current)setSending(false);}
 }
 const disabled=busy||sending||pending!==null||stale;
 return <section aria-label="Rit naar logboek overzetten"><h4>Gecontroleerd naar het rittenlogboek</h4><p>Eenmalig overzetten van dit gesloten ritbewijs. Vul alleen bekende gegevens in. Dit bewijst geen GPS-route, bestuurder of fiscale goedkeuring.</p>
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  <ValidatedForm className="editor-grid" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget),text=(name:string)=>String(data.get(name)??'').trim()||null,number=(name:string)=>text(name)===null?null:Number(text(name));const input:MaterializationInput={requestId:crypto.randomUUID(),expectedRevision:journey.revision,reviewed:true,classification:String(data.get('classification')) as MaterializationInput['classification'],driverId:text('driver'),distanceKm:number('distance'),startAddress:text('from'),endAddress:text('to'),odometerStart:number('startOdo'),odometerEnd:number('endOdo'),purpose:text('purpose'),reason:String(data.get('reason'))};setPending(input);onPending(true);void send(input);}}>
   <label>Vertrekadres (optioneel)<input name="from" maxLength={450} disabled={disabled}/></label><label>Aankomstadres (optioneel)<input name="to" maxLength={450} disabled={disabled}/></label>
   <label>Afstand (km, optioneel)<input name="distance" type="number" min="0.001" step="0.001" disabled={disabled}/></label>
   <label>Ritsoort overzetting<select name="classification" defaultValue={journey.classification??'review'} disabled={disabled}><option value="review">Te controleren</option><option value="private">Privé</option><option value="business">Zakelijk</option></select></label>
   <label>Bestuurder overzetting<select name="driver" defaultValue="" disabled={disabled}><option value="">Onbekend</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
   <label>Beginstand (optioneel)<input name="startOdo" type="number" min="0" step="0.001" disabled={disabled}/></label><label>Eindstand (optioneel)<input name="endOdo" type="number" min="0" step="0.001" disabled={disabled}/></label>
   <label>Ritdoel (optioneel)<input name="purpose" maxLength={1000} disabled={disabled}/></label><label>Reden overzetting<input name="reason" required maxLength={500} disabled={disabled}/></label>
   <label><input type="checkbox" name="reviewed" required disabled={disabled}/>Ik heb dit ritbewijs en de gegevens gecontroleerd</label><button disabled={disabled||!viewerId}>Eenmalig naar logboek overzetten</button>
  </ValidatedForm>
  {pending&&<div><p>Bevestiging ontbreekt. De server kan de rit al hebben opgeslagen. Dezelfde aanvraag blijft alleen in dit tabblad; herladen, sluiten of account/voertuigwissel kan dit herstel verliezen.</p><button disabled={busy||sending} onClick={()=>void send(pending)}>Dezelfde overzetting opnieuw proberen</button><button disabled={busy||sending} onClick={()=>{if(window.confirm('Alleen de lokale aanvraag loslaten? Een opgeslagen logboekrit blijft bestaan. Controleer eerst centraal vóór een nieuwe poging.')){setPending(null);onPending(false);setStale(true);void onSaved().catch(()=>setError('Vernieuw het centrale ritbewijs en logboek.'));}}}>Overzetaanvraag loslaten</button></div>}
  {stale&&!pending&&<button disabled={busy||sending} onClick={()=>void onSaved().catch(()=>setError('Vernieuwen is niet gelukt.'))}>Ritbewijs en logboek vernieuwen</button>}
 </section>;
}
