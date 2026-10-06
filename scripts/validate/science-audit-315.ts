import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { PublicDestination } from "../../lib/data/types";
import { readJson, ROOT, sha256, writeJson } from "../lib/io";
import { reviewGoldenCasesForPeriod, type GoldenCase } from "../lib/golden-review";

const PERIOD = { startYear: 1991, endYear: 2025 } as const;
const EXPECTED_DESTINATIONS = 315;
const EXPECTED_MONTHS = EXPECTED_DESTINATIONS * 12;
const EXPECTED_PADDED_HOURS = 306864;
const EXPECTED_YEARS = 35;

const errors: string[] = [];
const assert = (condition: unknown, message: string) => { if (!condition) errors.push(message); };
const jsonFiles = (dir: string): string[] => readdirSync(dir, {withFileTypes: true}).flatMap((entry): string[] =>
  entry.isDirectory() ? jsonFiles(join(dir, entry.name)) : entry.name.endsWith(".json") ? [join(dir, entry.name)] : []);

const climateFiles = jsonFiles(join(ROOT, "data-snapshots/climate"));
const destinationFiles = jsonFiles(join(ROOT, "public/data/hiking/destinations"))
  .filter((file) => !file.endsWith("/index.json"));
const climateSnapshots = climateFiles.map((file) => JSON.parse(readFileSync(file, "utf8")) as any);
const destinations = destinationFiles.map((file) => JSON.parse(readFileSync(file, "utf8")) as PublicDestination);
const manifest = readJson<any>("public/data/hiking/manifest.json");
const weights = readJson<any>("data-config/scoring/weights.json");
const recommendation = readJson<any>("data-config/methodology/recommendation-eligibility-v1.json");
const holdConfig = readJson<{destinationIds:string[]}>("data-config/methodology/independent-climate-review-holds-v1.json");
const golden = readJson<{status:string;cases:GoldenCase[]}>("tests/fixtures/known-hiking-seasons.json");
const external = readJson<any>("data-snapshots/external-audit/nasa-power-1991-2020.json");

assert(climateSnapshots.length === EXPECTED_DESTINATIONS, `Expected ${EXPECTED_DESTINATIONS} climate snapshots, found ${climateSnapshots.length}`);
assert(destinations.length === EXPECTED_DESTINATIONS, `Expected ${EXPECTED_DESTINATIONS} public destinations, found ${destinations.length}`);
assert(manifest.destinationCount === EXPECTED_DESTINATIONS, "Manifest destination count differs from the audited inventory");
assert(manifest.climateNormal.startYear === PERIOD.startYear && manifest.climateNormal.endYear === PERIOD.endYear,
  "Manifest historical period is not 1991-2025");

let climateMonthCount = 0;
let sourceDownloadCount = 0;
let minimumCompleteness = 1;
let minimumSampleYears = EXPECTED_YEARS;
for (const snapshot of climateSnapshots) {
  assert(snapshot.historicalPeriod?.startYear === PERIOD.startYear && snapshot.historicalPeriod?.endYear === PERIOD.endYear,
    `${snapshot.destinationId}: snapshot historical period mismatch`);
  assert(snapshot.historicalPeriod?.classification === "project-defined-historical-climate-average",
    `${snapshot.destinationId}: historical-period classification mismatch`);
  assert(snapshot.aggregationPolicyVersion === "observation-validity-v1",
    `${snapshot.destinationId}: aggregation policy is not observation-validity-v1`);
  assert(snapshot.migrationStatus === "production-approved", `${snapshot.destinationId}: period migration is not approved`);
  const downloads = snapshot.sourceDownloads ?? [];
  sourceDownloadCount += downloads.length;
  assert(downloads.length >= 1, `${snapshot.destinationId}: no source download provenance`);
  for (const download of downloads) {
    assert(download.observationCount === EXPECTED_PADDED_HOURS,
      `${snapshot.destinationId}/${download.key}: expected ${EXPECTED_PADDED_HOURS} observations`);
    assert(/^[a-f0-9]{64}$/.test(download.downloadSha256), `${snapshot.destinationId}/${download.key}: invalid download hash`);
    assert(/^[a-f0-9]{64}$/.test(download.canonicalObservation?.sha256),
      `${snapshot.destinationId}/${download.key}: invalid canonical observation hash`);
  }
  const bands = Object.values(snapshot.bands ?? {}) as Array<{months:any[]}>;
  assert(bands.length >= 1, `${snapshot.destinationId}: no climate bands`);
  for (const band of bands) {
    assert(band.months.length === 12, `${snapshot.destinationId}: climate band does not contain 12 months`);
    climateMonthCount += band.months.length;
    for (const month of band.months) {
      minimumCompleteness = Math.min(minimumCompleteness, month.dataCompleteness);
      minimumSampleYears = Math.min(minimumSampleYears, month.sampleYearCount);
      assert(month.sampleYearCount === EXPECTED_YEARS, `${snapshot.destinationId}/${month.month}: sample-year count is not 35`);
      assert(month.dataCompleteness === 1, `${snapshot.destinationId}/${month.month}: source data is incomplete`);
    }
  }
}

