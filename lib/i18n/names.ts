import names from "@/data-config/i18n/destination-names.json";
import type { Locale } from "@/lib/data/types";

/**
 * Destination and country names in the reader's language.
 *
 * The published data carries one catalogue name per destination, in English,
 * and an English country name. German pages printed "Beste Wanderzeit für
 * Dolomites" and "Spain · Mittelmeerraum". Names are a presentation concern, so
 * they are localised here at render time and the exported data stays as it is.
 *
 * Only established German forms are listed (Dolomiten, Teneriffa, Tafelberg);
 * a proper name with no German form keeps its catalogue name rather than an
 * invented translation.
 */
const GERMAN: Readonly<Record<string, string>> = names.de;

export function destinationName(destination: {slug: string; name: string}, locale: Locale): string {
  return locale === "de" ? GERMAN[destination.slug] ?? destination.name : destination.name;
}

const regionNames = new Map<Locale, Intl.DisplayNames>();

/** The country for an ISO 3166 code in the page language; the stored English name is the fallback. */
export function countryName(destination: {countryCode: string; countryName: string}, locale: Locale): string {
  if (locale === "en") return destination.countryName;
  let display = regionNames.get(locale);
  if (!display) {
    display = new Intl.DisplayNames([locale], {type: "region"});
    regionNames.set(locale, display);
  }
  try {
    return display.of(destination.countryCode.toUpperCase()) ?? destination.countryName;
  } catch {
    return destination.countryName;
  }
}
