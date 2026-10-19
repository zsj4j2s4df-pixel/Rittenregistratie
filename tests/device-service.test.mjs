import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createDeviceService} from '../lib/device-service.ts';
const p={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
const input={requestId:'device-request-0001',id:'app-instance-id-0001',name:'Synthetic instance',platform:'ios'};
const status=n=>e=>e.status===n;
const service=(db,principal=p)=>createDeviceService(db,async()=>principal,()=>1_000_000);
const count=(sqlite,table)=>sqlite.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
function shared(sqlite){sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('other','v'),('u','other-v')");}
test('registration derives owner, scopes list and commits a canonical receipt plus verified audit',async t=>{
 const {db,sqlite}=setup(t);const device=await service(db).register('v',{...input,name:'  Synthetic instance  '});assert.equal(device.user_id,'u');assert.equal(device.vehicle_id,'v');assert.equal(device.name,input.name);assert.equal(device.active,1);assert.equal(device.revision,0);assert.equal(device.created_at,1000);assert.equal(Object.hasOwn(device,'last_mutation_id'),false);
 assert.deepEqual(await service(db).register('v',input),device);assert.deepEqual(await service(db).list('v'),[device]);assert.equal(count(sqlite,'registered_devices'),1);assert.equal(count(sqlite,'device_register_requests'),1);
 const audit=sqlite.prepare("SELECT * FROM audit_logs WHERE entity_type='device'").get();assert.equal(audit.actor_id,'u');assert.equal(audit.action,'register');assert.equal(audit.old_value_json,null);assert.deepEqual(JSON.parse(audit.new_value_json),device);
});
test('same request concurrent registration has one device/receipt/audit; changed payload conflicts',async t=>{
 const {db,sqlite}=setup(t);const [a,b]=await Promise.all([service(db).register('v',input),service(db).register('v',input)]);assert.deepEqual(a,b);assert.equal(count(sqlite,'registered_devices'),1);assert.equal(count(sqlite,'audit_logs'),1);
 for(const patch of [{name:'Different'},{platform:'web'},{id:'app-instance-id-0002'}])await assert.rejects(()=>service(db).register('v',{...input,...patch}),status(409));assert.equal(count(sqlite,'registered_devices'),1);
});
test('concurrent same receipt with different instance claims has one winner, without an orphan',async t=>{
 const {db,sqlite}=setup(t);const results=await Promise.allSettled([service(db).register('v',input),service(db).register('v',{...input,id:'app-instance-id-0002'})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);assert.equal(count(sqlite,'registered_devices'),1);assert.equal(count(sqlite,'device_register_requests'),1);assert.equal(count(sqlite,'audit_logs'),1);
});
test('own-device scope blocks guessed foreign IDs, cross-vehicle takeover and body actor injection',async t=>{
 const {db,sqlite}=setup(t);shared(sqlite);await service(db).register('v',input);const other=service(db,{...p,userId:'other'});assert.deepEqual(await other.list('v'),[]);assert.deepEqual(await service(db).list('other-v'),[]);
 const collision={...input,requestId:'foreign-request-0001',name:'Other name'};let error;try{await other.register('v',collision);}catch(e){error=e;}assert.equal(error.status,409);assert.doesNotMatch(error.message,/Synthetic|instance-id|user_id/);
 await assert.rejects(()=>other.deactivate('v',input.id,{expectedRevision:0,reason:'Guess'}),status(404));await assert.rejects(()=>service(db).deactivate('other-v',input.id,{expectedRevision:0,reason:'Guess'}),status(404));await assert.rejects(()=>service(db).register('other-v',collision),status(409));
 await assert.rejects(()=>service(db).register('v',{...input,requestId:'spoofed-request-0001',userId:'other'}),status(400));assert.equal((await service(db).list('v'))[0].name,input.name);assert.equal(count(sqlite,'audit_logs'),1);
});
test('no/expired session, revoked or disabled account denies register, replay, list and deactivate',async t=>{
 const {db,sqlite}=setup(t);await assert.rejects(()=>createDeviceService(db).list('v'),status(401));for(const principal of [null,{...p,disabled:true},{...p,sessionExpiresAt:1_000_000}])await assert.rejects(()=>service(db,principal).register('v',input),status(401));
 await service(db).register('v',input);sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");for(const call of [()=>service(db).register('v',input),()=>service(db).list('v'),()=>service(db).deactivate('v',input.id,{expectedRevision:0,reason:'Revoke'})])await assert.rejects(call,status(403));
 sqlite.exec("UPDATE vehicle_memberships SET active=1 WHERE user_id='u';UPDATE users SET disabled=1 WHERE id='u'");await assert.rejects(()=>service(db).register('v',input),status(403));
});
test('deactivation is versioned/audited, retained and cannot be undone by an old registration retry',async t=>{
 const {db,sqlite}=setup(t);const before=await service(db).register('v',input);const after=await service(db).deactivate('v',input.id,{expectedRevision:0,reason:'  Synthetic retirement  '});assert.equal(after.active,0);assert.equal(after.revision,1);assert.equal(count(sqlite,'registered_devices'),1);assert.equal(count(sqlite,'device_register_requests'),1);assert.deepEqual(await service(db).list('v'),[after]);
 const audit=sqlite.prepare("SELECT * FROM audit_logs WHERE action='deactivate'").get();assert.deepEqual(JSON.parse(audit.old_value_json),before);assert.deepEqual(JSON.parse(audit.new_value_json),{...after,correction_reason:'Synthetic retirement'});
 await assert.rejects(()=>service(db).register('v',input),status(409));await assert.rejects(()=>service(db).register('v',{...input,requestId:'new-device-request-01'}),status(409));await assert.rejects(()=>service(db).deactivate('v',input.id,{expectedRevision:1,reason:'Again'}),status(409));assert.equal(count(sqlite,'audit_logs'),2);
});
test('concurrent deactivation has one winner, a stale revision cannot append audit',async t=>{
 const {db,sqlite}=setup(t);await service(db).register('v',input);const patch={expectedRevision:0,reason:'Retire'};const results=await Promise.allSettled([service(db).deactivate('v',input.id,patch),service(db).deactivate('v',input.id,patch)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);assert.equal(count(sqlite,'audit_logs'),2);
});
test('register audit failure rolls back device and receipt; deactivation failure restores active revision',async t=>{
 const {db,sqlite}=setup(t);sqlite.exec("CREATE TRIGGER reject_device_audit BEFORE INSERT ON audit_logs WHEN NEW.entity_type='device' BEGIN SELECT RAISE(ABORT,'device audit failure'); END");await assert.rejects(()=>service(db).register('v',input),/device audit failure/);assert.equal(count(sqlite,'registered_devices'),0);assert.equal(count(sqlite,'device_register_requests'),0);sqlite.exec('DROP TRIGGER reject_device_audit');const before=await service(db).register('v',input);
 sqlite.exec("CREATE TRIGGER reject_device_audit BEFORE INSERT ON audit_logs WHEN NEW.entity_type='device' BEGIN SELECT RAISE(ABORT,'device audit failure'); END");await assert.rejects(()=>service(db).deactivate('v',input.id,{expectedRevision:0,reason:'Retire'}),/device audit failure/);assert.deepEqual((await service(db).list('v'))[0],before);assert.equal(count(sqlite,'audit_logs'),1);
});
test('membership revoked immediately before each write batch yields no device/receipt/audit mutation',async t=>{
 for(const action of ['register','deactivate']){const {db,sqlite}=setup(t);if(action==='deactivate')await service(db).register('v',input);const baseline=count(sqlite,'audit_logs');const original=db.batch;db.batch=async statements=>{sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");return original(statements);};await assert.rejects(()=>action==='register'?service(db).register('v',input):service(db).deactivate('v',input.id,{expectedRevision:0,reason:'Revoke race'}),status(409));assert.equal(count(sqlite,'audit_logs'),baseline);assert.equal(count(sqlite,'registered_devices'),action==='register'?0:1);if(action==='deactivate')assert.equal(sqlite.prepare('SELECT active FROM registered_devices').get().active,1);}
});
test('invalid registration/deactivation/pagination fields are rejected without writes',async t=>{
 const {db,sqlite}=setup(t);for(const patch of [{requestId:'short'},{id:'bad'},{name:' '},{name:'x'.repeat(101)},{platform:'android'},{name:null}])await assert.rejects(()=>service(db).register('v',{...input,...patch}),status(400));await assert.rejects(()=>service(db).register('v',null),status(400));assert.equal(count(sqlite,'registered_devices'),0);
 await service(db).register('v',input);for(const patch of [{expectedRevision:-1,reason:'Bad'},{expectedRevision:1.5,reason:'Bad'},{expectedRevision:Number.MAX_SAFE_INTEGER,reason:'Bad'},{expectedRevision:0,reason:''},{expectedRevision:0,reason:'Bad',userId:'other'}])await assert.rejects(()=>service(db).deactivate('v',input.id,patch),status(400));
 for(const [limit,offset]of [[0,0],[101,0],[1,-1],[1,100001]])await assert.rejects(()=>service(db).list('v',limit,offset),status(400));assert.equal(count(sqlite,'audit_logs'),1);
});
test('receipt insert failure rolls back registration before audit; sessions expiring during a write do not receive success',async t=>{
 const {db,sqlite}=setup(t);sqlite.exec("CREATE TRIGGER reject_device_receipt BEFORE INSERT ON device_register_requests BEGIN SELECT RAISE(ABORT,'device receipt failure'); END");await assert.rejects(()=>service(db).register('v',input),/device receipt failure/);assert.equal(count(sqlite,'registered_devices'),0);assert.equal(count(sqlite,'audit_logs'),0);sqlite.exec('DROP TRIGGER reject_device_receipt');
 const original=db.batch;let time=1_000_000;db.batch=async statements=>{const result=await original(statements);time=2_000_000;return result;};await assert.rejects(()=>createDeviceService(db,async()=>p,()=>time).register('v',input),status(401));assert.equal(count(sqlite,'registered_devices'),1);assert.equal(count(sqlite,'device_register_requests'),1);assert.equal(count(sqlite,'audit_logs'),1);
 // A newly verified session retries the same receipt, without a second device.
 assert.equal((await service(db).register('v',input)).id,input.id);assert.equal(count(sqlite,'audit_logs'),1);
});

function seedQuota(sqlite,n,active=1){sqlite.prepare(`WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i<?) INSERT INTO registered_devices(id,user_id,vehicle_id,name,platform,active,created_at,updated_at,last_mutation_id) SELECT 'quota-device-'||printf('%06d',i),'u','v','Synthetic quota','web',?,1,1,'seed' FROM n`).run(n,active);}
test('atomic registration quota permits one last concurrent claim with exactly one receipt and audit',async t=>{
 const {DEVICE_LIMITS}=await import('../lib/device-service.ts');const {db,sqlite}=setup(t);seedQuota(sqlite,DEVICE_LIMITS.registrationsPerUserVehicle-1);
 const other={...input,id:'app-instance-id-0002',requestId:'device-request-0002'};const results=await Promise.allSettled([service(db).register('v',input),service(db).register('v',other)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===429).length,1);assert.equal(count(sqlite,'registered_devices'),DEVICE_LIMITS.registrationsPerUserVehicle);assert.equal(count(sqlite,'device_register_requests'),1);assert.equal(count(sqlite,'audit_logs'),1);
 const winner=results[0].status==='fulfilled'?input:other;assert.equal((await service(db).register('v',winner)).id,winner.id);await assert.rejects(()=>service(db).register('v',{...winner,requestId:'alternate-request-001'}),status(409));assert.equal(count(sqlite,'device_register_requests'),1);
});
test('disabled registrations retain capacity and cannot be reactivated or bypassed by receipt changes',async t=>{
 const {DEVICE_LIMITS}=await import('../lib/device-service.ts');const {db,sqlite}=setup(t);await service(db).register('v',input);await service(db).deactivate('v',input.id,{expectedRevision:0,reason:'Synthetic retirement'});seedQuota(sqlite,DEVICE_LIMITS.registrationsPerUserVehicle-1,0);
 await assert.rejects(()=>service(db).register('v',input),status(409));await assert.rejects(()=>service(db).register('v',{...input,requestId:'alternate-request-001'}),status(409));await assert.rejects(()=>service(db).register('v',{...input,id:'new-device-claim-001',requestId:'fresh-request-id-001'}),status(429));assert.equal(count(sqlite,'registered_devices'),DEVICE_LIMITS.registrationsPerUserVehicle);assert.equal(sqlite.prepare('SELECT sum(active) AS n FROM registered_devices').get().n,0);assert.equal(count(sqlite,'audit_logs'),2);
});
test('receipt cap blocks fresh device creation without orphans while exact original retries work',async t=>{
 const {DEVICE_LIMITS}=await import('../lib/device-service.ts');const {db,sqlite}=setup(t);const saved=await service(db).register('v',input);
 sqlite.prepare(`WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i<?) INSERT INTO device_register_requests(vehicle_id,user_id,request_id,device_id,request_json,response_json) SELECT 'v','u','seed-request-'||i,?,'{}','{}' FROM n`).run(DEVICE_LIMITS.receiptsPerUserVehicle-1,input.id);
 assert.deepEqual(await service(db).register('v',input),saved);await assert.rejects(()=>service(db).register('v',{...input,id:'fresh-instance-id-001',requestId:'fresh-request-id-001'}),status(429));await assert.rejects(()=>service(db).register('v',{...input,requestId:'alternate-request-001'}),status(409));assert.equal(count(sqlite,'registered_devices'),1);assert.equal(count(sqlite,'device_register_requests'),DEVICE_LIMITS.receiptsPerUserVehicle);assert.equal(count(sqlite,'audit_logs'),1);
});
