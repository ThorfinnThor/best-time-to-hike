import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, writeJson } from "../lib/io";

const evidencePaths = [
  "generated/intermediate/real-dem",
  "generated/intermediate/real-sampling",
  "generated/intermediate/real-climate",
  "generated/intermediate/era5-invariants",
  "generated/intermediate/era5-request-plan.json"
];

function files(path: string): string[] {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`EVIDENCE001 symbolic links are not allowed: ${relative(ROOT, child)}`);
    return entry.isDirectory() ? files(child) : [child];
  });
}

const evidenceFiles = evidencePaths.flatMap((path) => files(join(ROOT, path))).sort();
if (!evidenceFiles.length) throw new Error("EVIDENCE001 no staging evidence files found");

const entries = evidenceFiles.map((path) => {
  const content = readFileSync(path);
  return {
    path: relative(ROOT, path),
    bytes: content.byteLength,
    sha256: createHash("sha256").update(content).digest("hex")
  };
});

const manifest = {
  schemaVersion: 1,
  executionMode: "ingest-staging",
  publish: false,
  githubRunId: process.env.GITHUB_RUN_ID || null,
  gitCommitSha: process.env.GITHUB_SHA || null,
  fileCount: entries.length,
  totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
  files: entries
};

writeJson("generated/intermediate/staging-evidence-manifest.json", manifest);
console.log(`Staging evidence manifest: ${manifest.fileCount} files, ${manifest.totalBytes} bytes.`);
