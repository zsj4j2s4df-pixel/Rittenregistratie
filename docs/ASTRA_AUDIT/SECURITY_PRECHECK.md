# Beveiligingsvoorcontrole — ontwerpvragen

Status: één documentcontrole door deze Cloud-sessie, 18 oktober 2026. Geen onafhankelijk reviewpaar, implementatie-audit, penetratietest of securitygoedkeuring. Applicatiecode ontbreekt.

## Gegevens en grenzen
Te beschermen: accounts/sessies, privé- en zakelijke adressen, GPS-routes, voertuig/kenteken, exportbestanden, tarieven, correcties en auditgeschiedenis.
Vertrouwensgrenzen: iPhone/web → API → database; AI-host → MCP → dezelfde API; exportdownload; beheer/back-up; offline apparaat → synchronisatie.
De masterprompt bevestigt gelijke beheerrechten voor de drie gebruikers; deze voorcontrole wijzigt dat niet. Wel moet ongeauthenticeerde of niet-toegevoegde toegang worden geweigerd.

| Risico | Controlevoorstel | Vereist bewijs vóór acceptatie |
|---|---|---|
| Toegang via geraden rit-/voertuig-ID | Backend controleert gebruiker en geautoriseerde gegevensscope op iedere read/write/export | Negatieve API-tests, ook voor MCP |
| Gestolen/verlopen sessie | Veilige sessieopslag, intrekken en verlopen; platformgeschikte authenticatie | Uitloggen/revocatie op server getest |
| Locaties in logs of lockscreen | Minimaliseer/redigeer; geen tokens of volledige route in foutlogs; neutrale meldingstekst | Loginspectie met synthetische data |
| Routeverlies bij upload/conflict | Idempotente inzending, versiecontrole en herstelbare samenvoeghistorie | Offline/concurrency/regressietests |
| Manipulatie historie/tarief | Audit met actor en oud/nieuw; historisch rapport reproduceerbaar | Correctie- en herexporttests |
| MCP promptinjectie uit ritdoel/adres | Tekst blijft data; model verleent geen rechten; backend controleert acties | Kwaadaardige testinhoud verandert geen rechten |
| MCP tokenmisbruik | Issuer/audience/expiry/scopes verifiëren; geen token passthrough | Negatieve token- en scopetests; bron S13/S14 |
| Onbevestigde schrijfactie | Servercontrole van bevestiging gebonden aan gebruiker, rit, versie en wijziging; herhaling veilig | Replay/versieconflict/ontbrekende toestemming testen |
| CSV-formule of HTML/PDF-injectie | Behandel exportwaarden als onbetrouwbare data; contextgeschikt escapen | Formule-/markupfixture en bestandsinspectie |
| Verlies/back-up of verwijderconflict | Hersteltest en expliciet beleid per gegevenscategorie; fiscale historie niet stil wissen | Synthetisch herstel en vastgesteld bewaarbeleid |
| Onverwachte factuur/uitval | Gebruikslimieten, paginering, invoergrenzen en metingen | Lasttest na providerkeuze, zonder productiegegevens |

## Reviewafspraken
Reviewer 1 behandelt dreigingen, authenticatie, rechten en privacy. Reviewer 2 beoordeelt onafhankelijk implementatie, misbruik en regressies zodra code aanwezig is. Hun model/uitvoering/bewijs wordt dan geregistreerd. Nu geen extra agents gestart voor een afwezige implementatie; geen kritieke codebevindingen verzonnen.

## Open besluiten
Authenticatieprovider, sessiestrategie, datalocatie, bewaartermijnen, beheer/herstel en exportbevestiging zijn nog geen vastgestelde implementatie. Een passende privacy-/fiscale afweging kan een materieel besluit vereisen. Geen productiegegevens of secrets gevraagd.
