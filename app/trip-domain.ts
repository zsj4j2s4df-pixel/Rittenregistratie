// Pure domain rules: usable by a future server, but browser checks are not authorization.
export type Classification = 'Zakelijk' | 'Privé' | 'Controleren';
export type Trip = {
  id: number; route: string; date: string; time: string; distance: number;
  classification: Classification; driver: string; quality: string;
  odometerStart?: number; odometerEnd?: number; purpose?: string; revision?: number;
};
export type Issue = {code: string; severity: 'error' | 'warning'; message: string; tripId?: number};
export type HistoryEntry = {tripId:number; actor:string; occurredAt:string; before:Trip; after:Trip; reason:string};
export type DemoState = {trips:Trip[]; history:HistoryEntry[]; error:string | null};
export type EditAction = {type:'edit'; trip:Trip; expectedRevision:number; reason:string; occurredAt:string};

export function validDate(value:string):boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}

export function timeRange(value:string):[number,number] | null {
  const match = /^(\d{2}):(\d{2})–(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, sh, sm, eh, em] = match.map(Number);
  if (sh>23 || eh>23 || sm>59 || em>59) return null;
  const start=sh*60+sm, end=eh*60+em;
  return end > start ? [start,end] : null;
}

export function validateTrip(trip:Trip):Issue[] {
  const issues:Issue[]=[];
  const add=(code:string,severity:Issue['severity'],message:string)=>issues.push({code,severity,message,tripId:trip.id});
  if (!validDate(trip.date)) add('date','error','Vul een geldige datum in.');
  if (!timeRange(trip.time)) add('time','error','Eindtijd moet na begintijd liggen. Ritten over middernacht worden in deze editor nog niet ondersteund.');
  if (!Number.isFinite(trip.distance) || trip.distance<=0) add('distance','error','Afstand moet een positief, eindig getal zijn.');
  const addresses=trip.route.split(' → ');
  if (addresses.length!==2 || addresses.some(a=>!a.trim()) || trip.route.length>1000) add('route','error','Vul vertrek en bestemming in (maximaal 1000 tekens samen).');
  if (!['Zakelijk','Privé','Controleren'].includes(trip.classification)) add('classification','error','Ongeldige classificatie.');
  if (!['Dennis','Ingrid','Jesse','Onbekend'].includes(trip.driver)) add('driver','error','Kies een bekende bestuurder of Onbekend.');
  if (trip.driver==='Onbekend') add('driver_unknown','warning','Bestuurder moet nog worden bevestigd.');
  if (trip.classification==='Controleren') add('review','warning','Classificatie moet nog worden gecontroleerd.');
  if ((trip.purpose?.length ?? 0)>1000) add('purpose','error','Toelichting mag maximaal 1000 tekens bevatten.');
  const start=trip.odometerStart, end=trip.odometerEnd;
  if (start===undefined || end===undefined) add('odometer_missing','warning','Begin- en/of eindkilometerstand ontbreekt.');
  for (const value of [start,end]) if (value!==undefined && (!Number.isFinite(value) || value<0)) add('odometer_invalid','error','Kilometerstanden moeten eindige, niet-negatieve getallen zijn.');
  if (start!==undefined && end!==undefined && Number.isFinite(start) && Number.isFinite(end)) {
    if (end<start) add('odometer_order','error','Eindkilometerstand mag niet lager zijn dan beginstand.');
    else if (Math.abs((end-start)-trip.distance)>0.11) add('odometer_difference','warning','Tellerafstand wijkt af van opgegeven afstand; controleer beide bronnen.');
  }
  if (trip.classification==='Zakelijk' && !trip.purpose?.trim()) add('purpose_missing','warning','Ritdoel is nog niet ingevuld; vul alleen bekende gegevens aan.');
  return issues;
}

export function validateLog(trips:Trip[]):Issue[] {
  const issues=trips.flatMap(validateTrip);
  for(let i=0;i<trips.length;i++) for(let j=i+1;j<trips.length;j++) {
    const a=trips[i], b=trips[j], at=timeRange(a.time), bt=timeRange(b.time);
    if (a.date===b.date && validDate(a.date) && at && bt && at[0]<bt[1] && bt[0]<at[1]) {
      issues.push({code:'overlap',severity:'warning',tripId:a.id,message:`Ritten ${a.id} en ${b.id} overlappen voor deze Jeep: mogelijk dubbel, handmatig controleren.`});
    }
  }
  return issues;
}

export function demoReducer(state:DemoState, action:EditAction):DemoState {
  const before=state.trips.find(t=>t.id===action.trip.id);
  if (!before) return {...state,error:'Rit niet gevonden.'};
  if ((before.revision??0)!==action.expectedRevision) return {...state,error:'Deze rit is ondertussen gewijzigd. Open de editor opnieuw.'};
  if (!action.reason.trim() || action.reason.length>500) return {...state,error:'Geef een wijzigingsreden van maximaal 500 tekens.'};
  if (!Number.isFinite(Date.parse(action.occurredAt))) return {...state,error:'Ongeldig wijzigingstijdstip.'};
  const errors=validateTrip(action.trip).filter(i=>i.severity==='error');
  if(errors.length) return {...state,error:errors.map(i=>i.message).join(' ')};
  // Explicit allowed fields: callers cannot replace identity or provenance through an edit.
  const after:Trip={...before,date:action.trip.date,time:action.trip.time,route:action.trip.route.trim(),distance:action.trip.distance,
    classification:action.trip.classification,driver:action.trip.driver,odometerStart:action.trip.odometerStart,
    odometerEnd:action.trip.odometerEnd,purpose:action.trip.purpose?.trim(),revision:(before.revision??0)+1};
  return {trips:state.trips.map(t=>t.id===before.id?after:t),history:[...state.history,{tripId:before.id,actor:'Lokale demogebruiker (niet aangemeld)',occurredAt:action.occurredAt,before:{...before},after:{...after},reason:action.reason.trim()}],error:null};
}
