import strategy from "@/data-config/seo/indexability-strategy-v1.json";
import destinationScience from "@/data-config/seo/destination-indexability-science-v1.json";
import { themes, type ThemeKey } from "@/lib/i18n/config";

/**
 * The route catalogue describes what the static site can render. This file
 * describes the much smaller set that may compete in search. Keeping those
 * concerns separate prevents a new template or dataset row from silently
 * expanding the sitemap.
 */
export const INDEXABILITY_STRATEGY = strategy;

const areaAllowlist = new Set(strategy.families.areas.selected);
const themeAllowlist = new Set<string>(strategy.families.themeMonthlyRankings.selected);
const comparisonAllowlist = new Set(strategy.families.comparisons.selected);
const destinationAllowlist = new Set(strategy.families.destinations.selected);
const scienceApprovedDestinations = new Set(
  destinationScience.status === "APPROVED_FOR_INDEXABILITY_UNDER_SELECTED_CELL_CLAIM"
    ? destinationScience.approvedDestinations
    : [],
);

export const areaIsCurated = (area: string) => areaAllowlist.has(area);
export const themeIsCurated = (theme: ThemeKey) => themeAllowlist.has(themes[theme]);
export const comparisonIsCurated = (slug: string) => comparisonAllowlist.has(slug);
export const destinationIsCurated = (slug: string) => destinationAllowlist.has(slug);
export const destinationScienceIsCleared = (slug: string) => scienceApprovedDestinations.has(slug);

export function jaccard(left: readonly string[], right: readonly string[]): number {
  const a = new Set(left);
  const b = new Set(right);
  const intersection = [...a].filter((item) => b.has(item)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 1;
}
