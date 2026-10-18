'use client';

import { useMemo, useReducer, useState } from 'react';
import Image from 'next/image';
import { businessPercentage, demoCsv, durationLabel } from './trip-utils';

import { demoReducer, validateLog, type Classification, type Trip, type HistoryEntry } from './trip-domain';
import { TripEditor } from './trip-editor';

const nav = ['Overzicht', 'Ritten', 'Kaarten', 'Rapporten', 'Mijn Jeep', 'Instellingen'];
const tripsSeed: Trip[] = [
  { id:1, route:'Utrecht → Amersfoort', date:'2026-10-16', time:'08:12–08:47', distance:35, classification:'Controleren', driver:'Dennis', quality:'Voorbeeldroute · geen GPS-meting' },
  { id:2, route:'Amersfoort → Utrecht', date:'2026-10-16', time:'09:05–09:32', distance:28.2, classification:'Privé', driver:'Dennis', quality:'Voorbeeldroute · geen GPS-meting' },
  { id:3, route:'Utrecht → Nieuwegein', date:'2026-10-15', time:'10:24–10:58', distance:22.4, classification:'Zakelijk', driver:'Ingrid', quality:'Voorbeeldroute · geen GPS-meting' },
  { id:4, route:'Hilversum → Utrecht', date:'2026-10-14', time:'16:03–16:45', distance:42.1, classification:'Privé', driver:'Jesse', quality:'Voorbeeld van geschatte route' },
  { id:5, route:'Utrecht → Zeist', date:'2026-10-13', time:'13:12–14:02', distance:37.3, classification:'Zakelijk', driver:'Dennis', quality:'Voorbeeldroute · geen GPS-meting' },
];

function statusClass(value: Classification) { return value === 'Zakelijk' ? 'business' : value === 'Privé' ? 'private' : 'review'; }

