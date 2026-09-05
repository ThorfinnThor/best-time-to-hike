import type { SearchDestination } from "@/lib/data/types";

export type SearchMonth = SearchDestination["monthly"][number];

/** A specific month, or "any" to search every month a destination can be recommended in. */
export type MonthSelection = number | "any";
export type SortKey = "match" | "score" | "warmest" | "name";

export interface FinderPreferences {
  /** Free-text destination name filter. Empty means no name constraint. */
  query: string;
  month: MonthSelection;
  continent: string;
  region: string;
  minTemp: number;
  maxTemp: number;
  avoidRain: boolean;
  avoidSnow: boolean;
  avoidHeat: boolean;
  /** Hard floor in hours. 0 means no daylight constraint. */
  minDaylight: number;
  /** A destination must carry every selected tag. Empty means no tag constraint. */
  tags: string[];
  sort: SortKey;
}

export const defaultPreferences: FinderPreferences = {
  query: "",
  month: 5,
  continent: "all",
  region: "all",
  minTemp: 10,
  maxTemp: 24,
  avoidRain: true,
  avoidSnow: true,
  avoidHeat: false,
  minDaylight: 0,
  tags: [],
  sort: "match",
};

export type ReasonKey = "comfortable" | "cool" | "warm" | "dry" | "wet" | "snowFree" | "longDays";

export interface FinderResult {
  destination: SearchDestination;
  month: SearchMonth;
  match: number;
  reasons: ReasonKey[];
}

export interface Facets {
  continents: string[];
  regionsByContinent: Record<string, string[]>;
  tags: string[];
}

/**
 * The filter options a catalogue actually supports. Derived from the data
 * rather than hardcoded: the previous fixed list offered europe/alps/
 * macaronesia and left 24 of 46 destinations unreachable.
 */
export function facetsFor(destinations: SearchDestination[]): Facets {
  const regionsByContinent: Record<string, Set<string>> = {};
  const tags = new Set<string>();
  for (const destination of destinations) {
    if (!destination.recommendationEligible) continue;
    (regionsByContinent[destination.continent] ??= new Set()).add(destination.region);
    for (const tag of destination.tags) tags.add(tag);
  }
  return {
    continents: Object.keys(regionsByContinent).sort(),
    regionsByContinent: Object.fromEntries(Object.entries(regionsByContinent).map(([key, set]) => [key, [...set].sort()])),
    tags: [...tags].sort(),
  };
}

function reasonsFor(month: SearchMonth, preferences: FinderPreferences): ReasonKey[] {
  const reasons: ReasonKey[] = [];
  if (month.temp >= preferences.minTemp && month.temp <= preferences.maxTemp) reasons.push("comfortable");
  else if (month.temp < preferences.minTemp) reasons.push("cool");
  else reasons.push("warm");
  if (month.wet <= 0.25) reasons.push("dry");
  else if (month.wet >= 0.5) reasons.push("wet");
  if (month.snow === 0) reasons.push("snowFree");
  if (month.daylight >= 14) reasons.push("longDays");
  return reasons;
}

function matchScore(month: SearchMonth, preferences: FinderPreferences): number {
  const temperaturePenalty = month.temp < preferences.minTemp
    ? (preferences.minTemp - month.temp) * 3
    : month.temp > preferences.maxTemp ? (month.temp - preferences.maxTemp) * 3 : 0;
  const rainPenalty = preferences.avoidRain ? month.wet * 32 : month.wet * 8;
  const snowPenalty = preferences.avoidSnow ? month.snow * 45 : month.snow * 6;
  const heatPenalty = preferences.avoidHeat ? month.hot * 40 : month.hot * 10;
  return Math.max(0, Math.min(100, month.score - temperaturePenalty - rainPenalty - snowPenalty - heatPenalty + 12));
}

/**
 * Preferences never overwrite a published hiking score; they produce a separate
 * match value. Months and destinations the science layer withholds are never
 * candidates, whatever the preferences say.
 */
