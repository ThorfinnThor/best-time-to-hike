import type { Locale, PublicDestination } from "@/lib/data/types";
import { longformSections } from "@/lib/seo/longform";

/**
 * The destination article. Section selection comes from the destination's own
 * profile, so pages differ in shape and not only in their numbers.
 */
export function LongformArticle({destination, locale}: {destination: PublicDestination; locale: Locale}) {
  const sections = longformSections(destination, locale);
  if (!sections.length) return null;
  return <section className="content-section longform">
    {sections.map((section) => <article key={section.heading}>
      <h2>{section.heading}</h2>
      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </article>)}
  </section>;
}
