import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import weights from "@/data-config/scoring/weights.json";
import { allImages } from "@/lib/media/images";
import { licenceUrl, sourceLicenceUrl } from "@/lib/media/licence";
import { Finder } from "@/components/finder/Finder";
import { HomePage } from "@/components/home/HomePage";
import { ComparisonPage, DestinationPage, MethodNote, MonthPage, RankingPage } from "@/components/hiking/Pages";
import { LongformArticle } from "@/components/seo/LongformArticle";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getAllDestinations, getComparison, getComparisonIndex, getDestination, getRanking, getSearchIndex } from "@/lib/data/load";
import { locales, monthName, themes } from "@/lib/i18n/config";
import { t, taxonomyLabel } from "@/lib/i18n/dict";
import { altLanguages } from "@/lib/i18n/links";
import { absoluteUrl, SITE } from "@/lib/site";
import { pathFor, resolvePageId, type PageId } from "@/lib/i18n/resolve";
import { pageSeo } from "@/lib/seo/page-seo";
import { breadcrumbLd, destinationFaqLd, organisationLd, rankingLd, webSiteLd } from "@/lib/seo/jsonld";
import { areaById } from "@/lib/seo/areas";
import operator from "@/config/operator.json";
import { blockingComponents } from "@/lib/scoring/recommendations";
import { AreaRankingPage } from "@/components/hiking/AreaRankingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ComparisonTool } from "@/components/compare/ComparisonTool";
import { routeCatalog } from "@/lib/seo/route-catalog";
import type { ComponentScores, Locale, PublicDestination } from "@/lib/data/types";

type Params = Promise<{locale:string;segments?:string[]}>;
export const dynamicParams = false;
export const dynamic = "force-static";
export function generateStaticParams(){return routeCatalog().filter((route)=>route.segments.length>0);}


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
  // Only the legal pages carry sections; the rest are a lead and nothing else.
  const sections: ReadonlyArray<{heading: string; paragraphs: readonly string[]}> =
    "sections" in data ? data.sections : [];
  const componentLabels = copy.components;
  return <>
    <section className="page-intro prose-intro"><span className="eyebrow">{copy.brand}</span><h1>{data.title}</h1>{paragraphs.map((paragraph)=><p key={paragraph}>{paragraph}</p>)}</section>
    {sections.length ? <section className="content-section legal-body">
      {sections.map((section)=><section key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map((paragraph)=><p key={paragraph}>
          {/* An address is one paragraph with real line breaks in it. */}
          {paragraph.split("\n").map((line, index, lines)=><span key={line}>{line}{index < lines.length - 1 ? <br/> : null}</span>)}
        </p>)}
      </section>)}
    </section> : null}
    {pageKey==="imprint" ? (() => {
      // Rendered from config/operator.json rather than written into the copy,
      // so the address, the email and the VAT status have one source and the
      // release validator can refuse a production build that leaves them open.
      const c = copy.imprintContact;
      return <section className="content-section legal-body"><section>
        <h2>{c.heading}</h2>
        <p>{c.email}: {operator.contactEmail ?? c.emailPending}</p>
        <p>{c.phone}</p>
        <p>{c.vat}: {operator.vatStatus === "kleinunternehmer" ? c.vatKleinunternehmer
          : operator.vatStatus === "vat-id" && operator.vatId ? c.vatId(operator.vatId)
          : c.vatPending}</p>
      </section></section>;
    })() : null}
    {pageKey==="methodology" && (() => {
      const withheld = getAllDestinations().filter((destination) => !destination.recommendationEligible);
      return <section className="content-section withheld-list">
        <div className="section-heading"><div>
          <span className="eyebrow">{copy.withheld.eyebrow}</span>
          <h2>{copy.withheld.heading(withheld.length)}</h2>
          <p>{copy.withheld.intro}</p>
        </div></div>
        <ul>{withheld.map((destination) => <li key={destination.slug}>
          <Link href={pathFor({kind: "destination", slug: destination.slug}, locale)}>{destination.name}</Link>
          <span>{destination.countryName}</span>
          <span>{withheldReason(destination, copy)}</span>
        </li>)}</ul>
      </section>;
    })()}
    {pageKey==="credits" && <section className="credit-list">
      <p className="credit-count">{allImages().length}</p>
      <ul>{allImages().map((image)=><li key={image.slug}>
        <strong>{image.slug.replaceAll("-"," ")}</strong>
        <a href={image.sourceUrl} rel="noopener noreferrer" target="_blank">{image.sourceFile}</a>
        <span>{image.attribution}{" · "}<a href={(image.licenceUrl ? sourceLicenceUrl(image.licenceId, image.licenceUrl) : licenceUrl(image.licenceId)) ?? image.sourceUrl} rel="noopener noreferrer" target="_blank">{image.licenceName}</a></span>
      </li>)}</ul>
    </section>}
    {pageKey==="methodology" && <section className="weight-diagram">{(Object.entries(weights.overall) as Array<[keyof ComponentScores,number]>).map(([key,weight])=><div key={key}><span>{componentLabels[key]}</span><strong>{Math.round(weight*100)}%</strong></div>)}</section>}
    <MethodNote locale={locale}/>
  </>;
}

