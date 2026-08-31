import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { readJson, ROOT } from "../lib/io";

const errors: string[] = [];
const assert = (condition: unknown, message: string) => { if (!condition) errors.push(message); };
const files = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]
);

const invariants = readJson<Record<string, unknown>>("config/architecture-invariants.json");
const allowlist = readJson<{runtime:string[];development:string[]}>("config/dependency-allowlist.json");
const packageJson = readJson<{dependencies:Record<string,string>;devDependencies:Record<string,string>}>("package.json");
const runtimeDependencies = Object.keys(packageJson.dependencies).sort();
const developmentDependencies = Object.keys(packageJson.devDependencies).sort();
assert(JSON.stringify(runtimeDependencies) === JSON.stringify([...allowlist.runtime].sort()), `Runtime dependency drift: ${runtimeDependencies.join(", ")}`);
assert(JSON.stringify(developmentDependencies) === JSON.stringify([...allowlist.development].sort()), `Development dependency drift: ${developmentDependencies.join(", ")}`);

const runtimeRoots = ["app", "components", "lib"];
const forbidden = [
  { pattern: /\bfetch\s*\(/, label: "runtime fetch" },
  { pattern: /\b(?:axios|got)\b/, label: "runtime HTTP client" },
  { pattern: /(?:@prisma|postgres|pg|mongodb|supabase)/i, label: "runtime database client" },
  { pattern: /(?:data-snapshots|scripts\/(?:import|normalize|score|export))/, label: "build/ingest boundary import" }
];
for (const root of runtimeRoots) {
  for (const file of files(join(ROOT, root)).filter((value) => [".ts", ".tsx", ".js", ".jsx"].includes(extname(value)))) {
    const source = readFileSync(file, "utf8");
    for (const rule of forbidden) assert(!rule.pattern.test(source), `${relative(ROOT, file)} violates ${rule.label} invariant`);
  }
}

const nextConfig = readFileSync(join(ROOT, "next.config.ts"), "utf8");
const wranglerConfig = readFileSync(join(ROOT, "wrangler.jsonc"), "utf8");
const robotsSource = readFileSync(join(ROOT, "app/robots.ts"), "utf8");
const sitemapSource = readFileSync(join(ROOT, "app/sitemap.ts"), "utf8");
assert(/output:\s*["']export["']/.test(nextConfig), "Next.js must remain a static export");
assert(/images:\s*\{\s*unoptimized:\s*true/.test(nextConfig), "Static export must keep Next images unoptimized");
assert(packageJson.devDependencies.tsx!==undefined&&readFileSync(join(ROOT,"package.json"),"utf8").includes('"postbuild": "tsx scripts/export/fix-static-languages.ts"'),"Static locale post-build must remain enabled");
assert(/pages_build_output_dir\s*["']?\s*:\s*["']\.\/out["']/.test(wranglerConfig), "Cloudflare Pages output must be ./out");
assert(robotsSource.includes('disallow:"/"'), "Fixture robots policy must disallow crawling");
assert(sitemapSource.includes("return []"), "Fixture sitemap policy must emit no URLs");
assert(invariants.runtimeDatabase === false && invariants.runtimeClimateApi === false && invariants.runtimeDemApi === false, "Runtime data-source invariants must remain disabled");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Architecture guard passed: ${runtimeDependencies.length} runtime dependencies, static JSON-only deployment.`);
