# RitKompas — rittenregistratie

Een lokaal interfaceprototype voor de Jeep Wrangler Unlimited 80th Anniversary 4xe. **RitKompas is een werktitel**. Er is nog geen veilige, duurzame rittenregistratie: de interface gebruikt tijdelijke voorbeeldgegevens en sommige schermteksten suggereren ten onrechte echte metingen of controles.

## Leidende opdracht vanaf 17 oktober 2026

De drie Markdown-bestanden in [bronnen](bronnen/) zijn door de opdrachtgever als leidend aangewezen. De bijgewerkte masterprompt bepaalt de inhoud; de Opperagent-opdracht bepaalt de volgorde A–E; de OWNER_ACTIONS-aanvulling bepaalt persoonlijke acties. De nieuwste expliciete gebruikersbesluiten blijven voorgaan. De oude masterprompt in `docs` blijft bewaard als historie.

Zie [audit en voortgang](docs/ASTRA_AUDIT/PROGRESS.md) en [persoonlijke acties](OWNER_ACTIONS.md). Geen installatie, externe koppeling of publicatie wordt hiermee automatisch goedgekeurd.

## Aanwezig in het prototype (geen productieacceptatie)

- responsieve webinterface voor computer en iPhone-formaat;
- volledig donker en licht zandkleurig thema;
- dashboard met de door Jesse aangeleverde Jeep-foto;
- handmatige ritstatus en classificatie als privé of zakelijk;
- rittenlijst met filters en ritdetail;
- illustratieve routeweergave; geen echte GPS-registratie of interactieve kaart;
- rapportagescherm met deels vaste voorbeeldwaarschuwingen en een CSV-downloadhandler waarvan het gedownloade bestand nog niet is gevalideerd;
- Mijn Jeep zonder verzonnen voertuigwaarden;
- weergave van Dennis → Ingrid → Jesse; geen geïmplementeerde bestuurdersherkenning;
- databaseontwerp voor gebruikers, voertuigen, ritten, routepunten, voorkeursadressen, tarieven en auditlogs.

## Eerlijke begrenzing

Deze versie is een lokale web-MVP. De knoppen en schermen werken met tijdelijke voorbeeldgegevens in het geheugen. Automatische GPS-ritdetectie, echte Bluetooth-signalen, iOS-meldingen, CarPlay, serveraccounts, synchronisatie, PDF-export en MCP zijn nog niet als productiefunctionaliteit gebouwd. Hiervoor zijn vervolgfases, machtigingen en echte-apparaattests nodig. Publicatie of een betaalde dienst is niet geactiveerd.

## Lokale ontwikkeling

Vereist Node.js 22.13 of nieuwer en pnpm. Gebruik `pnpm dev` voor ontwikkeling, `pnpm build` voor een productiecontrole en `pnpm db:generate` na wijzigingen aan het databaseschema.

## Naamopties

1. **RitKompas** — duidelijke, voertuig-onafhankelijke werktitel.
2. **RouteVast** — benadrukt een controleerbare routehistorie.
3. **KilometerKlaar** — toegankelijk en administratief duidelijk.
4. **RitBewijs** — legt nadruk op controleerbaarheid, zonder fiscale garantie te claimen.
5. **Trajecta** — korte premiumnaam die ook voor andere voertuigen bruikbaar is.

Gebruik en domeinbeschikbaarheid zijn nog niet juridisch of commercieel onderzocht; kies pas daarna de definitieve naam.

Zie [docs/ARCHITECTUUR.md](docs/ARCHITECTUUR.md) en [docs/TESTPLAN.md](docs/TESTPLAN.md) voor ontwerpbesluiten en vervolgstappen.
