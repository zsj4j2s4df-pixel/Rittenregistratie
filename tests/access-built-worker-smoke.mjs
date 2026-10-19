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
 const writeHeaders={cookie:'CF_Authorization='+jwt,origin,'content-type':'application/json','x-csrf-protection':'1','x-ritkompas-viewer':'u'};
 const tripInput={requestId:'built-worker-trip-create-0001',startedAt:100,endedAt:200,distanceKm:20,startAddress:'Synthetic A',endAddress:'Synthetic B',classification:'private',driverId:'u',odometerStart:0,odometerEnd:20,purpose:null,reason:'Synthetic built-worker save regression'};
 const save=()=>mf.dispatchFetch(origin+'/api/vehicles/v/trips',{method:'POST',headers:writeHeaders,body:JSON.stringify(tripInput)});
 const saved=await save();assert.equal(saved.status,201,'built trip save: '+await saved.clone().text());const savedTrip=(await saved.json()).trip;
 const retry=await save();assert.equal(retry.status,201);assert.equal((await retry.json()).trip.id,savedTrip.id);assert.equal((await db.prepare('SELECT count(*) AS n FROM trips').first()).n,1);
 const listing=await mf.dispatchFetch(origin+'/api/vehicles/v/trips',{headers:{cookie:'CF_Authorization='+jwt}});assert.equal((await listing.json()).trips[0].id,savedTrip.id);
 const settingsGet=await mf.dispatchFetch(origin+'/api/vehicles/v/settings',{headers:{cookie:'CF_Authorization='+jwt}});const settings=(await settingsGet.json()).settings;
 const settingsSave=await mf.dispatchFetch(origin+'/api/vehicles/v/settings',{method:'PATCH',headers:writeHeaders,body:JSON.stringify({...settings,plate:'TEST-01',reason:'Synthetic built-worker settings save'})});assert.equal(settingsSave.status,200,'built settings save: '+await settingsSave.clone().text());
 const reviewInput={requestId:'built-human-trip-review-0001',expectedRevision:savedTrip.revision,confirmed:true,reason:'Synthetic explicit built Worker logbook review'},review=()=>mf.dispatchFetch(origin+'/api/vehicles/v/trips/'+savedTrip.id+'/review',{method:'POST',headers:writeHeaders,body:JSON.stringify(reviewInput)});const reviewed=await review();assert.equal(reviewed.status,200,'built review: '+await reviewed.clone().text());const reviewReceipt=(await reviewed.json()).receipt;assert.deepEqual((await (await review()).json()).receipt,reviewReceipt);assert.equal((await db.prepare('SELECT needs_review FROM trips WHERE id=?').bind(savedTrip.id).first()).needs_review,0);
 await db.prepare("INSERT INTO vehicle_journeys(id,vehicle_id,created_by,started_at,ended_at,status,revision,created_at,updated_at,last_mutation_id)VALUES('built-journey-materialize-01','v','u',300,400,'review_closed',1,1,1,'seed')").run();
 const materialization={requestId:'built-reviewed-materialize-01',expectedRevision:1,reviewed:true,classification:'review',driverId:null,distanceKm:null,startAddress:null,endAddress:null,odometerStart:0,odometerEnd:null,purpose:null,reason:'Synthetic explicit built Worker review'};
 const materialize=()=>mf.dispatchFetch(origin+'/api/vehicles/v/journeys/built-journey-materialize-01/materialize',{method:'POST',headers:writeHeaders,body:JSON.stringify(materialization)});
 const converted=await materialize();assert.equal(converted.status,200,'built materialize: '+await converted.clone().text());const convertedReceipt=(await converted.json()).receipt;assert.deepEqual((await (await materialize()).json()).receipt,convertedReceipt);
 assert.equal((await db.prepare('SELECT count(*) AS n FROM journey_materializations').first()).n,1);const convertedTrip=await db.prepare('SELECT distance_km,odometer_start FROM trips WHERE id=?').bind(convertedReceipt.tripId).first();assert.equal(convertedTrip.distance_km,null);assert.equal(convertedTrip.odometer_start,0);
 const sourceDetail=await mf.dispatchFetch(origin+'/api/vehicles/v/journeys/built-journey-materialize-01',{headers:{cookie:'CF_Authorization='+jwt}});assert.equal((await sourceDetail.json()).journey.materialized_trip_id,convertedReceipt.tripId);
 await db.prepare("UPDATE users SET disabled=1 WHERE id='u'").run();await status({cookie:'CF_Authorization='+jwt},401);
 await db.prepare("UPDATE users SET disabled=0 WHERE id='u'").run();await db.prepare('UPDATE vehicle_memberships SET active=0').run();const revoked=await mf.dispatchFetch(origin+'/api/vehicles/v/trips',{headers:{cookie:'CF_Authorization='+jwt}});assert.equal(revoked.status,403);
 const rootResponse=await mf.dispatchFetch(origin+'/');assert.equal(rootResponse.status,200);const rootHtml=await rootResponse.text();assert.doesNotMatch(rootHtml,/Lokale demonstratie|Utrecht → Amersfoort/);assert.match(rootHtml,/Centrale registratie/);
 const page=await mf.dispatchFetch(origin+'/beheer');assert.equal(page.status,200);
 console.log('PASS built embedded wrapper + actual framework routing + local workerd/D1: root serves central registration, signed header/cookie, save/read/exact retry, settings save, explicit trip review/exact retry, atomic reviewed journey materialization/exact retry, forged header denial, disabled user, revoked membership, beheer shell. Synthetic JWKS only; NOT live Access/browser login.');
}finally{await mf.dispose();}