function FinderPage({locale}:{locale:Locale}) {
  const copy = t(locale).finder;
  return <><section className="page-intro tool-intro"><span className="eyebrow">{copy.pageEyebrow}</span><h1>{copy.pageHeading}</h1><p>{copy.pageSub}</p></section><div className="finder-page"><Finder destinations={getSearchIndex()} locale={locale}/></div><MethodNote locale={locale}/></>;
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
    case "areaRanking": { const area=areaById(page.area); if(!area) notFound();
      const label=taxonomyLabel(locale, area.kind === "continent" ? "continents" : "regions", area.id);
      const trail=[{name: t(locale).brand, path: pathFor({kind:"home"}, locale)}, {name: label, path: pathFor(page, locale)}];
      return <><JsonLd data={breadcrumbLd(trail)}/><JsonLd data={rankingLd(label, area.destinations.slice(0, 20).map((destination) => ({name: destination.name, path: pathFor({kind:"destination", slug: destination.slug}, locale)})))}/>
        <Breadcrumbs trail={trail} locale={locale}/><AreaRankingPage area={area} locale={locale}/><MethodNote locale={locale}/></>; }
    case "themeRanking": { const copy=t(locale); const title=copy.ranking.themeTitle(copy.ranking.themes[page.theme], monthName(page.month,locale)); return <RankingPage ranking={getRanking(page.month,themes[page.theme])} locale={locale} title={title}/>; }
    case "compare": { if(!getComparisonIndex().some((item)=>item.slug===page.slug)) notFound(); return <ComparisonPage comparison={getComparison(page.slug)} locale={locale}/>; }
    case "compareTool": { const copy=t(locale); return <><section className="page-intro tool-intro"><span className="eyebrow">{copy.comparison.eyebrow}</span><h1>{copy.compareToolHeading}</h1><p>{copy.compare.toolIntro}</p></section><div className="finder-page"><ComparisonTool destinations={getSearchIndex()} locale={locale}/></div><MethodNote locale={locale}/></>; }
    case "info": return <InformationPage locale={locale} pageKey={page.key}/>;
  }
}

/**
 * Why this destination carries no recommendation, in the reader's terms.
 *
 * "No month clears every critical component" is true of every entry in the
 * list, so it explains nothing. Where one component fails in all twelve months
 * we name it, because that is the fact a reader needs in order to judge whether
 * the withholding is conservative or correct.
 */
function withheldReason(destination: PublicDestination, copy: ReturnType<typeof t>): string {
  if (destination.recommendationHoldReason === "persistent-snow") return copy.withheld.reasonSnow;
  const blocking = blockingComponents(destination.months);
  if (!blocking.length) return copy.withheld.reasonNoMonth;
  return copy.withheld.reasonComponent(blocking.map((key) => copy.components[key]).join(", "));
}

export default async function LocalizedPage({params}:{params:Params}) {
  const {locale:raw,segments=[]}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const page=resolvePageId(locale,segments);
  if(!page) notFound();
  return <><SiteHeader locale={locale} page={page}/><main id="main">{renderPage(locale,page)}</main><SiteFooter locale={locale}/></>;
}
