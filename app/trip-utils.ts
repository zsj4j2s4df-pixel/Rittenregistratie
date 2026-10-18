export type ExportTrip = {date:string; time:string; route:string; distance:number; classification:string; driver:string; odometerStart?:number; odometerEnd?:number; purpose?:string};

export function businessPercentage(trips: Pick<ExportTrip, 'distance' | 'classification'>[]): number {
  const total = trips.reduce((sum, trip) => sum + trip.distance, 0);
  return total > 0 ? Math.round(trips.filter(t => t.classification === 'Zakelijk').reduce((sum,t) => sum + t.distance, 0) / total * 100) : 0;
}

// Quote every cell and neutralize spreadsheet formula prefixes, including whitespace.
export function csvCell(value: string | number): string {
  const text = String(value);
  const safe = /^[\s\uFEFF]*[=+@-]/u.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function demoCsv(trips: ExportTrip[]): string {
  const rows: (string | number)[][] = [
    ['Status', 'Datum', 'Tijd', 'Route', 'Afstand_km', 'Classificatie', 'Bestuurder', 'Kenteken', 'Beginstand_km', 'Eindstand_km', 'Ritdoel'],
    ...trips.map(t => ['VOORBEELD — NIET VOOR FISCALE INDIENING', t.date, t.time, t.route, t.distance, t.classification, t.driver, 'ONTBREEKT', t.odometerStart??'ONTBREEKT', t.odometerEnd??'ONTBREEKT', t.purpose??'']),
  ];
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function durationLabel(time: string): string {
  const match = /^(\d{2}):(\d{2})–(\d{2}):(\d{2})$/.exec(time);
  if (!match) return 'Onbekend';
  const [, sh, sm, eh, em] = match.map(Number);
  if (sh > 23 || eh > 23 || sm > 59 || em > 59) return 'Onbekend';
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  return minutes >= 0 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')} u` : 'Onbekend';
}
