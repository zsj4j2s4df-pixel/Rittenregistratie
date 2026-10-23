import test from 'node:test';
import assert from 'node:assert/strict';
import {monthPeriod,shiftMonth,currentMonth,tripTotals} from '../app/web-domain.ts';
import {filterTrips} from '../app/beheer/trip-filters.ts';
test('website month boundaries handle leap years and year changes, invalid months are not guessed',()=>{
 assert.deepEqual(monthPeriod('2024-02'),{from:'2024-02-01',until:'2024-02-29'});assert.equal(monthPeriod('2026-02').until,'2026-02-28');assert.equal(monthPeriod('2000-02').until,'2000-02-29');assert.equal(shiftMonth('2026-01',-1),'2025-12');assert.equal(shiftMonth('2026-12',1),'2027-01');for(const v of ['','2026-13','2026-2','2026-00','not-a-month'])assert.equal(monthPeriod(v),null);
});
test('month selection follows Amsterdam around midnight and filters only the selected Dutch month',()=>{
 assert.equal(currentMonth(new Date('2026-09-30T22:30:00Z')),'2026-10');const trips=[{id:'before',started_at:Date.parse('2026-09-30T21:59:59Z')/1000},{id:'inside',started_at:Date.parse('2026-09-30T22:00:00Z')/1000},{id:'after',started_at:Date.parse('2026-10-31T23:00:00Z')/1000}];assert.deepEqual(filterTrips(trips,{...monthPeriod('2026-10'),classification:'',driver:'',query:''}).map(t=>t.id),['inside']);
});
test('visible trip totals preserve unknown distance and use exact milli-km rather than floating accumulation',()=>{
 const totals=tripTotals([{distance_km:.1,classification:'business'},{distance_km:.2,classification:'private'},{distance_km:null,classification:'business'},{distance_km:1.001,classification:'review'}]);assert.deepEqual(totals,{count:4,knownMilliKm:1301,businessMilliKm:100,privateMilliKm:200,reviewMilliKm:1001,unknown:1});assert.equal(tripTotals([]).count,0);
});
