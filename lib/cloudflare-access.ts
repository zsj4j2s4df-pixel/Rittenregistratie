import {accessApplicationToken} from './access-token.ts';
import type { Principal } from './access-policy.ts';

// Prepared integration, not an activated Cloudflare account or public login.
// A signed Access token establishes the subject; internal users/memberships still
// decide access. Neither email headers nor token presence grant an account.
export function createCloudflareAccessResolver(options: {
 db: Pick<D1Database,'prepare'>; issuer: string; audience: string;
 fetcher?: typeof fetch; clock?: ()=>number;
}) {
 if(!/^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/.test(options.issuer)||!options.audience||options.audience.length>256)throw new Error('Configure the exact Access team issuer and application audience.');
 const clock=options.clock??Date.now, fetcher=options.fetcher??fetch;
 type Jwk = JsonWebKey & {kid?:string};
 let cached:{until:number;keys:Jwk[]}|null=null;
 let loading:Promise<Jwk[]>|null=null;
 const decode=(part:string)=>{
  if(!part||!/^[A-Za-z0-9_-]+$/.test(part))throw Error('encoding');
  return Uint8Array.from(atob(part.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-part.length%4)%4)),c=>c.charCodeAt(0));
 };
 const object=(part:string)=>{const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(decode(part)));if(!value||typeof value!=='object'||Array.isArray(value))throw Error('object');return value;};
 async function keys():Promise<Jwk[]>{
  if(cached&&cached.until>clock())return cached.keys;
  if(loading)return loading;
  loading=(async()=>{
   // Fixed configured issuer only; never trust a token-supplied jku/x5u URL.
   const response=await fetcher(options.issuer+'/cdn-cgi/access/certs',{redirect:'error',signal:AbortSignal.timeout(5000)});
   if(!response.ok||!response.body)throw Error('keys');
   const reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();throw Error('keys size');}chunks.push(value);}}finally{reader.releaseLock();}
   const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}
   const jwks=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
   if(!Array.isArray(jwks.keys)||jwks.keys.length>20)throw Error('keys');
   const result=jwks.keys.filter((k:Jwk)=>k&&k.kty==='RSA'&&typeof k.kid==='string'&&(!k.alg||k.alg==='RS256')&&(!k.use||k.use==='sig')) as Jwk[];
   cached={until:clock()+60_000,keys:result};return result;
  })();
  try{return await loading;}finally{loading=null;}
 }
 return async (request:Request):Promise<Principal|null>=>{
  try{
   const token=accessApplicationToken(request);if(!token)return null;
   const parts=token.split('.');if(parts.length!==3)return null;
   const header=object(parts[0]),claims=object(parts[1]);
   if(header.alg!=='RS256'||typeof header.kid!=='string'||!header.kid||header.kid.length>256||header.crit!==undefined||(header.typ!==undefined&&header.typ!=='JWT'))return null;
   const now=clock(),expires=claims.exp*1000;
   if(!Number.isFinite(now)||claims.iss!==options.issuer||!Array.isArray(claims.aud)||!claims.aud.includes(options.audience)||typeof claims.exp!=='number'||!Number.isSafeInteger(expires)||expires<=now||
    (claims.nbf!==undefined&&(typeof claims.nbf!=='number'||!Number.isFinite(claims.nbf)||claims.nbf*1000>now))||
    (claims.iat!==undefined&&(typeof claims.iat!=='number'||!Number.isFinite(claims.iat)||claims.iat*1000>now))||
    claims.type!=='app'||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>256||typeof claims.email!=='string'||!claims.email.includes('@'))return null;
   const matching=(await keys()).filter(k=>k.kid===header.kid);if(matching.length!==1)return null;
   const key=await crypto.subtle.importKey('jwk',matching[0],{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
   if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))return null;
   const user=await options.db.prepare("SELECT id FROM users WHERE external_auth_id=? AND disabled=0 AND role='admin_driver'").bind(JSON.stringify([options.issuer,claims.sub])).first<{id:string}>();
   if(!user||expires<=clock())return null;
   return {userId:user.id,sessionExpiresAt:expires,disabled:false};
  }catch{return null;} // Fail closed, never log tokens, claims, addresses or secrets.
 };
}
