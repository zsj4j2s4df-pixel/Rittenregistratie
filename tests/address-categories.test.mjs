import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {readFileSync,readdirSync} from 'node:fs';
import {setup} from './helpers/trip-fixture.mjs';import {createSettingsService} from '../lib/settings-service.ts';import {createTripHttpHandler} from '../lib/trip-http.ts';
const p={userId:'u',disabled:false,sessionExpiresAt:2000000},clock=()=>1000000,status=n=>e=>e.status===n;
const locations=()=>['business','private'].flatMap(kind=>[0,1].map(n=>({id:kind+'-'+n,label:'Synthetic '+kind+' '+n,address:'Synthetic address '+kind+' '+n,enabled:true,note:'Fixture',...(kind==='private'?{kind}:{}),...(kind==='business'?{businessRole:n?'supplier':'customer'}:{})})));
const saveInput=(addresses=locations())=>({revision:0,plate:'',addresses,rates:[],reason:'Synthetic categorized settings',requestId:'category-request-0001'});
test('two business and two private locations persist with scoped IDs, audit and exact retry after lost response',async t=>{
 const f=setup(t),s=createSettingsService(f.db,async()=>p,clock),input=saveInput();const saved=await s.save('v',input);
 assert.deepEqual(await createSettingsService(f.db,async()=>p,clock).get('v'),saved);assert.deepEqual(await s.save('v',input),saved);
 assert.equal(saved.addresses.filter(a=>a.kind==='private').length,2);assert.equal(saved.addresses.filter(a=>(a.kind??'business')==='business').length,2);
 assert.equal((await s.history('v')).length,1);assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM mutation_requests').get().n,1);
 const original=f.sqlite.prepare("SELECT id,created_at FROM business_addresses ORDER BY id").all();
 const edit={...saved,reason:'Synthetic edit',requestId:'category-request-0002',addresses:saved.addresses.map(a=>({...a,label:a.label+' edit',enabled:false}))};const next=await s.save('v',edit);
 assert.deepEqual(f.sqlite.prepare('SELECT id,created_at FROM business_addresses ORDER BY id').all(),original);
 const beforeTrips=f.sqlite.prepare('SELECT * FROM trips ORDER BY id').all();await s.save('v',{...next,reason:'Synthetic delete',requestId:'category-request-0003',addresses:[]});
 assert.deepEqual(f.sqlite.prepare('SELECT * FROM trips ORDER BY id').all(),beforeTrips);assert.equal((await s.history('v')).length,3);
});
test('validation, limits, revision conflict and legacy-client private downgrade fail without writes',async t=>{
 const f=setup(t),s=createSettingsService(f.db,async()=>p,clock);
 for(const addresses of [[{...locations()[0],kind:'unknown'}],[{...locations()[2],businessRole:'customer'}],[{...locations()[0],businessRole:'fake'}],[locations()[0],locations()[0]],Array.from({length:41},(_,n)=>({...locations()[0],id:'id-'+n}))])await assert.rejects(()=>s.save('v',saveInput(addresses)),status(400));
 const saved=await s.save('v',saveInput());await assert.rejects(()=>s.save('v',{...saveInput(),requestId:'other-request-0001'}),status(409));
 const stripped={...saved,addresses:saved.addresses.map(a=>{const x={...a};delete x.kind;return x;}),reason:'Outdated client',requestId:'outdated-request-0001'};
 await assert.rejects(()=>s.save('v',stripped),status(409));assert.deepEqual(await s.get('v'),saved);
});
test('categorized settings HTTP denies foreign vehicle, changed viewer, logout and revoked membership',async t=>{
 const f=setup(t),origin='https://settings.invalid';let principal=p;const h=createTripHttpHandler({db:f.db,origin,clock,resolveSession:async()=>principal});
 const request=(vehicle='v',headers={})=>h(new Request(origin+'/api/vehicles/'+vehicle+'/settings',{method:'PATCH',headers:{origin,'content-type':'application/json','x-csrf-protection':'1','x-ritkompas-viewer':'u',...headers},body:JSON.stringify(saveInput())}));
 assert.equal((await request('other-v')).status,403);assert.equal((await request('v',{'x-ritkompas-viewer':'other'})).status,409);principal=null;assert.equal((await request()).status,401);principal=p;
 f.sqlite.exec("UPDATE vehicle_memberships SET active=0");assert.equal((await request()).status,403);assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM business_addresses').get().n,0);
});
test('category audit failure rolls back every address and preserves old snapshots',async t=>{
 const f=setup(t),s=createSettingsService(f.db,async()=>p,clock),before=await s.get('v');
 f.sqlite.exec("CREATE TRIGGER reject_category_audit BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT,'synthetic audit fail');END");
 await assert.rejects(()=>s.save('v',saveInput()),/synthetic audit fail/);assert.deepEqual(await s.get('v'),before);assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM mutation_requests').get().n,0);
});
test('additive upgrade from populated 0015 preserves every legacy field, original IDs and new constraints',t=>{
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());db.exec('PRAGMA foreign_keys=ON');
 const files=readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort();
 for(const file of files.filter(n=>Number(n.slice(0,4))<=15))db.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 db.exec("INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES('u','auth','Synthetic',1,1);INSERT INTO vehicles(id,display_name,created_at) VALUES('v','Synthetic',1);INSERT INTO business_addresses(id,vehicle_id,label,address,latitude,longitude,created_by,created_at)VALUES('legacy-id','v','Synthetic','Synthetic location',52,5,'u',1)");
 const before=db.prepare('SELECT * FROM business_addresses').get();const columns=Object.keys(before).join(',');
 db.exec(readFileSync(new URL('../drizzle/0016_address_categories.sql',import.meta.url),'utf8'));assert.deepEqual(db.prepare('SELECT '+columns+' FROM business_addresses').get(),before);const upgraded=db.prepare('SELECT kind,business_role FROM business_addresses').get();assert.equal(upgraded.kind,'business');assert.equal(upgraded.business_role,null);
 assert.throws(()=>db.exec("UPDATE business_addresses SET kind='unknown'"),/CHECK/);assert.throws(()=>db.exec("UPDATE business_addresses SET kind='private',business_role='customer'"),/CHECK/);assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
});
