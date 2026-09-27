# Affiliate integration

BestTimeToHike uses static, build-time affiliate links. Rankings, scores and
indexability never read affiliate configuration.

## Activation

1. Confirm that BestTimeToHike is approved by the respective programme.
2. Add the public tracking identifier to the matching environment variable:
   `AFFILIATE_BOOKING_STAY_SEARCH_ID`,
   `AFFILIATE_GETYOURGUIDE_ACTIVITIES_ID`, or
   `AFFILIATE_VIATOR_ACTIVITIES_ID`.
3. Set only the approved partner to `enabled: true` in
   `data-config/sources/affiliate-partners.json`.
4. Run `pnpm build`. The prebuild creates allowlisted static redirects below
   `/go/`, published module data below `/data/affiliate/`, and a manifest.
5. Run the complete verification suite before deployment.

An enabled partner without an identifier fails the build. A destination link
with an unknown destination, unapproved hostname or missing tracking parameter
also fails the build.

## Editorial rules

- Accommodation links require a reviewed gateway or overnight base in
  `affiliate-destination-searches.json`. A climate cell is never assumed to be
  a suitable place to stay.
- GetYourGuide and Viator entries must be direct, manually reviewed products
  in `affiliate-activity-offers.json`. Generic search pages are not published.
- Do not copy prices, review scores, availability or cancellation claims.
- Recheck the product, geography and editorial description before changing
  `lastReviewedAt`.
- Remove or disable stale products rather than silently sending readers to a
  broad search page.

Every visible link opens in a new tab and carries
`rel="sponsored nofollow noopener noreferrer"`. The disclosure appears before
the first link. Static forwarding pages carry `noindex,nofollow`; `/go/` is
also disallowed in `robots.txt`.
