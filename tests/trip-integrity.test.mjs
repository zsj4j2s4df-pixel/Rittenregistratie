import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

function setup(t, guarded = true) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec('PRAGMA foreign_keys=ON');
  db.exec(readFileSync(new URL('../drizzle/0000_medical_maestro.sql', import.meta.url), 'utf8'));
  db.exec("INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES ('u','test','Test',1,1)");
  db.exec("INSERT INTO vehicles(id,display_name,created_at) VALUES ('v','Test',1)");
  if (guarded) applyGuards(db);
  return db;
}
function applyGuards(db) {
  db.exec(readFileSync(new URL('../drizzle/0001_guard_trip_integrity.sql', import.meta.url), 'utf8'));
}
function insert(db, values = {}) {
  const row = { id: 't', classification: 'private', status: 'provisional', route_type: 'recorded', distance_source: null, started_at: 100, ended_at: 200, distance_km: 2, ...values };
  db.prepare(`INSERT INTO trips(id,vehicle_id,created_by,updated_at,classification,status,route_type,distance_source,started_at,ended_at,distance_km)
    VALUES (?,'v','u',1,?,?,?,?,?,?,?)`).run(row.id, row.classification, row.status, row.route_type, row.distance_source, row.started_at, row.ended_at, row.distance_km);
}
test('migration preserves existing valid trip, route points and audit history', t => {
  const db = setup(t, false); insert(db);
  db.exec("INSERT INTO route_points(trip_id,recorded_at,latitude,longitude) VALUES ('t',100,52,5)");
  db.exec("INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,occurred_at) VALUES ('u','trip','t','create',1)");
  const before = db.prepare('SELECT * FROM trips').get();
  applyGuards(db);
  assert.deepEqual(db.prepare('SELECT * FROM trips').get(), before);
  assert.equal(db.prepare('SELECT count(*) AS n FROM route_points').get().n, 1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM audit_logs').get().n, 1);
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
});
test('invalid classifications, states, provenance, times and distances fail on insert', t => {
  const db = setup(t);
  for (const change of [{classification:'other'},{status:'other'},{route_type:'other'},{distance_source:'other'},
    {ended_at:99},{ended_at:100},{started_at:'yesterday'},{ended_at:'later'},{distance_km:-1},{distance_km:Infinity},{distance_km:'unknown'}]) {
    assert.throws(() => insert(db, change), /trip_integrity_violation/, JSON.stringify(change));
  }
  assert.equal(db.prepare('SELECT count(*) AS n FROM trips').get().n, 0);
});
test('invalid updates abort and retain the previous row', t => {
  const db = setup(t); insert(db);
  const before = db.prepare('SELECT * FROM trips').get();
  for (const [column, value] of [['classification','other'],['distance_km',-1],['ended_at',50],['distance_source','invented']]) {
    assert.throws(() => db.prepare(`UPDATE trips SET ${column} = ? WHERE id = 't'`).run(value), /trip_integrity_violation/);
    assert.deepEqual(db.prepare('SELECT * FROM trips').get(), before);
  }
});
test('zero distance and missing provisional values remain representable without inventing data', t => {
  const db = setup(t);
  insert(db, {distance_km:0});
  insert(db, {id:'in-progress',ended_at:null,distance_km:null,status:'detection'});
  assert.equal(db.prepare("SELECT distance_km FROM trips WHERE id='t'").get().distance_km, 0);
  assert.equal(db.prepare("SELECT distance_km FROM trips WHERE id='in-progress'").get().distance_km, null);
});
test('adding guards does not silently discard pre-existing invalid rows', t => {
  const db = setup(t, false); insert(db, {classification:'other'}); applyGuards(db);
  assert.equal(db.prepare("SELECT classification FROM trips WHERE id='t'").get().classification, 'other');
  assert.throws(() => db.exec("UPDATE trips SET purpose='touch' WHERE id='t'"), /trip_integrity_violation/);
  db.exec("UPDATE trips SET classification='review' WHERE id='t'");
  assert.equal(db.prepare("SELECT classification FROM trips WHERE id='t'").get().classification, 'review');
});
