# Methodenentscheidungen, 2026-09-08

Status: **für Umsetzung im Staging beschlossen, noch nicht im Rechenpfad aktiviert**. Keine Produktionsfreigabe, keine Änderung bestehender Scores oder Sperren. Die neuen Dateien ergänzen die aktive Methodik als eindeutig gekennzeichnete nächste Version; sie ersetzen deren Implementierung noch nicht.

## 1. Beobachtungsabdeckung

Die Entscheidungsdatei `data-config/methodology/observation-validity-v1.json` legt fest:

- Tagesereignisse und Tagesextreme verlangen 100 % der erwarteten Stunden im passenden Fenster. Hitze bezieht sich auf das Wanderzeitfenster, Schnee auf den ganzen lokalen Tag. Unvollständige Tage bleiben für Ereigniswahrscheinlichkeiten unbekannt, auch wenn bereits ein positives Ereignis beobachtet wurde. Das verhindert, dass nur positive Teilbeobachtungen den Nenner erreichen.
- Mittelwerte und Verteilungsstatistiken verlangen mindestens 90 % Abdeckung, getrennt nach Variable. Wind braucht gepaarte U/V-Werte, Feuchte gepaarte Temperatur-/Taupunktwerte. Bei zehn erwarteten Stunden reichen neun für einen Mittelwert, aber nicht für die Aussage „kein Hitzetag“.
- Niederschlagssummen verlangen vollständige Stunden und vollständige Monatstage. Teilmengen werden weder als vollständige Summen ausgegeben noch hochgerechnet.
- Monatliche Statistiken brauchen pro Jahr mindestens 90 % gültige Tage des jeweiligen Merkmals; vollständige Niederschlagsmonatssummen bleiben die strengere Ausnahme. Die 30-Jahres-Auswertung verlangt mindestens 27 gültige Jahre pro Merkmal. Gültige Jahre werden gleich gewichtet. Damit dominiert ein besser beobachtetes Jahr nicht allein durch seine Datensatzgröße.
- Lokale Tage werden aus UTC-Stunden und IANA-Zeitzonen abgeleitet, einschließlich Sommerzeit und Randtagen. Erwartete Stunden kommen aus dem Kalender, nicht aus vorhandenen Daten. Keine Auffüllung mit null Niederschlag oder schneefreien Stunden.
- Fehlende erforderliche Eingangsmerkmale sperren den Score. Gewichte werden nicht um fehlende Komponenten herum neu verteilt.

90 % und 27 Jahre sind ausdrücklich **lokale konservative Qualitätsregeln**, keine behaupteten WMO-Pflichtwerte. Vollständige Ereignisfenster verhindern unbegründete Negativaussagen, beseitigen aber nicht mögliche systematische Ausfälle. Hohe Abdeckung ist kein Nachweis räumlicher Richtigkeit oder unabhängiger Modellgüte. Die hier verwendeten Wahrscheinlichkeiten beschreiben historische Modellereignisse, keine Prognosewahrscheinlichkeiten.

## 2. Schneehöhe und Gletscherprüfung

`data-config/methodology/snow-screening-clarification-v1.json` trennt physische Schneehöhe (`sde`) und Wasseräquivalent (`sd`). ECMWF führt beide getrennt und nennt bei der Gletscherinitialisierung Wasseräquivalent; die allgemein formulierte 10-m-Warnung ist nicht eindeutig parameterbezogen. Deshalb behalten wir 10 m physische Schneehöhe als **lokale vorsorgliche Prüfsperre**, nicht als bewiesenen Gletschernachweis. [ECMWF-Dokumentation](https://confluence.ecmwf.int/spaces/CKB/pages/140385202/ERA5-Land+data+documentation).

Bestehende Sperren bleiben. Ihre Aufhebung braucht belegte Wanderkorridore, passende Höhenbereiche, eine nachvollziehbare Zellzuordnung und unabhängige Schnee-/Saisonevidenz. Die geänderte Einordnung der Schwelle allein erlaubt keine Freigabe. Ohne kompatible Schneedichte erfolgt keine Umrechnung von Wasseräquivalent in Schneehöhe.

## 3. Räumlicher Aussageumfang

Bis unabhängige räumliche Evidenz vorliegt, bleiben Aussagen auf die ausgewählte Modellzelle beschränkt. Eine aus der Modellhöhe abgeleitete Zielhöhe ist kein unabhängiger Höhentest. Keine Aussage über Sicherheit, konkrete Routenbedingungen, Böen oder eine gesamte Region. Confidence bleibt eine begrenzte Qualitätskennzahl, keine statistische Sicherheit.

## Umsetzung und Abnahme

**Luna kann als Nächstes implementieren**, ohne neue Schwellen zu erfinden:

1. Tagesgültigkeit, merkmalsbezogene Nenner und Metadaten nach der Entscheidungsdatei umsetzen; fehlende Merkmale in Typen/Schema/Export explizit abbilden.
2. Tests für einzelne Mittagstermine, fehlende Ereignisstunden, 90-%-Grenze, gepaarte Windwerte, DST, leere Tageslichtfenster, Randtage, 26/27 gültige Jahre und unvollständige Niederschlagssummen ergänzen.
3. Schnee-Prüfsperre konsistent umbenennen; historische Metadaten nicht nachträglich als neue Verarbeitung ausgeben.
4. Staging-Aggregate aus stündlichen Quellen erstellen, Unterschiede bei Scores, Best Months, Holds und Golden Cases berichten. Nicht aus Monatswerten rekonstruieren und nicht ungezielt den gesamten Katalog neu herunterladen.

**Sol prüft danach die Auswirkungen**, besonders bisherige Empfehlungen und Problemziele. Erst dann wird die neue Aggregationsversion aktiviert. Eine Übereinstimmung mit Golden Cases ersetzt weiterhin keine unabhängige Validierung. Domain und Betreiberangaben bleiben außerhalb dieser Methodenentscheidung.
