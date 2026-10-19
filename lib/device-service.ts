import {membership,TripServiceError,vehicleAuthorizer} from './server-access.ts';
import type {SessionResolver} from './trip-service.ts';
import type {Principal} from './access-policy.ts';
export type DeviceRegistration={requestId:string;id:string;name:string;platform:'ios'|'web'};
export type DeviceDeactivation={expectedRevision:number;reason:string};
export type RegisteredDevice={id:string;user_id:string;vehicle_id:string;name:string;platform:'ios'|'web';active:number;revision:number;created_at:number;updated_at:number};
// Operational safety defaults per verified user + vehicle, not a retention policy.
export const DEVICE_LIMITS=Object.freeze({registrationsPerUserVehicle:100,receiptsPerUserVehicle:100});
const columns='id,user_id,vehicle_id,name,platform,active,revision,created_at,updated_at';
const identifier=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_-]{16,128}$/.test(v);

// App-instance claims only: registration is not hardware/device attestation and
// grants neither a session nor GPS/driver trust. Every call still needs a session.
export function createDeviceService(db:Pick<D1Database,'prepare'|'batch'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 const authorize=vehicleAuthorizer(db,resolveSession,clock);
 function timestamp(p:Principal){const now=clock();if(!Number.isFinite(now)||p.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');const seconds=Math.floor(now/1000);if(!Number.isSafeInteger(seconds))throw new TripServiceError(500,'Ongeldige servertijd.');return seconds;}
 async function own(p:Principal,vehicleId:string,id:string){
  const row=await db.prepare(`SELECT ${columns} FROM registered_devices WHERE id=? AND vehicle_id=? AND user_id=? AND ${membership}`).bind(id,vehicleId,p.userId,p.userId,vehicleId).first<RegisteredDevice>();
  if(!row)throw new TripServiceError(404,'App-instantie niet gevonden.');return row;
 }
 return {
  async list(vehicleId:string,limit=50,offset=0){const p=await authorize(vehicleId);if(!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new TripServiceError(400,'Ongeldige paginering.');const rows=await db.prepare(`SELECT ${columns} FROM registered_devices WHERE vehicle_id=? AND user_id=? AND ${membership} ORDER BY id LIMIT ? OFFSET ?`).bind(vehicleId,p.userId,p.userId,vehicleId,limit,offset).all<RegisteredDevice>();timestamp(p);return rows.results.map(row=>({...row}));},
  async register(vehicleId:string,input:DeviceRegistration){
   const p=await authorize(vehicleId);
   if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['requestId','id','name','platform'].includes(k))||!identifier(input.requestId)||!identifier(input.id)||typeof input.name!=='string'||!input.name.trim()||input.name.length>100||!['ios','web'].includes(input.platform))throw new TripServiceError(400,'Ongeldige appregistratie.');
   const canonical=JSON.stringify({id:input.id,name:input.name.trim(),platform:input.platform});
   async function receipt(){
    const row=await db.prepare(`SELECT r.request_json,r.response_json,d.active FROM device_register_requests r JOIN registered_devices d ON d.id=r.device_id AND d.user_id=r.user_id AND d.vehicle_id=r.vehicle_id WHERE r.vehicle_id=? AND r.user_id=? AND r.request_id=? AND ${membership}`).bind(vehicleId,p.userId,input.requestId,p.userId,vehicleId).first<{request_json:string;response_json:string;active:number}>();
    timestamp(p);if(!row)return null;if(row.request_json!==canonical)throw new TripServiceError(409,'Herhaalcode hoort bij een andere registratie.');if(row.active!==1)throw new TripServiceError(409,'App-instantie is gedeactiveerd; deze registratie wordt niet herhaald.');return JSON.parse(row.response_json) as RegisteredDevice;
   }
   const previous=await receipt();if(previous)return previous;
   const now=timestamp(p),marker=crypto.randomUUID();
   const after:RegisteredDevice={id:input.id,user_id:p.userId,vehicle_id:vehicleId,name:input.name.trim(),platform:input.platform,active:1,revision:0,created_at:now,updated_at:now};
   const gate='EXISTS (SELECT 1 FROM registered_devices WHERE id=? AND vehicle_id=? AND user_id=? AND last_mutation_id=?)';
   await db.batch([
    db.prepare(`INSERT INTO registered_devices(${columns},last_mutation_id) SELECT ?,?,?,?,?,?,?,?,?,? WHERE ${membership} AND (SELECT count(*) FROM registered_devices WHERE vehicle_id=? AND user_id=?)<? AND (SELECT count(*) FROM device_register_requests WHERE vehicle_id=? AND user_id=?)<? AND NOT EXISTS (SELECT 1 FROM device_register_requests WHERE vehicle_id=? AND user_id=? AND request_id=?) ON CONFLICT(id) DO NOTHING`).bind(...Object.values(after),marker,p.userId,vehicleId,vehicleId,p.userId,DEVICE_LIMITS.registrationsPerUserVehicle,vehicleId,p.userId,DEVICE_LIMITS.receiptsPerUserVehicle,vehicleId,p.userId,input.requestId),
    db.prepare(`INSERT INTO device_register_requests(vehicle_id,user_id,request_id,device_id,request_json,response_json) SELECT ?,?,?,?,?,? WHERE ${gate}`).bind(vehicleId,p.userId,input.requestId,input.id,canonical,JSON.stringify(after),input.id,vehicleId,p.userId,marker),
    db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) SELECT ?,'device',?,'register',NULL,?,? WHERE ${gate}`).bind(p.userId,input.id,JSON.stringify(after),now,input.id,vehicleId,p.userId,marker),
   ]);
   const saved=await receipt();if(saved)return saved;
   const quota=await db.prepare(`SELECT (SELECT count(*) FROM registered_devices WHERE vehicle_id=? AND user_id=?) AS devices,(SELECT count(*) FROM device_register_requests WHERE vehicle_id=? AND user_id=?) AS receipts WHERE ${membership}`).bind(vehicleId,p.userId,vehicleId,p.userId,p.userId,vehicleId).first<{devices:number;receipts:number}>();
   timestamp(p);
   // Preserve a generic ID conflict without disclosing foreign owner/platform data.
   if(!quota||await db.prepare('SELECT 1 FROM registered_devices WHERE id=?').bind(input.id).first())throw new TripServiceError(409,'Registratie niet uitgevoerd: ID of toegangsrechten zijn gewijzigd.');
   if(quota.devices>=DEVICE_LIMITS.registrationsPerUserVehicle||quota.receipts>=DEVICE_LIMITS.receiptsPerUserVehicle)throw new TripServiceError(429,'Veiligheidslimiet voor appregistraties bereikt; bestaande registraties blijven behouden.');
   throw new TripServiceError(409,'Registratie niet uitgevoerd: ID of toegangsrechten zijn gewijzigd.');
  },
  async deactivate(vehicleId:string,id:string,input:DeviceDeactivation){
   const p=await authorize(vehicleId);
   if(!identifier(id)||!input||typeof input!=='object'||Object.keys(input).some(k=>!['expectedRevision','reason'].includes(k))||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||input.expectedRevision>=Number.MAX_SAFE_INTEGER||typeof input.reason!=='string'||!input.reason.trim()||input.reason.length>500)throw new TripServiceError(400,'Ongeldige deactivering.');
   const before=await own(p,vehicleId,id);
   if(before.revision!==input.expectedRevision||before.active!==1)throw new TripServiceError(409,'App-instantie is gewijzigd of al gedeactiveerd.');
   const now=timestamp(p),marker=crypto.randomUUID(),after={...before,active:0,revision:before.revision+1,updated_at:now};
   const results=await db.batch([
    db.prepare(`UPDATE registered_devices SET active=0,revision=revision+1,updated_at=?,last_mutation_id=? WHERE id=? AND vehicle_id=? AND user_id=? AND revision=? AND active=1 AND ${membership}`).bind(now,marker,id,vehicleId,p.userId,input.expectedRevision,p.userId,vehicleId),
    db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) SELECT ?,'device',?,'deactivate',?,?,? WHERE EXISTS (SELECT 1 FROM registered_devices WHERE id=? AND vehicle_id=? AND user_id=? AND last_mutation_id=?)`).bind(p.userId,id,JSON.stringify(before),JSON.stringify({...after,correction_reason:input.reason.trim()}),now,id,vehicleId,p.userId,marker),
   ]);
   if(results[0].meta.changes!==1||results[1].meta.changes!==1)throw new TripServiceError(409,'App-instantie of toegangsrechten zijn gewijzigd.');timestamp(p);return after;
  },
 };
}
