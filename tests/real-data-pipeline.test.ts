import assert from "node:assert/strict";
import { test } from "node:test";
import { aggregateBandPointMetrics } from "../lib/hiking/band-climate";
import type { MonthlyPointClimate } from "../lib/hiking/climate";
import { ElevationHistogram, geometryContains, geometryContainsForRasterRow, geometryDistanceKm, tileIdForCoordinate, type DemGeometry } from "../scripts/import/copernicus-dem";
import { readFileSync } from "node:fs";
import orography from "../data-config/methodology/era5-land-orography-v1.json";

const pointMonth = (temperature: number, wet: number): MonthlyPointClimate => ({
  month: 7,
  temperatureHikingMeanC: temperature,
  temperatureHikingP10C: temperature - 2,
  temperatureHikingP90C: temperature + 2,
  temperatureUtilitySamplesC: [temperature - 2, temperature, temperature + 2],
  temperatureUtilityScore: temperature === 10 ? 90 : 70,
  wetDayProbability: wet,
  heavyRainDayProbability: wet / 2,
  precipitationMonthlyMeanMm: wet * 100,
  snowDayProbability: 0,
  snowDepthMeanOnSnowDaysM: 0,
  windHikingMeanKmh: 10,
  highWindHourProbability: 0.1,
  severeWindHourProbability: 0.01,
  hotDayProbability: 0.2,
  severeHotDayProbability: 0.05,
  daylightHoursMean: 14,
  relativeHumidityHikingMeanPct: 60,
  sampleYearCount: 30,
  dataCompleteness: 0.99
});

test("Copernicus tile identifiers use the south-west 1-degree cell", () => {
  assert.equal(tileIdForCoordinate(32.75, -17.01), "Copernicus_DSM_COG_10_N32_00_W018_00_DEM");
  assert.equal(tileIdForCoordinate(46.7, 12.0), "Copernicus_DSM_COG_10_N46_00_E012_00_DEM");
});

test("geometry containment respects holes and distance is zero inside", () => {
  const geometry: DemGeometry = {type:"Polygon",coordinates:[[[0,0],[2,0],[2,2],[0,2],[0,0]],[[.5,.5],[1.5,.5],[1.5,1.5],[.5,1.5],[.5,.5]]]};
  assert.equal(geometryContains(geometry, [.25,.25]), true);
  assert.equal(geometryContains(geometry, [1,1]), false);
  assert.equal(geometryDistanceKm(geometry, [.25,.25]), 0);
  assert.ok(geometryDistanceKm(geometry, [3,1]) > 100);
});

test("raster-row containment matches polygon containment away from boundaries", () => {
  const geometry: DemGeometry = {
    type: "MultiPolygon",
    coordinates: [
      [[[0, 0], [5, 0], [5, 5], [0, 5], [0, 0]], [[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]],
      [[[7, 1], [9, 1], [9, 4], [7, 4], [7, 1]]]
    ]
  };
  for (const latitude of [0.5, 1.5, 2.5, 3.5, 4.5]) {
    const rowContains = geometryContainsForRasterRow(geometry, latitude);
    for (const longitude of [-0.5, 0.5, 2.5, 4.5, 6, 7.5, 8.5, 9.5]) {
      assert.equal(rowContains(longitude), geometryContains(geometry, [longitude, latitude]));
    }
  }
});

test("active geometry carries explicit pending provenance and scope", () => {
  const collection = JSON.parse(readFileSync("data-config/geography/destination-areas.geojson", "utf8")) as {features:Array<{properties:any}>};
  assert.equal(collection.features.length, 5);
  for (const feature of collection.features) {
    assert.equal(feature.properties.provenance.status, "pending-review");
    assert.equal(feature.properties.provenance.sourceType, "project-curated-draft");
    assert.ok(feature.properties.provenance.sourceLabel.length > 0);
    assert.ok(feature.properties.provenance.excludedClasses.includes("open-water"));
    assert.ok(feature.properties.provenance.bandRationale.includes("pending"));
    assert.ok(feature.properties.provenance.weightRationale.includes("pending"));
  }
});

test("DEM histogram produces deterministic nearest-rank statistics", () => {
  const histogram = new ElevationHistogram();
  [0.04, 100.04, 200.04, 300.04].forEach((value) => histogram.add(value));
  assert.equal(histogram.quantile(0.25), 0);
  assert.equal(histogram.quantile(0.5), 100);
  assert.equal(histogram.quantile(1), 300);
  assert.equal(histogram.countBetween(100, 200), 2);
});

test("band metrics use point weights and preserve exact utility score", () => {
  const result = aggregateBandPointMetrics([
    {sampleWeight:.25,metrics:pointMonth(10,.2)},
    {sampleWeight:.75,metrics:pointMonth(20,.4)}
  ]);
  assert.equal(result.temperatureHikingMeanC, 17.5);
  assert.ok(Math.abs(result.wetDayProbability - .35) < 1e-12);
  assert.equal(result.temperatureUtilityScore, 75);
  assert.equal(result.temperatureUtilitySamplesC.length, 101);
});

test("band aggregation rejects incomplete point weights", () => {
  assert.throws(() => aggregateBandPointMetrics([{sampleWeight:.9,metrics:pointMonth(10,.2)}]), /sum to one/);
});

test("lapse correction is wired to pinned ERA5-Land orography, not GLO-30 terrain", () => {
  assert.equal(orography.parameter.shortName, "z");
  assert.equal(orography.parameter.unit, "m**2 s**-2");
  assert.equal(orography.conversion.standardGravityMS2, 9.80665);
  assert.match(orography.downloadSha256, /^[a-f0-9]{64}$/);
  const climateImporter = readFileSync("scripts/import/fetch-era5.ts", "utf8");
  const sampler = readFileSync("scripts/geo/build-sampling.ts", "utf8");
  assert.match(climateImporter, /era5LandGridElevationM: pointOrography\.era5LandGridElevationM/);
  assert.doesNotMatch(climateImporter, /gridElevationM: consumer\.gridElevationM/);
  assert.match(sampler, /terrainElevationM: point\.terrainElevationM/);
});
