import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

export const dryDoesNotMeanHikeable: BlogPost = {
  slug: "dry-does-not-mean-hikeable",
  status: "approved",
  publishedAt: "2026-09-30",
  modifiedAt: "2026-09-30",
  heroImageSlug: "wadi-rum",
  evidence: [
    evidence("dry-heat-contradiction", "July heat and precipitation metrics for Wadi Rum, Arches and Mallorca.", [
      "public/data/hiking/destinations/jo/wadi-rum.json",
      "public/data/hiking/destinations/us/arches.json",
      "public/data/hiking/destinations/es/mallorca.json",
    ]),
    evidence("wadi-rum-shoulders", "March, July and November conditions for the selected Wadi Rum representative cell.", [
      "public/data/hiking/destinations/jo/wadi-rum.json",
    ]),
  ],
  translations: {
    en: {
      title: "Dry hiking weather: why low rain can still mean high heat",
      description: "Three very dry July climates show why rainfall alone can point hikers toward the wrong month, and why heat probability belongs in the decision.",
      heroAlt: "Sandstone landscape in Wadi Rum, one of the dry destinations examined in the article",
      category: "data-insight",
      readingMinutes: 7,
      blocks: [
        { type: "paragraph", text: "A forecast with no rain symbol looks inviting. A climate table with almost no wet days looks even more convincing, because it seems to describe an entire month rather than one afternoon. Yet dryness answers only one planning question: how often measurable precipitation occurred historically at the selected model point. It does not tell us whether the hours in which people usually hike were comfortable, whether very hot days dominated the month, or whether a route has shade and water. Wadi Rum, Arches and Mallorca make that gap unusually clear. Their July records are dry, but the same records also contain a strong heat signal that changes the hiking decision." },
        { type: "pullQuote", text: "A dry month can remove one problem while intensifying another." },
        { type: "heading", level: 2, text: "The July contradiction" },
        { type: "paragraph", text: "At Wadi Rum, the historical wet-day share for July is 0.0 percent. That figure is not a typo. At the selected representative ERA5-Land cell, the mean temperature during sampled hiking hours is 30.1 °C, while the historical probability of a hot day is 99.72 percent. Arches is similarly difficult: 8.39 percent wet days, a 30.8 °C hiking-hour mean and a 97.42 percent hot-day probability. Mallorca is less extreme, but its 5.81 percent wet-day share sits beside a 27.7 °C mean and a 79.91 percent hot-day probability. The current recommendation gate withholds all three July months. Low rain is therefore true, but incomplete." },
        { type: "comparisonTable", caption: "The same month viewed through rain and heat", columns: ["Destination", "Wet days", "Hiking-hour mean", "Hot-day probability", "Recommendation"], rows: [
          { label: "Wadi Rum, July", values: ["0.0%", "30.1 °C", "99.72%", "Withheld"] },
          { label: "Arches, July", values: ["8.39%", "30.8 °C", "97.42%", "Withheld"] },
          { label: "Mallorca, July", values: ["5.81%", "27.7 °C", "79.91%", "Withheld"] },
        ], evidenceKey: "dry-heat-contradiction" },
        { type: "paragraph", text: "The table is not saying that nobody can walk in these places in July. It says something narrower and more useful: the historical climate at one representative cell fails the site's recommendation rules, so BestTimeToHike does not present the month as a generally suitable choice. An early, short and shaded outing may differ from an exposed full-day route. Fitness, acclimatisation, water availability and local restrictions also matter. Those details are outside the climate model, which is precisely why a low precipitation number should not be turned into a blanket endorsement." },
        { type: "metricCallout", label: "Wadi Rum in July", value: "0.0% wet days, 99.72% hot-day probability", detail: "Two historically derived probabilities describe different risks. The first is attractive; the second is the reason the month is withheld.", evidenceKey: "dry-heat-contradiction" },
        { type: "heading", level: 2, text: "What the heat gate is protecting against" },
        { type: "paragraph", text: "BestTimeToHike separates the hiking-hour temperature mean from hot-day probability. The mean summarises the sampled daytime window; hot-day probability counts how often the daily heat condition crosses the method's threshold. Averages can conceal frequency. A month may have a tolerable-looking mean while still containing many days that exceed the heat limit, and a desert night does not make the midday hiking window cool. The gate is deliberately conservative: when a critical component crosses its exclusion rule, the month cannot become a recommendation merely because precipitation, snow or daylight look favourable. This prevents a strong result in one component from cancelling a serious weakness in another." },
        { type: "monthStrip", caption: "Wadi Rum: the shoulder-month contrast", months: [
          { month: 3, label: "March", note: "17.4 °C, 5.05% wet days", href: links.destinationMonth("en", "wadi-rum", 3) },
          { month: 7, label: "July", note: "30.1 °C, withheld", href: links.destinationMonth("en", "wadi-rum", 7) },
          { month: 11, label: "November", note: "18.3 °C, 2.22% wet days", href: links.destinationMonth("en", "wadi-rum", 11) },
        ], evidenceKey: "wadi-rum-shoulders" },
        { type: "paragraph", text: "Wadi Rum also demonstrates a better way to use the data: compare months inside one destination before comparing destinations. March has a 17.4 °C hiking-hour mean and 5.05 percent wet days; November has 18.3 °C and 2.22 percent. Both remain dry by most travellers' standards, yet their temperature context is very different from July. This does not make March or November guaranteed trip dates. It makes them more coherent starting points for checking current forecasts, daylight, local guidance and the exact route. The useful decision is not dry versus wet, but dry enough and thermally plausible for the activity being planned." },
        { type: "heading", level: 2, text: "A practical three-question reading order" },
        { type: "paragraph", text: "Start with the critical gates: is the month excluded for heat, snow, rainfall or another published limit? Next, read the physical metrics instead of only the overall score. For a hot, dry destination, hiking-hour temperature and hot-day probability deserve attention before rainfall. Finally, move from climate to trip reality. Check a current mountain or desert forecast, official access information, water and shade on the chosen route, and the timing needed to avoid the hottest hours. This order preserves what historical data does well, seasonal comparison, without asking it to decide conditions on a particular trail or date. It also explains why BestTimeToHike can label a month low-rain while refusing to recommend it." },
        { type: "caveat", text: "These figures describe 1991–2025 historical conditions at one selected representative ERA5-Land grid cell for each destination. They are not a forecast and do not represent every route, canyon or exposed surface. Hot-day probability and wet-day probability use the published BestTimeToHike definitions; neither measures personal heat tolerance, water access or current closures. Coarse grid wind is not used here as trail-wind evidence." },
        { type: "destinationLinks", heading: "Check the evidence in context", links: [
          { label: "Wadi Rum", href: links.destination("en", "wadi-rum"), detail: "Compare all twelve months, including the March and November contrast." },
          { label: "Arches", href: links.destination("en", "arches"), detail: "See how a very dry July can still fail the heat gate." },
          { label: "Mallorca", href: links.destination("en", "mallorca"), detail: "Read the Mediterranean summer metrics month by month." },
          { label: "Methodology", href: links.methodology("en"), detail: "Definitions, thresholds, historical period and model limitations." },
          { label: "Find a month", href: links.finder("en"), detail: "Filter eligible destinations by the conditions that matter to you." },
        ] },
      ],
    },
    de: {
      title: "Trockenes Wanderwetter: Wenig Regen kann Hitze bedeuten",
      description: "Drei sehr trockene Juliklimata zeigen, warum Regen allein in den falschen Monat führen kann und warum die Hitzewahrscheinlichkeit mitentscheiden muss.",
      heroAlt: "Sandsteinlandschaft im Wadi Rum, eines der trockenen Ziele aus dem Artikel",
      category: "data-insight",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "Eine Vorhersage ohne Regensymbol wirkt einladend. Eine Klimatabelle mit fast keinen Regentagen scheint noch überzeugender, weil sie einen ganzen Monat statt nur einen Nachmittag beschreibt. Trockenheit beantwortet jedoch nur eine Planungsfrage: Wie häufig trat am ausgewählten Modellpunkt historisch messbarer Niederschlag auf? Sie sagt nicht, ob die typischen Wanderstunden angenehm waren, ob sehr heiße Tage den Monat bestimmten oder ob eine Route Schatten und Wasser bietet. Wadi Rum, Arches und Mallorca machen diese Lücke besonders deutlich. Ihre Julidaten sind trocken, enthalten aber gleichzeitig ein starkes Hitzesignal, das die Wanderentscheidung verändert." },
        { type: "pullQuote", text: "Ein trockener Monat kann ein Problem beseitigen und gleichzeitig ein anderes verschärfen." },
        { type: "heading", level: 2, text: "Der Widerspruch im Juli" },
        { type: "paragraph", text: "Für Wadi Rum liegt der historische Anteil nasser Tage im Juli bei 0,0 Prozent. Dieser Wert ist kein Tippfehler. An der ausgewählten repräsentativen ERA5-Land-Zelle beträgt die mittlere Temperatur während der untersuchten Wanderstunden 30,1 °C; die historische Wahrscheinlichkeit eines heißen Tages liegt bei 99,72 Prozent. Arches ist ähnlich problematisch: 8,39 Prozent nasse Tage, 30,8 °C im Mittel und 97,42 Prozent Wahrscheinlichkeit für einen heißen Tag. Mallorca ist weniger extrem, verbindet aber 5,81 Prozent nasse Tage mit 27,7 °C und 79,91 Prozent Hitzewahrscheinlichkeit. Das aktuelle Empfehlungstor hält alle drei Julimonate zurück. Wenig Regen ist also richtig, aber unvollständig." },
        { type: "comparisonTable", caption: "Derselbe Monat aus Regen- und Hitzeperspektive", columns: ["Ziel", "Nasse Tage", "Mittel in Wanderstunden", "Heiße Tage", "Empfehlung"], rows: [
          { label: "Wadi Rum, Juli", values: ["0,0%", "30,1 °C", "99,72%", "Zurückgehalten"] },
          { label: "Arches, Juli", values: ["8,39%", "30,8 °C", "97,42%", "Zurückgehalten"] },
          { label: "Mallorca, Juli", values: ["5,81%", "27,7 °C", "79,91%", "Zurückgehalten"] },
        ], evidenceKey: "dry-heat-contradiction" },
        { type: "paragraph", text: "Die Tabelle behauptet nicht, dass im Juli niemand dort wandern kann. Sie macht eine engere und nützlichere Aussage: Das historische Klima an einer repräsentativen Zelle erfüllt die Empfehlungsregeln der Website nicht, deshalb wird der Monat nicht als allgemein passende Wahl dargestellt. Eine kurze, frühe und schattige Runde kann anders aussehen als eine ausgesetzte Tagestour. Fitness, Akklimatisation, Wasserstellen und lokale Regeln spielen ebenfalls eine Rolle. Diese Details liegen außerhalb des Klimamodells. Gerade deshalb darf eine niedrige Niederschlagszahl nicht zu einer pauschalen Empfehlung werden." },
        { type: "metricCallout", label: "Wadi Rum im Juli", value: "0,0% nasse Tage, 99,72% Wahrscheinlichkeit heißer Tage", detail: "Zwei historisch abgeleitete Wahrscheinlichkeiten beschreiben verschiedene Risiken. Die erste klingt attraktiv, die zweite führt zum Zurückhalten des Monats.", evidenceKey: "dry-heat-contradiction" },
        { type: "heading", level: 2, text: "Wovor das Hitzetor schützt" },
        { type: "paragraph", text: "BestTimeToHike trennt die mittlere Temperatur in den Wanderstunden von der Wahrscheinlichkeit heißer Tage. Das Mittel fasst das untersuchte Tageszeitfenster zusammen; die Wahrscheinlichkeit zählt, wie häufig die tägliche Hitzebedingung den veröffentlichten Grenzwert überschreitet. Mittelwerte können Häufigkeiten verdecken. Ein Monat kann auf den ersten Blick ein erträgliches Mittel haben und trotzdem viele Tage oberhalb der Hitzegrenze enthalten. Eine kühle Wüstennacht macht das Wanderfenster am Mittag nicht mild. Das Tor ist bewusst konservativ: Überschreitet eine kritische Komponente ihre Ausschlussregel, darf ein gutes Ergebnis bei Regen, Schnee oder Tageslicht diese Schwäche nicht aufheben." },
        { type: "monthStrip", caption: "Wadi Rum: der Kontrast der Übergangsmonate", months: [
          { month: 3, label: "März", note: "17,4 °C, 5,05% nasse Tage", href: links.destinationMonth("de", "wadi-rum", 3) },
          { month: 7, label: "Juli", note: "30,1 °C, zurückgehalten", href: links.destinationMonth("de", "wadi-rum", 7) },
          { month: 11, label: "November", note: "18,3 °C, 2,22% nasse Tage", href: links.destinationMonth("de", "wadi-rum", 11) },
        ], evidenceKey: "wadi-rum-shoulders" },
        { type: "paragraph", text: "Wadi Rum zeigt zugleich eine bessere Lesart der Daten: Erst Monate innerhalb eines Ziels vergleichen, dann verschiedene Ziele. Der März erreicht 17,4 °C während der Wanderstunden und 5,05 Prozent nasse Tage; im November sind es 18,3 °C und 2,22 Prozent. Beide Monate bleiben nach üblichen Maßstäben trocken, ihr Temperaturkontext unterscheidet sich aber deutlich vom Juli. Das macht März und November nicht zu garantierten Reiseterminen. Es macht sie zu plausibleren Ausgangspunkten für aktuelle Vorhersagen, Tageslicht, lokale Hinweise und die genaue Route. Die sinnvolle Frage lautet nicht trocken oder nass, sondern trocken genug und thermisch plausibel für die geplante Aktivität." },
        { type: "heading", level: 2, text: "Eine praktische Reihenfolge mit drei Fragen" },
        { type: "paragraph", text: "Zuerst die kritischen Tore lesen: Wird der Monat wegen Hitze, Schnee, Niederschlag oder einer anderen veröffentlichten Grenze ausgeschlossen? Danach die physikalischen Kennzahlen statt nur eines Gesamtergebnisses betrachten. Bei einem heißen, trockenen Ziel verdienen Temperatur in den Wanderstunden und Hitzewahrscheinlichkeit mehr Aufmerksamkeit als der Regen. Schließlich folgt der Schritt vom Klima zur konkreten Reise. Aktuelle Gebirgs- oder Wüstenvorhersage, offizieller Zugang, Wasser und Schatten entlang der Route sowie eine Uhrzeit außerhalb der größten Hitze gehören dazu. So bleibt die Stärke historischer Daten erhalten, der Saisonvergleich, ohne ihnen eine Entscheidung über einen bestimmten Weg oder Tag zuzuschreiben." },
        { type: "caveat", text: "Die Werte beschreiben historische Bedingungen von 1991 bis 2025 an jeweils einer ausgewählten repräsentativen ERA5-Land-Gitterzelle. Sie sind keine Vorhersage und stehen nicht für jede Route, Schlucht oder exponierte Fläche. Die Wahrscheinlichkeit heißer und nasser Tage folgt den veröffentlichten BestTimeToHike-Definitionen; sie misst weder persönliche Hitzetoleranz noch Wasserzugang oder aktuelle Sperrungen. Grober Gitterwind wird hier nicht als Evidenz für Wind am Weg verwendet." },
        { type: "destinationLinks", heading: "Die Daten im Zusammenhang prüfen", links: [
          { label: "Wadi Rum", href: links.destination("de", "wadi-rum"), detail: "Alle zwölf Monate vergleichen, einschließlich März und November." },
          { label: "Arches", href: links.destination("de", "arches"), detail: "Nachvollziehen, warum ein sehr trockener Juli am Hitzetor scheitert." },
          { label: "Mallorca", href: links.destination("de", "mallorca"), detail: "Das mediterrane Sommerprofil Monat für Monat lesen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Definitionen, Grenzwerte, historischer Zeitraum und Modellgrenzen." },
          { label: "Monat finden", href: links.finder("de"), detail: "Geeignete Ziele nach den eigenen Bedingungen filtern." },
        ] },
      ],
    },
  },
};
