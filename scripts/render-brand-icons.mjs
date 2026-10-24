// Resize/re-encode the exact owner-approved image; no design changes or AI/API call.
// Supply an installed sharp module path as argv[2] if not locally resolvable.
import {readFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const sharp=(await import(process.argv[2]??'sharp')).default;
const root=new URL('../',import.meta.url),source=readFileSync(new URL('public/brand/ritkompas-mark-approved.png',root));
const outputs=[['public/brand/ritkompas-icon-192.png',192],['public/brand/ritkompas-icon-512.png',512],['public/brand/ritkompas-apple-touch.png',180],['ios/RitKompasApp/RitKompasApp/Assets.xcassets/AppIcon.appiconset/RitKompasAppIcon.png',1024]];
for(const [path,size] of outputs){const destination=new URL(path,root);mkdirSync(fileURLToPath(new URL('./',destination)),{recursive:true});await sharp(source,{density:144}).resize(size,size).flatten({background:'#D7C39E'}).removeAlpha().png().toFile(fileURLToPath(destination));console.log('Rendered '+path+' '+size+'x'+size+' opaque RGB');}
