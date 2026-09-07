export interface GoldenCase {
  slug: string;
  expectedMonths: number[];
  approvedBy: string | null;
  approvedAt: string | null;
  acceptedDeviation?: { reason: string; recordedBy: string; recordedAt: string; engineMonths: number[] };
}

const validMonths = (months: number[]) => Array.isArray(months)
  && new Set(months).size === months.length
  && months.every((month) => Number.isInteger(month) && month >= 1 && month <= 12);
const signed = (by: string | null, at: string | null) => Boolean(by?.trim())
  && Number.isFinite(Date.parse(at ?? ""));
const sameMonths = (a: number[], b: number[]) => a.length === b.length && a.every((month) => b.includes(month));

/** Compare independent labels with the published answer, including exact exception scope. */
export function reviewGoldenCases(
  golden: { status: string; cases: GoldenCase[] },
  destinations: { slug: string; bestMonths: number[] }[],
) {
  const bySlug = new Map(destinations.map((destination) => [destination.slug, destination]));
  const seen = new Set<string>();
  const cases = golden.cases.map((item) => {
    const destination = bySlug.get(item.slug);
    const best = destination?.bestMonths ?? [];
    const outside = best.filter((month) => !item.expectedMonths.includes(month));
    const verdict = !best.length ? "no answer" : !outside.length ? "agrees"
      : best.some((month) => item.expectedMonths.includes(month)) ? "partly" : "disagrees";
    const errors: string[] = [];
    if (seen.has(item.slug)) errors.push("duplicate-destination");
    seen.add(item.slug);
    if (!destination) errors.push("missing-destination");
    if (!item.expectedMonths.length || !validMonths(item.expectedMonths)) errors.push("invalid-label-months");
    if (!signed(item.approvedBy, item.approvedAt)) errors.push("unsigned-label");
    const deviation = item.acceptedDeviation;
    if (deviation) {
      if (deviation.reason.trim().length <= 60 || !signed(deviation.recordedBy, deviation.recordedAt)
        || !validMonths(deviation.engineMonths)) errors.push("invalid-deviation");
      if (!sameMonths(best, deviation.engineMonths)) errors.push("stale-deviation");
    } else if (verdict !== "agrees") errors.push("unaccepted-deviation");
    return { slug: item.slug, verdict, expectedMonths: item.expectedMonths, engineMonths: best,
      acceptedDeviation: Boolean(deviation), errors };
  });
  const acceptedDeviations = golden.cases.filter((item) => item.acceptedDeviation).length;
  return {
    passed: golden.status === "APPROVED" && golden.cases.length >= 30
      && acceptedDeviations <= golden.cases.length / 4 && cases.every((item) => !item.errors.length),
    signedCases: golden.cases.filter((item) => signed(item.approvedBy, item.approvedAt)).length,
    acceptedDeviations,
    maximumAcceptedDeviations: Math.floor(golden.cases.length / 4),
    tally: {
      agrees: cases.filter((item) => item.verdict === "agrees").length,
      partly: cases.filter((item) => item.verdict === "partly").length,
      disagrees: cases.filter((item) => item.verdict === "disagrees").length,
      noAnswer: cases.filter((item) => item.verdict === "no answer").length,
    },
    cases,
  };
}
