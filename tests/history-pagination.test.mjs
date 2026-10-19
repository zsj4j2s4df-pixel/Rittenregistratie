import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createTripHttpHandler} from '../lib/trip-http.ts';
import {createBackendClient} from '../app/backend-client.ts';
import {createTripService} from '../lib/trip-service.ts';
import {createSettingsService} from '../lib/settings-service.ts';
const principal={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
const origin='https://history.example.invalid';
function fixture(t){const f=setup(t);const handle=createTripHttpHandler({db:f.db,origin,resolveSession:async()=>principal,clock:()=>1_000_000});const client=createBackendClient((path,init)=>handle(new Request(origin+path,init)));return {...f,handle,client};}
function log(sqlite,type,entity,reason){return Number(sqlite.prepare("INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) VALUES ('u',?,?,'update','{}',?,1000)").run(type,entity,JSON.stringify({correction_reason:reason})).lastInsertRowid);}
function seed(sqlite){const ids={trip:[],settings:[]};for(let n=0;n<127;n++){ids.trip.push(log(sqlite,'trip','t','Trip '+n));ids.settings.push(log(sqlite,'vehicle_settings','v','Settings '+n));log(sqlite,'trip','other-t','Other trip');log(sqlite,'vehicle_settings','other-v','Other vehicle');}return ids;}
const status=n=>e=>e.status===n;
test('trip and settings keyset pages include every older row once despite a new audit between pages',async t=>{
 const {sqlite,client}=fixture(t),ids=seed(sqlite);
 for(const kind of ['trip','settings']){
  const load=before=>kind==='trip'?client.history('v','t',before):client.settingsHistory('v',before);
  const first=await load();assert.equal(first.length,kind==='trip'?100:50);assert.deepEqual(first.map(x=>x.id),ids[kind].slice().reverse().slice(0,first.length));
  const newest=log(sqlite,kind==='trip'?'trip':'vehicle_settings',kind==='trip'?'t':'v','Inserted while paging');
  const all=[...first];let page=first;
  while(page.length){page=await load(all.at(-1).id);all.push(...page);}
  assert.deepEqual(all.map(x=>x.id),ids[kind].slice().reverse());assert.equal(new Set(all.map(x=>x.id)).size,127);assert.ok(!all.some(x=>x.id===newest));
  assert.equal((await load())[0].id,newest); // Refresh resets the cursor and includes the new audit.
 }
});
test('service history arrays keep default limit50, enforce cursor/limit and scope even with cursors',async t=>{
 const {db,sqlite}=fixture(t);seed(sqlite);const trips=createTripService(db,async()=>principal,()=>1_000_000),settings=createSettingsService(db,async()=>principal,()=>1_000_000);
 assert.equal((await trips.history('v','t')).length,50);assert.equal((await settings.history('v')).length,50);
 for(const before of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,'123',null]){
  await assert.rejects(()=>trips.history('v','t',50,before),status(400));await assert.rejects(()=>settings.history('v',50,before),status(400));
 }
 for(const limit of [0,101,1.5]){await assert.rejects(()=>trips.history('v','t',limit,1),status(400));await assert.rejects(()=>settings.history('v',limit,1),status(400));}
 assert.deepEqual(await trips.history('v','t',50,1),[]);assert.deepEqual(await settings.history('v',50,1),[]);
 await assert.rejects(()=>trips.history('v','other-t',50,99999),status(404));await assert.rejects(()=>settings.history('other-v',50,99999),status(403));
});
test('HTTP history query rejects invalid/repeated/unknown cursor parameters and offset, while accepting bounded pages',async t=>{
 const {handle,sqlite}=fixture(t);seed(sqlite);
 const get=path=>handle(new Request(origin+path));
 for(const base of ['/api/vehicles/v/trips/t/history','/api/vehicles/v/settings/history']){
  for(const query of ['before=0','before=-1','before=1.5','before=1e2','before=','before=Infinity','before=9007199254740992','before=1&before=2','before=1&offset=0','limit=0','limit=101','limit=1&limit=2','actor=u'])assert.equal((await get(base+'?'+query)).status,400,base+'?'+query);
  const response=await get(base+'?limit=7&before=9007199254740991');assert.equal(response.status,200);assert.equal((await response.json()).history.length,7);
 }
 for(const base of ['/api/vehicles/v/settings','/api/vehicles/v/trips/t','/api/vehicles/v/trips'])assert.equal((await get(base+'?before=1')).status,400);
});
test('revoked membership or disabled user denies the next page through the real HTTP/client path',async t=>{
 const {sqlite,client}=fixture(t);seed(sqlite);const tripPage=await client.history('v','t'),settingsPage=await client.settingsHistory('v');
 sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");await assert.rejects(()=>client.history('v','t',tripPage.at(-1).id),status(403));await assert.rejects(()=>client.settingsHistory('v',settingsPage.at(-1).id),status(403));
 sqlite.exec("UPDATE vehicle_memberships SET active=1 WHERE user_id='u';UPDATE users SET disabled=1 WHERE id='u'");await assert.rejects(()=>client.history('v','t',tripPage.at(-1).id),status(403));await assert.rejects(()=>client.settingsHistory('v',settingsPage.at(-1).id),status(403));
});
