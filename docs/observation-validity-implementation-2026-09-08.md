# Beobachtungsgültigkeit: globale vorläufige Migration

## Umgesetzt

- Separater, getesteter Rechenpfad `lib/hiking/climate-validity.ts`, der jetzt die Monatswerte aller 315 versionierten Snapshots erzeugt.
- Kalenderbasierte Stundenanzahl, Tageslichtfenster, merkmalsbezogene Gültigkeit, unbekannte unvollständige Ereignistage, vollständige Niederschlagssummen.
- Monatsauswertung mit 90-%-Tagesabdeckung, mindestens 27 Jahren, gleicher Gewichtung gültiger Jahre und hierarchisch gewichteten Temperaturquantilen/Komfortwerten.
- Explizite fehlende Score-Eingänge und Abdeckungsmetadaten. Der Staging-Bericht erzeugt ausschließlich als `staging-only` markierte Review-Scores; er kann keine Produktionsfreigabe behaupten.
- Datenvollständigkeit wird pro Monat neu aus vorhandenen gegenüber allen kalendarisch erwarteten Rohwertzellen berechnet. Vollständig fehlende Tage bleiben im Nenner.
- Interannuelle Streuung wird aus höchstens 30 getrennten Jahres-Scores neu berechnet. Ein Jahr zählt nur, wenn alle zehn Score-Eingänge nach den merkmalsbezogenen Abdeckungsregeln vorhanden sind; fehlende Eingänge werden weder imputiert noch umgewichtet.
- Staging-Confidence verwendet diese neue Vollständigkeit und Streuung. Nur unveränderte räumliche Strukturwerte stammen ausdrücklich gekennzeichnet aus dem bisherigen veröffentlichten Snapshot; der vorläufige Einzelzellen-Cap und alle Holds bleiben aktiv.
- Separate Schnee-Prüfung mit unveränderter 10-m-Grenze, ohne Gletscherklassifikation oder Aufhebung bestehender Holds.
- Vergleichsbefehl für stündliche JSON-Snapshots nach `schemas/hourly-climate.schema.json`:

```sh
node --import tsx scripts/validate/compare-observation-validity.ts INPUT.json generated/intermediate/NEUER-BERICHT.json
```

Der Befehl schreibt ausschließlich neue Staging-Berichte, einschließlich Eingabe-Hash, Vorher-/Nachher-Metriken, Tagesabdeckung, einzelnen Jahresscores, interannueller Streuung und Review-Confidence. Existierende Berichte werden nicht überschrieben. Gzip-NDJSON-Importerdateien müssen zuerst verlustfrei mit den passenden Punktmetadaten in das erwartete Stunden-Snapshotformat überführt werden; Monatsaggregate sind kein Ersatz.

## Geprüft

GitHub-Actions-Lauf `34251408255` hat alle 315 Quellen cache-only aus den bereits hash-fixierten kanonischen Stundenbeobachtungen neu berechnet. Die globale Prüfung bestätigte 315 eindeutige Bericht-/Quellenpaare, jeweils identische Quell-Hashes, exakt 262.992 Stunden, die vollständige 1991–2020-Abdeckung, zwölf geordnete Monate und keine fehlenden Score-Eingänge. Danach wurden alle 315 Snapshots auf Schema 3 und `observation-validity-v1` migriert und die öffentlichen Exporte deterministisch neu gebaut.

Der vollständige Prüflauf besteht: Datenvalidierung, Architektur- und Determinismuswächter, 212 Tests, 8 Render-Tests, TypeScript und der statische Next.js-Build mit 5.253 Seiten. Der Wissenschafts-Audit meldet null automatisierte wissenschaftliche Blocker.

## Bewusst nicht freigegeben

Die Migration ist `provisional` und keine Produktionsfreigabe. Sie erteilt keine unabhängige Expertenzertifizierung, hebt keinen Schnee- oder Niederschlags-Hold auf und erlaubt keine Routen-, Regions-, Sicherheits- oder Vorhersageaussage. Historische Rohdaten-Metadaten behalten ihre ursprünglichen Namen; sie wurden nicht nachträglich umetikettiert.

Die Produktionsfreigabe bleibt zusätzlich durch die Golden-Case-Mindestzahl, die Quellen-Semantikfreigabe und sechs ausdrückliche Betreiberfreigaben gesperrt. Diese Entscheidungen dürfen nicht aus einem erfolgreichen automatisierten Lauf abgeleitet werden.
