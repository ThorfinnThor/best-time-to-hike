import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-29";

export const bestTimeToHikeAustraliaRegions: BlogPost = {
  slug: "best-time-to-hike-australia-regions",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "larapinta",
  evidence: [
    evidence("australia-calendars", "Eligible calendars, best-month lists and representative elevations for five Australian hiking regions.", [
      "public/data/hiking/destinations/au/larapinta.json",
      "public/data/hiking/destinations/au/kosciuszko.json",
      "public/data/hiking/destinations/au/blue-mountains.json",
      "public/data/hiking/destinations/au/wilsons-promontory.json",
      "public/data/hiking/destinations/au/cradle-mountain.json",
      "data-config/blog/batch-10-evidence.json",
    ], checkedAt),
    evidence("australia-season-contrast", "Selected monthly temperature, precipitation, snow and heat records for central, alpine, coastal and Tasmanian representative cells.", [
      "public/data/hiking/destinations/au/larapinta.json",
      "public/data/hiking/destinations/au/kosciuszko.json",
      "public/data/hiking/destinations/au/blue-mountains.json",
      "public/data/hiking/destinations/au/wilsons-promontory.json",
      "public/data/hiking/destinations/au/cradle-mountain.json",
      "data-config/blog/batch-10-evidence.json",
    ], checkedAt),
    evidence("australia-method", "Historical aggregation, critical heat and snow rules, and representative-cell limits used for the regional comparison.", [
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-10-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Australia: five regions compared",
      description: "Compare Larapinta, Kosciuszko, Blue Mountains, Wilsons Promontory and Cradle Mountain using 1991–2025 climate data.",
      heroAlt: "Rocky ridges and desert vegetation along the Larapinta Trail",
      category: "seasonal",
      readingMinutes: 9,
      blocks: [
        { type: "comparisonTable", caption: "May is the only month when all five regions pass the model's critical rules", columns: ["Region", "Temperature", "Wet days", "Monthly rain", "Snow days", "Score"], rows: [
          { label: "Larapinta", values: ["19.6 °C", "5.90%", "17.8 mm", "0%", "90"] },
          { label: "Kosciuszko", values: ["6.6 °C", "31.98%", "69.3 mm", "16.96%", "72"] },
          { label: "Blue Mountains", values: ["13.0 °C", "25.71%", "56.4 mm", "0.09%", "89"] },
          { label: "Wilsons Promontory", values: ["13.7 °C", "43.50%", "86.3 mm", "0%", "83"] },
          { label: "Cradle Mountain", values: ["6.9 °C", "51.43%", "139.5 mm", "8.39%", "68"] },
        ], evidenceKey: "australia-season-contrast" },
        { type: "paragraph", text: "There is no useful national answer to the question of the best time to hike Australia. The five public records compared here stretch from the central desert to the Australian Alps, the sandstone plateau west of Sydney, the Victorian coast and Tasmania's Central Highlands. Their selected ERA5-Land cells range from 112.7 metres at Wilsons Promontory to 1,561.1 metres at Kosciuszko. When the 1991–2025 monthly records are intersected, May is the only month in which all five pass the project's critical heat, rain and snow rules. Even then, the table shows that a shared green light is not a shared experience. Larapinta is mild and dry; Kosciuszko and Cradle Mountain are cold, and the Tasmanian cell records more than twice the monthly precipitation of the Blue Mountains." },
        { type: "metricCallout", label: "One shared month", value: "May", detail: "It is the only common eligible month across all five records, but scores range from 68 at Cradle Mountain to 90 at Larapinta.", evidenceKey: "australia-calendars" },
        { type: "heading", level: 2, text: "Summer favours the south, not the Red Centre" },
        { type: "monthStrip", caption: "Four months that reveal the national split", months: [
          { month: 1, label: "January", note: "Coastal and alpine summer · Larapinta heat failure", href: links.destinationMonth("en", "wilsons-promontory", 1) },
          { month: 5, label: "May", note: "The only month all five records pass", href: links.destinationMonth("en", "larapinta", 5) },
          { month: 7, label: "July", note: "Larapinta dry · alpine snow · wet Tasmania", href: links.destinationMonth("en", "kosciuszko", 7) },
          { month: 9, label: "September", note: "Blue Mountains peak · desert heat returns", href: links.destinationMonth("en", "blue-mountains", 9) },
        ], evidenceKey: "australia-calendars" },
        { type: "paragraph", text: "January is the clearest example of why latitude and elevation matter more than the country name. Wilsons Promontory averages 17.8 °C with 23.69 percent wet days and scores 94. Kosciuszko averages 18.2 °C at its high representative cell and scores 87, while Cradle Mountain reaches 14.6 °C and scores 86. The Blue Mountains are warmer at 22.2 °C, but their wet-day probability rises to 54.84 percent and the score falls to 71. Larapinta is a different climate problem altogether: 33.2 °C on average, a 90th-percentile value of 39.2 °C and a 94.01 percent modelled probability of a hot day. That breaches the critical heat rule, so the recommendation is withheld and the score is capped at 49. A summer itinerary that works in Victoria, Tasmania or the Australian Alps should not simply be extended into Central Australia." },
        { type: "pullQuote", text: "Australia's hiking calendar is a relay: summer belongs to the south, winter to the centre, and May is the handover." },
        { type: "timeline", caption: "How the practical window moves through the year", points: [
          { label: "December–March", value: "Southern and alpine summer", detail: "Wilsons Promontory and Kosciuszko list January to March among their best months; Larapinta remains outside the heat gate." },
          { label: "April–May", value: "The calendars overlap", detail: "Larapinta becomes eligible in May while the alpine and Tasmanian cells are already cooling and gaining snow-day signals." },
          { label: "June–August", value: "Central Australia takes over", detail: "Larapinta stays eligible and very dry; Kosciuszko fails in all three months and Cradle Mountain becomes colder, wetter and snowier." },
          { label: "September–November", value: "Spring shifts the balance south again", detail: "Blue Mountains peak in September, Kosciuszko re-enters, and Larapinta crosses the heat threshold again." },
        ], evidenceKey: "australia-season-contrast" },
        { type: "heading", level: 2, text: "July separates desert comfort from alpine winter" },
        { type: "paragraph", text: "In July, Larapinta records 15.9 °C, only 3.96 percent wet days and 7.8 mm of monthly precipitation. Its score reaches 93. The Blue Mountains remain eligible at 9.5 °C, 21.75 percent wet days and a score of 86, offering a much cooler but still comparatively dry record. The southern edge behaves differently. Wilsons Promontory averages 11.1 °C with 52.26 percent wet days. Cradle Mountain falls to 4.4 °C, 59.17 percent wet days and a 28.20 percent snow-day signal. Kosciuszko averages just 2.2 °C, with an 84.06 percent snow-day signal; its critical snow component fails and the score falls to 43. These are climate averages for model cells, not a statement about a specific path being open. They do show why an Australian winter hiking search needs a region before it needs a packing list." },
        { type: "caveat", text: "The figures describe 35-year historical averages for one selected model cell per destination. They are not forecasts, route calendars or safety assessments. The cells do not resolve exposed ridges, local rain shadows, snow depth, river crossings, bushfire, smoke, flooding, track closures, permits or the elevation range of a particular walk. The published wind field is coarse grid wind rather than trail gust information. Check current weather, fire and park notices, access rules and the exact route before travelling." },
        { type: "destinationLinks", heading: "Compare the five Australian calendars", links: [
          { label: "Larapinta", href: links.destination("en", "larapinta"), detail: "See the narrow May–August desert window." },
          { label: "Kosciuszko", href: links.destination("en", "kosciuszko"), detail: "Compare summer hiking with the winter snow gate." },
          { label: "Blue Mountains", href: links.destination("en", "blue-mountains"), detail: "Inspect the broad year-round calendar and September peak." },
          { label: "Wilsons Promontory", href: links.destination("en", "wilsons-promontory"), detail: "Open the mild coastal record and wetter winter." },
          { label: "Cradle Mountain", href: links.destination("en", "cradle-mountain"), detail: "See the colder, wetter Tasmanian annual cycle." },
          { label: "Methodology", href: links.methodology("en"), detail: "Understand the critical gates and model cells." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Filter destinations by month and personal preferences." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit in Australien: fünf Regionen",
      description: "Larapinta, Kosciuszko, Blue Mountains, Wilsons Promontory und Cradle Mountain mit Klimadaten von 1991–2025 vergleichen.",
      heroAlt: "Felsige Bergkämme und Wüstenvegetation am Larapinta Trail",
      category: "seasonal",
      readingMinutes: 9,
      blocks: [
        { type: "comparisonTable", caption: "Der Mai ist der einzige Monat, in dem alle fünf Regionen die kritischen Regeln passieren", columns: ["Region", "Temperatur", "Nasse Tage", "Monatsregen", "Schneetage", "Score"], rows: [
          { label: "Larapinta", values: ["19,6 °C", "5,90%", "17,8 mm", "0%", "90"] },
          { label: "Kosciuszko", values: ["6,6 °C", "31,98%", "69,3 mm", "16,96%", "72"] },
          { label: "Blue Mountains", values: ["13,0 °C", "25,71%", "56,4 mm", "0,09%", "89"] },
          { label: "Wilsons Promontory", values: ["13,7 °C", "43,50%", "86,3 mm", "0%", "83"] },
          { label: "Cradle Mountain", values: ["6,9 °C", "51,43%", "139,5 mm", "8,39%", "68"] },
        ], evidenceKey: "australia-season-contrast" },
        { type: "paragraph", text: "Auf die Frage nach der besten Wanderzeit in Australien gibt es keine sinnvolle landesweite Antwort. Die fünf hier verglichenen öffentlichen Datensätze reichen von der zentralen Wüste über die australischen Alpen und das Sandsteinplateau westlich von Sydney bis zur Küste Victorias und zum tasmanischen Hochland. Ihre ausgewählten ERA5-Land-Zellen liegen zwischen 112,7 Metern in Wilsons Promontory und 1.561,1 Metern am Kosciuszko. Überschneidet man die Monatsdaten von 1991 bis 2025, bleibt der Mai als einziger Monat, in dem alle fünf die kritischen Hitze-, Regen- und Schneeregeln des Projekts passieren. Selbst dann zeigt die Tabelle kein einheitliches Erlebnis. Larapinta ist mild und trocken, Kosciuszko und Cradle Mountain sind kalt, und die tasmanische Zelle verzeichnet mehr als doppelt so viel Monatsniederschlag wie die Blue Mountains." },
        { type: "metricCallout", label: "Ein gemeinsamer Monat", value: "Mai", detail: "Er ist der einzige gemeinsame zulässige Monat aller fünf Datensätze, doch die Scores reichen von 68 am Cradle Mountain bis 90 in Larapinta.", evidenceKey: "australia-calendars" },
        { type: "heading", level: 2, text: "Der Sommer passt in den Süden, nicht ins Rote Zentrum" },
        { type: "monthStrip", caption: "Vier Monate, die die landesweite Teilung sichtbar machen", months: [
          { month: 1, label: "Januar", note: "Küsten- und Alpensommer · Larapinta scheitert an Hitze", href: links.destinationMonth("de", "wilsons-promontory", 1) },
          { month: 5, label: "Mai", note: "Einziger Monat, den alle fünf passieren", href: links.destinationMonth("de", "larapinta", 5) },
          { month: 7, label: "Juli", note: "Larapinta trocken · Alpenschnee · nasses Tasmanien", href: links.destinationMonth("de", "kosciuszko", 7) },
          { month: 9, label: "September", note: "Blue Mountains stark · Wüstenhitze kehrt zurück", href: links.destinationMonth("de", "blue-mountains", 9) },
        ], evidenceKey: "australia-calendars" },
        { type: "paragraph", text: "Der Januar zeigt am deutlichsten, warum Breitenlage und Höhe wichtiger sind als der Ländername. Wilsons Promontory erreicht im Mittel 17,8 °C, 23,69 Prozent nasse Tage und Score 94. Kosciuszko liegt an seiner hohen repräsentativen Zelle bei 18,2 °C und Score 87, Cradle Mountain bei 14,6 °C und Score 86. Die Blue Mountains sind mit 22,2 °C wärmer, doch ihre Wahrscheinlichkeit nasser Tage steigt auf 54,84 Prozent und der Score sinkt auf 71. Larapinta stellt ein anderes Klimaproblem dar: 33,2 °C im Mittel, 39,2 °C am 90. Perzentil und 94,01 Prozent modellierte Wahrscheinlichkeit eines heißen Tages. Das verletzt die kritische Hitzeregel, deshalb wird die Empfehlung zurückgehalten und der Score auf 49 begrenzt. Eine Sommerroute durch Victoria, Tasmanien oder die australischen Alpen sollte nicht einfach nach Zentralaustralien verlängert werden." },
        { type: "pullQuote", text: "Australiens Wanderkalender ist ein Staffellauf: Der Sommer gehört dem Süden, der Winter dem Zentrum und der Mai ist die Übergabe." },
        { type: "timeline", caption: "Wie sich das praktische Fenster im Jahreslauf verschiebt", points: [
          { label: "Dezember–März", value: "Sommer im Süden und in den Alpen", detail: "Wilsons Promontory und Kosciuszko führen Januar bis März unter ihren besten Monaten; Larapinta bleibt außerhalb des Hitzetors." },
          { label: "April–Mai", value: "Die Kalender überschneiden sich", detail: "Larapinta wird im Mai zulässig, während die alpinen und tasmanischen Zellen bereits abkühlen und Schneetagesignale gewinnen." },
          { label: "Juni–August", value: "Zentralaustralien übernimmt", detail: "Larapinta bleibt zulässig und sehr trocken; Kosciuszko scheitert in allen drei Monaten, Cradle Mountain wird kälter, nasser und schneereicher." },
          { label: "September–November", value: "Im Frühling wandert die Balance zurück nach Süden", detail: "Die Blue Mountains erreichen im September ihren Höhepunkt, Kosciuszko kehrt zurück und Larapinta überschreitet erneut die Hitzegrenze." },
        ], evidenceKey: "australia-season-contrast" },
        { type: "heading", level: 2, text: "Der Juli trennt Wüstenkomfort vom alpinen Winter" },
        { type: "paragraph", text: "Im Juli verzeichnet Larapinta 15,9 °C, nur 3,96 Prozent nasse Tage und 7,8 Millimeter Monatsniederschlag. Der Score erreicht 93. Die Blue Mountains bleiben mit 9,5 °C, 21,75 Prozent nassen Tagen und Score 86 zulässig. Das ist deutlich kühler, aber noch vergleichsweise trocken. Am südlichen Rand verändert sich das Muster. Wilsons Promontory liegt bei 11,1 °C und 52,26 Prozent nassen Tagen. Cradle Mountain fällt auf 4,4 °C, 59,17 Prozent nasse Tage und ein Schneetagesignal von 28,20 Prozent. Kosciuszko erreicht nur 2,2 °C und 84,06 Prozent Schneetage. Seine kritische Schneekomponente scheitert und der Score fällt auf 43. Diese Werte sind Klimamittel für Modellzellen und keine Aussage, dass ein bestimmter Weg geöffnet ist. Sie zeigen aber, warum eine Suche nach Winterwandern in Australien zuerst eine Region und erst danach eine Packliste braucht." },
        { type: "caveat", text: "Die Werte beschreiben 35-jährige historische Mittel für je eine ausgewählte Modellzelle. Sie sind weder Vorhersagen noch Routenkalender oder Sicherheitsbewertungen. Die Zellen lösen exponierte Kämme, lokale Regenschatten, Schneehöhe, Flussquerungen, Buschfeuer, Rauch, Überflutung, Wegsperren, Genehmigungen oder das Höhenprofil einer bestimmten Tour nicht auf. Das veröffentlichte Windfeld ist grober Gitterwind statt Information zu Böen auf dem Weg. Vor der Reise aktuelle Wetter-, Feuer- und Parkmeldungen, Zugangsregeln und die genaue Route prüfen." },
        { type: "destinationLinks", heading: "Die fünf australischen Kalender vergleichen", links: [
          { label: "Larapinta", href: links.destination("de", "larapinta"), detail: "Das schmale Wüstenfenster von Mai bis August sehen." },
          { label: "Kosciuszko", href: links.destination("de", "kosciuszko"), detail: "Sommerwandern mit dem winterlichen Schneetor vergleichen." },
          { label: "Blue Mountains", href: links.destination("de", "blue-mountains"), detail: "Den breiten Jahreskalender und den September-Höhepunkt prüfen." },
          { label: "Wilsons Promontory", href: links.destination("de", "wilsons-promontory"), detail: "Den milden Küstendatensatz und den nasseren Winter öffnen." },
          { label: "Cradle Mountain", href: links.destination("de", "cradle-mountain"), detail: "Den kälteren und nasseren tasmanischen Jahreslauf sehen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Kritische Tore und Modellzellen verstehen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Ziele nach Monat und persönlichen Vorlieben filtern." },
        ] },
      ],
    },
  },
};
