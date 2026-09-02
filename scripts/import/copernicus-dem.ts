import { fromUrl } from "geotiff";

export type Position = [number, number];
export type PolygonCoordinates = Position[][];
export type MultiPolygonCoordinates = Position[][][];

export interface DemGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: PolygonCoordinates | MultiPolygonCoordinates;
}

export interface DemSourceObject {
  tileId: string;
  url: string;
  etag: string | null;
  lastModified: string | null;
  contentLength: number | null;
}

const BUCKET_URL = "https://copernicus-dem-30m.s3.amazonaws.com";
const imageCache = new Map<string, ReturnType<typeof loadImage>>();

function pad(value: number, width: number) {
  return Math.abs(value).toString().padStart(width, "0");
}

export function tileIdForCoordinate(lat: number, lon: number) {
  const south = Math.floor(lat);
  const west = Math.floor(lon);
  const northing = `${south >= 0 ? "N" : "S"}${pad(south, 2)}_00`;
  const easting = `${west >= 0 ? "E" : "W"}${pad(west, 3)}_00`;
  return `Copernicus_DSM_COG_10_${northing}_${easting}_DEM`;
}

export function tileUrl(tileId: string) {
  return `${BUCKET_URL}/${tileId}/${tileId}.tif`;
}

function rings(geometry: DemGeometry): PolygonCoordinates[] {
  return geometry.type === "Polygon"
    ? [geometry.coordinates as PolygonCoordinates]
    : geometry.coordinates as MultiPolygonCoordinates;
}

export function geometryBounds(geometry: DemGeometry): [number, number, number, number] {
  const positions = rings(geometry).flat(2) as unknown as Position[];
  if (!positions.length) throw new Error("DEM001 geometry contains no coordinates");
  const longitudes = positions.map(([lon]) => lon);
  const latitudes = positions.map(([, lat]) => lat);
  return [Math.min(...longitudes), Math.min(...latitudes), Math.max(...longitudes), Math.max(...latitudes)];
}

function pointOnSegment(point: Position, first: Position, second: Position, tolerance = 1e-12) {
  const [x, y] = point;
  const [x1, y1] = first;
  const [x2, y2] = second;
  const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
  if (Math.abs(cross) > tolerance) return false;
  return x >= Math.min(x1, x2) - tolerance && x <= Math.max(x1, x2) + tolerance
    && y >= Math.min(y1, y2) - tolerance && y <= Math.max(y1, y2) + tolerance;
}

function pointInRing(point: Position, ring: Position[]) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const first = ring[index];
    const second = ring[previous];
    if (pointOnSegment(point, first, second)) return true;
    const intersects = (first[1] > point[1]) !== (second[1] > point[1])
      && point[0] < ((second[0] - first[0]) * (point[1] - first[1])) / (second[1] - first[1]) + first[0];
    if (intersects) inside = !inside;
  }
  return inside;
}

type LongitudeInterval = [number, number];
type RasterRowPolygon = LongitudeInterval[][];

function ringIntervalsAtLatitude(ring: Position[], latitude: number) {
  const crossings: number[] = [];
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const first = ring[index];
    const second = ring[previous];
    if ((first[1] > latitude) === (second[1] > latitude)) continue;
    crossings.push(first[0] + (latitude - first[1]) * (second[0] - first[0]) / (second[1] - first[1]));
  }
  crossings.sort((first, second) => first - second);
  const intervals: LongitudeInterval[] = [];
  for (let index = 0; index + 1 < crossings.length; index += 2) {
    intervals.push([crossings[index], crossings[index + 1]]);
  }
  return intervals;
}

function rasterRowPolygons(geometry: DemGeometry, latitude: number): RasterRowPolygon[] {
  return rings(geometry).map((polygon) => polygon.map((ring) => ringIntervalsAtLatitude(ring, latitude)));
}

function intervalsContain(intervals: LongitudeInterval[], longitude: number) {
  return intervals.some(([minimum, maximum]) => longitude >= minimum && longitude <= maximum);
}

function rasterRowContains(polygons: RasterRowPolygon[], longitude: number) {
  return polygons.some(([outer, ...holes]) => intervalsContain(outer, longitude)
    && holes.every((hole) => !intervalsContain(hole, longitude)));
}

export function geometryContainsForRasterRow(geometry: DemGeometry, latitude: number) {
  const polygons = rasterRowPolygons(geometry, latitude);
  return (longitude: number) => rasterRowContains(polygons, longitude);
}

export function geometryContains(geometry: DemGeometry, point: Position) {
  return rings(geometry).some((polygon) => pointInRing(point, polygon[0])
    && polygon.slice(1).every((hole) => !pointInRing(point, hole)));
}

