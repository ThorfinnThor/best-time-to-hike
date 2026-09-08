import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020';
import schema from '../schemas/validity-staging.schema.json';
import {stageMonthScore,stageValidityExport,requiredScoringKeys} from '../lib/hiking/validity-export';
import {aggregateValidMonth} from '../lib/hiking/climate-validity';
import {scoreComponents,scoreExactComponents} from '../lib/scoring';
import type {BandClimateMonth} from '../lib/data/types';
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
