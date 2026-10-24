// Anonymous read-only checks. Never log in, send email or write trip data.
import assert from 'node:assert/strict';
const origin=process.env.APP_URL;
if(!origin)throw Error('APP_URL required');
for(const path of ['/login','/hulp']){
 const r=await fetch(origin+path,{redirect:'manual',cache:'no-store'});assert.equal(r.status,200);assert.equal(r.headers.get('location'),null);const html=await r.text();assert.match(html,/ritkompas-mark-approved.png/);
 if(path==='/login'){assert.ok(html.indexOf('name="remember"')<html.indexOf('name="email"'));assert.match(html,/href="\/hulp"/);assert.doesNotMatch(html,/name="remember"[^>]*checked/);}
 else for(const s of ['Zo start je met RitKompas','Spam','Zet op beginscherm','Voeg toe aan Dock','nog niet allemaal af en op echte toestellen getest'])assert.ok(html.includes(s),s);
 console.log('PASS live public route '+path);
}
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const failures=[];page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),new URL(r.url()).pathname);});
 await page.goto(origin+'/login');await page.waitForFunction(()=>document.querySelector('input[name=email]')?.disabled===false);
 const remember=page.getByLabel('Ingelogd blijven op dit eigen apparaat');assert.equal(await remember.isChecked(),false);await remember.check();assert.equal(await remember.isChecked(),true);await remember.uncheck();assert.equal(new URL(page.url()).pathname,'/login');
 await page.getByRole('link',{name:'Hulp bij starten en op je beginscherm zetten'}).click();try{await page.getByRole('heading',{name:'Zo start je met RitKompas'}).waitFor({timeout:10000});}catch(e){console.log('Navigation diagnostics',new URL(page.url()).pathname,failures,await page.locator('main').innerText());throw e;}assert.equal(await page.locator('ol').first().evaluate(el=>getComputedStyle(el).listStyleType),'decimal');
 for(const[width,height]of [[375,812],[390,844],[844,390],[1440,1000]]){await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.getByRole('link',{name:'Open RitKompas',exact:true}).click();await page.waitForURL('**/login');assert.deepEqual(failures,[]);
 console.log('PASS live anonymous Chrome: login ready, unchecked/toggleable opt-in, help navigation and numbered responsive guide; no runtime errors. No personal credentials, email or iPhone test.');
}finally{await browser.close();}
