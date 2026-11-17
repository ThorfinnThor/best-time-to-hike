import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { monthName } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";
import { globeDestinations, globeMonthLeaders } from "@/lib/globe/data";
import { MethodNote } from "@/components/hiking/Pages";
import type { GlobeLabels } from "./HikingGlobe";
import { HikingGlobeLazy } from "./HikingGlobeLazy";

/**
 * The hiking globe page. The globe is the shareable part; the month-by-month
 * summary below it is ordinary server-rendered text with links, so the page is
 * a document a crawler can read and a reader without WebGL still gets the data.
 */
export function GlobePage({locale}: {locale: Locale}) {
  const copy = t(locale).globe;
  const destinations = globeDestinations(locale);
  const months = Array.from({length: 12}, (_, index) => monthName(index + 1, locale));
  const labels: GlobeLabels = {
    months,
    play: copy.play,
    pause: copy.pause,
    month: copy.month,
    recommended: copy.recommended,
    legend: [
      {code: "E", label: copy.legend.excellent},
      {code: "V", label: copy.legend.veryGood},
      {code: "G", label: copy.legend.good},
      {code: "F", label: copy.legend.fair},
      {code: "-", label: copy.legend.none},
    ],
    notRecommended: copy.notRecommended,
    score: copy.score,
    open: copy.open,
    close: copy.close,
    hint: copy.hint,
    noWebgl: copy.noWebgl,
    canvasLabel: copy.canvasLabel,
  };
  const hrefs = Object.fromEntries(destinations.map((destination) => [destination.s, `${links.destination(locale, destination.s)}/`]));

  return <>
    <section className="globe-hero">
      <div className="globe-intro">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.heading}</h1>
        <p>{copy.intro}</p>
      </div>
      <HikingGlobeLazy destinations={destinations} labels={labels} hrefs={hrefs}/>
      <p className="globe-caveat">{copy.caveat}</p>
    </section>
    <section className="content-section globe-summary">
      <div className="section-heading"><div>
        <span className="eyebrow">{copy.summaryEyebrow}</span>
        <h2>{copy.summaryHeading}</h2>
        <p>{copy.summaryIntro}</p>
      </div></div>
      <ol>
        {globeMonthLeaders(locale).map((item) => <li key={item.month}>
          <h3>{months[item.month - 1]} <small>{copy.monthCount(item.count)}</small></h3>
          <p>{item.leaders.map((leader, index) => <span key={leader.slug}>{index ? ", " : ""}<Link href={links.destination(locale, leader.slug)}>{leader.name}</Link> ({leader.score})</span>)}</p>
          <Link className="globe-summary-link" href={links.ranking(locale, item.month)}>{copy.fullRanking} →</Link>
        </li>)}
      </ol>
    </section>
    <MethodNote locale={locale}/>
  </>;
}
