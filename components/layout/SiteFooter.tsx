import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { routes } from "@/lib/i18n/config";

export function SiteFooter({locale}:{locale:Locale}) {
  return <footer className="site-footer">
    <div><span className="brand-mark">▲</span><strong>BestTimeToHike</strong><p>{locale === "de" ? "Historische Klima- und Höhendaten für bessere Wanderentscheidungen." : "Historical climate and elevation data for better hiking decisions."}</p></div>
    <div className="footer-links"><Link href={`/${locale}/${routes.methodology[locale]}`}>{locale === "de" ? "Methodik" : "Methodology"}</Link><Link href={`/${locale}/${routes.about[locale]}`}>{locale === "de" ? "Über uns" : "About"}</Link><Link href={`/${locale}/${routes.privacy[locale]}`}>{locale === "de" ? "Datenschutz" : "Privacy"}</Link><Link href={`/${locale}/${routes.imprint[locale]}`}>{locale === "de" ? "Impressum" : "Imprint"}</Link></div>
  </footer>;
}
