import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-11-17";
const sources = [
  "public/data/hiking/destinations/no/lofotodden.json",
  "public/data/hiking/destinations/no/jotunheimen.json",
  "public/data/hiking/destinations/no/hardangervidda.json",
  "public/data/hiking/destinations/no/rondane.json",
  "data-config/blog/batch-12-evidence.json",
];

export const norwayHikingJuneJulySeptember: BlogPost = {
  slug: "norway-hiking-june-july-september",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "lofotodden",
  evidence: [
    evidence("norway-months", "Eligible months and June–September temperature, snow, precipitation and daylight at four Norwegian cells.", sources, checkedAt),
    evidence("norway-elevations", "Representative model elevations and June snow-day contrast between Lofotodden and the highlands.", sources, checkedAt),
    evidence("norway-definitions", "Local hiking-hour temperature, full-day wet/snow days, astronomical daylight and recommendation limits.", [
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      ...sources,
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Hiking in Norway: June, July or September?",
      description: "Compare Lofotodden, Jotunheimen, Hardangervidda and Rondane: when snow, rain and shorter days change Norway's hiking season in our 1991–2025 data.",
      heroAlt: "Green vegetation below steep rocky mountains in Lofotodden National Park",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "July and August are the strongest shared starting points for these four Norwegian hiking regions in our public climate records. June is a more selective choice: Lofotodden's low coastal cell already passes the model's recommendation limits, while Jotunheimen and Hardangervidda still fail the snow criterion. September remains eligible at all four points, but exchanges summer warmth and light for a different mixture of rain and snow. There is consequently no single Norwegian hiking season that works equally well for coast, plateau and high mountains. The useful question is which landscape you want, and which compromise you can accommodate. This comparison uses our 1991–2025 ERA5-Land averages. It describes climate at selected model cells, rather than predicting conditions on a particular trail or the opening date of a mountain route." },
        { type: "monthStrip", caption: "Three ways to choose a Norwegian hiking month", months: [
          { month: 6, label: "June", note: "Consider the lower coastal sample; do not transfer its snow signal to the highlands.", href: links.destinationMonth("en", "lofotodden", 6) },
          { month: 7, label: "July", note: "All four cells pass, with the warmest inland averages of this comparison.", href: links.destinationMonth("en", "jotunheimen", 7) },
          { month: 9, label: "September", note: "All four still pass, with colder highlands and a wetter Lofotodden record.", href: links.destinationMonth("en", "rondane", 9) },
        ], evidenceKey: "norway-months" },
        { type: "paragraph", text: "August deserves a place beside July even if it is not in the title's three-way choice. Jotunheimen averages 7.3 °C and 9.68 percent modelled snow days in August, compared with 8.6 °C and 15.76 percent in July. Hardangervidda's snow signal falls from 7.28 to 1.47 percent between those months. That makes August worth inspecting when residual modelled snow matters more to you than the warmest average or longest day. It does not establish a snow-free route. July and August are both among the three best months selected by the site's algorithm for every destination in this comparison. That is a common climate shortlist, not evidence that every route shares the same season." },
        { type: "heading", level: 2, text: "Why June works differently on the coast and in the highlands" },
        { type: "comparisonTable", caption: "June: one coastal cell and three inland mountain cells", columns: ["Region", "Model elevation", "Hiking-hour mean", "Modelled snow days", "Model recommendation"], rows: [
          { label: "Lofotodden", values: ["94.2 m", "8.9 °C", "0%", "Eligible"] },
          { label: "Jotunheimen", values: ["1,670.5 m", "4.7 °C", "84.57%", "Withheld"] },
          { label: "Hardangervidda", values: ["1,242.5 m", "7.0 °C", "74.86%", "Withheld"] },
          { label: "Rondane", values: ["1,348.9 m", "8.0 °C", "29.62%", "Eligible"] },
        ], evidenceKey: "norway-elevations" },
        { type: "metricCallout", label: "Lofotodden in June", value: "24 h", detail: "Mean astronomical daylight at the selected cell. Temperature sampling still uses only 08:00–18:00 local time, limited to daylight; the record does not describe a 24-hour walking day.", evidenceKey: "norway-definitions" },
        { type: "paragraph", text: "The table's elevations explain why latitude alone is a poor guide. Lofotodden is much farther north, but its representative point is only 94.2 metres above sea level. Jotunheimen's model surface is 1,670.5 metres high. A June trip involving high passes cannot borrow the low coastal cell's zero snow-day value. Even Rondane, which passes the June gate, retains a 29.62 percent snow-day signal. Our snow metric records a day when the grid cell reaches at least ten percent snow cover or two centimetres of physical snow depth at some point during the full local day. It is neither fresh snowfall frequency nor the percentage of a trail covered in snow. The eligibility decision combines critical climate components; passing it does not certify bare paths." },
        { type: "heading", level: 2, text: "September reduces inland rain, but brings back cold and snow" },
        { type: "timeline", caption: "July to September: three different exchanges", points: [
          { label: "Jotunheimen", value: "8.6 → 3.2 °C", detail: "Wet days decline from 66.54% to 54.86%, while modelled snow days rise from 15.76% to 43.33%." },
          { label: "Rondane", value: "60.83 → 47.05% wet days", detail: "The mean temperature falls from 10.7 to 4.9 °C; the snow-day signal increases from 1.47% to 18.19%." },
          { label: "Lofotodden", value: "35.39 → 57.24% wet days", detail: "The coastal sample becomes wetter rather than drier; mean daylight falls from 22.7 to 13.2 hours." },
        ], evidenceKey: "norway-months" },
        { type: "paragraph", text: "A September preference therefore needs a reason more precise than avoiding summer rain. At the Jotunheimen point, hiking-hour temperature spans −1.7 to 8.3 °C between the 10th and 90th percentiles, with 12.9 hours of daylight. Those percentiles describe the distribution of sampled daytime temperatures, not overnight minima or a forecast range for your holiday. Hardangervidda is warmer at 5.5 °C in the mean, but still registers 25.05 percent modelled snow days. Lofotodden stays milder at 9.7 °C, although its monthly precipitation rises from July's 53.1 to September's 99.8 millimetres. A wet day means at least one millimetre of precipitation during the complete local day, not rain throughout a hike. Rain affects the comfort score but does not itself veto a month. Choose July or August for the broadest shared climate shortlist; inspect September if its particular cold, light and precipitation trade-offs suit the route you intend to check." },
        { type: "caveat", text: "These are project-defined 35-year historical averages, not forecasts or a standard 30-year climate normal. Each region is represented by one selected ERA5-Land cell. Astronomical daylight is not sunshine or guaranteed usable walking time. Grid wind cannot resolve exposed paths or gusts and is excluded from the score. Check current route access, snow, local forecasts and the actual elevation profile before deciding on a walk." },
        { type: "destinationLinks", heading: "Inspect the region before choosing the date", links: [
          { label: "Lofotodden", href: links.destination("en", "lofotodden"), detail: "Compare June's long day with the wetter September record." },
          { label: "Jotunheimen", href: links.destination("en", "jotunheimen"), detail: "Look at the high model elevation and short eligible season." },
          { label: "Hardangervidda", href: links.destination("en", "hardangervidda"), detail: "Inspect the change in modelled snow between June and August." },
          { label: "Rondane", href: links.destination("en", "rondane"), detail: "Compare a borderline early season with July and September." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read the definitions behind the climate comparison." },
          { label: "Hiking finder", href: links.finder("en"), detail: "Apply your month, region and preferred temperature." },
        ] },
      ],
    },
    de: {
      title: "Wandern in Norwegen: Juni, Juli oder September?",
      description: "Lofotodden, Jotunheimen, Hardangervidda und Rondane vergleichen: Wie Schnee, Regen und Tageslicht die Wanderzeit in unseren Daten von 1991–2025 prägen.",
      heroAlt: "Grüne Vegetation unter steilen Felsbergen im Nationalpark Lofotodden",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "Juli und August sind in unseren öffentlichen Klimadaten die stärksten gemeinsamen Ausgangspunkte für diese vier norwegischen Wanderregionen. Der Juni verlangt eine genauere Auswahl: Lofotoddens tiefe Küstenzelle passiert bereits die Empfehlungsgrenzen des Modells, während Jotunheimen und Hardangervidda noch am Schneekriterium scheitern. September bleibt an allen vier Punkten zulässig, tauscht Sommerwärme und Licht aber gegen eine andere Mischung aus Regen und Schnee. Eine einzige norwegische Wandersaison passt deshalb nicht gleichermaßen zu Küste, Hochebene und Hochgebirge. Hilfreicher ist die Frage, welche Landschaft du suchst und welche Einschränkungen du einplanen kannst. Der Vergleich nutzt unsere ERA5-Land-Mittelwerte von 1991 bis 2025. Er beschreibt ausgewählte Modellzellen und sagt weder das Wetter einer konkreten Tour noch das Öffnungsdatum eines Bergwegs voraus." },
        { type: "monthStrip", caption: "Drei unterschiedliche Entscheidungen für Norwegen", months: [
          { month: 6, label: "Juni", note: "Die tiefe Küstenzelle prüfen; ihr Schneesignal lässt sich nicht auf das Hochland übertragen.", href: links.destinationMonth("de", "lofotodden", 6) },
          { month: 7, label: "Juli", note: "Alle vier Zellen passieren die Grenzen; die Inlandspunkte erreichen ihre wärmsten Mittel dieses Vergleichs.", href: links.destinationMonth("de", "jotunheimen", 7) },
          { month: 9, label: "September", note: "Alle vier bleiben zulässig, mit kälterem Hochland und einem nasseren Lofotodden-Datensatz.", href: links.destinationMonth("de", "rondane", 9) },
        ], evidenceKey: "norway-months" },
        { type: "paragraph", text: "August gehört neben Juli in die Auswahl, auch wenn die Titelfrage drei andere Monate gegenüberstellt. Jotunheimen verzeichnet im August 7,3 °C und 9,68 Prozent modellierte Schneetage. Im Juli sind es 8,6 °C und 15,76 Prozent. Hardangerviddas Schneesignal fällt zwischen diesen Monaten von 7,28 auf 1,47 Prozent. August ist damit prüfenswert, wenn dir ein geringeres modelliertes Restschneesignal wichtiger ist als das wärmste Mittel oder der längste Tag. Ein schneefreier Weg folgt daraus nicht. Juli und August gehören bei allen vier Zielen zu den drei vom Website-Algorithmus ausgewählten besten Monaten. Das ergibt eine gemeinsame klimatische Vorauswahl, belegt aber keine einheitliche Saison sämtlicher Routen." },
        { type: "heading", level: 2, text: "Warum Juni an der Küste anders funktioniert als im Hochland" },
        { type: "comparisonTable", caption: "Juni: eine Küstenzelle und drei Gebirgszellen im Inland", columns: ["Region", "Modellhöhe", "Mittel im Wanderfenster", "Modellierte Schneetage", "Modellempfehlung"], rows: [
          { label: "Lofotodden", values: ["94,2 m", "8,9 °C", "0%", "Zulässig"] },
          { label: "Jotunheimen", values: ["1.670,5 m", "4,7 °C", "84,57%", "Zurückgehalten"] },
          { label: "Hardangervidda", values: ["1.242,5 m", "7,0 °C", "74,86%", "Zurückgehalten"] },
          { label: "Rondane", values: ["1.348,9 m", "8,0 °C", "29,62%", "Zulässig"] },
        ], evidenceKey: "norway-elevations" },
        { type: "metricCallout", label: "Lofotodden im Juni", value: "24 h", detail: "Mittleres astronomisches Tageslicht an der ausgewählten Zelle. Die Temperaturauswertung bleibt auf 08:00–18:00 Uhr Ortszeit und Tageslicht begrenzt; sie beschreibt keinen 24-stündigen Wandertag.", evidenceKey: "norway-definitions" },
        { type: "paragraph", text: "Die Höhen in der Tabelle erklären, warum der Breitengrad allein wenig hilft. Lofotodden liegt wesentlich weiter nördlich, sein repräsentativer Punkt aber nur 94,2 Meter über dem Meer. Jotunheimens Modelloberfläche liegt auf 1.670,5 Metern. Eine Juni-Reise über hohe Pässe kann den Schneetagewert null der tiefen Küstenzelle deshalb nicht übernehmen. Selbst Rondane, das die Juni-Grenzen passiert, behält ein Schneetagesignal von 29,62 Prozent. Unsere Schneemetrik erfasst einen Tag, sobald die Gitterzelle irgendwann während des vollständigen lokalen Tages mindestens zehn Prozent Schneebedeckung oder zwei Zentimeter physische Schneehöhe erreicht. Das ist weder die Häufigkeit frischen Schneefalls noch der verschneite Anteil eines Weges. Die Zulässigkeit kombiniert kritische Klimakomponenten; sie bestätigt keine schneefreien Pfade. Wer einen Monat vor der Reise auswählt, sollte deshalb Modellhöhe und geplantes Höhenprofil immer gemeinsam betrachten." },
        { type: "heading", level: 2, text: "September bringt im Inland weniger Regen, aber mehr Kälte und Schnee" },
        { type: "timeline", caption: "Von Juli zu September: drei unterschiedliche Veränderungen", points: [
          { label: "Jotunheimen", value: "8,6 → 3,2 °C", detail: "Nasse Tage sinken von 66,54% auf 54,86%, modellierte Schneetage steigen von 15,76% auf 43,33%." },
          { label: "Rondane", value: "60,83 → 47,05% nasse Tage", detail: "Das Temperaturmittel fällt von 10,7 auf 4,9 °C; das Schneetagesignal steigt von 1,47% auf 18,19%." },
          { label: "Lofotodden", value: "35,39 → 57,24% nasse Tage", detail: "Die Küstenzelle wird nasser statt trockener; das mittlere Tageslicht sinkt von 22,7 auf 13,2 Stunden." },
        ], evidenceKey: "norway-months" },
        { type: "paragraph", text: "Für September braucht es daher einen genaueren Grund als die Hoffnung, dem Sommerregen auszuweichen. Am Jotunheimen-Punkt reicht die Temperatur im Wanderfenster zwischen dem 10. und 90. Perzentil von −1,7 bis 8,3 °C, bei 12,9 Stunden Tageslicht. Diese Perzentile beschreiben die Verteilung erfasster Tagestemperaturen, keine nächtlichen Tiefstwerte oder Vorhersagespanne für deinen Urlaub. Hardangervidda ist mit 5,5 °C im Mittel wärmer, verzeichnet aber weiterhin 25,05 Prozent modellierte Schneetage. Lofotodden bleibt mit 9,7 °C milder, während der Monatsniederschlag von 53,1 Millimetern im Juli auf 99,8 im September steigt. Ein nasser Tag bedeutet mindestens einen Millimeter Niederschlag während des vollständigen lokalen Tages und keinen durchgehend verregneten Wandertag. Regen beeinflusst den Komfortwert, sperrt allein aber keinen Monat. Juli oder August liefern die breiteste gemeinsame klimatische Vorauswahl. September lohnt die genauere Prüfung, wenn seine Kombination aus Kälte, Licht und Niederschlag zur vorgesehenen Route passt." },
        { type: "caveat", text: "Dies sind projektspezifische historische Mittel über 35 Jahre, keine Vorhersagen oder standardmäßige 30-jährige Klimanormalperiode. Jede Region wird durch eine ausgewählte ERA5-Land-Zelle repräsentiert. Astronomisches Tageslicht bedeutet keine Sonnenscheindauer oder garantierte Gehzeit. Gitterwind löst exponierte Wege oder Böen nicht auf und bleibt aus der Bewertung ausgeschlossen. Aktuellen Zugang, Schnee, lokale Wettervorhersage und tatsächliches Höhenprofil vor einer Tour prüfen." },
        { type: "destinationLinks", heading: "Vor dem Datum die Region genauer ansehen", links: [
          { label: "Lofotodden", href: links.destination("de", "lofotodden"), detail: "Den langen Junitag mit dem nasseren September vergleichen." },
          { label: "Jotunheimen", href: links.destination("de", "jotunheimen"), detail: "Hohe Modelllage und kurze zulässige Saison prüfen." },
          { label: "Hardangervidda", href: links.destination("de", "hardangervidda"), detail: "Die Änderung des Schneesignals von Juni bis August ansehen." },
          { label: "Rondane", href: links.destination("de", "rondane"), detail: "Frühsommer, Juli und September gegenüberstellen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Die Definitionen hinter dem Klimavergleich nachlesen." },
          { label: "Wanderfinder", href: links.finder("de"), detail: "Monat, Region und Wunschtemperatur anwenden." },
        ] },
      ],
    },
  },
};
