import {createTripService} from '../lib/trip-service.ts';
import test from 'node:test';import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';import {createJourneyMaterializer} from '../lib/journey-materialization.ts';import {createJourneyChoiceService} from '../lib/journey-choice-service.ts';import {createJourneyService} from '../lib/journey-service.ts';import {createJourneyHttpHandler} from '../lib/journey-http.ts';
const j='synthetic-journey-final-01',p={userId:'u',disabled:false,sessionExpiresAt:2000000},clock=()=>1000000,status=n=>e=>e.status===n;
const input={requestId:'materialize-request-00001',expectedRevision:1,reviewed:true,classification:'private',driverId:null,distanceKm:null,startAddress:null,endAddress:null,odometerStart:0,odometerEnd:null,purpose:null,reason:'Explicit synthetic review'};
function seed(t){const f=setup(t);f.sqlite.prepare("INSERT INTO vehicle_journeys(id,vehicle_id,created_by,started_at,ended_at,status,revision,created_at,updated_at,last_mutation_id)VALUES(?,'v','u',1000,2000,'review_closed',1,1,1,'seed')").run(j);return {...f,service:createJourneyMaterializer(f.db,async()=>p,clock)};}
test('explicit reviewed closed journey produces one auditable linked trip, preserves unknowns/zero and returns stable receipt',async t=>{
 const f=seed(t),a=await f.service.materialize('v',j,input);assert.deepEqual(await f.service.materialize('v',j,input),a);assert.equal(a.revision,2);
 const trip=f.sqlite.prepare('SELECT * FROM trips WHERE id=?').get(a.tripId);assert.equal(trip.distance_km,null);assert.equal(trip.odometer_start,0);assert.equal(trip.driver_id,null);assert.equal(trip.distance_source,null);assert.equal(trip.needs_review,1);assert.equal(trip.status,'provisional');assert.equal(JSON.parse(trip.distance_origin_json).journeyId,j);
 assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM journey_materializations').get().n,1);assert.equal(f.sqlite.prepare("SELECT count(*) AS n FROM audit_logs WHERE action='materialize'").get().n,1);assert.equal(f.sqlite.prepare("SELECT count(*) AS n FROM audit_logs WHERE entity_type='trip' AND action='create'").get().n,1);
 assert.equal((await createJourneyService(f.db,async()=>p,clock).get('v',j)).journey.materialized_trip_id,a.tripId);
 await assert.rejects(()=>f.service.materialize('v',j,{...input,classification:'business'}),status(409));
 const corrected=await createTripService(f.db,async()=>p,clock).edit('v',a.tripId,{expectedRevision:0,startedAt:1000,endedAt:2000,distanceKm:2,startAddress:'Known A',endAddress:'Known B',classification:'private',driverId:null,odometerStart:0,odometerEnd:2,purpose:null,reason:'Later explicit correction'});assert.equal(corrected.revision,1);assert.equal(f.sqlite.prepare('SELECT trip_id FROM journey_materializations').get().trip_id,a.tripId);assert.deepEqual(await f.service.materialize('v',j,input),a);
});
test('concurrent users and different request codes cannot materialize the same journey twice',async t=>{
 const f=seed(t);f.sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id)VALUES('other','v')");
 const other=createJourneyMaterializer(f.db,async()=>({...p,userId:'other'}),clock);
 const results=await Promise.allSettled([f.service.materialize('v',j,input),other.materialize('v',j,{...input,requestId:'materialize-other-request-01'})]);assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.filter(x=>x.status==='rejected'&&x.reason.status===409).length,1);assert.equal(f.sqlite.prepare("SELECT count(*) AS n FROM trips WHERE started_at=1000").get().n,1);
 const another=seed(t);const identical=await Promise.all([another.service.materialize('v',j,input),another.service.materialize('v',j,input)]);assert.deepEqual(...identical);
});
test('overlapping existing trip blocks conversion, including a new overlap inserted immediately before batch',async t=>{
 for(const race of [false,true]){const f=seed(t);const overlap=()=>f.sqlite.exec("INSERT INTO trips(id,vehicle_id,created_by,updated_at,started_at,ended_at,distance_km)VALUES('overlap','v','u',1,1500,1600,2)");if(race){const batch=f.db.batch;f.db.batch=async statements=>{overlap();return batch(statements);};}else overlap();await assert.rejects(()=>f.service.materialize('v',j,input),status(409));assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM journey_materializations').get().n,0);}
});
test('audit failure or revoked actor/driver at mutation time rolls back all linked state',async t=>{
 for(const mode of ['audit','actor','driver']){const f=seed(t);f.sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id)VALUES('other','v')");let proposed={...input,driverId:'other'};
 if(mode==='audit')f.sqlite.exec("CREATE TRIGGER reject_materialize BEFORE INSERT ON audit_logs WHEN NEW.action='materialize' BEGIN SELECT RAISE(ABORT,'materialization audit failure');END");else{const batch=f.db.batch;f.db.batch=async statements=>{f.sqlite.prepare('UPDATE vehicle_memberships SET active=0 WHERE user_id=?').run(mode==='actor'?'u':'other');return batch(statements);};}
 await assert.rejects(()=>f.service.materialize('v',j,proposed));assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM journey_materializations').get().n,0);assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM trips').get().n,2);assert.equal(f.sqlite.prepare('SELECT revision FROM vehicle_journeys').get().revision,1);
 }
});
test('open/stale/unconfirmed/invalid/foreign or expired conversions cannot write; revoked replay is denied',async t=>{
 const f=seed(t);for(const change of [{reviewed:false},{expectedRevision:0},{distanceKm:0.0001},{driverId:'other'},{odometerStart:10,odometerEnd:0},{startedAt:1}])await assert.rejects(()=>f.service.materialize('v',j,{...input,...change}));
 await assert.rejects(()=>createJourneyMaterializer(f.db).materialize('v',j,input),status(401));await assert.rejects(()=>f.service.materialize('other-v',j,input),status(403));await assert.rejects(()=>createJourneyMaterializer(f.db,async()=>({...p,sessionExpiresAt:1}),clock).materialize('v',j,input),status(401));
 f.sqlite.exec("DELETE FROM vehicle_journeys");f.sqlite.prepare("INSERT INTO vehicle_journeys(id,vehicle_id,created_by,started_at,status,created_at,updated_at,last_mutation_id)VALUES(?,'v','u',1000,'review_open',1,1,'seed')").run(j);await assert.rejects(()=>f.service.materialize('v',j,{...input,expectedRevision:0}),status(409));
 const other=seed(t);await other.service.materialize('v',j,input);other.sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");await assert.rejects(()=>other.service.materialize('v',j,input),status(403));
});
test('materialized journey/mapping are locked, and new classification must target the logbook trip',async t=>{
 const f=seed(t);await f.service.materialize('v',j,input);
 assert.throws(()=>f.sqlite.exec("UPDATE trips SET vehicle_id='other-v' WHERE id IN(SELECT trip_id FROM journey_materializations)"),/materialized_trip_scope_locked/);
 assert.throws(()=>f.sqlite.exec('UPDATE vehicle_journeys SET revision=revision+1'),/materialized_journey_locked/);assert.throws(()=>f.sqlite.exec("UPDATE journey_materializations SET request_json='{}'"),/materialization_immutable/);assert.throws(()=>f.sqlite.exec('DELETE FROM journey_materializations'),/materialization_immutable/);
 await assert.rejects(()=>createJourneyChoiceService(f.db,async()=>p,clock).choose('v',j,{requestId:'post-materialize-choice-01',expectedRevision:2,classification:'business',reason:'New change'}),status(409));
});
test('HTTP conversion requires actual actor, same origin, explicit review and returns no-store',async t=>{
 const f=seed(t),origin='https://materialize.example',h=createJourneyHttpHandler({db:f.db,origin,resolveSession:async()=>p,clock});
 const req=(headers={},body=input)=>new Request(origin+'/api/vehicles/v/journeys/'+j+'/materialize',{method:'POST',headers:{origin,'content-type':'application/json','x-csrf-protection':'1','x-ritkompas-viewer':'u',...headers},body:JSON.stringify(body)});
 assert.equal((await h(req({origin:'https://evil.example'}))).status,403);assert.equal((await h(req({'x-ritkompas-viewer':'other'}))).status,409);assert.equal((await h(req({}, {...input,reviewed:false}))).status,400);
 const r=await h(req());assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal((await r.json()).receipt.viewerId,'u');
});
test('overlapping closed journeys from different users have one atomic winner, not two canonical trips',async t=>{
 const f=seed(t),second='synthetic-journey-final-02';f.sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id)VALUES('other','v')");f.sqlite.prepare("INSERT INTO vehicle_journeys(id,vehicle_id,created_by,started_at,ended_at,status,revision,created_at,updated_at,last_mutation_id)VALUES(?,'v','other',1500,2500,'review_closed',1,1,1,'seed')").run(second);
 const other=createJourneyMaterializer(f.db,async()=>({...p,userId:'other'}),clock),results=await Promise.allSettled([f.service.materialize('v',j,input),other.materialize('v',second,{...input,requestId:'different-journey-request-01'})]);assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.filter(x=>x.status==='rejected'&&x.reason.status===409).length,1);assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM journey_materializations').get().n,1);assert.equal(f.sqlite.prepare("SELECT count(*) AS n FROM trips WHERE started_at>=1000").get().n,1);
});
