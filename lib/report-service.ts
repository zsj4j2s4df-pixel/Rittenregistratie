import { membership, TripServiceError, vehicleAuthorizer } from './server-access.ts';
import type { Principal } from './access-policy.ts';
import type { SessionResolver } from './trip-service.ts';
import { validateRates, type MileageRate } from '../app/report-domain.ts';
import { validDate } from '../app/trip-domain.ts';
import { csvCell } from '../app/trip-utils.ts';
import { milliKm, reimbursementCents } from './report-values.ts';

export type ReportRequest={requestId:string;from:string;until:string;driverId:string|null};
type SourceTrip={id:string;revision:number;started_at:number;ended_at:number|null;driver_id:string|null;driver_name:string|null;start_address:string|null;end_address:string|null;distance_km:number|null;classification:string;odometer_start:number|null;odometer_end:number|null;purpose:string|null;route_type:string;distance_source:string|null;distance_origin_json:string|null;status:string;needs_review:number};
export type ServerReport={id:string;vehicleId:string;createdBy:string;createdAt:number;from:string;until:string;driverId:string|null;timezone:'Europe/Amsterdam';plate:string|null;settingsRevision:number;rates:MileageRate[];rows:(SourceTrip&{date:string;rateMicros:number|null;amountCents:number|null})[];warnings:string[];totals:{milliKm:number;businessMilliKm:number;privateMilliKm:number;reviewMilliKm:number;amountCents:number;unknownDistanceCount:number;unknownBusinessAmountCount:number}};
const warning='NIET FISCAAL GOEDGEKEURD — controleer volledigheid, herkomst en toepasselijke fiscale regels.';
const dateFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'});
const day=(seconds:number)=>dateFormatter.format(new Date(seconds*1000));
function freeze<T>(value:T):T{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export function serverReportCsv(report:ServerReport):string{
 if(!report.rows.length)throw new TripServiceError(409,'Geen ritten om te exporteren.');
 const header=['Status','Rapport_ID','Voertuig_ID','Kenteken','Tijdzone','Datum','Vertrek_ISO','Aankomst_ISO','Rit_ID','Revisie','Bestuurder_ID','Bestuurder','Vertrekadres','Aankomstadres','Afstand_km','Classificatie','Beginstand_km','Eindstand_km','Doel','Tarief_EUR_per_km','Bedrag_EUR','Routeherkomst','Afstandsherkomst','Oorspronkelijke_afstand','Gemaakt_ISO','Waarschuwingen'];
 const rows=report.rows.map((t,index)=>[warning,report.id,report.vehicleId,report.plate??'ONTBREEKT',report.timezone,t.date,new Date(t.started_at*1000).toISOString(),t.ended_at===null?'ONTBREEKT':new Date(t.ended_at*1000).toISOString(),t.id,t.revision,t.driver_id??'ONBEKEND',t.driver_name??'ONBEKEND',t.start_address??'ONTBREEKT',t.end_address??'ONTBREEKT',t.distance_km??'ONTBREEKT',t.classification,t.odometer_start??'ONTBREEKT',t.odometer_end??'ONTBREEKT',t.purpose??'',t.rateMicros===null?'NIET BEREKEND':t.rateMicros/1_000_000,t.amountCents===null?'NIET BEREKEND':(t.amountCents/100).toFixed(2),t.route_type,t.distance_source??'ONBEKEND',t.distance_origin_json??'',new Date(report.createdAt*1000).toISOString(),index===0?report.warnings.join(' | '):'Rapportwaarschuwingen: zie eerste ritregel.']);
 return '\uFEFF'+[header,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
export function createReportService(db:Pick<D1Database,'prepare'|'batch'>,resolveSession:SessionResolver=async()=>null,clock=()=>Date.now()){
 const authorize=vehicleAuthorizer(db,resolveSession,clock);
 async function previous(p:Principal,vehicleId:string,requestId:string,canonical:string){
  const row=await db.prepare(`SELECT request_json,snapshot_json FROM report_snapshots WHERE vehicle_id=? AND created_by=? AND request_id=? AND ${membership}`).bind(vehicleId,p.userId,requestId,p.userId,vehicleId).first<{request_json:string;snapshot_json:string}>();
  if(!row)return null;if(row.request_json!==canonical)throw new TripServiceError(409,'Herhaalcode hoort bij een andere rapportselectie.');return freeze(JSON.parse(row.snapshot_json) as ServerReport);
 }
 async function getFor(p:Principal,vehicleId:string,id:string){
  if(typeof id!=='string'||!id||id.length>128)throw new TripServiceError(400,'Ongeldig rapport.');
  const row=await db.prepare(`SELECT snapshot_json FROM report_snapshots WHERE id=? AND vehicle_id=? AND ${membership}`).bind(id,vehicleId,p.userId,vehicleId).first<{snapshot_json:string}>();
  if(!row)throw new TripServiceError(404,'Rapport niet gevonden.');return freeze(JSON.parse(row.snapshot_json) as ServerReport);
 }
 return {
  async get(vehicleId:string,id:string){return getFor(await authorize(vehicleId),vehicleId,id);},
  async csv(vehicleId:string,id:string){return serverReportCsv(await getFor(await authorize(vehicleId),vehicleId,id));},
  async list(vehicleId:string,limit=50,offset=0){const p=await authorize(vehicleId);if(!Number.isSafeInteger(limit)||limit<1||limit>100||!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new TripServiceError(400,'Ongeldige paginering.');return (await db.prepare(`SELECT id,created_by,created_at FROM report_snapshots WHERE vehicle_id=? AND ${membership} ORDER BY created_at DESC,id LIMIT ? OFFSET ?`).bind(vehicleId,p.userId,vehicleId,limit,offset).all()).results;},
  async create(vehicleId:string,input:ReportRequest){
   const p=await authorize(vehicleId);
   if(!input||typeof input.requestId!=='string'||!/^[A-Za-z0-9_-]{16,128}$/.test(input.requestId)||typeof input.from!=='string'||typeof input.until!=='string'||!validDate(input.from)||!validDate(input.until)||input.from>input.until||(input.driverId!==null&&(typeof input.driverId!=='string'||!input.driverId||input.driverId.length>128)))throw new TripServiceError(400,'Ongeldige rapportselectie.');
   const canonical=JSON.stringify({from:input.from,until:input.until,driverId:input.driverId});
   const old=await previous(p,vehicleId,input.requestId,canonical);if(old)return old;
   // One SQLite statement captures plate, settings revision, rates and all source
   // trips together. A bounded wider UTC window is then filtered by Amsterdam date.
   const source=await db.prepare(`SELECT registration_plate AS plate,settings_revision AS revision,
    (SELECT json_group_array(json_object('id',id,'microsPerKm',amount_micros,'start',valid_from,'end',valid_until)) FROM (SELECT * FROM mileage_rates WHERE vehicle_id=vehicles.id ORDER BY valid_from,id LIMIT 101)) AS rates,
    (SELECT json_group_array(json_object('id',id,'revision',revision,'started_at',started_at,'ended_at',ended_at,'driver_id',driver_id,'driver_name',driver_name,'start_address',start_address,'end_address',end_address,'distance_km',distance_km,'classification',classification,'odometer_start',odometer_start,'odometer_end',odometer_end,'purpose',purpose,'route_type',route_type,'distance_source',distance_source,'distance_origin_json',distance_origin_json,'status',status,'needs_review',needs_review))
      FROM (SELECT t.*,u.name AS driver_name FROM trips t LEFT JOIN users u ON u.id=t.driver_id WHERE t.vehicle_id=vehicles.id AND t.started_at<? AND (t.started_at>=? OR t.ended_at IS NULL OR t.ended_at>?) ORDER BY t.started_at,t.id LIMIT 501)) AS trips
    FROM vehicles WHERE id=? AND ${membership}`).bind(Date.parse(input.until+'T00:00:00Z')/1000+172800,Date.parse(input.from+'T00:00:00Z')/1000-86400,Date.parse(input.from+'T00:00:00Z')/1000-86400,vehicleId,p.userId,vehicleId).first<{plate:string|null;revision:number;rates:string;trips:string}>();
   if(!source)throw new TripServiceError(403,'Geen toegang tot dit voertuig.');
   const raw=JSON.parse(source.trips) as SourceTrip[],rawRates=JSON.parse(source.rates) as {id:string;microsPerKm:number;start:number;end:number|null}[];
   if(raw.length>500||rawRates.length>100)throw new TripServiceError(413,'Selectie te groot; kies een kortere periode. Geen gegevens geëxporteerd.');
   let rates:MileageRate[];
   try{if(rawRates.some(r=>r.microsPerKm===null||!Number.isSafeInteger(r.start)||r.start%86400!==0||(r.end!==null&&(!Number.isSafeInteger(r.end)||r.end%86400!==0))))throw Error();rates=rawRates.map(r=>({id:r.id,microsPerKm:r.microsPerKm,validFrom:new Date(r.start*1000).toISOString().slice(0,10),...(r.end===null?{}:{validUntil:new Date(r.end*1000).toISOString().slice(0,10)})}));validateRates(rates);}catch{throw new TripServiceError(409,'Controleer bestaande tarieven vóór rapportage.');}
   if(raw.some(t=>!Number.isSafeInteger(t.started_at)||!Number.isFinite(new Date(t.started_at*1000).getTime())))throw new TripServiceError(409,'Ongeldige ritdatums; controleer brongegevens.');
   const period=raw.filter(t=>day(t.started_at)>=input.from&&day(t.started_at)<=input.until);
   const selected=period.filter(t=>input.driverId===null||t.driver_id===input.driverId);
   if(!selected.length)throw new TripServiceError(409,'Geen ritten in deze selectie.');
   const warnings=[warning,'GPS-routepunten en GPS-gaten zijn niet in dit rapport gevalideerd; controleer de oorspronkelijke route.'];if(!source.plate)warnings.push('Kenteken ontbreekt.');
   const totals={milliKm:0,businessMilliKm:0,privateMilliKm:0,reviewMilliKm:0,amountCents:0,unknownDistanceCount:0,unknownBusinessAmountCount:0};
   const rows=selected.map(t=>{
    if(!Number.isSafeInteger(t.started_at)||!Number.isFinite(new Date(t.started_at*1000).getTime())||(t.ended_at!==null&&(!Number.isSafeInteger(t.ended_at)||!Number.isFinite(new Date(t.ended_at*1000).getTime())||t.ended_at<=t.started_at))||!['private','business','review'].includes(t.classification)||!Number.isSafeInteger(t.revision)||t.revision<0)throw new TripServiceError(409,'Corrigeer ongeldige ritvelden vóór rapportage.');
    const warn=(s:string)=>warnings.push(`Rit ${t.id}: ${s}`);
    if(t.ended_at===null)warn('eindtijd ontbreekt');if(t.driver_id===null)warn('bestuurder onbekend');if(!t.start_address||!t.end_address)warn('adres ontbreekt');if(t.odometer_start===null||t.odometer_end===null)warn('tellerstand ontbreekt');if(!t.purpose)warn('ritdoel ontbreekt');if(t.classification==='review'||t.needs_review||t.status!=='final')warn('controle nodig');
    if(t.route_type!=='recorded'||t.distance_source!=='gps')warn('route/afstand niet volledig GPS-geverifieerd');if(t.revision>0)warn('rit gecorrigeerd; revision en audit raadplegen');
    if(t.odometer_start!==null&&(!Number.isFinite(t.odometer_start)||t.odometer_start<0)||t.odometer_end!==null&&(!Number.isFinite(t.odometer_end)||t.odometer_end<0)||t.odometer_start!==null&&t.odometer_end!==null&&t.odometer_end<t.odometer_start)throw new TripServiceError(409,'Corrigeer tellerstanden vóór rapportage.');
    const date=day(t.started_at),rate=rates.find(r=>date>=r.validFrom&&date<=(r.validUntil??'9999-12-31'));let amountCents:number|null=null;
    let km=0;try{if(t.distance_km===null)warn('afstand ontbreekt; totalen onvolledig');else{km=milliKm(t.distance_km);if(t.classification==='business'&&rate)amountCents=reimbursementCents(t.distance_km,rate.microsPerKm);}}catch{throw new TripServiceError(409,'Afstand of vergoeding niet veilig berekenbaar.');}
    if(t.distance_km===null)totals.unknownDistanceCount++;if(t.classification==='business'&&amountCents===null)totals.unknownBusinessAmountCount++;
    if(t.classification==='business'&&!rate)warn('tarief ontbreekt; vergoeding onbekend');
    totals.milliKm+=km;totals[t.classification==='business'?'businessMilliKm':t.classification==='private'?'privateMilliKm':'reviewMilliKm']+=km;totals.amountCents+=amountCents??0;
    return {...t,date,rateMicros:t.classification==='business'&&rate?rate.microsPerKm:null,amountCents};
   });
   const ids=new Set(selected.map(t=>t.id));for(let a=0;a<raw.length;a++)for(let b=a+1;b<raw.length;b++){const x=raw[a],y=raw[b];if((ids.has(x.id)||ids.has(y.id))&&x.started_at<(y.ended_at??Infinity)&&y.started_at<(x.ended_at??Infinity))warnings.push(`Mogelijke dubbele/overlappende ritten: ${x.id}, ${y.id}; controleer het voertuiglogboek.`);}
   if(Object.values(totals).some(n=>!Number.isSafeInteger(n)))throw new TripServiceError(409,'Totalen vallen buiten het veilige bereik.');
   const now=clock();if(!Number.isFinite(now)||p.sessionExpiresAt<=now)throw new TripServiceError(401,'Aanmelden vereist.');
   const createdAt=Math.floor(now/1000);if(!Number.isSafeInteger(createdAt))throw new TripServiceError(500,'Ongeldige servertijd.');
   const report:ServerReport={id:crypto.randomUUID(),vehicleId,createdBy:p.userId,createdAt,from:input.from,until:input.until,driverId:input.driverId,timezone:'Europe/Amsterdam',plate:source.plate,settingsRevision:source.revision,rates,rows,warnings,totals};
   const snapshot=JSON.stringify(report);if(new TextEncoder().encode(snapshot).byteLength>1_500_000)throw new TripServiceError(413,'Rapport te groot; kies een kortere periode.');
   await db.batch([
    db.prepare(`INSERT INTO report_snapshots(id,vehicle_id,created_by,created_at,request_id,request_json,snapshot_json) SELECT ?,?,?,?,?,?,? WHERE ${membership} AND NOT EXISTS (SELECT 1 FROM report_snapshots WHERE vehicle_id=? AND created_by=? AND request_id=?)`).bind(report.id,vehicleId,p.userId,createdAt,input.requestId,canonical,snapshot,p.userId,vehicleId,vehicleId,p.userId,input.requestId),
    db.prepare(`INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,old_value_json,new_value_json,occurred_at) SELECT ?,'report',?,'create',NULL,?,? WHERE EXISTS (SELECT 1 FROM report_snapshots WHERE id=?)`).bind(p.userId,report.id,JSON.stringify({reportId:report.id,from:report.from,until:report.until,driverId:report.driverId,settingsRevision:report.settingsRevision,rowCount:rows.length}),createdAt,report.id),
   ]);
   const saved=await previous(p,vehicleId,input.requestId,canonical);if(!saved)throw new TripServiceError(409,'Toegangsrechten gewijzigd; laad opnieuw.');return saved;
  },
 };
}
