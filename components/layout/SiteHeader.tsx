import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { otherLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";
import { pathFor, type PageId } from "@/lib/i18n/resolve";
import { DocumentLocale } from "@/components/i18n/DocumentLocale";

export function SiteHeader({locale,page}:{locale:Locale;page?:PageId}) {
  const copy = t(locale).header;
  const other = otherLocale(locale);
  // The language switch keeps the reader on the same page, not on the other
  // locale home. `page` is optional so the header still renders without it.
  const inLocale = (target: Locale) => (page ? pathFor(page, target) : links.home(target));
  const navLinks = [
    {href:links.finder(locale),label:copy.nav.finder},
    {href:links.ranking(locale,6),label:copy.nav.rankings},
    {href:links.compareIndex(locale),label:copy.nav.compare},
    {href:links.themeRanking(locale,"warm",5),label:copy.nav.warm},
    {href:links.themeRanking(locale,"lowRain",9),label:copy.nav.lowRain},
    {href:links.methodology(locale),label:copy.nav.methodology},
  ];

  return <><DocumentLocale locale={locale}/><a className="skip-link" href="#main">{copy.skip}</a><header className="site-header">
    <Link className="brand" href={links.home(locale)} aria-label={copy.homeAria}><span className="brand-mark">▲</span><span>BestTime<span>ToHike</span></span></Link>
    <nav className="desktop-nav" aria-label={copy.navAria}>
      {navLinks.map((item)=><Link key={item.href} href={item.href}>{item.label}</Link>)}
      <span className="language-switch" aria-label={copy.languageAria}><Link className={locale === "de" ? "active" : ""} href={inLocale("de")}>DE</Link><Link className={locale === "en" ? "active" : ""} href={inLocale("en")}>EN</Link></span>
    </nav>
    <details className="mobile-nav"><summary>{copy.menu}</summary><nav aria-label={copy.mobileNavAria}>{navLinks.map((item)=><Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href={inLocale(other)}>{other.toUpperCase()}</Link></nav></details>
  </header></>;
}
