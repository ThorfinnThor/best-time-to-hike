import Link from "next/link";
import type { Locale } from "@/lib/data/types";

/**
 * Visible breadcrumbs. They mirror the BreadcrumbList structured data, and they
 * are also the internal links that keep destination pages from being orphans:
 * the indexability gate counts inbound links, and a page nothing links to is a
 * page that should not be indexed.
 */
export function Breadcrumbs({trail, locale}: {trail: Array<{name: string; path?: string}>; locale: Locale}) {
  return <nav className="breadcrumbs" aria-label={locale === "de" ? "Brotkrumen" : "Breadcrumb"}>
    <ol>
      {trail.map((step, index) => <li key={step.name}>
        {step.path && index < trail.length - 1
          ? <Link href={step.path}>{step.name}</Link>
          : <span aria-current="page">{step.name}</span>}
      </li>)}
    </ol>
  </nav>;
}
