import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/trip-fixture.mjs';
import { createTripService } from '../lib/trip-service.ts';

const edit={expectedRevision:0,startedAt:100,endedAt:200,distanceKm:20,startAddress:'Test A',endAddress:'Test B',classification:'private',driverId:null,odometerStart:0,odometerEnd:20,purpose:null,reason:'Testcorrectie'};
const status=code=>e=>e.status===code;
test('no session resolver, invalid or expired sessions fail closed',async t=>{
 const {db}=setup(t);await assert.rejects(()=>createTripService(db).list('v'),status(401));
 for(const p of [null,{userId:'u',disabled:true,sessionExpiresAt:2_000_000},{userId:'u',disabled:false,sessionExpiresAt:1_000_000}])await assert.rejects(()=>createTripService(db,async()=>p,()=>1_000_000).list('v'),status(401));
});
test('vehicle-scoped reads cannot fetch another vehicle or exploit bound identifiers',async t=>{
 const {service}=setup(t);assert.equal((await service.list('v')).length,1);await assert.rejects(()=>service.list('other-v'),status(403));await assert.rejects(()=>service.get('v','other-t'),status(404));await assert.rejects(()=>service.get('v',"t' OR 1=1 --"),status(404));
 for(const [limit,offset] of [[101,0],[0,0],[10,-1],[10,100001]])await assert.rejects(()=>service.list('v',limit,offset),status(400));
});
test('disabled users and revoked memberships deny subsequent reads',async t=>{
 const {sqlite,service}=setup(t);sqlite.exec("UPDATE users SET disabled=1 WHERE id='u'");await assert.rejects(()=>service.list('v'),status(403));sqlite.exec("UPDATE users SET disabled=0 WHERE id='u'; UPDATE vehicle_memberships SET active=0");await assert.rejects(()=>service.list('v'),status(403));
});
test('edit and audit commit together with verified actor and preserved provenance',async t=>{
 const {service}=setup(t);const after=await service.edit('v','t',{...edit,actor:'spoofed',route_type:'recorded',purpose:"'; DROP TABLE trips; --"});assert.equal(after.revision,1);assert.equal(after.route_type,'estimated');assert.equal(after.distance_source,'manual');assert.equal(after.odometer_start,0);
 const history=await service.history('v','t');assert.equal(history.length,1);assert.equal(history[0].actor_id,'u');assert.equal(history[0].occurred_at,1000);assert.equal(JSON.parse(history[0].old_value_json).revision,0);assert.equal(JSON.parse(history[0].new_value_json).correction_reason,'Testcorrectie');assert.equal((await service.list('v')).length,1);
});
test('a stale write cannot overwrite state or append a second audit entry',async t=>{
 const {service}=setup(t);await service.edit('v','t',edit);await assert.rejects(()=>service.edit('v','t',edit),status(409));assert.equal((await service.get('v','t')).revision,1);assert.equal((await service.history('v','t')).length,1);
});
test('same-second concurrent edits have one winner and one corresponding audit',async t=>{
 const {service}=setup(t);const result=await Promise.allSettled([service.edit('v','t',{...edit,reason:'First'}),service.edit('v','t',{...edit,reason:'Second'})]);assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.equal(result.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);assert.equal((await service.history('v','t')).length,1);
});
test('audit failure rolls back the trip mutation',async t=>{
 const {sqlite,service}=setup(t);sqlite.exec("CREATE TRIGGER test_reject_audit BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT,'forced audit failure'); END");await assert.rejects(()=>service.edit('v','t',edit),/forced audit failure/);assert.equal((await service.get('v','t')).revision,0);assert.equal((await service.history('v','t')).length,0);
});
test('revocation between authorization and batch causes zero mutations or audit rows',async t=>{
 const {sqlite,db,service}=setup(t);const original=db.batch;db.batch=async statements=>{sqlite.exec('UPDATE vehicle_memberships SET active=0');return original(statements);};await assert.rejects(()=>service.edit('v','t',edit),status(409));assert.equal(sqlite.prepare("SELECT revision FROM trips WHERE id='t'").get().revision,0);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM audit_logs').get().n,0);
});
test('driver assignment requires active membership; bad fields leave data untouched',async t=>{
 const {service}=setup(t);for(const patch of [{driverId:'other'},{distanceKm:-1},{odometerStart:30},{odometerEnd:Infinity},{reason:' '},{startedAt:9e15},{classification:'unknown'},null])await assert.rejects(()=>service.edit('v','t',patch===null?null:{...edit,...patch}),status(400));assert.equal((await service.get('v','t')).revision,0);assert.equal((await service.history('v','t')).length,0);
});
test('database rejects revision and odometer corruption independently of the service',t=>{
 const {sqlite}=setup(t);for(const sql of ["UPDATE trips SET revision=-1","UPDATE trips SET odometer_start=-1","UPDATE trips SET odometer_start=30,odometer_end=20","UPDATE trips SET revision=1.5"])assert.throws(()=>sqlite.exec(sql),/trip_revision_odometer_violation/);
 assert.equal(sqlite.prepare("SELECT revision FROM trips WHERE id='t'").get().revision,0);
});

