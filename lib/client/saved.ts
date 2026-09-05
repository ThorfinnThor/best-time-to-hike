"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "bth.saved.v1";

/**
 * Destinations the reader has kept, in their own browser.
 *
 * This is per-viewer convenience, not shared state: it never reaches the
 * server, because there is no server. Every access is wrapped, since a browser
 * in private mode or with site data blocked throws on read as well as write,
 * and a shortlist is never worth breaking a page over.
 */
function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch { return []; }
}

export function useSaved() {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Read after mount: the page is prerendered without a browser, so reading
  // during render would differ between server and client output.
  useEffect(() => { setSaved(read()); setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* storage unavailable; the list stays in memory */ }
  }, [ready, saved]);

  // Keep tabs in step without any coordination beyond the browser's own event.
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === KEY) setSaved(read()); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const toggle = useCallback((slug: string) => {
    setSaved((current) => current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug]);
  }, []);

  return {saved, ready, toggle, has: (slug: string) => saved.includes(slug)};
}
