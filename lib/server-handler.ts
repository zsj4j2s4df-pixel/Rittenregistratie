import { createDetectionHttpHandler } from './detection-http.ts';
import { createDeviceHttpHandler } from './device-http.ts';
import { createReadOnlyMcpHandler } from './mcp-http.ts';
import { createCloudflareAccessResolver } from './cloudflare-access.ts';
import { createTripHttpHandler } from './trip-http.ts';

export type RuntimeBindings = {
 DB?: Pick<D1Database,'prepare'|'batch'>;
 APP_ORIGIN?: string;
 ACCESS_ISSUER?: string;
 ACCESS_AUDIENCE?: string;
};

// A deployment must explicitly supply every binding. No request headers/Host or
// demo identity are used as configuration. Missing/invalid setup stays closed.
export function createConfiguredApi(bindings:RuntimeBindings) {
 const unavailable=()=>Response.json({error:'De beveiligde backend is nog niet beschikbaar.'},{status:503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(!bindings.DB||typeof bindings.DB.prepare!=='function'||typeof bindings.DB.batch!=='function'||!bindings.APP_ORIGIN||!bindings.ACCESS_ISSUER||!bindings.ACCESS_AUDIENCE)return async()=>unavailable();
 try {
  const resolveSession=createCloudflareAccessResolver({db:bindings.DB,issuer:bindings.ACCESS_ISSUER,audience:bindings.ACCESS_AUDIENCE});
  const options={db:bindings.DB,origin:bindings.APP_ORIGIN,resolveSession};
  const trips=createTripHttpHandler(options),devices=createDeviceHttpHandler(options),detections=createDetectionHttpHandler(options);
  return (request:Request)=>/^\/api\/vehicles\/[^/]+\/devices\/[^/]+\/detections$/.test(new URL(request.url).pathname)?detections(request):/^\/api\/vehicles\/[^/]+\/devices(?:\/|$)/.test(new URL(request.url).pathname)?devices(request):trips(request);
 }catch{return async()=>unavailable();}
}

// Read-only MCP uses the same verified Access identity; no external client is activated.
export function createConfiguredMcp(bindings:RuntimeBindings) {
 const unavailable=()=>Response.json({error:'De beveiligde MCP-backend is nog niet beschikbaar.'},{status:503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(!bindings.DB||typeof bindings.DB.prepare!=='function'||typeof bindings.DB.batch!=='function'||!bindings.APP_ORIGIN||!bindings.ACCESS_ISSUER||!bindings.ACCESS_AUDIENCE)return async()=>unavailable();
 try {
  const resolveSession=createCloudflareAccessResolver({db:bindings.DB,issuer:bindings.ACCESS_ISSUER,audience:bindings.ACCESS_AUDIENCE});
  return createReadOnlyMcpHandler({db:bindings.DB,origin:bindings.APP_ORIGIN,resolveSession});
 }catch{return async()=>unavailable();}
}
