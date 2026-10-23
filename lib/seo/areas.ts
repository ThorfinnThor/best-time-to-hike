import { getAllDestinations } from "@/lib/data/load";
import type { PublicDestination, PublicMonth } from "@/lib/data/types";
import { CRITICAL_COMPONENT_FLOOR, CRITICAL_COMPONENT_KEYS, type CriticalComponentKey } from "@/lib/scoring/recommendations";

/**
 * Area rankings: "where should I hike in the Alps".
 *
 * The catalogue can slice 55 regions by 12 months, which would be 660 pages
 * that mostly rank two destinations against each other. So an area gets one
 * page rather than twelve, and only when it holds enough destinations for a
 * ranking to mean anything. The threshold lives here rather than in the page.
 */
export const MINIMUM_DESTINATIONS = 5;

export interface Area {
  id: string;
  kind: "continent" | "region";
  destinations: PublicDestination[];
  /** Withheld destinations in this area. Named, not hidden. */
  withheld: PublicDestination[];
}

const peak = (destination: PublicDestination) =>
  Math.max(0, ...destination.months.flatMap((month) => month.overallScore === null ? [] : [month.overallScore]));

let cached: Area[] | null = null;

export function areaCatalogue(): Area[] {
  if (cached) return cached;
  const all = getAllDestinations();
  const groups = new Map<string, {kind: Area["kind"]; members: PublicDestination[]}>();
  for (const destination of all) {
    for (const [kind, id] of [["continent", destination.continent], ["region", destination.region]] as const) {
      const group = groups.get(id) ?? {kind, members: []};
      group.members.push(destination);
      groups.set(id, group);
    }
  }
  cached = [...groups.entries()]
    .map(([id, group]) => ({
      id, kind: group.kind,
      destinations: group.members.filter((destination) => destination.recommendationEligible).sort((a, b) => peak(b) - peak(a) || a.slug.localeCompare(b.slug)),
      withheld: group.members.filter((destination) => !destination.recommendationEligible),
    }))
    .filter((area) => area.destinations.length >= MINIMUM_DESTINATIONS)
    .sort((a, b) => b.destinations.length - a.destinations.length || a.id.localeCompare(b.id));
  return cached;
}

export const areaById = (id: string): Area | null => areaCatalogue().find((area) => area.id === id) ?? null;

export interface AreaProfile {
  /** How many destinations in the area are recommendable in each month, 1..12. */
  monthCounts: number[];
  /** The months where the most of the area is open. */
  peakMonths: number[];
  quietMonths: number[];
  elevationMinM: number;
  elevationMaxM: number;
  countries: string[];
}

export function areaProfile(area: Area): AreaProfile {
  const monthCounts = Array.from({length: 12}, (_, index) =>
    area.destinations.filter((destination) => destination.months[index]?.recommendationEligible).length);
  const best = Math.max(...monthCounts);
  const worst = Math.min(...monthCounts);
  const elevations = area.destinations.map((destination) => destination.representativeCell.modelElevationM);
  return {
    monthCounts,
    peakMonths: monthCounts.flatMap((count, index) => count === best ? [index + 1] : []),
    quietMonths: monthCounts.flatMap((count, index) => count === worst ? [index + 1] : []),
    elevationMinM: Math.round(Math.min(...elevations)),
    elevationMaxM: Math.round(Math.max(...elevations)),
    countries: [...new Set(area.destinations.map((destination) => destination.countryName))].sort(),
  };
}

/** The critical component that failed a month, the lowest when several did. */
function closingComponent(month: PublicMonth): CriticalComponentKey | null {
  if (month.recommendationEligible || !month.components) return null;
  const failing = CRITICAL_COMPONENT_KEYS.filter((key) => {
    const value = month.components![key];
    return !Number.isFinite(value) || value <= CRITICAL_COMPONENT_FLOOR;
  });
  if (!failing.length) return null;
  return failing.reduce((worst, key) => month.components![key] < month.components![worst] ? key : worst);
}

