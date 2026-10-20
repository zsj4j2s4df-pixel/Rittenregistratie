import {membership,TripServiceError,verifiedPrincipal} from './server-access.ts';
import type {SessionResolver} from './trip-service.ts';
// Minimal, read-only verified scope. No token, email, plate, trip or name.
// expiresAt is Unix milliseconds; no client identity assertion is trusted.
export function createNativeSessionService(db:Pick<D1Database,'prepare'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 return {async scope(vehicleId:string){
  const p=await verifiedPrincipal(resolveSession,clock);
  if(typeof vehicleId!=='string'||!vehicleId||vehicleId.length>128||/[\x00-\x1f\x7f/\\]/.test(vehicleId))throw new TripServiceError(400,'Ongeldig voertuig.');
  if(new TextEncoder().encode(p.userId).byteLength>128||/[\x00-\x1f\x7f]/.test(p.userId)||!Number.isSafeInteger(p.sessionExpiresAt))throw new TripServiceError(401,'Aanmelden vereist.');
  const row=await db.prepare(`SELECT id FROM vehicles WHERE id=? AND ${membership}`).bind(vehicleId,p.userId,vehicleId).first();
  if(!row)throw new TripServiceError(403,'Geen toegang tot dit voertuig.');
  const now=clock();if(!Number.isFinite(now)||p.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');
  return {version:1 as const,viewerId:p.userId,vehicleId,expiresAt:p.sessionExpiresAt};
 }};
}
