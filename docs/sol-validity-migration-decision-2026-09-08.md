# Fachliche Entscheidung zur begrenzten Migration

## Entscheidung

**Die geprüften Korrekturen dürfen für die zehn untersuchten Ziele in den vorläufigen Datenfluss übernommen werden**, unter den Bedingungen in `data-config/methodology/validity-migration-decision-v1.json`. Keine pauschale Produktionsfreigabe und keine Aktivierung in dieser Runde. Dies ist eine KI-gestützte Methodenprüfung, kein unabhängiges Fachgutachten.

## Fachliche Begründung

1. Fehlende Stunden als unbekannt zu behandeln verhindert unbegründete Aussagen über das Ausbleiben von Schnee oder Hitze. Getrennte Abdeckung je Merkmal ist fachlich sinnvoll. Die gewählten 90 % und 27 Jahre bleiben lokale Qualitätsregeln, keine empirisch kalibrierte Sicherheit.
2. Gleiche Gewichtung gültiger Jahre ist für die ausdrücklich so definierte Klimanormale vertretbar. Dadurch ändern sich auch bedingte Schneehöhen; das ist eine Methodenänderung und muss versioniert bleiben. Eine identische Empfehlungsliste beweist nicht, dass sämtliche Einzelmetriken unverändert sind.
3. Die Denali-Korrektur behebt eine falsche Behandlung zyklischer Uhrzeiten. NPS nennt für den längsten Tag 20 Stunden und 49 Minuten Tageslicht. Ein leeres Tageszeitfenster im Juni ist damit nicht als lokale Dunkelheit erklärbar. [NPS Park Statistics](https://www.nps.gov/dena/learn/management/statistics.htm).
4. Die NPS-Klimatabelle nennt für Juni am Park Headquarters 53 °F, etwa 11,67 °C, und beschreibt ihren Bezugszeitraum als 1981–2010. Unser Wert 10,364 °C betrifft eine andere Modellzelle und Wanderstunden 1991–2020. Das ist lediglich ein grober Kontextvergleich: kein Gleichheitsziel, keine Bias-Korrektur und keine unabhängige Bestätigung des genauen Modellwerts. Die NPS-Seite weist selbst auf räumliche Klimaunterschiede hin. [NPS Weather and Climate](https://www.nps.gov/dena/learn/nature/climate.htm).
5. Die Best-Month-Rundung bleibt unverändert. Eine Verbesserung oder Änderung der Auswahlregel ist nicht Teil dieser Freigabe.

## Was genau freigegeben ist

Migration der Berechnung und ihrer nachvollziehbaren Herkunft für Annapurna, Denali, Dolomiten, El Chaltén, Hunza, Kakadu, Langtang, Madeira, Sikkim und Zermatt. Zermatt und El Chaltén bleiben Review-Ziele; Kakadu erhält weiterhin keine Empfehlung. Alle bisherigen Einschränkungen bleiben bestehen. Insbesondere ist Hunzas bekannter Temperatursprung damit nicht erklärt.

Die zehn Quellenberichte sind per SHA-256 festgeschrieben. Für Denali gilt ausschließlich der korrigierte Folgelauf. Die abschließende Export-Rundung stammt aus `33a9cf7`. Die Prüfung akzeptiert diese begrenzte Änderung am vorläufigen Produkt, nicht sämtliche schon vorher bestehenden wissenschaftlichen Aussagen.

## Konkreter nächster Schritt, Luna

- Versionierte, null-fähige Snapshots und Herkunfts-/Abdeckungsfelder aus den geprüften Stunden-/Staging-Daten erzeugen. Temporäre Actions-Evidenz dauerhaft sichern.
- Confidence und interannuelle Streuung nicht still aus alten Snapshots übernehmen. Die Implementierung berechnet nun alle vollständigen Jahresscores, deren Populations-Standardabweichung und die Rohdatenvollständigkeit erneut aus den vorhandenen Stunden-Daten. Räumliche Strukturwerte werden separat als aus dem bisherigen Snapshot übernommen gekennzeichnet. Keine neue CDS-Abfrage ist dafür nötig.
- Nur die zehn Ziele migrieren; die übrigen 305 behalten ihre echte bisherige Methodenversion. Sämtliche Sperren und `provisional`/`noindex` bleiben.
- Vor Veröffentlichung Tests, vollständigen Build, Herkunftsprüfung und deterministischen Export prüfen. Unerwartete Änderungen der Empfehlungsgültigkeit oder Best Months gehen zurück in die fachliche Prüfung.

Die allgemeinen sieben Release-Sperren bleiben unberührt. Ein späterer Übergang zu einer uneingeschränkten Produktionsfreigabe braucht weiterhin eigene Evidenz.
