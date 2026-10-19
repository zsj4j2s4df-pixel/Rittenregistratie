import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createTripHttpHandler} from '../lib/trip-http.ts';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE??'/usr/bin/chromium',args:['--no-sandbox']});const cleanup=[];
try{
 const {db,sqlite}=setup({after:fn=>cleanup.push(fn)}),origin=process.env.APP_URL??'http://127.0.0.1:4208';const handle=createTripHttpHandler({db,origin,resolveSession:async()=>({userId:'u',disabled:false,sessionExpiresAt:Date.now()+3600000})});
 const insert=sqlite.prepare("INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) VALUES ('u',?,?,'update',?,?,1)");
 function audit(type,index){const data=JSON.stringify(type==='trip'?{revision:index,correction_reason:'Trip audit '+index}:{revision:index,plate:'TEST',addresses:[],rates:[],correction_reason:'Settings audit '+index});insert.run(type,type==='trip'?'t':'v',data,data);}
 for(let index=0;index<125;index++){audit('trip',index);audit('vehicle_settings',index);}
 const page=await browser.newPage();await page.route('**/api/vehicles**',async route=>{const request=route.request(),response=await handle(new Request(request.url(),{method:request.method(),headers:await request.allHeaders(),body:request.postData()??undefined}));await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});});
 await page.goto(origin+'/beheer');const settings=page.getByRole('region',{name:'Instellingenhistorie',exact:true});await settings.getByText('Reden: Settings audit 124',{exact:true}).waitFor();assert.equal(await settings.locator('ol > li').count(),50);
 await page.getByRole('button',{name:'Rit corrigeren',exact:true}).click();const trip=page.locator('section').filter({has:page.getByRole('heading',{name:'Rit corrigeren en historie',exact:true})}).last();await trip.getByText('Reden: Trip audit 124',{exact:true}).waitFor();assert.equal(await trip.locator('ol > li').count(),100);
 audit('trip',125);audit('vehicle_settings',125);
 await settings.getByRole('button',{name:'Oudere wijzigingen laden',exact:true}).click();await settings.getByText('Reden: Settings audit 25',{exact:true}).waitFor();await settings.getByRole('button',{name:'Oudere wijzigingen laden',exact:true}).click();await settings.getByText('Reden: Settings audit 0',{exact:true}).waitFor();assert.equal(await settings.locator('ol > li').count(),125);assert.equal(await settings.getByText('Reden: Settings audit 125',{exact:true}).count(),0);
 await trip.getByRole('button',{name:'Oudere wijzigingen laden',exact:true}).click();await trip.getByText('Reden: Trip audit 0',{exact:true}).waitFor();assert.equal(await trip.locator('ol > li').count(),125);
 await settings.getByRole('button',{name:'Instellingenhistorie vernieuwen',exact:true}).click();await settings.getByText('Reden: Settings audit 125',{exact:true}).waitFor();assert.equal(await settings.locator('ol > li').count(),50);
 await trip.getByRole('button',{name:'Historie vernieuwen',exact:true}).click();await trip.getByText('Reden: Trip audit 125',{exact:true}).waitFor();assert.equal(await trip.locator('ol > li').count(),100);
 sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");for(const section of [settings,trip]){await section.getByRole('button',{name:'Oudere wijzigingen laden',exact:true}).click();await section.getByRole('alert').filter({hasText:'Geen toegang tot dit voertuig.'}).waitFor();assert.equal(await section.locator('ol > li').count(),0);}
 console.log('PASS history browser: 125 items/type via keyset pages, new insert does not shift older pages, refresh resets to newest, revoked access clears both histories. Synthetic identity/SQLite.');
}finally{await browser.close();for(const fn of cleanup)fn();}
