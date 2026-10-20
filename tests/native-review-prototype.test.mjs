// Source-contract checks; measured Apple build/UI evidence is separate.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ui=read('ios/RitKompasApp/RitKompasApp/ReviewPrototypeView.swift');
test('design review is explicitly a synthetic shell without capture or backend',()=>{
 assert.match(ui,/ONTWERPPROEF/);assert.match(ui,/Fictieve voorbeeldrit/);
 assert.doesNotMatch(ui,/URLSession|APIClient\(|SessionGrant\(|startUpdatingLocation|requestAuthorization|UNUserNotificationCenter/);
 assert.match(ui,/Geen GPS, afstandsmeting of achtergrondregistratie/);
});
test('owner photo is optional, private, ignored and not an external resource',()=>{
 assert.match(ui,/Bundle\.main\.path\(forResource: "PrivateJeep", ofType: "jpg"\)/);
 assert.match(read('.gitignore'),/^\/ios\/RitKompasApp\/RitKompasApp\/PrivateJeep\.jpg$/m);
 assert.doesNotMatch(ui,/https?:\/\/|\/Users\//);
});
test('review retains real preparation view and user-controlled local feedback',()=>{
 assert.match(read('ios/RitKompasApp/RitKompasApp/ContentView.swift'),/NativePreparationView\(\)/);
 assert.match(ui,/@AppStorage\("ritkompas\.designReviewNotes\.v1"\)/);
 assert.match(ui,/Nog niet met de ontwikkelaar gedeeld/);
 assert.match(ui,/UIActivityViewController\(activityItems: \[text\]/);
 assert.match(ui,/feedbackContext = "03 · Ritdetails"/);
});
