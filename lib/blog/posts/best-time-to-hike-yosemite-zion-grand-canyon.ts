import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-19";

export const bestTimeToHikeYosemiteZionGrandCanyon: BlogPost = {
  slug: "best-time-to-hike-yosemite-zion-grand-canyon",
  status: "approved",
  publishedAt: "2026-10-19",
  modifiedAt: "2026-10-19",
  heroImageSlug: "yosemite",
  evidence: [
    evidence("us-parks-shared-window", "Eligible calendars, best-month lists and selected representative cells for Yosemite, Zion and Grand Canyon.", [
      "public/data/hiking/destinations/us/yosemite.json",
      "public/data/hiking/destinations/us/zion.json",
      "public/data/hiking/destinations/us/grand-canyon.json",
      "data-config/blog/batch-6-evidence.json",
    ], checkedAt),
    evidence("us-parks-heat-snow", "Selected summer heat, shoulder-season snow and September-to-October conditions in the three public records.", [
      "public/data/hiking/destinations/us/yosemite.json",
      "public/data/hiking/destinations/us/zion.json",
      "public/data/hiking/destinations/us/grand-canyon.json",
      "data-config/blog/batch-6-evidence.json",
    ], checkedAt),
    evidence("us-parks-method", "Historical aggregation, representative-cell scope and critical-component eligibility rules used in the comparison.", [
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-6-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Yosemite, Zion and Grand Canyon",
      description: "Compare Yosemite, Zion and Grand Canyon hiking weather by month, including summer heat, autumn rain and the limits of one climate cell per park.",
      heroAlt: "Hikers on the Half Dome trail in Yosemite National Park",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "comparisonTable", caption: "Three parks, three different historical climate windows", columns: ["Park", "Eligible months", "Highest-ranked months", "Representative elevation"], rows: [
          { label: "Yosemite", values: ["June–October", "July, August, September", "2,159.3 m"] },
          { label: "Zion", values: ["April–June, September–November", "May, September, October", "1,815.6 m"] },
          { label: "Grand Canyon", values: ["February–May, September–December", "April, May, October", "1,590.1 m"] },
        ], evidenceKey: "us-parks-shared-window" },
        { type: "paragraph", text: "The best time to hike Yosemite, Zion and Grand Canyon is not one universal month. These parks are often combined in an American Southwest or western parks itinerary, yet their public climate records point in different directions. Yosemite's selected ERA5-Land cell clears the project's critical thresholds from June through October. Zion loses July and August to the heat gate, while Grand Canyon loses June through August. The calendars overlap in only September and October. Even that result needs careful interpretation: each record describes one selected grid cell, not every trail, canyon depth, rim, road or campsite. The comparison is useful for deciding which questions to ask next. It is not permission to treat three enormous landscapes as if each had one temperature." },
        { type: "heading", level: 2, text: "September is the common option, but October is the cleaner compromise" },
        { type: "monthStrip", caption: "Open the two months shared by all three records", months: [
          { month: 9, label: "Yosemite · September", note: "18.6 °C · score 93 · 13.33% wet days", href: links.destinationMonth("en", "yosemite", 9) },
          { month: 9, label: "Zion · September", note: "21.6 °C · score 87 · 21.90% hot days", href: links.destinationMonth("en", "zion", 9) },
          { month: 9, label: "Grand Canyon · September", note: "25.5 °C · score 76 · 57.52% hot days", href: links.destinationMonth("en", "grand-canyon", 9) },
          { month: 10, label: "All three · October", note: "Eligible at every selected cell", href: links.destinationMonth("en", "grand-canyon", 10) },
        ], evidenceKey: "us-parks-heat-snow" },
        { type: "paragraph", text: "September keeps about 12.4 hours of mean daylight in all three records. Yosemite is already comfortable at a hiking-window mean of 18.6 °C, with 13.33 percent wet days and 21.8 mm of mean monthly precipitation. Zion reaches 21.6 °C and has a 21.90 percent hot-day probability. At the Grand Canyon cell, the mean is still 25.5 °C and the hot-day probability remains 57.52 percent. That makes September a common eligible month, not a common experience. October narrows the gap. The means fall to 12.6 °C in Yosemite, 14.4 °C in Zion and 18.2 °C at Grand Canyon. Wet-day probabilities remain between 13.64 and 15.76 percent. Grand Canyon records only a 6.91 percent hot-day probability, while Yosemite begins to show a 14.29 percent modelled snow-day probability. October therefore trades daylight and warmth for much less heat in the desert parks, while adding a colder tail in the Sierra Nevada." },
        { type: "metricCallout", label: "The only shared eligible window", value: "September and October", detail: "All three selected cells clear the project's critical climate thresholds in these two months. That is a historical climate result, not a route-opening or safety statement.", evidenceKey: "us-parks-shared-window" },
        { type: "heading", level: 2, text: "Why a summer road trip works for Yosemite but fails the desert heat test" },
        { type: "timeline", caption: "The seasonal hand-off between the parks", points: [
          { label: "April–May", value: "Zion and Grand Canyon lead", detail: "Both desert records are eligible; Yosemite is still held back by the selected cell's snow signal in May." },
          { label: "June", value: "Yosemite and Zion overlap", detail: "Yosemite enters its eligible window while Grand Canyon fails the heat threshold." },
          { label: "July–August", value: "Yosemite stands alone", detail: "Zion and Grand Canyon are capped as ineligible because their heat components cross the critical gate." },
          { label: "September–October", value: "All three overlap", detail: "September is warmer; October sharply reduces the desert heat signal." },
          { label: "November–December", value: "The desert records continue", detail: "Zion remains eligible in November and Grand Canyon through December, while Yosemite leaves its window." },
        ], evidenceKey: "us-parks-heat-snow" },
        { type: "paragraph", text: "The heat gate explains the most important difference. Zion's July mean is 27.5 °C and its hot-day probability is 81.84 percent; August still reaches 26.0 °C and 68.48 percent. Grand Canyon is more severe at this selected cell: June averages 28.8 °C with an 83.90 percent hot-day probability, July 30.8 °C with 95.30 percent, and August 29.2 °C with 89.68 percent. Each of those months is ineligible because the heat-stress component falls to a critical level. Yosemite remains eligible throughout the same period, but that does not make every Yosemite route snow-free, cool or accessible. The selected 2,159.3 m cell and the park's large elevation range cannot replace a trailhead-specific assessment. A multi-park itinerary should therefore move with the season rather than force the same month onto all three places." },
        { type: "caveat", text: "The 1991–2025 values are historical climate averages for one selected ERA5-Land cell per park. Grand Canyon is especially sensitive to vertical relief: a rim cell cannot describe the heat of a rim-to-river route. The records do not resolve current snowpack, wildfire smoke, flash-flood risk, water availability, trail closures, permits or exposed-route gusts. Always check current park and route information." },
        { type: "pullQuote", text: "Use the shared calendar to build an itinerary, then use the exact trail to decide whether to hike it." },
        { type: "destinationLinks", heading: "Inspect the park records before choosing a route", links: [
          { label: "Yosemite", href: links.destination("en", "yosemite"), detail: "See the June-to-October climate calendar." },
          { label: "Zion", href: links.destination("en", "zion"), detail: "Check the split spring and autumn window." },
          { label: "Grand Canyon", href: links.destination("en", "grand-canyon"), detail: "Compare the long shoulder-season record." },
          { label: "Grand Canyon in October", href: links.destinationMonth("en", "grand-canyon", 10), detail: "Open its highest-scoring autumn month." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read how cells and critical thresholds are used." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Search destinations with your own limits." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit für Yosemite, Zion und Grand Canyon",
      description: "Yosemite, Zion und Grand Canyon nach Monat vergleichen: Sommerhitze, Herbstregen und die Grenzen einer einzelnen Klimazelle pro Nationalpark.",
      heroAlt: "Wandernde auf dem Half-Dome-Weg im Yosemite-Nationalpark",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "comparisonTable", caption: "Drei Parks, drei unterschiedliche historische Klimafenster", columns: ["Park", "Zulässige Monate", "Höchste Monatsränge", "Repräsentative Höhe"], rows: [
          { label: "Yosemite", values: ["Juni–Oktober", "Juli, August, September", "2.159,3 m"] },
          { label: "Zion", values: ["April–Juni, September–November", "Mai, September, Oktober", "1.815,6 m"] },
          { label: "Grand Canyon", values: ["Februar–Mai, September–Dezember", "April, Mai, Oktober", "1.590,1 m"] },
        ], evidenceKey: "us-parks-shared-window" },
        { type: "paragraph", text: "Die beste Wanderzeit für Yosemite, Zion und Grand Canyon ist kein universeller Monat. Die Parks werden häufig zu einer Reise durch den amerikanischen Westen verbunden, doch ihre öffentlichen Klimadatensätze weisen in verschiedene Richtungen. Die ausgewählte ERA5-Land-Zelle für Yosemite passiert die kritischen Projektschwellen von Juni bis Oktober. Zion verliert Juli und August am Hitzetor, der Grand Canyon Juni bis August. Nur September und Oktober liegen in allen drei Kalendern. Auch dieses Ergebnis braucht Grenzen: Jeder Datensatz beschreibt eine ausgewählte Gitterzelle, nicht jeden Weg, jede Canyontiefe, jeden Rand, jede Straße oder jeden Campingplatz. Der Vergleich hilft zu entscheiden, welche Fragen als Nächstes gestellt werden müssen. Er erlaubt nicht, drei riesige Landschaften wie jeweils eine einzige Temperatur zu behandeln." },
        { type: "heading", level: 2, text: "September ist die gemeinsame Option, Oktober der klarere Kompromiss" },
        { type: "monthStrip", caption: "Die zwei gemeinsamen Monate aller drei Datensätze öffnen", months: [
          { month: 9, label: "Yosemite · September", note: "18,6 °C · Score 93 · 13,33% nasse Tage", href: links.destinationMonth("de", "yosemite", 9) },
          { month: 9, label: "Zion · September", note: "21,6 °C · Score 87 · 21,90% heiße Tage", href: links.destinationMonth("de", "zion", 9) },
          { month: 9, label: "Grand Canyon · September", note: "25,5 °C · Score 76 · 57,52% heiße Tage", href: links.destinationMonth("de", "grand-canyon", 9) },
          { month: 10, label: "Alle drei · Oktober", note: "An jeder ausgewählten Zelle zulässig", href: links.destinationMonth("de", "grand-canyon", 10) },
        ], evidenceKey: "us-parks-heat-snow" },
        { type: "paragraph", text: "Im September bleiben in allen drei Datensätzen im Mittel etwa 12,4 Stunden Tageslicht. Yosemite ist mit einem Mittel im Wanderfenster von 18,6 °C bereits angenehm, bei 13,33 Prozent nassen Tagen und 21,8 mm mittlerem Monatsniederschlag. Zion erreicht 21,6 °C und eine Wahrscheinlichkeit heißer Tage von 21,90 Prozent. An der Grand-Canyon-Zelle liegt das Mittel noch bei 25,5 °C und die Wahrscheinlichkeit heißer Tage bei 57,52 Prozent. September ist damit ein gemeinsamer zulässiger Monat, aber kein gemeinsames Erlebnis. Im Oktober werden die Unterschiede kleiner. Die Mittel sinken auf 12,6 °C in Yosemite, 14,4 °C in Zion und 18,2 °C am Grand Canyon. Die Wahrscheinlichkeit nasser Tage liegt zwischen 13,64 und 15,76 Prozent. Am Grand Canyon bleiben nur 6,91 Prozent heiße Tage, während Yosemite bereits 14,29 Prozent modellierte Schneetage zeigt. Der Oktober tauscht somit Tageslicht und Wärme gegen deutlich weniger Hitze in den Wüstenparks und fügt einen kälteren Rand in der Sierra Nevada hinzu." },
        { type: "metricCallout", label: "Das einzige gemeinsame Klimafenster", value: "September und Oktober", detail: "Alle drei ausgewählten Zellen passieren in diesen zwei Monaten die kritischen Projektschwellen. Das ist ein historisches Klimaergebnis, keine Aussage zu Öffnung oder Sicherheit einer Route.", evidenceKey: "us-parks-shared-window" },
        { type: "heading", level: 2, text: "Warum der Sommer für Yosemite passt, aber am Wüsten-Hitzetest scheitert" },
        { type: "timeline", caption: "Die saisonale Übergabe zwischen den Parks", points: [
          { label: "April–Mai", value: "Zion und Grand Canyon liegen vorn", detail: "Beide Wüstendatensätze sind zulässig. Yosemite wird im Mai noch vom Schneesignal der ausgewählten Zelle zurückgehalten." },
          { label: "Juni", value: "Yosemite und Zion überlappen", detail: "Yosemite beginnt sein zulässiges Fenster, während der Grand Canyon die Hitzeschwelle verfehlt." },
          { label: "Juli–August", value: "Yosemite steht allein", detail: "Zion und Grand Canyon werden durch kritische Hitzekomponenten als nicht zulässig gedeckelt." },
          { label: "September–Oktober", value: "Alle drei überlappen", detail: "September ist wärmer, Oktober reduziert das Hitzesignal der Wüste deutlich." },
          { label: "November–Dezember", value: "Die Wüstendatensätze laufen weiter", detail: "Zion bleibt im November zulässig, der Grand Canyon bis Dezember, während Yosemite sein Fenster verlässt." },
        ], evidenceKey: "us-parks-heat-snow" },
        { type: "paragraph", text: "Das Hitzetor erklärt den wichtigsten Unterschied. Zions Juli-Mittel liegt bei 27,5 °C und die Wahrscheinlichkeit heißer Tage bei 81,84 Prozent. Im August sind es noch 26,0 °C und 68,48 Prozent. Der Grand Canyon fällt an dieser ausgewählten Zelle strenger aus: Juni erreicht 28,8 °C bei 83,90 Prozent heißen Tagen, Juli 30,8 °C bei 95,30 Prozent und August 29,2 °C bei 89,68 Prozent. Jeder dieser Monate ist nicht zulässig, weil die Hitzestress-Komponente auf ein kritisches Niveau fällt. Yosemite bleibt während derselben Zeit zulässig. Das macht jedoch nicht jede Yosemite-Route schneefrei, kühl oder zugänglich. Die ausgewählte Zelle auf 2.159,3 Metern und die große Höhenspanne des Parks ersetzen keine Prüfung am konkreten Ausgangspunkt. Eine Reise mit mehreren Parks sollte sich daher mit der Saison bewegen, statt denselben Monat über alle drei Orte zu legen." },
        { type: "caveat", text: "Die Werte von 1991 bis 2025 sind historische Klimamittel einer ausgewählten ERA5-Land-Zelle je Park. Der Grand Canyon reagiert besonders empfindlich auf Höhenunterschiede: Eine Zelle am Rand kann die Hitze einer Route bis zum Fluss nicht beschreiben. Aktuelle Schneedecke, Waldbrandrauch, Sturzflutgefahr, Wasserverfügbarkeit, Wegsperren, Genehmigungen und Böen auf exponierten Routen werden nicht aufgelöst. Immer aktuelle Park- und Routeninformationen prüfen." },
        { type: "pullQuote", text: "Den gemeinsamen Kalender für die Reiseroute nutzen und anschließend den konkreten Weg über die Wanderung entscheiden lassen." },
        { type: "destinationLinks", heading: "Die Parkdatensätze vor der Routenwahl prüfen", links: [
          { label: "Yosemite", href: links.destination("de", "yosemite"), detail: "Den Klimakalender von Juni bis Oktober ansehen." },
          { label: "Zion", href: links.destination("de", "zion"), detail: "Das geteilte Frühlings- und Herbstfenster prüfen." },
          { label: "Grand Canyon", href: links.destination("de", "grand-canyon"), detail: "Den langen Übergangssaison-Datensatz vergleichen." },
          { label: "Grand Canyon im Oktober", href: links.destinationMonth("de", "grand-canyon", 10), detail: "Seinen stärksten Herbstmonat direkt öffnen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Nachlesen, wie Zellen und kritische Schwellen verwendet werden." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Ziele mit eigenen Grenzen durchsuchen." },
        ] },
      ],
    },
  },
};
