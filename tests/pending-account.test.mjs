import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createTripHttpHandler} from '../lib/trip-http.ts';
import {createBackendClient} from '../app/backend-client.ts';
test('expected viewer prevents recovered writes after account switch even if both accounts share vehicle access',async t=>{
 const {db,sqlite}=setup(t);sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('other','v')");const origin='https://queue.example.invalid';const handle=createTripHttpHandler({db,origin,resolveSession:async()=>({userId:'other',disabled:false,sessionExpiresAt:2_000_000}),clock:()=>1_000_000});
 const client=createBackendClient((path,init)=>{const headers=new Headers(init.headers);headers.set('origin',origin);return handle(new Request(origin+path,{...init,headers}));});
 const input={requestId:'synthetic-pending-1',startedAt:1000,endedAt:1100,distanceKm:1,startAddress:'A',endAddress:'B',classification:'private',driverId:null,odometerStart:0,odometerEnd:1,purpose:null,reason:'Synthetic'};
 await assert.rejects(()=>client.createTrip('v',input,'u'),e=>e.status===409);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM trips').get().n,2);
 const trip=await client.createTrip('v',input,'other');assert.equal(trip.created_by,'other');await client.createTrip('v',input,'other');assert.equal(sqlite.prepare('SELECT count(*) AS n FROM trips').get().n,3);
});
