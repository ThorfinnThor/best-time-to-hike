# Finale wissenschaftliche Prüfung, 2026-09-08

> Diese Vorprüfung wird durch den [formalen wissenschaftlichen Audit](./final-scientific-audit-2026-09-08.md) ergänzt. Dessen maschinenlesbare 315-Ziele-Prüfung und unabhängige Klimadiagnose sind für die Freigabeentscheidung maßgeblich.

Prüfstand: Commit `bada66c`, 315 Destinationen. Entscheidung: **keine uneingeschränkte wissenschaftliche Produktionsfreigabe**. Die vorhandenen Daten sind als vorläufige, modellbasierte Klimaorientierung nutzbar, nicht als validierte Aussage über konkrete Wanderwege oder deren Sicherheit. Keine Freigaben, Schwellen, Scores oder Veröffentlichungszustände wurden durch diese Prüfung geändert.

## Nachgeprüfte Ergebnisse

- Aktuelle Schema-/Invariantenprüfung: 315 Destinationen, 370 öffentliche Dateien, bestanden.
- 3.780 Bandmonate, alle mit genau einem Modellpunkt; minimale gespeicherte Datenvollständigkeit 0,9994. Dies prüft gespeicherte Aggregate, nicht erneut sämtliche ursprünglichen NetCDF-Dateien.
- Alle 3.780 Bandmonate haben `meanElevationMismatchM = 0`. Die Zielhöhe wird im repräsentativen Katalog aus der Modellhöhe abgeleitet. Dieser Nullwert bestätigt daher keine unabhängige Übereinstimmung mit Wanderwegen.
- 3.475 von 3.780 Bandmonaten haben keine gespeicherten Stunden oberhalb der Starkwindschwelle. Wind bleibt dennoch mit 10 % im Score; die vorhandenen Einschränkungen und der Ausschluss aus der Confidence-Berechnung sind deshalb wichtig.
- Golden Cases: 31 Referenzen, 25 als `agrees`, vier als `partly`, zwei ohne Antwort. Nur drei Monatslisten sind exakt gleich. Das ist nicht automatisch ein Fehler: `scripts/lib/golden-review.ts` prüft bei `agrees`, ob sämtliche ausgewählten besten Monate innerhalb der Referenzsaison liegen. Es prüft keine vollständige Saisonabdeckung. Sechs ausdrücklich akzeptierte Abweichungen erklären den grünen Gate-Status, nicht eine empirisch nachgewiesene Trefferquote.

## Wesentliche Befunde

### 1. Räumliche Gültigkeit bleibt die wichtigste wissenschaftliche Grenze

Eine 0,1°-Modellzelle ist keine vermessene Wanderregion. Modellhöhe und daraus abgeleitete Zielhöhe gegeneinander zu prüfen ersetzt keine unabhängige Route-/Höhenreferenz. Die Confidence-Obergrenze 64/low und die Erklärung „selected representative cell“ begrenzen den Anspruch sinnvoll, lösen das Validierungsproblem aber nicht.

Für eine regionale Empfehlung sind räumlich belegte Wanderkorridore und eine Prüfung von Höhenbereich, Modellzelle und Schneecharakter erforderlich. Bei nicht belegbaren Zielen bleibt die Veröffentlichung auf Modellzellenaussagen oder Review-Seiten beschränkt.

### 2. Bestätigte Lücke im Umgang mit unvollständigen Tagen

In `lib/hiking/climate.ts`, Funktion `aggregateDailyClimate`, wird die tägliche Mindestvollständigkeit nur für Niederschlag angewendet. Ein einzelner vorhandener Mittagstermin liefert bereits `snowDay=false`, `hotDay=false`, Temperatur und Wind für den Tag. Monatswahrscheinlichkeiten können solche Tage anschließend als bekannte Tage mitzählen. Ein Schneefall oder Hitzeereignis während fehlender Stunden kann dadurch übersehen werden.

Reproduktion: ein UTC-Termin am 15.06.2020, 12 Uhr, 20 °C, schneefrei, Wind 1 m/s. Ergebnis: 1/24 Beobachtungen; Niederschlag null, aber Schnee-/Hitzetag false, Temperatur 20 °C und Wind 3,6 km/h. Dies ist eine bestätigte Aggregationslücke für lückenhafte Eingaben, **kein nachgewiesener materieller Fehler aller aktuellen Monatswerte**. Aktuelle Vollständigkeit ist mindestens 99,94 %; Randtage des lokalen Normalzeitraums sind zusätzlich zu beachten.

