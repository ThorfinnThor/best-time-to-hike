import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Comparison, PublicDestination, Ranking, SearchDestination } from "@/lib/data/types";

const root = join(process.cwd(),"public/data/hiking");
const read = <T>(path:string):T => JSON.parse(readFileSync(join(root,path),"utf8")) as T;
export const getDestinationIndex = () => read<Array<{id:string;slug:string;name:string;countryCode:string;countryName:string;continent:string;region:string;tags:string[];bestMonths:number[]}>>("destinations/index.json");
export const getDestination = (slug:string) => {
  const entry = getDestinationIndex().find((item)=>item.slug===slug);
  if (!entry) return null;
  return read<PublicDestination>(`destinations/${entry.countryCode.toLowerCase()}/${slug}.json`);
};
export const getAllDestinations = () => getDestinationIndex().map((item)=>getDestination(item.slug)!);
export const getSearchIndex = () => read<SearchDestination[]>("search/destination-index.json");
export const getRanking = (month:number,theme:"all"|"warm"|"snow-free"|"low-rain"="all") => read<Ranking>(`rankings/${theme === "all" ? "global" : theme}-${month}.json`);
export const getComparisonIndex = () => read<Array<{slug:string;destinations:[string,string];indexable:boolean}>>("comparisons/comparison-index.json");
export const getComparison = (slug:string) => read<Comparison>(`comparisons/${slug}.json`);
export const getManifest = () => read<{datasetStatus:"fixture"|"provisional"|"production";datasetVersion:string;generatedAt:string;destinationCount:number}>("manifest.json");
