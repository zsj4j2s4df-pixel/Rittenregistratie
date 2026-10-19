import {membership,TripServiceError,vehicleAuthorizer} from './server-access.ts';
import type {SessionResolver,StoredTrip} from './trip-service.ts';
import {milliKm} from './report-values.ts';
export type TripReviewInput={requestId:string;expectedRevision:number;confirmed:true;reason:string};
export type TripReviewReceipt={tripId:string;viewerId:string;requestId:string;revision:number;status:'final';needsReview:false};
// "final" means explicitly reviewed logbook data, never fiscal approval or GPS attestation.
export function createTripReviewService(db:Pick<D1Database,'prepare'|'batch'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 const authorize=vehicleAuthorizer(db,resolveSession,clock);
 return {async review(vehicleId:string,tripId:string,input:TripReviewInput):Promise<TripReviewReceipt>{
  const p=await authorize(vehicleId);
  if(typeof tripId!=='string'||!tripId||tripId.length>128||!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['requestId','expectedRevision','confirmed','reason'].includes(k))||typeof input.requestId!=='string'||!/^[A-Za-z0-9_-]{16,128}$/.test(input.requestId)||input.confirmed!==true||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||input.expectedRevision>=Number.MAX_SAFE_INTEGER||typeof input.reason!=='string'||!input.reason.trim()||input.reason.length>500)throw new TripServiceError(400,'Bevestig de controle met actuele versie en reden.');
  const canonical=JSON.stringify({tripId,expectedRevision:input.expectedRevision,confirmed:true,reason:input.reason.trim()});
  function now(){const value=clock(),seconds=Math.floor(value/1000);if(!Number.isFinite(value)||value>=p.sessionExpiresAt)throw new TripServiceError(401,'Aanmelden vereist.');if(!Number.isSafeInteger(seconds)||seconds<0||seconds>253402300799)throw new TripServiceError(500,'Ongeldige servertijd.');return seconds;}
  async function replay(){const row=await db.prepare(`SELECT request_json,response_json FROM trip_review_requests WHERE vehicle_id=? AND user_id=? AND request_id=? AND ${membership}`).bind(vehicleId,p.userId,input.requestId,p.userId,vehicleId).first<{request_json:string;response_json:string}>();now();if(!row)return null;if(row.request_json!==canonical)throw new TripServiceError(409,'Herhaalcode hoort bij een andere ritcontrole.');return JSON.parse(row.response_json) as TripReviewReceipt;}
  const previous=await replay();if(previous)return previous;
  const before=await db.prepare(`SELECT * FROM trips WHERE id=? AND vehicle_id=? AND ${membership}`).bind(tripId,vehicleId,p.userId,vehicleId).first<StoredTrip>();now();
  if(!before)throw new TripServiceError(404,'Rit niet gevonden.');
  if(before.revision!==input.expectedRevision||before.status==='final'&&before.needs_review===0)throw new TripServiceError(409,'Rit is gewijzigd of al gecontroleerd; laad de actuele versie.');
  const validText=(v:unknown)=>typeof v==='string'&&Boolean(v.trim());
  if(!Number.isSafeInteger(before.started_at)||!Number.isSafeInteger(before.ended_at)||!Number.isFinite(new Date(Number(before.started_at)*1000).getTime())||!Number.isFinite(new Date(Number(before.ended_at)*1000).getTime())||Number(before.ended_at)<=Number(before.started_at)||!validText(before.start_address)||!validText(before.end_address)||!validText(before.driver_id)||!['business','private'].includes(String(before.classification))||typeof before.distance_km!=='number'||before.distance_km<=0)throw new TripServiceError(409,'Vul eerst tijden, adressen, afstand, bestuurder en ritsoort aan.');
  try{milliKm(before.distance_km);}catch{throw new TripServiceError(409,'Controleer de opgeslagen afstand vóór afronden.');}
  if(!await db.prepare(`SELECT 1 WHERE ${membership}`).bind(before.driver_id,vehicleId).first())throw new TripServiceError(409,'De opgegeven bestuurder heeft geen actieve voertuigtoegang.');
  const time=now(),marker=crypto.randomUUID(),revision=before.revision+1,response:TripReviewReceipt={tripId,viewerId:p.userId,requestId:input.requestId,revision,status:'final',needsReview:false};
  const gate='EXISTS(SELECT 1 FROM trips WHERE id=? AND vehicle_id=? AND last_mutation_id=?)',args=[tripId,vehicleId,marker];
  await db.batch([
   db.prepare(`UPDATE trips SET status='final',needs_review=0,revision=revision+1,updated_at=?,last_mutation_id=? WHERE id=? AND vehicle_id=? AND revision=? AND driver_id=? AND ${membership} AND ${membership} AND NOT EXISTS(SELECT 1 FROM trip_review_requests WHERE vehicle_id=? AND user_id=? AND request_id=?) AND (SELECT count(*) FROM trip_review_requests WHERE trip_id=?)<1000 AND (SELECT count(*) FROM trip_review_requests WHERE vehicle_id=? AND user_id=?)<10000`).bind(time,marker,tripId,vehicleId,input.expectedRevision,before.driver_id,p.userId,vehicleId,before.driver_id,vehicleId,vehicleId,p.userId,input.requestId,tripId,vehicleId,p.userId),
   db.prepare(`INSERT INTO trip_review_requests(vehicle_id,user_id,request_id,trip_id,expected_revision,revision,request_json,response_json) SELECT ?,?,?,?,?,?,?,? WHERE ${gate}`).bind(vehicleId,p.userId,input.requestId,tripId,input.expectedRevision,revision,canonical,JSON.stringify(response),...args),
   db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) SELECT ?,'trip',?,'review',?,?,? WHERE ${gate}`).bind(p.userId,tripId,JSON.stringify(before),JSON.stringify({...before,status:'final',needs_review:0,revision,updated_at:time,last_mutation_id:marker,requestId:input.requestId,correction_reason:input.reason.trim(),physicalVerification:false,fiscalApproval:false}),time,...args),
  ]);
  const saved=await replay();if(!saved)throw new TripServiceError(409,'Controle niet uitgevoerd: versie, toegang of limiet is gewijzigd.');return saved;
 }};
}
