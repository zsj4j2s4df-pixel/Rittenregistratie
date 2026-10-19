// Isolated built release-wrapper + real local workerd/D1. Synthetic JWKS only.
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare,createFetchMock}=await import(wranglerRequire.resolve('miniflare'));
const issuer='https://synthetic-team.cloudflareaccess.com',audience='synthetic-app',origin='https://synthetic.example';
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'synthetic-built-key',alg:'RS256',use:'sig'};
const enc=value=>Buffer.from(JSON.stringify(value)).toString('base64url'),now=Math.floor(Date.now()/1000);
const input=enc({alg:'RS256',kid:jwk.kid})+'.'+enc({iss:issuer,aud:[audience],exp:now+600,iat:now-1,type:'app',sub:'synthetic-sub',email:'synthetic@example.test'});
const jwt=input+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(input))).toString('base64url');
const mock=createFetchMock();mock.disableNetConnect();mock.get(issuer).intercept({path:'/cdn-cgi/access/certs'}).reply(200,JSON.stringify({keys:[jwk]}),{headers:{'content-type':'application/json'}}).persist();
const root=new URL('../dist/server/',import.meta.url).pathname.replace(/\/$/,'');
const paths=[];function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory())walk(path);else if(path.endsWith('.js'))paths.push(path);}}walk(root);
paths.sort((a,b)=>Number(b===root+'/release-entry.js')-Number(a===root+'/release-entry.js'));
const mf=new Miniflare({modules:paths.map(path=>({type:'ESModule',path,contents:readFileSync(path,'utf8')})),modulesRoot:root,compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{APP_ORIGIN:origin,ACCESS_ISSUER:issuer,ACCESS_AUDIENCE:audience},fetchMock:mock});
try{
 const db=await mf.getD1Database('DB');
 for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 await db.prepare("INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES ('u',?,'Synthetic',1,1)").bind(JSON.stringify([issuer,'synthetic-sub'])).run();
 await db.prepare("INSERT INTO vehicles(id,display_name,created_at) VALUES ('v','Synthetic',1)").run();await db.prepare("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('u','v')").run();
 async function status(headers,expected){const r=await mf.dispatchFetch(origin+'/api/vehicles',{headers});assert.equal(r.status,expected);assert.equal(r.headers.get('cache-control'),'no-store');if(r.status===200)assert.equal((await r.json()).vehicles[0].id,'v');}
 await status({},401);await status({'cf-access-jwt-assertion':jwt},200);await status({cookie:'CF_Authorization='+jwt},200);await status({cookie:'CF_Authorization='+jwt,'cf-access-jwt-assertion':'forged.token.value'},401);
 await db.prepare("UPDATE users SET disabled=1 WHERE id='u'").run();await status({cookie:'CF_Authorization='+jwt},401);
 await db.prepare("UPDATE users SET disabled=0 WHERE id='u'").run();await db.prepare('UPDATE vehicle_memberships SET active=0').run();const revoked=await mf.dispatchFetch(origin+'/api/vehicles/v/trips',{headers:{cookie:'CF_Authorization='+jwt}});assert.equal(revoked.status,403);
 const page=await mf.dispatchFetch(origin+'/beheer');assert.equal(page.status,200);
 console.log('PASS built embedded wrapper + actual framework routing + local workerd/D1: signed header/cookie, forged header denial, disabled user, revoked membership, beheer shell. Synthetic JWKS only; NOT live Access/browser login.');
}finally{await mf.dispose();}
