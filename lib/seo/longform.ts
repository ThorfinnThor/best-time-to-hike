import type { Locale, PublicDestination } from "@/lib/data/types";
import { monthName } from "@/lib/i18n/config";
import { profileFor, type DestinationProfile, type LimitingFactor } from "@/lib/seo/profile";

/**
 * Data-derived destination prose.
 *
 * Every sentence here is generated from the destination's own climatology. The
 * section list itself varies by profile, so a year-round Mediterranean island
 * and a six-week Arctic window are not the same article with different numbers:
 * they get different sections, in a different order, answering the question
 * their data actually raises.
 *
 * Rules, all of them load-bearing:
 *  - A withheld destination gets the withheld article. It makes no score,
 *    best-month or suitability claim of any kind (mistakes.md #1).
 *  - Numbers come from the published months. Nothing is rounded into a claim
 *    the data does not support, and no month is described as good unless the
 *    recommendation gate passed it.
 *  - Wind is never described as a trail or safety condition.
 *  - German prose takes no Gedankenstrich.
 */
export interface Section { heading: string; paragraphs: string[] }

const list = (months: number[], locale: Locale) => months.map((month) => monthName(month, locale));
const joinAnd = (values: string[], locale: Locale) => {
  if (values.length <= 1) return values[0] ?? "";
  const last = values[values.length - 1];
  return `${values.slice(0, -1).join(", ")} ${locale === "de" ? "und" : "and"} ${last}`;
};
/** Contiguous runs read as a season; scattered months read as a list. */
function runs(months: number[]): number[][] {
  const out: number[][] = [];
  for (const month of [...months].sort((a, b) => a - b)) {
    const tail = out[out.length - 1];
    if (tail && month === tail[tail.length - 1] + 1) tail.push(month); else out.push([month]);
  }
  if (out.length > 1 && out[0][0] === 1 && out[out.length - 1][out[out.length - 1].length - 1] === 12) {
    const first = out.shift()!;
    out[out.length - 1] = [...out[out.length - 1], ...first];
  }
  return out;
}
function seasonPhrase(months: number[], locale: Locale): string {
  const groups = runs(months);
  if (!groups.length) return "";
  const named = groups.map((group) => group.length === 1
    ? monthName(group[0], locale)
    : `${monthName(group[0], locale)} ${locale === "de" ? "bis" : "to"} ${monthName(group[group.length - 1], locale)}`);
  return joinAnd(named, locale);
}

const FACTOR_EN: Record<LimitingFactor, string> = {
  snow: "snow cover", precipitation: "rain", heatStress: "heat",
  temperature: "cold", daylight: "short days", wind: "wind",
};
const FACTOR_DE: Record<LimitingFactor, string> = {
  snow: "Schneedecke", precipitation: "Regen", heatStress: "Hitze",
  temperature: "Kälte", daylight: "kurze Tage", wind: "Wind",
};
const factor = (key: LimitingFactor, locale: Locale) => (locale === "de" ? FACTOR_DE : FACTOR_EN)[key];

/** ERA5 grid coordinates decode as long floats; show them at grid precision. */
const coord = (value: number) => value.toFixed(2);
/** German writes 1273,6 rather than 1273.6. */
const num = (value: number, locale: Locale) => new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {maximumFractionDigits: 1}).format(value);
const month = (destination: PublicDestination, index: number) => destination.months[index - 1];
const tempAt = (destination: PublicDestination, index: number) => Math.round(month(destination, index).metrics.temperatureHikingMeanC);
const wetAt = (destination: PublicDestination, index: number) => Math.round(month(destination, index).metrics.wetDayProbability * 100);
const dayAt = (destination: PublicDestination, index: number) => Math.round(month(destination, index).metrics.daylightHoursMean);

