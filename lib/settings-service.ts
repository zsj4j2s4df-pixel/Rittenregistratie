import {mutationReceipts} from './mutation-receipts.ts';
import { membership, TripServiceError, vehicleAuthorizer } from './server-access.ts';
import type { SessionResolver } from './trip-service.ts';
import { validateRates, type MileageRate } from '../app/report-domain.ts';
import type { Principal } from './access-policy.ts';

export type StoredAddress = { id: string; label: string; address: string; enabled: boolean; note: string; kind?: 'business'|'private'; businessRole?: 'customer'|'supplier' };
export type VehicleSettings = { revision: number; plate: string; addresses: StoredAddress[]; rates: MileageRate[] };
export type SettingsEdit = VehicleSettings & { reason: string;requestId?:string };

export type SettingsRow={revision:number;plate:string|null;addresses:string;rates:string};
export const settingsReadSql=`SELECT settings_revision AS revision,registration_plate AS plate,
   (SELECT json_group_array(json_object('id',id,'label',label,'address',address,'enabled',enabled,'note',COALESCE(notes,''),'kind',kind,'businessRole',business_role)) FROM (SELECT * FROM business_addresses WHERE vehicle_id=vehicles.id ORDER BY id)) AS addresses,
   (SELECT json_group_array(json_object('id',id,'micros',amount_micros,'start',valid_from,'end',valid_until)) FROM (SELECT * FROM mileage_rates WHERE vehicle_id=vehicles.id ORDER BY valid_from,id)) AS rates
   FROM vehicles WHERE id=? AND ${membership}`;
export function decodeSettingsRow(vehicleId:string,row:SettingsRow){
 const dateString=(value:number)=>new Date(value*1000).toISOString().slice(0,10);
  const prefix=`${vehicleId.length}:${vehicleId}:`;
  const externalId=(id:string)=>id.startsWith(prefix)?id.slice(prefix.length):id;
  const rates=JSON.parse(row.rates) as {id:string;micros:number|null;start:number;end:number|null}[];
  if(rates.some(r=>r.micros===null||!Number.isSafeInteger(r.start)||r.start%86400!==0||(r.end!==null&&(!Number.isSafeInteger(r.end)||r.end%86400!==0)))) throw new TripServiceError(409,'Bestaande tarieven vragen gecontroleerde conversie naar micro-euro en datumgrenzen.');
  const addresses=JSON.parse(row.addresses) as (Omit<StoredAddress,'enabled'>&{enabled:number})[];
  const addressIds=new Map(addresses.map(a=>[externalId(a.id),a.id]));
  const rateIds=new Map(rates.map(r=>[externalId(r.id),r.id]));
  if(addressIds.size!==addresses.length||rateIds.size!==rates.length)throw new TripServiceError(409,'Bestaande instellingen hebben conflicterende IDs; gecontroleerd herstel nodig.');
  const settings: VehicleSettings={revision:row.revision,plate:row.plate??'',addresses:addresses.map(a=>({id:externalId(a.id),label:a.label,address:a.address,note:a.note,enabled:a.enabled===1,...(a.kind==='private'?{kind:'private' as const}:{}),...(a.businessRole?{businessRole:a.businessRole}:{})})),rates:rates.map(r=>({id:externalId(r.id),microsPerKm:r.micros!,validFrom:dateString(r.start),...(r.end===null?{}:{validUntil:dateString(r.end)})}))};
  return {settings,addressIds,rateIds};
}

