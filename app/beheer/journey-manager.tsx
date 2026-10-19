'use client';
import {useEffect,useRef,useState} from 'react';
import {BackendError,createBackendClient} from '../backend-client';
import type {Journey,JourneyEvidence} from '../../lib/journey-service';
import type {JourneyChoiceInput} from '../../lib/journey-choice-service';
const api=createBackendClient();
type PendingChoice={journeyId:string;input:JourneyChoiceInput};
export default function JourneyManager({vehicleId,viewerId,busy}:{vehicleId:string;viewerId:string;busy:boolean}){
 const [rows,setRows]=useState<Journey[]>([]),[detail,setDetail]=useState<{journey:Journey;evidence:JourneyEvidence[]}|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[pending,setPending]=useState<PendingChoice|null>(null);
 const alive=useRef(true),sending=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const time=(n:number|null)=>n===null?'Nog geen eindanker':new Date(n*1000).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'});
 function fail(e:unknown){if(!alive.current)return;setError(e instanceof Error?e.message:'Aanvraag mislukt.');if(e instanceof BackendError&&[401,403,404,409].includes(e.status)){setRows([]);setDetail(null);setPending(null);}}
 async function load(){setLoading(true);setError('');setNotice('');setRows([]);setDetail(null);try{const data=await api.journeys(vehicleId);if(alive.current)setRows(data);}catch(e){fail(e);}finally{if(alive.current)setLoading(false);}}
 async function show(id:string){setLoading(true);setError('');setDetail(null);try{const data=await api.journey(vehicleId,id);if(alive.current)setDetail(data);}catch(e){if(alive.current)setRows([]);fail(e);}finally{if(alive.current)setLoading(false);}}
 async function sendChoice(action:PendingChoice){
  if(sending.current||!viewerId)return;sending.current=true;setLoading(true);setError('');setNotice('');
  try{
   const receipt=await api.chooseJourney(vehicleId,action.journeyId,action.input,viewerId);
   if(!alive.current)return;
   if(receipt.journeyId!==action.journeyId||receipt.viewerId!==viewerId||receipt.requestId!==action.input.requestId||receipt.revision!==action.input.expectedRevision+1||receipt.classification!==action.input.classification)throw new BackendError(502,'Geen passende bevestiging ontvangen. Controleer de centrale registratie.');
   setPending(null);setNotice('Ritsoort centraal opgeslagen; de rit en bestuurder blijven te controleren.');
   // A verified receipt is final even if the subsequent read fails. Never invent
   // a new mutation or restore the acknowledged payload after a refresh failure.
   try{const next=await api.journey(vehicleId,action.journeyId);if(alive.current)setDetail(next);}catch(e){if(alive.current)setDetail(null);fail(e);}
  }catch(e){fail(e);}finally{sending.current=false;if(alive.current)setLoading(false);}
 }
 function choose(classification:'business'|'private'){
  if(!detail||pending||busy||loading||sending.current||!viewerId)return;
  const action={journeyId:detail.journey.id,input:{requestId:crypto.randomUUID(),expectedRevision:detail.journey.revision,classification,reason:'Expliciete ritsoortkeuze in de webinterface; ritbewijs blijft te controleren.'}};
  setPending(action);void sendChoice(action);
 }
 const disabled=busy||loading||pending!==null;
 return <section className="panel" aria-label="Centrale voertuigritcontrole">
  <h2>Centrale voertuigritcontrole</h2><p>Gedeelde coördinatie van aangeleverde ritbewijzen. Dit zijn te controleren voorstellen, nog geen definitieve ritten of rapportregels. Een verbonden telefoon bewijst niet wie rijdt.</p>
  <button disabled={disabled} onClick={()=>void load()}>Voertuigritvoorstellen laden</button>
  {loading&&<p role="status">Voorstellen verwerken…</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  <p>Maximaal de nieuwste 50 voorstellen. Eerdere gegevens blijven centraal bewaard.</p>
  <ul>{rows.map(row=><li key={row.id}>{time(row.started_at)} · {row.status==='review_open'?'Open, te controleren':'Gesloten, te controleren'} <button disabled={disabled} onClick={()=>void show(row.id)}>Bewijs bekijken</button></li>)}</ul>
  {detail&&<div><h3>Ritbewijs — te controleren</h3><p>{time(detail.journey.started_at)} → {time(detail.journey.ended_at)}. Revisie {detail.journey.revision}. Bestuurder is niet vastgesteld. Gekozen ritsoort: {detail.journey.classification==='business'?'Zakelijk':detail.journey.classification==='private'?'Privé':'Nog niet gekozen'}; blijft te controleren.</p>
   <div><button disabled={disabled||!viewerId} onClick={()=>choose('business')}>Zakelijk kiezen</button> <button disabled={disabled||!viewerId} onClick={()=>choose('private')}>Privé kiezen</button></div>
   <p>Je kiest alleen de ritsoort. Dit stelt de bestuurder, gereden afstand of fiscale goedkeuring niet vast.</p>
   <ul>{detail.evidence.map(e=><li key={e.observation_id}>{time(e.observed_at)} · {e.source} · {e.event_kind} · ongeverifieerde bronclaim</li>)}</ul><p>Geen GPS-route, kilometerafstand of fiscale goedkeuring afgeleid. Bewijs van meerdere telefoons blijft afzonderlijk zichtbaar.</p></div>}
  {pending&&<div><p>Keuze {pending.input.classification==='business'?'Zakelijk':'Privé'} wacht op bevestiging. De server kan deze al hebben opgeslagen. Alleen dit tabblad bewaart dezelfde aanvraag; sluiten, herladen of wisselen van voertuig/account kan dit herstel verliezen. Er wordt nooit automatisch opnieuw verstuurd.</p>
   <button disabled={busy||loading} onClick={()=>void sendChoice(pending)}>Dezelfde keuze opnieuw proberen</button>
   <button disabled={busy||loading} onClick={()=>{if(window.confirm('Dit verwijdert alleen de aanvraag in dit tabblad. Een centraal opgeslagen keuze wordt niet teruggedraaid. Controleer daarna het centrale ritbewijs.')){setPending(null);setDetail(null);setRows([]);setError('');setNotice('Lokale aanvraag losgelaten. Laad het centrale ritbewijs opnieuw vóór een volgende keuze.');}}}>Keuzeaanvraag loslaten</button></div>}
 </section>;
}
