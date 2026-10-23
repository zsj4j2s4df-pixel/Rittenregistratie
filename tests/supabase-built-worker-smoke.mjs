// Built framework + embedded release entry + real local workerd/D1.
// Supabase Auth network responses are synthetic; no real users/passwords/emails.
import {createRequire} from 'node:module';
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
const root=new URL('../dist/server/',import.meta.url).pathname.replace(/\/$/,'');
const paths=[];function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+item.name;if(item.isDirectory())walk(p);else if(p.endsWith('.js'))paths.push(p);}}walk(root);
paths.sort((a,b)=>Number(b===root+'/release-entry.js')-Number(a===root+'/release-entry.js'));
const mf=new Miniflare({modules:paths.map(path=>({type:'ESModule',path,contents:readFileSync(path,'utf8')})),modulesRoot:root,compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{APP_ORIGIN:origin,AUTH_PROVIDER:'supabase',SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic'},fetchMock:mock});
try{
 const db=await mf.getD1Database('DB');for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 await db.prepare("INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES ('u','legacy-unchanged','Synthetic',1,1)").run();await db.prepare("INSERT INTO vehicles(id,display_name,created_at) VALUES('v','Synthetic',1)").run();await db.prepare("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES('u','v')").run();
 await db.prepare('INSERT INTO auth_identities(issuer,subject,user_id) VALUES(?,?,?)').bind(url+'/auth/v1',sub,'u').run();
 const auth=(action,body={},cookie='')=>mf.dispatchFetch(origin+'/api/auth/'+action,{method:'POST',headers:{origin,'content-type':'application/json','x-csrf-protection':'1',cookie},body:JSON.stringify(body)});
 assert.equal((await mf.dispatchFetch(origin+'/api/vehicles')).status,401);
 assert.equal((await mf.dispatchFetch(origin+'/api/vehicles',{headers:{'cf-access-jwt-assertion':jwt}})).status,401);
 const login=await auth('login',{email:'synthetic@example.test',password:'synthetic-password',remember:true});assert.equal(login.status,200,'framework login '+await login.clone().text());const values=login.headers.getSetCookie();assert.equal(values.length,4);assert.ok(values.every(c=>c.includes('Secure; HttpOnly; SameSite=Strict; Max-Age=2592000')));
 const cookie=values.map(c=>c.split(';')[0]).join('; ');const status=await mf.dispatchFetch(origin+'/api/vehicles',{headers:{cookie}});assert.equal(status.status,200);assert.equal((await status.json()).vehicles[0].id,'v');
 const scope=await mf.dispatchFetch(origin+'/api/vehicles/v/session',{headers:{cookie,'x-ritkompas-viewer':'u'}});assert.deepEqual((await scope.json()).session,{version:1,viewerId:'u',vehicleId:'v',expiresAt:exp*1000});
 const input={requestId:'supabase-built-create-0001',startedAt:100,endedAt:200,distanceKm:20,startAddress:'Synthetic A',endAddress:'Synthetic B',classification:'private',driverId:'u',odometerStart:0,odometerEnd:20,purpose:null,reason:'Synthetic Supabase bridge smoke'};
 const save=()=>mf.dispatchFetch(origin+'/api/vehicles/v/trips',{method:'POST',headers:{cookie,origin,'content-type':'application/json','x-csrf-protection':'1','x-ritkompas-viewer':'u'},body:JSON.stringify(input)});
 const first=await save();assert.equal(first.status,201);const trip=(await first.json()).trip;assert.equal((await (await save()).json()).trip.id,trip.id);assert.equal((await db.prepare('SELECT count(*) n FROM trips').first()).n,1);
 assert.equal((await auth('refresh',{},cookie)).status,200);
 assert.equal((await auth('logout',{},cookie)).status,200);assert.equal((await mf.dispatchFetch(origin+'/api/vehicles',{headers:{cookie}})).status,401);assert.equal((await auth('refresh',{},cookie)).status,403);
 assert.equal((await db.prepare("SELECT external_auth_id FROM users WHERE id='u'").first()).external_auth_id,'legacy-unchanged');
 console.log('PASS built framework/workerd/local-D1: Supabase login route, remembered HttpOnly host cookies, real vehicle scope, trip save/exact retry once, refresh, logout/replay denied, old identity preserved. Provider mocked; NOT live account/email/iPhone proof.');
}finally{await mf.dispose();await mock.close();}
