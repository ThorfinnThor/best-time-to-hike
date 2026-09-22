# Design- und Visual-QA-Audit vom 22. September 2026

## Umfang

- 5271 öffentliche URLs erfasst (5270 Inhaltsseiten und die Root-Weiterleitung; die technische 404-Seite ist nicht öffentlich gelistet).
- Jede URL automatisiert bei 1440 × 1000, 1280 × 800, 768 × 1024, 390 × 844 und zusätzlich 360 × 800 Pixeln geprüft.
- Insgesamt 26.355 Route-/Viewport-Kombinationen.
- Erfasst wurden Dokumentbreite, horizontaler Überlauf, Hero-Höhe, H1-Größe und -Zeilen, Überschriftenbreiten, Umbruch-/Trennregeln, kleine Fließtexte, wichtige Spaltenbreiten sowie abgeschnittene oder außerhalb des Viewports liegende Elemente.
- Zusätzlich wurden Startseite, Finder, Monatsranking, Themen-/Regionsranking, Vergleich, Methodik, Datenschutz und Ziel-Monatsseite in deutscher und englischer Ausprägung mit echten Screenshots auf Desktop und Mobil kontrolliert. Besonders lange deutsche Überschriften wurden gezielt einbezogen.

## Gefundene und behobene Probleme

Neun konkrete Darstellungsprobleme aus sechs gemeinsamen Ursachen wurden behoben:

1. Die feste mobile Schriftgröße der allgemeinen Seiten-H1 ließ lange deutsche Titel überlaufen oder knapp abschneiden.
2. Ziel- und Monats-H1 waren auf Mobilgeräten unnötig groß und dominierten den ersten Bildschirm.
3. Automatische Silbentrennung erzeugte in großen Überschriften unprofessionelle Trennstellen.
4. Der Methodik-Hero enthielt drei lange Absätze und wurde dadurch auf Mobilgeräten über 1000 Pixel hoch.
5. Erklärungschips im Finder lagen unter 12 Pixel Schriftgröße.
6. Die Anzahl in den Bildnachweisen lag ebenfalls unter 12 Pixel Schriftgröße.
7. Das dreispaltige Bildnachweisraster blieb bei 768 Pixeln aktiv; lange Dateinamen verbreiterten das Dokument auf 808 Pixel.
8. Ein Regionsmodul schrieb alle zwölf Monatsnamen in eine H2.
9. Eine weitere Region schrieb elf Monatsnamen in eine H2 und erzeugte auf 360 Pixeln sieben Titelzeilen.

## Korrekturen

- Zentrale Überschriftenregeln verhindern automatische Trennung und unkontrollierte Wortumbrüche, ohne Fließtext oder bewusst anders gestaltete Module zu verändern.
- Responsive `clamp()`-Größen, Zeilenhöhen und Innenabstände wurden für allgemeine Intros, Ziel-Heros und Monats-Heros getrennt kalibriert.
- Der Methodik-Hero zeigt nur noch die eigentliche Einleitung. Die Detailabsätze stehen in einem anschließenden, lesbaren Inhaltsblock.
- Finder-Erklärungschips und Bildnachweis-Zähler sind nun auch auf kleinen Geräten lesbar.
- Bildnachweise wechseln bereits unter 900 Pixeln in ein einspaltiges Layout; lange lokale Dateinamen dürfen innerhalb ihres Eintrags umbrechen.
- Regionsseiten verwenden bei zwölf Monaten „ganzjährig“ und bei sechs oder mehr Monaten eine kurze Aussage über die Anzahl der Monate. Kürzere Saisons behalten die konkreten Monatsnamen.
- `scripts/validate/visual-route-manifest.ts` und `pnpm audit:visual-routes` erzeugen künftig die vollständige, in Browser-Audits nutzbare URL-Liste.
- Der Render-Test prüft künftig alle 5271 öffentlichen URLs, nicht nur Stichproben: genau ein H1 pro Inhaltsseite, keine übersprungenen Überschriftenebenen und keine defekten root-relativen Links.

## Ergebnis des vollständigen Wiederholungsscans

| Viewport | URLs | Überläufe | abgeschnittene Überschriften | H1-/Navigationsfehler | sonstige Flags |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1440 × 1000 | 5271 | 0 | 0 | 0 | 0 |
| 1280 × 800 | 5271 | 0 | 0 | 0 | 0 |
| 768 × 1024 | 5271 | 0 | 0 | 0 | 0 |
| 390 × 844 | 5271 | 0 | 0 | 0 | 0 |
| 360 × 800 | 5271 | 0 | 0 | 0 | 0 |

## Technische QA

- Produktionsbuild: erfolgreich, 5279 statisch erzeugte Next.js-Seiten.
- TypeScript: erfolgreich.
- Next.js Lint-/Typprüfung im Build: erfolgreich.
- Tests: 248/248 erfolgreich.
- Vollständige Render-/Linkprüfung: 16/16 erfolgreich; 5271 URLs abgedeckt.
- CSS-Guard: 596 Regeln, 172 Klassen, keine verwaisten oder positionsabhängig dimensionierten Klassen.
- Architektur-Guard: erfolgreich; statische JSON-only-Bereitstellung.
- Datenvalidierung: 315 Ziele und 370 öffentliche Datendateien erfolgreich.
- Determinismus: 370 Dateien bytegenau reproduziert.
- Zellintegrität: 315 Zellen, keine neue problematische Zelle.
- Deployment-Budget: 11.258 von 20.000 Dateien (56 %).
- Wissenschaftsaudit: 0 wissenschaftliche Produktionsblocker.
- Browserkonsole lokal und live: 0 Warnungen und 0 Fehler aus der Website.

## Deployment und offene Freigaben

- Cloudflare-Deployment: erfolgreich.
- Unveränderliche Deployment-URL: https://ca315618.best-time-to-hike.pages.dev
- Kanonische Pages-Domain: https://best-time-to-hike.pages.dev
- Beide URLs wurden nach dem Upload mobil geprüft; die kanonische Domain zusätzlich auf 1440 × 1000 Pixeln.
- Noch offen sind ausschließlich die drei bereits bekannten formalen Produktionsfreigaben: Betreiber-/Rechtsangaben, formale Accessibility-/Performance-Freigabe und die noch zu kaufende beziehungsweise zu verbindende Custom Domain. Der Design-Audit selbst hat keine offenen Darstellungsprobleme.
- Der Datenqualitätsreport enthält weiterhin den bekannten Hinweis zur Hunza-Temperaturanomalie. Er ist wissenschaftlich dokumentiert und kein Design- oder Buildfehler.
