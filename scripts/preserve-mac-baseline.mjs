// Generates reviewable historical source evidence, without fabricating Git commits.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
const [archive,current,output]=process.argv.slice(2);
if(!archive||!current||!output)throw Error('archive current output required');
const entries=execFileSync('tar',['-tzf',archive],{encoding:'utf8'}).trim().split('\n');
if(entries.some(p=>p.startsWith('/')||p.split('/').includes('..')))throw Error('Unsafe archive path');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ritkompas-baseline-'));
fs.mkdirSync(path.join(tmp,'baseline'));fs.mkdirSync(path.join(tmp,'current'));
for(const entry of entries.filter(p=>!p.endsWith('/'))){
  for(const side of ['baseline','current']){
    const target=path.join(tmp,side,entry);fs.mkdirSync(path.dirname(target),{recursive:true});
    const content=side==='baseline'?execFileSync('tar',['-xOf',archive,entry],{encoding:'utf8'}):fs.readFileSync(path.join(current,entry),'utf8');
    fs.writeFileSync(target,content.replaceAll(current,'<MAC_PROJECT>'));
  }
}
const result=spawnSync('git',['diff','--no-index','--no-ext-diff','--','baseline','current'],{cwd:tmp,encoding:'utf8',maxBuffer:16*1024*1024});
if(![0,1].includes(result.status))throw Error(result.stderr);
fs.writeFileSync(output,result.stdout);
console.log(JSON.stringify({baselineFiles:entries.filter(p=>!p.endsWith('/')).length,patchBytes:Buffer.byteLength(result.stdout),temporaryEvidenceDirectory:tmp}));
