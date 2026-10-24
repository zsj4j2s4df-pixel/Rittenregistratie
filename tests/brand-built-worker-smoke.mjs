// Run after build + prepare-worker-upload; isolated workerd, no live credentials.
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const root=fileURLToPath(new URL('../dist/server/',import.meta.url)).replace(/\/$/,''),paths=[];
function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory())walk(path);else if(path.endsWith('.js'))paths.push(path);}}
walk(root);paths.sort((a,b)=>Number(b===root+'/release-entry.js')-Number(a===root+'/release-entry.js'));
const mf=new Miniflare({modules:paths.map(path=>({type:'ESModule',path,contents:readFileSync(path,'utf8')})),modulesRoot:root,compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat']});
try{
 const manifest=JSON.parse(readFileSync(new URL('../public/brand/asset-manifest.json',import.meta.url)));
 for(const asset of manifest.assets){const url='https://synthetic.example'+asset.path,r=await mf.dispatchFetch(url);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),asset.mime);const bytes=Buffer.from(await r.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);assert.equal((await mf.dispatchFetch(url,{method:'HEAD'})).status,200);assert.equal((await mf.dispatchFetch(url,{method:'POST'})).status,405);}
 const webmanifest=await mf.dispatchFetch('https://synthetic.example/manifest.webmanifest');assert.equal(webmanifest.status,200);assert.equal(webmanifest.headers.get('content-type'),'application/manifest+json');const body=await webmanifest.json();assert.equal(body.start_url,'/ritten');assert.equal(body.icons.length,2);
 console.log('PASS actual built release-wrapper/workerd: all selected brand/icon assets have exact MIME/hash; manifest served; HEAD supported and POST rejected. No deployment or live authentication proof.');
}finally{await mf.dispose();}
