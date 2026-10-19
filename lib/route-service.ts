import {membership,TripServiceError,vehicleAuthorizer} from './server-access.ts';
import type {SessionResolver} from './trip-service.ts';

export type RoutePoint={id:number;recorded_at:number;latitude:number;longitude:number;accuracy_meters:number|null;source:string};
export type RoutePage={points:RoutePoint[];through:number;nextAfter:number|null};

// Read existing observations only. Their presence/source is not proof of GPS
// accuracy, complete coverage or a recorded trip; no interpolation or ingestion.
export function createRouteService(db:Pick<D1Database,'prepare'|'batch'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 const authorize=vehicleAuthorizer(db,resolveSession,clock);
 return {async points(vehicleId:string,tripId:string,limit=250,after=0,through?:number):Promise<RoutePage>{
  const principal=await authorize(vehicleId);
  if(typeof tripId!=='string'||!tripId||tripId.length>128)throw new TripServiceError(400,'Ongeldige rit.');
  if(!Number.isSafeInteger(limit)||limit<1||limit>500||!Number.isSafeInteger(after)||after<0||(through!==undefined&&(!Number.isSafeInteger(through)||through<0||after>through)))throw new TripServiceError(400,'Ongeldige routepaginering.');
  // Both statements share a D1 read transaction. On the first page the same
  // trip-only MAX(id) bounds the response and the selected points. Subsequent
  // pages carry that bound explicitly, even if new observations arrive.
  const results=await db.batch([
   db.prepare(`SELECT COALESCE((SELECT MAX(p.id) FROM route_points p WHERE p.trip_id=t.id),0) AS highwater
    FROM trips t WHERE t.id=? AND t.vehicle_id=? AND ${membership}`)
    .bind(tripId,vehicleId,principal.userId,vehicleId),
   db.prepare(`SELECT p.id,p.recorded_at,p.latitude,p.longitude,p.accuracy_meters,p.source
    FROM route_points p JOIN trips t ON t.id=p.trip_id
    WHERE t.id=? AND t.vehicle_id=? AND ${membership} AND p.id>? AND p.id<=COALESCE(?,(SELECT COALESCE(MAX(bound.id),0) FROM route_points bound WHERE bound.trip_id=t.id))
    ORDER BY p.id LIMIT ?`)
    .bind(tripId,vehicleId,principal.userId,vehicleId,after,through??null,limit+1),
  ]);
  if(results.length!==2||results.some(result=>!result.success||!Array.isArray(result.results)))throw new TripServiceError(500,'Routepunten laden is mislukt.');
  const [tripRows,pointRows]=results.map(result=>result.results);
  if(tripRows.length!==1)throw new TripServiceError(404,'Rit niet gevonden of toegang gewijzigd.');
  const now=clock();if(!Number.isFinite(now)||principal.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');
  const highwater=(tripRows[0] as {highwater:number}).highwater;
  if(!Number.isSafeInteger(highwater)||highwater<0)throw new TripServiceError(409,'Routepunt-IDs vallen buiten het veilige bereik.');
  const bound=through??highwater,rows=pointRows as RoutePoint[];
  if(rows.some(point=>!Number.isSafeInteger(point.id)||point.id<=after||point.id>bound))throw new TripServiceError(409,'Routepunt-IDs vallen buiten het veilige bereik.');
  const points=rows.slice(0,limit).map(p=>({id:p.id,recorded_at:p.recorded_at,latitude:p.latitude,longitude:p.longitude,accuracy_meters:p.accuracy_meters,source:p.source}));
  return {points,through:bound,nextAfter:rows.length>limit?points[points.length-1].id:null};
 }};
}
