import {membership,TripServiceError,vehicleAuthorizer} from './server-access.ts';
import {decodeSettingsRow,settingsReadSql,type SettingsRow,type VehicleSettings} from './settings-service.ts';
import type {SessionResolver} from './trip-service.ts';
import type {BackendTrip,Driver,SavedReport,Vehicle} from '../app/backend-client.ts';
export type VehicleSnapshot={version:1;viewerId:string;fetchedAt:number;vehicle:Vehicle;trips:BackendTrip[];settings:VehicleSettings;drivers:Driver[];reports:SavedReport[]};
// D1 batch statements execute transactionally. This is a bounded full refresh,
// not an incremental cursor or a durable offline queue. Every query is scoped.
export function createSyncService(db:Pick<D1Database,'prepare'|'batch'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 return {async snapshot(vehicleId:string):Promise<VehicleSnapshot>{
  const principal=await vehicleAuthorizer(db,resolveSession,clock)(vehicleId);
  const statements=[
   db.prepare(`SELECT id,display_name,registration_plate FROM vehicles WHERE id=? AND ${membership}`).bind(vehicleId,principal.userId,vehicleId),
   db.prepare(`SELECT id,revision,status,needs_review,started_at,ended_at,start_address,end_address,distance_km,classification,driver_id,odometer_start,odometer_end,purpose FROM trips WHERE vehicle_id=? AND ${membership} ORDER BY started_at,id LIMIT 5001`).bind(vehicleId,principal.userId,vehicleId),
   db.prepare(settingsReadSql).bind(vehicleId,principal.userId,vehicleId),
   db.prepare(`SELECT u.id,u.name FROM users u JOIN vehicle_memberships m ON m.user_id=u.id WHERE m.vehicle_id=? AND m.active=1 AND m.role='admin_driver' AND u.disabled=0 AND u.role='admin_driver' AND ${membership} ORDER BY u.name,u.id LIMIT 1001`).bind(vehicleId,principal.userId,vehicleId),
   db.prepare(`SELECT id,created_by,created_at FROM report_snapshots WHERE vehicle_id=? AND ${membership} ORDER BY created_at DESC,id LIMIT 1001`).bind(vehicleId,principal.userId,vehicleId),
  ];
  const results=await db.batch(statements);
  if(results.length!==5||results.some(r=>!r.success||!Array.isArray(r.results)))throw new TripServiceError(500,'Samenhangend laden is mislukt.');
  const [vehicles,trips,settings,drivers,reports]=results.map(r=>r.results);
  if(vehicles.length!==1||settings.length!==1)throw new TripServiceError(403,'Geen toegang tot dit voertuig.');
  const now=clock();if(!Number.isFinite(now)||principal.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');
  if(trips.length>5000||drivers.length>1000||reports.length>1000)throw new TripServiceError(413,'Te veel gegevens voor één samenhangend overzicht. Gebruik een gerichte export; er is niets afgekapt.');
  const snapshot:VehicleSnapshot={version:1,viewerId:principal.userId,fetchedAt:now,vehicle:vehicles[0] as Vehicle,trips:trips as BackendTrip[],settings:decodeSettingsRow(vehicleId,settings[0] as SettingsRow).settings,drivers:drivers as Driver[],reports:reports as SavedReport[]};
  if(new TextEncoder().encode(JSON.stringify(snapshot)).byteLength>4*1024*1024)throw new TripServiceError(413,'Overzicht te groot; er is niets afgekapt.');
  return snapshot;
 }};
}
