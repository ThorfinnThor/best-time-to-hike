import test from "node:test";
import assert from "node:assert/strict";
import { releaseSourcesApproved, requiredReleaseSources } from "../scripts/lib/release-source-approvals";

const approvals = {
  era5Land: {approved:true, approvedAt:"2026-09-09T00:00:00.000Z", approvedBy:"Reviewer"},
  copernicusDem: {approved:false, approvedAt:null, approvedBy:null},
};

test("current one-cell release requires only the sources it actually publishes", () => {
  const inventory = {
    climateSources:["era5-land-timeseries"],
    elevationSources:["era5-land-invariant-geopotential"],
    samplingSources:["ERA5-Land auxiliary invariant geopotential"],
  };
  assert.deepEqual(requiredReleaseSources(inventory), {requiredSources:["era5Land"], unknownIdentifiers:[]});
  assert.equal(releaseSourcesApproved(inventory, approvals).passed, true);
});

test("a future DEM-backed release cannot bypass DEM approval", () => {
  const inventory = {
    climateSources:["era5-land-timeseries"],
    elevationSources:["copernicus-dem-glo-30"],
    samplingSources:["COP-DEM_GLO-30-DGED"],
  };
  const result = releaseSourcesApproved(inventory, approvals);
  assert.deepEqual(result.requiredSources, ["copernicusDem", "era5Land"]);
  assert.equal(result.passed, false);
});

test("unknown snapshot sources fail closed", () => {
  const inventory = {climateSources:["mystery-source"], elevationSources:[], samplingSources:[]};
  const result = releaseSourcesApproved(inventory, approvals);
  assert.deepEqual(result.unknownIdentifiers, ["mystery-source"]);
  assert.equal(result.passed, false);
});
