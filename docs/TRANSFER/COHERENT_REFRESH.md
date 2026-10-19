# CLOUD-005 — samenhangend verversen

19 oktober2026. Vervolg op draft-PR #16/head6523edccc4e696f916844f33cf5f62e96cb67637. Geen Cloudflare-mutaties, livepublicatie, migraties, kosten of mainmerge.

GET /api/vehicles/:vehicleId/snapshot geeft vehiclemetadata, ritten, instellingen, actieve bestuurders en rapportlijst terug in één D1-batchtransactie van vijf read-only statements. Elk statement controleert membership; vooraf is ook een geverifieerde sessie en voertuigautorisatie vereist. Rechten/sessie kunnen niet uit de body of eigen headers worden afgeleid. Na de batch wordt sessie-expiry opnieuw gecontroleerd. De bestaande veilige instellingenconversie wordt gedeeld, niet opnieuw geïmplementeerd.

Het beheerscherm gebruikt deze ene aanvraag bij laden, verversen en na writes. Daardoor geen losse offsetpagina's voor deze voertuigweergave en geen mix van ritten/instellingen uit verschillende databasemomenten. Voertuigmetadata in de keuzelijst wordt mee bijgewerkt. Een expliciete401/403 bij verversen verwijdert oude voertuigdetails; verbindingsuitval behoudt bestaande invoer voor gecontroleerde retry. De API blijft no-store/nosniff en accepteert geen queryparameters of schrijfmethode op dit endpoint.

Dit is een begrensde volledige refresh, geen automatische push/polling, wijzigingscursor of duurzame offlinewachtrij. fetchedAt is een laadmoment, geen mutatiecursor. Maximaal5000ritten,1000bestuurders,1000rapportverwijzingen en4MiB JSON; overschrijding geeft413 zonder stille afkapping. Grotere logboeken vragen nog gerichte/pagineerbare snapshots. De bestaande pagineerbare endpoints blijven bestaan maar zijn niet de samenhangende UI-refresh. Voertuigkeuzelijst en afzonderlijke historie zijn aparte lezingen. Read-only snapshot bevat geen externe auth-ID’s, e-mailadressen, raw GPS-punten of accounts van andere voertuigen.

PASS:127Node-tests, tsc, volledige ESLint, build. Vier nieuwe tests voor één batch/vijf statements, instellingenconversie/privacy, revocation tussen initiële autorisatie en batch, HTTP/methoden/query/expiry en overschrijding zonder afkappen. SQLite-testadapter ondersteunt nu ook SELECT-resultaten binnen transacties.

PASS: echte lokale workerd/D1-binding voert de nieuwe batchlezing uit naast alle bestaande runtimechecks. PASS: uitgebreide centrale browserflows via nieuwe snapshotroute, inclusief responseverlies/reconnect/retry, instellingen409, bestuurdercorrectie, rapportweergave/PDF en afdruk/historierevocation. PASS:16pagina-PDF-layoutcontrole en gesloten gebouwde API inclusief snapshot503/no-store. Synthetische identiteit/data; echte provider, remote multi-user-sync en hardware NIET GETEST.

Volgende taken: actuele openwerkkaart OPEN_WORK.md; cursors/auto-sync en duurzame pendingqueue blijven open. Mac's Access-taak niet gewijzigd.
