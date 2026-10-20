# Mac-simulatorresultaat — 20 oktober 2026

Eigenaar meldt handmatige ontgrendeling. Computer Use bevestigt daarna een bruikbare Simulator-window; geen beveiliging omzeild. Basis PR50/head `56ea377c4b28aea9e43068a6b1a5ec549b06697d` opgehaald als exacte parent. Cloud-review en bestaande broncode behouden; uitsluitend voortgang/documentatie gewijzigd.

## Werkelijk uitgevoerd

- Bestaande unsigned simulatorbuild uit de vorige Xcodegroep gebruikt; geen herinstallatie van Xcode/platform of nieuwe build nodig.
- Virtuele iPhone 17, runtimeidentifier iOS-26-3 (eerder geïmporteerd als iOS 26.3.1), arm64. Geen fysieke iPhone verbonden/geconfigureerd voor deze proef.
- `simctl install` exit 0 en `simctl launch` exit 0 voor placeholder `com.example.RitKompasApp`; proces gestart.
- Computer Use bevestigt zichtbaar scherm Voorbereiding, prototypewaarschuwing en melding dat native aanmelden niet ingericht is.
- Locatie staat op Nog niet gevraagd / geen locatiegebruik toegestaan. Statusknop aangeklikt: scherm blijft correct zonder automatisch toestemmingsdialoog. Toestemmingknop en Instellingen niet aangeklikt; geen locatie verleend of gesimuleerd.
- Lifecycletekst App actief / geen GPS-opname gezien. Na de zichtbare Home-knopactie App niet actief gezien. Dit bewijst uitsluitend de waargenomen statusovergang, geen achtergrondregistratie of duurzame sessie.
- App via simulator terminate afgesloten en opnieuw gestart; beide exit 0. Computer Use bevestigt teruggekeerd voorbereidingsscherm met ongewijzigde, nog niet gevraagde toestemming. Beperkte start/visuele/relaunchproef PASS.

Privé lokaal screenshot: `/private/tmp/ritkompas-simulator-launch-20261020.png`. Niet naar GitHub geüpload. Dit is een handmatige simulatorproef, geen geautomatiseerde XCUITest of onafhankelijke beveiligingsaudit. Reeds uitgevoerde macOS-XCTest, smoke-, Node- en buildresultaten staan in MAC_XCODE_VALIDATION; niet opnieuw uitgevoerd of als nieuwe passes geteld.

## Grenzen en volgende taak

NIET GETEST: echte iPhone (ook iPhone 11 Pro), andere modellen/iOSversies, native login/sessiebinding, meldingen/acties, locatiepromptkeuzes, GPS/capture, achtergrondritten, Keychain/FileProtection/lockscreen, CarPlay, Bluetooth, OBD2 en Jeep. Deze beperkte voorbereiding is geen werkende automatische rittenregistratie.

Cloud blijft hoofdontwikkelaar: volgende veilige bron/testgroep is nativeprovider/sessiebinding, vervolgens notificationdelegate/delivery en capture volgens bestaande eisen. Mac kan gerichte iOSbouw/runtimechecks uitvoeren zodra een concrete delta/testopdracht beschikbaar is. Geen Appleteam/certificaat/provisioning, fysieke installatie, kosten, productie, Access/D1 of main gewijzigd. Geen nieuwe toestemming afleiden uit uitsluitend deze simulatorproef.
