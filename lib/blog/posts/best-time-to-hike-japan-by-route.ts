import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-11";

export const bestTimeToHikeJapanByRoute: BlogPost = {
  slug: "best-time-to-hike-japan-by-route",
  status: "approved",
  publishedAt: "2026-10-12",
  modifiedAt: "2026-10-12",
  heroImageSlug: "kumano-kodo",
  evidence: [
    evidence("japan-route-calendar", "Eligibility calendars and representative-cell elevations for Kumano Kodo, Yakushima, Daisetsuzan, Kamikochi and Tateyama.", [
      "public/data/hiking/destinations/jp/kumano-kodo.json",
      "public/data/hiking/destinations/jp/yakushima.json",
      "public/data/hiking/destinations/jp/daisetsuzan.json",
      "public/data/hiking/destinations/jp/kamikochi.json",
      "public/data/hiking/destinations/jp/tateyama.json",
      "data-config/blog/batch-4-evidence.json",
    ], checkedAt),
    evidence("japan-season-transitions", "Selected winter, summer and autumn month records showing cold, snow and wet-day changes across the five route contexts.", [
      "public/data/hiking/destinations/jp/kumano-kodo.json",
      "public/data/hiking/destinations/jp/yakushima.json",
      "public/data/hiking/destinations/jp/daisetsuzan.json",
      "public/data/hiking/destinations/jp/kamikochi.json",
      "public/data/hiking/destinations/jp/tateyama.json",
      "data-config/blog/batch-4-evidence.json",
    ], checkedAt),
    evidence("japan-route-method", "The strict critical-component gate, historical aggregation period and excluded grid-cell wind used for interpretation.", [
      "data-config/scoring/weights.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-4-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Japan: why the route changes the season",
      description: "Japan has no single hiking season. Five route contexts show how elevation, historical snow frequency and summer rain reshape the best months.",
      heroAlt: "Stone steps through a cedar forest on the Kumano Kodo pilgrimage route",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "timeline", caption: "Five route contexts, two very different climate calendars", points: [
          { label: "January", value: "Two cells eligible, three withheld", detail: "Kumano Kodo and Yakushima remain above the gate; the three higher mountain cells do not." },
          { label: "April", value: "Lower routes at their strongest", detail: "Kumano Kodo scores 86 and Yakushima 84 while the mountain cells remain snow-limited." },
          { label: "June to October", value: "All five cells eligible", detail: "The shared window opens, but summer wet-day frequency remains high." },
          { label: "November", value: "The mountain window closes", detail: "Kamikochi and Tateyama fall below the snow threshold; lower cells remain eligible." },
        ], evidenceKey: "japan-route-calendar" },
        { type: "paragraph", text: "Searching for the best time to hike Japan assumes that one national calendar can answer the question. These five public records show why the route must come first. Kumano Kodo and Yakushima use selected representative cells at 412.5 and 520.2 metres. Both remain above the project's critical climate thresholds in all twelve months. Daisetsuzan, Kamikochi and Tateyama use cells between 1,361.9 and 1,858.9 metres and share a much narrower June to October eligible window. The contrast does not turn elevation into a universal law, and it does not describe every Japanese trail. It shows that these particular route contexts carry different historical temperature and snow signals. A useful planning question is therefore not simply “Which month is best for Japan?” but “Which route family am I considering, and what does its selected climate record permit me to investigate further?”" },
        { type: "heading", level: 2, text: "Winter separates the lower records from the mountain records" },
        { type: "comparisonTable", caption: "January at the five selected representative cells", columns: ["Route context", "Cell elevation", "Mean", "Snow days", "Result"], rows: [
          { label: "Kumano Kodo", values: ["412.5 m", "5.9 °C", "12.53%", "Eligible · 74"] },
          { label: "Yakushima", values: ["520.2 m", "9.8 °C", "0%", "Eligible · 75"] },
          { label: "Daisetsuzan", values: ["1,361.9 m", "-13.3 °C", "100%", "Withheld · 22"] },
          { label: "Kamikochi", values: ["1,858.9 m", "-7.5 °C", "100%", "Withheld · 24"] },
          { label: "Tateyama", values: ["1,832.3 m", "-7.5 °C", "100%", "Withheld · 21"] },
        ], evidenceKey: "japan-season-transitions" },
        { type: "paragraph", text: "January makes the split unmistakable. Kumano Kodo is cool, with a 5.9 °C hiking-window mean and modelled snow days on 12.53 percent of valid dates, but every critical component stays above the withholding floor. Yakushima is milder at 9.8 °C and records no modelled snow days in the selected cell, although 53.73 percent of dates are wet. The three mountain records tell another story. Their means fall to -7.5 °C at Kamikochi and Tateyama and -13.3 °C at Daisetsuzan, while snow-day probability reaches 100 percent. Their snow components fall to zero. The model therefore withholds a recommendation. That wording matters: it is not a trail-closure notice and cannot establish whether a particular low approach, road or facility is accessible. It only says that these historical cell records fail the project's climate gate." },
        { type: "metricCallout", label: "The shared mountain window", value: "June to October", detail: "All three higher representative cells pass the climate gate for five months, but passing the gate does not mean dry conditions.", evidenceKey: "japan-route-calendar" },
        { type: "heading", level: 2, text: "Eligible summer months can still be very wet" },
        { type: "paragraph", text: "When the mountain window opens in June, rain becomes the next reason to read beyond a green label. Daisetsuzan records wet days on 56.76 percent of valid June dates. Kamikochi reaches 62.86 percent, and Tateyama 68.38 percent. July is wetter still in two of the selected cells: 73.09 percent at Kamikochi and 81.75 percent at Tateyama. Those months remain eligible because precipitation is a scored comfort factor rather than one of the four critical gates. The result is useful precisely because it resists a false binary. A month can clear the cold, snow, heat-stress and daylight thresholds while still demanding serious rain planning. On the lower records, summer is not automatically the strongest period either. Kumano Kodo's July remains eligible but scores 61 as the mean reaches 26.1 °C and wet-day probability 67.19 percent. The route choice changes which compromise deserves attention." },
        { type: "monthStrip", caption: "The autumn transition is not simultaneous", months: [
          { month: 10, label: "Daisetsuzan · October", note: "Eligible · snow component 27", href: links.destinationMonth("en", "daisetsuzan", 10) },
          { month: 11, label: "Kamikochi · November", note: "Withheld · snow component 14", href: links.destination("en", "kamikochi") },
          { month: 11, label: "Tateyama · November", note: "Withheld · snow component 10", href: links.destination("en", "tateyama") },
          { month: 11, label: "Kumano Kodo · November", note: "Eligible · score 86", href: links.destinationMonth("en", "kumano-kodo", 11) },
        ], evidenceKey: "japan-season-transitions" },
        { type: "caveat", text: "Eligibility describes 1991–2025 historical climate at one selected ERA5-Land cell per destination. It is not an opening calendar, route report, forecast or safety assessment. The dataset does not resolve typhoons, current snowpack, transport, permits, huts or exposed-trail wind. Grid-cell wind has zero score weight." },
        { type: "paragraph", text: "October and November show why a country-wide answer breaks down. Daisetsuzan still clears the gate in October, although its 5.4 °C mean, 44.88 percent snow-day probability and snow component of 27 leave little margin. By November, Kamikochi and Tateyama have snow components of 14 and 10 and are withheld. Kumano Kodo, in contrast, reaches one of its two strongest scores in November: 86, with a 13.9 °C mean and 30.48 percent wet days. The right workflow is to select the route, inspect its monthly climate profile, and only then consult current official access and safety information. This article deliberately excludes Mount Fuji because its inclusion could make a historical climate gate look like access guidance. The model can narrow the calendar; local authorities and current conditions must finish the decision." },
        { type: "destinationLinks", heading: "Open the five route contexts", links: [
          { label: "Kumano Kodo", href: links.destination("en", "kumano-kodo"), detail: "See the broad eligible climate calendar." },
          { label: "Yakushima", href: links.destination("en", "yakushima"), detail: "Inspect the mild but often wet maritime record." },
          { label: "Daisetsuzan", href: links.destination("en", "daisetsuzan"), detail: "Follow the June to October mountain window." },
          { label: "Kamikochi", href: links.destination("en", "kamikochi"), detail: "Compare summer rain and the autumn snow transition." },
          { label: "Tateyama", href: links.destination("en", "tateyama"), detail: "Inspect the highest July wet-day share in this set." },
          { label: "Methodology", href: links.methodology("en"), detail: "Understand the critical climate gate." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Search by your own temperature and rain limits." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit in Japan: Die Route bestimmt die Saison",
      description: "Japan hat nicht nur eine Wandersaison. Fünf Routenkontexte zeigen, wie Höhe, historische Schneetage und Sommerregen die Monatswahl verändern.",
      heroAlt: "Steinstufen durch einen Zedernwald auf der Pilgerroute Kumano Kodo",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "timeline", caption: "Fünf Routenkontexte mit zwei sehr verschiedenen Klimakalendern", points: [
          { label: "Januar", value: "Zwei Zellen zulässig, drei zurückgehalten", detail: "Kumano Kodo und Yakushima bleiben über dem Tor, die drei höheren Bergzellen nicht." },
          { label: "April", value: "Stärkste Phase der tieferen Routen", detail: "Kumano Kodo erzielt 86 und Yakushima 84, während Schnee die Bergzellen begrenzt." },
          { label: "Juni bis Oktober", value: "Alle fünf Zellen zulässig", detail: "Das gemeinsame Fenster öffnet sich, doch nasse Sommertage bleiben häufig." },
          { label: "November", value: "Das Bergfenster schließt", detail: "Kamikochi und Tateyama fallen unter die Schneeschwelle, tiefere Zellen bleiben zulässig." },
        ], evidenceKey: "japan-route-calendar" },
        { type: "paragraph", text: "Die Suche nach der besten Wanderzeit für Japan setzt voraus, dass ein nationaler Kalender die Frage beantworten kann. Diese fünf öffentlichen Datensätze zeigen, warum zuerst die Route feststehen muss. Kumano Kodo und Yakushima verwenden ausgewählte repräsentative Zellen auf 412,5 und 520,2 Metern. Beide bleiben in allen zwölf Monaten über den kritischen Klimaschwellen des Projekts. Daisetsuzan, Kamikochi und Tateyama werden durch Zellen zwischen 1.361,9 und 1.858,9 Metern repräsentiert und teilen ein deutlich engeres zulässiges Fenster von Juni bis Oktober. Der Gegensatz macht Höhe nicht zu einem universellen Gesetz und beschreibt nicht jeden Weg Japans. Er zeigt, dass diese Routenkontexte verschiedene historische Temperatur- und Schneesignale besitzen. Die bessere Frage lautet daher: Welche Route plane ich, und welche Monate ihres Klimadatensatzes sollte ich anschließend genauer prüfen?" },
        { type: "heading", level: 2, text: "Im Winter trennen sich tiefere Datensätze und Bergdatensätze" },
        { type: "comparisonTable", caption: "Januar an den fünf ausgewählten repräsentativen Zellen", columns: ["Routenkontext", "Zellhöhe", "Mittel", "Schneetage", "Ergebnis"], rows: [
          { label: "Kumano Kodo", values: ["412,5 m", "5,9 °C", "12,53%", "Zulässig · 74"] },
          { label: "Yakushima", values: ["520,2 m", "9,8 °C", "0%", "Zulässig · 75"] },
          { label: "Daisetsuzan", values: ["1.361,9 m", "-13,3 °C", "100%", "Zurückgehalten · 22"] },
          { label: "Kamikochi", values: ["1.858,9 m", "-7,5 °C", "100%", "Zurückgehalten · 24"] },
          { label: "Tateyama", values: ["1.832,3 m", "-7,5 °C", "100%", "Zurückgehalten · 21"] },
        ], evidenceKey: "japan-season-transitions" },
        { type: "paragraph", text: "Im Januar ist die Trennung deutlich. Kumano Kodo bleibt mit 5,9 °C im Wanderfenster kühl und weist an 12,53 Prozent der gültigen Tage modellierte Schneetage auf. Trotzdem bleibt jede kritische Komponente über der Sperrschwelle. Yakushima ist mit 9,8 °C milder und besitzt an der ausgewählten Zelle keine modellierten Schneetage, allerdings sind 53,73 Prozent der Tage nass. Die drei Bergdatensätze sehen anders aus. Ihre Mittel fallen auf -7,5 °C in Kamikochi und Tateyama sowie -13,3 °C in Daisetsuzan. Gleichzeitig erreicht die Wahrscheinlichkeit von Schneetagen 100 Prozent. Die Schneekomponenten fallen auf null, weshalb das Modell keine Empfehlung abgibt. Das ist keine Wegsperrung. Der Datensatz kann weder einen tieferen Zustieg noch eine Straße oder Einrichtung als geöffnet oder geschlossen bestätigen." },
        { type: "metricCallout", label: "Das gemeinsame Bergfenster", value: "Juni bis Oktober", detail: "Alle drei höheren repräsentativen Zellen passieren das Klimator in fünf Monaten. Das bedeutet jedoch nicht, dass diese Monate trocken sind.", evidenceKey: "japan-route-calendar" },
        { type: "heading", level: 2, text: "Zulässige Sommermonate können trotzdem sehr nass sein" },
        { type: "paragraph", text: "Wenn sich das Bergfenster im Juni öffnet, wird Regen zum nächsten Grund, über eine grüne Markierung hinauszulesen. Daisetsuzan verzeichnet an 56,76 Prozent der gültigen Juni-Tage Nässe. Kamikochi erreicht 62,86 Prozent, Tateyama 68,38 Prozent. Im Juli liegen Kamikochi bei 73,09 und Tateyama sogar bei 81,75 Prozent. Die Monate bleiben zulässig, weil Niederschlag ein gewichteter Komfortfaktor und keine der vier kritischen Sperrkomponenten ist. Damit wird das Ergebnis genauer. Ein Monat kann die Schwellen für Temperatur, Schnee, Hitzestress und Tageslicht passieren und dennoch sorgfältige Regenplanung erfordern. Auch bei den tieferen Datensätzen ist Sommer nicht automatisch die stärkste Zeit. Kumano Kodos Juli bleibt zulässig, erzielt aber nur 61 Punkte bei 26,1 °C und 67,19 Prozent nassen Tagen. Die Route entscheidet, welcher Zielkonflikt Aufmerksamkeit braucht." },
        { type: "monthStrip", caption: "Der Herbstwechsel findet nicht überall gleichzeitig statt", months: [
          { month: 10, label: "Daisetsuzan · Oktober", note: "Zulässig · Schneekomponente 27", href: links.destinationMonth("de", "daisetsuzan", 10) },
          { month: 11, label: "Kamikochi · November", note: "Zurückgehalten · Schneekomponente 14", href: links.destination("de", "kamikochi") },
          { month: 11, label: "Tateyama · November", note: "Zurückgehalten · Schneekomponente 10", href: links.destination("de", "tateyama") },
          { month: 11, label: "Kumano Kodo · November", note: "Zulässig · Score 86", href: links.destinationMonth("de", "kumano-kodo", 11) },
        ], evidenceKey: "japan-season-transitions" },
        { type: "caveat", text: "Die Zulässigkeit beschreibt historische Klimawerte von 1991 bis 2025 an je einer ausgewählten ERA5-Land-Zelle. Sie ist weder Öffnungskalender noch Routenbericht, Vorhersage oder Sicherheitsbewertung. Taifune, aktuelle Schneelage, Verkehr, Genehmigungen, Hütten und exponierter Wind werden nicht aufgelöst. Gitterwind besitzt Gewicht null." },
        { type: "paragraph", text: "Oktober und November zeigen, warum eine landesweite Antwort scheitert. Daisetsuzan passiert das Tor noch im Oktober, obwohl das Mittel von 5,4 °C, eine Schneetag-Wahrscheinlichkeit von 44,88 Prozent und die Schneekomponente 27 nur wenig Abstand zur Grenze lassen. Im November sinken die Schneekomponenten von Kamikochi und Tateyama auf 14 und 10; beide werden zurückgehalten. Kumano Kodo erreicht dagegen im November mit 86 einen seiner beiden stärksten Scores, bei 13,9 °C und 30,48 Prozent nassen Tagen. Die richtige Reihenfolge lautet deshalb: Route wählen, Monatsprofil prüfen und danach aktuelle offizielle Zugangs- und Sicherheitsinformationen einholen. Der Artikel lässt den Fuji bewusst aus, weil seine Aufnahme ein historisches Klimator wie eine Zugangsempfehlung wirken lassen könnte. Das Modell grenzt Monate ein; örtliche Stellen und aktuelle Bedingungen schließen die Entscheidung ab." },
        { type: "destinationLinks", heading: "Die fünf Routenkontexte öffnen", links: [
          { label: "Kumano Kodo", href: links.destination("de", "kumano-kodo"), detail: "Den breiten zulässigen Klimakalender ansehen." },
          { label: "Yakushima", href: links.destination("de", "yakushima"), detail: "Den milden, aber häufig nassen Datensatz prüfen." },
          { label: "Daisetsuzan", href: links.destination("de", "daisetsuzan"), detail: "Das Bergfenster von Juni bis Oktober verfolgen." },
          { label: "Kamikochi", href: links.destination("de", "kamikochi"), detail: "Sommerregen und den herbstlichen Schneewechsel vergleichen." },
          { label: "Tateyama", href: links.destination("de", "tateyama"), detail: "Den höchsten Juli-Wert nasser Tage in dieser Auswahl prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Das kritische Klimator verstehen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Nach eigenen Temperatur- und Regengrenzen suchen." },
        ] },
      ],
    },
  },
};
