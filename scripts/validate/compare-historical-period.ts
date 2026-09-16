import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { ROOT } from "../lib/io";

type Month = { month:number; overallScore:number|null; recommendationEligible:boolean; components:Record<string,number>|null; caveats:string[] };
type Destination = { destination:{slug:string}; months:Month[]; recommendationEligible:boolean };

const input = process.env.BTH_HISTORICAL_SCORED?.trim() || "generated/intermediate/scored-1991-2025.json";
const output = process.env.BTH_HISTORICAL_COMPARISON_OUTPUT?.trim() || "generated/intermediate/historical-period-comparison.json";
const resolve = (path:string) => path.startsWith("/") ? path : join(ROOT, path);
const scored = JSON.parse(readFileSync(resolve(input), "utf8")) as Destination[];
const oldRoot = join(ROOT, "public/data/hiking/destinations");
const oldBySlug = new Map<string, any>();
const collect = (directory:string) => {
  for (const entry of readdirSync(directory, { withFileTypes:true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.name.endsWith(".json") && entry.name !== "index.json") {
      const destination = JSON.parse(readFileSync(path, "utf8"));
      oldBySlug.set(destination.slug, destination);
    }
  }
};
collect(oldRoot);

const scoreDeltas:number[] = [];
const flips:{slug:string;month:number;oldEligible:boolean;newEligible:boolean;oldScore:number|null;newScore:number|null;oldComponents:Record<string,number>|null;newComponents:Record<string,number>|null}[] = [];
const destinationRows:any[] = [];
let comparedMonths = 0;
for (const current of scored) {
  const old = oldBySlug.get(current.destination.slug);
  if (!old) throw new Error(`COMPARE001 missing baseline destination: ${current.destination.slug}`);
  const deltas:number[] = [];
  current.months.forEach((month, index) => {
    const baseline = old.months[index] as Month;
    if (month.overallScore !== null && baseline.overallScore !== null) {
      const delta = month.overallScore - baseline.overallScore;
      scoreDeltas.push(delta); deltas.push(delta); comparedMonths += 1;
    }
    if (month.recommendationEligible !== baseline.recommendationEligible) {
      flips.push({slug:current.destination.slug, month:month.month, oldEligible:baseline.recommendationEligible, newEligible:month.recommendationEligible, oldScore:baseline.overallScore, newScore:month.overallScore, oldComponents:baseline.components, newComponents:month.components});
    }
  });
  destinationRows.push({slug:current.destination.slug, oldEligible:old.recommendationEligible, newEligible:current.recommendationEligible, scoreDeltaMean:deltas.length ? deltas.reduce((sum,value)=>sum+value,0)/deltas.length : null, scoreDeltaMaxAbs:deltas.length ? Math.max(...deltas.map((value)=>Math.abs(value))) : null});
}
const mean = scoreDeltas.reduce((sum,value)=>sum+value,0) / scoreDeltas.length;
const meanAbs = scoreDeltas.reduce((sum,value)=>sum+Math.abs(value),0) / scoreDeltas.length;
const report = {
  schemaVersion:1,
  baseline:{startYear:1991,endYear:2020,source:"published public destination files"},
  candidate:{startYear:1991,endYear:2025,source:"ERA5-Land staging artifact",scoredDestinationCount:scored.length},
  comparedMonths,
  scoreDelta:{mean:Number(mean.toFixed(4)),meanAbsolute:Number(meanAbs.toFixed(4)),maximumAbsolute:Math.max(...scoreDeltas.map((value)=>Math.abs(value)))},
  recommendationEligibilityFlips:flips.length,
  flips,
  destinations:destinationRows
};
const target = resolve(output); mkdirSync(dirname(target), {recursive:true}); writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Compared ${scored.length} destinations and ${comparedMonths} scored months; ${flips.length} eligibility flips.`);
