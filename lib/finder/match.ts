import type { SearchDestination } from "@/lib/data/types";

export type SearchMonth = SearchDestination["monthly"][number];

/**
 * Months the traveller can go. An empty list means any month: people plan
 * around leave, not around a single date, so "June or July" is the normal
 * case rather than a special one.
 */
export type MonthSelection = number[];
export type SortKey = "match" | "score" | "warmest" | "name";

export interface FinderPreferences {
  /** Free-text destination name filter. Empty means no name constraint. */
  query: string;
  months: MonthSelection;
  continent: string;
  region: string;
  minTemp: number;
  maxTemp: number;
  avoidRain: boolean;
  avoidSnow: boolean;
  avoidHeat: boolean;
  /** Hard floor in hours. 0 means no daylight constraint. */
  minDaylight: number;
  /** Model elevation of the destination's representative cell, in metres. */
  minElevation: number;
  maxElevation: number;
  /** A destination must carry every selected tag. Empty means no tag constraint. */
  tags: string[];
  sort: SortKey;
}

export const ELEVATION_CEILING = 5000;

export const defaultPreferences: FinderPreferences = {
  query: "",
  months: [5],
  continent: "all",
  region: "all",
  minTemp: 10,
  maxTemp: 24,
  avoidRain: true,
  avoidSnow: true,
  avoidHeat: false,
  minDaylight: 0,
  minElevation: 0,
  maxElevation: ELEVATION_CEILING,
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
    if (destination.elevationM < preferences.minElevation || destination.elevationM > preferences.maxElevation) continue;

    const candidates = destination.monthly.filter((month) =>
      month.recommendationEligible
      && (preferences.months.length === 0 || preferences.months.includes(month.m))
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
  if (preferences.months.join(",") !== d.months.join(",")) params.set("m", preferences.months.join(","));
  if (preferences.continent !== d.continent) params.set("c", preferences.continent);
  if (preferences.region !== d.region) params.set("r", preferences.region);
  if (preferences.minTemp !== d.minTemp) params.set("tmin", String(preferences.minTemp));
  if (preferences.maxTemp !== d.maxTemp) params.set("tmax", String(preferences.maxTemp));
  if (preferences.avoidRain !== d.avoidRain) params.set("rain", preferences.avoidRain ? "1" : "0");
  if (preferences.avoidSnow !== d.avoidSnow) params.set("snow", preferences.avoidSnow ? "1" : "0");
  if (preferences.avoidHeat !== d.avoidHeat) params.set("heat", preferences.avoidHeat ? "1" : "0");
  if (preferences.minDaylight !== d.minDaylight) params.set("day", String(preferences.minDaylight));
  if (preferences.minElevation !== d.minElevation) params.set("emin", String(preferences.minElevation));
  if (preferences.maxElevation !== d.maxElevation) params.set("emax", String(preferences.maxElevation));
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
  const months: MonthSelection = rawMonth === null ? d.months
    : rawMonth === "" || rawMonth === "any" ? []
    : [...new Set(rawMonth.split(",").map(Number).filter((value) => Number.isInteger(value) && value >= 1 && value <= 12))].sort((a, b) => a - b);
  const sort = params.get("sort");
  return {
    query: params.get("q") ?? d.query,
    months,
    continent: params.get("c") ?? d.continent,
    region: params.get("r") ?? d.region,
    minTemp: number("tmin", d.minTemp),
    maxTemp: number("tmax", d.maxTemp),
    avoidRain: flag("rain", d.avoidRain),
    avoidSnow: flag("snow", d.avoidSnow),
    avoidHeat: flag("heat", d.avoidHeat),
    minDaylight: number("day", d.minDaylight),
    minElevation: number("emin", d.minElevation),
    maxElevation: number("emax", d.maxElevation),
    tags: (params.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : d.sort,
  };
}

/** A constraint that could be relaxed, and what relaxing it would yield. */
export interface Relaxation { key: "months" | "temperature" | "rain" | "snow" | "heat" | "daylight" | "elevation" | "region" | "tags"; patch: Partial<FinderPreferences>; results: number }

/**
 * When nothing matches, say what would help rather than only that nothing did.
 *
 * Each constraint is dropped on its own and the search re-run, so the offer is
 * measured rather than guessed: a suggestion only appears if it actually
 * produces results. The gate itself is never relaxed, so no suggestion can
 * surface a destination or month the science layer withholds.
 */
export function relaxations(destinations: SearchDestination[], preferences: FinderPreferences): Relaxation[] {
  const d = defaultPreferences;
  const candidates: Array<{key: Relaxation["key"]; patch: Partial<FinderPreferences>}> = [
    {key: "months", patch: {months: []}},
    {key: "temperature", patch: {minTemp: d.minTemp - 10, maxTemp: d.maxTemp + 8}},
    {key: "rain", patch: {avoidRain: false}},
    {key: "snow", patch: {avoidSnow: false}},
    {key: "heat", patch: {avoidHeat: false}},
    {key: "daylight", patch: {minDaylight: 0}},
    {key: "elevation", patch: {minElevation: 0, maxElevation: ELEVATION_CEILING}},
    {key: "region", patch: {continent: "all", region: "all"}},
    {key: "tags", patch: {tags: []}},
  ];
  const applies = (entry: (typeof candidates)[number]) =>
    Object.entries(entry.patch).some(([key, value]) =>
      JSON.stringify(preferences[key as keyof FinderPreferences]) !== JSON.stringify(value));
  return candidates
    .filter(applies)
    .map((entry) => ({...entry, results: matchDestinations(destinations, {...preferences, ...entry.patch}).length}))
    .filter((entry) => entry.results > 0)
    .sort((a, b) => b.results - a.results)
    .slice(0, 3);
}
