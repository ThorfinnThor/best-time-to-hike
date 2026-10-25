import type { BlogPost } from "@/lib/blog/content";
import { links } from "@/lib/i18n/links";
import { evidence } from "./shared";

const checkedAt = "2026-10-25";

export const bestTimeToHikeBanffJasperYohoKananaskis: BlogPost = {
  slug: "best-time-to-hike-banff-jasper-yoho-kananaskis",
  status: "approved",
  publishedAt: checkedAt,
  modifiedAt: checkedAt,
  heroImageSlug: "banff",
  evidence: [
    evidence("canadian-rockies-window", "Eligible calendars, best-month lists and representative elevations for Banff, Jasper, Yoho and Kananaskis.", [
      "public/data/hiking/destinations/ca/banff.json",
      "public/data/hiking/destinations/ca/jasper.json",
      "public/data/hiking/destinations/ca/yoho.json",
      "public/data/hiking/destinations/ca/kananaskis.json",
      "data-config/blog/batch-8-evidence.json",
    ], checkedAt),
    evidence("canadian-rockies-summer", "Selected June-to-October temperature, precipitation, snow-day and daylight records for the four Canadian Rockies cells.", [
      "public/data/hiking/destinations/ca/banff.json",
      "public/data/hiking/destinations/ca/jasper.json",
      "public/data/hiking/destinations/ca/yoho.json",
      "public/data/hiking/destinations/ca/kananaskis.json",
      "data-config/blog/batch-8-evidence.json",
    ], checkedAt),
    evidence("canadian-rockies-method", "Historical aggregation, representative-cell scope and the critical snow-component rule used to define the common climate window.", [
      "data-config/methodology/recommendation-eligibility-v1.json",
      "data-config/methodology/climate-aggregation-v1.json",
      "data-config/blog/batch-8-evidence.json",
    ], checkedAt),
  ],
  translations: {
    en: {
      title: "Best time to hike Banff, Jasper, Yoho and Kananaskis",
      description: "Compare four Canadian Rockies hiking regions using 1991–2025 temperature, rain, snow and daylight data, with a close look at June to September.",
      heroAlt: "Lake Louise below snow-streaked mountains in Banff National Park",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "monthStrip", caption: "The short shared climate window in the Canadian Rockies", months: [
          { month: 6, label: "June", note: "Only Banff passes · rain and lingering snow constrain the other cells", href: links.destinationMonth("en", "banff", 6) },
          { month: 7, label: "July", note: "All four pass · longest useful daylight · wetter than August", href: links.destinationMonth("en", "jasper", 7) },
          { month: 8, label: "August", note: "All four pass · highest score in every record", href: links.destinationMonth("en", "yoho", 8) },
          { month: 9, label: "September", note: "All four pass · lower rain but colder, snowier margins", href: links.destinationMonth("en", "kananaskis", 9) },
          { month: 10, label: "October", note: "All four fail · modelled snow days exceed 81%", href: links.destinationMonth("en", "banff", 10) },
        ], evidenceKey: "canadian-rockies-window" },
        { type: "paragraph", text: "The best time to hike Banff, Jasper, Yoho and Kananaskis converges on a narrow answer in the public 1991–2025 records. All four selected ERA5-Land cells clear the project's critical climate thresholds only in July, August and September. They are not equivalent points: Jasper is represented at 1,614.4 metres, Banff at 1,818.5, Yoho at 1,968.6 and Kananaskis at 2,160.7 metres. Even so, the month order is unusually consistent. August has the highest score in every record, July follows closely and September exchanges warmth and daylight for lower wet-day probabilities. The shared result is useful for choosing a planning season, but it does not determine whether a high pass, lake trail or scrambling route is snow-free." },
        { type: "heading", level: 2, text: "August is the most consistent month across the four records" },
        { type: "comparisonTable", caption: "August at four representative Canadian Rockies cells", columns: ["Region", "Temperature", "Wet days", "Monthly rain", "Snow days", "Score"], rows: [
          { label: "Banff", values: ["15.0 °C", "46.64%", "81.1 mm", "6.18%", "83"] },
          { label: "Jasper", values: ["13.9 °C", "52.44%", "95.6 mm", "4.88%", "81"] },
          { label: "Yoho", values: ["13.3 °C", "43.78%", "69.7 mm", "4.42%", "85"] },
          { label: "Kananaskis", values: ["13.0 °C", "48.94%", "97.6 mm", "5.53%", "81"] },
        ], evidenceKey: "canadian-rockies-summer" },
        { type: "paragraph", text: "August wins through balance rather than heat. Mean temperatures sit between 13.0 and 15.0 °C, mean daylight remains between 14.5 and 14.7 hours, and the modelled probability of a snow day falls below seven percent at every cell. Yoho is the driest August record by both monthly total and wet-day probability, at 69.7 mm and 43.78 percent. Banff follows at 81.1 mm, while Jasper and Kananaskis remain closer to 96 mm. Those totals still describe a month with regular precipitation, not a dry season. They also come from a single cell in each region. A storm track, exposed ridge or higher route can behave differently from the monthly mean even when the regional score is strong." },
        { type: "metricCallout", label: "June separates Banff from the other three", value: "1 of 4 cells passes", detail: "Banff remains eligible with a score of 62. Jasper, Yoho and Kananaskis are capped at 49 because their modelled snow-day probabilities remain above 50%.", evidenceKey: "canadian-rockies-summer" },
        { type: "paragraph", text: "June looks attractive on daylight alone: the records average 16.4 to 16.8 hours. It is also the wettest part of this five-month comparison. Monthly precipitation reaches 125.7 mm in Banff, 113.4 in Jasper, 113.9 in Yoho and 143.2 in Kananaskis, while wet-day probabilities range from 66.19 to 68.00 percent. The snow signal creates the decisive difference. Banff falls to 41.90 percent modelled snow days and narrowly clears the critical rule. Jasper remains at 54.57 percent, Kananaskis at 53.05 and Yoho at 63.52 percent. This does not turn Banff into a universal June recommendation. It says only that its selected cell crosses the project's climate threshold earlier than the other three." },
        { type: "heading", level: 2, text: "September is drier, but the season closes quickly" },
        { type: "timeline", caption: "How the four cells move from summer into winter", points: [
          { label: "July", value: "The shared window opens", detail: "Temperatures reach 13.7 to 15.7 °C, but wet-day probabilities still range from 51.43% to 63.41%." },
          { label: "August", value: "The cleanest overlap", detail: "Every cell reaches its highest score and modelled snow days fall below 7%." },
          { label: "September", value: "Lower rain, narrower margins", detail: "Wet-day probabilities fall to 37.24–47.52%, while mean temperatures drop to 7.7–9.3 °C and snow signals rise above 32%." },
          { label: "October", value: "The common window is closed", detail: "Mean temperatures hover around 0 °C and modelled snow days rise to 81.11–85.53%." },
        ], evidenceKey: "canadian-rockies-summer" },
        { type: "caveat", text: "These are 35-year averages for four selected model cells, not forecasts or trail-opening records. They do not resolve snow depth, wildfire smoke, lightning, river crossings, avalanche terrain, bear closures, high-pass exposure, road access or the elevation profile of a particular route. The wind field is coarse grid wind rather than gust information. Check Parks Canada, Alberta Parks and current local forecasts and alerts for the exact trip." },
        { type: "pullQuote", text: "In the Canadian Rockies, the historical overlap is three months wide, but the practical route window can be much narrower." },
        { type: "paragraph", text: "For a first trip that combines all four regions, August has the strongest common case in this dataset. July offers about ninety minutes more mean daylight and slightly warmer conditions, but it is wetter at every cell: Banff rises from 81.1 mm in August to 93.0 in July, Jasper from 95.6 to 118.1, Yoho from 69.7 to 87.3 and Kananaskis from 97.6 to 108.2 mm. September reverses the trade-off. It is drier by wet-day probability and monthly total at most cells, yet the snow signal climbs to 32.29–38.76 percent and temperatures fall below 10 °C. Choose August for the broadest historical balance, July for light and warmth, or September only when colder margins and early snow are acceptable. Then replace the regional average with current conditions for the exact route." },
        { type: "destinationLinks", heading: "Compare the four Canadian Rockies records", links: [
          { label: "Banff", href: links.destination("en", "banff"), detail: "Inspect the only record in this group that passes in June." },
          { label: "Jasper", href: links.destination("en", "jasper"), detail: "Compare the wetter northern cell and its three-month window." },
          { label: "Yoho", href: links.destination("en", "yoho"), detail: "Open the highest August score in this comparison." },
          { label: "Kananaskis", href: links.destination("en", "kananaskis"), detail: "Review the highest representative cell and its colder margins." },
          { label: "Methodology", href: links.methodology("en"), detail: "Understand representative cells and critical climate thresholds." },
          { label: "Find a hiking month", href: links.finder("en"), detail: "Compare the Rockies with other destinations and preferences." },
        ] },
      ],
    },
    de: {
      title: "Beste Wanderzeit für Banff, Jasper, Yoho und Kananaskis",
      description: "Vier Regionen der kanadischen Rockies anhand von Daten zu Temperatur, Regen, Schnee und Tageslicht von 1991–2025 vergleichen.",
      heroAlt: "Lake Louise unter schneebedeckten Bergen im Banff-Nationalpark",
      category: "seasonal",
      readingMinutes: 8,
      blocks: [
        { type: "monthStrip", caption: "Das kurze gemeinsame Klimafenster in den kanadischen Rockies", months: [
          { month: 6, label: "Juni", note: "Nur Banff passiert · Regen und Restschnee begrenzen die anderen Zellen", href: links.destinationMonth("de", "banff", 6) },
          { month: 7, label: "Juli", note: "Alle vier passieren · längstes nutzbares Tageslicht · nasser als August", href: links.destinationMonth("de", "jasper", 7) },
          { month: 8, label: "August", note: "Alle vier passieren · höchster Score in jedem Datensatz", href: links.destinationMonth("de", "yoho", 8) },
          { month: 9, label: "September", note: "Alle vier passieren · weniger Regen, aber kältere Schneeränder", href: links.destinationMonth("de", "kananaskis", 9) },
          { month: 10, label: "Oktober", note: "Alle vier scheitern · modellierte Schneetage über 81%", href: links.destinationMonth("de", "banff", 10) },
        ], evidenceKey: "canadian-rockies-window" },
        { type: "paragraph", text: "Die beste Wanderzeit für Banff, Jasper, Yoho und Kananaskis läuft in den öffentlichen Datensätzen von 1991 bis 2025 auf eine enge Antwort hinaus. Alle vier ausgewählten ERA5-Land-Zellen passieren die kritischen Klimaschwellen des Projekts nur im Juli, August und September. Es sind keine gleichwertigen Punkte: Jasper wird auf 1.614,4 Metern repräsentiert, Banff auf 1.818,5, Yoho auf 1.968,6 und Kananaskis auf 2.160,7 Metern. Trotzdem ist die Reihenfolge ungewöhnlich stabil. Der August erreicht in jedem Datensatz den höchsten Score, der Juli folgt knapp und der September tauscht Wärme und Tageslicht gegen geringere Wahrscheinlichkeiten nasser Tage. Das gemeinsame Ergebnis hilft bei der Wahl einer Planungssaison, bestimmt aber nicht, ob ein hoher Pass, Seeweg oder eine Kraxelroute schneefrei ist." },
        { type: "heading", level: 2, text: "Der August ist in allen vier Datensätzen am ausgewogensten" },
        { type: "comparisonTable", caption: "August an vier repräsentativen Zellen der kanadischen Rockies", columns: ["Region", "Temperatur", "Nasse Tage", "Monatsregen", "Schneetage", "Score"], rows: [
          { label: "Banff", values: ["15,0 °C", "46,64%", "81,1 mm", "6,18%", "83"] },
          { label: "Jasper", values: ["13,9 °C", "52,44%", "95,6 mm", "4,88%", "81"] },
          { label: "Yoho", values: ["13,3 °C", "43,78%", "69,7 mm", "4,42%", "85"] },
          { label: "Kananaskis", values: ["13,0 °C", "48,94%", "97,6 mm", "5,53%", "81"] },
        ], evidenceKey: "canadian-rockies-summer" },
        { type: "paragraph", text: "Der August gewinnt durch Ausgewogenheit statt Hitze. Die Mitteltemperaturen liegen zwischen 13,0 und 15,0 °C, das mittlere Tageslicht bleibt zwischen 14,5 und 14,7 Stunden und die modellierte Wahrscheinlichkeit eines Schneetages sinkt an jeder Zelle unter sieben Prozent. Yoho ist mit 69,7 mm und 43,78 Prozent nach Monatssumme und nassen Tagen der trockenste August-Datensatz. Banff folgt mit 81,1 mm, Jasper und Kananaskis liegen näher an 96 mm. Auch diese Summen beschreiben einen Monat mit regelmäßigem Niederschlag und keine Trockensaison. Sie stammen außerdem jeweils aus einer einzelnen Zelle. Eine Sturmroute, ein exponierter Grat oder eine höhere Strecke kann sich selbst bei einem starken regionalen Score anders verhalten als das Monatsmittel." },
        { type: "metricCallout", label: "Der Juni trennt Banff von den anderen drei", value: "1 von 4 Zellen passiert", detail: "Banff bleibt mit Score 62 zulässig. Jasper, Yoho und Kananaskis werden auf 49 begrenzt, weil ihre modellierte Wahrscheinlichkeit von Schneetagen über 50% bleibt.", evidenceKey: "canadian-rockies-summer" },
        { type: "paragraph", text: "Allein nach Tageslicht wirkt der Juni attraktiv: Die Datensätze erreichen im Mittel 16,4 bis 16,8 Stunden. Zugleich ist er der nasseste Teil dieses Fünfmonatsvergleichs. Der Monatsniederschlag kommt in Banff auf 125,7 mm, in Jasper auf 113,4, in Yoho auf 113,9 und in Kananaskis auf 143,2 mm. Die Wahrscheinlichkeit nasser Tage liegt zwischen 66,19 und 68,00 Prozent. Das Schneesignal erzeugt den entscheidenden Unterschied. Banff fällt auf 41,90 Prozent modellierte Schneetage und passiert knapp die kritische Regel. Jasper bleibt bei 54,57 Prozent, Kananaskis bei 53,05 und Yoho bei 63,52 Prozent. Daraus wird Banff keine allgemeine Juni-Empfehlung. Es bedeutet nur, dass seine ausgewählte Zelle die Projektschwelle früher überquert als die anderen drei." },
        { type: "heading", level: 2, text: "Der September ist trockener, doch die Saison schließt schnell" },
        { type: "timeline", caption: "Wie die vier Zellen vom Sommer in den Winter wechseln", points: [
          { label: "Juli", value: "Das gemeinsame Fenster öffnet", detail: "Die Temperaturen erreichen 13,7 bis 15,7 °C, die Wahrscheinlichkeit nasser Tage liegt noch zwischen 51,43% und 63,41%." },
          { label: "August", value: "Die sauberste Überschneidung", detail: "Jede Zelle erreicht ihren höchsten Score und modellierte Schneetage sinken unter 7%." },
          { label: "September", value: "Weniger Regen, engere Ränder", detail: "Nasse Tage sinken auf 37,24 bis 47,52%, während Temperaturen auf 7,7 bis 9,3 °C fallen und Schneesignale über 32% steigen." },
          { label: "Oktober", value: "Das gemeinsame Fenster ist geschlossen", detail: "Die Mitteltemperaturen liegen um 0 °C und modellierte Schneetage steigen auf 81,11 bis 85,53%." },
        ], evidenceKey: "canadian-rockies-summer" },
        { type: "caveat", text: "Diese Werte sind 35-jährige Mittel für vier ausgewählte Modellzellen und weder Vorhersagen noch Wegöffnungen. Sie lösen Schneehöhe, Waldbrandrauch, Gewitter, Flussquerungen, Lawinengelände, Bärensperren, ausgesetzte Pässe, Straßenzugang oder das Höhenprofil einer bestimmten Route nicht auf. Das Windfeld ist grober Gitterwind statt einer Böeninformation. Für die genaue Tour aktuelle Hinweise von Parks Canada, Alberta Parks und lokale Vorhersagen prüfen." },
        { type: "pullQuote", text: "In den kanadischen Rockies ist die historische Überschneidung drei Monate breit, das praktische Routenfenster kann jedoch deutlich schmaler sein." },
        { type: "paragraph", text: "Für eine erste Reise, die alle vier Regionen verbindet, besitzt der August in diesem Datensatz den stärksten gemeinsamen Fall. Der Juli bietet rund neunzig Minuten mehr mittleres Tageslicht und etwas mehr Wärme, ist aber an jeder Zelle nasser: Banff steigt von 81,1 mm im August auf 93,0 im Juli, Jasper von 95,6 auf 118,1, Yoho von 69,7 auf 87,3 und Kananaskis von 97,6 auf 108,2 mm. Im September kehrt sich der Zielkonflikt um. Nach nassen Tagen und meist auch Monatssumme ist er trockener, doch das Schneesignal steigt auf 32,29 bis 38,76 Prozent und die Temperaturen fallen unter 10 °C. Den August für die breiteste historische Balance wählen, den Juli für Licht und Wärme oder den September nur dann, wenn kältere Ränder und früher Schnee akzeptabel sind. Danach muss der regionale Mittelwert durch aktuelle Bedingungen für die genaue Route ersetzt werden." },
        { type: "destinationLinks", heading: "Die vier Datensätze der kanadischen Rockies vergleichen", links: [
          { label: "Banff", href: links.destination("de", "banff"), detail: "Den einzigen Datensatz dieser Gruppe öffnen, der im Juni passiert." },
          { label: "Jasper", href: links.destination("de", "jasper"), detail: "Die nassere nördliche Zelle und ihr dreimonatiges Fenster vergleichen." },
          { label: "Yoho", href: links.destination("de", "yoho"), detail: "Den höchsten August-Score in diesem Vergleich ansehen." },
          { label: "Kananaskis", href: links.destination("de", "kananaskis"), detail: "Die höchste repräsentative Zelle und ihre kalten Ränder prüfen." },
          { label: "Methodik", href: links.methodology("de"), detail: "Repräsentative Zellen und kritische Klimaschwellen verstehen." },
          { label: "Wandermonat finden", href: links.finder("de"), detail: "Die Rockies mit anderen Zielen und Vorlieben vergleichen." },
        ] },
      ],
    },
  },
};
