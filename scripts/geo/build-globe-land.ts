import { readFileSync, writeFileSync } from "node:fs";

/**
 * Land dots for the hiking globe, from Natural Earth 1:110m land (public domain).
 *
 *   pnpm data:globe-land -- <path to ne_110m_land.geojson>
 *
 * Source: https://github.com/nvkelso/natural-earth-vector, tag v5.1.2,
 * geojson/ne_110m_land.geojson. Only the dots are committed; the GeoJSON is a
 * one-off input. Points come from a Fibonacci sphere, so they are evenly spaced
 * on the globe rather than bunched at the poles as a lat/lon grid would be, and
 * the output is byte-identical on every run.
 */
type Ring = Array<[number, number]>;
const SAMPLES = 16000;
const OUT = "lib/globe/land-points.json";

function insideRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function main() {
  const source = process.argv[2];
  if (!source) throw new Error("Pass the path to ne_110m_land.geojson.");
  const geo = JSON.parse(readFileSync(source, "utf8")) as {features: Array<{geometry: {type: string; coordinates: unknown}}>};
  const polygons: Ring[][] = geo.features.flatMap(({geometry}) =>
    geometry.type === "Polygon" ? [geometry.coordinates as Ring[]]
      : geometry.type === "MultiPolygon" ? (geometry.coordinates as Ring[][]) : []);

  const points: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < SAMPLES; i += 1) {
    const y = 1 - (i / (SAMPLES - 1)) * 2;
    const theta = golden * i;
    const lat = (Math.asin(y) * 180) / Math.PI;
    let lon = ((theta * 180) / Math.PI) % 360;
    if (lon > 180) lon -= 360;
    // Inside the outer ring and outside every hole.
    const onLand = polygons.some(([outer, ...holes]) => insideRing(lon, lat, outer) && !holes.some((hole) => insideRing(lon, lat, hole)));
    if (onLand) points.push(Math.round(lat * 10) / 10, Math.round(lon * 10) / 10);
  }
  writeFileSync(OUT, `${JSON.stringify({
    source: "Natural Earth 1:110m land, v5.1.2 (public domain), sampled on a Fibonacci sphere",
    samples: SAMPLES,
    latLon: points,
  })}\n`);
  console.log(`Globe land: ${points.length / 2} of ${SAMPLES} sample points on land -> ${OUT}`);
}

main();