export function createSettingsService(db: Pick<D1Database,'prepare'|'batch'>, resolveSession: SessionResolver = async()=>null, clock = ()=>Date.now()) {
 const authorize = vehicleAuthorizer(db,resolveSession,clock);
 const dateSeconds = (date: string) => Date.parse(date+'T00:00:00Z') / 1000;

 async function read(principal: Principal, vehicleId: string) {
  // Single statement => a coherent snapshot, not plate/rates from different revisions.
  const row=await db.prepare(settingsReadSql).bind(vehicleId,principal.userId,vehicleId).first<SettingsRow>();
  if(!row)throw new TripServiceError(403,'Geen toegang tot dit voertuig.');
  return decodeSettingsRow(vehicleId,row);
 }
 function normalize(input: SettingsEdit): VehicleSettings {
  if(!input || !Number.isSafeInteger(input.revision) || input.revision<0 || input.revision>=Number.MAX_SAFE_INTEGER || typeof input.reason!=='string' || !input.reason.trim() || input.reason.length>500 || typeof input.plate!=='string' || !Array.isArray(input.addresses) || input.addresses.length>100 || !Array.isArray(input.rates) || input.rates.length>100 || input.addresses.length+input.rates.length>40) throw new TripServiceError(400,'Ongeldige instellingen.');
  const plate=input.plate.trim().toUpperCase();
  if(plate.length>16 || (plate&&!/^[A-Z0-9 -]+$/.test(plate))) throw new TripServiceError(400,'Ongeldig kenteken.');
  const id=(v:unknown)=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,128}$/.test(v);
  const ids=new Set<string>();
  const addresses=input.addresses.map(a=>{
   if(!a||!id(a.id)||ids.has(a.id)||typeof a.label!=='string'||!a.label.trim()||a.label.length>100||typeof a.address!=='string'||!a.address.trim()||a.address.length>450||typeof a.enabled!=='boolean'||typeof a.note!=='string'||a.note.length>1000)throw new TripServiceError(400,'Ongeldig voorkeursadres.');
   if((a.kind!==undefined&&!['business','private'].includes(a.kind))||(a.businessRole!==undefined&&!['customer','supplier'].includes(a.businessRole))||(a.kind==='private'&&a.businessRole!==undefined))throw new TripServiceError(400,'Ongeldige adressoort of zakelijke relatie.');
   ids.add(a.id);return {...(a.kind==='private'?{kind:'private' as const}:{}),...(a.businessRole?{businessRole:a.businessRole}:{}),id:a.id,label:a.label.trim(),address:a.address.trim(),enabled:a.enabled,note:a.note.trim()};
  }).sort((a,b)=>a.id.localeCompare(b.id));
  try { if(input.rates.some(r=>!r||!id(r.id)||typeof r.validFrom!=='string'||(r.validUntil!==undefined&&typeof r.validUntil!=='string')))throw Error();validateRates(input.rates); } catch { throw new TripServiceError(400,'Ongeldige of overlappende tariefperioden.'); }
  const rates=input.rates.map(r=>({id:r.id,microsPerKm:r.microsPerKm,validFrom:r.validFrom,...(r.validUntil===undefined?{}:{validUntil:r.validUntil})})).sort((a,b)=>a.validFrom.localeCompare(b.validFrom)||a.id.localeCompare(b.id));
  return {revision:input.revision+1,plate,addresses,rates};
 }
 return {
  async get(vehicleId:string){return (await read(await authorize(vehicleId),vehicleId)).settings;},
  async history(vehicleId:string,limit=50,before?:number){const p=await authorize(vehicleId);if(!Number.isSafeInteger(limit)||limit<1||limit>100||(before!==undefined&&(!Number.isSafeInteger(before)||before<1)))throw new TripServiceError(400,'Ongeldige paginering.');return (await db.prepare(`SELECT * FROM audit_logs WHERE entity_type='vehicle_settings' AND entity_id=? AND ${membership} AND (? IS NULL OR id<?) ORDER BY id DESC LIMIT ?`).bind(vehicleId,p.userId,vehicleId,before??null,before??null,limit).all()).results;},
  async save(vehicleId:string,input:SettingsEdit){
   const p=await authorize(vehicleId);const after=normalize(input);const recovery=mutationReceipts(db,p,vehicleId,'settings',vehicleId,input.requestId,JSON.stringify({expectedRevision:input.revision,...after,reason:input.reason.trim()}),clock);const replay=await recovery.read<VehicleSettings>();if(replay)return replay;const record=await read(p,vehicleId);const before=record.settings;
   for(const old of before.addresses)if(old.kind==='private'&&input.addresses.some(a=>a.id===old.id&&a.kind===undefined))throw new TripServiceError(409,'Privéadres mist de adressoort; laad het actuele adrescontract opnieuw.');
   if(before.revision!==input.revision)throw new TripServiceError(409,'Instellingen zijn gewijzigd; laad opnieuw.');
   const now=clock();if(!Number.isFinite(now)||p.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');
   const occurredAt=Math.floor(now/1000);if(!Number.isSafeInteger(occurredAt))throw new TripServiceError(500,'Ongeldige servertijd.');
   const marker=crypto.randomUUID();
   const gate='EXISTS (SELECT 1 FROM vehicles WHERE id=? AND settings_mutation_id=?)';
   // IDs are scoped in API input, globally unique in legacy tables. Prefix with
   // vehicle length to avoid separator collisions, never take another vehicle ID.
   const scopedId=(id:string)=>`${vehicleId.length}:${vehicleId}:${id}`;
   const addressId=(id:string)=>record.addressIds.get(id)??scopedId(id);
   const rateId=(id:string)=>record.rateIds.get(id)??scopedId(id);
   const statements=[
    db.prepare(`UPDATE vehicles SET registration_plate=?,settings_revision=settings_revision+1,settings_mutation_id=? WHERE id=? AND settings_revision=? AND ${membership} AND ${recovery.guard}`).bind(after.plate||null,marker,vehicleId,input.revision,p.userId,vehicleId,...recovery.params),
    db.prepare(`DELETE FROM business_addresses WHERE vehicle_id=? AND id NOT IN (${after.addresses.map(()=>'?').join(',')||"''"}) AND ${gate}`).bind(vehicleId,...after.addresses.map(a=>addressId(a.id)),vehicleId,marker),
    db.prepare(`DELETE FROM mileage_rates WHERE vehicle_id=? AND id NOT IN (${after.rates.map(()=>'?').join(',')||"''"}) AND ${gate}`).bind(vehicleId,...after.rates.map(r=>rateId(r.id)),vehicleId,marker),
    ...after.addresses.map(a=>db.prepare(`INSERT INTO business_addresses(id,vehicle_id,label,address,enabled,notes,created_by,created_at,kind,business_role) SELECT ?,?,?,?,?,?,?,?,?,? WHERE ${gate}
     ON CONFLICT(id) DO UPDATE SET id=CASE WHEN business_addresses.vehicle_id=excluded.vehicle_id THEN business_addresses.id ELSE NULL END,label=excluded.label,address=excluded.address,enabled=excluded.enabled,notes=excluded.notes,kind=excluded.kind,business_role=excluded.business_role,
       latitude=CASE WHEN business_addresses.address=excluded.address THEN business_addresses.latitude ELSE NULL END,
       longitude=CASE WHEN business_addresses.address=excluded.address THEN business_addresses.longitude ELSE NULL END
`).bind(addressId(a.id),vehicleId,a.label,a.address,a.enabled?1:0,a.note,p.userId,occurredAt,a.kind??'business',a.businessRole??null,vehicleId,marker)),
    ...after.rates.map(r=>db.prepare(`INSERT INTO mileage_rates(id,vehicle_id,amount_per_km,amount_micros,valid_from,valid_until,created_by) SELECT ?,?,?,?,?,?,? WHERE ${gate}
     ON CONFLICT(id) DO UPDATE SET id=CASE WHEN mileage_rates.vehicle_id=excluded.vehicle_id THEN mileage_rates.id ELSE NULL END,amount_per_km=excluded.amount_per_km,amount_micros=excluded.amount_micros,valid_from=excluded.valid_from,valid_until=excluded.valid_until,
       source_url=CASE WHEN mileage_rates.amount_micros=excluded.amount_micros AND mileage_rates.valid_from=excluded.valid_from AND mileage_rates.valid_until IS excluded.valid_until THEN mileage_rates.source_url ELSE NULL END
`).bind(rateId(r.id),vehicleId,r.microsPerKm/1_000_000,r.microsPerKm,dateSeconds(r.validFrom),r.validUntil===undefined?null:dateSeconds(r.validUntil),p.userId,vehicleId,marker)),
    db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) SELECT ?,'vehicle_settings',?,'update',?,?,? WHERE ${gate}`).bind(p.userId,vehicleId,JSON.stringify(before),JSON.stringify({...after,correction_reason:input.reason.trim()}),occurredAt,vehicleId,marker),
   ];
   const receipt=recovery.insert(after,gate,[vehicleId,marker]);if(receipt)statements.push(receipt);
   const results=await db.batch(statements);const saved=await recovery.read<VehicleSettings>();if(saved)return saved;
   if(results[0].meta.changes!==1||results.at(-1)!.meta.changes!==1)throw new TripServiceError(409,'Instellingen of rechten zijn gewijzigd; laad opnieuw.');
   return after;
  },
 };
}
