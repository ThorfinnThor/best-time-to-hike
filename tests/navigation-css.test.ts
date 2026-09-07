import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import postcss, { type AnyNode } from "postcss";

const css = postcss.parse(readFileSync("app/globals.css", "utf8"));

// A narrow static cascade check, complemented by browser checks: there must be
// no width between the desktop and menu breakpoints with neither navigation.
function display(selector: string, width: number) {
  let value = "block";
  let important = false;
  css.walkRules((rule) => {
    if (!rule.selectors.includes(selector)) return;
    for (let parent: AnyNode | undefined = rule.parent; parent; parent = parent.parent) {
      if (parent.type !== "atrule" || parent.name !== "media") continue;
      const max = /max-width:\s*(\d+)px/.exec(parent.params);
      const min = /min-width:\s*(\d+)px/.exec(parent.params);
      if ((max && width > Number(max[1])) || (min && width < Number(min[1]))) return;
    }
    rule.walkDecls("display", (declaration) => {
      if (important && !declaration.important) return;
      value = declaration.value;
      important = Boolean(declaration.important);
    });
  });
  return value;
}

test("phone, tablet and desktop widths always expose exactly one navigation", () => {
  for (const width of [320, 390, 640, 720, 721, 850, 980, 981, 1024, 1050, 1051, 1440]) {
    const desktop = display(".desktop-nav", width) !== "none";
    const menu = display(".mobile-nav", width) !== "none";
    assert.notEqual(desktop, menu, `${width}px must expose one navigation`);
  }
});

test("responsive navigation never hides individual destinations in the menu", () => {
  css.walkRules((rule) => {
    if (!rule.selectors.some((selector) => /\.(?:desktop|mobile)-nav\s*(?:>| )\s*(?:nav\s+)?a/.test(selector))) return;
    rule.walkDecls("display", (declaration) => {
      assert.notEqual(declaration.value, "none", `${rule.selector} silently removes a navigation link`);
    });
  });
});
