import { DatabaseSync, backup as sqliteBackup } from 'node:sqlite';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { constants, createReadStream, createWriteStream } from 'node:fs';
import { appendFile, open, lstat, mkdtemp, chmod, rm, copyFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const magic=Buffer.from('RKSQL001');
const maxHeader=4096;
// Reject existing symlink components, including parents. The trusted local user
// must also control the directories: this is not an adversarial-filesystem sandbox.
async function safePath(file, existing=false){
 const absolute=path.resolve(file),parts=absolute.split(path.sep).filter(Boolean);let current=path.parse(absolute).root;
 for(let i=0;i<parts.length;i++){
  current=path.join(current,parts[i]);
  try{const s=await lstat(current);if(s.isSymbolicLink())throw Error('Symbolische koppelingen zijn niet toegestaan.');if(i<parts.length-1&&!s.isDirectory())throw Error('Ongeldige bovenliggende map.');if(i===parts.length-1&&(!existing||!s.isFile()))throw Error(existing?'Een gewoon bestand is vereist.':'Doel bestaat al; overschrijven is verboden.');}
  catch(e){if(e.code==='ENOENT'&&i===parts.length-1&&!existing)continue;throw e;}
 }
 return absolute;
}
async function keyBytes(file){
 await safePath(file,true);const handle=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
 try{const s=await handle.stat();if(!s.isFile()||s.size!==32||(s.mode&0o077)!==0)throw Error('Sleutelbestand moet 32 bytes zijn en uitsluitend voor de eigenaar toegankelijk.');return await handle.readFile();}finally{await handle.close();}
}
export async function initKey(file){
 const target=await safePath(file);const handle=await open(target,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);
 try{await handle.writeFile(randomBytes(32));await handle.sync();}catch(e){await rm(target,{force:true});throw e;}finally{await handle.close();}
}
async function privateTemp(){const dir=await mkdtemp(path.join(tmpdir(),'ritkompas-sqlite-'));await chmod(dir,0o700);return dir;}
export async function createBackup({source,destination,keyFile}){
 const sourcePath=await safePath(source,true),target=await safePath(destination),key=await keyBytes(keyFile);
 const dir=await privateTemp();let output,created=false;
 try{
  const snapshot=path.join(dir,'snapshot.sqlite');const db=new DatabaseSync(sourcePath,{readOnly:true});
  try{await sqliteBackup(db,snapshot);}finally{db.close();}
  const iv=randomBytes(12),metadata=Buffer.from(JSON.stringify({version:1,cipher:'aes-256-gcm',format:'sqlite',createdAt:new Date().toISOString(),iv:iv.toString('base64')}));
  const size=Buffer.alloc(4);size.writeUInt32BE(metadata.length);const header=Buffer.concat([magic,size,metadata]);
  const cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(header);
  output=await open(target,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);
  created=true;await output.writeFile(header);await output.close();output=null;
  await pipeline(createReadStream(snapshot),cipher,createWriteStream(target,{flags:'r+',start:header.length}));
  await appendFile(target,cipher.getAuthTag());
  output=await open(target,constants.O_RDWR|constants.O_NOFOLLOW);await output.sync();await output.close();output=null;
 }catch(e){if(output)await output.close();if(created)await rm(target,{force:true});throw e;}
 finally{key.fill(0);await rm(dir,{recursive:true,force:true});}
}
export async function restoreBackup({source,destination,keyFile}){
 const input=await safePath(source,true),target=await safePath(destination),key=await keyBytes(keyFile);const dir=await privateTemp();let reader,published=false;
 try{
  reader=await open(input,constants.O_RDONLY|constants.O_NOFOLLOW);const size=(await reader.stat()).size;
  const prefix=Buffer.alloc(12);if((await reader.read(prefix,0,12,0)).bytesRead!==12||!prefix.subarray(0,8).equals(magic))throw Error('Onbekend back-upformaat.');
  const length=prefix.readUInt32BE(8);if(length<1||length>maxHeader||size<12+length+16)throw Error('Ongeldige back-upheader.');
  const metadata=Buffer.alloc(length);await reader.read(metadata,0,length,12);const header=Buffer.concat([prefix,metadata]);let info;
  try{info=JSON.parse(metadata.toString());}catch{throw Error('Ongeldige back-upmetadata.');}
  if(info.version!==1||info.cipher!=='aes-256-gcm'||info.format!=='sqlite'||typeof info.iv!=='string'||!/^[A-Za-z0-9+/]{16}$/.test(info.iv))throw Error('Niet-ondersteunde back-upmetadata.');
  const tag=Buffer.alloc(16);await reader.read(tag,0,16,size-16);
  const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(info.iv,'base64'));decipher.setAAD(header);decipher.setAuthTag(tag);
  const restored=path.join(dir,'restored.sqlite');await pipeline(reader.createReadStream({start:header.length,end:size-17}),decipher,createWriteStream(restored,{flags:'wx',mode:0o600}));
  const db=new DatabaseSync(restored,{readOnly:true});
  try{const integrity=db.prepare('PRAGMA integrity_check').all();if(integrity.length!==1||Object.values(integrity[0])[0]!=='ok'||db.prepare('PRAGMA foreign_key_check').all().length)throw Error('SQLite-integriteitscontrole mislukt.');}finally{db.close();}
  // COPYFILE_EXCL refuses existing files and final-component symlinks. Recheck
  // parent components immediately before publication. Never overwrite a live DB.
  await safePath(target);await copyFile(restored,target,constants.COPYFILE_EXCL);published=true;await chmod(target,0o600);
 }catch(e){if(published)await rm(target,{force:true});throw e;}finally{if(reader)await reader.close();key.fill(0);await rm(dir,{recursive:true,force:true});}
}
async function main(args){
 const [command,...rest]=args;if(!['init-key','backup','restore'].includes(command))throw Error('Gebruik: init-key --key-file PAD | backup/restore --source PAD --destination NIEUW_PAD --key-file PAD');
 const options={};for(let i=0;i<rest.length;i+=2){if(!['--source','--destination','--key-file'].includes(rest[i])||!rest[i+1]||rest[i+1].startsWith('--')||options[rest[i]])throw Error('Ongeldige argumenten.');options[rest[i]]=rest[i+1];}
 if(!options['--key-file']||(command==='init-key'&&Object.keys(options).length!==1)||(command!=='init-key'&&Object.keys(options).length!==3))throw Error('Vereiste bestandsargumenten ontbreken.');
 if(command==='init-key')await initKey(options['--key-file']);else await (command==='backup'?createBackup:restoreBackup)({source:options['--source'],destination:options['--destination'],keyFile:options['--key-file']});
 process.stdout.write('Voltooid.\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main(process.argv.slice(2)).catch(()=>{process.stderr.write('Niet uitgevoerd: controleer argumenten, bestandsrechten, vrije ruimte en back-upintegriteit. Geen bestaand doel is overschreven.\n');process.exitCode=1;});
