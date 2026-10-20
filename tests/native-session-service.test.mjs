import test from 'node:test';import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';import {createNativeSessionService} from '../lib/native-session-service.ts';import {createTripHttpHandler} from '../lib/trip-http.ts';
const p={userId:'u',disabled:false,sessionExpiresAt:2000000},clock=()=>1000000,status=n=>e=>e.status===n;
test('native scope returns only actual principal, vehicle and millisecond expiry without data writes',async t=>{
 const f=setup(t),before=f.sqlite.prepare('SELECT total_changes() AS n').get().n;
 assert.deepEqual(await createNativeSessionService(f.db,async()=>p,clock).scope('v'),{version:1,viewerId:'u',vehicleId:'v',expiresAt:2000000});
 assert.equal(f.sqlite.prepare('SELECT total_changes() AS n').get().n,before);
 for(const vehicle of ['other-v','missing'])await assert.rejects(()=>createNativeSessionService(f.db,async()=>p,clock).scope(vehicle),status(403));
});
test('native scope denies missing/expired/disabled sessions, revoked roles and expiry during database read',async t=>{
 for(const principal of [null,{...p,disabled:true},{...p,sessionExpiresAt:1000000},{...p,sessionExpiresAt:NaN},{...p,sessionExpiresAt:2000000.5}]){const f=setup(t);await assert.rejects(()=>createNativeSessionService(f.db,async()=>principal,clock).scope('v'),status(401));}
 for(const sql of ["UPDATE vehicle_memberships SET active=0","UPDATE users SET disabled=1 WHERE id='u'","UPDATE vehicle_memberships SET role='reader'","UPDATE users SET role='reader' WHERE id='u'"]){const f=setup(t);f.sqlite.exec(sql);await assert.rejects(()=>createNativeSessionService(f.db,async()=>p,clock).scope('v'),status(403));}
 const f=setup(t);let n=0;await assert.rejects(()=>createNativeSessionService(f.db,async()=>p,()=>++n===1?1000000:3000000).scope('v'),status(401));
});
test('native scope HTTP is GET-only no-store, authenticates each request and rejects fake viewer/query/path',async t=>{
 const f=setup(t),origin='https://native.example.invalid';let principal=p;
 const h=createTripHttpHandler({db:f.db,origin,resolveSession:async()=>principal,clock});const req=(path='/api/vehicles/v/session',method='GET',headers={})=>h(new Request(origin+path,{method,headers}));
 const r=await req();assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.deepEqual(await r.json(),{session:{version:1,viewerId:'u',vehicleId:'v',expiresAt:2000000}});
 for(const method of ['POST','PATCH','DELETE'])assert.equal((await req(undefined,method)).status,405);
 assert.equal((await req('/api/vehicles/v/session?viewerId=other')).status,400);assert.equal((await req(undefined,'GET',{'x-ritkompas-viewer':'other'})).status,409);
 assert.equal((await req('/api/vehicles/v%2Fother/session')).status,400);principal=null;assert.equal((await req()).status,401);
});
test('native scope rechecks database membership at the scoped read after session resolution',async t=>{
 const f=setup(t),resolver=async()=>{f.sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");return p;};
 await assert.rejects(()=>createNativeSessionService(f.db,resolver,clock).scope('v'),status(403));
});