const publicMonths = destinations.flatMap((destination) => destination.months);
assert(publicMonths.length === EXPECTED_MONTHS, `Expected ${EXPECTED_MONTHS} public months, found ${publicMonths.length}`);
for (const destination of destinations) {
  assert(destination.historicalPeriod.startYear === PERIOD.startYear && destination.historicalPeriod.endYear === PERIOD.endYear,
    `${destination.slug}: public historical period mismatch`);
  const serialized = JSON.stringify(destination);
  assert(!serialized.includes("confidenceScore") && !serialized.includes("confidenceLevel"),
    `${destination.slug}: legacy numeric public confidence is still present`);
  assert(destination.provenance.scope === "one selected representative model-grid cell; not a whole-region or route-specific average",
    `${destination.slug}: selected-cell claim restriction missing`);
}

const weightTotal = Object.values(weights.overall).reduce((sum: number, value: any) => sum + value, 0);
assert(Math.abs(weightTotal - 1) < 1e-9, "Overall weights do not sum to one");
assert(weights.algorithmVersion === "1.3.0", "Scientific audit expects algorithm 1.3.0");
assert(weights.overall.wind === 0, "Grid wind still contributes to the score");
assert(!recommendation.criticalComponents.includes("wind"), "Grid wind still contributes to the recommendation gate");
assert(!recommendation.bestMonthComponents.includes("wind"), "Grid wind still contributes to best-month selection");

const configuredPrecipitationHolds = new Set(holdConfig.destinationIds);
const publicPrecipitationHolds = new Set(destinations
  .filter((destination) => destination.recommendationHoldReason === "precipitation-validation")
  .map((destination) => destination.id));
assert(configuredPrecipitationHolds.size === 30, `Expected 30 precipitation holds, found ${configuredPrecipitationHolds.size}`);
assert([...configuredPrecipitationHolds].every((id) => publicPrecipitationHolds.has(id))
  && [...publicPrecipitationHolds].every((id) => configuredPrecipitationHolds.has(id)),
  "Published precipitation holds differ from the independently reviewed hold set");
const persistentSnowHolds = destinations.filter((destination) => destination.recommendationHoldReason === "persistent-snow");
assert(persistentSnowHolds.length === 3, `Expected 3 source-derived persistent-snow holds, found ${persistentSnowHolds.length}`);
assert(["el-chalten", "garhwal", "zermatt"].every((slug) => persistentSnowHolds.some((destination) => destination.slug === slug)),
  "Persistent-snow hold set changed without review");
for (const destination of destinations.filter((item) => item.recommendationHoldReason)) {
  assert(destination.bestMonths.length === 0 && destination.months.every((month) => !month.recommendationEligible
    && month.overallScore === null && month.components === null), `${destination.slug}: held destination still publishes a recommendation claim`);
}

