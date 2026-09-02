import test from "node:test";
import assert from "node:assert/strict";
import { adjustTemperature, confidenceScore, interpolate, overallScore, relativeHumidity, roundHalfAwayFromZero, scoreComponents, windKmh } from "../lib/scoring";
import { guardConfidence, hasPersistentSnowHold, recommendationDecision } from "../lib/scoring/recommendations";

test("numeric scientific reference vectors",()=>{
  assert.equal(288.15-273.15,15);
  assert.equal(adjustTemperature(15,800,1300).valueC,11.75);
  assert.equal(adjustTemperature(10,1500,1000).valueC,13.25);
  assert.deepEqual(adjustTemperature(15,0,1500),{valueC:10,correctionC:-5,capped:true});
  assert.equal(windKmh(3,4),18);
  assert.ok(Math.abs(relativeHumidity(10,10)-100)<.1);
  assert.equal(interpolate(7.5,[[5,60],[10,90]]),75);
  assert.equal(roundHalfAwayFromZero(88*.2+94*.5+74*.3),87);
  assert.equal(roundHalfAwayFromZero(overallScore({temperature:80,precipitation:80,snow:80,heatStress:80,wind:80,daylight:80})),80);
});

test("component scores preserve dry-month endpoints",()=>{
  const metric:any={temperatureUtilitySamplesC:[12,15,18],wetDayProbability:0,heavyRainDayProbability:0,snowDayProbability:0,snowDepthMeanOnSnowDaysM:0,hotDayProbability:0,severeHotDayProbability:0,windHikingMeanKmh:10,highWindHourProbability:0,daylightHoursMean:13};
  const scores=scoreComponents(metric);
  assert.equal(scores.precipitation,100); assert.equal(scores.snow,100); assert.equal(scores.heatStress,100); assert.equal(scores.wind,100); assert.equal(scores.daylight,100);
});

test("confidence applies spatial clustering and low-year caps",()=>{
  const metric:any={dataCompleteness:.995,meanElevationMismatchM:150,samplePointCount:3,samplePointMaxSeparationKm:5,polygonEquivalentDiameterKm:30,interannualScoreSd:5,validInterannualYearCount:30,terrainReliefM:200,highWindHourProbability:0};
  assert.equal(confidenceScore(metric),100);
  assert.equal(confidenceScore({...metric,samplePointMaxSeparationKm:1}),97.5);
  assert.equal(confidenceScore({...metric,validInterannualYearCount:10}),93.33333333333333);
});

test("unvalidated grid-cell wind cannot increase confidence",()=>{
  const metric:any={dataCompleteness:.9,meanElevationMismatchM:600,samplePointCount:3,samplePointMaxSeparationKm:5,polygonEquivalentDiameterKm:30,interannualScoreSd:15,validInterannualYearCount:30,terrainReliefM:200,highWindHourProbability:0};
  const lowRelief=confidenceScore(metric);
  const highRelief=confidenceScore({...metric,terrainReliefM:2000,highWindHourProbability:1});
  assert.equal(highRelief,lowRelief);
});

test("missing score inputs fail instead of silently renormalizing",()=>{
  assert.throws(()=>scoreComponents({temperatureUtilitySamplesC:[],wetDayProbability:0,heavyRainDayProbability:0,snowDayProbability:0,snowDepthMeanOnSnowDaysM:0,hotDayProbability:0,severeHotDayProbability:0,windHikingMeanKmh:10,highWindHourProbability:0,daylightHoursMean:12} as any),/SCORE001/);
  assert.throws(()=>overallScore({temperature:90,precipitation:90,snow:90,heatStress:90,wind:Number.NaN,daylight:90}),/SCORE001/);
});

test("provisional recommendation guard blocks Sikkim July precipitation failure",()=>{
  const decision=recommendationDecision({temperature:90,precipitation:0,snow:100,heatStress:100,wind:100,daylight:90},79);
  assert.equal(decision.recommendationEligible,false);
  assert.equal(decision.overallScore,49);
  assert.equal(decision.scoreLevel,"poor");
  assert.deepEqual(decision.failingComponents,["precipitation"]);
});

test("persistent snow hold uses the configured exact month count",()=>{
  const months=Array.from({length:12},()=>({metrics:{snowDayProbability:1}} as any));
  assert.equal(hasPersistentSnowHold(months),true);
  assert.equal(hasPersistentSnowHold([...months.slice(0,11),{metrics:{snowDayProbability:.9999}}] as any),false);
});

test("provisional single-point confidence is capped at low 64",()=>{
  const guarded=guardConfidence(100,"provisional",1,undefined);
  assert.deepEqual(guarded,{score:64,level:"low"});
  const eligible=recommendationDecision({temperature:80,precipitation:80,snow:80,heatStress:80,wind:80,daylight:80},80);
  assert.equal(eligible.recommendationEligible,true);
  assert.equal(eligible.overallScore,80);
});
