'use client';
import {useState} from 'react';
import type {ServerReport} from '../../lib/report-service';
import {groupReport,type ReportPeriod} from '../../lib/report-groups';
const km=(n:number)=>new Intl.NumberFormat('nl-NL',{maximumFractionDigits:3}).format(n/1000);
const euro=(n:number)=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n/100);
export default function ReportPeriods({report}:{report:ServerReport}){
 const [unit,setUnit]=useState<ReportPeriod>('month');
 let groups:ReturnType<typeof groupReport>;try{groups=groupReport(report,unit);}catch{return <section aria-label="Periodeoverzicht"><h3>Per bestuurder en periode</h3><p role="alert">Samenvatting niet beschikbaar: de snapshotgegevens sluiten niet veilig aan. Controleer de ritdetails.</p></section>;}
 return <section aria-label="Periodeoverzicht"><h3>Per bestuurder en periode</h3>
  <label className="no-print">Groepeer op<select value={unit} onChange={e=>setUnit(e.target.value as ReportPeriod)}><option value="month">Maand</option><option value="quarter">Kwartaal</option><option value="year">Jaar</option></select></label>
  <p>Alleen de selectie in dit vaste rapport. Een deelperiode bevat niet alle dagen van de maand, het kwartaal of het jaar. Onbekende afstanden en bedragen blijven afzonderlijk vermeld.</p>
  <div className="report-scroll"><table className="report-data"><caption>{unit==='month'?'Maand':unit==='quarter'?'Kwartaal':'Jaar'}totalen per bestuurder</caption><thead><tr>{['Periode','Bestuurder','Ritten','Bekende km','Zakelijk km','Privé km','Te controleren km','Bekend bedrag','Onbekend afstand / bedrag'].map(label=><th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{groups.map(g=><tr key={JSON.stringify([g.period,g.driverId])}><td>{g.period}{g.partialPeriod?' · Deelselectie':''}</td><td>{g.driverId===null?'Onbekende bestuurder':(g.driverName??'Onbekende accountnaam')+' ('+g.driverId+')'}</td><td>{g.tripCount}</td><td>{km(g.totals.milliKm)}</td><td>{km(g.totals.businessMilliKm)}</td><td>{km(g.totals.privateMilliKm)}</td><td>{km(g.totals.reviewMilliKm)}</td><td>{euro(g.totals.amountCents)}</td><td>{g.totals.unknownDistanceCount} / {g.totals.unknownBusinessAmountCount}</td></tr>)}</tbody></table></div>
 </section>;
}
