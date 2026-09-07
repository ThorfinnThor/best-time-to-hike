import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");
function luminance(hex: string): number {
  const [r, g, b] = hex.match(/../g)!.map(value => parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
function token(name: string): string {
  const value = css.match(new RegExp(`--${name}:#([0-9a-f]{6})`))?.[1];
  assert.ok(value, `Missing ${name} color token`);
  return value;
}

// Targeted palette regression, not a full rendered-page accessibility audit.
test("small secondary labels retain WCAG AA contrast on light surfaces", () => {
  for (const background of [token("paper"), token("cream"), token("mist"), "e1e8df"]) {
    assert.ok(contrast(token("fern"), background) >= 4.5);
  }
});
test("intro eyebrow retains WCAG AA contrast on its pale background", () => {
  const foreground = css.match(/\.page-intro \.eyebrow\{color:#([0-9a-f]{6})\}/)?.[1];
  const background = css.match(/\.page-intro\{[^}]*background:#([0-9a-f]{6})/)?.[1];
  assert.ok(foreground && background);
  assert.ok(contrast(foreground, background) >= 4.5);
});
