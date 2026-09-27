import Script from "next/script";
import type { Locale } from "@/lib/data/types";

const PARTNER_ID = "P00314274";
const WIDGET_REF = "W-ff238d78-a000-4397-b348-01c27d795c82";

export function ViatorDynamicWidget({locale, destinationName}: {locale: Locale; destinationName: string}) {
  const label = locale === "de"
    ? `Aktivitäten von Viator rund um ${destinationName}`
    : `Viator activities around ${destinationName}`;

  return <>
    <section className="affiliate-viator" aria-label={label}>
      <div
        className="affiliate-viator-frame"
        data-vi-partner-id={PARTNER_ID}
        data-vi-widget-ref={WIDGET_REF}
        data-vi-search-term={destinationName}
        data-vi-language={locale === "de" ? "DE" : "EN"}
        data-vi-currency="EUR"
      />
    </section>
    <Script
      id="viator-dynamic-widget"
      src="https://www.viator.com/orion/partner/widget.js"
      strategy="lazyOnload"
    />
  </>;
}
