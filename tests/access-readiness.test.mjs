import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewAccessSetup} from '../lib/access-readiness.ts';
const setup=()=>({origin:'https://rittenregistratie.example.workers.dev', authDomain:'team.cloudflareaccess.com', allowedEmails:['owner@example.invalid'], app:{type:'self_hosted', aud:'actual-app-audience', destinations:[{type:'public', uri:'rittenregistratie.example.workers.dev'}], policies:[{decision:'allow', include:[{email:{email:'owner@example.invalid'}}]}]}});
test('Access preflight produces public binding proposal only for exact host and explicit allowlist', ()=>{
 const input=setup(), r=reviewAccessSetup(input);assert.equal(r.readyForOwnerReview, true);assert.equal(r.bindings.ACCESS_ISSUER, 'https://team.cloudflareaccess.com');assert.equal(r.bindings.ACCESS_AUDIENCE, input.app.aud);assert.match(r.limitation, /geen bewijs/);
});
test('Access preflight rejects broader policies,  overrides,  other hosts and partial API coverage', ()=>{
 for(const change of [s=>s.app.policies[0].include=[{everyone:{}}], s=>s.app.policies[0].decision='bypass', s=>s.app.destinations[0].overrides=[{behavior:'public', path_pattern:'/api/*'}], s=>s.app.destinations[0].uri='other.example.workers.dev', s=>s.app.destinations[0].uri+='/beheer', s=>s.app.destinations=[{type:'all_workers'}], s=>s.app.policies=[], s=>{s.app.domain='rittenregistratie.example.workers.dev';s.app.destinations=[];}]){const input=setup();change(input);const r=reviewAccessSetup(input);assert.equal(r.readyForOwnerReview, false);assert.equal(r.bindings, undefined);}
});
test('Access preflight rejects invalid origins,  fake issuer/audience and unlisted users without logging addresses', ()=>{
 for(const change of [s=>s.origin+='/beheer', s=>s.origin='http://example.invalid', s=>s.authDomain='team.cloudflareaccess.com.attacker.invalid', s=>s.app.aud='', s=>s.allowedEmails=[], s=>s.app.policies[0].include=[{email:{email:'outsider@example.invalid'}}]]){const input=setup();change(input);const r=reviewAccessSetup(input);assert.equal(r.readyForOwnerReview, false);assert.equal(r.bindings, undefined);assert.ok(!JSON.stringify(r).includes('outsider@example.invalid'));}
});
