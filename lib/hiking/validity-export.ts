import { scoreExactComponents, overallScore, roundHalfAwayFromZero, type ExactScoringMetrics } from '../scoring';
import type { ComponentScores } from '../data/types';
import { recommendationDecision, bestMonthsFor } from '../scoring/recommendations';
import type { aggregateValidMonth } from './climate-validity';

export const requiredScoringKeys = ['temperatureUtilityScore','wetDayProbability','heavyRainDayProbability','snowDayProbability','snowDepthMeanOnSnowDaysM','hotDayProbability','severeHotDayProbability','windHikingMeanKmh','highWindHourProbability','daylightHoursMean'] as const;

/** Fail closed on missing metrics, regardless of an upstream availability flag. */
export function stageMonthScore(metrics:Record<string,number|null>, month:number, held:boolean) {
  const missing=requiredScoringKeys.filter(k=>!Number.isFinite(metrics[k]));
  if(held||missing.length) return {month,recommendationEligible:false,overallScore:null,scoreLevel:null,components:null,missingScoringInputs:missing,reason:held?'destination-review-hold':'insufficient-observations'};
  const exact=Object.fromEntries(requiredScoringKeys.map(k=>[k,metrics[k]])) as ExactScoringMetrics;
  const components=scoreExactComponents(exact);
  const decision=recommendationDecision(components,overallScore(components));
  // Match the existing export contract: eligibility uses raw components, but
  // bestMonthsFor consumes rounded published components and rounded total scores.
  const rounded=Object.fromEntries(Object.entries(components).map(([k,v])=>[k,roundHalfAwayFromZero(v)])) as unknown as ComponentScores;
  return {month,...decision,overallScore:roundHalfAwayFromZero(decision.overallScore),components:rounded,missingScoringInputs:[],reason:null};
}

export function stageValidityExport(destinationId:string, monthly:ReturnType<typeof aggregateValidMonth>[], holdReasons:string[]) {
  if(monthly.length!==12 || monthly.some((m,i)=>m.month!==i+1)) throw Error('Staging export requires 12 ordered unique months');
  const months=monthly.map(m=>({...stageMonthScore(m.metrics,m.month,holdReasons.length>0),metrics:m.metrics,coverage:m.coverage}));
  return {schemaVersion:1,datasetStatus:'staging-only' as const,aggregationPolicyVersion:'observation-validity-v1',destinationId,holdReasons,months,bestMonths:bestMonthsFor(months),productionReleaseApproval:false};
}