function opening(destination: PublicDestination, p: DestinationProfile, locale: Locale): Section {
  const name = destination.name;
  const elevation = destination.representativeCell.modelElevationM;
  const de = locale === "de";
  const season = seasonPhrase(p.eligibleMonths, locale);
  const heading = de ? `${name} im Jahresverlauf` : `${name} through the year`;

  if (p.seasonShape === "year-round") {
    return {heading, paragraphs: [de
      ? `${name} liegt auf etwa ${num(elevation, locale)} Metern und kennt keine geschlossene Wandersaison. In allen ${p.eligibleMonths.length} bewerteten Monaten bleiben Temperatur, Niederschlag und Schnee innerhalb der Grenzen, ab denen wir eine Empfehlung zurückhalten. Die Temperatur schwankt über das Jahr um ${p.temperatureSpreadC} Grad, von ${tempAt(destination, p.coldestMonth)} Grad im ${monthName(p.coldestMonth, locale)} bis ${tempAt(destination, p.warmestMonth)} Grad im ${monthName(p.warmestMonth, locale)}.`
      : `${name} sits at about ${num(elevation, locale)} metres and has no closed hiking season. In all ${p.eligibleMonths.length} scored months, temperature, rainfall and snow stay inside the limits at which we withhold a recommendation. Temperature moves ${p.temperatureSpreadC} degrees across the year, from ${tempAt(destination, p.coldestMonth)} in ${monthName(p.coldestMonth, locale)} to ${tempAt(destination, p.warmestMonth)} in ${monthName(p.warmestMonth, locale)}.`]};
  }
  if (p.seasonShape === "narrow-window") {
    return {heading, paragraphs: [de
      ? `${name} hat ein schmales Zeitfenster. Von zwölf Monaten erfüllt nur ${season} unsere Empfehlungskriterien; in den übrigen ${p.closedMonths.length} Monaten fällt mindestens eine Klimakomponente unter die Schwelle, meist ${p.limitingFactor ? factor(p.limitingFactor, locale) : "eine kritische Komponente"}. Auf ${num(elevation, locale)} Metern ist das kein Mangel der Daten, sondern die Realität des Ortes.`
      : `${name} has a narrow window. Of twelve months, only ${season} meets our recommendation criteria; in the other ${p.closedMonths.length} at least one climate component falls below the threshold, usually ${p.limitingFactor ? factor(p.limitingFactor, locale) : "a critical component"}. At ${num(elevation, locale)} metres that is not a gap in the data, it is the character of the place.`]};
  }
  if (p.seasonality === "low-variation") {
    return {heading, paragraphs: [de
      ? `${name} hat kaum Jahreszeiten im mitteleuropäischen Sinn: die Monatsmitteltemperatur bewegt sich nur um ${p.temperatureSpreadC} Grad. Was den Wanderkalender bestimmt, ist deshalb nicht die Temperatur, sondern ${p.limitingFactor ? factor(p.limitingFactor, locale) : "der Niederschlag"}. Empfehlungsfähig sind ${season}.`
      : `${name} has little in the way of seasons: mean monthly temperature moves just ${p.temperatureSpreadC} degrees. What shapes the hiking calendar here is not temperature but ${p.limitingFactor ? factor(p.limitingFactor, locale) : "rainfall"}. The months that clear our gate are ${season}.`]};
  }
  const inverted = p.seasonality === "southern";
  return {heading, paragraphs: [de
    ? `Die Wandersaison in ${name} umfasst ${season}. ${inverted ? "Da der Ort auf der Südhalbkugel liegt, fällt sie in die europäischen Wintermonate." : ""} Auf etwa ${num(elevation, locale)} Metern reicht die Monatsmitteltemperatur von ${tempAt(destination, p.coldestMonth)} Grad im ${monthName(p.coldestMonth, locale)} bis ${tempAt(destination, p.warmestMonth)} Grad im ${monthName(p.warmestMonth, locale)}.`.replace(/\s+/g, " ")
    : `The hiking season at ${name} runs ${season}. ${inverted ? "Because the destination is in the southern hemisphere, that falls across the northern winter." : ""} At about ${num(elevation, locale)} metres, mean monthly temperature ranges from ${tempAt(destination, p.coldestMonth)} in ${monthName(p.coldestMonth, locale)} to ${tempAt(destination, p.warmestMonth)} in ${monthName(p.warmestMonth, locale)}.`.replace(/\s+/g, " ")]};
}

