import type { Locale, PublicDestination } from "@/lib/data/types";
import { monthName, monthSpan } from "@/lib/i18n/config";
import { taxonomyLabel, withArticle } from "@/lib/i18n/dict";
import { areaFacts, type Area, type AreaFacts } from "@/lib/seo/areas";
import { factor, type Section } from "@/lib/seo/longform";

/**
 * Data-derived area prose: the season of a region or continent, read from the
 * destinations it ranks.
 *
 * An area page used to be a chart and a list. The broad question it is found
 * for ("hiking in Africa", "Himalaya trekking best time") wants the summary the
 * list implies: when the area opens, how far apart its destinations are, and
 * what closes the months that are missing.
 *
 * Rules, the same ones `longformSections` keeps:
 *  - Only recommendable destinations are described. A withheld destination is
 *    never named here and no month is ever attributed to it; the page lists
 *    those separately with their reason (mistakes.md #1).
 *  - A month is "open" for a destination only when the recommendation gate
 *    passed it. What closes a month is the critical component that failed it,
 *    read against the configured floor, never a new threshold.
 *  - The figures describe one selected grid cell per destination, not the area.
 *  - Wind is never described as a condition. German prose takes no Gedankenstrich.
 */

const eligibleMonths = (destination: PublicDestination) =>
  destination.months.filter((month) => month.recommendationEligible).map((month) => month.month);
/** Whole numbers in prose; `|| 0` keeps a rounded -0.3 from printing as "-0". */
const num = (value: number, locale: Locale) => new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {maximumFractionDigits: 0}).format(Math.round(value) || 0);
const joinAnd = (values: string[], locale: Locale) => values.length <= 1 ? values[0] ?? ""
  : `${values.slice(0, -1).join(", ")} ${locale === "de" ? "und" : "and"} ${values[values.length - 1]}`;
/** Up to three names; past that, a count keeps the sentence readable. */
const names = (destinations: PublicDestination[], locale: Locale) => {
  const de = locale === "de";
  if (destinations.length <= 3) return joinAnd(destinations.map((destination) => destination.name), locale);
  const shown2 = joinAnd(destinations.slice(0, 2).map((destination) => destination.name), locale);
  return de ? `${destinations.length} Zielen, darunter ${shown2}` : `${destinations.length} destinations, including ${shown2}`;
};
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const season = (destination: PublicDestination, locale: Locale) => monthSpan(eligibleMonths(destination), locale);
const months = (value: number, locale: Locale) => locale === "de"
  ? `${value} ${value === 1 ? "Monat" : "Monaten"}`
  : `${value} ${value === 1 ? "month" : "months"}`;
const destinationsWord = (value: number, locale: Locale) => locale === "de"
  ? `${value} ${value === 1 ? "Ziel" : "Zielen"}`
  : `${value} ${value === 1 ? "destination" : "destinations"}`;

function seasonSection(area: Area, f: AreaFacts, label: string, locale: Locale): Section {
  const de = locale === "de";
  const heading = de ? `${label}: beste Reisezeit im Jahresverlauf` : `When to hike ${withArticle(area.id, label)}`;
  const paragraphs: string[] = [];

  if (f.quietCount === f.count) {
    paragraphs.push(de
      ? `Alle ${f.count} Ziele erfüllen in jedem Monat des Jahres unsere Empfehlungskriterien. Die Frage ist hier nicht, ob ein Ziel geöffnet ist, sondern wie sich die Monate unterscheiden.`
      : `All ${f.count} destinations clear our recommendation criteria in every month of the year. The question here is not whether a place is open but how the months differ.`);
  } else {
    const peak = monthSpan(f.peakMonths, locale);
    const peakClause = f.peakCount === f.count
      ? (de ? `erfüllen alle ${f.count} Ziele unsere Empfehlungskriterien` : `all ${f.count} destinations clear our recommendation criteria`)
      : (de ? `erfüllen ${f.peakCount} von ${f.count} Zielen unsere Empfehlungskriterien, mehr als in jedem anderen Monat` : `${f.peakCount} of ${f.count} destinations clear our recommendation criteria, more than in any other month`);
    const quiet = f.closedMonths.length
      ? (de
        ? `${capitalise(monthSpan(f.closedMonths, locale))} erfüllt kein einziges Ziel die Kriterien.`
        : `Not one of them does ${monthSpan(f.closedMonths, locale)}.`)
      : (de
        ? `Am ruhigsten ist es ${monthSpan(f.quietMonths, locale)} mit ${f.quietCount} von ${f.count} Zielen.`
        : `The area is quietest ${monthSpan(f.quietMonths, locale)}, with ${f.quietCount} of ${f.count}.`);
    paragraphs.push(`${capitalise(peak)}${de ? "" : ","} ${peakClause}. ${quiet}`);
  }

  const hemisphere = f.southernCount === 0 ? ""
    : f.southernCount === f.count
      ? (de ? " Alle Ziele liegen auf der Südhalbkugel." : " Every destination here is in the southern hemisphere.")
      : (de
        ? ` ${f.southernCount} der ${f.count} Ziele liegen auf der Südhalbkugel, wo das Jahr umgekehrt verläuft.`
        : ` ${f.southernCount} of the ${f.count} destinations lie in the southern hemisphere, where the year runs the other way.`);
  paragraphs.push(de
    ? `Über alle Ziele gemittelt ist ${monthName(f.warmestMonth, locale)} mit ${num(f.warmestMeanC, locale)} Grad im Wanderfenster der wärmste Monat und ${monthName(f.coldestMonth, locale)} mit ${num(f.coldestMeanC, locale)} Grad der kälteste.${hemisphere}`
    : `Averaged across the destinations, ${monthName(f.warmestMonth, locale)} is the warmest month at ${num(f.warmestMeanC, locale)} degrees in the hiking window and ${monthName(f.coldestMonth, locale)} the coldest at ${num(f.coldestMeanC, locale)}.${hemisphere}`);
  return {heading, paragraphs};
}