export default function Home() {
  const [active, setActive] = useState('Overzicht');
  const [theme, setTheme] = useState<'dark' | 'sand'>('dark');
  const [state, dispatch] = useReducer(demoReducer, {trips:tripsSeed,history:[],error:null});
  const trips = state.trips;
  const [driverFilter,setDriverFilter] = useState('Alle');
  const [fromDate,setFromDate] = useState('');
  const [toDate,setToDate] = useState('');
  const [filter, setFilter] = useState<'Alle' | Classification>('Alle');
  const [selected, setSelected] = useState(1);
  const [rideActive, setRideActive] = useState(false);
  const [notice, setNotice] = useState('');
  const filtered = useMemo(() => trips.filter(t => (filter==='Alle'||t.classification===filter) && (driverFilter==='Alle'||t.driver===driverFilter) && (!fromDate||t.date>=fromDate) && (!toDate||t.date<=toDate)), [filter, trips, driverFilter, fromDate, toDate]);

  function updateTrip(trip:Trip, reason:string) {
    dispatch({type:'edit',trip,expectedRevision:trip.revision??0,reason,occurredAt:new Date().toISOString()});
  }

  function classify(id:number, classification:Classification) {
    const trip=trips.find(t=>t.id===id);
    if (!trip) return;
    updateTrip({...trip,classification},'Handmatige classificatie in demo');
    setNotice(`Demo gewijzigd naar ${classification.toLowerCase()}. Niet opgeslagen; vervalt bij herladen.`);
    window.setTimeout(() => setNotice(''), 3200);
  }

  function exportCsv() {
    const issues=validateLog(trips);
    if(issues.some(i=>i.severity==='error')) {setNotice('Export geblokkeerd: corrigeer eerst de ongeldige ritvelden.'); return;}
    if (!window.confirm(`Uitsluitend voorbeelddata. ${issues.length} aandachtspunten. Kenteken, echte GPS, beveiligde opslag en fiscale verificatie ontbreken. Toch demo-CSV downloaden?`)) return;
    const url = URL.createObjectURL(new Blob([demoCsv(trips)], {type:'text/csv;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'ritkompas-VOORBEELD.csv'; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('CSV-rapport is gegenereerd met de huidige voorbeeldritten.');
  }

  return (
    <main className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand" aria-label="RitKompas"><span className="brand-mark">RK</span><span><strong>RitKompas</strong><small>Rittenregistratie</small></span></div>
        <nav aria-label="Hoofdnavigatie">{nav.map((item, index) => <button key={item} className={active === item ? 'nav-item active' : 'nav-item'} onClick={() => setActive(item)}><span className="nav-icon" aria-hidden="true">{['⌂','↗','⌖','▤','◆','⚙'][index]}</span>{item}</button>)}</nav>
        <div className="sidebar-footer"><div className="avatar">DB</div><span><strong>Dennis</strong><small>Beheerder</small></span></div>
      </aside>

      <section className="workspace">
        <header className="topbar"><div><p className="eyebrow">Lokale demonstratie</p><h1>{active}</h1></div><div className="top-actions"><button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'sand' : 'dark')} aria-label="Wissel kleurthema">{theme === 'dark' ? '☀ Licht' : '● Donker'}</button><span className="connection"><i /> Demo · lokaal</span></div></header>
        <p className="demo-banner" role="note">Voorbeeldgegevens · niet opgeslagen · geen GPS-registratie · niet voor fiscale indiening</p>
        {active === 'Overzicht' && <Overview trips={trips} rideActive={rideActive} setRideActive={setRideActive} classify={classify} openTrips={() => setActive('Ritten')} />}
        {state.error && <p className="form-error demo-banner" role="alert">{state.error}</p>}
        {active === 'Ritten' && <><div className="trip-filters"><label>Bestuurder<select value={driverFilter} onChange={e=>setDriverFilter(e.target.value)}>{['Alle','Dennis','Ingrid','Jesse','Onbekend'].map(name=><option key={name}>{name}</option>)}</select></label><label>Vanaf<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></label><label>Tot en met<input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}/></label><button className="secondary" onClick={()=>{setDriverFilter('Alle');setFromDate('');setToDate('');setFilter('Alle');}}>Filters wissen</button>{fromDate && toDate && fromDate>toDate && <p role="alert">Begindatum ligt na einddatum.</p>}</div><TripsView trips={filtered} filter={filter} setFilter={setFilter} selected={selected} setSelected={setSelected} classify={classify} onUpdate={updateTrip} history={state.history}/></>}
        {active === 'Kaarten' && <MapView trips={trips} />}
        {active === 'Rapporten' && <Reports trips={trips} exportCsv={exportCsv} />}
        {active === 'Mijn Jeep' && <Jeep />}
        {active === 'Instellingen' && <Settings theme={theme} setTheme={setTheme} />}
      </section>
      {notice && <div className="toast" role="status">✓ {notice}</div>}
    </main>
  );
}

