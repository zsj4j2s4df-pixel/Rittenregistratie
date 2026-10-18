import type { TripCreate, TripEdit } from '../lib/trip-service.ts';
import type { VehicleSettings, SettingsEdit } from '../lib/settings-service.ts';
import type { ReportRequest, ServerReport } from '../lib/report-service.ts';
export type Driver={id:string;name:string};
export type Vehicle={id:string;display_name:string;registration_plate:string|null};
export type BackendTrip={id:string;revision:number;started_at:number;ended_at:number|null;start_address:string|null;end_address:string|null;distance_km:number|null;classification:string;driver_id:string|null;odometer_start:number|null;odometer_end:number|null;purpose:string|null};
export type SavedReport={id:string;created_by:string;created_at:number};
export type TripHistoryEntry={id:number;actor_id:string;action:string;occurred_at:number;old_value_json:string|null;new_value_json:string|null};
export class BackendError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export function createBackendClient(fetcher:typeof fetch=fetch){
 async function send(path:string,method='GET',body?:unknown):Promise<Response>{
  let response:Response;try{response=await fetcher(path,{method,credentials:'same-origin',cache:'no-store',redirect:'error',headers:body===undefined?{}:{'Content-Type':'application/json','x-csrf-protection':'1'},body:body===undefined?undefined:JSON.stringify(body)});}catch{throw new BackendError(0,'Geen verbinding. Probeer opnieuw.');}
  if(!response.ok){let message='Aanvraag mislukt.';try{const value=await response.json();if(value&&typeof value==='object'&&'error' in value&&typeof value.error==='string')message=value.error;}catch{}throw new BackendError(response.status,message);}
  return response;
 }
 async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{return await (await send(path,method,body)).json() as T;}
 const base=(id:string)=>'/api/vehicles/'+encodeURIComponent(id);
 return {
  async vehicles(){const all:Vehicle[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{vehicles:Vehicle[]}>('/api/vehicles?limit=100&offset='+offset)).vehicles;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel voertuigen om te laden.');},
  async trips(id:string){const all:BackendTrip[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{trips:BackendTrip[]}>(base(id)+'/trips?limit=100&offset='+offset)).trips;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel ritten om in één overzicht te laden.');},
  async drivers(id:string){const all:Driver[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{drivers:Driver[]}>(base(id)+'/drivers?limit=100&offset='+offset)).drivers;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel bestuurders om te laden.');},
  async settings(id:string){return (await request<{settings:VehicleSettings}>(base(id)+'/settings')).settings;},
  async saveSettings(id:string,input:SettingsEdit){return (await request<{settings:VehicleSettings}>(base(id)+'/settings','PATCH',input)).settings;},
  async createTrip(id:string,input:TripCreate){return (await request<{trip:BackendTrip}>(base(id)+'/trips','POST',input)).trip;},
  async editTrip(id:string,tripId:string,input:TripEdit){return (await request<{trip:BackendTrip}>(base(id)+'/trips/'+encodeURIComponent(tripId),'PATCH',input)).trip;},
  async history(id:string,tripId:string){return (await request<{history:TripHistoryEntry[]}>(base(id)+'/trips/'+encodeURIComponent(tripId)+'/history?limit=100')).history;},
  async reports(id:string){const all:SavedReport[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{reports:SavedReport[]}>(base(id)+'/reports?limit=100&offset='+offset)).reports;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel rapporten om te laden.');},
  async createReport(id:string,input:ReportRequest){return (await request<{report:ServerReport}>(base(id)+'/reports','POST',input)).report;},
  async csv(id:string,reportId:string){const response=await send(base(id)+'/reports/'+encodeURIComponent(reportId)+'/csv');if(!response.headers.get('content-type')?.toLowerCase().startsWith('text/csv'))throw new BackendError(502,'Geen geldige CSV-export ontvangen.');return response.blob();},
  reportCsvUrl(id:string,reportId:string){return base(id)+'/reports/'+encodeURIComponent(reportId)+'/csv';},
 };
}
