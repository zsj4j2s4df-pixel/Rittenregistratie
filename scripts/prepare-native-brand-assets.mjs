// Technical format conversion of approved publication copies only; no new artwork.
import {copyFileSync,mkdirSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {default:sharp}=await import(process.env.SHARP_MODULE??'sharp');
const root='ios/RitKompasApp/RitKompasApp/Assets.xcassets/';
for(const name of ['RitKompasBrand','JeepOffroad'])mkdirSync(root+name+'.imageset',{recursive:true});
copyFileSync('public/brand/ritkompas-mark-approved.png',root+'RitKompasBrand.imageset/brand.png');
await sharp('public/brand/jeep-offroad.webp').jpeg({quality:94,mozjpeg:true}).toFile(root+'JeepOffroad.imageset/jeep.jpg');
for(const name of ['RitKompasBrand.imageset/brand.png','JeepOffroad.imageset/jeep.jpg']){const path=root+name;console.log(path+' '+createHash('sha256').update(readFileSync(path)).digest('hex'));}
