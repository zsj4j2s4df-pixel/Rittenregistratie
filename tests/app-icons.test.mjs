import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
test('approved master and platform app icons are square opaque PNG at required sizes',()=>{
 for(const [path,size] of [['public/brand/ritkompas-mark-approved.png',1024],['public/brand/ritkompas-icon-192.png',192],['public/brand/ritkompas-icon-512.png',512],['public/brand/ritkompas-apple-touch.png',180],['ios/RitKompasApp/RitKompasApp/Assets.xcassets/AppIcon.appiconset/RitKompasAppIcon.png',1024]]){
  const b=read(path);assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(b.readUInt32BE(16),size);assert.equal(b.readUInt32BE(20),size);assert.equal(b[25],2,'RGB without alpha');
 }
 const icons=JSON.parse(read('ios/RitKompasApp/RitKompasApp/Assets.xcassets/AppIcon.appiconset/Contents.json'));assert.ok(icons.images.every(x=>x.filename==='RitKompasAppIcon.png'));
});
test('webapp and apple icon metadata point to approved files without offline promises',()=>{
 const manifest=JSON.parse(read('public/manifest.webmanifest'));assert.equal(manifest.start_url,'/ritten');assert.equal(manifest.scope,'/');assert.equal(manifest.display,'standalone');assert.deepEqual(manifest.icons.map(x=>x.sizes),['192x192','512x512']);
 const layout=read('app/layout.tsx').toString();assert.match(layout,/manifest.webmanifest/);assert.match(layout,/ritkompas-apple-touch.png/);assert.match(read('app/brand.tsx').toString(),/ritkompas-mark-approved.png/);
});
test('all approved publication copies have matching manifest hashes',()=>{
 const manifest=JSON.parse(read('public/brand/asset-manifest.json'));
 for(const item of manifest.assets){const bytes=read('public'+item.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);}
});
test('navigation Willys has upright split windshield, separate tires and seven grille slots',()=>{
 const web=read('app/web-icons.tsx').toString(),native=read('ios/RitKompasApp/RitKompasApp/ReviewPrototypeView.swift').toString();
 assert.match(web,/35\.6,40\.4,45\.2,50,54\.8,59\.6,64\.4/);assert.match(web,/M50 16v14/);assert.match(web,/height="32"/);assert.match(native,/0\.356\+CGFloat\(i\)\*0\.048/);assert.match(native,/0\.50,0\.16/);
});
