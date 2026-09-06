import test from "node:test";
import assert from "node:assert/strict";
import { blockingComponents } from "../lib/scoring/recommendations";
import type { ComponentScores } from "../lib/data/types";

const month = (patch: Partial<ComponentScores> = {}) => ({
  components: {temperature: 90, precipitation: 90, snow: 100, heatStress: 100, wind: 95, daylight: 90, ...patch} as ComponentScores,
});

test("a component is only named when it fails in every scored month", () => {
  const alwaysWet = Array.from({length: 12}, () => month({precipitation: 4}));
  assert.deepEqual(blockingComponents(alwaysWet), ["precipitation"]);

  const wetForHalfTheYear = [...Array.from({length: 6}, () => month({precipitation: 4})), ...Array.from({length: 6}, () => month())];
  assert.deepEqual(blockingComponents(wetForHalfTheYear), [], "a month elsewhere in the year would fix this, so nothing is named");
});

test("the threshold is the recommendation floor, not a fresh number", () => {
  assert.deepEqual(blockingComponents(Array.from({length: 12}, () => month({snow: 20}))), ["snow"]);
  assert.deepEqual(blockingComponents(Array.from({length: 12}, () => month({snow: 21}))), []);
});

test("an unscored destination names nothing rather than guessing", () => {
  assert.deepEqual(blockingComponents([{components: null}, {components: null}]), []);
});
