import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { createTripService } from '../../lib/trip-service.ts';
// SQLite adapter exercises real SQL and atomic rollback. It is not a deployed D1 test.
export function setup(t, resolver = async () => ({userId:'u',disabled:false,sessionExpiresAt:2_000_000})) {
 const sqlite=new DatabaseSync(':memory:');t.after(()=>sqlite.close());sqlite.exec('PRAGMA foreign_keys=ON');
 for(const name of readdirSync(new URL('../../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL(`../../drizzle/${name}`,import.meta.url),'utf8'));
 sqlite.exec("INSERT INTO users(id,external_auth_id,name,driver_priority,created_at) VALUES ('u','test-u','Test U',1,1),('other','test-o','Test O',2,1)");
 sqlite.exec("INSERT INTO vehicles(id,display_name,created_at) VALUES ('v','Test V',1),('other-v','Other V',1)");
 sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('u','v')");
 sqlite.exec("INSERT INTO trips(id,vehicle_id,created_by,updated_at,started_at,ended_at,distance_km,route_type,distance_source) VALUES ('t','v','u',1,100,200,20,'estimated','manual'),('other-t','other-v','other',1,100,200,20,'estimated','manual')");
 class Statement {
  constructor(sql,params=[]){this.sql=sql;this.params=params;}
  bind(...params){return new Statement(this.sql,params);}
  async first(){return sqlite.prepare(this.sql).get(...this.params)??null;}
  async all(){return {results:sqlite.prepare(this.sql).all(...this.params)};}
  runSync(){const statement=sqlite.prepare(this.sql);if(statement.columns().length)return {success:true,results:statement.all(...this.params),meta:{changes:0}};const r=statement.run(...this.params);return {success:true,results:[],meta:{changes:Number(r.changes)}};}
 }
 const db={prepare:sql=>new Statement(sql),batch:async stmts=>{sqlite.exec('BEGIN IMMEDIATE');try{const r=stmts.map(s=>s.runSync());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 return {sqlite,db,service:createTripService(db,resolver,()=>1_000_000)};
}