Erforderlich: variable- und zeitfensterspezifische Gültigkeit definieren, unzureichend beobachtete Tagesereignisse unbekannt lassen, Monatsnenner entsprechend führen und mit Ausfällen während Ereignissen testen. Auch akzeptierte unvollständige Niederschlagssummen dürfen nicht ohne Kennzeichnung als vollständige Tag-/Monatssummen erscheinen. Die genaue Mindestabdeckung ist eine Methodenentscheidung, kein stiller Code-Fix.

### 3. Die 10-m-Schneegrenze braucht eine eindeutige Parameterzuordnung

Die ECMWF-Dokumentation unterscheidet physische Schneehöhe `sde` (3066, m) und Wasseräquivalent `sd` (141, m Wasseräquivalent). Im Abschnitt zu Gletscherinitialisierung nennt sie 10 m Wasseräquivalent; der allgemeine Hinweis zu Werten ab 10 m nennt keinen Parameter. Der Importer wendet die Grenze auf `sde` an. Damit ist die Bezeichnung als eindeutig „offizieller“ Schwellenwert für genau diesen Parameter nicht ausreichend belegt. Das ist eine Quellenzuordnungsfrage, kein Beweis für falsche importierte Schneehöhen. [ECMWF, Parametertabelle und Known issues 4/8](https://confluence.ecmwf.int/spaces/CKB/pages/140385202/ERA5-Land+data+documentation).

Erforderlich: eindeutige ECMWF-Bestätigung für `sde` oder eine explizit lokale konservative Prüfregel mit separatem Gletschernachweis. Bis dahin keine bestehende Schnee-Sperre aufheben und keine neue numerische Umrechnung ohne Dichteinformation erfinden.

### 4. Score und Golden Cases sind Plausibilitätskontrollen, keine unabhängige Validierung

Gewichte, Komfortkurven, kritische Komponenten und Confidence-Cap sind versionierte Produkt-/Methodenentscheidungen. Die aktuelle Prüfung belegt ihre Nachvollziehbarkeit, nicht eine kalibrierte Wahrscheinlichkeit guter oder sicherer Wanderbedingungen. `heatStress` nutzt Temperaturschwellen, nicht einen vollständigen physiologischen Hitzeindex. Wind ist grober Modellwind, kein Böen- oder exponiertes-Wege-Modell.

Erforderlich: eine vorab festgelegte, unabhängige Vergleichsstichprobe, getrennte Bewertung von empfohlenen und verpassten Saisonmonaten sowie eine Sensitivitätsprüfung der Gewichte/Schwellen. Keine Anpassung allein mit dem Ziel, bestehende Referenzen grün zu bekommen. Referenzen müssen denselben geografischen und höhenbezogenen Umfang wie das jeweilige Ziel beschreiben.

## Problemziele, Entscheidung unverändert

- Zermatt, El Chaltén und Garhwal bleiben Review-/Hold-Ziele, keine Best-Month-Freigabe.
- Annapurna braucht einen räumlich passenden Nachweis der abweichenden Frühjahr-/Herbstsaison.
- Hunzas reproduzierbarer September-/Oktober-Temperatursprung ist nicht unabhängig erklärt. Ein erneuter Abruf derselben Quelle ist Reproduzierbarkeit, keine externe Bestätigung.
- Atlas, Mount Kenya und Langtang behalten dokumentierte Golden-Abweichungen. Akzeptierte Ausnahmen dürfen nicht als Validierungserfolg ausgegeben werden.

## Abschluss und nächste Schritte

Diese Prüfung ist abgeschlossen; die wissenschaftliche Validierung ist nicht abgeschlossen. Die sieben bestehenden Release-Sperren bleiben unverändert, wobei Domain, Betreiberangaben, Rechte und Accessibility/Performance keine wissenschaftlichen Ergebnisse sind und separat behandelt werden müssen.

1. **Sol:** Tagesabdeckungsregel und eindeutige Bedeutung der Schnee-Prüfgrenze festlegen; räumlichen Aussageumfang bestätigen.
2. **Luna:** beschlossene Abdeckungsregel implementieren und Ausfall-/Randtagtests ergänzen; nur bei verändertem Ergebnis betroffene Aggregate neu erzeugen.
3. **Sol:** unabhängige Referenzprüfung der Problemziele und Sensitivitätsauswertung; danach begrenzte Freigabe anhand der tatsächlich belegten Aussagen entscheiden.

Prüfungen dieser Runde: direkter Codevergleich, ECMWF-Quellenabgleich, vollständige Zählung der gespeicherten Klimaaggregate, deterministische Ein-Termin-Reproduktion und aktuelle öffentliche Datenvalidierung. Keine neue vollständige Rohdaten-Reanalyse, kein externer Peer Review und kein neuer Browser-/Performance-Audit.
