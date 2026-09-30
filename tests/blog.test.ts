import test from "node:test";
import assert from "node:assert/strict";
import { BLOG_POSTS, blogIndexMayBeIndexed, blockSignature } from "../lib/blog/content";
import { locales } from "../lib/i18n/config";
import { links } from "../lib/i18n/links";
import { pathFor, resolvePageId } from "../lib/i18n/resolve";
import { pageSeo } from "../lib/seo/page-seo";

test("the bilingual blog entry route is crawlable but not indexable while empty", () => {
  assert.equal(blogIndexMayBeIndexed(), false);
  for (const locale of locales) {
    const path = links.blogIndex(locale);
    const page = resolvePageId(locale, path.split("/").slice(2).filter(Boolean));
    assert.deepEqual(page, {kind: "blogIndex"});
    assert.equal(pageSeo(page!, locale).index, false);
  }
});

test("blog routes are locale-safe and never manufacture an unregistered article", () => {
  assert.equal(resolvePageId("en", ["blog", "not-a-real-post"]), null);
  assert.equal(resolvePageId("de", ["blog", "not-a-real-post"]), null);
  assert.equal(pathFor({kind: "blogIndex"}, "en"), "/en/blog");
});

test("approved articles cannot reuse an ordered block signature", () => {
  const signatures = new Set<string>();
  for (const post of BLOG_POSTS) {
    for (const locale of locales) {
      const signature = `${locale}:${blockSignature(post, locale)}`;
      assert.equal(signatures.has(signature), false, `duplicate block signature: ${signature}`);
      signatures.add(signature);
    }
  }
});
