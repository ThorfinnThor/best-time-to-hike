import { basename } from "node:path";
import { readJson, round, writeJson } from "../lib/io";

type CandidateFile = {candidates:Array<{id:string}>};

const candidateArgument = process.argv.slice(2).find((value) => value.startsWith("--candidates="));
const outputArgument = process.argv.slice(2).find((value) => value.startsWith("--output="));
if (!candidateArgument || !outputArgument) {
  throw new Error("CATALOGUE_REVIEW001 usage: --candidates=<path> --output=<path>");
}
const candidatePath = candidateArgument.slice("--candidates=".length);
const outputPath = outputArgument.slice("--output=".length);
const candidates = readJson<CandidateFile>(candidatePath).candidates;
const external = readJson<any>("data-snapshots/external-audit/nasa-power-1991-2020.json");
const holdConfig = readJson<{annualPrecipitationRatioReview:number;destinationIds:string[]}>(
  "data-config/methodology/independent-climate-review-holds-v1.json"
);
const holds = new Set(holdConfig.destinationIds);
const threshold = holdConfig.annualPrecipitationRatioReview;

const fail = (message:string):never => { throw new Error(`CATALOGUE_REVIEW001 ${message}`); };
if (candidates.length === 0 || new Set(candidates.map((candidate) => candidate.id)).size !== candidates.length) {
  fail("candidate scope is empty or contains duplicate ids");
}

const destinations = candidates.map((candidate) => {
  const snapshot = readJson<any>(`data-snapshots/climate/${candidate.id}.json`);
  const source = snapshot.sourceDownloads?.[0];
  const independent = external.entries.find((entry:any) => entry.destinationId === candidate.id);
  const months = snapshot.bands?.representative?.months ?? [];
  if (snapshot.datasetStatus !== "provisional" || snapshot.migrationStatus !== "candidate-not-published"
    || snapshot.aggregationPolicyVersion !== "observation-validity-v1"
    || snapshot.historicalPeriod?.startYear !== 1991 || snapshot.historicalPeriod?.endYear !== 2025
    || snapshot.sourceDownloads?.length !== 1 || source?.observationCount !== 306_864
    || !/^[a-f0-9]{64}$/.test(source?.downloadSha256 ?? "")
    || !/^[a-f0-9]{64}$/.test(source?.canonicalObservation?.sha256 ?? "")
    || !/^[a-f0-9]{64}$/.test(snapshot.samplingSnapshotHash ?? "")
    || !/^[a-f0-9]{64}$/.test(independent?.sourceResponseSha256 ?? "")) {
    fail(`${candidate.id} has incomplete or unpinned source identity`);
  }
  if (months.length !== 12 || months.some((month:any,index:number) => month.month !== index + 1
    || month.sampleYearCount !== 35 || month.validInterannualYearCount !== 35
    || month.dataCompleteness !== 1 || month.scoringInputsAvailable !== true
    || month.missingScoringInputs?.length !== 0)) {
    fail(`${candidate.id} does not have twelve complete observation-validity months`);
  }
  const era5AnnualMm = months.reduce((sum:number, month:any) => sum + month.precipitationMonthlyMeanMm, 0);
  const ratio = round(era5AnnualMm / independent.annualPrecipitationMeanMm, 2);
  const requiresHold = ratio > threshold || ratio < 1 / threshold;
  if (requiresHold !== holds.has(candidate.id)) fail(`${candidate.id} precipitation hold does not match ratio ${ratio}`);
  return {
    destinationId: candidate.id,
    sourceDownloadSha256: source.downloadSha256,
    canonicalObservationSha256: source.canonicalObservation.sha256,
    samplingSnapshotSha256: snapshot.samplingSnapshotHash,
    externalSourceResponseSha256: independent.sourceResponseSha256,
    era5ToIndependentAnnualPrecipitationRatio: ratio,
  };
});

const batch = basename(candidatePath, ".json");
writeJson(outputPath, {
  schemaVersion: 1,
  decisionDate: "2026-09-22",
  reviewType: "SOL-assisted coordinate, source-identity, completeness, deterministic aggregation and independent-climate diagnostic review; not independent expert certification",
  decisionStatus: "approved-for-provisional-catalogue-expansion",
  productionReleaseApproval: false,
  overrideExistingReleaseGates: false,
  batch,
  targetDatasetStatus: "provisional",
  aggregationPolicyVersion: "observation-validity-v1",
  historicalPeriod: {startYear:1991,endYear:2025,classification:"project-defined-historical-climate-average"},
  claimScope: "one selected representative model-grid cell; not a whole-region or route-specific average",
  precipitationReviewThresholdRatio: threshold,
  destinations,
  decision: `All ${destinations.length} candidates may enter the provisional selected-model-cell catalogue. No threshold was relaxed. Existing legal, accessibility/performance, domain and independent operator production approvals remain separate.`,
});
console.log(`Catalogue expansion review written for ${destinations.length} destinations: ${outputPath}`);
