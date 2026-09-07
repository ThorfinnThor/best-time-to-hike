import { readFileSync } from "node:fs";
import type { PublicDestination } from "../../lib/data/types";
import { readJson } from "../lib/io";

/**
 * A representative cell has to be somewhere a person could walk.
 *
 * The cell is chosen from a coordinate and an elevation, and both are human
 * judgements. Nothing downstream questions them: the pipeline will happily
 * download thirty years of hourly data for a point on a glacier, score it,
 * publish it, and withhold every month — which looks like a destination with a
 * hard climate rather than a coordinate in the wrong place. Zermatt, El Chaltén,
 * Denali and Garhwal all reached production that way.
 *
 * The test is simple and has no false positives in this catalogue: a cell whose
 * snow never melts is not a cell anyone hikes. In the published data the four
 * above carry 1.9 to 6.9 m of snow in their *thinnest* month, and every other
 * one of the 315 loses its snow entirely at some point in the year. There is no
 * middle ground to argue about.
 *
 * Known cases are listed rather than silenced, so the guard blocks a fifth
 * without blocking the build on the four already queued for a new download.
 */
const SNOWBOUND_ALL_YEAR = new Set(
  readJson<{destinationIds: string[]}>("data-config/sources/known-snowbound-cell-holds.json").destinationIds,
);

const index = readJson<Array<{slug: string}>>("public/data/hiking/destinations/index.json");
const manifest = readJson<{fileChecksums: Record<string, string>}>("public/data/hiking/manifest.json");
const paths = Object.keys(manifest.fileChecksums).filter((path) => path.startsWith("destinations/") && !path.endsWith("index.json"));

const problems: string[] = [];
const stillSnowbound: string[] = [];

for (const path of paths) {
  const destination = JSON.parse(readFileSync(`public/data/hiking/${path}`, "utf8")) as PublicDestination;
  const thinnest = Math.min(...destination.months.map((month) => month.metrics.snowDepthMeanOnSnowDaysM ?? 0));
  const alwaysSnowing = destination.months.every((month) => month.metrics.snowDayProbability >= 0.999);
  if (!alwaysSnowing) continue;
  stillSnowbound.push(destination.slug);
  if (!SNOWBOUND_ALL_YEAR.has(destination.slug)) {
    problems.push(`${destination.slug}: the cell at ${destination.representativeCell.lat}, ${destination.representativeCell.lon} (${Math.round(destination.representativeCell.modelElevationM)} m) has snow on every day of every month and still carries ${thinnest.toFixed(1)} m in its thinnest. That is a snowfield, not a hiking cell. Move the coordinate to where the walking is and re-download, or say why this one is different.`);
  }
}

const resolved = [...SNOWBOUND_ALL_YEAR].filter((slug) => !stillSnowbound.includes(slug) && index.some((entry) => entry.slug === slug));
for (const slug of resolved) {
  problems.push(`${slug} is listed as a known snowbound cell but its cell now loses its snow. Remove it from SNOWBOUND_ALL_YEAR in this file and from docs/next-expansion-batch.md.`);
}

if (problems.length) {
  console.error(`Cell guard: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`Cell guard passed: ${paths.length} cells, ${stillSnowbound.length} known snowbound and queued for re-selection, none new.`);
