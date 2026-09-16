import type { DestinationConfig } from "../../lib/data/types";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { readJson, writeJson, ROOT } from "../lib/io";

const resolveInput = (configured: string | undefined, fallback: string) => {
  const value = configured?.trim() || fallback;
  return isAbsolute(value) ? value : join(ROOT, value);
};
const readInput = <T>(configured: string | undefined, fallback: string): T => {
  const path = resolveInput(configured, fallback);
  if (!existsSync(path)) throw new Error(`NORMALIZE001 input is missing: ${path}`);
  return JSON.parse(readFileSync(path, "utf8")) as T;
};
const destinations = readJson<DestinationConfig[]>("data-config/sources/destinations.json").filter((item) => item.active);
const climateRoot = resolveInput(process.env.BTH_CLIMATE_ROOT, "data-snapshots/climate");
const demRoot = resolveInput(process.env.BTH_DEM_ROOT, "data-snapshots/dem");
const samplingRoot = resolveInput(process.env.BTH_SAMPLING_ROOT, "data-snapshots/sampling");
const normalized = destinations.map((destination) => ({
  destination,
  dem: readInput(undefined, join(demRoot, `${destination.slug}.json`)),
  sampling: readInput(undefined, join(samplingRoot, `${destination.slug}.json`)),
  climate: readInput(undefined, join(climateRoot, `${destination.slug}.json`))
}));
const output = process.env.BTH_NORMALIZED_OUTPUT?.trim() || "generated/intermediate/normalized.json";
writeJson(output, normalized);
console.log(`Normalized ${normalized.length} destinations from ${climateRoot}.`);
