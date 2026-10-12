import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-11";

export const madeiraVsTenerifeWinterHikingWeather: BlogPost = {
  slug: "madeira-vs-tenerife-winter-hiking-weather",
  status: "approved",
  publishedAt: "2026-10-12",
  modifiedAt: "2026-10-12",
  heroImageSlug: "madeira",
  evidence: [
    evidence("atlantic-winter-comparison", "December to February temperature, rain, daylight and humidity at the selected Madeira and Tenerife representative cells.", [
      "public/data/hiking/destinations/pt/madeira.json",
      "public/data/hiking/destinations/es/tenerife.json",
      "data-config/blog/batch-4-evidence.json",
    ], checkedAt),
    evidence("atlantic-winter-method", "Historical period, recommendation gate, scoring weights and zero-weight grid-wind rule used to interpret the comparison.", [
      "data-config/scoring/weights.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-4-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Madeira vs Tenerife: winter hiking weather compared",
      description: "Compare Madeira and Tenerife for winter hiking: three months of historical temperature, wet-day frequency and rainfall reveal a clear trade-off.",
      heroAlt: "Mountain path above steep green ridges on Madeira",
      category: "planning",
      readingMinutes: 7,
      blocks: [
        { type: "pullQuote", text: "Madeira is warmer in this winter comparison; Tenerife is drier. The useful choice begins where that headline ends." },
        { type: "comparisonTable", caption: "Winter at the two selected representative cells", columns: ["Month", "Madeira", "Tenerife", "Rain-frequency gap"], rows: [
          { label: "December", values: ["14.4 °C · 43.50% wet days", "12.0 °C · 28.20% wet days", "Madeira +15.30 points"] },
          { label: "January", values: ["13.5 °C · 35.48% wet days", "11.0 °C · 20.83% wet days", "Madeira +14.65 points"] },
          { label: "February", values: ["13.1 °C · 35.35% wet days", "11.1 °C · 21.77% wet days", "Madeira +13.58 points"] },
        ], evidenceKey: "atlantic-winter-comparison" },
        { type: "paragraph", text: "A winter escape to Madeira or Tenerife can sound like one decision between two mild Atlantic islands. The historical records pose a more precise question. At the selected Madeira model cell, the hiking-window mean stays between 13.1 and 14.4 °C from December through February. Tenerife's selected cell sits between 11.0 and 12.0 °C. Madeira therefore carries a 2.0 to 2.5 °C warmth advantage in this comparison. Tenerife answers with fewer wet days and lower monthly precipitation in every one of the three months. Both destinations clear the project's recommendation gate throughout winter, so the comparison is not between a good island and a failed one. It is a choice between two eligible climate profiles, each measured at one specific location and elevation rather than across an entire island." },
        { type: "heading", level: 2, text: "How much is two degrees worth to your trip?" },
        { type: "metricCallout", label: "The warmth advantage", value: "Madeira +2.0 to +2.5 °C", detail: "The difference applies to the historical hiking-window means at the selected cells, not to every coast, summit or future day.", evidenceKey: "atlantic-winter-comparison" },
        { type: "paragraph", text: "Madeira's central temperature ranges are also gentler at the lower end. December runs from 11.8 to 17.0 °C between the published 10th and 90th percentiles, January from 10.7 to 16.2 °C and February from 10.3 to 16.1 °C. Tenerife's corresponding ranges begin at 8.2, 6.6 and 6.4 °C. A walker who values milder sampled hours may therefore prefer Madeira's record, especially when early starts or long pauses make the colder tail important. Yet this is not an island-wide promise. The Madeira cell represents 628.3 metres, while the Tenerife cell represents 1,867 metres. Their elevation difference is part of the evidence, not an inconvenience to hide. The figures help compare the project's chosen hiking contexts; they do not prove that every Madeira trail is warmer than every Tenerife trail." },
        { type: "heading", level: 2, text: "Tenerife gives back fewer historically wet days" },
        { type: "monthStrip", caption: "Open the monthly evidence before choosing the island", months: [
          { month: 12, label: "December", note: "Madeira 90.5 mm · Tenerife 51.0 mm", href: links.destinationMonth("en", "madeira", 12) },
          { month: 1, label: "January", note: "Madeira 59.9 mm · Tenerife 32.7 mm", href: links.destinationMonth("en", "tenerife", 1) },
          { month: 2, label: "February", note: "Madeira 58.4 mm · Tenerife 36.6 mm", href: links.destinationMonth("en", "madeira", 2) },
        ], evidenceKey: "atlantic-winter-comparison" },
        { type: "paragraph", text: "Rain changes the preference. Madeira records wet-day probabilities of 43.50 percent in December and about 35 percent in January and February. Tenerife records 28.20, 20.83 and 21.77 percent. Mean monthly precipitation tells the same directional story: Madeira exceeds Tenerife by 39.5 mm in December, 27.2 mm in January and 21.8 mm in February. Frequency and accumulation are different measures, but here both point toward the Tenerife cell as the historically drier option. Daylight barely separates the pair, with Tenerife ahead by only 0.2 to 0.4 hours in these monthly means. Relative humidity differs more: Madeira is 5.3 to 7.0 percentage points higher. That value describes modelled air at the sampled cell; it does not predict trail grip, cloud base, visibility or how a particular person will feel." },
        { type: "caveat", text: "These are 1991–2025 historical aggregates at one selected ERA5-Land representative cell per destination, not island-wide forecasts or route conditions. Eligibility is a project-defined climate gate, not confirmation of access or safety. Grid-cell wind has zero score weight and is not validated for exposed trails or gusts." },
        { type: "paragraph", text: "The practical answer is conditional. Choose Madeira's profile if a few extra degrees in the sampled hiking hours matter more than minimising historical rain frequency. Investigate Tenerife first if lower wet-day probability and lower rainfall totals matter more than the cooler temperature range. The score should not settle the choice: Tenerife leads by five points in December, three in January and two in February, but those small gaps compress the very trade-off the traveller needs to see. After choosing a profile, move outside the historical dataset. Check the current mountain forecast, the exact route and elevation, official access information and transport. A winter month that looks suitable in the long record can still contain storms, closures or local conditions the monthly model cannot resolve." },
        { type: "destinationLinks", heading: "Compare the complete winter profiles", links: [
          { label: "Madeira", href: links.destination("en", "madeira"), detail: "See all twelve historical month records." },
          { label: "Tenerife", href: links.destination("en", "tenerife"), detail: "Compare the higher selected representative cell." },
          { label: "Madeira in January", href: links.destinationMonth("en", "madeira", 1), detail: "Inspect the middle winter month." },
          { label: "Tenerife in January", href: links.destinationMonth("en", "tenerife", 1), detail: "Open the drier January record." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read how representative cells and eligibility work." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Compare other destinations by your own limits." },
        ] },
      ],
    },
    de: {
      title: "Madeira oder Teneriffa: Wanderwetter im Winter",
      description: "Madeira und Teneriffa im Wintervergleich: Historische Temperatur, Regentage und Niederschlag zeigen, welches Profil zur Wanderreise passt.",
      heroAlt: "Bergweg oberhalb steiler grüner Grate auf Madeira",
      category: "planning",
      readingMinutes: 7,
      blocks: [
        { type: "pullQuote", text: "Madeira ist in diesem Wintervergleich wärmer, Teneriffa trockener. Die sinnvolle Entscheidung beginnt nach dieser Kurzfassung." },
        { type: "comparisonTable", caption: "Winter an den beiden ausgewählten repräsentativen Zellen", columns: ["Monat", "Madeira", "Teneriffa", "Abstand bei Regentagen"], rows: [
          { label: "Dezember", values: ["14,4 °C · 43,50% nasse Tage", "12,0 °C · 28,20% nasse Tage", "Madeira +15,30 Punkte"] },
          { label: "Januar", values: ["13,5 °C · 35,48% nasse Tage", "11,0 °C · 20,83% nasse Tage", "Madeira +14,65 Punkte"] },
          { label: "Februar", values: ["13,1 °C · 35,35% nasse Tage", "11,1 °C · 21,77% nasse Tage", "Madeira +13,58 Punkte"] },
        ], evidenceKey: "atlantic-winter-comparison" },
        { type: "paragraph", text: "Eine Winterreise nach Madeira oder Teneriffa klingt zunächst wie die Wahl zwischen zwei milden Atlantikinseln. Die historischen Datensätze stellen eine genauere Frage. An der ausgewählten Modellzelle Madeiras liegt das Mittel im Wanderfenster von Dezember bis Februar zwischen 13,1 und 14,4 °C. Teneriffas ausgewählte Zelle erreicht 11,0 bis 12,0 °C. Madeira besitzt in diesem Vergleich damit einen Wärmevorsprung von 2,0 bis 2,5 °C. Teneriffa antwortet in allen drei Monaten mit weniger nassen Tagen und geringeren Niederschlagssummen. Beide Ziele passieren während des gesamten Winters das Empfehlungstor des Projekts. Es geht also nicht um eine geeignete und eine ungeeignete Insel, sondern um zwei zulässige Klimaprofile an jeweils einem bestimmten Ort und einer bestimmten Modellhöhe." },
        { type: "heading", level: 2, text: "Wie viel sind zwei zusätzliche Grad für die Reise wert?" },
        { type: "metricCallout", label: "Der Wärmevorsprung", value: "Madeira +2,0 bis +2,5 °C", detail: "Der Abstand gilt für die historischen Mittel im Wanderfenster an den ausgewählten Zellen, nicht für jede Küste, jeden Gipfel oder einen künftigen Tag.", evidenceKey: "atlantic-winter-comparison" },
        { type: "paragraph", text: "Auch am kühleren Rand bleibt Madeira milder. Die veröffentlichten Bereiche zwischen dem 10. und 90. Perzentil reichen im Dezember von 11,8 bis 17,0 °C, im Januar von 10,7 bis 16,2 °C und im Februar von 10,3 bis 16,1 °C. Auf Teneriffa beginnen die entsprechenden Bereiche bei 8,2, 6,6 und 6,4 °C. Wer bei frühen Starts oder längeren Pausen empfindlich auf kühlere Stunden reagiert, findet deshalb in Madeiras Datensatz das passendere Profil. Daraus darf aber keine pauschale Inselregel werden. Madeiras Modellzelle liegt auf 628,3 Metern, Teneriffas Zelle auf 1.867 Metern. Dieser Höhenunterschied gehört zur Evidenz und muss sichtbar bleiben. Verglichen werden die ausgewählten Wanderkontexte des Projekts, nicht sämtliche Wege beider Inseln." },
        { type: "heading", level: 2, text: "Teneriffa bietet dafür historisch weniger nasse Tage" },
        { type: "monthStrip", caption: "Vor der Inselwahl die Monatswerte öffnen", months: [
          { month: 12, label: "Dezember", note: "Madeira 90,5 mm · Teneriffa 51,0 mm", href: links.destinationMonth("de", "madeira", 12) },
          { month: 1, label: "Januar", note: "Madeira 59,9 mm · Teneriffa 32,7 mm", href: links.destinationMonth("de", "tenerife", 1) },
          { month: 2, label: "Februar", note: "Madeira 58,4 mm · Teneriffa 36,6 mm", href: links.destinationMonth("de", "madeira", 2) },
        ], evidenceKey: "atlantic-winter-comparison" },
        { type: "paragraph", text: "Beim Regen dreht sich die Präferenz. Madeira erreicht im Dezember eine Wahrscheinlichkeit nasser Tage von 43,50 Prozent und im Januar sowie Februar ungefähr 35 Prozent. Teneriffa kommt auf 28,20, 20,83 und 21,77 Prozent. Auch der mittlere Monatsniederschlag weist in dieselbe Richtung: Madeira liegt im Dezember 39,5 mm, im Januar 27,2 mm und im Februar 21,8 mm höher. Häufigkeit und Menge sind verschiedene Kennzahlen, führen hier aber beide zur trockeneren Teneriffa-Zelle. Beim Tageslicht ist der Abstand klein. Teneriffa liegt nur 0,2 bis 0,4 Stunden vorn. Die relative Feuchte trennt die Profile stärker, denn Madeira liegt um 5,3 bis 7,0 Prozentpunkte höher. Dieser Wert beschreibt modellierte Luft an der Zelle, nicht Trittsicherheit, Wolkenhöhe, Sicht oder persönliches Wohlbefinden." },
        { type: "caveat", text: "Die Werte sind historische Aggregate von 1991 bis 2025 an je einer ausgewählten repräsentativen ERA5-Land-Zelle. Sie sind weder inselweite Vorhersagen noch Routenbedingungen. Das Empfehlungstor ist eine projektdefinierte Klimaregel und bestätigt weder Zugang noch Sicherheit. Gitterwind besitzt Gewicht null und ist nicht für exponierte Wege oder Böen validiert." },
        { type: "paragraph", text: "Die praktische Antwort bleibt abhängig von den eigenen Prioritäten. Madeiras Profil passt besser, wenn einige zusätzliche Grad während der untersuchten Wanderstunden wichtiger sind als eine möglichst geringe historische Regenhäufigkeit. Teneriffa verdient den ersten Blick, wenn weniger nasse Tage und geringere Niederschlagssummen wichtiger sind als der kühlere Temperaturbereich. Der Gesamtscore sollte die Wahl nicht allein treffen. Teneriffa führt im Dezember um fünf Punkte, im Januar um drei und im Februar um zwei. Diese kleinen Abstände verdichten genau den Zielkonflikt, den man für die Planung auseinandernehmen muss. Nach der Klimawahl folgen die aktuellen Quellen: Bergwetter, konkrete Route und Höhe, offizielle Zugangsmeldungen und Verkehr. Auch ein im langjährigen Datensatz geeigneter Wintermonat kann Stürme, Sperrungen oder lokale Bedingungen enthalten, die das Monatsmodell nicht auflöst." },
        { type: "destinationLinks", heading: "Die vollständigen Winterprofile vergleichen", links: [
          { label: "Madeira", href: links.destination("de", "madeira"), detail: "Alle zwölf historischen Monatswerte ansehen." },
          { label: "Teneriffa", href: links.destination("de", "tenerife"), detail: "Die höher gelegene repräsentative Zelle vergleichen." },
          { label: "Madeira im Januar", href: links.destinationMonth("de", "madeira", 1), detail: "Den mittleren Wintermonat prüfen." },
          { label: "Teneriffa im Januar", href: links.destinationMonth("de", "tenerife", 1), detail: "Den trockeneren Januarwert öffnen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Repräsentative Zellen und Empfehlungstor nachlesen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Weitere Ziele nach eigenen Grenzen vergleichen." },
        ] },
      ],
    },
  },
};
