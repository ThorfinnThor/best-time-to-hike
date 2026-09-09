import { confidenceScore, scoreExactComponents, overallScore, roundHalfAwayFromZero, type ExactScoringMetrics } from '../scoring';
import type { BandClimateMonth, ComponentScores, DatasetStatus } from '../data/types';
import { recommendationDecision, bestMonthsFor, guardConfidence } from '../scoring/recommendations';
import type { aggregateValidMonth } from './climate-validity';

export const requiredScoringKeys = ['temperatureUtilityScore','wetDayProbability','heavyRainDayProbability','snowDayProbability','snowDepthMeanOnSnowDaysM','hotDayProbability','severeHotDayProbability','windHikingMeanKmh','highWindHourProbability','daylightHoursMean'] as const;
type ConfidenceStructure=Pick<BandClimateMonth,'meanElevationMismatchM'|'samplePointCount'|'samplePointMaxSeparationKm'|'polygonEquivalentDiameterKm'|'terrainReliefM'>;
export interface StagingConfidenceContext {
  datasetStatus:DatasetStatus;
  representativenessApproved:boolean;
  source:'existing-published-spatial-geometry';
  months:ConfidenceStructure[];
}

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

export function stageValidityExport(destinationId:string, monthly:ReturnType<typeof aggregateValidMonth>[], holdReasons:string[], confidenceContext?:StagingConfidenceContext) {
  if(monthly.length!==12 || monthly.some((m,i)=>m.month!==i+1)) throw Error('Staging export requires 12 ordered unique months');
  if(confidenceContext&&confidenceContext.months.length!==12) throw Error('Staging confidence requires 12 structural month records');
  const held=holdReasons.length>0;
  const months=monthly.map((m,index)=>{
    const score=stageMonthScore(m.metrics,m.month,held);
    let confidence:{score:number;level:string;rawScore:number}|null=null;
    const structure=confidenceContext?.months[index];
    if(!held&&structure&&Number.isFinite(m.metrics.dataCompleteness)&&m.interannual.scoreStandardDeviation!==null) {
      const input={...structure,...m.metrics,interannualScoreSd:m.interannual.scoreStandardDeviation,validInterannualYearCount:m.interannual.validInterannualYearCount} as BandClimateMonth;
      const raw=confidenceScore(input);
      const guarded=guardConfidence(raw,confidenceContext.datasetStatus,structure.samplePointCount,confidenceContext.representativenessApproved);
      confidence={score:roundHalfAwayFromZero(guarded.score),level:guarded.level,rawScore:raw};
    }
    return {...score,metrics:m.metrics,coverage:m.coverage,interannual:m.interannual,confidence};
  });
  return {schemaVersion:1,datasetStatus:'staging-only' as const,aggregationPolicyVersion:'observation-validity-v1',destinationId,holdReasons,
    confidenceInputProvenance:confidenceContext?.source??null,months,bestMonths:bestMonthsFor(months),productionReleaseApproval:false};
}
