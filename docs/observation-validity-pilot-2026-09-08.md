# Echter Cache-Vergleich, 2026-09-08

Branch `codex/observation-validity-pilot`, geprüfter Commit `d221539`.
[Cache-Pilot erfolgreich](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/34210554484),
[vollständige CI erfolgreich](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/34210554385).

## Quelle und Umfang

Genutzt wurde ausschließlich der bestehende GitHub-Actions-Cache `era5-land-cell-replacements-v1-34139951879`. Keine CDS-Abfrage, keine Secrets im Workflow, kein Schreiben auf main und keine Produktionsaktivierung. Der erste Lauf stoppte wegen eines Top-Level-await-Kompatibilitätsfehlers unter Node 22; der korrigierte Lauf bestand.

Hunza und El Chaltén: jeweils 262.992 zusammenhängende Stunden 1991–2020. Gzip-Prüfsumme gegen Cache-Metadaten, Request, Koordinaten und Schneevariablen geprüft. Beide kanonischen Prüfsummen stimmen auch mit den veröffentlichten Klima-Snapshots überein. Beide Methoden wurden aus derselben Stundenreihe gerechnet.

## Ergebnis

| Vergleich | Hunza | El Chaltén |
| --- | ---: | ---: |
| Größte Änderung Monatsmitteltemperatur | 0,05366 °C | 0,03111 °C |
| Größte Änderung Monatsniederschlag | 0,31483 mm | 0,74091 mm |
| Größte Änderung mittlere Schneehöhe an Schneetagen | 0,11976 m | 0,00056 m |
| Größte Änderung ungerundeter gewichteter Score | 0,03068 Punkte | 0,05228 Punkte |
| Empfehlungsgültige Monate vorher/nachher | August, September / unverändert | keine / unverändert |
| Best Months vorher/nachher | August, September / unverändert | keine / unverändert |

Alle zwölf Monate beider Punkte haben genügend erforderliche Score-Eingänge. Das bedeutet nicht, dass alle Monate empfehlenswert sind. El Chalténs Dauerschnee-Hold bleibt bestehen; seine hier genannten Rohscore-Differenzen sind interne Diagnostik, keine Veröffentlichung von Scores für das gesperrte Ziel.

Die unvollständigen innerhalb des Normalzeitraums liegenden Tage sind Hunza am 01.01.1991 und El Chaltén am 31.12.2020. Schneeereignis und Niederschlagssumme dieser Randtage werden nun ausgeschlossen. Die zusätzlich im Audit sichtbaren lokalen Randtage außerhalb 1991–2020 gehen nicht in die Monatsnormalen ein. Weitere Veränderungen entstehen durch die beschlossene gleiche Jahres-/Tagesgewichtung; insbesondere die bedingte Schneehöhe darf nicht als bloßer Rundungseffekt bezeichnet werden.

Hunzas bekannter Temperatursprung wird durch diese Änderung nicht wissenschaftlich erklärt. Unveränderte Best Months sind ein mechanisches Vergleichsergebnis, keine neue fachliche Freigabe für Hunza. Aus zwei Punkten folgt keine Validierung aller 315 Destinationen.

## Nachvollziehbarkeit und Grenzen

Das Actions-Artefakt `observation-validity-pilot-34210554484` enthält Quellenbelege, alte/neue Metriken und tägliche Abdeckung, Aufbewahrung 14 Tage. Lokal unter `generated/intermediate/validity-pilot-evidence-34210554484/` gesichert. Die nachgelagerte Score-Diagnose nutzt die unveränderten Score-/Empfehlungsfunktionen und den expliziten exakten Temperatur-Komfortwert jeder Methode. Die vorhandene veröffentlichte Temperaturverteilung dient nur dem weiterhin erforderlichen Legacy-Strukturcheck, nicht der Berechnung dieses Komfortwerts.

Noch offen: Integration der neuen null-fähigen Metriken und Abdeckungsfelder in die versionierte Import-/Export-Pipeline sowie ein repräsentativerer Vergleich vor Aktivierung. Bestehende Freigaben, aktive Methodik und öffentliche JSON-Dateien wurden nicht verändert. Nächster Schritt ist weiterhin mechanische Luna-Arbeit; vor Aktivierung folgt Sol-Review.
