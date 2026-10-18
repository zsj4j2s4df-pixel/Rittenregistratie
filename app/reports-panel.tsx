'use client';

import { useState } from 'react';
import type { Trip } from './trip-domain';
import type { DemoSettings } from './demo-settings';
import { prepareReport, reportCsv, type ReportSnapshot } from './report-domain';

export function ReportsPanel({ trips, settings, reports, onReport }: { trips: Trip[]; settings: DemoSettings; reports: ReportSnapshot[]; onReport: (r: ReportSnapshot) => void }) {
  const [from, setFrom] = useState(trips.map(t => t.date).sort()[0] ?? '');
  const [until, setUntil] = useState(trips.map(t => t.date).sort().at(-1) ?? '');
  const [driver, setDriver] = useState('Alle');
  const [error, setError] = useState('');
  const [index, setIndex] = useState(-1);
  const report = reports[index < 0 ? reports.length - 1 : index];
  const money = (cents: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  function generate() {
    try { onReport(prepareReport(trips, { from, until, driver, plate: settings.plate, rates: settings.rates, generatedAt: new Date().toISOString() })); setIndex(-1); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Rapport kon niet worden gemaakt.'); }
  }
  function download() {
    if (!report || !window.confirm(`${report.warnings.length} waarschuwingen. Dit is een demorapport, niet voor fiscale indiening. Toch downloaden?`)) return;
    const url = URL.createObjectURL(new Blob([reportCsv(report)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `ritkompas-VOORBEELD-${report.options.from}-${report.options.until}.csv`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="content-page report-page">
    <section className="report-hero no-print"><div><p className="eyebrow">Rapportage</p><h2>Periode en bestuurder</h2><p>Alleen testgegevens gebruiken. Rapporten verdwijnen bij herladen.</p></div></section>
    <form className="trip-filters no-print" onSubmit={e => { e.preventDefault(); generate(); }}>
      <label>Rapport vanaf<input type="date" required value={from} onChange={e => setFrom(e.target.value)} /></label>
      <label>Rapport tot en met<input type="date" required value={until} onChange={e => setUntil(e.target.value)} /></label>
      <label>Rapportbestuurder<select aria-label="Rapportbestuurder" value={driver} onChange={e => setDriver(e.target.value)}>{['Alle', 'Dennis', 'Ingrid', 'Jesse', 'Onbekend'].map(d => <option key={d}>{d}</option>)}</select></label>
      <button className="secondary" type="submit">Rapport maken</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {!!reports.length && <label className="no-print">Eerder gemaakt demorapport<select aria-label="Eerder gemaakt demorapport" value={index < 0 ? reports.length - 1 : index} onChange={e => setIndex(Number(e.target.value))}>{reports.map((r, i) => <option key={i} value={i}>{i + 1}. {r.options.from} — {r.options.until} · {r.options.driver} · {r.options.generatedAt}</option>)}</select></label>}
    {report ? <article className="print-report">
      <header><h2>RitKompas — demorapport</h2><strong>VOORBEELD — NIET VOOR FISCALE INDIENING</strong>
        <p>Jeep Wrangler Unlimited 80th Anniversary 4xe · kenteken: {report.options.plate || 'ONTBREEKT'}</p>
        <p>{report.options.from} t/m {report.options.until} · bestuurder: {report.options.driver} · gemaakt: {report.options.generatedAt}</p>
        <p className="no-print">Dit vastgelegde rapport verandert niet bij nieuwe tarief- of ritwijzigingen. Maak dan bewust een nieuw rapport.</p>
      </header>
      <div className="report-actions no-print"><button className="secondary" disabled={!report.rows.length} onClick={download}>CSV downloaden</button><button className="secondary" onClick={() => window.print()}>Afdrukken / PDF</button></div>
      <p className="no-print">Kies ‘Opslaan als PDF’ in het afdrukvenster als je browser dit ondersteunt.</p>
      <section aria-label="Rapporttotalen"><p>Totaal: {report.totalKm} km · zakelijk: {report.businessKm} km · privé: {report.privateKm} km · te controleren: {report.reviewKm} km</p><p>Berekende vergoeding: {money(report.amountCents)} — ontbrekende tarieven zijn niet meegerekend; zie waarschuwingen.</p></section>
      <details open className="report-warnings"><summary>Waarschuwingen ({report.warnings.length})</summary><ul>{report.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></details>
      <div className="report-scroll"><table className="report-data"><thead><tr>{['Datum / tijd', 'Bestuurder', 'Route / herkomst', 'Classificatie', 'km', 'Begin / einde', 'Ritdoel', 'Tarief / bedrag'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{report.rows.map((r, i) => <tr key={i}><td>{r.date}<br />{r.time}</td><td>{r.driver}</td><td>{r.route}<br /><small>{r.quality}</small></td><td>{r.classification}</td><td>{r.distance}</td><td>{r.odometerStart ?? 'ONTBREEKT'} / {r.odometerEnd ?? 'ONTBREEKT'}</td><td>{r.purpose || 'Niet ingevuld'}</td><td>{r.rateMicros === null ? 'Tarief niet berekend' : `€ ${r.rateMicros / 1_000_000}/km`}<br />{r.amountCents === null ? 'Niet berekend' : money(r.amountCents)}</td></tr>)}</tbody></table></div>
      {!report.rows.length && <p>Geen ritten voor deze selectie. CSV-export is uitgeschakeld; kies een andere periode of bestuurder.</p>}
    </article> : <p>Maak een rapport om de ritten, controles en export te bekijken.</p>}
  </div>;
}
