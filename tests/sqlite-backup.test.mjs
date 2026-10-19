import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync,backup as sqliteBackup} from 'node:sqlite';
import {setup as setupTrips} from './helpers/trip-fixture.mjs';
import {createReportService} from '../lib/report-service.ts';
import {mkdtemp,rm,readFile,writeFile,readdir,stat,symlink,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {initKey,createBackup,restoreBackup} from '../scripts/sqlite-backup.mjs';
// macOS exposes its temporary directory through /var -> /private/var.
// Canonicalize the test fixture, keeping production symlink rejection intact.
async function setup(t){const dir=await mkdtemp(path.join(await realpath(tmpdir()),'rk-backup-test-'));t.after(()=>rm(dir,{recursive:true,force:true}));const source=path.join(dir,'source.sqlite'),keyFile=path.join(dir,'key'),destination=path.join(dir,'encrypted');const db=new DatabaseSync(source);db.exec("PRAGMA foreign_keys=ON; CREATE TABLE trips(id INTEGER PRIMARY KEY); CREATE TABLE audit_logs(id INTEGER PRIMARY KEY,trip_id INTEGER REFERENCES trips(id),reason TEXT);INSERT INTO trips VALUES(1);INSERT INTO audit_logs VALUES(1,1,'synthetic correction');");db.close();await initKey(keyFile);return {dir,source,keyFile,destination};}
test('encrypted SQLite roundtrip preserves schema, audit data and private permissions',async t=>{const o=await setup(t);await createBackup(o);assert.equal((await stat(o.destination)).mode&0o777,0o600);assert.ok(!(await readFile(o.destination)).includes(Buffer.from('synthetic correction')));const target=path.join(o.dir,'restored.sqlite');await restoreBackup({...o,source:o.destination,destination:target});const db=new DatabaseSync(target);try{assert.equal(db.prepare('SELECT reason FROM audit_logs').get().reason,'synthetic correction');assert.equal(db.prepare('PRAGMA foreign_key_list(audit_logs)').all().length,1);}finally{db.close();}assert.equal((await stat(target)).mode&0o777,0o600);});
test('tampered ciphertext, authenticated metadata and wrong key fail without plaintext residue',async t=>{const o=await setup(t);await createBackup(o);const original=await readFile(o.destination);const tempBefore=(await readdir(tmpdir())).filter(n=>n.startsWith('ritkompas-sqlite-')).sort();for(const index of [30,original.length-20,original.length-1]){const corrupted=Buffer.from(original);corrupted[index]^=1;const file=path.join(o.dir,'bad');await writeFile(file,corrupted);const target=path.join(o.dir,'failed.sqlite');await assert.rejects(()=>restoreBackup({...o,source:file,destination:target}));await assert.rejects(()=>stat(target),{code:'ENOENT'});}const wrong=path.join(o.dir,'wrong-key');await initKey(wrong);await assert.rejects(()=>restoreBackup({...o,source:o.destination,destination:path.join(o.dir,'wrong.sqlite'),keyFile:wrong}));assert.deepEqual((await readdir(tmpdir())).filter(n=>n.startsWith('ritkompas-sqlite-')).sort(),tempBefore);});
test('no overwrite, symlink following or key replacement is allowed',async t=>{const o=await setup(t);await createBackup(o);const bytes=await readFile(o.destination);await assert.rejects(()=>createBackup(o));assert.deepEqual(await readFile(o.destination),bytes);await assert.rejects(()=>initKey(o.keyFile));await assert.rejects(()=>restoreBackup({...o,source:o.destination,destination:o.source}));const link=path.join(o.dir,'link');await symlink(o.source,link);await assert.rejects(()=>restoreBackup({...o,source:o.destination,destination:link}));await assert.rejects(()=>createBackup({...o,source:link,destination:path.join(o.dir,'new')}));const folderLink=path.join(o.dir,'parent-link');await symlink(o.dir,folderLink);await assert.rejects(()=>restoreBackup({...o,source:o.destination,destination:path.join(folderLink,'new.sqlite')}));});
test('authenticated SQLite with foreign-key violations is not accepted',async t=>{const o=await setup(t);const db=new DatabaseSync(o.source);db.exec('PRAGMA foreign_keys=OFF; INSERT INTO audit_logs VALUES(2,999,\'broken synthetic\')');db.close();await createBackup(o);const target=path.join(o.dir,'invalid.sqlite');await assert.rejects(()=>restoreBackup({...o,source:o.destination,destination:target}),/integriteit/);await assert.rejects(()=>stat(target),{code:'ENOENT'});});

test('current RitKompas migrations preserve actual trips, audited correction and immutable reports through encrypted restore',async t=>{
 const o=await setup(t),fixture=setupTrips(t);
 await fixture.service.edit('v','t',{expectedRevision:0,startedAt:100,endedAt:200,distanceKm:21,startAddress:'Synthetic A',endAddress:'Synthetic B',classification:'private',driverId:null,odometerStart:0,odometerEnd:21,purpose:null,reason:'Synthetic backup integration'});
 const report=await createReportService(fixture.db,async()=>({userId:'u',disabled:false,sessionExpiresAt:2_000_000}),()=>1_000_000).create('v',{requestId:'backup-integration-0001',from:'1970-01-01',until:'1970-01-01',driverId:null});
 const migrated=path.join(o.dir,'migrated.sqlite');await sqliteBackup(fixture.sqlite,migrated);
 await createBackup({...o,source:migrated});const restored=path.join(o.dir,'current-schema.sqlite');await restoreBackup({...o,source:o.destination,destination:restored});
 const db=new DatabaseSync(restored);try{
  db.exec('PRAGMA foreign_keys=ON');
  assert.equal(db.prepare("SELECT revision FROM trips WHERE id='t'").get().revision,1);
  const audit=db.prepare("SELECT actor_id,new_value_json FROM audit_logs WHERE entity_type='trip' AND entity_id='t'").get();assert.equal(audit.actor_id,'u');assert.equal(JSON.parse(audit.new_value_json).correction_reason,'Synthetic backup integration');
  assert.deepEqual(JSON.parse(db.prepare('SELECT snapshot_json FROM report_snapshots WHERE id=?').get(report.id).snapshot_json),report);
  assert.throws(()=>db.exec("UPDATE report_snapshots SET snapshot_json='{}'"),/report_snapshot_immutable/);
  assert.throws(()=>db.exec("UPDATE trips SET distance_km=-1 WHERE id='t'"),/trip_integrity_violation/);
  assert.throws(()=>db.exec("UPDATE trips SET revision=-1 WHERE id='t'"),/trip_revision_odometer_violation/);
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
 }finally{db.close();}
});
