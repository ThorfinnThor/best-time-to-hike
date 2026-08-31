import type { ComponentScores, Locale } from "@/lib/data/types";
const labels = {temperature:{en:"Temperature",de:"Temperatur"},precipitation:{en:"Rain",de:"Regen"},snow:{en:"Snow",de:"Schnee"},heatStress:{en:"Heat",de:"Hitze"},wind:{en:"Wind",de:"Wind"},daylight:{en:"Daylight",de:"Tageslicht"}} as const;
export function ComponentGrid({components,locale}:{components:ComponentScores;locale:Locale}) {
  return <div className="component-grid">{(Object.keys(components) as Array<keyof ComponentScores>).map((key)=><div className="component-card" key={key}><div><span>{labels[key][locale]}</span><strong>{Math.round(components[key])}</strong></div><div className="meter"><span style={{width:`${components[key]}%`}} /></div></div>)}</div>;
}
