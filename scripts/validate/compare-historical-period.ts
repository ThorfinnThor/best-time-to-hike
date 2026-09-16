import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import type { BandClimateMonth, ComponentScores, PublicDestination, PublicMonth } from "../../lib/data/types";
import { overallScore, scoreComponents } from "../../lib/scoring";
import { bestMonthsFor, CRITICAL_COMPONENT_KEYS } from "../../lib/scoring/recommendations";
import { loadGoldenCases } from "../lib/golden-cases";
import { reviewGoldenCases } from "../lib/golden-review";
import { ROOT } from "../lib/io";

type HoldReason = "persistent-snow" | "precipitation-validation";
type Month = PublicMonth & { bands: BandClimateMonth[] };
type Candidate = {
  destination:{id:string;slug:string;elevationBands:Array<{id:string;weight:number}>};
  months:Month[];
  recommendationEligible:boolean;
  recommendationHoldReason?:HoldReason;
};
type Baseline = Pick<PublicDestination,"id"|"slug"|"elevationBands"|"months"|"recommendationEligible"|"recommendationHoldReason"|"bestMonths">;

const input = process.env.BTH_HISTORICAL_SCORED?.trim() || "generated/intermediate/scored-1991-2025.json";
const output = process.env.BTH_HISTORICAL_COMPARISON_OUTPUT?.trim() || "generated/intermediate/historical-period-comparison.json";
const resolve = (path:string) => path.startsWith("/") ? path : join(ROOT, path);
const scored = JSON.parse(readFileSync(resolve(input), "utf8")) as Candidate[];
const oldRoot = join(ROOT, "public/data/hiking/destinations");
const oldBySlug = new Map<string, Baseline>();
const collect = (directory:string) => {
  for (const entry of readdirSync(directory, { withFileTypes:true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.name.endsWith(".json") && entry.name !== "index.json") {
      const destination = JSON.parse(readFileSync(path, "utf8")) as Baseline;
      if (oldBySlug.has(destination.slug)) throw new Error(`COMPARE001 duplicate baseline destination: ${destination.slug}`);
      oldBySlug.set(destination.slug, destination);
    }
  }
};
collect(oldRoot);

if (scored.length !== 315 || oldBySlug.size !== 315) {
  throw new Error(`COMPARE001 comparison requires 315 candidate and 315 baseline destinations; got ${scored.length} and ${oldBySlug.size}`);
}
if (new Set(scored.map((item) => item.destination.slug)).size !== scored.length) {
  throw new Error("COMPARE001 duplicate candidate destination");
}

const componentKeys = ["temperature","precipitation","snow","heatStress","wind","daylight"] as const;
const metricKeys = [
  "temperatureHikingMeanC",
  "wetDayProbability",
  "precipitationMonthlyMeanMm",
  "snowDayProbability",
  "snowDepthMeanOnSnowDaysM",
] as const;
type MetricKey = typeof metricKeys[number];
type ElevationBand = {id:string;weight:number};

const weightedComponents = (month:Month, bands:ElevationBand[]):ComponentScores => {
  const result = Object.fromEntries(componentKeys.map((key) => [key, 0])) as unknown as ComponentScores;
  for (const config of bands) {
    const band = month.bands.find((item) => item.bandId === config.id);
    if (!band) throw new Error(`COMPARE001 missing band ${config.id}`);
    const components = scoreComponents(band);
    for (const key of componentKeys) result[key] += components[key] * config.weight;
  }
  return result;
};
const weightedMetric = (month:Month, bands:ElevationBand[], key:MetricKey) => bands.reduce((sum, config) => {
  const band = month.bands.find((item) => item.bandId === config.id);
  if (!band || !Number.isFinite(band[key])) throw new Error(`COMPARE001 missing ${key} in band ${config.id}`);
  return sum + band[key] * config.weight;
}, 0);
const sameMonths = (first:number[], second:number[]) => first.length === second.length && first.every((month) => second.includes(month));
const rounded = (value:number, digits=6) => Number(value.toFixed(digits));
const ranked = <T extends {slug:string;months:Month[]}>(destinations:T[], monthIndex:number) => new Map(destinations
  .filter((item) => item.months[monthIndex].recommendationEligible && item.months[monthIndex].overallScore !== null)
  .sort((first, second) => second.months[monthIndex].overallScore! - first.months[monthIndex].overallScore!
    || second.months[monthIndex].confidenceScore! - first.months[monthIndex].confidenceScore!
    || first.slug.localeCompare(second.slug))
  .map((item, index) => [item.slug, index + 1]));

const baseline = [...oldBySlug.values()];
const scoreDeltas:number[] = [];
const publicScoreDeltas:number[] = [];
const metricDeltas = Object.fromEntries(metricKeys.map((key) => [key, []])) as unknown as Record<MetricKey,Array<{slug:string;month:number;oldValue:number;newValue:number;delta:number}>>;
const flips:Array<{slug:string;month:number;oldEligible:boolean;newEligible:boolean;oldScore:number;newScore:number;oldComponents:ComponentScores;newComponents:ComponentScores}> = [];
const criticalCrossings:Array<{slug:string;month:number;component:string;oldValue:number;newValue:number;oldFailed:boolean;newFailed:boolean}> = [];
const bestMonthChanges:Array<{slug:string;oldBestMonths:number[];newBestMonths:number[]}> = [];
const holdChanges:Array<{slug:string;oldHold:HoldReason|null;newHold:HoldReason|null}> = [];
const destinationRows:Array<Record<string,unknown>> = [];

for (const current of scored) {
  const old = oldBySlug.get(current.destination.slug);
  if (!old) throw new Error(`COMPARE001 missing baseline destination: ${current.destination.slug}`);
  if (current.months.length !== 12 || old.months.length !== 12) throw new Error(`COMPARE001 ${current.destination.slug} does not have 12 months`);
  const currentBest = bestMonthsFor(current.months);
  if (!sameMonths(old.bestMonths, currentBest)) bestMonthChanges.push({slug:current.destination.slug,oldBestMonths:old.bestMonths,newBestMonths:currentBest});
  const oldHold = old.recommendationHoldReason ?? null;
  const newHold = current.recommendationHoldReason ?? null;
  if (oldHold !== newHold) holdChanges.push({slug:current.destination.slug,oldHold,newHold});
  const deltas:number[] = [];
  current.months.forEach((month, index) => {
    const oldMonth = old.months[index] as Month;
    const oldComponents = weightedComponents(oldMonth, old.elevationBands);
    const newComponents = weightedComponents(month, current.destination.elevationBands);
    const oldScore = overallScore(oldComponents);
    const newScore = overallScore(newComponents);
    const scoreDelta = newScore - oldScore;
    scoreDeltas.push(scoreDelta);
    deltas.push(scoreDelta);
    if (month.overallScore !== null && oldMonth.overallScore !== null) publicScoreDeltas.push(month.overallScore - oldMonth.overallScore);
    if (month.recommendationEligible !== oldMonth.recommendationEligible) {
      flips.push({slug:current.destination.slug,month:month.month,oldEligible:oldMonth.recommendationEligible,newEligible:month.recommendationEligible,oldScore:rounded(oldScore),newScore:rounded(newScore),oldComponents,newComponents});
    }
    for (const component of CRITICAL_COMPONENT_KEYS) {
      const oldFailed = oldComponents[component] <= 20;
      const newFailed = newComponents[component] <= 20;
      if (oldFailed !== newFailed) criticalCrossings.push({slug:current.destination.slug,month:month.month,component,oldValue:rounded(oldComponents[component]),newValue:rounded(newComponents[component]),oldFailed,newFailed});
    }
    for (const key of metricKeys) {
      const oldValue = weightedMetric(oldMonth, old.elevationBands, key);
      const newValue = weightedMetric(month, current.destination.elevationBands, key);
      metricDeltas[key].push({slug:current.destination.slug,month:month.month,oldValue:rounded(oldValue),newValue:rounded(newValue),delta:rounded(newValue-oldValue)});
    }
  });
  destinationRows.push({
    slug:current.destination.slug,
    oldEligible:old.recommendationEligible,
    newEligible:current.recommendationEligible,
    oldBestMonths:old.bestMonths,
    newBestMonths:currentBest,
    scoreDeltaMean:rounded(deltas.reduce((sum,value)=>sum+value,0)/deltas.length),
    scoreDeltaMaxAbs:rounded(Math.max(...deltas.map((value)=>Math.abs(value)))),
  });
}

const rankingMovements:Array<{slug:string;month:number;oldRank:number|null;newRank:number|null;movement:number|null;status:"retained"|"entered"|"exited"}> = [];
for (let monthIndex=0;monthIndex<12;monthIndex+=1) {
  const oldRanks = ranked(baseline, monthIndex);
  const newRanks = ranked(scored.map((item)=>({slug:item.destination.slug,months:item.months})), monthIndex);
  const slugs = new Set([...oldRanks.keys(),...newRanks.keys()]);
  for (const slug of slugs) {
    const oldRank = oldRanks.get(slug) ?? null;
    const newRank = newRanks.get(slug) ?? null;
    if (oldRank === newRank) continue;
    rankingMovements.push({slug,month:monthIndex+1,oldRank,newRank,movement:oldRank!==null&&newRank!==null?oldRank-newRank:null,status:oldRank===null?"entered":newRank===null?"exited":"retained"});
  }
}

const golden = loadGoldenCases();
const candidateForReview = scored.map((item)=>({slug:item.destination.slug,bestMonths:bestMonthsFor(item.months),recommendationHoldReason:item.recommendationHoldReason}));
const baselineGolden = reviewGoldenCases(golden, baseline);
const candidateGolden = reviewGoldenCases(golden, candidateForReview);
const baselineGoldenBySlug = new Map(baselineGolden.cases.map((item)=>[item.slug,item]));
const goldenCaseChanges = candidateGolden.cases.filter((item)=>{
  const old = baselineGoldenBySlug.get(item.slug)!;
  return old.verdict!==item.verdict || !sameMonths(old.engineMonths,item.engineMonths) || old.holdReason!==item.holdReason;
}).map((item)=>({slug:item.slug,baseline:baselineGoldenBySlug.get(item.slug),candidate:item}));

const precipitationHolds = JSON.parse(readFileSync(join(ROOT,"data-config/methodology/independent-climate-review-holds-v1.json"),"utf8")) as {destinationIds:string[]};
const snowHolds = JSON.parse(readFileSync(join(ROOT,"data-config/sources/known-snowbound-cell-holds.json"),"utf8")) as {destinationIds:string[]};
const extremeIds = new Set(["hunza",...precipitationHolds.destinationIds,...snowHolds.destinationIds]);
const extremeDestinationReview = scored.filter((item)=>extremeIds.has(item.destination.id)).map((item)=>{
  const old = oldBySlug.get(item.destination.slug)!;
  const newBestMonths = bestMonthsFor(item.months);
  return {slug:item.destination.slug,oldEligible:old.recommendationEligible,newEligible:item.recommendationEligible,oldHold:old.recommendationHoldReason??null,newHold:item.recommendationHoldReason??null,oldBestMonths:old.bestMonths,newBestMonths,changed:old.recommendationEligible!==item.recommendationEligible||(old.recommendationHoldReason??null)!==(item.recommendationHoldReason??null)||!sameMonths(old.bestMonths,newBestMonths)};
});

const rankedLargest = <T extends {delta:number}>(rows:T[], limit=50) => [...rows].sort((first,second)=>Math.abs(second.delta)-Math.abs(first.delta)).slice(0,limit);
const mean = scoreDeltas.reduce((sum,value)=>sum+value,0) / scoreDeltas.length;
const meanAbs = scoreDeltas.reduce((sum,value)=>sum+Math.abs(value),0) / scoreDeltas.length;
const report = {
  schemaVersion:2,
  status:"scientific-review-required",
  productionReleaseApproval:false,
  baseline:{startYear:1991,endYear:2020,source:"published public destination files",destinationCount:oldBySlug.size},
  candidate:{startYear:1991,endYear:2025,source:"ERA5-Land staging artifact",scoredDestinationCount:scored.length,aggregationPolicyVersion:"observation-validity-v1"},
  inventory:{destinations:scored.length,months:scoreDeltas.length,publiclyComparableScores:publicScoreDeltas.length},
  scoreDelta:{mean:rounded(mean,4),meanAbsolute:rounded(meanAbs,4),maximumAbsolute:rounded(Math.max(...scoreDeltas.map((value)=>Math.abs(value))),4)},
  recommendationEligibility:{flipCount:flips.length,flips},
  criticalComponentGateCrossings:{count:criticalCrossings.length,crossings:criticalCrossings},
  bestMonthChanges:{count:bestMonthChanges.length,changes:bestMonthChanges},
  holdChanges:{count:holdChanges.length,changes:holdChanges},
  goldenCases:{baseline:baselineGolden,candidate:candidateGolden,changeCount:goldenCaseChanges.length,changes:goldenCaseChanges},
  extremeDestinations:{reviewed:extremeDestinationReview.length,changed:extremeDestinationReview.filter((item)=>item.changed).length,destinations:extremeDestinationReview},
  rankedDiagnostics:{
    largestOverallScoreChanges:rankedLargest(scored.flatMap((item)=>{
      const old=oldBySlug.get(item.destination.slug)!;
      return item.months.map((month,index)=>{const oldScore=overallScore(weightedComponents(old.months[index] as Month,old.elevationBands));const newScore=overallScore(weightedComponents(month,item.destination.elevationBands));return{slug:item.destination.slug,month:index+1,oldValue:rounded(oldScore),newValue:rounded(newScore),delta:rounded(newScore-oldScore)};});
    })),
    largestTemperatureChanges:rankedLargest(metricDeltas.temperatureHikingMeanC),
    largestWetDayChanges:rankedLargest(metricDeltas.wetDayProbability),
    largestPrecipitationTotalChanges:rankedLargest(metricDeltas.precipitationMonthlyMeanMm),
    largestSnowDayChanges:rankedLargest(metricDeltas.snowDayProbability),
    largestSnowDepthChanges:rankedLargest(metricDeltas.snowDepthMeanOnSnowDaysM),
    largestRankingMovements:[...rankingMovements].sort((first,second)=>(Math.abs(second.movement??0)-Math.abs(first.movement??0))||first.month-second.month||first.slug.localeCompare(second.slug)).slice(0,100),
    rankingEntries:rankingMovements.filter((item)=>item.status==="entered"),
    rankingExits:rankingMovements.filter((item)=>item.status==="exited"),
  },
  destinations:destinationRows,
  interpretation:"Changes are review signals, not automatic errors. No threshold, weight, hold or Golden label is changed by this report.",
};
const target = resolve(output); mkdirSync(dirname(target), {recursive:true}); writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Compared ${scored.length} destinations and ${scoreDeltas.length} months; ${flips.length} eligibility flips, ${bestMonthChanges.length} best-month changes, ${goldenCaseChanges.length} Golden Case changes.`);
