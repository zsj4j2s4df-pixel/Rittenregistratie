import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createRouteService} from '../lib/route-service.ts';
const principal={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
const service=db=>createRouteService(db,async()=>principal,()=>1_000_000);
const status=n=>e=>e.status===n;
function point(sqlite,trip='t',source='gps'){return Number(sqlite.prepare('INSERT INTO route_points(trip_id,recorded_at,latitude,longitude,accuracy_meters,source) VALUES (?,123,52,5,NULL,?)').run(trip,source).lastInsertRowid);}
test('route pages whitelist fields and capture a trip-only highwater, not other vehicle points',async t=>{
 const {db,sqlite}=setup(t);const a=point(sqlite),b=point(sqlite,'t','interpolated');point(sqlite,'other-t');
 const page=await service(db).points('v','t');assert.deepEqual(page,{points:[{id:a,recorded_at:123,latitude:52,longitude:5,accuracy_meters:null,source:'gps'},{id:b,recorded_at:123,latitude:52,longitude:5,accuracy_meters:null,source:'interpolated'}],through:b,nextAfter:null});
 assert.deepEqual(Object.keys(page.points[0]).sort(),['accuracy_meters','id','latitude','longitude','recorded_at','source']);
 const selected=await service(db).points('v','t',1,a,b);assert.deepEqual(selected.points.map(p=>p.id),[b]);assert.equal(selected.nextAfter,null);
});
test('more than500 observations page once each; inserts between pages stay beyond the original through',async t=>{
 const {db,sqlite}=setup(t);const expected=[];for(let i=0;i<1203;i++){expected.push(point(sqlite));if(i%10===0)point(sqlite,'other-t');}
 const route=service(db),first=await route.points('v','t',500);assert.equal(first.points.length,500);assert.equal(first.through,expected.at(-1));assert.equal(first.nextAfter,first.points.at(-1).id);
 const later=point(sqlite),all=[...first.points];let cursor=first.nextAfter;
 while(cursor!==null){const next=await route.points('v','t',500,cursor,first.through);assert.equal(next.through,first.through);all.push(...next.points);cursor=next.nextAfter;}
 assert.deepEqual(all.map(p=>p.id),expected);assert.equal(new Set(all.map(p=>p.id)).size,1203);assert.ok(!all.some(p=>p.id===later));
 const refreshed=await route.points('v','t',500);assert.equal(refreshed.through,later);
 assert.deepEqual((await route.points('v','t',500,first.through,first.through)).points,[]);
});
test('empty route is distinct from a missing or out-of-scope trip, with zero highwater',async t=>{
 const {db,sqlite}=setup(t);point(sqlite,'other-t');assert.deepEqual(await service(db).points('v','t'),{points:[],through:0,nextAfter:null});
 await assert.rejects(()=>service(db).points('v','missing'),status(404));await assert.rejects(()=>service(db).points('v','other-t'),status(404));await assert.rejects(()=>service(db).points('other-v','other-t'),status(403));await assert.rejects(()=>service(db).points('v',"t' OR 1=1 --"),status(404));
});
test('no session, disabled accounts and revoked membership deny routes and follow-up pages',async t=>{
 const {db,sqlite}=setup(t);const id=point(sqlite);point(sqlite);await assert.rejects(()=>createRouteService(db).points('v','t'),status(401));
 for(const p of [null,{...principal,disabled:true},{...principal,sessionExpiresAt:1_000_000}])await assert.rejects(()=>createRouteService(db,async()=>p,()=>1_000_000).points('v','t'),status(401));
 const first=await service(db).points('v','t',1);assert.equal(first.nextAfter,id);sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");await assert.rejects(()=>service(db).points('v','t',1,id,first.through),status(403));
 sqlite.exec("UPDATE vehicle_memberships SET active=1 WHERE user_id='u';UPDATE users SET disabled=1 WHERE id='u'");await assert.rejects(()=>service(db).points('v','t',1,id,first.through),status(403));
});
test('invalid cursors, trip IDs and page sizes fail rather than silently coercing or truncating',async t=>{
 const {db}=setup(t);const route=service(db);
 for(const limit of [0,501,-1,1.5,NaN,Infinity,'1'])await assert.rejects(()=>route.points('v','t',limit),status(400));
 for(const cursor of [-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,'0',null]){await assert.rejects(()=>route.points('v','t',1,cursor),status(400));await assert.rejects(()=>route.points('v','t',1,0,cursor),status(400));}
 await assert.rejects(()=>route.points('v','t',1,2,1),status(400));for(const id of ['',null,'x'.repeat(129)])await assert.rejects(()=>route.points('v',id),status(400));
 assert.deepEqual(await route.points('v','t',1,0,0),{points:[],through:0,nextAfter:null});
});
test('both batch reads recheck membership/trip binding after preliminary authorization',async t=>{
 const {db,sqlite}=setup(t);point(sqlite);const original=db.batch;let queryCount=0;db.batch=async statements=>{queryCount=statements.length;sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");const results=await original(statements);assert.deepEqual(results.map(r=>r.results),[[],[]]);return results;};
 await assert.rejects(()=>service(db).points('v','t'),status(404));assert.equal(queryCount,2);
});
test('highwater and first page share one read batch; expiry after the batch fails closed',async t=>{
 const {db,sqlite}=setup(t);point(sqlite);const original=db.batch;let time=1_000_000,batches=0;db.batch=async statements=>{batches++;const id=point(sqlite);const result=await original(statements);assert.equal(result[0].results[0].highwater,id);assert.equal(result[1].results.at(-1).id,id);time=2_000_000;return result;};
 await assert.rejects(()=>createRouteService(db,async()=>principal,()=>time).points('v','t'),status(401));assert.equal(batches,1);
});
