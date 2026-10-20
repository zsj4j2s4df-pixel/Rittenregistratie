import {membership,TripServiceError,verifiedPrincipal} from './server-access.ts';
import type {SessionResolver} from './trip-service.ts';
export const NATIVE_PENDING_CHOICE_LIMIT=25;
// Read-only recovery feed. Classification is explicit and vehicle-scoped; this
// never asserts the connected phone is the driver or creates a journey/trip.
export function createNativePendingChoiceService(db:Pick<D1Database,'prepare'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 return {async pending(vehicleId:string){
  const p=await verifiedPrincipal(resolveSession,clock);
  if(typeof vehicleId!=='string'||!vehicleId||new TextEncoder().encode(vehicleId).byteLength>128||/[\x00-\x1f\x7f/\\]/.test(vehicleId))throw new TripServiceError(400,'Ongeldig voertuig.');
  if(new TextEncoder().encode(p.userId).byteLength>128||/[\x00-\x1f\x7f/\\]/.test(p.userId)||!Number.isSafeInteger(p.sessionExpiresAt))throw new TripServiceError(401,'Aanmelden vereist.');
  // LEFT JOIN retains one authorized row even with no proposals. Authorization
  // and actual proposal read share a statement; revocation cannot look empty.
  const rows=await db.prepare(`SELECT v.id AS vehicle_id,j.id AS proposal_id,j.revision FROM vehicles v LEFT JOIN (
   SELECT id,vehicle_id,revision FROM vehicle_journeys j WHERE vehicle_id=?
    AND NOT EXISTS(SELECT 1 FROM journey_choices c WHERE c.journey_id=j.id)
    AND NOT EXISTS(SELECT 1 FROM journey_materializations m WHERE m.journey_id=j.id)
   ORDER BY created_at,id LIMIT ${NATIVE_PENDING_CHOICE_LIMIT+1}
  ) j ON j.vehicle_id=v.id WHERE v.id=? AND ${membership}`).bind(vehicleId,vehicleId,p.userId,vehicleId).all<{vehicle_id:string;proposal_id:string|null;revision:number|null}>();
  const now=clock();if(!Number.isFinite(now)||p.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');
  if(!rows.results.length)throw new TripServiceError(403,'Geen toegang tot dit voertuig.');
  const proposals=rows.results.filter(row=>row.proposal_id!==null).map(row=>({id:row.proposal_id!,revision:row.revision!}));
  if(proposals.some(row=>!/^[A-Za-z0-9_-]{16,128}$/.test(row.id)||!Number.isSafeInteger(row.revision)||row.revision<0||row.revision>=Number.MAX_SAFE_INTEGER))throw new TripServiceError(500,'Ongeldig ritvoorstel.');
  return {version:1 as const,viewerId:p.userId,vehicleId,expiresAt:p.sessionExpiresAt,proposals:proposals.slice(0,NATIVE_PENDING_CHOICE_LIMIT),moreAvailable:proposals.length>NATIVE_PENDING_CHOICE_LIMIT};
 }};
}
