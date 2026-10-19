import {membership,TripServiceError,vehicleAuthorizer} from './server-access.ts';
import type {SessionResolver} from './trip-service.ts';
export type JourneyChoiceInput={requestId:string;expectedRevision:number;classification:'business'|'private';reason:string};
export type JourneyChoiceReceipt={journeyId:string;viewerId:string;requestId:string;revision:number;classification:'business'|'private'};
const id=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_-]{16,128}$/.test(v);
// A user's explicit classification is not a verified driver or fiscal approval.
export function createJourneyChoiceService(db:Pick<D1Database,'prepare'|'batch'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 const authorize=vehicleAuthorizer(db,resolveSession,clock);
 return {async choose(vehicleId:string,journeyId:string,input:JourneyChoiceInput){
  const p=await authorize(vehicleId);if(!id(journeyId)||!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['requestId','expectedRevision','classification','reason'].includes(k))||!id(input.requestId)||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||input.expectedRevision>=Number.MAX_SAFE_INTEGER||!['business','private'].includes(input.classification)||typeof input.reason!=='string'||!input.reason.trim()||input.reason.length>500)throw new TripServiceError(400,'Ongeldige ritkeuze.');
  const canonical=JSON.stringify({journeyId,expectedRevision:input.expectedRevision,classification:input.classification,reason:input.reason.trim()});
  function time(){const n=clock();if(!Number.isFinite(n)||n>=p.sessionExpiresAt)throw new TripServiceError(401,'Aanmelden vereist.');const seconds=Math.floor(n/1000);if(!Number.isSafeInteger(seconds)||seconds<0||seconds>253402300799)throw new TripServiceError(500,'Ongeldige servertijd.');return seconds;}
  async function receipt(){const row=await db.prepare(`SELECT request_json,response_json FROM journey_choices WHERE vehicle_id=? AND user_id=? AND request_id=? AND ${membership}`).bind(vehicleId,p.userId,input.requestId,p.userId,vehicleId).first<{request_json:string;response_json:string}>();time();if(!row)return null;if(row.request_json!==canonical)throw new TripServiceError(409,'Herhaalcode hoort bij een andere ritkeuze.');return JSON.parse(row.response_json) as JourneyChoiceReceipt;}
  const previous=await receipt();if(previous)return previous;
  if(await db.prepare(`SELECT 1 FROM journey_materializations WHERE journey_id=? AND vehicle_id=? AND ${membership}`).bind(journeyId,vehicleId,p.userId,vehicleId).first())throw new TripServiceError(409,'Ritbewijs is overgezet; corrigeer voortaan de logboekrit.');
  const before=await db.prepare(`SELECT revision,(SELECT classification FROM journey_choices c WHERE c.journey_id=vehicle_journeys.id ORDER BY c.revision DESC LIMIT 1) AS classification FROM vehicle_journeys WHERE id=? AND vehicle_id=? AND ${membership}`).bind(journeyId,vehicleId,p.userId,vehicleId).first<{revision:number;classification:'business'|'private'|null}>();if(!before)throw new TripServiceError(404,'Voertuigrit niet gevonden.');if(before.revision!==input.expectedRevision)throw new TripServiceError(409,'Ritbewijs is gewijzigd. Controleer opnieuw vóór classificeren.');
  const response:JourneyChoiceReceipt={journeyId,viewerId:p.userId,requestId:input.requestId,revision:before.revision+1,classification:input.classification},marker=crypto.randomUUID(),now=time();
  const gate='EXISTS(SELECT 1 FROM vehicle_journeys WHERE id=? AND vehicle_id=? AND last_mutation_id=?)',params=[journeyId,vehicleId,marker];
  await db.batch([
   db.prepare(`UPDATE vehicle_journeys SET revision=revision+1,updated_at=?,last_mutation_id=? WHERE id=? AND vehicle_id=? AND revision=? AND ${membership} AND NOT EXISTS(SELECT 1 FROM journey_choices WHERE vehicle_id=? AND user_id=? AND request_id=?) AND (SELECT count(*) FROM journey_choices WHERE journey_id=?)<1000`).bind(now,marker,journeyId,vehicleId,input.expectedRevision,p.userId,vehicleId,vehicleId,p.userId,input.requestId,journeyId),
   db.prepare(`INSERT INTO journey_choices(vehicle_id,user_id,request_id,journey_id,expected_revision,revision,classification,reason,created_at,request_json,response_json) SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE ${gate}`).bind(vehicleId,p.userId,input.requestId,journeyId,input.expectedRevision,response.revision,input.classification,input.reason.trim(),now,canonical,JSON.stringify(response),...params),
   db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) SELECT ?,'vehicle_journey',?,'classify',?,?,? WHERE ${gate}`).bind(p.userId,journeyId,JSON.stringify({revision:before.revision,classification:before.classification}),JSON.stringify({...response,correction_reason:input.reason.trim(),physicalVerification:false}),now,...params),
  ]);
  const saved=await receipt();if(!saved)throw new TripServiceError(409,'Keuze niet uitgevoerd: revisie, toegang of limiet gewijzigd.');return saved;
 }};
}
