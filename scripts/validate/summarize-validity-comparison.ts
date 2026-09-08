import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const directory=process.argv[2];
if(!directory) throw Error('Usage: summarize-validity-comparison.ts <downloaded-artifact-directory>');
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const destinations=read('data-config/sources/destinations.json');
const results=readdirSync(directory).filter(name=>name.endsWith('-report.json')).map(name=>{
  const report=read(join(directory,name));
  const id=report.destinationId;
  const destination=destinations.find((d:{id:string})=>d.id===id);
  if(!destination || !report.stagingExport) throw Error('Unknown destination or missing staging export');
  const published=read(`public/data/hiking/destinations/${destination.countryCode.toLowerCase()}/${destination.slug}.json`);
  const evidence=read(join(directory,`${id}-source-evidence.json`));
  const next=report.stagingExport;
  return {id,sourceIdentical:evidence.identicalToPublishedCanonical,
    publishedEligible:published.months.filter((m:any)=>m.recommendationEligible).map((m:any)=>m.month),
    stagedEligible:next.months.filter((m:any)=>m.recommendationEligible).map((m:any)=>m.month),
    publishedBest:published.bestMonths,stagedBest:next.bestMonths,holdReasons:next.holdReasons,
    missing:next.months.filter((m:any)=>m.missingScoringInputs.length).map((m:any)=>({month:m.month,inputs:m.missingScoringInputs})),
    maxTemperatureMeanDelta:Math.max(...report.changes.map((m:any)=>{const x=m.metrics.temperatureHikingMeanC;return x.before===null||x.after===null?0:Math.abs(x.after-x.before);})),
    maxPublishedScoreDelta:Math.max(0,...next.months.map((m:any,i:number)=>m.overallScore===null||published.months[i].overallScore===null?0:Math.abs(m.overallScore-published.months[i].overallScore)))};
});
console.log(JSON.stringify({comparison:'staging vs published; score deltas include published rounding',results},null,2));
