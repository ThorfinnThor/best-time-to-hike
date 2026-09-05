import { getAllDestinations } from "@/lib/data/load";
import type { PublicDestination } from "@/lib/data/types";

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
