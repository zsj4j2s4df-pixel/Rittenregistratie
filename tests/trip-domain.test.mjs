import test from 'node:test';
import assert from 'node:assert/strict';
import {validateTrip,validateLog,validDate,timeRange,demoReducer} from '../app/trip-domain.ts';
const trip={id:1,date:'2026-10-16',time:'08:00–08:30',route:'A → B',distance:20,classification:'Privé',driver:'Dennis',quality:'Demo',odometerStart:100,odometerEnd:120};
const codes=t=>validateTrip(t).map(i=>i.code);
test('complete coherent private trip has no field issues',()=>assert.deepEqual(validateTrip(trip),[]));
test('calendar dates reject impossible days and accept leap day',()=>{
  assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2026-02-29'),false);assert.equal(validDate('2028-02-29'),true);assert.equal(validDate('Vandaag'),false);
});
test('time order, invalid minutes, equal times and midnight need correction',()=>{
  for(const time of ['09:00–08:00','08:60–09:00','08:00–08:00','23:50–00:10']) assert.equal(timeRange(time),null);
});
test('distance rejects zero, negative, infinity and NaN',()=>{for(const distance of [0,-1,Infinity,NaN]) assert.ok(codes({...trip,distance}).includes('distance'));});
test('missing data remains missing; unknown driver and classification are flagged',()=>{
  const value={...trip,driver:'Onbekend',classification:'Controleren',odometerStart:undefined};
  assert.deepEqual(codes(value),['driver_unknown','review','odometer_missing']);assert.equal(value.odometerStart,undefined);
});
test('invalid classifications, drivers and incomplete routes are rejected',()=>{
  for(const [field,value,code] of [['classification','other','classification'],['driver','stranger','driver'],['route',' → B','route']]) assert.ok(codes({...trip,[field]:value}).includes(code));
});
test('odometer order errors, invalid values and mismatches are distinct',()=>{
  assert.ok(codes({...trip,odometerEnd:90}).includes('odometer_order'));
  assert.ok(codes({...trip,odometerEnd:Infinity}).includes('odometer_invalid'));
  assert.ok(codes({...trip,odometerEnd:121}).includes('odometer_difference'));
});
test('business purpose is a warning; never invented',()=>assert.ok(codes({...trip,classification:'Zakelijk'}).includes('purpose_missing')));
test('overlapping vehicle trips flagged regardless of driver, not auto merged',()=>{
  const trips=[trip,{...trip,id:2,driver:'Ingrid',time:'08:20–08:40'}];assert.ok(validateLog(trips).some(i=>i.code==='overlap'));assert.equal(trips.length,2);
});
test('adjacent trips and separate dates are not overlaps',()=>{
  assert.ok(!validateLog([trip,{...trip,id:2,time:'08:30–09:00'},{...trip,id:3,date:'2026-10-17'}]).some(i=>i.code==='overlap'));
});
const state={trips:[trip],history:[],error:null};
const action={type:'edit',trip:{...trip,classification:'Zakelijk',purpose:'Demo afspraak'},expectedRevision:0,reason:'Correctie test',occurredAt:'2026-10-17T12:00:00Z'};
test('edit creates immutable before/after history and revision without trusting actor',()=>{
  const result=demoReducer(state,{...action,actor:'Dennis'});assert.equal(result.trips[0].revision,1);assert.equal(result.history.length,1);assert.equal(result.history[0].before.classification,'Privé');assert.equal(state.trips[0].classification,'Privé');assert.ok(result.history[0].actor.includes('niet aangemeld'));
});
test('stale revisions cannot overwrite previous changes',()=>{const updated=demoReducer(state,action);const rejected=demoReducer(updated,action);assert.ok(rejected.error);assert.equal(rejected.history.length,1);assert.deepEqual(rejected.trips,updated.trips);});
test('invalid edit, missing reason, missing trip and invalid timestamp leave data untouched',()=>{
  for(const change of [{trip:{...trip,distance:-1}},{reason:' '},{trip:{...trip,id:99}},{occurredAt:'not a date'}]){const result=demoReducer(state,{...action,...change});assert.ok(result.error);assert.equal(result.history.length,0);assert.deepEqual(result.trips,[trip]);}
});
test('provenance cannot be upgraded through an edit',()=>{
  assert.equal(demoReducer(state,{...action,trip:{...action.trip,quality:'Real GPS'}}).trips[0].quality,'Demo');
});
