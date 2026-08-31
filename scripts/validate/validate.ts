import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import type { DestinationConfig, PublicDestination } from "../../lib/data/types";
import { overallScore, roundHalfAwayFromZero } from "../../lib/scoring";
import { greatCircleDistanceKm } from "../../lib/hiking/sampling";
import { readJson, ROOT, sha256 } from "../lib/io";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const destinationSchema = readJson<any>("schemas/destination.schema.json");
const rankingSchema = readJson<any>("schemas/ranking.schema.json");
const comparisonSchema = readJson<any>("schemas/comparison.schema.json");
const searchSchema = readJson<any>("schemas/search-index.schema.json");
const manifestSchema = readJson<any>("schemas/manifest.schema.json");
const geometrySchema = readJson<any>("schemas/geometry.schema.json");
const validateDestination = ajv.compile(destinationSchema);
const validateRanking = ajv.compile(rankingSchema);
const validateComparison = ajv.compile(comparisonSchema);
const validateSearch = ajv.compile(searchSchema);
const validateManifest = ajv.compile(manifestSchema);
const validateGeometry = ajv.compile(geometrySchema);
const errors: string[] = [];
const assert = (condition: unknown, message: string) => { if (!condition) errors.push(message); };
const files = (dir:string):string[] => readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>entry.isDirectory()?files(join(dir,entry.name)):[join(dir,entry.name)]);
const configs = readJson<DestinationConfig[]>("data-config/sources/destinations.json");
const scoringWeights=readJson<any>("data-config/scoring/weights.json");
const confidence=readJson<any>("data-config/methodology/confidence-v1.json");
const curves=readJson<any>("data-config/scoring/curves.json");
const climateAggregation=readJson<any>("data-config/methodology/climate-aggregation-v1.json");
const demIngestion=readJson<any>("data-config/methodology/dem-ingestion-v1.json");
const architecture=readJson<any>("config/architecture-invariants.json");
const releaseApprovals=readJson<any>("data-config/methodology/release-approvals.json");
assert(Math.abs(Object.values(scoringWeights.overall).reduce((sum:number,value:any)=>sum+value,0)-1)<1e-9,"Overall score weights do not sum to 1");
assert(Math.abs(Object.values(confidence.weights).reduce((sum:number,value:any)=>sum+value,0)-1)<1e-9,"Confidence weights do not sum to 1");
assert(scoringWeights.algorithmVersion===architecture.algorithmVersion,"Algorithm version config mismatch");
for(const [name,curve] of Object.entries(curves))if(Array.isArray(curve)){
  assert(curve.length>=2,`${name}: scoring curve needs at least two points`);
  assert(curve.every((point:any,index:number)=>Array.isArray(point)&&point.length===2&&Number.isFinite(point[0])&&Number.isFinite(point[1])&&point[1]>=0&&point[1]<=100&&(index===0||point[0]>curve[index-1][0])),`${name}: scoring curve points must have increasing x and scores in 0..100`);
}
assert(climateAggregation.normal.startYear===1991&&climateAggregation.normal.endYear===2020,"Scientific config climate normal mismatch");
assert(climateAggregation.requiredHourlyVariables.length===7&&new Set(climateAggregation.requiredHourlyVariables).size===7,"Required hourly variable registry mismatch");
assert(demIngestion.sourceProduct==="COP-DEM_GLO-30-DGED"&&demIngestion.verticalUnit==="m"&&demIngestion.horizontalCrs==="EPSG:4326","DEM ingestion source contract mismatch");
assert(demIngestion.landSurfaceMinimumExclusiveM===0,"DEM land/ocean rule changed without a validation update");
for(const [name,approval] of Object.entries(releaseApprovals.approvals) as Array<[string,any]>)if(approval.approved)assert(Boolean(approval.approvedBy)&&Number.isFinite(new Date(approval.approvedAt).getTime()),`${name}: approved release gate lacks approver/timestamp`);
const slugs = new Set<string>();
const ids = new Set<string>();
for (const config of configs) {
  assert(!slugs.has(config.slug), `Duplicate slug: ${config.slug}`); slugs.add(config.slug);
  assert(!ids.has(config.id), `Duplicate id: ${config.id}`); ids.add(config.id);
  assert(Math.abs(config.elevationBands.reduce((sum,band)=>sum+band.weight,0)-1)<1e-9, `Band weights do not sum to 1: ${config.slug}`);
  assert(config.elevationBands.every((band)=>band.minM < band.maxM), `Invalid band elevation range: ${config.slug}`);
}
const geometry = readJson<any>("data-config/geography/destination-areas.geojson");
assert(validateGeometry(geometry), `Geometry schema: ${ajv.errorsText(validateGeometry.errors)}`);
const geometryIds = geometry.features.map((feature:any)=>feature.properties.destinationId);
assert(new Set(geometryIds).size===geometryIds.length,"Duplicate destination geometry");
assert(geometryIds.every((id:string)=>ids.has(id)),"Geometry references an unknown destination");
for(const feature of geometry.features){
  const polygons=feature.geometry.type==="Polygon"?[feature.geometry.coordinates]:feature.geometry.coordinates;
  for(const polygon of polygons)for(const ring of polygon)assert(JSON.stringify(ring[0])===JSON.stringify(ring.at(-1)),`${feature.properties.destinationId}: geometry ring is not closed`);
}
for (const config of configs.filter((item)=>item.active)) assert(geometryIds.filter((id:string)=>id===config.id).length===1, `Expected exactly one geometry: ${config.id}`);

