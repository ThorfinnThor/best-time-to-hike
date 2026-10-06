import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-06";

export const sameTemperatureDifferentAir: BlogPost = {
  slug: "same-temperature-different-air",
  status: "draft",
  publishedAt: null,
  modifiedAt: checkedAt,
  heroImageSlug: "bryce-canyon",
  evidence: [
    evidence("air-contrast", "June Bryce Canyon and Mount Roraima temperature, humidity, precipitation and eligibility metrics.", [
      "public/data/hiking/destinations/us/bryce-canyon.json",
      "public/data/hiking/destinations/ve/roraima.json",
    ], checkedAt),
    evidence("air-method", "Precipitation scoring and critical-component rules used to interpret the two June records.", [
      "data-config/methodology/climate-aggregation-v1.json",
      "lib/hiking/climate.ts",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "The same temperature can mean very different air",
      description: "Bryce Canyon and Mount Roraima share a warm June mean, but humidity and wet-day frequency tell different stories.",
      heroAlt: "Red hoodoos and a trail in Bryce Canyon under a clear sky",
      category: "data-insight",
      readingMinutes: 6,
      blocks: [
        { type: "metricCallout", label: "June temperature", value: "20.8 °C vs 20.9 °C", detail: "The headline means are almost identical. The surrounding climate signals are not.", evidenceKey: "air-contrast" },
        { type: "comparisonTable", caption: "A closer look at the two June records", columns: ["Destination", "Mean", "Relative humidity", "Wet days", "Score", "Outcome"], rows: [
          { label: "Bryce Canyon", values: ["20.8 °C", "20.0%", "11.05%", "90", "Eligible"] },
          { label: "Mount Roraima", values: ["20.9 °C", "80.4%", "95.81%", "75", "Eligible"] },
        ], evidenceKey: "air-contrast" },
        { type: "pullQuote", text: "Temperature answers one question. Air and rain decide what kind of June it is." },
        { type: "heading", level: 2, text: "Why similar warmth does not produce the same reading" },
        { type: "paragraph", text: "Bryce Canyon and Mount Roraima are a useful pair because their June hiking-hour means differ by only 0.1 °C. If the mean were the whole story, their records would look interchangeable. Relative humidity differs by 60.4 percentage points, while the wet-day share differs by 84.76 points. Bryce's record is warm and comparatively dry at the selected cell; Roraima's is warm and persistently wet. The public score reflects that broader pattern, but neither score is a promise about how every person will feel or how every route will drain after rain." },
        { type: "paragraph", text: "Both months remain eligible because precipitation is scored but is not a critical withholding component in the published gate. That detail matters. Eligibility means the record clears the site's critical rules; it does not mean that a humid, wet month is equivalent to a dry one. The useful conclusion is comparative: choose Bryce if a drier air profile matters, or investigate Roraima with a specific tolerance for wet ground, cloud and changing access conditions. The climate page can make that trade-off visible without pretending to select the route for you." },
        { type: "paragraph", text: "The difference also changes what a traveller should look for outside the climate page. In a dry June, current heat, sun exposure and water planning may deserve first attention. In a wet June, drainage, cloud, visibility, traction and the status of bridges or unpaved approaches may matter more. These are planning prompts, not predictions about either destination. They show how a small table of climate variables can lead to better questions when the reader does not mistake it for a complete route guide." },
        { type: "paragraph", text: "It is tempting to treat the lower score as a verdict. A better reading is that the two months fit different preferences. Bryce's 90 is supported by a much drier historical profile; Roraima's 75 still clears the critical gate but carries a very different precipitation context. If the trip has a fixed date, compare the current forecast and local notices rather than trying to optimise the historical score. If the date is flexible, use the annual profiles to decide which climate trade-off you would actually enjoy." },
        { type: "caveat", text: "These June values describe 1991–2025 historical conditions at one representative ERA5-Land grid cell per destination. Humidity is a modelled atmospheric statistic, not a personal comfort score; wet-day share is not total rainfall or a guarantee of rain at a chosen trail. Check current forecasts, local access, drainage, cloud and official route information. Wind is excluded from the recommendation score." },
        { type: "destinationLinks", heading: "Open the two June profiles", links: [
          { label: "Bryce Canyon", href: links.destination("en", "bryce-canyon"), detail: "Read the full annual climate profile." },
          { label: "Bryce Canyon in June", href: links.destinationMonth("en", "bryce-canyon", 6), detail: "Inspect the warm, drier June record." },
          { label: "Mount Roraima", href: links.destination("en", "roraima"), detail: "See the humid tropical annual pattern." },
          { label: "Mount Roraima in June", href: links.destinationMonth("en", "roraima", 6), detail: "Inspect the warm, wet June record." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read how precipitation and gates are defined." },
          { label: "Find a month", href: links.finder("en"), detail: "Compare other destinations and months." },
        ] },
      ],
    },
    de: {
      title: "Gleiche Temperatur, ganz andere Luft",
      description: "Bryce Canyon und Mount Roraima haben im Juni ein ähnliches Temperaturmittel, aber Feuchte und Regentage erzählen unterschiedliche Geschichten.",
      heroAlt: "Rote Hoodoos und ein Weg im Bryce Canyon unter klarem Himmel",
      category: "data-insight",
      readingMinutes: 7,
      blocks: [
        { type: "metricCallout", label: "Juni-Temperatur", value: "20,8 °C gegenüber 20,9 °C", detail: "Die Mittelwerte sind fast identisch. Die übrigen Klimasignale sind es nicht.", evidenceKey: "air-contrast" },
        { type: "comparisonTable", caption: "Die beiden Juniwerte genauer betrachtet", columns: ["Ziel", "Mittel", "Relative Feuchte", "Nasse Tage", "Score", "Ergebnis"], rows: [
          { label: "Bryce Canyon", values: ["20,8 °C", "20,0%", "11,05%", "90", "Zulässig"] },
          { label: "Mount Roraima", values: ["20,9 °C", "80,4%", "95,81%", "75", "Zulässig"] },
        ], evidenceKey: "air-contrast" },
        { type: "pullQuote", text: "Temperatur beantwortet eine Frage. Luft und Regen bestimmen, welche Art von Juni es ist." },
        { type: "heading", level: 2, text: "Warum ähnliche Wärme anders gelesen werden muss" },
        { type: "paragraph", text: "Bryce Canyon und Mount Roraima bilden ein aufschlussreiches Paar, weil sich ihre mittleren Wanderstundentemperaturen im Juni nur um 0,1 °C unterscheiden. Wäre das Mittel die ganze Geschichte, wären die Datensätze austauschbar. Die relative Feuchte liegt jedoch 60,4 Prozentpunkte auseinander; beim Anteil nasser Tage beträgt der Unterschied 84,76 Punkte. Das ausgewählte Bryce-Modell ist warm und vergleichsweise trocken, das von Roraima warm und anhaltend feucht. Der öffentliche Score bildet dieses breitere Muster ab, ist aber weder ein Versprechen für jedes persönliche Empfinden noch dafür, wie schnell eine Route nach Regen abtrocknet." },
        { type: "paragraph", text: "Beide Monate bleiben zulässig, weil Niederschlag bewertet wird, aber im veröffentlichten Tor keine kritische Ausschlusskomponente ist. Diese Unterscheidung ist wichtig. Zulässig bedeutet, dass die kritischen Regeln erfüllt sind; ein feuchter, nasser Monat ist dadurch nicht dasselbe wie ein trockener. Die praktische Folgerung ist ein Vergleich: Wer trockenere Luft bevorzugt, findet in Bryce ein anderes Profil; wer Roraima plant, sollte nassen Boden, Wolken und wechselnde Zugänge ausdrücklich einkalkulieren. Die Klimaseite macht den Unterschied sichtbar, ohne die konkrete Route vorzugeben." },
        { type: "paragraph", text: "Der Unterschied verändert auch, welche Informationen außerhalb der Klimaseite zuerst geprüft werden sollten. In einem trockenen Juni stehen aktuelle Hitze, Sonne und Wasserversorgung oft vorn. In einem nassen Juni können Entwässerung, Wolken, Sicht, Trittsicherheit und der Zustand von Brücken oder unbefestigten Zufahrten wichtiger sein. Das sind Planungsfragen, keine Vorhersagen für eines der Ziele. Die Tabelle ist dann wertvoll, wenn sie bessere Fragen auslöst und nicht als vollständiger Wegführer missverstanden wird." },
        { type: "paragraph", text: "Der niedrigere Score wirkt schnell wie ein Urteil. Sinnvoller ist eine Lesart als unterschiedliche Präferenz. Die 90 für Bryce gehen mit einem deutlich trockeneren historischen Profil einher; Roraimas 75 passiert trotzdem das kritische Tor, bringt aber einen anderen Niederschlagskontext. Bei festem Reisetermin sind aktuelle Vorhersage und lokale Meldungen wichtiger als die Optimierung des historischen Scores. Bei flexiblem Termin helfen die Jahresprofile dabei, die Klimawahl zu treffen, die man tatsächlich genießen möchte." },
        { type: "caveat", text: "Die Juniwerte beschreiben historische Bedingungen von 1991–2025 an jeweils einer repräsentativen ERA5-Land-Gitterzelle. Feuchte ist eine modellierte atmosphärische Kennzahl, kein persönlicher Komfortscore; der Anteil nasser Tage ist weder die Niederschlagsmenge noch eine Garantie für Regen am gewählten Weg. Aktuelle Vorhersage, Zugang, Entwässerung, Wolken und offizielle Hinweise prüfen. Wind ist aus dem Empfehlungsscore ausgeschlossen." },
        { type: "destinationLinks", heading: "Die beiden Juni-Profile öffnen", links: [
          { label: "Bryce Canyon", href: links.destination("de", "bryce-canyon"), detail: "Das vollständige Jahresprofil lesen." },
          { label: "Bryce Canyon im Juni", href: links.destinationMonth("de", "bryce-canyon", 6), detail: "Das warme, trockenere Juni-Profil prüfen." },
          { label: "Mount Roraima", href: links.destination("de", "roraima"), detail: "Das feuchte tropische Jahresmuster ansehen." },
          { label: "Mount Roraima im Juni", href: links.destinationMonth("de", "roraima", 6), detail: "Das warme, nasse Juni-Profil prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Definitionen von Niederschlag und Toren nachlesen." },
          { label: "Monat finden", href: links.finder("de"), detail: "Weitere Ziele und Monate vergleichen." },
        ] },
      ],
    },
  },
};
