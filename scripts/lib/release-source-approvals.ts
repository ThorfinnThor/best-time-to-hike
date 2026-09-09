export type ReleaseSource = "era5Land" | "copernicusDem";

export interface ReleaseSourceInventory {
  climateSources: string[];
  elevationSources: string[];
  samplingSources: string[];
}

const sourceFor = (value: string): ReleaseSource | null => {
  const normalized = value.toLowerCase();
  if (normalized.includes("copernicus") || normalized.includes("glo-30")) return "copernicusDem";
  if (normalized.includes("era5")) return "era5Land";
  return null;
};

export function requiredReleaseSources(inventory: ReleaseSourceInventory) {
  const identifiers = [...inventory.climateSources, ...inventory.elevationSources, ...inventory.samplingSources];
  const unknownIdentifiers = [...new Set(identifiers.filter((value) => sourceFor(value) === null))].sort();
  const requiredSources = [...new Set(identifiers.flatMap((value) => {
    const source = sourceFor(value);
    return source === null ? [] : [source];
  }))].sort() as ReleaseSource[];
  return { requiredSources, unknownIdentifiers };
}

export function releaseSourcesApproved(
  inventory: ReleaseSourceInventory,
  semantics: Record<ReleaseSource, {approved:boolean;approvedAt:string|null;approvedBy:string|null}>,
) {
  const scope = requiredReleaseSources(inventory);
  const approvals = Object.fromEntries(scope.requiredSources.map((source) => {
    const approval = semantics[source];
    return [source, approval.approved === true
      && Boolean(approval.approvedBy)
      && Number.isFinite(Date.parse(approval.approvedAt ?? ""))];
  })) as Record<ReleaseSource, boolean>;
  return {...scope, approvals, passed: scope.unknownIdentifiers.length === 0
    && scope.requiredSources.length > 0
    && scope.requiredSources.every((source) => approvals[source])};
}
