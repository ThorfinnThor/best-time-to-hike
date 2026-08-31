import { readJson } from "../lib/io";
const semantics = readJson<any>("data-config/methodology/source-semantics.json");
if (!semantics.copernicusDem.approved) throw new Error("BLOCKED_SOURCE_SEMANTICS: DEM semantics must be approved before production sampling.");
throw new Error("BLOCKED_GEOMETRY_DECISION: production sampling requires operator-approved destination geometry and DEM snapshots.");
