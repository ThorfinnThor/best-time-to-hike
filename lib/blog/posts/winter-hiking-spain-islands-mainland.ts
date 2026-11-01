import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-11-01";
const sources = [
  "public/data/hiking/destinations/es/tenerife.json",
  "public/data/hiking/destinations/es/mallorca.json",
  "public/data/hiking/destinations/es/sierra-de-cazorla.json",
  "public/data/hiking/destinations/es/picos-de-europa.json",
  "data-config/blog/batch-11-evidence.json",
];

export const winterHikingSpainIslandsMainland: BlogPost = {
  slug: "winter-hiking-spain-islands-mainland",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "tenerife",
  evidence: [
    evidence("spain-winter-cells", "Representative elevations and December–February climate records for Tenerife, Mallorca, Cazorla and Picos de Europa.", sources, checkedAt),
    evidence("spain-winter-choice", "Temperature percentiles, wet-day frequencies, snow signals, daylight and model eligibility for the winter comparison and April contrast.", sources, checkedAt),
    evidence("spain-winter-definitions", "Hiking-hour temperature, full-day precipitation, modelled snow-day thresholds and recommendation rules.", [
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      ...sources,
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Winter hiking in Spain: islands or mainland?",
      description: "Tenerife, Mallorca or mainland Spain? Compare four winter hiking climates with 1991–2025 temperature, rain, snow and daylight data.",
      heroAlt: "Volcanic rock formations and a walking path in Tenerife's Teide National Park",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "For winter hiking in Spain, Tenerife and Mallorca offer the milder starting points among these four records. That answer comes with an unexpected detail: the selected Tenerife cell is slightly cooler than Mallorca in January. Its advantage is more daylight and somewhat fewer wet days, rather than a promise of warmer air. Sierra de Cazorla remains inside the project's climate recommendation limits through winter, but its representative mountain cell is much colder. Picos de Europa fails the winter snow rule. These differences matter more than a national label such as sunny Spain. The comparison uses our public 1991–2025 ERA5-Land records and treats December, January and February separately. It helps choose a regional climate window before checking the actual elevation, access and forecast for a walk." },
        { type: "heading", level: 2, text: "First choose the elevation, then the island or mainland" },
        { type: "comparisonTable", caption: "January at four selected cells, rather than four resort weather stations", columns: ["Region", "Model elevation", "Hiking-hour mean", "Wet days", "Modelled snow days", "Daylight"], rows: [
          { label: "Tenerife", values: ["1,867 m", "11.0 °C", "20.83%", "0%", "10.6 h"] },
          { label: "Mallorca", values: ["230.4 m", "11.7 °C", "24.15%", "0%", "9.7 h"] },
          { label: "Sierra de Cazorla", values: ["1,025 m", "6.9 °C", "30.97%", "12.53%", "9.9 h"] },
          { label: "Picos de Europa", values: ["1,421.5 m", "3.0 °C", "50.51%", "67.10%", "9.4 h"] },
        ], evidenceKey: "spain-winter-cells" },
        { type: "paragraph", text: "Tenerife's 1,867-metre model elevation is essential to interpreting the first row. This is a mountain climate sample, not the temperature of a coastal accommodation base. Mallorca's cell lies at only 230.4 metres and cannot stand in for every high Tramuntana route either. The January means therefore do not establish that Mallorca as a whole is warmer than Tenerife. They describe the two published points used by this site. At those points, Tenerife's temperature distribution runs from 6.6 °C at the 10th percentile to 15.2 °C at the 90th, while Mallorca spans 8.1–15.1 °C. These are percentiles of sampled hiking-hour temperatures, not daily minimum and maximum forecasts. Either choice calls for a plan that accommodates cool walking hours. A photograph of blue sky cannot replace that temperature range." },
        { type: "metricCallout", label: "Tenerife in December", value: "+1 h", detail: "The published mean is 10.4 hours on Tenerife and 9.4 on Mallorca. Daylight measures the astronomical day, not sunshine or guaranteed usable trail time.", evidenceKey: "spain-winter-choice" },
        { type: "heading", level: 2, text: "December, January and February make different trade-offs" },
        { type: "timeline", caption: "What changes during the winter, and what persists", points: [
          { label: "December", value: "The islands are mild, with limited daylight", detail: "Tenerife averages 12.0 °C and 28.20% wet days; Mallorca averages 12.7 °C and 25.62%. Tenerife is not the less-wet island in this month." },
          { label: "January", value: "The mainland mountain contrast is sharp", detail: "Cazorla averages 6.9 °C with 12.53% modelled snow days. Picos de Europa reaches 67.10% snow days and fails the recommendation gate." },
          { label: "February", value: "Light improves before mountain winter disappears", detail: "Tenerife reaches 11.2 hours and Mallorca 10.7 hours of daylight, while Picos de Europa still records 68.02% modelled snow days." },
        ], evidenceKey: "spain-winter-choice" },
        { type: "paragraph", text: "Rain is a contingency on both islands throughout this comparison. January wet-day probability is 20.83 percent on Tenerife and 24.15 percent on Mallorca; their mean monthly totals are 32.7 and 42.5 millimetres. December reverses the ordering: Tenerife records 51.0 millimetres and Mallorca 46.8. A wet day means at least one millimetre of total precipitation during the complete local day. It does not mean rain falls throughout the walk, and the percentages cannot identify which dates of a future holiday will be wet. A useful winter choice therefore combines a tolerable temperature range with flexibility in the itinerary. If daylight is the binding constraint, Tenerife has the stronger record. If the plan depends on rain-free conditions every day, neither island's winter average provides that assurance." },
        { type: "pullQuote", text: "For a Spanish winter walk, the model elevation often explains more than the name of the island or province." },
        { type: "heading", level: 2, text: "Southern mainland mountains still need a winter plan" },
        { type: "paragraph", text: "Cazorla illustrates why southern latitude does not remove the mountain season. At its 1,025-metre cell, January averages 6.9 °C and the lower temperature percentile is 1.0 °C. The snow-day signal reaches 12.53 percent, even though the month passes the project's critical limits. Picos de Europa is colder and wetter, with 3.0 °C, 126.6 millimetres of precipitation and a 67.10 percent snow-day signal. It is outside the recommendation gate in all three winter months. A modelled snow day means the cell reaches at least ten percent snow cover or two centimetres of physical snow depth at some point during that day; it is not the proportion of a trail covered in snow. If the purpose is mild mountain walking rather than winter conditions, Cazorla's April record is a more comfortable comparison at 12.6 °C, while Mallorca reaches 16.3 °C. That is a reason to consider changing the month as well as the region." },
        { type: "caveat", text: "Each record represents one model cell over 1991–2025. An eligible month does not establish that a route is open, snow-free or suitable for a particular walker. Local wind, exposed ridges, ice, flooding, closures and the elevation profile require current information. Check the exact route and official local weather and access notices before travelling." },
        { type: "destinationLinks", heading: "Choose a region and inspect its winter months", links: [
          { label: "Tenerife", href: links.destination("en", "tenerife"), detail: "Read the high-elevation island sample and longer winter daylight." },
          { label: "Mallorca", href: links.destination("en", "mallorca"), detail: "Compare mild low-elevation winter temperatures with spring." },
          { label: "Sierra de Cazorla", href: links.destination("en", "sierra-de-cazorla"), detail: "Inspect the cold and snow signal behind winter eligibility." },
          { label: "Picos de Europa", href: links.destination("en", "picos-de-europa"), detail: "See why the winter recommendation is withheld." },
          { label: "Methodology", href: links.methodology("en"), detail: "Check how temperature, wet days and snow days are defined." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Compare your preferred month and conditions across regions." },
        ] },
      ],
    },
    de: {
      title: "Winterwandern in Spanien: Inseln oder Festland?",
      description: "Teneriffa, Mallorca, Cazorla und Picos de Europa: Temperatur, Regen, Schnee und Tageslicht im Winter mit Daten von 1991–2025 vergleichen.",
      heroAlt: "Vulkanische Felsformationen und ein Wanderweg im Teide-Nationalpark auf Teneriffa",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "Für Winterwanderungen in Spanien bieten Teneriffa und Mallorca unter diesen vier Datensätzen die milderen Ausgangspunkte. Die Antwort enthält ein überraschendes Detail: Die ausgewählte Teneriffa-Zelle ist im Januar etwas kühler als Mallorca. Ihr Vorteil liegt in mehr Tageslicht und etwas weniger nassen Tagen. Sierra de Cazorla bleibt den Winter über innerhalb der klimatischen Empfehlungsgrenzen des Projekts, ihre repräsentative Bergzelle ist aber deutlich kälter. Picos de Europa scheitert an der winterlichen Schneeregel. Diese Unterschiede helfen bei der Planung mehr als das pauschale Bild vom sonnigen Spanien. Der Vergleich nutzt unsere öffentlichen ERA5-Land-Daten von 1991 bis 2025 und betrachtet Dezember, Januar und Februar einzeln. Damit lässt sich ein regionales Klimafenster wählen, bevor die tatsächliche Höhe, der Zugang und die Wettervorhersage für eine konkrete Wanderung geprüft werden." },
        { type: "heading", level: 2, text: "Zuerst die Höhe wählen, dann Insel oder Festland" },
        { type: "comparisonTable", caption: "Januar an vier ausgewählten Zellen statt an vier Urlaubswetterstationen", columns: ["Region", "Modellhöhe", "Mittel im Wanderfenster", "Nasse Tage", "Modellierte Schneetage", "Tageslicht"], rows: [
          { label: "Teneriffa", values: ["1.867 m", "11,0 °C", "20,83%", "0%", "10,6 h"] },
          { label: "Mallorca", values: ["230,4 m", "11,7 °C", "24,15%", "0%", "9,7 h"] },
          { label: "Sierra de Cazorla", values: ["1.025 m", "6,9 °C", "30,97%", "12,53%", "9,9 h"] },
          { label: "Picos de Europa", values: ["1.421,5 m", "3,0 °C", "50,51%", "67,10%", "9,4 h"] },
        ], evidenceKey: "spain-winter-cells" },
        { type: "paragraph", text: "Die Modellhöhe von 1.867 Metern ist entscheidend für die erste Zeile. Teneriffa wird hier durch eine Gebirgsklimazelle repräsentiert, nicht durch die Temperatur eines Unterkunftsortes an der Küste. Mallorcas Zelle liegt auf nur 230,4 Metern und beschreibt ebenfalls nicht jede hohe Tramuntana-Route. Die Januarmittel beweisen deshalb keine allgemein wärmere Insel Mallorca. Sie beschreiben die beiden veröffentlichten Punkte dieser Website. An diesen Punkten reicht die Temperaturverteilung auf Teneriffa von 6,6 °C am 10. Perzentil bis 15,2 °C am 90. Perzentil, auf Mallorca von 8,1 bis 15,1 °C. Das sind Perzentile der erfassten Temperaturen während der Wanderstunden und keine täglichen Tiefst- und Höchstwertvorhersagen. Beide Optionen verlangen einen Plan, der kühle Stunden berücksichtigt. Ein Bild mit blauem Himmel ersetzt diese Temperaturspanne nicht." },
        { type: "metricCallout", label: "Teneriffa im Dezember", value: "+1 h", detail: "Das veröffentlichte Mittel beträgt 10,4 Stunden auf Teneriffa und 9,4 auf Mallorca. Tageslicht bezeichnet den astronomischen Tag und keine Sonnenscheindauer oder garantierte nutzbare Gehzeit.", evidenceKey: "spain-winter-choice" },
        { type: "heading", level: 2, text: "Dezember, Januar und Februar verlangen unterschiedliche Abwägungen" },
        { type: "timeline", caption: "Was sich im Winter verändert und was bestehen bleibt", points: [
          { label: "Dezember", value: "Milde Inseln mit begrenztem Tageslicht", detail: "Teneriffa erreicht 12,0 °C und 28,20% nasse Tage, Mallorca 12,7 °C und 25,62%. Teneriffa ist in diesem Monat nicht die weniger nasse Insel." },
          { label: "Januar", value: "Der Gegensatz zu den Festlandsbergen wird deutlich", detail: "Cazorla liegt bei 6,9 °C und 12,53% modellierten Schneetagen. Picos de Europa erreicht 67,10% Schneetage und scheitert am Empfehlungstor." },
          { label: "Februar", value: "Mehr Licht beendet den Bergwinter noch nicht", detail: "Teneriffa erreicht 11,2 Stunden und Mallorca 10,7 Stunden Tageslicht, während Picos de Europa weiterhin 68,02% modellierte Schneetage verzeichnet." },
        ], evidenceKey: "spain-winter-choice" },
        { type: "paragraph", text: "Regen bleibt auf beiden Inseln während des gesamten Vergleichs eine Planungsfrage. Im Januar beträgt die Wahrscheinlichkeit nasser Tage auf Teneriffa 20,83 Prozent und auf Mallorca 24,15 Prozent. Die mittleren Monatssummen liegen bei 32,7 und 42,5 Millimetern. Im Dezember dreht sich die Reihenfolge: Teneriffa verzeichnet 51,0 Millimeter und Mallorca 46,8. Ein nasser Tag bedeutet mindestens einen Millimeter Gesamtniederschlag während des vollständigen lokalen Tages. Das heißt nicht, dass es während der gesamten Wanderung regnet. Die Prozente bestimmen auch nicht die nassen Daten eines künftigen Urlaubs. Eine brauchbare Winterwahl verbindet deshalb eine akzeptable Temperaturspanne mit Flexibilität im Reiseplan. Wenn Tageslicht die entscheidende Grenze ist, besitzt Teneriffa den stärkeren Datensatz. Hängt die Reise von täglich vollständig regenfreien Bedingungen ab, liefert keines der beiden Wintermittel diese Sicherheit." },
        { type: "pullQuote", text: "Bei einer spanischen Winterwanderung erklärt die Modellhöhe oft mehr als der Name der Insel oder Provinz." },
        { type: "heading", level: 2, text: "Auch südliche Festlandsberge brauchen einen Winterplan" },
        { type: "paragraph", text: "Cazorla zeigt, warum eine südliche Lage die Gebirgssaison nicht aufhebt. An der 1.025 Meter hohen Zelle erreicht der Januar 6,9 °C im Mittel, das untere Temperaturperzentil liegt bei 1,0 °C. Das Schneetagesignal beträgt 12,53 Prozent, obwohl der Monat die kritischen Projektgrenzen passiert. Picos de Europa ist mit 3,0 °C, 126,6 Millimetern Niederschlag und 67,10 Prozent Schneetagen kälter und nasser. In allen drei Wintermonaten bleibt die Empfehlung dort aus. Ein modellierter Schneetag bedeutet, dass die Zelle irgendwann am Tag mindestens zehn Prozent Schneebedeckung oder zwei Zentimeter physische Schneehöhe erreicht. Er beschreibt nicht den verschneiten Anteil eines Weges. Wer mildes Bergwandern sucht, findet in Cazorlas Aprilwert von 12,6 °C einen angenehmeren Vergleich, während Mallorca 16,3 °C erreicht. Das spricht dafür, neben der Region auch einen anderen Monat zu erwägen." },
        { type: "caveat", text: "Jeder Datensatz repräsentiert eine Modellzelle über 1991–2025. Ein zulässiger Monat bestätigt weder offene oder schneefreie Wege noch die Eignung für eine bestimmte Person. Lokaler Wind, exponierte Kämme, Eis, Hochwasser, Sperren und das Höhenprofil benötigen aktuelle Informationen. Vor der Reise die konkrete Route sowie offizielle lokale Wetter- und Zugangsmeldungen prüfen." },
        { type: "destinationLinks", heading: "Eine Region wählen und ihre Wintermonate prüfen", links: [
          { label: "Teneriffa", href: links.destination("de", "tenerife"), detail: "Die hohe Inselzelle und das längere Wintertageslicht ansehen." },
          { label: "Mallorca", href: links.destination("de", "mallorca"), detail: "Das milde Winterklima der tieferen Zelle mit dem Frühling vergleichen." },
          { label: "Sierra de Cazorla", href: links.destination("de", "sierra-de-cazorla"), detail: "Kälte und Schneesignal hinter der Winterzulässigkeit prüfen." },
          { label: "Picos de Europa", href: links.destination("de", "picos-de-europa"), detail: "Sehen, warum die Winterempfehlung ausbleibt." },
          { label: "Methodik", href: links.methodology("de"), detail: "Definitionen von Temperatur, nassen Tagen und Schneetagen lesen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Wunschmonat und Bedingungen zwischen Regionen vergleichen." },
        ] },
      ],
    },
  },
};
