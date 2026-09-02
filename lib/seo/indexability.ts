export interface IndexabilityInput {
  resultCount: number;
  dataCompleteness: number;
  confidence: number;
  uniqueInsightCount: number;
  hasUniqueTitle: boolean;
  hasUniqueH1: boolean;
  hasCanonical: boolean;
  internalLinkCount: number;
  createsCannibalization: boolean;
  containsUnsupportedClaims: boolean;
  datasetStatus: "fixture" | "provisional" | "production";
}

export function evaluateIndexability(input: IndexabilityInput) {
  const reasons: string[] = [];
  if (input.datasetStatus !== "production") reasons.push("non-production-dataset");
  if (input.resultCount < 3) reasons.push("too-few-results");
  if (input.dataCompleteness < 0.95) reasons.push("low-completeness");
  if (input.confidence < 65) reasons.push("low-confidence");
  if (input.uniqueInsightCount < 2) reasons.push("thin-insights");
  if (!input.hasUniqueTitle || !input.hasUniqueH1) reasons.push("missing-unique-heading");
  if (!input.hasCanonical) reasons.push("missing-canonical");
  if (input.internalLinkCount < 2) reasons.push("orphan-risk");
  if (input.createsCannibalization) reasons.push("cannibalization");
  if (input.containsUnsupportedClaims) reasons.push("unsupported-claims");
  return { indexable: reasons.length === 0, reasons };
}
