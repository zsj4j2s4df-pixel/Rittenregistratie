import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/trip-fixture.mjs';
import { createReportService } from '../lib/report-service.ts';
import { createSettingsService } from '../lib/settings-service.ts';
import { createTripHttpHandler } from '../lib/trip-http.ts';
const p={userId:'u',disabled:false,sessionExpiresAt:2_000_000};
const create=db=>createReportService(db,async()=>p,()=>1_000_000);
const request={requestId:'synthetic-report-0001',from:'1970-01-01',until:'1970-01-01',driverId:null};
const status=n=>e=>e.status===n;
async function seed(t){const f=setup(t);f.sqlite.exec("UPDATE trips SET driver_id='u',classification='business',start_address='Synthetic A',end_address='Synthetic B',odometer_start=0,odometer_end=20,purpose='Synthetic' WHERE id='t'");await createSettingsService(f.db,async()=>p,()=>1_000_000).save('v',{revision:0,plate:'TEST-01',addresses:[],rates:[{id:'rate',validFrom:'1970-01-01',microsPerKm:230000}],reason:'Synthetic rate'});return {...f,report:create(f.db)};}
test('durable reports capture revisions, exact money and explicit zero odometer',async t=>{
 const {db,report}=await seed(t);const a=await report.create('v',request);assert.equal(a.rows[0].odometer_start,0);assert.equal(a.rows[0].amountCents,460);assert.equal(a.totals.milliKm,20000);assert.equal(a.plate,'TEST-01');assert.equal(a.settingsRevision,1);assert.ok(Object.isFrozen(a.rows[0]));assert.deepEqual(await create(db).get('v',a.id),a);
});
test('old report remains unchanged after source trip, driver name and tariff edits',async t=>{
 const {db,sqlite,report}=await seed(t);const a=await report.create('v',request);sqlite.exec("UPDATE trips SET distance_km=30,revision=1 WHERE id='t';UPDATE users SET name='Renamed' WHERE id='u';UPDATE mileage_rates SET amount_micros=500000");assert.deepEqual(await create(db).get('v',a.id),a);const b=await report.create('v',{...request,requestId:'synthetic-report-0002'});assert.equal(b.rows[0].amountCents,1500);assert.equal(b.rows[0].driver_name,'Renamed');assert.throws(()=>sqlite.exec("UPDATE report_snapshots SET snapshot_json='{}'"),/report_snapshot_immutable/);
});
test('retry returns original snapshot; concurrent identical generation yields one audit and conflicts reject',async t=>{
 const {sqlite,report}=await seed(t);const [a,b]=await Promise.all([report.create('v',request),report.create('v',request)]);assert.deepEqual(a,b);assert.equal(sqlite.prepare("SELECT count(*) AS n FROM audit_logs WHERE entity_type='report'").get().n,1);assert.equal((await report.list('v')).length,1);await assert.rejects(()=>report.create('v',{...request,until:'1970-01-02'}),status(409));
});
test('report read/list/export require verified active vehicle scope; source data cannot be spoofed',async t=>{
 const {db,sqlite,report}=await seed(t);await assert.rejects(()=>createReportService(db).create('v',request),status(401));const a=await report.create('v',{...request,createdBy:'other',plate:'SPOOF',rows:[]});assert.equal(a.createdBy,'u');assert.equal(a.plate,'TEST-01');await assert.rejects(()=>report.get('other-v',a.id),status(403));await assert.rejects(()=>report.csv('v','unknown'),status(404));sqlite.exec('UPDATE vehicle_memberships SET active=0');for(const fn of [()=>report.get('v',a.id),()=>report.csv('v',a.id),()=>report.list('v')])await assert.rejects(fn,status(403));
});
test('audit failure rolls back report; revoked authorization before batch creates nothing',async t=>{
 const {db,sqlite,report}=await seed(t);sqlite.exec("CREATE TRIGGER reject_report BEFORE INSERT ON audit_logs WHEN NEW.entity_type='report' BEGIN SELECT RAISE(ABORT,'report audit failure'); END");await assert.rejects(()=>report.create('v',request),/report audit failure/);assert.equal((await report.list('v')).length,0);sqlite.exec('DROP TRIGGER reject_report');const batch=db.batch;db.batch=async statements=>{sqlite.exec('UPDATE vehicle_memberships SET active=0');return batch(statements);};await assert.rejects(()=>report.create('v',request),status(409));assert.equal(sqlite.prepare('SELECT count(*) AS n FROM report_snapshots').get().n,0);
});
test('Amsterdam date selection handles UTC midnight, DST and overlaps outside selected driver',async t=>{
 const {sqlite,report}=await seed(t);const start=Date.parse('2026-03-28T23:30:00Z')/1000;sqlite.exec(`UPDATE trips SET started_at=${start},ended_at=${start+3600} WHERE id='t';INSERT INTO trips(id,vehicle_id,driver_id,created_by,updated_at,started_at,ended_at,distance_km) VALUES ('overlap','v','other','u',1,${start+300},${start+1200},10)`);const a=await report.create('v',{...request,from:'2026-03-29',until:'2026-03-29',driverId:'u'});assert.equal(a.rows.length,1);assert.equal(a.rows[0].date,'2026-03-29');assert.ok(a.warnings.some(x=>x.includes('overlap')));await assert.rejects(()=>report.create('v',{...request,from:'2026-03-28',until:'2026-03-28',requestId:'synthetic-report-0003'}),status(409));
});
test('missing distance/rate/data remain unknown and warned; unsafe precision and empty selection reject',async t=>{
 const {sqlite,report}=await seed(t);sqlite.exec("DELETE FROM mileage_rates;UPDATE trips SET distance_km=NULL,driver_id=NULL,odometer_start=NULL,ended_at=NULL WHERE id='t'");const a=await report.create('v',request);assert.equal(a.rows[0].distance_km,null);assert.equal(a.rows[0].amountCents,null);assert.equal(a.totals.unknownDistanceCount,1);assert.equal(a.totals.unknownBusinessAmountCount,1);assert.ok(a.warnings.some(x=>x.includes('totalen onvolledig')));assert.ok(a.warnings.some(x=>x.includes('tarief ontbreekt')));await assert.rejects(()=>report.create('v',{...request,requestId:'synthetic-report-0002',driverId:'none'}),status(409));sqlite.exec("UPDATE trips SET distance_km=1.1234 WHERE id='t'");await assert.rejects(()=>report.create('v',{...request,requestId:'synthetic-report-0003'}),status(409));
});
test('CSV uses immutable source, formula escaping, quotes, zero and provenance',async t=>{
 const {sqlite,report}=await seed(t);sqlite.prepare("UPDATE trips SET purpose=? WHERE id='t'").run('=SUM("A",1)\nTest');const a=await report.create('v',request);const csv=await report.csv('v',a.id);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"\'=SUM(""A"",1)\nTest"'));assert.ok(csv.includes('"0","20"'));assert.ok(csv.includes('NIET FISCAAL GOEDGEKEURD'));assert.ok(csv.includes('manual'));
});
test('oversized selection refuses without silent truncation or report write',async t=>{
 const {sqlite,report}=await seed(t);const stmt=sqlite.prepare("INSERT INTO trips(id,vehicle_id,created_by,updated_at,started_at,ended_at,distance_km) VALUES (?,'v','u',1,100,200,1)");for(let i=0;i<501;i++)stmt.run('big-'+i);await assert.rejects(()=>report.create('v',request),status(413));assert.equal((await report.list('v')).length,0);
});
test('HTTP report creation/export shares CSRF, schema guards, no-store and cross-scope denial',async t=>{
 const {db}=await seed(t);const origin='https://ritkompas.example';const handle=createTripHttpHandler({db,origin,clock:()=>1_000_000,resolveSession:async()=>p});const url=origin+'/api/vehicles/v/reports';const post=(body,headers={})=>new Request(url,{method:'POST',headers:{origin,'x-csrf-protection':'1','content-type':'application/json',...headers},body:JSON.stringify(body)});
 assert.equal((await handle(post(request,{origin:'https://evil.example'}))).status,403);assert.equal((await handle(post({...request,plate:'spoof'}))).status,400);const response=await handle(post(request));assert.equal(response.status,201);const {report}=await response.json();const csv=await handle(new Request(url+'/'+report.id+'/csv'));assert.equal(csv.status,200);assert.equal(csv.headers.get('content-type'),'text/csv; charset=utf-8');assert.equal(csv.headers.get('cache-control'),'no-store');assert.ok((await csv.text()).includes('TEST-01'));assert.equal((await handle(new Request(origin+'/api/vehicles/other-v/reports/'+report.id+'/csv'))).status,403);assert.equal((await handle(new Request(url+'?limit=1e2'))).status,400);assert.equal((await handle(new Request(url+'/'+report.id,{method:'DELETE'}))).status,405);
});

