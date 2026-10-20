import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';

for(const baseline of [7,8])test(`feature upgrade from migration ${baseline} preserves populated data, historical snapshots, unknowns, zero and audit guards`,t=>{
 const db=new DatabaseSync(':memory:');t.after(()=>db.close());db.exec('PRAGMA foreign_keys=ON');
 const files=readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort();
 const apply=name=>db.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 files.filter(name=>Number(name.slice(0,4))<=baseline).forEach(apply);
 db.exec(`INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES('upgrade-user','upgrade-auth','Synthetic',1,1);
 INSERT INTO vehicles(id,display_name,created_at) VALUES('upgrade-vehicle','Synthetic',1);
 INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES('upgrade-user','upgrade-vehicle');
 INSERT INTO trips(id,vehicle_id,driver_id,created_by,updated_at,started_at,ended_at,distance_km,route_type,distance_source,odometer_start,odometer_end,revision,status,needs_review)
 VALUES('upgrade-known','upgrade-vehicle','upgrade-user','upgrade-user',1,100,200,12,'estimated','manual',0,12,4,'final',0),
 ('upgrade-unknown','upgrade-vehicle',NULL,'upgrade-user',1,300,NULL,NULL,'recorded',NULL,NULL,NULL,0,'provisional',1);
 INSERT INTO route_points(trip_id,recorded_at,latitude,longitude,accuracy_meters,source) VALUES('upgrade-known',100,52,5,NULL,'gps');
 INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) VALUES('upgrade-user','trip','upgrade-known','correction',NULL,'{"odometerStart":0,"note":"=quoted \\\"value\\\""}',1);
 INSERT INTO report_snapshots(id,vehicle_id,created_by,created_at,request_id,request_json,snapshot_json) VALUES('upgrade-report','upgrade-vehicle','upgrade-user',1,'upgrade-request','{"period":"historic"}','{"immutable":"synthetic saved bytes","zero":0,"unknown":null}');`);
 const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r=>r.name);
 const rows=table=>db.prepare('SELECT * FROM "'+table+'" ORDER BY rowid').all();
 const before=Object.fromEntries(tables.map(name=>[name,rows(name)]));
 files.filter(name=>Number(name.slice(0,4))>baseline).forEach(apply);
 for(const name of tables)assert.deepEqual(rows(name),before[name],'existing data changed in '+name);
 assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
 for(const name of ['journey_materializations','trip_review_requests','mutation_requests'])assert.equal(rows(name).length,0,'migration must not fabricate receipts');
 assert.throws(()=>db.exec("UPDATE report_snapshots SET snapshot_json='{}'"),/immutable/);
 assert.throws(()=>db.exec("DELETE FROM audit_logs"),/audit_log_immutable/);
 assert.throws(()=>db.exec("UPDATE audit_logs SET action='rewritten'"),/audit_log_immutable/);
 assert.deepEqual(rows('audit_logs'),before.audit_logs);
 assert.throws(()=>db.exec("UPDATE trips SET revision=-1 WHERE id='upgrade-known'"),/revision/i);
 assert.equal(db.prepare("SELECT odometer_start FROM trips WHERE id='upgrade-known'").get().odometer_start,0);
 assert.equal(db.prepare("SELECT distance_km FROM trips WHERE id='upgrade-unknown'").get().distance_km,null);
});
