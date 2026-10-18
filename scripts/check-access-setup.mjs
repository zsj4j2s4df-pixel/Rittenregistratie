// Read a locally supplied sanitized snapshot. No network or deployment actions.
import {readFileSync} from 'node:fs';
import {reviewAccessSetup} from '../lib/access-readiness.ts';
if(!process.argv[2])throw Error('Gebruik: node --experimental-strip-types scripts/check-access-setup.mjs /pad/naar/private-snapshot.json');
const result=reviewAccessSetup(JSON.parse(readFileSync(process.argv[2],'utf8')));
console.log(JSON.stringify(result,null,2));if(!result.readyForOwnerReview)process.exitCode=1;
