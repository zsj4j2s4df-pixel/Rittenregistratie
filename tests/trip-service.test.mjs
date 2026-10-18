import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createTripService } from '../lib/trip-service.ts';

// SQLite adapter exercises real SQL and atomic rollback. It is not a deployed D1 test.
function setup(t, resolver = async () => ({userId:'u',disabled:false,sessionExpiresAt:2_000_000})) {
 const sqlite=new DatabaseSync(':memory:');t.after(()=>sqlite.close());sqlite.exec('PRAGMA foreign_keys=ON');
 for(const name of ['0000_medical_maestro','0001_guard_trip_integrity','0002_server_trip_core','0003_guard_trip_revisions','0004_distance_provenance'])sqlite.exec(readFileSync(new URL(`../drizzle/${name}.sql`,import.meta.url),'utf8'));
 sqlite.exec("INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES ('u','test-u','Test U',1,1),('other','test-o','Test O',2,1)");
 sqlite.exec("INSERT INTO vehicles(id,display_name,created_at) VALUES ('v','Test V',1),('other-v','Other V',1)");
 sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('u','v')");
 sqlite.exec("INSERT INTO trips(id,vehicle_id,created_by,updated_at,started_at,ended_at,distance_km,route_type,distance_source) VALUES ('t','v','u',1,100,200,20,'estimated','manual'),('other-t','other-v','other',1,100,200,20,'estimated','manual')");
 class Statement {
  constructor(sql,params=[]){this.sql=sql;this.params=params;}
  bind(...params){return new Statement(this.sql,params);}
  async first(){return sqlite.prepare(this.sql).get(...this.params)??null;}
  async all(){return {results:sqlite.prepare(this.sql).all(...this.params)};}
  runSync(){const r=sqlite.prepare(this.sql).run(...this.params);return {meta:{changes:Number(r.changes)}};}
 }
 const db={prepare:sql=>new Statement(sql),batch:async stmts=>{sqlite.exec('BEGIN IMMEDIATE');try{const r=stmts.map(s=>s.runSync());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 return {sqlite,db,service:createTripService(db,resolver,()=>1_000_000)};
}
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
