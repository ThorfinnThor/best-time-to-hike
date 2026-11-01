import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-11-01";
const sources = [
  "public/data/hiking/destinations/pe/salkantay.json",
  "public/data/hiking/destinations/pe/ausangate.json",
  "data-config/blog/batch-11-evidence.json",
];

export const salkantayVsAusangateTrekkingMonthsPeru: BlogPost = {
  slug: "salkantay-vs-ausangate-trekking-months-peru",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "ausangate",
  evidence: [
    evidence("peru-paired-cells", "Monthly temperature, rain, snow and best-month records for two representative cells separated by 18.8 metres in model elevation.", sources, checkedAt),
    evidence("peru-season-tradeoffs", "Full annual calendars and May–September comparisons of wet-day frequency, precipitation, temperature percentiles and modelled snow days.", sources, checkedAt),
    evidence("peru-scope-definitions", "Metric definitions and publication holds limiting the comparison to the two named regional cells.", [
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      "public/data/hiking/destinations/pe/colca-canyon.json",
      "public/data/hiking/destinations/pe/huaraz-cordillera-blanca.json",
      "public/data/hiking/destinations/pe/huayhuash.json",
      ...sources,
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Salkantay vs Ausangate: when to trek in Peru",
      description: "June or July? Compare Salkantay and Ausangate with 1991–2025 rainfall, hiking-hour temperature and snow signals at two similar model elevations.",
      heroAlt: "Sibinacocha lake below glaciated mountains in the Ausangate region, with a seated guide in the foreground",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "metricCallout", label: "Difference in model elevation", value: "18.8 m", detail: "The Salkantay and Ausangate cells lie at 4,015 and 4,033.8 metres, yet their January snow-day signals are 0.28% and 37.88%.", evidenceKey: "peru-paired-cells" },
        { type: "paragraph", text: "June and July provide the clearest shared starting point for deciding when to trek Salkantay or Ausangate in our public 1991–2025 dataset. Both months appear in the best-month lists for both destinations. The reason is a large reduction in precipitation rather than warmer temperatures. Salkantay's selected cell actually averages slightly cooler conditions in July than January. Ausangate follows the same direction, but carries a stronger snow signal. Because the two model elevations are almost identical, this is a useful comparison of two regional records without the large height difference that complicates many mountain comparisons. It still cannot rank two complete trekking itineraries: both routes contain other elevations and exposures. The immediate planning question is which month offers a tolerable combination of rain frequency, cool walking hours and the published snow signal." },
        { type: "comparisonTable", caption: "January and July reveal similar temperatures but different snow signals", columns: ["Cell and month", "Hiking-hour mean", "Wet days", "Monthly precipitation", "Modelled snow days"], rows: [
          { label: "Salkantay · January", values: ["9.2 °C", "99.08%", "255.3 mm", "0.28%"] },
          { label: "Ausangate · January", values: ["8.6 °C", "97.79%", "273.6 mm", "37.88%"] },
          { label: "Salkantay · July", values: ["8.3 °C", "33.64%", "36.4 mm", "1.84%"] },
          { label: "Ausangate · July", values: ["7.9 °C", "30.69%", "34.3 mm", "13.64%"] },
        ], evidenceKey: "peru-paired-cells" },
        { type: "heading", level: 2, text: "June and July are less wet, rather than reliably rain-free" },
        { type: "paragraph", text: "Salkantay falls from 255.3 millimetres of mean monthly precipitation in January to 35.3 in June and 36.4 in July. Ausangate drops from 273.6 millimetres to 35.7 and 34.3. Rain frequency tells a related but distinct story. July has the lowest wet-day probability in each annual record, at 33.64 percent for Salkantay and 30.69 percent for Ausangate. June is slightly more frequent at 37.62 and 34.48 percent. Salkantay therefore has fewer wet days in July even though its monthly precipitation total is marginally higher than June. A wet day means at least one millimetre of total precipitation during the full local day. It does not require continuous rain during the walk. Around a third of historical days still meet that definition in July, so the phrase dry season should not be read as an uninterrupted sequence of dry trekking days." },
        { type: "monthStrip", caption: "The different edges of the shared trekking window", months: [
          { month: 5, label: "May", note: "Salkantay best-month list · about 56–58% wet days at both cells", href: links.destinationMonth("en", "salkantay", 5) },
          { month: 6, label: "June", note: "Both best-month lists · about 35–36 mm precipitation", href: links.destinationMonth("en", "ausangate", 6) },
          { month: 7, label: "July", note: "Both best-month lists · lowest wet-day frequency", href: links.destinationMonth("en", "salkantay", 7) },
          { month: 8, label: "August", note: "Ausangate best-month list · wet days rise at both cells", href: links.destinationMonth("en", "ausangate", 8) },
        ], evidenceKey: "peru-season-tradeoffs" },
        { type: "caveat", text: "Temperature here means sampled local hiking hours between 08:00 and 18:00, limited to daylight. Percentiles describe those sampled temperatures, not overnight minima. A modelled snow day occurs when snow cover reaches ten percent or physical snow depth reaches two centimetres at any time during the local day. Its frequency does not measure snow depth on a pass or the fraction of a trail covered." },
        { type: "heading", level: 2, text: "The quieter rain season still brings cold walking hours" },
        { type: "timeline", caption: "Three decisions beyond the headline dry season", points: [
          { label: "May", value: "A wetter transition with a smaller Ausangate snow signal", detail: "Wet-day probabilities are 57.88% at Salkantay and 55.67% at Ausangate. Ausangate's snow-day signal is 9.49%, compared with 13.64% in July." },
          { label: "July", value: "The least-wet calendar is also cool", detail: "Salkantay's hiking-hour temperature percentiles span 4.2–11.7 °C and Ausangate's 3.9–11.2 °C. These ranges do not cover camping temperatures." },
          { label: "September", value: "Rain returns before much extra warmth appears", detail: "Wet-day probability climbs to 85.33% at Salkantay and 78.57% at Ausangate, while their means reach only 9.2 and 9.0 °C." },
        ], evidenceKey: "peru-season-tradeoffs" },
        { type: "paragraph", text: "For a traveller able to choose between June and July, the difference is modest in rain but meaningful enough to inspect. Ausangate has a 9.71 percent snow-day signal in June versus 13.64 percent in July, while Salkantay rises from 0.86 to 1.84 percent. July is not the lower-snow choice simply because it has the fewest wet days. August remains on Ausangate's best-month list, but wet days rise to 47.10 percent there and 53.64 percent at Salkantay. Their monthly precipitation totals increase to 47.4 and 54.5 millimetres. Choose June as a starting comparison if the lower published snow frequency matters most, or July if the lowest wet-day frequency is the priority. Then check the actual passes, sleeping elevations and current conditions. Neither monthly average can establish the equipment or experience required on a particular departure." },
        { type: "heading", level: 2, text: "Why this is not a best-month claim for all of Peru" },
        { type: "paragraph", text: "Salkantay and Ausangate both pass the project's critical climate rules in all twelve months, but their best-month lists remain different and their wettest months remain very wet in the model. Eligibility is not a guarantee of comfortable weather, accessible passes or low risk. Nor should the two records be extended to other Peruvian trekking regions. The public Colca Canyon, Huaraz–Cordillera Blanca and Huayhuash records currently withhold scores and best months while precipitation validation is pending. They can be consulted as review pages, but cannot support another recommended season in this article. This distinction keeps a useful local comparison from becoming an unsupported national calendar. For the two included cells, the practical shared conclusion is June–July, with separate rain and snow trade-offs rather than a single universal winner." },
        { type: "destinationLinks", heading: "Inspect the comparison and its limits", links: [
          { label: "Salkantay", href: links.destination("en", "salkantay"), detail: "Compare the May–July best-month group and the full rain calendar." },
          { label: "Ausangate", href: links.destination("en", "ausangate"), detail: "Read the stronger snow signal alongside June–August timing." },
          { label: "Huaraz and Cordillera Blanca", href: links.destination("en", "huaraz-cordillera-blanca"), detail: "Review only: precipitation validation is pending, with no published best months." },
          { label: "Colca Canyon", href: links.destination("en", "colca-canyon"), detail: "Review only: no season recommendation while precipitation is under validation." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read the representative-cell limits and metric definitions." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Explore eligible destinations by month and preferences." },
        ] },
      ],
    },
    de: {
      title: "Salkantay oder Ausangate: beste Trekkingzeit",
      description: "Juni oder Juli? Salkantay und Ausangate mit Regen, Temperaturen im Wanderfenster und Schneesignalen von 1991–2025 vergleichen.",
      heroAlt: "Sibinacocha-See unter vergletscherten Bergen der Ausangate-Region mit einem sitzenden Guide im Vordergrund",
      category: "planning",
      readingMinutes: 8,
      blocks: [
        { type: "metricCallout", label: "Unterschied der Modellhöhen", value: "18,8 m", detail: "Die Salkantay- und Ausangate-Zellen liegen auf 4.015 und 4.033,8 Metern, ihre Januarsignale modellierter Schneetage aber bei 0,28% und 37,88%.", evidenceKey: "peru-paired-cells" },
        { type: "paragraph", text: "Juni und Juli liefern in unserem öffentlichen Datensatz von 1991 bis 2025 den klarsten gemeinsamen Ausgangspunkt für die Frage, wann man Salkantay oder Ausangate trekken sollte. Beide Monate erscheinen bei beiden Zielen unter den besten Monaten. Der Grund ist ein starker Rückgang des Niederschlags und keine zusätzliche Wärme. Salkantays ausgewählte Zelle ist im Juli sogar etwas kühler als im Januar. Ausangate folgt derselben Richtung, trägt aber ein stärkeres Schneesignal. Weil die Modellhöhen fast identisch sind, lassen sich zwei regionale Datensätze ohne den großen Höhenunterschied vieler Gebirgsvergleiche betrachten. Zwei vollständige Trekkingrouten lassen sich damit dennoch nicht bewerten: Beide enthalten andere Höhen und Expositionen. Die erste Planungsfrage lautet, welcher Monat eine akzeptable Kombination aus Regenhäufigkeit, kühlen Wanderstunden und dem veröffentlichten Schneesignal bietet." },
        { type: "comparisonTable", caption: "Januar und Juli zeigen ähnliche Temperaturen, aber unterschiedliche Schneesignale", columns: ["Zelle und Monat", "Mittel im Wanderfenster", "Nasse Tage", "Monatsniederschlag", "Modellierte Schneetage"], rows: [
          { label: "Salkantay · Januar", values: ["9,2 °C", "99,08%", "255,3 mm", "0,28%"] },
          { label: "Ausangate · Januar", values: ["8,6 °C", "97,79%", "273,6 mm", "37,88%"] },
          { label: "Salkantay · Juli", values: ["8,3 °C", "33,64%", "36,4 mm", "1,84%"] },
          { label: "Ausangate · Juli", values: ["7,9 °C", "30,69%", "34,3 mm", "13,64%"] },
        ], evidenceKey: "peru-paired-cells" },
        { type: "heading", level: 2, text: "Juni und Juli sind weniger nass, aber nicht zuverlässig regenfrei" },
        { type: "paragraph", text: "Salkantay fällt von 255,3 Millimetern mittlerem Monatsniederschlag im Januar auf 35,3 im Juni und 36,4 im Juli. Ausangate sinkt von 273,6 Millimetern auf 35,7 und 34,3. Die Regenhäufigkeit erzählt eine verwandte, aber eigenständige Geschichte. Der Juli hat in beiden Jahreskalendern die niedrigste Wahrscheinlichkeit nasser Tage: 33,64 Prozent bei Salkantay und 30,69 Prozent bei Ausangate. Der Juni liegt mit 37,62 und 34,48 Prozent etwas höher. Salkantay besitzt im Juli also weniger nasse Tage, obwohl seine Monatssumme geringfügig über dem Juniwert liegt. Ein nasser Tag bedeutet mindestens einen Millimeter Gesamtniederschlag während des vollständigen lokalen Tages. Dafür muss es nicht während der gesamten Wanderung regnen. Ungefähr ein Drittel der historischen Julitage erfüllt diese Definition weiterhin. Die Bezeichnung Trockenzeit darf deshalb nicht als ununterbrochene Folge trockener Trekkingtage verstanden werden." },
        { type: "monthStrip", caption: "Die unterschiedlichen Ränder des gemeinsamen Trekkingfensters", months: [
          { month: 5, label: "Mai", note: "Salkantays Bestmonate · etwa 56–58% nasse Tage an beiden Zellen", href: links.destinationMonth("de", "salkantay", 5) },
          { month: 6, label: "Juni", note: "Beide Bestmonatslisten · etwa 35–36 mm Niederschlag", href: links.destinationMonth("de", "ausangate", 6) },
          { month: 7, label: "Juli", note: "Beide Bestmonatslisten · niedrigste Häufigkeit nasser Tage", href: links.destinationMonth("de", "salkantay", 7) },
          { month: 8, label: "August", note: "Ausangates Bestmonate · nasse Tage nehmen an beiden Zellen zu", href: links.destinationMonth("de", "ausangate", 8) },
        ], evidenceKey: "peru-season-tradeoffs" },
        { type: "caveat", text: "Temperatur bezeichnet hier erfasste lokale Wanderstunden zwischen 08:00 und 18:00 Uhr, begrenzt auf Tageslicht. Perzentile beschreiben diese Temperaturen und keine nächtlichen Minima. Ein modellierter Schneetag liegt vor, wenn irgendwann am lokalen Tag zehn Prozent Schneebedeckung oder zwei Zentimeter physische Schneehöhe erreicht werden. Seine Häufigkeit misst weder die Schneehöhe am Pass noch den verschneiten Anteil eines Weges." },
        { type: "heading", level: 2, text: "Die ruhigere Regensaison bringt weiterhin kalte Wanderstunden" },
        { type: "timeline", caption: "Drei Entscheidungen jenseits des Schlagworts Trockenzeit", points: [
          { label: "Mai", value: "Ein nasserer Übergang mit kleinerem Ausangate-Schneesignal", detail: "Salkantay verzeichnet 57,88% und Ausangate 55,67% nasse Tage. Ausangates Schneetagesignal beträgt 9,49%, verglichen mit 13,64% im Juli." },
          { label: "Juli", value: "Der am wenigsten nasse Kalender bleibt kühl", detail: "Salkantays Temperaturperzentile im Wanderfenster reichen von 4,2 bis 11,7 °C, Ausangates von 3,9 bis 11,2 °C. Diese Spannen beschreiben keine Zeltnächte." },
          { label: "September", value: "Regen kehrt vor spürbar mehr Wärme zurück", detail: "Die Wahrscheinlichkeit nasser Tage steigt auf 85,33% bei Salkantay und 78,57% bei Ausangate, während die Mittel nur 9,2 und 9,0 °C erreichen." },
        ], evidenceKey: "peru-season-tradeoffs" },
        { type: "paragraph", text: "Wer zwischen Juni und Juli wählen kann, findet beim Regen einen kleinen, aber prüfenswerten Unterschied. Ausangate besitzt im Juni ein Schneetagesignal von 9,71 Prozent gegenüber 13,64 Prozent im Juli. Salkantay steigt von 0,86 auf 1,84 Prozent. Der Juli ist also nicht automatisch die schneeärmere Wahl, nur weil er die wenigsten nassen Tage besitzt. Der August bleibt in Ausangates Bestmonatsliste, doch die nassen Tage steigen dort auf 47,10 Prozent und bei Salkantay auf 53,64 Prozent. Die Monatssummen wachsen auf 47,4 und 54,5 Millimeter. Der Juni eignet sich als erster Vergleich, wenn die geringere veröffentlichte Schneehäufigkeit besonders wichtig ist, der Juli bei Priorität für möglichst wenige nasse Tage. Danach die tatsächlichen Pässe, Schlafhöhen und aktuellen Bedingungen prüfen. Kein Monatsmittel bestimmt die nötige Ausrüstung oder Erfahrung für einen konkreten Reisetermin." },
        { type: "heading", level: 2, text: "Warum daraus keine beste Wanderzeit für ganz Peru folgt" },
        { type: "paragraph", text: "Salkantay und Ausangate passieren die kritischen Klimaregeln des Projekts in allen zwölf Monaten. Ihre Bestmonatslisten bleiben trotzdem unterschiedlich, und ihre nassesten Monate bleiben im Modell ausgesprochen nass. Zulässigkeit garantiert weder angenehmes Wetter noch zugängliche Pässe oder geringes Risiko. Die beiden Datensätze sollten auch nicht auf andere peruanische Trekkingregionen übertragen werden. Die öffentlichen Datensätze von Colca Canyon, Huaraz–Cordillera Blanca und Huayhuash halten Scores und Bestmonate derzeit zurück, solange die Niederschlagsvalidierung läuft. Sie können als Prüfseiten gelesen werden, tragen aber keine weitere Saisonempfehlung dieses Artikels. Diese Grenze verhindert, dass ein nützlicher lokaler Vergleich zu einem unbelegten nationalen Kalender wird. Für die beiden einbezogenen Zellen bleibt Juni bis Juli der praktische gemeinsame Schluss, mit getrennten Abwägungen für Regen und Schnee statt einem universellen Sieger." },
        { type: "destinationLinks", heading: "Den Vergleich und seine Grenzen prüfen", links: [
          { label: "Salkantay", href: links.destination("de", "salkantay"), detail: "Die Bestmonate Mai bis Juli mit dem vollständigen Regenkalender vergleichen." },
          { label: "Ausangate", href: links.destination("de", "ausangate"), detail: "Das stärkere Schneesignal neben dem Fenster Juni bis August lesen." },
          { label: "Huaraz und Cordillera Blanca", href: links.destination("de", "huaraz-cordillera-blanca"), detail: "Nur zur Prüfung: Niederschlagsvalidierung läuft, keine veröffentlichten Bestmonate." },
          { label: "Colca Canyon", href: links.destination("de", "colca-canyon"), detail: "Nur zur Prüfung: keine Saisonempfehlung während der Niederschlagsvalidierung." },
          { label: "Methodik", href: links.methodology("de"), detail: "Grenzen repräsentativer Zellen und Definitionen der Kennzahlen lesen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Zulässige Ziele nach Monat und Vorlieben erkunden." },
        ] },
      ],
    },
  },
};
