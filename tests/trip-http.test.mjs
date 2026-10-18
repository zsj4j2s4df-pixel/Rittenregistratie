import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/trip-fixture.mjs';
import { createTripHttpHandler } from '../lib/trip-http.ts';
const origin='https://ritkompas.example';
const principal={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
const edit={expectedRevision:0,startedAt:100,endedAt:200,distanceKm:20,startAddress:'Synthetic A',endAddress:'Synthetic B',classification:'private',driverId:null,odometerStart:0,odometerEnd:20,purpose:null,reason:'HTTP smoke'};
const creation={...edit,requestId:'http-create-test-0001'};delete creation.expectedRevision;
function handler(t, resolveSession=async()=>principal){const fixture=setup(t);return {...fixture,handle:createTripHttpHandler({db:fixture.db,origin,resolveSession,clock:()=>1_000_000})};}
const request=(path='',method='GET',body,headers={})=>new Request(origin+'/api/vehicles/v/trips'+path,{method,headers:body===undefined?headers:{origin,'x-csrf-protection':'1','content-type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});
test('HTTP resolver is required per request; spoofed actor headers do not authenticate',async t=>{
 const {db}=setup(t);const deny=createTripHttpHandler({db,origin,clock:()=>1_000_000});const r=await deny(request('','GET',undefined,{'oai-authenticated-user-id':'u','x-user-id':'u'}));assert.equal(r.status,401);
 let calls=0;const handle=createTripHttpHandler({db,origin,clock:()=>1_000_000,resolveSession:async()=>{calls++;return principal;}});assert.equal((await handle(request())).status,200);assert.equal((await handle(request('/t'))).status,200);assert.equal(calls,2);
});
test('HTTP read scope, pagination, history, no-store and no CORS',async t=>{
 const {handle}=handler(t);const r=await handle(request());assert.equal(r.status,200);assert.equal((await r.json()).trips.length,1);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('access-control-allow-origin'),null);
 assert.equal((await handle(new Request(origin+'/api/vehicles/other-v/trips'))).status,403);assert.equal((await handle(request('/other-t'))).status,404);assert.equal((await handle(request('/t/history'))).status,200);
 for(const path of ['?limit=101','?limit=1&limit=2','?offset=-1','?limit=1e2','?actor=u','/t?limit=1','/t/history?offset=1','/%2Ft','/%FF'])assert.equal((await handle(request(path))).status,400,path);
});
test('mutations require exact origin, custom CSRF header and JSON',async t=>{
 const {handle,service}=handler(t);for(const headers of [{origin:'https://evil.example'},{origin:'null'},{origin:''},{'x-csrf-protection':''},{'sec-fetch-site':'cross-site'}])assert.equal((await handle(request('/t','PATCH',edit,headers))).status,403);
 assert.equal((await handle(request('/t','PATCH',edit,{'content-type':'text/plain'}))).status,415);assert.equal((await service.get('v','t')).revision,0);
 assert.equal((await handle(new Request('https://evil.example/api/vehicles/v/trips'))).status,403);
 assert.equal((await handle(request('','OPTIONS'))).status,405);assert.equal((await handle(request('/t','DELETE'))).status,405);
});
test('bounded JSON parser rejects malformed, unexpected, oversized and invalid UTF8 bodies',async t=>{
 const {handle}=handler(t);const headers={origin,'x-csrf-protection':'1','content-type':'application/json'};
 for(const body of ['{','[]','null','"text"'])assert.equal((await handle(new Request(origin+'/api/vehicles/v/trips/t',{method:'PATCH',headers,body}))).status,400);
 assert.equal((await handle(request('/t','PATCH',{...edit,actor:'spoof'}))).status,400);
 assert.equal((await handle(request('','POST',{...creation,distance_source:'gps'}))).status,400);
 assert.equal((await handle(request('/t','PATCH',{...edit,reason:'x'.repeat(17000)}))).status,413);
 assert.equal((await handle(request('/t','PATCH',edit,{'content-length':'20000'}))).status,413);
 const stream=new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('x'.repeat(16385)));c.close();}});
 assert.equal((await handle(new Request(origin+'/api/vehicles/v/trips/t',{method:'PATCH',headers,body:stream,duplex:'half'}))).status,413);
 assert.equal((await handle(new Request(origin+'/api/vehicles/v/trips/t',{method:'PATCH',headers,body:new Uint8Array([0xff])}))).status,400);
});
test('HTTP creates/retries, corrects, rejects stale revision and records verified history',async t=>{
 const {handle}=handler(t);const created=await handle(request('','POST',creation));assert.equal(created.status,201);const {trip}=await created.json();assert.equal(trip.created_by,'u');
 const retry=await handle(request('','POST',creation));assert.equal((await retry.json()).trip.id,trip.id);assert.equal((await handle(request('','POST',{...creation,distanceKm:25}))).status,409);
 assert.equal((await handle(request('/'+trip.id,'PATCH',edit))).status,200);assert.equal((await handle(request('/'+trip.id,'PATCH',edit))).status,409);
 const history=await handle(request('/'+trip.id+'/history'));assert.equal((await history.json()).history.length,2);
});
test('internal provider/database failures are hidden; HTTP configuration requires exact safe origin',async t=>{
 const {db}=setup(t);const handle=createTripHttpHandler({db,origin,resolveSession:async()=>{throw new Error('secret SQL private address');}});const r=await handle(request());assert.equal(r.status,500);assert.doesNotMatch(await r.text(),/secret|SQL|address/);
 for(const value of ['http://public.example','https://ritkompas.example/','https://ritkompas.example/path'])assert.throws(()=>createTripHttpHandler({db,origin:value}));
 assert.doesNotThrow(()=>createTripHttpHandler({db,origin:'http://localhost:4173'}));
});

test('HTTP settings share authentication, CSRF, field bounds, revision conflicts and audit',async t=>{
 const {handle}=handler(t);const url=origin+'/api/vehicles/v/settings';const payload={revision:0,plate:'ab-12-cd',addresses:[],rates:[],reason:'Synthetic settings'};
 const make=(body,extra={})=>new Request(url,{method:'PATCH',headers:{origin,'x-csrf-protection':'1','content-type':'application/json',...extra},body:JSON.stringify(body)});
 assert.equal((await handle(make(payload,{origin:'https://evil.example'}))).status,403);
 assert.equal((await handle(make({...payload,actor:'spoofed'}))).status,400);
 const saved=await handle(make(payload));assert.equal(saved.status,200);assert.equal((await saved.json()).settings.plate,'AB-12-CD');
 assert.equal((await handle(make(payload))).status,409);assert.equal((await handle(new Request(url))).status,200);const h=await handle(new Request(url+'/history'));assert.equal((await h.json()).history.length,1);
 assert.equal((await handle(new Request(origin+'/api/vehicles/other-v/settings'))).status,403);assert.equal((await handle(new Request(url+'?extra=1'))).status,400);
});
