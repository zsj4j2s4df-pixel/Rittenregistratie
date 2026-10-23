// Actual Chromium UI -> real SQLite/shared HTTP, synthetic identity only.
import assert from 'node:assert/strict';
import {setup} from './helpers/trip-fixture.mjs';import {createTripHttpHandler} from '../lib/trip-http.ts';import {createSettingsService} from '../lib/settings-service.ts';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const origin=process.env.APP_URL??'http://127.0.0.1:4191';const cleanup=[];
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Amsterdam'}),page=await context.newPage();
 const f=setup({after:fn=>cleanup.push(fn)});let principal={userId:'u',disabled:false,sessionExpiresAt:Date.now()+3600000};
 const service=createSettingsService(f.db,async()=>principal),handle=createTripHttpHandler({db:f.db,origin,resolveSession:async()=>principal});
 await page.route('**/api/vehicles**',async route=>{const req=route.request(),r=await handle(new Request(req.url(),{method:req.method(),headers:await req.allHeaders(),body:req.postData()??undefined}));await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});});
 await page.goto(origin+'/beheer');await page.getByRole('heading',{name:'Opgeslagen ritten',exact:true}).waitFor();
 for(const kind of ['business','private'])for(let n=0;n<2;n++){
  await page.getByRole('button',{name:kind==='business'?'+ Zakelijke locatie toevoegen':'+ Privélocatie toevoegen',exact:true}).click();
  await page.getByLabel('Naam voorkeursadres',{exact:true}).fill('Fixture '+kind+' '+n);
  await page.getByLabel('Voorkeursadres',{exact:true}).fill('Synthetic '+kind+' '+n);
  if(kind==='business')await page.getByLabel('Zakelijke relatie',{exact:true}).selectOption(n?'supplier':'customer');
  await page.getByLabel('Reden adres- of tariefwijziging',{exact:true}).fill('Synthetic '+kind+' '+n);
  await page.getByRole('button',{name:'Voorkeursadres toevoegen',exact:true}).click();
  await page.locator('.setting-card strong').filter({hasText:'Fixture '+kind+' '+n}).waitFor();
 }
 const saved=await service.get('v');assert.equal(saved.addresses.length,4);assert.equal(saved.addresses.filter(a=>a.kind==='private').length,2);
 // Geometry is browser evidence only, not physical Safari/iPhone acceptance.
 for(const [width,height] of [[375,812],[390,844],[844,390],[1280,800],[1440,900],[1920,1080]]){
  await page.setViewportSize({width,height});
  const geometry=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,
   controls:[...document.querySelectorAll('input[type=date],input[type=datetime-local]')].map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,height:e.getBoundingClientRect().height}))}));
  assert.ok(geometry.document<=geometry.viewport+1,`${width}: horizontal document overflow`);
  for(const control of geometry.controls){assert.ok(control.left>=-1&&control.right<=width+1,`${width}: date control overflow`);assert.ok(control.height>=44,`${width}: small date control`);}
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Licht thema',exact:true}).click();await page.reload();await page.locator('.central-shell.sand').waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('ritkompas.appearance.v1')),'Desert');
 const business=saved.addresses.find(a=>a.businessRole==='customer'),personal=saved.addresses.find(a=>a.kind==='private');
 await page.getByLabel('Vertrek',{exact:true}).fill('2026-10-21T09:00');await page.getByLabel('Aankomst',{exact:true}).fill('2026-10-21T09:30');
 await page.getByLabel('Classificatie',{exact:true}).selectOption('review');
 await page.getByLabel('Vertrekadres uit centrale locaties',{exact:true}).selectOption(business.id);await page.getByLabel('Aankomstadres uit centrale locaties',{exact:true}).selectOption(personal.id);
 assert.equal(await page.getByLabel('Vertrekadres',{exact:true}).inputValue(),business.address);assert.equal(await page.getByLabel('Classificatie',{exact:true}).inputValue(),'review');
 await page.getByLabel('Afstand (km)',{exact:true}).fill('12');await page.getByLabel('Reden handmatige invoer',{exact:true}).fill('Synthetic selected address snapshot');await page.getByRole('button',{name:'Rit opslaan',exact:true}).click();await page.getByRole('status').filter({hasText:'Rit centraal opgeslagen'}).waitFor();
 assert.equal(await page.getByLabel('Vertrekadres',{exact:true}).inputValue(),'');
 const trip=f.sqlite.prepare("SELECT * FROM trips WHERE start_address=?").get(business.address);assert.equal(trip.end_address,personal.address);assert.equal(trip.classification,'review');assert.equal(trip.distance_km,12);
 const current=await service.get('v');await service.save('v',{...current,addresses:current.addresses.filter(a=>a.id!==business.id).map(a=>({...a,label:a.label+' renamed'})),reason:'Synthetic rename/delete',requestId:'browser-address-delete-0001'});
 await page.getByRole('button',{name:'Gegevens vernieuwen',exact:true}).click();assert.equal(f.sqlite.prepare('SELECT start_address FROM trips WHERE id=?').get(trip.id).start_address,business.address);
 await page.getByLabel('Vertrekadres uit centrale locaties',{exact:true}).locator('option').filter({hasText:'Fixture business 0'}).waitFor({state:'detached'});
 principal=null;await page.getByRole('button',{name:'Gegevens vernieuwen',exact:true}).click();await page.locator('p.demo-banner[role=alert]').filter({hasText:'Aanmelden vereist'}).waitFor();await page.getByLabel('Vertrekadres uit centrale locaties',{exact:true}).waitFor({state:'detached'});assert.equal(await page.getByLabel('Vertrekadres uit centrale locaties',{exact:true}).count(),0);assert.equal(await page.locator('.setting-card strong').count(),0);
 console.log('PASS Chromium/mobile -> real HTTP/SQLite: two locations per kind, customer/supplier, exact scoped IDs, central readback, Desert reload, six widths375/390/844/1280/1440/1920 without horizontal/date overflow and44px date controls, explicit address selection without classification/distance changes, frozen trip text after rename/delete, logout hides address forms. Synthetic only; NOT native/iPhone/live Access.');
}finally{await browser.close();for(const fn of cleanup)fn();}
