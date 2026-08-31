import test from "node:test";
import assert from "node:assert/strict";
import { adjustTemperature, confidenceScore, interpolate, overallScore, relativeHumidity, roundHalfAwayFromZero, scoreComponents, windKmh } from "../lib/scoring";

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
  assert.equal(confidenceScore({...metric,samplePointMaxSeparationKm:1}),97.75);
  assert.equal(confidenceScore({...metric,validInterannualYearCount:10}),94);
});

test("missing score inputs fail instead of silently renormalizing",()=>{
  assert.throws(()=>scoreComponents({temperatureUtilitySamplesC:[],wetDayProbability:0,heavyRainDayProbability:0,snowDayProbability:0,snowDepthMeanOnSnowDaysM:0,hotDayProbability:0,severeHotDayProbability:0,windHikingMeanKmh:10,highWindHourProbability:0,daylightHoursMean:12} as any),/SCORE001/);
  assert.throws(()=>overallScore({temperature:90,precipitation:90,snow:90,heatStress:90,wind:Number.NaN,daylight:90}),/SCORE001/);
});
