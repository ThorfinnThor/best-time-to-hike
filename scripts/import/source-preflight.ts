import { readJson } from "../lib/io";

export function requireApprovedSource(source: "era5Land" | "copernicusDem") {
  const semantics = readJson<any>("data-config/methodology/source-semantics.json");
  const value = semantics[source];
  if (!value.approved) throw new Error(`BLOCKED_SOURCE_SEMANTICS: ${source} is not operator-approved.`);
  if (source === "era5Land" && !["INCREMENTAL_PER_TIMESTEP_M","ACCUMULATED_WITH_EXPLICIT_RESET_METADATA"].includes(value.precipitationSemantics)) throw new Error("BLOCKED_SOURCE_SEMANTICS: unsupported precipitation semantics.");
}
