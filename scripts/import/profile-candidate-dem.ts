import { readJson, round, writeJson } from "../lib/io";
import {
  collectGeometryElevations,
  geometryBounds,
  type DemGeometry
} from "./copernicus-dem";

interface CandidateGeometry {
  candidate: { id: string; name: string };
  source: {
    provider: string;
    osmType: string;
    osmId: number;
    geometrySha256: string;
  };
  geometry: DemGeometry;
}

interface GeometryStaging {
  batch: number;
  boundaries: Record<string, CandidateGeometry>;
}

interface ScienceDecision {
  id: string;
  bands: Array<{ id: string; minM: number; maxM: number; weight: number }>;
}

const batchNumber = Number(process.env.BTH_GEOMETRY_BATCH ?? "1");
if (!Number.isInteger(batchNumber) || batchNumber < 1) {
  throw new Error("DEM_PROFILE001 BTH_GEOMETRY_BATCH must be a positive integer");
}

const requestedIds = new Set([
  ...process.argv.slice(2)
    .filter((argument) => argument.startsWith("--destination="))
    .map((argument) => argument.slice("--destination=".length)),
  ...(process.env.BTH_DESTINATIONS ?? "").split(",")
].map((value) => value.trim()).filter(Boolean));

async function main() {
  const staging = readJson<GeometryStaging>(`generated/intermediate/geometry-osm-batch-${batchNumber}.json`);
  const ingestion = readJson<any>("data-config/methodology/dem-ingestion-v1.json");
  const science = readJson<{ decisions: ScienceDecision[] }>(`data-config/sources/destination-science-decisions-batch-${batchNumber}.json`);
  const entries = Object.entries(staging.boundaries)
    .filter(([id]) => !requestedIds.size || requestedIds.has(id));

  if (!entries.length) throw new Error("DEM_PROFILE001 no candidate geometries selected");
  const missing = [...requestedIds].filter((id) => !staging.boundaries[id]);
  if (missing.length) throw new Error(`DEM_PROFILE001 unknown candidate geometries: ${missing.join(",")}`);

  for (const [id, boundary] of entries) {
    console.log(`Profiling Copernicus GLO-30 terrain for ${boundary.candidate.name}...`);
    const { histogram, sources, unavailableTileIds } = await collectGeometryElevations(boundary.geometry, {
      minimumElevationExclusiveM: ingestion.landSurfaceMinimumExclusiveM
    });
    const percentiles: Array<[string, number]> = [
      ["min", Number.EPSILON],
      ["p02", 0.02],
      ["p05", 0.05],
      ["p10", 0.1],
      ["p25", 0.25],
      ["p50", 0.5],
      ["p75", 0.75],
      ["p90", 0.9],
      ["p95", 0.95],
      ["p98", 0.98],
      ["max", 1]
    ];
    const quantilesM = Object.fromEntries(percentiles
      .map(([name, percentile]) => [name, round(histogram.quantile(percentile)!, 1)]));
    const decision = science.decisions.find((candidate) => candidate.id === id);
    if (!decision) throw new Error(`DEM_PROFILE001 missing science decision for ${id}`);
    const bands = decision.bands.map((band, index) => {
      const maximumInclusive = index === decision.bands.length - 1;
      const pixelCount = histogram.countBetween(band.minM, band.maxM, maximumInclusive);
      const medianM = histogram.quantile(0.5, band.minM, band.maxM, maximumInclusive);
      if (!pixelCount || medianM === null) throw new Error(`DEM_PROFILE002 ${id}/${band.id} contains no DEM pixels`);
      return {
        ...band,
        pixelCount,
        fractionOfLandPixels: round(pixelCount / histogram.count, 6),
        observedMinM: round(histogram.quantile(Number.EPSILON, band.minM, band.maxM, maximumInclusive)!, 1),
        observedMedianM: round(medianM, 1),
        observedMaxM: round(histogram.quantile(1, band.minM, band.maxM, maximumInclusive)!, 1)
      };
    });
    const representedPixelCount = bands.reduce((sum, band) => sum + band.pixelCount, 0);

    const output = `generated/intermediate/dem-profiles-batch-${batchNumber}/${id}.json`;
    writeJson(output, {
      schemaVersion: 1,
      status: "staging-only",
      batch: staging.batch,
      candidateId: id,
      candidateName: boundary.candidate.name,
      geometrySource: {
        provider: boundary.source.provider,
        osmType: boundary.source.osmType,
        osmId: boundary.source.osmId,
        geometrySha256: boundary.source.geometrySha256
      },
      geometryBounds: geometryBounds(boundary.geometry),
      demSource: {
        product: ingestion.sourceProduct,
        release: ingestion.sourceRelease,
        horizontalCrs: ingestion.horizontalCrs,
        verticalUnit: ingestion.verticalUnit,
        landSurfaceMinimumExclusiveM: ingestion.landSurfaceMinimumExclusiveM
      },
      retrievedAt: new Date().toISOString(),
      pixelCount: histogram.count,
      quantilesM,
      representedPixelCount,
      representedFractionOfLandPixels: round(representedPixelCount / histogram.count, 6),
      bands,
      sourceObjects: sources,
      unavailableTileIds
    });
    console.log(`Staged ${histogram.count.toLocaleString("en")} DEM pixels → ${output}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
