import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/trip-fixture.mjs';
import { createTripHttpHandler } from '../lib/trip-http.ts';
import { createBackendClient } from '../app/backend-client.ts';
import { correctionInput, correctionTime } from '../app/beheer/trip-correction-values.ts';
const principal={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
const origin='https://ritkompas.example';
function fixture(t){const f=setup(t);const handle=createTripHttpHandler({db:f.db,origin,resolveSession:async()=>principal,clock:()=>1_000_000});const client=createBackendClient(async(path,init={})=>{const headers=new Headers(init.headers);if(init.method&&init.method!=='GET')headers.set('origin',origin);return handle(new Request(origin+path,{...init,headers}));});return {...f,client};}
function form(trip){const data=new FormData();for(const [key,value] of Object.entries({startedAt:correctionTime(trip.started_at),endedAt:correctionTime(trip.ended_at),distanceKm:trip.distance_km??'',startAddress:trip.start_address??'',endAddress:trip.end_address??'',classification:trip.classification,odometerStart:trip.odometer_start??'',odometerEnd:trip.odometer_end??'',purpose:trip.purpose??'',reason:'Synthetic correction'}))data.set(key,String(value));return data;}
test('correction through real HTTP preserves second precision, explicit zero, driver and audited before/after; stale retry rejects',async t=>{
 const {client,sqlite}=fixture(t);const start=Date.parse('2026-10-25T01:30:37Z')/1000;
 sqlite.prepare("UPDATE trips SET started_at=?,ended_at=?,driver_id='u',odometer_start=0,odometer_end=20,start_address='Synthetic A',end_address='Synthetic B' WHERE id='t'").run(start,start+1234);
 const trip=(await client.trips('v'))[0],data=form(trip);data.set('classification','business');
 const input=correctionInput(trip,data);assert.equal(input.startedAt,start);assert.equal(input.endedAt,start+1234);assert.equal(input.odometerStart,0);assert.equal(input.driverId,'u');assert.equal(input.expectedRevision,0);
 const saved=await client.editTrip('v',trip.id,input);assert.equal(saved.started_at,start);assert.equal(saved.driver_id,'u');
 const history=await client.history('v',trip.id);assert.equal(history.length,1);assert.equal(history[0].actor_id,'u');assert.equal(JSON.parse(history[0].old_value_json).classification,'review');const after=JSON.parse(history[0].new_value_json);assert.equal(after.classification,'business');assert.equal(after.correction_reason,'Synthetic correction');
 await assert.rejects(()=>client.editTrip('v',trip.id,input),e=>e.status===409);assert.equal((await client.history('v',trip.id)).length,1);
 await assert.rejects(()=>client.history('other-v',trip.id),e=>e.status===403);await assert.rejects(()=>client.history('v','other-t'),e=>e.status===404);
});
test('unknown fields stay empty/null and cannot silently become a distance or end time',async t=>{
 const {client}=fixture(t);const trip=(await client.trips('v'))[0];const data=form(trip);const input=correctionInput(trip,data);assert.equal(input.driverId,null);assert.equal(input.odometerStart,null);assert.equal(input.odometerEnd,null);assert.equal(input.purpose,null);assert.equal(correctionTime(null),'');
 data.set('distanceKm','');assert.throws(()=>correctionInput(trip,data),/afstand/);data.set('distanceKm','20');data.set('endedAt','');assert.throws(()=>correctionInput(trip,data),/aankomst/);
});
test('history reload after revocation denies access rather than leaking cached audit entries',async t=>{
 const {client,sqlite}=fixture(t);assert.deepEqual(await client.history('v','t'),[]);sqlite.exec('UPDATE vehicle_memberships SET active=0');await assert.rejects(()=>client.history('v','t'),e=>e.status===403);
});
