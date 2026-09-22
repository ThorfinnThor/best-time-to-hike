import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const OUT = "out";
const targetDirectory = process.argv[2] ?? "/private/tmp/best-time-to-hike-visual-routes";
const CHUNK_SIZE = 750;

function htmlRoutes(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlRoutes(path);
    if (entry.name !== "index.html") return [];
    const routeDirectory = relative(OUT, dirname(path)).split(sep).join("/");
    return [routeDirectory ? `/${routeDirectory}/` : "/"];
  });
}

const routes = htmlRoutes(OUT).filter((route) => route !== "/404/").sort();
const parts = Array.from({ length: Math.ceil(routes.length / CHUNK_SIZE) }, (_, index) => `part-${index}/`);
mkdirSync(targetDirectory, { recursive: true });
writeFileSync(join(targetDirectory, "index.html"), `${JSON.stringify({ count: routes.length, parts })}\n`);
for (const [index, part] of parts.entries()) {
  const directory = join(targetDirectory, part);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), `${JSON.stringify(routes.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE))}\n`);
}
console.log(`Visual route manifest: ${routes.length} public HTML routes in ${parts.length} parts written to ${targetDirectory}.`);
