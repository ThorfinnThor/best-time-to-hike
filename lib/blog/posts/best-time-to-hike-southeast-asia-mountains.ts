import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-29";

export const bestTimeToHikeSoutheastAsiaMountains: BlogPost = {
  slug: "best-time-to-hike-southeast-asia-mountains",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "rinjani",
  evidence: [
    evidence("southeast-asia-calendars", "Eligible calendars, best-month lists and representative elevations for Bromo Tengger, Rinjani, Kinabalu and Doi Inthanon.", [
      "public/data/hiking/destinations/id/bromo-tengger.json",
      "public/data/hiking/destinations/id/rinjani.json",
      "public/data/hiking/destinations/my/kinabalu.json",
      "public/data/hiking/destinations/th/doi-inthanon.json",
      "data-config/blog/batch-10-evidence.json",
    ], checkedAt),
    evidence("southeast-asia-rain-contrast", "Selected monthly temperature, wet-day frequency, precipitation and heat records for four Southeast Asian mountain cells.", [
      "public/data/hiking/destinations/id/bromo-tengger.json",
      "public/data/hiking/destinations/id/rinjani.json",
      "public/data/hiking/destinations/my/kinabalu.json",
      "public/data/hiking/destinations/th/doi-inthanon.json",
      "data-config/blog/batch-10-evidence.json",
    ], checkedAt),
    evidence("southeast-asia-method", "Historical aggregation, critical heat rule and representative-cell limits used to compare tropical mountain climates.", [
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-10-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Southeast Asia: four mountain climates",
      description: "Compare Bromo, Rinjani, Kinabalu and Doi Inthanon with 1991–2025 temperature, rain and heat data for better hiking timing.",
      heroAlt: "Clouds drifting across the crater landscape of Mount Rinjani",
      category: "seasonal",
      readingMinutes: 9,
      blocks: [
        { type: "timeline", caption: "The less-wet window moves between mainland and island mountains", points: [
          { label: "December–February", value: "Northern Thailand is comparatively dry", detail: "Doi Inthanon records 10.97–13.64% wet days in January and December, while Bromo and Rinjani exceed 92% in both months." },
          { label: "March–May", value: "The transition is not a universal shoulder season", detail: "Doi Inthanon crosses the critical heat rule in April; the Indonesian cells are still wet but begin drying during May." },
          { label: "June–September", value: "The Indonesian window opens", detail: "Bromo and Rinjani reach their best-month lists in July, August and September; Kinabalu remains much wetter." },
          { label: "October–November", value: "The balance turns north again", detail: "Rain rises quickly in Indonesia while Doi Inthanon improves to 27.24% wet days in November." },
        ], evidenceKey: "southeast-asia-rain-contrast" },
        { type: "metricCallout", label: "August, almost the same temperature", value: "8.85% to 97.24% wet days", detail: "Rinjani averages 20.6 °C and 8.85% wet days; Doi Inthanon averages 22.2 °C and 97.24%. Temperature alone cannot choose the region.", evidenceKey: "southeast-asia-rain-contrast" },
        { type: "paragraph", text: "A single answer to the best time to hike Southeast Asia hides the most useful part of the data. The four public 1991–2025 records in this comparison all represent mountain cells between 1,259.3 and 1,814.8 metres, and their mean hiking-window temperatures are surprisingly close. Yet their rainfall calendars point in different directions. Doi Inthanon in northern Thailand is historically least wet around December to February. Bromo Tengger and Rinjani in Indonesia improve most strongly from June into September. Kinabalu in Malaysian Borneo never develops an equally dry monthly signal: even its least-wet month, July, still records wet days on 70.14 percent of days. The useful decision is therefore not simply dry season versus wet season. It is which regional rain regime matches the month already available." },
        { type: "heading", level: 2, text: "August divides Indonesia from Thailand and Borneo" },
        { type: "comparisonTable", caption: "August climate at four selected mountain cells", columns: ["Region", "Temperature", "Wet days", "Monthly rain", "Score"], rows: [
          { label: "Mount Rinjani", values: ["20.6 °C", "8.85%", "10.8 mm", "95"] },
          { label: "Bromo Tengger", values: ["20.9 °C", "19.82%", "21.0 mm", "93"] },
          { label: "Mount Kinabalu", values: ["19.9 °C", "74.10%", "201.8 mm", "77"] },
          { label: "Doi Inthanon", values: ["22.2 °C", "97.24%", "334.8 mm", "73"] },
        ], evidenceKey: "southeast-asia-rain-contrast" },
        { type: "pullQuote", text: "In tropical mountains, a pleasant temperature can describe both the driest and the wettest choice on the same calendar page." },
        { type: "paragraph", text: "August makes the contrast measurable without relying on a vague monsoon label. Rinjani and Bromo average 20.6 and 20.9 °C, but their wet-day probabilities fall to 8.85 and 19.82 percent. Their monthly precipitation totals are 10.8 and 21.0 millimetres, and both appear in the July–September best-month group. Kinabalu is almost the same temperature at 19.9 °C, yet records 74.10 percent wet days and 201.8 millimetres. Doi Inthanon is only 2.3 degrees warmer than Kinabalu but reaches 97.24 percent wet days and 334.8 millimetres. All four remain recommendation-eligible in August because eligibility is a critical-component gate, not a promise of dry weather. The score and underlying metrics still need to be read together. An eligible month at Kinabalu is not the climatic equivalent of an eligible month at Rinjani." },
        { type: "heading", level: 2, text: "January reverses the Indonesian and Thai choice" },
        { type: "monthStrip", caption: "Four useful checkpoints for choosing a region", months: [
          { month: 1, label: "January", note: "Doi Inthanon 10.97% wet · Indonesia above 96%", href: links.destinationMonth("en", "doi-inthanon", 1) },
          { month: 4, label: "April", note: "Doi heat failure · all three island cells wet", href: links.destinationMonth("en", "doi-inthanon", 4) },
          { month: 8, label: "August", note: "Rinjani and Bromo least wet · Thailand very wet", href: links.destinationMonth("en", "rinjani", 8) },
          { month: 11, label: "November", note: "Doi improves · Indonesian rains return", href: links.destinationMonth("en", "doi-inthanon", 11) },
        ], evidenceKey: "southeast-asia-calendars" },
        { type: "paragraph", text: "In January, Doi Inthanon averages 19.9 °C, 10.97 percent wet days and 17.5 millimetres of monthly precipitation. The score reaches 93. During the same month, Bromo and Rinjani remain close to 20 °C but record 97.88 and 96.59 percent wet days, with 456.5 and 474.9 millimetres. Kinabalu sits between those extremes at 81.29 percent wet days and 242.4 millimetres. April is not a simple bridge between the two regional windows. Doi Inthanon rises to 26.3 °C, with a 66.86 percent modelled hot-day probability, and fails the project's critical heat rule. Bromo, Rinjani and Kinabalu remain eligible, but their wet-day probabilities still range from 71.05 to 85.62 percent. By November, the Thai cell improves to 21.0 °C and 27.24 percent wet days, while the Indonesian wet season is rebuilding. The practical calendar is directional rather than universal." },
        { type: "caveat", text: "These are 35-year historical averages for one selected ERA5-Land cell per destination, not forecasts or route-level conditions. They do not resolve summit wind, tropical downpours within a day, cloud, lightning, volcanic activity, trail erosion, landslides, park closures, permits, guide requirements or the elevation profile of a particular hike. Eligibility means the project's critical climate components pass; it does not mean the month is dry or risk-free. Check current weather, official access information and local safety advice before travelling." },
        { type: "destinationLinks", heading: "Open the four Southeast Asian records", links: [
          { label: "Mount Rinjani", href: links.destination("en", "rinjani"), detail: "See the strong July–September drying signal." },
          { label: "Bromo Tengger", href: links.destination("en", "bromo-tengger"), detail: "Compare the Indonesian wet and less-wet seasons." },
          { label: "Mount Kinabalu", href: links.destination("en", "kinabalu"), detail: "Inspect the persistently wet tropical mountain record." },
          { label: "Doi Inthanon", href: links.destination("en", "doi-inthanon"), detail: "Compare the dry northern winter with the wet summer." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read how eligibility and representative cells work." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Filter destinations by month and personal preferences." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit in Südostasien: vier Bergregionen",
      description: "Bromo, Rinjani, Kinabalu und Doi Inthanon mit Temperatur-, Regen- und Hitzedaten von 1991–2025 für die Reiseplanung vergleichen.",
      heroAlt: "Wolken über der Kraterlandschaft des Mount Rinjani",
      category: "seasonal",
      readingMinutes: 9,
      blocks: [
        { type: "timeline", caption: "Das weniger nasse Fenster wandert zwischen Festland und Inselbergen", points: [
          { label: "Dezember–Februar", value: "Nordthailand ist vergleichsweise trocken", detail: "Doi Inthanon verzeichnet im Januar und Dezember 10,97 bis 13,64% nasse Tage, während Bromo und Rinjani in beiden Monaten über 92% liegen." },
          { label: "März–Mai", value: "Der Übergang ist keine allgemeine Nebensaison", detail: "Doi Inthanon überschreitet im April die kritische Hitzeregel; die indonesischen Zellen sind noch nass, werden im Mai aber trockener." },
          { label: "Juni–September", value: "Das indonesische Fenster öffnet sich", detail: "Bromo und Rinjani führen Juli, August und September als beste Monate; Kinabalu bleibt deutlich nasser." },
          { label: "Oktober–November", value: "Die Balance dreht wieder nach Norden", detail: "In Indonesien steigt der Regen schnell, während Doi Inthanon im November auf 27,24% nasse Tage sinkt." },
        ], evidenceKey: "southeast-asia-rain-contrast" },
        { type: "metricCallout", label: "August, fast dieselbe Temperatur", value: "8,85% bis 97,24% nasse Tage", detail: "Rinjani erreicht 20,6 °C und 8,85% nasse Tage, Doi Inthanon 22,2 °C und 97,24%. Die Temperatur allein kann die Region nicht wählen.", evidenceKey: "southeast-asia-rain-contrast" },
        { type: "paragraph", text: "Eine einzige Antwort auf die beste Wanderzeit in Südostasien verbirgt den nützlichsten Teil der Daten. Die vier öffentlichen Datensätze von 1991 bis 2025 repräsentieren Bergzellen zwischen 1.259,3 und 1.814,8 Metern. Ihre mittleren Temperaturen im Wanderfenster liegen überraschend nah beieinander, doch ihre Regenkalender zeigen in verschiedene Richtungen. Doi Inthanon in Nordthailand ist historisch von Dezember bis Februar am wenigsten nass. Bromo Tengger und Rinjani in Indonesien verbessern sich am stärksten von Juni bis September. Kinabalu im malaysischen Borneo entwickelt kein vergleichbar trockenes Monatssignal. Selbst der am wenigsten nasse Monat Juli verzeichnet an 70,14 Prozent der Tage Niederschlag. Die hilfreiche Entscheidung lautet deshalb nicht bloß Trockenzeit oder Regenzeit, sondern welches regionale Regenmuster zum bereits verfügbaren Reisemonat passt." },
        { type: "heading", level: 2, text: "Der August trennt Indonesien von Thailand und Borneo" },
        { type: "comparisonTable", caption: "Augustklima an vier ausgewählten Bergzellen", columns: ["Region", "Temperatur", "Nasse Tage", "Monatsregen", "Score"], rows: [
          { label: "Mount Rinjani", values: ["20,6 °C", "8,85%", "10,8 mm", "95"] },
          { label: "Bromo Tengger", values: ["20,9 °C", "19,82%", "21,0 mm", "93"] },
          { label: "Mount Kinabalu", values: ["19,9 °C", "74,10%", "201,8 mm", "77"] },
          { label: "Doi Inthanon", values: ["22,2 °C", "97,24%", "334,8 mm", "73"] },
        ], evidenceKey: "southeast-asia-rain-contrast" },
        { type: "pullQuote", text: "In tropischen Bergen kann eine angenehme Temperatur auf derselben Kalenderseite die trockenste und die nasseste Wahl beschreiben." },
        { type: "paragraph", text: "Der August macht den Gegensatz messbar, ohne sich auf ein vages Monsunetikett zu verlassen. Rinjani und Bromo liegen im Mittel bei 20,6 und 20,9 °C, während ihre Wahrscheinlichkeit nasser Tage auf 8,85 und 19,82 Prozent fällt. Die Monatssummen betragen 10,8 und 21,0 Millimeter, beide gehören zur Gruppe der besten Monate von Juli bis September. Kinabalu ist mit 19,9 °C fast gleich warm, verzeichnet aber 74,10 Prozent nasse Tage und 201,8 Millimeter. Doi Inthanon ist nur 2,3 Grad wärmer als Kinabalu, erreicht jedoch 97,24 Prozent nasse Tage und 334,8 Millimeter. Alle vier bleiben im August empfehlungsfähig, weil die Zulässigkeit ein Tor für kritische Komponenten und kein Trockenheitsversprechen ist. Score und Einzelwerte müssen zusammen gelesen werden. Ein zulässiger Monat am Kinabalu ist klimatisch nicht dasselbe wie ein zulässiger Monat am Rinjani." },
        { type: "heading", level: 2, text: "Im Januar kehrt sich die Wahl zwischen Indonesien und Thailand um" },
        { type: "monthStrip", caption: "Vier sinnvolle Prüfpunkte für die Regionswahl", months: [
          { month: 1, label: "Januar", note: "Doi Inthanon 10,97% nass · Indonesien über 96%", href: links.destinationMonth("de", "doi-inthanon", 1) },
          { month: 4, label: "April", note: "Doi scheitert an Hitze · alle Inselzellen nass", href: links.destinationMonth("de", "doi-inthanon", 4) },
          { month: 8, label: "August", note: "Rinjani und Bromo am wenigsten nass · Thailand sehr nass", href: links.destinationMonth("de", "rinjani", 8) },
          { month: 11, label: "November", note: "Doi verbessert sich · Indonesiens Regen kehrt zurück", href: links.destinationMonth("de", "doi-inthanon", 11) },
        ], evidenceKey: "southeast-asia-calendars" },
        { type: "paragraph", text: "Im Januar erreicht Doi Inthanon im Mittel 19,9 °C, 10,97 Prozent nasse Tage und 17,5 Millimeter Monatsniederschlag. Der Score liegt bei 93. Im selben Monat bleiben Bromo und Rinjani nahe 20 °C, verzeichnen aber 97,88 und 96,59 Prozent nasse Tage sowie 456,5 und 474,9 Millimeter. Kinabalu liegt mit 81,29 Prozent nassen Tagen und 242,4 Millimetern zwischen diesen Extremen. Der April ist keine einfache Brücke zwischen den regionalen Fenstern. Doi Inthanon steigt auf 26,3 °C und 66,86 Prozent modellierte Wahrscheinlichkeit eines heißen Tages und scheitert an der kritischen Hitzeregel. Bromo, Rinjani und Kinabalu bleiben zulässig, doch ihre Wahrscheinlichkeit nasser Tage reicht weiterhin von 71,05 bis 85,62 Prozent. Im November verbessert sich die thailändische Zelle auf 21,0 °C und 27,24 Prozent nasse Tage, während sich in Indonesien die Regenzeit wieder aufbaut. Der praktische Kalender hat eine Richtung und ist nicht universell." },
        { type: "caveat", text: "Diese Werte sind 35-jährige historische Mittel für je eine ausgewählte ERA5-Land-Zelle und weder Vorhersagen noch Bedingungen auf einem bestimmten Weg. Sie lösen Gipfelwind, tropische Starkregen innerhalb eines Tages, Wolken, Blitzschlag, vulkanische Aktivität, Erosion, Erdrutsche, Parksperren, Genehmigungen, Führungspflichten oder das Höhenprofil einer konkreten Wanderung nicht auf. Zulässig bedeutet, dass die kritischen Klimakomponenten des Projekts passieren. Es bedeutet nicht, dass der Monat trocken oder risikofrei ist. Vor der Reise aktuelles Wetter, offizielle Zugangsinformationen und lokale Sicherheitshinweise prüfen." },
        { type: "destinationLinks", heading: "Die vier südostasiatischen Datensätze öffnen", links: [
          { label: "Mount Rinjani", href: links.destination("de", "rinjani"), detail: "Das starke Trocknungssignal von Juli bis September sehen." },
          { label: "Bromo Tengger", href: links.destination("de", "bromo-tengger"), detail: "Nasse und weniger nasse indonesische Monate vergleichen." },
          { label: "Mount Kinabalu", href: links.destination("de", "kinabalu"), detail: "Den durchgehend nassen tropischen Bergdatensatz prüfen." },
          { label: "Doi Inthanon", href: links.destination("de", "doi-inthanon"), detail: "Den trockenen nördlichen Winter mit dem nassen Sommer vergleichen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Zulässigkeit und repräsentative Zellen verstehen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Ziele nach Monat und persönlichen Vorlieben filtern." },
        ] },
      ],
    },
  },
};
