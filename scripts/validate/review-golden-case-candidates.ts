import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Candidate {
  slug: string;
  expectedMonths: number[];
  approvedBy: string | null;
  approvedAt: string | null;
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8"));
const candidates = readJson<{ status: string; productionEffect: string; candidates: Candidate[] }>(
  "data-config/methodology/golden-case-candidates-v1.json",
);
const destinationFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => entry.isDirectory()
    ? destinationFiles(join(directory, entry.name))
    : entry.name.endsWith(".json") ? [join(directory, entry.name)] : []);
const destinations = destinationFiles("public/data/hiking/destinations")
  .map((path) => readJson<{ slug: string; bestMonths: number[]; recommendationHoldReason?: string }>(path));
const bySlug = new Map(destinations.map((destination) => [destination.slug, destination]));

const rows = candidates.candidates.map((candidate) => {
  const destination = bySlug.get(candidate.slug);
  const engineMonths = destination?.bestMonths ?? [];
  const outside = engineMonths.filter((month) => !candidate.expectedMonths.includes(month));
  const verdict = !engineMonths.length ? "no-answer"
    : !outside.length ? "agrees"
      : engineMonths.some((month) => candidate.expectedMonths.includes(month)) ? "partly" : "disagrees";
  return {
    slug: candidate.slug,
    expectedMonths: candidate.expectedMonths,
    engineMonths,
    verdict,
    recommendationHoldReason: destination?.recommendationHoldReason ?? null,
    signed: Boolean(candidate.approvedBy && candidate.approvedAt),
  };
});

const report = {
  schemaVersion: 1,
  status: candidates.status,
  productionEffect: candidates.productionEffect,
  candidateCount: rows.length,
  signedCount: rows.filter((row) => row.signed).length,
  tally: {
    agrees: rows.filter((row) => row.verdict === "agrees").length,
    partly: rows.filter((row) => row.verdict === "partly").length,
    disagrees: rows.filter((row) => row.verdict === "disagrees").length,
    noAnswer: rows.filter((row) => row.verdict === "no-answer").length,
  },
  candidates: rows,
};
mkdirSync("generated/reports", { recursive: true });
writeFileSync("generated/reports/golden-case-candidates.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`Golden candidates: ${report.candidateCount}; ${report.tally.agrees} agree, ${report.tally.partly} partly, ${report.tally.disagrees} disagree, ${report.tally.noAnswer} no answer; release approvals unchanged.`);
