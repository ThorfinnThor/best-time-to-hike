import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import replacements from "../data-config/sources/representative-cell-replacements-v1.json";

test("scoped review rejects empty, unknown and rejected candidates before reading climate", () => {
  for (const scope of ["", "unknown-destination", "zermatt", "garhwal", "denali,unknown-destination"]) {
    const result = spawnSync(process.execPath, ["--import", "tsx",
      "scripts/validate/review-representative-cell-replacements.ts", `--only=${scope}`],
    { encoding: "utf8" });
    assert.equal(result.status, 1, scope);
    assert.match(result.stderr, /CELL_REPLACEMENT_REVIEW001 --only must name active candidates/, scope);
    assert.doesNotMatch(result.stderr, /ENOENT/, "must fail at scope validation, not missing evidence");
  }
});

test("replacement cells remain an evidence-only scientific staging set", () => {
  assert.equal(replacements.schemaVersion, 1);
  assert.equal(replacements.status, "science-staging");
  assert.equal(replacements.approval, false);
  assert.deepEqual(Object.keys(replacements.replacements).sort(), ["annapurna", "denali", "el-chalten", "garhwal", "zermatt"]);
  assert.equal(replacements.replacements.zermatt.stagingDisposition, "rejected");
  assert.match(replacements.replacements.zermatt.rejectionReason, /10 m glacier-indicator/);
  assert.deepEqual(
    Object.entries(replacements.replacements).filter(([, candidate]) => candidate.stagingDisposition === "candidate").map(([id]) => id).sort(),
    ["annapurna", "denali"],
  );
  assert.deepEqual(replacements.controls.destinations, ["hunza"]);
  const cells = new Set<string>();
  for (const [id, candidate] of Object.entries(replacements.replacements)) {
    assert.ok(Number.isFinite(candidate.lat) && candidate.lat >= -90 && candidate.lat <= 90, id);
    assert.ok(Number.isFinite(candidate.lon) && candidate.lon >= -180 && candidate.lon <= 180, id);
    assert.ok(candidate.label.length > 10 && candidate.reason.includes("required before approval"), id);
    assert.ok(candidate.evidence.length > 0, id);
    for (const source of candidate.evidence) assert.match(source.url, /^https:\/\//, id);
    const cell = `${candidate.lat.toFixed(1)}:${candidate.lon.toFixed(1)}`;
    assert.equal(cells.has(cell), false, `${id} duplicates ${cell}`);
    cells.add(cell);
  }
  assert.equal(replacements.replacements.denali.approval, true);
  assert.match(replacements.replacements.denali.approvalEvidence, /Official NPS/);
  for (const id of ["annapurna", "el-chalten", "garhwal", "zermatt"] as const) {
    assert.equal(replacements.replacements[id].approval, false, id);
  }
});

test("publication is hard-scoped to the one approved replacement", () => {
  const workflow = readFileSync(".github/workflows/publish-denali-cell-replacement.yml", "utf8");
  const preparation = readFileSync("scripts/geo/stage-representative-cell-replacements.ts", "utf8");
  assert.match(workflow, /BTH_DESTINATIONS: denali/);
  assert.match(workflow, /--only=denali/);
  assert.match(workflow, /data:cell-replacement-finalize/);
  assert.doesNotMatch(workflow, /el-chalten|garhwal|annapurna|zermatt/);
  assert.match(preparation, /!ids\.includes\(destination\.id\)/);
});

test("replacement workflow cannot publish or push", () => {
  const workflow = readFileSync(".github/workflows/stage-cell-replacements.yml", "utf8");
  assert.match(workflow, /contents: read/);
  assert.doesNotMatch(workflow, /git push|--publish|contents: write/);
  assert.match(workflow, /hunza/);
  assert.doesNotMatch(workflow, /BTH_DESTINATIONS:.*zermatt/);
  assert.match(workflow, /data:cell-replacement-review/);
  assert.doesNotMatch(workflow, /\{zermatt,/);
  assert.match(workflow, /destinations\/ar\/el-chalten\.json/);
});

test("El Chalten preserves both rejected proposals without granting approval", () => {
  const candidate = replacements.replacements["el-chalten"];
  assert.equal(candidate.approval, false);
  assert.equal(candidate.stagingDisposition, "rejected");
  assert.match(candidate.rejectionReason, /34139951879/);
  assert.match(candidate.rejectionReason, /persistent-snow/);
  assert.deepEqual([candidate.lat, candidate.lon], [-49.3, -72.9]);
  assert.deepEqual([candidate.rejectedCandidate.lat, candidate.rejectedCandidate.lon], [-49.4, -72.7]);
  assert.match(candidate.rejectedCandidate.reason, /15 route bounding boxes/);
  const workflow = readFileSync(".github/workflows/stage-cell-replacements.yml", "utf8");
  const scope = workflow.match(/BTH_DESTINATIONS: (.+)/)?.[1].split(",").sort();
  const expected = ["el-chalten", ...replacements.controls.destinations].sort();
  assert.deepEqual(scope, expected, "download scope must follow reviewed candidates and controls");
  assert.match(workflow, /prepare -- --apply --only=el-chalten/);
  assert.match(workflow, /review -- --only=el-chalten/);
});
