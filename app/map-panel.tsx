'use client';
import { useState } from 'react';
import type { Trip } from './trip-domain';

export function MapPanel({ trips }: { trips: Trip[] }) {
  const [selected, setSelected] = useState(trips[0]?.id);
  const trip = trips.find(t => t.id === selected) ?? trips[0];
  const [from, to] = trip?.route.split(' → ') ?? [];
  return <div className="content-page">
    <label>Rit voor routeoverzicht<select aria-label="Rit voor routeoverzicht" value={trip?.id ?? ''} onChange={e => setSelected(Number(e.target.value))}>{trips.map(t => <option key={t.id} value={t.id}>{t.date} · {t.route}</option>)}</select></label>
    {trip ? <><section className="full-map"><div className="map-grid" aria-hidden="true" /><div className="map-overlay"><p className="eyebrow">Routegegevens</p><h2>{trip.route}</h2><p>{trip.quality}</p><p>{trip.date} · {trip.distance} km · {trip.driver}</p><p>Geen geregistreerde GPS-punten beschikbaar. Er is geen lijn getekend die een echte route suggereert.</p></div></section>
      <p>Optioneel: laat Apple Kaarten een route berekenen. Dit deelt vertrek en bestemming met Apple en vervangt de opgeslagen route niet.</p>
      <a className="secondary" target="_blank" rel="noopener noreferrer" href={`https://maps.apple.com/?saddr=${encodeURIComponent(from ?? '')}&daddr=${encodeURIComponent(to ?? '')}`}>Route berekenen in Apple Kaarten</a>
      <section className="map-legend"><div><span><b>Werkelijke GPS-route</b><small>Niet beschikbaar in deze demo</small></span></div><div><span><b>Berekende route</b><small>Alleen na openen van Apple Kaarten</small></span></div><div><span><b>Geschatte afstand</b><small>Herkomst blijft bij de rit vermeld</small></span></div></section></> : <p>Geen ritten beschikbaar.</p>}
  </div>;
}
