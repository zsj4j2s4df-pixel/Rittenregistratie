import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {setup} from './helpers/trip-fixture.mjs';
import {createTripHttpHandler} from '../lib/trip-http.ts';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE),origin=process.env.APP_URL??'http://127.0.0.1:4192';
const out=process.env.ARTIFACT_DIR;mkdirSync(out,{recursive:true});const cleanup=[],f=setup({after:fn=>cleanup.push(fn)});
await f.service.create('v',{requestId:'logo-review-business-test-01',startedAt:Date.parse('2026-10-24T08:00:00Z')/1000,endedAt:Date.parse('2026-10-24T08:25:00Z')/1000,distanceKm:18.5,startAddress:'Voorbeeld kantoor',endAddress:'Voorbeeld klant',classification:'business',driverId:'u',odometerStart:0,odometerEnd:18.5,purpose:'Synthetisch',reason:'Lokale logocontrole'});
const handler=createTripHttpHandler({db:f.db,origin,resolveSession:async()=>({userId:'u',disabled:false,sessionExpiresAt:Date.now()+3600000})});
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox']});
try{const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(15000);await page.route('**/api/vehicles**',async route=>{const q=route.request(),r=await handler(new Request(q.url(),{method:q.method(),headers:await q.allHeaders(),body:q.postData()??undefined}));await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});});
 for(const theme of ['dark','sand']){await page.addInitScript(v=>localStorage.setItem('ritkompas.appearance.v1',v),theme==='sand'?'Desert':'Anthracite');
  for(const[w,h]of [[375,812],[390,844],[844,390],[1280,800],[1440,1000],[1920,1080]]){await page.setViewportSize({width:w,height:h});await page.goto(origin+'/ritten?maand=2026-10');await page.getByRole('heading',{name:'Rittenlijst',exact:true}).waitFor();await page.locator('.web-segments .rk-business-logo').evaluate(img=>img.decode());assert.equal(await page.locator('.rk-business-logo').count(),2);for(const img of await page.locator('.rk-business-logo').all()){const x=await img.evaluate(e=>({background:getComputedStyle(e).backgroundColor,width:e.naturalWidth,loaded:e.complete}));assert.equal(x.background,'rgba(0, 0, 0, 0)');assert.equal(x.width,1040);assert.equal(x.loaded,true);}assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);if(w===390||w===1440){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:out+`/business-${theme}-${w}.png`,fullPage:true,animations:'disabled'});}}
  await page.getByRole('button',{name:'Zakelijk',exact:true}).click();assert.equal(await page.locator('.web-trip-card').count(),1);await page.getByRole('button',{name:'Privé',exact:true}).click();assert.equal(await page.locator('.web-trip-card').count(),0);
 }
 await context.close();console.log('PASS transparent business logo in filter+trip cards, both themes/six sizes, no white background/overflow, business/private filters remain functional. Synthetic local data, not live iPhone.');
}finally{await browser.close();for(const fn of cleanup)fn();}
