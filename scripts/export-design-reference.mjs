// Export only reviewed presentation source from the private Mac preview.
// Never copy images, hosting metadata, Git history, credentials or browser data.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=process.argv[2];
if(!source||process.argv.length!==3)throw Error('Usage: node scripts/export-design-reference.mjs PRIVATE_SITE_DIRECTORY');
const target=path.join(root,'prototypes/design-reference');
mkdirSync(target,{recursive:true});
const replacements=[
 ['jeep-offroad-v2.png','assets/jeep-placeholder.svg'],
 ['ritkompas-mark.jpg','assets/brand-placeholder.svg'],
 ['jeep.jpg','assets/jeep-placeholder.svg'],
 ['Jeep zonder trekhaak in een bewerkte offroad-omgeving met subtiel RitKompas-logo','Privébeeld niet meegeleverd in publieke bronreferentie'],
 ['Jeep zonder trekhaak in een bewerkte rotsachtige offroad-omgeving met subtiel RitKompas-logo','Privébeeld niet meegeleverd in publieke bronreferentie'],
 ['RitKompas: Willys Jeep met kompas en route','Merkplaceholder, geen definitief appicoon'],
 ['Alleen jouw Sites-account heeft toegang. Geen GPS of echte ritgegevens; de registratiebackend is niet aangesloten.','Bronreferentie met beeldplaceholders en fictieve ritten. De registratiebackend is hier niet aangesloten.'],
 ['Afgeschermde preview voor jouw account, inclusief je foto. Geen tracking, externe fonts, echte ritgegevens of verbinding met de registratiebackend. Deel geen aanmeldcodes.','Veilige bronreferentie zonder eigenaarfoto, echte adressen, aanmelding of registratiebackend. Dit is geen uitgerolde echte rittenapp.'],
 ['RitKompas — privé appontwerp','RitKompas — veilige ontwerpbronreferentie']
];
for(const name of ['index.html','design-v2.css','design-v2.js']){
 let text=readFileSync(path.join(source,'dist',name),'utf8');
 for(const [before,after]of replacements)text=text.replaceAll(before,after);
 if(/data:image\//i.test(text)||/\/Users\/|\/private\/tmp\/|\.chatgpt\.site|\.canva\.com/i.test(text))throw Error('Private source reference in '+name);
 if(/\.png|\.jpe?g|\.gif/i.test(text))throw Error('Unreviewed binary asset reference in '+name);
 writeFileSync(path.join(target,name),text);
}
console.log(JSON.stringify({exported:['index.html','design-v2.css','design-v2.js'],imagesCopied:0,hostingCopied:false,browserDataCopied:false}));
