// Run against the built local app WITHOUT real Access configuration.
import assert from 'node:assert/strict';
const origin=process.env.APP_URL??'http://127.0.0.1:4182';
for(const path of ['trips','settings','reports','reports/synthetic/csv']){
 const r=await fetch(origin+'/api/vehicles/synthetic/'+path);assert.equal(r.status,503,path);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');const body=await r.json();assert.equal(body.error,'De beveiligde backend is nog niet beschikbaar.');
}
const write=await fetch(origin+'/api/vehicles/synthetic/trips',{method:'POST',headers:{origin,'content-type':'application/json','x-csrf-protection':'1','oai-authenticated-user-id':'spoofed'},body:'{}'});assert.equal(write.status,503);
const page=await fetch(origin);assert.equal(page.status,200);assert.match(await page.text(),/RitKompas/);
console.log('PASS built local app: 503/no-store/no private configuration on API reads/writes; demo page 200. No live login/storage claim.');
