import type {MaterializationInput,MaterializationReceipt} from '../lib/journey-materialization.ts';
import type {JourneyChoiceInput,JourneyChoiceReceipt} from '../lib/journey-choice-service.ts';
import type {Journey,JourneyEvidence} from '../lib/journey-service.ts';
import type {DetectionObservation} from '../lib/detection-service.ts';
import type { RegisteredDevice,DeviceRegistration,DeviceDeactivation } from '../lib/device-service.ts';
import type {RoutePage,RoutePoint} from '../lib/route-service.ts';
import type {VehicleSnapshot} from '../lib/sync-service.ts';
import type { TripCreate, TripEdit } from '../lib/trip-service.ts';
import type { VehicleSettings, SettingsEdit } from '../lib/settings-service.ts';
import type { ReportRequest, ServerReport } from '../lib/report-service.ts';
export type Driver={id:string;name:string};
export type Vehicle={id:string;display_name:string;registration_plate:string|null};
export type BackendTrip={id:string;revision:number;status:string;needs_review:number;started_at:number;ended_at:number|null;start_address:string|null;end_address:string|null;distance_km:number|null;classification:string;driver_id:string|null;odometer_start:number|null;odometer_end:number|null;purpose:string|null};
export type SavedReport={id:string;created_by:string;created_at:number};
export type TripHistoryEntry={id:number;actor_id:string;action:string;occurred_at:number;old_value_json:string|null;new_value_json:string|null};
export class BackendError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export function createBackendClient(fetcher:typeof fetch=fetch){
 async function send(path:string,method='GET',body?:unknown,expectedViewerId?:string,signal?:AbortSignal):Promise<Response>{
  let response:Response;try{response=await fetcher(path,{signal,method,credentials:'same-origin',cache:'no-store',redirect:'error',headers:body===undefined?{}:{'Content-Type':'application/json','x-csrf-protection':'1',...(expectedViewerId?{'x-ritkompas-viewer':expectedViewerId}:{})},body:body===undefined?undefined:JSON.stringify(body)});}catch{throw new BackendError(0,'Geen verbinding. Probeer opnieuw.');}
  if(!response.ok){let message='Aanvraag mislukt.';try{const value=await response.json();if(value&&typeof value==='object'&&'error' in value&&typeof value.error==='string')message=value.error;}catch{}throw new BackendError(response.status,message);}
  return response;
 }
 async function request<T>(path:string,method='GET',body?:unknown,expectedViewerId?:string,signal?:AbortSignal):Promise<T>{return await (await send(path,method,body,expectedViewerId,signal)).json() as T;}
 const base=(id:string)=>'/api/vehicles/'+encodeURIComponent(id);
 return {
  async vehicles(){const all:Vehicle[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{vehicles:Vehicle[]}>('/api/vehicles?limit=100&offset='+offset)).vehicles;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel voertuigen om te laden.');},
  async trips(id:string){const all:BackendTrip[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{trips:BackendTrip[]}>(base(id)+'/trips?limit=100&offset='+offset)).trips;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel ritten om in één overzicht te laden.');},
  async drivers(id:string){const all:Driver[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{drivers:Driver[]}>(base(id)+'/drivers?limit=100&offset='+offset)).drivers;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel bestuurders om te laden.');},
  async journeys(id:string){return (await request<{journeys:Journey[]}>(base(id)+'/journeys?limit=50&offset=0')).journeys;},
  async journey(id:string,journeyId:string){return request<{journey:Journey;evidence:JourneyEvidence[]}>(base(id)+'/journeys/'+encodeURIComponent(journeyId));},
  async materializeJourney(id:string,journeyId:string,input:MaterializationInput,viewerId:string){return (await request<{receipt:MaterializationReceipt}>(base(id)+'/journeys/'+encodeURIComponent(journeyId)+'/materialize','POST',input,viewerId)).receipt;},
  async chooseJourney(id:string,journeyId:string,input:JourneyChoiceInput,viewerId:string){return (await request<{receipt:JourneyChoiceReceipt}>(base(id)+'/journeys/'+encodeURIComponent(journeyId)+'/choice','POST',input,viewerId)).receipt;},
  async detections(id:string,deviceId:string,offset=0){return (await request<{observations:DetectionObservation[]}>(base(id)+'/devices/'+encodeURIComponent(deviceId)+'/detections?limit=50&offset='+offset)).observations;},
  async devices(id:string){const all:RegisteredDevice[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{devices:RegisteredDevice[]}>(base(id)+'/devices?limit=100&offset='+offset)).devices;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel appinstanties om te laden.');},
  async registerDevice(id:string,input:DeviceRegistration,viewerId:string){return (await request<{device:RegisteredDevice}>(base(id)+'/devices','POST',input,viewerId)).device;},
  async deactivateDevice(id:string,deviceId:string,input:DeviceDeactivation,viewerId:string){return (await request<{device:RegisteredDevice}>(base(id)+'/devices/'+encodeURIComponent(deviceId),'PATCH',input,viewerId)).device;},
  async snapshot(id:string,signal?:AbortSignal){return (await request<{snapshot:VehicleSnapshot}>(base(id)+'/snapshot','GET',undefined,undefined,signal)).snapshot;},
  async settings(id:string){return (await request<{settings:VehicleSettings}>(base(id)+'/settings')).settings;},
  async saveSettings(id:string,input:SettingsEdit){return (await request<{settings:VehicleSettings}>(base(id)+'/settings','PATCH',input)).settings;},
  async createTrip(id:string,input:TripCreate,expectedViewerId?:string){return (await request<{trip:BackendTrip}>(base(id)+'/trips','POST',input,expectedViewerId)).trip;},
  async editTrip(id:string,tripId:string,input:TripEdit){return (await request<{trip:BackendTrip}>(base(id)+'/trips/'+encodeURIComponent(tripId),'PATCH',input)).trip;},
  async route(id:string,tripId:string){const points:RoutePoint[]=[];let after=0,through:number|undefined;for(let page=0;page<21;page++){const route=(await request<{route:RoutePage}>(base(id)+'/trips/'+encodeURIComponent(tripId)+'/route?limit=500&after='+after+(through===undefined?'':'&through='+through))).route;if(through!==undefined&&route.through!==through)throw new BackendError(409,'Routegrens is gewijzigd; laad opnieuw.');through=route.through;points.push(...route.points);if(points.length>10000)throw new BackendError(413,'Meer dan10000routepunten; deze weergave kapt de route niet stil af.');if(route.nextAfter===null)return {points:points.sort((a,b)=>a.recorded_at-b.recorded_at||a.id-b.id),through};if(route.nextAfter<=after)throw new BackendError(502,'Ongeldige routepaginering.');after=route.nextAfter;}throw new BackendError(413,'Route is te groot voor deze weergave.');},
  async settingsHistory(id:string,before?:number){return (await request<{history:TripHistoryEntry[]}>(base(id)+'/settings/history?limit=50'+(before===undefined?'':'&before='+encodeURIComponent(before)))).history;},
  async history(id:string,tripId:string,before?:number){return (await request<{history:TripHistoryEntry[]}>(base(id)+'/trips/'+encodeURIComponent(tripId)+'/history?limit=100'+(before===undefined?'':'&before='+encodeURIComponent(before)))).history;},
  async reports(id:string){const all:SavedReport[]=[];for(let offset=0;offset<=100000;offset+=100){const page=(await request<{reports:SavedReport[]}>(base(id)+'/reports?limit=100&offset='+offset)).reports;all.push(...page);if(page.length<100)return all;}throw new BackendError(413,'Te veel rapporten om te laden.');},
  async report(id:string,reportId:string){return (await request<{report:ServerReport}>(base(id)+'/reports/'+encodeURIComponent(reportId))).report;},
  async createReport(id:string,input:ReportRequest,expectedViewerId?:string){return (await request<{report:ServerReport}>(base(id)+'/reports','POST',input,expectedViewerId)).report;},
  async csv(id:string,reportId:string){const response=await send(base(id)+'/reports/'+encodeURIComponent(reportId)+'/csv');if(!response.headers.get('content-type')?.toLowerCase().startsWith('text/csv'))throw new BackendError(502,'Geen geldige CSV-export ontvangen.');return response.blob();},
  reportCsvUrl(id:string,reportId:string){return base(id)+'/reports/'+encodeURIComponent(reportId)+'/csv';},
 };
}
