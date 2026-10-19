import type {DetectionObservation} from './detection-service.ts';

export type ProposalObservation=Omit<DetectionObservation,'observed_at'|'received_at'>&{observed_at:number|null;received_at:number|null};
export type ProposalTrip={id:string;vehicle_id:string;started_at:number;ended_at:number|null};
export type ProposalPolicy={maxGapSeconds:number};
export type ProposalWarning='unverified_observations'|'missing_start'|'missing_end'|'missing_observation_time'|'missing_received_time'|'out_of_order_arrival'|'observation_gap'|'repeated_start'|'non_positive_interval'|'no_explicit_boundaries'|'overlap_existing_trip'|'overlap_proposal'|'overlap_not_assessable'|'clock_skew'|'connection_signal_only';
export type DetectionProposal={id:string;vehicleId:string;sourceUserId:string;deviceId:string;startedAt:number|null;endedAt:number|null;status:'needs_review';classification:'review';driverId:null;distanceKm:null;eventKeys:string[];observationIds:string[];sourceClaims:string[];warnings:ProposalWarning[];overlappingTripIds:string[];overlappingProposalIds:string[]};
export type ProposalResult={version:1;inputCompleteness:'not_established';policy:ProposalPolicy;observationCount:number;uniqueEventCount:number;duplicateCount:number;proposals:DetectionProposal[]};
export class DetectionProposalError extends Error {
 code:'invalid_input'|'limits_exceeded'|'conflicting_event';
 constructor(code:'invalid_input'|'limits_exceeded'|'conflicting_event',message:string){super(message);this.code=code;this.name='DetectionProposalError';}
}
const fail=(code:DetectionProposalError['code'],message:string):never=>{throw new DetectionProposalError(code,message);};
const validId=(v:unknown)=>typeof v==='string'&&v.length>0&&v.length<=128&&!/[\x00-\x1f\x7f]/.test(v);
const validTime=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=253402300799;
const lexical=(a:string,b:string)=>a<b?-1:a>b?1:0;
const sources=['gps','bluetooth','carplay','manual'],kinds=['location','start_candidate','end_candidate','connection','disconnection'];
type Event={row:ProposalObservation;key:string;canonical:string;observationIds:string[]};
function event(row:ProposalObservation):Event {
 if(!row||typeof row!=='object'||![row.id,row.vehicle_id,row.user_id,row.device_id,row.event_id].every(validId)||!(row.observed_at===null||validTime(row.observed_at))||!(row.received_at===null||validTime(row.received_at))||!sources.includes(row.source)||!kinds.includes(row.event_kind)||row.uncertainty!=='unverified_app_observation'||typeof row.payload_json!=='string'||new TextEncoder().encode(row.payload_json).byteLength>16384)fail('invalid_input','Ongeldige bronobservatie; geen voorstellen berekend.');
 let payload:Record<string,unknown>;
 try{payload=JSON.parse(row.payload_json);if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error();}catch{fail('invalid_input','Ongeldige observatie-inhoud; geen voorstellen berekend.');}
 if(Object.keys(payload!).some(k=>!['observedAt','source','kind','detail','location'].includes(k))||payload!.observedAt!==row.observed_at||payload!.source!==row.source||payload!.kind!==row.event_kind||(payload!.detail!==undefined&&(typeof payload!.detail!=='string'||payload!.detail.length>500)))fail('invalid_input','Observatie en broninhoud spreken elkaar tegen.');
 let location:{latitude:number;longitude:number;accuracyMeters:number}|undefined;
 if(payload!.location!==undefined){const l=payload!.location as Record<string,unknown>;if(!l||typeof l!=='object'||Array.isArray(l)||Object.keys(l).some(k=>!['latitude','longitude','accuracyMeters'].includes(k))||typeof l.latitude!=='number'||!Number.isFinite(l.latitude)||Math.abs(l.latitude)>90||typeof l.longitude!=='number'||!Number.isFinite(l.longitude)||Math.abs(l.longitude)>180||typeof l.accuracyMeters!=='number'||!Number.isFinite(l.accuracyMeters)||l.accuracyMeters<0||l.accuracyMeters>100000)fail('invalid_input','Ongeldige locatieclaim; geen voorstellen berekend.');location={latitude:l.latitude as number,longitude:l.longitude as number,accuracyMeters:l.accuracyMeters as number};}
 if((row.event_kind==='location'&&(!location||row.source!=='gps'))||(location&&row.source!=='gps'))fail('invalid_input','Locatieclaim en bronlabel spreken elkaar tegen.');
 const canonical=JSON.stringify({observedAt:row.observed_at,source:row.source,kind:row.event_kind,...(payload!.detail===undefined?{}:{detail:payload!.detail}),...(location?{location}:{})});
 return {row:{...row},key:JSON.stringify([row.vehicle_id,row.user_id,row.device_id,row.event_id]),canonical,observationIds:[row.id]};
}

