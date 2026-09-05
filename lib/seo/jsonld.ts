import type { Locale, PublicDestination } from "@/lib/data/types";
import { monthName } from "@/lib/i18n/config";
import { absoluteUrl, SITE } from "@/lib/site";
import { profileFor } from "@/lib/seo/profile";
import { links } from "@/lib/i18n/links";

/** Structured data. Every value is taken from the published dataset. */
export function organisationLd() {
  return {"@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url};
}

export function webSiteLd(locale: Locale) {
  return {"@context": "https://schema.org", "@type": "WebSite", name: SITE.name,
    url: absoluteUrl(links.home(locale)), inLanguage: locale};
}

export function breadcrumbLd(trail: Array<{name: string; path: string}>) {
  return {"@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem", position: index + 1, name: step.name, item: absoluteUrl(step.path)}))};
}

/**
 * A destination page answers "when should I hike here". The FAQ carries that
 * answer only when the recommendation gate allows one; a withheld destination
 * gets the question about why, and no suitability claim.
 */
export function destinationFaqLd(destination: PublicDestination, locale: Locale) {
  const de = locale === "de";
  const p = profileFor(destination);
  const entries: Array<{q: string; a: string}> = [];

  if (p.seasonShape === "withheld") {
    entries.push({
      q: de ? `Wann sollte man in ${destination.name} wandern?` : `When should you hike ${destination.name}?`,
      a: de ? `Wir empfehlen für ${destination.name} keinen Monat. Kein Monat erfüllt alle kritischen Klimakriterien des Modells.`
            : `We recommend no month for ${destination.name}. No month clears every critical climate criterion in the model.`});
  } else {
    entries.push({
      q: de ? `Wann sollte man in ${destination.name} wandern?` : `When should you hike ${destination.name}?`,
      a: de ? `${p.eligibleMonths.length} von zwölf Monaten erfüllen unsere Kriterien${p.peakMonth ? `; am besten bewertet ist ${monthName(p.peakMonth, locale)}` : ""}.`
            : `${p.eligibleMonths.length} of twelve months clear our criteria${p.peakMonth ? `, and ${monthName(p.peakMonth, locale)} scores highest` : ""}.`});
    if (p.closedMonths.length && p.limitingFactor) {
      entries.push({
        q: de ? `Warum sind manche Monate nicht empfohlen?` : `Why are some months not recommended?`,
        a: de ? `In ${p.closedMonths.length} Monaten unterschreitet mindestens eine kritische Komponente die Schwelle; am häufigsten ist das die Komponente ${p.limitingFactor}.`
              : `In ${p.closedMonths.length} months at least one critical component falls below the threshold, most often ${p.limitingFactor}.`});
    }
  }
  entries.push({
    q: de ? `Worauf beziehen sich diese Werte?` : `What do these figures describe?`,
    a: de ? `Auf eine ausgewählte ERA5-Land-Modellgitterzelle auf ${destination.representativeCell.modelElevationM} Metern, gemittelt über 1991 bis 2020. Es ist keine Vorhersage und keine Aussage über einzelne Wege.`
          : `One selected ERA5-Land model grid cell at ${destination.representativeCell.modelElevationM} metres, averaged over 1991 to 2020. It is not a forecast and not a statement about individual trails.`});

  return {"@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({"@type": "Question", name: entry.q,
      acceptedAnswer: {"@type": "Answer", text: entry.a}}))};
}

export function rankingLd(name: string, entries: Array<{name: string; path: string}>) {
  return {"@context": "https://schema.org", "@type": "ItemList", name,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem", position: index + 1, name: entry.name, url: absoluteUrl(entry.path)}))};
}