const root = join(ROOT,"public/data/hiking");
const manifest = readJson<any>("public/data/hiking/manifest.json");
assert(manifest.algorithmVersion===scoringWeights.algorithmVersion,"Manifest algorithm version mismatch");
assert(validateManifest(manifest), `Manifest schema: ${ajv.errorsText(validateManifest.errors)}`);
assert(manifest.climateNormal.startYear===1991 && manifest.climateNormal.endYear===2020,"Climate normal must be 1991-2020");
const detailFiles = files(join(root,"destinations")).filter((path)=>!path.endsWith("index.json"));
assert(manifest.destinationCount===detailFiles.length,"Manifest destination count mismatch");
const samplingPointIds=new Set<string>();
for(const config of configs.filter((item)=>item.active)){
  const sampling=readJson<any>(`data-snapshots/sampling/${config.slug}.json`);
  assert(sampling.destinationId===config.id,`${config.slug}: sampling destination ID mismatch`);
  assert(JSON.stringify(Object.keys(sampling.bands).sort())===JSON.stringify(config.elevationBands.map((band)=>band.id).sort()),`${config.slug}: sampling bands mismatch`);
  for(const bandConfig of config.elevationBands){
    const band=sampling.bands[bandConfig.id];
    assert(Array.isArray(band.points)&&band.points.length>=1,`${config.slug}/${bandConfig.id}: no sampling points`);
    assert(Math.abs(band.points.reduce((sum:number,point:any)=>sum+point.sampleWeight,0)-1)<1e-9,`${config.slug}/${bandConfig.id}: sample weights do not sum to 1`);
    assert(band.points.every((point:any,index:number)=>point.selectionRank===index+1),`${config.slug}/${bandConfig.id}: selection ranks are not contiguous`);
    for(const point of band.points){
      assert(!samplingPointIds.has(point.id),`Duplicate sampling point ID: ${point.id}`); samplingPointIds.add(point.id);
      assert(point.targetElevationM===band.targetElevationM,`${point.id}: target elevation mismatch`);
      assert(Math.abs(Math.abs(point.gridElevationM-point.targetElevationM)-point.elevationMismatchM)<1e-9,`${point.id}: elevation mismatch is not reproducible`);
      assert(point.elevationMismatchM<=800,`${point.id}: blocked elevation mismatch requires an explicit approved override`);
    }
  }
}
const publicDestinations: PublicDestination[] = [];
for (const file of detailFiles) {
  const destination = JSON.parse(readFileSync(file,"utf8")) as PublicDestination;
  publicDestinations.push(destination);
  assert(validateDestination(destination), `${relative(root,file)} schema: ${ajv.errorsText(validateDestination.errors)}`);
  const config = configs.find((item)=>item.id===destination.id);
  assert(Boolean(config?.active), `${destination.slug}: public destination is not active in config`);
  assert(destination.datasetStatus===manifest.datasetStatus, `${destination.slug}: dataset status differs from manifest`);
  assert(JSON.stringify(destination.months.map((month)=>month.month))===JSON.stringify(Array.from({length:12},(_,index)=>index+1)), `${destination.slug}: months must be ordered 1..12`);
  assert(destination.elevation.minM<=destination.elevation.medianM&&destination.elevation.medianM<=destination.elevation.maxM, `${destination.slug}: invalid elevation ordering`);
  assert(destination.alternatives.every((slug)=>slugs.has(slug)&&slug!==destination.slug), `${destination.slug}: invalid alternative`);
  const expectedBestMonths=[...destination.months].sort((a,b)=>b.overallScore-a.overallScore||a.month-b.month).slice(0,3).map((item)=>item.month).sort((a,b)=>a-b);
  assert(JSON.stringify(destination.bestMonths)===JSON.stringify(expectedBestMonths),`${destination.slug}: best months are not reproducible`);
  for (const month of destination.months) {
    assert(month.overallScore>=0&&month.overallScore<=100, `${destination.slug}/${month.month}: score range`);
    assert(month.confidenceScore>=0&&month.confidenceScore<=100, `${destination.slug}/${month.month}: confidence range`);
    assert(month.bands.length===config?.elevationBands.length,`${destination.slug}/${month.month}: band count mismatch`);
    assert(month.bands.every((band)=>band.month===month.month&&config?.elevationBands.some((candidate)=>candidate.id===band.bandId)),`${destination.slug}/${month.month}: invalid band identity`);
    const sampling=readJson<any>(`data-snapshots/sampling/${destination.slug}.json`);
    for(const band of month.bands){
      const points=sampling.bands[band.bandId].points;
      const expectedMismatch=points.reduce((sum:number,point:any)=>sum+point.elevationMismatchM*point.sampleWeight,0);
      const expectedSeparation=Math.max(0,...points.flatMap((point:any,index:number)=>points.slice(index+1).map((other:any)=>greatCircleDistanceKm(point,other))));
      assert(band.samplePointCount===points.length,`${destination.slug}/${month.month}/${band.bandId}: sample count mismatch`);
      assert(Math.abs(band.meanElevationMismatchM-expectedMismatch)<=.1,`${destination.slug}/${month.month}/${band.bandId}: mean elevation mismatch not reproducible`);
      assert(Math.abs(band.samplePointMaxSeparationKm-expectedSeparation)<=.1,`${destination.slug}/${month.month}/${band.bandId}: sample separation not reproducible`);
      assert(band.validInterannualYearCount<=band.sampleYearCount,`${destination.slug}/${month.month}/${band.bandId}: valid interannual years exceed sample years`);
    }
    for (const value of [month.metrics.wetDayProbability,month.metrics.heavyRainDayProbability,month.metrics.snowDayProbability,month.metrics.hotDayProbability,month.metrics.severeHotDayProbability,month.metrics.highWindHourProbability,month.metrics.severeWindHourProbability,month.metrics.dataCompleteness]) assert(value>=0&&value<=1,`${destination.slug}/${month.month}: probability range`);
    assert(month.metrics.wetDayProbability>=month.metrics.heavyRainDayProbability,`${destination.slug}/${month.month}: wet < heavy`);
    assert(month.metrics.hotDayProbability>=month.metrics.severeHotDayProbability,`${destination.slug}/${month.month}: hot < severe`);
    assert(month.metrics.highWindHourProbability>=month.metrics.severeWindHourProbability,`${destination.slug}/${month.month}: high wind < severe wind`);
    assert(month.metrics.temperatureHikingP10C<=month.metrics.temperatureHikingMeanC&&month.metrics.temperatureHikingMeanC<=month.metrics.temperatureHikingP90C,`${destination.slug}/${month.month}: temperature percentile ordering`);
    assert(month.metrics.windHikingMeanKmh>=0,`${destination.slug}/${month.month}: negative wind`);
    assert(month.metrics.daylightHoursMean>=0&&month.metrics.daylightHoursMean<=24,`${destination.slug}/${month.month}: daylight range`);
    assert(Math.abs(roundHalfAwayFromZero(overallScore(month.components))-month.overallScore)<=1,`${destination.slug}/${month.month}: score not reproducible`);
  }
}
assert(publicDestinations.length===configs.filter((item)=>item.active).length,"Active config/public destination count mismatch");
const destinationBySlug = new Map(publicDestinations.map((destination)=>[destination.slug,destination]));
const rankingFiles=files(join(root,"rankings"));
const rankingIds:string[]=[];
for (const file of rankingFiles) {
  const data=JSON.parse(readFileSync(file,"utf8"));
  rankingIds.push(data.id);
  assert(validateRanking(data),`${relative(root,file)} schema: ${ajv.errorsText(validateRanking.errors)}`);
  assert(data.entries.every((entry:any,index:number)=>entry.rank===index+1),`${data.id}: ranking positions must be contiguous`);
  assert(data.entries.every((entry:any)=>destinationBySlug.has(entry.slug)),`${data.id}: unknown destination`);
  assert(data.entries.every((entry:any,index:number,array:any[])=>index===0||array[index-1].score>entry.score||array[index-1].score===entry.score&&array[index-1].confidence>entry.confidence||array[index-1].score===entry.score&&array[index-1].confidence===entry.confidence&&array[index-1].slug.localeCompare(entry.slug)<=0),`${data.id}: entries are not deterministically sorted`);
  if(manifest.datasetStatus==="fixture") assert(data.indexable===false,`${data.id}: fixture ranking must be noindex`);
}
assert(JSON.stringify([...rankingIds].sort())===JSON.stringify([...manifest.rankingIds].sort()),"Manifest ranking IDs mismatch");
for (const file of files(join(root,"comparisons")).filter((path)=>!path.endsWith("comparison-index.json"))) {
  const data=JSON.parse(readFileSync(file,"utf8"));
  assert(validateComparison(data),`${relative(root,file)} schema: ${ajv.errorsText(validateComparison.errors)}`);
  assert(data.months.every((month:any)=>month.winner==="tie"?month.firstScore===month.secondScore:month.winner===data.destinations[month.firstScore>month.secondScore?0:1]),`${data.slug}: winner is inconsistent with scores`);
  if(manifest.datasetStatus==="fixture") assert(data.indexable===false,`${data.slug}: fixture comparison must be noindex`);
}
const search=readJson<any[]>("public/data/hiking/search/destination-index.json");
assert(validateSearch(search),`Search schema: ${ajv.errorsText(validateSearch.errors)}`);
assert(JSON.stringify(search.map((item)=>item.slug).sort())===JSON.stringify([...destinationBySlug.keys()].sort()),"Search destination set mismatch");
assert(search.every((item)=>item.monthly.every((month:any,index:number)=>month.m===index+1)),"Search months must be ordered 1..12");
for (const [path,expected] of Object.entries(manifest.fileChecksums as Record<string,string>)) assert(sha256(readFileSync(join(root,path)))===expected,`Checksum mismatch: ${path}`);
const allPublicFiles = files(root);
const checksummedFiles=allPublicFiles.filter((file)=>!file.endsWith("manifest.json")).map((file)=>relative(root,file)).sort();
assert(JSON.stringify(Object.keys(manifest.fileChecksums).sort())===JSON.stringify(checksummedFiles),"Manifest checksum inventory mismatch");
assert(manifest.totalBytes===allPublicFiles.filter((file)=>!file.endsWith("manifest.json")).reduce((sum,file)=>sum+statSync(file).size,0),"Manifest byte total mismatch");
for (const file of allPublicFiles) assert(statSync(file).size<=1024*1024,`File exceeds 1 MB: ${relative(root,file)}`);
assert(allPublicFiles.reduce((sum,file)=>sum+statSync(file).size,0)<=25*1024*1024,"Dataset exceeds 25 MB");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validation passed: ${detailFiles.length} destinations, ${allPublicFiles.length} public files.`);
