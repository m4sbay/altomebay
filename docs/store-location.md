# Official store location

All navigation buttons and footer links read `storeConfig.address.mapsUrl` from
`lib/content.ts`: https://maps.app.goo.gl/ww2V2cmzXPmcp3Ku8?g_st=ic .
`buildMapsSearchUrl` keeps its existing public name for compatibility but returns
that exact URL. It does not construct a geographic search.

The previous implementation linked to a text search for `8CH7+73M` and displayed
a CSS illustration. It did not identify a specific Google Maps place, so Google
could resolve the text differently. It now opens the owner's official link.
Address text follows the owner's supplied location description.

## Official embed and place verification

`components/StoreMap.tsx` renders the exact Google Maps Share iframe URL supplied
by the owner in `storeConfig.address.mapsEmbedUrl`. It uses the official
`https://www.google.com/maps/embed?pb=…` endpoint without additional packages,
API keys or custom Maps JavaScript. The helper rejects non-HTTPS/non-Google
URLs, searches and short-link iframe sources. Validation checks URL shape;
place correctness was checked separately in the loaded Google Maps iframe.

The supplied payload identifies **Ruko Altomebay Serasah**, place identity
`0x2e2f7bf799ade3a5:0xa9d91f687fe0af53`. In the production browser preview,
Google Maps displayed the matching named red marker and place card, with address
`8CH7+73M, Serasah, Kec. Pemayung, Kabupaten Batang Hari, Jambi 36657`.
Google's own “Buka di Maps” link reported **CID 12238847996038524755** and its
directions link referenced the same hex place identity. No coordinates or
embed parameters were guessed; no geographic search or area center is used.
The short link itself timed out during earlier checks; the owner's Share iframe
resolved the missing verification and loaded successfully in the browser.

The map viewport reserves a full-width 4:3 ratio and minimum 290px height before
loading, uses existing card radius/semantic colors, and has no shadow or iframe
filter. Its iframe has a descriptive title, lazy loading, full-screen support,
and strict-origin-when-cross-origin referrer policy. An external link beside
and below the map stays available if Google blocks loading; no unreliable
cross-origin iframe error detection is used. No client JS was added for the map.

## Changed files

- `lib/content.ts`: official navigation URL, address, exact owner-supplied embed.
- `lib/links.ts`: embed URL validation; existing navigation helper retained.
- `components/StoreMap.tsx`: responsive iframe, persistent linked fallback.
- `components/sections/LocationHours.tsx`: replace illustration with StoreMap.
- `components/ui/ContactButton.tsx`: “Buka di Google Maps” and navigation icon.
- `app/globals.css`: stable map viewport geometry.
- `PROJECT_CONTEXT.md` and this document: implementation and verification.

## Validation

Lint, TypeScript, production build and whitespace validation passed. Browser
checks confirmed the exact iframe src, rendered Google place marker/card,
consistent external link destinations and no iframe filter. No horizontal
overflow occurred at 320, 390, 768 or 1440 CSS pixels. Map viewport dimensions
were 265×290, 335×290, 336.5×290 and 560×420 respectively in the test browser
(scrollbars reduce available page width). Dark and light themes both preserve
iframe dimensions and retain Google's original map colors. The reserved box
exists before the lazy iframe loads; iframe content does not determine its size.

## Local development troubleshooting

A later localhost:3000 check found stale development CSS: `.store-map-preview`
had computed `min-height:0px` / `aspect-ratio:auto`, collapsing its absolutely
positioned iframe to 0px. Restarting that project's development server restored
`min-height:290px`, `aspect-ratio:4/3` and a 418px iframe at desktop size.
If the correctly sized area remains blank, distinguish external loading from
layout: the Google iframe HTML may load while its maps.googleapis.com script
request stalls. The verified place configuration is already present in that
HTML. Keep the official external-link fallback available; do not replace the
place or weaken browser/network protections to work around connectivity.
