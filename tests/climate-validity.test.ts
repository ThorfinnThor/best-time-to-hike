import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateValidDays, aggregateValidMonth, expectedDayHours, type ValidDay } from '../lib/hiking/climate-validity';
import type { HourlyClimateObservation } from '../lib/hiking/climate';
const options={timezone:'UTC',lat:45,lon:0,era5LandGridElevationM:0,targetElevationM:0,precipitationSemantics:'INCREMENTAL_PER_TIMESTEP_M' as const};
const record=(hour:number):HourlyClimateObservation=>({utcInstant:`2020-06-15T${String(hour).padStart(2,'0')}:00:00.000Z`,temperatureK:293.15,dewpointK:283.15,windUMs:1,windVMs:0,precipitationM:.001,snowCover:0,snowDepthM:0});
const full=()=>Array.from({length:24},(_,h)=>record(h));
test('staging: a single hour cannot establish daily absence of snow or heat',()=>{
  const d=aggregateValidDays([record(12)],options)[0];
  assert.equal(d.snowDay,null);assert.equal(d.hotDay,null);assert.equal(d.temperatureMeanHikingC,null);assert.equal(d.precipitationDailyMm,null);
});
test('staging: 90% supports mean but not extremes; 80% supports neither',()=>{
  const records=full();records[12].temperatureK=null;
  let d=aggregateValidDays(records,options)[0];
  assert.equal(d.validity.expectedHikingHours,10);assert.equal(d.temperatureMeanHikingC,20);assert.equal(d.hotDay,null);assert.equal(d.temperatureMinHikingC,null);
  records[13].temperatureK=null;d=aggregateValidDays(records,options)[0];assert.equal(d.temperatureMeanHikingC,null);
});
test('staging: incomplete positive snow and heat observations stay unknown',()=>{
  const records=full();records[12].temperatureK=310;records[13].temperatureK=null;records[0].snowCover=1;records[1].snowDepthM=null;
  const d=aggregateValidDays(records,options)[0];assert.equal(d.hotDay,null);assert.equal(d.snowDay,null);
});
test('staging: wind and humidity require simultaneous pairs',()=>{
  const records=full();records[12].windUMs=null;records[13].windVMs=null;records[12].dewpointK=null;records[13].temperatureK=null;
  const d=aggregateValidDays(records,options)[0];assert.equal(d.windMeanHikingKmh,null);assert.deepEqual(d.relativeHumidityHikingPct,[]);
});
test('staging: missing precipitation hour prevents a daily total',()=>{
  const records=full();records[0].precipitationM=null;
  assert.equal(aggregateValidDays(records,options)[0].precipitationDailyMm,null);
});
test('staging: expected local hours include DST and fractional offsets',()=>{
  assert.equal(expectedDayHours('2020-03-29','Europe/Berlin').length,23);
  assert.equal(expectedDayHours('2020-10-25','Europe/Berlin').length,25);
  assert.equal(expectedDayHours('2020-06-15','Asia/Kathmandu').length,24);
});
const template=aggregateValidDays(full(),options)[0];
function years(count:number):ValidDay[]{return Array.from({length:count},(_,y)=>Array.from({length:30},(_,d)=>({...template,localDate:`${1991+y}-06-${String(d+1).padStart(2,'0')}`}))).flat();}
test('staging: 26 years are insufficient, 27 complete years are sufficient',()=>{
  assert.equal(aggregateValidMonth(years(26),6).metrics.temperatureHikingMeanC,null);
  const result=aggregateValidMonth(years(27),6);assert.equal(result.metrics.temperatureHikingMeanC,20);assert.equal(result.scoringInputsAvailable,true);assert.equal(result.metrics.snowDepthMeanOnSnowDaysM,0);
});
test('staging: one missing rainfall day invalidates that year total but not event frequency',()=>{
  const days=years(27);days[0]={...days[0],precipitationDailyMm:null};
  const r=aggregateValidMonth(days,6);assert.equal(r.metrics.precipitationMonthlyMeanMm,null);assert.equal(r.metrics.wetDayProbability,1);
  assert.equal(r.coverage.validYearsByMetric.precipitationMonthlyMeanMm,26);
});
test('staging: equal year weight and 90% monthly day boundary',()=>{
  const days=years(27);for(let i=0;i<30;i++) days[i]={...days[i],temperatureMeanHikingC:10,adjustedTemperaturesHikingC:[10]};
  days.splice(0,3);let r=aggregateValidMonth(days,6);assert.ok(Math.abs(r.metrics.temperatureHikingMeanC!-(10+26*20)/27)<1e-10);
  days.splice(0,1);r=aggregateValidMonth(days,6);assert.equal(r.metrics.temperatureHikingMeanC,null);
});
test('staging: duplicate dates are rejected',()=>assert.throws(()=>aggregateValidMonth([template,template],6),/Duplicate/));
test('staging: empty hiking window cannot manufacture weather statistics',()=>{
  const d=aggregateValidDays(full(),{...options,lat:0,lon:180})[0];
  assert.equal(d.validity.expectedHikingHours,0);assert.equal(d.temperatureMeanHikingC,null);assert.equal(d.hotDay,null);assert.equal(d.windMeanHikingKmh,null);
});
test('staging: monthly empty input remains unknown and cannot score',()=>{
  const r=aggregateValidMonth([],6);assert.equal(r.scoringInputsAvailable,false);assert.equal(r.metrics.daylightHoursMean,null);
});
test('staging: incomplete boundary day retains a full calendar denominator',()=>{
  const d=aggregateValidDays(full().slice(1),options)[0];
  assert.equal(d.validity.expectedHours,24);assert.equal(d.observationCount,23);assert.equal(d.snowDay,null);
});