const tally = <T extends string>(values: Array<T | null>) => {
  const counts = new Map<T, number>();
  for (const value of values) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

const eligibleMonths = (destination: PublicDestination) =>
  destination.months.filter((month) => month.recommendationEligible).map((month) => month.month);

/** What closes most of a destination's withheld months, or null when none are withheld. */
function destinationClosingFactor(destination: PublicDestination): CriticalComponentKey | null {
  return tally(destination.months.map(closingComponent))[0]?.[0] ?? null;
}

const byElevation = (a: PublicDestination, b: PublicDestination) =>
  a.representativeCell.modelElevationM - b.representativeCell.modelElevationM || a.slug.localeCompare(b.slug);
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * Everything the prose says, computed once and locale-free, so the tests can
 * check the claims rather than parse the sentences.
 */
export interface AreaFacts {
  count: number;
  withheldCount: number;
  monthCounts: number[];
  peakMonths: number[];
  peakCount: number;
  quietMonths: number[];
  quietCount: number;
  /** Months in which no destination clears the gate. */
  closedMonths: number[];
  /** Area mean of the hiking-window temperature per month, warmest and coldest. */
  warmestMonth: number;
  coldestMonth: number;
  warmestMeanC: number;
  coldestMeanC: number;
  southernCount: number;
  lowest: PublicDestination;
  highest: PublicDestination;
  medianElevationM: number;
  longest: {destinations: PublicDestination[]; months: number};
  shortest: {destinations: PublicDestination[]; months: number};
  /** Destinations grouped by what closes most of their withheld months. */
  closingFactors: Array<[CriticalComponentKey, number]>;
  openAllYear: number;
  /** In the quietest month, what keeps the closed destinations out. */
  quietMonth: number;
  quietMonthFactors: Array<[CriticalComponentKey, number]>;
  /** The strongest month across the area and the spread of conditions in it. */
  conditionsMonth: number;
  conditions: {
    open: number;
    coolest: PublicDestination; coolestC: number;
    warmest: PublicDestination; warmestC: number;
    driestPct: number; wettestPct: number;
  };
}

export function areaFacts(area: Area): AreaFacts {
  const destinations = area.destinations;
  const profile = areaProfile(area);
  const count = destinations.length;
  const peakCount = Math.max(...profile.monthCounts);
  const quietCount = Math.min(...profile.monthCounts);

  const areaTemps = Array.from({length: 12}, (_, index) =>
    mean(destinations.map((destination) => destination.months[index].metrics.temperatureHikingMeanC)));
  const warmestMonth = areaTemps.indexOf(Math.max(...areaTemps)) + 1;
  const coldestMonth = areaTemps.indexOf(Math.min(...areaTemps)) + 1;

  const sorted = [...destinations].sort(byElevation);
  const elevations = sorted.map((destination) => destination.representativeCell.modelElevationM);
  const middle = Math.floor(elevations.length / 2);
  const medianElevationM = elevations.length % 2 ? elevations[middle] : (elevations[middle - 1] + elevations[middle]) / 2;

  const seasonLengths = destinations.map((destination) => eligibleMonths(destination).length);
  const longestMonths = Math.max(...seasonLengths);
  const shortestMonths = Math.min(...seasonLengths);
  const withLength = (months: number) => destinations.filter((destination) => eligibleMonths(destination).length === months);

  // The quietest month with any closure at all; the earliest on a tie.
  const quietMonth = profile.quietMonths[0];
  const quietMonthFactors = tally(destinations.map((destination) => closingComponent(destination.months[quietMonth - 1])));

  // The month where the open destinations score highest on average, among the
  // months where the most of the area is open.
  const strength = (month: number) => mean(destinations
    .flatMap((destination) => {
      const entry = destination.months[month - 1];
      return entry.recommendationEligible && entry.overallScore !== null ? [entry.overallScore] : [];
    }));
  const conditionsMonth = [...profile.peakMonths].sort((a, b) => strength(b) - strength(a) || a - b)[0];
  const open = destinations.filter((destination) => destination.months[conditionsMonth - 1].recommendationEligible);
  const temp = (destination: PublicDestination) => destination.months[conditionsMonth - 1].metrics.temperatureHikingMeanC;
  const wet = (destination: PublicDestination) => destination.months[conditionsMonth - 1].metrics.wetDayProbability;
  const byTemp = [...open].sort((a, b) => temp(a) - temp(b) || a.slug.localeCompare(b.slug));

  return {
    count,
    withheldCount: area.withheld.length,
    monthCounts: profile.monthCounts,
    peakMonths: profile.peakMonths,
    peakCount,
    quietMonths: profile.quietMonths,
    quietCount,
    closedMonths: profile.monthCounts.flatMap((value, index) => value === 0 ? [index + 1] : []),
    warmestMonth, coldestMonth,
    warmestMeanC: areaTemps[warmestMonth - 1],
    coldestMeanC: areaTemps[coldestMonth - 1],
    southernCount: destinations.filter((destination) => destination.coordinates.lat < 0).length,
    lowest: sorted[0],
    highest: sorted[sorted.length - 1],
    medianElevationM,
    longest: {destinations: withLength(longestMonths), months: longestMonths},
    shortest: {destinations: withLength(shortestMonths), months: shortestMonths},
    closingFactors: tally(destinations.map(destinationClosingFactor)),
    openAllYear: seasonLengths.filter((months) => months === 12).length,
    quietMonth,
    quietMonthFactors,
    conditionsMonth,
    conditions: {
      open: open.length,
      coolest: byTemp[0], coolestC: temp(byTemp[0]),
      warmest: byTemp[byTemp.length - 1], warmestC: temp(byTemp[byTemp.length - 1]),
      driestPct: Math.round(Math.min(...open.map(wet)) * 100),
      wettestPct: Math.round(Math.max(...open.map(wet)) * 100),
    },
  };
}

/** The region and continent pages a destination belongs to, where they exist. */
export function areasFor(destination: PublicDestination): Area[] {
  return [areaById(destination.region), areaById(destination.continent)].filter((area): area is Area => area !== null);
}

/** Areas with at least one destination recommendable in the month, busiest first. */
export function areasOpenIn(month: number): Array<{area: Area; count: number}> {
  return areaCatalogue()
    .map((area) => ({area, count: area.destinations.filter((destination) => destination.months[month - 1]?.recommendationEligible).length}))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.area.id.localeCompare(b.area.id));
}

/**
 * A region's continent, or a continent's regions. Membership is read from the
 * destinations themselves, so a region spanning two continents links to both.
 */
export function relatedAreas(area: Area): {parents: Area[]; children: Area[]} {
  const members = [...area.destinations, ...area.withheld];
  if (area.kind === "region") {
    const continents = [...new Set(members.map((destination) => destination.continent))];
    return {parents: continents.map(areaById).filter((item): item is Area => item !== null), children: []};
  }
  const regions = new Set(members.map((destination) => destination.region));
  return {parents: [], children: areaCatalogue().filter((item) => item.kind === "region" && regions.has(item.id))};
}
