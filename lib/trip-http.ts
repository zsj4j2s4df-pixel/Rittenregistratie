import {createSyncService} from './sync-service.ts';
import { listAccessibleVehicles, listVehicleDrivers } from './vehicle-service.ts';
import { createReportService, type ReportRequest } from './report-service.ts';
import { createSettingsService, type SettingsEdit } from './settings-service.ts';
import type { Principal } from './access-policy.ts';
import { createTripService, TripServiceError } from './trip-service.ts';
import type { TripCreate, TripEdit } from './trip-service.ts';

// Provider-neutral adapter. Not mounted publicly. The resolver must verify an
// actual session for EACH request; no resolver means deny access in the service.
export function createTripHttpHandler(options: {
  db: Pick<D1Database, 'prepare' | 'batch'>;
  origin: string;
  resolveSession?: (request: Request) => Promise<Principal | null>;
  clock?: () => number;
}) {
  const origin = new URL(options.origin);
  if (origin.origin !== options.origin || (origin.protocol !== 'https:' && !(origin.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)))) throw new Error('Configure an exact HTTPS origin (HTTP only for localhost).');
  const maxBytes = 16_384;
  const editKeys = ['expectedRevision','startedAt','endedAt','distanceKm','startAddress','endAddress','classification','driverId','odometerStart','odometerEnd','purpose','reason'];
  function response(status: number, body: unknown, extra: Record<string,string> = {}) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin, Cookie', ...extra } });
  }
  async function json(request: Request, create: boolean | 'settings' | 'report') {
    if (request.headers.get('origin') !== origin.origin || request.headers.get('x-csrf-protection') !== '1' || request.headers.get('sec-fetch-site') === 'cross-site') throw new TripServiceError(403, 'Ongeldige aanvraagherkomst.');
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new TripServiceError(415, 'JSON vereist.');
    const length = request.headers.get('content-length');
    if (length !== null && (!/^\d+$/.test(length) || Number(length) > maxBytes)) throw new TripServiceError(413, 'Aanvraag te groot.');
    const reader = request.body?.getReader();
    if (!reader) throw new TripServiceError(400, 'JSON ontbreekt.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) { await reader.cancel(); throw new TripServiceError(413, 'Aanvraag te groot.'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    let body: unknown;
    try {
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    } catch { throw new TripServiceError(400, 'Ongeldige JSON.'); }
    const allowed = create === 'report' ? ['requestId','from','until','driverId'] : create === 'settings' ? ['revision','plate','addresses','rates','reason'] : create ? [...editKeys.filter(k=>k!=='expectedRevision'), 'requestId'] : editKeys;
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k=>!allowed.includes(k))) throw new TripServiceError(400, 'Onbekende invoervelden.');
    return body;
  }
  const segment = (raw: string) => {
    let value: string;
    try { value = decodeURIComponent(raw); } catch { throw new TripServiceError(400, 'Ongeldig pad.'); }
    if (!value || value.length > 128 || /[\x00-\x1f\x7f/\\]/.test(value)) throw new TripServiceError(400, 'Ongeldig pad.');
    return value;
  };
  return async function handle(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.origin !== origin.origin) return response(403, { error: 'Ongeldige aanvraagherkomst.' });
      if(url.pathname==='/api/vehicles'){
        if(request.method!=='GET')return response(405,{error:'Methode niet toegestaan.'},{Allow:'GET'});
        for(const key of url.searchParams.keys())if(!['limit','offset'].includes(key)||url.searchParams.getAll(key).length!==1)throw new TripServiceError(400,'Ongeldige query.');
        const page=(key:string,fallback:number)=>{const value=url.searchParams.get(key);if(value===null)return fallback;if(!/^\d+$/.test(value))throw new TripServiceError(400,'Ongeldige paginering.');return Number(value);};
        return response(200,{vehicles:await listAccessibleVehicles(options.db,()=>options.resolveSession?.(request)??Promise.resolve(null),page('limit',50),page('offset',0),options.clock)});
      }
      const snapshotMatch=/^\/api\/vehicles\/([^/]+)\/snapshot$/.exec(url.pathname);
      if(snapshotMatch){
       const vehicleId=segment(snapshotMatch[1]);
       if(request.method!=='GET')return response(405,{error:'Methode niet toegestaan.'},{Allow:'GET'});
       if([...url.searchParams].length)throw new TripServiceError(400,'Ongeldige query.');
       return response(200,{snapshot:await createSyncService(options.db,()=>options.resolveSession?.(request)??Promise.resolve(null),options.clock).snapshot(vehicleId)});
      }
      const driversMatch=/^\/api\/vehicles\/([^/]+)\/drivers$/.exec(url.pathname);
      if(driversMatch){
        const vehicleId=segment(driversMatch[1]);
        if(request.method!=='GET')return response(405,{error:'Methode niet toegestaan.'},{Allow:'GET'});
        for(const key of url.searchParams.keys())if(!['limit','offset'].includes(key)||url.searchParams.getAll(key).length!==1)throw new TripServiceError(400,'Ongeldige query.');
        const page=(key:string,fallback:number)=>{const value=url.searchParams.get(key);if(value===null)return fallback;if(!/^\d+$/.test(value))throw new TripServiceError(400,'Ongeldige paginering.');return Number(value);};
        return response(200,{drivers:await listVehicleDrivers(options.db,()=>options.resolveSession?.(request)??Promise.resolve(null),vehicleId,page('limit',50),page('offset',0),options.clock)});
      }
      const reportMatch = /^\/api\/vehicles\/([^/]+)\/reports(?:\/([^/]+)(\/csv)?)?$/.exec(url.pathname);
      if (reportMatch) {
        const vehicleId=segment(reportMatch[1]),id=reportMatch[2]?segment(reportMatch[2]):null;
        const allowed=id?['GET']:['GET','POST'];
        if(!allowed.includes(request.method))return response(405,{error:'Methode niet toegestaan.'},{Allow:allowed.join(', ')});
        const permitted=!id&&request.method==='GET'?['limit','offset']:[];
        for(const key of url.searchParams.keys())if(!permitted.includes(key)||url.searchParams.getAll(key).length!==1)throw new TripServiceError(400,'Ongeldige query.');
        const service=createReportService(options.db,()=>options.resolveSession?.(request)??Promise.resolve(null),options.clock);
        if(request.method==='POST')return response(201,{report:await service.create(vehicleId,await json(request,'report') as ReportRequest)});
        if(reportMatch[3])return new Response(await service.csv(vehicleId,id!),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="ritkompas-rapport.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin, Cookie'}});
        if(id)return response(200,{report:await service.get(vehicleId,id)});
        const page=(key:string,fallback:number)=>{const value=url.searchParams.get(key);if(value===null)return fallback;if(!/^\d+$/.test(value))throw new TripServiceError(400,'Ongeldige paginering.');return Number(value);};
        return response(200,{reports:await service.list(vehicleId,page('limit',50),page('offset',0))});
      }
      const settingsMatch = /^\/api\/vehicles\/([^/]+)\/settings(\/history)?$/.exec(url.pathname);
      if (settingsMatch) {
        const vehicleId = segment(settingsMatch[1]);
        const history = Boolean(settingsMatch[2]);
        const allowed = history ? ['GET'] : ['GET','PATCH'];
        if (!allowed.includes(request.method)) return response(405, { error: 'Methode niet toegestaan.' }, { Allow: allowed.join(', ') });
        if ([...url.searchParams].length) throw new TripServiceError(400,'Ongeldige query.');
        const service = createSettingsService(options.db, () => options.resolveSession?.(request) ?? Promise.resolve(null), options.clock);
        if (request.method === 'PATCH') return response(200,{ settings: await service.save(vehicleId,await json(request,'settings') as SettingsEdit) });
        return history ? response(200,{ history: await service.history(vehicleId) }) : response(200,{ settings: await service.get(vehicleId) });
      }
      const match = /^\/api\/vehicles\/([^/]+)\/trips(?:\/([^/]+)(\/history)?)?$/.exec(url.pathname);
      if (!match) return response(404, { error: 'Niet gevonden.' });
      const vehicleId = segment(match[1]), tripId = match[2] ? segment(match[2]) : null;
      const history = Boolean(match[3]);
      const allowed = history ? ['GET'] : tripId ? ['GET','PATCH'] : ['GET','POST'];
      if (!allowed.includes(request.method)) return response(405, { error: 'Methode niet toegestaan.' }, { Allow: allowed.join(', ') });
      const permitted = request.method==='GET' ? (!tripId ? ['limit','offset'] : history ? ['limit'] : []) : [];
      for (const key of url.searchParams.keys()) if (!permitted.includes(key) || url.searchParams.getAll(key).length!==1) throw new TripServiceError(400, 'Ongeldige query.');
      const integer = (key: string, fallback: number) => {
        const value = url.searchParams.get(key);
        if (value === null) return fallback;
        if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new TripServiceError(400, 'Ongeldige paginering.');
        return Number(value);
      };
      const service = createTripService(options.db, () => options.resolveSession?.(request) ?? Promise.resolve(null), options.clock);
      if (request.method==='POST') return response(201, { trip: await service.create(vehicleId, await json(request, true) as TripCreate) });
      if (request.method==='PATCH') return response(200, { trip: await service.edit(vehicleId, tripId!, await json(request, false) as TripEdit) });
      if (history) return response(200, { history: await service.history(vehicleId, tripId!, integer('limit',50)) });
      if (tripId) return response(200, { trip: await service.get(vehicleId,tripId) });
      return response(200, { trips: await service.list(vehicleId,integer('limit',50),integer('offset',0)) });
    } catch (error) {
      if (error instanceof TripServiceError) return response(error.status, { error: error.message });
      // Never return SQL errors, provider details, secrets or addresses to clients.
      return response(500, { error: 'De aanvraag kon niet worden verwerkt.' });
    }
  };
}
