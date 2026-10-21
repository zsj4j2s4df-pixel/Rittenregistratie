# Mac vervolgt PR59 — 21 oktober 2026

## Ontvangst en behoud

PR59 exact ontvangen: `accfb507c431e8a1a2845e16efbc912ce4e5f417`, boven PR58.
De gebruiker vroeg in deze Mac-chat door te gaan met PR59 en de andere Cloudchat.
Cloud-eigenaarsberichten over native/web/release en Dennis/Ingrid/Jesse gelezen.
Ook lokale chat “Voer pr59 uit” gelezen: die stopte met modelcapaciteitsfout.
Zijn ongecommitte wijzigingen zijn behouden, gelezen, gecorrigeerd en hieronder
als gezamenlijke vervolgbron getest; geen reset/overschrijving of nieuwe agent.

## Geïmplementeerde bron, niet verwarren met live acceptatie

- Native host heeft nu Centrale registratie, expliciete interactieve Accesslogin
  in nonpersistent WKWebView, eigen Keychain-credentialstore en server-scoped
  voertuigselectie. Geen Safari-cookie-import, DOMtokenscraping, fakegrant,
  JWT-payloadidentity of extra gebruikersrechten. Een kandidaat wordt pas na
  servercontrole bewaard, WhenUnlockedThisDeviceOnly, geen iCloudsync.
- APIClient, duurzame keuzeworkflow, pendingproducer en meldingdelegate gebruiken
  dezelfde VerifiedNativeSession. Voertuigwissel sluit oude binding; logout sluit
  lokaal, wist schermscope en verwijdert credential. Mislukte Keychaindeletie
  wordt expliciet gemeld, niet verborgen achter een succesmelding.
- Centrale native adressen-GET/PATCH: meerdere zakelijke en privélocaties,
  klant/leverancier, bewerken/actief/deactiveren/verwijderen met bevestiging en
  verplichte reden. Geen tweede adresbackend. Gehele Desert/Anthracite-keuze ook
  beschikbaar in de echte centrale interface; aparte ontwerpproef blijft gelabeld.
- Exacte settingsaanvraag vóór netwerkmutatie in versleutelde scoped recovery;
  na herstart uitsluitend expliciete identieke retry. Andere wijziging mag een
  onzekere request niet vervangen. Acknowledge uitsluitend dezelfde aanvraag.
  Nieuwe reentrancyguard voorkomt overlappende writes; close wacht lopende
  schijfactie af vóór scope opnieuw wordt geopend. Geen stil verlies/reset/import.
- Publieke originele De Voetel-GIF toegevoegd; herkomst/hash in
  `ios/RitKompasApp/ASSET_PROVENANCE.md`. PrivéJeep/Canva nooit gestaged.
- Webdatumvelden kunnen binnen hun grid krimpen, 44pxtarget/focus behouden;
  bredeschermworkspace gebruikt maximaal1600px. Geen Sites-/livepublicatie.
- Native-controlescript geeft de echte iOS-Coremodule door aan de UI-check;
  macOS-/iOSmodules niet door elkaar gebruiken.

## Werkelijk uitgevoerd bewijs

- 50 echte macOS-XCTest,0failures: oorspronkelijke41 plus credential3,
  settingsrecovery5 en vehiclebinding-close1. Synthetische sessies/adressen;
  geen echte eigenaarlogin of driepersoons-accountbewijs.
- Corelibrarybuild en iPhoneOS-SDK Swift6 Core/UI semantische controle PASS.
- Volledige actuele unsigned simulator- én deviceappbuild PASS. Geen signing,
  certificaat, provisioning, fysieke installatie of AppStore/TestFlightupload.
- Volledige276 Node/backendtests PASS (273 bestaande plus3 nieuwe native-host
  sourceguards); TypeScript en volledige lint PASS.
  Sourceguards zijn geen native runtime-/authacceptatie.
- Diffcontrole schoon; beperkte geheimenpatrooncontrole383bestanden en952
  historischeblobs zonder bevindingen, plus handmatige selectie. Geen volledige
  securitygarantie. Alleen publiek bedrijfslogo als binary toegevoegd.
