import type { BackendTrip } from '../backend-client';
export type TripFilters={from:string;until:string;classification:string;driver:string;query:string};
const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'});
export function filterTrips(trips:BackendTrip[],filters:TripFilters){
 const query=filters.query.trim().toLocaleLowerCase('nl-NL');
 return trips.filter(trip=>{
  const day=date.format(new Date(trip.started_at*1000));
  return (!filters.from||day>=filters.from)&&(!filters.until||day<=filters.until)&&(!filters.classification||trip.classification===filters.classification)&&(!filters.driver||(filters.driver==='unknown'?trip.driver_id===null:'user:'+trip.driver_id===filters.driver))&&(!query||[trip.start_address,trip.end_address,trip.purpose].some(value=>value?.toLocaleLowerCase('nl-NL').includes(query)));
 });
}
