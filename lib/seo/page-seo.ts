import type { Locale, PublicDestination } from "@/lib/data/types";
import { monthName, themes } from "@/lib/i18n/config";
import { getComparisonIndex, getDestination, getManifest, getRanking } from "@/lib/data/load";
import { profileFor } from "@/lib/seo/profile";
import { areaById, areaProfile } from "@/lib/seo/areas";
import { t, taxonomyLabel, withArticle } from "@/lib/i18n/dict";
import { evaluateIndexability } from "@/lib/seo/indexability";
import { longformSections } from "@/lib/seo/longform";
import type { PageId } from "@/lib/i18n/resolve";
import { historicalPeriodDescription, historicalPeriodRange } from "@/lib/methodology/historical-period";
import {
  INDEXABILITY_STRATEGY,
  areaIsCurated,
  comparisonIsCurated,
  destinationIsCurated,
  destinationScienceIsCleared,
  jaccard,
  themeIsCurated,
} from "@/lib/seo/indexability-strategy";
import pageDefinitions from "@/data-config/seo/page-definitions.json";

/**
 * Title, description and index decision per page.
 *
 * The index decision matters more than the markup. This catalogue can render
 * destination-month pages that differ only in their numbers, and publishing
 * them is a doorway pattern regardless of how good the structured data is. So
 * the rule is: index the pages that answer a question with substance, and let
 * the rest stay crawlable but out of the index. The target is a few hundred
 * strong pages, not a few thousand thin ones.
 *
 *   destination, recommendable   index      unique long-form article
 *   destination, withheld        noindex    provenance page, no recommendation
 *   month, any                   noindex    linked and crawlable, never an entry
 *                                           point; the destination page makes
 *                                           the same claim with more around it
 *   ranking, comparison          index      genuinely different lists
 *   finder, legal pages          noindex    tool and boilerplate
 */
export interface PageSeo { title: string; description: string; index: boolean; reasons: string[] }

/** Social card metadata, shared by OpenGraph and Twitter. */
export interface PageSocial { title: string; description: string; url: string; image: string }

const clamp = (text: string, max = 155) => text.length <= max ? text : `${text.slice(0, max - 1).replace(/[\s,;.]+\S*$/, "")}…`;

function destinationSeo(destination: PublicDestination, locale: Locale): PageSeo {
  const de = locale === "de";
  const p = profileFor(destination);
  const sections = longformSections(destination, locale);
  const words = sections.reduce((sum, section) => sum + section.paragraphs.join(" ").split(/\s+/).length, 0);

  const title = p.seasonShape === "withheld"
    ? (de ? `${destination.name}: warum wir keine Wanderzeit empfehlen` : `${destination.name}: why we recommend no hiking season`)
    : p.seasonShape === "year-round"
      ? (de ? `${destination.name} wandern: ganzjährige Saison` : `Hiking ${destination.name}: a year-round season`)
      : p.peakMonth
        ? (de ? `Beste Wanderzeit für ${destination.name}: ${monthName(p.peakMonth, locale)}` : `Best time to hike ${destination.name}: ${monthName(p.peakMonth, locale)}`)
        : (de ? `Beste Wanderzeit für ${destination.name}` : `Best time to hike ${destination.name}`);

  const description = clamp(p.seasonShape === "withheld"
    ? (de ? `Kein Monat in ${destination.name} erfüllt unsere Klimakriterien. Was die ERA5-Land-Daten für ${historicalPeriodDescription.de} zeigen und warum wir die Empfehlung zurückhalten.`
          : `No month at ${destination.name} clears our climate criteria. What the ERA5-Land record for ${historicalPeriodDescription.en} shows, and why we withhold the recommendation.`)
    : (de ? `${p.eligibleMonths.length} von zwölf Monaten ${p.eligibleMonths.length === 1 ? "ist" : "sind"} empfehlenswert${p.peakMonth ? `, am besten ${monthName(p.peakMonth, locale)}` : ""}. Temperatur, Regen, Schnee und Tageslicht aus der historischen Klimatologie ${historicalPeriodRange}.`
          : `${p.eligibleMonths.length} of twelve months ${p.eligibleMonths.length === 1 ? "is" : "are"} recommendable${p.peakMonth ? `, ${monthName(p.peakMonth, locale)} most of all`: ""}. Temperature, rain, snow and daylight from the historical climatology for ${historicalPeriodDescription.en}.`));

  const decision = evaluateIndexability({
    resultCount: p.eligibleMonths.length,
    dataCompleteness: Math.min(...destination.months.map((month) => month.metrics.dataCompleteness)),
    confidence: Math.max(...destination.months.map((month) => month.confidenceScore ?? 0)),
    uniqueInsightCount: sections.length,
    hasUniqueTitle: true, hasUniqueH1: true, hasCanonical: true,
    internalLinkCount: destination.alternatives.length + 2,
    createsCannibalization: false,
    containsUnsupportedClaims: false,
    datasetStatus: getManifest().datasetStatus,
  });
  // The underlying month confidence remains capped at 64/low. For the small
  // reviewed destination set, a separate science decision allows indexing the
  // explicitly restricted selected-cell article without claiming that its
  // model score became more certain or representative of a whole region.
  const reasons = decision.reasons.filter((reason) =>
    !(reason === "low-confidence" && destinationScienceIsCleared(destination.slug)));
  if (!destinationIsCurated(destination.slug)) reasons.push("not-in-curated-index-allowlist");
  if (destinationIsCurated(destination.slug) && !destinationScienceIsCleared(destination.slug)) {
    reasons.push("selected-cell-claim-indexability-not-approved");
  }
  if (p.seasonShape === "withheld") reasons.push("withheld-destination-makes-no-recommendation");
  if (words < 120) reasons.push("thin-article");
  return {title, description, index: decision.indexable && reasons.length === 0, reasons};
}

