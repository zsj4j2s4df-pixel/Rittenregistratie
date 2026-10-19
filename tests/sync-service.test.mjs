import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createSyncService} from '../lib/sync-service.ts';
import {createTripHttpHandler} from '../lib/trip-http.ts';
import {createSettingsService} from '../lib/settings-service.ts';
const resolver=async()=>({userId:'u',disabled:false,sessionExpiresAt:2_000_000}),clock=()=>1_000_000;
test('one transactional full refresh scopes all collections and shares exact settings decoding',async t=>{
 const {db}=setup(t);const settingsService=createSettingsService(db,resolver,clock);
 await settingsService.save('v',{revision:0,plate:'TT-01-XX',addresses:[{id:'a',label:'Office',address:'Synthetic',enabled:true,note:''}],rates:[{id:'r',validFrom:'2026-01-01',microsPerKm:230000}],reason:'Synthetic'});
 let batches=0;const wrapped={...db,batch:async statements=>{batches++;assert.equal(statements.length,5);return db.batch(statements);}};
 const s=await createSyncService(wrapped,resolver,clock).snapshot('v');assert.equal(batches,1);assert.equal(s.version,1);assert.equal(s.fetchedAt,1_000_000);assert.equal(s.vehicle.registration_plate,s.settings.plate);assert.deepEqual(s.settings,await settingsService.get('v'));assert.deepEqual(s.trips.map(t=>t.id),['t']);assert.deepEqual(JSON.parse(JSON.stringify(s.drivers)),[{id:'u',name:'Test U'}]);assert.deepEqual(s.reports,[]);
 assert.ok(!JSON.stringify(s).includes('test-u'));assert.ok(!JSON.stringify(s).includes('other-t'));
 await assert.rejects(()=>createSyncService(db,resolver,clock).snapshot('other-v'),e=>e.status===403);await assert.rejects(()=>createSyncService(db).snapshot('v'),e=>e.status===401);
});
test('revocation between preliminary authorization and batch yields no partial data',async t=>{
 const {db,sqlite}=setup(t);const wrapped={...db,batch:async statements=>{sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");return db.batch(statements);}};
 await assert.rejects(()=>createSyncService(wrapped,resolver,clock).snapshot('v'),e=>e.status===403);
});
test('snapshot HTTP is strict read-only/no-store, rejects queries and respects expiry',async t=>{
 const {db}=setup(t);const origin='https://sync.example.invalid';const handler=createTripHttpHandler({db,origin,resolveSession:resolver,clock});const request=(path,method='GET')=>handler(new Request(origin+path,{method}));
 const r=await request('/api/vehicles/v/snapshot');assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal((await r.json()).snapshot.trips.length,1);
 assert.equal((await request('/api/vehicles/v/snapshot?limit=1')).status,400);assert.equal((await request('/api/vehicles/v/snapshot','POST')).status,405);
 let count=0;const advancing=()=>++count<=1?1_000_000:3_000_000;await assert.rejects(()=>createSyncService(db,resolver,advancing).snapshot('v'),e=>e.status===401);
});
test('oversized full refresh fails explicitly rather than truncating trips',async t=>{
 const {db,sqlite}=setup(t);sqlite.exec("WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<5000) INSERT INTO trips(id,vehicle_id,created_by,updated_at,started_at,ended_at,distance_km,route_type,distance_source) SELECT 'bulk-'||x,'v','u',1,x+1000,x+1001,1,'estimated','manual' FROM n");
 await assert.rejects(()=>createSyncService(db,resolver,clock).snapshot('v'),e=>e.status===413);
});
