import { validateRates, type MileageRate } from './report-domain.ts';

export type BusinessAddress = { id: string; label: string; address: string; enabled: boolean; note: string };
export type SettingsChange = { occurredAt: string; kind: string; before: string; after: string };
export type DemoSettings = { plate: string; rates: MileageRate[]; addresses: BusinessAddress[]; history: SettingsChange[] };

export function validateAddress(address: BusinessAddress): void {
  if (!address.id || !address.label.trim() || address.label.trim().length > 100 || !address.address.trim() || address.address.trim().length > 450 || address.note.length > 1000) {
    throw new Error('Vul een naam (max. 100) en adres (max. 450 tekens) in; toelichting maximaal 1000 tekens.');
  }
}
export function addRate(settings: DemoSettings, rate: MileageRate): DemoSettings {
  const rates = [...settings.rates.filter(r => r.id !== rate.id), { ...rate }];
  validateRates(rates);
  return changed(settings, { ...settings, rates }, 'Tarief gewijzigd');
}

export function changed(before: DemoSettings, after: DemoSettings, kind: string): DemoSettings {
  return { ...after, history: [...before.history, { occurredAt: new Date().toISOString(), kind,
    before: JSON.stringify({ plate: before.plate, rates: before.rates, addresses: before.addresses }),
    after: JSON.stringify({ plate: after.plate, rates: after.rates, addresses: after.addresses }) }] };
}

export function saveAddress(settings: DemoSettings, address: BusinessAddress): DemoSettings {
  validateAddress(address);
  const value = { ...address, label: address.label.trim(), address: address.address.trim(), note: address.note.trim() };
  const exists = settings.addresses.some(a => a.id === address.id);
  return changed(settings, { ...settings, addresses: exists ? settings.addresses.map(a => a.id === value.id ? value : a) : [...settings.addresses, value] }, 'Voorkeursadres gewijzigd');
}
