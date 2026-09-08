# Formaler wissenschaftlicher Audit, 2026-09-08

Status: **Prüfung vollständig ausgeführt; wissenschaftliche Produktionsfreigabe verweigert.** Der Katalog darf nur als vorläufige, niedrig-konfidente Klimatologie der jeweils ausgewählten Modellzelle beschrieben werden. Er ist noch keine validierte Aussage über eine gesamte Destination, konkrete Wanderwege oder Sicherheit.

Maschinenlesbare Evidenz: `generated/reports/science-audit.json`. Festgeschriebene Prüfregeln: `data-config/methodology/science-audit-v1.json`. Unabhängiger Diagnosesnapshot: `data-snapshots/external-audit/nasa-power-1991-2020.json`.

## 1. Hunza-Anomalie

Der erneute ERA5-Land-Abruf reproduziert den Temperaturabfall von September auf Oktober exakt mit **−13,3 °C**. Das spricht gegen eine beschädigte oder veraltete lokale Datei. Die unabhängige NASA-POWER/MERRA-2-Diagnose zeigt am ausgewählten Modellpunkt dieselbe saisonale Richtung, aber nur **−6,2 °C**. Die Größenordnung ist daher nicht unabhängig bestätigt. Auch der Jahresniederschlag weicht stark ab: ERA5-Land 906,9 mm, NASA POWER 170,4 mm, Faktor 5,32.

Entscheidung: Die Quelldaten bleiben unverändert und werden nicht geglättet. Hunza behält einen Qualitätshinweis. Die −13,3 °C dürfen nur als Ergebnis dieser ERA5-Land-Zelle, nicht als stationsvalidierte Aussage über Hunza bezeichnet werden.

## 2. Koordinaten, Höhen und repräsentative Klimazellen

Alle **315** internen Datenketten bestehen die formale Prüfung: gültige Zielkoordinaten und Zeitzonen, genau ein repräsentativer Punkt, Ausrichtung auf das 0,1°-Raster, identische Abruf-/Antwort-/Sampling-Koordinaten, konsistente Modellhöhe in Snapshot, Band und öffentlichem Datensatz, gültige Quell-Hashes sowie jeweils exakt **262.992 Stundenwerte** für 1991–2020.

Das ist eine Integritätsprüfung, keine unabhängige geografische Validierung. Nur **Denali** besitzt derzeit ausdrücklich freigegebene Named-Route-Evidenz. Bei **314** Zielen ist die Fläche lediglich die ausgewählte ERA5-Land-Zelle; Zielhöhe und Höhenband sind aus derselben Modellhöhe abgeleitet. Der Medianabstand vom Katalogpunkt zur Zelle beträgt 4,09 km, das 95. Perzentil 7,01 km. Den Prüfwert von 20 km überschreiten Everest Region (38,48 km) und Denali (74,32 km); Denali ist ein dokumentierter Routen-Override, Everest Region bleibt räumlich ungeklärt.

Entscheidung: Die 315 Zellketten sind intern korrekt. Eine regionale oder routenspezifische Freigabe ist für 314 Ziele mangels unabhängiger Geometrie- und Höhenevidenz nicht erteilt.

## 3. Quellen, Aggregation und Grenzwerte

