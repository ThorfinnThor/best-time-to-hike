"use client";

import { useEffect, useRef, useState } from "react";
import { parseRankingRegion, rankingRegionHref, type RankingRegion } from "@/lib/hiking/ranking-region";

/**
 * The only interactive part of a ranking page.
 *
 * The cards are server-rendered HTML carrying `data-continent`; this sets
 * `data-region` on the surrounding `.ranking-explorer`, and globals.css hides
 * the cards outside the region and renumbers the rest with a CSS counter. It
 * used to be the other way round: the whole list was a client component, so a
 * phone hydrated 168 cards and 340 links to make one select box work, and the
 * November ranking spent up to three seconds in script evaluation.
 *
 * Every string arrives prepared from the server, so dict.ts stays out of the
 * browser bundle.
 */
export function RankingRegionFilter({label, options, counts, initialCount}: {
  label: string;
  options: Array<{value: RankingRegion; label: string}>;
  /** The result-count sentence for each region; absent on the month-selection page. */
  counts?: Partial<Record<RankingRegion, {text: string; empty: boolean}>>;
  initialCount?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Static HTML is worldwide; the query is applied after hydration so the
  // first client render matches it on shared links and reloads.
  const [region, setRegion] = useState<RankingRegion>("worldwide");

  useEffect(() => {
    setRegion(parseRankingRegion(new URLSearchParams(window.location.search).get("region")));
  }, []);

  useEffect(() => {
    const explorer = ref.current?.closest(".ranking-explorer");
    if (!explorer) return;
    if (region === "worldwide") explorer.removeAttribute("data-region");
    else explorer.setAttribute("data-region", region);
    // Month links carry the region, so switching month keeps the filter.
    for (const link of explorer.querySelectorAll<HTMLAnchorElement>(".ranking-months a[data-base]")) {
      link.href = rankingRegionHref(link.dataset.base!, region);
    }
    const empty = explorer.querySelector<HTMLElement>(".ranking-empty");
    if (empty) empty.hidden = !counts?.[region]?.empty;
  }, [region, counts]);

  function choose(value: RankingRegion) {
    setRegion(value);
    const url = new URL(window.location.href);
    if (value === "worldwide") url.searchParams.delete("region"); else url.searchParams.set("region", value);
    window.history.replaceState(window.history.state, "", url);
  }

  return <div className="ranking-filter" ref={ref}>
    <label><span>{label}</span><select value={region} onChange={(event) => choose(parseRankingRegion(event.target.value))}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select></label>
    {counts ? <p role="status">{counts[region]?.text ?? initialCount}</p> : null}
  </div>;
}
