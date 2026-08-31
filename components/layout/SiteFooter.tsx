import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { comparePath, destinationPath, rankingPath, routes } from "@/lib/i18n/config";

export function SiteFooter({locale}:{locale:Locale}) {
  const columns = [
    {title:locale === "de" ? "Entdecken" : "Discover",links:[
      [`/${locale}/finder`,locale === "de" ? "Wander-Finder" : "Hiking finder"],
      [rankingPath(locale,6),locale === "de" ? "Beste Ziele im Juni" : "Best destinations in June"],
      [destinationPath(locale,"mallorca"),locale === "de" ? "Alle Monate: Mallorca" : "All months: Mallorca"],
    ]},
    {title:locale === "de" ? "Vergleiche" : "Comparisons",links:[
      [comparePath(locale,"mallorca-vs-madeira"),"Mallorca vs Madeira"],
      [comparePath(locale,"madeira-vs-tenerife"),"Madeira vs Tenerife"],
      [comparePath(locale,"dolomites-vs-chamonix"),"Dolomites vs Chamonix"],
    ]},
    {title:locale === "de" ? "Über" : "About",links:[
      [`/${locale}/${routes.methodology[locale]}`,locale === "de" ? "Methodik & Daten" : "Methodology & data"],
      [`/${locale}/${routes.about[locale]}`,locale === "de" ? "Über uns" : "About us"],
      [`/${locale}/${routes.privacy[locale]}`,locale === "de" ? "Datenschutz" : "Privacy"],
      [`/${locale}/${routes.imprint[locale]}`,locale === "de" ? "Impressum" : "Imprint"],
    ]},
  ];
  return <footer className="site-footer">
    <div className="footer-grid"><div className="footer-brand"><span><i className="brand-mark">▲</i><strong>BestTimeToHike</strong></span><p>{locale === "de" ? "Historische Klima- und Höhendaten für bessere Wanderentscheidungen." : "Historical climate and elevation data for better hiking decisions."}</p></div>{columns.map((column)=><div className="footer-column" key={column.title}><strong>{column.title}</strong>{column.links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</div>)}</div>
    <div className="footer-bottom"><span>© 2026 BestTimeToHike</span><span>{locale === "de" ? "Historische Klimatologie, keine Wettervorhersage." : "Historical climatology, not a weather forecast."}</span></div>
  </footer>;
}
