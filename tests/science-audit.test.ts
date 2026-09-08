import assert from "node:assert/strict";
import { test } from "node:test";
import auditConfig from "../data-config/methodology/science-audit-v1.json";
import external from "../data-snapshots/external-audit/nasa-power-1991-2020.json";
import destinations from "../data-config/sources/destinations.json";
import { readFileSync } from "node:fs";

test("science audit remains explicit and fail-closed for production",()=>{
  assert.equal(auditConfig.status,"completed-with-production-restrictions");
  assert.equal(auditConfig.productionReleaseApproval,false);
  assert.equal(auditConfig.sourceDecisions.scoringWeightsAndThresholds,"transparent-local-product-policy-not-empirically-calibrated");
  assert.equal(auditConfig.sourceDecisions.gridWind,"not-validated-for-trail-exposure-or-gusts");
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
