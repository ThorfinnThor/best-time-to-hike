"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CompactSearchDestination, Locale, SearchDestination } from "@/lib/data/types";
import { defaultPreferences, ELEVATION_CEILING, facetsFor, matchDestinations, preferencesFromQuery, preferencesToQuery, relaxations, type FinderPreferences, type SortKey } from "@/lib/finder/match";
import { monthName, monthNameShort } from "@/lib/i18n/config";
import { t, taxonomyLabel } from "@/lib/i18n/dict";
import { destinationPath, links } from "@/lib/i18n/links";
import { useSaved } from "@/lib/client/saved";
import { SaveButton } from "@/components/finder/SaveButton";
import { DestinationImage } from "@/components/media/DestinationImage";

/**
 * A preset must actually do what its label says. "Low rain in September" used
 * to set only the month and one degree of temperature, because its rain flag
 * was already the default, so the chip named a filter it did not apply.
 */
const PRESETS = [
  {month: 5, minTemp: 16, maxTemp: 27, avoidRain: true, avoidSnow: true, maxWetDays: 1},
  {month: 6, minTemp: 8, maxTemp: 24, avoidRain: false, avoidSnow: true, maxWetDays: 1},
  {month: 9, minTemp: 10, maxTemp: 25, avoidRain: true, avoidSnow: true, maxWetDays: 0.25},
] as const;

const DAYLIGHT_FLOORS = [0, 8, 10, 12, 14] as const;
/** The compact finder has no catalogue to derive facets from. */
const CONTINENTS = ["africa", "asia", "europe", "north-america", "oceania", "south-america"];
/** Altitude bands a walker actually distinguishes, not equal numeric slices. */
const ELEVATION_BANDS = [
  {label: "any", min: 0, max: ELEVATION_CEILING},
  {label: "lowland", min: 0, max: 600},
  {label: "hill", min: 300, max: 1500},
  {label: "mountain", min: 1000, max: 2500},
  {label: "highAlpine", min: 2000, max: ELEVATION_CEILING},
] as const;
const SORTS: SortKey[] = ["match", "score", "warmest", "name"];

/**
 * `destinations` is omitted in compact mode on purpose.
 *
 * Props to a client component are serialised into the page's RSC payload, so
 * passing the search index put 453 KB of JSON into every page that rendered a
 * finder: the home page was 891 KB of HTML. That is the sibling project's
 * mistakes.md #15, a failure that only shows up on a phone. The compact finder
 * is therefore a form that navigates to the finder page carrying its search in
 * the URL, and only the finder page loads the data.
 */
