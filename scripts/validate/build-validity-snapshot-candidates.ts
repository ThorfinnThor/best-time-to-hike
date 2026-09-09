import {createHash} from 'node:crypto';
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve,relative} from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import decision from '../../data-config/methodology/validity-migration-decision-v1.json';

const applyReviewed=process.argv.includes('--apply-reviewed');
const positional=process.argv.slice(2).filter(arg=>arg!=='--apply-reviewed');
const [evidenceDirectory,outputDirectory='generated/intermediate/validity-migration-candidates']=positional;
if(!evidenceDirectory) throw Error('Usage: build-validity-snapshot-candidates.ts <evidence-directory> [generated/intermediate/validity-migration-candidates]');
const outputRoot=resolve(outputDirectory);
const allowedRoot=resolve('generated/intermediate/validity-migration-candidates');
const relation=relative(allowedRoot,outputRoot);
if(relation.startsWith('..')||relation.startsWith('/')) throw Error('Candidate output must remain under generated/intermediate/validity-migration-candidates');
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const fileSha=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const objectSha=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const scientificCore=(report:any)=>({destinationId:report.destinationId,sourceSha256:report.sourceSha256,monthly:report.monthly,snowScreen:report.snowScreen,dailyCoverage:report.dailyCoverage});
const evidenceFiles=(directory:string):string[]=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?evidenceFiles(join(directory,entry.name)):[join(directory,entry.name)]);
const evidenceIndex=evidenceFiles(evidenceDirectory);
const evidenceFile=(name:string)=>{
  const matches=evidenceIndex.filter(path=>path.split('/').at(-1)===name);
  if(matches.length!==1)throw Error(`${name}: expected exactly one evidence file, found ${matches.length}`);
  return matches[0];
};
const destinations=read('data-config/sources/destinations.json');
const validate=new Ajv2020({allErrors:true,strict:false}).compile(read('schemas/validity-climate-snapshot-v3.schema.json'));
mkdirSync(outputRoot,{recursive:true});

for(const id of decision.scope) {
  const reportPath=evidenceFile(`${id}-report.json`);
  const sourceEvidence=read(evidenceFile(`${id}-source-evidence.json`));
  const report=read(reportPath);
  if(fileSha(reportPath)!==(decision.evidence.reportSha256 as Record<string,string>)[id]) throw Error(`${id}: full evidence report hash mismatch`);
  if(objectSha(scientificCore(report))!==(decision.evidence.scientificCoreSha256 as Record<string,string>)[id]) throw Error(`${id}: scientific evidence core hash mismatch`);
  if(sourceEvidence.identicalToPublishedCanonical!==true||sourceEvidence.cacheSha256!==sourceEvidence.publishedCanonicalSha256) throw Error(`${id}: source evidence mismatch`);
  const destination=destinations.find((item:{id:string})=>item.id===id);
  if(!destination) throw Error(`${id}: destination missing`);
  const previous=read(`data-snapshots/climate/${destination.slug}.json`);
  const bandIds=Object.keys(previous.bands);
  if(bandIds.length!==1||bandIds[0]!=='representative') throw Error(`${id}: scoped candidate migration requires one representative band`);
  const previousMonths=previous.bands.representative.months;
  const months=report.monthly.map((month:any,index:number)=>{
    const old=previousMonths[index];
    if(old.month!==month.month) throw Error(`${id}: month order mismatch`);
    const structure={month:old.month,bandId:old.bandId,targetElevationM:old.targetElevationM,meanElevationMismatchM:old.meanElevationMismatchM,samplePointCount:old.samplePointCount,samplePointMaxSeparationKm:old.samplePointMaxSeparationKm,polygonEquivalentDiameterKm:old.polygonEquivalentDiameterKm,terrainReliefM:old.terrainReliefM};
    return {...month.metrics,...structure,interannualScoreSd:month.interannual.scoreStandardDeviation,validInterannualYearCount:month.interannual.validInterannualYearCount,
      scoringInputsAvailable:month.scoringInputsAvailable,missingScoringInputs:month.missingScoringInputs,observationCoverage:month.coverage,interannualYearlyScores:month.interannual.yearlyScores};
  });
  const candidate={...previous,schemaVersion:3,aggregationPolicyVersion:'observation-validity-v1',migrationStatus:applyReviewed?'scoped-provisional':'candidate-not-published',
    validityEvidence:{githubActionsRun:decision.evidence.recomputedInterannualRun,decisionSha256:fileSha('data-config/methodology/validity-migration-decision-v1.json'),reportSha256:fileSha(reportPath),scientificCoreSha256:objectSha(scientificCore(report)),sourceSha256:report.sourceSha256,sourceIdenticalToPublished:true},
    bands:{representative:{months}}};
  if(!validate(candidate)) throw Error(`${id}: candidate schema failed: ${JSON.stringify(validate.errors)}`);
  const target=applyReviewed?`data-snapshots/climate/${destination.slug}.json`:join(outputRoot,`${id}.json`);
  writeFileSync(target,JSON.stringify(candidate,null,2)+'\n');
}
console.log(applyReviewed
  ? `Applied ${decision.scope.length} reviewed versioned snapshots; public exports still require an explicit rebuild.`
  : `Built ${decision.scope.length} versioned snapshot candidates under ${outputDirectory}; public snapshots unchanged.`);
