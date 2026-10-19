import {createJourneyChoiceService} from '../lib/journey-choice-service.ts';
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createTripHttpHandler} from '../lib/trip-http.ts';
import {createJourneyHttpHandler} from '../lib/journey-http.ts';
import {createDeviceService} from '../lib/device-service.ts';
import {createDetectionService} from '../lib/detection-service.ts';
import {createJourneyService} from '../lib/journey-service.ts';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE??'/usr/bin/chromium',args:['--no-sandbox']});const cleanup=[];
try{
 const {db,sqlite}=setup({after:fn=>cleanup.push(fn)}),origin=process.env.APP_URL??'http://127.0.0.1:4218';let viewer='u';
 const resolveSession=async()=>({userId:viewer,disabled:false,sessionExpiresAt:Date.now()+3600000}),options={db,origin,resolveSession},trips=createTripHttpHandler(options),journeys=createJourneyHttpHandler(options);
 const device='browser-journey-device-001';await createDeviceService(db,resolveSession).register('v',{id:device,requestId:'browser-journey-register-001',name:'Browser',platform:'web'});
 const obs=await createDetectionService(db,resolveSession).ingest('v',device,{requestId:'browser-journey-source-001',eventId:'browser-journey-event-0001',observedAt:300,source:'manual',kind:'start_candidate'});
 const coordination=await createJourneyService(db,resolveSession).create('v',{requestId:'browser-journey-request-001',deviceId:device,observationId:obs.id});
 const page=await browser.newPage();page.setDefaultTimeout(15000);let loseResponse=true;const submitted=[];
 await page.route('**/api/vehicles**',async route=>{
  const r=route.request(),isChoice=new URL(r.url()).pathname.endsWith('/choice'),headers=await r.allHeaders();
  if(isChoice){assert.equal(headers['x-ritkompas-viewer'],'u');submitted.push(r.postData());}
  const handle=new URL(r.url()).pathname.includes('/journeys')?journeys:trips,response=await handle(new Request(r.url(),{method:r.method(),headers,body:r.postData()??undefined}));
  if(isChoice&&loseResponse){loseResponse=false;await route.abort('failed');return;}
  await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});
 });
 await page.goto(origin+'/beheer');const section=page.getByRole('region',{name:'Centrale voertuigritcontrole'});
 async function review(){await section.getByRole('button',{name:'Voertuigritvoorstellen laden',exact:true}).click();await section.getByRole('button',{name:'Bewijs bekijken',exact:true}).click();await section.getByRole('heading',{name:'Ritbewijs — te controleren',exact:true}).waitFor();}
 const choices=()=>sqlite.prepare('SELECT count(*) AS n FROM journey_choices').get().n;
 await review();assert.ok((await section.textContent()).includes('manual · start_candidate · ongeverifieerde bronclaim'));
 await section.getByRole('button',{name:'Privé kiezen',exact:true}).click();await section.getByRole('alert').waitFor();assert.equal(choices(),1);assert.equal(await section.getByRole('button',{name:'Zakelijk kiezen',exact:true}).isDisabled(),true);
 await section.getByRole('button',{name:'Dezelfde keuze opnieuw proberen',exact:true}).click();await section.getByText(/Gekozen ritsoort: Privé/).waitFor();assert.equal(submitted[0],submitted[1]);assert.equal(choices(),1);assert.equal(await section.getByRole('button',{name:'Dezelfde keuze opnieuw proberen',exact:true}).count(),0);
 assert.equal(sqlite.prepare('SELECT count(*) AS n FROM trips').get().n,2);
 assert.equal(sqlite.prepare("SELECT count(*) AS n FROM audit_logs WHERE entity_type='vehicle_journey' AND action='classify'").get().n,1);
 await createJourneyChoiceService(db,resolveSession).choose('v',coordination.journeyId,{requestId:'browser-other-choice-00001',expectedRevision:1,classification:'business',reason:'Another explicit synthetic reviewer'});
 await section.getByRole('button',{name:'Zakelijk kiezen',exact:true}).click();await section.getByRole('alert').waitFor();assert.equal(choices(),2);assert.equal(await section.getByRole('heading',{name:'Ritbewijs — te controleren',exact:true}).count(),0);
 await review();await section.getByText(/Gekozen ritsoort: Zakelijk/).waitFor();
 viewer='outsider';await section.getByRole('button',{name:'Privé kiezen',exact:true}).click();await section.getByRole('alert').waitFor();assert.equal(choices(),2);assert.equal(await section.getByRole('heading',{name:'Ritbewijs — te controleren',exact:true}).count(),0);
 viewer='u';await review();sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");await section.getByRole('button',{name:'Privé kiezen',exact:true}).click();await section.getByRole('alert').waitFor();assert.equal(choices(),2);assert.equal(await section.getByRole('button',{name:'Bewijs bekijken',exact:true}).count(),0);assert.equal(await section.getByRole('heading',{name:'Ritbewijs — te controleren',exact:true}).count(),0);
 console.log('PASS browser explicit journey choice: exact retry after committed lost response, one receipt/audit, no new trip, stale revision and account switch rejected, revoked access clears evidence. Synthetic identity/SQLite; no live/native claim.');
}finally{await browser.close();for(const fn of cleanup)fn();}
