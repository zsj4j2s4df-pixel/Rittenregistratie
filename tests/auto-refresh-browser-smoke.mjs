import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';
import {createTripHttpHandler} from '../lib/trip-http.ts';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE??'/usr/bin/chromium',args:['--no-sandbox']});const cleanup=[];
try{
 const {db,sqlite}=setup({after:f=>cleanup.push(f)});sqlite.exec("INSERT INTO vehicle_memberships(user_id,vehicle_id) VALUES ('other','v')");
 const origin=process.env.APP_URL??'http://127.0.0.1:4221';let viewer='u',snapshots=0,holdNext=false,release=null;
 const handle=createTripHttpHandler({db,origin,resolveSession:async()=>({userId:viewer,disabled:false,sessionExpiresAt:Date.now()+3600000})});
 const page=await browser.newPage();page.setDefaultTimeout(15000);await page.clock.install();
 await page.route('**/api/vehicles**',async route=>{
  const r=route.request(),isSnapshot=new URL(r.url()).pathname.endsWith('/snapshot');if(isSnapshot)snapshots++;
  const response=await handle(new Request(r.url(),{method:r.method(),headers:await r.allHeaders(),body:r.postData()??undefined}));
  if(isSnapshot&&holdNext){holdNext=false;await new Promise(resolve=>{release=resolve;});}
  try{await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});}catch{/* A cancelled scoped read must never apply its result. */}
 });
 await page.goto(origin);await page.getByRole('heading',{name:'Opgeslagen ritten',exact:true}).waitFor();
 const toggle=page.getByRole('checkbox',{name:'Automatisch centraal verversen'});assert.equal(await toggle.isChecked(),false);assert.equal(snapshots,1);
 sqlite.exec("UPDATE trips SET start_address='Remote A',end_address='Destination',revision=revision+1 WHERE id='t'");await toggle.check();await page.getByText('Remote A → Destination',{exact:true}).waitFor();assert.equal(snapshots,2);
 await toggle.uncheck();let before=snapshots;await page.clock.fastForward(60000);assert.equal(snapshots,before);
 sqlite.exec("UPDATE trips SET start_address='Remote B',revision=revision+1 WHERE id='t'");await toggle.check();await page.getByText('Remote B → Destination',{exact:true}).waitFor();
 before=snapshots;await page.evaluate(()=>Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'}));await page.clock.fastForward(60000);assert.equal(snapshots,before);
 let resumed=page.waitForResponse(r=>r.url().endsWith('/snapshot'));await page.evaluate(()=>{delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));});await resumed;
 before=snapshots;await page.evaluate(()=>Object.defineProperty(navigator,'onLine',{configurable:true,value:false}));await page.clock.fastForward(60000);assert.equal(snapshots,before);
 resumed=page.waitForResponse(r=>r.url().endsWith('/snapshot'));await page.evaluate(()=>{delete navigator.onLine;window.dispatchEvent(new Event('online'));});await resumed;
 const input=page.getByLabel('Vertrekadres',{exact:true});await input.fill('Unsaved local draft');before=snapshots;sqlite.exec("UPDATE trips SET start_address='Remote C',revision=revision+1 WHERE id='t'");await page.clock.fastForward(60000);await page.getByRole('status').filter({hasText:'onopgeslagen invoer'}).waitFor();assert.equal(snapshots,before);assert.equal(await input.inputValue(),'Unsaved local draft');await page.getByText('Remote B → Destination',{exact:true}).waitFor();
 await input.evaluate(el=>el.form.reset());await page.clock.fastForward(60000);await page.getByText('Remote C → Destination',{exact:true}).waitFor();assert.equal(await input.inputValue(),'');
 sqlite.exec("UPDATE trips SET start_address='Remote D',revision=revision+1 WHERE id='t'");holdNext=true;await page.clock.fastForward(60000);await new Promise((resolve,reject)=>{const deadline=Date.now()+10000;const timer=setInterval(()=>{if(release){clearInterval(timer);resolve();}else if(Date.now()>deadline){clearInterval(timer);reject(Error('Snapshot was not requested'));}},10);});
 await input.fill('Draft during pending refresh');release();release=null;await page.getByRole('status').filter({hasText:'je invoer blijft behouden'}).waitFor();assert.equal(await input.inputValue(),'Draft during pending refresh');assert.equal(await page.getByText('Remote D → Destination',{exact:true}).count(),0);
 await input.evaluate(el=>el.form.reset());viewer='other';await page.clock.fastForward(60000);await page.getByRole('alert').filter({hasText:'Toegang of account is gewijzigd'}).waitFor();assert.equal(await page.getByRole('heading',{name:'Opgeslagen ritten',exact:true}).count(),0);
 viewer='u';await page.getByRole('button',{name:'Opnieuw verbinden',exact:true}).click();await page.getByRole('heading',{name:'Opgeslagen ritten',exact:true}).waitFor();assert.equal(await toggle.isChecked(),false);
 await toggle.check();await page.getByText('Remote D → Destination',{exact:true}).waitFor();sqlite.exec("UPDATE vehicle_memberships SET active=0 WHERE user_id='u'");await page.clock.fastForward(60000);await page.getByRole('alert').filter({hasText:'Toegang of account is gewijzigd'}).waitFor();assert.equal(await page.getByRole('heading',{name:'Opgeslagen ritten',exact:true}).count(),0);
 console.log('PASS browser opt-in coherent refresh: off by default, hidden/offline pause, remote updates, no reads while dirty, in-flight edit race protected, reset resumes, account change/revocation clear data and disable consent. Synthetic HTTP/SQLite; not live multi-iPhone.');
}finally{await browser.close();for(const f of cleanup)f();}
