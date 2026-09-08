import { readFileSync } from "node:fs";
import type { ComponentScores, PublicDestination } from "../../lib/data/types";
import { roundHalfAwayFromZero, scoreComponents } from "../../lib/scoring";
import { BEST_MONTH_COMPONENT_KEYS, COMPONENT_KEYS, CRITICAL_COMPONENT_KEYS } from "../../lib/scoring/recommendations";
import { reviewGoldenCases, type GoldenCase } from "../lib/golden-review";
import { readJson, round, sha256, writeJson } from "../lib/io";

type Destination = {id:string;slug:string;countryCode:string;timezone:string;coordinates:{lat:number;lon:number};elevationBands:Array<{id:string;minM:number;maxM:number;weight:number}>};
type ExternalEntry = {destinationId:string;requestedCoordinates:{lat:number;lon:number};sourceGridCoordinates:{lat:number;lon:number;elevationM:number};temperatureMeanC:number[];precipitationMonthlyMeanMm:number[];annualPrecipitationMeanMm:number;sourceResponseSha256:string};

const config=readJson<any>("data-config/methodology/science-audit-v1.json");
const recommendation=readJson<any>("data-config/methodology/recommendation-eligibility-v1.json");
const releaseProfile=readJson<any>("data-config/methodology/scientific-release-profile-v1.json");
const precipitationHoldConfig=readJson<any>("data-config/methodology/independent-climate-review-holds-v1.json");
const calibration=readJson<any>("generated/reports/season-alignment-calibration.json");
const weights=readJson<any>("data-config/scoring/weights.json").overall as Record<keyof ComponentScores,number>;
const destinations=readJson<Destination[]>("data-config/sources/destinations.json");
const geojson=readJson<any>("data-config/geography/destination-areas.geojson");
const external=readJson<any>("data-snapshots/external-audit/nasa-power-1991-2020.json");
const golden=readJson<{status:string;cases:GoldenCase[]}>("tests/fixtures/known-hiking-seasons.json");
const replacements=readJson<any>("data-config/sources/representative-cell-replacements-v1.json");
const knownHolds=new Set(readJson<{destinationIds:string[]}>("data-config/sources/known-snowbound-cell-holds.json").destinationIds);
const featureById=new Map(geojson.features.map((feature:any)=>[feature.properties.destinationId,feature]));
const externalById=new Map<string,ExternalEntry>(external.entries.map((entry:ExternalEntry)=>[entry.destinationId,entry]));
const exactComponentsById=new Map<string,Array<{month:number;components:ComponentScores}>>();
const precipitationHolds=new Set<string>(precipitationHoldConfig.destinationIds);
const fileSha=(path:string)=>sha256(readFileSync(path,"utf8"));

const haversineKm=(a:{lat:number;lon:number},b:{lat:number;lon:number})=>{
  const radians=(value:number)=>value*Math.PI/180;
  const dLat=radians(b.lat-a.lat),dLon=radians(b.lon-a.lon);
  const value=Math.sin(dLat/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(value),Math.sqrt(1-value));
};
const close=(a:number,b:number,tolerance:number)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tolerance;
const percentile=(values:number[],fraction:number)=>values[Math.ceil(values.length*fraction)-1];
const sameMonths=(a:number[],b:number[])=>a.length===b.length&&a.every((month)=>b.includes(month));
const publicDestination=(destination:Destination)=>readJson<PublicDestination>(`public/data/hiking/destinations/${destination.countryCode.toLowerCase()}/${destination.slug}.json`);
const maxAdjacentJump=(values:number[])=>{
  let result={fromMonth:1,toMonth:2,deltaC:values[1]-values[0],absoluteC:Math.abs(values[1]-values[0])};
  for(let index=0;index<12;index+=1){
    const next=(index+1)%12;
    const delta=values[next]-values[index];
    if(Math.abs(delta)>result.absoluteC)result={fromMonth:index+1,toMonth:next+1,deltaC:delta,absoluteC:Math.abs(delta)};
  }
  return {...result,deltaC:round(result.deltaC,1),absoluteC:round(result.absoluteC,1)};
};
const scoreWith=(components:ComponentScores,scenarioWeights:Record<keyof ComponentScores,number>)=>COMPONENT_KEYS.reduce((sum,key)=>sum+components[key]*scenarioWeights[key],0);
const normalizeWeights=(changed:keyof ComponentScores,factor:number)=>{
  const draft={...weights,[changed]:weights[changed]*factor};
  const total=Object.values(draft).reduce((sum,value)=>sum+value,0);
  return Object.fromEntries(Object.entries(draft).map(([key,value])=>[key,value/total])) as Record<keyof ComponentScores,number>;
};
const bestForScenario=(destination:PublicDestination,scenarioWeights:Record<keyof ComponentScores,number>,criticalFloor:number,bestFloor:number)=>(exactComponentsById.get(destination.id)??[])
  .filter((month)=>{
    const published=destination.months[month.month-1];
    return !knownHolds.has(destination.id)&&published.components!==null
    && CRITICAL_COMPONENT_KEYS.every((key)=>month.components[key]>criticalFloor)
    && BEST_MONTH_COMPONENT_KEYS.every((key)=>published.components![key]>bestFloor);
  })
  .map((month)=>({month:month.month,score:roundHalfAwayFromZero(scoreWith(month.components,scenarioWeights))}))
  .sort((a,b)=>b.score-a.score||a.month-b.month).slice(0,3).map((item)=>item.month).sort((a,b)=>a-b);