- ERA5-Land ist die Primärquelle. Auflösung, stündliche Zeitreihe, Modellcharakter und Auswahl des nächsten Rasterpunkts wurden mit der [offiziellen CDS-Datensatzbeschreibung](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries) abgeglichen.
- 1991–2020 entspricht der aktuellen [WMO-Standardnormalperiode](https://wmo.int/wmo-climatological-normals).
- Die Aufbereitung akkumulierter Variablen wurde gegen die [ERA5-Land Product User Guide](https://confluence.ecmwf.int/pages/viewpage.action?pageId=685246455) geprüft.
- NASA POWER dient nur als unabhängige MERRA-2-Diagnose. Es ist gröber und selbst modellbasiert; laut [POWER-Methodik](https://power.larc.nasa.gov/docs/methodology/meteorology/) sind dies Rastermittel, keine Stationsmessungen.
- Gewichte, Komfortkurven, Schwellen 20/5 und Confidence-Cap sind transparent versionierte **lokale Produktregeln**. Sie sind nicht empirisch als Sicherheits- oder Erfolgsmodell kalibriert.
- 10-m-Grid-Wind ist nicht als Böen- oder exponierter Trailwind validiert. Niederschlag ist in komplexem Gebirge nicht bias-korrigiert. Copernicus DEM wird von den aktuellen 315 öffentlichen Snapshots nicht verwendet.
- Nur 10 Ziele besitzen die neue Observation-Validity-Aggregation; **305** verwenden noch die Legacy-Aggregation ohne die neuen täglichen Gültigkeitsfelder.

Die Sensitivitätsprüfung bestätigt relevante Policy-Abhängigkeit: Eine Änderung eines Komponentengewichts um ±20 % verändert bei bis zu 37 Destinationen die Best-Month-Auswahl. Ein kritischer Mindestwert von 15 statt 20 verändert drei Ziele, 25 verändert fünf. Ein Best-Month-Komponentenminimum von 0 statt 5 verändert 16 Ziele, 10 verändert 27. Die Parameter wurden deshalb nicht nachträglich auf Referenzfälle optimiert.

## 4. Golden Cases und Extremziele

Die 31 signierten Golden Cases ergeben 25 `agrees`, vier `partly` und zwei `no answer`; sechs Abweichungen sind ausdrücklich akzeptiert. Nur drei Monatsmengen stimmen exakt überein. `agrees` bedeutet, dass die gewählten Topmonate innerhalb der Referenzsaison liegen, nicht dass die gesamte Saison gefunden wurde.

Besonders risikoreiche Fälle wurden erneut gegen unabhängige Betreiber-/Tourismusquellen geprüft: Banff nennt Juli bis Mitte September als Hauptwanderzeit ([Parks Canada](https://www.parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking)); die Hohen Tatra haben eine saisonale Wegsperre vom 1. November bis 14. Juni ([Region Tatry](https://regiontatry.sk/en/winter-trips/winter-hiking/?trace_difficulty=3)); Nepal beschreibt für Annapurna Frühjahr und Herbst als Hauptzeiten ([Nepal Tourism Board](https://trade.ntb.gov.np/wp-content/uploads/2023/04/trekking-in-nepal-booklet-anan.pdf)); El Chaltén wird offiziell für September bis April empfohlen ([Argentina National Parks](https://www.argentina.gob.ar/parquesnacionales/patagonia-austral/parque-nacional-los-glaciares/panoramica)). Zermatt und El Chaltén bleiben deshalb korrekterweise Review-/Hold-Seiten; Annapurnas Abweichung bleibt ungeklärt, nicht „grün gerechnet“.

Der 315-Punkte-Vergleich mit NASA POWER markiert **zwei** Temperatur-Saisonsprünge und **30** Niederschlagsverhältnisse oberhalb der vorab festgelegten 3×-Prüfgrenze. Die größten Verhältnisse betreffen Asir (15,97×), Rwenzori (13,36×), Simien (8,15×), Sierra Nevada de Santa Marta (7,09×), Lauca (6,47×), Sikkim (6,43×) und Hunza (5,32×). Der Modellvergleich ist kein Wahrheitsbeweis. Unabhängige Literatur macht die Warnung jedoch substanziell: für Rwenzori werden je nach Höhenlage etwa 1.500–2.600 mm/Jahr berichtet ([Rwenzori-Niederschlagsvergleich](https://www.africamuseum.be/publication_docs/Nakulopa%20et%20al.%20-%202022%20-%20Journal%20of%20Hydrometeorology%20-%20Evaluation%20of%20High-Resolution%20Precipitation%20Products%20over%20the%20Rwenzori%20Mountains.pdf), [Rwenzori-Auswertung](https://discovery.ucl.ac.uk/10112947/1/ecrc_report_113_Taylor.pdf)), für das Simien-Gebiet etwa 1.515 mm/Jahr ([Simien-Studie](https://www.africamuseum.be/publication_docs/Jacob%20et%20al%202017%20-%20Land%20cover%20dynamics%20in%20the%20Simien%20Mountains.pdf)), und veröffentlichte Forschung dokumentiert starke ERA5-Land-Niederschlagsüberschätzung in Hochgebirgen der Everest-Region ([JAMC-Studie](https://journals.ametsoc.org/view/journals/apme/61/8/JAMC-D-21-0091.1.xml)).

## 5. Formale Entscheidung

Der wissenschaftliche Audit ist formal abgeschlossen. **Production Science Approval = false.** Die Freigabe wird wegen fünf offenen wissenschaftlichen Sperren nicht erteilt:

1. 314 Ziele ohne unabhängige Named-Route-Geometrie und Höhenevidenz.
2. 305 Ziele mit Legacy-Aggregation ohne Observation-Validity-Felder.
3. 30 Ziele oberhalb der vorab festgelegten unabhängigen Niederschlags-Prüfgrenze.
4. Nicht validierter Grid-Wind für Trail-Exposition und Böen.
5. Nicht empirisch kalibrierte Scoregewichte und Grenzwerte.

Diese Entscheidung schützt die bereits eingebauten Holds und Confidence-Begrenzungen. Sie verändert keine Klimawerte, Scores oder Empfehlungen stillschweigend und ersetzt keine unabhängige fachliche Unterzeichnung.

Für eine spätere Freigabe sind genau diese fünf Sperren mit versionierter Evidenz zu schließen. Bis dahin bleibt jede Darstellung auf „selected model cell“, „provisional“ und „low confidence“ beschränkt.
