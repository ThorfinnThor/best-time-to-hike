import Link from "next/link";

export interface LinkGroup {
  title: string;
  links: Array<{href: string; label: string}>;
}

/**
 * A short block of related pages, drawn as the same chips the home page uses.
 *
 * Destination, month-ranking and area pages each answer one question and used
 * to stop there, so a reader (and a crawler) had no path from Mallorca to the
 * Mediterranean area page or from November to the regions open in November.
 * Callers decide what is related; this only draws it, and draws nothing when
 * every group is empty.
 */
export function ExploreLinks({eyebrow, heading, groups}: {eyebrow: string; heading: string; groups: LinkGroup[]}) {
  const filled = groups.filter((group) => group.links.length);
  if (!filled.length) return null;
  return <section className="content-section area-links">
    <div className="section-heading"><div>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{heading}</h2>
    </div></div>
    {filled.map((group) => <div key={group.title}>
      <h3>{group.title}</h3>
      <div className="month-chips">
        {group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
      </div>
    </div>)}
  </section>;
}
