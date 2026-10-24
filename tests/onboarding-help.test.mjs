import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const login=readFileSync(new URL('../app/login/page.tsx',import.meta.url),'utf8');
const help=readFileSync(new URL('../app/hulp/page.tsx',import.meta.url),'utf8');
test('remember remains opt-in, accessible and before credentials with explicit submit',()=>{
 assert.ok(login.indexOf('name="remember"')<login.indexOf('name="email"'));
 assert.match(login,/name="remember" type="checkbox" aria-describedby="remember-help"/);
 assert.doesNotMatch(login,/defaultChecked|checked=\{true\}/);
 assert.match(login,/button type="submit" disabled=\{busy\|\|!ready\}>Inloggen/);
 assert.match(login,/remember:data.get\('remember'\)===\x27on\x27/);
 assert.match(login,/href="\/hulp"/);
});
test('public onboarding guide has no personal invite or misleading native availability',()=>{
 for(const text of ['Spam','Ongewenste e-mail','Wachtwoord opslaan','minstens 12 tekens','Zet op beginscherm','Open als webapp','Voeg toe aan Dock','Pagina installeren als app','nog niet allemaal af en op echte toestellen getest'])assert.ok(help.includes(text),text);
 assert.doesNotMatch(help,/access_token=|refresh_token=|token_hash=|@devoetel|@hotmail/);
 assert.match(help,/Deze uitleg is niet je uitnodiging/);
 assert.match(help,/Je hebt internet nodig/);
});
test('account and help links use full document navigation, not the failing deployed Link handler',()=>{
 for(const source of [login,help]){assert.doesNotMatch(source,/from ['"]next\/link['"]/);assert.match(source,/<a href=\{href\}/);}
});
