import type { Principal } from './access-policy.ts';

export const appCookie = '__Host-ritkompas-session';
const bindingCookie = '__Host-ritkompas-binding';
const refreshCookie = '__Host-ritkompas-refresh';
const rememberCookie = '__Host-ritkompas-remember';
type DB = Pick<D1Database,'prepare'|'batch'>;
type Claims = {sub:string;session_id:string;exp:number;iss:string;aud:string;role:string};
export type SupabaseOptions = {db:DB;url:string;key:string;origin:string;fetcher?:typeof fetch;clock?:()=>number};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class AuthError extends Error { readonly status:number; constructor(status:number,message:string){super(message);this.status=status;} }
export function uniqueCookie(request:Request,name:string):string|null {
 const raw=request.headers.get('cookie')??'';if(raw.length>16384)return null;
 const matches=raw.split(';').map(s=>s.trim()).filter(s=>s.startsWith(name+'='));
 if(matches.length!==1)return null;const value=matches[0].slice(name.length+1);
 return value&&value.length<=3800&&/^[A-Za-z0-9_.-]+$/.test(value)?value:null;
}
async function boundedJson(response:Response,max=32768):Promise<Record<string,unknown>> {
 const reader=response.body?.getReader();if(!reader)throw new AuthError(502,'Aanmeldservice niet beschikbaar.');
 let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new AuthError(413,'Antwoord te groot.');}chunks.push(value);}}finally{reader.releaseLock();}
 const data=new Uint8Array(size);let p=0;for(const c of chunks){data.set(c,p);p+=c.length;}
 let value;try{value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));}catch{throw new AuthError(400,'Ongeldige aanvraag.');}
 if(!value||typeof value!=='object'||Array.isArray(value))throw new AuthError(400,'Ongeldige aanvraag.');return value;
}
export function createSupabaseAuth(options:SupabaseOptions){
 const {db,url,key,origin}=options,fetcher=options.fetcher??fetch,clock=options.clock??Date.now;
 if(!/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(url)||!key.startsWith('sb_publishable_')||key.length>512||new URL(origin).origin!==origin||!origin.startsWith('https://'))throw Error('Configure exact Supabase project, publishable key and HTTPS app origin.');
 function claims(token:string):Claims|null{
  try{if(token.length>3800||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))return null;
   const part=token.split('.')[1];const c=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(part.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-part.length%4)%4)),s=>s.charCodeAt(0))));
   if(!uuid.test(c.sub)||!uuid.test(c.session_id)||c.iss!==url+'/auth/v1'||c.aud!=='authenticated'||c.role!=='authenticated'||!Number.isSafeInteger(c.exp)||c.exp*1000<=clock())return null;
   return c;
  }catch{return null;}
 }
 async function call(path:string,method='GET',body?:unknown,token?:string){
  return fetcher(url+'/auth/v1/'+path,{method,redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(8000),headers:{apikey:key,...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 }
 async function verify(token:string):Promise<{principal:Principal;claims:Claims}|null>{
  // Decoding only rejects bad input. Supabase /user MUST authenticate the exact
  // token before its subject/expiry can grant access. No user_metadata decisions.
  const c=claims(token);if(!c)return null;
  if(await db.prepare('SELECT 1 AS denied FROM auth_session_revocations WHERE issuer=? AND session_id=?').bind(url+'/auth/v1',c.session_id).first())return null;
  const r=await call('user','GET',undefined,token);if(!r.ok)return null;
  const user=await boundedJson(r);if(user.id!==c.sub||user.is_anonymous!==false||typeof user.email_confirmed_at!=='string'||!user.email_confirmed_at)return null;
  const mapped=await db.prepare("SELECT u.id FROM auth_identities i JOIN users u ON u.id=i.user_id WHERE i.issuer=? AND i.subject=? AND i.active=1 AND u.disabled=0 AND u.role='admin_driver' AND NOT EXISTS (SELECT 1 FROM auth_session_revocations r WHERE r.issuer=i.issuer AND r.session_id=?)").bind(c.iss,c.sub,c.session_id).first<{id:string}>();
  if(!mapped||c.exp*1000<=clock())return null;
  return {principal:{userId:mapped.id,sessionExpiresAt:c.exp*1000,disabled:false},claims:c};
 }
 function binding(request:Request){const value=uniqueCookie(request,bindingCookie);if(!value)return null;const [id,version,...rest]=value.split('.');return !rest.length&&uuid.test(id)&&uuid.test(version)?{id,version}:null;}
 async function bound(request:Request,value:{principal:Principal;claims:Claims}){
  const context=binding(request);if(!context)return false;
  return !!await db.prepare('SELECT 1 AS allowed FROM auth_browser_bindings WHERE id=? AND version=? AND issuer=? AND user_id=? AND session_id=?').bind(context.id,context.version,value.claims.iss,value.principal.userId,value.claims.session_id).first();
 }
 async function resolveSession(request:Request){
  // In Supabase mode there is no Access/header fallback or mixed-identity choice.
  if(request.headers.has('authorization'))return null;
  const token=uniqueCookie(request,appCookie);if(!token)return null;
  try{const value=await verify(token);return value&&await bound(request,value)?value.principal:null;}catch{return null;}
 }
 const clear=()=>[appCookie,refreshCookie,rememberCookie,bindingCookie].map(n=>`${n}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`);
 function response(status:number,body:unknown,cookies:string[]=[]){const h=new Headers({'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Vary':'Cookie, Origin'});for(const c of cookies)h.append('Set-Cookie',c);return new Response(JSON.stringify(body),{status,headers:h});}
 async function limit(request:Request){
  // No raw IP or email persisted. D1 atomic counter; provider limits apply too.
  const bucket=Math.floor(clock()/600000),ip=request.headers.get('cf-connecting-ip')??'unknown';
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(bucket+':'+ip)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const results=await db.batch([db.prepare('DELETE FROM auth_attempts WHERE bucket<?').bind(bucket-1),db.prepare('INSERT INTO auth_attempts(bucket,ip_hash,attempts) VALUES(?,?,1) ON CONFLICT(bucket,ip_hash) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(bucket,hash)]);
  if(Number((results[1].results?.[0] as {attempts?:number}|undefined)?.attempts??100)>12)throw new AuthError(429,'Te veel pogingen. Probeer over tien minuten opnieuw.');
 }
 function cookies(access:string,refresh:string,remember:boolean,context:{id:string;version:string}){
  if(!/^[A-Za-z0-9_.-]{1,3800}$/.test(access)||!/^[A-Za-z0-9_.-]{1,3800}$/.test(refresh))throw new AuthError(502,'Ongeldige aanmeldsessie.');
  return [[appCookie,access],[refreshCookie,refresh],[rememberCookie,remember?'yes':'no'],[bindingCookie,context.id+'.'+context.version]].map(([n,v])=>`${n}=${v}; Path=/; Secure; HttpOnly; SameSite=Strict${remember?'; Max-Age=2592000':''}`);
 }
 async function establish(request:Request,value:Record<string,unknown>,remember:boolean,expectedSubject?:string){
  if(typeof value.access_token!=='string'||typeof value.refresh_token!=='string')throw new AuthError(401,'Aanmelden mislukt.');
  const verified=await verify(value.access_token);if(!verified)throw new AuthError(403,'Dit account heeft nog geen RitKompas-toegang.');
  if(expectedSubject&&verified.claims.sub!==expectedSubject)throw new AuthError(409,'Account is gewijzigd. Meld opnieuw aan.');
  let context=binding(request);
  if(expectedSubject){if(!context||!await bound(request,verified))throw new AuthError(409,'De apparaatsessie is gewijzigd. Meld opnieuw aan.');}
  else {
   // Keep a browser context ID, rotate its version on every explicit login.
   // A late refresh response may overwrite a cookie, but its old binding can
   // never restore an earlier account after another login has completed.
   const exists=context&&await db.prepare('SELECT 1 AS found FROM auth_browser_bindings WHERE id=? AND version=?').bind(context.id,context.version).first();
   context={id:exists?context!.id:crypto.randomUUID(),version:crypto.randomUUID()};
   await db.batch([db.prepare('INSERT INTO auth_browser_bindings(id,version,issuer,user_id,session_id) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,issuer=excluded.issuer,user_id=excluded.user_id,session_id=excluded.session_id').bind(context.id,context.version,verified.claims.iss,verified.principal.userId,verified.claims.session_id)]);
  }
  return response(200,{viewerId:verified.principal.userId,expiresAt:verified.principal.sessionExpiresAt},cookies(value.access_token,value.refresh_token,remember,context!));
 }
 async function handle(request:Request):Promise<Response>{
  try{
   const target=new URL(request.url);if(target.origin!==origin||target.search)throw new AuthError(403,'Ongeldige aanvraagherkomst.');
   if(target.pathname==='/api/auth/status'&&request.method==='GET')return response(200,{provider:'supabase',authenticated:!!await resolveSession(request)});
   if(request.method!=='POST')return response(405,{error:'Methode niet toegestaan.'});
   if(request.headers.get('origin')!==origin||request.headers.get('x-csrf-protection')!=='1'||request.headers.get('sec-fetch-site')==='cross-site')throw new AuthError(403,'Ongeldige aanvraagherkomst.');
   if(request.headers.get('content-type')?.split(';')[0]!=='application/json')throw new AuthError(415,'JSON vereist.');
   const body=await boundedJson(new Response(request.body),8192);
   const only=(keys:string[])=>{if(Object.keys(body).some(k=>!keys.includes(k)))throw new AuthError(400,'Onbekende invoervelden.');};
   const email=()=>{if(typeof body.email!=='string'||body.email.length>254||!/^\S+@\S+\.\S+$/.test(body.email))throw new AuthError(400,'Vul een geldig e-mailadres in.');return body.email.trim();};
   switch(target.pathname){
    case '/api/auth/login':{
     only(['email','password','remember']);if(typeof body.password!=='string'||body.password.length>1024||!body.password||typeof body.remember!=='boolean')throw new AuthError(400,'Vul je aanmeldgegevens in.');
     await limit(request);const r=await call('token?grant_type=password','POST',{email:email(),password:body.password});if(!r.ok)throw new AuthError(401,'Aanmelden mislukt. Controleer je gegevens of herstel je wachtwoord.');return await establish(request,await boundedJson(r),body.remember);
    }
    case '/api/auth/refresh':{
     only([]);const token=uniqueCookie(request,refreshCookie),access=uniqueCookie(request,appCookie);if(!token||!access)throw new AuthError(401,'Meld opnieuw aan.');
     // Old subject only constrains refresh, never grants anything. New token is
     // authenticated remotely, remapped and rechecked against local revocations.
     let subject:string;try{const p=access.split('.')[1];subject=JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-p.length%4)%4))).sub;if(!uuid.test(subject))throw Error();}catch{throw new AuthError(401,'Meld opnieuw aan.');}
     const r=await call('token?grant_type=refresh_token','POST',{refresh_token:token});if(!r.ok)throw new AuthError(401,'Je sessie is verlopen. Meld opnieuw aan.');return await establish(request,await boundedJson(r),uniqueCookie(request,rememberCookie)==='yes',subject);
    }
    case '/api/auth/recover':{
     only(['email']);await limit(request);const r=await call('recover?redirect_to='+encodeURIComponent(origin+'/login'),'POST',{email:email()});if(!r.ok&&r.status!==400&&r.status!==422)throw new AuthError(503,'Wachtwoordherstel is tijdelijk niet beschikbaar.');return response(200,{message:'Als dit adres een account heeft, ontvang je een herstelbericht.'});
    }
    case '/api/auth/recovery':{
     only(['accessToken','refreshToken']);if(typeof body.accessToken!=='string'||typeof body.refreshToken!=='string')throw new AuthError(400,'Ongeldige herstellink.');await limit(request);return await establish(request,{access_token:body.accessToken,refresh_token:body.refreshToken},false);
    }
    case '/api/auth/password':{
     only(['password']);if(typeof body.password!=='string'||body.password.length<12||body.password.length>1024)throw new AuthError(400,'Gebruik minstens twaalf tekens.');
     const token=uniqueCookie(request,appCookie),verified=token?await verify(token):null;if(!token||!verified||!await bound(request,verified))throw new AuthError(401,'Open eerst een geldige herstellink of meld aan.');
     const r=await call('user','PUT',{password:body.password},token);if(!r.ok)throw new AuthError(400,'Wachtwoord wijzigen mislukt.');
     await db.batch([
      db.prepare('INSERT OR IGNORE INTO auth_session_revocations(issuer,session_id,revoked_at) SELECT issuer,session_id,? FROM auth_browser_bindings WHERE issuer=? AND user_id=? AND session_id<>?').bind(clock(),verified.claims.iss,verified.principal.userId,verified.claims.session_id),
      db.prepare('DELETE FROM auth_browser_bindings WHERE issuer=? AND user_id=? AND session_id<>?').bind(verified.claims.iss,verified.principal.userId,verified.claims.session_id),
      db.prepare("INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) VALUES(?,'user',?,'auth_password_changed',NULL,?,?)").bind(verified.principal.userId,verified.principal.userId,JSON.stringify({passwordChanged:true,otherAppSessionsRevoked:true}),Math.floor(clock()/1000))
     ]);
     return response(200,{message:'Je wachtwoord is gewijzigd. Andere RitKompas-sessies zijn afgesloten.'});
    }
    case '/api/auth/logout':{
     only([]);let token=uniqueCookie(request,appCookie),verified=token?await verify(token):null;
     // Logout after access expiry must also close a remembered refresh session.
     // Never rely on clearing cookies alone as remote/session revocation proof.
     const refresh=uniqueCookie(request,refreshCookie);
     if(!verified&&refresh){const r=await call('token?grant_type=refresh_token','POST',{refresh_token:refresh});if(r.ok){const value=await boundedJson(r);if(typeof value.access_token==='string'){token=value.access_token;verified=await verify(token);}}}
     if(verified&&!await bound(request,verified))verified=null;
     if(verified){const context=binding(request)!;await db.batch([db.prepare('DELETE FROM auth_browser_bindings WHERE id=? AND version=?').bind(context.id,context.version),db.prepare('INSERT OR IGNORE INTO auth_session_revocations(issuer,session_id,revoked_at) VALUES(?,?,?)').bind(verified.claims.iss,verified.claims.session_id,clock())]);const r=await call('logout?scope=local','POST',{},token!);if(!r.ok)return response(200,{message:'Dit apparaat is afgesloten. Afmelden bij de accountdienst kon niet worden bevestigd.',providerRevoked:false},clear());}
     return response(200,{message:'Dit apparaat is afgemeld.',providerRevoked:!!verified},clear());
    }
    default:return response(404,{error:'Niet gevonden.'});
   }
  }catch(e){return response(e instanceof AuthError?e.status:503,{error:e instanceof AuthError?e.message:'Aanmeldservice tijdelijk niet beschikbaar.'});}
 }
 return {resolveSession,handle};
}
