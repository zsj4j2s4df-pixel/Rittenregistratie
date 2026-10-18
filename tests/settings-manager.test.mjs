import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRateMicros,replaceSetting} from '../app/beheer/settings-manager-domain.ts';
const settings={revision:4,plate:'TEST-01',addresses:[],rates:[]};
const address={id:'stable-id',label:' Test ',address:' Straat 1 ',note:'',enabled:true};
test('decimal amounts parse exactly, preserving zero and refusing precision or range loss',()=>{
 for(const [input,want] of [['0',0],['0,123456',123456],['1000',1000000000],['1.000001',1000001]])assert.equal(parseRateMicros(input),want);
 for(const input of ['', '-1','1e3','0.0000001','1000.000001','Infinity'])assert.throws(()=>parseRateMicros(input));
});
test('stable address IDs replace an uncertain committed write after reconnect without duplicates',()=>{
 const committed=replaceSetting(settings,'address',address);
 const retried=replaceSetting({...committed,revision:5},'address',{...address,label:'Updated'});
 assert.equal(retried.addresses.length,1);assert.equal(retried.addresses[0].id,address.id);assert.equal(retried.revision,5);assert.equal(retried.plate,settings.plate);assert.equal(settings.addresses.length,0);
});
test('rates retain stable IDs and unrelated values, reject overlap and combined count over 40',()=>{
 const rate={id:'rate-id',validFrom:'2026-01-01',microsPerKm:0};
 const saved=replaceSetting(replaceSetting(settings,'address',address),'rate',rate);
 const retried=replaceSetting(saved,'rate',{...rate,microsPerKm:123456});assert.equal(retried.rates.length,1);assert.deepEqual(retried.addresses,saved.addresses);
 assert.throws(()=>replaceSetting(saved,'rate',{...rate,id:'overlap'}));
 const full={...settings,addresses:Array.from({length:40},(_,i)=>({...address,id:'a'+i}))};assert.throws(()=>replaceSetting(full,'rate',rate),/40/);assert.doesNotThrow(()=>replaceSetting(full,'address',{...address,id:'a0'}));
});
