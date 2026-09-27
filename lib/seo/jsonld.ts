import type { Locale, PublicDestination } from "@/lib/data/types";
import { monthName } from "@/lib/i18n/config";
import { absoluteUrl, SITE } from "@/lib/site";
import { profileFor } from "@/lib/seo/profile";
import { links } from "@/lib/i18n/links";
import { getManifest } from "@/lib/data/load";

const pageUrl = (path: string) => absoluteUrl(path.endsWith("/") ? path : `${path}/`);

/** Structured data. Every value is taken from the published dataset. */
export function organisationLd() {
  return {"@context": "https://schema.org", "@type": "Organization",
    "@id": absoluteUrl("/#organization"), name: SITE.name, alternateName: "Best Time To Hike",
    description: "A transparent hiking-season decision engine based on historical climate and elevation data.",
    url: SITE.url};
}

export function webSiteLd(_locale: Locale) {
  return {"@context": "https://schema.org", "@type": "WebSite",
    "@id": absoluteUrl("/#website"), name: SITE.name, alternateName: "Best Time To Hike",
    description: "Historical climate evidence for choosing a hiking destination and travel month.",
    url: SITE.url, inLanguage: ["en", "de"],
    publisher: {"@id": absoluteUrl("/#organization")}};
}

/** A machine-readable description of the dataset documented on Methodology. */
export function datasetLd(locale: Locale) {
  const manifest = getManifest();
  const de = locale === "de";
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${pageUrl(links.methodology(locale))}#dataset`,
    name: de ? "BestTimeToHike Datensatz zur saisonalen Wandereignung" : "BestTimeToHike hiking-season suitability dataset",
    description: de
      ? "Monatliche historische Klimakennwerte und nachvollziehbare Eignungsregeln für weltweite Wanderziele, abgeleitet aus dem ERA5-Land-Klimanormal 1991 bis 2020."
      : "Monthly historical climate indicators and reproducible suitability rules for hiking destinations worldwide, derived from the ERA5-Land 1991-2020 climate normal.",
    url: pageUrl(links.methodology(locale)),
    inLanguage: locale,
    creator: {"@id": absoluteUrl("/#organization")},
    isPartOf: {"@id": absoluteUrl("/#website")},
    isBasedOn: "https://doi.org/10.24381/ee82e357",
    citation: "ERA5-Land hourly time-series data, DOI 10.24381/ee82e357",
    temporalCoverage: `${manifest.climateNormal.startYear}/${manifest.climateNormal.endYear}`,
    dateModified: manifest.generatedAt,
    version: manifest.datasetVersion,
    measurementTechnique: "Monthly aggregation of one selected 0.1 degree ERA5-Land model grid cell per destination",
    variableMeasured: ["hiking-window temperature", "wet-day probability", "snow-cover probability", "daylight hours", "10 metre grid wind"],
    distribution: [
      {"@type": "DataDownload", encodingFormat: "application/json", contentUrl: absoluteUrl("/data/hiking/manifest.json")},
      {"@type": "DataDownload", encodingFormat: "application/json", contentUrl: absoluteUrl("/data/hiking/search/destination-index.json")},
    ],
  };
}

export function breadcrumbLd(trail: Array<{name: string; path: string}>) {
  return {"@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem", position: index + 1, name: step.name, item: pageUrl(step.path)}))};
}

/**
 * A destination page answers "when should I hike here". The FAQ carries that
 * answer only when the recommendation gate allows one; a withheld destination
 * gets the question about why, and no suitability claim.
 */
export function destinationFaqEntries(destination: PublicDestination, locale: Locale) {
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

  return entries;
}

export function destinationFaqLd(destination: PublicDestination, locale: Locale) {
  return {"@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: destinationFaqEntries(destination, locale).map((entry) => ({"@type": "Question", name: entry.q,
      acceptedAnswer: {"@type": "Answer", text: entry.a}}))};
}

export function destinationPageLd(destination: PublicDestination, locale: Locale, title: string, description: string) {
  const url = pageUrl(links.destination(locale, destination.slug));
  return {"@context": "https://schema.org", "@type": "WebPage", "@id": `${url}#webpage`,
    url, name: title, description, inLanguage: locale,
    isPartOf: {"@id": absoluteUrl("/#website")},
    about: {"@type": "TouristDestination", name: destination.name,
      containedInPlace: {"@type": "Country", name: destination.countryName}},
    isBasedOn: "https://doi.org/10.24381/ee82e357"};
}

export function rankingLd(name: string, entries: Array<{name: string; path: string}>) {
  return {"@context": "https://schema.org", "@type": "ItemList", name,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem", position: index + 1, name: entry.name, url: pageUrl(entry.path)}))};
}
