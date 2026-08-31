import test from "node:test";
import assert from "node:assert/strict";
import { requireApprovedSource } from "../scripts/import/source-preflight";

test("real source ingest remains blocked until an operator approves semantics", () => {
  assert.throws(() => requireApprovedSource("era5Land"), /BLOCKED_SOURCE_SEMANTICS/);
  assert.throws(() => requireApprovedSource("copernicusDem"), /BLOCKED_SOURCE_SEMANTICS/);
});
