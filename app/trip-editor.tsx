'use client';

import {useState} from 'react';
import {validateTrip, type Trip} from './trip-domain';

export function TripEditor({trip,onSave,onCancel,creating=false}:{trip:Trip;onSave:(trip:Trip,reason:string)=>void;onCancel:()=>void;creating?:boolean}) {
  const [draft,setDraft]=useState(trip);
  const [reason,setReason]=useState('');
  const [attempted,setAttempted]=useState(false);
  const issues=validateTrip(draft);
  const [start,end]=draft.time.split('–');
  const [from,to]=draft.route.split(' → ');
  const numeric=(value:string)=>value.trim()===''?undefined:Number(value);
  return <form className="trip-editor" onSubmit={event=>{event.preventDefault();setAttempted(true);if(!issues.some(i=>i.severity==='error') && reason.trim()) onSave(draft,reason);}}>
    <h3>{creating?'Handmatige voorbeeldrit toevoegen':'Voorbeeldrit corrigeren'}</h3><p>Gebruik alleen testgegevens. Wijzigingen en geschiedenis verdwijnen bij herladen.</p>
    <label>Datum<input type="date" required value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label>
    <div className="form-pair"><label>Begintijd<input type="time" required value={start??''} onChange={e=>setDraft({...draft,time:`${e.target.value}–${end??''}`})}/></label><label>Eindtijd<input type="time" required value={end??''} onChange={e=>setDraft({...draft,time:`${start??''}–${e.target.value}`})}/></label></div>
    <label>Vertrek<input required maxLength={450} value={from??''} onChange={e=>setDraft({...draft,route:`${e.target.value} → ${to??''}`})}/></label>
    <label>Bestemming<input required maxLength={450} value={to??''} onChange={e=>setDraft({...draft,route:`${from??''} → ${e.target.value}`})}/></label>
    <label>Afstand (km)<input type="number" required min="0.01" step="0.01" value={Number.isFinite(draft.distance)?draft.distance:''} onChange={e=>setDraft({...draft,distance:numeric(e.target.value)??NaN})}/></label>
    <div className="form-pair"><label>Beginstand (km)<input type="number" min="0" step="0.1" value={draft.odometerStart??''} onChange={e=>setDraft({...draft,odometerStart:numeric(e.target.value)})}/></label><label>Eindstand (km)<input type="number" min="0" step="0.1" value={draft.odometerEnd??''} onChange={e=>setDraft({...draft,odometerEnd:numeric(e.target.value)})}/></label></div>
    <label>Bestuurder<select value={draft.driver} onChange={e=>setDraft({...draft,driver:e.target.value})}>{['Onbekend','Dennis','Ingrid','Jesse'].map(name=><option key={name}>{name}</option>)}</select></label>
    <label>Classificatie<select value={draft.classification} onChange={e=>setDraft({...draft,classification:e.target.value as Trip['classification']})}>{['Controleren','Privé','Zakelijk'].map(value=><option key={value}>{value}</option>)}</select></label>
    <label>Ritdoel / toelichting<textarea maxLength={1000} value={draft.purpose??''} onChange={e=>setDraft({...draft,purpose:e.target.value})}/></label>
    <label>{creating?'Registratietoelichting':'Waarom wijzig je deze rit?'}<input required maxLength={500} value={reason} onChange={e=>setReason(e.target.value)}/></label>
    <div aria-live="polite">{issues.map((issue,index)=><p className={issue.severity==='error'?'form-error':'form-warning'} key={`${issue.code}-${index}`}>{issue.message}</p>)}{attempted&&!reason.trim()&&<p className="form-error">Een wijzigingsreden is verplicht.</p>}</div>
    <div className="form-pair"><button type="submit" className="primary">{creating?'Voorbeeldrit toevoegen':'Demo bijwerken'}</button><button type="button" className="secondary" onClick={onCancel}>Annuleren</button></div>
  </form>;
}
