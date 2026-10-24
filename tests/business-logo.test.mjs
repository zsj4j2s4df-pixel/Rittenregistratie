import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('web and native use the same reviewed RGBA PNG without embedded metadata',()=>{
 const a=readFileSync(new URL('../public/brand/de-voetel-transparent.png',import.meta.url));
 const b=readFileSync(new URL('../ios/RitKompasApp/RitKompasApp/DeVoetelLogoTransparent.png',import.meta.url));
 assert.deepEqual(a,b);assert.equal(a.subarray(1,4).toString(),'PNG');assert.equal(a.readUInt32BE(16),1040);assert.equal(a.readUInt32BE(20),533);assert.equal(a[25],6,'RGBA colour type');
 const manifest=JSON.parse(readFileSync(new URL('../public/brand/asset-manifest.json',import.meta.url)));const item=manifest.assets.find(x=>x.path==='/brand/de-voetel-transparent.png');assert.ok(item);assert.equal(createHash('sha256').update(a).digest('hex'),item.sha256);
 let offset=8;while(offset<a.length){const length=a.readUInt32BE(offset),type=a.subarray(offset+4,offset+8).toString();assert.ok(!['eXIf','iTXt','tEXt'].includes(type),'unexpected embedded metadata');offset+=12+length;}
});
test('shared full themes retain readable action and text contrast',()=>{
 const tokens=JSON.parse(readFileSync(new URL('../docs/design/tokens.json',import.meta.url))),css=readFileSync(new URL('../app/brand.css',import.meta.url),'utf8');
 const light=h=>h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>(Math.max(light(a),light(b))+.05)/(Math.min(light(a),light(b))+.05);
 for(const theme of Object.values(tokens.themes)){for(const[k,v]of Object.entries(theme))assert.ok(css.includes(`--${k}:${v}`));for(const p of ['bg','panel','panel2'])for(const t of ['text','muted'])assert.ok(contrast(theme[t],theme[p])>=4.5);assert.ok(contrast(theme.accent,theme['on-accent'])>=4.5);}
});
