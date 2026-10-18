import test from 'node:test';
import assert from 'node:assert/strict';
import {demoReducer} from '../app/trip-domain.ts';
const trip={id:1,date:'2026-10-18',time:'08:00–08:30',route:'A → B',distance:20,classification:'Controleren',driver:'Onbekend',quality:'claimed real GPS',revision:999};
const action={type:'create',trip,reason:'Synthetische registratie',occurredAt:'2026-10-18T13:00:00Z'};
const initial={trips:[],history:[],error:null};
test('manual creation preserves uncertainty and records immutable creation history',()=>{
 const s=demoReducer(initial,action);assert.equal(s.error,null);assert.equal(s.trips.length,1);assert.equal(s.trips[0].classification,'Controleren');assert.equal(s.trips[0].driver,'Onbekend');assert.equal(s.trips[0].revision,0);assert.match(s.trips[0].quality,/Handmatig/);assert.equal(s.history[0].before,null);assert.match(s.history[0].actor,/niet aangemeld/);assert.equal(initial.trips.length,0);
});
test('a repeated creation cannot duplicate or overwrite a trip',()=>{
 const s=demoReducer(initial,action),again=demoReducer(s,action);assert.ok(again.error);assert.deepEqual(again.trips,s.trips);assert.deepEqual(again.history,s.history);
});
test('invalid manual records, identifiers and missing registration reasons leave state untouched',()=>{
 for(const change of [{trip:{...trip,distance:-1}},{trip:{...trip,id:0}},{trip:{...trip,id:NaN}},{reason:' '},{reason:'x'.repeat(501)},{occurredAt:'bad'}]) {const s=demoReducer(initial,{...action,...change});assert.ok(s.error);assert.deepEqual(s.trips,[]);assert.deepEqual(s.history,[]);}
});
