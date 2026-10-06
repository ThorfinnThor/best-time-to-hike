import test from "node:test";
import assert from "node:assert/strict";
import { requireApprovedSource } from "../scripts/import/source-preflight";

test("ERA5-Land ingest accepts the signed source-semantics approval", () => {
  assert.doesNotThrow(() => requireApprovedSource("era5Land"));
});

test("unused Copernicus DEM ingest remains blocked without a source-semantics approval", () => {
  assert.throws(() => requireApprovedSource("copernicusDem"), /BLOCKED_SOURCE_SEMANTICS/);
});
