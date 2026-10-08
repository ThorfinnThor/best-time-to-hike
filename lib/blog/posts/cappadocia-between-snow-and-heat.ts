import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-08";

export const cappadociaBetweenSnowAndHeat: BlogPost = {
  slug: "cappadocia-between-snow-and-heat",
  status: "approved",
  publishedAt: "2026-10-08",
  modifiedAt: checkedAt,
  heroImageSlug: "cappadocia",
  evidence: [
    evidence("cappadocia-seasonal-gates", "Cappadocia monthly records showing winter snow and midsummer heat-stress gates with eligible shoulders between them.", [
      "public/data/hiking/destinations/tr/cappadocia.json",
      "data-config/blog/batch-3-evidence.json",
    ], checkedAt),
    evidence("cappadocia-gate-method", "The exclusive critical-component threshold, component set, precipitation treatment and zero-weight wind rule.", [
      "data-config/scoring/weights.json",
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-3-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Cappadocia: spring or autumn?",
      description: "Cappadocia's historical record moves from a winter snow gate to a midsummer heat gate, leaving two different shoulder-season arcs.",
      heroAlt: "Fairy chimneys and layered rock formations in Cappadocia",
      category: "seasonal",
      readingMinutes: 7,
      blocks: [
        { type: "timeline", caption: "One destination, two different withheld periods", points: [
          { label: "February", value: "49 · withheld", detail: "Snow component 8 and 66.43% snow days." },
          { label: "March–June", value: "Eligible shoulder", detail: "The record clears the critical gate as snow falls and heat stress remains controlled." },
          { label: "July–August", value: "49 · withheld", detail: "Heat-stress components 18 and 15 despite very little rain." },
          { label: "September–November", value: "Eligible shoulder", detail: "The heat gate recedes before late-season snow becomes more frequent." },
          { label: "December", value: "49 · withheld", detail: "Snow component 20 is not above the exclusive threshold." },
        ], evidenceKey: "cappadocia-seasonal-gates" },
        { type: "paragraph", text: "Cappadocia is a useful case because its withheld months fail for different reasons. Winter is shaped by modelled snow frequency at a 1,351.1-metre representative cell. July and August are very dry, yet the heat-stress component falls below the same critical gate. The eligible months between those periods are therefore not one generic season but two shoulders created by different constraints. That distinction changes how the calendar should be read. March is an emergence from winter, carrying cold tails and frequent modelled snow days even after it clears the gate. September is an escape from midsummer heat, still warm but with far fewer hot days than August. October becomes the highest-scoring month in the annual record, but even that is a model result rather than a universal instruction. The value of the profile is not that it names a single winner. It shows which physical signal limits each part of the year, so a traveller can choose the shoulder whose remaining compromise is acceptable." },
        { type: "comparisonTable", caption: "The mechanism changes over the year", columns: ["Window", "Model reading", "Why it matters"], rows: [
          { label: "February", values: ["2.1 °C · 66.43% snow days", "Snow component 8" ] },
          { label: "June", values: ["21.6 °C · 19.52% hot days", "Heat-stress component 74" ] },
          { label: "July–August", values: ["25.1–25.2 °C · 58.99–63.78% hot days", "Heat-stress components 18 and 15" ] },
          { label: "October", values: ["14.9 °C · 0.65% snow days", "Score 91; eligible" ] },
        ], evidenceKey: "cappadocia-seasonal-gates" },
        { type: "heading", level: 2, text: "The first shoulder leaves winter gradually" },
        { type: "paragraph", text: "February is not withheld because the model sees a vague cold feeling. Its selected cell has a 2.1 °C hiking-window mean, a -6.8 °C lower percentile and snow on 66.43 percent of valid days; the snow component is 8. The published rule requires every critical component to be strictly greater than 20, so winter is held back by a specific threshold rather than by editorial wording. March rises to a score of 67 and clears the gate. It is still a cool, wet shoulder, with a 6.9 °C mean, a -0.5 °C lower percentile, wet days on 37.33 percent of valid dates and a 33.73 percent snow-day share. Eligibility does not erase those signals. It only says that no critical component remains at or below the withholding floor. By May, the mean reaches 17.1 °C and the snow-day share falls to 0.09 percent. June is warmer again at 21.6 °C, with a heat-stress component of 74. The first shoulder is therefore a progression, not a switch from winter to guaranteed summer." },
        { type: "metricCallout", label: "The summer gate", value: "58.99–63.78% hot days", detail: "July and August are withheld for heat stress even though their historical wet-day shares are only 3.50% and 3.78%.", evidenceKey: "cappadocia-seasonal-gates" },
        { type: "heading", level: 2, text: "Dry is not the same as eligible" },
        { type: "monthStrip", caption: "Read the two usable arcs as different choices", months: [
          { month: 3, label: "March", note: "Score 67 · 33.73% snow days", href: links.destinationMonth("en", "cappadocia", 3) },
          { month: 5, label: "May", note: "Score 88 · 17.1 °C", href: links.destinationMonth("en", "cappadocia", 5) },
          { month: 9, label: "September", note: "Score 89 · 20.8 °C", href: links.destinationMonth("en", "cappadocia", 9) },
          { month: 10, label: "October", note: "Score 91 · 14.9 °C", href: links.destinationMonth("en", "cappadocia", 10) },
        ], evidenceKey: "cappadocia-seasonal-gates" },
        { type: "paragraph", text: "The dry July and August records show why precipitation alone cannot answer the hiking question. Their monthly rainfall means are just 6.0 and 5.1 mm and their wet-day shares only 3.50 and 3.78 percent. Read alone, those figures might make midsummer look like the obvious choice. The temperature distribution changes the answer. July has a 25.1 °C hiking-window mean, a 31.3 °C upper percentile, hot days on 58.99 percent of valid dates and severe-hot days on 16.96 percent. August is slightly warmer, with hot days on 63.78 percent and severe-hot days on 18.06 percent. Their heat-stress components fall to 18 and 15, below the exclusive gate. September restores eligibility as the hot-day share drops to 18.19 percent; October then combines a 14.9 °C mean with a 0.65 percent snow-day share and reaches 91. The second shoulder is not simply the first one in reverse. It approaches winter with different light, snow and temperature signals, giving the reader a genuinely different planning choice." },
        { type: "pullQuote", text: "Cappadocia does not have one hidden best season; it has two different ways for a month to fit or fail." },
        { type: "caveat", text: "The snow and heat gates are project-defined rules applied to 1991–2025 historical values at one representative ERA5-Land cell. They are not trail-closure notices, medical advice, forecasts or proof of snow on a particular route. Precipitation is scored but is not a critical gate, and grid wind has zero score weight." },
        { type: "destinationLinks", heading: "Follow Cappadocia's seasonal arc", links: [
          { label: "Cappadocia", href: links.destination("en", "cappadocia"), detail: "Open the complete annual profile." },
          { label: "Cappadocia in March", href: links.destinationMonth("en", "cappadocia", 3), detail: "Inspect the first eligible shoulder." },
          { label: "Cappadocia in September", href: links.destinationMonth("en", "cappadocia", 9), detail: "See eligibility return after the summer heat gate." },
          { label: "Cappadocia in October", href: links.destinationMonth("en", "cappadocia", 10), detail: "Inspect the strongest eligible month." },
          { label: "Methodology", href: links.methodology("en"), detail: "Read the critical-component rules." },
          { label: "Find a month", href: links.finder("en"), detail: "Compare other destinations." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit für Kappadokien: Frühling oder Herbst?",
      description: "Kappadokiens historischer Datensatz wechselt vom winterlichen Schneetor zum sommerlichen Hitzetor und bildet zwei unterschiedliche Übergangszeiten.",
      heroAlt: "Feenkamine und geschichtete Felsformationen in Kappadokien",
      category: "seasonal",
      readingMinutes: 7,
      blocks: [
        { type: "timeline", caption: "Ein Ziel, zwei verschiedene Sperrzeiten", points: [
          { label: "Februar", value: "49 · zurückgehalten", detail: "Schneekomponente 8 und 66,43% Schneetage." },
          { label: "März–Juni", value: "Zulässige Übergangszeit", detail: "Der Datensatz überschreitet das kritische Tor, während Schnee ab- und Hitzestress noch nicht überhandnimmt." },
          { label: "Juli–August", value: "49 · zurückgehalten", detail: "Hitzestress-Komponenten 18 und 15 trotz sehr wenig Regen." },
          { label: "September–November", value: "Zulässige Übergangszeit", detail: "Das Hitzetor lässt nach, bevor später mehr Schneetage auftreten." },
          { label: "Dezember", value: "49 · zurückgehalten", detail: "Die Schneekomponente 20 liegt nicht über der exklusiven Schwelle." },
        ], evidenceKey: "cappadocia-seasonal-gates" },
        { type: "paragraph", text: "Kappadokiens Kalender besitzt keine einzige, sauber abgegrenzte Wandersaison. Die zurückgehaltenen Monate scheitern an verschiedenen Signalen. Im Winter prägt modellierte Schneehäufigkeit die ausgewählte ERA5-Land-Zelle auf 1.351,1 Metern. Im Juli und August ist Regen selten, doch die Hitzestress-Komponente fällt unter das kritische Tor. Dazwischen entstehen zwei Übergänge, die nicht austauschbar sind. Der März kommt aus dem Winter und behält kalte Ränder sowie häufige Schneetage. Der September kommt aus dem Hochsommer und bleibt warm, während die Häufigkeit heißer Tage deutlich sinkt. Der Oktober erzielt zwar den höchsten Jahresscore, ist aber kein allgemeiner Befehl für jede Route oder Person. Das Jahresprofil wird gerade dadurch nützlich, dass es die begrenzenden Mechanismen sichtbar macht. Man wählt nicht bloß einen grünen Monat, sondern entscheidet, ob die verbleibende Kälte, die verbleibende Wärme oder die zunehmende winterliche Unsicherheit besser zur geplanten Reise passt." },
        { type: "comparisonTable", caption: "Der Mechanismus ändert sich über das Jahr", columns: ["Zeitraum", "Modelllesart", "Bedeutung"], rows: [
          { label: "Februar", values: ["2,1 °C · 66,43% Schneetage", "Schneekomponente 8" ] },
          { label: "Juni", values: ["21,6 °C · 19,52% heiße Tage", "Hitzestress-Komponente 74" ] },
          { label: "Juli–August", values: ["25,1–25,2 °C · 58,99–63,78% heiße Tage", "Hitzestress-Komponenten 18 und 15" ] },
          { label: "Oktober", values: ["14,9 °C · 0,65% Schneetage", "Score 91; zulässig" ] },
        ], evidenceKey: "cappadocia-seasonal-gates" },
        { type: "heading", level: 2, text: "Der erste Übergang verlässt den Winter schrittweise" },
        { type: "paragraph", text: "Der Februar wird nicht wegen einer unbestimmten Winterwirkung zurückgehalten. An der ausgewählten Zelle beträgt das Mittel im Wanderfenster 2,1 °C, das untere Temperaturperzentil -6,8 °C und der Anteil modellierter Schneetage 66,43 Prozent. Die Schneekomponente fällt auf 8. Nach der veröffentlichten Regel müssen sämtliche kritischen Komponenten strikt über 20 liegen. Im März steigt die Schneekomponente auf 42, und der Datensatz erreicht mit Score 67 wieder die Zulässigkeit. Mild ist dieser Übergang deshalb noch nicht: Das Mittel liegt bei 6,9 °C, das untere Perzentil bei -0,5 °C, 37,33 Prozent der Tage sind nass und 33,73 Prozent Schneetage. Erst im Mai erreicht das Wanderfenster 17,1 °C, während modellierte Schneetage auf 0,09 Prozent sinken. Der Juni wird mit 21,6 °C wärmer und behält eine Hitzestress-Komponente von 74. Der Frühlingsbogen ist somit eine schrittweise Verschiebung der Risiken und kein plötzlicher Wechsel zu garantiert einfachen Bedingungen." },
        { type: "metricCallout", label: "Das Sommer-Tor", value: "58,99–63,78% heiße Tage", detail: "Juli und August werden wegen Hitzestress zurückgehalten, obwohl ihre historischen Nass-Tage nur 3,50 beziehungsweise 3,78 Prozent erreichen.", evidenceKey: "cappadocia-seasonal-gates" },
        { type: "heading", level: 2, text: "Trocken bedeutet nicht automatisch zulässig" },
        { type: "monthStrip", caption: "Die beiden nutzbaren Bögen als unterschiedliche Wahl lesen", months: [
          { month: 3, label: "März", note: "Score 67 · 33,73% Schneetage", href: links.destinationMonth("de", "cappadocia", 3) },
          { month: 5, label: "Mai", note: "Score 88 · 17,1 °C", href: links.destinationMonth("de", "cappadocia", 5) },
          { month: 9, label: "September", note: "Score 89 · 20,8 °C", href: links.destinationMonth("de", "cappadocia", 9) },
          { month: 10, label: "Oktober", note: "Score 91 · 14,9 °C", href: links.destinationMonth("de", "cappadocia", 10) },
        ], evidenceKey: "cappadocia-seasonal-gates" },
        { type: "paragraph", text: "Wer nur auf Regen schaut, würde Juli und August leicht überschätzen. Im Monatsmittel fallen 6,0 beziehungsweise 5,1 mm, und nur 3,50 beziehungsweise 3,78 Prozent der gültigen Tage überschreiten die Nass-Tag-Schwelle. Die Temperaturverteilung liefert jedoch die fehlende Hälfte. Im Juli liegt das Wanderfenster-Mittel bei 25,1 °C, das obere Perzentil bei 31,3 °C und der Anteil heißer Tage bei 58,99 Prozent. Im August steigen diese Werte auf 25,2 °C, 31,4 °C und 63,78 Prozent. Sehr heiße Tage machen 16,96 beziehungsweise 18,06 Prozent aus. Deshalb sinken die Hitzestress-Komponenten auf 18 und 15, beide unter die exklusive Schwelle. Im September fällt der Anteil heißer Tage auf 18,19 Prozent und der Monat wird wieder zulässig. Der Oktober verbindet 14,9 °C mit nur 0,65 Prozent Schneetagen und erreicht 91 Punkte. Dieser Herbstbogen ist nicht einfach der Frühling rückwärts; Tageslicht, Schnee und Temperatur entwickeln sich in einer anderen Kombination." },
        { type: "pullQuote", text: "Kappadokien hat keine versteckte beste Saison, sondern zwei verschiedene Wege, wie ein Monat passen oder scheitern kann." },
        { type: "caveat", text: "Schnee- und Hitzetor sind projektdefinierte Regeln auf Basis historischer Werte von 1991–2025 an einer repräsentativen ERA5-Land-Zelle. Sie sind weder Wegsperrungen noch medizinische Hinweise, Vorhersagen oder Beweise für Schnee auf einer bestimmten Route. Niederschlag wird bewertet, ist aber kein kritisches Tor; Gitterwind hat Gewicht null." },
        { type: "destinationLinks", heading: "Kappadokiens Jahresbogen verfolgen", links: [
          { label: "Kappadokien", href: links.destination("de", "cappadocia"), detail: "Das vollständige Jahresprofil öffnen." },
          { label: "Kappadokien im März", href: links.destinationMonth("de", "cappadocia", 3), detail: "Den ersten zulässigen Übergang prüfen." },
          { label: "Kappadokien im September", href: links.destinationMonth("de", "cappadocia", 9), detail: "Die Rückkehr nach dem sommerlichen Hitzetor ansehen." },
          { label: "Kappadokien im Oktober", href: links.destinationMonth("de", "cappadocia", 10), detail: "Den stärksten zulässigen Monat prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Die Regeln der kritischen Komponenten lesen." },
          { label: "Monat finden", href: links.finder("de"), detail: "Weitere Ziele vergleichen." },
        ] },
      ],
    },
  },
};
