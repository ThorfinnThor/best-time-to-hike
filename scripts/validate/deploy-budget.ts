import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The static export has to fit inside the host's limits, and the limit that
 * bites first is not a size but a count.
 *
 * Cloudflare Pages accepts at most 20,000 files and 25 MiB per file in a single
 * deployment. Every destination adds a detail page and twelve month pages in
 * two locales, each with the router's own .txt payload, so roughly 53 files per
 * destination. At 315 destinations the export is already past 17,000 files:
 * the catalogue reaches the wall well before anything else in the pipeline
 * complains, and it would arrive as a failed deploy rather than a failed build.
 *
 * This turns that into a build-time number, with the headroom stated in the
 * unit the project actually grows in.
 */
const OUT = "out";
const FILE_LIMIT = 20_000;
const FILE_BYTE_LIMIT = 25 * 1024 * 1024;
/** Warn while there is still time to act rather than only at the wall. */
const WARN_AT = 0.85;

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(path));
    else found.push(path);
  }
  return found;
}

const files = walk(OUT);
const oversized = files.filter((file) => statSync(file).size > FILE_BYTE_LIMIT);
const destinationPages = files.filter((file) => /\/(hiking-destinations|wanderziele)\//.test(file)).length;
const index = JSON.parse(readFileSync("public/data/hiking/destinations/index.json", "utf8")) as unknown[];
const perDestination = destinationPages / index.length;
const headroom = Math.floor((FILE_LIMIT - files.length) / perDestination);

const problems: string[] = [];
if (files.length > FILE_LIMIT) problems.push(`${files.length} files exceeds the Cloudflare Pages limit of ${FILE_LIMIT}`);
for (const file of oversized) problems.push(`${file} exceeds the 25 MiB per-file limit`);

if (problems.length) {
  for (const problem of problems) console.error(`Deploy budget: ${problem}`);
  process.exit(1);
}

const share = files.length / FILE_LIMIT;
const line = `Deploy budget: ${files.length} files of ${FILE_LIMIT} (${Math.round(share * 100)}%), ${perDestination.toFixed(1)} per destination, room for about ${headroom} more.`;
if (share >= WARN_AT) console.warn(`WARNING  ${line}`);
else console.log(line);