test('overlap detection includes prior-day and older open vehicle intervals outside report date/driver filter',async t=>{
 const {sqlite,report}=await seed(t);const start=Date.parse('2026-01-01T23:30:00Z')/1000;
 sqlite.exec(`UPDATE trips SET started_at=${start},ended_at=${start+1800} WHERE id='t';INSERT INTO trips(id,vehicle_id,created_by,driver_id,updated_at,started_at,ended_at,distance_km) VALUES ('prior-day','v','u','other',1,${start-3600},${start+3600},5),('long-open','v','u','other',1,${start-864000},NULL,NULL)`);
 const a=await report.create('v',{...request,from:'2026-01-02',until:'2026-01-02',driverId:'u'});assert.equal(a.rows.length,1);assert.ok(a.warnings.some(x=>x.includes('prior-day')));assert.ok(a.warnings.some(x=>x.includes('long-open')));
});

test('CSV includes complete report warnings once instead of multiplying them across every trip',async t=>{
 const {sqlite,report}=await seed(t);const stmt=sqlite.prepare("INSERT INTO trips(id,vehicle_id,created_by,updated_at,started_at,ended_at,distance_km) VALUES (?,'v','u',1,?,?,1)");for(let i=0;i<100;i++)stmt.run('warning-'+i,1000+i*100,1050+i*100);
 const a=await report.create('v',request);const csv=await report.csv('v',a.id);assert.equal(csv.split('GPS-routepunten en GPS-gaten').length-1,1);assert.ok(new TextEncoder().encode(csv).byteLength<200000);
});
