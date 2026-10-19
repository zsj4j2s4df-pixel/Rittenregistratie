'use client';
import {useEffect,useState} from 'react';
import {createBackendClient} from '../backend-client';
import type {DetectionObservation} from '../../lib/detection-service';
const api=createBackendClient();
export default function DetectionObservations({vehicleId,deviceId}:{vehicleId:string;deviceId:string}){
 const [rows,setRows]=useState<DetectionObservation[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false),[reload,setReload]=useState(0);
 useEffect(()=>{if(!reload)return;let cancelled=false;api.detections(vehicleId,deviceId).then(data=>{if(!cancelled){setRows(data);setLoading(false);}}).catch(e=>{if(!cancelled){setRows([]);setError(e instanceof Error?e.message:'Observaties laden mislukt.');setLoading(false);}});return()=>{cancelled=true;};},[vehicleId,deviceId,reload]);
 return <section aria-label="Ruwe appwaarnemingen"><h4>Ruwe appwaarnemingen</h4><p>Ongeverifieerde meldingen van de app. Bron en tijd zijn aangeleverde gegevens; dit bewijst geen gereden rit, bestuurder of correcte GPS.</p><button disabled={loading} onClick={()=>{setRows([]);setError('');setLoading(true);setReload(n=>n+1);}}>Waarnemingen laden</button>{error&&<p role="alert">{error}</p>}{loading&&<p role="status">Waarnemingen laden…</p>}{reload>0&&!loading&&!error&&<><p>Maximaal de eerste 50 opgeslagen waarnemingen, op ontvangsttijd. Geen volledige rit- of routeweergave.</p>{rows.length===0&&<p>Geen appwaarnemingen opgeslagen.</p>}<ul>{rows.map(row=><li key={row.id}>{new Date(row.observed_at*1000).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})} · {row.source} · {row.event_kind} · ongeverifieerd</li>)}</ul></>}</section>;
}
