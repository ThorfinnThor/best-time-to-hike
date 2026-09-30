import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

export const rainfallTotalVersusWetDays: BlogPost = {
  slug: "rainfall-total-versus-wet-days",
  status: "draft",
  publishedAt: null,
  modifiedAt: "2026-09-30",
  heroImageSlug: "cederberg",
  evidence: [
    evidence("matched-rainfall-pair", "Matched monthly precipitation total with different wet-day shares in Salkantay and Cederberg.", [
      "public/data/hiking/destinations/pe/salkantay.json",
      "public/data/hiking/destinations/za/cederberg.json",
    ]),
    evidence("near-matched-rainfall-pair", "Near-matched monthly precipitation total with different wet-day shares in Salkantay and Jeju.", [
      "public/data/hiking/destinations/pe/salkantay.json",
      "public/data/hiking/destinations/kr/jeju.json",
    ]),
  ],
  translations: {
    en: {
      title: "Rainfall total and wet-day frequency answer different questions",
      description: "Salkantay, Cederberg and Jeju receive almost the same monthly rain total in selected months, yet the rain is distributed across radically different numbers of days.",
      heroAlt: "Rock formations and mountain terrain in Cederberg, part of the matched rainfall comparison",
      category: "data-insight",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "Monthly rainfall is easy to picture as a container: 84 millimetres of water collected over a month. A hiker experiences time rather than a container. The same total might arrive through light precipitation on many days, several concentrated storms, or a mixture of both. This is why BestTimeToHike publishes both precipitation total and wet-day probability. A matched example makes the difference visible. Salkantay in September and Cederberg in June each average 84.2 mm at their selected representative cells. Their wet-day shares are 86.44 percent and 27.44 percent. The volume matches; the calendar pattern does not." },
        { type: "comparisonTable", caption: "Equal or nearly equal rain totals, unequal calendar patterns", columns: ["Destination and month", "Monthly precipitation", "Wet-day share", "Approximate reading"], rows: [
          { label: "Salkantay, September", values: ["84.2 mm", "86.44%", "Wet-day signal on most days"] },
          { label: "Cederberg, June", values: ["84.2 mm", "27.44%", "Same volume across far fewer wet days"] },
          { label: "Jeju, October", values: ["85.7 mm", "23.66%", "Similar volume, lower wet-day frequency"] },
        ], evidenceKey: "matched-rainfall-pair" },
        { type: "heading", level: 2, text: "The matched-pair experiment" },
        { type: "metricCallout", label: "Same monthly total", value: "84.2 mm", detail: "Salkantay in September and Cederberg in June share this historical mean, while their wet-day shares differ by 59 percentage points.", evidenceKey: "matched-rainfall-pair" },
        { type: "paragraph", text: "If the only question is how much precipitation falls during the month, Salkantay and Cederberg tie. If the question is how often a day crosses the dataset's wet-day definition, they are far apart. The 59-point gap matters for itineraries. Frequent precipitation can affect repeated starts, drying opportunities and the number of days with at least some rain signal. A lower wet-day share with the same total suggests that more water is concentrated into fewer days, but it does not tell us the exact storm duration, time of day or trail impact. That final inference needs hourly weather or local evidence, which the monthly summary does not provide." },
        { type: "heading", level: 2, text: "A near match confirms the lesson" },
        { type: "comparisonTable", caption: "Salkantay and Jeju: only 1.5 mm apart", columns: ["Metric", "Salkantay, September", "Jeju, October", "Difference"], rows: [
          { label: "Monthly precipitation", values: ["84.2 mm", "85.7 mm", "1.5 mm"] },
          { label: "Wet-day share", values: ["86.44%", "23.66%", "62.78 points"] },
          { label: "Hiking-hour mean", values: ["9.1 °C", "16.8 °C", "7.7 °C"] },
        ], evidenceKey: "near-matched-rainfall-pair" },
        { type: "pullQuote", text: "Rainfall total describes volume; wet-day share describes frequency. Neither one describes timing or trail condition." },
        { type: "paragraph", text: "Jeju in October sharpens the point. Its 85.7 mm monthly mean is only 1.5 mm above Salkantay's September total, yet its wet-day share is 23.66 percent rather than 86.44. Temperature adds another difference: 16.8 °C during the sampled hiking hours at Jeju versus 9.1 °C at Salkantay. A traveller choosing between the two is not choosing between 84 and 86 millimetres. The practical comparison includes frequency, temperature, elevation, route surface and current forecasts. Close rainfall totals are therefore a reason to open the detail view, not to declare the destinations climatically equivalent." },
        { type: "heading", level: 2, text: "How to read the two metrics together" },
        { type: "paragraph", text: "Use wet-day probability first when the planning concern is how often precipitation may interrupt a multi-day itinerary. Use monthly total to understand the overall water volume and to distinguish a lightly damp pattern from a much wetter climate. Then inspect heavy-rain probability if available, because frequency alone does not describe intensity. Always keep the definitions visible: the figures are historical shares and means from 1991–2020, aggregated at a representative grid cell. They are not a forecast probability for a booked week. A month with fewer wet days can still contain severe events; a month with frequent wet signals may include many modest events." },
        { type: "paragraph", text: "The final step is route context. Soil, rock, river crossings, drainage, vegetation and maintenance determine what a given amount of rain does to a trail. Eighty-four millimetres in an arid, fast-draining landscape is not the same experience as the same amount on steep humid terrain. BestTimeToHike deliberately stops before making that claim. The data helps identify the shape of the historical climate, while official route sources and current local weather explain the likely consequences for the intended hike." },
        { type: "caveat", text: "Wet-day probability is the historical share of days meeting the published wet-day threshold at the representative cell. Monthly precipitation is the historical mean accumulated total. Neither metric reveals the hour of rainfall, storm duration, drainage, river state or surface condition. Values are not forecasts and should not be transferred unchanged to every elevation or route in the region." },
        { type: "destinationLinks", heading: "Open the matched examples", links: [
          { label: "Salkantay", href: links.destinationMonth("en", "salkantay", 9), detail: "See the high-frequency September rain pattern." },
          { label: "Cederberg", href: links.destinationMonth("en", "cederberg", 6), detail: "Compare the same 84.2 mm total across fewer wet days." },
          { label: "Jeju", href: links.destinationMonth("en", "jeju", 10), detail: "Inspect the near-matched October rainfall total." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read the precipitation definitions and thresholds." },
          { label: "Low-rain finder", href: links.themeIndex("en", "lowRain"), detail: "Choose a month before viewing the low-rain results." },
        ] },
      ],
    },
    de: {
      title: "Regenmenge und Regentage sagen nicht dasselbe aus",
      description: "Salkantay, Cederberg und Jeju erhalten in ausgewählten Monaten fast dieselbe Regenmenge, verteilt auf völlig unterschiedliche Anzahlen nasser Tage.",
      heroAlt: "Felsformationen und Berggelände im Cederberg als Teil des Regenvergleichs",
      category: "data-insight",
      readingMinutes: 9,
      blocks: [
        { type: "paragraph", text: "Monatlicher Niederschlag lässt sich leicht als Behälter vorstellen: 84 Millimeter Wasser, gesammelt über einen Monat. Wandernde erleben jedoch Zeit und keinen Behälter. Dieselbe Menge kann als leichter Niederschlag an vielen Tagen, in wenigen konzentrierten Ereignissen oder als Mischung aus beidem fallen. Deshalb veröffentlicht BestTimeToHike sowohl die Niederschlagsmenge als auch die Wahrscheinlichkeit nasser Tage. Ein passendes Zahlenpaar macht den Unterschied sichtbar. Salkantay im September und Cederberg im Juni erreichen an ihren ausgewählten repräsentativen Zellen jeweils 84,2 mm. Der Anteil nasser Tage beträgt 86,44 beziehungsweise 27,44 Prozent. Das Volumen stimmt überein, das Kalendermuster nicht." },
        { type: "comparisonTable", caption: "Gleiche oder fast gleiche Mengen, ungleiche Kalendermuster", columns: ["Ziel und Monat", "Monatsniederschlag", "Anteil nasser Tage", "Ungefähre Lesart"], rows: [
          { label: "Salkantay, September", values: ["84,2 mm", "86,44%", "Regensignal an den meisten Tagen"] },
          { label: "Cederberg, Juni", values: ["84,2 mm", "27,44%", "Gleiches Volumen an deutlich weniger Tagen"] },
          { label: "Jeju, Oktober", values: ["85,7 mm", "23,66%", "Ähnliche Menge, geringere Häufigkeit"] },
        ], evidenceKey: "matched-rainfall-pair" },
        { type: "heading", level: 2, text: "Das Experiment mit dem passenden Paar" },
        { type: "metricCallout", label: "Gleiche Monatsmenge", value: "84,2 mm", detail: "Salkantay im September und Cederberg im Juni teilen dieses historische Mittel, ihre Anteile nasser Tage liegen 59 Prozentpunkte auseinander.", evidenceKey: "matched-rainfall-pair" },
        { type: "paragraph", text: "Wenn nur gefragt wird, wie viel Niederschlag im Monat fällt, liegen Salkantay und Cederberg gleichauf. Geht es darum, wie häufig ein Tag die Definition des Datensatzes für einen nassen Tag überschreitet, sind sie weit voneinander entfernt. Die Lücke von 59 Punkten ist für mehrtägige Pläne relevant. Häufiger Niederschlag kann wiederholte Starts, Möglichkeiten zum Trocknen und die Zahl der Tage mit wenigstens einem Regensignal beeinflussen. Ein geringerer Anteil nasser Tage bei gleicher Menge deutet auf stärker konzentriertes Wasser hin, verrät aber weder genaue Ereignisdauer noch Tageszeit oder Wirkung auf den Weg. Dafür wären stündliche Wetter- oder lokale Routendaten nötig." },
        { type: "heading", level: 2, text: "Ein beinahe identisches Paar bestätigt die Lektion" },
        { type: "comparisonTable", caption: "Salkantay und Jeju: nur 1,5 mm Abstand", columns: ["Kennzahl", "Salkantay, September", "Jeju, Oktober", "Unterschied"], rows: [
          { label: "Monatsniederschlag", values: ["84,2 mm", "85,7 mm", "1,5 mm"] },
          { label: "Anteil nasser Tage", values: ["86,44%", "23,66%", "62,78 Punkte"] },
          { label: "Mittel in Wanderstunden", values: ["9,1 °C", "16,8 °C", "7,7 °C"] },
        ], evidenceKey: "near-matched-rainfall-pair" },
        { type: "pullQuote", text: "Die Regenmenge beschreibt das Volumen, der Anteil nasser Tage die Häufigkeit. Keiner beschreibt Zeitpunkt oder Wegzustand." },
        { type: "paragraph", text: "Jeju im Oktober schärft den Unterschied. Das Monatsmittel von 85,7 mm liegt nur 1,5 mm über Salkantays Septemberwert, der Anteil nasser Tage beträgt aber 23,66 statt 86,44 Prozent. Auch die Temperatur ist anders: 16,8 °C während der untersuchten Wanderstunden auf Jeju gegenüber 9,1 °C bei Salkantay. Reisende wählen nicht zwischen 84 und 86 Millimetern. Zum praktischen Vergleich gehören Häufigkeit, Temperatur, Höhe, Wegoberfläche und aktuelle Vorhersagen. Nahe Regenmengen sind deshalb ein Grund, die Detailansicht zu öffnen, und kein Beleg für klimatische Gleichwertigkeit." },
        { type: "heading", level: 2, text: "Beide Kennzahlen gemeinsam lesen" },
        { type: "paragraph", text: "Die Wahrscheinlichkeit nasser Tage steht zuerst, wenn es um die Häufigkeit möglicher Unterbrechungen einer mehrtägigen Tour geht. Die Monatsmenge hilft beim gesamten Wasservolumen und unterscheidet ein leicht feuchtes Muster von einem deutlich niederschlagsreicheren Klima. Danach lohnt die Wahrscheinlichkeit starken Regens, falls vorhanden, denn Häufigkeit beschreibt keine Intensität. Die Definitionen müssen sichtbar bleiben: Es sind historische Anteile und Mittelwerte von 1991 bis 2020 an einer repräsentativen Zelle. Sie sind keine Vorhersagewahrscheinlichkeit für eine gebuchte Woche. Wenige nasse Tage können schwere Ereignisse enthalten; häufige Signale können aus vielen mäßigen Ereignissen bestehen." },
        { type: "paragraph", text: "Am Ende folgt der Routenkontext. Boden, Fels, Flussquerungen, Entwässerung, Vegetation und Pflege entscheiden, was eine Regenmenge auf einem Weg bewirkt. Vierundachtzig Millimeter in einer trockenen, schnell entwässernden Landschaft fühlen sich nicht an wie dieselbe Menge in steilem, feuchtem Gelände. Auch die Länge der Reise verändert die Frage: Bei einer Tagestour zählt ein einzelnes trockenes Fenster, auf einer mehrtägigen Route dagegen die Wiederholung feuchter Bedingungen und die Möglichkeit, Ausrüstung zu trocknen. BestTimeToHike endet bewusst vor einer Aussage zum Wegzustand. Die Daten zeigen die Form des historischen Klimas, während offizielle Routenquellen und aktuelles lokales Wetter die wahrscheinlichen Folgen für die geplante Wanderung erklären." },
        { type: "caveat", text: "Die Wahrscheinlichkeit nasser Tage ist der historische Anteil der Tage, die an der repräsentativen Zelle den veröffentlichten Grenzwert erreichen. Monatsniederschlag ist die historische mittlere Gesamtsumme. Keine Kennzahl zeigt Tageszeit, Dauer, Entwässerung, Flussstand oder Wegoberfläche. Die Werte sind keine Vorhersagen und dürfen nicht unverändert auf jede Höhe oder Route der Region übertragen werden." },
        { type: "destinationLinks", heading: "Die passenden Beispiele öffnen", links: [
          { label: "Salkantay", href: links.destinationMonth("de", "salkantay", 9), detail: "Das hochfrequente Regenmuster im September ansehen." },
          { label: "Cederberg", href: links.destinationMonth("de", "cederberg", 6), detail: "Dieselben 84,2 mm über weniger nasse Tage vergleichen." },
          { label: "Jeju", href: links.destinationMonth("de", "jeju", 10), detail: "Die fast gleiche Regenmenge im Oktober prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Niederschlagsdefinitionen und Grenzwerte lesen." },
          { label: "Wenig-Regen-Finder", href: links.themeIndex("de", "lowRain"), detail: "Zuerst einen Monat wählen und danach Ergebnisse ansehen." },
        ] },
      ],
    },
  },
};