export function matchDestinations(destinations: SearchDestination[], preferences: FinderPreferences): FinderResult[] {
  const results: FinderResult[] = [];

  const needle = preferences.query.trim().toLowerCase();
  for (const destination of destinations) {
    if (!destination.recommendationEligible) continue;
    if (needle && !destination.name.toLowerCase().includes(needle) && !destination.slug.includes(needle)) continue;
    if (preferences.continent !== "all" && destination.continent !== preferences.continent) continue;
    if (preferences.region !== "all" && destination.region !== preferences.region) continue;
    if (preferences.tags.length && !preferences.tags.every((tag) => destination.tags.includes(tag))) continue;

    const candidates = destination.monthly.filter((month) =>
      month.recommendationEligible
      && (preferences.month === "any" || month.m === preferences.month)
      && month.daylight >= preferences.minDaylight);
    if (!candidates.length) continue;

    let best: FinderResult | null = null;
    for (const month of candidates) {
      const match = Math.round(matchScore(month, preferences));
      if (!best || match > best.match || (match === best.match && month.score > best.month.score)) {
        best = { destination, month, match, reasons: reasonsFor(month, preferences) };
      }
    }
    if (best) results.push(best);
  }

  return sortResults(results, preferences.sort);
}

export function sortResults(results: FinderResult[], sort: SortKey): FinderResult[] {
  const byName = (a: FinderResult, b: FinderResult) => a.destination.name.localeCompare(b.destination.name);
  const tiebreak = (a: FinderResult, b: FinderResult) => b.month.score - a.month.score || a.destination.slug.localeCompare(b.destination.slug);
  const comparators: Record<SortKey, (a: FinderResult, b: FinderResult) => number> = {
    match: (a, b) => b.match - a.match || tiebreak(a, b),
    score: (a, b) => b.month.score - a.month.score || b.match - a.match || a.destination.slug.localeCompare(b.destination.slug),
    warmest: (a, b) => b.month.temp - a.month.temp || tiebreak(a, b),
    name: (a, b) => byName(a, b) || tiebreak(a, b),
  };
  return [...results].sort(comparators[sort]);
}

/**
 * Search state travels in the URL so a result can be bookmarked or sent to
 * someone. Only values that differ from the defaults are written, which keeps
 * a shared link readable and means the default search has a clean URL.
 */
const SORT_KEYS: SortKey[] = ["match", "score", "warmest", "name"];

export function preferencesToQuery(preferences: FinderPreferences): string {
  const params = new URLSearchParams();
  const d = defaultPreferences;
  if (preferences.query.trim()) params.set("q", preferences.query.trim());
  if (preferences.month !== d.month) params.set("m", String(preferences.month));
  if (preferences.continent !== d.continent) params.set("c", preferences.continent);
  if (preferences.region !== d.region) params.set("r", preferences.region);
  if (preferences.minTemp !== d.minTemp) params.set("tmin", String(preferences.minTemp));
  if (preferences.maxTemp !== d.maxTemp) params.set("tmax", String(preferences.maxTemp));
  if (preferences.avoidRain !== d.avoidRain) params.set("rain", preferences.avoidRain ? "1" : "0");
  if (preferences.avoidSnow !== d.avoidSnow) params.set("snow", preferences.avoidSnow ? "1" : "0");
  if (preferences.avoidHeat !== d.avoidHeat) params.set("heat", preferences.avoidHeat ? "1" : "0");
  if (preferences.minDaylight !== d.minDaylight) params.set("day", String(preferences.minDaylight));
  if (preferences.tags.length) params.set("tags", [...preferences.tags].sort().join(","));
  if (preferences.sort !== d.sort) params.set("sort", preferences.sort);
  return params.toString();
}

export function preferencesFromQuery(search: string): FinderPreferences {
  const params = new URLSearchParams(search);
  const d = defaultPreferences;
  const number = (key: string, fallback: number) => {
    const raw = params.get(key);
    const value = raw === null ? Number.NaN : Number(raw);
    return Number.isFinite(value) ? value : fallback;
  };
  const flag = (key: string, fallback: boolean) => {
    const raw = params.get(key);
    return raw === "1" ? true : raw === "0" ? false : fallback;
  };
  const rawMonth = params.get("m");
  const month: MonthSelection = rawMonth === "any" ? "any"
    : rawMonth !== null && Number.isInteger(Number(rawMonth)) && Number(rawMonth) >= 1 && Number(rawMonth) <= 12 ? Number(rawMonth)
    : d.month;
  const sort = params.get("sort");
  return {
    query: params.get("q") ?? d.query,
    month,
    continent: params.get("c") ?? d.continent,
    region: params.get("r") ?? d.region,
    minTemp: number("tmin", d.minTemp),
    maxTemp: number("tmax", d.maxTemp),
    avoidRain: flag("rain", d.avoidRain),
    avoidSnow: flag("snow", d.avoidSnow),
    avoidHeat: flag("heat", d.avoidHeat),
    minDaylight: number("day", d.minDaylight),
    tags: (params.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : d.sort,
  };
}
