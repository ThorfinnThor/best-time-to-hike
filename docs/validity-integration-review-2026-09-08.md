# Staging-Integration und erweiterter Vergleich

Stand: `33a9cf7`, Branch `codex/observation-validity-pilot`. Nicht auf main und nicht als Produktionsmethodik aktiviert.

## Umsetzung

Die neue Aggregation führt null-fähige Metriken und Abdeckungsangaben bis in einen schema-geprüften Staging-Export. Fehlende erforderliche Score-Eingänge führen zu null bei Score/Komponenten/Level und zu keiner Empfehlung. Bestehende veröffentlichte Holds bleiben erhalten. Die aktive öffentliche Schema-Version wird nicht ersetzt.

Der exakte Temperatur-Komfortwert kann jetzt ohne erfundene Stichprobenwerte bewertet werden. Der bisherige Scorer bleibt als kompatibler Einstieg erhalten. Empfehlungsgültigkeit wird wie bisher vor der Rundung bestimmt; Best-Month-Auswahl nutzt wie der bestehende Export gerundete Komponenten und Gesamtwerte.

## Echter Vergleich

[Zehn-Ziele-Lauf 34211326609](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/34211326609): alle zehn ausgewählten Ziele im Cache vorhanden, jeweils 262.992 Stunden. Kanonische Prüfsummen stimmen mit den veröffentlichten Quellen überein. Keine CDS-Abfrage und keine Ersatzkoordinaten.

Geprüft: Annapurna, Denali, Dolomiten, El Chaltén, Hunza, Kakadu, Langtang, Madeira, Sikkim, Zermatt. Diese gezielte Diagnoseauswahl ist keine statistische Validierung aller 315 Ziele.

## Dabei gefundene und behobene Fehler

1. **Denali: Tageslicht über Mitternacht.** Ein Sonnenuntergang nach Mitternacht hat einen kleineren Uhrzeitwert als der Sonnenaufgang. Die bisherige Intervallprüfung behandelte das als leeres Tageslichtfenster. Vollständige Juni-/Juli-Stundenreihen erschienen dadurch im neuen Abdeckungstest als unzureichend. Die zyklische Zeitlogik wurde korrigiert; ein Regressionstest prüft zehn Wanderstunden am 15.06.2000. Der [gezielte Folge-Lauf 34212040519](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/34212040519) besteht. Juni und Juli haben wieder 30 gültige Temperaturjahre.
2. **Langtang: unterschiedliche Rundung im Vergleich.** Der erste Staging-Export wählte beste Monate mit ungerundeten Werten, der bestehende Export mit gerundeten. Ein Niederschlagskomponentenwert knapp über 5 wurde dadurch unterschiedlich behandelt. Der Staging-Export hält jetzt dieselbe Rundungsreihenfolge ein; Grenzfalltest ergänzt. Diese erste Abweichung war kein Beleg für eine geänderte Klimasaison.

Die Exportkorrektur wurde auf die gespeicherten Monatsberichte angewendet, ohne erneut Stunden einzulesen. Reproduzierbar mit:

```sh
node --import tsx scripts/validate/summarize-validity-comparison.ts generated/intermediate/validity-expanded-evidence-34211326609 --current-export
node --import tsx scripts/validate/summarize-validity-comparison.ts generated/intermediate/validity-denali-evidence-34212040519 --current-export
```

Die korrigierte Denali-Auswertung ersetzt allein den Denali-Eintrag des ersten Laufs. Die unveränderten Originalartefakte dokumentieren weiterhin den ursprünglichen Zwischenstand.

## Ergebnis nach Korrekturen

- Alle zehn Ziele behalten gegenüber der veröffentlichten Version dieselben empfehlungsgültigen Monate und Best-Month-Listen.
- Zermatt und El Chaltén bleiben gesperrt. Kakadu erhält weiterhin keine Empfehlung. Keine fehlenden erforderlichen Score-Eingänge im korrigierten Zehn-Ziele-Vergleich.
- Größte Änderung des gerundeten veröffentlichten Scores: Denali 3 Punkte, Dolomiten 2, Annapurna/Hunza jeweils 1; übrige ungesperrte Ziele 0.
- **Denalis Juni-Mitteltemperatur ändert sich gegenüber dem veröffentlichten Wert von 7,8 °C auf 10,364 °C**, weil die fälschlich ausgelassenen Tageslichtstunden wieder einbezogen werden. Das ist keine bloße Rundungsdifferenz. Juli: 11,5 auf 11,707 °C. Die Best Months bleiben Juni, Juli, August.
- Die internen `maxTemperatureMeanDelta`-Felder vergleichen alte und neue Aggregation desselben Laufs. Im korrigierten Denali-Lauf nutzen beide bereits die reparierte Tageslichtfunktion; diese Felder sind deshalb ausdrücklich nicht die Änderung gegenüber dem alten veröffentlichten Juni-Wert.

Der schema-geprüfte Migrations-Preview vergleicht alle 120 Monatsobjekte nach der korrigierten Exportregel: keine Änderung an Empfehlungsgültigkeit oder Best Months, keine fehlenden Score-Eingänge. Vier gerundete Scores ändern sich: Annapurna April 48 auf 47, Denali Juni 79 auf 82, Dolomiten Juni 72 auf 74 und Hunza Oktober 48 auf 49. Held-Monate bleiben ohne Score und erscheinen nicht als numerische Nulländerung.

Spätere Berichtsversionen ergänzen abgeleitete Exportfelder und sind daher nicht bytegleich mit den ursprünglich freigegebenen Gesamtberichten. Für die Wiederholungsprüfung wird zusätzlich ein stabiler wissenschaftlicher Kern gehasht: Ziel-ID, Quellenhash, Monatsaggregation, Schneeprüfung und tägliche Abdeckung. Diese Kernhashes stimmen für alle zehn Ziele zwischen den freigegebenen und neu erzeugten Berichten überein. Quellenbelege müssen außerdem weiterhin Cache- und veröffentlichten kanonischen Hash als identisch ausweisen; der Preview setzt diese Aussage nicht ungeprüft voraus.

## Verifikation und Freigabegrenze

198 lokale Tests bestanden, TypeScript bestanden. Die bisherige öffentliche Exportstrecke reproduziert alle 370 Dateien bytegenau. Vollständige CI für `18a01ed`, `a87ac2f` und die letzte Exportkorrektur `33a9cf7` erfolgreich ([CI 34212268930](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/34212268930)).

Die neuen Staging-Ergebnisse sind nicht veröffentlicht. Auch die korrigierten Denali-Werte sind noch nicht live. Nächster Schritt: **Sol bewertet die tatsächlichen Auswirkungen und entscheidet über eine begrenzte Aktivierung oder weitere Vergleichsfälle**. Danach kann Luna die freigegebene Migration ausführen. Die offenen räumlichen/Schnee-/Quellenfreigaben sind durch diesen technischen Vergleich nicht erteilt.
