# Veilige ontwerpbron — geen werkende ritregistratie

Drie opgeschoonde HTML/CSS/JS-bestanden van de door eigenaar beoordeelde private
browserpreview, met uitsluitend eigen neutrale SVG-placeholders in plaats van de
Jeepfoto, gegenereerde export en Canva-brandasset. Geen hostingmanifest, Site-ID,
credential, feedbackwaarden, browseropslag of echte adressen gekopieerd.

Dit is een **snapshot van ontwerpronde 2 vóór de nieuwste feedback**. De nieuwe
opdracht staat in `docs/TRANSFER/OWNER_DESIGN_REGISTRATION_HANDOVER.md`. Hier staan
nog vier accentkleuren, één lokaal adresveld per soort en Home-knoppen onder de
fotokaart. Die beperkte demo is dus NIET de gevraagde eindimplementatie.

Open index.html voor de bronreferentie. Er is geen API-/GPS-/authkoppeling: alle
ritten zijn fictief en voorkeuren blijven lokaal. Gebruik deze bron om de stijl
te begrijpen, niet om een tweede administratie/backend te introduceren.

De echte code voor meervoudige adresopslag, sessiebinding en ritkeuzes is al in
dezelfde repository aanwezig. Breid die onder bestaande autorisatie/revision/
receipt/auditregels uit. De browserdemo-opslag nooit als bewijs van centrale
opslag gebruiken. Geen echte browseradressen automatisch importeren/uploaden.

`scripts/export-design-reference.mjs` kan deze bronselectie opnieuw maken vanuit
een expliciet opgegeven private checkout; het kopieert nooit media of historie.
De twee SVG-placeholders zijn repo-native, geen reconstructie van de privéfoto
of goedgekeurde Canva-brandasset. Nieuwe media pas via veilig Mac-kanaal.
