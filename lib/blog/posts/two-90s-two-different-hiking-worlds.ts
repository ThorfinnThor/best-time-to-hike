import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-08";

export const two90sTwoDifferentHikingWorlds: BlogPost = {
  slug: "two-90s-two-different-hiking-worlds",
  status: "approved",
  publishedAt: "2026-10-08",
  modifiedAt: checkedAt,
  heroImageSlug: "lofotodden",
  evidence: [
    evidence("equal-score-contrast", "Larapinta August and Lofotodden July share an eligible score of 90 while their physical climate metrics diverge.", [
      "public/data/hiking/destinations/au/larapinta.json",
      "public/data/hiking/destinations/no/lofotodden.json",
      "data-config/blog/batch-3-evidence.json",
    ], checkedAt),
    evidence("equal-score-method", "Algorithm weights, critical eligibility components, historical aggregation period and excluded grid wind.", [
      "data-config/scoring/weights.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-3-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Larapinta vs Lofotodden: hiking weather compared",
      description: "Larapinta and Lofotodden both score 90, yet temperature, rain, humidity and daylight describe very different July and August hiking climates.",
      heroAlt: "Green mountain slopes and dark rock beneath a blue July sky in Lofotodden National Park",
      category: "data-insight",
      readingMinutes: 6,
      blocks: [
        { type: "pullQuote", text: "A shared score is a starting point, not a shared climate." },
        { type: "comparisonTable", caption: "Two eligible months with the same overall score", columns: ["Record", "Mean", "Wet days", "Daylight", "Humidity"], rows: [
          { label: "Larapinta · August", values: ["19.2 °C", "2.40%", "11.3 h", "28.0%"] },
          { label: "Lofotodden · July", values: ["11.7 °C", "35.39%", "22.7 h", "81.7%"] },
        ], evidenceKey: "equal-score-contrast" },
        { type: "paragraph", text: "Both records clear the published recommendation gate and both receive an overall score of 90. On a ranking page they therefore appear to offer the same strength of answer. Yet the number compresses several questions into one line: how warm the sampled walking hours were, how often a full day crossed the rain threshold, whether snow or heat became limiting, and how much daylight was available. It is a useful sorting device, but not a physical unit and not a promise that two days will feel alike. Larapinta and Lofotodden make that limitation unusually visible because their shared score survives alongside large differences in almost every raw metric a walker would notice. Reading the pair is less about choosing a winner than learning what must happen after a score catches your attention. Open the month, inspect the variables, and decide which trade-off belongs in your trip rather than assuming that two 90s describe the same experience." },
        { type: "heading", level: 2, text: "The same number can contain a different day" },
        { type: "metricCallout", label: "Equal score, different profile", value: "7.5 °C apart", detail: "The hiking-window means differ by 7.5 °C even before rain, humidity and daylight are considered.", evidenceKey: "equal-score-contrast" },
        { type: "paragraph", text: "Larapinta's August cell is warmer and much drier: a 19.2 °C hiking-window mean, wet days on 2.40 percent of valid dates and 3.6 mm of mean monthly precipitation. Its central temperature spread runs from 11.3 to 27.0 °C, so the mean does not erase the possibility of cool starts or warm afternoons. Lofotodden's July cell is cooler and markedly wetter: 11.7 °C, 35.39 percent wet days and 53.1 mm, with a much tighter 9.3 to 14.7 °C central spread. The wet-day difference is 32.99 percentage points and the rainfall-total difference is 49.5 mm. Those are related but distinct clues: frequency says how often the threshold was crossed, while the total says how much accumulated across the month. The contrast is not an error in the score. The weighted components can arrive at the same rounded result through different combinations. That is precisely why the ranking number should trigger a closer reading rather than replace one." },
        { type: "monthStrip", caption: "Open each month before deciding what 90 means for you", months: [
          { month: 8, label: "August · Larapinta", note: "19.2 °C · 2.40% wet days", href: links.destinationMonth("en", "larapinta", 8) },
          { month: 7, label: "July · Lofotodden", note: "11.7 °C · 35.39% wet days", href: links.destinationMonth("en", "lofotodden", 7) },
        ], evidenceKey: "equal-score-contrast" },
        { type: "heading", level: 2, text: "Choose the climate profile, not just the rank" },
        { type: "paragraph", text: "A traveller trying to minimise historical rain frequency would naturally investigate Larapinta first. A traveller building a long photographic day around northern summer light might be drawn to Lofotodden's 22.7-hour mean daylight, more than eleven hours beyond Larapinta's 11.3. Relative humidity adds another distinction: 28.0 percent at the Larapinta cell and 81.7 percent at Lofotodden. That figure describes the sampled air, not personal comfort, dehydration risk or how quickly a path dries. Even so, it tells the reader that the same score sits inside a dry continental profile on one side and a cool maritime profile on the other. Clothing, water, start time and tolerance for damp conditions would therefore enter the two planning conversations differently. None of those choices can be settled by the historical model alone. The data narrows the question to a meaningful trade-off; current forecasts, official access information and the actual route must complete the decision." },
        { type: "caveat", text: "These are 1991–2025 historical aggregates at one selected ERA5-Land representative cell per destination, not forecasts or route-specific conditions. Scores are configured comparison outputs. Grid-cell wind has zero weight and is not validated exposed-trail or gust evidence." },
        { type: "paragraph", text: "The useful question is therefore not which 90 is better in the abstract. Ask instead what the trip cannot compromise on. If low historical rain frequency matters most, inspect Larapinta's annual profile and then check the August forecast and local guidance. If cool air and exceptional summer light are part of the appeal, open Lofotodden and decide whether its wetter record fits your equipment and plans. In either case, keep the score in its proper role: it compares eligible historical climate records under one configured method. It does not know the chosen trail, exposure, surface, transport, fitness or forecast. Wind is especially important not to infer from the number because grid-cell wind contributes zero to the score and is not validated for exposed ridges or gusts. Once those boundaries are clear, the two 90s become more useful, not less. They turn one apparently simple ranking into two specific, answerable planning questions." },
        { type: "destinationLinks", heading: "Compare both records", links: [
          { label: "Larapinta Trail", href: links.destination("en", "larapinta"), detail: "Read the full annual profile." },
          { label: "Larapinta in August", href: links.destinationMonth("en", "larapinta", 8), detail: "Inspect the warmer, drier month." },
          { label: "Lofotodden National Park", href: links.destination("en", "lofotodden"), detail: "Read the full annual profile." },
          { label: "Lofotodden in July", href: links.destinationMonth("en", "lofotodden", 7), detail: "Inspect the cooler, wetter month." },
          { label: "Methodology", href: links.methodology("en"), detail: "See how scores and gates work." },
          { label: "Find a month", href: links.finder("en"), detail: "Compare other climate profiles." },
        ] },
      ],
    },
    de: {
      title: "Larapinta vs. Lofotodden: Wanderwetter im Vergleich",
      description: "Larapinta und Lofotodden erreichen beide 90 Punkte, doch Temperatur, Regen, Feuchte und Tageslicht ergeben sehr verschiedene Wanderprofile.",
      heroAlt: "Grüne Berghänge und dunkler Fels unter blauem Julihimmel im Nationalpark Lofotodden",
      category: "data-insight",
      readingMinutes: 6,
      blocks: [
        { type: "pullQuote", text: "Ein gemeinsamer Score ist ein Ausgangspunkt, kein gemeinsames Klima." },
        { type: "comparisonTable", caption: "Zwei zulässige Monate mit demselben Score", columns: ["Datensatz", "Mittel", "Nasse Tage", "Tageslicht", "Feuchte"], rows: [
          { label: "Larapinta · August", values: ["19,2 °C", "2,40%", "11,3 h", "28,0%"] },
          { label: "Lofotodden · Juli", values: ["11,7 °C", "35,39%", "22,7 h", "81,7%"] },
        ], evidenceKey: "equal-score-contrast" },
        { type: "paragraph", text: "Auf der Rangliste stehen beide Monate mit 90 Punkten beinahe wie Zwillinge nebeneinander. Klimatisch sind sie das nicht. Der Score verdichtet Temperatur, Niederschlag, Schnee, Hitzestress und Tageslicht zu einer einzigen Vergleichszahl. Damit lässt sich eine große Auswahl ordnen, aber weder ein konkreter Wandertag beschreiben noch eine persönliche Vorliebe festlegen. Larapinta und Lofotodden zeigen diese Grenze besonders deutlich: Beide Datensätze passieren das Empfehlungstor, obwohl die Luft, die Regenhäufigkeit und die verfügbare Helligkeit weit auseinanderliegen. Der Wert 90 beantwortet somit nur die Frage, wie das konfigurierte Modell die beiden zulässigen Monate zusammenfasst. Danach beginnt die eigentliche Reiseplanung. Wer die Zahl öffnet, erkennt zwei vollkommen verschiedene Angebote. Wer sie allein stehen lässt, übersieht genau die Unterschiede, die über Kleidung, Wasser, Tagesrhythmus und das gewünschte Wandergefühl entscheiden können." },
        { type: "heading", level: 2, text: "In derselben Zahl kann ein anderer Wandertag stecken" },
        { type: "metricCallout", label: "Gleicher Score, anderes Profil", value: "7,5 °C Abstand", detail: "Die Mittelwerte des Wanderfensters unterscheiden sich um 7,5 °C, bevor Regen, Feuchte und Tageslicht hinzukommen.", evidenceKey: "equal-score-contrast" },
        { type: "paragraph", text: "Für Larapinta ergibt der August ein Mittel von 19,2 °C im Wanderfenster. Die mittleren 80 Prozent der Temperaturwerte liegen zwischen 11,3 und 27,0 °C. Nur 2,40 Prozent der gültigen Tage überschreiten die Nass-Tag-Schwelle; im Monatsmittel sammeln sich 3,6 mm Niederschlag. Lofotoddens Juli bleibt mit 11,7 °C deutlich kühler und bewegt sich enger zwischen 9,3 und 14,7 °C. Gleichzeitig sind 35,39 Prozent der Tage nass, bei 53,1 mm Monatsniederschlag. Zwischen beiden Datensätzen liegen damit 32,99 Prozentpunkte Regenhäufigkeit und 49,5 mm Niederschlag. Häufigkeit und Menge dürfen nicht verwechselt werden: Die erste Kennzahl zählt Tage oberhalb der Schwelle, die zweite summiert Wasser. Dass der gerundete Gesamtscore trotzdem gleich ist, ist kein Widerspruch. Verschiedene Komponenten können sich innerhalb der Gewichtung ausgleichen. Für Leserinnen und Leser ist das ein Signal, die Zahl als Wegweiser zu den Einzelwerten zu verwenden." },
        { type: "monthStrip", caption: "Beide Monate öffnen, bevor man den Wert 90 einordnet", months: [
          { month: 8, label: "August · Larapinta", note: "19,2 °C · 2,40% nasse Tage", href: links.destinationMonth("de", "larapinta", 8) },
          { month: 7, label: "Juli · Lofotodden", note: "11,7 °C · 35,39% nasse Tage", href: links.destinationMonth("de", "lofotodden", 7) },
        ], evidenceKey: "equal-score-contrast" },
        { type: "heading", level: 2, text: "Das Klimaprofil wählen, nicht nur den Rang" },
        { type: "paragraph", text: "Die trockenere Historie spricht für Larapinta, falls geringe Regenhäufigkeit die wichtigste Bedingung ist. Lofotodden bietet dafür mit 22,7 Stunden mittlerem Tageslicht ein außergewöhnlich langes Sommerfenster; Larapinta kommt im August auf 11,3 Stunden. Auch die relative Feuchte trennt die Profile: 28,0 Prozent an der australischen Modellzelle stehen 81,7 Prozent an der norwegischen gegenüber. Daraus lässt sich kein persönliches Wohlbefinden berechnen. Die Kennzahl beschreibt die modellierte Luft während der untersuchten Wanderstunden und sagt weder etwas Sicheres über das Trocknen eines Weges noch über den Flüssigkeitsbedarf aus. Zusammen mit Temperatur und Regen macht sie jedoch verständlich, warum Ausrüstung und Tagesplanung anders aussehen können. In Larapinta rücken Wasser, Sonne und wechselnde Temperaturen in den Vordergrund. In Lofotodden verdienen Nässe, Sicht und aktuelle lokale Bedingungen mehr Aufmerksamkeit. Das sind Prüfaufträge, keine Vorhersagen für eine bestimmte Route." },
        { type: "caveat", text: "Dies sind historische Aggregate von 1991–2025 an je einer ausgewählten repräsentativen ERA5-Land-Zelle, keine Vorhersagen und keine routenspezifischen Bedingungen. Scores sind konfigurierte Vergleichsausgaben. Gitterwind hat Gewicht null und ist nicht als Evidenz für exponierte Wege oder Böen validiert." },
        { type: "paragraph", text: "Statt nach dem besseren 90er zu suchen, sollte man die unverzichtbare Eigenschaft der Reise benennen. Soll die historische Regenhäufigkeit möglichst niedrig sein, führt der erste Blick nach Larapinta. Gehören kühle Luft und lange nordische Helligkeit zum gewünschten Erlebnis, ist Lofotodden die interessantere Spur. Danach folgen aktuelle Vorhersage, offizielle Zugangsmeldungen und die konkrete Route. Der Score kennt weder Wegoberfläche noch Exposition, Verkehr, Fitness oder persönliche Toleranz. Aus dem Windwert darf ebenfalls keine Aussage über Grate oder Böen abgeleitet werden, denn Gitterwind hat im Score Gewicht null und ist dafür nicht validiert. Mit diesen Grenzen verliert die Rangzahl nicht ihren Nutzen. Sie wird präziser eingesetzt: als kompakter Einstieg in überprüfbare Klimawerte und als Einladung, aus zwei scheinbar gleichen Zahlen zwei unterschiedliche, vernünftige Planungen zu machen." },
        { type: "destinationLinks", heading: "Beide Datensätze vergleichen", links: [
          { label: "Larapinta Trail", href: links.destination("de", "larapinta"), detail: "Das vollständige Jahresprofil lesen." },
          { label: "Larapinta im August", href: links.destinationMonth("de", "larapinta", 8), detail: "Den wärmeren, trockeneren Monat prüfen." },
          { label: "Nationalpark Lofotodden", href: links.destination("de", "lofotodden"), detail: "Das vollständige Jahresprofil lesen." },
          { label: "Lofotodden im Juli", href: links.destinationMonth("de", "lofotodden", 7), detail: "Den kühleren, nasseren Monat prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Scores und Tore nachlesen." },
          { label: "Monat finden", href: links.finder("de"), detail: "Weitere Klimaprofile vergleichen." },
        ] },
      ],
    },
  },
};
