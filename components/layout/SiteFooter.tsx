import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";
import { destinationName } from "@/lib/i18n/names";
import { getDestination } from "@/lib/data/load";
import { CookieSettingsButton } from "./CookieConsent";

export function SiteFooter({locale}:{locale:Locale}) {
  const copy = t(locale).footer;
  const pair = (first: string, second: string) => [first, second].map((slug) => {
    const destination = getDestination(slug);
    return destination ? destinationName(destination, locale) : slug;
  }).join(" vs ");
  const columns = [
    {title:copy.discover,links:[
      [links.finder(locale),copy.finder],
      [links.rankingIndex(locale),t(locale).header.nav.rankings],
      [links.blogIndex(locale),t(locale).header.nav.blog],
      [links.destination(locale,"mallorca"),copy.allMonthsFor("Mallorca")],
    ]},
    {title:copy.comparisons,links:[
      [links.compareIndex(locale),copy.compareTool],
      [links.compare(locale,"mallorca-vs-madeira"),pair("mallorca","madeira")],
      [links.compare(locale,"madeira-vs-tenerife"),pair("madeira","tenerife")],
      [links.compare(locale,"dolomites-vs-chamonix"),pair("dolomites","chamonix")],
    ]},
    {title:copy.about,links:[
      [links.methodology(locale),copy.methodologyAndData],
      [links.about(locale),copy.aboutUs],
      [links.privacy(locale),copy.privacy],
      [links.imprint(locale),copy.imprint],
    ]},
  ];
  return <footer className="site-footer">
    <div className="footer-grid"><div className="footer-brand"><span><i className="brand-mark">▲</i><strong>BestTimeToHike</strong></span><p>{copy.tagline}</p></div>{columns.map((column)=><div className="footer-column" key={column.title}><strong>{column.title}</strong>{column.links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}{column.title===copy.about ? <CookieSettingsButton label={copy.cookieSettings}/> : null}</div>)}</div>
    <div className="footer-bottom"><span>{copy.copyright}</span><span>{copy.disclaimer}</span></div>
  </footer>;
}
