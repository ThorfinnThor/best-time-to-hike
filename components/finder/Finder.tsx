"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale, SearchDestination } from "@/lib/data/types";
import { matchDestinations } from "@/lib/finder/match";
import { destinationPath, monthName } from "@/lib/i18n/config";

export function Finder({destinations,locale,compact=false}:{destinations:SearchDestination[];locale:Locale;compact?:boolean}) {
  const [month,setMonth]=useState(5); const [region,setRegion]=useState("all"); const [minTemp,setMinTemp]=useState(10); const [maxTemp,setMaxTemp]=useState(24); const [avoidRain,setAvoidRain]=useState(true); const [avoidSnow,setAvoidSnow]=useState(true); const [submitted,setSubmitted]=useState(false);
  const matches = useMemo(()=>matchDestinations(destinations,{month,region,minTemp,maxTemp,avoidRain,avoidSnow}).slice(0,compact?3:5),[destinations,month,region,minTemp,maxTemp,avoidRain,avoidSnow,compact]);
  const presets = locale === "de" ? [
    {label:"Warm im Mai",month:5,min:16,max:27,rain:true,snow:true},
    {label:"Schneefrei im Juni",month:6,min:8,max:24,rain:false,snow:true},
    {label:"Wenig Regen im September",month:9,min:10,max:25,rain:true,snow:true},
  ] : [
    {label:"Warm hiking in May",month:5,min:16,max:27,rain:true,snow:true},
    {label:"Snow-free in June",month:6,min:8,max:24,rain:false,snow:true},
    {label:"Low rain in September",month:9,min:10,max:25,rain:true,snow:true},
  ];

  function applyPreset(preset:(typeof presets)[number]) {
    setMonth(preset.month);
    setMinTemp(preset.min);
    setMaxTemp(preset.max);
    setAvoidRain(preset.rain);
    setAvoidSnow(preset.snow);
    setSubmitted(true);
  }

  return <section className={`finder ${compact?"finder-compact":""}`} aria-label={locale === "de" ? "Wanderziel-Finder" : "Hiking destination finder"}>
    <form onSubmit={(event)=>{event.preventDefault();setSubmitted(true);}}>
    <div className="finder-controls">
      <label><span>{locale === "de" ? "Reisemonat" : "Travel month"}</span><select value={month} onChange={(event)=>setMonth(Number(event.target.value))}>{Array.from({length:12},(_,index)=><option key={index+1} value={index+1}>{monthName(index+1,locale)}</option>)}</select></label>
      <label><span>{locale === "de" ? "Region" : "Region"}</span><select value={region} onChange={(event)=>setRegion(event.target.value)}><option value="all">{locale === "de" ? "Überall" : "Anywhere"}</option><option value="europe">Europe</option><option value="alps">Alps</option><option value="macaronesia">Macaronesia</option></select></label>
      <label className="range-label"><span>{locale === "de" ? "Wunschtemperatur" : "Preferred temperature"}</span><div><input aria-label="Minimum temperature" type="number" min="-10" max="35" value={minTemp} onChange={(event)=>setMinTemp(Number(event.target.value))}/><span>–</span><input aria-label="Maximum temperature" type="number" min="-5" max="40" value={maxTemp} onChange={(event)=>setMaxTemp(Number(event.target.value))}/><span>°C</span></div></label>
      <button type="button" className={avoidRain?"toggle active":"toggle"} onClick={()=>setAvoidRain(!avoidRain)} aria-pressed={avoidRain}>☂ {locale === "de" ? "Wenig Regen" : "Avoid rain"}</button>
      <button type="button" className={avoidSnow?"toggle active":"toggle"} onClick={()=>setAvoidSnow(!avoidSnow)} aria-pressed={avoidSnow}>❄ {locale === "de" ? "Kein Schnee" : "Avoid snow"}</button>
    </div>
    <button className="finder-submit" type="submit">{locale === "de" ? "Wanderziele finden" : "Find hiking destinations"}</button>
    </form>
    <div className="finder-presets" aria-label={locale === "de" ? "Schnellauswahl" : "Quick searches"}>{presets.map((preset)=><button type="button" key={preset.label} onClick={()=>applyPreset(preset)}>{preset.label}</button>)}</div>
    {submitted ? <div className="finder-results" aria-live="polite">{matches.map(({destination,month:result,match},index)=><Link key={destination.slug} href={destinationPath(locale,destination.slug,month)} className="result-card"><span className="result-rank">0{index+1}</span><div><strong>{destination.name}</strong><small>{destination.countryCode} · {Math.round(result.temp)}°C · {Math.round(result.wet*100)}% {locale === "de" ? "Regentage" : "wet days"}</small></div><div className="result-score"><strong>{match}%</strong><span>{locale === "de" ? "Match" : "match"}</span></div></Link>)}</div> : null}
    {compact&&submitted?<Link className="text-link" href={`/${locale}/finder`}>{locale === "de" ? "Alle Ergebnisse ansehen →" : "Explore all results →"}</Link>:null}
  </section>;
}