export function Finder({destinations, locale, compact = false}: {destinations?: CompactSearchDestination[]; locale: Locale; compact?: boolean}) {
  const copy = t(locale);
  const router = useRouter();
  const [preferences, setPreferences] = useState<FinderPreferences>(defaultPreferences);
  const [submitted, setSubmitted] = useState(false);
  // 139 matches rendered at once is a 22,000px page on a phone. The count stays
  // honest; the DOM does not have to.
  const PAGE = 25;
  const [visible, setVisible] = useState(PAGE);
  const {saved, ready: savedReady, toggle: toggleSaved, has: isSaved} = useSaved();
  const [savedOnly, setSavedOnly] = useState(false);
  const navigates = !destinations;

  // Search state travels in the URL. Read it after mount rather than during
  // render: the page is prerendered without a query string, so parsing it in
  // the initial state would cause a hydration mismatch.
  useEffect(() => {
    if (navigates || typeof window === "undefined" || !window.location.search) return;
    setPreferences(preferencesFromQuery(window.location.search));
    setSubmitted(true);
  }, [navigates]);

  useEffect(() => {
    if (navigates || typeof window === "undefined") return;
    const query = preferencesToQuery(preferences);
    const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [navigates, preferences]);

  // Expanding on the client costs nothing measurable and keeps the matcher
  // readable; the saving that matters is in the bytes that crossed the wire.
  const catalogue = useMemo<SearchDestination[]>(() => (destinations ?? []).map((destination) => ({
    id: destination.slug,
    slug: destination.slug,
    name: destination.name,
    countryCode: destination.countryCode,
    continent: destination.continent,
    region: destination.region,
    tags: destination.tags,
    elevationM: destination.elevationM,
    recommendationEligible: true,
    monthly: destination.monthly.map(([m, score, temp, wet, snow, hot, daylight]) => ({
      m, score, temp, wet, snow, hot, daylight, wind: 0, confidence: 64, recommendationEligible: true,
    })),
  })), [destinations]);
  const facets = useMemo(() => facetsFor(catalogue), [catalogue]);
  const regions = preferences.continent === "all" ? [] : facets.regionsByContinent[preferences.continent] ?? [];
  const matches = useMemo(() => navigates ? [] : matchDestinations(catalogue, preferences), [navigates, catalogue, preferences]);
  const filtered = savedOnly ? matches.filter((result) => saved.includes(result.destination.slug)) : matches;
  const shown = compact ? filtered.slice(0, 3) : filtered.slice(0, visible);
  // Only computed when there is nothing to show, so the cost lands where it helps.
  const offers = useMemo(() => (navigates || matches.length ? [] : relaxations(catalogue, preferences)), [navigates, matches.length, catalogue, preferences]);
  const showResults = navigates ? false : compact ? submitted : true;
  const goToFinder = (next: FinderPreferences) => {
    const query = preferencesToQuery(next);
    router.push(`${links.finder(locale)}${query ? `?${query}` : ""}`);
  };

  const update = (patch: Partial<FinderPreferences>) => { setVisible(PAGE); setPreferences((current) => ({...current, ...patch})); };
  const toggleTag = (tag: string) => update({tags: preferences.tags.includes(tag) ? preferences.tags.filter((item) => item !== tag) : [...preferences.tags, tag]});

  function applyPreset(preset: (typeof PRESETS)[number]) {
    const next = {...defaultPreferences, ...preset, months: [preset.month]};
    setPreferences(next);
    if (navigates) { goToFinder(next); return; }
    setSubmitted(true);
  }

  return <section className={`finder ${compact ? "finder-compact" : ""}`} aria-label={copy.finder.aria}>
    <form onSubmit={(event) => {event.preventDefault(); if (navigates) { goToFinder(preferences); return; } setSubmitted(true);}}>
      <div className="finder-controls">
        <label><span>{copy.finder.month}</span>
          <select value={preferences.months.length === 1 ? String(preferences.months[0]) : preferences.months.length === 0 ? "any" : "several"}
            onChange={(event) => update({months: event.target.value === "any" || event.target.value === "several" ? [] : [Number(event.target.value)]})}>
            <option value="any">{copy.finder.anyMonth}</option>
            {preferences.months.length > 1 ? <option value="several">{copy.finder.severalMonths(preferences.months.length)}</option> : null}
            {Array.from({length: 12}, (_, index) => <option key={index + 1} value={index + 1}>{monthName(index + 1, locale)}</option>)}
          </select>
        </label>
        <label><span>{copy.finder.continent}</span>
          <select value={preferences.continent} onChange={(event) => update({continent: event.target.value, region: "all"})}>
            <option value="all">{copy.finder.allContinents}</option>
            {(facets.continents.length ? facets.continents : CONTINENTS).map((continent) => <option key={continent} value={continent}>{taxonomyLabel(locale, "continents", continent)}</option>)}
          </select>
        </label>
        {!compact && regions.length > 1 ? <label><span>{copy.finder.region}</span>
          <select value={preferences.region} onChange={(event) => update({region: event.target.value})}>
            <option value="all">{copy.finder.allRegions}</option>
            {regions.map((region) => <option key={region} value={region}>{taxonomyLabel(locale, "regions", region)}</option>)}
          </select>
        </label> : null}
        <label className="range-label"><span>{copy.finder.temperature}</span>
          <div>
            <input aria-label={copy.finder.minAria} type="number" min="-10" max="35" value={preferences.minTemp} onChange={(event) => update({minTemp: Number(event.target.value)})}/>
            <span>–</span>
            <input aria-label={copy.finder.maxAria} type="number" min="-5" max="40" value={preferences.maxTemp} onChange={(event) => update({maxTemp: Number(event.target.value)})}/>
            <span>°C</span>
          </div>
        </label>
        <button type="button" className={preferences.avoidRain ? "toggle active" : "toggle"} onClick={() => update({avoidRain: !preferences.avoidRain})} aria-pressed={preferences.avoidRain}>☂ {copy.finder.avoidRain}</button>
        <button type="button" className={preferences.avoidSnow ? "toggle active" : "toggle"} onClick={() => update({avoidSnow: !preferences.avoidSnow})} aria-pressed={preferences.avoidSnow}>❄ {copy.finder.avoidSnow}</button>
        {!compact ? <button type="button" className={preferences.avoidHeat ? "toggle active" : "toggle"} onClick={() => update({avoidHeat: !preferences.avoidHeat})} aria-pressed={preferences.avoidHeat}>☀ {copy.finder.avoidHeat}</button> : null}
        {!compact ? <label><span>{copy.finder.elevation}</span>
          <select value={`${preferences.minElevation}-${preferences.maxElevation}`}
            onChange={(event) => {const [min, max] = event.target.value.split("-").map(Number); update({minElevation: min, maxElevation: max});}}>
            {ELEVATION_BANDS.map((band) => <option key={band.label} value={`${band.min}-${band.max}`}>{copy.finder.elevationBands[band.label]}</option>)}
          </select>
        </label> : null}
        {!compact ? <label><span>{copy.finder.minDaylight}</span>
          <select value={preferences.minDaylight} onChange={(event) => update({minDaylight: Number(event.target.value)})}>
            {DAYLIGHT_FLOORS.map((hours) => <option key={hours} value={hours}>{hours === 0 ? "—" : `${hours} ${copy.finder.hoursShort}`}</option>)}
          </select>
        </label> : null}
      </div>

      {!compact ? <details className="finder-more-filters">
        <summary>{copy.finder.moreFilters}</summary>
        <fieldset className="finder-months">
          <legend>{copy.finder.monthsLegend}</legend>
          {Array.from({length: 12}, (_, index) => index + 1).map((month) => <button type="button" key={month}
            className={preferences.months.includes(month) ? "tag-chip active" : "tag-chip"}
            aria-pressed={preferences.months.includes(month)}
            onClick={() => update({months: preferences.months.includes(month)
              ? preferences.months.filter((value) => value !== month)
              : [...preferences.months, month].sort((a, b) => a - b)})}>
            {monthNameShort(month, locale)}
          </button>)}
        </fieldset>
        <fieldset className="finder-tags">
          <legend>{copy.finder.terrain}</legend>
          {facets.tags.map((tag) => <button type="button" key={tag} className={preferences.tags.includes(tag) ? "tag-chip active" : "tag-chip"} onClick={() => toggleTag(tag)} aria-pressed={preferences.tags.includes(tag)}>{taxonomyLabel(locale, "tags", tag)}</button>)}
        </fieldset>
      </details> : null}

      {compact ? <button className="finder-submit" type="submit">{copy.finder.submit}</button> : null}
    </form>

    <div className="finder-presets" aria-label={copy.finder.presetsAria}>
      {PRESETS.map((preset, index) => <button type="button" key={copy.finder.presets[index]} onClick={() => applyPreset(preset)}>{copy.finder.presets[index]}</button>)}
      {!compact ? <button type="button" onClick={() => {setPreferences(defaultPreferences);}}>{copy.finder.reset}</button> : null}
    </div>

    {showResults ? <>
      {!compact ? <div className="finder-summary">
        <strong aria-live="polite">{copy.finder.resultCount(filtered.length)}</strong>
        {savedReady && saved.length > 1 ? <Link className="compare-saved-link" href={`${links.compareIndex(locale)}?d=${saved.slice(0, 4).join(",")}`}>
          {copy.finder.compareSaved(Math.min(saved.length, 4))}
        </Link> : null}
        {savedReady && saved.length ? <button type="button" className={savedOnly ? "toggle active saved-toggle" : "toggle saved-toggle"}
          aria-pressed={savedOnly} onClick={() => {setSavedOnly(!savedOnly); setVisible(PAGE);}}>
          ★ {copy.finder.savedOnly} <span>{saved.length}</span>
        </button> : null}
        {matches.length ? <label className="finder-sort"><span>{copy.finder.sort}</span>
          <select value={preferences.sort} onChange={(event) => update({sort: event.target.value as SortKey})}>
            {SORTS.map((key) => <option key={key} value={key}>{copy.finder.sortOptions[key]}</option>)}
          </select>
        </label> : null}
      </div> : null}

      {!compact && filtered.length ? <p className="finder-legend">{copy.finder.legend}</p> : null}

      {savedOnly && !filtered.length ? <div className="finder-empty" role="status"><strong>{copy.finder.savedEmpty}</strong></div>
      : filtered.length ? <div className="result-grid">
        {shown.map(({destination, month, match, reasons}) => <article className="result-tile" key={destination.slug}>
          <Link className="result-tile-art" href={destinationPath(locale, destination.slug, month.m)} aria-label={destination.name}>
            <DestinationImage slug={destination.slug} name={destination.name} region={taxonomyLabel(locale, "regions", destination.region)}/>
            <span className="result-tile-score" title={copy.finder.scoreTitle}>{month.score}</span>
          </Link>
          <div className="result-tile-body">
            <div className="result-tile-heading">
              <div>
                <span>{destination.countryCode} · {Math.round(month.temp)}°C · {Math.round(month.wet * 100)}% {copy.common.wetDays}</span>
                <h3><Link href={destinationPath(locale, destination.slug, month.m)}>{destination.name}</Link></h3>
              </div>
              <SaveButton slug={destination.slug} name={destination.name} saved={isSaved(destination.slug)} onToggle={toggleSaved} locale={locale}/>
            </div>
            <p className="result-tile-month">{preferences.months.length === 1 ? copy.finder.inMonth(monthName(month.m, locale)) : copy.finder.bestMonthFound(monthName(month.m, locale))}</p>
            <ul className="result-tile-reasons">
              {reasons.slice(0, 3).map((reason) => <li key={reason}>{copy.finder.reasons[reason]}</li>)}
            </ul>
            <div className="result-tile-foot">
              <span className="result-tile-match"><strong>{match}%</strong> {copy.common.match}</span>
              <Link href={destinationPath(locale, destination.slug, month.m)}>{copy.finder.seeDetails}</Link>
            </div>
          </div>
        </article>)}
      </div> : <div className="finder-empty" role="status">
        <strong>{copy.finder.noResultsTitle}</strong>
        <p>{copy.finder.noResultsBody}</p>
      </div>}

      {!compact && filtered.length > shown.length
        ? <button type="button" className="finder-more" onClick={() => setVisible((count) => count + PAGE)}>
            {copy.finder.showMore(filtered.length - shown.length)}
          </button>
        : null}
      {compact && filtered.length ? <Link className="text-link" href={links.finder(locale)}>{copy.finder.allResults}</Link> : null}
    </> : null}
  </section>;
}
