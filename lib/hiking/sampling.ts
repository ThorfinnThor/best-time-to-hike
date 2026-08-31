import samplingConfig from "@/data-config/methodology/sampling-v1.json";

export interface Candidate { lat:number; lon:number; gridElevationM:number }
export interface SelectedCandidate extends Candidate { elevationMismatchM:number; sampleWeight:number; selectionRank:number }

export const greatCircleDistanceKm = (a: Candidate, b: Candidate) => {
  const r = 6371;
  const dLat = (b.lat-a.lat)*Math.PI/180;
  const dLon = (b.lon-a.lon)*Math.PI/180;
  const value = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*r*Math.asin(Math.sqrt(value));
};

export function selectSamplingPoints(candidates: Candidate[], targetElevationM: number, maxPoints = samplingConfig.maxPointsPerBand, slackM = samplingConfig.dispersionMismatchSlackM): SelectedCandidate[] {
  const ranked = candidates.map((candidate)=>({...candidate,elevationMismatchM:Math.abs(candidate.gridElevationM-targetElevationM)})).sort((a,b)=>a.elevationMismatchM-b.elevationMismatchM || a.lat-b.lat || a.lon-b.lon);
  if (!ranked.length) return [];
  const selected = [ranked[0]];
  while (selected.length < Math.min(maxPoints, ranked.length)) {
    const unused = ranked.filter((candidate)=>!selected.includes(candidate));
    const withinSlack = unused.filter((candidate)=>candidate.elevationMismatchM <= ranked[0].elevationMismatchM + slackM);
    if (!withinSlack.length) break;
    withinSlack.sort((a,b)=>Math.min(...selected.map((item)=>greatCircleDistanceKm(b,item)))-Math.min(...selected.map((item)=>greatCircleDistanceKm(a,item))) || a.elevationMismatchM-b.elevationMismatchM || a.lat-b.lat || a.lon-b.lon);
    selected.push(withinSlack[0]);
  }
  return selected.map((candidate,index)=>({...candidate,sampleWeight:1/selected.length,selectionRank:index+1}));
}

export function samplingQuality(mismatchM: number) {
  if (mismatchM <= samplingConfig.goodMismatchMaxM) return "good";
  if (mismatchM <= samplingConfig.moderateMismatchMaxM) return "moderate";
  if (mismatchM <= samplingConfig.blockedMismatchAboveM) return "strong-penalty";
  return "blocked";
}
