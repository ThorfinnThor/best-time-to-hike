import { createReadStream, existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import type { BandClimateMonth, DestinationConfig } from "../../lib/data/types";
import { aggregateBandPointMetrics } from "../../lib/hiking/band-climate";
import { aggregateMonthlyClimate, aggregatePointClimate, type DailyPointClimate, type HourlyClimateObservation, type MonthlyPointClimate } from "../../lib/hiking/climate";
import { maximumSeparationKm } from "../../lib/hiking/sampling";
import { interpolate, overallScore, scoreComponents, type Curve } from "../../lib/scoring";
import curves from "../../data-config/scoring/curves.json";
import climateAggregation from "../../data-config/methodology/climate-aggregation-v1.json";
import { requireApprovedSource } from "./source-preflight";
import { readJson, round, sha256, writeJson } from "../lib/io";

interface SamplingPoint {
  id: string;
  lat: number;
  lon: number;
  targetElevationM: number;
  elevationMismatchM: number;
  sampleWeight: number;
  era5LandGridElevationM?: number;
  modelOrographyMismatchM?: number;
}

interface OrographyPoint {
  key: string;
  requestedLocation: {latitude:number;longitude:number};
  resolvedLocation: {latitude:number;longitude:number};
  geopotentialM2S2: number;
  era5LandGridElevationM: number;
}

interface OrographySnapshot {
  schemaVersion: number;
  sourceProduct: string;
  sourceDocumentUrl: string;
  downloadUrl: string;
  downloadBytes: number;
  downloadSha256: string;
  retrievedAt: string;
  parameter: {name:string;shortName:string;paramId:number;unit:string};
  grid: {latitudeDegrees:number;longitudeDegrees:number;selection:string};
  conversion: {formula:string;standardGravityMS2:number};
  pointCount: number;
  points: OrographyPoint[];
}

interface PointResult {
  point: SamplingPoint;
  daily: DailyPointClimate[];
  monthly: MonthlyPointClimate[];
}

interface RequestPlanEntry {
  key: string;
  lat: number;
  lon: number;
  consumers: Array<{destinationId:string;bandId:string;samplePointId:string}>;
  request: Record<string, unknown>;
}

const VARIABLES = [
  "2m_temperature",
  "2m_dewpoint_temperature",
  "10m_u_component_of_wind",
  "10m_v_component_of_wind",
  "total_precipitation",
  "snow_cover",
  "snow_depth"
];

function coordinateKey(lat: number, lon: number) {
  const format = (value:number) => value.toFixed(1).replace("-", "m").replace(".", "p");
  return `${format(lat)}_${format(lon)}`;
}

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function pythonExecutable() {
  if (process.env.BTH_DATA_PYTHON) return process.env.BTH_DATA_PYTHON;
  const local = "generated/intermediate/data-venv/bin/python3";
  return existsSync(local) ? local : "python3";
}

function runPython(script: string, args: string[], errorCode: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(pythonExecutable(), [script, ...args], { stdio: "inherit", env: process.env });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${errorCode} Python importer exited with ${code}`)));
  });
}

function circularLongitudeDifference(first: number, second: number) {
  return Math.abs(((first - second + 540) % 360) - 180);
}

function sameGridLocation(first: {latitude:number;longitude:number}, second: {latitude:number;longitude:number}) {
  return Number.isFinite(first?.latitude)
    && Number.isFinite(first?.longitude)
    && Number.isFinite(second?.latitude)
    && Number.isFinite(second?.longitude)
    && Math.abs(first.latitude - second.latitude) <= 1e-4
    && circularLongitudeDifference(first.longitude, second.longitude) <= 1e-4;
}

async function readHourlyObservations(path: string) {
  const observations: HourlyClimateObservation[] = [];
  const lines = createInterface({ input: createReadStream(path).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of lines) {
    if (line.trim()) observations.push(JSON.parse(line) as HourlyClimateObservation);
  }
  return observations;
}

function addTemperatureUtilityScore(metrics: MonthlyPointClimate) {
  if (!metrics.temperatureUtilitySamplesC.length) throw new Error("ERA5_AGG001 no valid hiking-window temperatures");
  metrics.temperatureUtilityScore = metrics.temperatureUtilitySamplesC.reduce(
    (sum, value) => sum + interpolate(value, curves.temperature as Curve), 0
  ) / metrics.temperatureUtilitySamplesC.length;
  return metrics;
}

function completeYearPointMetrics(metrics: MonthlyPointClimate) {
  const required = [
    metrics.temperatureHikingMeanC, metrics.temperatureHikingP10C, metrics.temperatureHikingP90C,
    metrics.wetDayProbability, metrics.heavyRainDayProbability, metrics.precipitationMonthlyMeanMm,
    metrics.snowDayProbability, metrics.snowDepthMeanOnSnowDaysM, metrics.windHikingMeanKmh,
    metrics.highWindHourProbability, metrics.severeWindHourProbability, metrics.hotDayProbability,
    metrics.severeHotDayProbability, metrics.relativeHumidityHikingMeanPct
  ];
  return metrics.temperatureUtilitySamplesC.length > 0 && required.every((value) => value !== null && Number.isFinite(value));
}

function polygonDiameterKm(geometry: any) {
  const values = (geometry.type === "Polygon" ? geometry.coordinates.flat(1) : geometry.coordinates.flat(2)) as Array<[number,number]>;
  return maximumSeparationKm(values.map(([lon, lat]) => ({ lat, lon })));
}

function populationStandardDeviation(values: number[]) {
  if (!values.length) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
}

function roundClimateMetrics(metrics: ReturnType<typeof aggregateBandPointMetrics>) {
  const probabilityKeys = new Set([
    "wetDayProbability","heavyRainDayProbability","snowDayProbability","highWindHourProbability",
    "severeWindHourProbability","hotDayProbability","severeHotDayProbability","dataCompleteness"
  ]);
  return Object.fromEntries(Object.entries(metrics).map(([key, value]) => {
    if (key === "temperatureUtilitySamplesC") return [key, (value as number[]).map((item) => round(item, 1))];
    if (typeof value !== "number") return [key, value];
    return [key, round(value, probabilityKeys.has(key) || key === "temperatureUtilityScore" ? 4 : 1)];
  })) as unknown as ReturnType<typeof aggregateBandPointMetrics>;
}

function buildPlan(destinations: DestinationConfig[], samplingRoot: string): RequestPlanEntry[] {
  const entries = new Map<string, RequestPlanEntry>();
  for (const destination of destinations) {
    const samplingPath = `${samplingRoot}/${destination.slug}.json`;
    const sampling = readJson<any>(samplingPath);
    if (sampling.fixture) throw new Error(`ERA5_REQUEST001 ${destination.id} still uses fixture sampling`);
    for (const [bandId, band] of Object.entries(sampling.bands) as Array<[string,any]>) {
      for (const point of band.points as SamplingPoint[]) {
        const key = coordinateKey(point.lat, point.lon);
        const existing = entries.get(key) ?? {
          key, lat: point.lat, lon: point.lon, consumers: [],
          request: {
            dataset: "reanalysis-era5-land-timeseries",
            variable: VARIABLES,
            location: {longitude:point.lon,latitude:point.lat},
            date: ["1991-01-01/2020-12-31"],
            data_format: "netcdf"
          }
        };
        existing.consumers.push({destinationId:destination.id,bandId,samplePointId:point.id});
        entries.set(key, existing);
      }
    }
  }
  return [...entries.values()].sort((first, second) => first.key.localeCompare(second.key));
}

async function main() {
  const argumentsSet = new Set(process.argv.slice(2));
  const planOnly = argumentsSet.has("--plan");
  const publish = argumentsSet.has("--publish");
  const refresh = argumentsSet.has("--refresh");
  const candidateBatch = process.env.BTH_CANDIDATE_BATCH ? Number(process.env.BTH_CANDIDATE_BATCH) : null;
  if (candidateBatch !== null && (!Number.isInteger(candidateBatch) || candidateBatch < 1)) {
    throw new Error("ERA5_REQUEST001 BTH_CANDIDATE_BATCH must be a positive integer");
  }
  if (candidateBatch !== null && publish) throw new Error("ERA5_REQUEST001 candidate batches cannot be published");
  const destinationArgument = [...argumentsSet].find((value) => value.startsWith("--destination="));
  const selectedSlug = destinationArgument?.slice("--destination=".length);
  const requestedSlugs = new Set((selectedSlug ? [selectedSlug] : (process.env.BTH_DESTINATIONS ?? "").split(","))
    .map((value) => value.trim()).filter(Boolean));
  if (publish) requireApprovedSource("era5Land");
  const stagingRoot = candidateBatch === null ? "generated/intermediate" : `generated/intermediate/candidate-batch-${candidateBatch}`;
  const destinationPath = candidateBatch === null ? "data-config/sources/destinations.json" : `${stagingRoot}/destinations.json`;
  const samplingRoot = publish ? "data-snapshots/sampling" : `${stagingRoot}/real-sampling`;
  const destinations = readJson<DestinationConfig[]>(destinationPath)
    .filter((destination) => destination.active && (!requestedSlugs.size || requestedSlugs.has(destination.slug)));
  if (requestedSlugs.size && destinations.length !== requestedSlugs.size) throw new Error(`Unknown or inactive destination in request: ${[...requestedSlugs].join(",")}`);
  const plan = buildPlan(destinations, samplingRoot);
  const orographyConfig = readJson<any>("data-config/methodology/era5-land-orography-v1.json");
  const representativenessConfig = readJson<any>("data-config/methodology/era5-land-representativeness-v1.json");
  const modelOrographyGate = representativenessConfig.modelOrography;
  const requestPlanPath = `${stagingRoot}/era5-request-plan.json`;
  writeJson(requestPlanPath, {
    schemaVersion: 2,
    source: "reanalysis-era5-land-timeseries",
    orographySource: {
      sourceProduct: orographyConfig.sourceProduct,
      downloadUrl: orographyConfig.downloadUrl,
      downloadBytes: orographyConfig.downloadBytes,
      downloadSha256: orographyConfig.downloadSha256
    },
    climateNormal: {startYear:1991,endYear:2020},
    uniquePointCount: plan.length,
    entries: plan
  });
  if (planOnly) {
    console.log(`Planned ${plan.length} unique ERA5-Land point requests → ${requestPlanPath}`);
    return;
  }
  if (!process.env.CDSAPI_KEY) {
    throw new Error("BLOCKED_OPERATOR_SECRET: set CDSAPI_KEY after accepting the ERA5-Land time-series dataset terms in the CDS portal");
  }

  const orographyPath = `${stagingRoot}/era5-invariants/era5-land-orography.json`;
  await runPython("scripts/import/download_era5_land_orography.py", [
    "--plan", requestPlanPath,
    "--output", orographyPath
  ], "ERA5_OROGRAPHY001");
  const orography = readJson<OrographySnapshot>(orographyPath);
  if (orography.schemaVersion !== 1
    || orography.downloadUrl !== orographyConfig.downloadUrl
    || orography.downloadBytes !== orographyConfig.downloadBytes
    || orography.downloadSha256 !== orographyConfig.downloadSha256
    || orography.parameter?.shortName !== "z"
    || orography.parameter?.unit !== "m**2 s**-2"
    || orography.conversion?.standardGravityMS2 !== 9.80665
    || orography.pointCount !== plan.length
    || orography.points.length !== plan.length) {
    throw new Error("ERA5_OROGRAPHY001 invalid invariant-orography metadata");
  }
  const orographyByKey = new Map(orography.points.map((point) => [point.key, point]));
  if (orographyByKey.size !== plan.length || plan.some((entry) => !orographyByKey.has(entry.key))) {
    throw new Error("ERA5_OROGRAPHY001 invariant-orography point set differs from the request plan");
  }

  const geometryPath = candidateBatch === null ? "data-config/geography/destination-areas.geojson" : `${stagingRoot}/destination-areas.geojson`;
  const geometry = readJson<any>(geometryPath);
  const expectedImporterHash = sha256(readFileSync("scripts/import/download_era5.py", "utf8"));
  for (const destination of destinations) {
    const samplingPath = `${samplingRoot}/${destination.slug}.json`;
    const demPath = publish
      ? `data-snapshots/dem/${destination.slug}.json`
      : `${stagingRoot}/real-dem/${destination.slug}.json`;
    const sampling = readJson<any>(samplingPath);
    const dem = readJson<any>(demPath);
    const pointResults = new Map<string, PointResult>();
    const pointMetadata: any[] = [];
    const consumersByCoordinate = new Map<string, SamplingPoint[]>();
    for (const band of Object.values(sampling.bands) as any[]) for (const point of band.points as SamplingPoint[]) {
      const key = coordinateKey(point.lat, point.lon);
      consumersByCoordinate.set(key, [...(consumersByCoordinate.get(key) ?? []), point]);
    }
    for (const [key, consumers] of consumersByCoordinate) {
      const point = consumers[0];
      const pointOrography = orographyByKey.get(key);
      if (!pointOrography) throw new Error(`ERA5_OROGRAPHY001 missing invariant orography for ${key}`);
      const targetElevations = consumers.map((consumer) => consumer.targetElevationM).filter(Number.isFinite);
      const modelMismatchM = Math.max(...targetElevations.map((target) => Math.abs(pointOrography.era5LandGridElevationM - target)));
      if (candidateBatch !== null && modelMismatchM > modelOrographyGate.blockedMismatchAboveM) {
        throw new Error(`ERA5_REP001 ${key} exceeds the approved ERA5-Land model-orography mismatch gate (${modelMismatchM.toFixed(1)} m > ${modelOrographyGate.blockedMismatchAboveM} m)`);
      }
      const rawPath = `${stagingRoot}/era5-raw/${key}.ndjson.gz`;
      const metadataPath = `${stagingRoot}/era5-raw/${key}.meta.json`;
      if (refresh || !existsSync(rawPath) || !existsSync(metadataPath)) {
        console.log(`Downloading ERA5-Land 1991–2020 for ${destination.name} at ${point.lat.toFixed(1)}, ${point.lon.toFixed(1)}...`);
        await runPython("scripts/import/download_era5.py", [
          "--lat", String(point.lat), "--lon", String(point.lon),
          "--start-date", "1991-01-01", "--end-date", "2020-12-31",
          "--output", rawPath, "--metadata", metadataPath
        ], "ERA5_DOWNLOAD001");
      }
      const metadata = readJson<any>(metadataPath);
      const expectedRequest = {
        variable: VARIABLES,
        location: {longitude:point.lon,latitude:point.lat},
        date: ["1991-01-01/2020-12-31"],
        data_format: "netcdf"
      };
      if (metadata.observationCount !== 262_992
        || metadata.dataset !== "reanalysis-era5-land-timeseries"
        || metadata.datasetDoi !== "10.24381/ee82e357"
        || metadata.precipitationSemantics !== "INCREMENTAL_PER_TIMESTEP_M"
        || metadata.snowCoverSemantics !== "FRACTION_0_TO_1"
        || metadata.firstUtcInstant !== "1991-01-01T00:00:00.000Z"
        || metadata.lastUtcInstant !== "2020-12-31T23:00:00.000Z"
        || metadata.canonicalObservation?.encoding !== "gzip-ndjson-utf8"
        || metadata.canonicalObservation?.gzipMtime !== 0
        || !/^[a-f0-9]{64}$/.test(metadata.canonicalObservation?.sha256 ?? "")
        || metadata.canonicalObservation.sha256 !== fileSha256(rawPath)
        || metadata.importer?.path !== "scripts/import/download_era5.py"
        || metadata.importer?.sha256 !== expectedImporterHash
        || metadata.precipitationQuality?.policy !== "CLAMP_SMALL_NEGATIVE_NETCDF_ARTIFACTS_TO_ZERO"
        || metadata.precipitationQuality?.artifactFloorM !== -0.000001
        || metadata.snowDepthQuality?.policy !== "CLAMP_SMALL_NEGATIVE_NETCDF_ARTIFACTS_TO_ZERO"
        || metadata.snowDepthQuality?.artifactFloorM !== -0.000001
        || !Number.isFinite(metadata.snowDepthQuality?.maximumOriginalValueM)
        || !Number.isFinite(metadata.snowDepthQuality?.officialGlacierIndicatorThresholdM)
        || metadata.snowDepthQuality.officialGlacierIndicatorThresholdM !== representativenessConfig.glacier.officialSnowDepthIndicatorM
        || !Number.isInteger(metadata.snowDepthQuality?.glacierIndicatorCount)
        || JSON.stringify(metadata.request) !== JSON.stringify(expectedRequest)) {
        throw new Error(`ERA5_REQUEST001 invalid source response metadata for ${key}`);
      }
      if (candidateBatch !== null
        && representativenessConfig.glacier.excludeIndicatorCellWhenDestinationScopeExcludesGlacier
        && (metadata.snowDepthQuality.glacierIndicatorCount > 0
          || metadata.snowDepthQuality.maximumOriginalValueM >= representativenessConfig.glacier.officialSnowDepthIndicatorM)) {
        throw new Error(`ERA5_REP002 ${key} contains the official glacier-indicator snow-depth signal (>= ${representativenessConfig.glacier.officialSnowDepthIndicatorM} m); candidate staging is blocked until a non-glacier cell is selected`);
      }
      if (!sameGridLocation(metadata.resolvedLocation, pointOrography.resolvedLocation)) {
        throw new Error(`ERA5_OROGRAPHY001 climate and invariant grid locations differ for ${key}`);
      }
      pointMetadata.push({ key, climate: metadata, orography: pointOrography });
      const observations = await readHourlyObservations(rawPath);
      if (observations.length !== metadata.observationCount) throw new Error(`ERA5_REQUEST001 raw observation count mismatch for ${key}`);
      for (const consumer of consumers) {
        const result = aggregatePointClimate(observations, {
          timezone: destination.timezone,
          lat: consumer.lat,
          lon: consumer.lon,
          era5LandGridElevationM: pointOrography.era5LandGridElevationM,
          targetElevationM: consumer.targetElevationM,
          precipitationSemantics: "INCREMENTAL_PER_TIMESTEP_M",
          startYear: 1991,
          endYear: 2020
        });
        result.monthly.forEach(addTemperatureUtilityScore);
        pointResults.set(consumer.id, { point: consumer, daily: result.daily, monthly: result.monthly });
      }
    }

    const destinationGeometry = geometry.features.find((feature:any) => feature.properties.destinationId === destination.id)?.geometry;
    if (!destinationGeometry) throw new Error(`ERA5_AGG001 missing destination geometry for ${destination.id}`);
    const diameterKm = polygonDiameterKm(destinationGeometry);
    const bands = Object.fromEntries(destination.elevationBands.map((bandConfig) => {
      const samplingBand = sampling.bands[bandConfig.id];
      const results = (samplingBand.points as SamplingPoint[]).map((point) => pointResults.get(point.id)!);
      const months: BandClimateMonth[] = Array.from({length:12}, (_, monthIndex) => {
        const weightedPoints = results.map((result) => ({sampleWeight:result.point.sampleWeight,metrics:result.monthly[monthIndex]}));
        const metrics = roundClimateMetrics(aggregateBandPointMetrics(weightedPoints));
        const yearlyScores: number[] = [];
        for (let year = 1991; year <= 2020; year += 1) {
          const yearlyPointMetrics = results.map((result) => aggregateMonthlyClimate(result.daily, monthIndex + 1, {
            timezone: destination.timezone,
            lat: result.point.lat,
            lon: result.point.lon,
            startYear: year,
            endYear: year
          }));
          if (yearlyPointMetrics.some((metrics) => !completeYearPointMetrics(metrics))) continue;
          const yearlyPoints = results.map((result, pointIndex) => ({
              sampleWeight: result.point.sampleWeight,
              metrics: addTemperatureUtilityScore(yearlyPointMetrics[pointIndex])
          }));
          const yearlyMetrics = aggregateBandPointMetrics(yearlyPoints);
          yearlyScores.push(overallScore(scoreComponents({
            ...yearlyMetrics,
            month: monthIndex + 1,
            bandId: bandConfig.id,
            targetElevationM: samplingBand.targetElevationM,
            meanElevationMismatchM: 0,
            samplePointCount: results.length,
            samplePointMaxSeparationKm: 0,
            polygonEquivalentDiameterKm: diameterKm,
            terrainReliefM: 0,
            interannualScoreSd: 0,
            validInterannualYearCount: 1
          })));
        }
        if (!yearlyScores.length) throw new Error(`ERA5_AGG001 no valid interannual scores for ${destination.id}/${bandConfig.id}/${monthIndex + 1}`);
        const points = results.map((result) => result.point);
        const demBand = dem.bands[bandConfig.id];
        return {
          ...metrics,
          month: monthIndex + 1,
          bandId: bandConfig.id,
          targetElevationM: samplingBand.targetElevationM,
          meanElevationMismatchM: round(points.reduce((sum, point) => sum + point.elevationMismatchM * point.sampleWeight, 0), 1),
          samplePointCount: points.length,
          samplePointMaxSeparationKm: round(maximumSeparationKm(points), 1),
          polygonEquivalentDiameterKm: round(diameterKm, 1),
          terrainReliefM: round(demBand.maxM - demBand.minM, 1),
          interannualScoreSd: round(populationStandardDeviation(yearlyScores), 1),
          validInterannualYearCount: yearlyScores.length
        };
      });
      return [bandConfig.id, {months}];
    }));
    const retrievedAt = pointMetadata.map((metadata) => metadata.climate.retrievedAt).sort().at(-1);
    const snapshot = {
      schemaVersion: 2,
      datasetStatus: candidateBatch === null ? "production" : "staging",
      destinationId: destination.id,
      fixture: false,
      source: "era5-land-timeseries",
      sourceDataset: "reanalysis-era5-land-timeseries",
      sourceDoi: "10.24381/ee82e357",
      climateNormal: {startYear:1991,endYear:2020},
      retrievedAt,
      precipitationSemantics: "INCREMENTAL_PER_TIMESTEP_M",
      temperatureElevationCorrection: {
        reference: "ERA5_LAND_INVARIANT_GEOPOTENTIAL",
        lapseRateCPer1000M: climateAggregation.temperatureLapseRateCPer1000M,
        maximumAbsoluteCorrectionC: climateAggregation.maxAutomaticTemperatureCorrectionC,
        orography: {
          sourceProduct: orography.sourceProduct,
          sourceDocumentUrl: orography.sourceDocumentUrl,
          downloadUrl: orography.downloadUrl,
          downloadBytes: orography.downloadBytes,
          downloadSha256: orography.downloadSha256,
          retrievedAt: orography.retrievedAt,
          parameter: orography.parameter,
          grid: orography.grid,
          conversion: orography.conversion
        }
      },
      samplingSnapshotHash: sha256(readFileSync(samplingPath, "utf8")),
      sourceDownloads: pointMetadata.map((metadata) => ({
        key: metadata.key,
        request: metadata.climate.request,
        resolvedLocation: metadata.climate.resolvedLocation,
        observationCount: metadata.climate.observationCount,
        downloadSha256: metadata.climate.downloadSha256,
        canonicalObservation: metadata.climate.canonicalObservation,
        importer: metadata.climate.importer,
        variables: metadata.climate.variables,
        precipitationQuality: metadata.climate.precipitationQuality,
        snowDepthQuality: metadata.climate.snowDepthQuality,
        firstUtcInstant: metadata.climate.firstUtcInstant,
        lastUtcInstant: metadata.climate.lastUtcInstant,
        retrievedAt: metadata.climate.retrievedAt,
        geopotentialM2S2: metadata.orography.geopotentialM2S2,
        era5LandGridElevationM: metadata.orography.era5LandGridElevationM
      })),
      bands
    };
    const output = publish
      ? `data-snapshots/climate/${destination.slug}.json`
      : `${stagingRoot}/real-climate/${destination.slug}.json`;
    writeJson(output, snapshot);
    console.log(`${publish ? "Published" : "Staged"} real ERA5-Land climate → ${output}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
