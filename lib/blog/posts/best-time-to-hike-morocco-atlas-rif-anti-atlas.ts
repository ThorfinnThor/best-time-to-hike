import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-27";

export const bestTimeToHikeMoroccoAtlasRifAntiAtlas: BlogPost = {
  slug: "best-time-to-hike-morocco-atlas-rif-anti-atlas",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "atlas-mountains",
  evidence: [
    evidence("morocco-calendars", "Eligible calendars, best-month lists and representative elevations for Atlas Mountains, M'Goun, Anti-Atlas and Rif Mountains.", [
      "public/data/hiking/destinations/ma/atlas-mountains.json",
      "public/data/hiking/destinations/ma/mgoun.json",
      "public/data/hiking/destinations/ma/anti-atlas.json",
      "public/data/hiking/destinations/ma/rif.json",
      "data-config/blog/batch-9-evidence.json",
    ], checkedAt),
    evidence("morocco-altitude-seasons", "Selected winter, spring, summer and autumn temperature, precipitation, snow and heat records across four Moroccan representative cells.", [
      "public/data/hiking/destinations/ma/atlas-mountains.json",
      "public/data/hiking/destinations/ma/mgoun.json",
      "public/data/hiking/destinations/ma/anti-atlas.json",
      "public/data/hiking/destinations/ma/rif.json",
      "data-config/blog/batch-9-evidence.json",
    ], checkedAt),
    evidence("morocco-method", "Historical aggregation, critical heat rule and representative-cell scope used to interpret Moroccan climate windows without implying route access.", [
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-9-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Morocco: Atlas, Rif and Anti-Atlas",
      description: "Compare Morocco’s Atlas, M'Goun, Rif and Anti-Atlas hiking seasons using 1991–2025 temperature, rain, snow and heat data.",
      heroAlt: "Mountain village below snow-dusted peaks in Morocco's High Atlas",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "monthStrip", caption: "The answer changes with elevation", months: [
          { month: 1, label: "January", note: "Anti-Atlas mild · High Atlas winter signal", href: links.destinationMonth("en", "anti-atlas", 1) },
          { month: 4, label: "April", note: "All four pass · widest balanced overlap", href: links.destinationMonth("en", "atlas-mountains", 4) },
          { month: 7, label: "July", note: "High Atlas passes · Rif and Anti-Atlas fail heat gate", href: links.destinationMonth("en", "mgoun", 7) },
          { month: 9, label: "September", note: "All four pass again · warmer in the lower ranges", href: links.destinationMonth("en", "rif", 9) },
          { month: 11, label: "November", note: "Anti-Atlas strong · snow signal returns high", href: links.destinationMonth("en", "anti-atlas", 11) },
        ], evidenceKey: "morocco-calendars" },
        { type: "paragraph", text: "The best time to hike Morocco is not one national shoulder season. The public 1991–2025 dataset represents the Atlas Mountains at 2,822.7 metres and M'Goun at 2,800.3 metres, then drops to 1,454.0 metres in the Anti-Atlas and 1,133.2 metres in the Rif. That height difference reverses the main planning problem. In winter, the high cells are cold and carry frequent modelled snow-day signals while the Anti-Atlas remains comparatively mild. In July, the high Atlas cells average about 22 °C and pass the project's climate gate, but the lower Anti-Atlas and Rif records fail because hot-day probability exceeds the critical limit. A search for one best month therefore needs a second question: which mountain range and approximate elevation?" },
        { type: "comparisonTable", caption: "July at four selected Moroccan model cells", columns: ["Range", "Model elevation", "Temperature", "Hot days", "Wet days", "Gate"], rows: [
          { label: "Atlas Mountains", values: ["2,822.7 m", "22.0 °C", "1.47%", "14.65%", "Pass"] },
          { label: "M'Goun", values: ["2,800.3 m", "22.1 °C", "0.55%", "22.12%", "Pass"] },
          { label: "Anti-Atlas", values: ["1,454.0 m", "30.3 °C", "94.10%", "15.58%", "Fail"] },
          { label: "Rif", values: ["1,133.2 m", "26.8 °C", "67.10%", "2.67%", "Fail"] },
        ], evidenceKey: "morocco-altitude-seasons" },
        { type: "heading", level: 2, text: "Spring creates the broadest shared climate window" },
        { type: "paragraph", text: "April is the clearest all-range compromise in these records. Mean temperatures are 10.1 °C in the Atlas Mountains, 10.0 °C at M'Goun, 17.8 °C in the Anti-Atlas and 14.4 °C in the Rif. All four pass. The higher cells still show 6.76 and 9.43 percent modelled snow days, so a monthly pass is not a declaration that a particular high route is clear. Rain also differs. The Rif reaches 77.4 mm and 34.76 percent wet days, roughly double the wet-day frequency of the Anti-Atlas at 14.48 percent. April offers overlap, not identical conditions. It is most useful for a mixed itinerary where moderate lower-range temperatures matter and current high-level snow can be checked separately." },
        { type: "pullQuote", text: "In Morocco, choosing the range is part of choosing the month." },
        { type: "metricCallout", label: "The summer split is a heat rule, not a rainfall rule", value: "94.10% hot days in the Anti-Atlas in July", detail: "The same month is dry at 13.2 mm, but dryness cannot compensate for a critical heat failure. The score is capped at 49 and the month is ineligible.", evidenceKey: "morocco-altitude-seasons" },
        { type: "timeline", caption: "A range-by-range planning sequence", points: [
          { label: "Winter", value: "Begin with the Anti-Atlas", detail: "January averages 10.9 °C with 11.43% wet days. Atlas and M'Goun average 3.7 and 2.7 °C, with 32.63% and 39.54% snow-day signals." },
          { label: "Spring", value: "Widen the choice", detail: "Every record passes from March through May; April avoids the strongest high-level winter signal and the lower-range summer heat failures." },
          { label: "Summer", value: "Move higher", detail: "Atlas and M'Goun pass in June, July and August. Anti-Atlas fails all three; Rif fails July and August." },
          { label: "Autumn", value: "Lower ranges reopen", detail: "All four pass from September. Anti-Atlas reaches score 91 in November, while snow-day signals rise again above 12% in the high cells." },
        ], evidenceKey: "morocco-calendars" },
        { type: "heading", level: 2, text: "May, June and September solve different trips" },
        { type: "paragraph", text: "May is the safer first shortlist for an itinerary that mixes high and low terrain. The four records all pass, and their best-month lists include May for Atlas, Anti-Atlas and Rif. June is more specialised. Atlas reaches 18.4 °C, 20.86 percent wet days and no modelled snow days; M'Goun reaches 18.5 °C, 26.10 percent wet days and the same zero snow-day signal. The Rif remains eligible at 22.5 °C, but hot-day probability has risen to 17.81 percent. Anti-Atlas is already ineligible at 25.4 °C because hot-day probability reaches 56.48 percent. September reopens every record, though the lower terrain is not yet fully cool. Anti-Atlas averages 24.2 °C with 48.00 percent hot days, only just below the critical boundary, while Atlas and M'Goun are near 16.5 °C. November favours a lower itinerary again: Anti-Atlas reaches score 91 at 15.1 °C, whereas the high cells cool below 8 °C and their snow-day signals rise to 12.86 and 20.95 percent. The practical choice is not the highest score in a national table. It is the month whose elevation profile resembles the planned route." },
        { type: "caveat", text: "These are 35-year climatological averages for four selected ERA5-Land cells, not forecasts or statements about pass access. A representative cell cannot resolve snow depth, shaded gullies, flash-flood risk, water availability, route finding, road access, refuge dates or temperature changes along a multi-day ascent. The wind field is coarse grid wind rather than exposed-ridge gust information. Check the exact route, current mountain forecast, local guides and official access information before committing to a trek." },
        { type: "destinationLinks", heading: "Choose the Moroccan range before the month", links: [
          { label: "Atlas Mountains", href: links.destination("en", "atlas-mountains"), detail: "Inspect the high representative cell and its cold margins." },
          { label: "M'Goun", href: links.destination("en", "mgoun"), detail: "Compare a second high-cell summer window." },
          { label: "Anti-Atlas", href: links.destination("en", "anti-atlas"), detail: "See the mild winter and summer heat closure." },
          { label: "Rif Mountains", href: links.destination("en", "rif"), detail: "Compare wetter spring weather and a shorter heat closure." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read how heat and snow gates are applied." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Filter the wider destination set by month and preference." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit für Marokko: Atlas, Rif und Anti-Atlas",
      description: "Wandersaisons in Atlas, M'Goun, Rif und Anti-Atlas mit Daten zu Temperatur, Regen, Schnee und Hitze von 1991–2025 vergleichen.",
      heroAlt: "Bergdorf unter schneebedeckten Gipfeln im Hohen Atlas in Marokko",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "monthStrip", caption: "Die Antwort verändert sich mit der Höhe", months: [
          { month: 1, label: "Januar", note: "Anti-Atlas mild · Wintersignal im Hohen Atlas", href: links.destinationMonth("de", "anti-atlas", 1) },
          { month: 4, label: "April", note: "Alle vier passieren · breiteste ausgewogene Überschneidung", href: links.destinationMonth("de", "atlas-mountains", 4) },
          { month: 7, label: "Juli", note: "Hoher Atlas passiert · Rif und Anti-Atlas scheitern an Hitze", href: links.destinationMonth("de", "mgoun", 7) },
          { month: 9, label: "September", note: "Alle vier passieren wieder · wärmer in den tieferen Gebirgen", href: links.destinationMonth("de", "rif", 9) },
          { month: 11, label: "November", note: "Anti-Atlas stark · Schneesignal kehrt in der Höhe zurück", href: links.destinationMonth("de", "anti-atlas", 11) },
        ], evidenceKey: "morocco-calendars" },
        { type: "paragraph", text: "Die beste Wanderzeit für Marokko ist keine einzige nationale Nebensaison. Der öffentliche Datensatz von 1991 bis 2025 repräsentiert das Atlasgebirge auf 2.822,7 Metern und M'Goun auf 2.800,3 Metern. Danach fällt die Modellhöhe auf 1.454,0 Meter im Anti-Atlas und 1.133,2 Meter im Rif. Dieser Höhenunterschied kehrt das wichtigste Planungsproblem um. Im Winter sind die hohen Zellen kalt und tragen häufige modellierte Schneetagesignale, während der Anti-Atlas vergleichsweise mild bleibt. Im Juli liegen die hohen Atlas-Zellen bei ungefähr 22 °C und passieren das Klimator des Projekts. Die tieferen Datensätze in Anti-Atlas und Rif scheitern dagegen, weil die Wahrscheinlichkeit heißer Tage die kritische Grenze überschreitet. Zur Frage nach dem besten Monat gehört deshalb immer eine zweite: Welches Gebirge und ungefähr welche Höhe?" },
        { type: "comparisonTable", caption: "Juli an vier ausgewählten marokkanischen Modellzellen", columns: ["Gebirge", "Modellhöhe", "Temperatur", "Heiße Tage", "Nasse Tage", "Tor"], rows: [
          { label: "Atlasgebirge", values: ["2.822,7 m", "22,0 °C", "1,47%", "14,65%", "Passiert"] },
          { label: "M'Goun", values: ["2.800,3 m", "22,1 °C", "0,55%", "22,12%", "Passiert"] },
          { label: "Anti-Atlas", values: ["1.454,0 m", "30,3 °C", "94,10%", "15,58%", "Scheitert"] },
          { label: "Rif", values: ["1.133,2 m", "26,8 °C", "67,10%", "2,67%", "Scheitert"] },
        ], evidenceKey: "morocco-altitude-seasons" },
        { type: "heading", level: 2, text: "Der Frühling schafft das breiteste gemeinsame Klimafenster" },
        { type: "paragraph", text: "Der April ist in diesen Datensätzen der klarste Kompromiss für alle vier Gebirge. Die Mitteltemperaturen erreichen 10,1 °C im Atlasgebirge, 10,0 °C bei M'Goun, 17,8 °C im Anti-Atlas und 14,4 °C im Rif. Alle vier passieren. Die höheren Zellen zeigen noch 6,76 und 9,43 Prozent modellierte Schneetage. Ein bestandener Monat erklärt deshalb keinen bestimmten Höhenweg für frei. Auch der Regen unterscheidet sich. Das Rif erreicht 77,4 mm und 34,76 Prozent nasse Tage, ungefähr die doppelte Regenhäufigkeit des Anti-Atlas mit 14,48 Prozent. Der April bietet Überschneidung und keine identischen Bedingungen. Besonders nützlich ist er für eine kombinierte Route, wenn gemäßigte Temperaturen in tieferen Gebirgen wichtig sind und aktueller Schnee in der Höhe separat geprüft wird." },
        { type: "pullQuote", text: "In Marokko ist die Wahl des Gebirges bereits ein Teil der Monatswahl." },
        { type: "metricCallout", label: "Die Sommertrennung entsteht durch Hitze, nicht durch Regen", value: "94,10% heiße Tage im Anti-Atlas im Juli", detail: "Derselbe Monat ist mit 13,2 mm trocken, aber Trockenheit kann einen kritischen Hitzefehler nicht ausgleichen. Der Score wird auf 49 begrenzt und der Monat ist nicht zulässig.", evidenceKey: "morocco-altitude-seasons" },
        { type: "timeline", caption: "Eine Planungsfolge nach Gebirgsgruppe", points: [
          { label: "Winter", value: "Mit dem Anti-Atlas beginnen", detail: "Der Januar erreicht 10,9 °C und 11,43% nasse Tage. Atlas und M'Goun liegen bei 3,7 und 2,7 °C sowie bei 32,63% und 39,54% Schneetagesignal." },
          { label: "Frühling", value: "Die Auswahl verbreitern", detail: "Von März bis Mai passiert jeder Datensatz. Der April vermeidet die stärksten winterlichen Signale in der Höhe und die sommerlichen Hitzefehler weiter unten." },
          { label: "Sommer", value: "Höher gehen", detail: "Atlas und M'Goun passieren Juni, Juli und August. Der Anti-Atlas scheitert in allen drei Monaten, das Rif im Juli und August." },
          { label: "Herbst", value: "Die tieferen Gebirge öffnen wieder", detail: "Ab September passieren alle vier. Der Anti-Atlas erreicht im November Score 91, während das Schneetagesignal an den hohen Zellen wieder über 12% steigt." },
        ], evidenceKey: "morocco-calendars" },
        { type: "heading", level: 2, text: "Mai, Juni und September lösen verschiedene Reisen" },
        { type: "paragraph", text: "Der Mai ist die vorsichtigere erste Auswahl für eine Reise, die hohes und tiefes Gelände verbindet. Alle vier Datensätze passieren und die Listen der besten Monate enthalten den Mai für Atlas, Anti-Atlas und Rif. Der Juni ist spezieller. Das Atlasgebirge erreicht 18,4 °C, 20,86 Prozent nasse Tage und kein modelliertes Schneetagesignal. M'Goun erreicht 18,5 °C, 26,10 Prozent nasse Tage und ebenfalls null. Das Rif bleibt bei 22,5 °C zulässig, doch die Wahrscheinlichkeit heißer Tage ist auf 17,81 Prozent gestiegen. Der Anti-Atlas ist bei 25,4 °C bereits nicht zulässig, weil heiße Tage 56,48 Prozent erreichen. Im September öffnen alle Datensätze wieder, obwohl die tieferen Lagen noch nicht vollständig abgekühlt sind. Der Anti-Atlas liegt bei 24,2 °C und 48,00 Prozent heißen Tagen nur knapp unter der kritischen Grenze, Atlas und M'Goun dagegen nahe 16,5 °C. Im November passt das Profil wieder besser zu einer tieferen Route. Der Anti-Atlas erreicht bei 15,1 °C Score 91, während die hohen Zellen unter 8 °C fallen und ihre Schneetagesignale auf 12,86 und 20,95 Prozent steigen. Die praktische Wahl ist nicht der höchste Score in einer nationalen Tabelle. Es ist der Monat, dessen Höhenprofil der geplanten Route ähnelt." },
        { type: "caveat", text: "Diese Werte sind 35-jährige Klimamittel für vier ausgewählte ERA5-Land-Zellen und weder Vorhersagen noch Aussagen über den Zugang zu Pässen. Eine repräsentative Zelle löst Schneehöhe, schattige Rinnen, Sturzflutrisiko, Wasserverfügbarkeit, Orientierung, Straßenzugang, Öffnungszeiten von Unterkünften oder Temperaturänderungen entlang eines mehrtägigen Aufstiegs nicht auf. Das Windfeld ist grober Gitterwind und keine Information zu Böen auf exponierten Graten. Vor einer Trekkingtour genaue Route, aktuelles Bergwetter, lokale Guides und offizielle Zugangsinformationen prüfen." },
        { type: "destinationLinks", heading: "Erst das marokkanische Gebirge, dann den Monat wählen", links: [
          { label: "Atlasgebirge", href: links.destination("de", "atlas-mountains"), detail: "Die hohe repräsentative Zelle und ihre kalten Ränder prüfen." },
          { label: "M'Goun", href: links.destination("de", "mgoun"), detail: "Ein zweites sommerliches Höhenfenster vergleichen." },
          { label: "Anti-Atlas", href: links.destination("de", "anti-atlas"), detail: "Den milden Winter und die sommerliche Hitzesperre sehen." },
          { label: "Rif-Gebirge", href: links.destination("de", "rif"), detail: "Nasseren Frühling und eine kürzere Hitzesperre vergleichen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Nachlesen, wie Hitze- und Schneetore angewendet werden." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Den gesamten Zielsatz nach Monat und Vorlieben filtern." },
        ] },
      ],
    },
  },
};
