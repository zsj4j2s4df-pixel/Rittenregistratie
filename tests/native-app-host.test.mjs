// Source-contract guards only; actual Apple builds/tests remain Mac evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const project=read('ios/RitKompasApp/RitKompasApp.xcodeproj/project.pbxproj');
test('one native app host reuses only the existing local package',()=>{
 assert.equal((project.match(/productType = "com\.apple\.product-type\.application"/g)??[]).length,1);
 assert.match(project,/isa = XCLocalSwiftPackageReference/);
 assert.match(project,/relativePath = \.\.;/);
 assert.match(project,/productName = RitKompasPreparationUI/);
 assert.doesNotMatch(project,/XCRemoteSwiftPackageReference|repositoryURL/);
});
test('native host retains iOS15 and Swift6 without selecting an Apple team',()=>{
 assert.equal((project.match(/IPHONEOS_DEPLOYMENT_TARGET = 15\.0;/g)??[]).length,2);
 assert.equal((project.match(/SWIFT_VERSION = 6\.0;/g)??[]).length,2);
 assert.equal((project.match(/TARGETED_DEVICE_FAMILY = 1;/g)??[]).length,2);
 assert.doesNotMatch(project,/DEVELOPMENT_TEAM|PROVISIONING_PROFILE|CODE_SIGN_ENTITLEMENTS/);
 assert.match(project,/PRODUCT_BUNDLE_IDENTIFIER = com\.example\.RitKompasApp/);
});
test('host does not silently introduce background modes or automatic capture',()=>{
 assert.match(project,/INFOPLIST_KEY_NSLocationWhenInUseUsageDescription/);
 assert.doesNotMatch(project,/UIBackgroundModes|NSLocationAlways|NSBluetooth|com\.apple\.developer\.carplay/);
 const bootstrap=read('ios/RitKompasApp/RitKompasApp/RitKompasAppApp.swift');
 const view=read('ios/RitKompasApp/RitKompasApp/ContentView.swift');
 assert.match(bootstrap,/@main/);
 assert.match(view,/import RitKompasPreparationUI/);
 assert.match(view,/NativePreparationView\(\)/);
 assert.doesNotMatch(bootstrap+view,/startUpdatingLocation|requestAuthorization|registerForRemoteNotifications|SessionGrant\(/);
});
test('shared build scheme references the single app and no signing/download script',()=>{
 const scheme=read('ios/RitKompasApp/RitKompasApp.xcodeproj/xcshareddata/xcschemes/RitKompasApp.xcscheme');
 assert.match(scheme,/BlueprintName="RitKompasApp"/);
 assert.doesNotMatch(scheme,/ExecutionAction|shellScript|allowProvisioningUpdates/);
});
