// Local workerd/D1 binding smoke; no Cloudflare account, remote DB or deployment.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createTripHttpHandler } from '../lib/trip-http.ts';
import { createTripService } from '../lib/trip-service.ts';
const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const { Miniflare } = await import(wranglerRequire.resolve('miniflare'));
const mf = new Miniflare({ modules: true, script: "export default {fetch(){return new Response('local test')}}", compatibilityDate: '2026-05-15', d1Databases: ['DB'] });
try {
 const db = await mf.getD1Database('DB');
 for (const name of readdirSync(new URL('../drizzle/', import.meta.url)).filter(n=>n.endsWith('.sql')).sort()) {
  for (const sql of readFileSync(new URL(`../drizzle/${name}`, import.meta.url),'utf8').split('--> statement-breakpoint').filter(s=>s.trim())) await db.prepare(sql).run();
 }
 await db.prepare("INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES ('u','synthetic','Test',1,1)").run();
 await db.prepare("INSERT INTO vehicles(id,display_name,created_at) VALUES ('v','Synthetic',1)").run();
 await db.prepare("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('u','v')").run();
 await db.prepare("INSERT INTO trips(id,vehicle_id,created_by,updated_at,started_at,ended_at,distance_km,route_type,distance_source) VALUES ('t','v','u',1,100,200,20,'recorded','gps')").run();
 const service=createTripService(db,async()=>({userId:'u',disabled:false,sessionExpiresAt:2_000_000}),()=>1_000_000);
 await assert.rejects(()=>createTripService(db).list('v'),e=>e.status===401);
 const edit={expectedRevision:0,startedAt:100,endedAt:200,distanceKm:30,startAddress:'Synthetic A',endAddress:'Synthetic B',classification:'private',driverId:null,odometerStart:0,odometerEnd:30,purpose:null,reason:'Local D1 smoke'};
 const result=await service.edit('v','t',edit);assert.equal(result.revision,1);assert.equal(result.distance_source,'manual');assert.equal((await service.history('v','t')).length,1);
 await assert.rejects(()=>service.edit('v','t',edit),e=>e.status===409);
 await db.prepare("CREATE TRIGGER test_reject_audit BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT,'forced audit failure'); END").run();
 await assert.rejects(()=>service.edit('v','t',{...edit,expectedRevision:1,distanceKm:40}),/forced audit failure/);
 assert.equal((await service.get('v','t')).revision,1);assert.equal((await service.get('v','t')).distance_km,30);assert.equal((await service.history('v','t')).length,1);
 await db.prepare('DROP TRIGGER test_reject_audit').run();
 const creation={...edit,requestId:'local-d1-create-0001'};
 const [created,retried]=await Promise.all([service.create('v',creation),service.create('v',creation)]);
 assert.deepEqual(created,retried);assert.equal((await service.history('v',created.id)).length,1);assert.equal((await service.list('v')).length,2);
 await assert.rejects(()=>service.create('v',{...creation,distanceKm:31}),e=>e.status===409);
 await db.prepare("CREATE TRIGGER test_reject_create BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT,'forced create failure'); END").run();
 await assert.rejects(()=>service.create('v',{...creation,requestId:'local-d1-create-0002'}),/forced create failure/);
 assert.equal((await service.list('v')).length,2);assert.equal((await db.prepare('SELECT count(*) AS n FROM trip_create_requests').first()).n,1);
 await db.prepare('DROP TRIGGER test_reject_create').run();
 const origin='https://ritkompas.example';
 const handle=createTripHttpHandler({db,origin,resolveSession:async()=>({userId:'u',disabled:false,sessionExpiresAt:2_000_000}),clock:()=>1_000_000});
 assert.equal((await handle(new Request(origin+'/api/vehicles/v/trips'))).status,200);
 const patch={...edit,expectedRevision:1,distanceKm:35};
 assert.equal((await handle(new Request(origin+'/api/vehicles/v/trips/t',{method:'PATCH',headers:{origin,'x-csrf-protection':'1','content-type':'application/json'},body:JSON.stringify(patch)}))).status,200);
 assert.equal((await service.get('v','t')).distance_km,35);
 await db.prepare('UPDATE vehicle_memberships SET active=0').run();
 assert.equal((await handle(new Request(origin+'/api/vehicles/v/trips'))).status,403);
 await assert.rejects(()=>service.list('v'),e=>e.status===403);
 console.log('PASS local workerd/D1: migrations, fail-closed session, edit+audit, provenance, stale conflict, atomic rollback, concurrent idempotent creation, creation rollback, HTTP read/write, revocation. NOT production D1/auth.');
} finally { await mf.dispose(); }
