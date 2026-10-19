'use client';
import {useEffect,useEffectEvent,useState} from 'react';
import {BackendError,createBackendClient} from '../backend-client';
import type {VehicleSnapshot} from '../../lib/sync-service';
const api=createBackendClient();
type Options={enabled:boolean;vehicleId:string;viewerId:string;busy:boolean;loading:boolean;blocked:()=>boolean;epoch:()=>number;apply:(snapshot:VehicleSnapshot)=>void;deny:()=>void};
// Read-only polling is opt-in. Never run a queued write or replace dirty forms.
export function useCoherentRefresh(options:Options){
 const [status,setStatus]=useState('');
 const check=useEffectEvent(async(signal:AbortSignal,current:()=>boolean)=>{
  if(options.blocked()){setStatus('Verversen gepauzeerd: er staat nog onopgeslagen invoer.');return;}
  const epoch=options.epoch();
  try{
   const snapshot=await api.snapshot(options.vehicleId,signal);
   if(!current()||signal.aborted)return;
   if(snapshot.viewerId!==options.viewerId){options.deny();setStatus('Account gewijzigd. Verbind opnieuw.');return;}
   if(snapshot.version!==1||snapshot.vehicle.id!==options.vehicleId)throw new BackendError(502,'Ongeldige verversingsscope.');
   if(options.epoch()!==epoch||options.blocked()){setStatus('Verversen gepauzeerd: je invoer blijft behouden.');return;}
   options.apply(snapshot);setStatus('Centrale gegevens bijgewerkt.');
  }catch(error){
   if(!current()||signal.aborted)return;
   if(error instanceof BackendError&&[401,403].includes(error.status)){options.deny();return;}
   setStatus('Verversen niet gelukt. Er wordt later opnieuw gecontroleerd.');
  }
 });
 useEffect(()=>{
  if(!options.enabled||!options.vehicleId||!options.viewerId||options.busy||options.loading)return;
  let active=true,controller:AbortController|null=null;
  const run=async()=>{
   if(!active||controller||document.visibilityState!=='visible'||!navigator.onLine)return;
   const request=new AbortController();controller=request;
   const timeout=setTimeout(()=>request.abort(),15000);
   try{await check(request.signal,()=>active);}finally{clearTimeout(timeout);if(controller===request)controller=null;}
  };
  const visible=()=>{if(document.visibilityState==='visible')void run();};
  const timer=setInterval(()=>void run(),60000);document.addEventListener('visibilitychange',visible);window.addEventListener('online',visible);const first=setTimeout(()=>void run(),0);
  return()=>{active=false;clearTimeout(first);clearInterval(timer);controller?.abort();document.removeEventListener('visibilitychange',visible);window.removeEventListener('online',visible);};
 },[options.enabled,options.vehicleId,options.viewerId,options.busy,options.loading]);
 return status;
}
