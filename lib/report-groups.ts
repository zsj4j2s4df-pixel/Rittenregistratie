import type {ServerReport} from './report-service.ts';
import {milliKm} from './report-values.ts';
import {validDate} from '../app/trip-domain.ts';
export type ReportPeriod='month'|'quarter'|'year';
type Totals=ServerReport['totals'];
export type ReportGroup={period:string;from:string;until:string;partialPeriod:boolean;driverId:string|null;driverName:string|null;tripCount:number;totals:Totals};
const empty=():Totals=>({milliKm:0,businessMilliKm:0,privateMilliKm:0,reviewMilliKm:0,amountCents:0,unknownDistanceCount:0,unknownBusinessAmountCount:0});
const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'});
const fail=():never=>{throw Error('Rapportsamenvatting is niet veilig berekenbaar; controleer de opgeslagen snapshot.');};
function bounds(date:string,unit:ReportPeriod){
 const year=date.slice(0,4),month=Number(date.slice(5,7));
 const startMonth=unit==='year'?1:unit==='quarter'?Math.floor((month-1)/3)*3+1:month;
 const from=year+'-'+String(startMonth).padStart(2,'0')+'-01';
 const next=new Date(from+'T12:00:00Z');next.setUTCMonth(next.getUTCMonth()+(unit==='year'?12:unit==='quarter'?3:1));next.setUTCDate(0);
 return {period:unit==='year'?year:unit==='quarter'?year+'-Q'+Math.ceil(month/3):date.slice(0,7),from,until:next.toISOString().slice(0,10)};
}
function add(target:Totals,values:Totals){for(const k of Object.keys(target) as (keyof Totals)[]){target[k]+=values[k];if(!Number.isSafeInteger(target[k])||target[k]<0)fail();}}
// Derive only from one already-authorized immutable snapshot. Never re-read
// current trip names, classifications or tariffs and never sum snapshots together.
export function groupReport(report:ServerReport,unit:ReportPeriod):ReportGroup[]{
 if(!report||report.timezone!=='Europe/Amsterdam'||!validDate(report.from)||!validDate(report.until)||report.from>report.until||!['month','quarter','year'].includes(unit)||!Array.isArray(report.rows)||report.rows.length>500)fail();
 const groups=new Map<string,ReportGroup>(),ids=new Set<string>(),names=new Map<string,string|null>(),total=empty();
 for(const row of report.rows){
  if(!row||typeof row.id!=='string'||!row.id||ids.has(row.id)||!Number.isSafeInteger(row.started_at)||!validDate(row.date)||row.date<report.from||row.date>report.until||day.format(new Date(row.started_at*1000))!==row.date||!['business','private','review'].includes(row.classification)||(row.driver_id!==null&&(typeof row.driver_id!=='string'||!row.driver_id||row.driver_id.length>128))||(row.driver_name!==null&&typeof row.driver_name!=='string')||(row.amountCents!==null&&(!Number.isSafeInteger(row.amountCents)||row.amountCents<0||row.classification!=='business'))||(row.distance_km===null&&row.amountCents!==null))fail();
  ids.add(row.id);if(row.driver_id!==null){if(names.has(row.driver_id)&&names.get(row.driver_id)!==row.driver_name)fail();names.set(row.driver_id,row.driver_name);}
  const range=bounds(row.date,unit),key=JSON.stringify([range.period,row.driver_id]);
  let group=groups.get(key);if(!group){group={...range,partialPeriod:report.from>range.from||report.until<range.until,driverId:row.driver_id,driverName:row.driver_id===null?null:row.driver_name,tripCount:0,totals:empty()};groups.set(key,group);}
  const values=empty(),known=row.distance_km===null?0:milliKm(row.distance_km);values.milliKm=known;
  values[row.classification==='business'?'businessMilliKm':row.classification==='private'?'privateMilliKm':'reviewMilliKm']=known;
  values.amountCents=row.amountCents??0;values.unknownDistanceCount=Number(row.distance_km===null);values.unknownBusinessAmountCount=Number(row.classification==='business'&&row.amountCents===null);
  group.tripCount++;add(group.totals,values);add(total,values);
 }
 if(!report.totals||(Object.keys(total) as (keyof Totals)[]).some(k=>!Number.isSafeInteger(report.totals[k])||report.totals[k]!==total[k]))fail();
 return [...groups.values()].sort((a,b)=>a.period.localeCompare(b.period)||(a.driverId===null?b.driverId===null?0:1:b.driverId===null?-1:a.driverId.localeCompare(b.driverId)));
}
