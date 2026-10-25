import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE),path=resolve(process.argv[2]);
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox']});
try{
 const page=await browser.newPage(),requests=[];page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await page.goto(pathToFileURL(path).href);assert.equal(await page.locator('main>section').count(),5);assert.equal(await page.getByRole('checkbox').count(),9);
 await page.getByRole('checkbox').first().check();assert.equal(await page.getByRole('checkbox').first().isChecked(),true);
 for(const[width,height]of [[375,812],[390,844],[844,390],[1280,800],[1440,1000],[1920,1080]]){await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{window.scrollTo(0,0);return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});if(process.env.ARTIFACT_DIR)await page.screenshot({path:process.env.ARTIFACT_DIR+'/artifact-mobile.png'});
 await page.evaluate(()=>{const els=[...document.querySelectorAll('h1,h2,h3,p,nav a')],sizes=els.map(el=>parseFloat(getComputedStyle(el).fontSize));els.forEach((el,i)=>el.style.fontSize=sizes[i]*2+'px');});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(requests,[]);
 console.log('PASS standalone native guide:5sections,9 local checkboxes,6sizes,200%text,no overflow or external network requests. Not an iPhone install test.');
}finally{await browser.close();}
