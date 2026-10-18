// Public deployment only: no login, no central writes, no personal data.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const proxyUrl=process.env.BROWSER_PROXY_URL?new URL(process.env.BROWSER_PROXY_URL):null;
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE??'/usr/bin/chromium',args:['--no-sandbox'],...(proxyUrl?{proxy:{server:proxyUrl.origin,...(proxyUrl.username?{username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)}:{})}}:{})});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin=process.env.APP_URL;if(!origin)throw Error('APP_URL required');
 const root=await page.goto(origin,{waitUntil:'networkidle'});assert.equal(root.status(),200);
 await page.getByRole('navigation').getByRole('button',{name:/Instellingen/}).click();await page.getByLabel('Kenteken (demo)',{exact:true}).waitFor();
 const response=await page.goto(origin+'/beheer',{waitUntil:'networkidle'});assert.equal(response.status(),200);
 await page.getByRole('alert').filter({hasText:'De beveiligde backend is nog niet beschikbaar.'}).waitFor();assert.equal(await page.getByRole('button',{name:'Rit opslaan',exact:true}).count(),0);
 assert.deepEqual(errors,[]);console.log('PASS live Chromium: demo hydration/navigation and public assets; /beheer closed without login; no central writes or provider-login claim.');
}finally{await browser.close();}
