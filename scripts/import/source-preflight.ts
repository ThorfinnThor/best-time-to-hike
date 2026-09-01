import { readJson } from "../lib/io";

export function requireApprovedSource(source: "era5Land" | "copernicusDem") {
  const semantics = readJson<any>("data-config/methodology/source-semantics.json");
  const value = semantics[source];
  if (!value.approved) throw new Error(`BLOCKED_SOURCE_SEMANTICS: ${source} is not operator-approved.`);
  if (!value.approvedAt || !value.approvedBy || !Number.isFinite(new Date(value.approvedAt).getTime())) throw new Error(`BLOCKED_SOURCE_SEMANTICS: ${source} approval metadata is incomplete.`);
  if (source === "era5Land") {
    if (!value.supportedPrecipitationSemantics.includes(value.precipitationSemantics)) throw new Error("BLOCKED_SOURCE_SEMANTICS: unsupported precipitation semantics.");
    if (value.temperatureUnitExpected!=="K"||value.windUnitExpected!=="m s-1"||value.precipitationUnitExpected!=="m"||value.snowDepthUnitExpected!=="m"||value.snowCoverSemantics!=="FRACTION_0_TO_1") throw new Error("BLOCKED_SOURCE_SEMANTICS: ERA5-Land units or snow semantics are not fully approved.");
    if(value.orography?.parameterShortName!=="z"||value.orography?.parameterId!==129||value.orography?.unitExpected!=="m**2 s**-2"||value.orography?.gridDegrees!==.1||value.orography?.standardGravityMS2!==9.80665)throw new Error("BLOCKED_SOURCE_SEMANTICS: ERA5-Land invariant-orography semantics are not fully approved.");
  }
  if (source === "copernicusDem" && value.verticalUnitExpected !== "m") throw new Error("BLOCKED_SOURCE_SEMANTICS: DEM vertical units must be metres.");
}
