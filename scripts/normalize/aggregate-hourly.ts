import Ajv2020 from "ajv/dist/2020";
import type { HourlyClimateObservation, PrecipitationSemantics } from "../../lib/hiking/climate";
import { aggregatePointClimate } from "../../lib/hiking/climate";
import { requireApprovedSource } from "../import/source-preflight";
import { readJson, writeJson } from "../lib/io";

interface HourlySnapshot {
  schemaVersion: 2;
  datasetStatus: "fixture" | "production";
  source: "era5Land";
  destinationId: string;
  samplePointId: string;
  timezone: string;
  coordinates: {lat:number;lon:number};
  era5LandGridElevationM: number;
  targetElevationM: number;
  precipitationSemantics: PrecipitationSemantics;
  climateNormal: {startYear:number;endYear:number};
  observations: HourlyClimateObservation[];
}

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath?.startsWith("data-snapshots/hourly/") || inputPath.includes("..")) throw new Error("Usage: aggregate-hourly.ts data-snapshots/hourly/<file>.json generated/intermediate/hourly/<file>.json");
if (!outputPath?.startsWith("generated/intermediate/hourly/") || outputPath.includes("..")) throw new Error("Output must be under generated/intermediate/hourly/");
const snapshot = readJson<HourlySnapshot>(inputPath);
const schema = readJson<any>("schemas/hourly-climate.schema.json");
const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
if (!validate(snapshot)) throw new Error(`Hourly snapshot schema: ${validate.errors?.map((error)=>`${error.instancePath} ${error.message}`).join("; ")}`);
if (snapshot.datasetStatus === "production") {
  requireApprovedSource("era5Land");
  const approved = readJson<any>("data-config/methodology/source-semantics.json").era5Land.precipitationSemantics;
  if (snapshot.precipitationSemantics !== approved) throw new Error("BLOCKED_SOURCE_SEMANTICS: snapshot precipitation semantics differ from the approved registry.");
}
const result = aggregatePointClimate(snapshot.observations, {
  timezone: snapshot.timezone,
  lat: snapshot.coordinates.lat,
  lon: snapshot.coordinates.lon,
  era5LandGridElevationM: snapshot.era5LandGridElevationM,
  targetElevationM: snapshot.targetElevationM,
  precipitationSemantics: snapshot.precipitationSemantics,
  startYear: snapshot.climateNormal.startYear,
  endYear: snapshot.climateNormal.endYear
});
writeJson(outputPath, {
  schemaVersion: 1,
  datasetStatus: snapshot.datasetStatus,
  destinationId: snapshot.destinationId,
  samplePointId: snapshot.samplePointId,
  climateNormal: snapshot.climateNormal,
  ...result
});
console.log(`Aggregated ${snapshot.observations.length} hourly records into ${result.daily.length} local days and 12 climatology months.`);
