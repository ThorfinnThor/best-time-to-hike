import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "out";
const RUNNER = join(OUT, "qa-layout-scan", "index.html");

function collectRoutes(directory: string, routes: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collectRoutes(path, routes);
    else if (entry.name === "index.html" && !path.includes(`${join(OUT, "qa-")}`)) {
      const route = `/${relative(OUT, path).replaceAll("\\", "/").replace(/index\.html$/, "")}`.replace(/\/+/g, "/");
      routes.push(route);
    }
  }
  return routes;
}

const routes = collectRoutes(OUT).sort();
const routeJson = JSON.stringify(routes).replaceAll("<", "\\u003c");

const runtime = String.raw`
const routes=JSON.parse(document.querySelector("#routes").textContent);
const viewports=[
  {name:"desktop-1440",width:1440,height:1000},
  {name:"desktop-1280",width:1280,height:800},
  {name:"tablet-768",width:768,height:1024},
  {name:"mobile-390",width:390,height:844}
];
const issues=[];
const startedAt=Date.now();
let completed=0;
const progress=document.querySelector("#progress");
const resultNode=document.querySelector("#result");
const visible=(element,view)=>{const style=view.getComputedStyle(element);const rect=element.getBoundingClientRect();return style.display!=="none"&&style.visibility!=="hidden"&&rect.width>0&&rect.height>0};
const number=(value)=>{const parsed=Number.parseFloat(value);return Number.isFinite(parsed)?parsed:0};
const insideHorizontalScroller=(element,view,body)=>{let parent=element.parentElement;while(parent&&parent!==body){const overflowX=view.getComputedStyle(parent).overflowX;if(overflowX==="auto"||overflowX==="scroll")return true;parent=parent.parentElement}return false};
function measure(frame,route,viewport){
  const view=frame.contentWindow;
  const doc=frame.contentDocument;
  if(!view||!doc||!doc.documentElement)return {route,viewport:viewport.name,flags:["document-unavailable"]};
  const root=doc.documentElement;
  const body=doc.body;
  const h1=doc.querySelector("h1");
  const flags=[];
  const overflow=root.scrollWidth-root.clientWidth;
  if(overflow>1)flags.push("horizontal-overflow");
  if(!h1)flags.push("missing-h1");
  const h1Rect=h1?.getBoundingClientRect();
  const h1Style=h1?view.getComputedStyle(h1):null;
  const h1Font=h1Style?number(h1Style.fontSize):0;
  const h1LineHeight=h1Style?(h1Style.lineHeight==="normal"?h1Font*1.2:number(h1Style.lineHeight)):0;
  const h1Lines=h1Rect&&h1LineHeight?Math.max(1,Math.round(h1Rect.height/h1LineHeight)):0;
  if(h1Lines>(viewport.width>=768?5:7))flags.push("too-many-h1-lines");
  if(h1Rect&&(h1Rect.left<-1||h1Rect.right>viewport.width+1))flags.push("h1-outside-viewport");
  if(h1Style&&(h1Style.hyphens==="auto"||h1.textContent?.includes("\u00ad")))flags.push("automatic-h1-hyphenation");
  if(h1Rect&&viewport.width>=768&&h1Rect.width<viewport.width*.38&&h1Lines>=3)flags.push("narrow-desktop-h1");
  const hero=h1?.closest(".home-hero,.destination-hero,.month-hero,.page-intro,.tool-intro")||h1?.parentElement;
  const heroRect=hero?.getBoundingClientRect();
  if(heroRect&&heroRect.height>viewport.height*.92)flags.push("very-tall-hero");
  const paragraphs=[...doc.querySelectorAll("main p")].filter((element)=>visible(element,view)&&((element.textContent||"").trim().length>100));
  const paragraphMetrics=paragraphs.map((element)=>{const style=view.getComputedStyle(element);const rect=element.getBoundingClientRect();return {font:number(style.fontSize),width:rect.width,textLength:(element.textContent||"").trim().length,inCompactCard:Boolean(element.closest(".trust-card"))}});
  const minimumBodyFont=paragraphMetrics.length?Math.min(...paragraphMetrics.map((item)=>item.font)):null;
  if(minimumBodyFont!==null&&minimumBodyFont<14)flags.push("small-body-copy");
  if(paragraphMetrics.some((item)=>viewport.width>=768&&item.width<240&&!item.inCompactCard))flags.push("narrow-text-column");
  if(paragraphMetrics.some((item)=>viewport.width>=768&&item.width>900&&item.textLength>160))flags.push("overwide-text-column");
  const tables=[...doc.querySelectorAll("table")].filter((element)=>visible(element,view));
  const unusableTables=tables.filter((table)=>{
    if(table.scrollWidth<=table.clientWidth+1)return false;
    return !insideHorizontalScroller(table,view,body);
  }).length;
  if(unusableTables)flags.push("uncontained-wide-table");
  const main=doc.querySelector("main");
  const blocks=main?[...main.children].filter((element)=>visible(element,view)).map((element)=>element.getBoundingClientRect()).sort((a,b)=>a.top-b.top):[];
  let largestGap=0;
  for(let index=1;index<blocks.length;index+=1)largestGap=Math.max(largestGap,blocks[index].top-blocks[index-1].bottom);
  if(largestGap>Math.max(500,viewport.height*.75))flags.push("very-large-vertical-gap");
  const overflowingElements=[...doc.querySelectorAll("main h1,main h2,main h3,main p,main article,main table,main img,main button,main select,main input")].filter((element)=>visible(element,view)).filter((element)=>{const rect=element.getBoundingClientRect();return (rect.left<-1||rect.right>viewport.width+1)&&!insideHorizontalScroller(element,view,body)}).slice(0,5).map((element)=>element.tagName.toLowerCase()+"."+String(element.className||"").split(" ")[0]);
  if(overflowingElements.length&&!flags.includes("horizontal-overflow"))flags.push("element-outside-viewport");
  return {
    route,viewport:viewport.name,flags,
    metrics:{viewportWidth:viewport.width,documentWidth:root.scrollWidth,overflow,h1Width:h1Rect?Math.round(h1Rect.width):null,h1Height:h1Rect?Math.round(h1Rect.height):null,h1FontSize:h1Font||null,h1LineHeight:h1LineHeight?Math.round(h1LineHeight*10)/10:null,h1Lines,hyphens:h1Style?.hyphens||null,wordBreak:h1Style?.wordBreak||null,heroHeight:heroRect?Math.round(heroRect.height):null,minimumBodyFont,largestGap:Math.round(largestGap),overflowingElements}
  };
}
function createFrames(worker){
  return viewports.map((viewport)=>{const frame=document.createElement("iframe");frame.title="QA "+worker+" "+viewport.name;frame.width=String(viewport.width);frame.height=String(viewport.height);frame.style.cssText="position:fixed;left:-20000px;top:0;border:0;visibility:hidden";document.body.append(frame);return frame});
}
function load(frame,route,viewport,html){
  return new Promise((resolve)=>{
    const timer=setTimeout(()=>resolve({route,viewport:viewport.name,flags:["navigation-timeout"]}),12000);
    frame.onload=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{clearTimeout(timer);try{resolve(measure(frame,route,viewport))}catch(error){resolve({route,viewport:viewport.name,flags:["measurement-error"],error:String(error)})}}));
    frame.srcdoc=html;
  });
}
let nextRoute=0;
async function worker(id){
  const frames=createFrames(id);
  while(true){
    const index=nextRoute++;
    if(index>=routes.length)break;
    const route=routes[index];
    let html;
    try{
      const response=await fetch(route);
      if(!response.ok)throw new Error("HTTP "+response.status);
      html=(await response.text())
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"")
        .replace(/<link\b[^>]*\bas=["']image["'][^>]*>/gi,"")
        .replace(/\s(?:src|srcset)=["'][^"']*["']/gi,"");
    }catch(error){
      for(const viewport of viewports)issues.push({route,viewport:viewport.name,flags:["navigation-error"],error:String(error)});
      completed+=1;
      continue;
    }
    const measured=await Promise.all(frames.map((frame,viewportIndex)=>load(frame,route,viewports[viewportIndex],html)));
    for(const item of measured)if(item.flags.length)issues.push(item);
    completed+=1;
    if(completed%25===0||completed===routes.length)progress.textContent=completed+" / "+routes.length;
  }
  frames.forEach((frame)=>frame.remove());
}
Promise.all(Array.from({length:20},(_,index)=>worker(index))).then(()=>{
  const counts={};for(const issue of issues)for(const flag of issue.flags)counts[flag]=(counts[flag]||0)+1;
  const report={schemaVersion:1,routeCount:routes.length,viewportCount:viewports.length,checkCount:routes.length*viewports.length,durationMs:Date.now()-startedAt,viewports,issuePageViewportCount:issues.length,issueCounts:counts,issues};
  window.__QA_RESULT__=report;
  resultNode.textContent=JSON.stringify(report);
  document.body.dataset.done="true";
});
`;

mkdirSync(join(OUT, "qa-layout-scan"), { recursive: true });
writeFileSync(RUNNER, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Visual QA runner</title></head><body><p id="progress">0 / ${routes.length}</p><pre id="result"></pre><script type="application/json" id="routes">${routeJson}</script><script>${runtime}</script></body></html>`);
console.log(`Visual QA runner written for ${routes.length} routes and 4 viewports (${routes.length * 4} checks).`);
