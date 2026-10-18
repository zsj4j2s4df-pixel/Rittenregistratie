import test from 'node:test';
import assert from 'node:assert/strict';
import {canAccessVehicle,assessCandidateOverlap} from '../lib/access-policy.ts';
const now=1000, principal={userId:'dennis',sessionExpiresAt:2000,disabled:false};
const memberships=[{userId:'dennis',vehicleId:'jeep',role:'admin_driver',active:true}];
test('verified active membership grants all defined actions equally',()=>{
  for(const action of ['read_trips','edit_trips','export_trips','manage_settings']) assert.equal(canAccessVehicle(principal,memberships,'jeep',action,now),true);
});
test('missing disabled expired or nonfinite session fails closed',()=>{
  for(const p of [null,{...principal,disabled:true},{...principal,sessionExpiresAt:now},{...principal,sessionExpiresAt:NaN},{...principal,userId:''}]) assert.equal(canAccessVehicle(p,memberships,'jeep','read_trips',now),false);
});
test('other vehicle or user cannot access trips',()=>{
  assert.equal(canAccessVehicle(principal,memberships,'other','read_trips',now),false);
  assert.equal(canAccessVehicle({...principal,userId:'ingrid'},memberships,'jeep','read_trips',now),false);
});
test('revoked membership and unknown roles or actions are denied',()=>{
  for(const membership of [{...memberships[0],active:false},{...memberships[0],role:'guest'}]) assert.equal(canAccessVehicle(principal,[membership],'jeep','read_trips',now),false);
  assert.equal(canAccessVehicle(principal,memberships,'jeep','delete_everything',now),false);
  assert.equal(canAccessVehicle(principal,memberships,'jeep','read_trips',NaN),false);
});
const a={id:'a',vehicleId:'jeep',driverId:'dennis',startMs:100,endMs:200,confirmedDriver:false};
test('overlap never treats priority or unconfirmed driver as proof',()=>{
  const result=assessCandidateOverlap(a,{...a,id:'b',driverId:'jesse'});assert.equal(result.kind,'needs_review');assert.equal(result.driverId,null);assert.deepEqual(result.candidateIds,['a','b']);
});
test('conflicting confirmed drivers remain unknown',()=>{
  assert.equal(assessCandidateOverlap({...a,confirmedDriver:true},{...a,id:'b',driverId:'ingrid',confirmedDriver:true}).driverId,null);
});
test('same confirmed driver does not automatically merge trips',()=>{
  const result=assessCandidateOverlap({...a,confirmedDriver:true},{...a,id:'b',confirmedDriver:true});assert.equal(result.driverId,'dennis');assert.equal(result.kind,'needs_review');
});
test('different vehicles and adjacent intervals are separate',()=>{
  for(const b of [{...a,id:'b',vehicleId:'other'},{...a,id:'b',startMs:200,endMs:300}]) assert.equal(assessCandidateOverlap(a,b).kind,'separate');
});
test('invalid detection timestamps require review',()=>{
  for(const b of [{...a,id:'b',startMs:NaN},{...a,id:'b',endMs:99}]) assert.equal(assessCandidateOverlap(a,b).kind,'needs_review');
});
