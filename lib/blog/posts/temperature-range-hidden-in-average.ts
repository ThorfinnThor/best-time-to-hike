import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-07";

export const temperatureRangeHiddenInAverage: BlogPost = {
  slug: "temperature-range-hidden-in-average",
  status: "approved",
  publishedAt: "2026-10-07",
  modifiedAt: checkedAt,
  heroImageSlug: "mount-shasta",
  evidence: [
    evidence("range-cases", "May Mount Shasta and October Zion temperature percentiles, wet-day share and model score.", [
      "public/data/hiking/destinations/us/mount-shasta.json",
      "public/data/hiking/destinations/us/zion.json",
    ], checkedAt),
    evidence("range-method", "The public aggregation window and hiking-window definitions used for the comparison.", [
      "data-config/methodology/climate-aggregation-v1.json",
      "lib/hiking/climate.ts",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Average hiking temperature vs daily temperature range",
      description: "Two strong hiking months show why a mean temperature is only the first line of a climate decision.",
      heroAlt: "Snowy volcanic slopes of Mount Shasta beneath a clear sky",
      category: "data-insight",
      readingMinutes: 6,
      blocks: [
        { type: "pullQuote", text: "A monthly mean tells you where the middle is. It does not tell you how wide the month feels." },
        { type: "paragraph", text: "A single temperature number is easy to compare. That is also its danger. The mean temperature in a hiking month compresses warm afternoons, cold mornings and everything between them into one value. For a traveller choosing layers, start times and a route, the spread matters as much as the centre. Mount Shasta in May and Zion in October are useful contrasts: both are recommended by the model, yet their historical temperature ranges are broad enough that the same mean can support very different packing decisions. The data does not replace a forecast; it shows what a normal historical envelope looked like at the selected representative cell." },
        { type: "comparisonTable", caption: "The centre and the range are different pieces of information", columns: ["Destination / month", "Mean", "P10–P90", "Range", "Wet days", "Score"], rows: [
          { label: "Mount Shasta · May", values: ["14.6 °C", "6.1–23.2 °C", "17.1 °C", "32.44%", "78"] },
          { label: "Zion · October", values: ["14.4 °C", "5.0–22.4 °C", "17.4 °C", "15.76%", "89"] },
        ], evidenceKey: "range-cases" },
        { type: "timeline", caption: "Read the distribution before the packing list", points: [
          { label: "P10", value: "Cooler sampled hours", detail: "A lower historical percentile, not a daily minimum." },
          { label: "Mean", value: "The centre", detail: "A compact summary of the sampled hiking window." },
          { label: "P90", value: "Warmer sampled hours", detail: "An upper historical percentile, not a daily maximum." },
        ], evidenceKey: "range-method" },
        { type: "metricCallout", label: "The practical signal", value: "About 17 °C from P10 to P90", detail: "Both months have a similar middle and a wide historical spread. A light afternoon forecast does not rule out a cold start, and a mild mean does not guarantee a mild exposed route.", evidenceKey: "range-cases" },
        { type: "heading", level: 2, text: "Why the model keeps the average and the spread separate" },
        { type: "paragraph", text: "The public destination data reports the mean used for the hiking-hour summary and percentile values that describe the historical distribution. The recommendation score is not a comfort guarantee and it is not built by simply adding the visible numbers. Critical gates still apply before ranking: a month that fails a critical component cannot be rescued by an attractive temperature mean. For these two examples, May at Mount Shasta and October at Zion remain eligible, but the range is a reason to plan with more detail than the score alone suggests. A hiker comparing them should ask whether the intended route is an exposed ridge, a shaded canyon, a high trailhead or a short low-elevation walk." },
        { type: "paragraph", text: "Percentiles are especially useful for deciding what to verify next. P10 is a lower historical reference, not a guaranteed minimum; P90 is an upper reference, not a forecast of the hottest day on your trip. The interval is deliberately descriptive. It helps explain why two destinations with nearly identical means can feel operationally different, while leaving current weather, wind exposure, shade, altitude effects and route conditions to local sources. It also avoids the false precision of telling a traveller that 14.6 °C is the temperature they will experience." },
        { type: "paragraph", text: "This is also why the order of a comparison matters. First decide whether the month is available under the site's critical gates. Then use the mean to understand the broad thermal setting. Only after that should the P10–P90 interval shape your equipment and timing questions. At Mount Shasta, a May plan may need a cold-start layer and a check on lingering high-elevation snow even when the afternoon looks comfortable. In Zion, October's range invites a similar check for cool mornings, but the lower wet-day share changes the rain question. Neither example supports a universal packing list; both support a better one." },
        { type: "paragraph", text: "A range is most informative when it is connected to a decision the traveller can actually make. Ask whether the trailhead is near the representative elevation, whether the route climbs substantially above it and whether the walking window is the same as the modelled window. If the answer is no, treat the public record as context rather than a direct description. This is a more honest use of historical climate data than turning a percentile into a promise, and it gives the current forecast a clear job: update the historical context for the exact dates and route." },
        { type: "caveat", text: "Values cover 1991–2025 at one selected representative ERA5-Land grid cell. P10 and P90 are percentiles of historical hourly temperatures sampled in the published 08:00–18:00 local hiking window, limited by daylight; they are not daily minima and maxima. They describe historical distributions, not a route-level forecast. Check the current forecast, official access notices and the route's elevation profile before departure. Wind is not used as trail-wind evidence in the score." },
        { type: "destinationLinks", heading: "Read the two months in context", links: [
          { label: "Mount Shasta", href: links.destination("en", "mount-shasta"), detail: "See May alongside the other eleven months." },
          { label: "Mount Shasta in May", href: links.destinationMonth("en", "mount-shasta", 5), detail: "Open the month-level metrics and eligibility state." },
          { label: "Zion", href: links.destination("en", "zion"), detail: "Compare October with the shoulder seasons." },
          { label: "Zion in October", href: links.destinationMonth("en", "zion", 10), detail: "Inspect the historical month record." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read the aggregation window and gate definitions." },
          { label: "Find a month", href: links.finder("en"), detail: "Filter destinations by the conditions you prefer." },
          { label: "Best destinations", href: links.rankingIndex("en"), detail: "Browse the published monthly rankings." },
        ] },
      ],
    },
    de: {
      title: "Mittlere Wandertemperatur oder tägliche Temperaturspanne",
      description: "Zwei gute Wandermonate zeigen, warum die mittlere Temperatur nur der erste Schritt einer Klimasentscheidung ist.",
      heroAlt: "Verschneite Hänge des Mount Shasta unter klarem Himmel",
      category: "data-insight",
      readingMinutes: 7,
      blocks: [
        { type: "pullQuote", text: "Ein Monatsmittel zeigt die Mitte. Es zeigt nicht, wie breit sich der Monat anfühlt." },
        { type: "paragraph", text: "Eine einzelne Temperaturzahl lässt sich leicht vergleichen. Genau darin liegt auch ihre Gefahr. Die mittlere Temperatur eines Wander­monats fasst warme Nachmittage, kalte Morgen und alles dazwischen in einem Wert zusammen. Für die Wahl von Kleidung, Startzeit und Route ist die Streuung ebenso wichtig wie die Mitte. Mount Shasta im Mai und Zion im Oktober bilden einen nützlichen Kontrast: Beide Monate sind im Modell empfehlbar, ihre historischen Temperaturbereiche sind aber breit genug, um sehr unterschiedliche Packentscheidungen zu verlangen. Die Daten ersetzen keine Vorhersage; sie zeigen, in welchem historischen Rahmen die ausgewählte repräsentative Zelle lag." },
        { type: "comparisonTable", caption: "Mitte und Spannweite beantworten verschiedene Fragen", columns: ["Ziel / Monat", "Mittel", "P10–P90", "Spanne", "Nasse Tage", "Score"], rows: [
          { label: "Mount Shasta · Mai", values: ["14,6 °C", "6,1–23,2 °C", "17,1 °C", "32,44%", "78"] },
          { label: "Zion · Oktober", values: ["14,4 °C", "5,0–22,4 °C", "17,4 °C", "15,76%", "89"] },
        ], evidenceKey: "range-cases" },
        { type: "timeline", caption: "Erst die Verteilung lesen, dann die Packliste", points: [
          { label: "P10", value: "Kühlere untersuchte Stunden", detail: "Ein unteres historisches Perzentil, kein tägliches Minimum." },
          { label: "Mittel", value: "Die Mitte", detail: "Eine kompakte Zusammenfassung des Wanderfensters." },
          { label: "P90", value: "Wärmere untersuchte Stunden", detail: "Ein oberes historisches Perzentil, kein tägliches Maximum." },
        ], evidenceKey: "range-method" },
        { type: "metricCallout", label: "Das praktische Signal", value: "Rund 17 °C von P10 bis P90", detail: "Beide Monate haben eine ähnliche Mitte und eine breite historische Streuung. Eine milde Nachmittagsprognose schließt einen kalten Start nicht aus.", evidenceKey: "range-cases" },
        { type: "heading", level: 2, text: "Warum Mittelwert und Spannweite getrennt bleiben" },
        { type: "paragraph", text: "Die öffentlichen Ziel­­daten enthalten das Mittel für die Zusammenfassung der Wanderstunden und Perzentile für die historische Verteilung. Der Empfehlungsscore ist keine Komfortgarantie und entsteht nicht durch simples Addieren sichtbarer Zahlen. Vor dem Ranking gelten weiterhin kritische Tore: Ein Monat, der eine kritische Komponente verfehlt, kann durch ein attraktives Temperaturmittel nicht gerettet werden. Für diese beiden Beispiele bleiben Mai am Mount Shasta und Oktober in Zion zulässig, doch die Spannweite verlangt mehr Planung als der Score allein. Wer vergleicht, sollte fragen, ob die Route exponiert, schattig, hoch gelegen oder nur kurz und niedrig verläuft." },
        { type: "paragraph", text: "Perzentile helfen vor allem bei der nächsten Prüfentscheidung. P10 ist ein historischer Unterwert, kein garantiertes Minimum; P90 ist ein Oberwert, keine Vorhersage des heißesten Tages. Das Intervall ist bewusst beschreibend. Es erklärt, warum zwei Ziele mit fast gleichem Mittelwert praktisch unterschiedlich wirken können, und überlässt aktuelle Wetterlage, Windexposition, Schatten, Höheneffekte und Wegezustand den lokalen Quellen. So entsteht keine falsche Präzision, nach der 14,6 °C exakt das Erlebnis auf der Tour wären." },
        { type: "paragraph", text: "Darum ist auch die Reihenfolge eines Vergleichs wichtig. Zuerst prüfen, ob der Monat die kritischen Tore der Website passiert. Dann das Mittel nutzen, um den thermischen Rahmen zu verstehen. Erst danach sollte die P10–P90-Spanne die Fragen zu Ausrüstung und Startzeit schärfen. Am Mount Shasta kann der Mai eine Schicht für den kalten Morgen und eine Prüfung von Restschnee in höheren Lagen verlangen, auch wenn der Nachmittag angenehm wirkt. In Zion verlangt die Oktoberspanne eine ähnliche Morgenprüfung, während der niedrigere Anteil nasser Tage die Regenfrage verändert. Keines der Beispiele begründet eine allgemeine Packliste; beide ermöglichen eine bessere." },
        { type: "paragraph", text: "Eine Spanne hilft dann am meisten, wenn sie mit einer echten Reiseentscheidung verbunden wird. Fragen, ob der Wegbeginn nahe an der repräsentativen Höhe liegt, ob die Route deutlich höher steigt und ob die Gehzeit dem modellierten Fenster entspricht. Wenn nicht, ist der Datensatz Kontext und keine direkte Beschreibung. So werden historische Klimadaten ehrlicher genutzt, als wenn ein Perzentil zum Versprechen wird. Die aktuelle Vorhersage bekommt dabei eine klare Aufgabe: den historischen Rahmen für konkrete Tage und den konkreten Weg aktualisieren." },
        { type: "paragraph", text: "Für die Packentscheidung ist deshalb nicht nur die Breite wichtig, sondern auch ihre Bedeutung. Die unteren und oberen Perzentile stammen aus allen gültigen historischen Stunden im untersuchten Zeitfenster. Sie sind keine täglichen Tiefst- und Höchsttemperaturen. Der vollständige Abstand musste an einem einzelnen Tag nie auftreten. Wer diese Grenze beachtet, kann die Spanne sinnvoll als Hinweis auf wechselnde Bedingungen nutzen, ohne daraus ein dramatisches Tagesprofil zu erfinden." },
        { type: "caveat", text: "Die Werte decken 1991–2025 an jeweils einer ausgewählten repräsentativen ERA5-Land-Gitterzelle ab. P10 und P90 sind Perzentile historischer Stundentemperaturen im veröffentlichten Wanderfenster von 08:00–18:00 Uhr Ortszeit, begrenzt durch das Tageslicht; sie sind keine täglichen Minima und Maxima. Sie beschreiben historische Verteilungen, keine Routenprognose. Vor der Abreise aktuelle Vorhersage, offizielle Hinweise und das Höhenprofil prüfen. Wind wird nicht als Windnachweis am Weg bewertet." },
        { type: "destinationLinks", heading: "Die beiden Monate im Zusammenhang lesen", links: [
          { label: "Mount Shasta", href: links.destination("de", "mount-shasta"), detail: "Den Mai mit den übrigen Monaten vergleichen." },
          { label: "Mount Shasta im Mai", href: links.destinationMonth("de", "mount-shasta", 5), detail: "Monatswerte und Zulässigkeit öffnen." },
          { label: "Zion", href: links.destination("de", "zion"), detail: "Oktober und Übergangsmonate vergleichen." },
          { label: "Zion im Oktober", href: links.destinationMonth("de", "zion", 10), detail: "Den historischen Monatsdatensatz ansehen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Aggregationsfenster und Grenzwerte nachlesen." },
          { label: "Monat finden", href: links.finder("de"), detail: "Ziele nach den eigenen Bedingungen filtern." },
          { label: "Beste Ziele", href: links.rankingIndex("de"), detail: "Die veröffentlichten Monatsrankings durchsuchen." },
        ] },
      ],
    },
  },
};
