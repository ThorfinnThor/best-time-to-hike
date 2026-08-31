import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { routes } from "@/lib/i18n/config";

export function SiteHeader({locale}:{locale:Locale}) {
  const other = locale === "en" ? "de" : "en";
  return <header className="site-header">
    <Link className="brand" href={`/${locale}`} aria-label="BestTimeToHike home"><span className="brand-mark">▲</span><span>BestTime<span>ToHike</span></span></Link>
    <nav aria-label={locale === "de" ? "Hauptnavigation" : "Main navigation"}>
      <Link href={`/${locale}/finder`}>{locale === "de" ? "Finder" : "Finder"}</Link>
      <Link href={`/${locale}/${routes.rankings[locale]}/${locale === "de" ? "juni" : "june"}`}>{locale === "de" ? "Ranglisten" : "Rankings"}</Link>
      <Link href={`/${locale}/${routes.methodology[locale]}`}>{locale === "de" ? "Methodik" : "Methodology"}</Link>
      <Link className="locale-switch" href={`/${other}`}>{other.toUpperCase()}</Link>
    </nav>
  </header>;
}