function whatCloses(destination: PublicDestination, p: DestinationProfile, locale: Locale): Section | null {
  if (!p.closedMonths.length || !p.limitingFactor) return null;
  const de = locale === "de";
  // Naming eleven scattered months reads as machine output. Past half the year,
  // say so plainly instead.
  const many = p.closedMonths.length > 6;
  const closed = many
    ? (de ? "die übrigen Monate" : "the rest of the year")
    : seasonPhrase(p.closedMonths, locale);
  const heading = many
    ? (de ? "Warum der Großteil des Jahres fehlt" : "Why most of the year is missing")
    : (de ? `Warum ${closed} fehlen` : `Why ${closed} are missing`);
  const paragraphs: string[] = [];

  if (p.limitingFactor === "snow") {
    paragraphs.push(de
      ? `In ${p.snowMonths} von zwölf Monaten liegt an der ausgewählten Gitterzelle an mindestens der Hälfte der Tage Schnee. Wir halten ${closed} nicht deshalb zurück, weil dort nichts zu wandern wäre, sondern weil die Schneedecke die Frage von einer Wanderentscheidung in eine Winterentscheidung verwandelt.`
      : `In ${p.snowMonths} of twelve months, snow lies on at least half the days at the selected grid cell. We withhold ${closed} not because nothing happens there, but because snow cover turns the question from a hiking decision into a winter one.`);
  } else if (p.limitingFactor === "precipitation") {
    paragraphs.push(de
      ? `Der nasseste Monat ist ${monthName(p.wettestMonth, locale)} mit Niederschlag an ${wetAt(destination, p.wettestMonth)} Prozent der Tage, der trockenste ${monthName(p.driestMonth, locale)} mit ${wetAt(destination, p.driestMonth)} Prozent. Diese Spanne, nicht die Temperatur, bestimmt hier den Kalender.`
      : `The wettest month is ${monthName(p.wettestMonth, locale)}, with rain on ${wetAt(destination, p.wettestMonth)} percent of days; the driest is ${monthName(p.driestMonth, locale)} at ${wetAt(destination, p.driestMonth)} percent. That spread, not temperature, sets the calendar here.`);
  } else if (p.limitingFactor === "heatStress") {
    paragraphs.push(de
      ? `Im ${monthName(p.warmestMonth, locale)} liegt die Temperatur im Wanderfenster bei ${tempAt(destination, p.warmestMonth)} Grad. Wir halten ${closed} zurück, weil anhaltende Hitze eine Wanderung zu einer Frage der Tageszeit und der Wasserversorgung macht, nicht der Saison.`
      : `In ${monthName(p.warmestMonth, locale)} the hiking-window temperature reaches ${tempAt(destination, p.warmestMonth)} degrees. We withhold ${closed} because sustained heat makes a walk a question of time of day and water, rather than of season.`);
  } else if (p.limitingFactor === "daylight") {
    paragraphs.push(de
      ? `Im ${monthName(p.coldestMonth, locale)} bleiben nur ${dayAt(destination, p.coldestMonth)} Stunden Tageslicht. Für ${closed} halten wir deshalb eine Empfehlung zurück: die Länge des Tages begrenzt hier, was an einem Tag begehbar ist.`
      : `In ${monthName(p.coldestMonth, locale)} there are only ${dayAt(destination, p.coldestMonth)} hours of daylight. We withhold ${closed} on that basis: day length, not weather, limits what can be walked here.`);
  } else {
    paragraphs.push(de
      ? `Für ${closed} halten wir eine Empfehlung zurück, weil ${factor(p.limitingFactor, locale)} unter die Schwelle fällt, ab der wir einen Monat nicht mehr empfehlen.`
      : `We withhold ${closed} because ${factor(p.limitingFactor, locale)} falls below the threshold at which we stop recommending a month.`);
  }

  if (p.secondaryFactor && p.secondaryFactor !== p.limitingFactor) {
    paragraphs.push(de
      ? `In den übrigen zurückgehaltenen Monaten ist ${factor(p.secondaryFactor, locale)} der begrenzende Faktor.`
      : `In the remaining withheld months, ${factor(p.secondaryFactor, locale)} is the limiting factor.`);
  }
  return {heading, paragraphs};
}

function conditions(destination: PublicDestination, p: DestinationProfile, locale: Locale): Section | null {
  if (!p.peakMonth) return null;
  const de = locale === "de";
  const peak = monthName(p.peakMonth, locale);
  const heading = de ? `Bedingungen im ${peak}` : `Conditions in ${peak}`;
  const paragraphs = [de
    ? `Der am besten bewertete Monat ist ${peak}: rund ${tempAt(destination, p.peakMonth)} Grad im Wanderfenster, Niederschlag an ${wetAt(destination, p.peakMonth)} Prozent der Tage und ${dayAt(destination, p.peakMonth)} Stunden Tageslicht.`
    : `The strongest scored month is ${peak}: about ${tempAt(destination, p.peakMonth)} degrees in the hiking window, rain on ${wetAt(destination, p.peakMonth)} percent of days, and ${dayAt(destination, p.peakMonth)} hours of daylight.`];

  if (p.polarDaylight) {
    paragraphs.push(de
      ? `Die Tageslänge schwankt hier extrem, von ${dayAt(destination, p.coldestMonth)} bis ${Math.round(Math.max(...destination.months.map((m) => m.metrics.daylightHoursMean)))} Stunden. Das verändert die Planung stärker als die Temperatur.`
      : `Day length swings hard here, from ${dayAt(destination, p.coldestMonth)} to ${Math.round(Math.max(...destination.months.map((m) => m.metrics.daylightHoursMean)))} hours. That shapes planning more than temperature does.`);
  } else if (p.altitudeBand === "high-alpine") {
    paragraphs.push(de
      ? `Auf ${num(destination.representativeCell.modelElevationM, locale)} Metern gelten diese Werte für eine Höhenlage, in der sich Bedingungen schnell ändern. Sie beschreiben ein Klimamittel von 1991 bis 2020, keinen Tag.`
      : `At ${num(destination.representativeCell.modelElevationM, locale)} metres these figures describe altitude where conditions change quickly. They are a 1991 to 2020 climate mean, not a day.`);
  }
  return {heading, paragraphs};
}