function rangeSection(f: AreaFacts, label: string, locale: Locale): Section {
  const de = locale === "de";
  const heading = de ? `${label}: Höhenlagen und Unterschiede` : `How far apart the destinations are`;
  const low = f.lowest, high = f.highest;
  const lowM = num(low.representativeCell.modelElevationM, locale);
  const highM = num(high.representativeCell.modelElevationM, locale);
  const lowMonths = eligibleMonths(low).length, highMonths = eligibleMonths(high).length;
  const ends = lowMonths === highMonths
    ? (de
      ? `Beide erfüllen die Kriterien in ${months(lowMonths, locale)} (${season(low, locale)}).`
      : `Both clear the criteria in ${months(lowMonths, locale)} (${season(low, locale)}).`)
    : (de
      ? `${low.name} erfüllt die Kriterien in ${months(lowMonths, locale)} (${season(low, locale)}), ${high.name} in ${months(highMonths, locale)} (${season(high, locale)}).`
      : `${low.name} clears the criteria in ${months(lowMonths, locale)} (${season(low, locale)}), ${high.name} in ${months(highMonths, locale)} (${season(high, locale)}).`);
  const paragraphs = [de
    ? `Die ausgewählten Gitterzellen reichen von ${lowM} Metern bei ${low.name} bis ${highM} Metern bei ${high.name}, der Median liegt bei ${num(f.medianElevationM, locale)} Metern. ${ends}`
    : `The selected grid cells run from ${lowM} metres at ${low.name} to ${highM} metres at ${high.name}, with a median of ${num(f.medianElevationM, locale)} metres. ${ends}`];

  const single = (group: AreaFacts["longest"]) => group.destinations.length === 1 ? group.destinations[0] : null;
  const longest = single(f.longest), shortest = single(f.shortest);
  if (f.longest.months === f.shortest.months) {
    paragraphs.push(de
      ? `Die Saisonlänge ist hier einheitlich: jedes Ziel ist in ${months(f.longest.months, locale)} empfehlenswert.`
      : `Season length is uniform here: every destination is recommendable in ${months(f.longest.months, locale)}.`);
  } else if (longest && shortest && new Set([longest, shortest, low, high]).size === 2 && longest !== shortest) {
    paragraphs.push(de
      ? `Damit liegen hier auch die längste und die kürzeste Saison der ${f.count} Ziele.`
      : `They are also the longest and the shortest season among the ${f.count} destinations.`);
  } else {
    const describe = (group: AreaFacts["longest"]) => {
      const only = single(group);
      return only
        ? (de ? `bei ${only.name} mit ${months(group.months, locale)} (${season(only, locale)})` : `${only.name}, at ${months(group.months, locale)} (${season(only, locale)})`)
        : (de ? `bei ${names(group.destinations, locale)} mit je ${months(group.months, locale)}` : `${names(group.destinations, locale)}, at ${months(group.months, locale)} each`);
    };
    paragraphs.push(de
      ? `Am längsten ist die Saison ${describe(f.longest)}, am kürzesten ${describe(f.shortest)}.`
      : `The longest season belongs to ${describe(f.longest)}; the shortest to ${describe(f.shortest)}.`);
  }
  return {heading, paragraphs};
}

