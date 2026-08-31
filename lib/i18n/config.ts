import months from "@/data-config/taxonomies/months.json";
import type { Locale } from "@/lib/data/types";

export const locales: Locale[] = ["en", "de"];
export const monthSlug = (month: number, locale: Locale) => months.find((item)=>item.number===month)![locale];
export const monthNumber = (slug: string, locale: Locale) => months.find((item)=>item[locale]===slug)?.number;
export const monthName = (month: number, locale: Locale) => new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US",{month:"long",timeZone:"UTC"}).format(new Date(Date.UTC(2020,month-1,1)));

export const routes = {
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

export function destinationPath(locale: Locale, slug: string, month?: number) {
  return `/${locale}/${routes.destination[locale]}/${slug}${month ? `/${monthSlug(month,locale)}` : ""}`;
}
export function rankingPath(locale: Locale, month: number) { return `/${locale}/${routes.rankings[locale]}/${monthSlug(month,locale)}`; }
export function comparePath(locale: Locale, slug: string) { return `/${locale}/${routes.compare[locale]}/${slug}`; }
