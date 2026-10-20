import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
const base=new URL('../prototypes/design-reference/',import.meta.url);
const read=name=>readFileSync(new URL(name,base),'utf8');
test('export contains only reviewed presentation source and neutral placeholders',()=>{
 assert.deepEqual(readdirSync(base).sort(),['README.md','assets','design-v2.css','design-v2.js','index.html']);
 assert.deepEqual(readdirSync(new URL('assets/',base)).sort(),['brand-placeholder.svg','jeep-placeholder.svg']);
 for(const name of ['index.html','design-v2.css','design-v2.js']){
  const source=read(name);
  assert.doesNotMatch(source,/data:image|\/Users\/|\/private\/tmp\/|\.chatgpt\.site|\.canva\.com|\.(png|jpe?g|gif)/i);
 }
});
test('reference JavaScript parses and all local HTML media/scripts/styles exist',()=>{
 new Script(read('design-v2.js'));
 for(const match of read('index.html').matchAll(/(?:src|href)="([^"]+)"/g)){
  const ref=match[1].split(/[?#]/)[0];
  if(!ref||/^(https?:|mailto:|tel:)/.test(ref))continue;
  assert.ok(existsSync(new URL(ref,base)),ref);
 }
});
test('handover distinguishes safe reference from actual requested integration',()=>{
 const doc=readFileSync(new URL('../docs/TRANSFER/OWNER_DESIGN_REGISTRATION_HANDOVER.md',import.meta.url),'utf8');
 for(const term of ['zonder scrollen','Willys','De Voetel','Desert','privélocaties','settings-service','NIET GETEST'])assert.ok(doc.includes(term),term);
 assert.match(read('README.md'),/backend|registratie/);
});
