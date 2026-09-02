import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { readJson, writeJson } from "../lib/io";

type Candidate = {
  id: string;
  name: string;
  countryName: string;
  candidateCentroid: { lat: number; lon: number };
};

type OSMResult = {
  place_id: number;
  licence?: string;
  osm_type: string;
  osm_id: number;
  category?: string;
  type?: string;
  name?: string;
  display_name?: string;
  boundingbox?: string[];
  geojson?: { type: string; coordinates: unknown };
};

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const execFileAsync = promisify(execFile);
const queryOverrides: Record<string, string> = {
  rila: "Rila National Park, Bulgaria",
  durmitor: "Durmitor National Park, Montenegro"
};
const batchNumber = Number(process.env.BTH_GEOMETRY_BATCH ?? "1");
if (!Number.isInteger(batchNumber) || batchNumber < 1) throw new Error("GEOMETRY001 BTH_GEOMETRY_BATCH must be a positive integer");

const plan = readJson<any>("data-config/sources/destination-candidates.json");
const batch = plan.plannedBatches?.[batchNumber - 1];
if (!batch || !Array.isArray(batch.add) || !batch.add.length) throw new Error(`GEOMETRY001 missing planned batch ${batchNumber}`);
const candidates = (plan.candidates as Candidate[]).filter((candidate) => batch.add.includes(candidate.id));
if (candidates.length !== batch.add.length) throw new Error(`GEOMETRY001 planned batch ${batchNumber} contains an unknown candidate`);

async function main() {
  const boundaries: Record<string, unknown> = {};
  const unresolved: Record<string, unknown> = {};
  for (const [index, candidate] of candidates.entries()) {
    if (index > 0) await sleep(1100);
    const query = queryOverrides[candidate.id] ?? `${candidate.name}, ${candidate.countryName}`;
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("polygon_geojson", "1");
    url.searchParams.set("limit", "10");
    url.searchParams.set("q", query);
    let raw: string;
    try {
      ({ stdout: raw } = await execFileAsync("curl", [
        "--fail", "--silent", "--show-error", "--location", "--max-time", "45", "--retry", "2", "--retry-delay", "1",
        "--user-agent", "BestTimeToHike/1.0 (destination-intake; https://github.com/ThorfinnThor/best-time-to-hike)",
        url.toString()
      ], { maxBuffer: 25 * 1024 * 1024 }));
    } catch (error) {
      throw new Error(`GEOMETRY002 Nominatim request failed for ${candidate.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
    const results = JSON.parse(raw) as OSMResult[];
    const result = results.find((item) => item.osm_type === "relation" && item.geojson);
    if (!result?.geojson) {
      unresolved[candidate.id] = {
        candidate,
        query,
        results: results.map((item) => ({
          osmType: item.osm_type,
          osmId: item.osm_id,
          category: item.category,
          type: item.type,
          name: item.name,
          displayName: item.display_name,
          geometryType: item.geojson?.type
        }))
      };
      console.warn(`Unresolved ${candidate.id}: no polygon relation returned; manual boundary source required.`);
      continue;
    }
    if (![
      "Polygon",
      "MultiPolygon"
    ].includes(result.geojson.type)) throw new Error(`GEOMETRY003 unsupported polygon type for ${candidate.id}`);
    boundaries[candidate.id] = {
      candidate,
      query,
      source: {
        provider: "OpenStreetMap Nominatim",
        licence: result.licence ?? "Data © OpenStreetMap contributors, ODbL 1.0",
        osmType: result.osm_type,
        osmId: result.osm_id,
        placeId: result.place_id,
        category: result.category,
        type: result.type,
        name: result.name,
        displayName: result.display_name,
        boundingBox: result.boundingbox,
        responseSha256: createHash("sha256").update(raw).digest("hex")
      },
      geometry: result.geojson
    };
    console.log(`Fetched ${candidate.id}: relation ${result.osm_id} (${result.name ?? "unnamed"})`);
  }
  writeJson(`generated/intermediate/geometry-osm-batch-${batchNumber}.json`, {
    schemaVersion: 1,
    status: "staging-only",
    batch: batchNumber,
    targetDestinationCount: batch.targetDestinationCount,
    fetchedAt: new Date().toISOString(),
    boundaries,
    unresolved,
    unresolvedCount: Object.keys(unresolved).length
  });
  console.log(`Wrote ${Object.keys(boundaries).length} staging geometries and ${Object.keys(unresolved).length} unresolved candidates for batch ${batchNumber}.`);
}

if (existsSync("data-config/sources/destination-candidates.json")) void main();
