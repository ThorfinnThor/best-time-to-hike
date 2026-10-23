// Locale, route-segment and month taxonomy. Both locales are path-prefixed
// (/en, /de) and every route type carries its own translated segment.
// English is the default locale: "/" permanently redirects to /en and is the
// hreflang x-default.
//
// This file owns *what the slugs are*. lib/i18n/links.ts owns *how URLs are
// built* and lib/i18n/dict.ts owns *what the interface says*. Never hardcode a
// locale path or an inline `locale === "de" ? ... : ...` string in a component.
import months from "@/data-config/taxonomies/months.json";
import type { Locale } from "@/lib/data/types";

export const locales: Locale[] = ["en", "de"];
export const defaultLocale: Locale = "en";
export const otherLocale = (locale: Locale): Locale => (locale === "en" ? "de" : "en");

/** Locale prefix for building hrefs. */
export const prefix = (locale: Locale) => `/${locale}`;

export const monthSlug = (month: number, locale: Locale) => months.find((item)=>item.number===month)![locale];
export const monthNumber = (slug: string, locale: Locale) => months.find((item)=>item[locale]===slug)?.number;
export const monthName = (month: number, locale: Locale) => new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US",{month:"long",timeZone:"UTC"}).format(new Date(Date.UTC(2020,month-1,1)));
export const monthNameShort = (month: number, locale: Locale) => monthName(month, locale).slice(0, 3);

/**
 * A set of months as a readable adverbial phrase, for titles, descriptions and
 * headings: "all year", "all year except July", "from May to September",
 * "in April and from October to December". Runs wrap around the new year, so
 * November, December and January read as one span.
 *
 * Joining eleven month names with slashes was what a search snippet showed
 * before this existed, which no reader can take in at a glance.
 */
export function monthSpan(input: readonly number[], locale: Locale): string {
  const de = locale === "de";
  const set = new Set(input.filter((month) => month >= 1 && month <= 12));
  const name = (month: number) => monthName(month, locale);
  const list = (items: string[]) => items.length <= 1 ? items.join("")
    : `${items.slice(0, -1).join(", ")} ${de ? "und" : "and"} ${items[items.length - 1]}`;
  if (set.size === 0) return "";
  if (set.size === 12) return de ? "ganzjährig" : "all year";
  if (set.size >= 9) {
    const missing = Array.from({length: 12}, (_, index) => index + 1).filter((month) => !set.has(month));
    return `${de ? "ganzjährig außer" : "all year except"} ${list(missing.map(name))}`;
  }
  // Start the walk just after a gap, so a run across December stays whole.
  const start = Array.from({length: 12}, (_, index) => index + 1).find((month) => set.has(month) && !set.has(month === 1 ? 12 : month - 1))!;
  const runs: number[][] = [];
  for (let offset = 0; offset < 12; offset += 1) {
    const month = ((start - 1 + offset) % 12) + 1;
    if (!set.has(month)) continue;
    const previous = month === 1 ? 12 : month - 1;
    if (runs.length && set.has(previous) && offset > 0) runs[runs.length - 1].push(month);
    else runs.push([month]);
  }
  return list(runs.map((run) => run.length === 1
    ? `${de ? "im" : "in"} ${name(run[0])}`
    : run.length === 2
      ? `${de ? "im" : "in"} ${name(run[0])} ${de ? "und" : "and"} ${name(run[1])}`
      : `${de ? "von" : "from"} ${name(run[0])} ${de ? "bis" : "to"} ${name(run[run.length - 1])}`));
}

/** Route-type path segment per locale. Destination slugs themselves stay canonical. */
export const routes = {
  finder: {en:"finder",de:"finder"},
  destination: {en:"hiking-destinations",de:"wanderziele"},
  rankings: {en:"best-hiking-destinations",de:"beste-wanderziele"},
  compare: {en:"compare",de:"vergleich"},
  methodology: {en:"methodology",de:"methodik"},
  about: {en:"about",de:"ueber-uns"},
  privacy: {en:"privacy",de:"datenschutz"},
  imprint: {en:"imprint",de:"impressum"},
  credits: {en:"image-credits",de:"bildnachweis"},
  warm: {en:"warm-hiking",de:"warm-wandern"},
  snowFree: {en:"snow-free-hiking",de:"schneefrei-wandern"},
  lowRain: {en:"low-rain-hiking",de:"wenig-regen-wandern"},
  blog: {en:"blog",de:"blog"}
} as const;

export type RouteKey = keyof typeof routes;
export const seg = (key: RouteKey, locale: Locale) => routes[key][locale];

/** Route keys that render a static information page. */
export const infoRouteKeys = ["methodology","about","privacy","imprint","credits"] as const;
export type InfoRouteKey = (typeof infoRouteKeys)[number];

/** Ranking theme ids as used by the export, and the route key each maps to. */
export const themes = {warm:"warm",snowFree:"snow-free",lowRain:"low-rain"} as const;
export type ThemeKey = keyof typeof themes;
export const themeKeys = Object.keys(themes) as ThemeKey[];
