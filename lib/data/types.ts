export type Locale = "en" | "de";
export type ConfidenceLevel = "high" | "moderate" | "low";
export type ScoreLevel = "excellent" | "very-good" | "good" | "fair" | "poor";
export type DatasetStatus = "fixture" | "provisional" | "production";

export interface ElevationBandConfig {
  id: string;
  minM: number;
  maxM: number;
  weight: number;
}

export interface DestinationConfig {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  countryName: string;
  continent: string;
  region: string;
  timezone: string;
  active: boolean;
  priority: number;
  affiliateQuery: string;
  tags: string[];
  coordinates: { lat: number; lon: number };
  elevationBands: ElevationBandConfig[];
}

export interface ClimateMetrics {
  temperatureHikingMeanC: number;
  temperatureHikingP10C: number;
  temperatureHikingP90C: number;
  temperatureUtilitySamplesC: number[];
  /** Exact mean utility score from all valid hiking-window hours when available. */
  temperatureUtilityScore?: number;
  wetDayProbability: number;
  heavyRainDayProbability: number;
  precipitationMonthlyMeanMm: number;
  snowDayProbability: number;
  snowDepthMeanOnSnowDaysM: number;
  windHikingMeanKmh: number;
  highWindHourProbability: number;
  severeWindHourProbability: number;
  hotDayProbability: number;
  severeHotDayProbability: number;
  daylightHoursMean: number;
  relativeHumidityHikingMeanPct: number;
  sampleYearCount: number;
  dataCompleteness: number;
}

export interface BandClimateMonth extends ClimateMetrics {
  month: number;
  bandId: string;
  targetElevationM: number;
  meanElevationMismatchM: number;
  samplePointCount: number;
  samplePointMaxSeparationKm: number;
  polygonEquivalentDiameterKm: number;
  terrainReliefM: number;
  interannualScoreSd: number;
  validInterannualYearCount: number;
}

export interface ComponentScores {
  temperature: number;
  precipitation: number;
  snow: number;
  heatStress: number;
  wind: number;
  daylight: number;
}

export interface PublicBandMonth extends BandClimateMonth {
  components: ComponentScores;
  overallScore: number;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
}

export interface PublicMonth {
  month: number;
  overallScore: number;
  scoreLevel: ScoreLevel;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  components: ComponentScores;
  metrics: ClimateMetrics;
  bands: PublicBandMonth[];
  reasons: string[];
  caveats: string[];
}

export interface PublicDestination {
  schemaVersion: 1;
  algorithmVersion: string;
  datasetStatus: DatasetStatus;
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  countryName: string;
  continent: string;
  region: string;
  timezone: string;
  tags: string[];
  coordinates: { lat: number; lon: number };
  elevationBands: ElevationBandConfig[];
  elevation: { minM: number; medianM: number; maxM: number };
  months: PublicMonth[];
  bestMonths: number[];
  alternatives: string[];
  provenance: Record<string, string>;
  updatedAt: string;
}

export interface SearchDestination {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  continent: string;
  region: string;
  tags: string[];
  monthly: Array<{m: number; score: number; temp: number; wet: number; snow: number; hot: number; wind: number; daylight: number; confidence: number}>;
}

export interface RankingEntry {
  rank: number;
  slug: string;
  name: string;
  countryCode: string;
  score: number;
  confidence: number;
  tempC: number;
  wet: number;
  snow: number;
}

export interface Ranking {
  schemaVersion: 1;
  id: string;
  month: number;
  region: string;
  theme: "all" | "warm" | "snow-free" | "low-rain";
  indexable: boolean;
  entries: RankingEntry[];
}

export interface Comparison {
  schemaVersion: 1;
  slug: string;
  destinations: [string, string];
  indexable: boolean;
  months: Array<{month: number; firstScore: number; secondScore: number; winner: string | "tie"}>;
}
