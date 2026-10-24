// Browser UX only, auth responses mocked. Real service/SQLite and built runtime
// are verified separately in supabase-auth.test / supabase-built-worker-smoke.
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'/workspace/scratch/ritkompas-browser/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE??'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const origin=process.env.APP_URL??'http://127.0.0.1:4191',context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();const calls=[];
 await page.route('**/api/auth/**',async route=>{const r=route.request(),action=new URL(r.url()).pathname.split('/').pop(),body=r.postDataJSON();calls.push({action,body});await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(action==='status'?{provider:'supabase',authenticated:false}:{message:'Controleer je e-mail.',viewerId:'synthetic'})});});
 await page.route('**/api/vehicles**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"vehicles":[]}'}));
 await page.goto(origin+'/login');await page.getByRole('button',{name:'Inloggen',exact:true}).waitFor();await page.getByRole('button',{name:'Inloggen',exact:true}).isEnabled();
 const remember=page.getByLabel('Ingelogd blijven op dit eigen apparaat');assert.equal(await remember.isChecked(),false);assert.ok(await remember.evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('input[name=email]'))&Node.DOCUMENT_POSITION_FOLLOWING)));assert.equal(await remember.getAttribute('aria-describedby'),'remember-help');
 // Typing/autofill-like filling and toggling the preference never submits the form.
 await page.locator('form').first().getByLabel('E-mailadres',{exact:true}).fill('synthetic@example.test');await page.locator('form').first().getByLabel('Wachtwoord',{exact:true}).fill('synthetic-password-only');await remember.check();await remember.uncheck();assert.equal(calls.filter(c=>c.action==='login').length,0);
 await page.locator('form').first().getByRole('button',{name:'Inloggen',exact:true}).click();await page.waitForURL('**/ritten');assert.equal(calls.find(c=>c.action==='login').body.remember,false);calls.length=0;await page.goto(origin+'/login');
 await page.getByText('Wachtwoord vergeten',{exact:true}).click();const recoveryForm=page.locator('details form');await recoveryForm.getByLabel('E-mailadres',{exact:true}).fill('synthetic@example.test');await recoveryForm.getByRole('button',{name:'Stuur herstellink'}).click();await page.getByRole('status').filter({hasText:'Controleer je e-mail.'}).waitFor();assert.equal(calls.find(c=>c.action==='recover').body.email,'synthetic@example.test');
 const login=page.locator('form').first();await login.getByLabel('E-mailadres',{exact:true}).fill('synthetic@example.test');await login.getByLabel('Wachtwoord',{exact:true}).fill('synthetic-password-only');await login.getByLabel('Ingelogd blijven op dit eigen apparaat').check();await login.getByRole('button',{name:'Inloggen',exact:true}).click();await page.waitForURL('**/ritten');assert.equal(calls.find(c=>c.action==='login').body.remember,true);
 await page.goto(origin+'/login#type=recovery&access_token=synthetic_token&refresh_token=synthetic_refresh');await page.getByRole('heading',{name:'Kies je wachtwoord'}).waitFor();assert.equal(new URL(page.url()).hash,'');await page.getByLabel('Nieuw wachtwoord',{exact:true}).fill('synthetic-new-password');await page.getByLabel('Herhaal wachtwoord',{exact:true}).fill('synthetic-new-password');await page.getByRole('button',{name:'Wachtwoord opslaan'}).click();await page.getByRole('status').filter({hasText:'Je wachtwoord is ingesteld.'}).waitFor();assert.equal(calls.find(c=>c.action==='password').body.password,'synthetic-new-password');assert.equal(await page.evaluate(()=>localStorage.length),0);
 for(const width of [375,390,844,1440]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.goto(origin+'/hulp');await page.getByRole('heading',{name:'Zo start je met RitKompas'}).waitFor();for(const width of [375,390,844,1280,1440,1920]){await page.setViewportSize({width,height:width===844?390:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}assert.ok(await page.getByText('nog niet allemaal af en op echte toestellen getest',{exact:false}).isVisible());await page.getByRole('link',{name:'Open RitKompas',exact:true}).click();await page.waitForURL('**/login');
 const out=process.env.ARTIFACT_DIR;if(out)mkdirSync(out,{recursive:true});
 for(const theme of ['Anthracite','Desert']){
  await page.addInitScript(v=>localStorage.setItem('ritkompas.appearance.v1',v),theme);
  for(const path of ['/login','/hulp']){
   for(const[width,height]of [[375,812],[390,844],[844,390],[1280,800],[1440,1000],[1920,1080]]){
    await page.setViewportSize({width,height});await page.goto(origin+path);await page.getByRole('heading',{name:path==='/login'?'Aanmelden':'Zo start je met RitKompas',exact:true}).waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(path==='/login'){await page.waitForFunction(()=>document.querySelector('input[name=email]')?.disabled===false);await page.waitForFunction(expected=>document.querySelector('main').classList.contains(expected),theme==='Desert'?'sand':'dark');assert.ok(await page.locator('.rk-remember-choice label').evaluate(el=>el.getBoundingClientRect().height>=44));}
    else assert.equal(await page.locator('ol').first().evaluate(el=>getComputedStyle(el).listStyleType),'decimal');
    if(out&&theme==='Desert'&&(width===390||width===1440))await page.screenshot({path:out+'/'+path.slice(1)+'-'+width+'.png',fullPage:true,animations:'disabled'});
   }
   await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const els=[...document.querySelectorAll('h1,h2,h3,p,label,button,summary,li,a')];const sizes=els.map(el=>parseFloat(getComputedStyle(el).fontSize));els.forEach((el,i)=>el.style.fontSize=sizes[i]*2+'px');});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path+' '+theme+' 200% '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,6).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,40),right:el.getBoundingClientRect().right})))));
  }
 }
 console.log('PASS Chromium login UX: unchecked remember above credentials, fill/toggle does not submit, explicit remember-off/on login, recovery/password/fragment/no token storage; help links and layout, login both themes and six sizes. Synthetic Auth only; OS password-manager auto-submit, live mail/accounts and physical iPhone NOT TESTED.');
}finally{await browser.close();}