function pointSegmentDistanceKm(point: Position, first: Position, second: Position) {
  const referenceLat = (point[1] + first[1] + second[1]) / 3 * Math.PI / 180;
  const toLocal = ([lon, lat]: Position): Position => [
    lon * 111.32 * Math.cos(referenceLat),
    lat * 110.574
  ];
  const [px, py] = toLocal(point);
  const [ax, ay] = toLocal(first);
  const [bx, by] = toLocal(second);
  const dx = bx - ax;
  const dy = by - ay;
  const denominator = dx * dx + dy * dy;
  const projection = denominator === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denominator));
  return Math.hypot(px - (ax + projection * dx), py - (ay + projection * dy));
}

export function geometryDistanceKm(geometry: DemGeometry, point: Position) {
  if (geometryContains(geometry, point)) return 0;
  return Math.min(...rings(geometry).flatMap((polygon) => polygon.flatMap((ring) =>
    ring.slice(1).map((position, index) => pointSegmentDistanceKm(point, ring[index], position)))));
}

export function tileIdsForGeometry(geometry: DemGeometry) {
  const [minLon, minLat, maxLon, maxLat] = geometryBounds(geometry);
  const ids: string[] = [];
  for (let south = Math.floor(minLat); south < Math.ceil(maxLat); south += 1) {
    for (let west = Math.floor(minLon); west < Math.ceil(maxLon); west += 1) {
      ids.push(tileIdForCoordinate(south + 0.5, west + 0.5));
    }
  }
  return ids.sort();
}

async function loadImage(url: string) {
  const tiff = await fromUrl(url, { allowFullFile: false });
  return tiff.getImage();
}

async function imageForUrl(url: string) {
  let pending = imageCache.get(url);
  if (!pending) {
    pending = loadImage(url);
    imageCache.set(url, pending);
  }
  return pending;
}

function rasterWindow(
  origin: number[],
  resolution: number[],
  width: number,
  height: number,
  bounds: [number, number, number, number]
): [number, number, number, number] {
  const [minLon, minLat, maxLon, maxLat] = bounds;
  const xValues = [(minLon - origin[0]) / resolution[0], (maxLon - origin[0]) / resolution[0]];
  const yValues = [(minLat - origin[1]) / resolution[1], (maxLat - origin[1]) / resolution[1]];
  const left = Math.max(0, Math.floor(Math.min(...xValues)));
  const right = Math.min(width, Math.ceil(Math.max(...xValues)));
  const top = Math.max(0, Math.floor(Math.min(...yValues)));
  const bottom = Math.min(height, Math.ceil(Math.max(...yValues)));
  return [left, top, right, bottom];
}

function intersects(first: [number, number, number, number], second: [number, number, number, number]) {
  return first[0] < second[2] && first[2] > second[0] && first[1] < second[3] && first[3] > second[1];
}

export class ElevationHistogram {
  private readonly counts = new Map<number, number>();
  count = 0;

  add(valueM: number) {
    if (!Number.isFinite(valueM)) return;
    const decimetres = Math.round(valueM * 10);
    this.count += 1;
    this.counts.set(decimetres, (this.counts.get(decimetres) ?? 0) + 1);
  }

  quantile(percentile: number, minimumM = -Infinity, maximumM = Infinity, maximumInclusive = true) {
    if (!(percentile > 0 && percentile <= 1)) throw new Error("DEM001 percentile must be in (0, 1]");
    const entries = [...this.counts.entries()]
      .filter(([value]) => value / 10 >= minimumM && (maximumInclusive ? value / 10 <= maximumM : value / 10 < maximumM))
      .sort(([first], [second]) => first - second);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (!total) return null;
    const rank = Math.ceil(total * percentile);
    let cumulative = 0;
    for (const [value, count] of entries) {
      cumulative += count;
      if (cumulative >= rank) return value / 10;
    }
    return entries.at(-1)![0] / 10;
  }

  countBetween(minimumM: number, maximumM: number, maximumInclusive = true) {
    return [...this.counts.entries()].reduce((sum, [value, count]) => {
      const metres = value / 10;
      return sum + (metres >= minimumM && (maximumInclusive ? metres <= maximumM : metres < maximumM) ? count : 0);
    }, 0);
  }
}

export async function sourceMetadata(tileId: string): Promise<DemSourceObject | null> {
  const url = tileUrl(tileId);
  const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(30_000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`DEM002 source tile unavailable: ${tileId} (${response.status})`);
  const contentLength = Number(response.headers.get("content-length"));
  return {
    tileId,
    url,
    etag: response.headers.get("etag")?.replaceAll('"', "") ?? null,
    lastModified: response.headers.get("last-modified"),
    contentLength: Number.isFinite(contentLength) ? contentLength : null
  };
}

