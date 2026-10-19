'use client';
import {useEffect,useRef,useState} from 'react';
import {BackendError,createBackendClient,type BackendTrip} from '../backend-client';
import type {TripReviewInput} from '../../lib/trip-review-service';
import ValidatedForm from './validated-form';
const api=createBackendClient();
export default function TripReview({trip,vehicleId,viewerId,busy,onSaved,onPending}:{trip:BackendTrip;vehicleId:string;viewerId:string;busy:boolean;onSaved:()=>Promise<void>;onPending:(value:boolean)=>void}){
 const [pending,setPending]=useState<TripReviewInput|null>(null),[sending,setSending]=useState(false),[stale,setStale]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');const alive=useRef(true),lock=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 async function send(input:TripReviewInput){
  if(lock.current)return;lock.current=true;setSending(true);setError('');setNotice('');
  try{
   const receipt=await api.reviewTrip(vehicleId,trip.id,input,viewerId);if(!alive.current)return;
   if(receipt.tripId!==trip.id||receipt.viewerId!==viewerId||receipt.requestId!==input.requestId||receipt.revision!==input.expectedRevision+1||receipt.status!=='final'||receipt.needsReview!==false)throw new BackendError(502,'Geen passende controlebevestiging ontvangen.');
   setPending(null);onPending(false);setStale(true);setNotice('Controle vastgelegd. De actuele gegevens worden vernieuwd. Dit is geen fiscale goedkeuring.');
   try{await onSaved();}catch{if(alive.current)setError('Controle is vastgelegd; vernieuw de actuele gegevens.');}
  }catch(e){
   if(!alive.current)return;setError(e instanceof Error?e.message:'Controle niet opgeslagen.');
   if(e instanceof BackendError&&[401,403,404,409].includes(e.status)){setPending(null);onPending(false);setStale(true);if(e.status!==409)void onSaved().catch(()=>{});}
  }finally{lock.current=false;if(alive.current)setSending(false);}
 }
 if(trip.status==='final'&&trip.needs_review===0)return null;
 const disabled=busy||sending||pending!==null||stale;
 return <section aria-label="Logboekrit controleren"><h3>Controle afronden</h3><p>Controleer eerst ritsoort, bestuurder, tijden, adressen en afstand. Ontbrekende optionele gegevens blijven in rapporten gemarkeerd. Een latere correctie maakt deze controle ongeldig.</p>{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  <ValidatedForm onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget),input:TripReviewInput={requestId:crypto.randomUUID(),expectedRevision:trip.revision,confirmed:true,reason:String(data.get('reason'))};setPending(input);onPending(true);void send(input);}}><label>Reden ritcontrole<input name="reason" required maxLength={500} disabled={disabled}/></label><label><input name="confirmed" type="checkbox" required disabled={disabled}/>Ik heb deze logboekrit gecontroleerd</label><button disabled={disabled||!viewerId}>Ritcontrole afronden</button></ValidatedForm>
  {pending&&<><p>Bevestiging ontbreekt. De server kan de controle al hebben opgeslagen. Alleen dit tabblad bewaart dezelfde aanvraag; herladen/accountwissel kan dit herstel verliezen. Er wordt niet automatisch opnieuw verstuurd.</p><button disabled={busy||sending} onClick={()=>void send(pending)}>Dezelfde ritcontrole opnieuw proberen</button><button disabled={busy||sending} onClick={()=>{if(window.confirm('Alleen de lokale controleaanvraag loslaten? Een centraal vastgelegde controle blijft bestaan.')){setPending(null);onPending(false);setStale(true);void onSaved().catch(()=>setError('Vernieuw de actuele gegevens.'));}}}>Controleaanvraag loslaten</button></>}
  {stale&&!pending&&<button disabled={busy||sending} onClick={()=>void onSaved().catch(()=>setError('Vernieuwen mislukt.'))}>Actuele ritcontrole laden</button>}
 </section>;
}
