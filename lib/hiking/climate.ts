import { adjustTemperature, relativeHumidity, windKmh } from "@/lib/scoring";
import { daylightForLocalDate, expectedHourlyInstants, inHikingWindow, toLocalDateTime } from "@/lib/hiking/daylight";
import aggregationConfig from "@/data-config/methodology/climate-aggregation-v1.json";

export type PrecipitationSemantics = "INCREMENTAL_PER_TIMESTEP_M" | "ACCUMULATED_WITH_EXPLICIT_RESET_METADATA";

export interface HourlyClimateObservation {
  utcInstant: string;
  temperatureK: number | null;
  dewpointK: number | null;
  windUMs: number | null;
  windVMs: number | null;
  precipitationM: number | null;
  precipitationReset?: boolean;
  snowCover: number | null;
  snowDepthM: number | null;
}

export interface ClimateAggregationOptions {
  timezone: string;
  lat: number;
  lon: number;
  era5LandGridElevationM: number;
  targetElevationM: number;
  precipitationSemantics: PrecipitationSemantics;
  dailyCompletenessMinimum?: number;
}

export interface DailyPointClimate {
  localDate: string;
  timezone: string;
  lat: number;
  lon: number;
  observationCount: number;
  expectedObservationCount: number;
  rawPresentCellCount: number;
  rawExpectedCellCount: number;
  temperatureCorrectionC: number;
  temperatureCorrectionCapped: boolean;
  adjustedTemperaturesHikingC: number[];
  relativeHumidityHikingPct: number[];
  windHikingKmh: number[];
  temperatureMeanHikingC: number | null;
  temperatureMinHikingC: number | null;
  temperatureMaxHikingC: number | null;
  precipitationDailyMm: number | null;
  windMeanHikingKmh: number | null;
  windP90HikingKmh: number | null;
  highWindHourShare: number | null;
  severeWindHourShare: number | null;
  snowCoverDaily: number | null;
  snowDepthDailyM: number | null;
  snowDay: boolean | null;
  hotDay: boolean | null;
  severeHotDay: boolean | null;
  daylightHours: number;
}

export interface MonthlyPointClimate {
  month: number;
  temperatureHikingMeanC: number | null;
  temperatureHikingP10C: number | null;
  temperatureHikingP90C: number | null;
  temperatureUtilitySamplesC: number[];
  temperatureUtilityScore?: number;
  wetDayProbability: number | null;
  heavyRainDayProbability: number | null;
  precipitationMonthlyMeanMm: number | null;
  snowDayProbability: number | null;
  snowDepthMeanOnSnowDaysM: number | null;
  windHikingMeanKmh: number | null;
  highWindHourProbability: number | null;
  severeWindHourProbability: number | null;
  hotDayProbability: number | null;
  severeHotDayProbability: number | null;
  daylightHoursMean: number;
  relativeHumidityHikingMeanPct: number | null;
  sampleYearCount: number;
  dataCompleteness: number;
}

const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : null;

export function nearestRank(values: number[], percentile: number): number | null {
  if (!values.length) return null;
  if (!(percentile > 0 && percentile <= 1)) throw new Error("Percentile must be in (0, 1]");
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(percentile * sorted.length) - 1];
}

function assertPhysicalObservation(record: HourlyClimateObservation) {
  const instant = new Date(record.utcInstant);
  if (!Number.isFinite(instant.getTime()) || instant.toISOString() !== record.utcInstant || !/T\d{2}:00:00\.000Z$/.test(record.utcInstant)) throw new Error(`TIME001 invalid canonical hourly UTC instant: ${record.utcInstant}`);
  const values=[record.temperatureK,record.dewpointK,record.windUMs,record.windVMs,record.precipitationM,record.snowCover,record.snowDepthM];
  if(!values.every((value)=>value===null||Number.isFinite(value)))throw new Error(`SRC002 non-finite hourly value at ${record.utcInstant}`);
  if((record.temperatureK!==null&&record.temperatureK<=0)||(record.dewpointK!==null&&record.dewpointK<=0))throw new Error(`SRC002 temperature/dewpoint is not Kelvin at ${record.utcInstant}`);
  if (record.precipitationM !== null && record.precipitationM < 0) throw new Error(`PREC001 negative precipitation at ${record.utcInstant}`);
  if (record.snowCover !== null && (record.snowCover < 0 || record.snowCover > 1)) throw new Error(`SNOW001 snow cover outside 0..1 at ${record.utcInstant}`);
  if (record.snowDepthM !== null && record.snowDepthM < 0) throw new Error(`SNOW001 negative snow depth at ${record.utcInstant}`);
}