function Overview({trips, rideActive, setRideActive, classify, openTrips}:{trips:Trip[];rideActive:boolean;setRideActive:(v:boolean)=>void;classify:(id:number,c:Classification)=>void;openTrips:()=>void}) {
  const review = trips.find(t => t.classification === 'Controleren');
  return <div className="dashboard">
    <section className="hero-card"><Image src="/vehicle-placeholder.svg" alt="Tijdelijke illustratie; geen voertuigfoto" fill priority sizes="(max-width: 980px) 100vw, 65vw"/><div className="hero-shade"/><div className="hero-content"><span className="status-pill"><i /> {rideActive ? 'Demo gestart · geen registratie' : 'Ritdetectie nog niet beschikbaar'}</span><h2>Jeep Wrangler Unlimited<br/>80th Anniversary 4xe</h2><p>Bluetooth-status is in deze MVP nog een demo · Bestuurder: Dennis</p><button className={rideActive ? 'primary stop' : 'primary'} onClick={() => setRideActive(!rideActive)}>{rideActive ? 'Demo stoppen' : 'Demo starten'} <span>→</span></button></div></section>
    <aside className="classify-card"><div className="card-head"><span className="round-icon">↗</span><div><p className="eyebrow">Nog te controleren</p><h2>{review ? '1 rit classificeren' : 'Alles verwerkt'}</h2></div></div>{review ? <><div className="trip-mini"><strong>{review.route}</strong><span>{review.date} · {review.time}</span><div><b>{review.distance.toFixed(1).replace('.',',')} km</b><em>{review.quality}</em></div></div><p className="prompt">Was dit een privé- of zakelijke rit?</p><div className="class-buttons"><button onClick={() => classify(review.id,'Privé')}>⌂<strong>Privé</strong></button><button onClick={() => classify(review.id,'Zakelijk')}>▣<strong>Zakelijk</strong></button></div><small className="neutral-note">Bij twijfel blijft de rit ‘te controleren’. Je kunt dit later wijzigen.</small></> : <div className="empty-compact">✓<strong>Geen openstaande ritten</strong><span>Alle voorbeeldritten zijn geclassificeerd; niet opgeslagen.</span></div>}</aside>
    <section className="metric-card"><span>Alle voorbeeldritten</span><strong>{trips.reduce((s,t)=>s+t.distance,0).toFixed(1).replace('.',',')} km</strong><div className="bar"><i style={{width:`${businessPercentage(trips)}%`}}/></div><p><b>{trips.filter(t=>t.classification==='Zakelijk').reduce((s,t)=>s+t.distance,0).toFixed(1).replace('.',',')} km zakelijk</b><small>{trips.filter(t=>t.classification==='Privé').reduce((s,t)=>s+t.distance,0).toFixed(1).replace('.',',')} km privé</small></p></section>
    <section className="metric-card"><span>Registratiekwaliteit</span><strong>Onbekend</strong><div className="quality"><i>?</i><p><b>Geen GPS- of integriteitscontrole</b><small>{trips.filter(t=>t.classification==='Controleren').length} rit vraagt aandacht</small></p></div></section>
    <section className="recent-card"><div className="section-head"><div><p className="eyebrow">Recente activiteit</p><h2>Laatste ritten</h2></div><button onClick={openTrips}>Alle ritten bekijken →</button></div>{trips.slice(0,3).map(t=><TripRow key={t.id} trip={t}/>)}</section>
  </div>;
}

function TripRow({trip, onClick}:{trip:Trip;onClick?:()=>void}) { const kind=statusClass(trip.classification); return <button className="trip-row" onClick={onClick}><span className={`route-dot ${kind}`}>{trip.classification==='Privé'?'⌂':trip.classification==='Zakelijk'?'↗':'?'}</span><div><strong>{trip.route}</strong><small>{trip.date} · {trip.time} · {trip.driver}</small></div><b>{trip.distance.toFixed(1).replace('.',',')} km</b><em className={`tag ${kind}`}>{trip.classification}</em><span>›</span></button> }

