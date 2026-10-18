import test from 'node:test';
import assert from 'node:assert/strict';
import { createConfiguredApi } from '../lib/server-handler.ts';
const request=()=>new Request('https://ritkompas.example/api/vehicles/v/trips');
const db={prepare(){throw Error('must not access DB without verified session');},batch(){throw Error('must not mutate');}};
const config={DB:db,APP_ORIGIN:'https://ritkompas.example',ACCESS_ISSUER:'https://synthetic-team.cloudflareaccess.com',ACCESS_AUDIENCE:'synthetic-audience'};
test('missing binding/origin/issuer/audience fail closed with no private configuration detail',async()=>{
 for(const key of Object.keys(config)){const bindings={...config};delete bindings[key];const r=await createConfiguredApi(bindings)(request());assert.equal(r.status,503);assert.equal(r.headers.get('cache-control'),'no-store');assert.doesNotMatch(await r.text(),/synthetic|cloudflareaccess|audience|must not/);}
 assert.equal((await createConfiguredApi({})(request())).status,503);
});
test('malformed configuration is unavailable rather than falling back to demo or request origin',async()=>{
 for(const patch of [{APP_ORIGIN:'http://public.example'},{APP_ORIGIN:'https://ritkompas.example/path'},{ACCESS_ISSUER:'https://evil.example'},{DB:{}}])assert.equal((await createConfiguredApi({...config,...patch})(request())).status,503);
});
test('configured API still requires cryptographically verified identity; forged headers are denied before DB',async()=>{
 const handle=createConfiguredApi(config);const r=await handle(new Request(request(),{headers:{'oai-authenticated-user-id':'u','cf-access-authenticated-user-email':'synthetic@example.test','cf-access-jwt-assertion':'bad.token.value'}}));assert.equal(r.status,401);assert.equal((await handle(request())).status,401);
});
test('configured API keeps exact origin boundary and method restrictions without a live account',async()=>{
 const handle=createConfiguredApi(config);assert.equal((await handle(new Request('https://evil.example/api/vehicles/v/trips'))).status,403);assert.equal((await handle(new Request(request(),{method:'DELETE'}))).status,405);
});
