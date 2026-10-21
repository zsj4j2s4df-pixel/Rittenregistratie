// Source wiring guards only; real Apple builds/XCTest and owner login evidence
// must be reported separately. No live credentials or browser data are used.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const host=read('ios/RitKompasApp/RitKompasApp/NativeAccountView.swift');
test('native login uses isolated explicit Access login, not scraped/shared credentials',()=>{
 assert.match(host,/websiteDataStore = \.nonPersistent\(\)/);
 assert.match(host,/origin\.contains\(url\)/);
 assert.match(host,/\$0\.isSecure && \$0\.isHTTPOnly/);
 assert.doesNotMatch(host,/evaluateJavaScript|HTTPCookieStorage\.shared|CF-Access-Client-Secret|Bearer eyJ/);
 assert.match(host,/persistVerifiedCandidate\(\)/);
});
test('real account host uses central API and exact durable recovery before mutation',()=>{
 assert.match(host,/NativeAccountView/);
 assert.match(host,/api\.settings\(vehicleID: id, expectedViewerID: scope\.viewerID\)/);
 assert.ok(host.indexOf('try await recovery.save(retry)')<host.indexOf('try await client.saveSettings('));
 assert.match(host,/try await recovery\.acknowledge\(retry\)/);
 assert.match(host,/await oldRecovery\?\.close\(\)/);
 assert.match(host,/Locatie verwijderen/);assert.match(host,/Locatie actief/);
 assert.match(host,/NativeAppearanceTheme\.allCases/);
});
test('logout clears displayed scope and guards overlapping closing operations',()=>{
 assert.match(host,/guard !closingSession else/);
 assert.match(host,/settings = nil; pending = nil; actions = \[\]/);
 assert.match(host,/clearCredentials: true/);
 assert.match(host,/credentialDeletionFailed/);
 assert.match(host,/notifications\?\.bind\(store: UnconfiguredTripChoiceStore\(\)\)/);
 assert.match(host,/generation == started/);
 const bootstrap=read('ios/RitKompasApp/RitKompasApp/ContentView.swift');
 assert.match(bootstrap,/NativeAccountView\(\)/);
 assert.match(bootstrap,/Afzonderlijke ontwerpproef/);
});