const goldenReview = reviewGoldenCasesForPeriod(golden, destinations, PERIOD);
assert(goldenReview.passed, `Golden-period review failed: ${JSON.stringify(goldenReview.cases.filter((item) => item.errors.length))}`);

const hunza = destinations.find((destination) => destination.id === "hunza");
const nasaHunza = external.entries.find((entry: any) => entry.destinationId === "hunza");
assert(Boolean(hunza && nasaHunza), "Hunza audit evidence is missing");
const hunzaEra5SepToOctC = hunza ? hunza.months[9].metrics.temperatureHikingMeanC - hunza.months[8].metrics.temperatureHikingMeanC : Number.NaN;
const hunzaNasaSepToOctC = nasaHunza ? nasaHunza.temperatureMeanC[9] - nasaHunza.temperatureMeanC[8] : Number.NaN;
assert(Math.abs(hunzaEra5SepToOctC - (-13.6)) <= 0.2, `Hunza ERA5 September-October anomaly changed to ${hunzaEra5SepToOctC}`);
assert(hunzaNasaSepToOctC < 0, "Independent Hunza diagnostic no longer corroborates the cooling direction");
assert(hunza?.recommendationHoldReason === "precipitation-validation", "Hunza is not retained on independent precipitation review hold");

const report = {
  reportVersion: 1,
  auditDate: "2026-10-06",
  status: errors.length ? "scientific-evidence-gate-failed" : "scientific-evidence-gate-passed-with-claim-restrictions",
  productionReleaseApproval: false,
  scope: "315-destination public catalogue; 1991-2025 selected ERA5-Land model-cell climatology",
  inventory: {
    destinations: destinations.length,
    publicMonths: publicMonths.length,
    climateSnapshots: climateSnapshots.length,
    climateBandMonths: climateMonthCount,
    sourceDownloads: sourceDownloadCount,
  },
  historicalPeriodAudit: {
    startYear: PERIOD.startYear,
    endYear: PERIOD.endYear,
    completeYears: EXPECTED_YEARS,
    expectedPaddedHoursPerSourceCell: EXPECTED_PADDED_HOURS,
    minimumDataCompleteness: minimumCompleteness,
    minimumSampleYearCount: minimumSampleYears,
    classification: "project-defined-historical-climate-average",
    wmoStandardNormal: false,
  },
  scoringAudit: {
    algorithmVersion: weights.algorithmVersion,
    weights: weights.overall,
    gridWindPolicy: "informational-only; zero score weight; excluded from gates and best-month selection",
    publicConfidencePolicy: "numeric confidence retired; missing evidence withholds recommendations",
  },
  reviewHolds: {
    independentPrecipitation: [...publicPrecipitationHolds].sort(),
    persistentSnow: persistentSnowHolds.map((destination) => destination.slug).sort(),
  },
  hunzaAudit: {
    decision: "retain source values without smoothing; keep precipitation-validation hold",
    era5LandSeptemberToOctoberDeltaC: Math.round(hunzaEra5SepToOctC * 10) / 10,
    nasaPowerSeptemberToOctoberDeltaC: Math.round(hunzaNasaSepToOctC * 10) / 10,
    interpretation: "The independent coarse reanalysis corroborates the direction, not the magnitude; neither source is station validation.",
  },
  goldenReview,
  claimRestrictions: [
    "selected ERA5-Land model cell only",
    "not a whole-destination or route-specific average",
    "not a weather forecast",
    "not trail-safety or go/no-go advice",
    "not an empirically calibrated probability",
  ],
  externalDiagnostic: {
    source: external.source,
    period: external.normal,
    snapshotSha256: sha256(readFileSync(join(ROOT, "data-snapshots/external-audit/nasa-power-1991-2020.json"))),
    limitation: external.interpretation,
  },
  errors,
};

writeJson("generated/reports/science-audit-315.json", report);
console.log(`Science audit: ${report.status}; ${destinations.length} destinations; ${publicMonths.length} months; ${errors.length} error(s).`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
