import type { DestinationConfig } from "../../lib/data/types";
import { readJson, writeJson } from "../lib/io";

const destinations = readJson<DestinationConfig[]>("data-config/sources/destinations.json").filter((item) => item.active);
const normalized = destinations.map((destination) => ({
  destination,
  dem: readJson(`data-snapshots/dem/${destination.slug}.json`),
  sampling: readJson(`data-snapshots/sampling/${destination.slug}.json`),
  climate: readJson(`data-snapshots/climate/${destination.slug}.json`)
}));
writeJson("generated/intermediate/normalized.json", normalized);
console.log(`Normalized ${normalized.length} destinations from committed snapshots.`);
