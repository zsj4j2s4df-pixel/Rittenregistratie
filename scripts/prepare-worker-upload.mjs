// Credential-free deployment payload. Generated build artifacts stay outside Git.
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
const modules={};
function walk(dir,fn){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())walk(path,fn);else fn(path);}}
walk('dist/server',path=>{if(path.endsWith('.js'))modules[relative('dist/server',path)]=readFileSync(path,'utf8');});
const assets={};
const brandAssets=new Set(['/brand/de-voetel-transparent.png','/brand/ritkompas-mark.webp','/brand/jeep-offroad.webp']);
walk('dist/client',path=>{const name='/'+relative('dist/client',path);if(!name.startsWith('/_next/static/')&&!/^\/[^/]+\.svg$/.test(name)&&!brandAssets.has(name))return;const ext=path.split('.').pop();assets[name]={data:readFileSync(path).toString('base64'),type:({js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',svg:'image/svg+xml',png:'image/png',webp:'image/webp'})[ext]??'application/octet-stream'};});
modules['embedded-assets.js']='export default '+JSON.stringify(assets)+';';
modules['release-entry.js']=`import app from './index.js';
import assets from './embedded-assets.js';
function asset(request){const path=new URL(request.url).pathname;const value=assets[path];if(!value)return null;if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});const bytes=Uint8Array.from(atob(value.data),c=>c.charCodeAt(0));return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':value.type,'X-Content-Type-Options':'nosniff','Cache-Control':path.startsWith('/_next/static/')?'public, max-age=31536000, immutable':'public, max-age=3600'}});}
export default {fetch(request,env,ctx){const response=asset(request);if(response)return response;const binding={fetch(input,init){const req=input instanceof Request?input:new Request(input,init);return Promise.resolve(asset(req)??new Response('Not found',{status:404}));}};return app.fetch(request,{...env,ASSETS:binding},ctx);}};`;
for(const name of ['embedded-assets.js','release-entry.js'])writeFileSync(join('dist/server',name),modules[name]);
const config=JSON.parse(readFileSync('dist/server/wrangler.json','utf8'));config.main='release-entry.js';delete config.assets;writeFileSync('dist/server/wrangler.embedded.json',JSON.stringify(config,null,2));
writeFileSync(process.argv[2]??'/tmp/rit-worker-payload.json',JSON.stringify({modules,assetCount:Object.keys(assets).length}));
console.log(`Prepared ${Object.keys(modules).length} modules and ${Object.keys(assets).length} public assets. No credentials included.`);