function withheldArticle(destination: PublicDestination, p: DestinationProfile, locale: Locale): Section[] {
  const de = locale === "de";
  const held = destination.recommendationHoldReason === "persistent-snow";
  const cell = destination.representativeCell;
  return [
    {heading: de ? `Warum hier keine Empfehlung steht` : `Why there is no recommendation here`,
     paragraphs: [held
       ? (de
         ? `An der für ${destination.name} ausgewählten ERA5-Land-Gitterzelle liegt in allen zwölf Monaten des Klimanormals Schnee. Eine Zelle mit ganzjähriger Schneedecke beschreibt kein Wandergelände, deshalb veröffentlichen wir für dieses Ziel weder einen Wanderwert noch beste Monate.`
         : `At the ERA5-Land grid cell selected for ${destination.name}, snow lies in all twelve months of the climate normal. A cell under year-round snow does not describe hiking terrain, so we publish no hiking score and no best months for this destination.`)
       : (de
         ? `Kein Monat in ${destination.name} erfüllt alle kritischen Klimakriterien. ${p.limitingFactor ? `Begrenzend ist vor allem ${factor(p.limitingFactor, locale)}.` : ""} Statt einen schwachen Wert zu veröffentlichen, halten wir die Empfehlung ganz zurück.`.replace(/\s+/g, " ")
         : `No month at ${destination.name} clears every critical climate criterion. ${p.limitingFactor ? `The binding constraint is ${factor(p.limitingFactor, locale)}.` : ""} Rather than publish a weak score, we withhold the recommendation entirely.`.replace(/\s+/g, " "))]},
    {heading: de ? `Was die Daten trotzdem zeigen` : `What the data still shows`,
     paragraphs: [de
       ? `Die Messreihe selbst ist vollständig: 262.992 Stundenwerte von 1991 bis 2020 an ${coord(cell.lat)}, ${coord(cell.lon)} auf ${num(cell.modelElevationM, locale)} Metern Modellhöhe. Die Monatsmitteltemperatur reicht von ${tempAt(destination, p.coldestMonth)} bis ${tempAt(destination, p.warmestMonth)} Grad, der nasseste Monat ist ${monthName(p.wettestMonth, locale)} mit ${wetAt(destination, p.wettestMonth)} Prozent Regentagen. Diese Seite bleibt als Provenienzseite erreichbar, damit die Zurückhaltung nachvollziehbar ist.`
       : `The record itself is complete: 262,992 hourly values from 1991 to 2020 at ${coord(cell.lat)}, ${coord(cell.lon)}, at a model elevation of ${num(cell.modelElevationM, locale)} metres. Mean monthly temperature runs from ${tempAt(destination, p.coldestMonth)} to ${tempAt(destination, p.warmestMonth)} degrees, and the wettest month is ${monthName(p.wettestMonth, locale)} at ${wetAt(destination, p.wettestMonth)} percent rain days. This page stays available so the decision to withhold can be checked.`]},
  ];
}

function scope(destination: PublicDestination, locale: Locale): Section {
  const de = locale === "de";
  const cell = destination.representativeCell;
  return {heading: de ? `Wofür diese Zahlen gelten` : `What these figures cover`,
    paragraphs: [de
      ? `Alle Werte stammen aus einer einzigen ausgewählten ERA5-Land-Modellgitterzelle bei ${coord(cell.lat)}, ${coord(cell.lon)} auf ${num(cell.modelElevationM, locale)} Metern, gemittelt über 1991 bis 2020. Sie beschreiben diesen Punkt, nicht jede Route der Region, und sind keine Vorhersage. Der Windwert ist grober 10-Meter-Gitterwind und keine Aussage über exponierte Wege oder Böen.`
      : `Every figure comes from one selected ERA5-Land model grid cell at ${coord(cell.lat)}, ${coord(cell.lon)}, ${num(cell.modelElevationM, locale)} metres, averaged over 1991 to 2020. It describes that point rather than every route in the region, and it is not a forecast. Wind is coarse 10 metre grid wind, not a statement about exposed paths or gusts.`]};
}

/** The article for a destination, ordered by what its data actually raises. */
export function longformSections(destination: PublicDestination, locale: Locale): Section[] {
  const p = profileFor(destination);
  if (p.seasonShape === "withheld") return [...withheldArticle(destination, p, locale), scope(destination, locale)];
  return [opening(destination, p, locale), whatCloses(destination, p, locale), conditions(destination, p, locale), scope(destination, locale)]
    .filter((section): section is Section => section !== null);
}
