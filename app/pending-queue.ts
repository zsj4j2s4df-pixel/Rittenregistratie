// Browser-local recovery, opt-in only. Never stores tokens or auto-sends writes.
import type {TripCreate} from '../lib/trip-service';
import type {ReportRequest} from '../lib/report-service';
export type PendingKind='trip'|'report';
export type PendingWrite={version:1;key:string;scope:string;kind:PendingKind;createdAt:number;input:TripCreate|ReportRequest};
export const pendingScope=(userId:string,vehicleId:string)=>JSON.stringify([userId,vehicleId]);
const key=(scope:string,kind:PendingKind)=>JSON.stringify([scope,kind]);
function validate(record:PendingWrite,scope:string){
 if(!record||record.version!==1||record.scope!==scope||!['trip','report'].includes(record.kind)||record.key!==key(scope,record.kind)||!Number.isSafeInteger(record.createdAt)||!record.input||typeof record.input!=='object'||!Object.hasOwn(record.input,'requestId')||!/^[A-Za-z0-9_-]{16,128}$/.test(record.input.requestId)||new TextEncoder().encode(JSON.stringify(record)).length>20000)throw Error('Lokale aanvraag is ongeldig; er wordt niets verstuurd.');
 return record;
}
async function database(){return await new Promise<IDBDatabase>((resolve,reject)=>{
 const request=indexedDB.open('ritkompas-pending-v1',1);
 request.onupgradeneeded=()=>{const store=request.result.createObjectStore('writes',{keyPath:'key'});store.createIndex('scope','scope');};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Lokale herstelopslag is niet beschikbaar.'));request.onblocked=()=>reject(Error('Sluit andere RitKompas-tabbladen om herstelopslag te openen.'));
});}
export async function pendingWrites(scope:string):Promise<PendingWrite[]>{const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('writes','readonly'),request=tx.objectStore('writes').index('scope').getAll(IDBKeyRange.only(scope));tx.oncomplete=()=>{try{resolve(request.result.map((row:PendingWrite)=>validate(row,scope)));}catch(e){reject(e);}};tx.onerror=()=>reject(Error('Lokale aanvragen konden niet worden gelezen.'));});}finally{db.close();}}
export async function storePending(scope:string,kind:PendingKind,input:TripCreate|ReportRequest):Promise<void>{const record=validate({version:1,key:key(scope,kind),scope,kind,createdAt:Date.now(),input},scope);const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('writes','readwrite'),store=tx.objectStore('writes');const request=store.get(record.key);request.onsuccess=()=>{if(request.result){tx.abort();return;}store.add(record);};tx.oncomplete=()=>resolve();tx.onabort=()=>reject(Error('Er staat al een onzekere aanvraag van dit type klaar. Herstel of verwijder die eerst.'));tx.onerror=()=>reject(Error('Lokale opslag mislukt; de aanvraag is niet verstuurd.'));});}finally{db.close();}}
export async function removePending(scope:string,kind:PendingKind,expectedRequestId:string){const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('writes','readwrite'),store=tx.objectStore('writes'),request=store.get(key(scope,kind));request.onsuccess=()=>{if(request.result&&request.result.input?.requestId!==expectedRequestId){tx.abort();return;}store.delete(key(scope,kind));};tx.oncomplete=()=>resolve();tx.onabort=()=>reject(Error('Lokale aanvraag is inmiddels gewijzigd; er is niets verwijderd.'));tx.onerror=()=>reject(Error('Lokaal opruimen is mislukt. Herstel gebruikt dezelfde herhaalcode.'));});}finally{db.close();}}