export async function collectGeometryElevations(
  geometry: DemGeometry,
  options: { minimumElevationExclusiveM: number }
) {
  const geometryBox = geometryBounds(geometry);
  const histogram = new ElevationHistogram();
  const sources: DemSourceObject[] = [];
  const unavailableTileIds: string[] = [];

  for (const tileId of tileIdsForGeometry(geometry)) {
    const metadata = await sourceMetadata(tileId);
    if (!metadata) {
      unavailableTileIds.push(tileId);
      continue;
    }
    const image = await imageForUrl(metadata.url);
    const imageBox = image.getBoundingBox() as [number, number, number, number];
    if (!intersects(geometryBox, imageBox)) continue;
    const origin = image.getOrigin();
    const resolution = image.getResolution();
    const window = rasterWindow(origin, resolution, image.getWidth(), image.getHeight(), geometryBox);
    if (window[0] >= window[2] || window[1] >= window[3]) continue;
    const raster = await image.readRasters({ window, samples: [0] });
    const values = raster[0];
    const width = raster.width;
    const height = raster.height;
    const noDataRaw = image.getGDALNoData();
    const noData = noDataRaw === null ? null : Number(noDataRaw);

    for (let row = 0; row < height; row += 1) {
      const lat = origin[1] + (window[1] + row + 0.5) * resolution[1];
      const rowContains = geometryContainsForRasterRow(geometry, lat);
      for (let column = 0; column < width; column += 1) {
        const lon = origin[0] + (window[0] + column + 0.5) * resolution[0];
        if (!rowContains(lon)) continue;
        const value = Number(values[row * width + column]);
        if (!Number.isFinite(value) || noData !== null && value === noData || value <= options.minimumElevationExclusiveM) continue;
        histogram.add(value);
      }
    }
    sources.push(metadata);
  }
  if (!histogram.count) throw new Error("DEM003 no valid elevation pixels inside destination geometry");
  return { histogram, sources, unavailableTileIds };
}

export async function elevationAtCoordinate(lat: number, lon: number) {
  const tileId = tileIdForCoordinate(lat, lon);
  const url = tileUrl(tileId);
  const image = await imageForUrl(url);
  const origin = image.getOrigin();
  const resolution = image.getResolution();
  const column = Math.min(image.getWidth() - 1, Math.max(0, Math.floor((lon - origin[0]) / resolution[0])));
  const row = Math.min(image.getHeight() - 1, Math.max(0, Math.floor((lat - origin[1]) / resolution[1])));
  const raster = await image.readRasters({ window: [column, row, column + 1, row + 1], samples: [0] });
  const value = Number(raster[0][0]);
  const noDataRaw = image.getGDALNoData();
  const noData = noDataRaw === null ? null : Number(noDataRaw);
  if (!Number.isFinite(value) || noData !== null && value === noData) return null;
  return value;
}

export async function medianElevationInWindow(
  lat: number,
  lon: number,
  radiusM: number,
  minimumElevationExclusiveM: number
) {
  const latitudeRadius = radiusM / 110_574;
  const longitudeRadius = radiusM / (111_320 * Math.max(0.01, Math.cos(lat * Math.PI / 180)));
  const bounds: [number, number, number, number] = [lon - longitudeRadius, lat - latitudeRadius, lon + longitudeRadius, lat + latitudeRadius];
  const square: DemGeometry = {
    type: "Polygon",
    coordinates: [[
      [bounds[0], bounds[1]], [bounds[2], bounds[1]], [bounds[2], bounds[3]], [bounds[0], bounds[3]], [bounds[0], bounds[1]]
    ]]
  };
  const histogram = new ElevationHistogram();
  for (const tileId of tileIdsForGeometry(square)) {
    const metadata = await sourceMetadata(tileId);
    if (!metadata) continue;
    const image = await imageForUrl(metadata.url);
    const imageBox = image.getBoundingBox() as [number, number, number, number];
    if (!intersects(bounds, imageBox)) continue;
    const origin = image.getOrigin();
    const resolution = image.getResolution();
    const window = rasterWindow(origin, resolution, image.getWidth(), image.getHeight(), bounds);
    if (window[0] >= window[2] || window[1] >= window[3]) continue;
    const raster = await image.readRasters({ window, samples: [0] });
    const values = raster[0];
    const noDataRaw = image.getGDALNoData();
    const noData = noDataRaw === null ? null : Number(noDataRaw);
    for (const rawValue of values) {
      const value = Number(rawValue);
      if (!Number.isFinite(value) || noData !== null && value === noData || value <= minimumElevationExclusiveM) continue;
      histogram.add(value);
    }
  }
  return { medianM: histogram.quantile(0.5), pixelCount: histogram.count };
}
