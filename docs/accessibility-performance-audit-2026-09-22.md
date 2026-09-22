# First accessibility and performance audit — 2026-09-22

## Scope

This is the first rendered-site audit of the Cloudflare Pages deployment at
`https://90e6beaa.best-time-to-hike.pages.dev`. It covers four representative
English routes at a 390 × 844 mobile viewport:

- home;
- finder;
- June worldwide ranking;
- Madeira in August.

It combines the existing full static-render regression suite with direct
browser accessibility-tree, DOM, console, overflow and navigation checks, plus
remote HTTP timing and transfer-size measurements. It is not the final release
approval described in `release-approvals.json`.

## Accessibility result

All four sampled routes passed these checks:

- exactly one visible `h1` and no skipped visible heading level;
- correct `lang="en"` document language;
- no unnamed visible links, buttons or controls;
- no visible form control without a label;
- no image without an `alt` attribute;
- no duplicate element id;
- no horizontal overflow at 390 CSS pixels;
- no browser console warning or error;
- keyboard focus remains visibly styled by the global 3 px focus ring;
- the rendered-site regression suite covers every public page for heading
  structure, link resolution, language alternates and provisional `noindex`.

The audit found that several standalone text links were only 19–22 CSS pixels
high. They now have a minimum 24 px target and a 44 px target on coarse-pointer
devices. Score rings now expose their score as an accessible image label rather
than an unsupported label on a generic element.

The June ranking contains 269 destination results, 270 visible headings and 302
interactive elements. Its heading structure is valid and it has no horizontal
overflow, but the list length is a usability observation to revisit if field
data or assisted-technology testing shows excessive navigation cost. It is not
treated as a current accessibility failure.

## Performance result

The production build reports 167 kB first-load JavaScript for application
routes. Direct Cloudflare measurements from the audit host were:

| Route | Browser navigation | TTFB | Compressed HTML | Uncompressed static HTML |
| --- | ---: | ---: | ---: | ---: |
| Home | 532 ms cold | 143 ms | 9.9 kB | 64.9 kB |
| Finder | 142 ms warm | 163 ms | 49.7 kB | 232.2 kB |
| June ranking | 141 ms warm | 145 ms | 31.2 kB | 301.1 kB |
| Madeira / August | 160 ms warm | 251 ms | 5.7 kB | 27.9 kB |

These figures show fast origin delivery and bounded transfer sizes for the
sample, but browser navigation duration is not a Core Web Vital and the first
navigation is not comparable to the three warm navigations.

## Remaining requirement before formal approval

The configured Chrome DevTools MCP was not loaded into this existing task. A
local Lighthouse launch was also terminated by the desktop execution sandbox
before Chrome opened its debugging port. Consequently this audit makes no
Lighthouse score or lab LCP, CLS, TBT or INP claim. The formal
`accessibilityAndPerformance` release approval stays false until a fresh task
with the Chrome DevTools MCP records those traces, repeats keyboard testing and
reviews any trace-specific findings. No release gate was relaxed.