export function precipitationIncrements(records: HourlyClimateObservation[], semantics: PrecipitationSemantics, tolerance = 1e-10) {
  if(semantics!=="INCREMENTAL_PER_TIMESTEP_M"&&semantics!=="ACCUMULATED_WITH_EXPLICIT_RESET_METADATA")throw new Error(`SRC001 unsupported precipitation semantics: ${semantics}`);
  const ordered = [...records];
  for(let index=1;index<ordered.length;index+=1)if(ordered[index].utcInstant<=ordered[index-1].utcInstant)throw new Error(`TIME002 non-monotonic UTC coordinate at ${ordered[index].utcInstant}`);
  let previousAccumulation: number | null = null;
  return new Map(ordered.map((record): [string, number | null] => {
    assertPhysicalObservation(record);
    const current = record.precipitationM;
    if (semantics === "INCREMENTAL_PER_TIMESTEP_M") return [record.utcInstant, current];
    if (current === null) {
      previousAccumulation = null;
      return [record.utcInstant, null];
    }
    if (record.precipitationReset) {
      previousAccumulation = current;
      return [record.utcInstant, current];
    }
    if (previousAccumulation === null) {
      previousAccumulation = current;
      return [record.utcInstant, null];
    }
    const increment = current - previousAccumulation;
    previousAccumulation = current;
    if (increment < -tolerance) throw new Error(`PREC001 accumulated precipitation decreased without reset at ${record.utcInstant}`);
    return [record.utcInstant, increment < 0 ? 0 : increment];
  }));
}

function groupByLocalDate(records: HourlyClimateObservation[], timezone: string) {
  const groups = new Map<string, HourlyClimateObservation[]>();
  const identities = new Set<string>();
  for (const record of records) {
    assertPhysicalObservation(record);
    if (identities.has(record.utcInstant)) throw new Error(`TIME001 duplicate UTC identity: ${record.utcInstant}`);
    identities.add(record.utcInstant);
    const { localDate } = toLocalDateTime(new Date(record.utcInstant), timezone);
    groups.set(localDate, [...(groups.get(localDate) ?? []), record]);
  }
  return groups;
}

function snowState(cover: number | null, depth: number | null): boolean | null {
  if ((cover !== null && cover >= aggregationConfig.snowCoverThreshold) || (depth !== null && depth >= aggregationConfig.snowDepthThresholdM)) return true;
  // A false OR result is only knowable when both operands are present.
  if (cover === null || depth === null) return null;
  return false;
}

