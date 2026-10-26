// Inspect actual Xcode output; source declarations alone are not Siri registration evidence.
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const app=resolve(process.argv[2]??'');
assert.ok(process.argv[2],'Pass the built RitKompasApp.app path');
const metadata=join(app,'Metadata.appintents');
const actions=JSON.parse(readFileSync(join(metadata,'extract.actionsdata'),'utf8')).actions;
for(const name of ['PrivateTripIntent','BusinessTripIntent']){
 const action=actions[name]; assert.ok(action,`Missing ${name}`);
 assert.equal(action.openAppWhenRun,false);
 assert.equal(action.availabilityAnnotations.LNPlatformNameIOS.introducedVersion,'16.0');
 assert.deepEqual(action.parameters,[]);
 assert.equal(action.isAuthPolExplicit,true);
}
const yaml=readFileSync(join(metadata,'root.ssu.yaml'),'utf8');
assert.match(yaml,/bundleIdentifier: com\.example\.RitKompasApp/);
assert.match(yaml,/locale: nl/);
assert.match(yaml,/Privé rit met \$\{\+applicationName\}/);
assert.match(yaml,/Zakelijke rit met \$\{\+applicationName\}/);
assert.doesNotMatch(yaml,/locale: en/);
console.log('PASS: built iOS16+ private/business actions, no app-open flag or parameters, Dutch training phrases. Not a Siri device-runtime test.');