const errors:string[]=[];
const coordinateRows=[] as any[];
const publicDestinations=[] as PublicDestination[];
for(const destination of destinations){
  const sampling=readJson<any>(`data-snapshots/sampling/${destination.id}.json`);
  const climate=readJson<any>(`data-snapshots/climate/${destination.id}.json`);
  const dem=readJson<any>(`data-snapshots/dem/${destination.id}.json`);
  const published=publicDestination(destination);
  publicDestinations.push(published);
  const band=destination.elevationBands[0];
  exactComponentsById.set(destination.id,climate.bands[band.id].months.map((month:any,index:number)=>({month:index+1,components:scoreComponents(month)})));
  const samplingBand=sampling.bands?.[band.id];
  const point=samplingBand?.points?.[0];
  const download=climate.sourceDownloads?.[0];
  const feature=featureById.get(destination.id) as any;
  const externalEntry=externalById.get(destination.id);
  const rowErrors:string[]=[];
  if(!Number.isFinite(destination.coordinates.lat)||Math.abs(destination.coordinates.lat)>90||!Number.isFinite(destination.coordinates.lon)||Math.abs(destination.coordinates.lon)>180)rowErrors.push("invalid-destination-coordinate");
  try{new Intl.DateTimeFormat("en",{timeZone:destination.timezone}).format(new Date(0));}catch{rowErrors.push("invalid-timezone");}
  if(destination.elevationBands.length!==1||!point||samplingBand.points.length!==1)rowErrors.push("not-exactly-one-representative-point");
  const modelElevation=point?.representativeModelElevationM??point?.gridElevationM??point?.targetElevationM;
  if(point&&Math.abs(point.lat*10-Math.round(point.lat*10))>config.spatialPolicy.gridCoordinateToleranceDegrees*10)rowErrors.push("latitude-not-on-0.1-degree-grid");
  if(point&&Math.abs(point.lon*10-Math.round(point.lon*10))>config.spatialPolicy.gridCoordinateToleranceDegrees*10)rowErrors.push("longitude-not-on-0.1-degree-grid");
  if(!download||climate.sourceDownloads.length!==1||download.observationCount!==config.spatialPolicy.requiredClimateObservationCount1991To2020)rowErrors.push("invalid-source-observation-count");
  if(point&&download&&(!close(point.lat,download.request.location.latitude,config.spatialPolicy.gridCoordinateToleranceDegrees)||!close(point.lon,download.request.location.longitude,config.spatialPolicy.gridCoordinateToleranceDegrees)))rowErrors.push("sampling-request-coordinate-mismatch");
  if(point&&download&&(!close(point.lat,download.resolvedLocation.latitude,config.spatialPolicy.gridCoordinateToleranceDegrees)||!close(point.lon,download.resolvedLocation.longitude,config.spatialPolicy.gridCoordinateToleranceDegrees)))rowErrors.push("sampling-resolved-coordinate-mismatch");
  if(point&&externalEntry&&(!close(point.lat,externalEntry.requestedCoordinates.lat,config.spatialPolicy.gridCoordinateToleranceDegrees)||!close(point.lon,externalEntry.requestedCoordinates.lon,config.spatialPolicy.gridCoordinateToleranceDegrees)))rowErrors.push("independent-diagnostic-request-coordinate-mismatch");
  if(!close(modelElevation,download?.era5LandGridElevationM,config.spatialPolicy.modelElevationToleranceM)||!close(modelElevation,dem.area?.medianM,config.spatialPolicy.modelElevationToleranceM)||!close(modelElevation,published.representativeCell.modelElevationM,config.spatialPolicy.modelElevationToleranceM))rowErrors.push("model-elevation-chain-mismatch");
  if(!(band.minM<=modelElevation&&modelElevation<=band.maxM))rowErrors.push("model-elevation-outside-band");
  if(!/^[a-f0-9]{64}$/.test(download?.downloadSha256??"")||!/^[a-f0-9]{64}$/.test(download?.canonicalObservation?.sha256??"")||!/^[a-f0-9]{64}$/.test(externalEntry?.sourceResponseSha256??""))rowErrors.push("invalid-source-hash");
  const polygon=feature?.geometry?.coordinates?.[0] as [number,number][]|undefined;
  if(!polygon||!point){rowErrors.push("missing-cell-polygon");}else{
    const lons=polygon.map(([lon])=>lon),lats=polygon.map(([,lat])=>lat);
    if(point.lon<Math.min(...lons)-1e-6||point.lon>Math.max(...lons)+1e-6||point.lat<Math.min(...lats)-1e-6||point.lat>Math.max(...lats)+1e-6)rowErrors.push("point-outside-declared-cell-polygon");
  }
  const distanceKm=point?haversineKm(destination.coordinates,{lat:point.lat,lon:point.lon}):null;
  const independentRouteEvidence=replacements.replacements?.[destination.id]?.approval===true;
  coordinateRows.push({destinationId:destination.id,destinationCoordinates:destination.coordinates,representativeCell:point?{lat:point.lat,lon:point.lon,modelElevationM:modelElevation}:null,centroidToCellKm:distanceKm===null?null:round(distanceKm,2),sourceObservationCountPassed:download?.observationCount===config.spatialPolicy.requiredClimateObservationCount1991To2020,internalCoordinateChainPassed:rowErrors.length===0,independentRouteEvidence,claimScope:independentRouteEvidence?"named-route-supported-cell":"selected-model-cell-only",errors:rowErrors});
  errors.push(...rowErrors.map((error)=>`${destination.id}: ${error}`));
}

