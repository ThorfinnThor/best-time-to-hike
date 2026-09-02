import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { ROOT } from "../lib/io";

const batch = process.env.BTH_CANDIDATE_BATCH?.trim();
if (batch !== "1") throw new Error("CANDIDATE_VALIDATE001 BTH_CANDIDATE_BATCH must be 1");

const configuredRoot = process.env.BTH_CANDIDATE_STAGING_ROOT?.trim();
const stagingRoot = configuredRoot
  ? (isAbsolute(configuredRoot) ? configuredRoot : resolve(ROOT, configuredRoot))
  : join(ROOT, `generated/intermediate/candidate-batch-${batch}`);
const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(stagingRoot, path), "utf8")) as T;
const sha256File = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const fail = (message: string): never => { throw new Error(`CANDIDATE_VALIDATE001 ${message}`); };

const destinations = readJson<any[]>("destinations.json");
const geometry = readJson<any>("destination-areas.geojson");
const representativeness = JSON.parse(readFileSync(join(ROOT, "data-config/methodology/era5-land-representativeness-v1.json"), "utf8"));
const candidateOrographyPlan = readJson<any>("era5-orography-candidate-plan.json");
const candidateOrography = readJson<any>("era5-invariants/candidate-orography.json");
const plan = readJson<any>("era5-request-plan.json");
const orography = readJson<any>("era5-invariants/era5-land-orography.json");

if (!destinations.length || destinations.some((destination) => !destination.active)) fail("destination set is empty or inactive");
if (geometry.features?.length !== destinations.length) fail("geometry count differs from destination count");
if (!Array.isArray(candidateOrographyPlan.entries) || candidateOrographyPlan.entries.length === 0
  || candidateOrography.pointCount !== candidateOrographyPlan.entries.length
  || candidateOrography.points?.length !== candidateOrographyPlan.entries.length) {
  fail("candidate model-orography preflight is incomplete");
}
if (plan.uniquePointCount !== plan.entries?.length) fail("request-plan point count is inconsistent");
if (new Set(plan.entries.map((entry: any) => entry.key)).size !== plan.uniquePointCount) fail("request-plan keys are not unique");
if (orography.pointCount !== plan.uniquePointCount || orography.points?.length !== plan.uniquePointCount) {
  fail("invariant-orography point set differs from the request plan");
}
const orographyKeys = new Set(orography.points.map((point: any) => point.key));
if (plan.entries.some((entry: any) => !orographyKeys.has(entry.key))) fail("invariant orography is missing a request-plan key");

const allClimateKeys = new Set<string>();
let bandMonthCount = 0;
for (const destination of destinations) {
  if (!geometry.features.some((feature: any) => feature.properties?.destinationId === destination.id)) {
    fail(`${destination.slug} has no staged geometry`);
  }
  const samplingPath = join(stagingRoot, "real-sampling", `${destination.slug}.json`);
  const rawSampling = readFileSync(samplingPath, "utf8");
  const sampling = JSON.parse(rawSampling);
  const dem = readJson<any>(`real-dem/${destination.slug}.json`);
  const climate = readJson<any>(`real-climate/${destination.slug}.json`);
  if (sampling.destinationId !== destination.id || sampling.fixture !== false) fail(`${destination.slug} has invalid sampling metadata`);
  if (sampling.modelOrographyPreflight?.thresholdM !== representativeness.modelOrography.blockedMismatchAboveM) fail(`${destination.slug} is missing the approved model-orography preflight gate`);
  if (dem.destinationId !== destination.id || dem.fixture !== false) fail(`${destination.slug} has invalid DEM metadata`);
  if (climate.destinationId !== destination.id
    || climate.schemaVersion !== 2
    || climate.datasetStatus !== "staging"
    || climate.fixture !== false
    || climate.source !== "era5-land-timeseries"
    || climate.sourceDataset !== "reanalysis-era5-land-timeseries"
    || climate.climateNormal?.startYear !== 1991
    || climate.climateNormal?.endYear !== 2020) {
    fail(`${destination.slug} has an invalid climate source contract`);
  }
  const samplingHash = createHash("sha256").update(rawSampling).digest("hex");
  if (climate.samplingSnapshotHash !== samplingHash) fail(`${destination.slug} sampling hash differs from climate provenance`);
  const configuredBandIds = destination.elevationBands.map((band: any) => band.id).sort();
  if (JSON.stringify(Object.keys(climate.bands).sort()) !== JSON.stringify(configuredBandIds)) {
    fail(`${destination.slug} climate bands differ from the candidate configuration`);
  }
  for (const bandId of configuredBandIds) {
    for (const point of sampling.bands[bandId]?.points ?? []) {
      if (!Number.isFinite(point.era5LandGridElevationM)
        || !Number.isFinite(point.modelOrographyMismatchM)
        || point.modelOrographyMismatchM > representativeness.modelOrography.blockedMismatchAboveM) {
        fail(`${destination.slug}/${bandId} contains a point outside the model-orography gate`);
      }
    }
    const months = climate.bands[bandId]?.months;
    if (!Array.isArray(months) || months.length !== 12 || months.some((month: any, index: number) => month.month !== index + 1)) {
      fail(`${destination.slug}/${bandId} does not contain months 1-12 exactly once`);
    }
    for (const month of months) {
      if (month.dataCompleteness !== 1 || month.sampleYearCount !== 30 || month.validInterannualYearCount !== 30) {
        fail(`${destination.slug}/${bandId}/${month.month} is not a complete 1991-2020 normal`);
      }
    }
    bandMonthCount += months.length;
  }
  const destinationPlanKeys = new Set(plan.entries
    .filter((entry: any) => entry.consumers.some((consumer: any) => consumer.destinationId === destination.id))
    .map((entry: any) => entry.key));
  const downloadKeys = new Set(climate.sourceDownloads?.map((download: any) => download.key));
  if (downloadKeys.size !== destinationPlanKeys.size || [...destinationPlanKeys].some((key) => !downloadKeys.has(key))) {
    fail(`${destination.slug} climate downloads differ from the request plan`);
  }
  for (const download of climate.sourceDownloads) {
    allClimateKeys.add(download.key);
    const rawPath = join(stagingRoot, "era5-raw", `${download.key}.ndjson.gz`);
    if (!existsSync(rawPath)
      || download.observationCount !== 262_992
      || download.firstUtcInstant !== "1991-01-01T00:00:00.000Z"
      || download.lastUtcInstant !== "2020-12-31T23:00:00.000Z"
      || download.canonicalObservation?.encoding !== "gzip-ndjson-utf8"
      || download.canonicalObservation?.gzipMtime !== 0
      || sha256File(rawPath) !== download.canonicalObservation?.sha256
      || Object.keys(download.variables ?? {}).length !== 7) {
      fail(`${destination.slug}/${download.key} has incomplete or mismatched source provenance`);
    }
  }
}

if (allClimateKeys.size !== plan.uniquePointCount) fail("climate point set differs from the request plan");
console.log(`Candidate staging validated: ${destinations.length} destinations, ${plan.uniquePointCount} ERA5-Land points, ${bandMonthCount} band-months.`);
