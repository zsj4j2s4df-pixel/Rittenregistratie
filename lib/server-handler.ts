import { createSupabaseAuth } from './supabase-auth.ts';
import { createJourneyHttpHandler } from './journey-http.ts';
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
 AUTH_PROVIDER?: 'access'|'supabase';
 SUPABASE_URL?: string;
 SUPABASE_PUBLISHABLE_KEY?: string;
};

// A deployment must explicitly supply every binding. No request headers/Host or
// demo identity are used as configuration. Missing/invalid setup stays closed.
export function createConfiguredApi(bindings:RuntimeBindings) {
 const unavailable=()=>Response.json({error:'De beveiligde backend is nog niet beschikbaar.'},{status:503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(!bindings.DB||typeof bindings.DB.prepare!=='function'||typeof bindings.DB.batch!=='function'||!bindings.APP_ORIGIN)return async()=>unavailable();
 try {
  const auth=bindings.AUTH_PROVIDER==='supabase'?createSupabaseAuth({db:bindings.DB,url:bindings.SUPABASE_URL??'',key:bindings.SUPABASE_PUBLISHABLE_KEY??'',origin:bindings.APP_ORIGIN}):null;
  if(bindings.AUTH_PROVIDER!==undefined&&!['access','supabase'].includes(bindings.AUTH_PROVIDER))throw Error('Unknown provider');
  const resolveSession=auth?.resolveSession??createCloudflareAccessResolver({db:bindings.DB,issuer:bindings.ACCESS_ISSUER??'',audience:bindings.ACCESS_AUDIENCE??''});
  const options={db:bindings.DB,origin:bindings.APP_ORIGIN,resolveSession};
  const trips=createTripHttpHandler(options),devices=createDeviceHttpHandler(options),detections=createDetectionHttpHandler(options),journeys=createJourneyHttpHandler(options);
  return (request:Request)=>new URL(request.url).pathname.startsWith('/api/auth/')?(auth?auth.handle(request):Promise.resolve(Response.json({provider:'access',error:'Supabase-aanmelding is nog niet geactiveerd.'},{status:503,headers:{'Cache-Control':'no-store'}}))):/^\/api\/vehicles\/[^/]+\/journeys(?:\/|$)/.test(new URL(request.url).pathname)?journeys(request):/^\/api\/vehicles\/[^/]+\/devices\/[^/]+\/detections$/.test(new URL(request.url).pathname)?detections(request):/^\/api\/vehicles\/[^/]+\/devices(?:\/|$)/.test(new URL(request.url).pathname)?devices(request):trips(request);
 }catch{return async()=>unavailable();}
}

// Read-only MCP uses the same verified Access identity; no external client is activated.
export function createConfiguredMcp(bindings:RuntimeBindings) {
 const unavailable=()=>Response.json({error:'De beveiligde MCP-backend is nog niet beschikbaar.'},{status:503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(!bindings.DB||typeof bindings.DB.prepare!=='function'||typeof bindings.DB.batch!=='function'||!bindings.APP_ORIGIN)return async()=>unavailable();
 try {
  const auth=bindings.AUTH_PROVIDER==='supabase'?createSupabaseAuth({db:bindings.DB,url:bindings.SUPABASE_URL??'',key:bindings.SUPABASE_PUBLISHABLE_KEY??'',origin:bindings.APP_ORIGIN}):null;
  if(bindings.AUTH_PROVIDER!==undefined&&!['access','supabase'].includes(bindings.AUTH_PROVIDER))throw Error('Unknown provider');
  const resolveSession=auth?.resolveSession??createCloudflareAccessResolver({db:bindings.DB,issuer:bindings.ACCESS_ISSUER??'',audience:bindings.ACCESS_AUDIENCE??''});
  return createReadOnlyMcpHandler({db:bindings.DB,origin:bindings.APP_ORIGIN,resolveSession});
 }catch{return async()=>unavailable();}
}
