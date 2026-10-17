import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-17";

export const bestTimeToTrekNepalAnnapurnaVsEverest: BlogPost = {
  slug: "best-time-to-trek-nepal-annapurna-vs-everest",
  status: "approved",
  publishedAt: "2026-10-17",
  modifiedAt: "2026-10-17",
  heroImageSlug: "everest-region",
  evidence: [
    evidence("nepal-trekking-window", "Eligibility calendars, best-month lists and representative-cell elevations for Annapurna and the Everest Region.", [
      "public/data/hiking/destinations/np/annapurna.json",
      "public/data/hiking/destinations/np/everest-region.json",
      "data-config/blog/batch-5-evidence.json",
    ], checkedAt),
    evidence("nepal-monsoon-autumn", "Selected spring, monsoon and autumn temperature, precipitation, wet-day and snow-day records for Annapurna and the Everest Region.", [
      "public/data/hiking/destinations/np/annapurna.json",
      "public/data/hiking/destinations/np/everest-region.json",
      "data-config/blog/batch-5-evidence.json",
    ], checkedAt),
    evidence("nepal-validation-hold", "The published precipitation-validation hold that prevents a recommendation for Langtang.", [
      "public/data/hiking/destinations/np/langtang.json",
      "data-config/blog/batch-5-evidence.json",
    ], checkedAt),
    evidence("nepal-method", "Historical aggregation period, representative-cell limitations, scoring weights and recommendation gate used for interpretation.", [
      "data-config/scoring/weights.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-5-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to trek Nepal: Annapurna vs Everest",
      description: "Compare Annapurna and Everest trekking seasons using historical temperature, monsoon rain and snow signals, with a clear warning about model limits.",
      heroAlt: "Yaks on a mountain trail in Nepal's Everest region",
      category: "planning",
      readingMinutes: 9,
      blocks: [
        { type: "pullQuote", text: "A warm month at 4,000 metres is not automatically a good trekking month. In these records, the warmest period is also the wettest." },
        { type: "paragraph", text: "The best time to trek Nepal is usually discussed as a contest between spring and autumn. The historical records for Annapurna and the Everest Region support that framing only after one important correction: this dataset measures selected high-elevation model cells, not complete trekking routes. Annapurna is represented by a southern trekking-corridor cell at 4,296 metres. The Everest Region uses a lower Khumbu corridor cell at 3,863.8 metres. Both are deliberate replacements for glacier-centred cells, yet neither describes the full ascent from a valley trailhead through several climate zones. The figures are therefore useful for comparing high-route climate signals, especially the shift from snow to monsoon rain and back again. They cannot decide acclimatisation, access, landslide exposure, flight reliability, lodge schedules or current trail safety." },
        { type: "heading", level: 2, text: "Spring opens first in the Everest record" },
        { type: "comparisonTable", caption: "Four turning points at the selected representative cells", columns: ["Month", "Annapurna", "Everest Region", "What changes"], rows: [
          { label: "April", values: ["Withheld · 1.9 °C · 77.24% snow days", "Eligible · 6.4 °C · 31.24% snow days", "Everest clears the snow gate first"] },
          { label: "May", values: ["Eligible · 5.3 °C · 96.77% wet days", "Eligible · 8.7 °C · 89.59% wet days", "Both open, rain already frequent"] },
          { label: "October", values: ["Eligible · 3.6 °C · 68.85% wet days", "Eligible · 7.2 °C · 49.95% wet days", "Rain retreats faster in Everest"] },
          { label: "November", values: ["Eligible · 0.6 °C · 33.05% wet days", "Eligible · 4.5 °C · 12.00% wet days", "Drier, colder autumn profile"] },
        ], evidenceKey: "nepal-monsoon-autumn" },
        { type: "paragraph", text: "April is the clearest difference. The Annapurna cell remains below the recommendation gate because modelled snow days occur on 77.24 percent of valid dates and its snow component falls to four. The Everest cell records 31.24 percent snow days and passes with a score of 62. This does not mean that an entire Everest trek is open or that every Annapurna route is closed. It means the two selected high-route cells cross the project's climate threshold at different times. By May both are eligible, but calling May simply dry would be inaccurate in this dataset. Wet-day frequency has already reached 96.77 percent at Annapurna and 89.59 percent in the Everest Region. The values describe any modelled precipitation during a valid day, not all-day rain, yet they are strong enough to demand careful interpretation." },
        { type: "metricCallout", label: "The monsoon warning", value: "95.81% to 100% wet days", detail: "From June through September, every selected Annapurna month and every Everest month in this comparison records precipitation on at least 95.81% of valid dates.", evidenceKey: "nepal-monsoon-autumn" },
        { type: "heading", level: 2, text: "Why the highest summer scores are not a booking instruction" },
        { type: "timeline", caption: "Read the warm season as a sequence of trade-offs", points: [
          { label: "June", value: "Snow retreats; monsoon rain takes over", detail: "Annapurna records 369.1 mm and Everest 292.4 mm of mean monthly precipitation." },
          { label: "July", value: "Warmest central range, wettest signal", detail: "Both cells record wet days on 100% of valid dates; rainfall exceeds 500 mm." },
          { label: "September", value: "Still wet despite good scores", detail: "Wet-day frequency remains 98.95% at Annapurna and 95.81% in Everest." },
          { label: "November", value: "Drier but colder", detail: "Everest records 12.00% wet days; Annapurna 33.05%, with colder high-cell temperatures." },
        ], evidenceKey: "nepal-monsoon-autumn" },
        { type: "paragraph", text: "The overall score can look strongest in the monsoon because temperature and snow components improve sharply while precipitation is not a hard eligibility gate. Annapurna scores 72 in July and August even though its precipitation component is zero and wet-day frequency is 100 percent. Everest scores between 73 and 75 from June through September while wet-day frequency remains between 95.81 and 100 percent. That is not a contradiction in the data; it is a reason to avoid reading one number as a travel recommendation. The score combines five weighted climate components, and rain can be outweighed by warmer temperatures, fewer snow days, long daylight and low heat stress. Grid-cell wind is excluded. For an actual trekking plan, the individual rain and snow signals are more informative than the summer total. The article therefore treats the monsoon months as a warning about aggregation, not as a claim that they are the best time to book." },
        { type: "caveat", text: "These are 1991–2025 historical aggregates for selected ERA5-Land cells, not route forecasts or safety assessments. The cells do not resolve the vertical range of a trek, monsoon timing within a day, landslides, river crossings, aviation, acclimatisation or current snow. Langtang receives no recommendation because its public record remains on a precipitation-validation hold. Grid-cell wind has zero score weight." },
        { type: "paragraph", text: "Within this limited comparison, autumn supplies the cleaner planning signal. In October, the Everest cell is warmer, less frequently wet and less snow-affected than Annapurna: 7.2 versus 3.6 °C, 49.95 versus 68.85 percent wet days, and 10.41 versus 27.74 percent snow days. November widens the rain-frequency gap to 12.00 versus 33.05 percent, while means fall to 4.5 and 0.6 °C. The Everest record still remains eligible in December, but a historical cell result must never be turned into a blanket winter-trek recommendation. The sensible workflow is to use these figures to compare high-route climate profiles, choose a season for further research, and then check the exact itinerary with current local sources. Langtang is deliberately not ranked alongside the two eligible records until its precipitation evidence is validated or the hold is removed." },
        { type: "destinationLinks", heading: "Inspect the Nepal trekking records", links: [
          { label: "Annapurna", href: links.destination("en", "annapurna"), detail: "See the high-cell calendar and the monsoon trade-off." },
          { label: "Everest Region", href: links.destination("en", "everest-region"), detail: "Compare the lower Khumbu representative cell." },
          { label: "Annapurna in November", href: links.destinationMonth("en", "annapurna", 11), detail: "Open the drier, colder autumn record." },
          { label: "Everest Region in November", href: links.destinationMonth("en", "everest-region", 11), detail: "Inspect the driest selected comparison month." },
          { label: "Langtang", href: links.destination("en", "langtang"), detail: "Read why the public recommendation is withheld." },
          { label: "Methodology", href: links.methodology("en"), detail: "Understand the climate gate and score weights." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Compare other eligible destinations by your priorities." },
        ] },
      ],
    },
    de: {
      title: "Beste Trekkingzeit in Nepal: Annapurna oder Everest",
      description: "Annapurna und Everest im Saisonvergleich: historische Temperatur, Monsunregen und Schnee zeigen Nutzen und Grenzen der Klimadaten.",
      heroAlt: "Yaks auf einem Bergweg in der Everest-Region Nepals",
      category: "planning",
      readingMinutes: 9,
      blocks: [
        { type: "pullQuote", text: "Ein warmer Monat auf 4.000 Metern ist nicht automatisch ein guter Trekkingmonat. In diesen Datensätzen ist die wärmste Phase zugleich die nasseste." },
        { type: "paragraph", text: "Die beste Trekkingzeit in Nepal wird meist als Entscheidung zwischen Frühling und Herbst beschrieben. Die historischen Datensätze für Annapurna und die Everest-Region stützen diese Einteilung erst nach einer wichtigen Korrektur: Gemessen werden ausgewählte hoch gelegene Modellzellen, keine vollständigen Trekkingrouten. Annapurna wird durch eine südliche Trekkingkorridor-Zelle auf 4.296 Metern repräsentiert. Für die Everest-Region steht eine Zelle im tieferen Khumbu-Korridor auf 3.863,8 Metern. Beide ersetzen bewusst Zellen im Gletscherzentrum, bilden aber trotzdem nicht den gesamten Aufstieg vom Talweg durch mehrere Klimazonen ab. Die Zahlen eignen sich zum Vergleich hoch gelegener Klimasignale, besonders beim Wechsel von Schnee zu Monsunregen und zurück. Sie entscheiden weder Akklimatisation noch Zugang, Hangrutschrisiko, Flugsicherheit, Lodge-Zeiten oder die aktuelle Weglage." },
        { type: "heading", level: 2, text: "Im Everest-Datensatz öffnet sich das Frühlingsfenster früher" },
        { type: "comparisonTable", caption: "Vier Wendepunkte an den ausgewählten repräsentativen Zellen", columns: ["Monat", "Annapurna", "Everest-Region", "Was sich ändert"], rows: [
          { label: "April", values: ["Zurückgehalten · 1,9 °C · 77,24% Schneetage", "Zulässig · 6,4 °C · 31,24% Schneetage", "Everest passiert zuerst das Schneetor"] },
          { label: "Mai", values: ["Zulässig · 5,3 °C · 96,77% nasse Tage", "Zulässig · 8,7 °C · 89,59% nasse Tage", "Beide öffnen, Regen bereits häufig"] },
          { label: "Oktober", values: ["Zulässig · 3,6 °C · 68,85% nasse Tage", "Zulässig · 7,2 °C · 49,95% nasse Tage", "Regen zieht sich am Everest schneller zurück"] },
          { label: "November", values: ["Zulässig · 0,6 °C · 33,05% nasse Tage", "Zulässig · 4,5 °C · 12,00% nasse Tage", "Trockeneres, kälteres Herbstprofil"] },
        ], evidenceKey: "nepal-monsoon-autumn" },
        { type: "paragraph", text: "Der April zeigt den deutlichsten Unterschied. Die Annapurna-Zelle bleibt unter dem Empfehlungstor, weil an 77,24 Prozent der gültigen Tage modellierte Schneetage auftreten und ihre Schneekomponente auf vier fällt. Die Everest-Zelle verzeichnet 31,24 Prozent Schneetage und passiert das Tor mit Score 62. Daraus folgt weder, dass eine gesamte Everest-Route geöffnet ist, noch dass jeder Annapurna-Weg geschlossen bleibt. Es bedeutet nur, dass die beiden ausgewählten Zellen das projektinterne Klimator zu verschiedenen Zeitpunkten überschreiten. Im Mai sind beide zulässig, aber trocken wäre für diesen Monat eine falsche Bezeichnung. Die Häufigkeit nasser Tage liegt bereits bei 96,77 Prozent an Annapurna und 89,59 Prozent in der Everest-Region. Gemeint ist irgendein modellierter Niederschlag an einem gültigen Tag, nicht ganztägiger Regen. Trotzdem ist das Signal stark genug, um einfache Saisonbehauptungen zu vermeiden." },
        { type: "metricCallout", label: "Die Monsunwarnung", value: "95,81% bis 100% nasse Tage", detail: "Von Juni bis September weist jeder untersuchte Annapurna-Monat und jeder Everest-Monat an mindestens 95,81 Prozent der gültigen Tage Niederschlag auf.", evidenceKey: "nepal-monsoon-autumn" },
        { type: "heading", level: 2, text: "Warum hohe Sommerscores keine Buchungsanweisung sind" },
        { type: "timeline", caption: "Die warme Phase als Folge von Zielkonflikten lesen", points: [
          { label: "Juni", value: "Schnee zieht sich zurück, Monsunregen übernimmt", detail: "Annapurna verzeichnet 369,1 mm, Everest 292,4 mm mittleren Monatsniederschlag." },
          { label: "Juli", value: "Wärmster zentraler Bereich, stärkstes Nässesignal", detail: "Beide Zellen melden an 100 Prozent der gültigen Tage Nässe; die Monatsmenge liegt über 500 mm." },
          { label: "September", value: "Trotz guter Scores weiterhin nass", detail: "Die Häufigkeit nasser Tage bleibt bei 98,95 Prozent an Annapurna und 95,81 Prozent am Everest." },
          { label: "November", value: "Trockener, aber kälter", detail: "Everest erreicht 12,00 Prozent nasse Tage, Annapurna 33,05 Prozent, bei kälteren Temperaturen der Hochzellen." },
        ], evidenceKey: "nepal-monsoon-autumn" },
        { type: "paragraph", text: "Der Gesamtscore kann im Monsun am stärksten aussehen, weil sich Temperatur- und Schneekomponenten deutlich verbessern, während Niederschlag kein hartes Ausschlusskriterium ist. Annapurna erreicht im Juli und August Score 72, obwohl die Niederschlagskomponente null beträgt und an 100 Prozent der gültigen Tage Nässe registriert wird. Everest erzielt von Juni bis September Scores zwischen 73 und 75, während die Häufigkeit nasser Tage zwischen 95,81 und 100 Prozent bleibt. Das ist kein Datenwiderspruch, sondern ein Grund, eine einzelne Zahl nicht als Reiseempfehlung zu lesen. Der Score kombiniert fünf gewichtete Klimakomponenten. Gitterwind ist ausgeschlossen. Regen kann durch wärmere Temperaturen, weniger Schneetage, langes Tageslicht und geringen Hitzestress überlagert werden. Für die Reiseplanung sind die einzelnen Regen- und Schneesignale deshalb aussagekräftiger als der Sommertotalwert. Der Artikel behandelt Monsunmonate als Warnung vor zu starker Verdichtung, nicht als beste Buchungszeit." },
        { type: "caveat", text: "Die Werte sind historische Aggregate von 1991 bis 2025 für ausgewählte ERA5-Land-Zellen. Sie sind weder Routenprognosen noch Sicherheitsbewertungen. Die Zellen lösen den Höhenverlauf eines Treks, Monsunzeiten innerhalb eines Tages, Rutsche, Flussquerungen, Flüge, Akklimatisation und aktuelle Schneelage nicht auf. Langtang erhält keine Empfehlung, weil der öffentliche Datensatz unter einer Niederschlagsvalidierungssperre steht. Gitterwind besitzt Gewicht null." },
        { type: "paragraph", text: "Innerhalb dieses begrenzten Vergleichs liefert der Herbst das klarere Planungssignal. Im Oktober ist die Everest-Zelle wärmer, seltener nass und weniger schneebetroffen als Annapurna: 7,2 gegenüber 3,6 °C, 49,95 gegenüber 68,85 Prozent nasse Tage und 10,41 gegenüber 27,74 Prozent Schneetage. Im November wächst der Abstand bei der Regenhäufigkeit auf 12,00 gegenüber 33,05 Prozent, während die Mittel auf 4,5 und 0,6 °C sinken. Der Everest-Datensatz bleibt auch im Dezember zulässig, doch daraus darf keine pauschale Winterempfehlung werden. Sinnvoll ist, die Zahlen zum Vergleich hoch gelegener Klimaprofile zu nutzen, eine Saison für weitere Recherche zu wählen und danach die konkrete Route mit aktuellen lokalen Quellen zu prüfen. Langtang wird bewusst nicht neben den beiden zulässigen Datensätzen eingeordnet, bis seine Niederschlagsevidenz validiert oder die Sperre aufgehoben ist." },
        { type: "destinationLinks", heading: "Die Nepal-Datensätze prüfen", links: [
          { label: "Annapurna", href: links.destination("de", "annapurna"), detail: "Den Hochzellen-Kalender und den Monsunkonflikt ansehen." },
          { label: "Everest-Region", href: links.destination("de", "everest-region"), detail: "Die tiefere repräsentative Khumbu-Zelle vergleichen." },
          { label: "Annapurna im November", href: links.destinationMonth("de", "annapurna", 11), detail: "Den trockeneren, kälteren Herbstwert öffnen." },
          { label: "Everest-Region im November", href: links.destinationMonth("de", "everest-region", 11), detail: "Den trockensten ausgewählten Vergleichsmonat prüfen." },
          { label: "Langtang", href: links.destination("de", "langtang"), detail: "Nachlesen, warum die öffentliche Empfehlung zurückgehalten wird." },
          { label: "Methodik", href: links.methodology("de"), detail: "Klimator und Score-Gewichte verstehen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Andere zulässige Ziele nach eigenen Prioritäten vergleichen." },
        ] },
      ],
    },
  },
};
