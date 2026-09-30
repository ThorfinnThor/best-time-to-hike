import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { getBlogPost, blogPostsForLocale, type BlogBlock, type BlogPost } from "@/lib/blog/content";
import { imageFor } from "@/lib/media/images";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";

function Block({block}: {block: BlogBlock; locale: Locale}) {
  switch (block.type) {
    case "paragraph": return <p>{block.text}</p>;
    case "heading": return block.level === 2 ? <h2>{block.text}</h2> : <h3>{block.text}</h3>;
    case "metricCallout": return <aside className="blog-metric" aria-label={block.label}><span>{block.label}</span><strong>{block.value}</strong><p>{block.detail}</p></aside>;
    case "comparisonTable": return <figure className="blog-table"><figcaption>{block.caption}</figcaption><table><thead><tr>{block.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{block.rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${index}`}>{value}</td>)}</tr>)}</tbody></table></figure>;
    case "monthStrip": return <figure className="blog-month-strip"><figcaption>{block.caption}</figcaption><div>{block.months.map((month) => month.href ? <Link href={month.href} key={`${month.month}-${month.label}`}><strong>{month.label}</strong><span>{month.note}</span></Link> : <span key={`${month.month}-${month.label}`}><strong>{month.label}</strong><span>{month.note}</span></span>)}</div></figure>;
    case "timeline": return <figure className="blog-timeline"><figcaption>{block.caption}</figcaption><ol>{block.points.map((point) => <li key={point.label}><strong>{point.label}</strong><span>{point.value}</span>{point.detail ? <small>{point.detail}</small> : null}</li>)}</ol></figure>;
    case "pullQuote": return <blockquote className="blog-quote">“{block.text}”{block.attribution ? <cite>{block.attribution}</cite> : null}</blockquote>;
    case "destinationLinks": return <section className="blog-related"><h2>{block.heading}</h2><div>{block.links.map((link) => <Link href={link.href} key={link.href}><strong>{link.label}</strong><span>{link.detail}</span></Link>)}</div></section>;
    case "caveat": return <aside className="blog-caveat">{block.text}</aside>;
  }
}

function publishedDate(post: BlogPost, locale: Locale): string {
  if (!post.publishedAt) return "";
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${post.publishedAt}T00:00:00Z`));
}

function Article({post, locale}: {post: BlogPost; locale: Locale}) {
  const translation = post.translations[locale];
  const image = post.heroImageSlug ? imageFor(post.heroImageSlug) : null;
  return <article className="blog-post">
    <header className="blog-post-header">
      <span className="eyebrow">{t(locale).blog.categories[translation.category]}</span>
      <h1>{translation.title}</h1>
      <p>{translation.description}</p>
      <small>{t(locale).blog.readingTime(translation.readingMinutes)}</small>
    </header>
    {image ? <figure className="blog-hero-image"><Image src={image.file} alt={translation.heroAlt} width={2400} height={1600} priority sizes="(max-width: 720px) 100vw, 1200px"/><figcaption>{image.attribution}</figcaption></figure> : null}
    <div className="blog-blocks">{translation.blocks.map((block, index) => <Block block={block} locale={locale} key={`${block.type}-${index}`}/>)}</div>
  </article>;
}

export function BlogIndex({locale}: {locale: Locale}) {
  const copy = t(locale).blog;
  const posts = blogPostsForLocale(locale);
  return <>
    <section className="page-intro blog-intro"><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.heading}</h1><p>{copy.intro}</p></section>
    <section className="content-section blog-archive" aria-labelledby="blog-archive-heading">
      <div className="section-heading"><div><span className="eyebrow">{copy.indexLabel}</span><h2 id="blog-archive-heading">{posts.length ? copy.heading : copy.emptyHeading}</h2><p>{posts.length ? copy.intro : copy.emptyBody}</p></div></div>
      {posts.length ? <div className="blog-card-grid">{posts.map((post) => {
        const translation = post.translations[locale];
        const image = post.heroImageSlug ? imageFor(post.heroImageSlug) : null;
        return <Link className="blog-card" href={links.blogPost(locale, post.slug)} key={post.slug}>
          <div className="blog-card-media">
            {image ? <Image src={image.file} alt="" fill sizes="(max-width: 720px) 100vw, (max-width: 1050px) 50vw, 33vw" /> : <div className="blog-card-media-fallback" aria-hidden="true" />}
            <span className="blog-card-badge">{copy.categories[translation.category]}</span>
          </div>
          <div className="blog-card-body">
            <div className="blog-card-meta"><time dateTime={post.publishedAt ?? post.modifiedAt}>{publishedDate(post, locale)}</time><span aria-hidden="true">·</span><span>{copy.readingTime(translation.readingMinutes)}</span></div>
            <h3>{translation.title}</h3>
            <p>{translation.description}</p>
          </div>
        </Link>;
      })}</div> : <div className="blog-empty"><strong>{copy.emptyHeading}</strong><p>{copy.emptyBody}</p></div>}
    </section>
  </>;
}

export function BlogPostPage({slug, locale}: {slug: string; locale: Locale}) {
  const post = getBlogPost(slug);
  return post ? <Article post={post} locale={locale}/> : null;
}
