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
  lowRain: {en:"low-rain-hiking",de:"wenig-regen-wandern"}
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
