# Actuele open werkkaart — 19 oktober2026

Gerichte actualisatie op basis van actuele CLOUD_TASKS/RESUME/masterprompt en open PR-keten; geen herhaling van afgeronde documentaudit. Alle123REQ-ID's en21scenario's blijven behouden. Deze kaart vervangt niet de volledige eisenregistratie. “Gebouwd” betekent ter controle, niet geaccepteerd of live.

| Onderdeel | Status / concrete vervolgstap |
|---|---|
| Code-/documentoverdracht en integriteitsguards | Gebouwd; PR#1–#5 wachten op controle, geen code-ontbreektblokkade meer |
| Centrale ritten, instellingen, correctie/audit en vaste CSV-rapporten | Gebouwd ter controle in PR#6–#16; functionaliteit/integratie staat in bewijsdocumenten |
| Samenhangend verversen | Gebouwd in nieuwste groep; begrensde transactionele full refresh. Incremental cursor, auto-sync en drie echte gelijktijdige accounts nog open |
| Herstelbare invoer/offline | Opt-in create-trip/create-report recovery via IndexedDB gebouwd en tabsluiten/accountwissel/verlorenresponse/revocation getest; geen automatische resend. Queue voor instellingen/correcties, offline starten, profielrestart/Safari en opslag-eviction blijven open. PENDING_RECOVERY.md |
| Detectie-inname en deduplicatie | Open: geautoriseerde geregistreerde apparaten, herhaalbare detectie-inname, voorlopig/bewijs/overlapworkflow. Overlapbeleidskern alleen is geen werkende native detectie |
| Accounts en Access | Mac voert dashboardtaak uit; daarna actuele app/policy/issuer/AUD teruglezen, interne gebruikers/voertuigrechten expliciet provisionen en echte login/logout/revocation testen. Geen livewijzigingen zonder eigenaar |
| Kaarten/GPS/routes | Scoped routepunten-read met highwaterpaginatie en schematische opgeslagen-puntenviewer gebouwd; lege route wordt niet verzonnen, gaten/bronlabels aanwezig. Opname/device-inname, echte kaartprovider/routes, retentie en hardware nog open. Geen betaalde API geactiveerd |
| PDF/rapporten | Vaste rapportweergave/browserPDF gebouwd en lange Chromium-export getest; afzonderlijke serverPDF, Safari/iPhone en toegankelijkheids-/fiscale acceptatie open |
| Backup en herstel | Lokale encrypted SQLite backup/restore met versie/AES-GCM, integriteitscontrole en herstel naar nieuw pad gebouwd;5tests inclusief echt RitKompas-schema/audit/triggers PASS. RemoteD1/export, planning/offsite/keybeheer/crashproef en productieherstel blijven open. SQLITE_BACKUP.md |
| Read-only MCP | Zes begrensde read-onlytools en gesloten runtimeadapter gebouwd; scoped synthetische tests PASS. Externe OAuth/consent/clientcompatibiliteit/ratequota nog open; geen externe koppeling geactiveerd. READ_ONLY_MCP.md |
| Native iPhone | Open: nativecode, simulator/appsigning en permission/achtergrondflow; fysieke iPhone/Bluetooth/CarPlay/Jeep/OBD2 via Mac. Cloud kan contracten/testfixtures/nativebroncode voorbereiden |
| Instellingenhistorie | Keysetpaginatie oudere rit- en instellingenhistorie gebouwd, HTTP/SQL en browser met125regels/type/getussentijdse nieuwe audit/refresh/revocation PASS. Geen onbeperkte éénmalige dump; perpagina100/50 |
| Security/privacy en operationeel | Gerichte regressies aanwezig; volledige onafhankelijke audit, concrete bewaartermijnen/verwijdering, logging/quotabelasting, sessierevocatie en productieherstel nog open |
| Eigenaarscontrole | Main-regels eerder bevestigd; aparte GitHub-identiteit/onafhankelijke review nog open. Geen agentmerge |

De draft-PR-keten wordt per ontwikkelgroep uitgebreid. Dat zijn review-/acceptatiepunten, geen zestien ongebouwde functies. Bestaande keten behouden; geen PR/main automatisch samenvoegen of als voltooid sluiten. Nieuwste ontwikkeling wordt als volgende draft op de bestaande keten opgeslagen.

Geen nieuwe livepublicatie/kosten. Persoonlijke beslissingen, toestemming voor publicatie, echte provideridentiteiten en hardware blijven bij eigenaar/Mac. Deze afhankelijkheden blokkeren niet alle lokale ontwikkeltaken.
