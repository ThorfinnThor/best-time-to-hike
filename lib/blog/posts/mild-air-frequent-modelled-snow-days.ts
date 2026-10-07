import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-07";

export const mildAirFrequentModelledSnowDays: BlogPost = {
  slug: "mild-air-frequent-modelled-snow-days",
  status: "approved",
  publishedAt: "2026-10-07",
  modifiedAt: checkedAt,
  heroImageSlug: "lake-tahoe",
  evidence: [
    evidence("snow-cases", "May temperature and snow signals for Lake Tahoe, Yosemite and Berchtesgaden.", [
      "public/data/hiking/destinations/us/lake-tahoe.json",
      "public/data/hiking/destinations/us/yosemite.json",
      "public/data/hiking/destinations/de/berchtesgaden.json",
    ], checkedAt),
    evidence("snow-method", "Snow thresholds and critical-component gate used by the public recommendation model.", [
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      "lib/hiking/climate.ts",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Mild air does not mean snow-free trails",
      description: "Lake Tahoe, Yosemite and Berchtesgaden show why a mild May average cannot erase a critical snow signal.",
      heroAlt: "Clear blue water and mountain ridges at Lake Tahoe",
      category: "seasonal",
      readingMinutes: 7,
      blocks: [
        { type: "monthStrip", caption: "May in three mountain regions", months: [
          { month: 5, label: "Lake Tahoe", note: "11.6 °C mean · 66.91% snow days", href: links.destinationMonth("en", "lake-tahoe", 5) },
          { month: 5, label: "Yosemite", note: "11.5 °C mean · 61.57% snow days", href: links.destinationMonth("en", "yosemite", 5) },
          { month: 5, label: "Berchtesgaden", note: "10.1 °C mean · 76.87% snow days", href: links.destinationMonth("en", "berchtesgaden", 5) },
        ], evidenceKey: "snow-cases" },
        { type: "paragraph", text: "May is often described as a transition month: warmer than early spring, quieter than summer and full of promise. In mountain climates, that description can hide the condition that matters most for a walking plan. Lake Tahoe, Yosemite and Berchtesgaden all have a mild-looking daytime mean in the public record, but each May is withheld because the snow signal crosses a critical rule. This is not a claim that every trail is snowbound. It is a precise explanation of why the model refuses to turn a comfortable mean into a general recommendation." },
        { type: "heading", level: 2, text: "Snow is a gate here, not a bonus point" },
        { type: "timeline", caption: "How the recommendation is decided", points: [
          { label: "1 · Describe", value: "Mean temperature", detail: "Summarises the daylight-limited hiking window." },
          { label: "2 · Test", value: "Snow condition", detail: "Checks the published snow-cover and depth thresholds." },
          { label: "3 · Gate", value: "Withhold the month", detail: "A critical failure cannot be offset by a good mean." },
        ], evidenceKey: "snow-method" },
        { type: "paragraph", text: "For this dataset, a modelled snow day is a complete local day on which the selected cell reaches at least 10 percent snow cover or 0.02 metres of physical snow depth. The percentage is therefore a frequency across valid historical days, not a measurement of how much of a named trail was covered. Lake Tahoe's 66.91 percent, Yosemite's 61.57 percent and Berchtesgaden's 76.87 percent all refer to that same reproducible rule." },
        { type: "comparisonTable", caption: "The May records behind the decision", columns: ["Destination", "Mean", "Snow-day share", "Public outcome"], rows: [
          { label: "Lake Tahoe", values: ["11.6 °C", "66.91%", "Withheld"] },
          { label: "Yosemite", values: ["11.5 °C", "61.57%", "Withheld"] },
          { label: "Berchtesgaden", values: ["10.1 °C", "76.87%", "Withheld"] },
        ], evidenceKey: "snow-cases" },
        { type: "pullQuote", text: "Mild air is not the same thing as a snow-free route." },
        { type: "paragraph", text: "The distinction is useful for trip planning. A lower-elevation path, a cleared access road or a short walk near a town may be practical even when a high route is not. Conversely, a warm afternoon can soften snow and make a trail more difficult or hazardous. Those route-level differences are not represented by one model cell. The site's gate is therefore intentionally conservative: it marks the month as unavailable for a general recommendation and leaves the finer decision to official trail reports, current mountain forecasts and the route operator or park authority." },
        { type: "paragraph", text: "There is a second reason not to read the temperature mean in isolation: the three destinations have different terrain, elevations and exposure. A value near 11 °C in a valley is not operationally identical to 11 °C on a high pass. The public record cannot reconstruct every switchback, shaded bowl or seasonal closure. It can, however, warn that May deserves a snow check before a traveller treats it as a straightforward shoulder-season month. That warning is more useful than a confident but generic statement that spring has arrived." },
        { type: "paragraph", text: "A withheld month is therefore not a dead end. It is a prompt to narrow the question. Which trail, at what elevation, with what current access? Is a low route open while the high route remains snow-covered? Has the park published a melt or road update? Is the planned walk short enough to turn back safely? If those questions lead to a viable itinerary, the climate page has done its job by exposing the uncertainty rather than hiding it behind a mild average." },
        { type: "paragraph", text: "The three cases also explain why the public gate is intentionally asymmetric. Snow, temperature, heat stress and daylight are critical components: a result at or below the configured floor withholds the recommendation. Precipitation remains a scored comfort factor but is not itself a critical veto. Berchtesgaden has a weak precipitation component in May as well, yet snow is the component that makes the month ineligible. Keeping those roles separate prevents the article from attributing the hold to the wrong variable." },
        { type: "caveat", text: "The three May records use 1991–2025 historical conditions at selected representative ERA5-Land cells. Snow is a critical component in the published gate; the displayed mean is not a safety statement. Modelled snow cover and depth do not reveal every trail's surface, avalanche exposure, meltwater or access status. Check current local information before travelling." },
        { type: "destinationLinks", heading: "Compare the mountain records", links: [
          { label: "Lake Tahoe", href: links.destination("en", "lake-tahoe"), detail: "Read the full annual profile and the May hold." },
          { label: "Yosemite", href: links.destination("en", "yosemite"), detail: "See how the spring snow signal changes by month." },
          { label: "Berchtesgaden", href: links.destination("en", "berchtesgaden"), detail: "Inspect the Alpine May record." },
          { label: "Methodology", href: links.methodology("en"), detail: "Snow definitions and recommendation gates." },
          { label: "Find a month", href: links.finder("en"), detail: "Search for eligible alternatives by month." },
          { label: "Low-rain hiking", href: links.themeIndex("en", "lowRain"), detail: "Explore the site's low-rain entry point." },
        ] },
      ],
    },
    de: {
      title: "Milde Luft bedeutet keine schneefreien Wege",
      description: "Lake Tahoe, Yosemite und Berchtesgaden zeigen, warum ein mildes Maimittel ein kritisches Schneesignal nicht aufhebt.",
      heroAlt: "Klares blaues Wasser und Bergkämme am Lake Tahoe",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "monthStrip", caption: "Drei Bergregionen im Mai", months: [
          { month: 5, label: "Lake Tahoe", note: "11,6 °C Mittel · 66,91% Schneetage", href: links.destinationMonth("de", "lake-tahoe", 5) },
          { month: 5, label: "Yosemite", note: "11,5 °C Mittel · 61,57% Schneetage", href: links.destinationMonth("de", "yosemite", 5) },
          { month: 5, label: "Berchtesgaden", note: "10,1 °C Mittel · 76,87% Schneetage", href: links.destinationMonth("de", "berchtesgaden", 5) },
        ], evidenceKey: "snow-cases" },
        { type: "paragraph", text: "Der Mai gilt oft als Übergangsmonat: wärmer als der frühe Frühling, ruhiger als der Sommer und voller Möglichkeiten. In Bergklimata kann diese Beschreibung die wichtigste Bedingung verbergen. Lake Tahoe, Yosemite und Berchtesgaden haben im öffentlichen Datensatz jeweils ein mild wirkendes Tagesmittel, werden im Mai aber zurückgehalten, weil das Schneesignal eine kritische Regel überschreitet. Das behauptet nicht, dass jeder Weg verschneit ist. Es erklärt präzise, warum das Modell aus einem angenehmen Mittelwert keine allgemeine Empfehlung macht." },
        { type: "heading", level: 2, text: "Schnee ist hier ein Tor, kein Bonuspunkt" },
        { type: "timeline", caption: "So entsteht die Entscheidung", points: [
          { label: "1 · Beschreiben", value: "Mittlere Temperatur", detail: "Fasst das tageslichtbegrenzte Wanderfenster zusammen." },
          { label: "2 · Prüfen", value: "Schneebedingung", detail: "Testet die veröffentlichten Grenzwerte für Schneedecke und Tiefe." },
          { label: "3 · Sperren", value: "Monat zurückhalten", detail: "Ein kritischer Fehler kann nicht durch ein gutes Mittel ausgeglichen werden." },
        ], evidenceKey: "snow-method" },
        { type: "paragraph", text: "Ein modellierter Schneetag ist in diesem Datensatz ein vollständiger lokaler Tag, an dem die ausgewählte Zelle mindestens zehn Prozent Schneebedeckung oder 0,02 Meter physische Schneehöhe erreicht. Der Prozentwert ist damit eine Häufigkeit unter den gültigen historischen Tagen und keine Messung darüber, wie viel eines benannten Weges bedeckt war. Die 66,91 Prozent am Lake Tahoe, 61,57 Prozent in Yosemite und 76,87 Prozent in Berchtesgaden folgen alle derselben reproduzierbaren Regel." },
        { type: "comparisonTable", caption: "Die Datensätze hinter der Mai-Entscheidung", columns: ["Ziel", "Mittel", "Anteil Schneetage", "Öffentliches Ergebnis"], rows: [
          { label: "Lake Tahoe", values: ["11,6 °C", "66,91%", "Zurückgehalten"] },
          { label: "Yosemite", values: ["11,5 °C", "61,57%", "Zurückgehalten"] },
          { label: "Berchtesgaden", values: ["10,1 °C", "76,87%", "Zurückgehalten"] },
        ], evidenceKey: "snow-cases" },
        { type: "pullQuote", text: "Milde Luft ist nicht dasselbe wie ein schneefreier Weg." },
        { type: "paragraph", text: "Für die Reiseplanung ist diese Trennung hilfreich. Ein niedriger Weg, eine geräumte Zufahrt oder eine kurze Runde nahe einer Ortschaft kann machbar sein, obwohl eine hoch gelegene Route es nicht ist. Umgekehrt kann warmer Nachmittagsschnee aufweichen und einen Weg schwieriger oder gefährlicher machen. Solche Unterschiede liegen nicht in einer einzigen Modellzelle. Das Tor der Website ist deshalb bewusst konservativ: Der Monat wird nicht allgemein empfohlen; die feinere Entscheidung bleibt bei offiziellen Wegmeldungen, aktuellen Bergvorhersagen und Park- oder Tourenanbietern." },
        { type: "paragraph", text: "Ein weiterer Grund gegen die isolierte Lesart des Mittels sind Gelände, Höhenlage und Exposition. Ein Wert um 11 °C im Tal ist praktisch nicht dasselbe wie 11 °C auf einem hohen Pass. Der öffentliche Datensatz kann keine Kehren, Schattenmulden oder saisonalen Sperren rekonstruieren. Er kann aber darauf hinweisen, dass vor dem Mai eine Schneekontrolle nötig ist, bevor der Monat als einfacher Übergang zur Sommersaison gilt. Diese Warnung ist hilfreicher als eine selbstsichere allgemeine Aussage, der Frühling sei bereits angekommen." },
        { type: "paragraph", text: "Ein zurückgehaltener Monat ist deshalb kein Ende der Planung. Er verengt die richtige Frage: Welcher Weg liegt in welcher Höhe und hat welchen aktuellen Zugang? Ist eine niedrige Route offen, während der hohe Weg noch Schnee trägt? Gibt es eine Meldung des Parks zu Schmelze oder Straße? Ist die geplante Runde kurz genug, um sicher umzukehren? Wenn daraus ein tragfähiger Plan entsteht, hat die Klimaseite ihren Zweck erfüllt, weil sie Unsicherheit sichtbar macht statt sie hinter einem milden Mittelwert zu verstecken." },
        { type: "paragraph", text: "Die drei Fälle erklären außerdem, warum das öffentliche Tor bewusst asymmetrisch ist. Schnee, Temperatur, Hitzestress und Tageslicht sind kritische Komponenten: Ein Ergebnis auf oder unterhalb der festgelegten Grenze hält die Empfehlung zurück. Niederschlag bleibt ein bewerteter Komfortfaktor, ist aber für sich kein kritisches Veto. Berchtesgaden hat im Mai ebenfalls eine schwache Niederschlagskomponente, doch Schnee macht den Monat unzulässig. Die getrennten Rollen verhindern, dass der Text die Sperre der falschen Variable zuschreibt." },
        { type: "paragraph", text: "Für den Vergleich der drei Ziele gilt außerdem dieselbe räumliche Grenze. Jeder Wert stammt von einer ausgewählten repräsentativen Gitterzelle und nicht von einer Vermessung aller Wege. Das macht die Beispiele reproduzierbar, aber nicht flächendeckend. Eine Route kann tiefer, höher, sonniger oder schattiger liegen als die Modellzelle. Genau deshalb folgt auf das Klimasignal immer die Prüfung der konkreten Route." },
        { type: "caveat", text: "Die drei Maiwerte beruhen auf historischen Bedingungen von 1991–2025 an ausgewählten repräsentativen ERA5-Land-Zellen. Schnee ist eine kritische Komponente des veröffentlichten Tors; das Temperaturmittel ist keine Sicherheitsaussage. Modellierte Schneedecke und -tiefe zeigen nicht jeden Weg, Lawinenhang, Schmelzwasser oder aktuellen Zugang. Vor der Reise lokale Informationen prüfen." },
        { type: "destinationLinks", heading: "Die Bergdatensätze vergleichen", links: [
          { label: "Lake Tahoe", href: links.destination("de", "lake-tahoe"), detail: "Das Jahresprofil und die Mai-Sperre lesen." },
          { label: "Yosemite", href: links.destination("de", "yosemite"), detail: "Die Veränderung des Schneesignals verfolgen." },
          { label: "Berchtesgaden", href: links.destination("de", "berchtesgaden"), detail: "Den alpinen Maiverlauf prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Schneedefinitionen und Empfehlungstore." },
          { label: "Monat finden", href: links.finder("de"), detail: "Zulässige Alternativen nach Monat suchen." },
          { label: "Wenig Regen", href: links.themeIndex("de", "lowRain"), detail: "Den Einstieg für regenärmere Monate öffnen." },
        ] },
      ],
    },
  },
};
