import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createDeviceHttpHandler} from '../lib/device-http.ts';
const origin='https://devices.example.invalid',principal={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
const input={requestId:'device-http-request-01',id:'device-http-instance-01',name:'Synthetic device',platform:'ios'};
function fixture(t){const f=setup(t);return {...f,handle:createDeviceHttpHandler({db:f.db,origin,resolveSession:async()=>principal,clock:()=>1_000_000})};}
function req(suffix='',method='GET',body,headers={}){return new Request(origin+'/api/vehicles/v/devices'+suffix,{method,headers:body===undefined?headers:{origin,'content-type':'application/json','x-csrf-protection':'1',...headers},body:body===undefined?undefined:JSON.stringify(body)});}
test('standalone HTTP registers/retries/lists own instances and deactivates with revision/audit without reactivation',async t=>{
 const {handle,sqlite}=fixture(t);const first=await handle(req('','POST',input));assert.equal(first.status,201);const {device}=await first.json();assert.equal(device.user_id,'u');const retry=await handle(req('','POST',input));assert.deepEqual((await retry.json()).device,device);assert.equal((await (await handle(req())).json()).devices.length,1);
 const retired=await handle(req('/'+input.id,'PATCH',{expectedRevision:0,reason:'Synthetic deactivation'}));assert.equal(retired.status,200);assert.equal((await retired.json()).device.active,0);assert.equal((await handle(req('','POST',input))).status,409);assert.equal((await handle(req('/'+input.id,'PATCH',{expectedRevision:0,reason:'Stale'}))).status,409);assert.equal(sqlite.prepare("SELECT count(*) AS n FROM audit_logs WHERE entity_type='device'").get().n,2);
});
test('no resolver/forged headers deny; expected viewer rejects an actual account switch before writes',async t=>{
 const {db,sqlite,handle}=fixture(t);const deny=createDeviceHttpHandler({db,origin,clock:()=>1_000_000});assert.equal((await deny(req('','POST',input,{'oai-authenticated-user-id':'u','cf-access-authenticated-user-email':'synthetic@example.test'}))).status,401);
 assert.equal((await handle(req('','POST',input,{'x-ritkompas-viewer':'other'}))).status,409);assert.equal((await handle(req('','POST',input,{'x-ritkompas-viewer':''}))).status,400);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM registered_devices').get().n,0);
 assert.equal((await handle(req('','POST',input,{'x-ritkompas-viewer':'u'}))).status,201);
});
test('foreign vehicle/owner and revoked membership cannot list or change device metadata',async t=>{
 const {db,sqlite,handle}=fixture(t);await handle(req('','POST',input));assert.equal((await handle(new Request(origin+'/api/vehicles/other-v/devices'))).status,403);sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('other','v')");const other=createDeviceHttpHandler({db,origin,resolveSession:async()=>({...principal,userId:'other'}),clock:()=>1_000_000});assert.deepEqual((await (await other(req())).json()).devices,[]);assert.equal((await other(req('/'+input.id,'PATCH',{expectedRevision:0,reason:'Guess'}))).status,404);assert.equal((await other(req('','POST',{...input,requestId:'device-other-request-01'}))).status,409);
 sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");assert.equal((await handle(req())).status,403);assert.equal((await handle(req('','POST',input))).status,403);
});
test('mutation origin/CSRF/media boundaries protect registration and deactivation',async t=>{
 const {handle}=fixture(t);for(const headers of [{origin:'https://evil.example'},{origin:'null'},{'x-csrf-protection':''},{'sec-fetch-site':'cross-site'}])assert.equal((await handle(req('','POST',input,headers))).status,403);
 assert.equal((await handle(req('','POST',input,{'content-type':'text/plain'}))).status,415);assert.equal((await handle(new Request('https://evil.example/api/vehicles/v/devices'))).status,403);
 const response=await handle(req());assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('access-control-allow-origin'),null);
});
test('strict methods/query/fields/encoded IDs and bounded JSON reject invalid requests',async t=>{
 const {handle}=fixture(t);for(const suffix of ['?limit=101','?limit=0','?offset=-1','?limit=1e2','?offset=9007199254740992','?limit=1&limit=2','?actor=u','/%2Fbad','/%FF'])assert.equal((await handle(req(suffix))).status,400,suffix);
 for(const [suffix,method]of [['','PATCH'],['','DELETE'],['/'+input.id,'GET'],['','OPTIONS']]){const r=await handle(req(suffix,method));assert.equal(r.status,405);assert.ok(r.headers.get('allow'));}
 assert.equal((await handle(req('?limit=1','POST',input))).status,400);assert.equal((await handle(req('','POST',{...input,userId:'other'}))).status,400);assert.equal((await handle(req('/'+input.id,'PATCH',{expectedRevision:0,reason:'Bad',active:1}))).status,400);
 const headers={origin,'content-type':'application/json','x-csrf-protection':'1'};for(const body of ['{','[]','null'])assert.equal((await handle(new Request(origin+'/api/vehicles/v/devices',{method:'POST',headers,body}))).status,400);
 assert.equal((await handle(req('','POST',{...input,name:'x'.repeat(17000)}))).status,413);assert.equal((await handle(req('','POST',input,{'content-length':'99999'}))).status,413);
 const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(16385));c.close();}});assert.equal((await handle(new Request(origin+'/api/vehicles/v/devices',{method:'POST',headers,body:stream,duplex:'half'}))).status,413);
 assert.equal((await handle(new Request(origin+'/api/vehicles/v/devices',{method:'POST',headers,body:new Uint8Array([255])}))).status,400);
});
test('internal failures remain generic and origin configuration cannot fall back to request/Host',async t=>{
 const {db}=setup(t);for(const invalid of ['http://public.example','https://devices.example.invalid/','https://devices.example.invalid/path'])assert.throws(()=>createDeviceHttpHandler({db,origin:invalid}));assert.doesNotThrow(()=>createDeviceHttpHandler({db,origin:'http://localhost:4206'}));
 const handle=createDeviceHttpHandler({db,origin,resolveSession:async()=>{throw Error('private SQL secret');}});const response=await handle(req());assert.equal(response.status,500);assert.doesNotMatch(await response.text(),/private|SQL|secret/);
});
