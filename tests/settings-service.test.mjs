import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/trip-fixture.mjs';
import { createSettingsService } from '../lib/settings-service.ts';
const principal={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
const service=db=>createSettingsService(db,async()=>principal,()=>1_000_000);
const patch={revision:0,plate:'ab-12-cd',reason:'Synthetic settings',addresses:[{id:'home',label:'Test',address:'Synthetic A',enabled:true,note:'Not a real address'}],rates:[{id:'rate-1',microsPerKm:230000,validFrom:'2026-01-01',validUntil:'2026-12-31'}]};
const status=n=>e=>e.status===n;
test('settings persist across service instances; coherent get and audited zero-rate values',async t=>{
 const {db}=setup(t);const a=await service(db).save('v',patch);assert.equal(a.plate,'AB-12-CD');assert.deepEqual(await service(db).get('v'),a);assert.equal(a.rates[0].microsPerKm,230000);const h=await service(db).history('v');assert.equal(h.length,1);assert.equal(h[0].actor_id,'u');assert.equal(JSON.parse(h[0].old_value_json).revision,0);
 const zero=await service(db).save('v',{...a,rates:[{id:'zero',validFrom:'2027-01-01',microsPerKm:0}],reason:'New rate'});assert.deepEqual(await service(db).get('v'),zero);
});
test('settings require verified identity and active object scope; legacy unassigned rows remain untouched',async t=>{
 const {db,sqlite}=setup(t);await assert.rejects(()=>createSettingsService(db).get('v'),status(401));await assert.rejects(()=>service(db).get('other-v'),status(403));
 sqlite.exec("INSERT INTO business_addresses(id,label,address,created_by,created_at) VALUES ('legacy','Legacy','Unassigned','u',1); INSERT INTO mileage_rates(id,amount_per_km,valid_from,created_by) VALUES ('legacy-rate',0.25,1,'u')");
 assert.equal((await service(db).get('v')).addresses.length,0);await service(db).save('v',patch);assert.equal(sqlite.prepare("SELECT vehicle_id FROM business_addresses WHERE id='legacy'").get().vehicle_id,null);assert.equal(sqlite.prepare("SELECT amount_per_km FROM mileage_rates WHERE id='legacy-rate'").get().amount_per_km,0.25);
 sqlite.exec('UPDATE vehicle_memberships SET active=0');await assert.rejects(()=>service(db).get('v'),status(403));
});
test('validation rejects overlap/duplicate IDs/bad fields and old writes cannot replace newer settings',async t=>{
 const {db}=setup(t);for(const value of [{...patch,plate:'<bad>'},{...patch,addresses:[...patch.addresses,...patch.addresses]},{...patch,addresses:[{...patch.addresses[0],enabled:1}]},{...patch,rates:[...patch.rates,{id:'overlap',microsPerKm:1,validFrom:'2026-12-31'}]},{...patch,rates:[{id:'bad',microsPerKm:0.5,validFrom:'2026-01-01'}]},{...patch,reason:''}])await assert.rejects(()=>service(db).save('v',value),status(400));
 await service(db).save('v',patch);await assert.rejects(()=>service(db).save('v',patch),status(409));assert.equal((await service(db).history('v')).length,1);
});
test('same-second concurrent settings saves have one winner and corresponding snapshot audit',async t=>{
 const {db}=setup(t);const result=await Promise.allSettled([service(db).save('v',patch),service(db).save('v',{...patch,plate:'XY-12-ZZ'})]);assert.equal(result.filter(x=>x.status==='fulfilled').length,1);assert.equal(result.filter(x=>x.status==='rejected'&&x.reason.status===409).length,1);assert.equal((await service(db).history('v')).length,1);
});
test('settings audit failure rolls back plate, addresses and tariffs together',async t=>{
 const {db,sqlite}=setup(t);const before=await service(db).get('v');sqlite.exec("CREATE TRIGGER reject_settings BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT,'settings audit fail'); END");await assert.rejects(()=>service(db).save('v',patch),/settings audit fail/);assert.deepEqual(await service(db).get('v'),before);
});
test('revocation before batch writes nothing; same external IDs are safely vehicle scoped',async t=>{
 const {db,sqlite}=setup(t);sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('u','other-v')");await service(db).save('v',patch);await service(db).save('other-v',{...patch,plate:'XY-12-ZZ'});assert.equal((await service(db).get('other-v')).addresses[0].id,'home');
 const original=db.batch;db.batch=async statements=>{sqlite.exec('UPDATE vehicle_memberships SET active=0');return original(statements);};await assert.rejects(()=>service(db).save('v',{...patch,revision:1,plate:'ZZ-12-XX'}),status(409));assert.equal(sqlite.prepare("SELECT settings_revision FROM vehicles WHERE id='v'").get().settings_revision,1);
});
test('metadata survives unchanged addresses/rates; changed addresses clear stale coordinates; explicit removal audited',async t=>{
 const {db,sqlite}=setup(t);const a=await service(db).save('v',patch);sqlite.exec("UPDATE business_addresses SET latitude=52,longitude=5,radius_meters=200; UPDATE mileage_rates SET source_url='https://example.com/synthetic'");
 const b=await service(db).save('v',{...a,reason:'Note',addresses:[{...a.addresses[0],note:'Updated'}]});assert.equal(sqlite.prepare('SELECT latitude FROM business_addresses').get().latitude,52);assert.equal(sqlite.prepare('SELECT source_url FROM mileage_rates').get().source_url,'https://example.com/synthetic');
 const c=await service(db).save('v',{...b,reason:'Move',addresses:[{...b.addresses[0],address:'Synthetic B'}]});assert.equal(sqlite.prepare('SELECT latitude FROM business_addresses').get().latitude,null);
 await service(db).save('v',{...c,addresses:[],rates:[],reason:'Remove'});assert.equal(sqlite.prepare('SELECT count(*) AS n FROM business_addresses').get().n,0);assert.equal((await service(db).history('v')).length,4);
});

test('assigned legacy IDs preserve coordinates, radius, provenance and creator on unrelated settings edits',async t=>{
 const {db,sqlite}=setup(t);sqlite.exec("INSERT INTO business_addresses(id,vehicle_id,label,address,latitude,longitude,radius_meters,created_by,created_at) VALUES ('legacy','v','Old','Synthetic',52,5,200,'other',1); INSERT INTO mileage_rates(id,vehicle_id,amount_per_km,amount_micros,valid_from,source_url,created_by) VALUES ('legacy-rate','v',0.25,250000,1767225600,'https://example.com/source','other')");
 const settings=await service(db).get('v');await service(db).save('v',{...settings,plate:'AA-11-BB',reason:'Plate only'});
 const a=sqlite.prepare("SELECT * FROM business_addresses WHERE id='legacy'").get();assert.equal(a.latitude,52);assert.equal(a.radius_meters,200);assert.equal(a.created_by,'other');assert.equal(a.created_at,1);const rate=sqlite.prepare("SELECT * FROM mileage_rates WHERE id='legacy-rate'").get();assert.equal(rate.source_url,'https://example.com/source');assert.equal(rate.created_by,'other');
});
test('collisions with unassigned/other-vehicle physical IDs roll back the complete settings batch',async t=>{
 for(const kind of ['address','rate']){
 const {db,sqlite}=setup(t);if(kind==='address')sqlite.exec("INSERT INTO business_addresses(id,label,address,created_by,created_at) VALUES ('1:v:home','Legacy','Untouched','u',1)");else sqlite.exec("INSERT INTO mileage_rates(id,vehicle_id,amount_per_km,valid_from,created_by) VALUES ('1:v:rate-1','other-v',0.25,1,'u')");
 await assert.rejects(()=>service(db).save('v',patch),/NOT NULL/);const result=await service(db).get('v');assert.equal(result.revision,0);assert.equal(result.plate,'');assert.equal(result.addresses.length,0);assert.equal((await service(db).history('v')).length,0);
 }
});

test('settings batch remains below Free invocation query budget; over-limit input is rejected',async t=>{
 const {db}=setup(t);const addresses=Array.from({length:41},(_,i)=>({...patch.addresses[0],id:'a'+i}));await assert.rejects(()=>service(db).save('v',{...patch,addresses,rates:[]}),status(400));assert.equal((await service(db).get('v')).revision,0);
});

test('assigned legacy rate timestamps are not silently truncated to calendar dates',async t=>{
 const {db,sqlite}=setup(t);sqlite.exec("INSERT INTO mileage_rates(id,vehicle_id,amount_per_km,amount_micros,valid_from,created_by) VALUES ('nonmidnight','v',0.25,250000,1767225601,'u')");await assert.rejects(()=>service(db).get('v'),status(409));await assert.rejects(()=>service(db).save('v',patch),status(409));assert.equal(sqlite.prepare("SELECT valid_from FROM mileage_rates WHERE id='nonmidnight'").get().valid_from,1767225601);assert.equal(sqlite.prepare("SELECT settings_revision FROM vehicles WHERE id='v'").get().settings_revision,0);
});
