/**
 * Which licences this project may publish, and how they must be credited.
 *
 * The operator rule is: open licence or commercially usable, nothing else.
 * That is enforced here rather than by convention, so an unlicensed or
 * non-commercial file cannot reach the manifest even by accident.
 *
 * Deliberately excluded:
 *  - NonCommercial (NC): the site carries affiliate links, so its use is commercial.
 *  - NoDerivatives (ND): destination cards crop and resize, which is a derivative.
 *    The sibling project allows ND under a strict no-crop rule; refusing it
 *    outright is simpler and cannot be got wrong later by a layout change.
 *  - "Fair use", "used with permission" and unknown or absent licences.
 */
export interface LicenceRule {
  id: string;
  name: string;
  requiresAttribution: boolean;
  requiresShareAlike: boolean;
}

export const ALLOWED_LICENCES: LicenceRule[] = [
  {id: "cc0", name: "CC0 1.0", requiresAttribution: false, requiresShareAlike: false},
  {id: "pd", name: "Public domain", requiresAttribution: false, requiresShareAlike: false},
  {id: "cc-by-2.0", name: "CC BY 2.0", requiresAttribution: true, requiresShareAlike: false},
  {id: "cc-by-2.5", name: "CC BY 2.5", requiresAttribution: true, requiresShareAlike: false},
  {id: "cc-by-3.0", name: "CC BY 3.0", requiresAttribution: true, requiresShareAlike: false},
  {id: "cc-by-4.0", name: "CC BY 4.0", requiresAttribution: true, requiresShareAlike: false},
  {id: "cc-by-sa-2.0", name: "CC BY-SA 2.0", requiresAttribution: true, requiresShareAlike: true},
  {id: "cc-by-sa-2.5", name: "CC BY-SA 2.5", requiresAttribution: true, requiresShareAlike: true},
  {id: "cc-by-sa-3.0", name: "CC BY-SA 3.0", requiresAttribution: true, requiresShareAlike: true},
  {id: "cc-by-sa-4.0", name: "CC BY-SA 4.0", requiresAttribution: true, requiresShareAlike: true},
];

const BY_ID = new Map(ALLOWED_LICENCES.map((licence) => [licence.id, licence]));

/** Normalise a Wikimedia Commons licence short name to an allowlist id, or null. */
export function normaliseLicence(raw: string | undefined | null): LicenceRule | null {
  if (!raw) return null;
  const text = raw.trim().toLowerCase().replace(/\s+/g, "-");
  // Refuse the restrictive clauses before any matching, so a string like
  // "cc-by-nc-sa-4.0" can never be mistaken for "cc-by-sa-4.0".
  if (/(^|-)nc(-|$)|noncommercial|non-commercial/.test(text)) return null;
  if (/(^|-)nd(-|$)|noderiv|no-derivative/.test(text)) return null;
  if (/fair-?use|permission/.test(text)) return null;
  if (/^cc0/.test(text) || text === "cc-zero") return BY_ID.get("cc0")!;
  if (/^pd(-|$)|^public-domain/.test(text)) return BY_ID.get("pd")!;
  const match = /^cc-by(-sa)?-(\d(?:\.\d)?)($|-)/.exec(text);
  if (match) {
    const version = match[2].includes(".") ? match[2] : `${match[2]}.0`;
    return BY_ID.get(`cc-by${match[1] ?? ""}-${version}`) ?? null;
  }
  return null;
}

export const isAllowedLicence = (raw: string | undefined | null): boolean => normaliseLicence(raw) !== null;
