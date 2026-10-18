import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/trip-fixture.mjs';
import { createTripHttpHandler } from '../lib/trip-http.ts';
import { createBackendClient } from '../app/backend-client.ts';
import { listAccessibleVehicles } from '../lib/vehicle-service.ts';
const p={userId:'u',disabled:false,sessionExpiresAt:2_000_000},origin='https://ritkompas.example';
function fixture(t){const f=setup(t);const handle=createTripHttpHandler({db:f.db,origin,resolveSession:async()=>p,clock:()=>1_000_000});const fetcher=async(path,init={})=>{assert.equal(init.credentials,'same-origin');assert.equal(init.cache,'no-store');assert.equal(init.redirect,'error');const headers=new Headers(init.headers);if(init.method!=='GET')headers.set('origin',origin);return handle(new Request(origin+path,{...init,headers}));};return {...f,handle,fetcher,client:createBackendClient(fetcher)};}
const trip={requestId:'client-trip-create-0001',startedAt:300,endedAt:400,distanceKm:20,startAddress:'Synthetic A',endAddress:'Synthetic B',classification:'private',driverId:null,odometerStart:0,odometerEnd:20,purpose:null,reason:'Synthetic client'};
test('central client roundtrips vehicles, trip creation, settings, saved reports through real HTTP and SQLite',async t=>{
 const {client}=fixture(t);const vehicles=await client.vehicles();assert.deepEqual(vehicles.map(v=>v.id),['v']);const created=await client.createTrip('v',trip);assert.equal(created.odometer_start,0);assert.equal((await client.trips('v')).length,2);const settings=await client.settings('v');const updated=await client.saveSettings('v',{...settings,plate:'TEST-01',reason:'New plate'});assert.equal(updated.revision,1);const report=await client.createReport('v',{requestId:'client-report-create-0001',from:'1970-01-01',until:'1970-01-01',driverId:null});assert.equal(report.rows.length,2);assert.equal((await client.reports('v')).length,1);assert.ok(client.reportCsvUrl('v',report.id).endsWith('/csv'));assert.ok((await (await client.csv('v',report.id)).text()).includes('TEST-01'));
});
test('lost response after committed create can be retried with same receipt without duplicate trip/audit',async t=>{
 const {fetcher,sqlite}=fixture(t);let lose=true;const client=createBackendClient(async(path,init)=>{const response=await fetcher(path,init);if(init.method==='POST'&&lose){lose=false;throw Error('connection lost after commit');}return response;});await assert.rejects(()=>client.createTrip('v',trip),e=>e.status===0);const recovered=await client.createTrip('v',trip);assert.equal(recovered.revision,0);assert.equal(sqlite.prepare("SELECT count(*) AS n FROM trips WHERE vehicle_id='v'").get().n,2);assert.equal(sqlite.prepare("SELECT count(*) AS n FROM audit_logs WHERE action='create'").get().n,1);
});
test('stale client settings remain a409; client never automatically resends or silently overwrites',async t=>{
 const {client}=fixture(t);const initial=await client.settings('v');await client.saveSettings('v',{...initial,plate:'AA-11-BB',reason:'First'});await assert.rejects(()=>client.saveSettings('v',{...initial,plate:'BB-22-CC',reason:'Stale'}),e=>e.status===409);assert.equal((await client.settings('v')).plate,'AA-11-BB');
});
test('vehicle listing requires verified user and active membership, pagination is validated',async t=>{
 const {db,sqlite,client}=fixture(t);await assert.rejects(()=>listAccessibleVehicles(db),e=>e.status===401);assert.equal((await client.vehicles()).length,1);for(const [limit,offset]of [[0,0],[101,0],[50,-1]])await assert.rejects(()=>listAccessibleVehicles(db,async()=>p,limit,offset,()=>1_000_000),e=>e.status===400);sqlite.exec('UPDATE vehicle_memberships SET active=0');assert.deepEqual(await client.vehicles(),[]);sqlite.exec("UPDATE users SET disabled=1 WHERE id='u'");await assert.rejects(()=>client.vehicles(),e=>e.status===403);
});
test('central client loads all paginated trips rather than silently showing only first100',async t=>{
 const {sqlite,client}=fixture(t);const stmt=sqlite.prepare("INSERT INTO trips(id,vehicle_id,created_by,updated_at,started_at,ended_at,distance_km) VALUES (?,'v','u',1,100,200,1)");for(let i=0;i<105;i++)stmt.run('page-'+i);assert.equal((await client.trips('v')).length,106);
});

test('CSV client refuses a successful HTML login page instead of downloading it as a report',async()=>{
 const client=createBackendClient(async()=>new Response('<html>login</html>',{headers:{'content-type':'text/html'}}));await assert.rejects(()=>client.csv('v','report'),e=>e.status===502);
});
