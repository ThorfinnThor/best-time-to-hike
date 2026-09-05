// Page identity: the locale-independent description of "which page is this".
//
// A URL segment list is locale-specific, so it cannot be translated by string
// substitution. Resolving segments to a PageId first, then rebuilding the URL
// in the target locale, is what makes correct hreflang possible: every
// alternate points at the real translation of the page instead of at the other
// locale's home page.
import { infoRouteKeys, locales, monthNumber, routes, themeKeys, type InfoRouteKey, type ThemeKey } from "@/lib/i18n/config";
import { links } from "@/lib/i18n/links";
import { areaById } from "@/lib/seo/areas";
import type { Locale } from "@/lib/data/types";

export type PageId =
  | { kind: "home" }
  | { kind: "finder" }
  | { kind: "destination"; slug: string }
  | { kind: "destinationMonth"; slug: string; month: number }
  | { kind: "ranking"; month: number }
  | { kind: "areaRanking"; area: string }
  | { kind: "themeRanking"; theme: ThemeKey; month: number }
  | { kind: "compare"; slug: string }
  | { kind: "compareTool" }
  | { kind: "info"; key: InfoRouteKey };

/** Parse locale-specific URL segments into a locale-independent page identity. */
export function resolvePageId(locale: Locale, segments: string[]): PageId | null {
  if (segments.length === 0) return { kind: "home" };
  const [head, ...rest] = segments;

  if (head === routes.finder[locale] && rest.length === 0) return { kind: "finder" };

  if (head === routes.destination[locale] && rest[0]) {
    if (rest.length === 1) return { kind: "destination", slug: rest[0] };
    if (rest.length === 2) {
      const month = monthNumber(rest[1], locale);
      return month ? { kind: "destinationMonth", slug: rest[0], month } : null;
    }
    return null;
  }

  if (head === routes.rankings[locale] && rest.length === 1) {
    // Month slugs win: they are a closed set, so an area can never shadow one.
    const month = monthNumber(rest[0], locale);
    if (month) return { kind: "ranking", month };
    return areaById(rest[0]) ? { kind: "areaRanking", area: rest[0] } : null;
  }

  for (const theme of themeKeys) {
    if (head === routes[theme][locale] && rest.length === 1) {
      const month = monthNumber(rest[0], locale);
      return month ? { kind: "themeRanking", theme, month } : null;
    }
  }

  if (head === routes.compare[locale]) {
    if (rest.length === 0) return { kind: "compareTool" };
    if (rest.length === 1) return { kind: "compare", slug: rest[0] };
    return null;
  }

  const info = infoRouteKeys.find((key) => routes[key][locale] === head);
  if (info && rest.length === 0) return { kind: "info", key: info };

  return null;
}

/** Build the URL for a page identity in any locale. */
export function pathFor(page: PageId, locale: Locale): string {
  switch (page.kind) {
    case "home": return links.home(locale);
    case "finder": return links.finder(locale);
    case "destination": return links.destination(locale, page.slug);
    case "destinationMonth": return links.destinationMonth(locale, page.slug, page.month);
    case "ranking": return links.ranking(locale, page.month);
    case "areaRanking": return links.areaRanking(locale, page.area);
    case "themeRanking": return links.themeRanking(locale, page.theme, page.month);
    case "compare": return links.compare(locale, page.slug);
    case "compareTool": return links.compareIndex(locale);
    case "info": return links[page.key](locale);
  }
}

/** The same page in every locale, for hreflang and language switching. */
export function pathForEveryLocale(page: PageId): Record<Locale, string> {
  return Object.fromEntries(locales.map((locale) => [locale, pathFor(page, locale)])) as Record<Locale, string>;
}
