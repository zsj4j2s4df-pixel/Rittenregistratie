import {membership,vehicleAuthorizer,TripServiceError} from './server-access.ts';
import type {SessionResolver} from './trip-service.ts';
import type {Principal} from './access-policy.ts';
export type DetectionInput={requestId:string;eventId:string;observedAt:number;source:'gps'|'bluetooth'|'carplay'|'manual';kind:'location'|'start_candidate'|'end_candidate'|'connection'|'disconnection';detail?:string;location?:{latitude:number;longitude:number;accuracyMeters:number}};
export type DetectionObservation={id:string;vehicle_id:string;user_id:string;device_id:string;event_id:string;observed_at:number;received_at:number;source:string;event_kind:string;uncertainty:'unverified_app_observation';payload_json:string};
const identifier=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_-]{16,128}$/.test(v);
const columns='o.id,o.vehicle_id,o.user_id,o.device_id,o.event_id,o.observed_at,o.received_at,o.source,o.event_kind,o.uncertainty,o.payload_json';
const ownActive=`EXISTS (SELECT 1 FROM registered_devices d WHERE d.id=? AND d.vehicle_id=? AND d.user_id=? AND d.active=1) AND ${membership}`;
// Raw claims, not a device credential, GPS attestation, driver determination or trip.
export function createDetectionService(db:Pick<D1Database,'prepare'|'batch'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 const authorize=vehicleAuthorizer(db,resolveSession,clock);
 function timestamp(p:Principal){const now=clock();if(!Number.isFinite(now)||p.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');const seconds=Math.floor(now/1000);if(!Number.isSafeInteger(seconds)||seconds<0||seconds>253402300799)throw new TripServiceError(500,'Ongeldige servertijd.');return seconds;}
 const bindings=(p:Principal,v:string,d:string)=>[d,v,p.userId,p.userId,v];
 async function check(p:Principal,v:string,d:string){if(!identifier(d))throw new TripServiceError(400,'Ongeldige app-instantie.');if(!await db.prepare(`SELECT 1 WHERE ${ownActive}`).bind(...bindings(p,v,d)).first())throw new TripServiceError(403,'Geen actieve eigen app-instantie.');}
 return {
  async list(vehicleId:string,deviceId:string,limit=50,offset=0){const p=await authorize(vehicleId);await check(p,vehicleId,deviceId);if(!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new TripServiceError(400,'Ongeldige paginering.');const rows=await db.prepare(`SELECT ${columns} FROM detection_observations o WHERE o.vehicle_id=? AND o.user_id=? AND o.device_id=? AND ${ownActive} ORDER BY o.received_at,o.id LIMIT ? OFFSET ?`).bind(vehicleId,p.userId,deviceId,...bindings(p,vehicleId,deviceId),limit,offset).all<DetectionObservation>();timestamp(p);await check(p,vehicleId,deviceId);return rows.results;},
  async ingest(vehicleId:string,deviceId:string,input:DetectionInput){
   const p=await authorize(vehicleId);await check(p,vehicleId,deviceId);const now=timestamp(p);
   if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['requestId','eventId','observedAt','source','kind','detail','location'].includes(k))||!identifier(input.requestId)||!identifier(input.eventId)||!Number.isSafeInteger(input.observedAt)||input.observedAt<0||input.observedAt>253402300799||input.observedAt>now+300||!['gps','bluetooth','carplay','manual'].includes(input.source)||!['location','start_candidate','end_candidate','connection','disconnection'].includes(input.kind)||(input.detail!==undefined&&(typeof input.detail!=='string'||input.detail.length>500)))throw new TripServiceError(400,'Ongeldige detectieobservatie.');
   let location:DetectionInput['location'];
   if(input.location!==undefined){const l=input.location;if(!l||typeof l!=='object'||Array.isArray(l)||Object.keys(l).some(k=>!['latitude','longitude','accuracyMeters'].includes(k))||!Number.isFinite(l.latitude)||Math.abs(l.latitude)>90||!Number.isFinite(l.longitude)||Math.abs(l.longitude)>180||!Number.isFinite(l.accuracyMeters)||l.accuracyMeters<0||l.accuracyMeters>100000)throw new TripServiceError(400,'Ongeldige locatieobservatie.');location={latitude:l.latitude,longitude:l.longitude,accuracyMeters:l.accuracyMeters};}
   if((input.kind==='location'&&(!location||input.source!=='gps'))||(location&&input.source!=='gps'))throw new TripServiceError(400,'GPS-locatie en bron zijn niet consistent.');
   const payload={observedAt:input.observedAt,source:input.source,kind:input.kind,...(input.detail===undefined?{}:{detail:input.detail}),...(location?{location}:{})};
   const canonical=JSON.stringify({eventId:input.eventId,...payload});if(new TextEncoder().encode(canonical).byteLength>16384)throw new TripServiceError(413,'Detectieobservatie te groot.');
   async function receipt(){const row=await db.prepare(`SELECT ${columns},r.canonical_json AS receipt_canonical FROM detection_ingest_requests r JOIN detection_observations o ON o.id=r.observation_id WHERE r.vehicle_id=? AND r.user_id=? AND r.device_id=? AND r.request_id=? AND ${ownActive}`).bind(vehicleId,p.userId,deviceId,input.requestId,...bindings(p,vehicleId,deviceId)).first<DetectionObservation&{receipt_canonical:string}>();timestamp(p);await check(p,vehicleId,deviceId);if(!row)return null;if(row.receipt_canonical!==canonical)throw new TripServiceError(409,'Herhaalcode hoort bij andere inhoud.');const {receipt_canonical:ignored,...result}=row;void ignored;return result;}
   const previous=await receipt();if(previous)return previous;
   const marker=crypto.randomUUID(),id=crypto.randomUUID(),receivedAt=timestamp(p),payloadJson=JSON.stringify(payload);
   const after:DetectionObservation={id,vehicle_id:vehicleId,user_id:p.userId,device_id:deviceId,event_id:input.eventId,observed_at:input.observedAt,received_at:receivedAt,source:input.source,event_kind:input.kind,uncertainty:'unverified_app_observation',payload_json:payloadJson};
   await db.batch([
    db.prepare(`INSERT INTO detection_observations(id,vehicle_id,user_id,device_id,event_id,observed_at,received_at,source,event_kind,uncertainty,payload_json,canonical_json,mutation_id) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ${ownActive} AND NOT EXISTS(SELECT 1 FROM detection_ingest_requests WHERE vehicle_id=? AND user_id=? AND device_id=? AND request_id=?) ON CONFLICT(device_id,event_id) DO NOTHING`).bind(...Object.values(after),canonical,marker,...bindings(p,vehicleId,deviceId),vehicleId,p.userId,deviceId,input.requestId),
    db.prepare(`INSERT INTO detection_ingest_requests(vehicle_id,user_id,device_id,request_id,observation_id,canonical_json) SELECT ?,?,?,?,o.id,? FROM detection_observations o WHERE o.device_id=? AND o.event_id=? AND o.vehicle_id=? AND o.user_id=? AND o.canonical_json=? AND ${ownActive} ON CONFLICT(vehicle_id,user_id,device_id,request_id) DO NOTHING`).bind(vehicleId,p.userId,deviceId,input.requestId,canonical,deviceId,input.eventId,vehicleId,p.userId,canonical,...bindings(p,vehicleId,deviceId)),
    db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) SELECT ?,'detection_observation',?,'ingest',NULL,?,? WHERE EXISTS(SELECT 1 FROM detection_observations WHERE id=? AND mutation_id=?)`).bind(p.userId,id,JSON.stringify(after),receivedAt,id,marker),
   ]);
   const saved=await receipt();if(!saved)throw new TripServiceError(409,'Event-ID, app-instantie of toegang gewijzigd.');return saved;
  },
 };
}
