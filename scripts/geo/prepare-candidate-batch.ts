import type { DestinationConfig } from "../../lib/data/types";
import { readJson, writeJson } from "../lib/io";
import type { DemGeometry } from "../import/copernicus-dem";

interface Candidate {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  continent: string;
  region: string;
  timezone: string;
  candidateCentroid: { lat: number; lon: number };
  tags: string[];
  affiliateQuery: string;
}

interface Decision {
  id: string;
  stagingDisposition?: "hold" | "eligible";
  stagingHoldReason?: string;
  requiredBeforeReentry?: string[];
  geometrySha256: string;
  intendedHikingScope: string;
  excludedClasses: string[];
  bands: DestinationConfig["elevationBands"];
  evidence: Array<{ title: string; url: string; observation: string }>;
  maskReviewRequired: boolean;
}

interface Boundary {
  source: Record<string, unknown> & { geometrySha256: string; osmType: string; osmId: number };
  geometry: DemGeometry;
}

const batchNumber = Number(process.env.BTH_CANDIDATE_BATCH ?? "1");
if (!Number.isInteger(batchNumber) || batchNumber < 1) {
  throw new Error("CANDIDATE001 BTH_CANDIDATE_BATCH must be a positive integer");
}

function main() {
  const plan = readJson<any>("data-config/sources/destination-candidates.json");
  const batch = plan.plannedBatches?.[batchNumber - 1];
  if (!batch?.add?.length) throw new Error(`CANDIDATE001 missing planned batch ${batchNumber}`);
  const science = readJson<{ status: string; approval: boolean; decisions: Decision[] }>(
    `data-config/sources/destination-science-decisions-batch-${batchNumber}.json`
  );
  if (science.status !== "science-draft" || science.approval !== false) {
    throw new Error("CANDIDATE001 candidate preparation requires an unapproved science draft");
  }
  const geometry = readJson<{ fetchedAt: string; boundaries: Record<string, Boundary>; unresolvedCount: number }>(
    `generated/intermediate/geometry-osm-batch-${batchNumber}.json`
  );
  if (geometry.unresolvedCount !== 0) throw new Error("CANDIDATE001 unresolved candidate geometry remains");

  const requestedIds = new Set((process.env.BTH_DESTINATIONS ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  const unknownRequestedIds = [...requestedIds].filter((id) => !batch.add.includes(id));
  if (unknownRequestedIds.length) throw new Error(`CANDIDATE001 requested IDs are not in batch ${batchNumber}: ${unknownRequestedIds.join(",")}`);
  const heldIds = new Set(science.decisions.filter((decision) => decision.stagingDisposition === "hold").map((decision) => decision.id));
  for (const heldId of heldIds) {
    const decision = science.decisions.find((value) => value.id === heldId)!;
    if (!decision.stagingHoldReason || !decision.requiredBeforeReentry?.length) {
      throw new Error(`CANDIDATE002 science hold for ${heldId} lacks a reason or re-entry requirements`);
    }
  }
  const requestedHeldIds = [...requestedIds].filter((id) => heldIds.has(id));
  if (requestedHeldIds.length) throw new Error(`CANDIDATE002 requested candidates are on science hold: ${requestedHeldIds.join(",")}`);
  const selectedIds = (requestedIds.size ? batch.add.filter((id: string) => requestedIds.has(id)) : batch.add)
    .filter((id: string) => !heldIds.has(id));
  const candidates = (plan.candidates as Candidate[]).filter((candidate) => selectedIds.includes(candidate.id));
  if (candidates.length !== selectedIds.length) throw new Error("CANDIDATE001 candidate plan is incomplete");
  const destinationConfigs: DestinationConfig[] = [];
  const features: unknown[] = [];

  for (const [index, candidate] of candidates.entries()) {
    const decision = science.decisions.find((value) => value.id === candidate.id);
    const boundary = geometry.boundaries[candidate.id];
    if (!decision || !boundary) throw new Error(`CANDIDATE001 incomplete staging evidence for ${candidate.id}`);
    if (decision.geometrySha256 !== boundary.source.geometrySha256) {
      throw new Error(`CANDIDATE001 geometry hash changed after science review for ${candidate.id}`);
    }
    const profile = readJson<any>(`generated/intermediate/dem-profiles-batch-${batchNumber}/${candidate.id}.json`);
    if (profile.geometrySource.geometrySha256 !== decision.geometrySha256 || profile.bands.length !== decision.bands.length) {
      throw new Error(`CANDIDATE001 DEM profile differs from science decision for ${candidate.id}`);
    }

    destinationConfigs.push({
      id: candidate.id,
      slug: candidate.id,
      name: candidate.name,
      countryCode: candidate.countryCode,
      countryName: candidate.countryName,
      continent: candidate.continent,
      region: candidate.region,
      timezone: candidate.timezone,
      active: true,
      priority: Math.max(1, 80 - index),
      affiliateQuery: candidate.affiliateQuery,
      tags: candidate.tags,
      coordinates: candidate.candidateCentroid,
      elevationBands: decision.bands
    });
    features.push({
      type: "Feature",
      properties: {
        destinationId: candidate.id,
        provenance: {
          status: "science-draft",
          sourceType: "openstreetmap-relation",
          sourceLabel: `${boundary.source.osmType}/${boundary.source.osmId}`,
          sourceUrl: `https://www.openstreetmap.org/${boundary.source.osmType}/${boundary.source.osmId}`,
          retrievedAt: geometry.fetchedAt,
          geometrySha256: decision.geometrySha256,
          intendedScope: decision.intendedHikingScope,
          excludedClasses: decision.excludedClasses,
          bandRationale: "SOL batch-one science draft; see committed decision evidence.",
          weightRationale: "Route-catalogue staging prior; not a visitor-frequency estimate.",
          evidence: decision.evidence,
          maskReviewRequired: decision.maskReviewRequired
        }
      },
      geometry: boundary.geometry
    });

    const bands = Object.fromEntries(profile.bands.map((band: any) => [band.id, {
      minM: band.observedMinM,
      medianM: band.observedMedianM,
      maxM: band.observedMaxM,
      pixelCount: band.pixelCount
    }]));
    writeJson(`generated/intermediate/candidate-batch-${batchNumber}/real-dem/${candidate.id}.json`, {
      schemaVersion: 1,
      datasetStatus: "staging",
      destinationId: candidate.id,
      fixture: false,
      source: "copernicus-dem-glo-30",
      sourceProduct: profile.demSource.product,
      sourceRelease: profile.demSource.release,
      sourceDistribution: "AWS Registry of Open Data public COG mirror",
      sourceDoi: "10.5270/ESA-c5d3d65",
      ingestionVersion: 1,
      landSurfaceMinimumExclusiveM: profile.demSource.landSurfaceMinimumExclusiveM,
      retrievedAt: profile.retrievedAt,
      pixelCount: profile.pixelCount,
      representedPixelCount: profile.representedPixelCount,
      representedFractionOfLandPixels: profile.representedFractionOfLandPixels,
      sourceObjects: profile.sourceObjects,
      unavailableTileIds: profile.unavailableTileIds,
      area: {
        minM: profile.quantilesM.min,
        p25M: profile.quantilesM.p25,
        medianM: profile.quantilesM.p50,
        p75M: profile.quantilesM.p75,
        maxM: profile.quantilesM.max
      },
      bands,
      limitations: [
        "Candidate staging only; release approval is false.",
        "Official Copernicus WBM/EDM/FLM/HEM quality-layer gate remains open."
      ]
    });
  }

  const root = `generated/intermediate/candidate-batch-${batchNumber}`;
  writeJson(`${root}/destinations.json`, destinationConfigs);
  writeJson(`${root}/destination-areas.geojson`, { type: "FeatureCollection", features });
  writeJson(`${root}/manifest.json`, {
    schemaVersion: 1,
    status: "staging-only",
    batch: batchNumber,
    destinationCount: destinationConfigs.length,
    heldDestinations: [...heldIds].sort(),
    publicActivationAuthorized: false,
    inputs: {
      candidatePlan: "data-config/sources/destination-candidates.json",
      scienceDecisions: `data-config/sources/destination-science-decisions-batch-${batchNumber}.json`,
      geometry: `generated/intermediate/geometry-osm-batch-${batchNumber}.json`,
      demProfiles: `generated/intermediate/dem-profiles-batch-${batchNumber}/`
    }
  });
  console.log(`Prepared ${destinationConfigs.length} staging-only candidate destinations → ${root}`);
}

main();
