import test from "node:test";
import assert from "node:assert/strict";
import { ALLOWED_LICENCES, isAllowedLicence, normaliseLicence } from "../lib/media/licence";

/**
 * The operator rule is open licence or commercially usable, nothing else.
 * These tests exist so that rule cannot be softened by accident: a change that
 * lets NC or ND through fails here rather than on a published page.
 */

test("permitted licences resolve", () => {
  for (const licence of ALLOWED_LICENCES) assert.ok(isAllowedLicence(licence.id), `${licence.id} should be allowed`);
  for (const raw of ["CC0", "cc0-1.0", "CC BY 4.0", "cc-by-sa-3.0", "PD-old-70", "public domain"]) {
    assert.ok(isAllowedLicence(raw), `${raw} should be allowed`);
  }
});

test("non-commercial licences are refused", () => {
  for (const raw of ["cc-by-nc-4.0", "CC BY-NC-SA 3.0", "cc-by-nc-nd-4.0", "noncommercial"]) {
    assert.equal(normaliseLicence(raw), null, `${raw} must be refused: the site carries affiliate links`);
  }
});

test("no-derivatives licences are refused because cards crop", () => {
  for (const raw of ["cc-by-nd-4.0", "CC BY-ND 3.0", "cc-by-sa-nd-4.0", "noderivs"]) {
    assert.equal(normaliseLicence(raw), null, `${raw} must be refused`);
  }
});

test("an NC or ND clause is never mistaken for the permissive licence it resembles", () => {
  // The dangerous case: substring matching would read cc-by-nc-sa-4.0 as cc-by-sa-4.0.
  assert.equal(normaliseLicence("cc-by-nc-sa-4.0"), null);
  assert.notEqual(normaliseLicence("cc-by-sa-4.0"), null);
});

test("unknown, absent and fair-use licences are refused", () => {
  for (const raw of [undefined, null, "", "   ", "fair use", "used with permission", "all rights reserved", "cc-by-9.9"]) {
    assert.equal(normaliseLicence(raw as string), null, `${String(raw)} must be refused`);
  }
});

test("attribution and share-alike obligations are carried, not just the id", () => {
  assert.equal(normaliseLicence("cc0")!.requiresAttribution, false);
  assert.equal(normaliseLicence("cc-by-4.0")!.requiresAttribution, true);
  assert.equal(normaliseLicence("cc-by-sa-4.0")!.requiresShareAlike, true);
  assert.equal(normaliseLicence("cc-by-4.0")!.requiresShareAlike, false);
});
