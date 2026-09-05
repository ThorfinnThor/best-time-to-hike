"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CompactSearchDestination, Locale } from "@/lib/data/types";
import { monthName, monthNameShort } from "@/lib/i18n/config";
import { t, taxonomyLabel } from "@/lib/i18n/dict";
import { destinationPath } from "@/lib/i18n/links";
import { useSaved } from "@/lib/client/saved";

const MAX = 4;

/**
 * Compare destinations the reader chooses.
 *
 * Three fixed pairs were published as static pages; 293 recommendable
 * destinations make 42,778 pairs, so comparison has to be a tool rather than a
 * page. It runs on the same compact index the finder uses and adds no request.
 *
 * The index holds only recommendation-eligible months, so a blank cell is a
 * real statement: the gate withholds that month. The grid says so rather than
 * showing a low score, which is the same honesty the destination pages keep.
 */
export function ComparisonTool({destinations, locale}: {destinations: CompactSearchDestination[]; locale: Locale}) {
  const copy = t(locale);
  const [chosen, setChosen] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const {saved, ready: savedReady} = useSaved();

  const bySlug = useMemo(() => new Map(destinations.map((destination) => [destination.slug, destination])), [destinations]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("d");
    if (requested) setChosen(requested.split(",").map((slug) => slug.trim()).filter((slug) => bySlug.has(slug)).slice(0, MAX));
  }, [bySlug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = chosen.length ? `${window.location.pathname}?d=${chosen.join(",")}` : window.location.pathname;
    window.history.replaceState(null, "", next);
  }, [chosen]);

  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return destinations
      .filter((destination) => !chosen.includes(destination.slug) && destination.name.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [query, destinations, chosen]);

  const picked = chosen.map((slug) => bySlug.get(slug)).filter((value): value is CompactSearchDestination => Boolean(value));
  const add = (slug: string) => { if (picked.length < MAX) setChosen([...chosen, slug]); setQuery(""); };
  const remove = (slug: string) => setChosen(chosen.filter((value) => value !== slug));
  const monthEntry = (destination: CompactSearchDestination, month: number) => destination.monthly.find(([m]) => m === month);

  return <section className="compare-tool" aria-label={copy.compare.aria}>
    <div className="compare-picker">
      <label>
        <span>{copy.compare.addLabel}</span>
        <input type="search" value={query} placeholder={copy.compare.placeholder}
          onChange={(event) => setQuery(event.target.value)} disabled={picked.length >= MAX}/>
      </label>
      {suggestions.length ? <ul className="compare-suggestions">
        {suggestions.map((destination) => <li key={destination.slug}>
          <button type="button" onClick={() => add(destination.slug)}>
            {destination.name} <small>{taxonomyLabel(locale, "regions", destination.region)}</small>
          </button>
        </li>)}
      </ul> : null}
      {savedReady && saved.length > 1 && !chosen.length ? <button type="button" className="compare-from-saved"
        onClick={() => setChosen(saved.filter((slug) => bySlug.has(slug)).slice(0, MAX))}>
        {copy.compare.fromShortlist(Math.min(saved.length, MAX))}
      </button> : null}
    </div>

    {picked.length < 2
      ? <p className="compare-hint">{copy.compare.pickTwo}</p>
      : <div className="compare-grid-wrap">
        <table className="compare-grid">
          <thead>
            <tr>
              <th scope="col">{copy.common.month}</th>
              {picked.map((destination) => <th scope="col" key={destination.slug}>
                <Link href={destinationPath(locale, destination.slug)}>{destination.name}</Link>
                <small>{destination.countryCode} · {destination.elevationM} m</small>
                <button type="button" onClick={() => remove(destination.slug)} aria-label={copy.compare.removeLabel(destination.name)}>×</button>
              </th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({length: 12}, (_, index) => index + 1).map((month) => <tr key={month}>
              <th scope="row"><abbr title={monthName(month, locale)}>{monthNameShort(month, locale)}</abbr></th>
              {picked.map((destination) => {
                const entry = monthEntry(destination, month);
                return <td key={destination.slug} className={entry ? "open" : "closed"}>
                  {entry
                    ? <><strong>{entry[1]}</strong><small>{Math.round(entry[2])}°C</small></>
                    : <span className="closed-mark" title={copy.compare.notRecommended}>{copy.compare.closedShort}</span>}
                </td>;
              })}
            </tr>)}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{copy.compare.recommendableMonths}</th>
              {picked.map((destination) => <td key={destination.slug}><strong>{destination.monthly.length}</strong><small>/12</small></td>)}
            </tr>
          </tfoot>
        </table>
        <p className="compare-note">{copy.compare.closedNote}</p>
      </div>}
  </section>;
}
