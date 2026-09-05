import type { Metadata } from "next";
import { notFound } from "next/navigation";
import weights from "@/data-config/scoring/weights.json";
import { allImages } from "@/lib/media/images";
import { Finder } from "@/components/finder/Finder";
import { HomePage } from "@/components/home/HomePage";
import { ComparisonPage, DestinationPage, FixtureNotice, MethodNote, MonthPage, RankingPage } from "@/components/hiking/Pages";
import { LongformArticle } from "@/components/seo/LongformArticle";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getComparison, getComparisonIndex, getDestination, getRanking, getSearchIndex } from "@/lib/data/load";
import { locales, monthName, themes } from "@/lib/i18n/config";
import { t, taxonomyLabel } from "@/lib/i18n/dict";
import { altLanguages } from "@/lib/i18n/links";
import { absoluteUrl, SITE } from "@/lib/site";
import { pathFor, resolvePageId, type PageId } from "@/lib/i18n/resolve";
import { pageSeo } from "@/lib/seo/page-seo";
import { breadcrumbLd, destinationFaqLd, organisationLd, webSiteLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { routeCatalog } from "@/lib/seo/route-catalog";
import type { ComponentScores, Locale } from "@/lib/data/types";

type Params = Promise<{locale:string;segments?:string[]}>;
export const dynamicParams = false;
export const dynamic = "force-static";
export function generateStaticParams(){return routeCatalog().filter((route)=>route.segments.length>0);}

function unusedPageTitle(locale:Locale,page:PageId):string {
  const copy = t(locale);
  switch (page.kind) {
    case "home": return copy.info.homeTitle;
    case "finder": return copy.finder.pageHeading;
    case "destination": { const destination=getDestination(page.slug); return destination ? destination.name : copy.brand; }
    case "destinationMonth": { const destination=getDestination(page.slug); return destination ? `${destination.name} · ${monthName(page.month,locale)}` : copy.brand; }
    case "ranking": return copy.ranking.headingIn(monthName(page.month,locale));
    case "themeRanking": return copy.ranking.themeTitle(copy.ranking.themes[page.theme], monthName(page.month,locale));
    case "compare": return page.slug.replaceAll("-"," ");
    case "info": return copy.info[page.key].title;
  }
}

export async function generateMetadata({params}:{params:Params}):Promise<Metadata> {
  const {locale:raw,segments=[]}=await params;
  if(!locales.includes(raw as Locale)) return {};
  const locale=raw as Locale;
  const page=resolvePageId(locale,segments);
  if(!page) return {};
  const seo = pageSeo(page, locale);
  const canonical = absoluteUrl(pathFor(page, locale));
  return {
    title: seo.title,
    description: seo.description,
    alternates: altLanguages((target)=>pathFor(page,target), locale),
    // Crawlable either way; only pages that answer a question with substance
    // enter the index. See lib/seo/page-seo.ts for why.
    robots: {index: seo.index, follow: true},
    openGraph: {
      type: "article",
      siteName: SITE.name,
      locale: locale === "de" ? "de_DE" : "en_GB",
      title: seo.title,
      description: seo.description,
      url: canonical,
      images: [{url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: seo.title}],
    },
    twitter: {card: "summary_large_image", title: seo.title, description: seo.description},
  };
}

function InformationPage({locale,pageKey}:{locale:Locale;pageKey:"methodology"|"about"|"privacy"|"imprint"|"credits"}) {
  const copy = t(locale);
  const data = copy.info[pageKey];
  // Widen away from the `as const` literal tuple: mapping over a union of
  // differently shaped readonly tuples is not callable in TypeScript.
  const paragraphs: readonly string[] = data.paragraphs;
  const componentLabels = copy.components;
  return <>
    <section className="page-intro prose-intro"><span className="eyebrow">{copy.brand}</span><h1>{data.title}</h1>{paragraphs.map((paragraph)=><p key={paragraph}>{paragraph}</p>)}</section>
    {pageKey==="credits" && <section className="credit-list">
      <p className="credit-count">{allImages().length}</p>
      <ul>{allImages().map((image)=><li key={image.slug}>
        <strong>{image.slug.replaceAll("-"," ")}</strong>
        <a href={image.sourceUrl} rel="noopener noreferrer" target="_blank">{image.sourceFile}</a>
        <span>{image.attribution}</span>
      </li>)}</ul>
    </section>}
    {pageKey==="methodology" && <section className="weight-diagram">{(Object.entries(weights.overall) as Array<[keyof ComponentScores,number]>).map(([key,weight])=><div key={key}><span>{componentLabels[key]}</span><strong>{Math.round(weight*100)}%</strong></div>)}</section>}
    <MethodNote locale={locale}/>
  </>;
}

function FinderPage({locale}:{locale:Locale}) {
  const copy = t(locale).finder;
  return <><FixtureNotice locale={locale}/><section className="page-intro"><span className="eyebrow">{copy.pageEyebrow}</span><h1>{copy.pageHeading}</h1><p>{copy.pageSub}</p></section><div className="finder-page"><Finder destinations={getSearchIndex()} locale={locale}/></div></>;
}

function renderPage(locale:Locale,page:PageId):React.ReactNode {
  switch (page.kind) {
    case "home": return <><JsonLd data={webSiteLd(locale)}/><JsonLd data={organisationLd()}/><HomePage locale={locale}/></>;
    case "finder": return <FinderPage locale={locale}/>;
    case "destination": { const destination=getDestination(page.slug); if(!destination) notFound();
      const trail=[{name: t(locale).brand, path: pathFor({kind:"home"}, locale)},
                   {name: taxonomyLabel(locale, "continents", destination.continent), path: pathFor({kind:"finder"}, locale)},
                   {name: destination.name, path: pathFor(page, locale)}];
      return <>
      <JsonLd data={breadcrumbLd(trail)}/>
      <Breadcrumbs trail={trail} locale={locale}/>
      <JsonLd data={destinationFaqLd(destination, locale)}/>
      <DestinationPage destination={destination} locale={locale}/>
      <LongformArticle destination={destination} locale={locale}/>
    </>; }
    case "destinationMonth": { const destination=getDestination(page.slug); if(!destination) notFound(); return <MonthPage destination={destination} month={page.month} locale={locale}/>; }
    case "ranking": return <RankingPage ranking={getRanking(page.month)} locale={locale}/>;
    case "themeRanking": { const copy=t(locale); const title=copy.ranking.themeTitle(copy.ranking.themes[page.theme], monthName(page.month,locale)); return <RankingPage ranking={getRanking(page.month,themes[page.theme])} locale={locale} title={title}/>; }
    case "compare": { if(!getComparisonIndex().some((item)=>item.slug===page.slug)) notFound(); return <ComparisonPage comparison={getComparison(page.slug)} locale={locale}/>; }
    case "info": return <InformationPage locale={locale} pageKey={page.key}/>;
  }
}

export default async function LocalizedPage({params}:{params:Params}) {
  const {locale:raw,segments=[]}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const page=resolvePageId(locale,segments);
  if(!page) notFound();
  return <><SiteHeader locale={locale} page={page}/><main id="main">{renderPage(locale,page)}</main><SiteFooter locale={locale}/></>;
}
