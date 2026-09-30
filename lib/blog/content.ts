import type { Locale } from "@/lib/data/types";

/**
 * The blog deliberately uses a composable block vocabulary. A post may use
 * only the blocks its argument needs, so article pages cannot become one
 * repeated SEO template with a destination name swapped in.
 */
export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "metricCallout"; label: string; value: string; detail: string; evidenceKey: string }
  | { type: "comparisonTable"; caption: string; columns: string[]; rows: Array<{label: string; values: string[]}>; evidenceKey: string }
  | { type: "monthStrip"; caption: string; months: Array<{month: number; label: string; note: string; href?: string}>; evidenceKey: string }
  | { type: "timeline"; caption: string; points: Array<{label: string; value: string; detail?: string}>; evidenceKey: string }
  | { type: "pullQuote"; text: string; attribution?: string }
  | { type: "destinationLinks"; heading: string; links: Array<{label: string; href: string; detail: string}> }
  | { type: "caveat"; text: string };

export interface BlogTranslation {
  title: string;
  description: string;
  heroAlt: string;
  category: "seasonal" | "data-insight" | "planning";
  readingMinutes: number;
  blocks: BlogBlock[];
}

export interface BlogEvidence {
  key: string;
  datasetVersion: string;
  description: string;
  sourcePaths: string[];
  checkedAt: string;
}

export interface BlogPost {
  slug: string;
  status: "draft" | "approved";
  publishedAt: string | null;
  modifiedAt: string;
  heroImageSlug: string | null;
  evidence: BlogEvidence[];
  translations: Record<Locale, BlogTranslation>;
}

/**
 * Sol supplies the first approved posts after the editorial audit. Keeping the
 * scaffold empty means the public blog is not a thin archive or an accidental
 * index surface while the content is still being researched.
 */
export const BLOG_POSTS: readonly BlogPost[] = [];

export function blogPostSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}

export function getBlogPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

export function blogPostsForLocale(locale: Locale): BlogPost[] {
  return BLOG_POSTS.filter((post) => Boolean(post.translations[locale]));
}

/** The index gate stays closed until at least three complete posts are approved. */
export function blogIndexMayBeIndexed(): boolean {
  const approved = BLOG_POSTS.filter((post) => post.status === "approved" && post.publishedAt);
  return approved.length >= 3 && approved.every((post) => post.translations.en && post.translations.de);
}

export function blogPostMayBeIndexed(post: BlogPost): boolean {
  return blogIndexMayBeIndexed() && post.status === "approved" && Boolean(post.publishedAt);
}

/** Distinct ordered block types are part of the quality gate, not decoration. */
export function blockSignature(post: BlogPost, locale: Locale): string {
  return post.translations[locale].blocks.map((block) => block.type).join(">");
}
