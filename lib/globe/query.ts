/**
 * The globe's shareable state lives in the address: `?month=7&to=pirin` opens
 * July and flies to Pirin. These helpers stay free of browser and three.js code
 * so they can be tested on their own.
 */
export const GLOBE_DESTINATION_PARAM = "to";

export interface GlobeQuery {
  /** 1-12, or null when the address has no valid month. */
  month: number | null;
  /** Index into the destinations list, or null when the address names none we know. */
  index: number | null;
}

export function readGlobeQuery(search: string, slugs: string[]): GlobeQuery {
  const params = new URLSearchParams(search);
  const month = Number(params.get("month"));
  const slug = params.get(GLOBE_DESTINATION_PARAM);
  const index = slug ? slugs.indexOf(slug) : -1;
  return {
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : null,
    index: index >= 0 ? index : null,
  };
}

/** The address for a month and an optional destination; other parameters are kept. */
export function writeGlobeQuery(href: string, month: number, slug: string | null): string {
  const url = new URL(href);
  url.searchParams.set("month", String(month));
  if (slug) url.searchParams.set(GLOBE_DESTINATION_PARAM, slug);
  else url.searchParams.delete(GLOBE_DESTINATION_PARAM);
  return url.toString();
}
