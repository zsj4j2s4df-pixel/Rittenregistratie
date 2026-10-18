# Codeaudit — 17 oktober 2026

Uitgevoerd door centrale coördinator, **niet onafhankelijk**. Beide aangevraagde Astra-reviewagents stopten vóór beoordeling met een kredietlimiet. Geen credits aangeschaft. Geen securitygoedkeuring of productieacceptatie.

| ID / ernst | Bewijs | Risico en afhandeling |
|---|---|---|
| SEC-01 productieblokker | app/page.tsx useState; authhelper niet aangeroepen | Geen accounts, afscherming, centrale opslag of audittrail. Alleen demo gebruiken. Backend-ontwerp en autorisatietests vereist; niet als live datalek bestempeld omdat er geen echte gegevens/backend zijn. |
| SEC-02 hoog vóór integratie | app/chatgpt-auth.ts:11–25 vertrouwt identityheaders | Alleen veilig achter een vertrouwde gateway die aangeleverde headers verwijdert en identiteit controleert. Gateway niet bevestigd; helper nu ongebruikt. Niet aansluiten zonder authenticatie-/spoofingtests en keuze van vertrouwde provider. |
| DATA-01 hoog | db/schema.ts:36 recorded-default; schema mist kilometertellerstanden, centrale deduplicatie en volledige integriteitschecks | Schema is ontwerp, geen complete veilige registratie. Database/migratie niet gewijzigd in deze correctieronde. Geen echte data verwerken; eerst ontwerp en migratietests. |
| UI-01 hoog | app/page.tsx classificatietoast, GPS-teksten, 96%-score en duplicate-claim | Gecorrigeerd: tijdelijke wijziging expliciet niet opgeslagen; illustratie geen echte GPS-route; kwaliteit onbekend; duplicaten niet gecontroleerd. Altijd zichtbare demowaarschuwing, ook mobiel. |
| CSV-01 normaal, hoog bij latere vrije invoer | oude export quote-escape ontbrak | app/trip-utils.ts quote alle velden en neutraliseert formuleprefixen. Vijf unit-tests inclusief CSV-escaping. Geen bewijs van exploiteerbare invoer in oude statische demo. |
| CSV-02 hoog voor administratief gebruik | export bevat voorbeelddata en geen kenteken/tellerstanden | Bevestiging vóór demo-export, VOORBEELD-bestandsnaam, waarschuwing per rij en ontbrekend kenteken. Nog geen fiscale export. Download in browser/Excel niet opnieuw getest. |
| UI-02 normaal | vaste 62%-balk, vaste ritduur en classificatiewaarschuwing | Percentage, geselecteerde ritduur en aantal open classificaties nu berekend. Lege verzameling geeft 0%, ongeldige of nachtoverschrijdende tijd geeft onbekend; geen datum verzonnen. |
| UX-01 normaal | instellingen/formulierknoppen zonder handlers | Onvoltooide bediening blijft open; niet als geïmplementeerde instellingen accepteren. Functionele formulieren en toegankelijkheid later testen. |

## Grenzen

Geen externe securityscan, dependency-vulnerabilityscan, penetrationtest, migratietest, browserregressie of echte iPhone-test uitgevoerd. Foto ongewijzigd. Geen nieuwe koppelingen of installatie. Gate D blijft open voor onafhankelijke beoordeling en productieblokkades; lokale correcties zijn geen vrijgave voor echte administratie.
