import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { routes } from "@/lib/i18n/config";
import { DocumentLocale } from "@/components/i18n/DocumentLocale";

export function SiteHeader({locale}:{locale:Locale}) {
  const other = locale === "en" ? "de" : "en";
  const links = [
    {href:`/${locale}/finder`,label:"Finder"},
    {href:`/${locale}/${routes.rankings[locale]}/${locale === "de" ? "juni" : "june"}`,label:locale === "de" ? "Beste Ziele" : "Best destinations"},
    {href:`/${locale}/${routes.warm[locale]}/${locale === "de" ? "mai" : "may"}`,label:locale === "de" ? "Warm wandern" : "Warm hiking"},
    {href:`/${locale}/${routes.lowRain[locale]}/september`,label:locale === "de" ? "Wenig Regen" : "Low rain"},
    {href:`/${locale}/${routes.methodology[locale]}`,label:locale === "de" ? "Methodik" : "Methodology"},
  ];

  return <><DocumentLocale locale={locale}/><a className="skip-link" href="#main">{locale === "de" ? "Zum Inhalt springen" : "Skip to content"}</a><header className="site-header">
    <Link className="brand" href={`/${locale}`} aria-label="BestTimeToHike home"><span className="brand-mark">▲</span><span>BestTime<span>ToHike</span></span></Link>
    <nav className="desktop-nav" aria-label={locale === "de" ? "Hauptnavigation" : "Main navigation"}>
      {links.map((item)=><Link key={item.href} href={item.href}>{item.label}</Link>)}
      <span className="language-switch" aria-label={locale === "de" ? "Sprache" : "Language"}><Link className={locale === "de" ? "active" : ""} href="/de">DE</Link><Link className={locale === "en" ? "active" : ""} href="/en">EN</Link></span>
    </nav>
    <details className="mobile-nav"><summary>{locale === "de" ? "Menü" : "Menu"}</summary><nav aria-label={locale === "de" ? "Mobile Navigation" : "Mobile navigation"}>{links.map((item)=><Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href={`/${other}`}>{other.toUpperCase()}</Link></nav></details>
  </header></>;
}
