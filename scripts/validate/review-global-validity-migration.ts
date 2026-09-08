import {createHash} from "node:crypto";
import {readdirSync,readFileSync,writeFileSync} from "node:fs";
import {join} from "node:path";

const [evidenceRoot,runText,recomputationCommit] = process.argv.slice(2);
if(!evidenceRoot||!/^\d+$/.test(runText??"")||!/^[a-f0-9]{7,40}$/.test(recomputationCommit??"")) {
  throw Error("Usage: review-global-validity-migration.ts <evidence-root> <github-actions-run> <recomputation-commit>");
}
const run=Number(runText);
const read=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const fileSha=(path:string)=>createHash("sha256").update(readFileSync(path)).digest("hex");
const objectSha=(value:unknown)=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
const scientificCore=(report:any)=>({destinationId:report.destinationId,sourceSha256:report.sourceSha256,monthly:report.monthly,snowScreen:report.snowScreen,dailyCoverage:report.dailyCoverage});
const close=(a:number,b:number)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=1e-5;
const walk=(directory:string):string[]=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(directory,entry.name)):[join(directory,entry.name)]);
const files=walk(evidenceRoot);
const uniqueBySuffix=(suffix:string)=>{
  const map=new Map<string,string>();
  for(const path of files.filter(candidate=>candidate.endsWith(suffix))){
    const id=path.split("/").at(-1)!.slice(0,-suffix.length);
    if(map.has(id))throw Error(`${id}: duplicate ${suffix} evidence`);
    map.set(id,path);
  }
  return map;
};
const reports=uniqueBySuffix("-report.json");
const sources=uniqueBySuffix("-source-evidence.json");
const destinations=read("data-config/sources/destinations.json").filter((item:any)=>item.active).sort((a:any,b:any)=>a.id.localeCompare(b.id));
if(destinations.length!==315)throw Error(`Expected 315 active destinations, found ${destinations.length}`);
if(reports.size!==destinations.length||sources.size!==destinations.length)throw Error(`Evidence must contain exactly 315 unique reports and sources; found ${reports.size}/${sources.size}`);

