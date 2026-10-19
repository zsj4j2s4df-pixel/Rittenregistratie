# Lokale versleutelde SQLite-back-up en gecontroleerd herstel

19 oktober 2026. Dit is **lokale Node 24-tooling**, geen remote D1-back-up, productiedeployment of goedgekeurd productieherstel. Geen externe dependencies of accounts nodig. Alleen synthetische gegevens zijn getest.

Gebruik een door de eigenaar beheerde private map buiten de repository. Sleutels zijn binaire bestanden van 32 cryptografisch willekeurige bytes; geef nooit sleutelinhoud of wachtwoorden als argument door. `init-key` creëert uitsluitend een nieuw bestand met mode 0600; bestaande bestanden worden geweigerd. Bewaar een afzonderlijke veilige kopie van de sleutel: zonder sleutel is herstel onmogelijk. Dit hulpmiddel beheert geen sleuteldistributie, rotatie of offsite opslag.

```sh
node scripts/sqlite-backup.mjs init-key --key-file /private/ritkompas/key.bin
node scripts/sqlite-backup.mjs backup --source /private/ritkompas/source.sqlite --destination /private/ritkompas/backup.rksql --key-file /private/ritkompas/key.bin
node scripts/sqlite-backup.mjs restore --source /private/ritkompas/backup.rksql --destination /private/ritkompas/restored-new.sqlite --key-file /private/ritkompas/key.bin
```

De paden zijn voorbeelden; de bovenliggende map moet bestaan en op POSIX uitsluitend toegankelijk zijn voor de verantwoordelijke lokale gebruiker. De bron wordt read-only geopend; Node's SQLite online backup API maakt een consistente snapshot. Het hulpmiddel versleutelt die snapshot streaming met AES-256-GCM, een nieuwe random 96-bit nonce en 128-bit authenticatietag. Header, versie, algoritme, formaataanduiding, nonce en aanmaaktijd zijn authenticated additional data. Metadata is leesbaar; bestandsnamen en aanmaaktijd zijn geen geheime opslag. Er worden geen bronpad of persoonlijke metadata aan de header toegevoegd.

De onversleutelde snapshot/decryptie staat tijdelijk in een willekeurige private map (0700) onder de systeem-tempmap en wordt in `finally` verwijderd. Het encrypted artefact heeft mode 0600. Restore authenticeert eerst de volledige ciphertext, controleert vervolgens `PRAGMA integrity_check` en `PRAGMA foreign_key_check`, en publiceert pas dan naar een **nieuw** bestand (0600). Bestaande bestanden en symlinks worden geweigerd; overschrijven van de actieve database wordt niet ondersteund. Deze restore vervangt nooit automatisch een actieve toepassing of bronbestand. Controleer het resultaat, aantallen/auditdata en applicatiegedrag afzonderlijk vóór enige latere eigenaar-goedgekeurde omschakeling.

Bestandsformaat versie 1: ASCII `RKSQL001`, vier-byte big-endian JSON-headerlengte (maximaal 4096), UTF-8 JSON-header, AES-GCM ciphertext en zestien-byte authenticatietag. Beschadigde of verkeerde sleutels, gewijzigde metadata en tags worden geweigerd. Een correct geauthenticeerde maar relationeel ongeldige SQLite-database wordt eveneens geweigerd. Authenticatie bewijst integriteit onder de sleutel; het bewijst geen auteurschap, actuele revisie of afwezigheid van kwaadaardige inhoud van een sleutelhouder. Oude geldige back-ups worden niet automatisch als replay herkend.

## Beperkingen en operationele grenzen

- Vertrouwde lokale operator en door die operator beheerde mappen vereist. Er zijn controles op symlinkcomponenten en exclusieve doelcreatie; dit is geen sandbox tegen een gelijktijdige aanvaller met schrijfrechten op de bovenliggende map.
- POSIX-rechten zijn op Linux getest. Windows-ACL's, macOS, netwerkbestandsystemen, volle schijf, proceskill/stroomuitval en een grote actieve WAL-database zijn niet getest.
- `finally` ruimt normale successen en fouten op; SIGKILL/crash/stroomverlies kan private plaintext-tempbestanden achterlaten. Gebruik versleutelde schijf/veilige tempopslag en een operationeel opruimbeleid. Verwijderen is geen gegarandeerde fysieke secure erase op SSD/snapshots.
- Publicatie door exclusieve kopie kan bij abrupt procesverlies een gedeeltelijk nieuw doel achterlaten; dit overschrijft geen bestaand doel. Een volgend herstel naar datzelfde pad wordt bewust geweigerd. Bewaar het versleutelde origineel, onderzoek een eventueel onvolledig nieuw doel en kies daarna een nieuw herstelpad.
- Er is geen scheduler, bewaartermijn, automatische upload, cloudmutatie of langetermijnbeschikbaarheidsclaim. Sleutels, databasebestanden en back-upartefacten horen nooit in Git. De CLI logt geen sleutelinhoud of gedetailleerde SQLite-data.

## Testbewijs

`node --test tests/sqlite-backup.test.mjs`: vijf synthetische tests voor schema-/auditroundtrip en rechten; ciphertext-/metadata-/tagmanipulatie plus verkeerde sleutel en tempopruiming; weigeren van overschrijven en symlinks; weigeren van geauthenticeerde data met foreign-keyfouten; en roundtrip met alle huidige RitKompas-migraties, echte servicecorrectie/audit, vast rapport en behoud van immutable-/integriteitstriggers. Gerichte ESLint is afzonderlijk uitgevoerd. Geen productiegegevens of remote D1-test.
