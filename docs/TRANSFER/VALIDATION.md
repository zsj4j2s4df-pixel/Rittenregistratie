# Overdrachtscontrole — 18 oktober 2026

## Mac, daadwerkelijke overdrachtscheckout

- Node v24.19.0: `node --experimental-strip-types --test tests/*.test.mjs`: **31/31 PASS**.
- `tsc --noEmit`: **PASS**.
- `eslint . --ignore-pattern dist --ignore-pattern .next`: **PASS**.
- `vinext build`: **PASS**, alle vijf bouwfasen. Vinext meldt routeclassificatie `Unknown`; dit is geen functionele browsertest.
- Type/lint/build gebruiken bestaande Mac-node_modules via tijdelijke symlink. **Geen installatie gedaan**. Schone lockfile-installatie in Cloud: **NIET GETEST**.
- Eerste buildcommando gebruikte een niet-bestaand CLI-pad; tweede miste Node op PATH. Correct commando via bestaande bin en expliciet Node-PATH slaagde. Geen broncodefix nodig.
- `git diff --cached --check`: alleen verwachte witruimtewaarschuwingen in ongewijzigde historische Markdown-hardbreaks en contextregels van de baselinepatch. Controle met die twee bewijsbestanden uitgesloten: PASS. Historische inhoud niet voor cosmetiek gewijzigd.
- Definitieve patroonscan op 84 geselecteerde/gegenereerde bestanden en 33 unieke historische Git-blobs: **0 treffers**. Geen entropy-/externe secretscanner; geen garantie tegen onbekende geheimformaten.
- Volledige remote historie: 15 commits, niet shallow. PR #1 en #2 behouden; geen merge of force push.
- Bronmanifest registreert 49 gekopieerde Mac-bestanden vóór overdrachtsbewerkingen. Fotoverwijzingen en projectinstructies zijn daarna bewust aangepast; manifest is dus geen hashmanifest van de uiteindelijke commit.

## Historische Mac-baseline

`mac-baseline-to-current.patch` vergelijkt alle 27 bestanden uit de lokale nulmeting van 17 oktober met hun op schijf aangetroffen Mac-versies van 18 oktober. De patch bevat alleen wijzigingen, niet alle later nieuw gemaakte bestanden; die staan in de Git-overdrachtscommit. Lokale projectpaden zijn vervangen door `<MAC_PROJECT>`. Geen historische commits verzonnen.

Origineel archief SHA-256: `210f9814ba5db093c48d177d819e180f9e4d7bef6afae7069d4ddb9ae0fda1c2`. Archief en tijdelijke reconstructiemap blijven lokaal; niet geüpload. Dit is review-/reconstructiebewijs, geen opdracht om historische code terug te zetten.

## Nog te bewijzen

GitHub terugleescontrole en echte Cloud-proef volgen na upload. Native iOS, simulator, hardware, productie, serverauth, sync, PDF, MCP, back-upherstel en nieuwe browsertest: **NIET GETEST**. Technisch afdwingbare eigenaargoedkeuring: **NIET BEVESTIGD**; OWNER_ACTIONS ACT-002.
