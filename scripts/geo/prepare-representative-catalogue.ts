/**
 * Prepare the one-cell destination catalogue at any size.
 *
 * Supersedes prepare-representative-50.ts, which hardcoded "5 core + 45
 * candidates" and threw for any other shape. The published method is unchanged:
 * one ERA5-Land 0.1-degree model-grid cell per destination, with the elevation
 * band derived as the resolved model elevation plus or minus 50 m.
 *
 *   --check                     resolve model elevations and report; write nothing
 *   --candidates=<path>         add a candidate file (repeatable)
 *   --only=<id,id>              activate only these candidates (trial batches)
 *
 * Writing is ADDITIVE. Live destinations pass through untouched: their configs,
 * geometry and snapshots are never rewritten, so a trial batch cannot truncate
 * the catalogue and cannot churn evidence timestamps for destinations it did
 * not touch. Only newly activated candidates are resolved and written.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { DestinationConfig } from "../../lib/data/types";
import { readJson, round, writeJson } from "../lib/io";

interface Candidate {
  id: string; name: string; countryCode: string; countryName: string;
  continent: string; region: string; timezone: string;
  candidateCentroid: {lat: number; lon: number};
  tags: string[]; affiliateQuery: string;
}
interface OrographyPoint {
  key: string;
  requestedLocation: {latitude: number; longitude: number};
  resolvedLocation: {latitude: number; longitude: number};
  era5LandGridElevationM: number;
}
interface RepresentativeOverride { lat: number; lon: number; label: string; reason: string }

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const candidatePaths = args.filter((arg) => arg.startsWith("--candidates=")).map((arg) => arg.slice("--candidates=".length));
const onlyArg = args.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").map((id) => id.trim()).filter(Boolean)) : null;

const workDir = "generated/intermediate/representative-catalogue";
const planPath = `${workDir}/request-plan.json`;
const orographyPath = `${workDir}/era5-land-orography.json`;
const coordinateKey = (id: string) => `destination_${id}`;
const gridCell = (lat: number, lon: number) => `${Math.round(lat / 0.1)}:${Math.round(lon / 0.1)}`;

function pythonExecutable() {
  if (process.env.BTH_DATA_PYTHON) return process.env.BTH_DATA_PYTHON;
  const local = "generated/intermediate/data-venv/bin/python3";
  return existsSync(local) ? local : "python3";
}

function runPython(script: string, scriptArgs: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(pythonExecutable(), [script, ...scriptArgs], {stdio: "inherit", env: process.env});
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`CATALOGUE001 ${script} exited with ${code}`)));
  });
}

interface Intake {
  id: string; name: string; countryCode: string; countryName: string;
  continent: string; region: string; timezone: string;
  coordinates: {lat: number; lon: number};
  representativeCoordinates: {lat: number; lon: number};
  tags: string[]; affiliateQuery: string; priority: number; isNew: boolean;
}

async function main() {
  const overrides = readJson<{overrides: Record<string, RepresentativeOverride>}>("data-config/sources/representative-cell-overrides.json").overrides;
  const live = readJson<DestinationConfig[]>("data-config/sources/destinations.json");
  const liveIds = new Set(live.map((destination) => destination.id));

  const intake: Intake[] = live.map((destination) => ({
    id: destination.id, name: destination.name, countryCode: destination.countryCode,
    countryName: destination.countryName, continent: destination.continent, region: destination.region,
    timezone: destination.timezone, coordinates: destination.coordinates, tags: destination.tags,
    affiliateQuery: destination.affiliateQuery, priority: destination.priority, isNew: false,
    representativeCoordinates: overrides[destination.id] ?? destination.coordinates,
  }));

  let nextPriority = Math.min(0, ...intake.map((entry) => entry.priority)) - 1;
  for (const path of candidatePaths) {
    const file = readJson<{candidates: Candidate[]}>(path);
    for (const candidate of file.candidates) {
      if (liveIds.has(candidate.id)) throw new Error(`CATALOGUE001 candidate ${candidate.id} is already live`);
      intake.push({
        id: candidate.id, name: candidate.name, countryCode: candidate.countryCode,
        countryName: candidate.countryName, continent: candidate.continent, region: candidate.region,
        timezone: candidate.timezone, coordinates: candidate.candidateCentroid, tags: candidate.tags,
        affiliateQuery: candidate.affiliateQuery, priority: nextPriority, isNew: true,
        representativeCoordinates: overrides[candidate.id] ?? candidate.candidateCentroid,
      });
      nextPriority -= 1;
      liveIds.add(candidate.id);
    }
  }

  // --only narrows which candidates activate; live destinations are always kept
  // so a trial batch can never remove a published destination.
  const activated = intake.filter((entry) => entry.isNew && (!only || only.has(entry.id)));
  const selected = checkOnly && only ? intake.filter((entry) => only.has(entry.id)) : [...intake.filter((entry) => !entry.isNew), ...activated];
  if (!selected.length) throw new Error("CATALOGUE001 no destinations selected");
  if (new Set(selected.map((entry) => entry.id)).size !== selected.length) throw new Error("CATALOGUE001 destination ids are not unique");
  if (only) {
    const unknown = [...only].filter((id) => !intake.some((entry) => entry.id === id));
    if (unknown.length) throw new Error(`CATALOGUE001 --only names unknown destinations: ${unknown.join(", ")}`);
  }

  const cells = new Map<string, string>();
  for (const entry of selected) {
    const key = gridCell(entry.representativeCoordinates.lat, entry.representativeCoordinates.lon);
    const owner = cells.get(key);
    if (owner) throw new Error(`CATALOGUE001 ${entry.id} and ${owner} resolve to the same ERA5-Land grid cell`);
    cells.set(key, entry.id);
  }
  for (const [id, override] of Object.entries(overrides)) {
    if (!selected.some((entry) => entry.id === id) && !intake.some((entry) => entry.id === id)) {
      throw new Error(`CATALOGUE001 override references unknown destination ${id}`);
    }
  }

  writeJson(planPath, {
    schemaVersion: 1,
    source: "ERA5-Land auxiliary invariant geopotential",
    method: "nearest 0.1-degree model grid coordinate to the curated representative coordinate",
    entries: selected.map((entry) => ({
      key: coordinateKey(entry.id), lat: entry.representativeCoordinates.lat, lon: entry.representativeCoordinates.lon,
      consumers: [{destinationId: entry.id, bandId: "representative", samplePointId: `${entry.id}-representative-1`}],
    })),
  });

  await runPython("scripts/import/download_era5_land_orography.py", ["--plan", planPath, "--output", orographyPath]);
  const orography = readJson<{retrievedAt: string; points: OrographyPoint[]}>(orographyPath);
  const byKey = new Map(orography.points.map((point) => [point.key, point]));

  const unresolved = selected.filter((entry) => {
    const point = byKey.get(coordinateKey(entry.id));
    return !point || !Number.isFinite(point.era5LandGridElevationM);
  });

  if (checkOnly) {
    const resolved = selected.filter((entry) => !unresolved.includes(entry));
    const elevations = resolved.map((entry) => round(byKey.get(coordinateKey(entry.id))!.era5LandGridElevationM, 1));
    console.log(`Preflight: ${resolved.length}/${selected.length} points resolved to an ERA5-Land land cell.`);
    if (elevations.length) console.log(`Model elevation range: ${Math.min(...elevations)}–${Math.max(...elevations)} m.`);
    if (unresolved.length) {
      console.log(`\n${unresolved.length} point(s) did NOT resolve (ocean, ice sheet or outside the land mask):`);
      for (const entry of unresolved) console.log(`  ${entry.id}  ${entry.representativeCoordinates.lat}, ${entry.representativeCoordinates.lon}`);
    }
    const newlyResolved = resolved.filter((entry) => entry.isNew);
    if (newlyResolved.length) {
      const sorted = [...newlyResolved].sort((a, b) =>
        byKey.get(coordinateKey(b.id))!.era5LandGridElevationM - byKey.get(coordinateKey(a.id))!.era5LandGridElevationM);
      console.log(`\nHighest new candidates:`);
      for (const entry of sorted.slice(0, 8)) console.log(`  ${round(byKey.get(coordinateKey(entry.id))!.era5LandGridElevationM, 0)} m  ${entry.id}`);
      console.log(`Lowest new candidates:`);
      for (const entry of sorted.slice(-5)) console.log(`  ${round(byKey.get(coordinateKey(entry.id))!.era5LandGridElevationM, 0)} m  ${entry.id}`);
    }
    console.log(`\nNo climate data was downloaded and no configuration was written.`);
    return;
  }

  if (unresolved.length) {
    throw new Error(`CATALOGUE001 ${unresolved.length} point(s) have no ERA5-Land model elevation: ${unresolved.map((entry) => entry.id).join(", ")}`);
  }

  const prepared: DestinationConfig[] = activated.map((entry) => {
    const elevation = round(byKey.get(coordinateKey(entry.id))!.era5LandGridElevationM, 1);
    return {
      id: entry.id, slug: entry.id, name: entry.name,
      countryCode: entry.countryCode, countryName: entry.countryName,
      continent: entry.continent, region: entry.region, timezone: entry.timezone,
      active: true, priority: entry.priority, affiliateQuery: entry.affiliateQuery,
      tags: entry.tags, coordinates: entry.coordinates,
      elevationBands: [{id: "representative", minM: Math.floor(elevation - 50), maxM: Math.ceil(elevation + 50), weight: 1}],
    };
  });
  if (!prepared.length) { console.log("Nothing to activate; live catalogue unchanged."); return; }
  writeJson("data-config/sources/destinations.json", [...live, ...prepared]);

  const halfCell = 0.05;
  const existingFeatures = readJson<{features: unknown[]}>("data-config/geography/destination-areas.geojson").features;
  const newFeatures = activated.map((entry) => {
    const {latitude, longitude} = byKey.get(coordinateKey(entry.id))!.resolvedLocation;
    return {
      type: "Feature" as const,
      properties: {
        destinationId: entry.id,
        provenance: {
          status: "reviewed",
          sourceType: "project-curated-draft",
          sourceLabel: overrides[entry.id]?.label ?? "ERA5-Land representative 0.1-degree model-grid cell v1",
          intendedScope: "Historical climate at one selected representative model-grid cell; not a trail-corridor or whole-region average.",
          excludedClasses: ["whole-region-average", "route-specific-conditions", "live-weather"],
          bandRationale: overrides[entry.id]?.reason ?? "One model-elevation band prevents unsupported interpolation of precipitation, snow and wind between terrain levels.",
          weightRationale: "The single representative cell has weight 1 by definition.",
          reviewer: "Automated source-contract and coordinate validation",
        },
      },
      geometry: {type: "Polygon" as const, coordinates: [[
        [round(longitude - halfCell, 6), round(latitude - halfCell, 6)],
        [round(longitude + halfCell, 6), round(latitude - halfCell, 6)],
        [round(longitude + halfCell, 6), round(latitude + halfCell, 6)],
        [round(longitude - halfCell, 6), round(latitude + halfCell, 6)],
        [round(longitude - halfCell, 6), round(latitude - halfCell, 6)],
      ]]},
    };
  });
  writeJson("data-config/geography/destination-areas.geojson", {type: "FeatureCollection", features: [...existingFeatures, ...newFeatures]});

  for (const destination of prepared) {
    const point = byKey.get(coordinateKey(destination.id))!;
    const elevation = round(point.era5LandGridElevationM, 1);
    writeJson(`data-snapshots/sampling/${destination.slug}.json`, {
      schemaVersion: 1, datasetStatus: "provisional", destinationId: destination.id, fixture: false,
      method: "representative-era5-land-grid-cell-v1",
      source: "ERA5-Land auxiliary invariant geopotential",
      bands: {representative: {targetElevationM: elevation, points: [{
        id: `${destination.id}-representative-1`,
        lat: round(point.resolvedLocation.latitude, 6), lon: round(point.resolvedLocation.longitude, 6),
        representativeModelElevationM: elevation, targetElevationM: elevation, elevationMismatchM: 0,
        sampleWeight: 1, usedBufferM: 0, selectionRank: 1,
      }]}},
    });
    writeJson(`data-snapshots/dem/${destination.slug}.json`, {
      schemaVersion: 1, datasetStatus: "provisional", destinationId: destination.id, fixture: false,
      source: "era5-land-invariant-geopotential", sourceProduct: "ERA5-Land auxiliary invariant geopotential",
      retrievedAt: orography.retrievedAt,
      area: {minM: elevation, p25M: elevation, medianM: elevation, p75M: elevation, maxM: elevation},
      bands: {representative: {minM: elevation, medianM: elevation, maxM: elevation, pixelCount: 1}},
    });
  }
  console.log(`Activated ${prepared.length} new destination(s); catalogue is now ${live.length + prepared.length}. Live entries were not rewritten.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
