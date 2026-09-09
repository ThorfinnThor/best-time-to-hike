import policy from '@/data-config/methodology/snow-screening-clarification-v1.json';

/** Staging interpretation; historical importer metadata retains its original version. */
export function screenPhysicalSnow(depthsM: Array<number|null>, monthlySnowProbability: Array<number|null>) {
  if(depthsM.some(x=>x!==null && (!Number.isFinite(x)||x<0))) throw Error('Invalid physical snow depth');
  if(monthlySnowProbability.length!==12 || monthlySnowProbability.some(x=>x!==null&&(!Number.isFinite(x)||x<0||x>1))) throw Error('Expected 12 monthly snow probabilities');
  const reasons:string[]=[];
  if(!depthsM.length||depthsM.some(x=>x===null)||monthlySnowProbability.some(x=>x===null)) reasons.push('snow-data-review-required');
  if(depthsM.some(x=>x!==null&&x>=policy.physicalDepthReviewThresholdM)) reasons.push('physical-snow-depth-review-threshold');
  if(monthlySnowProbability.every(x=>x===1)) reasons.push('persistent-snow-representativeness-review');
  return {policyVersion:'snow-screening-clarification-v1',reviewRequired:reasons.length>0,reasons,glacierClassification:'not-established' as const,existingHoldMayBeReleased:false as const};
}
