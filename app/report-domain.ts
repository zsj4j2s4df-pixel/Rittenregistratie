import { milliKm, reimbursementCents } from '../lib/report-values.ts';
import { validateLog, overlapIssues, validDate, type Trip } from './trip-domain.ts';
import { csvCell } from './trip-utils.ts';

export type MileageRate = { id: string; validFrom: string; validUntil?: string; microsPerKm: number };
export type ReportOptions = { from: string; until: string; driver: string; plate: string; rates: readonly MileageRate[]; generatedAt: string };
export type ReportRow = Readonly<Trip & { rateMicros: number | null; amountCents: number | null }>;
export type ReportSnapshot = Readonly<{
  options: Readonly<ReportOptions>; rows: readonly ReportRow[]; warnings: readonly string[];
  totalKm: number; businessKm: number; privateKm: number; reviewKm: number; amountCents: number;
}>;

export function validateRates(rates: readonly MileageRate[]): void {
  const ids = new Set<string>();
  for (const rate of rates) {
    if (!rate.id || ids.has(rate.id) || !validDate(rate.validFrom) ||
      (rate.validUntil !== undefined && (!validDate(rate.validUntil) || rate.validUntil < rate.validFrom)) ||
      !Number.isSafeInteger(rate.microsPerKm) || rate.microsPerKm < 0 || rate.microsPerKm > 1_000_000_000) {
      throw new Error('Ongeldige tariefperiode of bedrag.');
    }
    ids.add(rate.id);
  }
  for (let i = 0; i < rates.length; i++) for (let j = i + 1; j < rates.length; j++) {
    if (rates[i].validFrom <= (rates[j].validUntil ?? '9999-12-31') && rates[j].validFrom <= (rates[i].validUntil ?? '9999-12-31')) {
      throw new Error('Tariefperioden mogen niet overlappen; de einddatum telt mee.');
    }
  }
}

export function prepareReport(trips: readonly Trip[], options: ReportOptions): ReportSnapshot {
  if (!validDate(options.from) || !validDate(options.until) || options.from > options.until) throw new Error('Kies een geldige rapportperiode.');
  if (!['Alle', 'Dennis', 'Ingrid', 'Jesse', 'Onbekend'].includes(options.driver)) throw new Error('Onbekend bestuurdersfilter.');
  if (!Number.isFinite(Date.parse(options.generatedAt))) throw new Error('Ongeldig rapporttijdstip.');
  const plate = options.plate.trim().toUpperCase();
  if (plate.length > 16 || (plate && !/^[A-Z0-9 -]+$/.test(plate))) throw new Error('Kenteken bevat ongeldige tekens of is te lang.');
  validateRates(options.rates);
  const periodTrips = trips.filter(t => t.date >= options.from && t.date <= options.until);
  const selected = periodTrips.filter(t => options.driver === 'Alle' || t.driver === options.driver);
  const issues = [...validateLog(selected).filter(i => i.code !== 'overlap'), ...overlapIssues(periodTrips, new Set(selected.map(t => t.id)))];
  if (issues.some(i => i.severity === 'error')) throw new Error('Corrigeer ongeldige ritvelden vóór rapportage.');
  const warnings = issues.map(i => `Rit ${i.tripId}: ${i.message}`);
  warnings.unshift('VOORBEELD — NIET VOOR FISCALE INDIENING. Alleen deze demosessie; geen centrale opslag of GPS-verificatie.');
  if (!plate) warnings.push('Kenteken ontbreekt.');
  if (!selected.length) warnings.push('Geen ritten in deze selectie.');
  const rows = selected.slice().sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.id - b.id).map(trip => {
    const rate = options.rates.find(r => trip.date >= r.validFrom && trip.date <= (r.validUntil ?? '9999-12-31'));
    const applicable = trip.classification === 'Zakelijk';
    if (applicable && !rate) warnings.push(`Rit ${trip.id}: geen tarief voor deze datum; vergoeding niet berekend.`);
    milliKm(trip.distance);
    const cents = applicable && rate ? reimbursementCents(trip.distance, rate.microsPerKm) : null;
    return Object.freeze({ ...trip, rateMicros: applicable && rate ? rate.microsPerKm : null, amountCents: cents });
  });
  const sum = (classification?: string) => {
    const value = rows.filter(r => !classification || r.classification === classification).reduce((n, r) => n + Math.round(r.distance * 1000), 0);
    if (!Number.isSafeInteger(value)) throw new Error('Kilometertotaal valt buiten het veilig berekenbare bereik.');
    return value / 1000;
  };
  const amountCents = rows.reduce((n, r) => n + (r.amountCents ?? 0), 0);
  if (!Number.isSafeInteger(amountCents)) throw new Error('Vergoedingstotaal valt buiten het veilig berekenbare bereik.');
  return Object.freeze({ options: Object.freeze({ ...options, plate, rates: Object.freeze(options.rates.map(r => Object.freeze({ ...r }))) }),
    rows: Object.freeze(rows), warnings: Object.freeze(warnings), totalKm: sum(), businessKm: sum('Zakelijk'), privateKm: sum('Privé'), reviewKm: sum('Controleren'),
    amountCents });
}

export function reportCsv(report: ReportSnapshot): string {
  if (!report.rows.length) throw new Error('Geen ritten in deze selectie; kies een andere periode of bestuurder vóór CSV-export.');
  const header = ['Status', 'Kenteken', 'Datum', 'Tijd', 'Route', 'Afstand_km', 'Classificatie', 'Bestuurder', 'Beginstand_km', 'Eindstand_km', 'Ritdoel', 'Tarief_EUR_per_km', 'Bedrag_EUR', 'Routeherkomst', 'Rapport_gemaakt', 'Waarschuwingen'];
  const rows = report.rows.map(r => ['VOORBEELD — NIET VOOR FISCALE INDIENING', report.options.plate || 'ONTBREEKT', r.date, r.time, r.route, r.distance, r.classification, r.driver,
    r.odometerStart ?? 'ONTBREEKT', r.odometerEnd ?? 'ONTBREEKT', r.purpose ?? '', r.rateMicros === null ? 'NIET BEREKEND' : r.rateMicros / 1_000_000,
    r.amountCents === null ? 'NIET BEREKEND' : (r.amountCents / 100).toFixed(2), r.quality, report.options.generatedAt, report.warnings.join(' | ')]);
  return '\uFEFF' + [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}
