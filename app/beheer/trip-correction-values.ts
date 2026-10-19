import type { BackendTrip } from '../backend-client.ts';
import type { TripEdit } from '../../lib/trip-service.ts';

// UTC avoids silently changing an existing instant in the repeated DST hour.
export const correctionTime=(seconds:number|null)=>seconds===null?'':new Date(seconds*1000).toISOString().slice(0,19);
export function correctionInput(trip:BackendTrip,data:FormData):TripEdit {
 const text=(key:string)=>String(data.get(key)??'');
 const time=(key:string)=>{const value=text(key);if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value))throw Error('Vul vertrek en aankomst volledig in.');return Date.parse(value+'Z')/1000;};
 const number=(key:string,optional=false)=>{const value=text(key).trim();if(!value){if(optional)return null;throw Error('Vul de afstand in; onbekend wordt niet als nul opgeslagen.');}const n=Number(value);if(!Number.isFinite(n))throw Error('Vul een geldig getal in.');return n;};
 const classification=text('classification');if(!['private','business','review'].includes(classification))throw Error('Kies een classificatie.');
 return {expectedRevision:trip.revision,startedAt:time('startedAt'),endedAt:time('endedAt'),distanceKm:number('distanceKm')!,startAddress:text('startAddress'),endAddress:text('endAddress'),classification:classification as TripEdit['classification'],driverId:data.has('driverId')?(text('driverId')||null):trip.driver_id,odometerStart:number('odometerStart',true),odometerEnd:number('odometerEnd',true),purpose:text('purpose')||null,reason:text('reason')};
}
