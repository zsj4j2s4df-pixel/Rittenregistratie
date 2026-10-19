import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/trip-fixture.mjs';
import { createCloudflareAccessResolver } from '../lib/cloudflare-access.ts';
const issuer='https://synthetic-team.cloudflareaccess.com',audience='synthetic-app',now=1_000_000;
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'synthetic-key',alg:'RS256',use:'sig'};
const claims={iss:issuer,aud:[audience],exp:2000,iat:900,nbf:900,type:'app',sub:'synthetic-sub',email:'synthetic@example.test'};
const encode=value=>Buffer.from(typeof value==='string'?value:JSON.stringify(value)).toString('base64url');
async function token(values={},header={}){const message=encode({alg:'RS256',kid:jwk.kid,typ:'JWT',...header})+'.'+encode({...claims,...values});return message+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(message))).toString('base64url');}
const request=jwt=>new Request('https://ritkompas.example',{headers:jwt?{'cf-access-jwt-assertion':jwt}:{'cf-access-authenticated-user-email':claims.email,'oai-authenticated-user-id':'u'}});
function resolver(t,extra={}){const {db,sqlite}=setup(t);sqlite.prepare("UPDATE users SET external_auth_id=? WHERE id='u'").run(JSON.stringify([issuer,claims.sub]));let calls=0;const resolve=createCloudflareAccessResolver({db,issuer,audience,clock:()=>now,fetcher:async url=>{calls++;assert.equal(url,issuer+'/cdn-cgi/access/certs');return Response.json({keys:[jwk]});},...extra});return {resolve,sqlite,calls:()=>calls};}
test('signed Access app identity maps to explicit internal subject; JWKS cached and no email auto-provision',async t=>{
 const {resolve,calls}=resolver(t);const jwt=await token();assert.deepEqual(await resolve(request(jwt)),{userId:'u',sessionExpiresAt:2_000_000,disabled:false});assert.ok(await resolve(request(jwt)));assert.equal(calls(),1);assert.equal(await resolve(request(await token({sub:'unknown',email:claims.email}))),null);
});
test('forged identity headers, tampered signature and wrong algorithm never authenticate',async t=>{
 const {resolve}=resolver(t);assert.equal(await resolve(request()),null);const jwt=await token();const parts=jwt.split('.');parts[1]=encode({...claims,sub:'other'});assert.equal(await resolve(request(parts.join('.'))),null);assert.equal(await resolve(request(await token({}, {alg:'HS256'}))),null);assert.equal(await resolve(request(await token({}, {crit:['unknown']}))),null);
});
test('issuer, audience, expiration, not-before and app-user claims are validated',async t=>{
 const {resolve}=resolver(t);for(const patch of [{iss:'https://evil.example'},{aud:['other']},{aud:audience},{exp:1000},{exp:'2000'},{nbf:1001},{iat:1001},{sub:''},{type:'service'},{email:''}])assert.equal(await resolve(request(await token(patch))),null,JSON.stringify(patch));
});
test('unknown/duplicate keys, unavailable or oversized JWKS fail closed',async t=>{
 for(const keys of [[],[jwk,jwk]]){const {resolve}=resolver(t,{fetcher:async()=>Response.json({keys})});assert.equal(await resolve(request(await token())),null);}
 const unavailable=resolver(t,{fetcher:async()=>{throw Error('network');}});assert.equal(await unavailable.resolve(request(await token())),null);
 const oversized=resolver(t,{fetcher:async()=>new Response('x'.repeat(65537))});assert.equal(await oversized.resolve(request(await token())),null);
});
test('disabled internal user is rejected despite a valid token; key rotation refreshes after bounded cache',async t=>{
 let time=now,calls=0;const {resolve,sqlite}=resolver(t,{clock:()=>time,fetcher:async()=>{calls++;return Response.json({keys:[jwk]});}});const jwt=await token();assert.ok(await resolve(request(jwt)));time+=61_000;assert.ok(await resolve(request(jwt)));assert.equal(calls,2);sqlite.exec("UPDATE users SET disabled=1 WHERE id='u'");assert.equal(await resolve(request(jwt)),null);
});
test('fixed team issuer required; malformed inputs cannot choose JWKS hosts',async t=>{
 const {db}=setup(t);for(const bad of ['https://evil.example','http://team.cloudflareaccess.com','https://team.cloudflareaccess.com/','https://team.cloudflareaccess.com@evil.example'])assert.throws(()=>createCloudflareAccessResolver({db,issuer:bad,audience}));
 const {resolve,calls}=resolver(t);for(const value of ['a.b.c','a'.repeat(17000),'aaa.bbb'])assert.equal(await resolve(request(value)),null);assert.equal(calls(),0);
});
test('cookie-only browser app JWT uses the same signature/claims/internal mapping gates',async t=>{
 const {resolve,sqlite}=resolver(t),jwt=await token();const cookie=value=>new Request('https://ritkompas.example/api/vehicles',{headers:{cookie:'theme=sand; CF_Authorization='+value}});
 assert.deepEqual(await resolve(cookie(jwt)),{userId:'u',sessionExpiresAt:2000000,disabled:false});
 for(const patch of [{aud:['wrong-app']},{iss:'https://other.cloudflareaccess.com'},{exp:1000},{type:'org'},{sub:'unknown'}])assert.equal(await resolve(cookie(await token(patch))),null);
 const parts=jwt.split('.');parts[1]=encode({...claims,sub:'forged'});assert.equal(await resolve(cookie(parts.join('.'))),null);
 assert.equal(await resolve(new Request('https://ritkompas.example',{headers:{cookie:'CF_Authorization='+jwt,'cf-access-jwt-assertion':'invalid.header.value'}})),null);
 sqlite.exec("UPDATE users SET disabled=1 WHERE id='u'");assert.equal(await resolve(cookie(jwt)),null);
});
