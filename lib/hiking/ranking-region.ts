export const rankingRegions = ["worldwide", "europe", "americas", "north-america", "south-america", "asia", "africa", "oceania"] as const;
export type RankingRegion = typeof rankingRegions[number];

export function parseRankingRegion(value: string | null): RankingRegion {
  return rankingRegions.includes(value as RankingRegion) ? value as RankingRegion : "worldwide";
}

export function filterRankingRegion<T extends { continent: string }>(entries: T[], region: RankingRegion): T[] {
  return entries.filter((entry) => region === "worldwide" || entry.continent === region
    || (region === "americas" && ["north-america", "south-america"].includes(entry.continent)));
}

export function rankingRegionHref(href: string, region: RankingRegion): string {
  return region === "worldwide" ? href : `${href}?region=${region}`;
}
