import type { Locale, PublicDestination } from "@/lib/data/types";
import { monthName } from "@/lib/i18n/config";
import { getDestination, getManifest } from "@/lib/data/load";
import { profileFor } from "@/lib/seo/profile";
import { evaluateIndexability } from "@/lib/seo/indexability";
import { longformSections } from "@/lib/seo/longform";
import type { PageId } from "@/lib/i18n/resolve";

/**
 * Title, description and index decision per page.
 *
 * The index decision matters more than the markup. This catalogue can render
 * 3,180 destination-month pages that differ only in their numbers, and
 * publishing all of them is a doorway pattern regardless of how good the
 * structured data is. So the rule is: index the pages that answer a question
 * with substance, and let the rest stay crawlable but out of the index.
 *
 *   destination, recommendable   index      unique long-form article
 *   destination, withheld        noindex    provenance page, no recommendation
 *   month, a best month          index      the answer to "when should I hike X"
 *   month, merely eligible       noindex    real but structurally repetitive
 *   month, withheld              noindex    makes no claim at all
 *   ranking, comparison          index      genuinely different lists
 *   finder, legal pages          noindex    tool and boilerplate
 */
export interface PageSeo { title: string; description: string; index: boolean; reasons: string[] }

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
    ? (de ? `Kein Monat in ${destination.name} erfüllt unsere Klimakriterien. Was die ERA5-Land-Daten von 1991 bis 2020 zeigen und warum wir die Empfehlung zurückhalten.`
          : `No month at ${destination.name} clears our climate criteria. What the 1991-2020 ERA5-Land record shows, and why we withhold the recommendation.`)
    : (de ? `${p.eligibleMonths.length} von zwölf Monaten ${p.eligibleMonths.length === 1 ? "ist" : "sind"} empfehlenswert${p.peakMonth ? `, am besten ${monthName(p.peakMonth, locale)}` : ""}. Temperatur, Regen, Schnee und Tageslicht aus dem Klimanormal 1991 bis 2020.`
          : `${p.eligibleMonths.length} of twelve months ${p.eligibleMonths.length === 1 ? "is" : "are"} recommendable${p.peakMonth ? `, ${monthName(p.peakMonth, locale)} most of all`: ""}. Temperature, rain, snow and daylight from the 1991-2020 climate normal.`));

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
  const reasons = [...decision.reasons];
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
    ? (de ? `Rund ${Math.round(data.metrics.temperatureHikingMeanC)} Grad, Regen an ${Math.round(data.metrics.wetDayProbability * 100)} Prozent der Tage und ${Math.round(data.metrics.daylightHoursMean)} Stunden Tageslicht im Klimamittel 1991 bis 2020.`
          : `About ${Math.round(data.metrics.temperatureHikingMeanC)} degrees, rain on ${Math.round(data.metrics.wetDayProbability * 100)} percent of days and ${Math.round(data.metrics.daylightHoursMean)} hours of daylight in the 1991-2020 mean.`)
    : (de ? `Für diesen Monat halten wir eine Wanderempfehlung zurück. Welche Klimakomponente die Schwelle unterschreitet und was die Daten stattdessen zeigen.`
          : `We withhold a hiking recommendation for this month. Which climate component falls below the threshold, and what the record shows instead.`));

  // A month page is indexed only when it is one of the destination's best
  // months. The rest stay crawlable and keep their internal links, but they do
  // not compete: 1,546 structurally identical month pages is a doorway set.
  //
  // The confidence floor is applied here as well as on the destination page.
  // While the dataset is provisional every month is capped at 64/low by the
  // single-point rule, so nothing clears it; that cap is conditioned on
  // datasetStatus, so the approvals that reach production lift it in the same
  // step. Indexing a specific month claim while declining the general one
  // would be the wrong way round.
  const reasons: string[] = [];
  if (!eligible) reasons.push("month-withheld-by-recommendation-gate");
  else if (!isBest) reasons.push("not-a-best-month-structurally-repetitive");
  if ((data?.confidenceScore ?? 0) < 65) reasons.push("low-confidence");
  if (getManifest().datasetStatus !== "production") reasons.push("non-production-dataset");
  return {title, description, index: reasons.length === 0, reasons};
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
    case "ranking": return {
      title: de ? `Beste Wanderziele im ${monthName(page.month, locale)}` : `The best hiking destinations in ${monthName(page.month, locale)}`,
      description: clamp(de
        ? `Ziele, die im ${monthName(page.month, locale)} unsere Klimakriterien erfüllen, sortiert nach Wanderwert und Datenvertrauen.`
        : `Destinations that clear our climate criteria in ${monthName(page.month, locale)}, ordered by hiking suitability then data confidence.`),
      index: getManifest().datasetStatus === "production",
      reasons: getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"]};
    case "themeRanking": return {
      title: de ? `${page.theme === "warm" ? "Warm wandern" : page.theme === "snowFree" ? "Schneefrei wandern" : "Wenig Regen"} im ${monthName(page.month, locale)}`
               : `${page.theme === "warm" ? "Warm hiking" : page.theme === "snowFree" ? "Snow-free hiking" : "Low-rain hiking"} in ${monthName(page.month, locale)}`,
      description: clamp(de
        ? `Eine gefilterte Auswahl für ${monthName(page.month, locale)} aus dem Klimanormal 1991 bis 2020.`
        : `A filtered shortlist for ${monthName(page.month, locale)}, drawn from the 1991-2020 climate normal.`),
      index: getManifest().datasetStatus === "production",
      reasons: getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"]};
    case "compare": return {
      title: page.slug.replaceAll("-", " "),
      description: clamp(de ? "Zwei Ziele Monat für Monat nebeneinander." : "Two destinations compared month by month."),
      index: getManifest().datasetStatus === "production",
      reasons: getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"]};
    case "home": return {
      title: de ? "Finde deine beste Wanderzeit" : "Find your best hiking season",
      description: clamp(de
        ? "Wanderziele nach Monat, Temperatur, Regen und Schnee vergleichen, auf Basis des ERA5-Land-Klimanormals 1991 bis 2020."
        : "Compare hiking destinations by month, temperature, rain and snow, using the ERA5-Land 1991-2020 climate normal."),
      index: getManifest().datasetStatus === "production",
      reasons: getManifest().datasetStatus === "production" ? [] : ["non-production-dataset"]};
    case "finder": return {
      title: de ? "Wanderziel-Finder" : "Hiking destination finder",
      description: clamp(de ? "Filtere Wanderziele nach Monat, Region, Temperatur und Gelände." : "Filter hiking destinations by month, region, temperature and terrain."),
      index: false, reasons: ["interactive-tool-not-a-document"]};
    case "info": {
      const indexable = (page.key === "methodology" || page.key === "about") && getManifest().datasetStatus === "production";
      return {
        title: de ? (page.key === "methodology" ? "So funktioniert der Wanderwert" : "Über BestTimeToHike")
                  : (page.key === "methodology" ? "How the hiking score works" : "About BestTimeToHike"),
        description: clamp(de ? "Methodik, Datenquellen und die Grenzen dieser Auswertung." : "Methodology, data sources and the limits of this analysis."),
        index: indexable, reasons: indexable ? [] : ["boilerplate-or-non-production"]};
    }
  }
}
