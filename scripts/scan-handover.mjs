// Conservative pattern scan; not a proof that no unknown secret exists.
// Emits paths/object IDs only, never matching values.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=fs.realpathSync(process.argv[2]??'.');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const rules=[
  ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['api-token',/\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/],
  ['aws-access',/\bAKIA[A-Z0-9]{16}\b/],
  ['credential-url',/https?:\/\/[^\s/:]+:[^\s/@]{8,}@/],
];
const findings=[];let files=0,blobs=0;
function scan(content,id){for(const [kind,re]of rules)if(re.test(content))findings.push({id,kind});}
function walk(dir){for(const name of fs.readdirSync(dir)){if(['.git','node_modules','.next','dist','.wrangler','.vinext'].includes(name))continue;const full=path.join(dir,name),rel=path.relative(root,full),s=fs.lstatSync(full);if(s.isDirectory())walk(full);else if(s.isFile()){
  if((/^\.env(?:\.|$)/.test(name)&&name!=='.env.example')||/\.(pem|p12|pfx|key|mobileprovision|sqlite|sqlite3|db|tar|gz|zip)$/i.test(name))findings.push({id:rel,kind:'forbidden-file-type'});
  files++;scan(fs.readFileSync(full,'utf8'),rel);
}}}
walk(root);
for(const line of git('rev-list','--objects','--all').trim().split('\n')){
  const [sha]=line.split(' ');if(!sha)continue;
  if(git('cat-file','-t',sha).trim()!=='blob')continue;
  blobs++;scan(git('cat-file','-p',sha),`git-object:${sha}`);
}
console.log(JSON.stringify({filesScanned:files,historicalBlobsScanned:blobs,findings,limitation:'Pattern-based + manual review. No entropy/third-party scanner installed. No production data files included.'},null,2));
if(findings.length)process.exitCode=1;
