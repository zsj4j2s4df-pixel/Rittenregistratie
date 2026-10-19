import type {Principal} from './access-policy.ts';
import {membership,TripServiceError} from './server-access.ts';
// Optional backwards-compatible receipts. Identity is supplied only by the
// caller's verified vehicle authorizer, never from stored browser payloads.
export function mutationReceipts(db:Pick<D1Database,'prepare'>,p:Principal,vehicleId:string,operation:'trip-edit'|'settings',entityId:string,requestId:string|undefined,canonical:string,clock:()=>number){
 if(requestId!==undefined&&(typeof requestId!=='string'||!/^[A-Za-z0-9_-]{16,128}$/.test(requestId)))throw new TripServiceError(400,'Ongeldige herhaalcode.');
 const enabled=requestId!==undefined;
 if(enabled&&new TextEncoder().encode(canonical).length>16384)throw new TripServiceError(413,'Herstelbare aanvraag te groot.');
 return {
  guard:enabled?'NOT EXISTS(SELECT 1 FROM mutation_requests WHERE vehicle_id=? AND user_id=? AND request_id=?) AND (SELECT count(*) FROM mutation_requests WHERE vehicle_id=? AND user_id=?)<10000':'1=1',
  params:enabled?[vehicleId,p.userId,requestId,vehicleId,p.userId]:[],
  async read<T>():Promise<T|null>{
   if(!enabled)return null;
   const row=await db.prepare(`SELECT operation,entity_id,request_json,response_json FROM mutation_requests WHERE vehicle_id=? AND user_id=? AND request_id=? AND ${membership}`).bind(vehicleId,p.userId,requestId,p.userId,vehicleId).first<{operation:string;entity_id:string;request_json:string;response_json:string}>();
   const now=clock();if(!Number.isFinite(now)||p.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');
   if(!row)return null;if(row.operation!==operation||row.entity_id!==entityId||row.request_json!==canonical)throw new TripServiceError(409,'Herhaalcode hoort bij een andere wijziging.');return JSON.parse(row.response_json) as T;
  },
  insert<T>(response:T,gate:string,args:unknown[]){
   if(!enabled)return null;const json=JSON.stringify(response);if(new TextEncoder().encode(json).length>65536)throw new TripServiceError(413,'Herstelbare bevestiging te groot.');
   return db.prepare(`INSERT INTO mutation_requests(vehicle_id,user_id,request_id,operation,entity_id,request_json,response_json) SELECT ?,?,?,?,?,?,? WHERE ${gate}`).bind(vehicleId,p.userId,requestId,operation,entityId,canonical,json,...args);
  },
 };
}