- Lokale Chromium → echte gedeelde HTTP/SQLite: twee adressen per categorie,
  klant/leverancier, centraal teruglezen, Desert na reload, expliciete ritadreskeuze,
  geen afstand-/classificatiewijziging, historie na rename/delete en dataverbergen
  bij aanmeldverlies PASS. Layout375/390/844/1280/1440/1920: geen horizontale of
  datumveldoverflow; datumvelden minimaal44px. Geen echte Safari/iPhonepass.
- Aanvankelijke sandboxcheck faalde uitsluitend op niet-schrijfbare Applecache;
  dezelfde officiële toolchain mocht daarna met normale cachetoegang controleren.
  Eerste browsertest strandde op sandbox/localhostadres; definitieve gelokaliseerde
  localhostproef hierboven PASS. Geen toolchain-/dependency-installatie.

## Cloudflare — betere toegang gevonden, release NIET uitgevoerd

Plugin whoami geeft opnieuw MCP-32603 Internal error. Niet blijven herhalen,
geen verborgen credentials zoeken. De bestaande Codex-IAB-tab is WEL ingelogd:
Worker rittenregistratie/Production/Access toont All traffic + Cloudflare account
members Allow. Deployments toont actieve versieprefix `ba2a2a9d`,100%traffic,
Ready, PR45-releaseomschrijving met0008–0015. Dit is actuele UI-readback van
versieprefix/verdeling/toegangsbeleid, geen volledige API-/bindings-/D1verificatie.

Nieuwste toestemming uit PR59 blijft geldig voor de gecontroleerde huidige
website/backendupdate en additieve0016. Er is geen actuele database-export,
versleutelde geverifieerde back-up/upgradeproef, volledig schema/ledger/integrity-
of exacte bindingsreadback voor die release beschikbaar in deze run. Daarom GEEN
upload/migratie/deployment/restore/Accesswijziging uitgevoerd. Geen oude back-up of
Cloudmanifest als actueel bewijs gebruikt. Geen code-onlyrollback naar vóór0016
beloven zodra privéadressen bestaan. Herstel bestaande connector-/CLItoegang
via eigenaarroute, voer exact PR59-releasepreflight uit en publiceer daarna pas.
Niet opnieuw toestemming voor dezelfde al toegestane release vragen.

## Echte acceptatie en noodzakelijke vervolgstappen

Mac was bij Computer Use vergrendeld; om handmatig ontgrendelen gevraagd. Geen
beveiliging omzeild. `devicectl` meldt nu opnieuw geen toestellen. Native UI visueel,
WKWebViewlogin/Keychainherstart, echte accountwissel, OS-meldingen en installatie
zijn daarom NIET GETEST. Buildpass is niet genoeg; server-scopeendpoint kan op de
oude liveversie nog ontbreken. Eerst gecontroleerde release en daarna werkelijke
native auth/centrale save/read/reload/exactretry toetsen.

Dennis, Ingrid, Jesse: alle echte login-/rechten-/opslaan-/historie-/wissel- en
receiptgevallen NIET GETEST. Laat ieder persoonlijk aanmelden; geen wachtwoorden,
codes, emails/locaties/tokens/screenshots met privégegevens naar GitHub. Geen
identityprovisioning of extra rechten om een test groen te maken.

Volgende veilige groep: gerichte simulatorbediening na ontgrendelen; huidige
releasepreflight zodra bestaande toegang werkt; persoonlijke Xcode-/toestel-/
PersonalTeamkeuze en gratis development-installatie volgens
`IPHONE_TESTAPP_INSTALLEREN.md`. Geen unsignedIPA-downloadlink beloven.

Automatische capture/GPS/lifecycle/EV/twee-minutenstop/achtergrond zijn nog OPEN;
de huidige source kan niet als volwaardige automatische rittenapp worden gemeld.
CarPlay/Jeep/OBD2/hardware en drie-iPhoneprioriteit NIET GETEST, geen entitlement
of aankoop. Copilot blijft alleen-lezen MCP-bron, geen echte OAuth/client/werkgever-
koppeling of kosten. Bestaand plan in MAC_FINISH_AND_RELEASE blijft leidend.

Geen mainmerge/forcepush/kosten/liveactie of privéassetpublicatie.
