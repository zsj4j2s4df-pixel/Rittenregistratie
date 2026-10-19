import test from 'node:test';import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createReportService} from '../lib/report-service.ts';
import {createSettingsService} from '../lib/settings-service.ts';
import {groupReport} from '../lib/report-groups.ts';
const principal={userId:'u',disabled:false,sessionExpiresAt:2000000};
async function fixture(t){
 const f=setup(t);f.sqlite.exec("UPDATE users SET name='Same name';INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('other','v');DELETE FROM trips WHERE vehicle_id='v'");
 const insert=f.sqlite.prepare("INSERT INTO trips(id,vehicle_id,driver_id,created_by,updated_at,started_at,ended_at,distance_km,classification,route_type,distance_source) VALUES (?,'v',?,'u',1,?,?,?,?, 'estimated','manual')");
 for(const [id,driver,date,distance,kind] of [['a','u','2025-12-31T23:30:00Z',0.01,'business'],['b','other','2026-01-15T12:00:00Z',1.234,'private'],['c','u','2026-03-31T22:30:00Z',0.01,'business'],['d','u','2026-07-01T12:00:00Z',2,'business'],['e',null,'2026-12-31T23:30:00Z',null,'review']]){const start=Date.parse(date)/1000;insert.run(id,driver,start,start+60,distance,kind);}
 await createSettingsService(f.db,async()=>principal,()=>1000000).save('v',{revision:0,plate:'TEST-01',addresses:[],rates:[{id:'r',validFrom:'2026-01-01',validUntil:'2026-04-30',microsPerKm:500000}],reason:'Synthetic summary fixture'});
 const service=createReportService(f.db,async()=>principal,()=>1000000),report=await service.create('v',{requestId:'grouped-report-fixture-01',from:'2026-01-01',until:'2027-01-31',driverId:null});return {...f,service,report};
}
test('Amsterdam boundaries and identical names keep driver identities separate across month/quarter/year',async t=>{
 const {report}=await fixture(t),months=groupReport(report,'month'),quarters=groupReport(report,'quarter'),years=groupReport(report,'year');
 assert.equal(months.filter(g=>g.period==='2026-01').length,2);assert.deepEqual(months.filter(g=>g.period==='2026-01').map(g=>g.driverId),['other','u']);
 assert.equal(quarters.find(g=>g.period==='2026-Q2').totals.businessMilliKm,10);assert.equal(quarters.find(g=>g.period==='2026-Q1'&&g.driverId==='u').until,'2026-03-31');
 assert.equal(years.find(g=>g.period==='2026'&&g.driverId==='u').partialPeriod,false);assert.equal(years.find(g=>g.period==='2027').partialPeriod,true);
 const unknown=years.find(g=>g.driverId===null);assert.equal(unknown.period,'2027');assert.equal(unknown.driverName,null);assert.equal(unknown.totals.unknownDistanceCount,1);assert.equal(unknown.totals.reviewMilliKm,0);
});
test('sum preserved per-trip rounded cents; unknown business amounts remain counted without invented rates',async t=>{
 const {report}=await fixture(t),groups=groupReport(report,'year'),u=groups.find(g=>g.period==='2026'&&g.driverId==='u');
 assert.equal(u.totals.amountCents,2); // Two separately rounded half-cent trips; do not recompute pooled mileage.
 assert.equal(u.totals.businessMilliKm,2020);assert.equal(u.totals.unknownBusinessAmountCount,1);
 for(const key of Object.keys(report.totals))assert.equal(groups.reduce((sum,g)=>sum+g.totals[key],0),report.totals[key]);
});
test('summaries remain bound to immutable report after names, distances and tariffs change',async t=>{
 const {report,sqlite,service}=await fixture(t),before=groupReport(report,'quarter'),json=JSON.stringify(report);
 sqlite.exec("UPDATE users SET name='Changed';UPDATE trips SET distance_km=10,revision=revision+1 WHERE id='a';UPDATE mileage_rates SET amount_micros=900000");
 assert.deepEqual(groupReport(await service.get('v',report.id),'quarter'),before);assert.equal(JSON.stringify(report),json);
 const narrowed=structuredClone(report);narrowed.from='2026-01-01';narrowed.until='2026-01-31';narrowed.rows=narrowed.rows.filter(r=>r.date.startsWith('2026-01'));narrowed.totals=Object.fromEntries(Object.keys(report.totals).map(k=>[k,before.filter(g=>g.period==='2026-Q1').reduce((n,g)=>n+g.totals[k],0)]));
 assert.ok(groupReport(narrowed,'quarter').every(g=>g.partialPeriod));assert.ok(groupReport(narrowed,'month').every(g=>!g.partialPeriod));
});
test('inconsistent, duplicate, unsafe or oversized snapshots fail rather than silently changing totals',async t=>{
 const {report}=await fixture(t);
 for(const change of [r=>r.rows.push(r.rows[0]),r=>r.totals.milliKm++,r=>r.rows[0].date='2025-12-31',r=>r.rows[0].amountCents=-1,r=>r.rows[0].distance_km=0.0001,r=>r.rows[0].classification='invented',r=>r.rows=Array(501).fill(r.rows[0]),r=>r.rows[0].amountCents=Number.MAX_SAFE_INTEGER]){const copy=structuredClone(report);change(copy);assert.throws(()=>groupReport(copy,'year'));}
 assert.throws(()=>groupReport(report,'week'));
});
