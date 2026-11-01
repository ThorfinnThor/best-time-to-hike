"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/data/types";
import { CONSENT_DECIDED_ATTRIBUTE, disableAnalytics, enableAnalytics, OPEN_CONSENT_EVENT, readConsent, storeConsent, type ConsentChoice } from "@/lib/client/consent";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";

/**
 * Opt-in banner for Google Analytics. Nothing is preselected: until the reader
 * presses Accept, analytics is not loaded. Both buttons carry the same weight.
 *
 * It is rendered open in the static HTML, so it paints with the page; the head
 * script in app/layout.tsx hides it before paint for a reader who already chose,
 * and this effect then removes it.
 */
export function CookieConsent({locale}:{locale:Locale}) {
  const copy = t(locale).consent;
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = readConsent();
    if (stored === "granted") enableAnalytics();
    if (stored !== null) setOpen(false);
    const reopen = () => {
      document.documentElement.removeAttribute(CONSENT_DECIDED_ATTRIBUTE);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  function choose(choice: ConsentChoice) {
    storeConsent(choice);
    if (choice === "granted") enableAnalytics();
    else disableAnalytics();
    setOpen(false);
  }

  if (!open) return null;
  return <section className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-text">
    <strong id="cookie-consent-title">{copy.title}</strong>
    <p id="cookie-consent-text">{copy.body} <Link href={links.privacy(locale)}>{copy.privacyLink}</Link></p>
    <div className="cookie-consent-actions">
      <button type="button" className="button" onClick={() => choose("denied")}>{copy.decline}</button>
      <button type="button" className="button" onClick={() => choose("granted")}>{copy.accept}</button>
    </div>
  </section>;
}

export function CookieSettingsButton({label}:{label:string}) {
  return <button type="button" className="cookie-settings-link" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>{label}</button>;
}
