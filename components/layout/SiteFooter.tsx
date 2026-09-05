import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { monthName } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";

export function SiteFooter({locale}:{locale:Locale}) {
  const copy = t(locale).footer;
  const columns = [
    {title:copy.discover,links:[
      [links.finder(locale),copy.finder],
      [links.ranking(locale,6),copy.bestInMonth(monthName(6,locale))],
      [links.destination(locale,"mallorca"),copy.allMonthsFor("Mallorca")],
    ]},
    {title:copy.comparisons,links:[
      [links.compare(locale,"mallorca-vs-madeira"),"Mallorca vs Madeira"],
      [links.compare(locale,"madeira-vs-tenerife"),"Madeira vs Tenerife"],
      [links.compare(locale,"dolomites-vs-chamonix"),"Dolomites vs Chamonix"],
    ]},
    {title:copy.about,links:[
      [links.methodology(locale),copy.methodologyAndData],
      [links.about(locale),copy.aboutUs],
      [links.privacy(locale),copy.privacy],
      [links.imprint(locale),copy.imprint],
    ]},
  ];
  return <footer className="site-footer">
    <div className="footer-grid"><div className="footer-brand"><span><i className="brand-mark">▲</i><strong>BestTimeToHike</strong></span><p>{copy.tagline}</p></div>{columns.map((column)=><div className="footer-column" key={column.title}><strong>{column.title}</strong>{column.links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</div>)}</div>
    <div className="footer-bottom"><span>{copy.copyright}</span><span>{copy.disclaimer}</span></div>
  </footer>;
}
