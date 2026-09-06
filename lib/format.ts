import type { Locale } from "@/lib/data/types";

/**
 * One place that decides how a measured value is written.
 *
 * The same monthly mean appeared as 18.9 °C on a ranking row, 19°C on a card
 * and 5.3°C in the stats strip, and a representative cell printed as "46, 7.7"
 * because 46.0 lost its zero. Three precisions for one quantity reads as three
 * different measurements.
 *
 * The rules: temperature to the tenth the data actually carries, elevation in
 * whole metres because the 0.1 degree grid supports nothing finer, and
 * coordinates to the tenth the grid is spaced on.
 */
const nf = (locale: Locale, digits: number) =>
  new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {minimumFractionDigits: digits, maximumFractionDigits: digits});

/**
 * Data displays get the tenth the record carries. Values that sit inside a
 * sentence take `digits: 0`, because "the cold end sits at -0.6°C" is worse
 * prose than "-1°C" and the number is doing a different job there.
 */
export const degreesC = (value: number, locale: Locale, digits: 0 | 1 = 1) => `${nf(locale, digits).format(value)}°C`;
export const metres = (value: number, locale: Locale) => `${nf(locale, 0).format(Math.round(value))} m`;
/** Coordinates are identifiers, not prose, so they keep the dot in both locales. */
export const coordinate = (value: number) => value.toFixed(1);
export const cellLabel = (lat: number, lon: number) => `${coordinate(lat)}, ${coordinate(lon)}`;

/** A band spans two elevations; a single grid cell does not, and says so. */
export const metreRange = (minM: number, maxM: number, locale: Locale) =>
  Math.round(minM) === Math.round(maxM)
    ? metres(maxM, locale)
    : `${nf(locale, 0).format(Math.round(minM))}–${metres(maxM, locale)}`;
