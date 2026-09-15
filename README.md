# Hanji landing page

The English page is `index.html`; the Korean version is `ko/index.html`.
Both use `assets/landing.css` and `assets/landing.js`. Korean reading text
uses the bundled RIDIBatang font. Keep copy, accessibility labels, examples,
and live demo messages aligned when editing either language.

The interactive examples use fictional people. They run entirely in the
browser and do not write to a Hanji instance. The launch form submits to the
existing Hanji Buttondown subscription endpoint.

## Preview

Run `python3 -m http.server 4318 --bind 127.0.0.1` and visit
`http://127.0.0.1:4318/` or `http://127.0.0.1:4318/ko/`.

There is no package installation or build step. Check JavaScript with
`node --check assets/landing.js`. Before publishing, check both languages,
local assets, fragment targets, metadata, and the merge/reset, reader,
comparison, and comment controls. Motion respects reduced-motion settings.

## Publish

GitHub Pages publishes the root of `main` to https://gethanji.github.io/.
Use signed-off commits and verify the Pages build after pushing.
The handbook at `/docs/` is published separately; its links remain absolute.
The ignored `lab/` directory contains working previews, not release assets.

## September 9, 2026

- Rebuilt the landing page with a more prominent product demonstration.
- Added a sourced comparison with Obsidian, Notion, Confluence, and GitBook.
- Added restrained motion and interactive product examples.
- Translated the page and its interactive states into Korean.
- Adopted “Paper-thin documentation tool” as the concise product descriptor.

## Mobile refinement

Shortened both languages, reduced the hero demo to one note and one proposal,
moved the zero-model section earlier, and collapsed setup instructions by default.
Checked layout boundaries at 320, 390, 768, and 1280 pixels in both languages;
verified merge/reset, agent view, scoped page counts, and the mobile comparison picker.

Simplified language switching to EN/KO, removed decorative button arrows,
and gave the mobile hero a full opening view with a quieter demo link.
Updated the hero description in both languages to include Tailscale.

Refined the hero typography and removed its pre-release note. Organized the
footer into brand, navigation, and small-print groups. Emphasized newsletter
signup with a deep green panel, a clear email field, and a labeled button;
verified English and Korean mobile layouts.

The opening fills 90% of the viewport including the header, with the demo
invitation at its bottom. It grows naturally when content needs more room.

## September 14 refinement (local review)

Reworked the hero around a sourced local page-read measurement, framed the logo,
and expanded the illustrative document demo. Grouped section headings and supporting
copy into one reading column, moved proposal review beside editing, and brought
Korean agent controls and proposal content into parity with English.

Locale metadata is managed by `scripts/locales.mjs`. English and Korean are live.
German and Japanese remain declared with `live: false`; their pages and native
copy review are still pending. Do not advertise those routes until ready.

The remaining comparison-page and release-day tasks in the supplied plan are
separate work. This revision does not change release status or publish the site.

## September 15: screens

The opening is one screen. `.hero-intro` is `calc(100svh - var(--top-h))`, and
`--top-h` mirrors `.top`'s height at each breakpoint so the fold lands on the
header's bottom edge rather than near it. The vignette is the only fixed height
in the opening, so it is the one that gives way: `min(312px, 34svh)` above
700px, and `30svh` in Korean, whose headline takes a third line. It never grows
past its drawn size, and phones keep theirs, since there the opening is taller
than the screen whatever we do.

The demo below it is the second screen: the mockup centred in a card that is
padded and rounded on all four corners instead of running off the bottom as a
glimpse. The card is inset from the top and bottom by `--stage-inset`, which
tracks the `.wrap` gutter at each breakpoint, so it reads as a card standing on
the page rather than a full-bleed panel. Card plus its two insets still comes to
one screen. The workspace and terminal grew to `min(600px, 64svh)`.

A chapter dense enough to nearly fill a screen is given the whole one and
centred in it; a short chapter flows in the rhythm above. Today that means
access control, comments and history, and the comparison. The editor and
proposal chapters, the deployment list and the closing invitation flow. The
dark no-model panel is deliberately left out: at four fifths of a screen its
leftover room became a band of empty dark inside the card.

The pause between chapters is unchanged at `--chapter-gap`, verified at 122px
before and after on every boundary except the one below the no-model panel,
which was already 190px from that panel's own 68px bottom margin.