function TripsView({trips,filter,setFilter,selected,setSelected,classify,onUpdate,history}:{trips:Trip[];filter:'Alle'|Classification;setFilter:(v:'Alle'|Classification)=>void;selected:number;setSelected:(v:number)=>void;classify:(id:number,c:Classification)=>void;onUpdate:(trip:Trip,reason:string)=>void;history:HistoryEntry[]}) {
  const [editing,setEditing]=useState<number|null>(null);
  const current = trips.find(t=>t.id===selected) || trips[0];
  return <div className="page-grid"><section className="list-panel"><div className="tabs">{(['Alle','Privé','Zakelijk','Controleren'] as const).map(v=><button className={filter===v?'active':''} key={v} onClick={()=>setFilter(v)}>{v}</button>)}</div><div className="list-summary"><span>{trips.length} ritten</span><span>Voorbeeldgegevens</span></div>{trips.length===0 && <p>Geen ritten voor deze filters.</p>}{trips.map(t=><TripRow key={t.id} trip={t} onClick={()=>{setSelected(t.id);setEditing(null);}}/>)}</section>{current && <aside className="detail-panel"><div className="map-card"><div className="map-grid"/><span className="pin start">Voorbeeld A</span><span className="pin end">Voorbeeld B</span><i className="route-line one"/><i className="route-line two"/><i className="route-line three"/></div><p className="eyebrow">Ritdetails</p><h2>{current.route}</h2><div className="detail-stats"><span><small>Afstand</small><b>{current.distance.toFixed(1).replace('.',',')} km</b></span><span><small>Duur</small><b>{durationLabel(current.time)}</b></span><span><small>Bestuurder</small><b>{current.driver}</b></span></div><p className="route-type">Illustratie · geen opgeslagen GPS-route</p><div className="classification-select"><button className={current.classification==='Privé'?'active':''} onClick={()=>classify(current.id,'Privé')}>⌂ Privé</button><button className={current.classification==='Zakelijk'?'active':''} onClick={()=>classify(current.id,'Zakelijk')}>▣ Zakelijk</button></div><button className="secondary wide" onClick={()=>setEditing(current.id)}>Rit bewerken</button>{editing===current.id && <TripEditor key={`${current.id}-${current.revision??0}`} trip={current} onSave={(trip,reason)=>{onUpdate(trip,reason);setEditing(null);}} onCancel={()=>setEditing(null)}/>}<details className="demo-history"><summary>Wijzigingsgeschiedenis ({history.filter(h=>h.tripId===current.id).length})</summary><p>Alleen deze demosessie, geen beveiligde auditlog.</p>{history.filter(h=>h.tripId===current.id).map((h,index)=><details key={index}><summary>{h.occurredAt} · {h.reason}</summary><p>{h.actor}</p><strong>Vóór</strong><pre>{JSON.stringify(h.before,null,2)}</pre><strong>Na</strong><pre>{JSON.stringify(h.after,null,2)}</pre></details>)}</details></aside>}</div>
}

function MapView({trips}:{trips:Trip[]}) { return <div className="content-page"><section className="full-map"><div className="map-grid"/><i className="route-line one"/><i className="route-line two"/><i className="route-line three"/><span className="pin start">Voorbeeld A</span><span className="pin end">Voorbeeld B</span><div className="map-overlay"><p className="eyebrow">Route-illustratie</p><h2>Utrecht → Amersfoort</h2><p>Voorbeeldgeometrie · geen gemeten GPS-route</p></div></section><section className="map-legend"><div><i className="legend real"/><span><b>Werkelijke GPS-route</b><small>Door het apparaat geregistreerd</small></span></div><div><i className="legend calculated"/><span><b>Berekende route</b><small>Achteraf door kaartdienst</small></span></div><div><i className="legend estimated"/><span><b>Geschatte afstand</b><small>Bij ontbrekende routepunten</small></span></div><b>{trips.length} voorbeeldritten; kaart toont één illustratie</b></section></div> }

function Reports({trips,exportCsv}:{trips:Trip[];exportCsv:()=>void}) { const total=trips.reduce((s,t)=>s+t.distance,0); const business=trips.filter(t=>t.classification==='Zakelijk').reduce((s,t)=>s+t.distance,0); const issues=validateLog(trips); return <div className="content-page"><section className="report-hero"><div><p className="eyebrow">Periodeoverzicht</p><h2>Alle voorbeeldritten</h2><p>Voorbeeldgegevens — nog niet geschikt voor fiscale indiening.</p></div><div className="report-actions"><button className="secondary" onClick={exportCsv}>CSV downloaden</button><button className="primary" onClick={()=>alert('PDF-export is nog niet gebouwd. Ook opslag, validaties en rapportgegevens ontbreken.')}>PDF voorbereiden</button></div></section><section className="report-grid"><div className="donut" style={{'--value':`${businessPercentage(trips)*3.6}deg`} as React.CSSProperties}><span><b>{businessPercentage(trips)}%</b>zakelijk</span></div><div className="report-numbers"><span><small>Totaal</small><b>{total.toFixed(1).replace('.',',')} km</b></span><span><small>Zakelijk</small><b>{business.toFixed(1).replace('.',',')} km</b></span><span><small>Privé</small><b>{trips.filter(t=>t.classification==='Privé').reduce((s,t)=>s+t.distance,0).toFixed(1).replace('.',',')} km</b></span></div><div className="validation"><p className="eyebrow">Controle vóór export</p><h3>{issues.length} rit-aandachtspunten</h3><p>⚠ Kenteken ontbreekt; geen fiscale export</p><p>GPS-volledigheid en centrale deduplicatie nog niet beschikbaar.</p><ul>{issues.map((issue,index)=><li key={`${issue.code}-${index}`}>Rit {issue.tripId}: {issue.message}</li>)}</ul><p>Tijdoverlap is een aanwijzing, geen bewijs van een dubbele rit.</p></div></section><section className="recent-card report-table"><div className="section-head"><div><p className="eyebrow">Rapportinhoud</p><h2>Ritten in deze periode</h2></div></div>{trips.map(t=><TripRow key={t.id} trip={t}/>)}</section></div> }

