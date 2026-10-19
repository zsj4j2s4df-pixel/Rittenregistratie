# Opslagcontrole en centrale ingang — 19 oktober 2026

## Gebruikersmelding en bewijs

Eigenaar kan na PR34 inloggen. Screenshots tonen de echte centrale registratie met voertuig en instellingen. Dit bevestigt dat de demo niet de verklaring is voor deze specifieke melding. Screenshots bevatten geen zichtbare opslagfout en bewijzen geen geslaagde opslag. Er is geen echte kenteken/ritinhoud uit screenshots overgenomen. De lege verplichte wijzigingsreden kan verzenden blokkeren, maar is geen bewezen hoofdoorzaak. Echte iPhone-opslag blijft ONBEVESTIGD.

## Gebouwd op ontwikkelbranch

- Root / gebruikt voortaan dezelfde centrale registratie als /beheer. Demo behouden op /demo, met werkende expliciete link. Geen automatische gegevensmigratie en geen demodata naar backend.
- Centrale formulieren melden het eerste ontbrekende/ongeldige veld bij het formulier en richten de focus daarop. Ongeldige formulieren verzenden niets. Verplichte auditreden blijft verplicht.
- Centrale serverfout of opslagbevestiging wordt in beeld gebracht, ook na lang omlaag scrollen. Geen wijziging aan vormgeving/thema of beveiliging.
- Gebouwde Worker-smoke uitgebreid met echte lokale D1: handmatige rit201, exacte retryzelfdeID/éénrit, teruglezen en instellingenPATCH200. Dit test de frameworkrouter en ondertekende cookie, niet slechts losse Node-services.

## Verificatie

PASS221Node-tests, typecheck, volledige lint, webbuild, gebouwde embedded Worker/workerd/D1. Chromium tegen gebouwde app: centrale root, ontbrekende wijzigingsreden en vertrek blokkeren zonder DB-write, ritinvoer/retry/reload, settings/historie/revisionconflict, adres/tarief, correctie, vaste rapporten/CSV/langePDF, printrevocation en mobiel/thema PASS. Bestaande demoflows op /demo PASS. Chromium154/Node24.19/Linux, bestaande dependencies/browservariant gebruikt; geen installatie.

Geen nieuwe productiepublicatie/migraties/provisioning/Accesswijzigingen. De actuele live app blijft het goedgekeurde PR34-pakket. Deze ontwikkelgroep is een concreet vervolgvoorstel, geen bewijs dat de gemelde iPhone-opslagfout al live opgelost is.
