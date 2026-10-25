// Built framework + embedded release entry + real local workerd/D1.
// Supabase Auth network responses are synthetic; no real users/passwords/emails.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare,createFetchMock}=await import(wranglerRequire.resolve('miniflare'));
const url='https://abcdefghijklmnopqrst.supabase.co',origin='https://synthetic.example',sub='11111111-1111-4111-8111-111111111111',sid='22222222-2222-4222-8222-222222222222';
const exp=Math.floor(Date.now()/1000)+600,enc=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
const jwt=enc({alg:'ES256'})+'.'+enc({iss:url+'/auth/v1',aud:'authenticated',role:'authenticated',sub,session_id:sid,exp})+'.synthetic_signature';
const user={id:sub,is_anonymous:false,email_confirmed_at:'2026-01-01T00:00:00Z'};
const mock=createFetchMock();mock.disableNetConnect();const service=mock.get(url);
service.intercept({path:'/auth/v1/user',method:'GET'}).reply(200,JSON.stringify(user),{headers:{'content-type':'application/json'}}).persist();
for(const grant of ['password','refresh_token'])service.intercept({path:'/auth/v1/token?grant_type='+grant,method:'POST'}).reply(200,JSON.stringify({access_token:jwt,refresh_token:'synthetic_refresh'}),{headers:{'content-type':'application/json'}}).persist();
service.intercept({path:'/auth/v1/logout?scope=local',method:'POST'}).reply(204,'').persist();
const root=fileURLToPath(new URL('../dist/server/',import.meta.url)).replace(/\/$/,'');
const paths=[];function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+item.name;if(item.isDirectory())walk(p);else if(p.endsWith('.js'))paths.push(p);}}walk(root);
paths.sort((a,b)=>Number(b===root+'/release-entry.js')-Number(a===root+'/release-entry.js'));
const mf=new Miniflare({modules:paths.map(path=>({type:'ESModule',path,contents:readFileSync(path,'utf8')})),modulesRoot:root,compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{APP_ORIGIN:origin,AUTH_PROVIDER:'supabase',SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic'},fetchMock:mock});
try{
 const db=await mf.getD1Database('DB');for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 await db.prepare("INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES ('u','legacy-unchanged','Synthetic',1,1)").run();await db.prepare("INSERT INTO vehicles(id,display_name,created_at) VALUES('v','Synthetic',1)").run();await db.prepare("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES('u','v')").run();
 await db.prepare('INSERT INTO auth_identities(issuer,subject,user_id) VALUES(?,?,?)').bind(url+'/auth/v1',sub,'u').run();
 const auth=(action,body={},cookie='')=>mf.dispatchFetch(origin+'/api/auth/'+action,{method:'POST',headers:{origin,'content-type':'application/json','x-csrf-protection':'1',cookie},body:JSON.stringify(body)});
 for(const path of ['/api/vehicles','/api/vehicles/v/session','/api/vehicles/v/settings','/api/vehicles/v/trips','/api/vehicles/v/devices','/api/vehicles/v/journeys']){
  const denied=await mf.dispatchFetch(origin+path);assert.equal(denied.status,401,'anonymous private route '+path);assert.equal(denied.headers.get('cache-control'),'no-store');
 }
 const anonymousStatus=await mf.dispatchFetch(origin+'/api/auth/status');assert.equal(anonymousStatus.status,200);assert.deepEqual(await anonymousStatus.json(),{provider:'supabase',authenticated:false});
 assert.equal((await mf.dispatchFetch(origin+'/api/vehicles',{headers:{'cf-access-jwt-assertion':jwt}})).status,401);
 await db.prepare('UPDATE auth_identities SET active=0').run();
 assert.equal((await auth('login',{email:'synthetic@example.test',password:'synthetic-password',remember:false})).status,403,'provider account without active internal mapping');
 await db.prepare('UPDATE auth_identities SET active=1').run();
 const memoryLogin=await auth('login',{email:'synthetic@example.test',password:'synthetic-password',remember:false});assert.equal(memoryLogin.status,200);assert.equal(memoryLogin.headers.getSetCookie().length,4);assert.ok(memoryLogin.headers.getSetCookie().every(c=>!c.includes('Max-Age=')&&!c.includes('Expires=')));
 const login=await auth('login',{email:'synthetic@example.test',password:'synthetic-password',remember:true});assert.equal(login.status,200,'framework login '+await login.clone().text());const values=login.headers.getSetCookie();assert.equal(values.length,4);assert.ok(values.every(c=>c.includes('Secure; HttpOnly; SameSite=Strict; Max-Age=2592000')));
 const cookie=values.map(c=>c.split(';')[0]).join('; ');const status=await mf.dispatchFetch(origin+'/api/vehicles',{headers:{cookie}});assert.equal(status.status,200);assert.equal((await status.json()).vehicles[0].id,'v');
 const verifiedStatus=await mf.dispatchFetch(origin+'/api/auth/status',{headers:{cookie}});assert.deepEqual(await verifiedStatus.json(),{provider:'supabase',authenticated:true,viewerId:'u',expiresAt:exp*1000});
 const missingBinding=cookie.split('; ').filter(c=>!c.startsWith('__Host-ritkompas-binding=')).join('; ');
 assert.equal((await mf.dispatchFetch(origin+'/api/vehicles',{headers:{cookie:missingBinding}})).status,401,'JWT alone cannot grant app access');
 assert.equal((await mf.dispatchFetch(origin+'/api/vehicles/other/trips',{headers:{cookie}})).status,403,'other vehicle cannot be read');
 assert.equal((await mf.dispatchFetch(origin+'/api/vehicles/v/session',{headers:{cookie,'x-ritkompas-viewer':'other'}})).status,409,'wrong viewer cannot bind');
 await db.prepare('UPDATE vehicle_memberships SET active=0').run();
 assert.equal((await mf.dispatchFetch(origin+'/api/vehicles/v/trips',{headers:{cookie}})).status,403,'revoked membership takes effect');
 await db.prepare('UPDATE vehicle_memberships SET active=1').run();
 await db.prepare('UPDATE users SET disabled=1').run();
 assert.equal((await mf.dispatchFetch(origin+'/api/vehicles',{headers:{cookie}})).status,401,'disabled account takes effect');
 await db.prepare('UPDATE users SET disabled=0').run();
 const foreignLogout=await mf.dispatchFetch(origin+'/api/auth/logout',{method:'POST',headers:{cookie,origin:'https://other.example','content-type':'application/json','x-csrf-protection':'1'},body:'{}'});assert.equal(foreignLogout.status,403,'foreign-origin mutation denied');
 const scope=await mf.dispatchFetch(origin+'/api/vehicles/v/session',{headers:{cookie,'x-ritkompas-viewer':'u'}});assert.deepEqual((await scope.json()).session,{version:1,viewerId:'u',vehicleId:'v',expiresAt:exp*1000});
 const input={requestId:'supabase-built-create-0001',startedAt:100,endedAt:200,distanceKm:20,startAddress:'Synthetic A',endAddress:'Synthetic B',classification:'private',driverId:'u',odometerStart:0,odometerEnd:20,purpose:null,reason:'Synthetic Supabase bridge smoke'};
 const save=()=>mf.dispatchFetch(origin+'/api/vehicles/v/trips',{method:'POST',headers:{cookie,origin,'content-type':'application/json','x-csrf-protection':'1','x-ritkompas-viewer':'u'},body:JSON.stringify(input)});
 const first=await save();assert.equal(first.status,201);const trip=(await first.json()).trip;assert.equal((await (await save()).json()).trip.id,trip.id);assert.equal((await db.prepare('SELECT count(*) n FROM trips').first()).n,1);
 assert.equal((await auth('refresh',{},cookie)).status,200);
 assert.equal((await auth('logout',{},cookie)).status,200);assert.equal((await mf.dispatchFetch(origin+'/api/vehicles',{headers:{cookie}})).status,401);assert.equal((await auth('refresh',{},cookie)).status,403);
 assert.equal((await db.prepare("SELECT external_auth_id FROM users WHERE id='u'").first()).external_auth_id,'legacy-unchanged');
 console.log('PASS built framework/workerd/local-D1: six anonymous private routes denied, no identity leakage in status, disabled/unmapped/revoked accounts denied, other vehicle/viewer denied, session-plus-binding required, foreign origin denied, remember-off/on cookies, verified native scope, trip save/exact retry once, refresh, logout/replay denied, old identity preserved. Provider mocked; NOT live account/email/iPhone proof or permission to remove Access.');
}finally{await mf.dispose();await mock.close();}
