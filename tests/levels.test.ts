import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import levels from "../data-config/scoring/levels.json";
import confidenceConfig from "../data-config/methodology/confidence-v1.json";
import { confidenceLevel, scoreLevel } from "../lib/scoring/index";

/**
 * mistakes.md #13. The score and confidence ladders were each written down
 * twice, and one copy hardcoded boundaries the other read from config. These
 * tests express the boundaries in terms of the config, so editing the config
 * moves both the product and the expectations together.
 */

test("score labels come from data-config/scoring/levels.json", () => {
  const band = levels.score;
  assert.equal(scoreLevel(band.excellentMinimum), "excellent");
  assert.equal(scoreLevel(band.excellentMinimum - 1), "very-good");
  assert.equal(scoreLevel(band.veryGoodMinimum), "very-good");
  assert.equal(scoreLevel(band.veryGoodMinimum - 1), "good");
  assert.equal(scoreLevel(band.goodMinimum), "good");
  assert.equal(scoreLevel(band.goodMinimum - 1), "fair");
  assert.equal(scoreLevel(band.fairMinimum), "fair");
  assert.equal(scoreLevel(band.fairMinimum - 1), "poor");
});

test("the ineligible cap of 49 lands in the poor band", () => {
  // The recommendation guard caps an ineligible month at 49/poor. That pairing
  // only holds while the fair boundary stays above 49.
  assert.equal(scoreLevel(49), "poor");
  assert.ok(levels.score.fairMinimum > 49, "an ineligible month would stop reading as poor");
});

test("confidence labels come from methodology/confidence-v1.json", () => {
  const band = confidenceConfig.levels;
  assert.equal(confidenceLevel(band.highMinimum), "high");
  assert.equal(confidenceLevel(band.highMinimum - 1), "moderate");
  assert.equal(confidenceLevel(band.moderateMinimum), "moderate");
  assert.equal(confidenceLevel(band.moderateMinimum - 1), "low");
});

test("the provisional single-point cap of 64 lands in the low band", () => {
  assert.equal(confidenceLevel(64), "low");
  assert.ok(confidenceConfig.levels.moderateMinimum > 64, "a capped destination would stop reading as low confidence");
});

test("no hardcoded level ladder survives anywhere", () => {
  const ladder = /\b(score|confidence|value)\s*>=\s*\d+\s*\?/;
  const offenders: string[] = [];
  const scan = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) { scan(full); continue; }
      if (!/\.tsx?$/.test(entry)) continue;
      for (const [index, line] of readFileSync(full, "utf8").split("\n").entries()) {
        if (ladder.test(line)) offenders.push(`${full}:${index + 1}`);
      }
    }
  };
  for (const root of ["lib", "scripts", "components"]) scan(root);
  // Both ladders read their boundaries from config, so a hardcoded numeric one
  // anywhere is by definition a second, drifting copy.
  assert.deepEqual(offenders, [], `hardcoded level ladder found; read the boundary from config instead: ${offenders.join(", ")}`);
});
