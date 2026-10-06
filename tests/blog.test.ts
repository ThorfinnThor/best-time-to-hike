import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { BLOG_POSTS, blogIndexMayBeIndexed, blockSignature } from "../lib/blog/content";
import { locales } from "../lib/i18n/config";
import { links } from "../lib/i18n/links";
import { imageFor } from "../lib/media/images";
import { pathFor, resolvePageId } from "../lib/i18n/resolve";
import { pageSeo } from "../lib/seo/page-seo";
import sitemap from "../app/sitemap";

test("the approved bilingual blog entry route is indexable", () => {
  assert.equal(blogIndexMayBeIndexed(), true);
  for (const locale of locales) {
    const path = links.blogIndex(locale);
    const page = resolvePageId(locale, path.split("/").slice(2).filter(Boolean));
    assert.deepEqual(page, {kind: "blogIndex"});
    assert.equal(pageSeo(page!, locale).index, true);
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

function wordCount(value: unknown): number {
  if (typeof value === "string") return value.trim().split(/\s+/u).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + wordCount(item), 0);
  if (value && typeof value === "object") return Object.values(value).reduce((sum, item) => sum + wordCount(item), 0);
  return 0;
}

test("the first published batch clears the bilingual article quality floor", () => {
  assert.equal(BLOG_POSTS.length, 6);
  const titles = new Set<string>();
  for (const post of BLOG_POSTS) {
    assert.equal(post.status, "approved");
    assert.equal(post.publishedAt, "2026-09-30");
    assert.ok(post.heroImageSlug && imageFor(post.heroImageSlug), `${post.slug} needs a licensed hero image`);
    assert.ok(post.evidence.length >= 1, `${post.slug} needs an evidence manifest`);
    const evidenceKeys = new Set(post.evidence.map((item) => item.key));
    for (const item of post.evidence) {
      assert.equal(item.datasetVersion, "era5-land-representative-point-1991-2025-v1");
      assert.equal(item.checkedAt, "2026-09-30");
      assert.ok(item.sourcePaths.length > 0);
      for (const sourcePath of item.sourcePaths) assert.equal(fs.existsSync(sourcePath), true, `${post.slug}: missing ${sourcePath}`);
    }
    for (const locale of locales) {
      const translation = post.translations[locale];
      const count = wordCount(translation.blocks);
      assert.ok(count >= 700 && count <= 1200, `${post.slug}/${locale}: ${count} words`);
      assert.ok(translation.title.length >= 20);
      assert.ok(translation.title.length <= 60, `${post.slug}/${locale}: title is ${translation.title.length} characters`);
      assert.ok(translation.description.length >= 80);
      assert.ok(translation.description.length <= 155, `${post.slug}/${locale}: description is ${translation.description.length} characters`);
      assert.equal(titles.has(`${locale}:${translation.title}`), false, `duplicate title: ${locale}:${translation.title}`);
      titles.add(`${locale}:${translation.title}`);
      const evidenceRefs = translation.blocks.flatMap((block) => "evidenceKey" in block ? [block.evidenceKey] : []);
      assert.ok(evidenceRefs.length >= 3, `${post.slug}/${locale} needs at least three checked block references`);
      for (const key of evidenceRefs) assert.equal(evidenceKeys.has(key), true, `${post.slug}/${locale}: missing evidence ${key}`);
      const related = translation.blocks.find((block) => block.type === "destinationLinks");
      assert.ok(related && related.links.length >= 5, `${post.slug}/${locale} needs contextual links`);
      assert.ok(related?.links.some((link) => link.href === links.methodology(locale)));
      const navigationLinks = new Set([
        links.finder(locale),
        links.rankingIndex(locale),
        links.themeIndex(locale, "warm"),
        links.themeIndex(locale, "snowFree"),
        links.themeIndex(locale, "lowRain"),
      ]);
      assert.ok(related?.links.some((link) => navigationLinks.has(link.href)));
      const destinationPrefix = links.destination(locale, "").replace(/\/$/u, "");
      assert.ok((related?.links.filter((link) => link.href.startsWith(destinationPrefix)).length ?? 0) >= 3);
      for (const link of related?.links ?? []) assert.equal(link.href.startsWith(`/${locale}/`), true, `${post.slug}/${locale}: locale leak in ${link.href}`);
    }
  }
});

test("the approved bilingual articles enter the index and sitemap", () => {
  const blogUrls = sitemap().filter((entry) => entry.url.includes("/blog"));
  assert.equal(blogUrls.length, 14, "six articles plus two localized index pages should produce fourteen blog URLs");
  for (const locale of locales) {
    const index = pageSeo({kind: "blogIndex"}, locale);
    assert.equal(index.index, true);
    assert.ok(blogUrls.some((entry) => entry.url.endsWith(`/${locale}/blog`)));
    for (const post of BLOG_POSTS) {
      const seo = pageSeo({kind: "blogPost", slug: post.slug}, locale);
      assert.equal(seo.index, true);
      assert.deepEqual(seo.reasons, []);
      assert.ok(blogUrls.some((entry) => entry.url.endsWith(`/${locale}/blog/${post.slug}`)));
    }
  }
});
