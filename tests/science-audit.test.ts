import assert from "node:assert/strict";
import { test } from "node:test";
import auditConfig from "../data-config/methodology/science-audit-v1.json";
import external from "../data-snapshots/external-audit/nasa-power-1991-2020.json";
import destinations from "../data-config/sources/destinations.json";
import precipitationHolds from "../data-config/methodology/independent-climate-review-holds-v1.json";
import { readFileSync } from "node:fs";

test("science audit remains explicit and fail-closed for production",()=>{
  assert.equal(auditConfig.status,"completed-with-production-restrictions");
  assert.equal(auditConfig.productionReleaseApproval,false);
  assert.equal(auditConfig.sourceDecisions.scoringWeightsAndThresholds,"season-alignment-calibrated-for-descriptive-fit-not-safety-or-probability");
  assert.equal(auditConfig.sourceDecisions.gridWind,"excluded-from-score-gates-and-best-month-decisions");
});

test("independent climate diagnostic covers every current destination exactly once",()=>{
  assert.equal(external.status,"independent-model-diagnostic-not-ground-truth");
  assert.deepEqual(external.normal,{startYear:1991,endYear:2020});
  assert.equal(external.entries.length,destinations.length);
  assert.equal(new Set(external.entries.map((entry)=>entry.destinationId)).size,destinations.length);
  for(const entry of external.entries){
    const destination=destinations.find((item)=>item.id===entry.destinationId)!;
    const sampling=JSON.parse(readFileSync(`data-snapshots/sampling/${entry.destinationId}.json`,"utf8"));
    const point=sampling.bands[destination.elevationBands[0].id].points[0];
    assert.deepEqual(entry.requestedCoordinates,{lat:point.lat,lon:point.lon},entry.destinationId);
    assert.equal(entry.temperatureMeanC.length,12,entry.destinationId);
    assert.equal(entry.precipitationMonthlyMeanMm.length,12,entry.destinationId);
    assert.match(entry.sourceResponseSha256,/^[a-f0-9]{64}$/,entry.destinationId);
    assert.ok(entry.annualPrecipitationMeanMm>=0,entry.destinationId);
  }
});

test("Hunza independent diagnostic is retained without rewriting ERA5-Land",()=>{
  const hunza=external.entries.find((entry)=>entry.destinationId==="hunza");
  assert.ok(hunza);
  const delta=hunza.temperatureMeanC[9]-hunza.temperatureMeanC[8];
  assert.ok(delta<0);
  assert.ok(Math.abs(delta)>4&&Math.abs(delta)<9,`independent September-October delta was ${delta}`);
});

test("every independent precipitation outlier is quarantined and no unflagged destination is added",()=>{
  const ratios=external.entries.map((entry)=>{
    const destination=destinations.find((item)=>item.id===entry.destinationId)!;
    const published=JSON.parse(readFileSync(`public/data/hiking/destinations/${destination.countryCode.toLowerCase()}/${destination.slug}.json`,"utf8"));
    const eraAnnual=published.months.reduce((sum:number,month:any)=>sum+month.metrics.precipitationMonthlyMeanMm,0);
    return {id:entry.destinationId,ratio:eraAnnual/entry.annualPrecipitationMeanMm,published};
  });
  const flagged=ratios.filter((item)=>item.ratio>precipitationHolds.annualPrecipitationRatioReview||item.ratio<1/precipitationHolds.annualPrecipitationRatioReview);
  assert.deepEqual(flagged.map((item)=>item.id).sort(),[...precipitationHolds.destinationIds].sort());
  for(const item of flagged){
    assert.equal(item.published.recommendationHoldReason,"precipitation-validation",item.id);
    assert.equal(item.published.recommendationEligible,false,item.id);
    assert.deepEqual(item.published.bestMonths,[],item.id);
    assert.ok(item.published.months.every((month:any)=>month.overallScore===null&&month.components===null),item.id);
  }
});
