import type { VehicleSettings, StoredAddress } from '../../lib/settings-service.ts';
import { validateAddress } from '../demo-settings.ts';
import { validateRates, type MileageRate } from '../report-domain.ts';

export function parseRateMicros(input: string): number {
 const text=input.trim().replace(',', '.');
 if(!/^\d+(\.\d{1,6})?$/.test(text))throw Error('Vul een niet-negatief tarief in met maximaal zes decimalen.');
 const [whole,fraction='']=text.split('.');
 const value=BigInt(whole)*BigInt(1_000_000)+BigInt(fraction.padEnd(6,'0'));
 if(value>BigInt(1_000_000_000))throw Error('Het tarief mag maximaal 1000 euro per kilometer zijn.');
 return Number(value);
}
export function replaceSetting(settings:VehicleSettings, kind:'address', value:StoredAddress):VehicleSettings;
export function replaceSetting(settings:VehicleSettings, kind:'rate', value:MileageRate):VehicleSettings;
export function replaceSetting(settings:VehicleSettings, kind:'address'|'rate', value:StoredAddress|MileageRate):VehicleSettings {
 let next:VehicleSettings;
 if(kind==='address'){
  const address=value as StoredAddress;validateAddress(address);
  if((address.kind!==undefined&&!['business','private'].includes(address.kind))||(address.businessRole!==undefined&&!['customer','supplier'].includes(address.businessRole))||(address.kind==='private'&&address.businessRole!==undefined))throw Error('Controleer adressoort en zakelijke relatie.');
  const normalized={...address,label:address.label.trim(),address:address.address.trim(),note:address.note.trim()};
  next={...settings,addresses:settings.addresses.some(a=>a.id===value.id)?settings.addresses.map(a=>a.id===value.id?normalized:a):[...settings.addresses,normalized]};
 }else{
  const rate=value as MileageRate;
  const rates=settings.rates.some(r=>r.id===value.id)?settings.rates.map(r=>r.id===value.id?{...rate}:r):[...settings.rates,{...rate}];
  validateRates(rates);next={...settings,rates};
 }
 if(next.addresses.length+next.rates.length>40)throw Error('Maximaal 40 voorkeursadressen en tariefperioden samen.');
 return next;
}
