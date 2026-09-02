import samplingConfig from "@/data-config/methodology/sampling-v1.json";

export interface Coordinate { lat:number; lon:number }
export interface Candidate extends Coordinate { terrainElevationM:number }
export interface SelectedCandidate extends Candidate { elevationMismatchM:number; sampleWeight:number; selectionRank:number }

export const greatCircleDistanceKm = (a: Coordinate, b: Coordinate) => {
  const r = 6371;
  const dLat = (b.lat-a.lat)*Math.PI/180;
  const dLon = (b.lon-a.lon)*Math.PI/180;
  const value = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*r*Math.asin(Math.sqrt(value));
};

export function maximumSeparationKm(points: Coordinate[]) {
  if (points.length < 2) return 0;
  const vectors = points.map(({ lat, lon }) => {
    const latitude = lat * Math.PI / 180;
    const longitude = lon * Math.PI / 180;
    const cosLatitude = Math.cos(latitude);
    return {
      x: cosLatitude * Math.cos(longitude),
      y: cosLatitude * Math.sin(longitude),
      z: Math.sin(latitude)
    };
  });
  let minimumDotProduct = 1;
  for (let first = 0; first < vectors.length - 1; first += 1) {
    for (let second = first + 1; second < vectors.length; second += 1) {
      const dotProduct = vectors[first].x * vectors[second].x
        + vectors[first].y * vectors[second].y
        + vectors[first].z * vectors[second].z;
      if (dotProduct < minimumDotProduct) minimumDotProduct = dotProduct;
    }
  }
  return 6371 * Math.acos(Math.max(-1, Math.min(1, minimumDotProduct)));
}

export function selectSamplingPoints(candidates: Candidate[], targetElevationM: number, maxPoints = samplingConfig.maxPointsPerBand, slackM = samplingConfig.dispersionMismatchSlackM): SelectedCandidate[] {
  const ranked = candidates.map((candidate)=>({...candidate,elevationMismatchM:Math.abs(candidate.terrainElevationM-targetElevationM)})).sort((a,b)=>a.elevationMismatchM-b.elevationMismatchM || a.lat-b.lat || a.lon-b.lon);
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
