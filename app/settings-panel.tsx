'use client';
import { useState } from 'react';
import { addRate, changed, saveAddress, type BusinessAddress, type DemoSettings } from './demo-settings';
import type { MileageRate } from './report-domain';

export function SettingsPanel({ theme, setTheme, settings, onChange }: { theme: 'dark' | 'sand'; setTheme: (t: 'dark' | 'sand') => void; settings: DemoSettings; onChange: (s: DemoSettings) => void }) {
  const [plate, setPlate] = useState(settings.plate);
  const [address, setAddress] = useState<BusinessAddress>({ id: '', label: '', address: '', enabled: true, note: '' });
  const [rateId, setRateId] = useState('');
  const [rateFrom, setRateFrom] = useState('');
  const [rateUntil, setRateUntil] = useState('');
  const [rateAmount, setRateAmount] = useState('');
  const [message, setMessage] = useState('');
  function attempt(fn: () => void) { try { fn(); setMessage('Demoinstelling bijgewerkt. Niet opgeslagen; vervalt bij herladen.'); } catch (e) { setMessage(e instanceof Error ? e.message : 'Wijziging mislukt.'); } }
  function editRate(rate: MileageRate) { setRateId(rate.id); setRateFrom(rate.validFrom); setRateUntil(rate.validUntil ?? ''); setRateAmount(String(rate.microsPerKm / 1_000_000)); }
  return <div className="settings-layout">
    <section><p className="eyebrow">Persoonlijk</p><h2>Weergave en voertuig</h2><p>Gebruik uitsluitend testgegevens. Geen account of centrale opslag gekoppeld.</p>
      <div className="segmented"><button aria-pressed={theme === 'dark'} className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Donker</button><button aria-pressed={theme === 'sand'} className={theme === 'sand' ? 'active' : ''} onClick={() => setTheme('sand')}>Zand</button></div>
      <form className="trip-editor" onSubmit={e => { e.preventDefault(); attempt(() => {
        const value = plate.trim().toUpperCase(); if (value.length > 16 || (value && !/^[A-Z0-9 -]+$/.test(value))) throw new Error('Gebruik maximaal 16 letters, cijfers, spaties of streepjes.');
        onChange(changed(settings, { ...settings, plate: value }, 'Kenteken gewijzigd')); setPlate(value);
      }); }}><label>Kenteken (demo)<input maxLength={16} value={plate} onChange={e => setPlate(e.target.value)} /></label><button className="secondary">Kenteken toepassen</button></form>
      <h3>Gebruikers en bestuurders</h3>{['Dennis', 'Ingrid', 'Jesse'].map((name, i) => <p key={name}>{name} · beheerder en bestuurder · prioriteit {i + 1}</p>)}<p>Prioriteit bewijst niet wie rijdt. Accounts, passkeys en synchronisatie zijn nog niet aangesloten.</p>
      <h3>Kilometervergoeding</h3><p>Geen standaardtarief ingevuld. Stel alleen een bekend tarief met geldigheidsperiode in; dit is geen fiscaal advies.</p>
      {settings.rates.map(rate => <div className="setting-card" key={rate.id}><span>€ {rate.microsPerKm / 1_000_000}/km · {rate.validFrom} t/m {rate.validUntil ?? 'onbepaald'}</span><button onClick={() => editRate(rate)}>Tarief bewerken</button><button onClick={() => { if (window.confirm('Deze tariefinstelling verwijderen? Gemaakte demorapporten blijven ongewijzigd.')) onChange(changed(settings, { ...settings, rates: settings.rates.filter(r => r.id !== rate.id) }, 'Tarief verwijderd')); }}>Tarief verwijderen</button></div>)}
      <form className="trip-editor" onSubmit={e => { e.preventDefault(); attempt(() => {
        const amount = rateAmount.trim().replace(',', '.'); if (!/^\d+(\.\d{1,6})?$/.test(amount)) throw new Error('Vul een niet-negatief bedrag in met maximaal zes decimalen.');
        onChange(addRate(settings, { id: rateId || crypto.randomUUID(), validFrom: rateFrom, ...(rateUntil ? { validUntil: rateUntil } : {}), microsPerKm: Math.round(Number(amount) * 1_000_000) }));
        setRateId(''); setRateFrom(''); setRateUntil(''); setRateAmount('');
      }); }}><label>Tarief vanaf<input type="date" required value={rateFrom} onChange={e => setRateFrom(e.target.value)} /></label><label>Tarief tot en met (optioneel)<input type="date" value={rateUntil} onChange={e => setRateUntil(e.target.value)} /></label><label>Bedrag euro per km<input inputMode="decimal" required value={rateAmount} onChange={e => setRateAmount(e.target.value)} /></label><button className="secondary">{rateId ? 'Tariefwijziging toepassen' : 'Tarief toevoegen'}</button></form>
    </section>
    <section><p className="eyebrow">Zakelijke voorkeursadressen</p><h2>Adresbeheer</h2><p>Een adresmatch is een aanwijzing, geen bewijs. Deze demoadressen classificeren geen rit automatisch.</p>
      {settings.addresses.map(a => <div className="setting-card" key={a.id}><div><strong>{a.label}</strong><small>{a.address} · {a.enabled ? 'Actief' : 'Uitgeschakeld'}</small><small>{a.note}</small></div><button onClick={() => setAddress({ ...a })}>Adres bewerken</button><button onClick={() => onChange(saveAddress(settings, { ...a, enabled: !a.enabled }))}>{a.enabled ? 'Uitschakelen' : 'Inschakelen'}</button><button onClick={() => { if (window.confirm('Dit demoadres verwijderen?')) onChange(changed(settings, { ...settings, addresses: settings.addresses.filter(v => v.id !== a.id) }, 'Voorkeursadres verwijderd')); }}>Adres verwijderen</button></div>)}
      <form className="trip-editor" onSubmit={e => { e.preventDefault(); attempt(() => { onChange(saveAddress(settings, { ...address, id: address.id || crypto.randomUUID() })); setAddress({ id: '', label: '', address: '', note: '', enabled: true }); }); }}>
        <label>Naam voorkeursadres<input required maxLength={100} value={address.label} onChange={e => setAddress({ ...address, label: e.target.value })} /></label>
        <label>Voorkeursadres<input required maxLength={450} value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} /></label>
        <label>Adresnotitie<textarea maxLength={1000} value={address.note} onChange={e => setAddress({ ...address, note: e.target.value })} /></label><button className="secondary">{address.id ? 'Adreswijziging toepassen' : 'Demoadres toevoegen'}</button>
      </form>
      {message && <p role="status">{message}</p>}
      <details className="demo-history"><summary>Instellingshistorie ({settings.history.length})</summary><p>Lokale before/after-historie, geen geverifieerde serveraudit.</p>{settings.history.map((h, i) => <details key={i}><summary>{h.kind} · {h.occurredAt}</summary><pre>{h.before}</pre><pre>{h.after}</pre></details>)}</details>
    </section>
  </div>;
}
