# GitHub-overdracht teruggelezen

18 oktober 2026. [Draft-PR #3](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/3) draagt de broncode over. Base `cloud/cloud-006-documentatie`, head `handover/mac-to-cloud-20261018`.

## Vastgesteld

- GitHub-commit `8b50e9109b51770f6cf4d0eec25eac38c17e4b76` bevat tree `e2d9d8a76483bebef6a013a337d91fc85cb943ac`.
- Die tree-SHA is exact gelijk aan de gecontroleerde lokale commit-tree. Na `git fetch` geeft `git diff --exit-code HEAD FETCH_HEAD` geen verschil (exit 0).
- PR #2-head `d1493fd23e6bc52ef2de229dcf4870ef8d9c2673` is aantoonbaar voorouder van de upload; daaronder blijven alle eerdere 15 commits, inclusief PR #1.
- 82 bestanden in initiële overdrachtstree; nul JPEG/PNG/HEIC, nul database-/sleutel-/certificaatbestanden. Geen bestanden verwijderd uit bestaande Cloud-documentatie.
- De zeven centrale Markdown-bestanden hebben geen ontbrekende relatieve links. Het eisenregister bevat nog 123 verschillende REQ-ID's; de diff voegt alleen een statusnotitie toe.
- Patroonscan na teruglezen: 84 werkbestanden (inclusief gegenereerde lokale controlebestanden), 110 unieke Git-blobs over lokale/remote refs, nul treffers. Dit blijft een beperkte scan, geen veiligheidsgarantie.
- Normale HTTPS-push was niet aangemeld; geen credentials uitgelezen of gevraagd. Upload verliep via de bestaande GitHub-connector, zonder force-update of wijziging van main.
- PR #1 en #2 blijven open en afhankelijk. Geen merge, retarget of auto-merge geactiveerd.

## Losstaande Cloud-proef

De bestaande sessie **Cloud agent** kreeg CLOUD-008 met de exacte commit, eigen branch en draft-PR tegen de overdrachtsbranch. Dispatch alleen bewijst geen uitvoering. Echte uitkomst hoort in `docs/TRANSFER/CLOUD_PROOF.md` op de Cloud-vervolgbranch en wordt apart beoordeeld.

## Niet afgerond

Technische eigenaargoedkeuring/branch protection: **NIET BEVESTIGD**, zie OWNER_ACTIONS ACT-002. GitHub-inzage vanaf een echte iPhone: **NIET GETEST**; de publieke PR- en documentlinks zijn beschikbaar, geen native installatie vereist. De projectoverdracht is daarom nog niet als volledig geslaagd afgevinkt.
