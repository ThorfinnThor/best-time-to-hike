"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale, SearchDestination } from "@/lib/data/types";
import { defaultPreferences, facetsFor, matchDestinations, type FinderPreferences, type MonthSelection, type SortKey } from "@/lib/finder/match";
import { monthName } from "@/lib/i18n/config";
import { t, taxonomyLabel } from "@/lib/i18n/dict";
import { destinationPath, links } from "@/lib/i18n/links";

const PRESETS = [
  {month: 5, min: 16, max: 27, rain: true, snow: true},
  {month: 6, min: 8, max: 24, rain: false, snow: true},
  {month: 9, min: 10, max: 25, rain: true, snow: true},
] as const;

const DAYLIGHT_FLOORS = [0, 8, 10, 12, 14] as const;
const SORTS: SortKey[] = ["match", "score", "warmest", "name"];

export function Finder({destinations, locale, compact = false}: {destinations: SearchDestination[]; locale: Locale; compact?: boolean}) {
  const copy = t(locale);
  const [preferences, setPreferences] = useState<FinderPreferences>(defaultPreferences);
  const [submitted, setSubmitted] = useState(false);

  const facets = useMemo(() => facetsFor(destinations), [destinations]);
  const regions = preferences.continent === "all" ? [] : facets.regionsByContinent[preferences.continent] ?? [];
  const matches = useMemo(() => matchDestinations(destinations, preferences), [destinations, preferences]);
  const shown = compact ? matches.slice(0, 3) : matches;
  const showResults = compact ? submitted : true;

  const update = (patch: Partial<FinderPreferences>) => setPreferences((current) => ({...current, ...patch}));
  const toggleTag = (tag: string) => update({tags: preferences.tags.includes(tag) ? preferences.tags.filter((item) => item !== tag) : [...preferences.tags, tag]});

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setPreferences({...defaultPreferences, month: preset.month, minTemp: preset.min, maxTemp: preset.max, avoidRain: preset.rain, avoidSnow: preset.snow});
    setSubmitted(true);
  }

  return <section className={`finder ${compact ? "finder-compact" : ""}`} aria-label={copy.finder.aria}>
    <form onSubmit={(event) => {event.preventDefault(); setSubmitted(true);}}>
      <div className="finder-controls">
        <label><span>{copy.finder.month}</span>
          <select value={String(preferences.month)} onChange={(event) => update({month: (event.target.value === "any" ? "any" : Number(event.target.value)) as MonthSelection})}>
            <option value="any">{copy.finder.anyMonth}</option>
            {Array.from({length: 12}, (_, index) => <option key={index + 1} value={index + 1}>{monthName(index + 1, locale)}</option>)}
          </select>
        </label>
        <label><span>{copy.finder.continent}</span>
          <select value={preferences.continent} onChange={(event) => update({continent: event.target.value, region: "all"})}>
            <option value="all">{copy.finder.allContinents}</option>
            {facets.continents.map((continent) => <option key={continent} value={continent}>{taxonomyLabel(locale, "continents", continent)}</option>)}
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
        {!compact ? <label><span>{copy.finder.minDaylight}</span>
          <select value={preferences.minDaylight} onChange={(event) => update({minDaylight: Number(event.target.value)})}>
            {DAYLIGHT_FLOORS.map((hours) => <option key={hours} value={hours}>{hours === 0 ? "—" : `${hours} ${copy.finder.hoursShort}`}</option>)}
          </select>
        </label> : null}
      </div>

      {!compact ? <fieldset className="finder-tags">
        <legend>{copy.finder.terrain}</legend>
        {facets.tags.map((tag) => <button type="button" key={tag} className={preferences.tags.includes(tag) ? "tag-chip active" : "tag-chip"} onClick={() => toggleTag(tag)} aria-pressed={preferences.tags.includes(tag)}>{taxonomyLabel(locale, "tags", tag)}</button>)}
      </fieldset> : null}

      {compact ? <button className="finder-submit" type="submit">{copy.finder.submit}</button> : null}
    </form>

    <div className="finder-presets" aria-label={copy.finder.presetsAria}>
      {PRESETS.map((preset, index) => <button type="button" key={copy.finder.presets[index]} onClick={() => applyPreset(preset)}>{copy.finder.presets[index]}</button>)}
      {!compact ? <button type="button" onClick={() => {setPreferences(defaultPreferences);}}>{copy.finder.reset}</button> : null}
    </div>

    {showResults ? <>
      {!compact ? <div className="finder-summary">
        <strong aria-live="polite">{copy.finder.resultCount(matches.length)}</strong>
        {matches.length ? <label className="finder-sort"><span>{copy.finder.sort}</span>
          <select value={preferences.sort} onChange={(event) => update({sort: event.target.value as SortKey})}>
            {SORTS.map((key) => <option key={key} value={key}>{copy.finder.sortOptions[key]}</option>)}
          </select>
        </label> : null}
      </div> : null}

      {matches.length ? <div className="finder-results">
        {shown.map(({destination, month, match, reasons}, index) => <Link key={destination.slug} href={destinationPath(locale, destination.slug, month.m)} className="result-card">
          <span className="result-rank">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{destination.name}</strong>
            <small>{destination.countryCode} · {taxonomyLabel(locale, "regions", destination.region)} · {Math.round(month.temp)}°C · {Math.round(month.wet * 100)}% {copy.common.wetDays}</small>
            <small className="result-why">{preferences.month === "any" ? copy.finder.bestMonthFound(monthName(month.m, locale)) : copy.finder.inMonth(monthName(month.m, locale))} · {reasons.map((reason) => copy.finder.reasons[reason]).join(" · ")}</small>
          </div>
          <div className="result-score"><strong>{match}%</strong><span>{copy.common.match}</span></div>
        </Link>)}
      </div> : <div className="finder-empty" role="status">
        <strong>{copy.finder.noResultsTitle}</strong>
        <p>{copy.finder.noResultsBody}</p>
      </div>}

      {compact && matches.length ? <Link className="text-link" href={links.finder(locale)}>{copy.finder.allResults}</Link> : null}
    </> : null}
  </section>;
}