export function aggregateDailyClimate(records: HourlyClimateObservation[], options: ClimateAggregationOptions): DailyPointClimate[] {
  const completenessMinimum = options.dailyCompletenessMinimum ?? aggregationConfig.dailyCompletenessMinimum;
  if (completenessMinimum < 0 || completenessMinimum > 1) throw new Error("Daily completeness minimum must be in 0..1");
  const increments = precipitationIncrements(records, options.precipitationSemantics);
  const groups = groupByLocalDate(records, options.timezone);
  return [...groups.entries()].map(([localDate, dayRecords]) => {
    const solar = daylightForLocalDate(localDate, options.lat, options.lon, options.timezone);
    const expectedObservationCount = expectedHourlyInstants(localDate, options.timezone);
    const adjustedTemperaturesHikingC: number[] = [];
    const relativeHumidityHikingPct: number[] = [];
    const windHikingValues: number[] = [];
    const precipitationValues: number[] = [];
    const covers: number[] = [];
    const depths: number[] = [];
    let rawPresentCellCount = 0;
    const temperatureAdjustment=adjustTemperature(0,options.era5LandGridElevationM,options.targetElevationM);

    for (const record of dayRecords) {
      rawPresentCellCount += [record.temperatureK, record.dewpointK, record.windUMs, record.windVMs, record.precipitationM, record.snowCover, record.snowDepthM].filter((value) => value !== null).length;
      const increment = increments.get(record.utcInstant);
      if (increment !== null && increment !== undefined) precipitationValues.push(increment);
      if (record.snowCover !== null) covers.push(record.snowCover);
      if (record.snowDepthM !== null) depths.push(record.snowDepthM);
      const local = toLocalDateTime(new Date(record.utcInstant), options.timezone);
      if (!inHikingWindow(local.localMinutes, solar.sunriseLocalMinutes, solar.sunsetLocalMinutes)) continue;
      if (record.temperatureK !== null) adjustedTemperaturesHikingC.push(record.temperatureK - 273.15 + temperatureAdjustment.correctionC);
      if (record.temperatureK !== null && record.dewpointK !== null) relativeHumidityHikingPct.push(relativeHumidity(record.temperatureK - 273.15, record.dewpointK - 273.15));
      if (record.windUMs !== null && record.windVMs !== null) windHikingValues.push(windKmh(record.windUMs, record.windVMs));
    }

    const precipitationCompleteness = precipitationValues.length / expectedObservationCount;
    const precipitationDailyMm = precipitationCompleteness >= completenessMinimum ? precipitationValues.reduce((sum, value) => sum + value, 0) * 1000 : null;
    const snowCoverDaily = covers.length ? Math.max(...covers) : null;
    const snowDepthDailyM = depths.length ? Math.max(...depths) : null;
    const temperatureMaxHikingC = adjustedTemperaturesHikingC.length ? Math.max(...adjustedTemperaturesHikingC) : null;
    return {
      localDate,
      timezone: options.timezone,
      lat: options.lat,
      lon: options.lon,
      observationCount: dayRecords.length,
      expectedObservationCount,
      rawPresentCellCount,
      rawExpectedCellCount: expectedObservationCount * aggregationConfig.requiredHourlyVariables.length,
      temperatureCorrectionC: temperatureAdjustment.correctionC,
      temperatureCorrectionCapped: temperatureAdjustment.capped,
      adjustedTemperaturesHikingC,
      relativeHumidityHikingPct,
      windHikingKmh: windHikingValues,
      temperatureMeanHikingC: mean(adjustedTemperaturesHikingC),
      temperatureMinHikingC: adjustedTemperaturesHikingC.length ? Math.min(...adjustedTemperaturesHikingC) : null,
      temperatureMaxHikingC,
      precipitationDailyMm,
      windMeanHikingKmh: mean(windHikingValues),
      windP90HikingKmh: nearestRank(windHikingValues, 0.9),
      highWindHourShare: ratio(windHikingValues.filter((value) => value >= aggregationConfig.highWindThresholdKmh).length, windHikingValues.length),
      severeWindHourShare: ratio(windHikingValues.filter((value) => value >= aggregationConfig.severeWindThresholdKmh).length, windHikingValues.length),
      snowCoverDaily,
      snowDepthDailyM,
      snowDay: snowState(snowCoverDaily, snowDepthDailyM),
      hotDay: temperatureMaxHikingC === null ? null : temperatureMaxHikingC >= aggregationConfig.hotThresholdC,
      severeHotDay: temperatureMaxHikingC === null ? null : temperatureMaxHikingC >= aggregationConfig.severeHotThresholdC,
      daylightHours: solar.daylightHours
    };
  });
}

function datesInMonth(year: number, month: number) {
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: count }, (_, index) => `${year}-${month.toString().padStart(2, "0")}-${(index + 1).toString().padStart(2, "0")}`);
}

export interface MonthlyAggregationOptions {
  timezone: string;
  lat: number;
  lon: number;
  startYear?: number;
  endYear?: number;
  yearMonthCompletenessMinimum?: number;
}

