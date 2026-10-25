import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-25";

export const bestTimeToHikeGreeceCreteOlympusPindus: BlogPost = {
  slug: "best-time-to-hike-greece-crete-olympus-pindus",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "mount-olympus",
  evidence: [
    evidence("greece-three-calendars", "Eligible calendars, best-month lists and representative elevations for Mount Olympus, Pindus and Samaria Gorge on Crete.", [
      "public/data/hiking/destinations/gr/mount-olympus.json",
      "public/data/hiking/destinations/gr/pindus.json",
      "public/data/hiking/destinations/gr/samaria-crete.json",
      "data-config/blog/batch-8-evidence.json",
    ], checkedAt),
    evidence("greece-spring-summer", "Selected winter, spring, summer and autumn temperature, precipitation, snow-day and daylight records for the three Greek cells.", [
      "public/data/hiking/destinations/gr/mount-olympus.json",
      "public/data/hiking/destinations/gr/pindus.json",
      "public/data/hiking/destinations/gr/samaria-crete.json",
      "data-config/blog/batch-8-evidence.json",
    ], checkedAt),
    evidence("greece-method", "Historical-period definition, representative-cell limits and critical-component rules used to separate climate suitability from route access.", [
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-8-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Greece: Crete, Olympus and Pindus",
      description: "Compare Crete, Mount Olympus and Pindus using 1991–2025 climate data, from spring in Samaria Gorge to the drier Pindus summer.",
      heroAlt: "Rocky ridges of Mount Olympus beneath dark clouds in Greece",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "The best time to hike Greece changes with the landscape. In the public 1991–2025 records, the selected Samaria Gorge cell on Crete passes the project's critical climate thresholds in all twelve months. Mount Olympus passes from March through December, while Pindus passes from April through November. Those wide calendars do not mean that every route is open or comfortable. The three representative cells sit at 1,155.5 metres in Samaria, 1,136.5 metres on Olympus and 1,311.5 metres in Pindus, yet latitude and rainfall produce different seasonal choices. Crete reaches its highest score in May. Olympus has an almost flat July-to-September summit in the ranking. Pindus peaks in September after an exceptionally dry midsummer." },
        { type: "comparisonTable", caption: "May at three representative Greek cells", columns: ["Region", "Temperature", "Wet days", "Monthly rain", "Snow days", "Score"], rows: [
          { label: "Samaria Gorge", values: ["17.5 °C", "16.50%", "32.2 mm", "0%", "95"] },
          { label: "Mount Olympus", values: ["14.8 °C", "46.91%", "108.0 mm", "0%", "85"] },
          { label: "Pindus", values: ["14.1 °C", "42.30%", "76.1 mm", "0%", "87"] },
        ], evidenceKey: "greece-spring-summer" },
        { type: "heading", level: 2, text: "May is the clearest three-region compromise" },
        { type: "metricCallout", label: "May climate spread", value: "32.2 to 108.0 mm", detail: "Samaria is warmest and driest by monthly total. Olympus receives more than three times as much rain, even though all three cells have a zero modelled snow-day probability.", evidenceKey: "greece-spring-summer" },
        { type: "paragraph", text: "May works because snow pressure has relaxed at all three cells while summer heat has not yet become the main question. Samaria averages 17.5 °C and only 16.50 percent wet days. Pindus is cooler at 14.1 °C, with 76.1 mm of monthly rain and a score of 87. Olympus reaches 14.8 °C but remains wetter: 108.0 mm and a 46.91 percent wet-day probability. Mean daylight is about 14.0 hours on Crete and 14.4 hours at the two northern cells. A traveller combining the three regions therefore gets a coherent temperature window but not one weather pattern. The same month can mean a relatively dry gorge day on Crete and a much larger rain contingency on Olympus." },
        { type: "pullQuote", text: "Greece has one calendar on the map and three different climate decisions in these records." },
        { type: "monthStrip", caption: "Choose the Greek hiking month by the landscape", months: [
          { month: 3, label: "March", note: "Crete and Olympus pass · Pindus remains above the snow gate", href: links.destinationMonth("en", "mount-olympus", 3) },
          { month: 5, label: "May", note: "All three pass · strongest cross-region spring balance", href: links.destinationMonth("en", "samaria-crete", 5) },
          { month: 7, label: "July", note: "Pindus turns dry · Olympus stays wetter · Crete reaches 24.2 °C", href: links.destinationMonth("en", "pindus", 7) },
          { month: 9, label: "September", note: "Pindus peaks · Olympus stays strong · Crete cools from August", href: links.destinationMonth("en", "pindus", 9) },
          { month: 12, label: "December", note: "Crete and Olympus pass · Pindus fails its snow component", href: links.destinationMonth("en", "samaria-crete", 12) },
        ], evidenceKey: "greece-three-calendars" },
        { type: "heading", level: 2, text: "July reveals why a national summer label is too blunt" },
        { type: "timeline", caption: "Three different July experiences", points: [
          { label: "Samaria Gorge", value: "24.2 °C · 3.0 mm", detail: "Only 2.21% wet days and 14.3 hours of mean daylight; the score eases to 87 as heat becomes more relevant." },
          { label: "Mount Olympus", value: "21.5 °C · 88.5 mm", detail: "A 31.61% wet-day probability keeps precipitation in the decision despite a score of 87." },
          { label: "Pindus", value: "21.8 °C · 30.8 mm", detail: "The wet-day probability falls to 18.06%, producing a score of 90 before September reaches 92." },
        ], evidenceKey: "greece-spring-summer" },
        { type: "paragraph", text: "July is nearly rainless at the selected Samaria cell, substantially drier in Pindus than in spring, and still meaningfully wet on Olympus. That contrast changes the planning logic. On Crete, an early start, water and heat exposure become central even though the temperature component remains inside the project's critical threshold. Pindus offers the strongest dry-summer signal of the northern records: monthly rain falls from 76.1 mm in May to 30.8 in July and 28.6 in August. Olympus does not follow that curve as sharply. Its July total is 88.5 mm and the wet-day probability remains above thirty percent. September then produces the highest Pindus score, 92, at 16.9 °C and 64.3 mm. Olympus stays at 87 with 17.2 °C, while Samaria returns to 92 as its mean temperature falls to 21.0 °C." },
        { type: "caveat", text: "These values are 35-year averages for one selected model cell in each region. They are not forecasts, gorge-opening dates, refuge schedules or summit-condition reports. They do not resolve heat inside a gorge, thunderstorm timing, rockfall, water availability, snow depth, exposed ridges, local wind or the elevation range of a route. Check current official access, fire restrictions, mountain forecasts and route information before travelling." },
        { type: "destinationLinks", heading: "Open the three Greek climate records", links: [
          { label: "Samaria Gorge", href: links.destination("en", "samaria-crete"), detail: "Inspect the broad climate calendar and the dry summer signal." },
          { label: "Mount Olympus", href: links.destination("en", "mount-olympus"), detail: "Compare the wetter mountain record from March to December." },
          { label: "Pindus", href: links.destination("en", "pindus"), detail: "See why September leads after a dry midsummer." },
          { label: "Samaria Gorge in May", href: links.destinationMonth("en", "samaria-crete", 5), detail: "Open the highest score in this three-region comparison." },
          { label: "Pindus in September", href: links.destinationMonth("en", "pindus", 9), detail: "Review the strongest autumn record." },
          { label: "Methodology", href: links.methodology("en"), detail: "Understand what a representative cell and an eligible month mean." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Compare Greece with other destinations and preferences." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit in Griechenland: Kreta, Olymp und Pindos",
      description: "Kreta, Olymp und Pindos mit Klimadaten von 1991–2025 vergleichen, vom Frühling in der Samaria-Schlucht bis zum trockenen Pindos-Sommer.",
      heroAlt: "Felsige Grate des Olymp unter dunklen Wolken in Griechenland",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "paragraph", text: "Die beste Wanderzeit in Griechenland wechselt mit der Landschaft. In den öffentlichen Datensätzen von 1991 bis 2025 passiert die ausgewählte Zelle der Samaria-Schlucht auf Kreta in allen zwölf Monaten die kritischen Klimaschwellen des Projekts. Der Olymp passiert sie von März bis Dezember, Pindos von April bis November. Diese breiten Kalender bedeuten nicht, dass jede Route offen oder angenehm ist. Die drei repräsentativen Zellen liegen auf 1.155,5 Metern in Samaria, 1.136,5 Metern am Olymp und 1.311,5 Metern in Pindos. Trotzdem erzeugen Breitenlage und Niederschlag unterschiedliche Saisonentscheidungen. Kreta erreicht seinen höchsten Score im Mai. Am Olymp bildet Juli bis September ein fast flaches Maximum. Pindos erreicht den Spitzenwert im September nach einem auffallend trockenen Hochsommer." },
        { type: "comparisonTable", caption: "Mai an drei repräsentativen griechischen Zellen", columns: ["Region", "Temperatur", "Nasse Tage", "Monatsregen", "Schneetage", "Score"], rows: [
          { label: "Samaria-Schlucht", values: ["17,5 °C", "16,50%", "32,2 mm", "0%", "95"] },
          { label: "Olymp", values: ["14,8 °C", "46,91%", "108,0 mm", "0%", "85"] },
          { label: "Pindos", values: ["14,1 °C", "42,30%", "76,1 mm", "0%", "87"] },
        ], evidenceKey: "greece-spring-summer" },
        { type: "heading", level: 2, text: "Der Mai ist der klarste Kompromiss für alle drei Regionen" },
        { type: "metricCallout", label: "Klimaspanne im Mai", value: "32,2 bis 108,0 mm", detail: "Samaria ist nach Monatssumme am wärmsten und trockensten. Der Olymp erhält mehr als dreimal so viel Regen, obwohl alle drei Zellen bei modellierten Schneetagen null erreichen.", evidenceKey: "greece-spring-summer" },
        { type: "paragraph", text: "Der Mai funktioniert, weil sich der Schneedruck an allen drei Zellen entspannt hat und die Sommerhitze noch nicht zur Hauptfrage geworden ist. Samaria erreicht im Mittel 17,5 °C und nur 16,50 Prozent nasse Tage. Pindos ist mit 14,1 °C kühler, verzeichnet 76,1 mm Monatsregen und einen Score von 87. Der Olymp kommt auf 14,8 °C, bleibt jedoch nasser: 108,0 mm und 46,91 Prozent nasse Tage. Das mittlere Tageslicht beträgt auf Kreta etwa 14,0 Stunden und an den beiden nördlichen Zellen 14,4 Stunden. Wer alle drei Regionen kombiniert, erhält deshalb ein stimmiges Temperaturfenster, aber kein einheitliches Wettermuster. Derselbe Monat kann in einer relativ trockenen Schlucht auf Kreta und am deutlich regnerischeren Olymp sehr unterschiedliche Reserven verlangen." },
        { type: "pullQuote", text: "Griechenland hat einen Kalender auf der Karte und drei unterschiedliche Klimaentscheidungen in diesen Datensätzen." },
        { type: "monthStrip", caption: "Den griechischen Wandermonat nach Landschaft wählen", months: [
          { month: 3, label: "März", note: "Kreta und Olymp passieren · Pindos bleibt über der Schneegrenze", href: links.destinationMonth("de", "mount-olympus", 3) },
          { month: 5, label: "Mai", note: "Alle drei passieren · stärkste regionsübergreifende Frühlingsbalance", href: links.destinationMonth("de", "samaria-crete", 5) },
          { month: 7, label: "Juli", note: "Pindos wird trocken · Olymp bleibt nasser · Kreta erreicht 24,2 °C", href: links.destinationMonth("de", "pindus", 7) },
          { month: 9, label: "September", note: "Pindos führt · Olymp bleibt stark · Kreta kühlt gegenüber August ab", href: links.destinationMonth("de", "pindus", 9) },
          { month: 12, label: "Dezember", note: "Kreta und Olymp passieren · Pindos scheitert an der Schneekomponente", href: links.destinationMonth("de", "samaria-crete", 12) },
        ], evidenceKey: "greece-three-calendars" },
        { type: "heading", level: 2, text: "Der Juli zeigt, warum ein landesweites Sommeretikett zu grob ist" },
        { type: "timeline", caption: "Drei unterschiedliche Juli-Erfahrungen", points: [
          { label: "Samaria-Schlucht", value: "24,2 °C · 3,0 mm", detail: "Nur 2,21% nasse Tage und 14,3 Stunden mittleres Tageslicht. Der Score sinkt auf 87, während Hitze wichtiger wird." },
          { label: "Olymp", value: "21,5 °C · 88,5 mm", detail: "Eine Wahrscheinlichkeit nasser Tage von 31,61% hält Niederschlag trotz Score 87 in der Entscheidung." },
          { label: "Pindos", value: "21,8 °C · 30,8 mm", detail: "Nasse Tage sinken auf 18,06% und erzeugen Score 90, bevor der September 92 erreicht." },
        ], evidenceKey: "greece-spring-summer" },
        { type: "paragraph", text: "Der Juli ist an der ausgewählten Samaria-Zelle fast regenfrei, in Pindos deutlich trockener als im Frühling und am Olymp weiterhin spürbar nass. Dieser Kontrast verändert die Planung. Auf Kreta werden ein früher Start, Wasser und Hitzeexposition zentral, obwohl die Temperaturkomponente innerhalb der kritischen Projektschwelle bleibt. Pindos zeigt das stärkste trockene Sommersignal der nördlichen Datensätze: Der Monatsregen fällt von 76,1 mm im Mai auf 30,8 im Juli und 28,6 im August. Der Olymp folgt diesem Verlauf weniger stark. Seine Julisumme liegt bei 88,5 mm und die Wahrscheinlichkeit nasser Tage bleibt über dreißig Prozent. Im September erreicht Pindos mit 16,9 °C und 64,3 mm seinen höchsten Score von 92. Der Olymp bleibt bei 87 und 17,2 °C, Samaria kehrt bei einer Mitteltemperatur von 21,0 °C zu 92 zurück." },
        { type: "caveat", text: "Diese Werte sind 35-jährige Mittel für jeweils eine ausgewählte Modellzelle. Sie sind weder Vorhersagen noch Öffnungstermine der Schlucht, Hüttenpläne oder Gipfelberichte. Sie lösen Hitze in einer Schlucht, Gewitterzeitpunkt, Steinschlag, Wasserverfügbarkeit, Schneehöhe, ausgesetzte Grate, lokalen Wind oder die Höhenspanne einer Route nicht auf. Vor der Reise aktuelle offizielle Zugänge, Waldbrandbeschränkungen, Bergvorhersagen und Routenhinweise prüfen." },
        { type: "destinationLinks", heading: "Die drei griechischen Klimadatensätze öffnen", links: [
          { label: "Samaria-Schlucht", href: links.destination("de", "samaria-crete"), detail: "Den breiten Klimakalender und das trockene Sommersignal prüfen." },
          { label: "Olymp", href: links.destination("de", "mount-olympus"), detail: "Den nasseren Bergdatensatz von März bis Dezember vergleichen." },
          { label: "Pindos", href: links.destination("de", "pindus"), detail: "Ansehen, warum der September nach einem trockenen Hochsommer führt." },
          { label: "Samaria-Schlucht im Mai", href: links.destinationMonth("de", "samaria-crete", 5), detail: "Den höchsten Score dieses Drei-Regionen-Vergleichs öffnen." },
          { label: "Pindos im September", href: links.destinationMonth("de", "pindus", 9), detail: "Den stärksten Herbstdatensatz prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Verstehen, was eine repräsentative Zelle und ein zulässiger Monat bedeuten." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Griechenland mit anderen Zielen und Vorlieben vergleichen." },
        ] },
      ],
    },
  },
};
