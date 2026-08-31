import type { DestinationConfig } from "../../lib/data/types";
import { readJson, round, writeJson } from "../lib/io";
import { collectGeometryElevations, type DemGeometry } from "./copernicus-dem";
import { requireApprovedSource } from "./source-preflight";

interface GeometryFeature {
  type: "Feature";
  properties: { destinationId: string };
  geometry: DemGeometry;
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
      throw new Error("BLOCKED_GEOMETRY_DECISION: publishing DEM snapshots requires an approved destination geometry/elevation gate.");
    }
  }

  const destinations = readJson<DestinationConfig[]>("data-config/sources/destinations.json")
    .filter((destination) => destination.active && (!requestedSlugs.size || requestedSlugs.has(destination.slug)));
  if (requestedSlugs.size && destinations.length !== requestedSlugs.size) throw new Error(`Unknown or inactive destination in request: ${[...requestedSlugs].join(",")}`);
  const featureCollection = readJson<{ features: GeometryFeature[] }>("data-config/geography/destination-areas.geojson");
  const ingestion = readJson<any>("data-config/methodology/dem-ingestion-v1.json");

  for (const destination of destinations) {
    const feature = featureCollection.features.find((candidate) => candidate.properties.destinationId === destination.id);
    if (!feature) throw new Error(`DEM001 missing geometry for ${destination.id}`);
    console.log(`Reading Copernicus GLO-30 pixels for ${destination.name}...`);
    const { histogram, sources, unavailableTileIds } = await collectGeometryElevations(feature.geometry, {
      minimumElevationExclusiveM: ingestion.landSurfaceMinimumExclusiveM
    });
    const area = {
      minM: round(histogram.quantile(Number.EPSILON)!, 1),
      p25M: round(histogram.quantile(0.25)!, 1),
      medianM: round(histogram.quantile(0.5)!, 1),
      p75M: round(histogram.quantile(0.75)!, 1),
      maxM: round(histogram.quantile(1)!, 1)
    };
    const bands = Object.fromEntries(destination.elevationBands.map((band, bandIndex) => {
      const maximumInclusive = bandIndex === destination.elevationBands.length - 1;
      const median = histogram.quantile(0.5, band.minM, band.maxM, maximumInclusive);
      const pixelCount = histogram.countBetween(band.minM, band.maxM, maximumInclusive);
      if (median === null || pixelCount === 0) throw new Error(`DEM003 ${destination.id}/${band.id} has no pixels in configured elevation range`);
      return [band.id, {
        minM: round(histogram.quantile(Number.EPSILON, band.minM, band.maxM, maximumInclusive)!, 1),
        medianM: round(median, 1),
        maxM: round(histogram.quantile(1, band.minM, band.maxM, maximumInclusive)!, 1),
        pixelCount
      }];
    }));
    const snapshot = {
      schemaVersion: 1,
      datasetStatus: "production",
      destinationId: destination.id,
      fixture: false,
      source: "copernicus-dem-glo-30",
      sourceProduct: "COP-DEM_GLO-30-DGED",
      sourceRelease: "2021",
      sourceDistribution: "AWS Registry of Open Data public COG mirror",
      sourceDoi: "10.5270/ESA-c5d3d65",
      ingestionVersion: ingestion.version,
      landSurfaceMinimumExclusiveM: ingestion.landSurfaceMinimumExclusiveM,
      retrievedAt: new Date().toISOString(),
      pixelCount: histogram.count,
      sourceObjects: sources,
      unavailableTileIds,
      area,
      bands
    };
    const output = publish
      ? `data-snapshots/dem/${destination.slug}.json`
      : `generated/intermediate/real-dem/${destination.slug}.json`;
    writeJson(output, snapshot);
    console.log(`${publish ? "Published" : "Staged"} ${histogram.count.toLocaleString("en")} real DEM pixels → ${output}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