if(destinations.length!==315)errors.push(`catalogue-size: expected 315, got ${destinations.length}`);
if(external.entries.length!==destinations.length||externalById.size!==destinations.length)errors.push("external-audit-snapshot-does-not-cover-catalogue");

const distances=coordinateRows.map((row)=>row.centroidToCellKm as number).sort((a,b)=>a-b);
const externalComparisons=publicDestinations.map((destination)=>{
  const independent=externalById.get(destination.id)!;
  const eraTemperature=destination.months.map((month)=>month.metrics.temperatureHikingMeanC);
  const eraAnnualPrecipitation=destination.months.reduce((sum,month)=>sum+month.metrics.precipitationMonthlyMeanMm,0);
  const eraJump=maxAdjacentJump(eraTemperature);
  const independentJump=maxAdjacentJump(independent.temperatureMeanC);
  const precipitationRatio=eraAnnualPrecipitation/independent.annualPrecipitationMeanMm;
  const flags=[] as string[];
  if(Math.abs(eraJump.absoluteC-independentJump.absoluteC)>config.externalClimateDiagnostic.temperatureAdjacentJumpDifferenceReviewC)flags.push("temperature-seasonal-jump-disagreement");
  if(precipitationRatio>config.externalClimateDiagnostic.annualPrecipitationRatioReview||precipitationRatio<1/config.externalClimateDiagnostic.annualPrecipitationRatioReview)flags.push("annual-precipitation-disagreement");
  return {destinationId:destination.id,era5Land:{largestAdjacentTemperatureJump:eraJump,annualPrecipitationMm:round(eraAnnualPrecipitation,1)},nasaPower:{largestAdjacentTemperatureJump:independentJump,annualPrecipitationMm:independent.annualPrecipitationMeanMm},era5ToIndependentPrecipitationRatio:round(precipitationRatio,2),flags};
});

