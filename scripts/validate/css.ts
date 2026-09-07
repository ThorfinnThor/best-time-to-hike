import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Two static checks on the stylesheet, for the class of fault in mistakes.md #22.
 *
 * A footer was rebuilt and its old rules were left behind. One of them,
 * `.site-footer>div:first-child{max-width:380px}`, still matched the markup that
 * replaced it and beat the new class on specificity, so a 1200px column rendered
 * at 380px on every page. Nothing failed: the build passed, the determinism guard
 * passed, no test noticed. It reached the operator on the deployed site.
 *
 * Neither check needs a browser, and neither is a substitute for measuring a
 * rendered box. They catch the two things that made that bug possible.
 */
const CSS = "app/globals.css";
const MARKUP_ROOTS = ["app", "components"];

/** Sizing a box by its position in its parent is what silently adopts new markup. */
const BOX_PROPERTIES = /(^|;)\s*(width|max-width|min-width|margin|margin-left|margin-right|inset-inline|inset-inline-start|inset-inline-end)\s*:/;
const POSITIONAL = /:(first|last|nth|only)-(child|of-type)/;

/** Classes that exist for a state a stylesheet names but no component spells out. */
const KNOWN_DYNAMIC = new Set(["active", "saved", "winner", "has-photo", "open", "closed", "small", "large", "light", "dark"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

const css = readFileSync(CSS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({selector: selector.trim(), body}));

const problems: string[] = [];

for (const {selector, body} of rules) {
  if (selector.startsWith("@") || !POSITIONAL.test(selector)) continue;
  const offending = body.split(";").filter((declaration) => BOX_PROPERTIES.test(`;${declaration}`));
  for (const declaration of offending) {
    problems.push(`${selector} sets ${declaration.trim()}. A rule that selects by position adopts whatever markup lands there, and its specificity usually wins. Size the box through a class the component owns.`);
  }
}

// Every class the stylesheet targets should be one some component asks for.
const markup = MARKUP_ROOTS.flatMap(sourceFiles).map((file) => readFileSync(file, "utf8")).join("\n");
const spelled = new Set<string>();
for (const [, quoted] of markup.matchAll(/["'`]([^"'`\n]*)["'`]/g)) {
  for (const word of quoted.split(/[\s${}?:]+/)) if (/^[a-z][a-z0-9-]*$/.test(word)) spelled.add(word);
}
const targeted = new Set([...css.matchAll(/\.([a-z][a-z0-9-]*)/g)].map(([, name]) => name));
const orphans = [...targeted].filter((name) => !spelled.has(name) && !KNOWN_DYNAMIC.has(name)).sort();
for (const orphan of orphans) {
  problems.push(`.${orphan} is styled but no component asks for it. When markup is replaced its CSS is part of the deletion; a rule left behind is the one that bites later.`);
}

if (problems.length) {
  console.error(`CSS guard: ${problems.length} problem(s) in ${CSS}`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`CSS guard passed: ${rules.length} rules, ${targeted.size} classes, none orphaned and none sized by position.`);
