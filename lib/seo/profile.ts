import type { PublicDestination, PublicMonth } from "@/lib/data/types";

/**
 * What kind of hiking destination is this, according to its own data?
 *
 * Every page on this site describes the same six components for the same
 * twelve months, so a template produces 265 pages that differ only in their
 * numbers. That is a doorway pattern and it deserves to be treated as one.
 *
 * The profile exists so a page can be built around what is actually true of
 * the place: a Mediterranean island with no closed season and an Arctic massif
 * with a six-week window are not the same article with different figures. The
 * classification is derived, never authored, so it cannot claim more than the
 * data supports.
 */
export type SeasonShape = "year-round" | "long-season" | "short-season" | "narrow-window" | "withheld";
export type LimitingFactor = "snow" | "precipitation" | "heatStress" | "temperature" | "daylight" | "wind";
export type Seasonality = "northern" | "southern" | "low-variation";
export type AltitudeBand = "lowland" | "hill" | "mountain" | "high-alpine";

export interface DestinationProfile {
  seasonShape: SeasonShape;
  seasonality: Seasonality;
  altitudeBand: AltitudeBand;
  /** What closes the season, counted across the months the gate withholds. */
  limitingFactor: LimitingFactor | null;
  secondaryFactor: LimitingFactor | null;
  eligibleMonths: number[];
  closedMonths: number[];
  peakMonth: number | null;
  warmestMonth: number;
  coldestMonth: number;
  wettestMonth: number;
  driestMonth: number;
  temperatureSpreadC: number;
  meanWetDayProbability: number;
  snowMonths: number;
  polarDaylight: boolean;
}

const metric = (month: PublicMonth, key: "temperatureHikingMeanC" | "wetDayProbability" | "snowDayProbability" | "daylightHoursMean") => month.metrics[key];
const extreme = (months: PublicMonth[], key: Parameters<typeof metric>[1], highest: boolean) =>
  months.reduce((best, month) => (highest ? metric(month, key) > metric(best, key) : metric(month, key) < metric(best, key)) ? month : best).month;

export function profileFor(destination: PublicDestination): DestinationProfile {
  const months = destination.months;
  const eligibleMonths = months.filter((month) => month.recommendationEligible).map((month) => month.month);
  const closedMonths = months.filter((month) => !month.recommendationEligible).map((month) => month.month);

  const seasonShape: SeasonShape = eligibleMonths.length === 0 ? "withheld"
    : eligibleMonths.length >= 10 ? "year-round"
    : eligibleMonths.length >= 6 ? "long-season"
    : eligibleMonths.length >= 3 ? "short-season"
    : "narrow-window";

  // Count what actually closes each withheld month, rather than assuming.
  const tally = new Map<LimitingFactor, number>();
  for (const month of months) {
    if (month.recommendationEligible || !month.components) continue;
    const lowest = (Object.entries(month.components) as Array<[LimitingFactor, number]>)
      .reduce((worst, entry) => entry[1] < worst[1] ? entry : worst);
    tally.set(lowest[0], (tally.get(lowest[0]) ?? 0) + 1);
  }
  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const temperatures = months.map((month) => metric(month, "temperatureHikingMeanC"));
  const temperatureSpreadC = Math.max(...temperatures) - Math.min(...temperatures);
  const seasonality: Seasonality = temperatureSpreadC < 6 ? "low-variation"
    : destination.coordinates.lat < 0 ? "southern" : "northern";

  const elevation = destination.representativeCell.modelElevationM;
  const altitudeBand: AltitudeBand = elevation < 500 ? "lowland" : elevation < 1200 ? "hill" : elevation < 2500 ? "mountain" : "high-alpine";

  const scored = months.filter((month) => month.recommendationEligible && month.overallScore !== null);
  const peakMonth = scored.length ? scored.reduce((best, month) => (month.overallScore! > best.overallScore! ? month : best)).month : null;

  return {
    seasonShape, seasonality, altitudeBand,
    limitingFactor: ranked[0]?.[0] ?? null,
    secondaryFactor: ranked[1]?.[0] ?? null,
    eligibleMonths, closedMonths, peakMonth,
    warmestMonth: extreme(months, "temperatureHikingMeanC", true),
    coldestMonth: extreme(months, "temperatureHikingMeanC", false),
    wettestMonth: extreme(months, "wetDayProbability", true),
    driestMonth: extreme(months, "wetDayProbability", false),
    temperatureSpreadC: Math.round(temperatureSpreadC * 10) / 10,
    meanWetDayProbability: months.reduce((sum, month) => sum + metric(month, "wetDayProbability"), 0) / months.length,
    snowMonths: months.filter((month) => metric(month, "snowDayProbability") >= 0.5).length,
    polarDaylight: months.some((month) => metric(month, "daylightHoursMean") < 5) || months.some((month) => metric(month, "daylightHoursMean") > 19),
  };
}

/**
 * A short, stable key for how differentiated this page is. Pages sharing a key
 * tell the same story shape and must not all be indexed (mistakes.md #16 is the
 * same principle: two URLs, one page).
 */
export const profileKey = (profile: DestinationProfile) =>
  `${profile.seasonShape}:${profile.seasonality}:${profile.altitudeBand}:${profile.limitingFactor ?? "none"}`;
