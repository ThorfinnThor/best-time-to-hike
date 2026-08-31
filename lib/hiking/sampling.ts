export interface Candidate { lat:number; lon:number; gridElevationM:number }
export interface SelectedCandidate extends Candidate { elevationMismatchM:number; sampleWeight:number; selectionRank:number }

const distanceKm = (a: Candidate, b: Candidate) => {
  const r = 6371;
  const dLat = (b.lat-a.lat)*Math.PI/180;
  const dLon = (b.lon-a.lon)*Math.PI/180;
  const value = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*r*Math.asin(Math.sqrt(value));
};

export function selectSamplingPoints(candidates: Candidate[], targetElevationM: number, maxPoints = 3, slackM = 150): SelectedCandidate[] {
  const ranked = candidates.map((candidate)=>({...candidate,elevationMismatchM:Math.abs(candidate.gridElevationM-targetElevationM)})).sort((a,b)=>a.elevationMismatchM-b.elevationMismatchM || a.lat-b.lat || a.lon-b.lon);
  if (!ranked.length) return [];
  const selected = [ranked[0]];
  while (selected.length < Math.min(maxPoints, ranked.length)) {
    const unused = ranked.filter((candidate)=>!selected.includes(candidate));
    const withinSlack = unused.filter((candidate)=>candidate.elevationMismatchM <= ranked[0].elevationMismatchM + slackM);
    const pool = withinSlack.length ? withinSlack : unused;
    pool.sort((a,b)=>Math.min(...selected.map((item)=>distanceKm(b,item)))-Math.min(...selected.map((item)=>distanceKm(a,item))) || a.elevationMismatchM-b.elevationMismatchM || a.lat-b.lat || a.lon-b.lon);
    selected.push(pool[0]);
  }
  return selected.map((candidate,index)=>({...candidate,sampleWeight:1/selected.length,selectionRank:index+1}));
}

export function samplingQuality(mismatchM: number) {
  if (mismatchM <= 300) return "good";
  if (mismatchM <= 600) return "moderate";
  if (mismatchM <= 800) return "strong-penalty";
  return "blocked";
}
