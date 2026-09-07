/**
 * Build an isolated, reviewable replacement-cell dataset in CI.
 *
 * By default this only resolves the pinned ERA5-Land invariant fields and
 * reports the candidate model elevations. --apply updates the runner's working
 * tree so fetch-era5.ts can download and aggregate the candidate climate. The
 * workflow never commits those changes: they are uploaded as review evidence.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { DestinationConfig } from "../../lib/data/types";
import { readJson, round, writeJson } from "../lib/io";

interface Replacement {
  approval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approvalEvidence?: string;
  stagingDisposition: "candidate" | "rejected";
  rejectionReason?: string;
  lat: number;
  lon: number;
  label: string;
  reason: string;
  evidence: Array<{title: string; url: string; observation: string}>;
}

interface ReplacementConfig {
  schemaVersion: number;
  status: string;
  approval: boolean;
  replacements: Record<string, Replacement>;
  controls: {destinations: string[]; reason: string};
}

interface OrographyPoint {
  key: string;
  requestedLocation: {latitude: number; longitude: number};
  resolvedLocation: {latitude: number; longitude: number};
  era5LandGridElevationM: number;
  landSeaFraction?: number;
}

const apply = process.argv.slice(2).includes("--apply");
const onlyArgument = process.argv.slice(2).find((argument) => argument.startsWith("--only="));
const only = onlyArgument
  ? new Set(onlyArgument.slice("--only=".length).split(",").map((id) => id.trim()).filter(Boolean))
  : null;
const configPath = "data-config/sources/representative-cell-replacements-v1.json";
const workRoot = "generated/intermediate/cell-replacements";
const planPath = `${workRoot}/request-plan.json`;
const orographyPath = `${workRoot}/era5-land-orography.json`;
const coordinateKey = (id: string) => `replacement_${id}`;

function pythonExecutable() {
  if (process.env.BTH_DATA_PYTHON) return process.env.BTH_DATA_PYTHON;
  const local = "generated/intermediate/data-venv/bin/python3";
  return existsSync(local) ? local : "python3";
}

function runPython(script: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(pythonExecutable(), [script, ...args], {stdio: "inherit", env: process.env});
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`CELL_REPLACEMENT001 ${script} exited with ${code}`)));
  });
}

async function main() {
  const config = readJson<ReplacementConfig>(configPath);
  if (config.schemaVersion !== 1 || config.approval !== false || config.status !== "science-staging") {
    throw new Error("CELL_REPLACEMENT001 replacement config must remain an unapproved science-staging document");
  }
  const destinations = readJson<DestinationConfig[]>("data-config/sources/destinations.json");
  const allIds = Object.keys(config.replacements).sort();
  if (only) {
    const unknown = [...only].filter((id) => !allIds.includes(id));
    if (unknown.length) throw new Error(`CELL_REPLACEMENT001 --only names unknown replacements: ${unknown.join(", ")}`);
  }
  const ids = allIds.filter((id) => config.replacements[id].stagingDisposition === "candidate" && (!only || only.has(id)));
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error("CELL_REPLACEMENT001 invalid replacement ids");
  for (const id of allIds) {
    if (!destinations.some((destination) => destination.id === id && destination.active)) {
      throw new Error(`CELL_REPLACEMENT001 unknown or inactive replacement destination ${id}`);
    }
    const candidate = config.replacements[id];
    if (!Number.isFinite(candidate.lat) || !Number.isFinite(candidate.lon) || !candidate.label || !candidate.reason || !candidate.evidence.length) {
      throw new Error(`CELL_REPLACEMENT001 incomplete replacement evidence for ${id}`);
    }
    if (candidate.stagingDisposition === "rejected" && !candidate.rejectionReason) {
      throw new Error(`CELL_REPLACEMENT001 rejected candidate lacks a reason for ${id}`);
    }
    if (candidate.approval && (!candidate.approvedBy || !candidate.approvedAt || !candidate.approvalEvidence)) {
      throw new Error(`CELL_REPLACEMENT001 approved candidate lacks review evidence for ${id}`);
    }
  }
  for (const id of config.controls.destinations) {
    if (!destinations.some((destination) => destination.id === id && destination.active) || config.replacements[id]) {
      throw new Error(`CELL_REPLACEMENT001 invalid unchanged control ${id}`);
    }
  }

  writeJson(planPath, {
    schemaVersion: 1,
    source: "ERA5-Land auxiliary invariant geopotential",
    method: "nearest 0.1-degree model grid coordinate to the curated replacement candidate",
    entries: ids.map((id) => ({
      key: coordinateKey(id),
      lat: config.replacements[id].lat,
      lon: config.replacements[id].lon,
      consumers: [{destinationId: id, bandId: "representative", samplePointId: `${id}-representative-1`}],
    })),
  });
  await runPython("scripts/import/download_era5_land_orography.py", ["--plan", planPath, "--output", orographyPath]);
  const orography = readJson<{retrievedAt: string; points: OrographyPoint[]}>(orographyPath);
  const byKey = new Map(orography.points.map((point) => [point.key, point]));
  if (byKey.size !== ids.length) throw new Error("CELL_REPLACEMENT001 invariant result count differs from replacement count");
  const report = ids.map((id) => {
    const point = byKey.get(coordinateKey(id));
    if (!point || !Number.isFinite(point.era5LandGridElevationM) || !Number.isFinite(point.landSeaFraction)) {
      throw new Error(`CELL_REPLACEMENT001 unresolved invariant fields for ${id}`);
    }
    return {
      destinationId: id,
      requestedLocation: point.requestedLocation,
      resolvedLocation: point.resolvedLocation,
      modelElevationM: round(point.era5LandGridElevationM, 1),
      landSeaFraction: point.landSeaFraction,
      approval: false,
      requiredNext: "Download the full 1991-2020 climate, reject persistent snow, then perform coordinate-level route QA.",
    };
  });
  writeJson(`${workRoot}/preflight-report.json`, {schemaVersion: 1, status: "science-staging", approval: false, candidates: report});
  console.log(`Replacement-cell preflight: ${report.length}/${ids.length} candidates resolved.`);
  for (const candidate of report) {
    console.log(`  ${candidate.destinationId}: ${candidate.resolvedLocation.latitude}, ${candidate.resolvedLocation.longitude}; ${candidate.modelElevationM} m; land ${candidate.landSeaFraction}`);
  }
  if (!apply) {
    console.log("No published configuration or snapshot was changed. Use --apply only inside the evidence workflow.");
    return;
  }

  writeJson(`${workRoot}/baseline/destinations.json`, destinations.filter((destination) => ids.includes(destination.id)));
  for (const id of [...ids, ...config.controls.destinations]) {
    writeJson(`${workRoot}/baseline/climate/${id}.json`, readJson(`data-snapshots/climate/${id}.json`));
  }
  const overridesFile = readJson<{schemaVersion: number; method: string; overrides: Record<string, {lat:number;lon:number;label:string;reason:string}>}>(
    "data-config/sources/representative-cell-overrides.json",
  );
  writeJson(`${workRoot}/baseline/representative-cell-overrides.json`, overridesFile);

  const updatedDestinations = destinations.map((destination) => {
    const replacement = config.replacements[destination.id];
    if (!replacement || replacement.stagingDisposition !== "candidate") return destination;
    const point = byKey.get(coordinateKey(destination.id))!;
    const elevation = round(point.era5LandGridElevationM, 1);
    return {...destination, elevationBands: [{id: "representative", minM: Math.floor(elevation - 50), maxM: Math.ceil(elevation + 50), weight: 1}]};
  });
  writeJson("data-config/sources/destinations.json", updatedDestinations);

  for (const id of ids) {
    const replacement = config.replacements[id];
    overridesFile.overrides[id] = {lat: replacement.lat, lon: replacement.lon, label: replacement.label, reason: replacement.reason};
  }
  writeJson("data-config/sources/representative-cell-overrides.json", overridesFile);

  const areas = readJson<{type: string; features: any[]}>("data-config/geography/destination-areas.geojson");
  for (const id of ids) {
    const feature = areas.features.find((candidate) => candidate.properties?.destinationId === id);
    if (!feature) throw new Error(`CELL_REPLACEMENT001 missing destination geometry for ${id}`);
    const point = byKey.get(coordinateKey(id))!;
    const latitude = round(point.resolvedLocation.latitude, 6);
    const longitude = round(point.resolvedLocation.longitude, 6);
    const halfCell = 0.05;
    feature.geometry = {type: "Polygon", coordinates: [[
      [round(longitude - halfCell, 6), round(latitude - halfCell, 6)],
      [round(longitude + halfCell, 6), round(latitude - halfCell, 6)],
      [round(longitude + halfCell, 6), round(latitude + halfCell, 6)],
      [round(longitude - halfCell, 6), round(latitude + halfCell, 6)],
      [round(longitude - halfCell, 6), round(latitude - halfCell, 6)],
    ]]};
    feature.properties.provenance = {
      status: "pending-review",
      sourceType: "project-curated-draft",
      sourceLabel: config.replacements[id].label,
      intendedScope: "Historical climate at one candidate representative model-grid cell; not a trail-corridor or whole-region average.",
      excludedClasses: ["whole-region-average", "route-specific-conditions", "live-weather"],
      bandRationale: config.replacements[id].reason,
      weightRationale: "The single candidate cell has weight 1 by definition.",
      reviewer: "Unapproved replacement-cell evidence workflow",
    };
  }
  writeJson("data-config/geography/destination-areas.geojson", areas);

  for (const id of ids) {
    const point = byKey.get(coordinateKey(id))!;
    const elevation = round(point.era5LandGridElevationM, 1);
    const latitude = round(point.resolvedLocation.latitude, 6);
    const longitude = round(point.resolvedLocation.longitude, 6);
    writeJson(`data-snapshots/sampling/${id}.json`, {
      schemaVersion: 1,
      datasetStatus: "provisional",
      destinationId: id,
      fixture: false,
      method: "representative-era5-land-grid-cell-v1",
      source: "ERA5-Land auxiliary invariant geopotential",
      bands: {representative: {targetElevationM: elevation, points: [{
        id: `${id}-representative-1`, lat: latitude, lon: longitude,
        representativeModelElevationM: elevation, targetElevationM: elevation, elevationMismatchM: 0,
        sampleWeight: 1, usedBufferM: 0, selectionRank: 1,
      }]}},
    });
    writeJson(`data-snapshots/dem/${id}.json`, {
      schemaVersion: 1,
      datasetStatus: "provisional",
      destinationId: id,
      fixture: false,
      source: "era5-land-invariant-geopotential",
      sourceProduct: "ERA5-Land auxiliary invariant geopotential",
      retrievedAt: orography.retrievedAt,
      area: {minM: elevation, p25M: elevation, medianM: elevation, p75M: elevation, maxM: elevation},
      bands: {representative: {minM: elevation, medianM: elevation, maxM: elevation, pixelCount: 1}},
    });
  }
  console.log(`Applied ${ids.length} replacement candidates to the runner working tree for evidence generation only.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
