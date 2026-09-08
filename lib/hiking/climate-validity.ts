/** Staging-only aggregation. Deliberately not imported by the published pipeline. */
import policy from '@/data-config/methodology/observation-validity-v1.json';
import config from '@/data-config/methodology/climate-aggregation-v1.json';
import curves from '@/data-config/scoring/curves.json';
import { interpolate, overallScore, scoreExactComponents, type Curve, type ExactScoringMetrics } from '@/lib/scoring';
import { aggregateDailyClimate, type ClimateAggregationOptions, type DailyPointClimate, type HourlyClimateObservation } from './climate';
import { daylightForLocalDate, inHikingWindow, toLocalDateTime } from './daylight';

const average = (v: number[]) => v.length ? v.reduce((a,b)=>a+b,0)/v.length : null;
const populationStandardDeviation = (values:number[]) => {
  const mean=average(values);
  return mean===null?null:Math.sqrt(values.reduce((sum,value)=>sum+(value-mean)**2,0)/values.length);
};
export interface ValidDay extends DailyPointClimate {
  validity: { expectedHours: number; expectedHikingHours: number; validHoursByVariable: Record<string,number>; excludedDaysByReason: string[] };
}

export function expectedDayHours(date: string, timezone: string) {
  const midnight = Date.parse(`${date}T00:00:00.000Z`);
  const hours: Date[] = [];
  for(let h=-24;h<48;h++) {
    const instant = new Date(midnight+h*3600000);
    if(toLocalDateTime(instant,timezone).localDate===date) hours.push(instant);
  }
  return hours;
}

export function aggregateValidDays(records: HourlyClimateObservation[], options: ClimateAggregationOptions): ValidDay[] {
  const groups = new Map<string,HourlyClimateObservation[]>();
  for(const r of records) {
    const date=toLocalDateTime(new Date(r.utcInstant),options.timezone).localDate;
    const group=groups.get(date) ?? []; group.push(r); groups.set(date,group);
  }
  return aggregateDailyClimate(records,{...options,dailyCompletenessMinimum:1}).map(day=>{
    const solar=daylightForLocalDate(day.localDate,options.lat,options.lon,options.timezone);
    const hiking=(instant:Date)=>inHikingWindow(toLocalDateTime(instant,options.timezone).localMinutes,solar.sunriseLocalMinutes,solar.sunsetLocalMinutes,solar.polarState);
    const expected=expectedDayHours(day.localDate,options.timezone);
    const n=expected.filter(hiking).length;
    const source=groups.get(day.localDate)!;
    const counts:Record<string,number>={};
    for(const variable of config.requiredHourlyVariables) counts[variable]=source.filter(r=>r[variable as keyof HourlyClimateObservation]!==null).length;
    counts.temperatureHiking=day.adjustedTemperaturesHikingC.length;
    counts.humidityPairedHiking=day.relativeHumidityHikingPct.length;
    counts.windPairedHiking=day.windHikingKmh.length;
    const reasons:string[]=[];
    const good=(count:number,total:number,minimum:number,name:string)=>{
      const valid=total>0 && count/total>=minimum;
      if(!valid) reasons.push(name); return valid;
    };
    const tempMean=good(counts.temperatureHiking,n,policy.daily.meanAndQuantileMinimumCoverage,'temperature-mean-coverage');
    const tempEvent=good(counts.temperatureHiking,n,1,'temperature-event-coverage');
    const windMean=good(counts.windPairedHiking,n,policy.daily.meanAndQuantileMinimumCoverage,'wind-coverage');
    const humidity=good(counts.humidityPairedHiking,n,policy.daily.meanAndQuantileMinimumCoverage,'humidity-coverage');
    const snow=good(Math.min(counts.snowCover,counts.snowDepthM),expected.length,1,'snow-event-coverage');
    if(day.precipitationDailyMm===null) reasons.push('precipitation-sum-coverage');
    return {...day,
      adjustedTemperaturesHikingC:tempMean?day.adjustedTemperaturesHikingC:[],
      temperatureMeanHikingC:tempMean?day.temperatureMeanHikingC:null,
      temperatureMinHikingC:tempEvent?day.temperatureMinHikingC:null,
      temperatureMaxHikingC:tempEvent?day.temperatureMaxHikingC:null,
      hotDay:tempEvent?day.hotDay:null,severeHotDay:tempEvent?day.severeHotDay:null,
      relativeHumidityHikingPct:humidity?day.relativeHumidityHikingPct:[],
      windHikingKmh:windMean?day.windHikingKmh:[],
      windMeanHikingKmh:windMean?day.windMeanHikingKmh:null,
      windP90HikingKmh:windMean?day.windP90HikingKmh:null,
      highWindHourShare:windMean?day.highWindHourShare:null,severeWindHourShare:windMean?day.severeWindHourShare:null,
      snowDay:snow?day.snowDay:null,snowCoverDaily:snow?day.snowCoverDaily:null,snowDepthDailyM:snow?day.snowDepthDailyM:null,
      validity:{expectedHours:expected.length,expectedHikingHours:n,validHoursByVariable:counts,excludedDaysByReason:reasons}
    };
  });
}

