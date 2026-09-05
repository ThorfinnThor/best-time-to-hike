"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale, SearchDestination } from "@/lib/data/types";
import { matchDestinations } from "@/lib/finder/match";
import { monthName } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { destinationPath, links } from "@/lib/i18n/links";

const PRESETS = [
  {month:5,min:16,max:27,rain:true,snow:true},
  {month:6,min:8,max:24,rain:false,snow:true},
  {month:9,min:10,max:25,rain:true,snow:true},
] as const;

export function Finder({destinations,locale,compact=false}:{destinations:SearchDestination[];locale:Locale;compact?:boolean}) {
  const copy = t(locale);
  const [month,setMonth]=useState(5); const [region,setRegion]=useState("all"); const [minTemp,setMinTemp]=useState(10); const [maxTemp,setMaxTemp]=useState(24); const [avoidRain,setAvoidRain]=useState(true); const [avoidSnow,setAvoidSnow]=useState(true); const [submitted,setSubmitted]=useState(false);
  const matches = useMemo(()=>matchDestinations(destinations,{month,region,minTemp,maxTemp,avoidRain,avoidSnow}).slice(0,compact?3:5),[destinations,month,region,minTemp,maxTemp,avoidRain,avoidSnow,compact]);

  function applyPreset(preset:(typeof PRESETS)[number]) {
    setMonth(preset.month);
    setMinTemp(preset.min);
    setMaxTemp(preset.max);
    setAvoidRain(preset.rain);
    setAvoidSnow(preset.snow);
    setSubmitted(true);
  }

  return <section className={`finder ${compact?"finder-compact":""}`} aria-label={copy.finder.aria}>
    <form onSubmit={(event)=>{event.preventDefault();setSubmitted(true);}}>
    <div className="finder-controls">
      <label><span>{copy.finder.month}</span><select value={month} onChange={(event)=>setMonth(Number(event.target.value))}>{Array.from({length:12},(_,index)=><option key={index+1} value={index+1}>{monthName(index+1,locale)}</option>)}</select></label>
      <label><span>{copy.finder.region}</span><select value={region} onChange={(event)=>setRegion(event.target.value)}><option value="all">{copy.finder.anywhere}</option><option value="europe">Europe</option><option value="alps">Alps</option><option value="macaronesia">Macaronesia</option></select></label>
      <label className="range-label"><span>{copy.finder.temperature}</span><div><input aria-label={copy.finder.minAria} type="number" min="-10" max="35" value={minTemp} onChange={(event)=>setMinTemp(Number(event.target.value))}/><span>–</span><input aria-label={copy.finder.maxAria} type="number" min="-5" max="40" value={maxTemp} onChange={(event)=>setMaxTemp(Number(event.target.value))}/><span>°C</span></div></label>
      <button type="button" className={avoidRain?"toggle active":"toggle"} onClick={()=>setAvoidRain(!avoidRain)} aria-pressed={avoidRain}>☂ {copy.finder.avoidRain}</button>
      <button type="button" className={avoidSnow?"toggle active":"toggle"} onClick={()=>setAvoidSnow(!avoidSnow)} aria-pressed={avoidSnow}>❄ {copy.finder.avoidSnow}</button>
    </div>
    <button className="finder-submit" type="submit">{copy.finder.submit}</button>
    </form>
    <div className="finder-presets" aria-label={copy.finder.presetsAria}>{PRESETS.map((preset,index)=><button type="button" key={copy.finder.presets[index]} onClick={()=>applyPreset(preset)}>{copy.finder.presets[index]}</button>)}</div>
    {submitted ? <div className="finder-results" aria-live="polite">{matches.map(({destination,month:result,match},index)=><Link key={destination.slug} href={destinationPath(locale,destination.slug,month)} className="result-card"><span className="result-rank">0{index+1}</span><div><strong>{destination.name}</strong><small>{destination.countryCode} · {Math.round(result.temp)}°C · {Math.round(result.wet*100)}% {copy.common.wetDays}</small></div><div className="result-score"><strong>{match}%</strong><span>{copy.common.match}</span></div></Link>)}</div> : null}
    {compact&&submitted?<Link className="text-link" href={links.finder(locale)}>{copy.finder.allResults}</Link>:null}
  </section>;
}
