import test from 'node:test';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createSupabaseAuth,appCookie} from '../lib/supabase-auth.ts';
import {createTripHttpHandler} from '../lib/trip-http.ts';
import {createConfiguredApi} from '../lib/server-handler.ts';
import {createBackendClient} from '../app/backend-client.ts';
const origin='https://ritkompas.example',url='https://abcdefghijklmnopqrst.supabase.co',key='sb_publishable_synthetic_only';
const sub='11111111-1111-4111-8111-111111111111',sid='22222222-2222-4222-8222-222222222222';
const token=(patch={})=>[Buffer.from('{"alg":"ES256"}').toString('base64url'),Buffer.from(JSON.stringify({iss:url+'/auth/v1',aud:'authenticated',role:'authenticated',sub,session_id:sid,exp:2000,...patch})).toString('base64url'),'synthetic_signature'].join('.');
const bindingID='44444444-4444-4444-8444-444444444444',version='55555555-5555-4555-8555-555555555555';
const cookie=jwt=>appCookie+'='+jwt+'; __Host-ritkompas-binding='+bindingID+'.'+version;
const request=(action,body={},headers={})=>new Request(origin+'/api/auth/'+action,{method:'POST',headers:{origin,'content-type':'application/json','x-csrf-protection':'1',...headers},body:JSON.stringify(body)});
function fixture(t,extra={}){
 const {db,sqlite}=setup(t);sqlite.prepare('INSERT INTO auth_identities(issuer,subject,user_id) VALUES(?,?,?)').run(url+'/auth/v1',sub,'u');
 sqlite.prepare('INSERT INTO auth_browser_bindings(id,version,issuer,user_id,session_id) VALUES(?,?,?,?,?)').run(bindingID,version,url+'/auth/v1','u',sid);
 const calls=[];const auth=createSupabaseAuth({db,url,key,origin,clock:()=>1000000,fetcher:async(path,init)=>{
  calls.push({path,init});assert.equal(init.redirect,'manual');assert.equal(init.headers.apikey,key);assert.equal(init.cache,'no-store');
  if(path===url+'/auth/v1/user'&&init.method==='GET'){assert.ok(init.headers.Authorization.startsWith('Bearer '));return Response.json({id:sub,is_anonymous:false,email_confirmed_at:'2026-01-01T00:00:00Z'});}
  if(path.includes('/token?'))return Response.json({access_token:token(),refresh_token:'synthetic_refresh'});
  return Response.json({});
 },...extra});return {auth,db,sqlite,calls};
}
test('Supabase is the remote token verifier; explicit mapping preserves internal user and vehicle scope',async t=>{
 const {auth,db,calls,sqlite}=fixture(t);const req=new Request(origin+'/api/vehicles',{headers:{cookie:cookie(token()),'cf-access-jwt-assertion':'ignored'}});
 assert.deepEqual(await auth.resolveSession(req),{userId:'u',sessionExpiresAt:2000000,disabled:false});assert.equal(calls[0].path,url+'/auth/v1/user');
 const api=createTripHttpHandler({db,origin,resolveSession:auth.resolveSession,clock:()=>1000000});const r=await api(req);assert.equal(r.status,200);assert.deepEqual((await r.json()).vehicles.map(v=>v.id),['v']);
 assert.equal((await api(new Request(origin+'/api/vehicles/other-v/settings',{headers:req.headers}))).status,403);
 sqlite.exec("UPDATE auth_identities SET active=0");assert.equal(await auth.resolveSession(req),null);
});
test('token payload/email alone, failed provider validation, anonymous/unconfirmed and mismatched subjects never grant',async t=>{
 for(const user of [{id:sub,is_anonymous:true,email_confirmed_at:'x'},{id:sub,is_anonymous:false},{id:sid,is_anonymous:false,email_confirmed_at:'x'}]){
  const {auth}=fixture(t,{fetcher:async()=>Response.json(user)});assert.equal(await auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token())}})),null);
 }
 for(const fetcher of [async()=>new Response(null,{status:401}),async()=>new Response(null,{status:302,headers:{location:'https://evil.example'}}),async()=>{throw Error('offline');},async()=>new Response('x'.repeat(40000))]){
  const {auth}=fixture(t,{fetcher});assert.equal(await auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token())}})),null);
 }
});
test('wrong issuer, audience, role, expiry, duplicate cookie and bearer ambiguity fail closed',async t=>{
 const {auth,calls}=fixture(t);
 for(const patch of [{iss:'https://evil.example'},{aud:'other'},{role:'service_role'},{exp:999},{exp:'2000'},{session_id:''},{sub:''}])assert.equal(await auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token(patch))}})),null);
 assert.equal(await auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token())+'; '+cookie(token())}})),null);
 assert.equal(await auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token()),authorization:'Bearer forged'}})),null);assert.equal(calls.length,0);
});
test('login sets only Secure HttpOnly host cookies; remember opt-in persists, ordinary login uses session cookies',async t=>{
 const {auth}=fixture(t);for(const remember of [false,true]){const r=await auth.handle(request('login',{email:'synthetic@example.test',password:'synthetic-password',remember}));assert.equal(r.status,200);const cookies=r.headers.getSetCookie();assert.equal(cookies.length,4);for(const c of cookies){assert.match(c,/Secure; HttpOnly; SameSite=Strict/);assert.equal(c.includes('Max-Age=2592000'),remember);}const value=await r.json();assert.equal(value.viewerId,'u');assert.equal('access_token' in value,false);}
});
test('disabled and unmapped accounts never receive app cookies even with provider success',async t=>{
 const {auth,sqlite}=fixture(t);sqlite.exec('DELETE FROM auth_identities');let r=await auth.handle(request('login',{email:'synthetic@example.test',password:'synthetic-password',remember:true}));assert.equal(r.status,403);assert.equal(r.headers.getSetCookie().length,0);
 sqlite.prepare('INSERT INTO auth_identities(issuer,subject,user_id) VALUES(?,?,?)').run(url+'/auth/v1',sub,'u');sqlite.exec("UPDATE users SET disabled=1 WHERE id='u'");r=await auth.handle(request('login',{email:'synthetic@example.test',password:'synthetic-password',remember:true}));assert.equal(r.status,403);
});
test('CSRF, cross-site, non-JSON, oversized and unknown requests cannot reach provider',async t=>{
 const {auth,calls}=fixture(t);for(const headers of [{origin:'https://evil.example'},{'x-csrf-protection':''},{'sec-fetch-site':'cross-site'},{'content-type':'text/plain'}])assert.ok((await auth.handle(request('login',{},headers))).status>=400);
 assert.equal((await auth.handle(request('login',{password:'x'.repeat(9000)}))).status,413);
 assert.equal((await auth.handle(request('recover',{email:'synthetic@example.test',role:'admin'}))).status,400);assert.equal(calls.length,0);
});
test('login throttling uses atomic SQLite counters and never stores raw IP/email/password',async t=>{
 const {auth,sqlite}=fixture(t);for(let i=0;i<12;i++)assert.equal((await auth.handle(request('recover',{email:'synthetic@example.test'},{'cf-connecting-ip':'192.0.2.10'}))).status,200);
 assert.equal((await auth.handle(request('recover',{email:'synthetic@example.test'},{'cf-connecting-ip':'192.0.2.10'}))).status,429);
 const row=sqlite.prepare('SELECT * FROM auth_attempts').get();assert.equal(row.ip_hash.length,64);assert.equal(JSON.stringify(row).includes('192.0.2.10'),false);
});
test('refresh rotates server-only cookies and authenticates/remaps the newly issued subject',async t=>{
 const {auth,calls}=fixture(t);const r=await auth.handle(request('refresh',{}, {cookie:cookie(token())+'; __Host-ritkompas-refresh=synthetic_refresh; __Host-ritkompas-remember=yes'}));assert.equal(r.status,200);assert.match(calls[0].path,/grant_type=refresh_token$/);assert.equal(r.headers.getSetCookie().length,4);
 const mismatch=await auth.handle(request('refresh',{}, {cookie:cookie(token({sub:sid}))+'; __Host-ritkompas-refresh=synthetic_refresh'}));assert.equal(mismatch.status,409);
});
test('logout revokes the app session across old tokens/refresh, clears cookies, leaves other sessions alone',async t=>{
 const {auth,sqlite}=fixture(t);const headers={cookie:cookie(token())};assert.equal((await auth.handle(request('logout',{},headers))).status,200);assert.equal(await auth.resolveSession(new Request(origin,{headers})),null);
 const r=await auth.handle(request('refresh',{}, {cookie:cookie(token())+'; __Host-ritkompas-refresh=synthetic_refresh'}));assert.equal(r.status,403);
 sqlite.prepare('INSERT INTO auth_browser_bindings VALUES(?,?,?,?,?)').run(bindingID,version,url+'/auth/v1','u','33333333-3333-4333-8333-333333333333');assert.ok(await auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token({session_id:'33333333-3333-4333-8333-333333333333'}))}})));assert.equal(sqlite.prepare('SELECT count(*) n FROM auth_session_revocations').get().n,1);
});
test('password recovery sends fixed redirect, keeps enumeration generic, and requires verified mapping to change password',async t=>{
 const {auth,calls}=fixture(t);assert.equal((await auth.handle(request('recover',{email:'synthetic@example.test'}))).status,200);assert.equal(calls[0].path,url+'/auth/v1/recover?redirect_to='+encodeURIComponent(origin+'/login'));
 assert.equal((await auth.handle(request('password',{password:'synthetic-new-password'}))).status,401);
 assert.equal((await auth.handle(request('password',{password:'synthetic-new-password'},{cookie:cookie(token())}))).status,200);
 assert.equal((await auth.handle(request('recovery',{accessToken:token(),refreshToken:'synthetic_refresh'}))).status,200);
});
test('provider selection remains closed: absent/invalid Supabase config never falls back to Access',async t=>{
 const {db}=setup(t);for(const extra of [{AUTH_PROVIDER:'supabase'},{AUTH_PROVIDER:'wrong'}]){const api=createConfiguredApi({db,APP_ORIGIN:origin,ACCESS_ISSUER:'https://synthetic.cloudflareaccess.com',ACCESS_AUDIENCE:'synthetic',...extra});assert.equal((await api(new Request(origin+'/api/vehicles'))).status,503);}
 for(const bad of ['http://abcdefghijklmnopqrst.supabase.co','https://evil.example','https://abcdefghijklmnopqrst.supabase.co/'])assert.throws(()=>createSupabaseAuth({db,url:bad,key,origin}));
 assert.throws(()=>createSupabaseAuth({db,url,key:'sb_secret_forbidden',origin}));
});
test('client refreshes once for reads but never automatically replays a write',async()=>{
 let reads=0,refreshes=0,writes=0;const client=createBackendClient(async(path,init)=>{if(path==='/api/auth/refresh'){refreshes++;return Response.json({});}if(init.method==='GET'){reads++;return reads===1?Response.json({error:'expired'},{status:401}):Response.json({vehicles:[]});}writes++;return Response.json({error:'expired'},{status:401});});
 assert.deepEqual(await client.vehicles(),[]);assert.equal(refreshes,1);assert.equal(reads,2);await assert.rejects(()=>client.createTrip('v',{},'u'),e=>e.status===401);assert.equal(writes,1);assert.equal(refreshes,1);
});
test('logout after access expiry refreshes only to revoke, never leaves a remembered session silently usable',async t=>{
 const {auth,sqlite}=fixture(t);const r=await auth.handle(request('logout',{}, {cookie:cookie(token({exp:999}))+'; __Host-ritkompas-refresh=synthetic_refresh'}));assert.equal(r.status,200);assert.equal((await r.json()).providerRevoked,true);assert.equal(sqlite.prepare('SELECT count(*) n FROM auth_session_revocations').get().n,1);assert.equal(await auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token())}})),null);
});
test('concurrent logout/revocation while provider verification is pending closes the returning request',async t=>{
 let release;const gate=new Promise(r=>{release=r;});const {auth,sqlite}=fixture(t,{fetcher:async()=>{await gate;return Response.json({id:sub,is_anonymous:false,email_confirmed_at:'x'});}});
 const pending=auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token())}}));await new Promise(r=>setTimeout(r,0));sqlite.prepare('INSERT INTO auth_session_revocations VALUES(?,?,?)').run(url+'/auth/v1',sid,1000000);release();assert.equal(await pending,null);
});
test('additive auth upgrade preserves filled legacy users, trips, audits, reports, settings and receipts byte-for-byte',async t=>{
 const {db,sqlite}=setup(t);sqlite.exec('DROP TABLE auth_browser_bindings; DROP TABLE auth_attempts; DROP TABLE auth_identities; DROP TABLE auth_session_revocations');
 const names=sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r=>r.name);
 const before=new Map(names.map(name=>[name,JSON.stringify(sqlite.prepare('SELECT * FROM "'+name+'" ORDER BY rowid').all())]));
 const {readFileSync}=await import('node:fs');sqlite.exec(readFileSync(new URL('../drizzle/0017_supabase_identities.sql',import.meta.url),'utf8'));
 for(const name of names)assert.equal(JSON.stringify(sqlite.prepare('SELECT * FROM "'+name+'" ORDER BY rowid').all()),before.get(name),name);
 assert.equal(sqlite.prepare('PRAGMA integrity_check').get().integrity_check,'ok');assert.deepEqual(sqlite.prepare('PRAGMA foreign_key_check').all(),[]);
 await assert.rejects(()=>db.batch([db.prepare('INSERT INTO auth_identities(issuer,subject,user_id) VALUES(?,?,?)').bind(url+'/auth/v1',sub,'missing-user')]));
});
test('late refresh cannot restore account A after explicit login to account B in the same browser context',async t=>{
 const other='66666666-6666-4666-8666-666666666666',otherSID='77777777-7777-4777-8777-777777777777';let release,started;
 const gate=new Promise(r=>{release=r;}),ready=new Promise(r=>{started=r;});
 const {auth,sqlite}=fixture(t,{fetcher:async(path,init)=>{
  if(path.includes('grant_type=refresh_token')){started();await gate;return Response.json({access_token:token(),refresh_token:'synthetic_refresh'});}
  if(path.includes('grant_type=password'))return Response.json({access_token:token({sub:other,session_id:otherSID}),refresh_token:'synthetic_other_refresh'});
  const c=JSON.parse(Buffer.from(init.headers.Authorization.split(' ')[1].split('.')[1],'base64url'));return Response.json({id:c.sub,is_anonymous:false,email_confirmed_at:'x'});
 }});sqlite.prepare('INSERT INTO auth_identities(issuer,subject,user_id) VALUES(?,?,?)').run(url+'/auth/v1',other,'other');
 const old=cookie(token())+'; __Host-ritkompas-refresh=synthetic_refresh';const pending=auth.handle(request('refresh',{}, {cookie:old}));await ready;
 const login=await auth.handle(request('login',{email:'other@example.test',password:'synthetic-password',remember:true},{cookie:old}));assert.equal(login.status,200);const next=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');release();const late=await pending;assert.equal(late.status,409);assert.equal(late.headers.getSetCookie().length,0);
 assert.equal(await auth.resolveSession(new Request(origin,{headers:{cookie:old}})),null);assert.equal((await auth.resolveSession(new Request(origin,{headers:{cookie:next}}))).userId,'other');
 assert.equal((await auth.handle(request('password',{password:'synthetic-new-password'},{cookie:old}))).status,401);
});
test('password change revokes other app sessions and writes only a redacted audit event',async t=>{
 const {auth,sqlite}=fixture(t),otherSID='88888888-8888-4888-8888-888888888888';sqlite.prepare('INSERT INTO auth_browser_bindings VALUES(?,?,?,?,?)').run('99999999-9999-4999-8999-999999999999',version,url+'/auth/v1','u',otherSID);
 const r=await auth.handle(request('password',{password:'synthetic-new-password'},{cookie:cookie(token())}));assert.equal(r.status,200);assert.ok(sqlite.prepare('SELECT 1 FROM auth_session_revocations WHERE session_id=?').get(otherSID));assert.equal(sqlite.prepare('SELECT count(*) n FROM auth_browser_bindings').get().n,1);
 const audit=sqlite.prepare("SELECT * FROM audit_logs WHERE action='auth_password_changed'").get();assert.equal(audit.actor_id,'u');assert.equal(audit.new_value_json,'{"passwordChanged":true,"otherAppSessionsRevoked":true}');assert.equal(audit.old_value_json,null);assert.ok(await auth.resolveSession(new Request(origin,{headers:{cookie:cookie(token())}})));
});
