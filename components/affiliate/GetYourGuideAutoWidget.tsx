import type { Locale } from "@/lib/data/types";

const PARTNER_ID = "BKWM9K1";

export function GetYourGuideAutoWidget({locale, destinationName}: {locale: Locale; destinationName: string}) {
  const label = locale === "de"
    ? `Aktivitäten von GetYourGuide rund um ${destinationName}`
    : `GetYourGuide activities around ${destinationName}`;

  return <section className="affiliate-gyg" aria-label={label}>
    <div
      className="affiliate-gyg-frame"
      data-gyg-widget="auto"
      data-gyg-partner-id={PARTNER_ID}
      data-gyg-cmp="Besttimetohike"
    />
  </section>;
}