export function aggregateMonthlyClimate(daily: DailyPointClimate[], month: number, options: MonthlyAggregationOptions): MonthlyPointClimate {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error("Month must be 1..12");
  const startYear = options.startYear ?? aggregationConfig.normal.startYear;
  const endYear = options.endYear ?? aggregationConfig.normal.endYear;
  const completenessMinimum = options.yearMonthCompletenessMinimum ?? aggregationConfig.yearMonthCompletenessMinimum;
  if (endYear < startYear) throw new Error("Climate normal end year precedes start year");
  const selected = daily.filter((value) => Number(value.localDate.slice(5, 7)) === month && Number(value.localDate.slice(0, 4)) >= startYear && Number(value.localDate.slice(0, 4)) <= endYear);
  const temperatures = selected.flatMap((value) => value.adjustedTemperaturesHikingC);
  const humidity = selected.flatMap((value) => value.relativeHumidityHikingPct);
  const winds = selected.flatMap((value) => value.windHikingKmh);
  const precipDays = selected.filter((value) => value.precipitationDailyMm !== null);
  const snowDays = selected.filter((value) => value.snowDay !== null);
  const tempDays = selected.filter((value) => value.temperatureMaxHikingC !== null);
  const yearlyTotals: number[] = [];
  const contributingYears = new Set<number>();
  let expectedRawCells = 0;
  const daylightValues: number[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    const expectedDates = datesInMonth(year, month);
    const yearDays = selected.filter((value) => Number(value.localDate.slice(0, 4)) === year);
    const validPrecipitation = yearDays.filter((value) => value.precipitationDailyMm !== null);
    if (validPrecipitation.length / expectedDates.length >= completenessMinimum) yearlyTotals.push(validPrecipitation.reduce((sum, value) => sum + value.precipitationDailyMm!, 0));
    if (yearDays.some((value) => value.adjustedTemperaturesHikingC.length || value.precipitationDailyMm !== null || value.snowDay !== null || value.windHikingKmh.length)) contributingYears.add(year);
    for (const localDate of expectedDates) {
      expectedRawCells += expectedHourlyInstants(localDate, options.timezone) * aggregationConfig.requiredHourlyVariables.length;
      daylightValues.push(daylightForLocalDate(localDate, options.lat, options.lon, options.timezone).daylightHours);
    }
  }
  const rawPresentCells = selected.reduce((sum, value) => sum + value.rawPresentCellCount, 0);
  const wetDays = precipDays.filter((value) => value.precipitationDailyMm! >= aggregationConfig.wetDayThresholdMm).length;
  const heavyDays = precipDays.filter((value) => value.precipitationDailyMm! >= aggregationConfig.heavyRainThresholdMm).length;
  const actualSnowDays = snowDays.filter((value) => value.snowDay).length;
  const snowDepths = snowDays.filter((value) => value.snowDay && value.snowDepthDailyM !== null).map((value) => value.snowDepthDailyM!);
  return {
    month,
    temperatureHikingMeanC: mean(temperatures),
    temperatureHikingP10C: nearestRank(temperatures, 0.1),
    temperatureHikingP90C: nearestRank(temperatures, 0.9),
    temperatureUtilitySamplesC: temperatures,
    wetDayProbability: ratio(wetDays, precipDays.length),
    heavyRainDayProbability: ratio(heavyDays, precipDays.length),
    precipitationMonthlyMeanMm: mean(yearlyTotals),
    snowDayProbability: ratio(actualSnowDays, snowDays.length),
    snowDepthMeanOnSnowDaysM: actualSnowDays === 0 && snowDays.length ? 0 : mean(snowDepths),
    windHikingMeanKmh: mean(winds),
    highWindHourProbability: ratio(winds.filter((value) => value >= aggregationConfig.highWindThresholdKmh).length, winds.length),
    severeWindHourProbability: ratio(winds.filter((value) => value >= aggregationConfig.severeWindThresholdKmh).length, winds.length),
    hotDayProbability: ratio(tempDays.filter((value) => value.hotDay).length, tempDays.length),
    severeHotDayProbability: ratio(tempDays.filter((value) => value.severeHotDay).length, tempDays.length),
    daylightHoursMean: mean(daylightValues)!,
    relativeHumidityHikingMeanPct: mean(humidity),
    sampleYearCount: contributingYears.size,
    dataCompleteness: Math.min(1, rawPresentCells / expectedRawCells)
  };
}

export function aggregatePointClimate(records: HourlyClimateObservation[], options: ClimateAggregationOptions & Omit<MonthlyAggregationOptions, "timezone" | "lat" | "lon">) {
  const daily = aggregateDailyClimate(records, options);
  const monthly = Array.from({ length: 12 }, (_, index) => aggregateMonthlyClimate(daily, index + 1, options));
  const warnings=daily.some((day)=>day.temperatureCorrectionCapped)?[{code:"TEMP_LAPSE_CORRECTION_CAPPED",detail:`Automatic correction capped at ${Math.abs(daily[0].temperatureCorrectionC)}C`}]:[];
  return { daily, monthly, warnings };
}
