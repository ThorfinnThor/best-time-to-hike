import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, sha256 } from "../lib/io";

const dataRoot = join(ROOT, "public/data/hiking");
const files = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]
);
const snapshot = () => Object.fromEntries(files(dataRoot).sort().map((file) => [relative(dataRoot, file), sha256(readFileSync(file))]));

/**
 * This guard re-runs the exporter over the published directory, so it mutates
 * the thing it is checking. Run against a stale generated/intermediate it
 * rewrites the published dataset with the wrong destinations, reports a
 * non-deterministic export, and then PASSES on the second run because the
 * corrupted state now reproduces itself. Refuse to run unless the intermediate
 * matches the destination master.
 */
const scoredPath = join(ROOT, "generated/intermediate/scored.json");
if (!existsSync(scoredPath)) {
  throw new Error("Determinism guard needs generated/intermediate/scored.json. Run pnpm data:rebuild first.");
}
const scored = JSON.parse(readFileSync(scoredPath, "utf8")) as unknown;
const scoredCount = Array.isArray(scored) ? scored.length : 0;
const configuredCount = (JSON.parse(readFileSync(join(ROOT, "data-config/sources/destinations.json"), "utf8")) as unknown[]).length;
if (scoredCount !== configuredCount) {
  throw new Error(
    `Determinism guard refused to run: generated/intermediate/scored.json holds ${scoredCount} destinations `
    + `but the catalogue has ${configuredCount}. Re-exporting from it would overwrite the published dataset. `
    + `Run pnpm data:rebuild first.`);
}

const before = snapshot();
execFileSync(join(ROOT,"node_modules/.bin/tsx"), ["scripts/export/export.ts"], { cwd: ROOT, stdio: "inherit" });
const after = snapshot();
if (JSON.stringify(before) !== JSON.stringify(after)) {
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((path) => before[path] !== after[path]);
  throw new Error(
    `Non-deterministic export detected: ${changed.join(", ")}. `
    + `The published dataset has been overwritten by this run; restore it with pnpm data:rebuild before re-running.`);
}
console.log(`Determinism guard passed: ${Object.keys(after).length} files reproduced byte-for-byte.`);