const sensitivityScenarios=[] as any[];
for(const component of COMPONENT_KEYS)for(const factor of [1-config.sensitivity.componentWeightRelativeChange,1+config.sensitivity.componentWeightRelativeChange]){
  const scenarioWeights=normalizeWeights(component,factor);
  const changed=publicDestinations.filter((destination)=>!sameMonths(destination.bestMonths,bestForScenario(destination,scenarioWeights,recommendation.criticalComponentMinimumExclusive,recommendation.bestMonthComponentMinimumExclusive))).map((destination)=>destination.id);
  sensitivityScenarios.push({type:"weight",component,factor,changedDestinationCount:changed.length,changedDestinations:changed});
}
for(const floor of config.sensitivity.criticalComponentFloorAlternatives){
  const changed=publicDestinations.filter((destination)=>!sameMonths(destination.bestMonths,bestForScenario(destination,weights,floor,recommendation.bestMonthComponentMinimumExclusive))).map((destination)=>destination.id);
  sensitivityScenarios.push({type:"critical-component-floor",value:floor,changedDestinationCount:changed.length,changedDestinations:changed});
}
for(const floor of config.sensitivity.bestMonthComponentFloorAlternatives){
  const changed=publicDestinations.filter((destination)=>!sameMonths(destination.bestMonths,bestForScenario(destination,weights,recommendation.criticalComponentMinimumExclusive,floor))).map((destination)=>destination.id);
  sensitivityScenarios.push({type:"best-month-component-floor",value:floor,changedDestinationCount:changed.length,changedDestinations:changed});
}

const goldenReview=reviewGoldenCases(golden,publicDestinations);
const hunza=externalComparisons.find((item)=>item.destinationId==="hunza")!;
const independentRouteEvidenceCount=coordinateRows.filter((row)=>row.independentRouteEvidence).length;
const legacySnapshotCount=publicDestinations.filter((destination)=>destination.aggregationPolicyVersion==="legacy-climate-aggregation-v1").length;
const externalPrecipitationFlags=externalComparisons.filter((item)=>item.flags.includes("annual-precipitation-disagreement"));
const externalTemperatureFlags=externalComparisons.filter((item)=>item.flags.includes("temperature-seasonal-jump-disagreement"));
const cellScopeEnforced=publicDestinations.every(destination=>destination.provenance.scope===releaseProfile.requiredPublicScopeText);
const unmitigatedPrecipitationFlags=externalPrecipitationFlags.filter(item=>!precipitationHolds.has(item.destinationId));
const precipitationHoldsPublished=publicDestinations.filter(destination=>precipitationHolds.has(destination.id)).every(destination=>destination.recommendationHoldReason==="precipitation-validation"&&!destination.recommendationEligible&&destination.bestMonths.length===0);
const windExcludedFromDecision=weights.wind===0&&!CRITICAL_COMPONENT_KEYS.includes("wind")&&!BEST_MONTH_COMPONENT_KEYS.includes("wind")&&publicDestinations.every(destination=>destination.provenance.wind.includes("excluded from the score"));
const calibrationAccepted=calibration.status==="season-alignment-calibration-not-safety-validation"&&calibration.decision?.adoptedCandidate==="baseline"&&calibration.selected.validationF1>=calibration.baseline.validationF1&&releaseProfile.prohibitedClaims.includes("trail-safety-or-go-no-go-advice")&&releaseProfile.prohibitedClaims.includes("empirically-calibrated-probability");
const productionBlockers=[
  ...(!cellScopeEnforced?["selected-model-cell claim restriction is not enforced in every public destination"]:[]),
  ...(legacySnapshotCount?[`${legacySnapshotCount} destinations retain the legacy monthly aggregation without observation-validity audit fields`]:[]),
  ...(unmitigatedPrecipitationFlags.length||!precipitationHoldsPublished?[`${unmitigatedPrecipitationFlags.length} precipitation review flags remain without a complete public recommendation hold`]:[]),
  ...(!windExcludedFromDecision?["unvalidated ERA5-Land grid wind still affects a score, gate or best-month decision"]:[]),
  ...(!calibrationAccepted?["season-alignment calibration or the prohibition on safety/probability claims is incomplete"]:[]),
];

