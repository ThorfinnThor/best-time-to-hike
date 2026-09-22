import { existsSync } from "node:fs";
import { basename } from "node:path";
import { readJson, round, writeJson } from "../lib/io";

type ReviewEntry = {
  destinationId: string;
  sourceDownloadSha256: string;
  canonicalObservationSha256: string;
  samplingSnapshotSha256: string;
  externalSourceResponseSha256: string;
  era5ToIndependentAnnualPrecipitationRatio: number;
};

const reviewArgument = process.argv.slice(2).find((value) => value.startsWith("--review="));
const reviewPath = reviewArgument?.slice("--review=".length) ?? "data-config/methodology/catalogue-expansion-batch-4-review-v1.json";
if (!existsSync(reviewPath)) throw new Error(`CATALOGUE_APPROVAL001 missing review ${reviewPath}`);
const review = readJson<any>(reviewPath);
const candidateFileName = `${review.batch}.json`;
const candidatePath = `data-config/sources/${candidateFileName}`;
if (!existsSync(candidatePath)) throw new Error(`CATALOGUE_APPROVAL001 missing candidate file ${candidatePath}`);
const candidates = readJson<{candidates:Array<{id:string}>}>(candidatePath);
const external = readJson<any>("data-snapshots/external-audit/nasa-power-1991-2020.json");
const holds = new Set(readJson<{destinationIds:string[]}>("data-config/methodology/independent-climate-review-holds-v1.json").destinationIds);
const entries = review.destinations as ReviewEntry[];
const candidateIds = candidates.candidates.map((candidate) => candidate.id).sort();
const reviewedIds = entries.map((entry) => entry.destinationId).sort();

const fail = (message:string):never => { throw new Error(`CATALOGUE_APPROVAL001 ${message}`); };
if (review.decisionStatus !== "approved-for-provisional-catalogue-expansion"
  || review.productionReleaseApproval !== false
  || review.targetDatasetStatus !== "provisional"
  || review.aggregationPolicyVersion !== "observation-validity-v1") {
  fail("review does not approve this exact provisional expansion state");
}
if (!entries.length || new Set(reviewedIds).size !== entries.length
  || JSON.stringify(reviewedIds) !== JSON.stringify(candidateIds)) {
  fail(`review scope must equal the ${candidateIds.length} unique candidates in ${candidateFileName}`);
}

const snapshots:Array<{path:string;snapshot:any}> = [];
for (const entry of entries) {
  const path = `data-snapshots/climate/${entry.destinationId}.json`;
  const snapshot = readJson<any>(path);
  const source = snapshot.sourceDownloads?.[0];
  const independent = external.entries.find((item:any) => item.destinationId === entry.destinationId);
  const months = snapshot.bands?.representative?.months ?? [];
  if (snapshot.datasetStatus !== "provisional" || snapshot.migrationStatus !== "candidate-not-published"
    || snapshot.aggregationPolicyVersion !== "observation-validity-v1"
    || snapshot.historicalPeriod?.startYear !== 1991 || snapshot.historicalPeriod?.endYear !== 2025
    || snapshot.sourceDownloads?.length !== 1 || source?.observationCount !== 306_864
    || source?.downloadSha256 !== entry.sourceDownloadSha256
    || source?.canonicalObservation?.sha256 !== entry.canonicalObservationSha256
    || snapshot.samplingSnapshotHash !== entry.samplingSnapshotSha256
    || independent?.sourceResponseSha256 !== entry.externalSourceResponseSha256) {
    fail(`${entry.destinationId} does not match the reviewed source identity`);
  }
  if (months.length !== 12 || months.some((month:any, index:number) => month.month !== index + 1
    || month.sampleYearCount !== 35 || month.validInterannualYearCount !== 35
    || month.dataCompleteness !== 1 || month.scoringInputsAvailable !== true
    || month.missingScoringInputs?.length !== 0)) {
    fail(`${entry.destinationId} does not have 12 complete observation-validity months`);
  }
  const era5AnnualMm = months.reduce((sum:number, month:any) => sum + month.precipitationMonthlyMeanMm, 0);
  const ratio = round(era5AnnualMm / independent.annualPrecipitationMeanMm, 2);
  const threshold = review.precipitationReviewThresholdRatio;
  const requiresHold = ratio > threshold || ratio < 1 / threshold;
  if (ratio !== entry.era5ToIndependentAnnualPrecipitationRatio || requiresHold !== holds.has(entry.destinationId)) {
    fail(`${entry.destinationId} independent precipitation decision is not reproducible`);
  }
  snapshots.push({path, snapshot});
}

for (const {path, snapshot} of snapshots) {
  writeJson(path, {...snapshot, migrationStatus:"production-approved"});
}
console.log(`Approved ${snapshots.length} snapshots from ${basename(reviewPath)} for the provisional selected-model-cell catalogue; production release remains locked.`);
