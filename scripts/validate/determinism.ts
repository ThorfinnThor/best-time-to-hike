import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, sha256 } from "../lib/io";

const dataRoot = join(ROOT, "public/data/hiking");
const files = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]
);
const snapshot = () => Object.fromEntries(files(dataRoot).sort().map((file) => [relative(dataRoot, file), sha256(readFileSync(file))]));

const before = snapshot();
execFileSync(join(ROOT,"node_modules/.bin/tsx"), ["scripts/export/export.ts"], { cwd: ROOT, stdio: "inherit" });
const after = snapshot();
if (JSON.stringify(before) !== JSON.stringify(after)) {
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((path) => before[path] !== after[path]);
  throw new Error(`Non-deterministic export detected: ${changed.join(", ")}`);
}
console.log(`Determinism guard passed: ${Object.keys(after).length} files reproduced byte-for-byte.`);
