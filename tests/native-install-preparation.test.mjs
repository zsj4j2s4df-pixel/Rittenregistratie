import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const file=p=>readFileSync(new URL('../'+p,import.meta.url)),hash=p=>createHash('sha256').update(file(p)).digest('hex');
const base='ios/RitKompasApp/RitKompasApp/';
test('native brand uses exact approved master and native preview uses approved bundled photo',()=>{
 assert.equal(hash(base+'Assets.xcassets/RitKompasBrand.imageset/brand.png'),hash('public/brand/ritkompas-mark-approved.png'));
 assert.match(file(base+'NativeAccountView.swift').toString(),/Image\("RitKompasBrand"\)/);
 assert.match(file(base+'ReviewPrototypeView.swift').toString(),/UIImage\(named: "JeepOffroad"\)/);
 assert.equal(JSON.parse(file(base+'Assets.xcassets/JeepOffroad.imageset/Contents.json')).images[0].filename,'jeep.jpg');
});
test('native test build preserves existing identity and explicit foreground-only capture',()=>{
 const project=file('ios/RitKompasApp/RitKompasApp.xcodeproj/project.pbxproj').toString();
 assert.equal((project.match(/CURRENT_PROJECT_VERSION = 2;/g)??[]).length,2);
 assert.match(project,/PRODUCT_BUNDLE_IDENTIFIER = com.example.RitKompasApp;/);
 assert.doesNotMatch(project,/UIBackgroundModes|NSLocationAlways|DEVELOPMENT_TEAM/);
 assert.match(file(base+'NativeAccountView.swift').toString(),/capture.stop\(\)/);
 assert.match(file(base+'NativeCaptureView.swift').toString(),/requestWhenInUseAuthorization/);
 assert.match(file(base+'ContentView.swift').toString(),/Afzonderlijke ontwerpproef bekijken/);
});