function Jeep() { return <div className="content-page"><section className="vehicle-hero"><Image src="/vehicle-placeholder.svg" alt="Tijdelijke illustratie; originele foto blijft privé op de Mac" fill sizes="(max-width: 980px) 100vw, 80vw"/><div><span className="status-pill"><i/> Placeholder · geen voertuigfoto</span><p className="eyebrow">Mijn voertuig</p><h2>Jeep Wrangler Unlimited<br/>80th Anniversary 4xe</h2><p>De exacte uitvoering, het modeljaar en de marktversie moeten nog met voertuigdocumenten worden bevestigd.</p></div></section><section className="vehicle-details"><div><p className="eyebrow">Voertuiggegevens</p><h3>Administratie</h3><dl><dt>Kenteken</dt><dd className="warning">Nog invullen</dd><dt>Modeljaar</dt><dd>Nog verifiëren</dd><dt>Uitvoering</dt><dd>80th Anniversary 4xe</dd><dt>Voertuig-ID</dt><dd>Wordt later gekoppeld</dd></dl></div><div><p className="eyebrow">Databronnen</p><h3>Verbindingsstatus</h3><dl><dt>Bluetooth</dt><dd>Praktijktest vereist</dd><dt>CarPlay</dt><dd>Haalbaarheid onderzoeken</dd><dt>OBD2-adapter</dt><dd>Niet aangeschaft</dd><dt>GPS</dt><dd>Native iPhone-fase</dd></dl></div></section></div> }

function Settings({theme,setTheme}:{theme:'dark'|'sand';setTheme:(v:'dark'|'sand')=>void}) { return <div className="settings-layout"><section><p className="eyebrow">Persoonlijk</p><h2>Weergave</h2><div className="setting-card"><div><strong>Kleurthema</strong><small>Geldt voor de volledige app</small></div><div className="segmented"><button className={theme==='dark'?'active':''} onClick={()=>setTheme('dark')}>Donker</button><button className={theme==='sand'?'active':''} onClick={()=>setTheme('sand')}>Zand</button></div></div><p className="eyebrow group-label">Gebruikers & bestuurders</p>{[['DB','Dennis','Prioriteit 1'],['IB','Ingrid','Prioriteit 2'],['JB','Jesse','Prioriteit 3']].map(u=><div className="setting-card user" key={u[1]}><div className="avatar">{u[0]}</div><div><strong>{u[1]}</strong><small>Beheerder · bestuurder · {u[2]}</small></div><button>›</button></div>)}</section><section><p className="eyebrow">Ritregistratie</p><h2>Detectie & classificatie</h2><div className="setting-card"><div><strong>Nooit automatisch zakelijk</strong><small>Nooit automatisch zakelijk bij onzekerheid</small></div><span className="switch on"/></div><div className="setting-card"><div><strong>Automatische ritdetectie</strong><small>Beschikbaar na de native iPhone-fase</small></div><span className="switch"/></div><p className="eyebrow group-label">Zakelijke voorkeursadressen</p><div className="setting-card"><div><strong>Kantoor Utrecht</strong><small>Voorbeeldadres · nog te bevestigen</small></div><em className="tag review">Voorbeeld</em></div><button className="secondary wide">+ Adres toevoegen</button><p className="eyebrow group-label">Voertuig & rapportage</p><div className="setting-card"><div><strong>Kenteken</strong><small>Verplicht vóór fiscale export</small></div><button>Invullen</button></div></section></div> }
