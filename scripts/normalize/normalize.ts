import type { DestinationConfig } from "../../lib/data/types";
import { readJson, writeJson, ROOT } from "../lib/io";
import { existsSync } from "node:fs";
import { join } from "node:path";

const destinations = readJson<DestinationConfig[]>("data-config/sources/destinations.json").filter((item) => item.active);
const historicalCandidate = process.env.BTH_CLIMATE_PERIOD === "1991-2025"
  ? join(ROOT, "generated/intermediate/normalized-1991-2025.json")
  : undefined;
if (historicalCandidate && existsSync(historicalCandidate)) {
  const normalized = readJson<unknown[]>("generated/intermediate/normalized-1991-2025.json");
  writeJson("generated/intermediate/normalized.json", normalized);
  console.log(`Normalized ${normalized.length} destinations from the prepared 1991-2025 migration artifact.`);
  process.exit(0);
}
const normalized = destinations.map((destination) => ({
  destination,
  dem: readJson(`data-snapshots/dem/${destination.slug}.json`),
  sampling: readJson(`data-snapshots/sampling/${destination.slug}.json`),
  climate: readJson(`data-snapshots/climate/${destination.slug}.json`)
}));
writeJson("generated/intermediate/normalized.json", normalized);
console.log(`Normalized ${normalized.length} destinations from committed snapshots.`);
