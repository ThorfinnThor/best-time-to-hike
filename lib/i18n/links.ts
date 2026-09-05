// Locale-aware URL builders and hreflang alternates.
//
// Every internal link must go through these builders. Hardcoding a locale path
// is how the sibling project shipped its i18n leaks (climate-decision-engine
// mistakes.md #8): a link written once in one locale survives every later
// refactor and quietly sends German readers to English pages.
import { monthSlug, prefix, routes, type ThemeKey } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/site";
import type { Locale } from "@/lib/data/types";

const themeRoute: Record<ThemeKey, keyof typeof routes> = {
  warm: "warm",
  snowFree: "snowFree",
  lowRain: "lowRain",
};

export const links = {
  home: (locale: Locale) => prefix(locale),
  finder: (locale: Locale) => `${prefix(locale)}/${routes.finder[locale]}`,
  destination: (locale: Locale, slug: string) => `${prefix(locale)}/${routes.destination[locale]}/${slug}`,
  destinationMonth: (locale: Locale, slug: string, month: number) => `${prefix(locale)}/${routes.destination[locale]}/${slug}/${monthSlug(month, locale)}`,
  areaRanking: (locale: Locale, area: string) => `${prefix(locale)}/${routes.rankings[locale]}/${area}`,
  ranking: (locale: Locale, month: number) => `${prefix(locale)}/${routes.rankings[locale]}/${monthSlug(month, locale)}`,
  themeRanking: (locale: Locale, theme: ThemeKey, month: number) => `${prefix(locale)}/${routes[themeRoute[theme]][locale]}/${monthSlug(month, locale)}`,
  compareIndex: (locale: Locale) => `${prefix(locale)}/${routes.compare[locale]}`,
  compare: (locale: Locale, slug: string) => `${prefix(locale)}/${routes.compare[locale]}/${slug}`,
  methodology: (locale: Locale) => `${prefix(locale)}/${routes.methodology[locale]}`,
  about: (locale: Locale) => `${prefix(locale)}/${routes.about[locale]}`,
  privacy: (locale: Locale) => `${prefix(locale)}/${routes.privacy[locale]}`,
  imprint: (locale: Locale) => `${prefix(locale)}/${routes.imprint[locale]}`,
  credits: (locale: Locale) => `${prefix(locale)}/${routes.credits[locale]}`,
} as const;

/** Back-compat aliases for the original three helpers. */
export const destinationPath = (locale: Locale, slug: string, month?: number) =>
  month ? links.destinationMonth(locale, slug, month) : links.destination(locale, slug);
export const rankingPath = links.ranking;
export const comparePath = links.compare;

/**
 * hreflang alternates for Next metadata. `pathFor` must build the same page in
 * any locale, so the alternates always point at the true translation rather
 * than at the locale home page.
 */
export function altLanguages(pathFor: (locale: Locale) => string, current: Locale) {
  const languages: Record<string, string> = {};
  for (const locale of ["en", "de"] as Locale[]) languages[locale] = absoluteUrl(pathFor(locale));
  languages["x-default"] = absoluteUrl(pathFor("en"));
  return { canonical: absoluteUrl(pathFor(current)), languages };
}
