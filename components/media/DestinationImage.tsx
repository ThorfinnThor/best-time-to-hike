import { imageFor } from "@/lib/media/images";

/**
 * A destination photograph, or the generated topographic placeholder when no
 * acceptably licensed one exists. The placeholder is a first-class outcome:
 * some destinations have no freely licensed landscape photograph, and an
 * honest blank is better than a picture of somewhere else.
 */
export function DestinationImage({slug, name, region, className = ""}: {slug: string; name: string; region?: string; className?: string}) {
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
    <img src={image.file} alt={`${name} landscape`} loading="lazy" decoding="async" width={1200} height={800} />
  </div>;
}
