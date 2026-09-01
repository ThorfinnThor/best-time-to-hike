import test from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020";
import { readFileSync } from "node:fs";

const schema = JSON.parse(readFileSync("schemas/hourly-climate.schema.json", "utf8"));
const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
const snapshot = {
  schemaVersion: 2,
  datasetStatus: "fixture",
  source: "era5Land",
  destinationId: "test-place",
  samplePointId: "test-place-mid-1",
  timezone: "UTC",
  coordinates: {lat:0,lon:0},
  era5LandGridElevationM: 100,
  targetElevationM: 100,
  precipitationSemantics: "INCREMENTAL_PER_TIMESTEP_M",
  climateNormal: {startYear:1991,endYear:2020},
  observations: [{utcInstant:"1991-01-01T00:00:00.000Z",temperatureK:280,dewpointK:275,windUMs:1,windVMs:2,precipitationM:0,snowCover:0,snowDepthM:0}]
};

test("hourly snapshot contract accepts canonical records and rejects ambiguous units", () => {
  assert.equal(validate(snapshot), true);
  assert.equal(validate({...snapshot,precipitationSemantics:"UNKNOWN"}), false);
  assert.equal(validate({...snapshot,observations:[{...snapshot.observations[0],snowCover:1.1}]}), false);
});
