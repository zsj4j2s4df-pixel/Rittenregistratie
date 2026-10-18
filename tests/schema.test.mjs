import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
const migration=readFileSync(new URL('../drizzle/0000_medical_maestro.sql',import.meta.url),'utf8');
function setup(t) {
  const db=new DatabaseSync(':memory:');t.after(()=>db.close());db.exec('PRAGMA foreign_keys=ON');db.exec(migration);return db;
}
test('existing migration executes in isolated SQLite and creates seven application tables',t=>{
  const db=setup(t);const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(row=>row.name);
  assert.deepEqual(tables,['audit_logs','business_addresses','mileage_rates','route_points','trips','users','vehicles']);
});
test('foreign keys reject an address owned by a nonexistent user',t=>{
  const db=setup(t);assert.throws(()=>db.prepare('INSERT INTO business_addresses (id,label,address,created_by,created_at) VALUES (?,?,?,?,?)').run('a','Test','Testadres','missing',1),/FOREIGN KEY/);
});
test('external identity cannot be assigned to two local user rows',t=>{
  const db=setup(t);const insert=db.prepare('INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES (?,?,?,?,?)');insert.run('a','identity','Test A',1,1);
  assert.throws(()=>insert.run('b','identity','Test B',2,1),/UNIQUE/);
});
