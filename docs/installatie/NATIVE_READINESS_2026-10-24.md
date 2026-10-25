## Actualisering 25 oktober

Lees [het actuele uitvoerplan](MAC_NEXT_INSTALL_2026-10-25.md). De specifieke
accountopdracht vervangt de historische reviewwachtstap hieronder.

# Echte iPhone-app: voorbereiding voor drie toestellen

## Actueel resultaat

Geen TestFlight/downloadlink en geen nieuwe fysieke installatie. De eerder gekozen
gratis route via Mac/Xcode blijft leidend. Geen lidmaatschap of productiepublicatie.
Nieuwe native testbuild1.0(2), bundle-ID com.example.RitKompasApp behouden; geen
DEVELOPMENT_TEAM/certificaten in Git en signingconfig niet globaal gewijzigd.
Ondertekenen/provisioning per toestel moet nog met het bevestigde bestaande team.
De bestaande ondertekende oudere app niet verwijderen of resetten als oplossing.

-79Swift-tests PASS en312Node-tests PASS.
-Nieuwe generieke iphoneos- en iphonesimulatorbuild beide BUILD SUCCEEDED,
  CODE_SIGNING_ALLOWED=NO. Geen bewijs dat unsigned op iPhone installeerbaar is.
-Build2 op virtuele iPhone17/iOS26.3 geïnstalleerd/gestart. Echte registratie met
  goedgekeurd merkbeeld gezien, Anthracite en Desert bekeken. Aparte ontwerpproef
  met werkelijk ingebouwde goedgekeurde offroadfoto bekeken en teruggegaan.
  Geen aanmelding, locatie/meldingstoestemming of echte data in de simulator.
-Native Form-weergave heeft nog platformeigen kaarten; geen claim dat de hele
  nieuwe website-interface native is overgenomen. Fraaie preview is demo gebleven.
-AppIconmaster exact behouden; native foto is alleen technische JPEG-conversie
  van de al goedgekeurde publicatiekopie. Manifest: ios/RitKompasApp/NATIVE_ASSET_MANIFEST.json.

## Account- en toestelcontrole (alleen lezen)

Supabase-aggregaat teruggelezen: eerste twee persoonlijke accounts0/0, derde
bevestigde account1. E-mailadressen/subjects niet in deze publieke documentatie.
Geen nieuwe invites/mappings of rechten. Eerst inhoudelijk reviewakkoord door
Jesse op de startuitleg zoals eerder afgesproken, dan twee officiële uitnodigingen
en expliciete D1-vehiclemappings/audit volgens SUPABASE_CUTOVER_MAC.md. Geen
email-autogrant, geen dubbele Jesse, geen directe auth.users-writes.

CoreDevice via sandbox niet bereikbaar, reguliere read-onlycheck buiten sandbox:
Dennis' iPhone connected/paired/DeveloperMode enabled. Andere twee niet bereikbaar
teruggelezen. UDID/serials/full logs alleen privé buiten Git. Geen fysieke appupdate,
signing-/profielwisseling of toestemming op telefoons uitgevoerd.

## Kant-en-klaar installatie-artifact

Bron: docs/installatie/native-installation.json. Generator:

```sh
python scripts/create-native-installation-artifact.py /absoluut/uitvoerpad
```

Gebruik de bestaande bundel-Python met reportlab+pypdf; niets nieuws installeren.
Resultaat: PDF van5pagina's plus een zelfstandig mobielHTML-overzicht. Geen app,
IPA, livewebsite of TestFlightlink. Zonder accounts/passwords/privélinks. HTML-
vinkjes zijn alleen een lokale checklist, veranderen geen instellingen en slaan
niets op of versturen niets. PDF-paginabeelden visueel controleren vóór oplevering.
In deze run artefacten onder de gesprekswerkmap output/, niet als binaries naarGit.
PDF definitief5pagina's met7klikbare verwijzingen; alle5gerenderde pagina's
visueel nagekeken. ZelfstandigHTML:5delen/9lokalevinkjes, zesformaten en200%tekst
zonder overloop, geen externe netwerkrequests van het artifact PASS. Mobiele
bovenkant visueel nagekeken. Node/type/lint en beperkte secretpatrooncheck
472bestanden/1204historische blobs zonder bevindingen (geen absolute garantie).

## Reproduceerbare technische voorbereiding

```sh
node scripts/prepare-native-test-build.mjs /absoluut/prive-uitvoermap
```

Maakt een unieke map, bouwt unsigned device+simulator en voert Swift-tests uit.
Geen signing, install, account, reset, rechten of gegevensupload. Actuele reeds
gebouwde producten staan lokaal onder work/native-install-preparation-20261024/
naast deze checkout; niet downloaden/doorsturen als installeerbare app.

## Operator: volgende installatiegroep

1. Reviewakkoord controleren. Accounts en memberships veilig voorbereiden;
   voor die productiedatamutatie actuele backup/preflight en concrete toegang nodig.
2. Laat eigenaar hetzelfde Personal Team in Xcode bevestigen. Behoud bundle-ID,
   team en bestaande gegevens/Keychain bij upgrade. Geen willekeurig nieuw team.
3. Selecteer één ontgrendelde gekoppelde iPhone; teken het bestaande app-target
   met de bekende development-route. Geen -allowProvisioningUpdates op andere
   accounts zonder eigenaarhandeling/controle. Certificaten nooit naar publiekGit.
4. Installeer via Xcode Run, controleer build2, start en heropen. Herhaal per telefoon.
5. Persoonlijke native aanmelding inclusief Sessie gebruiken, voertuigscope,
   remember-off/on, refresh, heropenen, logout en accountisolatie werkelijk testen.
6. Alleen vrijwillig GPS-/meldingentest, geen capture ongevraagd. Test stilstaand/
   als passagier. Capture stopt zodra app niet actief is; locatie alleen tijdens
   gebruik + Exacte locatie. Geen Always/background/BT/CarPlayrechten voorwenden.
7. Testmatrix pas afvinken na echte uitkomst; driephoneprioriteit/dubbeleritten/
   CarPlay/OBD2/automatische achtergrondritten blijven OPEN.

## Grenzen

Alle fysieke installatie/aanmelding/GPShardware/CarPlay/OBD2 NIET GETEST in deze run.
Geen universeleIPA, geen TestFlightclaim, geen gratisprofiel zonder verloopbelofte.
Apple PersonalTeam-limieten/7dagen in artifact met officiële bronnen; Xcode moet
vrije slots en daadwerkelijke ondertekening nog bevestigen. iPhone11Pro binnen
brondoel iOS15+, niet dezelfde zaak als geteste compatibiliteit op dat toestel.
