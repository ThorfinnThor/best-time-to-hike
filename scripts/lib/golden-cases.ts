import { readJson } from "./io";
import type { GoldenCase } from "./golden-review";

interface GoldenRegistry {
  status: string;
  cases: GoldenCase[];
}

interface CandidateRegistry {
  status: string;
  productionEffect: string;
  candidates: GoldenCase[];
}

/**
 * Return the complete signed reference set. Candidate batches fail closed:
 * they only join the release/calibration set after explicit whole-batch approval.
 */
export function loadGoldenCases(): GoldenRegistry {
  const established = readJson<GoldenRegistry>("tests/fixtures/known-hiking-seasons.json");
  const additions = readJson<CandidateRegistry>("data-config/methodology/golden-case-candidates-v1.json");
  const promoted = additions.status === "APPROVED"
    && additions.productionEffect === "included-in-signed-golden-set";
  return {
    status: established.status === "APPROVED" && promoted ? "APPROVED" : "PENDING",
    cases: promoted ? [...established.cases, ...additions.candidates] : established.cases,
  };
}
