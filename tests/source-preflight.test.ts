import test from "node:test";
import assert from "node:assert/strict";
import { requireApprovedSource } from "../scripts/import/source-preflight";

test("current ERA5-Land source is approved while future DEM ingest remains blocked", () => {
  assert.doesNotThrow(() => requireApprovedSource("era5Land"));
  assert.throws(() => requireApprovedSource("copernicusDem"), /BLOCKED_SOURCE_SEMANTICS/);
});
