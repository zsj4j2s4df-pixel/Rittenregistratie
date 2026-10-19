import type {Principal} from './access-policy.ts';
import {createDeviceService,type DeviceRegistration,type DeviceDeactivation} from './device-service.ts';
import {TripServiceError} from './server-access.ts';

// Standalone, not mounted here. A resolver must verify each request's actual
// session; instance IDs and identity headers never substitute for authentication.
export function createDeviceHttpHandler(options:{db:Pick<D1Database,'prepare'|'batch'>;origin:string;resolveSession?:(request:Request)=>Promise<Principal|null>;clock?:()=>number}){
 const origin=new URL(options.origin);
 if(origin.origin!==options.origin||(origin.protocol!=='https:'&&!(origin.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(origin.hostname))))throw Error('Configure an exact HTTPS origin (HTTP only for localhost).');
 const response=(status:number,body:unknown,extra:Record<string,string>={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin, Cookie',...extra}});
 function segment(raw:string){let decoded:string;try{decoded=decodeURIComponent(raw);}catch{throw new TripServiceError(400,'Ongeldig pad.');}if(!decoded||decoded.length>128||/[\x00-\x1f\x7f/\\]/.test(decoded))throw new TripServiceError(400,'Ongeldig pad.');return decoded;}
 async function json(request:Request){
  if(request.headers.get('origin')!==origin.origin||request.headers.get('x-csrf-protection')!=='1'||request.headers.get('sec-fetch-site')==='cross-site')throw new TripServiceError(403,'Ongeldige aanvraagherkomst.');
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new TripServiceError(415,'JSON vereist.');
  const length=request.headers.get('content-length');if(length!==null&&(!/^\d+$/.test(length)||Number(length)>16384))throw new TripServiceError(413,'Aanvraag te groot.');
  const reader=request.body?.getReader();if(!reader)throw new TripServiceError(400,'JSON ontbreekt.');const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new TripServiceError(413,'Aanvraag te groot.');}chunks.push(value);}}finally{reader.releaseLock();}
  try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}const body:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}catch{throw new TripServiceError(400,'Ongeldige JSON.');}
 }
 async function session(request:Request){const principal=await options.resolveSession?.(request)??null;const expected=request.headers.get('x-ritkompas-viewer');if(expected!==null){if(!expected||expected.length>128)throw new TripServiceError(400,'Ongeldige accountvoorwaarde.');if(!principal)throw new TripServiceError(401,'Aanmelden vereist.');if(expected!==principal.userId)throw new TripServiceError(409,'Account is gewijzigd; laad opnieuw vóór je een aanvraag herstelt.');}return principal;}
 return async function handle(request:Request):Promise<Response>{
  try{
   const url=new URL(request.url);if(url.origin!==origin.origin)return response(403,{error:'Ongeldige aanvraagherkomst.'});
   const match=/^\/api\/vehicles\/([^/]+)\/devices(?:\/([^/]+))?$/.exec(url.pathname);if(!match)return response(404,{error:'Niet gevonden.'});
   const vehicleId=segment(match[1]),id=match[2]?segment(match[2]):null,allowed=id?['PATCH']:['GET','POST'];
   if(!allowed.includes(request.method))return response(405,{error:'Methode niet toegestaan.'},{Allow:allowed.join(', ')});
   const permitted=request.method==='GET'?['limit','offset']:[];for(const key of url.searchParams.keys())if(!permitted.includes(key)||url.searchParams.getAll(key).length!==1)throw new TripServiceError(400,'Ongeldige query.');
   const page=(key:string,fallback:number)=>{const value=url.searchParams.get(key);if(value===null)return fallback;if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))throw new TripServiceError(400,'Ongeldige paginering.');return Number(value);};
   const service=createDeviceService(options.db,()=>session(request),options.clock);
   if(request.method==='POST')return response(201,{device:await service.register(vehicleId,await json(request) as DeviceRegistration)});
   if(request.method==='PATCH')return response(200,{device:await service.deactivate(vehicleId,id!,await json(request) as DeviceDeactivation)});
   return response(200,{devices:await service.list(vehicleId,page('limit',50),page('offset',0))});
  }catch(error){return error instanceof TripServiceError?response(error.status,{error:error.message}):response(500,{error:'De aanvraag kon niet worden verwerkt.'});}
 };
}