function monthSeo(destination: PublicDestination, monthNumber: number, locale: Locale): PageSeo {
  const de = locale === "de";
  const data = destination.months[monthNumber - 1];
  const label = monthName(monthNumber, locale);
  const isBest = destination.bestMonths.includes(monthNumber);
  const eligible = Boolean(data?.recommendationEligible);

  const title = eligible
    ? (de ? `${destination.name} im ${label} erwandern` : `Hiking ${destination.name} in ${label}`)
    : (de ? `${destination.name} im ${label}: nicht empfohlen` : `${destination.name} in ${label}: not recommended`);

  const description = clamp(eligible && data
    ? (de ? `Rund ${Math.round(data.metrics.temperatureHikingMeanC)} Grad, Regen an ${Math.round(data.metrics.wetDayProbability * 100)} Prozent der Tage und ${Math.round(data.metrics.daylightHoursMean)} Stunden Tageslicht in der historischen Klimatologie ${historicalPeriodRange}.`
          : `About ${Math.round(data.metrics.temperatureHikingMeanC)} degrees, rain on ${Math.round(data.metrics.wetDayProbability * 100)} percent of days and ${Math.round(data.metrics.daylightHoursMean)} hours of daylight in the historical climatology for ${historicalPeriodDescription.en}.`)
    : (de ? `Für diesen Monat halten wir eine Wanderempfehlung zurück. Welche Klimakomponente die Schwelle unterschreitet und was die Daten stattdessen zeigen.`
          : `We withhold a hiking recommendation for this month. Which climate component falls below the threshold, and what the record shows instead.`));

  // No month page is indexed. Best months were the exception, and that was
  // still 1,810 pages across both locales, built from one template and
  // differing only in a month name and six numbers — which is the doorway
  // pattern whatever the structured data says.
  //
  // They are not junk: a reader who arrives at a destination and wants August
  // should have this page, and it is linked, crawlable and carries its own
  // canonical. It is a poor entry point rather than a poor page. The claim it
  // makes is already made, with more around it, on the destination page that
  // names its best months, and that page is the one competing for the query.
  const reasons: string[] = ["month-page-not-an-entry-point"];
  if (!eligible) reasons.push("month-withheld-by-recommendation-gate");
  else if (!isBest) reasons.push("not-a-best-month-structurally-repetitive");
  if ((data?.confidenceScore ?? 0) < 65) reasons.push("low-confidence");
  if (getManifest().datasetStatus !== "production") reasons.push("non-production-dataset");
  return {title, description, index: false, reasons};
}

