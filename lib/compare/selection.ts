export const MAX_COMPARISON_DESTINATIONS = 4;

/** Shared URLs and stored shortlists are input, not a trusted selection. */
export function comparisonSelection(requested: readonly string[], available: {has(slug: string): boolean}) {
  const unique = [...new Set(requested.map((slug) => slug.trim()).filter(Boolean))];
  return {
    chosen: unique.filter((slug) => available.has(slug)).slice(0, MAX_COMPARISON_DESTINATIONS),
    dropped: unique.filter((slug) => !available.has(slug)),
  };
}
