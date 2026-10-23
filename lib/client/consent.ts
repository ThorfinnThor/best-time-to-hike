/**
 * Consent for audience measurement, and the only code that talks to Google.
 *
 * gtag.js is injected only after an explicit opt-in, so a reader who declines
 * or never answers sends nothing to Google: no script, no beacon, no cookie.
 * Consent Mode v2 starts every signal at "denied" and grants only
 * analytics_storage; the advertising signals stay denied whatever is chosen.
 *
 * The choice itself is kept in localStorage, wrapped like the shortlist in
 * saved.ts, because private mode throws on read as well as write.
 */
export const GA_MEASUREMENT_ID = "G-8JZ4DZKHX1";
const KEY = "bth.consent.v1";
export const OPEN_CONSENT_EVENT = "bth:open-cookie-settings";

export type ConsentChoice = "granted" | "denied";

type GtagWindow = Window & {dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void} & Record<string, unknown>;

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function storeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(KEY, choice);
  } catch {
    // Storage blocked: the choice holds for this page view only.
  }
}

export function enableAnalytics() {
  const w = window as unknown as GtagWindow;
  w[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  if (w.gtag) {
    w.gtag("consent", "update", {analytics_storage: "granted"});
    return;
  }
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = function gtag() {
    // gtag.js reads the arguments object, not an array.
    w.dataLayer!.push(arguments);
  };
  w.gtag("consent", "default", {analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied"});
  w.gtag("consent", "update", {analytics_storage: "granted"});
  w.gtag("js", new Date());
  w.gtag("config", GA_MEASUREMENT_ID, {allow_google_signals: false, allow_ad_personalization_signals: false});
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function disableAnalytics() {
  const w = window as unknown as GtagWindow;
  w[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  w.gtag?.("consent", "update", {analytics_storage: "denied"});
  deleteAnalyticsCookies();
}

/** GA sets its cookies on the widest domain it can, so try every parent of the host. */
function deleteAnalyticsCookies() {
  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i += 1) domains.push(`; domain=.${labels.slice(i).join(".")}`);
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !(name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name.startsWith("_gat"))) continue;
    for (const domain of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
  }
}