const report={
  reportVersion:1,
  auditDate:config.auditDate,
  status:errors.length?"failed-internal-integrity":productionBlockers.length?"completed-with-production-restrictions":"scientific-evidence-gate-passed-with-claim-restrictions",
  productionReleaseApproval:false,
  scientificEvidenceGatePassed:errors.length===0&&productionBlockers.length===0,
  scope:config.scope,
  inventory:{destinations:destinations.length,months:publicDestinations.length*12,climateDownloads:destinations.length,externalDiagnosticPoints:external.entries.length,observationValiditySnapshots:destinations.length-legacySnapshotCount,legacyAggregationSnapshots:legacySnapshotCount},
  internalIntegrity:{passed:errors.length===0,errorCount:errors.length,errors,coordinateChainPassed:coordinateRows.filter((row)=>row.internalCoordinateChainPassed).length,sourceObservationCountPassed:coordinateRows.filter((row)=>row.sourceObservationCountPassed).length},
  spatialAudit:{releaseClass:releaseProfile.releaseClass,cellScopeEnforced,independentNamedRouteEvidence:independentRouteEvidenceCount,selectedModelCellOnly:destinations.length-independentRouteEvidenceCount,regionalOrRouteClaimsApproved:false,centroidToCellDistanceKm:{min:distances[0],median:percentile(distances,.5),p95:percentile(distances,.95),max:distances.at(-1)},reviewDistanceExceeded:coordinateRows.filter((row)=>row.centroidToCellKm>config.spatialPolicy.centroidDistanceReviewKm).map((row)=>row.destinationId),destinations:coordinateRows},
  sourceAndMethodAudit:{...config.sourceDecisions,era5LandDownloadsWithExactNormalAndObservationCount:coordinateRows.filter((row)=>row.sourceObservationCountPassed).length,windExcludedFromDecision,precipitationReviewHoldsPublished:precipitationHoldsPublished,seasonAlignmentCalibration:{accepted:calibrationAccepted,eligibleCases:calibration.inventory.eligibleCases,trainingCases:calibration.inventory.trainingCases,validationCases:calibration.inventory.validationCases,candidateCount:calibration.candidateCount,baselineValidationF1:calibration.baseline.validationF1,selectedValidationF1:calibration.selected.validationF1,decision:calibration.decision,scope:"season alignment only; not safety or probability"},methodologyChecksums:{scienceAudit:fileSha("data-config/methodology/science-audit-v1.json"),scientificReleaseProfile:fileSha("data-config/methodology/scientific-release-profile-v1.json"),climateAggregation:fileSha("data-config/methodology/climate-aggregation-v1.json"),observationValidity:fileSha("data-config/methodology/observation-validity-v1.json"),recommendationEligibility:fileSha("data-config/methodology/recommendation-eligibility-v1.json"),precipitationHolds:fileSha("data-config/methodology/independent-climate-review-holds-v1.json"),seasonCalibration:fileSha("data-config/methodology/season-alignment-calibration-v1.json"),scoringWeights:fileSha("data-config/scoring/weights.json"),scoringCurves:fileSha("data-config/scoring/curves.json"),externalSnapshot:fileSha("data-snapshots/external-audit/nasa-power-1991-2020.json")}},
  hunzaFinding:{classification:"source-reproduced-and-directionally-corroborated-magnitude-not-independently-validated",era5LandSeptemberToOctoberDeltaC:round(publicDestinations.find((item)=>item.id==="hunza")!.months[9].metrics.temperatureHikingMeanC-publicDestinations.find((item)=>item.id==="hunza")!.months[8].metrics.temperatureHikingMeanC,1),independentAllDaySeptemberToOctoberDeltaC:round(externalById.get("hunza")!.temperatureMeanC[9]-externalById.get("hunza")!.temperatureMeanC[8],1),comparison:hunza,decision:"Retain the source values and quality warning. Do not smooth or call the 13.3 C magnitude station-validated; the series describes this ERA5-Land cell only."},
  independentClimateDiagnostic:{status:external.status,limitations:external.interpretation,temperatureReviewFlags:externalTemperatureFlags.length,precipitationReviewFlags:externalPrecipitationFlags.length,largestPrecipitationRatios:[...externalComparisons].sort((a,b)=>b.era5ToIndependentPrecipitationRatio-a.era5ToIndependentPrecipitationRatio).slice(0,20),comparisons:externalComparisons},
  goldenCases:{...goldenReview,exactMonthSetMatches:goldenReview.cases.filter((item)=>sameMonths(item.expectedMonths,item.engineMonths)).length,interpretation:"All 31 signed labels are independent of the scoring calculation. Agreement means selected best months stay inside the labelled season; it is not full season recall. Accepted deviations remain discrepancies, not validation successes."},
  sensitivity:{scenarios:sensitivityScenarios,maximumChangedDestinationCount:Math.max(...sensitivityScenarios.map((item)=>item.changedDestinationCount)),interpretation:"Changes identify policy-sensitive answers. They do not select a better parameter value and were not used to alter the Golden labels."},
  productionBlockers,
  formalDecision:productionBlockers.length?"Scientific evidence blockers remain. The current data stay provisional, low-confidence selected-model-cell climatology.":"The automated scientific evidence gate passes only for selected-model-cell climatology with explicit review holds and prohibited safety, forecast, route and whole-region claims. Independent operator production approval remains separate and has not been granted.",
};
writeJson("generated/reports/science-audit.json",report);
console.log(`Science audit: ${report.status}; ${destinations.length} destinations; ${productionBlockers.length} scientific production blocker(s); generated/reports/science-audit.json`);
if(errors.length)process.exitCode=1;
