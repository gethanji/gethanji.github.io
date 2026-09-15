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

Locale metadata is managed by `scripts/locales.mjs`. See the September 15
locale note below: all five languages are now live.

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

## September 15: five languages

German, Japanese and French are live alongside English and Korean. Run
`node scripts/locales.mjs` after any locale change: it is the only writer of
`<html lang>`, canonical, hreflang, `og:locale`, the nav switcher, `sitemap.xml`
and now the language list in `llms.txt`, which had already drifted to two of
five entries.

The pages were not hand-translated file by file. Every translatable string and
attribute was extracted from `index.html` with its byte offsets, translated as
a flat id-to-string map, and substituted back, so the markup of all five pages
is identical by construction: same ids, same classes, same structure. The
extractor round-trips to a byte-identical file when given an empty map, which
is the check that the substitution is safe. Three sentences that split across
inline markup are translated as whole units rather than as fragments, since
word order moves: the `<del>`/`<ins>` diff demo, the footer quote, and the
comparison table's corner label.

`pageCopy` in `assets/landing.js` used to take `(en, ko)` positionally. It now
takes a map keyed by locale and falls back to English, so the fifteen runtime
strings the demo swaps in are covered in all five languages.

Layout notes from measuring all five:
- German and French headlines take a wider measure (`max-width: 1240px`) so the
  opening headline stays two lines. Shrinking the type instead would have cost
  the page its one loud voice.
- Japanese gets its own typography block, mirroring the Korean one: system
  mincho and gothic rather than a webfont, no synthetic italic on the display
  `em`, smaller display sizes, and `line-break: strict`.
- Five language labels plus an action do not fit a phone header. Below 480px
  the docs button steps aside, as the GitHub link already does below 600px; the
  switcher stays, because a reader who needs another language needs it there.
- Verified at 1440, 1512, 1280, 1100, 900, 700 and 500 wide: no horizontal
  overflow and no clipped text in any locale, and the opening still lands
  exactly on the fold at 900px and wider in all five.

**Not yet done: a native review of the German and Japanese copy.** The French
was written for a native reader to check, and Korean predates this pass. The
German and Japanese read well and are internally consistent, but no native
speaker has read them.

## September 15: a picker, and a theme

**Language picker.** Five flat labels in the header was fine for two languages
and crowded at five. The picker is a native `<details>`: it opens on click and
on Enter, closes on Escape or an outside click, and still works with JavaScript
off, which a hand-built menu would not. Rows carry each language's own name,
because a reader hunting for their language looks for the word they call it by.
`scripts/locales.mjs` generates it, along with the theme control's labels, so
all five pages and all five languages stay in step from one table.

**Theme.** Light, dark, and system, with system the default. The choice lives
in `localStorage` under `hanji-theme`; the resolved theme lands on
`data-theme` and the choice itself on `data-theme-choice`, so System keeps
following the system after a reload instead of freezing into whatever it
resolved to that day. A two-line copy of that runs inline in `<head>` so the
page never paints the wrong theme first, and it sets `theme-color` so the
browser's own chrome follows.

Nine dark values are chosen by hand. The rest are derived from the light
stylesheet by role, because the long tail is a hundred near-identical tints
whose job is to sit a hair above or below a surface, and a hair is a formula,
not a decision. Text lightens, surfaces land in a narrow band above the page,
borders stay just visible, and anything already light or already dark keeps the
polarity it had.

**The two product depictions stay light in both themes.** The hero vignette and
the demo mockup are pictures of paper, which is the whole pitch; a dark page
framing a lit document is the intended look, and it avoids inventing a dark
product UI that does not exist yet. Note that pinning a token on those
containers is not enough on its own: a child that inherits `color` inherits the
page's computed value, not the token, so the container restates `color` too.

Two things the automated contrast check caught, both worth keeping in mind when
editing: an animation with `fill-mode: both` overrides a theme rule, so the
diff demo's highlight had to become a token the keyframe lands on; and the skip
link was hard-coded white, which only a keyboard reader would ever have found.

Contrast was measured on every text node against its effective background in
both themes. Dark now has 7 distinct failures, light has 15, and all 7 are
shared: they sit inside the paper mockup, which is identical in both themes.
**Those 15 are pre-existing and still owed a pass** — mostly 9 to 11px labels
around 3.2:1 to 4.3:1, including the comparison table's corner label and the
deployment list's step numbers.
