import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareReport,reportCsv,validateRates} from '../app/report-domain.ts';
import {addRate,saveAddress} from '../app/demo-settings.ts';

const trip={id:1,date:'2026-01-01',time:'08:00–08:30',route:'A → B',distance:20,classification:'Zakelijk',driver:'Dennis',quality:'Voorbeeld, geen GPS',odometerStart:0,odometerEnd:20,purpose:'Test'};
const rate={id:'r',validFrom:'2026-01-01',validUntil:'2026-06-30',microsPerKm:123456};
const options={from:'2026-01-01',until:'2026-12-31',driver:'Alle',plate:'test-01',rates:[rate],generatedAt:'2026-10-18T13:00:00Z'};
test('report filters inclusive date range and driver, preserving classification totals',()=>{
 const r=prepareReport([trip,{...trip,id:2,classification:'Privé'},{...trip,id:3,classification:'Controleren'},{...trip,id:4,date:'2025-12-31'},{...trip,id:5,driver:'Jesse'}],{...options,driver:'Dennis'});
 assert.equal(r.rows.length,3);assert.equal(r.totalKm,60);assert.equal(r.businessKm,20);assert.equal(r.privateKm,20);assert.equal(r.reviewKm,20);assert.equal(r.options.plate,'TEST-01');
});
test('date-specific rates and integer money rounding produce deterministic cents',()=>{
 const r=prepareReport([{...trip,distance:1.005,odometerEnd:1.005},{...trip,id:2,date:'2026-07-01',distance:10,odometerEnd:10}],{...options,rates:[{...rate,microsPerKm:1000000},{id:'r2',validFrom:'2026-07-01',microsPerKm:200000}]});
 assert.equal(r.rows[0].amountCents,101);assert.equal(r.rows[1].amountCents,200);assert.equal(r.amountCents,301);
});
test('missing tariff is unknown, not a silently invented zero reimbursement',()=>{
 const r=prepareReport([trip],{...options,rates:[],plate:''});assert.equal(r.rows[0].rateMicros,null);assert.equal(r.rows[0].amountCents,null);assert.ok(r.warnings.some(w=>w.includes('geen tarief')));assert.ok(r.warnings.includes('Kenteken ontbreekt.'));
 const zero=prepareReport([trip],{...options,rates:[{...rate,microsPerKm:0}]});assert.equal(zero.rows[0].amountCents,0);
});
test('report snapshots and historical rates do not mutate with source edits',()=>{
 const trips=[{...trip}],rates=[{...rate}];const r=prepareReport(trips,{...options,rates});const before=reportCsv(r);
 trips[0].distance=999;rates[0].microsPerKm=999999;r.options.rates.forEach(v=>assert.ok(Object.isFrozen(v)));assert.throws(()=>{r.rows[0].purpose='changed';},TypeError);assert.equal(reportCsv(r),before);
});
test('invalid or overlapping tariff periods are refused including shared end dates',()=>{
 for(const rates of [[rate,{...rate,id:'other'}],[rate,{...rate,id:'other',validFrom:'2026-06-30'}],[{...rate,microsPerKm:-1}],[{...rate,microsPerKm:Infinity}],[{...rate,validFrom:'2026-02-30'}],[{...rate,validUntil:'2025-12-31'}]])assert.throws(()=>validateRates(rates));
 assert.doesNotThrow(()=>validateRates([rate,{...rate,id:'other',validFrom:'2026-07-01',validUntil:undefined}]));
});
test('invalid periods, driver, plate, unsafe precision and invalid selected trips block reports',()=>{
 for(const o of [{from:'2026-02-30'},{until:'2025-01-01'},{driver:'nobody'},{plate:'<script>'},{generatedAt:'invalid'}])assert.throws(()=>prepareReport([trip],{...options,...o}));
 for(const distance of [-1,Infinity,1e20,0.0001])assert.throws(()=>prepareReport([{...trip,distance}],options));
});
test('CSV includes plate, explicit zero, quoted formula purpose and report provenance',()=>{
 const csv=reportCsv(prepareReport([{...trip,purpose:' \t=SUM("Test",1)\nRegel 2'}],options));
 assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"TEST-01"'));assert.ok(csv.includes('"0","20"'));assert.ok(csv.includes('"\' \t=SUM(""Test"",1)\nRegel 2"'));assert.ok(csv.includes('NIET VOOR FISCALE INDIENING'));assert.ok(csv.includes('2026-10-18T13:00:00Z'));
});
test('empty selection is explicit and does not generate fictitious rows',()=>{
 const r=prepareReport([],options);assert.equal(r.rows.length,0);assert.equal(r.totalKm,0);assert.ok(r.warnings.some(w=>w.includes('Geen ritten')));assert.throws(()=>reportCsv(r),/Geen ritten/);
});
test('a driver filter cannot hide overlapping vehicle trips recorded by another driver',()=>{
 const r=prepareReport([{...trip,id:2,driver:'Jesse'},trip],{...options,driver:'Dennis'});
 assert.equal(r.rows.length,1);assert.ok(r.warnings.some(w=>w.includes('overlappen')&&w.includes('Rit 1:')));
 const unrelated=prepareReport([{...trip,id:2,driver:'Jesse'},trip],{...options,driver:'Ingrid'});assert.ok(!unrelated.warnings.some(w=>w.includes('overlappen')));
});
test('settings corrections preserve before/after history without altering prior objects',()=>{
 const initial={plate:'',rates:[],addresses:[],history:[]};const withRate=addRate(initial,rate);const edited=addRate(withRate,{...rate,microsPerKm:456789});assert.equal(edited.rates.length,1);assert.equal(withRate.rates[0].microsPerKm,123456);assert.equal(edited.history.length,2);
 const address={id:'a',label:' Test ',address:' Teststraat 1 ',enabled:true,note:''};const added=saveAddress(edited,address);const disabled=saveAddress(added,{...added.addresses[0],enabled:false});assert.equal(disabled.addresses.length,1);assert.equal(disabled.addresses[0].enabled,false);assert.equal(added.addresses[0].enabled,true);assert.equal(initial.history.length,0);assert.throws(()=>saveAddress(initial,{...address,label:' '}));
});
