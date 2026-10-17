import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-17";

export const bestTimeToHikeDolomitesByMonth: BlogPost = {
  slug: "best-time-to-hike-dolomites-by-month",
  status: "approved",
  publishedAt: "2026-10-17",
  modifiedAt: "2026-10-17",
  heroImageSlug: "dolomites",
  evidence: [
    evidence("dolomites-season-window", "Eligibility calendars, representative-cell elevations and monthly scores for the Dolomites and Brenta Dolomites.", [
      "public/data/hiking/destinations/it/dolomites.json",
      "public/data/hiking/destinations/it/brenta.json",
      "data-config/blog/batch-5-evidence.json",
    ], checkedAt),
    evidence("dolomites-month-tradeoffs", "May to October temperature, wet-day frequency, precipitation and modelled snow-day signals at both selected cells.", [
      "public/data/hiking/destinations/it/dolomites.json",
      "public/data/hiking/destinations/it/brenta.json",
      "data-config/blog/batch-5-evidence.json",
    ], checkedAt),
    evidence("dolomites-method", "Historical period, representative-cell limitation, critical-component gate and zero-weight grid-wind rule used in the interpretation.", [
      "data-config/scoring/weights.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-5-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike the Dolomites: June to October",
      description: "Compare June to October hiking weather in the Dolomites, including temperature, wet-day frequency and the autumn return of modelled snow.",
      heroAlt: "Hiking landscape at Pordoi Pass in the Dolomites",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "timeline", caption: "The season changes differently at two Dolomites representative cells", points: [
          { label: "May", value: "Only Brenta clears the gate", detail: "The 2,059.7 m Dolomites cell is withheld by its snow signal; the lower Brenta cell remains eligible." },
          { label: "June to August", value: "Warmest, longest and wettest", detail: "Both cells are eligible, with long daylight and frequent historically wet days." },
          { label: "September", value: "The balance shifts", detail: "Wet-day frequency falls while both cells still retain good overall scores." },
          { label: "October", value: "Drier, colder, more snow-sensitive", detail: "Both cells remain eligible, but temperature and modelled snow reduce the margin." },
        ], evidenceKey: "dolomites-season-window" },
        { type: "paragraph", text: "The best time to hike the Dolomites is often reduced to a simple summer answer. The two public records used here make the decision more useful. The selected Dolomites cell represents a higher context at 2,059.7 metres, while the Brenta Dolomites cell represents a lower context at 1,538.9 metres. The first clears the project's historical climate gate from June through October; the second from May through October. That one-month difference does not establish an opening calendar for either mountain group. It shows how two selected model cells within the broader Dolomites can enter the hiking season at different times. The practical choice is then shaped by three competing signals: summer warmth and daylight, frequent rain from June through August, and the return of colder and snowier conditions in autumn." },
        { type: "metricCallout", label: "The shared eligible window", value: "June to October", detail: "Both representative cells clear the project's critical climate thresholds in these five months; eligibility does not mean dry trails or open routes.", evidenceKey: "dolomites-season-window" },
        { type: "heading", level: 2, text: "June, July and August offer warmth, but not dryness" },
        { type: "comparisonTable", caption: "Summer at the two selected cells", columns: ["Month", "Dolomites", "Brenta Dolomites", "Planning signal"], rows: [
          { label: "June", values: ["12.1 °C · 71.43% wet days", "14.2 °C · 78.76% wet days", "Long daylight, frequent rain"] },
          { label: "July", values: ["13.9 °C · 66.54% wet days", "15.8 °C · 80.28% wet days", "Warmest central range"] },
          { label: "August", values: ["13.7 °C · 63.87% wet days", "15.6 °C · 74.65% wet days", "Warm, still often wet"] },
        ], evidenceKey: "dolomites-month-tradeoffs" },
        { type: "paragraph", text: "Summer solves the cold-and-snow problem more clearly than it solves the rain problem. In July, modelled snow-day probability falls to 0.74 percent at the higher Dolomites cell and zero at Brenta. The central hiking-window temperatures are mild rather than hot: 13.9 °C and 15.8 °C. Yet wet-day frequency reaches 66.54 percent in the Dolomites record and 80.28 percent in Brenta. Mean monthly precipitation is also substantial at 203.9 and 272.2 mm. August changes the numbers but not the trade-off. Both records stay warm and nearly snow-free, while wet-day frequency remains above 63 percent. These are monthly historical aggregates, not a statement that it rains continuously or at the same time every day. They do mean that a traveller choosing midsummer for warmth and long daylight should build the trip around current forecasts, flexible starts and route-specific thunderstorm guidance rather than treating summer as a dry guarantee." },
        { type: "heading", level: 2, text: "September is the middle ground; October has less rain and less margin" },
        { type: "monthStrip", caption: "Open the months that change the decision", months: [
          { month: 5, label: "Brenta · May", note: "Eligible · 9.8 °C · 30.69% snow days", href: links.destinationMonth("en", "brenta", 5) },
          { month: 7, label: "Dolomites · July", note: "Eligible · score 78 · 66.54% wet days", href: links.destinationMonth("en", "dolomites", 7) },
          { month: 9, label: "Brenta · September", note: "Eligible · score 79 · 11.7 °C", href: links.destinationMonth("en", "brenta", 9) },
          { month: 10, label: "Dolomites · October", note: "Eligible · 5.6 °C · 36.87% snow days", href: links.destinationMonth("en", "dolomites", 10) },
        ], evidenceKey: "dolomites-month-tradeoffs" },
        { type: "paragraph", text: "September reduces rain frequency without yet producing the strongest snow signal. The Dolomites cell records 46.95 percent wet days and 137.5 mm of mean monthly precipitation; Brenta records 55.14 percent and 155.4 mm. Their hiking-window means fall to 9.6 and 11.7 °C, while modelled snow-day probability is 11.90 percent at the higher cell and 3.52 percent at the lower one. This is why September can be a sensible climate compromise in these records, not because it guarantees settled weather. October is historically drier by frequency, but the colder side becomes harder to ignore. The Dolomites mean falls to 5.6 °C and its 10th percentile to -0.4 °C, with modelled snow days on 36.87 percent of valid dates. Brenta is milder at 7.7 °C and 20.74 percent snow days. Both still clear the project gate, yet neither result confirms that high passes, lifts, huts or protected routes remain accessible." },
        { type: "caveat", text: "The figures describe 1991–2025 historical climate at one selected ERA5-Land cell per destination. They do not describe every elevation, trail or valley, and they are not forecasts or opening dates. The model does not resolve thunderstorms, current snowpack, trail closures or exposed-path gusts. Grid-cell wind has zero score weight." },
        { type: "paragraph", text: "A useful month choice therefore starts with the kind of compromise you accept. June to August offers the warmest central temperatures and the longest days, but rain planning is essential. September gives up several degrees and some daylight while reducing historical wet-day frequency. October reduces that frequency further but adds colder tails and a stronger snow signal, especially at the higher cell. May belongs only to the Brenta record in this comparison because the higher Dolomites cell fails the snow threshold. After choosing a month, discard the idea that the whole range behaves like one grid cell. Match the exact route and elevation to current official information, check transport and hut dates, and use a short-range mountain forecast. The historical record is best used to choose what to investigate, not to replace the investigation." },
        { type: "destinationLinks", heading: "Check the Dolomites records behind the comparison", links: [
          { label: "Dolomites", href: links.destination("en", "dolomites"), detail: "See the higher representative cell and its full calendar." },
          { label: "Brenta Dolomites", href: links.destination("en", "brenta"), detail: "Compare the lower cell and earlier eligible May." },
          { label: "Dolomites in September", href: links.destinationMonth("en", "dolomites", 9), detail: "Inspect the autumn balance directly." },
          { label: "Brenta in September", href: links.destinationMonth("en", "brenta", 9), detail: "Open the strongest Brenta score in this record." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read how representative cells and the climate gate work." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Search other destinations using your own limits." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit für die Dolomiten: Juni bis Oktober",
      description: "Wanderwetter in den Dolomiten von Juni bis Oktober: Temperatur, Regentage und die Rückkehr modellierter Schneetage im direkten Vergleich.",
      heroAlt: "Wanderlandschaft am Pordoijoch in den Dolomiten",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "timeline", caption: "Die Saison verändert sich an zwei repräsentativen Dolomiten-Zellen unterschiedlich", points: [
          { label: "Mai", value: "Nur Brenta passiert das Tor", detail: "Die Dolomiten-Zelle auf 2.059,7 Metern wird durch ihr Schneesignal zurückgehalten, die tiefere Brenta-Zelle bleibt zulässig." },
          { label: "Juni bis August", value: "Am wärmsten, längsten und nassesten", detail: "Beide Zellen sind zulässig, mit langen Tagen und historisch häufig nassen Tagen." },
          { label: "September", value: "Der Ausgleich verschiebt sich", detail: "Die Regenhäufigkeit sinkt, während beide Zellen noch gute Gesamtscores erreichen." },
          { label: "Oktober", value: "Trockener, kälter, schneesensibler", detail: "Beide Zellen bleiben zulässig, doch Temperatur und modellierter Schnee verringern den Spielraum." },
        ], evidenceKey: "dolomites-season-window" },
        { type: "paragraph", text: "Die beste Wanderzeit für die Dolomiten wird häufig auf eine einfache Sommerantwort verkürzt. Die beiden hier verwendeten öffentlichen Datensätze machen die Entscheidung genauer. Die ausgewählte Dolomiten-Zelle steht für einen höheren Kontext auf 2.059,7 Metern, die Zelle der Brenta-Dolomiten für einen tieferen Kontext auf 1.538,9 Metern. Die erste passiert das historische Klimator des Projekts von Juni bis Oktober, die zweite bereits von Mai bis Oktober. Dieser Unterschied von einem Monat ist kein Öffnungskalender für die beiden Gebirgsgruppen. Er zeigt, dass zwei ausgewählte Modellzellen innerhalb der größeren Dolomiten zu verschiedenen Zeitpunkten in die Klimasaison eintreten. Die praktische Wahl wird anschließend von drei Gegensätzen bestimmt: Wärme und Tageslicht im Sommer, häufige nasse Tage von Juni bis August und die Rückkehr kälterer, schneereicherer Bedingungen im Herbst." },
        { type: "metricCallout", label: "Das gemeinsame zulässige Fenster", value: "Juni bis Oktober", detail: "Beide repräsentativen Zellen passieren in diesen fünf Monaten die kritischen Klimaschwellen. Zulässig bedeutet weder trockene Wege noch geöffnete Routen.", evidenceKey: "dolomites-season-window" },
        { type: "heading", level: 2, text: "Juni, Juli und August bringen Wärme, aber keine Trockenheitsgarantie" },
        { type: "comparisonTable", caption: "Sommer an den beiden ausgewählten Zellen", columns: ["Monat", "Dolomiten", "Brenta-Dolomiten", "Planungssignal"], rows: [
          { label: "Juni", values: ["12,1 °C · 71,43% nasse Tage", "14,2 °C · 78,76% nasse Tage", "Langes Tageslicht, häufiger Regen"] },
          { label: "Juli", values: ["13,9 °C · 66,54% nasse Tage", "15,8 °C · 80,28% nasse Tage", "Wärmster zentraler Bereich"] },
          { label: "August", values: ["13,7 °C · 63,87% nasse Tage", "15,6 °C · 74,65% nasse Tage", "Warm, weiterhin oft nass"] },
        ], evidenceKey: "dolomites-month-tradeoffs" },
        { type: "paragraph", text: "Der Sommer löst das Kälte- und Schneeproblem deutlicher als das Regenproblem. Im Juli sinkt die modellierte Wahrscheinlichkeit von Schneetagen an der höheren Dolomiten-Zelle auf 0,74 Prozent und in Brenta auf null. Die zentralen Temperaturen im Wanderfenster sind mild statt heiß: 13,9 und 15,8 °C. Gleichzeitig erreicht die Häufigkeit nasser Tage 66,54 Prozent im Dolomiten-Datensatz und 80,28 Prozent in Brenta. Auch der mittlere Monatsniederschlag ist mit 203,9 beziehungsweise 272,2 mm erheblich. Im August verändern sich die Zahlen, nicht aber der Zielkonflikt. Beide Datensätze bleiben warm und nahezu schneefrei, während die Häufigkeit nasser Tage über 63 Prozent liegt. Das sind historische Monatsaggregate. Sie behaupten weder Dauerregen noch Regen zur gleichen Tageszeit. Sie zeigen aber, dass eine Reise wegen Wärme und langen Tagen mit aktuellen Vorhersagen, flexiblen Startzeiten und routenspezifischen Gewitterhinweisen geplant werden muss." },
        { type: "heading", level: 2, text: "September bildet die Mitte; Oktober hat weniger Regen und weniger Spielraum" },
        { type: "monthStrip", caption: "Die Monate öffnen, an denen sich die Entscheidung verändert", months: [
          { month: 5, label: "Brenta · Mai", note: "Zulässig · 9,8 °C · 30,69% Schneetage", href: links.destinationMonth("de", "brenta", 5) },
          { month: 7, label: "Dolomiten · Juli", note: "Zulässig · Score 78 · 66,54% nasse Tage", href: links.destinationMonth("de", "dolomites", 7) },
          { month: 9, label: "Brenta · September", note: "Zulässig · Score 79 · 11,7 °C", href: links.destinationMonth("de", "brenta", 9) },
          { month: 10, label: "Dolomiten · Oktober", note: "Zulässig · 5,6 °C · 36,87% Schneetage", href: links.destinationMonth("de", "dolomites", 10) },
        ], evidenceKey: "dolomites-month-tradeoffs" },
        { type: "paragraph", text: "Im September sinkt die Regenhäufigkeit, ohne bereits das stärkste Schneesignal zu erreichen. Die Dolomiten-Zelle verzeichnet 46,95 Prozent nasse Tage und 137,5 mm mittleren Monatsniederschlag, Brenta 55,14 Prozent und 155,4 mm. Die Mittel im Wanderfenster fallen auf 9,6 und 11,7 °C. Die Wahrscheinlichkeit modellierter Schneetage liegt bei 11,90 Prozent an der höheren und 3,52 Prozent an der tieferen Zelle. Deshalb kann September in diesen Datensätzen einen sinnvollen Klimakompromiss darstellen, nicht weil er stabiles Wetter garantiert. Der Oktober ist nach Häufigkeit trockener, doch die kalte Seite wird wichtiger. Das Dolomiten-Mittel sinkt auf 5,6 °C, das 10. Perzentil auf -0,4 °C, und 36,87 Prozent der gültigen Tage tragen ein Schneesignal. Brenta bleibt mit 7,7 °C und 20,74 Prozent Schneetagen milder. Beide passieren noch das Projekttor, bestätigen aber weder hohe Übergänge noch Lifte, Hütten oder versicherte Steige als zugänglich." },
        { type: "caveat", text: "Die Werte beschreiben das historische Klima von 1991 bis 2025 an einer ausgewählten ERA5-Land-Zelle je Ziel. Sie stehen nicht für jede Höhe, jeden Weg oder jedes Tal und sind weder Vorhersagen noch Öffnungszeiten. Gewitter, aktuelle Schneelage, Wegsperren und Böen auf exponierten Pfaden werden nicht aufgelöst. Gitterwind besitzt Gewicht null." },
        { type: "paragraph", text: "Die Monatswahl beginnt daher mit dem Zielkonflikt, den man akzeptiert. Juni bis August bietet die wärmsten zentralen Temperaturen und die längsten Tage, verlangt aber konsequente Regenplanung. Der September gibt einige Grad und Tageslicht ab und reduziert dafür die historische Häufigkeit nasser Tage. Im Oktober sinkt diese Häufigkeit weiter, während kalte Ränder und das Schneesignal zunehmen, besonders an der höheren Zelle. Der Mai gehört in diesem Vergleich nur zum Brenta-Datensatz, weil die höhere Dolomiten-Zelle die Schneeschwelle verfehlt. Nach der Monatswahl darf die gesamte Gebirgsgruppe nicht wie eine Modellzelle behandelt werden. Die konkrete Route und Höhe müssen mit aktuellen offiziellen Angaben, Verkehr und Hüttenzeiten sowie einer kurzfristigen Bergwettervorhersage abgeglichen werden. Der historische Datensatz wählt die Fragen aus, ersetzt aber nicht ihre aktuelle Beantwortung." },
        { type: "destinationLinks", heading: "Die Dolomiten-Datensätze hinter dem Vergleich prüfen", links: [
          { label: "Dolomiten", href: links.destination("de", "dolomites"), detail: "Die höhere repräsentative Zelle und ihren vollständigen Kalender ansehen." },
          { label: "Brenta-Dolomiten", href: links.destination("de", "brenta"), detail: "Die tiefere Zelle und den früher zulässigen Mai vergleichen." },
          { label: "Dolomiten im September", href: links.destinationMonth("de", "dolomites", 9), detail: "Den herbstlichen Ausgleich direkt prüfen." },
          { label: "Brenta im September", href: links.destinationMonth("de", "brenta", 9), detail: "Den stärksten Brenta-Score dieses Datensatzes öffnen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Repräsentative Zellen und das Klimator nachlesen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Andere Ziele mit eigenen Grenzen durchsuchen." },
        ] },
      ],
    },
  },
};
