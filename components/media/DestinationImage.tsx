import { cardFileFor, imageFor } from "@/lib/media/images";

/**
 * A destination photograph, or the generated topographic placeholder when no
 * acceptably licensed one exists. The placeholder is a first-class outcome:
 * some destinations have no freely licensed landscape photograph, and an
 * honest blank is better than a picture of somewhere else.
 *
 * Cards load the 960px copy; only an article hero needs the 2400px source.
 */
export function DestinationImage({slug, name, region, className = "", size = "card", priority = false}: {
  slug: string; name: string; region?: string; className?: string;
  /** "hero" loads the 2400px source; every card loads the 960px copy. */
  size?: "card" | "hero";
  /** For the image most likely to be the largest paint: load it now, not when scrolled to. */
  priority?: boolean;
}) {
  const image = imageFor(slug);
  if (!image) {
    return <div className={`destination-card-art ${className}`} aria-hidden="true">
      {region ? <span>{region}</span> : null}
      <div className="mini-mountain mini-mountain-back" />
      <div className="mini-mountain mini-mountain-front" />
    </div>;
  }
  return <div className={`destination-card-art has-photo ${className}`}>
    {region ? <span>{region}</span> : null}
    <img src={size === "hero" ? image.file : cardFileFor(image.file)} alt={`${name} landscape`}
      loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" width={1200} height={800} />
  </div>;
}
