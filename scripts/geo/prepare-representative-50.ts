import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { DestinationConfig } from "../../lib/data/types";
import { readJson, round, writeJson } from "../lib/io";

interface Candidate {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  continent: string;
  region: string;
  timezone: string;
  candidateCentroid: {lat:number;lon:number};
  tags: string[];
  affiliateQuery: string;
}

interface OrographyPoint {
  key: string;
  requestedLocation: {latitude:number;longitude:number};
  resolvedLocation: {latitude:number;longitude:number};
  era5LandGridElevationM: number;
}

interface RepresentativeOverride {
  lat: number;
  lon: number;
  label: string;
  reason: string;
}

const checkOnly = process.argv.includes("--check");
const planPath = "generated/intermediate/representative-50/request-plan.json";
const orographyPath = "generated/intermediate/representative-50/era5-land-orography.json";

function pythonExecutable() {
  if (process.env.BTH_DATA_PYTHON) return process.env.BTH_DATA_PYTHON;
  const local = "generated/intermediate/data-venv/bin/python3";
  return existsSync(local) ? local : "python3";
}

function runPython(script: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(pythonExecutable(), [script, ...args], {stdio:"inherit", env:process.env});
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`REPRESENTATIVE001 ${script} exited with ${code}`)));
  });
}

function coordinateKey(id: string) {
  return `destination_${id}`;
}

