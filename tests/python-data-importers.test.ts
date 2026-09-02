import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

function pythonExecutable() {
  if (process.env.BTH_DATA_PYTHON) return process.env.BTH_DATA_PYTHON;
  const local = "generated/intermediate/data-venv/bin/python3";
  return existsSync(local) ? local : "python3";
}

test("ERA5-Land Python importer tests pass", () => {
  const result = spawnSync(pythonExecutable(), ["-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py"], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
