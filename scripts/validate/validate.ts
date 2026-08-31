import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import type { DestinationConfig, PublicDestination } from "../../lib/data/types";
import { overallScore, roundHalfAwayFromZero } from "../../lib/scoring";
import { readJson, ROOT, sha256 } from "../lib/io";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const destinationSchema = readJson<any>("schemas/destination.schema.json");
const rankingSchema = readJson<any>("schemas/ranking.schema.json");
const comparisonSchema = readJson<any>("schemas/comparison.schema.json");
const searchSchema = readJson<any>("schemas/search-index.schema.json");
const manifestSchema = readJson<any>("schemas/manifest.schema.json");
const validateDestination = ajv.compile(destinationSchema);
const validateRanking = ajv.compile(rankingSchema);
const validateComparison = ajv.compile(comparisonSchema);
const validateSearch = ajv.compile(searchSchema);
const validateManifest = ajv.compile(manifestSchema);
const errors: string[] = [];
const assert = (condition: unknown, message: string) => { if (!condition) errors.push(message); };
const files = (dir:string):string[] => readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>entry.isDirectory()?files(join(dir,entry.name)):[join(dir,entry.name)]);
const configs = readJson<DestinationConfig[]>("data-config/sources/destinations.json");
const slugs = new Set<string>();
const ids = new Set<string>();
for (const config of configs) {
  assert(!slugs.has(config.slug), `Duplicate slug: ${config.slug}`); slugs.add(config.slug);
  assert(!ids.has(config.id), `Duplicate id: ${config.id}`); ids.add(config.id);
  assert(Math.abs(config.elevationBands.reduce((sum,band)=>sum+band.weight,0)-1)<1e-9, `Band weights do not sum to 1: ${config.slug}`);
  assert(config.elevationBands.every((band)=>band.minM < band.maxM), `Invalid band elevation range: ${config.slug}`);
}
const geometry = readJson<any>("data-config/geography/destination-areas.geojson");
const geometryIds = geometry.features.map((feature:any)=>feature.properties.destinationId);
for (const config of configs.filter((item)=>item.active)) assert(geometryIds.filter((id:string)=>id===config.id).length===1, `Expected exactly one geometry: ${config.id}`);

const root = join(ROOT,"public/data/hiking");
const manifest = readJson<any>("public/data/hiking/manifest.json");
assert(validateManifest(manifest), `Manifest schema: ${ajv.errorsText(validateManifest.errors)}`);
assert(manifest.climateNormal.startYear===1991 && manifest.climateNormal.endYear===2020,"Climate normal must be 1991-2020");
const detailFiles = files(join(root,"destinations")).filter((path)=>!path.endsWith("index.json"));
for (const file of detailFiles) {
  const destination = JSON.parse(readFileSync(file,"utf8")) as PublicDestination;
  assert(validateDestination(destination), `${relative(root,file)} schema: ${ajv.errorsText(validateDestination.errors)}`);
  assert(new Set(destination.months.map((month)=>month.month)).size===12, `${destination.slug}: needs 12 unique months`);
  for (const month of destination.months) {
    assert(month.overallScore>=0&&month.overallScore<=100, `${destination.slug}/${month.month}: score range`);
    assert(month.confidenceScore>=0&&month.confidenceScore<=100, `${destination.slug}/${month.month}: confidence range`);
    for (const value of [month.metrics.wetDayProbability,month.metrics.heavyRainDayProbability,month.metrics.snowDayProbability,month.metrics.hotDayProbability,month.metrics.severeHotDayProbability,month.metrics.dataCompleteness]) assert(value>=0&&value<=1,`${destination.slug}/${month.month}: probability range`);
    assert(month.metrics.wetDayProbability>=month.metrics.heavyRainDayProbability,`${destination.slug}/${month.month}: wet < heavy`);
    assert(month.metrics.hotDayProbability>=month.metrics.severeHotDayProbability,`${destination.slug}/${month.month}: hot < severe`);
    assert(month.metrics.windHikingMeanKmh>=0,`${destination.slug}/${month.month}: negative wind`);
    assert(month.metrics.daylightHoursMean>=0&&month.metrics.daylightHoursMean<=24,`${destination.slug}/${month.month}: daylight range`);
    assert(Math.abs(roundHalfAwayFromZero(overallScore(month.components))-month.overallScore)<=1,`${destination.slug}/${month.month}: score not reproducible`);
  }
}
for (const file of files(join(root,"rankings"))) { const data=JSON.parse(readFileSync(file,"utf8")); assert(validateRanking(data),`${relative(root,file)} schema: ${ajv.errorsText(validateRanking.errors)}`); }
for (const file of files(join(root,"comparisons")).filter((path)=>!path.endsWith("comparison-index.json"))) { const data=JSON.parse(readFileSync(file,"utf8")); assert(validateComparison(data),`${relative(root,file)} schema: ${ajv.errorsText(validateComparison.errors)}`); }
assert(validateSearch(readJson("public/data/hiking/search/destination-index.json")),`Search schema: ${ajv.errorsText(validateSearch.errors)}`);
for (const [path,expected] of Object.entries(manifest.fileChecksums as Record<string,string>)) assert(sha256(readFileSync(join(root,path)))===expected,`Checksum mismatch: ${path}`);
const allPublicFiles = files(root);
for (const file of allPublicFiles) assert(statSync(file).size<=1024*1024,`File exceeds 1 MB: ${relative(root,file)}`);
assert(allPublicFiles.reduce((sum,file)=>sum+statSync(file).size,0)<=25*1024*1024,"Dataset exceeds 25 MB");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validation passed: ${detailFiles.length} destinations, ${allPublicFiles.length} public files.`);
