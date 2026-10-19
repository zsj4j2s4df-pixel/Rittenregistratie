import {membership,TripServiceError,vehicleAuthorizer} from './server-access.ts';
import type {Principal} from './access-policy.ts';
import type {SessionResolver} from './trip-service.ts';
export type Journey={id:string;vehicle_id:string;created_by:string;started_at:number;ended_at:number|null;status:'review_open'|'review_closed';classification?:'business'|'private'|null;materialized_trip_id?:string|null;revision:number;created_at:number;updated_at:number};
export type JourneyEvidence={observation_id:string;linked_by:string;linked_at:number;source:string;event_kind:string;observed_at:number;received_at:number};
export type JourneyInput={requestId:string;deviceId:string;observationId:string};
export type JourneyChange=JourneyInput&{expectedRevision:number;reason:string};
export type JourneyReceipt={journeyId:string;operation:'create'|'join'|'close';revision:number};
export const JOURNEY_LIMITS=Object.freeze({journeysPerVehicle:10000,requestsPerUserVehicle:10000,evidencePerJourney:1000});
const fields='id,vehicle_id,created_by,started_at,ended_at,status,revision,created_at,updated_at';
const id=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_-]{16,128}$/.test(v);
const own=`EXISTS(SELECT 1 FROM detection_observations o JOIN registered_devices d ON d.id=o.device_id AND d.user_id=o.user_id AND d.vehicle_id=o.vehicle_id WHERE o.id=? AND o.device_id=? AND o.vehicle_id=? AND o.user_id=? AND d.active=1)`;
// Coordination only: no driver/classification assertion, implicit cross-phone
// merge, trip insert, elapsed-stop timer or physical departure/arrival proof.
export function createJourneyService(db:Pick<D1Database,'prepare'|'batch'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 const authorize=vehicleAuthorizer(db,resolveSession,clock);
 function now(p:Principal){const n=clock();if(!Number.isFinite(n)||n>=p.sessionExpiresAt)throw new TripServiceError(401,'Aanmelden vereist.');const seconds=Math.floor(n/1000);if(!Number.isSafeInteger(seconds)||seconds<0||seconds>253402300799)throw new TripServiceError(500,'Ongeldige servertijd.');return seconds;}
 async function get(p:Principal,v:string,j:string){if(!id(j))throw new TripServiceError(400,'Ongeldige voertuigrit.');const row=await db.prepare(`SELECT ${fields} FROM vehicle_journeys WHERE id=? AND vehicle_id=? AND ${membership}`).bind(j,v,p.userId,v).first<Journey>();now(p);if(!row)throw new TripServiceError(404,'Voertuigrit niet gevonden.');return row;}
 async function mutate(v:string,j:string|null,operation:JourneyReceipt['operation'],input:JourneyInput|JourneyChange){
  const p=await authorize(v);const allowed=operation==='create'?['requestId','deviceId','observationId']:['requestId','deviceId','observationId','expectedRevision','reason'];
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!allowed.includes(k))||![input.requestId,input.deviceId,input.observationId].every(id))throw new TripServiceError(400,'Ongeldige coördinatieaanvraag.');
  const change=input as JourneyChange;if(operation!=='create'&&(!id(j)||!Number.isSafeInteger(change.expectedRevision)||change.expectedRevision<0||change.expectedRevision>=Number.MAX_SAFE_INTEGER||typeof change.reason!=='string'||!change.reason.trim()||change.reason.length>500))throw new TripServiceError(400,'Revisie en reden vereist.');
  const binding=[input.observationId,input.deviceId,v,p.userId];
  const evidence=await db.prepare(`SELECT observed_at,event_kind FROM detection_observations WHERE id=? AND ${own} AND ${membership}`).bind(input.observationId,...binding,p.userId,v).first<{observed_at:number;event_kind:string}>();now(p);
  if(!evidence)throw new TripServiceError(403,'Geen actieve eigen bronobservatie.');
  const canonical=JSON.stringify({journeyId:j,deviceId:input.deviceId,observationId:input.observationId,...(operation==='create'?{}:{expectedRevision:change.expectedRevision,reason:change.reason.trim()})});
  async function receipt(){const row=await db.prepare(`SELECT operation,request_json,response_json FROM journey_requests WHERE vehicle_id=? AND user_id=? AND request_id=? AND ${own} AND ${membership}`).bind(v,p.userId,input.requestId,...binding,p.userId,v).first<{operation:string;request_json:string;response_json:string}>();now(p);if(!row)return null;if(row.operation!==operation||row.request_json!==canonical)throw new TripServiceError(409,'Herhaalcode hoort bij een andere coördinatieaanvraag.');return JSON.parse(row.response_json) as JourneyReceipt;}
  const replay=await receipt();if(replay)return replay;
  if(operation==='create'&&evidence.event_kind!=='start_candidate'||operation==='close'&&evidence.event_kind!=='end_candidate')throw new TripServiceError(400,'Expliciete begin-/eindobservatie vereist.');
  const before=j?await get(p,v,j):null;if(before&&(before.revision!==change.expectedRevision||before.status!=='review_open'))throw new TripServiceError(409,'Voertuigrit is gewijzigd of al gesloten.');
  if(operation==='close'&&evidence.observed_at<=before!.started_at)throw new TripServiceError(400,'Eindobservatie moet na de beginobservatie liggen.');
  const journeyId=j??crypto.randomUUID(),revision=before?before.revision+1:0,time=now(p),marker=crypto.randomUUID();
  const response:JourneyReceipt={journeyId,operation,revision};
  const gate='EXISTS(SELECT 1 FROM vehicle_journeys WHERE id=? AND vehicle_id=? AND last_mutation_id=?)';const gateParams=[journeyId,v,marker];
  const unclaimed='NOT EXISTS(SELECT 1 FROM journey_observations WHERE observation_id=? AND journey_id<>?)';
  const noReceipt=`NOT EXISTS(SELECT 1 FROM journey_requests WHERE vehicle_id=? AND user_id=? AND request_id=?) AND (SELECT count(*) FROM journey_requests WHERE vehicle_id=? AND user_id=?)<${JOURNEY_LIMITS.requestsPerUserVehicle}`;
  const capacity=operation==='create'?`(SELECT count(*) FROM vehicle_journeys WHERE vehicle_id=?)<${JOURNEY_LIMITS.journeysPerVehicle}`:`((SELECT count(*) FROM journey_observations WHERE journey_id=?)<${JOURNEY_LIMITS.evidencePerJourney} OR EXISTS(SELECT 1 FROM journey_observations WHERE observation_id=? AND journey_id=?))`;
  const capacityParams=operation==='create'?[v]:[journeyId,input.observationId,journeyId];
  const newEvidence=operation==='join'?'NOT EXISTS(SELECT 1 FROM journey_observations WHERE observation_id=?)':'1=1';
  const newEvidenceParams=operation==='join'?[input.observationId]:[];
  const first=operation==='create'?db.prepare(`INSERT INTO vehicle_journeys(${fields},last_mutation_id) SELECT ?,?,?,?,?,?,?,?,?,? WHERE ${own} AND ${membership} AND ${unclaimed} AND ${noReceipt} AND ${capacity} AND ${newEvidence} ON CONFLICT DO NOTHING`).bind(journeyId,v,p.userId,evidence.observed_at,null,'review_open',0,time,time,marker,...binding,p.userId,v,input.observationId,journeyId,v,p.userId,input.requestId,v,p.userId,...capacityParams,...newEvidenceParams):db.prepare(`UPDATE vehicle_journeys SET revision=revision+1,updated_at=?,last_mutation_id=?,status=?,ended_at=? WHERE id=? AND vehicle_id=? AND status='review_open' AND revision=? AND ${own} AND ${membership} AND ${unclaimed} AND ${noReceipt} AND ${capacity} AND ${newEvidence}`).bind(time,marker,operation==='close'?'review_closed':'review_open',operation==='close'?evidence.observed_at:null,journeyId,v,change.expectedRevision,...binding,p.userId,v,input.observationId,journeyId,v,p.userId,input.requestId,v,p.userId,...capacityParams,...newEvidenceParams);
  await db.batch([first,
   db.prepare(`INSERT INTO journey_observations(observation_id,journey_id,linked_by,linked_at) SELECT ?,?,?,? WHERE ${gate} ON CONFLICT(observation_id) DO NOTHING`).bind(input.observationId,journeyId,p.userId,time,...gateParams),
   db.prepare(`INSERT INTO journey_requests(vehicle_id,user_id,request_id,operation,request_json,response_json) SELECT ?,?,?,?,?,? WHERE ${gate}`).bind(v,p.userId,input.requestId,operation,canonical,JSON.stringify(response),...gateParams),
   db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) SELECT ?,'vehicle_journey',?,?,?, ?,? WHERE ${gate}`).bind(p.userId,journeyId,operation,before?JSON.stringify(before):null,JSON.stringify({...response,observationId:input.observationId,...(operation==='create'?{}:{correction_reason:change.reason.trim()})}),time,...gateParams),
  ]);
  const saved=await receipt();if(!saved)throw new TripServiceError(409,'Niet uitgevoerd: actieve rit, bron, revisie of toegang gewijzigd. Laad opnieuw; er is niets automatisch samengevoegd.');return saved;
 }
 return {
  create:(v:string,input:JourneyInput)=>mutate(v,null,'create',input),
  join:(v:string,j:string,input:JourneyChange)=>mutate(v,j,'join',input),
  close:(v:string,j:string,input:JourneyChange)=>mutate(v,j,'close',input),
  async get(v:string,j:string){const p=await authorize(v);if(!id(j))throw new TripServiceError(400,'Ongeldige voertuigrit.');const result=await db.batch([db.prepare(`SELECT ${fields},(SELECT classification FROM journey_choices c WHERE c.journey_id=vehicle_journeys.id ORDER BY c.revision DESC LIMIT 1) AS classification,(SELECT trip_id FROM journey_materializations m WHERE m.journey_id=vehicle_journeys.id) AS materialized_trip_id FROM vehicle_journeys WHERE id=? AND vehicle_id=? AND ${membership}`).bind(j,v,p.userId,v),db.prepare(`SELECT l.observation_id,l.linked_by,l.linked_at,o.source,o.event_kind,o.observed_at,o.received_at FROM journey_observations l JOIN detection_observations o ON o.id=l.observation_id WHERE l.journey_id=? AND o.vehicle_id=? AND ${membership} ORDER BY l.linked_at,l.observation_id LIMIT 1001`).bind(j,v,p.userId,v)]);now(p);if(!result[0].results.length)throw new TripServiceError(404,'Voertuigrit niet gevonden.');if(result[1].results.length>1000)throw new TripServiceError(413,'Te veel bewijs voor één overzicht; niets afgekapt.');return {journey:result[0].results[0] as Journey,evidence:result[1].results as JourneyEvidence[]};},
  async list(v:string,limit=50,offset=0){const p=await authorize(v);if(!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new TripServiceError(400,'Ongeldige paginering.');const rows=await db.prepare(`SELECT ${fields} FROM vehicle_journeys WHERE vehicle_id=? AND ${membership} ORDER BY created_at DESC,id LIMIT ? OFFSET ?`).bind(v,p.userId,v,limit,offset).all<Journey>();now(p);return rows.results;},
 };
}
