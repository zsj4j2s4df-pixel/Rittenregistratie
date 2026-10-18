import { verifiedPrincipal, TripServiceError, vehicleAuthorizer, membership } from './server-access.ts';
import type { SessionResolver } from './trip-service.ts';
export async function listAccessibleVehicles(db:Pick<D1Database,'prepare'>,resolveSession:SessionResolver=async()=>null,limit=50,offset=0,clock=()=>Date.now()){
 const p=await verifiedPrincipal(resolveSession,clock);
 if(!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new TripServiceError(400,'Ongeldige paginering.');
 const user=await db.prepare("SELECT 1 FROM users WHERE id=? AND disabled=0 AND role='admin_driver'").bind(p.userId).first();
 if(!user)throw new TripServiceError(403,'Geen actieve toegang.');
 return (await db.prepare(`SELECT v.id,v.display_name,v.registration_plate FROM vehicles v JOIN vehicle_memberships m ON m.vehicle_id=v.id JOIN users u ON u.id=m.user_id WHERE m.user_id=? AND m.active=1 AND m.role='admin_driver' AND u.disabled=0 AND u.role='admin_driver' ORDER BY v.display_name,v.id LIMIT ? OFFSET ?`).bind(p.userId,limit,offset).all<{id:string;display_name:string;registration_plate:string|null}>()).results;
}

// Only active drivers on this vehicle; never expose auth IDs, emails or other vehicles.
export async function listVehicleDrivers(db:Pick<D1Database,'prepare'>,resolveSession:SessionResolver,vehicleId:string,limit=50,offset=0,clock=()=>Date.now()){
 const principal=await vehicleAuthorizer(db,resolveSession,clock)(vehicleId);
 if(!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new TripServiceError(400,'Ongeldige paginering.');
 return (await db.prepare(`SELECT u.id,u.name FROM users u JOIN vehicle_memberships m ON m.user_id=u.id WHERE m.vehicle_id=? AND m.active=1 AND m.role='admin_driver' AND u.disabled=0 AND u.role='admin_driver' AND ${membership} ORDER BY u.name,u.id LIMIT ? OFFSET ?`).bind(vehicleId,principal.userId,vehicleId,limit,offset).all<{id:string;name:string}>()).results;
}
