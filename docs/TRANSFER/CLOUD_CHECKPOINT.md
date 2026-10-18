# Cloud-checkpoint — 18 oktober 2026

Dit is een gedeeltelijke implementatie, geen voltooide RitKompas-app. Bestaande 123 REQ-ID's/21 scenario's blijven gelden. Geen nieuwe totaalaudit: onderstaande delta verbindt de uitgevoerde groepen met bestaande eisen en concrete resterende stappen.

## Op GitHub ter controle
| PR | Resultaat | Gate |
|---|---|---|
| [#4](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/4) | Cloud-overdracht/CSV0/ACT-002 | baseline31 →32tests; type/lint/build PASS |
| [#5](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/5) | Additieve integriteitsguards |37tests; type/lint/build PASS |
| [#6](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/6) | Demo-ritinvoer, instellingen, historische rapporten, CSV/browser-PDF, routekeuze |50tests; type/lint/build; Chromium desktop/mobiel/CSV/PDF PASS |
| [#7](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/7) | Objectrechten, revisions, atomische correctie/audit, bronbehoud |61tests; type/lint/build; lokale D1 PASS |
| [#8](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/8) | Idempotente serverritinvoer/receipt/audit |65tests; type/lint/build; lokale D1 concurrency/rollback PASS |
| [#9](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/9) | HTTP-adapter met CSRF/bytegrenzen/requestscope |71tests; type/lint/build; lokale D1 HTTP PASS |

Keten #1→#2→#3→#4→#5→#6→#7→#8→#9 behouden, geen merge/forcepush. main ongewijzigd. Bronbestanden van #7–#9:23/23 exact teruggelezen op d42bc91273dcd451db96a6a714a22f9db1e4f4da. Voortgangsdocumenten krijgen vervolgens deze checkpointactualisatie op dezelfde branch.

## Eisen: gedeeltelijk bewijs, geen volledige acceptatie
- REQ-010/029/031/055: audit en correctie/retry kern getest; geen volledige native/sync/deduplicatiehistorie.
- REQ-030/037–042/056–060: demoschermen/filters/routeherkomst en beide thema's; nog geen echte GPS-kaart of gebruikersgebonden duurzame voorkeur.
- REQ-033–036/043–055: demo-adres-/tariefbeheer, snapshotrapporten, waarschuwingen en veilige CSV/browser-PDF; geen centrale rapportopslag of fiscale certificering.
- REQ-046: handmatige serverafstandscorrectie wordt manual met eerste bron/afstand behouden; geen hardwaremeting bewezen.
- REQ-008/093–095/099–101: objectrechten, scoped SQL, revocation, revisionconflict en transactionele audit; accounts, sessieprovider, volledige datamodeldekking, bewaarbeleid/back-up/herstel en centrale UI ontbreken.
- REQ-096/122: twee gerichte serverkerncodelezingen plus gerichte vervolgchecks; geen twee afgeronde audits van een productieapp.
- REQ-001/009/011–028/076–092/097–098: native detectie, hardware, volledige deduplicatie, voertuigverificatie en MCP niet opgeleverd; officiële bestaande onderzoeken behouden.

## Volgende uitvoerbare taken (Cloud)
1. Duurzame instellingen/tarieven/adressen/rapporten: bestaande tabellen hergebruiken, voertuigscope/migratie van oude records expliciet, integer-geldvalidatie, revision/audit. Acceptatie: cross-vehicle deny, tariefoverlap, rollback en historische rapporten getest. Niet twee parallelle bronnen van waarheid maken.
2. Accounts/sessionprovider adapter na keuze: echte verificatie, expiry/revocation, cookiebeleid, bootstrap leden en three-user-e2e; nooit header-identiteit. Providerneutrale code/tests kunnen al lokaal.
3. Web koppelen aan geverifieerde backend: herladen bewaart data, drie gebruikers zien correcte updates; retry/conflicten, offline/onbereikbaar duidelijk; demosessie afzonderlijk herkenbaar houden.
4. Detectie-inname/idempotentie en bewijsgestuurde deduplicatie, zonder priority als bestuurdersbewijs. Geen route vervangen of onzekere rit automatisch zakelijk maken.
5. Backup/herstel, dataminimalisatie/bewaartermijnen, exportrechten en read-only MCP boven dezelfde backend; Copilot eerst onderzoeken, werkgeverstoestemming niet aannemen.
6. Native iOS-code/build op Mac, daarna echte iPhone/achtergrond/GPS/Jeep/CarPlay/OBD2-tests waar ondersteund. Geen Xcode/Swift-runtime beschikbaar in deze Linux-omgeving; geen native buildclaim.

Er zijn nog zelfstandig uitvoerbare technische taken. Hosting/authbesluit blokkeert externe inrichting en een echte centrale end-to-endtest; het is geen algemene blokkade op programmeren.

## Alleen eigenaar kan besluiten
Zie OWNER_ACTIONS.md voor concrete opties:
- ACT-002: drie main-regels zijn bevestigd; kies aparte agentidentiteit met echte eigenaarsreview, of voorlopig procedureel alleen zelf mergen. Huidige connector gebruikt jouw eigenaaridentiteit. Geen account/koppeling wijzigen zonder toestemming.
- ACT-003: hosting/loginvoorkeur; aanbevolen onderzoeksspoor bestaande Cloudflare/D1-stack plus beheerde verifieerbare login. Geen dienst gekozen/geactiveerd of kosten toegezegd; alternatief eigen hosting vergt aparte afweging.
- ACT-004 later: Apple-distributie en praktijktests, pas nadat Mac een bruikbaar pakket heeft. Nu geen aankoop nodig.

Alle PR’s blijven draft/open. Main-merge en productiepublicatie vereisen altijd expliciete eigenaarstoestemming. Geen geheimen of echte ritgegevens nodig om deze keuzes door te geven.