test('distance corrections mark manual source and retain first GPS measurement through later revisions',async t=>{
 const {sqlite,service}=setup(t);sqlite.exec("UPDATE trips SET distance_source='gps',route_type='recorded' WHERE id='t'");
 const classified=await service.edit('v','t',{...edit,classification:'business'});
 assert.equal(classified.distance_source,'gps');assert.equal(classified.distance_origin_json,null);
 const corrected=await service.edit('v','t',{...edit,expectedRevision:1,distanceKm:30});
 assert.equal(corrected.distance_source,'manual');assert.equal(corrected.route_type,'recorded');assert.deepEqual(JSON.parse(corrected.distance_origin_json),{distanceKm:20,source:'gps'});
 const again=await service.edit('v','t',{...edit,expectedRevision:2,distanceKm:40});assert.equal(again.distance_origin_json,corrected.distance_origin_json);
 const history=await service.history('v','t');assert.equal(history.length,3);assert.equal(JSON.parse(history[1].old_value_json).distance_source,'gps');assert.equal(JSON.parse(history[1].new_value_json).distance_source,'manual');
});

const creation={...edit,requestId:'synthetic-request-0001'};
test('manual creation assigns server IDs, provenance and actor, with a single audited retry receipt',async t=>{
 const {service}=setup(t);const first=await service.create('v',{...creation,id:'spoofed',created_by:'other',distance_source:'gps',route_type:'recorded'});
 assert.notEqual(first.id,'spoofed');assert.equal(first.created_by,'u');assert.equal(first.distance_source,'manual');assert.equal(first.route_type,'estimated');assert.equal(first.status,'provisional');assert.equal(first.odometer_start,0);
 assert.deepEqual(await service.create('v',creation),first);assert.equal((await service.list('v')).length,2);const history=await service.history('v',first.id);assert.equal(history.length,1);assert.equal(history[0].action,'create');assert.equal(history[0].old_value_json,null);
 await service.edit('v',first.id,{...edit,distanceKm:30});assert.deepEqual(await service.create('v',creation),first); // replay the original result, not a later edit
});
test('concurrent identical creates commit one trip/audit; conflicting retry data is rejected',async t=>{
 const {service}=setup(t);const [a,b]=await Promise.all([service.create('v',creation),service.create('v',creation)]);assert.deepEqual(a,b);assert.equal((await service.list('v')).length,2);assert.equal((await service.history('v',a.id)).length,1);await assert.rejects(()=>service.create('v',{...creation,distanceKm:40}),status(409));
});
test('creation audit failure rolls back trip and receipt, permitting a clean retry',async t=>{
 const {sqlite,service}=setup(t);sqlite.exec("CREATE TRIGGER test_reject_create_audit BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT,'create audit failure'); END");await assert.rejects(()=>service.create('v',creation),/create audit failure/);assert.equal((await service.list('v')).length,1);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM trip_create_requests').get().n,0);sqlite.exec('DROP TRIGGER test_reject_create_audit');assert.ok((await service.create('v',creation)).id);
});
test('creation validates fields, driver and scoped request ID; revoked access writes nothing',async t=>{
 const {sqlite,db,service}=setup(t);for(const patch of [{requestId:'short'},{requestId:"abcdefghijklmnop';"},{driverId:'other'},{distanceKm:0}])await assert.rejects(()=>service.create('v',{...creation,...patch}),status(400));
 const original=db.batch;db.batch=async statements=>{sqlite.exec('UPDATE vehicle_memberships SET active=0');return original(statements);};await assert.rejects(()=>service.create('v',creation),status(409));assert.equal(sqlite.prepare('SELECT count(*) AS n FROM trips').get().n,2);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM audit_logs').get().n,0);
});
