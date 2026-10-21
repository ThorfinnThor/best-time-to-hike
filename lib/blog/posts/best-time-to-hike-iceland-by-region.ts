import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-21";

export const bestTimeToHikeIcelandByRegion: BlogPost = {
  slug: "best-time-to-hike-iceland-by-region",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "landmannalaugar",
  evidence: [
    evidence("iceland-season-window", "Eligible calendars, best-month lists and representative elevations for Landmannalaugar, Skaftafell and Þingvellir.", [
      "public/data/hiking/destinations/is/landmannalaugar.json",
      "public/data/hiking/destinations/is/skaftafell.json",
      "public/data/hiking/destinations/is/thingvellir.json",
      "data-config/blog/batch-7-evidence.json",
    ], checkedAt),
    evidence("iceland-snow-rain", "Selected June-to-October temperature, precipitation, snow-day and daylight records for the three Iceland cells.", [
      "public/data/hiking/destinations/is/landmannalaugar.json",
      "public/data/hiking/destinations/is/skaftafell.json",
      "public/data/hiking/destinations/is/thingvellir.json",
      "data-config/blog/batch-7-evidence.json",
    ], checkedAt),
    evidence("iceland-method", "Historical aggregation, representative-cell scope and critical-component rules used to distinguish climate eligibility from access.", [
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-7-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Iceland: three regions by month",
      description: "Compare Landmannalaugar, Skaftafell and Þingvellir month by month using 1991–2025 temperature, rain, snow and daylight data.",
      heroAlt: "Rainbow-coloured mountains in the Landmannalaugar region of Iceland",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "metricCallout", label: "The shared climate window", value: "July to September", detail: "All three selected cells clear the project's critical climate thresholds in only these three months. Þingvellir has a wider June-to-October calendar.", evidenceKey: "iceland-season-window" },
        { type: "paragraph", text: "The best time to hike Iceland depends on which Iceland is meant. Landmannalaugar is represented by a 779.2 metre ERA5-Land cell in the Highlands, Skaftafell by a 328.7 metre cell near the great southern ice fields, and Þingvellir by a 333.1 metre cell farther west. Their public 1991–2025 records agree on July, August and September, but that agreement hides important differences. Landmannalaugar and Skaftafell pass the project's critical climate thresholds in exactly those three months. Þingvellir also passes in June and October. August ranks highest in both Highland and Skaftafell records, while July leads at Þingvellir. This is a climate comparison, not an opening calendar: road access, river crossings, snowpack and route maintenance are separate decisions." },
        { type: "monthStrip", caption: "How Iceland's three selected cells move through summer", months: [
          { month: 6, label: "June", note: "Þingvellir eligible · Highland snow signal still critical", href: links.destinationMonth("en", "thingvellir", 6) },
          { month: 7, label: "July", note: "All three eligible · almost 20 hours of mean daylight", href: links.destinationMonth("en", "landmannalaugar", 7) },
          { month: 8, label: "August", note: "Highest score at Landmannalaugar and Skaftafell", href: links.destinationMonth("en", "skaftafell", 8) },
          { month: 9, label: "September", note: "All three eligible · colder and wetter margins", href: links.destinationMonth("en", "landmannalaugar", 9) },
          { month: 10, label: "October", note: "Only Þingvellir remains eligible in this comparison", href: links.destinationMonth("en", "thingvellir", 10) },
        ], evidenceKey: "iceland-season-window" },
        { type: "heading", level: 2, text: "August is the strongest overlap, not a dry-season promise" },
        { type: "comparisonTable", caption: "August at the three representative cells", columns: ["Region", "Temperature", "Wet days", "Monthly precipitation", "Snow days", "Score"], rows: [
          { label: "Landmannalaugar", values: ["8.2 °C", "60.74%", "112.8 mm", "2.86%", "76"] },
          { label: "Skaftafell", values: ["9.8 °C", "72.72%", "196.1 mm", "3.78%", "75"] },
          { label: "Þingvellir", values: ["10.7 °C", "54.29%", "116.7 mm", "0%", "81"] },
        ], evidenceKey: "iceland-snow-rain" },
        { type: "paragraph", text: "August is the most balanced common month in these records. Modelled snow-day probability falls below four percent at all three cells, temperatures cluster between 8.2 and 10.7 °C, and mean daylight still ranges from 16.3 to 16.4 hours. Yet the rain pattern is not uniform. Skaftafell reaches 196.1 mm of mean monthly precipitation and a 72.72 percent wet-day probability. Landmannalaugar records 112.8 mm and 60.74 percent wet days; Þingvellir 116.7 mm and 54.29 percent. August therefore reduces the snow constraint without turning Iceland into a dry destination. Waterproof layers, flexible timing and a route-specific forecast remain central even in the highest-ranked overlap." },
        { type: "pullQuote", text: "In Iceland, the broadest daylight window arrives before the Highland snow signal has fully relaxed." },
        { type: "heading", level: 2, text: "Why June daylight does not open the same door everywhere" },
        { type: "timeline", caption: "The snow signal controls the edge of the season", points: [
          { label: "May", value: "Long light, closed climate gate", detail: "Mean daylight is about 18.4 to 18.5 hours, but snow-day probability is 71.89% at Þingvellir and 100% at both other cells." },
          { label: "June", value: "Þingvellir moves first", detail: "Its snow-day probability falls to 7.62%; Landmannalaugar and Skaftafell remain above 92%." },
          { label: "July", value: "The common window begins", detail: "All three pass, though modelled snow days still reach about 29% at the two more easterly cells." },
          { label: "August", value: "The cleanest overlap", detail: "Snow pressure is lowest and every cell has more than 16 hours of mean daylight." },
          { label: "September–October", value: "The window closes unevenly", detail: "September remains shared; in October only Þingvellir stays eligible, narrowly, with a score of 43." },
        ], evidenceKey: "iceland-snow-rain" },
        { type: "paragraph", text: "June illustrates why daylight cannot stand in for ground conditions. Landmannalaugar has 20.7 hours of mean daylight, but its modelled snow-day probability is 92.67 percent and the score is capped at 49. Skaftafell shows the same 20.7 hours, 92 percent modelled snow days and the same cap. Þingvellir, by contrast, averages 21 hours of daylight, 9.8 °C and only 7.62 percent modelled snow days, so it enters its eligible calendar with a score of 79. September reverses the pressure: daylight falls to 13 hours, wet-day probability rises above 63 percent everywhere, and Landmannalaugar and Skaftafell record snow-day probabilities of 25.52 and 32 percent. Both still pass, but with scores of 58. The label 'September is eligible' should therefore be read as a threshold result with a narrow margin, not as an equal substitute for August." },
        { type: "caveat", text: "These figures are 35-year averages for one selected model cell per region. They do not describe current Highland roads, river crossings, glacier hazards, volcanic activity, wind on exposed ridges, hut operation or every elevation on a route. The wind field is coarse grid wind rather than trail gust data. Check current road, weather, hazard and official route information before travelling." },
        { type: "paragraph", text: "For a trip that combines all three areas, August has the clearest historical case in this dataset. July offers more daylight but retains a larger snow signal at Landmannalaugar and Skaftafell. September remains within the shared calendar, yet it is colder, wetter and closer to the snow threshold. If the itinerary is limited to Þingvellir, June provides the longest days with a much lower snow signal than the other two records. October is technically eligible there, but 2.2 °C, a 49.59 percent snow-day probability and under ten hours of daylight make it a specialist margin rather than a simple extension of summer. Start with the regional calendar, then make the real decision from the exact route and current conditions." },
        { type: "destinationLinks", heading: "Open the Iceland records and planning tools", links: [
          { label: "Landmannalaugar", href: links.destination("en", "landmannalaugar"), detail: "Inspect the narrow July-to-September Highland window." },
          { label: "Skaftafell", href: links.destination("en", "skaftafell"), detail: "Compare the wetter southern record." },
          { label: "Þingvellir", href: links.destination("en", "thingvellir"), detail: "See the wider June-to-October calendar." },
          { label: "Landmannalaugar in August", href: links.destinationMonth("en", "landmannalaugar", 8), detail: "Open the strongest month at the selected Highland cell." },
          { label: "Methodology", href: links.methodology("en"), detail: "Understand representative cells and critical thresholds." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Compare Iceland with other destinations and preferences." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit für Island: drei Regionen nach Monat",
      description: "Landmannalaugar, Skaftafell und Þingvellir Monat für Monat mit Daten zu Temperatur, Regen, Schnee und Tageslicht von 1991–2025 vergleichen.",
      heroAlt: "Regenbogenfarbene Berge in der Region Landmannalaugar auf Island",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "metricCallout", label: "Das gemeinsame Klimafenster", value: "Juli bis September", detail: "Nur in diesen drei Monaten passieren alle ausgewählten Zellen die kritischen Projektschwellen. Þingvellir besitzt einen breiteren Kalender von Juni bis Oktober.", evidenceKey: "iceland-season-window" },
        { type: "paragraph", text: "Die beste Wanderzeit für Island hängt davon ab, welches Island gemeint ist. Landmannalaugar wird durch eine 779,2 Meter hohe ERA5-Land-Zelle im Hochland vertreten, Skaftafell durch eine 328,7 Meter hohe Zelle nahe den großen Eisfeldern im Süden und Þingvellir durch eine 333,1 Meter hohe Zelle weiter westlich. Ihre öffentlichen Datensätze von 1991 bis 2025 stimmen bei Juli, August und September überein, doch diese Gemeinsamkeit verdeckt wichtige Unterschiede. Landmannalaugar und Skaftafell passieren die kritischen Klimaschwellen des Projekts genau in diesen drei Monaten. Þingvellir passiert sie zusätzlich im Juni und Oktober. In den beiden ersten Datensätzen führt der August, in Þingvellir der Juli. Das ist ein Klimavergleich und kein Öffnungskalender. Straßenzugang, Flussquerungen, Schneedecke und Wegepflege sind eigene Entscheidungen." },
        { type: "monthStrip", caption: "Wie sich die drei ausgewählten Zellen durch den Sommer bewegen", months: [
          { month: 6, label: "Juni", note: "Þingvellir zulässig · Schneedruck im Hochland noch kritisch", href: links.destinationMonth("de", "thingvellir", 6) },
          { month: 7, label: "Juli", note: "Alle drei zulässig · fast 20 Stunden mittleres Tageslicht", href: links.destinationMonth("de", "landmannalaugar", 7) },
          { month: 8, label: "August", note: "Höchster Score in Landmannalaugar und Skaftafell", href: links.destinationMonth("de", "skaftafell", 8) },
          { month: 9, label: "September", note: "Alle drei zulässig · kältere und nassere Ränder", href: links.destinationMonth("de", "landmannalaugar", 9) },
          { month: 10, label: "Oktober", note: "Nur Þingvellir bleibt in diesem Vergleich zulässig", href: links.destinationMonth("de", "thingvellir", 10) },
        ], evidenceKey: "iceland-season-window" },
        { type: "heading", level: 2, text: "August ist die stärkste Überschneidung, aber keine Trockensaison" },
        { type: "comparisonTable", caption: "August an den drei repräsentativen Zellen", columns: ["Region", "Temperatur", "Nasse Tage", "Monatsniederschlag", "Schneetage", "Score"], rows: [
          { label: "Landmannalaugar", values: ["8,2 °C", "60,74%", "112,8 mm", "2,86%", "76"] },
          { label: "Skaftafell", values: ["9,8 °C", "72,72%", "196,1 mm", "3,78%", "75"] },
          { label: "Þingvellir", values: ["10,7 °C", "54,29%", "116,7 mm", "0%", "81"] },
        ], evidenceKey: "iceland-snow-rain" },
        { type: "paragraph", text: "Der August ist in diesen Datensätzen der ausgewogenste gemeinsame Monat. Die modellierte Wahrscheinlichkeit von Schneetagen sinkt an allen drei Zellen unter vier Prozent, die Temperaturen liegen zwischen 8,2 und 10,7 °C und das mittlere Tageslicht erreicht noch 16,3 bis 16,4 Stunden. Das Regenmuster ist trotzdem nicht einheitlich. Skaftafell kommt auf 196,1 mm mittleren Monatsniederschlag und 72,72 Prozent nasse Tage. Landmannalaugar verzeichnet 112,8 mm und 60,74 Prozent nasse Tage, Þingvellir 116,7 mm und 54,29 Prozent. Der August reduziert somit die Schneebeschränkung, verwandelt Island aber nicht in ein trockenes Ziel. Wasserdichte Kleidung, flexible Zeitplanung und eine routenspezifische Vorhersage bleiben auch in der stärksten Überschneidung zentral." },
        { type: "pullQuote", text: "Auf Island beginnt das breiteste Tageslichtfenster, bevor sich das Schneesignal im Hochland vollständig entspannt hat." },
        { type: "heading", level: 2, text: "Warum das Tageslicht im Juni nicht überall dieselbe Tür öffnet" },
        { type: "timeline", caption: "Das Schneesignal bestimmt den Rand der Saison", points: [
          { label: "Mai", value: "Langes Licht, geschlossenes Klimator", detail: "Im Mittel gibt es etwa 18,4 bis 18,5 Stunden Tageslicht, doch Schneetage erreichen 71,89% in Þingvellir und 100% an den beiden anderen Zellen." },
          { label: "Juni", value: "Þingvellir bewegt sich zuerst", detail: "Dort sinken modellierte Schneetage auf 7,62%, während Landmannalaugar und Skaftafell über 92% bleiben." },
          { label: "Juli", value: "Das gemeinsame Fenster beginnt", detail: "Alle drei passieren die Schwellen, obwohl an den beiden östlicheren Zellen noch rund 29% Schneetage erscheinen." },
          { label: "August", value: "Die klarste Überschneidung", detail: "Der Schneedruck ist am niedrigsten und jede Zelle besitzt mehr als 16 Stunden mittleres Tageslicht." },
          { label: "September–Oktober", value: "Das Fenster schließt ungleich", detail: "Der September bleibt gemeinsam. Im Oktober ist nur Þingvellir mit einem Score von 43 knapp zulässig." },
        ], evidenceKey: "iceland-snow-rain" },
        { type: "paragraph", text: "Der Juni zeigt, warum Tageslicht keine Bodenverhältnisse ersetzen kann. Landmannalaugar besitzt 20,7 Stunden mittleres Tageslicht, aber 92,67 Prozent modellierte Schneetage und einen auf 49 gedeckelten Score. Skaftafell zeigt dieselben 20,7 Stunden, 92 Prozent Schneetage und dieselbe Deckelung. Þingvellir erreicht dagegen 21 Stunden Tageslicht, 9,8 °C und nur 7,62 Prozent Schneetage. Dadurch beginnt dort der zulässige Kalender mit einem Score von 79. Im September kehrt sich der Druck um: Das Tageslicht sinkt auf 13 Stunden, die Wahrscheinlichkeit nasser Tage liegt überall über 63 Prozent und Landmannalaugar sowie Skaftafell verzeichnen 25,52 beziehungsweise 32 Prozent Schneetage. Beide passieren die Schwellen noch, aber nur mit einem Score von 58. Die Aussage, der September sei zulässig, beschreibt daher ein Schwellenresultat mit engem Spielraum und keinen gleichwertigen Ersatz für den August." },
        { type: "caveat", text: "Diese Zahlen sind Mittelwerte über 35 Jahre für eine ausgewählte Modellzelle je Region. Sie beschreiben weder aktuelle Hochlandstraßen und Flussquerungen noch Gletschergefahren, Vulkanaktivität, Böen auf exponierten Graten, Hüttenbetrieb oder jede Höhe einer Route. Das Windfeld ist grober Gitterwind und keine Information zu Böen am Weg. Vor der Reise aktuelle Straßen-, Wetter-, Gefahren- und Routeninformationen prüfen." },
        { type: "paragraph", text: "Für eine Reise durch alle drei Regionen besitzt der August in diesem Datensatz den klarsten historischen Fall. Der Juli bietet mehr Tageslicht, behält aber in Landmannalaugar und Skaftafell ein stärkeres Schneesignal. Der September liegt noch im gemeinsamen Kalender, ist jedoch kälter, nasser und näher an der Schneeschwelle. Beschränkt sich die Reise auf Þingvellir, bietet der Juni die längsten Tage bei einem deutlich niedrigeren Schneesignal als in den anderen Datensätzen. Der Oktober ist dort technisch zulässig, doch 2,2 °C, 49,59 Prozent Schneetage und weniger als zehn Stunden Tageslicht machen ihn zu einem Spezialrand statt zu einer einfachen Sommerverlängerung. Zuerst den regionalen Kalender nutzen und die wirkliche Entscheidung dann anhand der genauen Route und aktueller Bedingungen treffen." },
        { type: "destinationLinks", heading: "Die Island-Datensätze und Planungswerkzeuge öffnen", links: [
          { label: "Landmannalaugar", href: links.destination("de", "landmannalaugar"), detail: "Das enge Hochlandfenster von Juli bis September prüfen." },
          { label: "Skaftafell", href: links.destination("de", "skaftafell"), detail: "Den nasseren südlichen Datensatz vergleichen." },
          { label: "Þingvellir", href: links.destination("de", "thingvellir"), detail: "Den breiteren Kalender von Juni bis Oktober ansehen." },
          { label: "Landmannalaugar im August", href: links.destinationMonth("de", "landmannalaugar", 8), detail: "Den stärksten Monat der ausgewählten Hochlandzelle öffnen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Repräsentative Zellen und kritische Schwellen verstehen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Island mit anderen Zielen und Vorlieben vergleichen." },
        ] },
      ],
    },
  },
};