type Weighted = {value:number;weight:number};
function quantile(values:Weighted[],p:number) {
  if(!values.length) return null;
  const sorted=[...values].sort((a,b)=>a.value-b.value);
  const target=p*sorted.reduce((s,x)=>s+x.weight,0); let sum=0;
  for(const x of sorted) {sum+=x.weight;if(sum>=target) return x.value;}
  return sorted.at(-1)!.value;
}

export function aggregateValidMonth(days: ValidDay[], month: number) {
  if(!Number.isInteger(month)||month<1||month>12) throw Error('Month must be 1..12');
  const identities=new Set<string>();
  for(const day of days) {
    if(identities.has(day.localDate)) throw Error('Duplicate local day');
    identities.add(day.localDate);
    if(day.timezone!==days[0].timezone || day.lat!==days[0].lat || day.lon!==days[0].lon) throw Error('Mixed point or timezone');
  }
  const yearly:Record<string,number[]>={};
  const yearlyMetrics:Record<number,Record<string,number|null>>={};
  const audit:Record<string,{expectedDays:number;validDaysByMetric:Record<string,number>}>={};
  const temperatureYears:Weighted[][]=[];
  for(let year=policy.normal.startYear;year<=policy.normal.endYear;year++) {
    yearlyMetrics[year]={};
    const prefix=`${year}-${String(month).padStart(2,'0')}-`;
    const selected=days.filter(d=>d.localDate.startsWith(prefix));
    const expected=new Date(Date.UTC(year,month,0)).getUTCDate();
    const validDaysByMetric:Record<string,number>={};
    const add=(key:string,filter:(d:ValidDay)=>boolean,calc:(ds:ValidDay[])=>number|null,minimum=policy.monthly.yearMonthMinimumValidDayFraction)=>{
      const valid=selected.filter(filter);validDaysByMetric[key]=valid.length;
      if(valid.length/expected>=minimum) {
        const value=calc(valid);
        yearlyMetrics[year][key]=value;
        if(value!==null) (yearly[key]??=[]).push(value);
        return valid;
      }
      yearlyMetrics[year][key]=null;
      return [];
    };
    const temp=add('temperatureHikingMeanC',d=>d.adjustedTemperaturesHikingC.length>0,ds=>average(ds.map(d=>d.temperatureMeanHikingC!)));
    if(temp.length) {
      const samples=temp.flatMap(d=>d.adjustedTemperaturesHikingC.map(value=>({value,weight:1/temp.length/d.adjustedTemperaturesHikingC.length})));
      temperatureYears.push(samples);
      yearlyMetrics[year].temperatureUtilityScore=samples.reduce((sum,sample)=>sum+interpolate(sample.value,curves.temperature as Curve)*sample.weight,0);
    } else yearlyMetrics[year].temperatureUtilityScore=null;
    add('relativeHumidityHikingMeanPct',d=>d.relativeHumidityHikingPct.length>0,ds=>average(ds.map(d=>average(d.relativeHumidityHikingPct)!)));
    add('windHikingMeanKmh',d=>d.windHikingKmh.length>0,ds=>average(ds.map(d=>d.windMeanHikingKmh!)));
    for(const [key,threshold] of [['highWindHourProbability',config.highWindThresholdKmh],['severeWindHourProbability',config.severeWindThresholdKmh]] as const)
      add(key,d=>d.windHikingKmh.length>0,ds=>{const v=ds.flatMap(d=>d.windHikingKmh);return v.filter(x=>x>=threshold).length/v.length;});
    for(const [key,field] of [['hotDayProbability','hotDay'],['severeHotDayProbability','severeHotDay'],['snowDayProbability','snowDay']] as const)
      add(key,d=>d[field]!==null,ds=>ds.filter(d=>d[field]).length/ds.length);
    for(const [key,threshold] of [['wetDayProbability',config.wetDayThresholdMm],['heavyRainDayProbability',config.heavyRainThresholdMm]] as const)
      add(key,d=>d.precipitationDailyMm!==null,ds=>ds.filter(d=>d.precipitationDailyMm!>=threshold).length/ds.length);
    add('precipitationMonthlyMeanMm',d=>d.precipitationDailyMm!==null,ds=>ds.reduce((s,d)=>s+d.precipitationDailyMm!,0),1);
    add('snowDepthMeanOnSnowDaysM',d=>d.snowDay!==null,ds=>average(ds.filter(d=>d.snowDay).map(d=>d.snowDepthDailyM!)));
    if(yearlyMetrics[year].snowDayProbability===0&&yearlyMetrics[year].snowDepthMeanOnSnowDaysM===null)
      yearlyMetrics[year].snowDepthMeanOnSnowDaysM=0;
    audit[year]={expectedDays:expected,validDaysByMetric};
  }
  const metricKeys=['temperatureHikingMeanC','relativeHumidityHikingMeanPct','windHikingMeanKmh','highWindHourProbability','severeWindHourProbability','hotDayProbability','severeHotDayProbability','snowDayProbability','wetDayProbability','heavyRainDayProbability','precipitationMonthlyMeanMm','snowDepthMeanOnSnowDaysM'];
  const validYearsByMetric=Object.fromEntries(metricKeys.map(k=>[k,(yearly[k]??[]).length]));
  const metrics:Record<string,number|null>=Object.fromEntries(metricKeys.map(k=>[k,validYearsByMetric[k]>=policy.monthly.minimumValidYears?average(yearly[k]):null]));
  // Conditional depth requires enough valid snow-event years, not 27 years containing snow.
  if(validYearsByMetric.snowDayProbability>=policy.monthly.minimumValidYears)
    metrics.snowDepthMeanOnSnowDaysM=average(yearly.snowDepthMeanOnSnowDaysM??[])??0;
  const samples=temperatureYears.length>=policy.monthly.minimumValidYears?temperatureYears.flat():[];
  metrics.temperatureHikingP10C=quantile(samples,.1);metrics.temperatureHikingP90C=quantile(samples,.9);
  metrics.temperatureUtilityScore=samples.length?samples.reduce((s,x)=>s+interpolate(x.value,curves.temperature as Curve)*x.weight,0)/temperatureYears.length:null;
  const daylight:number[]=[];
  if(days.length) for(let year=policy.normal.startYear;year<=policy.normal.endYear;year++) {
    const values:number[]=[];
    for(let date=1;date<=new Date(Date.UTC(year,month,0)).getUTCDate();date++)
      values.push(daylightForLocalDate(`${year}-${String(month).padStart(2,'0')}-${String(date).padStart(2,'0')}`,days[0].lat,days[0].lon,days[0].timezone).daylightHours);
    daylight.push(average(values)!);
  }
  metrics.daylightHoursMean=average(daylight);
  for(let year=policy.normal.startYear;year<=policy.normal.endYear;year++) yearlyMetrics[year].daylightHoursMean=daylight[year-policy.normal.startYear]??null;
  const expectedRawCells=Array.from({length:policy.normal.endYear-policy.normal.startYear+1},(_,yearIndex)=>{
    const year=policy.normal.startYear+yearIndex;
    return Array.from({length:new Date(Date.UTC(year,month,0)).getUTCDate()},(_,dayIndex)=>
      expectedDayHours(`${year}-${String(month).padStart(2,'0')}-${String(dayIndex+1).padStart(2,'0')}`,days[0]?.timezone??'UTC').length*config.requiredHourlyVariables.length
    ).reduce((sum,value)=>sum+value,0);
  }).reduce((sum,value)=>sum+value,0);
  const selectedMonthDays=days.filter(day=>Number(day.localDate.slice(5,7))===month);
  metrics.dataCompleteness=expectedRawCells?Math.min(1,selectedMonthDays.reduce((sum,day)=>sum+day.rawPresentCellCount,0)/expectedRawCells):null;
  metrics.sampleYearCount=new Set(selectedMonthDays.filter(day=>day.rawPresentCellCount>0).map(day=>Number(day.localDate.slice(0,4)))).size;
  const required=['temperatureUtilityScore','wetDayProbability','heavyRainDayProbability','snowDayProbability','snowDepthMeanOnSnowDaysM','windHikingMeanKmh','highWindHourProbability','hotDayProbability','severeHotDayProbability','daylightHoursMean'];
  const yearlyScores=Object.entries(yearlyMetrics).flatMap(([year,values])=>{
    if(!required.every(key=>Number.isFinite(values[key]))) return [];
    const exact=Object.fromEntries(required.map(key=>[key,values[key]])) as ExactScoringMetrics;
    return [{year:Number(year),score:overallScore(scoreExactComponents(exact))}];
  });
  const interannual={
    validInterannualYearCount:yearlyScores.length,
    scoreStandardDeviation:populationStandardDeviation(yearlyScores.map(item=>item.score)),
    yearlyScores
  };
  return {month,aggregationPolicyVersion:'observation-validity-v1',metrics,coverage:{validYearsByMetric,years:audit},
    interannual,scoringInputsAvailable:required.every(k=>metrics[k]!==null),missingScoringInputs:required.filter(k=>metrics[k]===null)};
}
