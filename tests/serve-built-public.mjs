// Local-only public-shell browser harness; no real credentials or remote data.
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const root=fileURLToPath(new URL('../dist/server/',import.meta.url)).replace(/\/$/,''),paths=[];
function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+item.name;if(item.isDirectory())walk(p);else if(p.endsWith('.js'))paths.push(p);}}
walk(root);paths.sort((a,b)=>Number(b===root+'/release-entry.js')-Number(a===root+'/release-entry.js'));
const origin='http://127.0.0.1:4196';
const workerOrigin='https://synthetic.example'; // Preserve the production HTTPS invariant inside isolated workerd.
const mf=new Miniflare({modules:paths.map(path=>({type:'ESModule',path,contents:readFileSync(path,'utf8')})),modulesRoot:root,compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{APP_ORIGIN:workerOrigin,AUTH_PROVIDER:'supabase',SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic'}});
const server=createServer(async(req,res)=>{
 try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}const r=await mf.dispatchFetch(workerOrigin+req.url,{method:req.method,headers:req.headers});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}
 catch{res.writeHead(500);res.end('Local public harness failed');}
});
server.listen(4196,'127.0.0.1',()=>console.log('Local built public-shell harness on '+origin));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{server.close();await mf.dispose();process.exit(0);});
