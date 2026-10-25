// Offline native preparation only. Never signs, provisions, installs or logs in.
import {mkdirSync,mkdtempSync,openSync,closeSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
const parent=resolve(process.argv[2]??'work/native-test-builds');mkdirSync(parent,{recursive:true});
const out=mkdtempSync(join(parent,'prepared-'));const project='ios/RitKompasApp/RitKompasApp.xcodeproj';
function run(name,command,args){const log=join(out,name+'.log'),fd=openSync(log,'wx',0o600);try{const r=spawnSync(command,args,{stdio:['ignore',fd,fd]});if(r.error||r.status!==0)throw Error('Niet gereed: '+name+'. Controleer het lokale logbestand.');}finally{closeSync(fd);}}
for(const [name,sdk,destination]of [['device','iphoneos','generic/platform=iOS'],['simulator','iphonesimulator','generic/platform=iOS Simulator']])run(name,'xcodebuild',['-project',project,'-scheme','RitKompasApp','-configuration','Debug','-sdk',sdk,'-destination',destination,'-derivedDataPath',join(out,name),'build','CODE_SIGNING_ALLOWED=NO','CODE_SIGNING_REQUIRED=NO']);
run('swift','swift',['test','--package-path','ios','--scratch-path',join(out,'swift')]);
writeFileSync(join(out,'READINESS.json'),JSON.stringify({version:'1.0',build:2,deviceBuild:'PASS',simulatorBuild:'PASS',swiftTests:'PASS',signed:false,installed:false,downloadLink:null,remaining:['Confirm existing Personal Team','Complete personal accounts and explicit vehicle rights','Sign, install and test separately on each iPhone']},null,2),{flag:'wx',mode:0o600});
console.log('Unsigned native preparation complete. NOT an installable download. Local outputs: '+out);
