import { readFileSync } from "node:fs";
import type { DestinationConfig } from "../../lib/data/types";
import { selectSamplingPoints, samplingQuality } from "../../lib/hiking/sampling";
import { geometryBounds, geometryContains, geometryDistanceKm, medianElevationInWindow, type DemGeometry } from "../import/copernicus-dem";
import { requireApprovedSource } from "../import/source-preflight";
import { readJson, round, sha256, writeJson } from "../lib/io";

interface GeometryFeature {
  properties: { destinationId: string };
  geometry: DemGeometry;
}

interface SamplingCandidate {
  lat: number;
  lon: number;
  terrainElevationM: number;
  usedBufferM: number;
  validPixelCount: number;
}

function grid(value: number) {
  return Math.round(value * 10) / 10;
}

async function candidatesForGeometry(geometry: DemGeometry, config: any, demIngestion: any) {
  const [minLon, minLat, maxLon, maxLat] = geometryBounds(geometry);
  const gridDegrees = config.gridDegrees;
  const generate = (bufferM: number) => {
    const latitudeBuffer = bufferM / 110_574;
    const longitudeBuffer = bufferM / (111_320 * Math.max(0.01, Math.cos((minLat + maxLat) / 2 * Math.PI / 180)));
    const values: Array<{lat:number;lon:number;usedBufferM:number}> = [];
    for (let lat = Math.ceil((minLat - latitudeBuffer) / gridDegrees) * gridDegrees; lat <= maxLat + latitudeBuffer + 1e-9; lat += gridDegrees) {
      for (let lon = Math.ceil((minLon - longitudeBuffer) / gridDegrees) * gridDegrees; lon <= maxLon + longitudeBuffer + 1e-9; lon += gridDegrees) {
        const coordinates: [number, number] = [grid(lon), grid(lat)];
        const distanceKm = geometryDistanceKm(geometry, coordinates);
        if (bufferM === 0 ? geometryContains(geometry, coordinates) : distanceKm * 1000 <= bufferM) {
          values.push({ lat: coordinates[1], lon: coordinates[0], usedBufferM: round(distanceKm * 1000, 1) });
        }
      }
    }
    return values;
  };
  let coordinates = generate(0);
  if (!coordinates.length) coordinates = generate(config.maxBufferM);
  const candidates: SamplingCandidate[] = [];
  for (const coordinate of coordinates) {
    const elevation = await medianElevationInWindow(
      coordinate.lat,
      coordinate.lon,
      config.demCandidateWindowRadiusM,
      demIngestion.landSurfaceMinimumExclusiveM
    );
    if (elevation.medianM === null || elevation.pixelCount < config.minValidPixels) continue;
    candidates.push({
      ...coordinate,
      terrainElevationM: round(elevation.medianM, 1),
      validPixelCount: elevation.pixelCount
    });
  }
  return candidates;
}

