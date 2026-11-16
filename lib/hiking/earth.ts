import type { PublicDestination } from "@/lib/data/types";

/**
 * A Google Earth 3D view of a destination's walking area.
 *
 * Only a link: nothing loads from Google until the reader opens it, so there is
 * no consent, CSP or privacy change. It centres on the destination coordinate,
 * which is placed where people walk (mistakes.md #23), not on the ERA5-Land
 * cell, and looks at it from about 12 km away at a 60 degree tilt. The URL form
 * is @lat,lon,altitude a,distance d,field-of-view y,heading h,tilt t,roll r.
 */
export function googleEarthUrl(destination: Pick<PublicDestination, "coordinates" | "elevation">): string {
  const lat = destination.coordinates.lat.toFixed(5);
  const lon = destination.coordinates.lon.toFixed(5);
  const altitude = Math.max(0, Math.round(destination.elevation.medianM));
  return `https://earth.google.com/web/@${lat},${lon},${altitude}a,12000d,35y,0h,60t,0r`;
}
