import type { BandClimateMonth, PublicDestination } from "../../lib/data/types";
import { readJson, round, writeJson } from "../lib/io";

interface ReplacementConfig {
  schemaVersion: number;
  approval: boolean;
  controls: {destinations: string[]; reason: string};
  replacements: Record<string, {lat: number; lon: number; label: string; reason: string}>;
}

interface ClimateSnapshot {
  sourceDataset: string;
  sourceDoi: string;
  climateNormal: {startYear: number; endYear: number};
  sourceDownloads: Array<{observationCount: number; resolvedLocation: {latitude:number;longitude:number}}>;
  bands: Record<string, {months: BandClimateMonth[]}>;
}

const config = readJson<ReplacementConfig>("data-config/sources/representative-cell-replacements-v1.json");
if (config.schemaVersion !== 1 || config.approval !== false) {
  throw new Error("CELL_REPLACEMENT_REVIEW001 replacement candidates must remain unapproved during staging");
}

const monthlyTemperatureJump = (months: BandClimateMonth[]) => {
  let largest = {fromMonth: 1, toMonth: 2, deltaC: 0};
  for (let index = 0; index < months.length; index += 1) {
    const current = months[index];
    const next = months[(index + 1) % months.length];
    const deltaC = round(next.temperatureHikingMeanC - current.temperatureHikingMeanC, 1);
    if (Math.abs(deltaC) > Math.abs(largest.deltaC)) largest = {fromMonth: current.month, toMonth: next.month, deltaC};
  }
  return largest;
};

const canonicalClimate = (snapshot: ClimateSnapshot) => snapshot.bands;
const results = Object.keys(config.replacements).sort().map((id) => {
  const climate = readJson<ClimateSnapshot>(`data-snapshots/climate/${id}.json`);
  const destination = readJson<PublicDestination>(`public/data/hiking/destinations/${id}/index.json`);
  const months = climate.bands.representative?.months;
  if (climate.sourceDataset !== "reanalysis-era5-land-timeseries"
    || climate.sourceDoi !== "10.24381/ee82e357"
    || climate.climateNormal.startYear !== 1991
    || climate.climateNormal.endYear !== 2020
    || climate.sourceDownloads.length !== 1
    || climate.sourceDownloads[0].observationCount !== 262_992
    || months?.length !== 12) {
    throw new Error(`CELL_REPLACEMENT_REVIEW001 incomplete canonical climate evidence for ${id}`);
  }
  const allYearSnow = months.every((month) => month.snowDayProbability >= 0.999);
  const minimumSnowDepthM = Math.min(...months.map((month) => month.snowDepthMeanOnSnowDaysM));
  return {
    destinationId: id,
    resolvedLocation: climate.sourceDownloads[0].resolvedLocation,
    allYearSnow,
    minimumSnowDepthM: round(minimumSnowDepthM, 1),
    recommendationEligible: destination.recommendationEligible,
    eligibleMonths: destination.months.filter((month) => month.recommendationEligible).map((month) => month.month),
    largestAdjacentTemperatureJump: monthlyTemperatureJump(months),
    climateGate: allYearSnow ? "rejected-persistent-snow" : "passed-no-persistent-snow",
    approval: false,
    requiredNext: allYearSnow
      ? "Select another candidate cell and repeat the official-source download."
      : "Perform coordinate-level route QA and review changed Golden Case output before publication.",
  };
});

const controls = config.controls.destinations.map((id) => {
  const baseline = readJson<ClimateSnapshot>(`generated/intermediate/cell-replacements/baseline/climate/${id}.json`);
  const refreshed = readJson<ClimateSnapshot>(`data-snapshots/climate/${id}.json`);
  const baselineMonths = baseline.bands.representative?.months;
  const refreshedMonths = refreshed.bands.representative?.months;
  if (baselineMonths?.length !== 12 || refreshedMonths?.length !== 12) {
    throw new Error(`CELL_REPLACEMENT_REVIEW001 incomplete control climate for ${id}`);
  }
  const metricsReproducedExactly = JSON.stringify(canonicalClimate(baseline)) === JSON.stringify(canonicalClimate(refreshed));
  return {
    destinationId: id,
    purpose: config.controls.reason,
    metricsReproducedExactly,
    baselineLargestAdjacentTemperatureJump: monthlyTemperatureJump(baselineMonths),
    refreshedLargestAdjacentTemperatureJump: monthlyTemperatureJump(refreshedMonths),
    interpretation: metricsReproducedExactly
      ? "The warning is reproducible from a fresh official-source response; it is not a stale or corrupted committed aggregate."
      : "The fresh official-source aggregate differs from the committed baseline and requires a source-response diff before any update.",
  };
});

const rejected = results.filter((result) => result.allYearSnow).map((result) => result.destinationId);
const report = {
  schemaVersion: 1,
  status: rejected.length ? "blocked-candidate-climate" : "ready-for-coordinate-qa",
  approval: false,
  generatedAt: new Date().toISOString(),
  replacements: results,
  controls,
  summary: {
    candidateCount: results.length,
    passedClimateGate: results.length - rejected.length,
    rejectedPersistentSnow: rejected,
    controlsReproducedExactly: controls.filter((control) => control.metricsReproducedExactly).length,
  },
};
writeJson("generated/reports/representative-cell-replacements-v1.json", report);
console.log(`Replacement review: ${report.summary.passedClimateGate}/${report.summary.candidateCount} passed the persistent-snow gate.`);
for (const result of results) console.log(`  ${result.destinationId}: ${result.climateGate}; eligible months ${result.eligibleMonths.join(",") || "none"}`);
for (const control of controls) console.log(`  control ${control.destinationId}: metrics ${control.metricsReproducedExactly ? "reproduced exactly" : "changed"}`);
console.log("Candidates remain unapproved until coordinate-level route QA and Golden Case review are complete.");
