import test from 'node:test';import assert from 'node:assert/strict';import {setup} from './helpers/trip-fixture.mjs';import {createTripHttpHandler} from '../lib/trip-http.ts';import {createBackendClient} from '../app/backend-client.ts';
test('route client collects bounded pages under one highwater; HTTP remains scoped and strict',async t=>{
 const {db,sqlite}=setup(t);const insert=sqlite.prepare("INSERT INTO route_points(trip_id,recorded_at,latitude,longitude,source) VALUES ('t',?,52,5,'gps')");for(let i=0;i<1203;i++)insert.run(i+100);
 const origin='https://routes.example.invalid',handle=createTripHttpHandler({db,origin,resolveSession:async()=>({userId:'u',disabled:false,sessionExpiresAt:2_000_000}),clock:()=>1_000_000});let calls=0;
 const client=createBackendClient(async(path,init)=>{const response=await handle(new Request(origin+path,init));if(++calls===1)insert.run(9999);return response;});
 const route=await client.route('v','t');assert.equal(route.points.length,1203);assert.equal(calls,3);assert.ok(route.points.every(point=>point.recorded_at!==9999));
 const request=path=>handle(new Request(origin+path));const response=await request('/api/vehicles/v/trips/t/route');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 for(const query of ['?limit=0','?after=-1','?through=1&after=2','?offset=1','?after=1&after=2'])assert.equal((await request('/api/vehicles/v/trips/t/route'+query)).status,400);
 assert.equal((await request('/api/vehicles/v/trips/other-t/route')).status,404);assert.equal((await request('/api/vehicles/other-v/trips/other-t/route')).status,403);
 sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");await assert.rejects(()=>client.route('v','t'),e=>e.status===403);
});
