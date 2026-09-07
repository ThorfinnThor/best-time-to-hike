import type { BandClimateMonth, PublicDestination } from "../../lib/data/types";
import { readJson, round, writeJson } from "../lib/io";

interface ReplacementConfig {
  schemaVersion: number;
  approval: boolean;
  controls: {destinations: string[]; reason: string};
  replacements: Record<string, {stagingDisposition: "candidate" | "rejected"; lat: number; lon: number; label: string; reason: string}>;
}

interface ClimateSnapshot {
  sourceDataset: string;
  sourceDoi: string;
  climateNormal: {startYear: number; endYear: number};
  sourceDownloads: Array<{observationCount: number; resolvedLocation: {latitude:number;longitude:number}}>;
  bands: Record<string, {months: BandClimateMonth[]}>;
}

const config = readJson<ReplacementConfig>("data-config/sources/representative-cell-replacements-v1.json");
const onlyArgument = process.argv.slice(2).find((argument) => argument.startsWith("--only="));
const only = onlyArgument ? onlyArgument.slice(7).split(",").map((id) => id.trim()).filter(Boolean) : null;
if (only && (!only.length || only.some((id) => config.replacements[id]?.stagingDisposition !== "candidate"))) {
  throw new Error("CELL_REPLACEMENT_REVIEW001 --only must name active candidates");
}
const golden = readJson<{cases: Array<{slug: string; expectedMonths: number[]}>}>("tests/fixtures/known-hiking-seasons.json");
if (config.schemaVersion !== 1 || config.approval !== false) {
  throw new Error("CELL_REPLACEMENT_REVIEW001 replacement candidates must remain unapproved during staging");
}
const destinationIndex = readJson<Array<{slug: string; countryCode: string}>>("public/data/hiking/destinations/index.json");

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
const results = Object.keys(config.replacements).sort()
  .filter((id) => config.replacements[id].stagingDisposition === "candidate" && (!only || only.includes(id)))
  .map((id) => {
  const climate = readJson<ClimateSnapshot>(`data-snapshots/climate/${id}.json`);
  const indexEntry = destinationIndex.find((entry) => entry.slug === id);
  if (!indexEntry) throw new Error(`CELL_REPLACEMENT_REVIEW001 missing public index entry for ${id}`);
  const destination = readJson<PublicDestination>(`public/data/hiking/destinations/${indexEntry.countryCode.toLowerCase()}/${id}.json`);
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
  const candidate = config.replacements[id];
  const resolved = climate.sourceDownloads[0].resolvedLocation;
  // Compare grid identities at the source's 0.1-degree resolution, allowing
  // only the serialization noise seen in the source's float coordinates.
  const gridKey = (lat: number, lon: number) => `${lat.toFixed(1)},${lon.toFixed(1)}`;
  if (gridKey(resolved.latitude, resolved.longitude) !== gridKey(candidate.lat, candidate.lon)
    || !destination.representativeCell
    || gridKey(destination.representativeCell.lat, destination.representativeCell.lon) !== gridKey(candidate.lat, candidate.lon)) {
    throw new Error(`CELL_REPLACEMENT_REVIEW002 candidate, climate and public coordinates disagree for ${id}`);
  }
  const label = golden.cases.find((item) => item.slug === id);
  const expectedMonthsWithoutRecommendation = label?.expectedMonths.filter((month) =>
    !destination.months.find((item) => item.month === month)?.recommendationEligible) ?? [];
  const bestMonthsOutsideReference = label ? destination.bestMonths.filter((month) => !label.expectedMonths.includes(month)) : [];
  const minimumSnowDepthM = Math.min(...months.map((month) => month.snowDepthMeanOnSnowDaysM));
  return {
    destinationId: id,
    resolvedLocation: climate.sourceDownloads[0].resolvedLocation,
    allYearSnow,
    minimumSnowDepthM: round(minimumSnowDepthM, 1),
    recommendationEligible: destination.recommendationEligible,
    eligibleMonths: destination.months.filter((month) => month.recommendationEligible).map((month) => month.month),
    bestMonths: destination.bestMonths,
    seasonReview: {
      referenceAvailable: Boolean(label),
      expectedMonths: label?.expectedMonths ?? [],
      bestMonthsOutsideReference,
      expectedMonthsWithoutRecommendation,
      interpretation: !label ? "No Golden reference exists; independent season review is required."
        : !destination.bestMonths.length || bestMonthsOutsideReference.length || expectedMonthsWithoutRecommendation.length
          ? "Season discrepancy remains; passing the snow gate does not resolve the reference-season review."
          : "Best months lie within the reference and every reference month is eligible; route-coordinate review is still required.",
    },
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
