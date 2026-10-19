// Run after central-browser-smoke; needs installed poppler pdfinfo/pdftotext.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const path=process.argv[2];if(!path)throw Error('Supply central-long-snapshot.pdf from browser smoke.');
const info=execFileSync('pdfinfo',[path],{encoding:'utf8'}),text=execFileSync('pdftotext',['-layout',path,'-'],{encoding:'utf8'});
const pages=Number(/^Pages:\s+(\d+)/m.exec(info)?.[1]);assert.ok(pages>=2&&pages<=25,`Unexpected pagination: ${pages}`);
const compact=text.replace(/\s/g,'');for(let index=0;index<80;index++)assert.ok(compact.includes('Destination'+index),'Missing destination '+index);
assert.match(text,/NIET FISCAAL GOEDGEKEURD/);assert.ok((text.match(/Bestuurder/g)||[]).length>1,'Repeated table headers missing');assert.ok(!text.includes('Rit handmatig toevoegen'));assert.ok(!text.includes('Voertuiginstelling'));assert.match(info,/A4/);
console.log(`PASS ${pages}-page A4 browser PDF: 80 synthetic destinations, repeated headers, disclaimer and no edit forms. No Safari/native/server-PDF claim.`);