async function main() {
  const argumentsSet = new Set(process.argv.slice(2));
  const publish = argumentsSet.has("--publish");
  const destinationArgument = [...argumentsSet].find((value) => value.startsWith("--destination="));
  const selectedSlug = destinationArgument?.slice("--destination=".length);
  const requestedSlugs = new Set((selectedSlug ? [selectedSlug] : (process.env.BTH_DESTINATIONS ?? "").split(","))
    .map((value) => value.trim()).filter(Boolean));
  if (publish) {
    requireApprovedSource("copernicusDem");
    const approval = readJson<any>("data-config/methodology/release-approvals.json").approvals.destinationGeometryAndElevation;
    if (!approval.approved || !approval.approvedBy || !Number.isFinite(new Date(approval.approvedAt).getTime())) {
      throw new Error("BLOCKED_GEOMETRY_DECISION: publishing sampling snapshots requires an approved geometry/elevation gate.");
    }
  }
  const samplingConfig = readJson<any>("data-config/methodology/sampling-v1.json");
  const demIngestion = readJson<any>("data-config/methodology/dem-ingestion-v1.json");
  const overrides = readJson<any>("data-config/geography/destination-overrides.json").overrides;
  const destinations = readJson<DestinationConfig[]>("data-config/sources/destinations.json")
    .filter((destination) => destination.active && (!requestedSlugs.size || requestedSlugs.has(destination.slug)));
  if (requestedSlugs.size && destinations.length !== requestedSlugs.size) throw new Error(`Unknown or inactive destination in request: ${[...requestedSlugs].join(",")}`);
  const features = readJson<{features:GeometryFeature[]}>("data-config/geography/destination-areas.geojson").features;

  for (const destination of destinations) {
    const feature = features.find((candidate) => candidate.properties.destinationId === destination.id);
    if (!feature) throw new Error(`SAMPLING001 missing geometry for ${destination.id}`);
    const demPath = publish
      ? `data-snapshots/dem/${destination.slug}.json`
      : `generated/intermediate/real-dem/${destination.slug}.json`;
    const dem = readJson<any>(demPath);
    if (dem.fixture || dem.source !== "copernicus-dem-glo-30") throw new Error(`SAMPLING001 ${destination.id} does not reference a real Copernicus DEM snapshot`);
    console.log(`Evaluating ERA5 0.1° candidates for ${destination.name}...`);
    const allCandidates = await candidatesForGeometry(feature.geometry, samplingConfig, demIngestion);
    const maskExclusions = overrides.filter((value:any) => value.destinationId === destination.id && value.type === "era5-land-mask-exclusion");
    const candidates = allCandidates.filter((candidate) => !maskExclusions.some(
      (exclusion:any) => exclusion.lat === candidate.lat && exclusion.lon === candidate.lon
    ));
    if (!candidates.length) throw new Error(`SAMPLING001 no valid ERA5 grid candidates for ${destination.id}`);
    const bands = Object.fromEntries(destination.elevationBands.map((band) => {
      const targetElevationM = dem.bands[band.id]?.medianM;
      if (!Number.isFinite(targetElevationM)) throw new Error(`SAMPLING001 missing DEM target for ${destination.id}/${band.id}`);
      const selected = selectSamplingPoints(candidates, targetElevationM).map((point) => {
        const evidence = candidates.find((candidate) => candidate.lat === point.lat && candidate.lon === point.lon)!;
        const quality = samplingQuality(point.elevationMismatchM);
        const override = overrides.find((value:any) => value.destinationId === destination.id && value.bandId === band.id && value.type === "elevation-mismatch");
        if (quality === "blocked" && !override?.approved) throw new Error(`SAMPLING002 ${destination.id}/${band.id} exceeds 800 m without an approved override`);
        return {
          id: `${destination.slug}-${band.id}-${point.selectionRank}`,
          lat: point.lat,
          lon: point.lon,
          terrainElevationM: point.terrainElevationM,
          targetElevationM,
          elevationMismatchM: round(point.elevationMismatchM, 1),
          sampleWeight: point.sampleWeight,
          usedBufferM: evidence.usedBufferM,
          demWindowValidPixelCount: evidence.validPixelCount,
          selectionRank: point.selectionRank,
          quality
        };
      });
      return [band.id, { targetElevationM, points: selected }];
    }));
    const snapshot = {
      schemaVersion: 2,
      datasetStatus: "production",
      destinationId: destination.id,
      fixture: false,
      samplingVersion: samplingConfig.samplingVersion,
      source: "era5-land-0.1-degree-grid-with-separate-copernicus-dem-glo-30-terrain-matching",
      terrainElevationSource: {
        product: "COP-DEM_GLO-30-DGED",
        statistic: "median",
        windowRadiusM: samplingConfig.demCandidateWindowRadiusM
      },
      demSnapshotHash: sha256(readFileSync(demPath, "utf8")),
      candidateCount: candidates.length,
      excludedCandidateCount: allCandidates.length - candidates.length,
      era5LandMaskExclusions: maskExclusions,
      generatedAt: new Date().toISOString(),
      bands
    };
    const output = publish
      ? `data-snapshots/sampling/${destination.slug}.json`
      : `generated/intermediate/real-sampling/${destination.slug}.json`;
    writeJson(output, snapshot);
    console.log(`${publish ? "Published" : "Staged"} ${candidates.length} candidates → ${output}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