const reportSha256:Record<string,string>={};
const scientificCoreSha256:Record<string,string>={};
const changedMetricCounts:Record<string,number>={};
const maximumAbsoluteMetricDelta:Record<string,number>={};
const snowReviewDestinations:string[]=[];
const errors:string[]=[];
for(const destination of destinations){
  const id=destination.id as string;
  const reportPath=reports.get(id),sourcePath=sources.get(id);
  if(!reportPath||!sourcePath){errors.push(`${id}: missing evidence pair`);continue;}
  const report=read(reportPath),source=read(sourcePath);
  const climate=read(`data-snapshots/climate/${destination.slug}.json`);
  const download=climate.sourceDownloads?.[0];
  if(report.destinationId!==id||source.destinationId!==id)errors.push(`${id}: destination identity mismatch`);
  if(report.status!=="staging-only-not-for-publication"||report.stagingExport?.productionReleaseApproval!==false)errors.push(`${id}: staging status or release lock missing`);
  if(!/^[a-f0-9]{64}$/.test(report.sourceSha256??""))errors.push(`${id}: invalid report source hash`);
  if(!Array.isArray(report.monthly)||report.monthly.length!==12||report.monthly.some((month:any,index:number)=>month.month!==index+1||month.aggregationPolicyVersion!=="observation-validity-v1"))errors.push(`${id}: monthly validity output malformed`);
  if(report.monthly?.some((month:any)=>month.scoringInputsAvailable!==true||month.missingScoringInputs?.length!==0))errors.push(`${id}: recomputation has missing scoring inputs`);
  const dailyDates=(report.dailyCoverage??[]).map((day:any)=>day.localDate);
  if(!Array.isArray(report.dailyCoverage)||dailyDates.length<10957||dailyDates.length>10959||new Set(dailyDates).size!==dailyDates.length||dailyDates.some((date:string,index:number)=>index>0&&dailyDates[index-1]>=date))errors.push(`${id}: daily coverage is not a unique ordered boundary-aware 1991-2020 series`);
  if(report.monthly?.some((month:any)=>Object.keys(month.coverage?.years??{}).length!==30||Object.keys(month.coverage.years).some(year=>Number(year)<1991||Number(year)>2020)))errors.push(`${id}: monthly coverage does not contain exactly the 30 normal years`);
  if(source.identicalToPublishedCanonical!==true||source.cacheSha256!==source.publishedCanonicalSha256||source.publishedCanonicalSha256!==download?.canonicalObservation?.sha256)errors.push(`${id}: cached observations differ from the published canonical source`);
  if(source.observationCount!==262992||download?.observationCount!==262992)errors.push(`${id}: hourly observation count mismatch`);
  if(!close(source.request?.location?.latitude,download?.request?.location?.latitude)||!close(source.request?.location?.longitude,download?.request?.location?.longitude)||!close(source.resolvedLocation?.latitude,download?.resolvedLocation?.latitude)||!close(source.resolvedLocation?.longitude,download?.resolvedLocation?.longitude))errors.push(`${id}: source coordinate chain mismatch`);
  if(report.snowScreen?.reviewRequired)snowReviewDestinations.push(id);
  for(const month of report.changes??[])for(const [key,value] of Object.entries(month.metrics??{}) as Array<[string,any]>){
    if(JSON.stringify(value.before)!==JSON.stringify(value.after))changedMetricCounts[key]=(changedMetricCounts[key]??0)+1;
    if(Number.isFinite(value.before)&&Number.isFinite(value.after))maximumAbsoluteMetricDelta[key]=Math.max(maximumAbsoluteMetricDelta[key]??0,Math.abs(value.after-value.before));
  }
  reportSha256[id]=fileSha(reportPath);
  scientificCoreSha256[id]=objectSha(scientificCore(report));
}
if(errors.length)throw Error(`Global validity review failed:\n${errors.join("\n")}`);

const decision={
  schemaVersion:2,
  decisionDate:new Date().toISOString().slice(0,10),
  reviewType:"Automated cache-identity, completeness and deterministic aggregation review; not independent expert certification",
  decisionStatus:"approved-for-global-provisional-migration",
  productionReleaseApproval:false,
  overrideExistingReleaseGates:false,
  recomputationCommit,
  aggregationPolicy:"observation-validity-v1",
  targetDatasetStatus:"provisional",
  scope:destinations.map((item:any)=>item.id),
  decisions:{
    sourceIdentity:"Every recomputation used a cached source whose hash equals the already published canonical observation hash.",
    observationValidity:"Publish explicit valid-day and valid-year denominators; do not impute missing observations.",
    equalValidYearWeighting:"Retain equal weighting across valid years of the 1991-2020 normal.",
    scoreInputs:"Migration is allowed only where all twelve months retain every required scoring input.",
    recommendationPolicy:"Rebuild scores from the current versioned policy after migration; preserve independent precipitation and persistent-snow holds.",
  },
  reviewSummary:{destinations:destinations.length,months:destinations.length*12,sourceIdenticalToPublished:destinations.length,completeScoringInputDestinations:destinations.length,snowReviewDestinations,changedMetricCounts,maximumAbsoluteMetricDelta},
  evidence:{githubActionsRun:run,recomputedInterannualRun:run,reportSha256,scientificCoreSha256},
  notApproved:["independent expert certification","production science approval","removal of any published review hold","route or whole-region climate claims","trail-safety or go/no-go advice","forecast claims"],
};
writeFileSync("data-config/methodology/validity-migration-decision-v1.json",JSON.stringify(decision,null,2)+"\n");
console.log(`Global validity review passed for ${destinations.length} destinations; decision written with ${Object.keys(reportSha256).length} report hashes.`);
