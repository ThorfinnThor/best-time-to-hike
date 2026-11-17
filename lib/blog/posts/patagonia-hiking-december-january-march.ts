import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-11-17";
const sources = [
  "public/data/hiking/destinations/ar/bariloche.json",
  "public/data/hiking/destinations/cl/cerro-castillo.json",
  "public/data/hiking/destinations/cl/torres-del-paine.json",
  "public/data/hiking/destinations/ar/tierra-del-fuego.json",
  "public/data/hiking/destinations/ar/el-chalten.json",
  "data-config/blog/batch-12-evidence.json",
];

export const patagoniaHikingDecemberJanuaryMarch: BlogPost = {
  slug: "patagonia-hiking-december-january-march",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "torres-del-paine",
  evidence: [
    evidence("patagonia-season", "December–March eligibility, temperatures, snow, wet days and daylight for four published Patagonian cells.", sources, checkedAt),
    evidence("patagonia-cells", "Full representative-cell provenance, including the eastern Torres del Paine trail-sector override and El Chaltén's persistent-snow hold.", sources, checkedAt),
    evidence("patagonia-definitions", "Daytime temperature sampling, full-day precipitation and snow definitions, and critical-component recommendation rules.", [
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      ...sources,
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Patagonia hiking: December, January or March?",
      description: "Compare Bariloche, Cerro Castillo, Torres del Paine and Tierra del Fuego using our 1991–2025 data: summer snow, rain and the trade-off in March.",
      heroAlt: "A mountain range and lake in Patagonia under a blue sky",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "January to March is the shared model-eligible window for the four Patagonian destinations compared here. That does not make the three months interchangeable. January offers warmer averages and longer days than March, while February has a lower snow-day signal than January at both Cerro Castillo and the selected Torres del Paine point. December is already eligible at Bariloche, Cerro Castillo and Tierra del Fuego, but fails the snow rule at the Torres cell. The interesting result is therefore not a single best month for all Patagonia. It is how your choice changes between a relatively mild northern mountain sample, colder southern cells and a point with substantial modelled summer snow. Our public 1991–2025 records help make that distinction before a specific itinerary, access check and weather forecast take over." },
        { type: "heading", level: 2, text: "December's long days do not settle the snow question" },
        { type: "timeline", caption: "December at three points that pass the climate gate", points: [
          { label: "Bariloche", value: "13.1 °C · 4.42% snow days", detail: "15.1 hours of daylight and 24.79% wet days at a 1,180.6-metre model elevation." },
          { label: "Cerro Castillo", value: "9.4 °C · 48.48% snow days", detail: "The month passes, despite a substantial snow signal, with 15.7 hours of daylight." },
          { label: "Tierra del Fuego", value: "7.5 °C · 16.13% snow days", detail: "17.2 hours of daylight coexist with 79.08% wet days; a long day is not a dry day." },
        ], evidenceKey: "patagonia-season" },
        { type: "comparisonTable", caption: "Torres del Paine: December's snow contrast within one selected cell", columns: ["Month", "Hiking-hour mean", "Modelled snow days", "Wet days", "Model recommendation"], rows: [
          { label: "December", values: ["6.5 °C", "90.23%", "78.25%", "Withheld"] },
          { label: "January", values: ["8.3 °C", "40.65%", "75.85%", "Eligible"] },
          { label: "February", values: ["8.6 °C", "16.02%", "71.21%", "Eligible"] },
          { label: "March", values: ["7.0 °C", "29.22%", "72.72%", "Eligible"] },
        ], evidenceKey: "patagonia-season" },
        { type: "paragraph", text: "Torres del Paine needs an explicit provenance note. The site uses an eastern trail-sector cell at −51.0, −72.899994 and a model elevation of 549.6 metres. This is a documented override of a western centroid cell that indicated permanent ice, chosen to represent the main hiking area more usefully. It remains one grid sample, not a map of individual trails. December's 90.23 percent modelled snow days explains the withheld model recommendation; it does not establish a park closure or prove that hiking there is impossible in December. A snow day means at least ten percent snow cover or two centimetres of physical snow depth somewhere in the cell's daily model record. It is not the fraction of the route under snow. The sharp December contrast is a reason to consult route-specific evidence, not to turn the grid result into a universal season rule." },
        { type: "metricCallout", label: "Shared eligible window", value: "Jan–Mar", detail: "These are the only months passing the project's critical climate limits at all four selected cells. Eligibility is a climate screening result, not a route-opening or safety certificate.", evidenceKey: "patagonia-season" },
        { type: "heading", level: 2, text: "February is worth comparing before choosing January" },
        { type: "paragraph", text: "At Cerro Castillo, February averages 11.5 °C with 7.61 percent snow days, compared with January's 11.1 °C and 12.35 percent. At the Torres point, the corresponding February values are 8.6 °C and 16.02 percent, versus 8.3 °C and 40.65 percent in January. Both cells also have fewer wet days in February, although rain remains frequent. Bariloche differs: January is slightly warmer at 15.1 °C, compared with 14.8 °C in February, and both months have very small modelled snow-day frequencies. Tierra del Fuego stays cooler, at 8.4 °C in January and 7.9 °C in February. Its February hiking-hour temperature distribution spans 3.7–12.3 °C between the 10th and 90th percentiles. These are sampled daytime temperatures, not overnight lows or a forecast for a future trip. For a multi-region itinerary, February offers a useful compromise in these records, with less daylight than January but lower modelled snow at the two Chilean points." },
        { type: "monthStrip", caption: "Match the timing question to the climate record", months: [
          { month: 12, label: "December", note: "Inspect each destination separately; the four points do not share eligibility.", href: links.destinationMonth("en", "cerro-castillo", 12) },
          { month: 2, label: "February", note: "Compare the lower summer snow signal at the selected Torres cell.", href: links.destinationMonth("en", "torres-del-paine", 2) },
          { month: 3, label: "March", note: "Keep a colder southern sample in the itinerary comparison.", href: links.destinationMonth("en", "tierra-del-fuego", 3) },
        ], evidenceKey: "patagonia-season" },
        { type: "caveat", text: "Weather metrics use our project-defined 35-year average for 1991–2025. Temperatures sample 08:00–18:00 local time, limited to daylight; daylight itself is astronomical duration, not sunshine or safe walking time. Grid wind is excluded from the score and cannot describe ridge exposure or gusts. El Chaltén is intentionally excluded from this month recommendation: its published cell has a persistent-snow review hold, with no hiking scores or best months. That hold describes a data limitation, not an absence of hiking opportunities." },
        { type: "heading", level: 2, text: "March still passes, with a colder and shorter walking day" },
        { type: "paragraph", text: "Bariloche's March mean remains 12.0 °C, whereas Cerro Castillo reaches 8.9 °C, Torres del Paine 7.0 °C and Tierra del Fuego 6.0 °C. At the last point, modelled snow days rise from February's 7.97 to 21.66 percent, while mean daylight falls from 14.7 to 12.5 hours. Fewer wet days there in March do not necessarily mean less total precipitation: the mean monthly total increases from 97.0 to 101.4 millimetres. Wet-day frequency counts complete local days with at least one millimetre of precipitation, rather than rainy walking hours. Rain contributes to the comfort score but does not alone veto a month. March is therefore a defensible climate shortlist, provided the colder conditions and shorter days suit the plan; the records do not support calling it uniformly drier or easier. Check current trail access, the route's actual elevation and local mountain weather before treating any of these monthly averages as a travel decision." },
        { type: "destinationLinks", heading: "Compare the four regional records", links: [
          { label: "Bariloche", href: links.destination("en", "bariloche"), detail: "Inspect the milder northern sample and broader eligible season." },
          { label: "Cerro Castillo", href: links.destination("en", "cerro-castillo"), detail: "Compare December's snow signal with February." },
          { label: "Torres del Paine", href: links.destination("en", "torres-del-paine"), detail: "Read the trail-sector cell override before interpreting the months." },
          { label: "Tierra del Fuego", href: links.destination("en", "tierra-del-fuego"), detail: "Check cool summer temperatures, wet days and the March change." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read the snow, precipitation and temperature definitions." },
          { label: "Hiking finder", href: links.finder("en"), detail: "Compare your preferred month against other destinations." },
        ] },
      ],
    },
    de: {
      title: "Wandern in Patagonien: Dezember, Januar oder März?",
      description: "Bariloche, Cerro Castillo, Torres del Paine und Feuerland: Unsere Daten von 1991–2025 vergleichen Schnee, Regen und die Wanderbedingungen bis März.",
      heroAlt: "Ein Gebirgszug und ein See in Patagonien unter blauem Himmel",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "Januar bis März ist das gemeinsame modellseitig zulässige Zeitfenster der vier hier verglichenen patagonischen Ziele. Die Monate sind trotzdem nicht austauschbar. Januar bietet wärmere Mittel und längere Tage als März, während Februar sowohl bei Cerro Castillo als auch am ausgewählten Torres-del-Paine-Punkt ein geringeres Schneetagesignal als Januar besitzt. Dezember ist in Bariloche, Cerro Castillo und Feuerland bereits zulässig, scheitert an der Torres-Zelle aber am Schneekriterium. Interessant ist deshalb keine einzelne beste Reisezeit für ganz Patagonien. Entscheidend ist, wie sich die Wahl zwischen einer relativ milden nördlichen Gebirgszelle, kälteren südlichen Punkten und einem Datensatz mit erheblichem sommerlichem Schneesignal verändert. Unsere öffentlichen Werte von 1991 bis 2025 helfen bei dieser Unterscheidung, bevor konkrete Reiseroute, Zugangsprüfung und Wettervorhersage die Entscheidung übernehmen." },
        { type: "heading", level: 2, text: "Die langen Dezembertage beantworten die Schneefrage noch nicht" },
        { type: "timeline", caption: "Dezember an drei Punkten innerhalb der Klimagrenzen", points: [
          { label: "Bariloche", value: "13,1 °C · 4,42% Schneetage", detail: "15,1 Stunden Tageslicht und 24,79% nasse Tage auf einer Modellhöhe von 1.180,6 Metern." },
          { label: "Cerro Castillo", value: "9,4 °C · 48,48% Schneetage", detail: "Der Monat passiert die Grenzen trotz deutlichem Schneesignal, bei 15,7 Stunden Tageslicht." },
          { label: "Feuerland", value: "7,5 °C · 16,13% Schneetage", detail: "17,2 Stunden Tageslicht treffen auf 79,08% nasse Tage; ein langer Tag ist kein trockener Tag." },
        ], evidenceKey: "patagonia-season" },
        { type: "comparisonTable", caption: "Torres del Paine: der Dezemberkontrast innerhalb derselben ausgewählten Zelle", columns: ["Monat", "Mittel im Wanderfenster", "Modellierte Schneetage", "Nasse Tage", "Modellempfehlung"], rows: [
          { label: "Dezember", values: ["6,5 °C", "90,23%", "78,25%", "Zurückgehalten"] },
          { label: "Januar", values: ["8,3 °C", "40,65%", "75,85%", "Zulässig"] },
          { label: "Februar", values: ["8,6 °C", "16,02%", "71,21%", "Zulässig"] },
          { label: "März", values: ["7,0 °C", "29,22%", "72,72%", "Zulässig"] },
        ], evidenceKey: "patagonia-season" },
        { type: "paragraph", text: "Torres del Paine benötigt einen ausdrücklichen Herkunftshinweis. Die Website nutzt eine östliche Zelle im Wandersektor bei −51,0 und −72,899994 auf einer Modellhöhe von 549,6 Metern. Diese dokumentierte Ersatzzelle wurde statt einer westlichen Zentrumszelle mit permanentem Eissignal gewählt, um das hauptsächliche Wandergebiet sinnvoller abzubilden. Sie bleibt eine einzelne Gitterprobe und keine Karte konkreter Wege. Die 90,23 Prozent modellierten Schneetage im Dezember erklären die zurückgehaltene Modellempfehlung. Daraus folgt weder eine Parksperre noch, dass Wandern dort im Dezember unmöglich wäre. Ein Schneetag bedeutet mindestens zehn Prozent Schneebedeckung oder zwei Zentimeter physische Schneehöhe irgendwann im Tagesverlauf des Zellmodells. Gemeint ist nicht der verschneite Routenanteil. Der starke Dezemberkontrast verlangt deshalb Informationen zur konkreten Tour, statt das Gitterergebnis als allgemeingültige Saisonregel zu lesen. Auch die deutlich niedrigeren Februarwerte ersetzen keine aktuelle Schneemeldung für einen Pass oder einen hoch gelegenen Weg." },
        { type: "metricCallout", label: "Gemeinsam zulässiges Fenster", value: "Jan–Mär", detail: "Nur diese Monate passieren an allen vier ausgewählten Zellen die kritischen Klimagrenzen des Projekts. Zulässigkeit ist eine klimatische Vorauswahl und keine Bestätigung offener oder sicherer Wege.", evidenceKey: "patagonia-season" },
        { type: "heading", level: 2, text: "Vor einer Januarwahl lohnt der Vergleich mit Februar" },
        { type: "paragraph", text: "Cerro Castillo erreicht im Februar 11,5 °C und 7,61 Prozent Schneetage, gegenüber 11,1 °C und 12,35 Prozent im Januar. Am Torres-Punkt lauten die Februarwerte 8,6 °C und 16,02 Prozent, im Januar 8,3 °C und 40,65 Prozent. Beide Zellen besitzen im Februar auch weniger nasse Tage, obwohl Niederschlag häufig bleibt. Bariloche unterscheidet sich: Januar ist mit 15,1 °C etwas wärmer als Februar mit 14,8 °C; beide Monate haben sehr geringe modellierte Schneetagehäufigkeiten. Feuerland bleibt mit 8,4 °C im Januar und 7,9 °C im Februar kühler. Die Temperaturverteilung während der Wanderstunden reicht dort im Februar zwischen dem 10. und 90. Perzentil von 3,7 bis 12,3 °C. Das sind erfasste Tagestemperaturen, keine nächtlichen Tiefstwerte oder Vorhersage für eine künftige Reise. Für eine Reise durch mehrere Regionen ist Februar in diesen Datensätzen ein brauchbarer Kompromiss: weniger Licht als Januar, aber ein geringeres modelliertes Schneesignal an den beiden chilenischen Punkten." },
        { type: "monthStrip", caption: "Die Zeitfrage am passenden Datensatz prüfen", months: [
          { month: 12, label: "Dezember", note: "Jedes Ziel einzeln prüfen; die vier Punkte teilen keine gemeinsame Zulässigkeit.", href: links.destinationMonth("de", "cerro-castillo", 12) },
          { month: 2, label: "Februar", note: "Das geringere sommerliche Schneesignal an der ausgewählten Torres-Zelle vergleichen.", href: links.destinationMonth("de", "torres-del-paine", 2) },
          { month: 3, label: "März", note: "Die kältere südliche Zelle im Reisevergleich berücksichtigen.", href: links.destinationMonth("de", "tierra-del-fuego", 3) },
        ], evidenceKey: "patagonia-season" },
        { type: "caveat", text: "Die Wettermetriken nutzen unser projektspezifisches 35-Jahre-Mittel von 1991–2025. Temperaturen stammen aus 08:00–18:00 Uhr Ortszeit, begrenzt auf Tageslicht. Tageslicht selbst bedeutet astronomische Dauer, keine Sonnenscheindauer oder sichere Gehzeit. Gitterwind bleibt aus der Bewertung ausgeschlossen und beschreibt weder Kammexposition noch Böen. El Chaltén ist aus dieser Monatsempfehlung bewusst ausgenommen: Seine öffentliche Zelle besitzt einen Prüfstopp wegen dauerhaften Schneesignals, ohne Wanderwerte oder beste Monate. Das bezeichnet eine Datengrenze und kein Fehlen von Wandermöglichkeiten." },
        { type: "heading", level: 2, text: "März bleibt zulässig, bei kälterem und kürzerem Wandertag" },
        { type: "paragraph", text: "Bariloches Märzmittel liegt noch bei 12,0 °C, Cerro Castillo erreicht 8,9 °C, Torres del Paine 7,0 °C und Feuerland 6,0 °C. Am letzten Punkt steigen die modellierten Schneetage von 7,97 Prozent im Februar auf 21,66 Prozent, während das Tageslicht von 14,7 auf 12,5 Stunden fällt. Weniger nasse Tage im März bedeuten dort nicht automatisch weniger Gesamtniederschlag: Die mittlere Monatssumme steigt von 97,0 auf 101,4 Millimeter. Die Häufigkeit nasser Tage zählt vollständige lokale Tage mit mindestens einem Millimeter Niederschlag statt verregneter Wanderstunden. Regen beeinflusst den Komfortwert, sperrt allein aber keinen Monat. März bleibt damit eine begründbare klimatische Vorauswahl, wenn kühlere Bedingungen und kürzere Tage zum Plan passen. Die Daten rechtfertigen keine pauschale Bezeichnung als trockenere oder einfachere Reisezeit. Vor einer Buchung den aktuellen Wegzugang, die tatsächliche Routenhöhe und lokale Bergwetterinformationen prüfen. Erst damit wird aus dem regionalen Monatsvergleich eine belastbare Entscheidung für die geplante Wanderung." },
        { type: "destinationLinks", heading: "Die vier regionalen Datensätze vergleichen", links: [
          { label: "Bariloche", href: links.destination("de", "bariloche"), detail: "Die mildere nördliche Zelle und längere zulässige Saison ansehen." },
          { label: "Cerro Castillo", href: links.destination("de", "cerro-castillo"), detail: "Das Dezember-Schneesignal mit Februar vergleichen." },
          { label: "Torres del Paine", href: links.destination("de", "torres-del-paine"), detail: "Die dokumentierte Ersatzzelle vor der Monatsauswahl lesen." },
          { label: "Feuerland", href: links.destination("de", "tierra-del-fuego"), detail: "Kühle Sommerwerte, nasse Tage und den Märzwechsel prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Definitionen von Schnee, Niederschlag und Temperatur nachlesen." },
          { label: "Wanderfinder", href: links.finder("de"), detail: "Den Wunschmonat mit anderen Zielen vergleichen." },
        ] },
      ],
    },
  },
};
