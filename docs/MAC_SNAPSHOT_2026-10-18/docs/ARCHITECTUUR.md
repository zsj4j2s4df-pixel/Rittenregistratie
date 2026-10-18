# Architectuur en haalbaarheid

Bijgewerkt: 16 oktober 2026.

> Auditnotitie 17 oktober 2026: dit is een ontwerp met historische onderzoeksnotities, geen acceptatieverslag. Alleen het lokale interfaceprototype is aangetroffen. Accounts, autorisatie, centrale opslag, auditlog en synchronisatie zijn niet geïntegreerd. Hosting, domein, productie-database en MCP-deployment zijn **NIET BEVESTIGD**. Een D1-binding met placeholder-ID bewijst geen gekoppelde Cloudflare-dienst. Externe technische en fiscale bevindingen hieronder moeten vóór toepassing opnieuw worden geverifieerd; ze vormen geen persoonlijk fiscaal advies. Zie `ASTRA_AUDIT/DOCUMENT_REVIEW.md`.

## Aanbevolen eindarchitectuur

```text
Native iPhone-app ─┐
                   ├─ beveiligde backend/API ─ centrale database
Webinterface ──────┘              │
                                  └─ gecontroleerde remote MCP-laag
```

De webinterface is de eerste gebouwde productlaag. D1/SQLite is voorbereid als relationele opslag; alle productie-mutaties moeten later via server-side autorisatie lopen. De native iPhone-app wordt een aparte Swift/SwiftUI-client die dezelfde backend gebruikt. Route- en adresdata worden nooit rechtstreeks aan een model of onbevoegde client blootgesteld.

## Technische indeling

| Onderdeel | Status | Reden |
|---|---|---|
| Webinterface, thema's, ritten, classificatie | BEVESTIGD — alleen prototype | Tijdelijke voorbeelddata; geen duurzame registratie |
| Centrale relationele data en auditlog | B — onder voorwaarden | Schema gereed; hosting, beleid en productie-auth nog kiezen |
| iOS-achtergrondlocatie | B/C — mogelijk, praktisch testen | Apple ondersteunt achtergrondlocatie, maar machtigingen, energiegebruik, beëindiging en echte ritten vereisen apparaattests |
| Bluetooth-melding bij elke autoverbinding | C — eerst praktisch testen | Geen garantie dat iOS elke verbinding als betrouwbare achtergrondtrigger levert |
| CarPlay-interface | B/C — entitlement en review nodig | Apple noemt driving-task apps, maar toelating en passend template moeten vooraf worden bevestigd |
| OBD2 | C — hardwaretest nodig | Geen adapter gekozen; beschikbare voertuigdata is onbekend |
| PDF/CSV | NOG TE ONDERZOEKEN | CSV-handler aanwezig, gedownload bestand niet gevalideerd; PDF ontbreekt |
| Remote MCP | B | HTTPS/streamable HTTP en serverautorisatie vereist; read-only eerst |

## Beveiligingsbasis

- Autorisatie komt server-side, niet alleen in de interface.
- Externe identiteit wordt gekoppeld aan een interne gebruiker; Dennis, Ingrid en Jesse krijgen gelijke beheer-/bestuurdersrechten.
- Locatiepunten, adressen en ritten zijn gevoelige data en worden per gebruiker/voertuig afgeschermd.
- Classificatiecorrecties, samenvoegingen en exports krijgen een auditregel met oude en nieuwe waarde.
- Tarieven zijn versieerbaar per ingangsdatum, zodat historische rapporten niet wijzigen.
- MCP start read-only en krijgt alleen expliciet bevestigde schrijftools.
- Geen sleutels of geheimen in browsercode, repository of logs.

## Actuele officiële bevindingen

- Apple beschrijft achtergrondlocatie als ondersteund via de Location Updates-capability en relevante Core Location-sessies, maar waarschuwt dat achtergrondapps normaal worden geschorst en dat batterijgebruik en transparantie moeten worden afgewogen. Bron: [Handling location updates in the background](https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background), geraadpleegd 16-10-2026.
- Apple noemt driving-task apps als CarPlay-categorie en vereist het aanvragen van een CarPlay-entitlement; dit bewijst nog niet dat onze specifieke privé/zakelijk-interactie wordt toegelaten. Bron: [CarPlay for app developers](https://developer.apple.com/carplay/), geraadpleegd 16-10-2026.
- De Belastingdienst vermeldt voor privévervoer in de onderneming in 2026 € 0,25 per zakelijke kilometer. Dit tarief is contextafhankelijk en wordt daarom niet als universele standaard in de app hardgecodeerd. Bron: [Zakelijk gebruik privévervoermiddel 2026](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/veranderingen-inkomstenbelasting-2026/zakelijk-gebruik-privevervoermiddel-2026), geraadpleegd 16-10-2026.
- OpenAI ondersteunt remote MCP via publieke HTTP-servers en raadt goedkeuringsflows en beperkte tools aan voor gevoelige acties. Bron: [MCP servers](https://developers.openai.com/api/docs/guides/tools-connectors-mcp), geraadpleegd 16-10-2026.

## Beslissingen die nog van Jesse nodig zijn

Dit is een toekomstige onderwerpenlijst, geen actuele actielijst. Alleen `../OWNER_ACTIONS.md` bevat persoonlijke acties die nu aandacht vragen. Inmiddels bevestigd in de nieuwe masterprompt: privé-eigendom Dennis, zakelijke inzet binnen een VOF met Dennis en oma als genoemde vennoten. De juridische rollen van Ingrid en oom blijven onbekend; appgebruikers zijn niet automatisch vennoten. Copilot is het eerste te onderzoeken platform; geen koppeling is goedgekeurd.

- definitieve appnaam na naam-, merk- en domeincontrole;
- voertuigdocumenten voor uitvoering, modeljaar, marktversie en kenteken;
- fiscale gebruikssituatie en gewenst vergoedingstarief;
- toestemming en accountkeuze vóór hosting, publicatie of betaalde diensten;
- toestemming voor iOS-locatie-, bewegings- en meldingsmachtigingen tijdens apparaattests;
- keuze en aankoop van OBD2-hardware pas na vergelijking.