// Pure review support over an explicitly bounded INPUT, never authorization,
// GPS attestation, full-history detection, trip creation or distance computation.
export function buildDetectionProposals(input:{observations:readonly ProposalObservation[];existingTrips:readonly ProposalTrip[];policy:ProposalPolicy}):ProposalResult {
 if(!input||!Array.isArray(input.observations)||!Array.isArray(input.existingTrips)||!input.policy||!Number.isSafeInteger(input.policy.maxGapSeconds)||input.policy.maxGapSeconds<1)fail('invalid_input','Geef observaties, bestaande ritten en een expliciete positieve gapparameter op.');
 if(input.observations.length>1000||input.existingTrips.length>500)fail('limits_exceeded','Te veel brongegevens; niets gedeeltelijk verwerkt.');
 let bytes=0;for(const row of input.observations){if(typeof row?.payload_json==='string')bytes+=new TextEncoder().encode(row.payload_json).byteLength;if(bytes>2*1024*1024)fail('limits_exceeded','Broninhoud te groot; niets gedeeltelijk verwerkt.');}
 const tripMap=new Map<string,ProposalTrip>();
 for(const trip of input.existingTrips){if(!trip||!validId(trip.id)||!validId(trip.vehicle_id)||!validTime(trip.started_at)||!(trip.ended_at===null||(validTime(trip.ended_at)&&trip.ended_at>trip.started_at)))fail('invalid_input','Ongeldige bestaande rittijden of scope.');const old=tripMap.get(trip.id);if(old&&(old.vehicle_id!==trip.vehicle_id||old.started_at!==trip.started_at||old.ended_at!==trip.ended_at))fail('invalid_input','Tegenstrijdige bestaande ritten.');tripMap.set(trip.id,{id:trip.id,vehicle_id:trip.vehicle_id,started_at:trip.started_at,ended_at:trip.ended_at});}
 const events=new Map<string,Event>();
 for(const row of input.observations){const next=event(row),old=events.get(next.key);if(!old){events.set(next.key,next);continue;}if(old.canonical!==next.canonical)fail('conflicting_event','Dezelfde eventclaim heeft verschillende inhoud; niets samengevoegd.');old.observationIds=[...new Set([...old.observationIds,...next.observationIds])].sort(lexical);if(old.row.received_at===null||(next.row.received_at!==null&&next.row.received_at<old.row.received_at))old.row.received_at=next.row.received_at;}
 const streams=new Map<string,Event[]>();for(const e of events.values()){const scope=JSON.stringify([e.row.vehicle_id,e.row.user_id,e.row.device_id]);const stream=streams.get(scope)??[];stream.push(e);streams.set(scope,stream);}
 const proposals:DetectionProposal[]=[];
 for(const [scope,stream] of [...streams].sort(([a],[b])=>lexical(a,b))){
  const ordered=[...stream].sort((a,b)=>(a.row.observed_at??Infinity)-(b.row.observed_at??Infinity)||lexical(a.key,b.key));
  const arrival=stream.filter(e=>e.row.observed_at!==null&&e.row.received_at!==null).sort((a,b)=>a.row.received_at!-b.row.received_at!||lexical(a.key,b.key));
  const outOfOrder=arrival.some((e,i)=>i>0&&e.row.observed_at!<arrival[i-1].row.observed_at!);
  function emit(evidence:Event[],start:number|null,end:number|null,extra:ProposalWarning[]=[]){
   if(!evidence.length)return;const warnings=new Set<ProposalWarning>(['unverified_observations',...extra]);
   if(start===null)warnings.add('missing_start');if(end===null)warnings.add('missing_end');if(start===null&&end===null)warnings.add('no_explicit_boundaries');
   if(start===null||end===null||end<=start)warnings.add('overlap_not_assessable');if(start!==null&&end!==null&&end<=start)warnings.add('non_positive_interval');
   if(evidence.some(e=>e.row.observed_at===null))warnings.add('missing_observation_time');if(evidence.some(e=>e.row.received_at===null))warnings.add('missing_received_time');
   if(evidence.some(e=>e.row.observed_at!==null&&e.row.received_at!==null&&e.row.observed_at>e.row.received_at))warnings.add('clock_skew');if(outOfOrder)warnings.add('out_of_order_arrival');
   const times=evidence.flatMap(e=>e.row.observed_at===null?[]:[e.row.observed_at]).sort((a,b)=>a-b);if(times.some((time,i)=>i>0&&time-times[i-1]>input.policy.maxGapSeconds))warnings.add('observation_gap');
   if(evidence.every(e=>['connection','disconnection'].includes(e.row.event_kind)))warnings.add('connection_signal_only');
   const row=evidence[0].row;
   proposals.push({id:JSON.stringify([scope,evidence[0].key]),vehicleId:row.vehicle_id,sourceUserId:row.user_id,deviceId:row.device_id,startedAt:start,endedAt:end,status:'needs_review',classification:'review',driverId:null,distanceKm:null,eventKeys:evidence.map(e=>e.key),observationIds:[...new Set(evidence.flatMap(e=>e.observationIds))].sort(lexical),sourceClaims:[...new Set(evidence.map(e=>e.row.source))].sort(lexical),warnings:[...warnings].sort(lexical),overlappingTripIds:[],overlappingProposalIds:[]});
  }
  let evidence:Event[]=[],start:number|null=null,extra:ProposalWarning[]=[];
  for(const e of ordered){
   if(e.row.observed_at===null){emit([e],null,null);continue;}
   if(e.row.event_kind==='start_candidate'){
    const repeated=start!==null;emit(evidence,start,null,repeated?[...extra,'repeated_start']:extra);evidence=[e];start=e.row.observed_at;extra=repeated?['repeated_start']:[];
   }else if(e.row.event_kind==='end_candidate'){evidence.push(e);emit(evidence,start,e.row.observed_at,extra);evidence=[];start=null;extra=[];}
   else evidence.push(e);
  }
  emit(evidence,start,null,extra);
 }
 proposals.sort((a,b)=>(a.startedAt??a.endedAt??Infinity)-(b.startedAt??b.endedAt??Infinity)||lexical(a.id,b.id));
 let links=0;const link=()=>{if(++links>10000)fail('limits_exceeded','Te veel overlaprelaties; niets gedeeltelijk beoordeeld.');};
 const complete=(p:DetectionProposal)=>p.startedAt!==null&&p.endedAt!==null&&p.endedAt>p.startedAt;
 for(const proposal of proposals){if(!complete(proposal))continue;for(const trip of tripMap.values())if(proposal.vehicleId===trip.vehicle_id&&proposal.startedAt!<(trip.ended_at??Infinity)&&trip.started_at<proposal.endedAt!){link();proposal.overlappingTripIds.push(trip.id);}if(proposal.overlappingTripIds.length)proposal.warnings.push('overlap_existing_trip');proposal.overlappingTripIds.sort(lexical);}
 for(let a=0;a<proposals.length;a++)for(let b=a+1;b<proposals.length;b++){const x=proposals[a],y=proposals[b];if(x.vehicleId===y.vehicleId&&complete(x)&&complete(y)&&x.startedAt!<y.endedAt!&&y.startedAt!<x.endedAt!){link();x.overlappingProposalIds.push(y.id);y.overlappingProposalIds.push(x.id);}}
 for(const proposal of proposals){if(proposal.overlappingProposalIds.length)proposal.warnings.push('overlap_proposal');proposal.overlappingProposalIds.sort(lexical);proposal.warnings=[...new Set(proposal.warnings)].sort(lexical);}
 const result:ProposalResult={version:1,inputCompleteness:'not_established',policy:{maxGapSeconds:input.policy.maxGapSeconds},observationCount:input.observations.length,uniqueEventCount:events.size,duplicateCount:input.observations.length-events.size,proposals};
 if(new TextEncoder().encode(JSON.stringify(result)).byteLength>2*1024*1024)fail('limits_exceeded','Voorstellen te groot; niets gedeeltelijk teruggegeven.');return result;
}
