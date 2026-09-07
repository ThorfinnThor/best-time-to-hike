import test from "node:test";
import assert from "node:assert/strict";
import { comparisonSelection } from "../lib/compare/selection";

const available = new Set(["madeira", "dolomites", "tenerife", "mallorca", "crete"]);

test("comparison links deduplicate before applying the four-destination limit", () => {
  assert.deepEqual(comparisonSelection(["madeira", "madeira", " madeiRA ", " dolomites ", "", "tenerife", "mallorca", "crete"], available), {
    chosen: ["madeira", "dolomites", "tenerife", "mallorca"], dropped: ["madeiRA"],
  });
});

test("four repetitions still leave three comparison slots available", () => {
  assert.deepEqual(comparisonSelection(Array(4).fill("madeira"), available).chosen, ["madeira"]);
});

test("stored shortlists exclude unavailable destinations and repeated missing entries", () => {
  assert.deepEqual(comparisonSelection(["removed", "madeira", "removed", "", "madeira"], available), {
    chosen: ["madeira"], dropped: ["removed"],
  });
  assert.deepEqual(comparisonSelection([], available), {chosen: [], dropped: []});
});