async function main() {
  const candidateFile = readJson<{candidates:Candidate[]}>("data-config/sources/destination-candidates.json");
  const overrides = readJson<{overrides:Record<string,RepresentativeOverride>}>("data-config/sources/representative-cell-overrides.json").overrides;
  const candidateIds = new Set(candidateFile.candidates.map((candidate) => candidate.id));
  const current = readJson<DestinationConfig[]>("data-config/sources/destinations.json");
  const core = current.filter((destination) => !candidateIds.has(destination.id));
  if (core.length !== 5 || candidateFile.candidates.length !== 45) {
    throw new Error(`REPRESENTATIVE001 expected 5 core and 45 candidate destinations, received ${core.length} and ${candidateFile.candidates.length}`);
  }

  const intake = [
    ...core.map((destination) => ({
      id:destination.id, name:destination.name, countryCode:destination.countryCode,
      countryName:destination.countryName, continent:destination.continent, region:destination.region,
      timezone:destination.timezone, coordinates:destination.coordinates, tags:destination.tags,
      affiliateQuery:destination.affiliateQuery, priority:destination.priority,
      representativeCoordinates:overrides[destination.id] ?? destination.coordinates
    })),
    ...candidateFile.candidates.map((candidate, index) => ({
      id:candidate.id, name:candidate.name, countryCode:candidate.countryCode,
      countryName:candidate.countryName, continent:candidate.continent, region:candidate.region,
      timezone:candidate.timezone, coordinates:candidate.candidateCentroid, tags:candidate.tags,
      affiliateQuery:candidate.affiliateQuery, priority:95-index,
      representativeCoordinates:overrides[candidate.id] ?? candidate.candidateCentroid
    }))
  ];
  if (new Set(intake.map((destination) => destination.id)).size !== 50) throw new Error("REPRESENTATIVE001 destination IDs are not unique");
  const intakeIds = new Set(intake.map((destination) => destination.id));
  for (const [id, override] of Object.entries(overrides)) {
    if (!intakeIds.has(id)) throw new Error(`REPRESENTATIVE001 override references unknown destination ${id}`);
    if (!Number.isFinite(override.lat) || !Number.isFinite(override.lon) || override.lat < -90 || override.lat > 90 || override.lon < -180 || override.lon > 180 || !override.label || !override.reason) {
      throw new Error(`REPRESENTATIVE001 invalid representative-cell override for ${id}`);
    }
  }

  writeJson(planPath, {
    schemaVersion:1,
    source:"ERA5-Land auxiliary invariant geopotential",
    method:"nearest 0.1-degree model grid coordinate to the curated representative coordinate",
    entries:intake.map((destination) => ({
      key:coordinateKey(destination.id), lat:destination.representativeCoordinates.lat, lon:destination.representativeCoordinates.lon,
      consumers:[{destinationId:destination.id,bandId:"representative",samplePointId:`${destination.id}-representative-1`}]
    }))
  });
  await runPython("scripts/import/download_era5_land_orography.py", ["--plan",planPath,"--output",orographyPath]);
  const points = readJson<{points:OrographyPoint[]}>(orographyPath).points;
  const byKey = new Map(points.map((point) => [point.key,point]));
  if (byKey.size !== 50) throw new Error(`REPRESENTATIVE001 expected 50 model-orography points, received ${byKey.size}`);

  const summary = intake.map((destination) => {
    const point = byKey.get(coordinateKey(destination.id));
    if (!point || !Number.isFinite(point.era5LandGridElevationM)) throw new Error(`REPRESENTATIVE001 missing model elevation for ${destination.id}`);
    return {id:destination.id, elevationM:round(point.era5LandGridElevationM,1), resolvedLocation:point.resolvedLocation};
  });
  if (checkOnly) {
    const elevations = summary.map((item) => item.elevationM);
    console.log(`Representative preflight passed for 50 destinations (${Math.min(...elevations)}–${Math.max(...elevations)} m model elevation).`);
    return;
  }

  const destinations: DestinationConfig[] = intake.map((destination) => {
    const point = byKey.get(coordinateKey(destination.id))!;
    const elevation = round(point.era5LandGridElevationM,1);
    return {
      id:destination.id, slug:destination.id, name:destination.name,
      countryCode:destination.countryCode, countryName:destination.countryName,
      continent:destination.continent, region:destination.region, timezone:destination.timezone,
      active:true, priority:destination.priority, affiliateQuery:destination.affiliateQuery,
      tags:destination.tags, coordinates:destination.coordinates,
      elevationBands:[{id:"representative",minM:Math.floor(elevation-50),maxM:Math.ceil(elevation+50),weight:1}]
    };
  });
  writeJson("data-config/sources/destinations.json", destinations);

  const features = intake.map((destination) => {
    const point = byKey.get(coordinateKey(destination.id))!;
    const {latitude,longitude} = point.resolvedLocation;
    const halfCell = 0.05;
    return {
      type:"Feature" as const,
      properties:{
        destinationId:destination.id,
        provenance:{
          status:"reviewed",
          sourceType:"project-curated-draft",
          sourceLabel:overrides[destination.id]?.label ?? "ERA5-Land representative 0.1-degree model-grid cell v1",
          intendedScope:"Historical climate at one representative model-grid cell nearest the configured destination coordinate; not a trail-corridor or whole-region average.",
          excludedClasses:["whole-region-average","route-specific-conditions","live-weather"],
          bandRationale:overrides[destination.id]?.reason ?? "One model-elevation band prevents unsupported interpolation of precipitation, snow and wind between terrain levels.",
          weightRationale:"The single representative cell has weight 1 by definition.",
          reviewer:"Automated source-contract and coordinate validation"
        }
      },
      geometry:{type:"Polygon" as const,coordinates:[[
        [round(longitude-halfCell,6),round(latitude-halfCell,6)],
        [round(longitude+halfCell,6),round(latitude-halfCell,6)],
        [round(longitude+halfCell,6),round(latitude+halfCell,6)],
        [round(longitude-halfCell,6),round(latitude+halfCell,6)],
        [round(longitude-halfCell,6),round(latitude-halfCell,6)]
      ]]}
    };
  });
  writeJson("data-config/geography/destination-areas.geojson", {type:"FeatureCollection",features});

  for (const destination of destinations) {
    const point = byKey.get(coordinateKey(destination.id))!;
    const elevation = round(point.era5LandGridElevationM,1);
    const samplePoint = {
      id:`${destination.id}-representative-1`,
      lat:round(point.resolvedLocation.latitude,6), lon:round(point.resolvedLocation.longitude,6),
      representativeModelElevationM:elevation, targetElevationM:elevation, elevationMismatchM:0,
      sampleWeight:1, usedBufferM:0, selectionRank:1
    };
    writeJson(`data-snapshots/sampling/${destination.slug}.json`, {
      schemaVersion:1, datasetStatus:"provisional", destinationId:destination.id, fixture:false,
      method:"representative-era5-land-grid-cell-v1",
      source:"ERA5-Land auxiliary invariant geopotential",
      bands:{representative:{targetElevationM:elevation,points:[samplePoint]}}
    });
    writeJson(`data-snapshots/dem/${destination.slug}.json`, {
      schemaVersion:1, datasetStatus:"provisional", destinationId:destination.id, fixture:false,
      source:"era5-land-invariant-geopotential", sourceProduct:"ERA5-Land auxiliary invariant geopotential",
      retrievedAt:readJson<any>(orographyPath).retrievedAt,
      area:{minM:elevation,p25M:elevation,medianM:elevation,p75M:elevation,maxM:elevation},
      bands:{representative:{minM:elevation,medianM:elevation,maxM:elevation,pixelCount:1}}
    });
  }
  console.log("Prepared 50 one-cell destination configs and provisional model-elevation snapshots.");
}

main().catch((error:unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
