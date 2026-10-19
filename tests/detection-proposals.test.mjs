import test from 'node:test';import assert from 'node:assert/strict';import {buildDetectionProposals} from '../lib/detection-proposals.ts';
const row=(id,kind,time,patch={})=>({id,vehicle_id:'v',user_id:'u',device_id:'device-000000001',event_id:id,observed_at:time,received_at:time===null?1000:time+1,source:'manual',event_kind:kind,uncertainty:'unverified_app_observation',payload_json:JSON.stringify({observedAt:time,source:'manual',kind}),...patch});
const build=(observations,existingTrips=[],maxGapSeconds=60)=>buildDetectionProposals({observations,existingTrips,policy:{maxGapSeconds}});
test('explicit boundaries make review-only proposals and preserve a two-minute genuinely ended stop',()=>{
 const out=build([row('a','start_candidate',100),row('b','end_candidate',200),row('c','start_candidate',320),row('d','end_candidate',400)]);
 assert.deepEqual(out.proposals.map(p=>[p.startedAt,p.endedAt]),[[100,200],[320,400]]);assert.equal(out.inputCompleteness,'not_established');for(const p of out.proposals){assert.equal(p.driverId,null);assert.equal(p.distanceKm,null);assert.equal(p.classification,'review');assert.equal(p.status,'needs_review');assert.ok(p.warnings.includes('unverified_observations'));}
});
test('connection loss, stop duration and EV-compatible zero RPM do not invent boundaries or distance',()=>{
 const out=build([row('a','connection',100),row('b','disconnection',220)]);assert.ok(out.proposals.every(p=>p.startedAt===null&&p.endedAt===null&&p.distanceKm===null));assert.ok(out.proposals[0].warnings.includes('connection_signal_only'));
 const driving=build([row('a','start_candidate',100),row('b','connection',150),row('c','disconnection',270),row('d','end_candidate',400)]);assert.equal(driving.proposals.length,1);assert.deepEqual([driving.proposals[0].startedAt,driving.proposals[0].endedAt],[100,400]);assert.ok(driving.proposals[0].warnings.includes('observation_gap'));
});
test('input order and exact duplicates do not change deterministic proposals; conflicts fail whole input',()=>{
 const a=row('a','start_candidate',100),b=row('b','end_candidate',200);assert.deepEqual(build([a,b]).proposals,build([b,a]).proposals);const out=build([a,{...a,id:'a-copy'},b]);assert.equal(out.duplicateCount,1);assert.equal(out.proposals.length,1);assert.deepEqual(out.proposals[0].observationIds,['a','a-copy','b']);assert.throws(()=>build([a,{...a,payload_json:JSON.stringify({observedAt:100,source:'manual',kind:'start_candidate',detail:'changed'})}]),e=>e.code==='conflicting_event');
});
test('never pairs across devices/users; cross-device overlapping evidence remains visible for central review',()=>{
 const a=row('a','start_candidate',100),b=row('b','end_candidate',200);assert.ok(build([a,{...b,device_id:'other-device-001'}]).proposals.every(p=>p.startedAt===null||p.endedAt===null));const out=build([a,b,row('c','start_candidate',110,{user_id:'other',device_id:'other-device-001'}),row('d','end_candidate',210,{user_id:'other',device_id:'other-device-001'})]);assert.equal(out.proposals.length,2);assert.ok(out.proposals.every(p=>p.warnings.includes('overlap_proposal')));
});
test('missing time/start/end, repeated start and out-of-order arrival remain explicit',()=>{
 const missing=build([row('none','start_candidate',null),row('end','end_candidate',200)]);assert.ok(missing.proposals.some(p=>p.warnings.includes('missing_observation_time')));assert.ok(missing.proposals.every(p=>p.warnings.includes('overlap_not_assessable')));const repeated=build([row('a','start_candidate',100),row('b','start_candidate',150),row('c','end_candidate',200)]);assert.equal(repeated.proposals.length,2);assert.ok(repeated.proposals[0].warnings.includes('repeated_start'));const out=build([row('a','start_candidate',100,{received_at:300}),row('b','end_candidate',200,{received_at:250})]);assert.ok(out.proposals[0].warnings.includes('out_of_order_arrival'));
});
test('existing same-vehicle overlaps are flagged, touching endpoints and other vehicles are excluded',()=>{
 const out=build([row('a','start_candidate',100),row('b','end_candidate',200)],[{id:'overlap',vehicle_id:'v',started_at:150,ended_at:250},{id:'touching',vehicle_id:'v',started_at:200,ended_at:300},{id:'foreign',vehicle_id:'foreign',started_at:100,ended_at:200}]);assert.deepEqual(out.proposals[0].overlappingTripIds,['overlap']);assert.ok(out.proposals[0].warnings.includes('overlap_existing_trip'));
});
test('invalid or over-limit evidence refuses processing rather than returning partial approval',()=>{
 assert.throws(()=>build([],[],0));assert.throws(()=>build(Array.from({length:1001},(_,i)=>row(String(i),'connection',i))),e=>e.code==='limits_exceeded');assert.throws(()=>build([row('a','start_candidate',-1)]));assert.throws(()=>build([row('a','start_candidate',100,{uncertainty:'approved'})]));assert.throws(()=>build([row('a','start_candidate',100,{payload_json:'{}'})]));
});
