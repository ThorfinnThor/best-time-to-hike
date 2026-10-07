import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-07";

export const warmestDriestOrStrongestMonth: BlogPost = {
  slug: "warmest-driest-or-strongest-month",
  status: "approved",
  publishedAt: "2026-10-07",
  modifiedAt: checkedAt,
  heroImageSlug: "blue-mountains",
  evidence: [
    evidence("blue-mountains-months", "Blue Mountains monthly records used to compare warmth, dryness, score and daylight.", [
      "public/data/hiking/destinations/au/blue-mountains.json",
    ], checkedAt),
    evidence("blue-mountains-method", "The public score, daylight-limited hiking window and excluded wind component.", [
      "data-config/methodology/climate-aggregation-v1.json",
      "lib/hiking/climate.ts",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "The warmest, driest or strongest month?",
      description: "Blue Mountains data shows why the best hiking month depends on the question you ask first.",
      heroAlt: "Layered sandstone cliffs and eucalyptus forest in the Blue Mountains",
      category: "seasonal",
      readingMinutes: 7,
      blocks: [
        { type: "paragraph", text: "Ask for the best month in the Blue Mountains and four reasonable answers appear. January is warmest, July has the lowest wet-day frequency, September receives the strongest configured score and December offers the longest mean daylight. The answer changes because the question changes. That is not indecision in the data; it is the planning choice that a single winner would hide." },
        { type: "monthStrip", caption: "Pick the month by the experience you want", months: [
          { month: 1, label: "January", note: "Warmest: 22.2 °C", href: links.destinationMonth("en", "blue-mountains", 1) },
          { month: 7, label: "July", note: "Driest: 21.75% wet days", href: links.destinationMonth("en", "blue-mountains", 7) },
          { month: 9, label: "September", note: "Highest score: 91", href: links.destinationMonth("en", "blue-mountains", 9) },
          { month: 12, label: "December", note: "Longest daylight: 14.3 h", href: links.destinationMonth("en", "blue-mountains", 12) },
        ], evidenceKey: "blue-mountains-months" },
        { type: "paragraph", text: "There is no contradiction in these four answers. They measure different priorities inside one destination that remains eligible in all twelve months. January is the warmest, July is the driest, September produces the highest configured hiking score and December offers the longest daylight. A generic article that names one universal best month would hide the choice the traveller actually needs to make. The useful question is not “What is the best month?” but “Best for what?”" },
        { type: "timeline", caption: "A simple decision path for Blue Mountains", points: [
          { label: "If warmth comes first", value: "January · 22.2 °C", detail: "Choose the warmest historical hiking-hour mean and check heat tolerance." },
          { label: "If dryness comes first", value: "July · 21.75% wet days", detail: "Accept a cooler mean in exchange for the driest record." },
          { label: "If the model balance comes first", value: "September · score 91", detail: "Use the configured result, then inspect the component metrics." },
          { label: "If daylight comes first", value: "December · 14.3 h", detail: "Pair a long day with current heat, rain and route checks." },
        ], evidenceKey: "blue-mountains-months" },
        { type: "heading", level: 2, text: "What the score can and cannot decide" },
        { type: "metricCallout", label: "All twelve months", value: "Eligible in the public model", detail: "Blue Mountains is a useful example because the decision is about trade-offs, not a critical hold. The score is a configured comparison aid, not a promise about a specific trail day.", evidenceKey: "blue-mountains-method" },
        { type: "paragraph", text: "The model evaluates published climate components within a fixed historical method. It does not add wind 100 to a pile of other scores: grid wind is excluded from the public recommendation calculation because it is not validated as exposed-trail or gust evidence. Nor does the model know your route length, shade, fitness, transport or tolerance for humidity. September's 91 is therefore a strong starting point for a balanced climate comparison, not a reason to skip the rest of the page. Read the mean, wet-day share, daylight and any caveats together, then check the current forecast and official trail notices." },
        { type: "paragraph", text: "The Blue Mountains make a good planning example because the trade-off is visible without a critical failure. A family looking for warm evenings may prefer January even though its wet-day share is higher. Someone who dislikes damp tracks may accept July's cooler mornings. A photographer who wants longer walking light may start with December. A traveller who wants the model's most balanced month can start with September, then compare the actual route and forecast. None of these priorities is more scientifically correct than the others; they simply answer different travel questions." },
        { type: "paragraph", text: "This way of reading a destination also prevents a common search mistake: treating the first ranked month as a universal instruction. Ranking is a compact way to organise eligible historical records. It is not a personal itinerary, and it cannot know whether you would rather carry a rain shell, start before sunrise or walk in cooler air. Use the score to narrow the field, use the components to understand the trade-off and use local information to make the final call." },
        { type: "comparisonTable", caption: "Four valid ways to read the same destination", columns: ["Question", "Month", "Mean", "Wet days", "Score"], rows: [
          { label: "Warmest", values: ["January", "22.2 °C", "54.84%", "71"] },
          { label: "Driest", values: ["July", "9.5 °C", "21.75%", "86"] },
          { label: "Highest score", values: ["September", "14.6 °C", "28.00%", "91"] },
          { label: "Longest daylight", values: ["December", "21.1 °C", "47.47%", "77"] },
        ], evidenceKey: "blue-mountains-months" },
        { type: "caveat", text: "Blue Mountains values are 1991–2025 historical aggregates at one selected representative ERA5-Land cell, using the daylight-limited 08:00–18:00 local hiking window. The four labels above are different selection rules, not competing truths. Scores are reproducible model outputs and are not forecasts or route-safety ratings. Wind is excluded from the score." },
        { type: "destinationLinks", heading: "Choose your version of a good month", links: [
          { label: "Blue Mountains", href: links.destination("en", "blue-mountains"), detail: "Open the complete twelve-month profile." },
          { label: "January", href: links.destinationMonth("en", "blue-mountains", 1), detail: "Warmest historical hiking-hour mean." },
          { label: "July", href: links.destinationMonth("en", "blue-mountains", 7), detail: "Lowest wet-day share." },
          { label: "September", href: links.destinationMonth("en", "blue-mountains", 9), detail: "Highest configured score." },
          { label: "December", href: links.destinationMonth("en", "blue-mountains", 12), detail: "Longest daylight record." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read how scores and gates are defined." },
          { label: "Find a month", href: links.finder("en"), detail: "Compare the same priorities across destinations." },
        ] },
      ],
    },
    de: {
      title: "Der wärmste, trockenste oder stärkste Monat?",
      description: "Die Daten der Blue Mountains zeigen, warum die passende Wanderzeit von der zuerst gestellten Frage abhängt.",
      heroAlt: "Geschichtete Sandsteinfelsen und Eukalyptuswald in den Blue Mountains",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "Wer nach dem besten Monat in den Blue Mountains fragt, erhält vier nachvollziehbare Antworten. Der Januar ist am wärmsten, der Juli hat die niedrigste Häufigkeit nasser Tage, der September erreicht den stärksten konfigurierten Score und der Dezember das längste mittlere Tageslicht. Die Antwort ändert sich, weil sich die Frage ändert. Das ist keine Unentschlossenheit der Daten, sondern die Planungsentscheidung, die ein einziger Sieger verbergen würde." },
        { type: "monthStrip", caption: "Den Monat nach dem gewünschten Erlebnis wählen", months: [
          { month: 1, label: "Januar", note: "Wärmster: 22,2 °C", href: links.destinationMonth("de", "blue-mountains", 1) },
          { month: 7, label: "Juli", note: "Trockenster: 21,75% nasse Tage", href: links.destinationMonth("de", "blue-mountains", 7) },
          { month: 9, label: "September", note: "Höchster Score: 91", href: links.destinationMonth("de", "blue-mountains", 9) },
          { month: 12, label: "Dezember", note: "Längstes Tageslicht: 14,3 h", href: links.destinationMonth("de", "blue-mountains", 12) },
        ], evidenceKey: "blue-mountains-months" },
        { type: "paragraph", text: "Diese vier Antworten widersprechen sich nicht. Sie messen verschiedene Prioritäten an einem Ziel, das in allen zwölf Monaten im Modell zulässig bleibt. Der Januar ist am wärmsten, der Juli am trockensten, der September erreicht den höchsten konfigurierten Wanderscore und der Dezember bietet das längste Tageslicht. Ein allgemeiner Text mit nur einem angeblich besten Monat würde die eigentliche Entscheidung verstecken. Die nützlichere Frage lautet nicht „Welcher Monat ist der beste?“, sondern „Der beste wofür?“." },
        { type: "timeline", caption: "Ein einfacher Entscheidungsweg für die Blue Mountains", points: [
          { label: "Wenn Wärme zuerst kommt", value: "Januar · 22,2 °C", detail: "Das wärmste historische Wanderstundenmittel wählen und Hitzetoleranz prüfen." },
          { label: "Wenn Trockenheit zuerst kommt", value: "Juli · 21,75% nasse Tage", detail: "Ein kühleres Mittel für den trockensten Datensatz akzeptieren." },
          { label: "Wenn die Modellbalance zuerst kommt", value: "September · Score 91", detail: "Das konfigurierte Ergebnis nutzen und die Einzelwerte lesen." },
          { label: "Wenn Tageslicht zuerst kommt", value: "Dezember · 14,3 h", detail: "Den langen Tag mit aktueller Vorhersage und Wegprüfung verbinden." },
        ], evidenceKey: "blue-mountains-months" },
        { type: "heading", level: 2, text: "Was der Score entscheiden kann – und was nicht" },
        { type: "metricCallout", label: "Alle zwölf Monate", value: "Im öffentlichen Modell zulässig", detail: "Die Blue Mountains zeigen Abwägungen statt einer kritischen Sperre. Der Score ist ein Vergleichswerkzeug, kein Versprechen für einen bestimmten Wegtag.", evidenceKey: "blue-mountains-method" },
        { type: "paragraph", text: "Das Modell bewertet veröffentlichte Klimakomponenten nach einer festen historischen Methode. Es addiert nicht einfach Wind 100 zu anderen Werten: Gitterwind ist aus der öffentlichen Empfehlung ausgeschlossen, weil er nicht als Evidenz für exponierte Wege oder Böen validiert ist. Ebenso kennt das Modell weder Routenlänge, Schatten, Fitness, Anreise noch persönliche Feuchtetoleranz. Der Wert 91 für September ist deshalb ein guter Ausgangspunkt für einen ausgewogenen Klimavergleich, aber kein Grund, den Rest der Seite zu überspringen. Mittel, Anteil nasser Tage, Tageslicht und Hinweise gemeinsam lesen, dann aktuelle Vorhersage und offizielle Wegmeldungen prüfen." },
        { type: "paragraph", text: "Die Blue Mountains sind ein gutes Planungsbeispiel, weil die Abwägung ohne kritischen Fehler sichtbar wird. Eine Familie, die warme Abende sucht, kann trotz des höheren Anteils nasser Tage den Januar wählen. Wer feuchte Wege vermeiden möchte, akzeptiert vielleicht die kühleren Morgen im Juli. Wer lange Gehzeiten bei Tageslicht plant, beginnt mit Dezember. Wer die ausgewogenste Modellantwort sucht, kann September öffnen und danach Route und Vorhersage prüfen. Keine Priorität ist wissenschaftlich richtiger; sie beantwortet nur eine andere Reisefrage." },
        { type: "paragraph", text: "Diese Lesart verhindert auch einen typischen Suchfehler: den ersten Rang als allgemeine Anweisung zu behandeln. Ein Ranking ordnet zulässige historische Datensätze kompakt. Es ist kein persönlicher Reiseplan und kennt weder den Wunsch nach einer Regenjacke noch den Start vor Sonnenaufgang oder das Bedürfnis nach kühler Luft. Den Score nutzen, um das Feld zu verkleinern, die Komponenten für die Abwägung lesen und lokale Informationen für die letzte Entscheidung heranziehen." },
        { type: "paragraph", text: "Auch der Begriff trockenster Monat braucht seinen Kontext. Der Juli hat mit 21,75 Prozent die niedrigste historische Häufigkeit nasser Tage, ist aber mit 9,5 °C im Wanderfenster deutlich kühler als Januar oder Dezember. Der Wert beschreibt außerdem die Häufigkeit von Tagen oberhalb der Ein-Millimeter-Schwelle und nicht die genaue Uhrzeit des Regens. Wer Wärme und längeres Tageslicht höher gewichtet, kann deshalb trotz höherer Regenhäufigkeit bewusst einen anderen Monat wählen." },
        { type: "comparisonTable", caption: "Vier gültige Lesarten desselben Ziels", columns: ["Frage", "Monat", "Mittel", "Nasse Tage", "Score"], rows: [
          { label: "Wärmster", values: ["Januar", "22,2 °C", "54,84%", "71"] },
          { label: "Trockenster", values: ["Juli", "9,5 °C", "21,75%", "86"] },
          { label: "Höchster Score", values: ["September", "14,6 °C", "28,00%", "91"] },
          { label: "Längstes Tageslicht", values: ["Dezember", "21,1 °C", "47,47%", "77"] },
        ], evidenceKey: "blue-mountains-months" },
        { type: "caveat", text: "Die Blue-Mountains-Werte sind historische Aggregate von 1991–2025 an einer ausgewählten repräsentativen ERA5-Land-Zelle im tageslichtbegrenzten Wanderfenster 08:00–18:00 Uhr Ortszeit. Die vier Bezeichnungen sind verschiedene Auswahlregeln, keine konkurrierenden Wahrheiten. Scores sind reproduzierbare Modellausgaben, keine Vorhersagen oder Sicherheitsbewertungen einer Route. Wind ist aus dem Score ausgeschlossen." },
        { type: "destinationLinks", heading: "Die eigene Definition eines guten Monats wählen", links: [
          { label: "Blue Mountains", href: links.destination("de", "blue-mountains"), detail: "Das vollständige Zwölfmonatsprofil öffnen." },
          { label: "Januar", href: links.destinationMonth("de", "blue-mountains", 1), detail: "Wärmstes historisches Wanderstundenmittel." },
          { label: "Juli", href: links.destinationMonth("de", "blue-mountains", 7), detail: "Niedrigster Anteil nasser Tage." },
          { label: "September", href: links.destinationMonth("de", "blue-mountains", 9), detail: "Höchster konfigurierter Score." },
          { label: "Dezember", href: links.destinationMonth("de", "blue-mountains", 12), detail: "Längstes Tageslicht." },
          { label: "Methodik", href: links.methodology("de"), detail: "Definitionen von Score und Toren nachlesen." },
          { label: "Monat finden", href: links.finder("de"), detail: "Dieselben Prioritäten an anderen Zielen vergleichen." },
        ] },
      ],
    },
  },
};
