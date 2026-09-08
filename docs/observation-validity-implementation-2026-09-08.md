# Beobachtungsgültigkeit: Staging-Implementierung

## Umgesetzt

- Separater Rechenpfad `lib/hiking/climate-validity.ts`, ohne Import in den bisherigen Veröffentlichungsprozess.
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

Die gezielten Validitäts-, Export- und Migrations-Tests sowie TypeScript bestehen. Der vollständige Prüflauf wird nach der erneuten cache-only Evidenzerzeugung ausgeführt. Kein synthetischer Datensatz wurde veröffentlicht.

## Noch nicht abgeschlossen

Der bestehende Import-/Score-/Exportpfad wurde absichtlich nicht umgestellt. Die neuen null-fähigen Staging-Metriken sind noch kein Ersatz für das öffentliche Band-Schema. Ebenso tragen historische Rohdaten-Metadaten weiterhin ihre bisherigen Namen; sie wurden nicht nachträglich umetikettiert.

Der echte cache-only Vergleich ist für zehn hash-fixierte Ziele vorhanden; die übrigen 305 Ziele sind nicht migriert. `runtimeImplemented=false` bedeutet weiterhin: nicht im aktiven Veröffentlichungsprozess integriert.

Nächster mechanischer Schritt (Luna): die zehn cache-only Berichte mit der neuen Jahres-/Confidence-Evidenz neu erzeugen, Hashes prüfen und den öffentlichen Snapshot-Diff vorbereiten. Kein Deployment vor erfolgreicher Diff-Prüfung.
