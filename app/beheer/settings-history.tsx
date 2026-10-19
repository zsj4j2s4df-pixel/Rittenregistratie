'use client';
import {useEffect,useState} from 'react';
import {createBackendClient,type TripHistoryEntry} from '../backend-client';
const api=createBackendClient();
function snapshot(value:string|null):Record<string,unknown>|null{try{const parsed=JSON.parse(value??'null');return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:null;}catch{return null;}}
function field(data:Record<string,unknown>|null,key:string){
 if(!data)return 'Snapshot niet leesbaar';
 if(key==='plate')return typeof data.plate==='string'?(data.plate||'Niet ingevuld'):'Onbekend';
 if(key==='revision')return typeof data.revision==='number'?String(data.revision):'Onbekend';
 if(!Array.isArray(data[key]))return 'Niet leesbaar';
 if(!data[key].length)return 'Geen ingesteld';
 return data[key].map((value:unknown)=>{if(!value||typeof value!=='object')return 'Niet leesbaar';const v=value as Record<string,unknown>;if(key==='addresses')return `${typeof v.label==='string'?v.label:'Onbekend'}: ${typeof v.address==='string'?v.address:'Onbekend'} — ${v.enabled===true?'Actief':v.enabled===false?'Uitgeschakeld':'Onbekende status'}${typeof v.note==='string'&&v.note?' — '+v.note:''}`;return `${typeof v.microsPerKm==='number'?new Intl.NumberFormat('nl-NL',{maximumFractionDigits:6}).format(v.microsPerKm/1_000_000):'Onbekend'} €/km · ${typeof v.validFrom==='string'?v.validFrom:'Onbekend'} t/m ${typeof v.validUntil==='string'?v.validUntil:'onbepaald'}`;}).join('\n');
}
function Entry({entry}:{entry:TripHistoryEntry}){const before=snapshot(entry.old_value_json),after=snapshot(entry.new_value_json);return <li><h3>{new Date(entry.occurred_at*1000).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})}</h3><p>Account-ID van uitvoerder: {entry.actor_id}. Een historische accountnaam is hier niet opgehaald.</p><p>Reden: {typeof after?.correction_reason==='string'?after.correction_reason:'Niet geregistreerd'}</p><div className="central-table"><table><thead><tr><th scope="col">Instelling</th><th scope="col">Voor</th><th scope="col">Na</th></tr></thead><tbody>{[['plate','Kenteken'],['revision','Versie'],['addresses','Voorkeursadressen'],['rates','Tariefperioden']].map(([key,label])=><tr key={key}><th scope="row">{label}</th><td style={{whiteSpace:'pre-wrap'}}>{field(before,key)}</td><td style={{whiteSpace:'pre-wrap'}}>{field(after,key)}</td></tr>)}</tbody></table></div></li>;}
export default function SettingsHistory({vehicleId,busy}:{vehicleId:string;busy:boolean}){
 const [entries,setEntries]=useState<TripHistoryEntry[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{let cancelled=false;api.settingsHistory(vehicleId).then(history=>{if(!cancelled){setEntries(history);setError('');setLoading(false);}}).catch(e=>{if(!cancelled){setEntries([]);setError(e instanceof Error?e.message:'Historie laden mislukt.');setLoading(false);}});return()=>{cancelled=true;};},[vehicleId,reload]);
 return <section className="panel" aria-label="Instellingenhistorie"><h2>Historie van kenteken, adressen en tarieven</h2><button disabled={busy||loading} onClick={()=>{setLoading(true);setEntries([]);setReload(value=>value+1);}}>Instellingenhistorie vernieuwen</button>{loading&&<p role="status">Historie laden…</p>}{error&&<p role="alert">{error}</p>}{!loading&&!error&&!entries.length&&<p>Geen instellingenwijzigingen geregistreerd.</p>}<ol>{entries.map(entry=><Entry key={entry.id} entry={entry}/>)}</ol>{entries.length===50&&<p>De laatste 50 wijzigingen worden getoond; oudere historie blijft centraal bewaard.</p>}</section>;
}
