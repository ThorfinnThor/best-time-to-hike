import {createHash} from "node:crypto";
import type {ComponentScores} from "../../lib/data/types";
import {scoreComponents} from "../../lib/scoring";
import {loadGoldenCases} from "../lib/golden-cases";
import {readJson,round,writeJson} from "../lib/io";

type Key=keyof ComponentScores;
type Case={slug:string;expectedMonths:number[]};
type Row={id:string;split:"training"|"validation";expected:number[];months:Array<{month:number;components:ComponentScores}>};
type Candidate={weights:Record<Key,number>;criticalFloor:number;bestFloor:number};

const config=readJson<any>("data-config/methodology/season-alignment-calibration-v1.json");
const recommendation=readJson<any>("data-config/methodology/recommendation-eligibility-v1.json");
const baseline=readJson<any>("data-config/scoring/weights.json").overall as Record<Key,number>;
const destinations=readJson<any[]>("data-config/sources/destinations.json");
const golden=loadGoldenCases() as {cases:Case[]};
const snowHolds=new Set(readJson<{destinationIds:string[]}>("data-config/sources/known-snowbound-cell-holds.json").destinationIds);
const precipitationHolds=new Set(readJson<{destinationIds:string[]}>("data-config/methodology/independent-climate-review-holds-v1.json").destinationIds);
const active=config.activeComponents as Key[];
const critical=recommendation.criticalComponents as Key[];

const split=(id:string):"training"|"validation"=>parseInt(createHash("sha256").update(id).digest("hex").slice(0,2),16)%config.validationSplit.modulo===config.validationSplit.validationRemainder?"validation":"training";
const rows:Row[]=golden.cases.flatMap(item=>{
  const destination=destinations.find(candidate=>candidate.slug===item.slug);
  if(!destination||snowHolds.has(destination.id)||precipitationHolds.has(destination.id))return [];
  const snapshot=readJson<any>(`data-snapshots/climate/${destination.slug}.json`);
  const band=snapshot.bands[destination.elevationBands[0].id];
  return [{id:destination.id,split:split(destination.id),expected:item.expectedMonths,months:band.months.map((month:any,index:number)=>({month:index+1,components:scoreComponents(month)}))}];
});

function compositions(total:number,parts:number,min:number,prefix:number[]=[]):number[][]{
  if(parts===1)return total>=min?[[...prefix,total]]:[];
  const result:number[][]=[];
  for(let value=min;value<=total-min*(parts-1);value+=1)result.push(...compositions(total-value,parts-1,min,[...prefix,value]));
  return result;
}
const units=Math.round(1/config.weightStep);
const minimumUnits=Math.round(config.minimumComponentWeight/config.weightStep);
const weightCandidates=compositions(units,active.length,minimumUnits).map(values=>{
  const result={temperature:0,precipitation:0,snow:0,heatStress:0,wind:0,daylight:0} as Record<Key,number>;
  active.forEach((key,index)=>result[key]=values[index]/units);
  return result;
});
const candidates:Candidate[]=weightCandidates.flatMap(weights=>config.criticalFloorCandidates.flatMap((criticalFloor:number)=>config.bestMonthFloorCandidates.map((bestFloor:number)=>({weights,criticalFloor,bestFloor}))));

function predicted(row:Row,candidate:Candidate){
  return row.months.filter(item=>critical.every(key=>item.components[key]>candidate.criticalFloor)&&active.every(key=>item.components[key]>candidate.bestFloor))
    .map(item=>({month:item.month,score:active.reduce((sum,key)=>sum+item.components[key]*candidate.weights[key],0)}))
    .sort((a,b)=>b.score-a.score||a.month-b.month).slice(0,3).map(item=>item.month).sort((a,b)=>a-b);
}
function f1(expected:number[],actual:number[]){
  const overlap=actual.filter(month=>expected.includes(month)).length;
  if(!overlap)return 0;
  const precision=overlap/actual.length,recall=overlap/expected.length;
  return 2*precision*recall/(precision+recall);
}
function evaluate(candidate:Candidate,which:"training"|"validation"){
  const selected=rows.filter(row=>row.split===which);
  const values=selected.map(row=>f1(row.expected,predicted(row,candidate)));
  return values.reduce((sum,value)=>sum+value,0)/values.length;
}
function distance(candidate:Candidate){
  return active.reduce((sum,key)=>sum+Math.abs(candidate.weights[key]-baseline[key]),0)+Math.abs(candidate.criticalFloor-recommendation.criticalComponentMinimumExclusive)/100+Math.abs(candidate.bestFloor-recommendation.bestMonthComponentMinimumExclusive)/100;
}
const ranked=candidates.map(candidate=>({candidate,training:evaluate(candidate,"training"),validation:evaluate(candidate,"validation"),distance:distance(candidate)}))
  .sort((a,b)=>b.training-a.training||a.distance-b.distance||b.validation-a.validation||JSON.stringify(a.candidate).localeCompare(JSON.stringify(b.candidate)));
const selected=ranked[0];
const baselineCandidate={weights:baseline,criticalFloor:recommendation.criticalComponentMinimumExclusive,bestFloor:recommendation.bestMonthComponentMinimumExclusive};
const baselineValidation=round(evaluate(baselineCandidate,"validation"),4);
const selectedValidation=round(selected.validation,4);
const report={schemaVersion:1,status:"season-alignment-calibration-not-safety-validation",config,inventory:{goldenCases:golden.cases.length,eligibleCases:rows.length,trainingCases:rows.filter(row=>row.split==="training").length,validationCases:rows.filter(row=>row.split==="validation").length,excludedSnowHolds:golden.cases.filter(item=>snowHolds.has(destinations.find(candidate=>candidate.slug===item.slug)?.id)).map(item=>item.slug),excludedPrecipitationHolds:golden.cases.filter(item=>precipitationHolds.has(destinations.find(candidate=>candidate.slug===item.slug)?.id)).map(item=>item.slug)},candidateCount:candidates.length,baseline:{candidate:baselineCandidate,trainingF1:round(evaluate(baselineCandidate,"training"),4),validationF1:baselineValidation},selected:{candidate:selected.candidate,trainingF1:round(selected.training,4),validationF1:selectedValidation,distanceFromBaseline:round(selected.distance,4)},decision:selectedValidation>baselineValidation?{policy:"candidate-requires-independent-review-before-adoption",adoptedCandidate:"baseline",reason:"The search candidate improved untouched validation, but automated calibration is not authorized to change published scientific policy."}:{policy:"retain-expert-baseline",adoptedCandidate:"baseline",reason:"The training optimum did not improve the untouched validation subset, so changing the published weights or thresholds is not empirically justified."},validationCases:rows.filter(row=>row.split==="validation").map(row=>({destinationId:row.id,expectedMonths:row.expected,predictedMonths:predicted(row,selected.candidate),f1:round(f1(row.expected,predicted(row,selected.candidate)),4)})),interpretation:"The selected parameters optimize season-label alignment on the training subset. The untouched hash split estimates transfer only for this curated label set. This is not a safety, route-condition or forecast calibration."};
writeJson("generated/reports/season-alignment-calibration.json",report);
console.log(`Season calibration: ${rows.length} eligible cases; ${candidates.length} candidates; selected train F1 ${report.selected.trainingF1}, validation F1 ${report.selected.validationF1}; baseline validation F1 ${report.baseline.validationF1}`);