function limitsSection(f: AreaFacts, label: string, locale: Locale): Section | null {
  if (!f.closingFactors.length && !f.withheldCount) return null;
  const de = locale === "de";
  const heading = de ? `${label}: was die Monate begrenzt` : `What closes the missing months`;
  const paragraphs: string[] = [];

  if (f.closingFactors.length) {
    const [first, ...rest] = f.closingFactors;
    const parts = [
      first[1] === f.count
        ? (de ? `${factor(first[0], locale)}, bei allen ${f.count} Zielen` : `${factor(first[0], locale)}, for every one of the ${f.count} destinations`)
        : (de ? `${factor(first[0], locale)} bei ${first[1]} von ${f.count} Zielen` : `${factor(first[0], locale)} for ${first[1]} of the ${f.count} destinations`),
      ...rest.map(([key, value]) => de ? `${factor(key, locale)} bei ${value}` : `${factor(key, locale)} for ${value}`),
    ];
    const open = f.openAllYear
      ? (de ? ` ${f.openAllYear} ${f.openAllYear === 1 ? "Ziel ist" : "Ziele sind"} in allen zwölf Monaten empfehlenswert.` : ` ${f.openAllYear} ${f.openAllYear === 1 ? "is" : "are"} recommendable in all twelve months.`)
      : "";
    paragraphs.push(de
      ? `Wo ein Ziel Monate verliert, liegt eine kritische Klimakomponente unter der Schwelle, ab der wir einen Monat nicht mehr empfehlen. Hauptgrund: ${joinAnd(parts, locale)}.${open}`
      : `Where a destination loses months, a critical climate component falls below the threshold at which we stop recommending a month. The main reason is ${joinAnd(parts, locale)}.${open}`);
  } else {
    paragraphs.push(de
      ? `Keines der ${f.count} empfohlenen Ziele verliert einen Monat an eine kritische Klimakomponente.`
      : `None of the ${f.count} recommended destinations loses a month to a critical climate component.`);
  }

  if (f.quietMonthFactors.length) {
    const closed = f.quietMonthFactors.reduce((sum, [, value]) => sum + value, 0);
    const [key, value] = f.quietMonthFactors[0];
    const month = monthName(f.quietMonth, locale);
    const who = closed === f.count
      ? (de ? `fehlen alle ${f.count} Ziele` : `every destination is closed`)
      : (de ? `fehlen ${closed} von ${f.count} Zielen` : `${closed} of ${f.count} destinations are closed`);
    const why = value === closed
      ? (de ? `Grund bei allen: ${factor(key, locale)}.` : `all of them by ${factor(key, locale)}`)
      : (de ? `Grund bei ${value} davon: ${factor(key, locale)}.` : `${value} of them by ${factor(key, locale)}`);
    paragraphs.push(de
      ? `Im ${month}, dem ruhigsten Monat, ${who}. ${why}`
      : `In ${month}, the quietest month, ${who}, ${why}.`);
  }
  if (f.withheldCount) {
    paragraphs.push(de
      ? `Nicht mitgezählt ${f.withheldCount === 1 ? "ist ein weiteres Ziel" : `sind ${f.withheldCount} weitere Ziele`}, für ${f.withheldCount === 1 ? "das" : "die"} wir keine Empfehlung veröffentlichen. ${f.withheldCount === 1 ? "Es steht" : "Sie stehen"} weiter unten mit dem Grund.`
      : `Not counted here ${f.withheldCount === 1 ? "is one further destination" : `are ${f.withheldCount} further destinations`} for which we publish no recommendation. ${f.withheldCount === 1 ? "It is" : "They are"} listed below with the reason.`);
  }
  return {heading, paragraphs};
}

function conditionsSection(f: AreaFacts, label: string, locale: Locale): Section | null {
  const c = f.conditions;
  if (c.open < 2) return null;
  const de = locale === "de";
  const month = monthName(f.conditionsMonth, locale);
  const heading = de ? `${label} im ${month}` : `Conditions in ${month}`;
  return {heading, paragraphs: [de
    ? `Im ${month} sind die geöffneten Ziele im Mittel am stärksten bewertet. Die Temperatur im Wanderfenster reicht dann von ${num(c.coolestC, locale)} Grad bei ${c.coolest.name} bis ${num(c.warmestC, locale)} Grad bei ${c.warmest.name}, und Niederschlag fällt je nach Ziel an ${c.driestPct} bis ${c.wettestPct} Prozent der Tage.`
    : `${month} is when the open destinations score highest on average. Hiking-window temperature then runs from ${num(c.coolestC, locale)} degrees at ${c.coolest.name} to ${num(c.warmestC, locale)} at ${c.warmest.name}, and rain falls on ${c.driestPct} to ${c.wettestPct} percent of days depending on the destination.`]};
}

function scope(f: AreaFacts, locale: Locale): Section {
  const de = locale === "de";
  return {heading: de ? "Wofür diese Zahlen gelten" : "What these figures cover",
    paragraphs: [de
      ? `Jedes Ziel wird durch eine einzige ausgewählte ERA5-Land-Gitterzelle beschrieben, gemittelt über 1991 bis 2025. Die Angaben oben fassen diese ${f.count} Zellen zusammen. Sie sind keine Karte der ganzen Region und keiner Route, und sie sind keine Vorhersage.`
      : `Each destination is described by one selected ERA5-Land grid cell, averaged over 1991 to 2025. The figures above summarise those ${f.count} cells. They are not a map of the whole area or of any route, and they are not a forecast.`]};
}

export function areaSections(area: Area, locale: Locale): Section[] {
  if (!area.destinations.length) return [];
  const f = areaFacts(area);
  const label = taxonomyLabel(locale, area.kind === "continent" ? "continents" : "regions", area.id);
  return [seasonSection(area, f, label, locale), rangeSection(f, label, locale), limitsSection(f, label, locale), conditionsSection(f, label, locale), scope(f, locale)]
    .filter((section): section is Section => section !== null);
}
