// Actual Swift execution on Mac without XCTest, downloads, signing or Keychain.
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(process.platform!=='darwin'){
 console.log('NIET GETEST: deze echte Swift/CryptoKit-proef vereist de bestaande Mac-toolchain.');
 process.exitCode=2;
}else{
 const scratch=mkdtempSync(path.join(tmpdir(),'ritkompas-choice-smoke-'));
 try{
  const sources=readdirSync(path.join(root,'ios/RitKompas/Core')).filter(f=>f.endsWith('.swift')).sort().map(f=>path.join(root,'ios/RitKompas/Core',f));
  const binary=path.join(scratch,'choice-smoke');
  const build=spawnSync('xcrun',['swiftc','-swift-version','6','-parse-as-library','-module-name','RitKompasNativeSmoke','-module-cache-path',path.join(scratch,'modules'),...sources,path.join(root,'scripts/native-choice-smoke.swift'),'-o',binary],{cwd:root,encoding:'utf8',timeout:180000});
  process.stdout.write(build.stdout??'');process.stderr.write(build.stderr??'');
  if(build.error||build.status!==0){console.error('FAIL native smoke compile',build.error?.code??build.status);process.exitCode=1;}
  else{
   const run=spawnSync(binary,[],{cwd:root,encoding:'utf8',timeout:30000});
   process.stdout.write(run.stdout??'');process.stderr.write(run.stderr??'');
   if(run.error||run.status!==0){console.error('FAIL native smoke execution');process.exitCode=1;}
  }
 }finally{rmSync(scratch,{recursive:true,force:true});}
}