export function pageSeo(page: PageId, locale: Locale): PageSeo {
  const de = locale === "de";
  switch (page.kind) {
    case "destination": {
      const destination = getDestination(page.slug);
      return destination ? destinationSeo(destination, locale)
        : {title: "BestTimeToHike", description: "", index: false, reasons: ["unknown-destination"]};
    }
    case "destinationMonth": {
      const destination = getDestination(page.slug);
      return destination ? monthSeo(destination, page.month, locale)
        : {title: "BestTimeToHike", description: "", index: false, reasons: ["unknown-destination"]};
    }
    case "rankingIndex":
    case "themeIndex": return {
      title: page.kind === "themeIndex" ? t(locale).ranking.themes[page.theme] : t(locale).ranking.heading,
      description: t(locale).ranking.chooseMonthIntro,
      index: false, reasons: ["month-selection-navigation"]};
    case "ranking": return {
      title: de ? `Beste Wanderziele im ${monthName(page.month, locale)}` : `The best hiking destinations in ${monthName(page.month, locale)}`,
      description: clamp(de
        ? `Ziele, die im ${monthName(page.month, locale)} unsere Klimakriterien erfüllen, sortiert nach Wanderwert.`
        : `Destinations that clear our climate criteria in ${monthName(page.month, locale)}, ordered by hiking suitability.`),
      index: getManifest().datasetStatus === "production",
      reasons: getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"]};
    case "areaRanking": {
      const area = areaById(page.area);
      if (!area) return {title: "BestTimeToHike", description: "", index: false, reasons: ["unknown-area"]};
      const profile = areaProfile(area);
      const label = taxonomyLabel(locale, area.kind === "continent" ? "continents" : "regions", area.id);
      const peak = profile.peakMonths.map((month) => monthName(month, locale)).join(" / ");
      const reasons = getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"];
      if (!areaIsCurated(page.area)) reasons.push("not-in-curated-index-allowlist");
      return {
        title: de ? `${label}: beste Wanderzeit und Ziele` : `Hiking ${withArticle(area.id, label)}: when to go and where`,
        description: clamp(de
          ? `${area.destinations.length} Ziele von ${profile.elevationMinM} bis ${profile.elevationMaxM} Metern. Am meisten begehbar im ${peak}.`
          : `${area.destinations.length} destinations from ${profile.elevationMinM} to ${profile.elevationMaxM} metres. Most of the area is walkable in ${peak}.`),
        // An area page ranks a real set and says something specific about its
        // season, so it earns an index slot where a month slice of the same
        // set would not.
        index: reasons.length === 0,
        reasons};
    }
    case "themeRanking": {
      const ranking = getRanking(page.month, themes[page.theme]);
      const global = getRanking(page.month, "all");
      const gate = INDEXABILITY_STRATEGY.families.themeMonthlyRankings;
      const reasons = getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"];
      if (!themeIsCurated(page.theme)) reasons.push("theme-not-in-curated-index-allowlist");
      if (ranking.entries.length < gate.minimumResults) reasons.push("too-few-theme-results");
      if (jaccard(ranking.entries.map((entry) => entry.slug), global.entries.map((entry) => entry.slug)) > gate.maximumFullListJaccardAgainstGlobal) {
        reasons.push("theme-cannibalizes-global-ranking");
      }
      const warm = page.theme === "warm";
      const lowRain = page.theme === "lowRain";
      return {
        title: t(locale).ranking.themeTitle(t(locale).ranking.themes[page.theme], monthName(page.month, locale)),
        description: clamp(de
          ? warm
            ? `${ranking.entries.length} Wanderziele mit mindestens 15 °C mittlerer Wandertemperatur im ${monthName(page.month, locale)}, mit Regen und Schnee im direkten Vergleich.`
            : lowRain
              ? `${ranking.entries.length} Wanderziele mit höchstens 20 Prozent Regentagen im ${monthName(page.month, locale)}, mit Temperatur und Schnee im direkten Vergleich.`
              : `${ranking.entries.length} Wanderziele mit höchstens 8 Prozent Schneetagen im ${monthName(page.month, locale)}. Diese Seite bleibt wegen Überschneidung mit der Gesamtrangliste außerhalb des Index.`
          : warm
            ? `${ranking.entries.length} hiking destinations averaging at least 15°C during walking hours in ${monthName(page.month, locale)}, compared for rain and snow.`
            : lowRain
              ? `${ranking.entries.length} hiking destinations with no more than 20% wet days in ${monthName(page.month, locale)}, compared for temperature and snow.`
              : `${ranking.entries.length} hiking destinations with no more than 8% snow days in ${monthName(page.month, locale)}. This page stays out of the index because it overlaps the global ranking.`),
        index: reasons.length === 0,
        reasons,
      };
    }
    case "compare": {
      const definition = getComparisonIndex().find((item) => item.slug === page.slug);
      if (!definition) return {title: "BestTimeToHike", description: "", index: false, reasons: ["unknown-comparison"]};
      const contentApproved = pageDefinitions.comparisons.find((item) => item.slug === page.slug)?.indexable === true;
      const first = getDestination(definition.destinations[0])!;
      const second = getDestination(definition.destinations[1])!;
      const overlap = first.months.filter((month, index) => month.recommendationEligible && second.months[index]?.recommendationEligible).length;
      const reasons = getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"];
      if (!comparisonIsCurated(page.slug)) reasons.push("comparison-not-in-curated-index-allowlist");
      if (!contentApproved) reasons.push("comparison-content-gate-pending");
      return {
        title: de ? `${first.name} oder ${second.name}: Wanderzeiten vergleichen` : `${first.name} vs ${second.name}: hiking seasons compared`,
        description: clamp(de
          ? `${overlap} gemeinsam empfehlenswerte Monate. Vergleiche Saisonlänge, Temperatur und Regentage für ${first.name} und ${second.name}.`
          : `${overlap} mutually recommendable months. Compare season length, temperature and wet days for ${first.name} and ${second.name}.`),
        index: reasons.length === 0,
        reasons,
      };
    }
    case "home": return {
      title: de ? "Finde deine beste Wanderzeit" : "Find your best hiking season",
      description: clamp(de
        ? `Wanderziele nach Monat, Temperatur, Regen und Schnee vergleichen, auf Basis der ERA5-Land-Klimatologie ${historicalPeriodRange}.`
        : `Compare hiking destinations by month, temperature, rain and snow, using the ERA5-Land historical climatology for ${historicalPeriodDescription.en}.`),
      index: getManifest().datasetStatus === "production",
      reasons: getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"]};
    case "compareTool": return {
      title: de ? "Wanderziele vergleichen" : "Compare hiking destinations",
      description: clamp(de
        ? "Stelle Ziele nebeneinander und sieh Monat für Monat, wann sie empfehlenswert sind."
        : "Put destinations side by side and see month by month when each one is recommendable."),
      // A tool whose output depends on what the reader picks, like the finder.
      index: false, reasons: ["interactive-tool-not-a-document"]};
    case "finder": return {
      title: de ? "Wanderziel-Finder" : "Hiking destination finder",
      description: clamp(de ? "Filtere Wanderziele nach Monat, Region, Temperatur und Gelände." : "Filter hiking destinations by month, region, temperature and terrain."),
      index: false, reasons: ["interactive-tool-not-a-document"]};
    case "info": {
      const indexable = (page.key === "methodology" || page.key === "about") && getManifest().datasetStatus === "production";
      const substantive = page.key === "methodology" || page.key === "about";
      return {
        title: de ? (page.key === "methodology" ? "So funktioniert der Wanderwert" : "Über BestTimeToHike")
                  : (page.key === "methodology" ? "How the hiking score works" : "About BestTimeToHike"),
        description: clamp(de ? "Methodik, Datenquellen und die Grenzen dieser Auswertung." : "Methodology, data sources and the limits of this analysis."),
        index: indexable,
        reasons: indexable ? [] : substantive ? ["non-production-dataset"] : ["boilerplate-page-not-an-entry-point"]};
    }
  }
}
