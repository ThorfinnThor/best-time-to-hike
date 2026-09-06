import test from "node:test";
import assert from "node:assert/strict";
import { blockingComponents, recommendationDecision } from "../lib/scoring/recommendations";
import type { ComponentScores } from "../lib/data/types";

const month = (patch: Partial<ComponentScores> = {}) => ({
  components: {temperature: 90, precipitation: 90, snow: 100, heatStress: 100, wind: 95, daylight: 90, ...patch} as ComponentScores,
});

test("a component is only named when it fails in every scored month", () => {
  const alwaysFreezing = Array.from({length: 12}, () => month({temperature: 4}));
  assert.deepEqual(blockingComponents(alwaysFreezing), ["temperature"]);

  const coldForHalfTheYear = [...Array.from({length: 6}, () => month({temperature: 4})), ...Array.from({length: 6}, () => month())];
  assert.deepEqual(blockingComponents(coldForHalfTheYear), [], "a month elsewhere in the year would fix this, so nothing is named");
});

test("rain never withholds a destination on its own", () => {
  // Demoted from critical in 1.2.0: it vetoed 15 of 22 withheld destinations,
  // in every month, several with every other component in the nineties.
  const soaked = Array.from({length: 12}, () => month({precipitation: 0}));
  assert.deepEqual(blockingComponents(soaked), []);
  const decision = recommendationDecision(month({precipitation: 0}).components, 79);
  assert.equal(decision.recommendationEligible, true);
  assert.deepEqual(decision.belowFloorComponents, ["precipitation"], "it still has to be named");
  assert.equal(decision.overallScore, 79, "and the score is not capped");
});

test("the threshold is the recommendation floor, not a fresh number", () => {
  assert.deepEqual(blockingComponents(Array.from({length: 12}, () => month({snow: 20}))), ["snow"]);
  assert.deepEqual(blockingComponents(Array.from({length: 12}, () => month({snow: 21}))), []);
});

test("an unscored destination names nothing rather than guessing", () => {
  assert.deepEqual(blockingComponents([{components: null}, {components: null}]), []);
});
