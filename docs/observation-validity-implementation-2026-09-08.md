# Beobachtungsgültigkeit: Staging-Implementierung

## Umgesetzt

- Separater Rechenpfad `lib/hiking/climate-validity.ts`, ohne Import in den bisherigen Veröffentlichungsprozess.
- Kalenderbasierte Stundenanzahl, Tageslichtfenster, merkmalsbezogene Gültigkeit, unbekannte unvollständige Ereignistage, vollständige Niederschlagssummen.
- Monatsauswertung mit 90-%-Tagesabdeckung, mindestens 27 Jahren, gleicher Gewichtung gültiger Jahre und hierarchisch gewichteten Temperaturquantilen/Komfortwerten.
- Explizite fehlende Score-Eingänge und Abdeckungsmetadaten. Der Staging-Bericht erzeugt keine öffentlichen Scores.
- Separate Schnee-Prüfung mit unveränderter 10-m-Grenze, ohne Gletscherklassifikation oder Aufhebung bestehender Holds.
- Vergleichsbefehl für stündliche JSON-Snapshots nach `schemas/hourly-climate.schema.json`:

```sh
node --import tsx scripts/validate/compare-observation-validity.ts INPUT.json generated/intermediate/NEUER-BERICHT.json
```

Der Befehl schreibt ausschließlich neue Staging-Berichte, einschließlich Eingabe-Hash, Vorher-/Nachher-Metriken und Tagesabdeckung. Existierende Berichte werden nicht überschrieben. Gzip-NDJSON-Importerdateien müssen zuerst verlustfrei mit den passenden Punktmetadaten in das erwartete Stunden-Snapshotformat überführt werden; Monatsaggregate sind kein Ersatz.

## Geprüft

192/192 Tests bestanden, darunter 15 neue Tests. TypeScript und öffentliche Datenvalidierung bestanden (315 Destinationen, 370 Dateien). CLI-Smoke-Test mit ausdrücklich synthetischer Ein-Stunden-Eingabe: zwölf Monate bleiben für Scores unzureichend beobachtet. Kein synthetischer Datensatz wurde veröffentlicht.

## Noch nicht abgeschlossen

Der bestehende Import-/Score-/Exportpfad wurde absichtlich nicht umgestellt. Die neuen null-fähigen Staging-Metriken sind noch kein Ersatz für das öffentliche Band-Schema. Ebenso tragen historische Rohdaten-Metadaten weiterhin ihre bisherigen Namen; sie wurden nicht nachträglich umetikettiert.

Im geprüften lokalen Bestand wurden keine stündlichen Snapshot-/Gzip-NDJSON-Dateien gefunden. Deshalb gibt es noch keinen echten Vergleich der 315 Destinationen, keine Aussage über geänderte Best Months und keine neue wissenschaftliche Freigabe. `runtimeImplemented=false` bedeutet weiterhin: nicht im aktiven Veröffentlichungsprozess integriert.

Nächster mechanischer Schritt (Luna): vorhandene CI-Stundenartefakte ermitteln, einen begrenzten echten Vergleich durchführen und die versionierte Pipeline-/Schema-Migration vorbereiten. Danach Sol: Auswirkungen auf Empfehlungen und Problemziele prüfen. Erst nach dieser Prüfung aktivieren. Kein Deployment in dieser Runde.
