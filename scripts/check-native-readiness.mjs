// Read-only inspection by default. --run additionally builds/tests existing
// sources with the installed Apple toolchain; never installs or signs anything.
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const run=process.argv.slice(2);
if(run.some(x=>x!=='--run'))throw Error('Gebruik: node scripts/check-native-readiness.mjs [--run]');
const results=[];
function check(label,command,args,options={}){
 const r=spawnSync(command,args,{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:2_000_000,...options});
 const pass=r.status===0&&!r.error;results.push({label,status:pass?'PASS':'FAIL',exitCode:r.status});
 console.log(`${pass?'PASS':'FAIL'} ${label}`);if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);
 return pass;
}
if(process.platform!=='darwin'){
 console.log('NIET GETEST: Apple-toolchain/iOS. Dit script moet op Mac draaien; Cloud/Node-tests bewijzen geen native werking.');process.exitCode=2;
}else{
 const swift=check('Swift beschikbaar','xcrun',['swift','--version']);
 const xcode=check('Xcode beschikbaar','xcodebuild',['-version']);
 const sdk=spawnSync('xcrun',['--sdk','iphoneos','--show-sdk-path'],{cwd:root,encoding:'utf8',timeout:30000});
 const sdkReady=sdk.status===0&&!sdk.error&&sdk.stdout.trim().length>0;
 console.log(`${sdkReady?'PASS':'NIET GETEST'} iPhoneOS SDK beschikbaar`);
 if(run.includes('--run')&&swift){
  const scratch=mkdtempSync(path.join(tmpdir(),'ritkompas-native-'));
  try{
   check('Core-librarybuild','xcrun',['swift','build','--package-path','ios','--target','RitKompasCore','--scratch-path',scratch]);
   if(xcode)check('Bestaande XCTest-suite','xcrun',['swift','test','--package-path','ios','--scratch-path',scratch]);
   else console.log('NIET GETEST XCTest: geschikte Xcode-toolchain ontbreekt. Geen installatie gestart.');
   if(sdkReady){
    // Semantic typecheck, not parse-only, with actual iPhoneOS SDK. Shell-free
    // file enumeration preserves names without glob/shell injection.
    const {readdirSync}=await import('node:fs');
    for(const [dir,module]of [['Core','RitKompasCore'],['UI','RitKompasPreparationUI']]){
     const files=readdirSync(path.join(root,'ios/RitKompas',dir)).filter(n=>n.endsWith('.swift')).sort().map(n=>path.join('ios/RitKompas',dir,n));
     check(`iOS ${dir} semantische typecheck`,'xcrun',['swiftc','-swift-version','6','-sdk',sdk.stdout.trim(),'-target','arm64-apple-ios15.0','-module-cache-path',path.join(scratch,'module-cache'),'-typecheck','-module-name',module,...files]);
    }
   }
  }finally{rmSync(scratch,{recursive:true,force:true});}
 }
 console.log('NIET GETEST door deze opdracht: apphost/authprovider/queueconsumer/GPS-integratie, signing/installatie, echte iPhone/meldingen/achtergrond/CarPlay/Jeep/OBD2. Een typecheck is geen werkende app.');
 if(!swift||!xcode||!sdkReady||results.some(r=>r.status==='FAIL'))process.exitCode=2;
}
