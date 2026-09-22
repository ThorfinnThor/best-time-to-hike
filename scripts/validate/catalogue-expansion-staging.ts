import { existsSync, readFileSync } from "node:fs";
import { readJson } from "../lib/io";

type Destination = {id:string;slug:string;countryCode:string;elevationBands:Array<{id:string}>};

const selected = new Set((process.env.BTH_DESTINATIONS ?? "")
  .split(",").map((value) => value.trim()).filter(Boolean));
if (!selected.size) throw new Error("CATALOGUE_STAGING001 BTH_DESTINATIONS must name the staged candidates");

const destinations = readJson<Destination[]>("data-config/sources/destinations.json")
  .filter((destination) => selected.has(destination.id));
if (destinations.length !== selected.size) {
  const found = new Set(destinations.map((destination) => destination.id));
  throw new Error(`CATALOGUE_STAGING001 unknown staged candidates: ${[...selected].filter((id) => !found.has(id)).join(", ")}`);
}

const errors:string[] = [];
for (const destination of destinations) {
  const samplingPath = `data-snapshots/sampling/${destination.slug}.json`;
  const demPath = `data-snapshots/dem/${destination.slug}.json`;
  const climatePath = `data-snapshots/climate/${destination.slug}.json`;
  const publicPath = `public/data/hiking/destinations/${destination.countryCode.toLowerCase()}/${destination.slug}.json`;
  for (const path of [samplingPath, demPath, climatePath, publicPath]) {
    if (!existsSync(path)) errors.push(`${destination.id}: missing ${path}`);
  }
  if (!existsSync(climatePath)) continue;
  const sampling = readJson<any>(samplingPath);
  const climate = readJson<any>(climatePath);
  if (sampling.fixture !== false || climate.fixture !== false) errors.push(`${destination.id}: fixture evidence is forbidden`);
  if (climate.schemaVersion !== 2 || climate.datasetStatus !== "provisional"
    || climate.aggregationPolicyVersion !== "observation-validity-v1"
    || climate.migrationStatus !== "candidate-not-published") {
    errors.push(`${destination.id}: invalid fail-closed staging status`);
  }
  if (climate.historicalPeriod?.startYear !== 1991 || climate.historicalPeriod?.endYear !== 2025
    || climate.historicalPeriod?.classification !== "project-defined-historical-climate-average") {
    errors.push(`${destination.id}: invalid historical period`);
  }
  if (climate.sourceDownloads?.length !== 1 || climate.sourceDownloads[0]?.observationCount !== 306_864
    || !/^[a-f0-9]{64}$/.test(climate.sourceDownloads[0]?.downloadSha256 ?? "")
    || !/^[a-f0-9]{64}$/.test(climate.sourceDownloads[0]?.canonicalObservation?.sha256 ?? "")) {
    errors.push(`${destination.id}: incomplete or unhashed ERA5-Land source`);
  }
  const configuredBands = destination.elevationBands.map((band) => band.id).sort();
  if (JSON.stringify(Object.keys(climate.bands ?? {}).sort()) !== JSON.stringify(configuredBands)) {
    errors.push(`${destination.id}: climate bands differ from configuration`);
    continue;
  }
  for (const bandId of configuredBands) {
    const months = climate.bands[bandId]?.months;
    if (!Array.isArray(months) || months.length !== 12 || months.some((month:any,index:number) => month.month !== index + 1)) {
      errors.push(`${destination.id}/${bandId}: months 1-12 are incomplete`);
      continue;
    }
    for (const month of months) {
      if (month.sampleYearCount !== 35 || month.validInterannualYearCount !== 35
        || month.dataCompleteness !== 1 || month.scoringInputsAvailable !== true
        || month.missingScoringInputs?.length !== 0) {
        errors.push(`${destination.id}/${bandId}/${month.month}: incomplete observation-validity evidence`);
      }
    }
  }
  if (existsSync(publicPath)) {
    const published = JSON.parse(readFileSync(publicPath, "utf8"));
    if (published.datasetStatus !== "provisional"
      || published.provenance?.scope !== "one selected representative model-grid cell; not a whole-region or route-specific average") {
      errors.push(`${destination.id}: public staging output broadens the approved claim`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Catalogue staging validated: ${destinations.length} unpublished candidates, ${destinations.length * 12} complete destination-months.`);
