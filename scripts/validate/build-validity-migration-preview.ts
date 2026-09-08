import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import decision from '../../data-config/methodology/validity-migration-decision-v1.json';
import {stageValidityExport} from '../../lib/hiking/validity-export';

const [expandedDirectory,denaliDirectory,output='generated/reports/validity-migration-preview.json']=process.argv.slice(2);
if(!expandedDirectory||!denaliDirectory) throw Error('Usage: build-validity-migration-preview.ts <expanded-evidence> <denali-evidence> [output]');
if(output!=='generated/reports/validity-migration-preview.json') throw Error('Preview output path is fixed');
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const destinations=read('data-config/sources/destinations.json');
const sha=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const scientificCore=(report:any)=>({destinationId:report.destinationId,sourceSha256:report.sourceSha256,monthly:report.monthly,snowScreen:report.snowScreen,dailyCoverage:report.dailyCoverage});
const objectSha=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const changed=(before:unknown,after:unknown)=>JSON.stringify(before)!==JSON.stringify(after);

const results=decision.scope.map(id=>{
  const directory=id==='denali'?denaliDirectory:expandedDirectory;
  const reportPath=join(directory,`${id}-report.json`);
  const report=read(reportPath);
  const expected=(decision.evidence.scientificCoreSha256 as Record<string,string>)[id];
  const expectedReport=(decision.evidence.reportSha256 as Record<string,string>)[id];
  if(sha(reportPath)!==expectedReport) throw Error(`${id}: full evidence report hash mismatch`);
  if(objectSha(scientificCore(report))!==expected) throw Error(`${id}: scientific evidence core hash mismatch`);
  if(report.destinationId!==id||report.monthly.length!==12) throw Error(`${id}: malformed evidence`);
  const sourceEvidence=read(join(directory,`${id}-source-evidence.json`));
  if(sourceEvidence.destinationId!==id||sourceEvidence.identicalToPublishedCanonical!==true||sourceEvidence.cacheSha256!==sourceEvidence.publishedCanonicalSha256) throw Error(`${id}: source differs from published canonical observations`);
  const config=destinations.find((item:{id:string})=>item.id===id);
  if(!config) throw Error(`${id}: destination missing`);
  const published=read(`public/data/hiking/destinations/${config.countryCode.toLowerCase()}/${config.slug}.json`);
  const confidenceContext={datasetStatus:published.datasetStatus,representativenessApproved:false,source:'existing-published-spatial-geometry' as const,
    months:published.months.map((month:any)=>{if(month.bands.length!==1) throw Error(`${id}: scoped preview requires one published representative band`);const band=month.bands[0];return {meanElevationMismatchM:band.meanElevationMismatchM,samplePointCount:band.samplePointCount,samplePointMaxSeparationKm:band.samplePointMaxSeparationKm,polygonEquivalentDiameterKm:band.polygonEquivalentDiameterKm,terrainReliefM:band.terrainReliefM};})};
  const staged=stageValidityExport(id,report.monthly,report.stagingExport.holdReasons,confidenceContext);
  const months=staged.months.map((month,index)=>{
    const previous=published.months[index];
    if(previous.month!==month.month) throw Error(`${id}: published month order mismatch`);
    return {month:month.month,
      before:{recommendationEligible:previous.recommendationEligible,overallScore:previous.overallScore,components:previous.components,confidenceScore:previous.confidenceScore,confidenceLevel:previous.confidenceLevel,metrics:previous.metrics},
      after:{recommendationEligible:month.recommendationEligible,overallScore:month.overallScore,components:month.components,confidenceScore:month.confidence?.score??null,confidenceLevel:month.confidence?.level??null,metrics:month.metrics,interannual:month.interannual},
      changes:{recommendationEligible:changed(previous.recommendationEligible,month.recommendationEligible),overallScore:changed(previous.overallScore,month.overallScore),components:changed(previous.components,month.components),confidence:changed({score:previous.confidenceScore,level:previous.confidenceLevel},{score:month.confidence?.score??null,level:month.confidence?.level??null}),metrics:changed(previous.metrics,month.metrics)},
      missingScoringInputs:month.missingScoringInputs};
  });
  return {destinationId:id,evidenceSha256:expected,sourceIdenticalToPublished:true,holdReasons:staged.holdReasons,
    before:{bestMonths:published.bestMonths,recommendationEligible:published.recommendationEligible},
    after:{bestMonths:staged.bestMonths,recommendationEligible:staged.months.some(m=>m.recommendationEligible)},months};
});
const summary={destinations:results.length,months:results.length*12,
  changedEligibilityMonths:results.flatMap(r=>r.months).filter(m=>m.changes.recommendationEligible).length,
  changedBestMonthDestinations:results.filter(r=>changed(r.before.bestMonths,r.after.bestMonths)).length,
  changedRoundedScoreMonths:results.flatMap(r=>r.months).filter(m=>m.changes.overallScore).length,
  changedConfidenceMonths:results.flatMap(r=>r.months).filter(m=>m.changes.confidence).length,
  destinationsWithMissingInputs:results.filter(r=>r.months.some(m=>m.missingScoringInputs.length)).map(r=>r.destinationId)};
const preview={schemaVersion:1,status:'review-only-not-published',aggregationPolicyVersion:'observation-validity-v1',decisionFile:'data-config/methodology/validity-migration-decision-v1.json',decisionSha256:createHash('sha256').update(readFileSync('data-config/methodology/validity-migration-decision-v1.json')).digest('hex'),summary,results};
const schema=read('schemas/validity-migration-preview.schema.json');
const validate=new Ajv2020({strict:false}).compile(schema);
if(!validate(preview)) throw Error(`Preview schema failed: ${JSON.stringify(validate.errors)}`);
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(preview,null,2)+'\n');
console.log(JSON.stringify(summary));
