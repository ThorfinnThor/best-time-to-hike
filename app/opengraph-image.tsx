import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";
import { getManifest } from "@/lib/data/load";

export const dynamic = "force-static";
export const size = {width: 1200, height: 630};
export const contentType = "image/png";
export const alt = "BestTimeToHike";

/**
 * The social card, rendered once at build with next/og. It ships with Next, so
 * it needs no new dependency and no network at build time.
 *
 * Two constraints from Satori, both learned the hard way: every element with
 * more than one child needs an explicit display, and any glyph outside the
 * bundled font triggers a font download that fails in a sandboxed build. The
 * brand mark is therefore drawn with a border rather than typed as a character.
 */
export default function Image() {
  const manifest = getManifest();
  const summary = `${manifest.destinationCount} destinations scored from the ERA5-Land ${manifest.climateNormal.startYear}-${manifest.climateNormal.endYear} climate normal. Historical climatology, not a forecast.`;
  return new ImageResponse(
    (
      <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: 72, background: "linear-gradient(135deg,#1d2a22 0%,#2f4436 55%,#3f5a45 100%)", color: "#f6f4ee",
        fontFamily: "Georgia, serif"}}>
        <div style={{display: "flex", alignItems: "center", gap: 18}}>
          <svg width="34" height="30" viewBox="0 0 34 30"><polygon points="17,0 34,30 0,30" fill="#c96f43" /></svg>
          <div style={{display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: 1}}>BestTimeToHike</div>
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 20}}>
          <div style={{display: "flex", fontSize: 68, lineHeight: 1.06, maxWidth: 920}}>
            When the mountains are actually walkable
          </div>
          <div style={{display: "flex", fontSize: 27, opacity: 0.82, maxWidth: 900, lineHeight: 1.4}}>{summary}</div>
        </div>
        <div style={{display: "flex", fontSize: 23, opacity: 0.7}}>{SITE.url.replace(/^https?:\/\//, "")}</div>
      </div>
    ),
    size,
  );
}
