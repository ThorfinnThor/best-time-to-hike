import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-27";

export const bestTimeToHikeSouthAfricaCapeDrakensberg: BlogPost = {
  slug: "best-time-to-hike-south-africa-cape-drakensberg",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "table-mountain",
  evidence: [
    evidence("south-africa-calendars", "Eligible calendars, best-month lists and representative elevations for Table Mountain, Cederberg, Drakensberg and Blyde River Canyon.", [
      "public/data/hiking/destinations/za/table-mountain.json",
      "public/data/hiking/destinations/za/cederberg.json",
      "public/data/hiking/destinations/za/drakensberg.json",
      "public/data/hiking/destinations/za/blyde-river.json",
      "data-config/blog/batch-9-evidence.json",
    ], checkedAt),
    evidence("south-africa-season-shift", "Selected summer, autumn, winter and spring temperature, rain, heat and daylight records for four South African representative cells.", [
      "public/data/hiking/destinations/za/table-mountain.json",
      "public/data/hiking/destinations/za/cederberg.json",
      "public/data/hiking/destinations/za/drakensberg.json",
      "public/data/hiking/destinations/za/blyde-river.json",
      "data-config/blog/batch-9-evidence.json",
    ], checkedAt),
    evidence("south-africa-method", "Historical aggregation, critical heat rule and representative-cell limits used to compare regional climate windows.", [
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-9-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike South Africa: Cape to Drakensberg",
      description: "Compare Table Mountain, Cederberg, Drakensberg and Blyde River using 1991–2025 temperature, rain, heat and daylight data.",
      heroAlt: "Stone trail across the top of Table Mountain above Cape Town",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "The best time to hike South Africa depends on which side of the country is on the itinerary. Cape Town and the Cederberg have a winter-rain pattern. The Drakensberg and Blyde River Canyon become much drier during the southern winter, while their summers are wetter and, at Blyde River, hotter. The public 1991–2025 records make that reversal visible across four selected ERA5-Land cells. Table Mountain is represented at 115.4 metres, the Cederberg at 887.5 metres, Blyde River at 1,224.8 metres and the Drakensberg at 2,296.5 metres. Those are different model contexts, not four interchangeable trailheads. They are still useful for deciding whether one trip should stay in a region or follow the seasons across the country." },
        { type: "comparisonTable", caption: "June: the east is dry while the Cape is in its wetter season", columns: ["Region", "Temperature", "Wet days", "Monthly rain", "Daylight", "Score"], rows: [
          { label: "Table Mountain", values: ["14.4 °C", "39.05%", "106.4 mm", "9.9 h", "83"] },
          { label: "Cederberg", values: ["12.4 °C", "28.10%", "86.9 mm", "10.0 h", "85"] },
          { label: "Drakensberg", values: ["8.7 °C", "12.67%", "19.9 mm", "10.3 h", "84"] },
          { label: "Blyde River", values: ["17.1 °C", "5.33%", "7.1 mm", "10.6 h", "94"] },
        ], evidenceKey: "south-africa-season-shift" },
        { type: "metricCallout", label: "January is not one national hiking season", value: "8.48% wet in Cederberg · 85.35% in Drakensberg", detail: "The drier Cederberg record still fails the project's heat rule: modelled hot-day probability reaches 66.54% and the score is capped at 49.", evidenceKey: "south-africa-season-shift" },
        { type: "heading", level: 2, text: "The useful window moves from south-west to north-east" },
        { type: "timeline", caption: "How a cross-country hiking year changes", points: [
          { label: "December–February", value: "Table Mountain is dry and mild", detail: "The selected cell has 8.94–13.00% wet days, while Drakensberg exceeds 83% and Cederberg crosses the heat limit in January and February." },
          { label: "March–April", value: "The broad overlap begins", detail: "Cederberg clears the heat gate in March; April temperatures span 13.9–21.1 °C across all four cells." },
          { label: "May–July", value: "The eastern dry season", detail: "Blyde River falls below 10% wet days and Drakensberg below 23%, but the Cape becomes cooler and wetter." },
          { label: "September–October", value: "The balance moves back toward the Cape", detail: "Cederberg peaks at score 92 in September; Drakensberg rain rises from 65.0 mm to 153.6 mm by October." },
        ], evidenceKey: "south-africa-season-shift" },
        { type: "paragraph", text: "May and June make the strongest historical case for an eastern itinerary. Blyde River records 19.3 °C and 9.86 percent wet days in May, then 17.1 °C and 5.33 percent in June. The Drakensberg is colder because its representative cell sits more than a kilometre higher: June averages 8.7 °C, with a published 10th-to-90th-percentile range from 2.2 to 13.6 °C. Rain frequency falls to 12.67 percent, yet the snow-day signal remains 9.52 percent. The two records therefore share a dry season without sharing the same clothing, exposure or route problem. A warm canyon walk and a high escarpment traverse should not be planned from the same headline." },
        { type: "heading", level: 2, text: "April or September can connect more than one region" },
        { type: "monthStrip", caption: "Four practical starting points for a mixed itinerary", months: [
          { month: 4, label: "April", note: "All four pass · 13.9–21.1 °C · transition month", href: links.destinationMonth("en", "cederberg", 4) },
          { month: 6, label: "June", note: "Eastern dry season · Cape winter rain", href: links.destinationMonth("en", "blyde-river", 6) },
          { month: 9, label: "September", note: "Cederberg 92 · Drakensberg 85 · warmer Blyde", href: links.destinationMonth("en", "drakensberg", 9) },
          { month: 12, label: "December", note: "Table Mountain dry · eastern summer rain", href: links.destinationMonth("en", "table-mountain", 12) },
        ], evidenceKey: "south-africa-calendars" },
        { type: "paragraph", text: "April is the gentlest four-way compromise in these records. Every cell passes the critical rules, mean temperatures stay between 13.9 and 21.1 °C, and neither the Cederberg summer heat failure nor the eastern winter chill dominates. September is better if the Cape mountains matter more: Table Mountain reaches 15.0 °C, Cederberg 15.4 °C and both remain below 29 percent wet days. The trade-off is that Blyde River is already warming to 21.9 °C with a 24.86 percent hot-day probability, while Drakensberg wet days rise to 36.67 percent. By October the contrast is stronger. Table Mountain and Cederberg score 96 and 91, but Drakensberg rain more than doubles from September to 153.6 mm. A single national best month would hide the direction of travel." },
        { type: "pullQuote", text: "South Africa does not have one hiking season: the dry window changes sides of the country." },
        { type: "caveat", text: "These figures are 35-year historical averages for one selected model cell per destination, not forecasts, route-opening dates or safety ratings. They do not resolve Cape wind, summit cloud, thunderstorms, wildfire, river levels, snow depth, path condition, permits or the elevation profile of a specific hike. The published wind field is coarse grid wind rather than exposed-trail gust information. Check current forecasts, official park notices and the exact route before travelling." },
        { type: "destinationLinks", heading: "Build a South Africa route from the four records", links: [
          { label: "Table Mountain", href: links.destination("en", "table-mountain"), detail: "Compare the dry Cape summer with the wetter winter." },
          { label: "Cederberg", href: links.destination("en", "cederberg"), detail: "See where summer heat closes the recommendation gate." },
          { label: "Drakensberg", href: links.destination("en", "drakensberg"), detail: "Inspect the high, dry winter and wet summer." },
          { label: "Blyde River Canyon", href: links.destination("en", "blyde-river"), detail: "Open the warm and very dry June–July record." },
          { label: "Methodology", href: links.methodology("en"), detail: "Understand the climate gates and representative cells." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Filter destinations by month and personal preferences." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit für Südafrika: Kap bis Drakensberg",
      description: "Tafelberg, Cederberg, Drakensberg und Blyde River mit Temperatur-, Regen-, Hitze- und Tageslichtdaten von 1991–2025 vergleichen.",
      heroAlt: "Steiniger Weg auf dem Tafelberg oberhalb von Kapstadt",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "Die beste Wanderzeit für Südafrika hängt davon ab, welche Seite des Landes auf der Route liegt. Kapstadt und die Cederberge besitzen ein winterliches Regenmuster. Drakensberg und Blyde River Canyon werden im Südwinter deutlich trockener, während ihre Sommer nasser und am Blyde River heißer sind. Die öffentlichen Datensätze von 1991 bis 2025 machen diese Umkehrung an vier ausgewählten ERA5-Land-Zellen sichtbar. Der Tafelberg wird auf 115,4 Metern repräsentiert, Cederberg auf 887,5 Metern, Blyde River auf 1.224,8 Metern und Drakensberg auf 2.296,5 Metern. Das sind verschiedene Modellkontexte und keine austauschbaren Ausgangspunkte. Sie helfen trotzdem bei der Entscheidung, ob eine Reise in einer Region bleiben oder den Jahreszeiten durchs Land folgen sollte." },
        { type: "comparisonTable", caption: "Juni: Der Osten ist trocken, während am Kap die nassere Saison läuft", columns: ["Region", "Temperatur", "Nasse Tage", "Monatsregen", "Tageslicht", "Score"], rows: [
          { label: "Tafelberg", values: ["14,4 °C", "39,05%", "106,4 mm", "9,9 h", "83"] },
          { label: "Cederberg", values: ["12,4 °C", "28,10%", "86,9 mm", "10,0 h", "85"] },
          { label: "Drakensberg", values: ["8,7 °C", "12,67%", "19,9 mm", "10,3 h", "84"] },
          { label: "Blyde River", values: ["17,1 °C", "5,33%", "7,1 mm", "10,6 h", "94"] },
        ], evidenceKey: "south-africa-season-shift" },
        { type: "metricCallout", label: "Der Januar ist keine einheitliche Wandersaison", value: "8,48% nass in Cederberg · 85,35% in Drakensberg", detail: "Der trockenere Cederberg-Datensatz scheitert trotzdem an der Hitzeregel: Die modellierte Wahrscheinlichkeit heißer Tage erreicht 66,54% und der Score wird auf 49 begrenzt.", evidenceKey: "south-africa-season-shift" },
        { type: "heading", level: 2, text: "Das brauchbare Fenster wandert vom Südwesten in den Nordosten" },
        { type: "timeline", caption: "Wie sich ein Wanderjahr quer durchs Land verändert", points: [
          { label: "Dezember–Februar", value: "Der Tafelberg ist trocken und mild", detail: "Die ausgewählte Zelle hat 8,94 bis 13,00% nasse Tage, während Drakensberg über 83% liegt und Cederberg im Januar und Februar die Hitzegrenze überschreitet." },
          { label: "März–April", value: "Die breite Überschneidung beginnt", detail: "Cederberg passiert ab März das Hitzetor; im April reichen die Temperaturen an allen vier Zellen von 13,9 bis 21,1 °C." },
          { label: "Mai–Juli", value: "Die trockene Saison im Osten", detail: "Blyde River fällt unter 10% nasse Tage und Drakensberg unter 23%, während das Kap kühler und nasser wird." },
          { label: "September–Oktober", value: "Die Balance wandert zurück zum Kap", detail: "Cederberg erreicht im September Score 92; der Regen in Drakensberg steigt bis Oktober von 65,0 auf 153,6 mm." },
        ], evidenceKey: "south-africa-season-shift" },
        { type: "paragraph", text: "Mai und Juni liefern historisch den stärksten Fall für eine Route im Osten. Blyde River erreicht im Mai 19,3 °C und 9,86 Prozent nasse Tage, im Juni 17,1 °C und 5,33 Prozent. Drakensberg ist wegen seiner mehr als einen Kilometer höher gelegenen repräsentativen Zelle deutlich kälter. Der Juni liegt im Mittel bei 8,7 °C, der veröffentlichte Bereich vom 10. bis 90. Perzentil reicht von 2,2 bis 13,6 °C. Die Regenhäufigkeit sinkt auf 12,67 Prozent, das Schneetagesignal bleibt aber bei 9,52 Prozent. Beide Datensätze teilen eine trockene Saison, nicht dieselbe Kleidungs-, Expositions- oder Routenfrage. Eine warme Canyonwanderung und eine hohe Überschreitung dürfen nicht nach derselben Kurzfassung geplant werden." },
        { type: "heading", level: 2, text: "April oder September können mehrere Regionen verbinden" },
        { type: "monthStrip", caption: "Vier sinnvolle Ausgangspunkte für eine kombinierte Route", months: [
          { month: 4, label: "April", note: "Alle vier passieren · 13,9–21,1 °C · Übergangsmonat", href: links.destinationMonth("de", "cederberg", 4) },
          { month: 6, label: "Juni", note: "Trockener Osten · Winterregen am Kap", href: links.destinationMonth("de", "blyde-river", 6) },
          { month: 9, label: "September", note: "Cederberg 92 · Drakensberg 85 · wärmerer Blyde", href: links.destinationMonth("de", "drakensberg", 9) },
          { month: 12, label: "Dezember", note: "Tafelberg trocken · Sommerregen im Osten", href: links.destinationMonth("de", "table-mountain", 12) },
        ], evidenceKey: "south-africa-calendars" },
        { type: "paragraph", text: "Der April ist in diesen Datensätzen der sanfteste Kompromiss für alle vier Regionen. Jede Zelle passiert die kritischen Regeln, die Mitteltemperaturen bleiben zwischen 13,9 und 21,1 °C und weder die sommerliche Hitzegrenze in Cederberg noch die winterliche Kälte im Osten dominiert. Der September passt besser, wenn die Kapberge wichtiger sind. Tafelberg erreicht 15,0 °C, Cederberg 15,4 °C und beide bleiben unter 29 Prozent nassen Tagen. Dafür erwärmt sich Blyde River bereits auf 21,9 °C bei 24,86 Prozent Wahrscheinlichkeit heißer Tage, während Drakensberg auf 36,67 Prozent nasse Tage steigt. Im Oktober wird der Gegensatz stärker. Tafelberg und Cederberg erreichen 96 und 91 Punkte, doch der Regen in Drakensberg verdoppelt sich gegenüber September auf 153,6 mm. Ein einziger nationaler Bestmonat würde die Reiserichtung verbergen." },
        { type: "pullQuote", text: "Südafrika hat nicht eine Wandersaison: Das trockene Fenster wechselt die Seite des Landes." },
        { type: "caveat", text: "Diese Werte sind 35-jährige historische Mittel für je eine ausgewählte Modellzelle und weder Vorhersagen noch Wegöffnungen oder Sicherheitsbewertungen. Sie lösen Kapwind, Gipfelwolken, Gewitter, Feuer, Flusspegel, Schneehöhe, Wegzustand, Genehmigungen oder das Höhenprofil einer konkreten Tour nicht auf. Das veröffentlichte Windfeld ist grober Gitterwind statt einer Information zu Böen auf exponierten Wegen. Vor der Reise aktuelle Vorhersagen, offizielle Parkmeldungen und die genaue Route prüfen." },
        { type: "destinationLinks", heading: "Eine Südafrika-Route aus vier Datensätzen bauen", links: [
          { label: "Tafelberg", href: links.destination("de", "table-mountain"), detail: "Den trockenen Kapsommer mit dem nassen Winter vergleichen." },
          { label: "Cederberg", href: links.destination("de", "cederberg"), detail: "Sehen, wo Sommerhitze das Empfehlungstor schließt." },
          { label: "Drakensberg", href: links.destination("de", "drakensberg"), detail: "Den hohen, trockenen Winter und nassen Sommer prüfen." },
          { label: "Blyde River Canyon", href: links.destination("de", "blyde-river"), detail: "Den warmen und sehr trockenen Juni und Juli öffnen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Klimatore und repräsentative Zellen verstehen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Ziele nach Monat und eigenen Vorlieben filtern." },
        ] },
      ],
    },
  },
};
