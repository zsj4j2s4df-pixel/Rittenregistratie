import test from 'node:test';import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createNativePendingChoiceService} from '../lib/native-pending-choice-service.ts';
import {createTripHttpHandler} from '../lib/trip-http.ts';
import {createJourneyChoiceService} from '../lib/journey-choice-service.ts';
const p={userId:'u',disabled:false,sessionExpiresAt:2000000},clock=()=>1000000,status=n=>e=>e.status===n;
function seed(f,count=1,vehicle='v'){
 for(let n=0;n<count;n++)f.sqlite.prepare(`INSERT INTO vehicle_journeys(id,vehicle_id,created_by,started_at,ended_at,status,revision,created_at,updated_at,last_mutation_id) VALUES(?,?,?,100,200,'review_closed',0,1,1,?)`).run(`pending-${vehicle}-${String(n).padStart(16,'0')}`,vehicle,vehicle==='v'?'u':'other',`marker-${vehicle}-${n}`);
}
test('pending feed is minimal, scoped, read-only and retains unclassified closed journeys',async t=>{
 const f=setup(t);seed(f,2);seed(f,1,'other-v');
 const before=f.sqlite.prepare('SELECT total_changes() AS n').get().n;
 const r=await createNativePendingChoiceService(f.db,async()=>p,clock).pending('v');
 assert.deepEqual(r,{version:1,viewerId:'u',vehicleId:'v',expiresAt:2000000,proposals:[0,1].map(n=>({id:`pending-v-${String(n).padStart(16,'0')}`,revision:0})),moreAvailable:false});
 assert.equal(f.sqlite.prepare('SELECT total_changes() AS n').get().n,before);
 await assert.rejects(()=>createNativePendingChoiceService(f.db,async()=>p,clock).pending('other-v'),status(403));
 const empty=setup(t);assert.deepEqual((await createNativePendingChoiceService(empty.db,async()=>p,clock).pending('v')).proposals,[]);
});
test('classification by another authorized viewer removes pending prompt without asserting driver',async t=>{
 const f=setup(t);seed(f);f.sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES('other','v')");
 await createJourneyChoiceService(f.db,async()=>({...p,userId:'other'}),clock).choose('v','pending-v-0000000000000000',{requestId:'pending-choice-request-0001',expectedRevision:0,classification:'business',reason:'Synthetic explicit choice'});
 const result=await createNativePendingChoiceService(f.db,async()=>p,clock).pending('v');assert.deepEqual(result.proposals,[]);
 assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM trips').get().n,2);
});
test('pending feed bounds response and explicitly reports additional proposals',async t=>{
 const f=setup(t);seed(f,26);const r=await createNativePendingChoiceService(f.db,async()=>p,clock).pending('v');assert.equal(r.proposals.length,25);assert.equal(r.moreAvailable,true);
 assert.equal(new Set(r.proposals.map(p=>p.id)).size,25);
});
test('pending feed denies absent/expired sessions, revoked membership and mid-read expiry',async t=>{
 for(const principal of [null,{...p,disabled:true},{...p,sessionExpiresAt:1000000},{...p,sessionExpiresAt:NaN}]){const f=setup(t);await assert.rejects(()=>createNativePendingChoiceService(f.db,async()=>principal,clock).pending('v'),status(401));}
 for(const sql of ["UPDATE vehicle_memberships SET active=0","UPDATE vehicle_memberships SET role='reader'","UPDATE users SET disabled=1 WHERE id='u'","UPDATE users SET role='reader' WHERE id='u'"]){const f=setup(t);seed(f);f.sqlite.exec(sql);await assert.rejects(()=>createNativePendingChoiceService(f.db,async()=>p,clock).pending('v'),status(403));}
 const f=setup(t);let calls=0;await assert.rejects(()=>createNativePendingChoiceService(f.db,async()=>p,()=>++calls===1?1000000:3000000).pending('v'),status(401));
 await assert.rejects(()=>createNativePendingChoiceService(f.db,async()=>{f.sqlite.exec("UPDATE vehicle_memberships SET active=0");return p;},clock).pending('v'),status(403));
});
test('pending HTTP is GET-only no-store and rejects fake viewer/query/encoded path',async t=>{
 const f=setup(t);seed(f);const origin='https://native.invalid';let principal=p;
 const h=createTripHttpHandler({db:f.db,origin,resolveSession:async()=>principal,clock});
 const req=(suffix='',method='GET',headers={})=>h(new Request(origin+'/api/vehicles/v/pending-choices'+suffix,{method,headers}));
 const r=await req();assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal((await r.json()).pending.viewerId,'u');
 for(const method of ['POST','DELETE','PATCH'])assert.equal((await req('',method)).status,405);
 assert.equal((await req('?viewerId=other')).status,400);assert.equal((await req('','GET',{'x-ritkompas-viewer':'other'})).status,409);
 assert.equal((await h(new Request(origin+'/api/vehicles/v%2Fother/pending-choices'))).status,400);principal=null;assert.equal((await req()).status,401);
});
