import config from "@/data-config/sources/route-above-model-cell.json";

/**
 * Destinations whose walked route lies clearly above the selected model cell.
 *
 * Display only: the list feeds a notice on the destination and month pages and
 * nothing else. It changes no score, gate, eligibility or ranking.
 */
export interface RouteAboveModel {
  route: string;
  routeElevationM: number;
  routePoints: {name: string; elevationM: number}[];
  sources: {title: string; url: string}[];
}

const ENTRIES = config.destinations as Record<string, RouteAboveModel>;

export const routeAboveModelIds = (): string[] => Object.keys(ENTRIES).sort();

export const routeAboveModel = (id: string): RouteAboveModel | null => ENTRIES[id] ?? null;
