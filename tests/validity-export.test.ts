import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020';
import schema from '../schemas/validity-staging.schema.json';
import {stageMonthScore,stageValidityExport,requiredScoringKeys} from '../lib/hiking/validity-export';
import {aggregateValidMonth} from '../lib/hiking/climate-validity';
import {scoreComponents,scoreExactComponents} from '../lib/scoring';
import type {BandClimateMonth} from '../lib/data/types';
import {bestMonthsFor} from '../lib/scoring/recommendations';
const metrics={temperatureUtilityScore:95,wetDayProbability:0,heavyRainDayProbability:0,snowDayProbability:0,snowDepthMeanOnSnowDaysM:0,hotDayProbability:0,severeHotDayProbability:0,windHikingMeanKmh:3,highWindHourProbability:0,daylightHoursMean:14};
test('every absent scoring input independently prevents a score without renormalization',()=>{
  for(const key of requiredScoringKeys){const result=stageMonthScore({...metrics,[key]:null},6,false);assert.equal(result.overallScore,null);assert.equal(result.recommendationEligible,false);assert.ok(result.missingScoringInputs.includes(key));}
});
test('hold nulls all score claims even with complete metrics',()=>{
  const r=stageMonthScore(metrics,6,true);assert.equal(r.components,null);assert.equal(r.overallScore,null);assert.equal(r.scoreLevel,null);
});
test('exact utility scorer matches legacy scorer without needing fake samples',()=>{
  const exact=scoreExactComponents(metrics);assert.deepEqual(exact,scoreComponents({...metrics,temperatureUtilitySamplesC:[18]} as BandClimateMonth));
  assert.equal(stageMonthScore(metrics,6,false).recommendationEligible,true);
});
test('staging schema accepts unknown metrics but cannot claim production approval',()=>{
  const output=stageValidityExport('test',Array.from({length:12},(_,i)=>aggregateValidMonth([],i+1)),[]);
  const validate=new Ajv2020({strict:false}).compile(schema);assert.equal(validate(output),true);assert.deepEqual(output.bestMonths,[]);
  assert.equal(validate({...output,productionReleaseApproval:true}),false);
  assert.throws(()=>stageValidityExport('test',[],[]));
});
test('best-month selection preserves the existing rounded-component boundary',()=>{
  const m=stageMonthScore({...metrics,wetDayProbability:1,heavyRainDayProbability:.27},9,false);
  assert.equal(m.components!.precipitation,5);
  assert.deepEqual(bestMonthsFor([m]),[]);
});
test('staging confidence is recomputed from new completeness and yearly scores, then guarded',()=>{
  const monthly=Array.from({length:12},(_,i)=>{
    const base=aggregateValidMonth([],i+1);
    return {...base,metrics:{...base.metrics,...metrics,dataCompleteness:.99},interannual:{validInterannualYearCount:30,scoreStandardDeviation:5,yearlyScores:Array.from({length:30},(_,year)=>({year:1991+year,score:80}))}};
  });
  const structure={meanElevationMismatchM:100,samplePointCount:1,samplePointMaxSeparationKm:0,polygonEquivalentDiameterKm:20,terrainReliefM:200};
  const context={datasetStatus:'provisional' as const,representativenessApproved:false,source:'existing-published-spatial-geometry' as const,months:Array(12).fill(structure)};
  const output=stageValidityExport('test',monthly,[],context);
  assert.equal(output.confidenceInputProvenance,'existing-published-spatial-geometry');
  assert.deepEqual(output.months[0].confidence&&{score:output.months[0].confidence.score,level:output.months[0].confidence.level},{score:64,level:'low'});
  assert.equal(stageValidityExport('test',monthly,['existing-published-hold'],context).months[0].confidence,null);
});
