// Source contracts only, not evidence of real GPS/permissions/background/auth.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const capture=read('ios/RitKompasApp/RitKompasApp/NativeCaptureView.swift');
const host=read('ios/RitKompasApp/RitKompasApp/NativeAccountView.swift');
test('capture is a separate opt-in with explicit private-backend transmission',()=>{
 assert.match(capture,/func start\(\)/);
 const init=capture.slice(capture.indexOf('override init()'),capture.indexOf('func configure'));
 assert.doesNotMatch(init,/startUpdatingLocation|requestWhenInUseAuthorization/);
 assert.match(capture,/Alleen Verzenden/);assert.match(capture,/Geen achtergrondopname/);
 assert.doesNotMatch(capture,/requestAlwaysAuthorization|allowsBackgroundLocationUpdates = true/);
});
test('capture closes with the same account and stops on loss of active phase',()=>{
 assert.match(host,/capture\?\.disconnect\(\)/);
 assert.match(host,/await oldCapture\?\.close\(\)/);
 assert.match(host,/if value != \.active \{ resetForm\(\); capture\.stop\(\) \}/);
 assert.match(host,/NativeCaptureOutbox\(persistence: EncryptedChoiceQueuePersistence/);
 assert.match(capture,/sending\?\.cancel\(\)/);
});
test('sensor and API keep seconds distinct from session milliseconds and do not create trips',()=>{
 assert.match(capture,/Int64\(Date\(\)\.timeIntervalSince1970\)/);
 const outbox=read('ios/RitKompas/Core/NativeCaptureOutbox.swift');
 assert.match(outbox,/unverified_app_observation/);
 assert.match(outbox,/payload == CapturePayload/);
 assert.doesNotMatch(outbox,/classification: \.private|driverID|\/trips|journeys/);
 assert.match(outbox,/record\.inputs\.count.*96/);
});
