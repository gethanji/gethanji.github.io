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

## September 15: weight

The page was fetching 308kB of fonts from Google on every visit. It now fetches
154kB from its own origin. Two changes got there.

**Self-hosted.** A page that tells the reader their data stays where they put it
should not hand their IP address to a third party to fetch a typeface. Removing
the Google Fonts link also drops two DNS and TLS handshakes and a
render-blocking round trip; first contentful paint went from 260ms to 124ms
locally. The two fonts used above the fold are preloaded.

**Newsreader lost its weight axis, not its optical-size axis.** The variable
font carrying both axes is 272kB for roman plus italic; carrying only optical
size it is 118kB. Optical size is what makes the display italic look drawn
rather than scaled, so that axis stays. The weight axis was there for exactly
two rules, both headings inside the product mockups, now set to 400. DM Sans
stays variable across 400 to 600, where the range is cheaper than the three
static instances it would otherwise need.

**The Korean serif is cut to the glyphs the page sets**: RIDIBatang goes from
440kB to 25kB. The full file stays in `assets/fonts/` as the source to re-cut
from; the command is in the comment above the `@font-face` rule in
`assets/landing.css`. Thirteen characters on the page fall outside the subset,
all of them symbols and CJK the full font never had either, so nothing was lost.
**If the Korean copy changes, re-cut the subset**, or new syllables will fall
through to the reader's own serif.

Measured over the wire, with GitHub Pages' gzip: HTML 9.4kB, CSS 23.7kB, JS
7.2kB, fonts 154kB. Fonts are still 79% of the page, which is where any further
work belongs.

## September 15: the review pass

Two adversarial reviews, one on correctness and one on dead code, then fixes.

**The dark theme had shipped a page no keyboard user could navigate.** The
derived focus ring landed at `#0e241e` on a `#121715` page: 1.13:1, invisible
on every focusable element. The derivation asked "what is this colour?" and
answered by role, which is right for a surface and exactly backwards for
anything whose job is to be *seen against* a surface. Eight more elements had
the same bug, including both halves of the activity chart, where the agent bars
sat at 1.06:1 and the caption "People above. Agents below." was simply untrue in
dark mode. All corrected and re-measured; the focus ring is now 8.55:1.

**Other confirmed defects, now fixed:** the `.annotated` dark rule used the
`background` shorthand and silently reset `background-size`, killing the
comments demo's only affordance; the permission demo's visible-count was the one
string that never went through `pageCopy`, so German, Japanese and French
readers got "3 visible" in English inside a live region; the copy-confirmation
timer was never cleared, so a second copy was wiped 0.6s later by the first
click's timer; `aria-expanded` on the agent button was set to true and never
returned, and the copy result was never announced; the identity picker was the
only animating control that did not cancel in-flight animations; the stored
theme value was used unvalidated on a shared origin; and the picker stayed open
when focus tabbed past it.

**The theme control is now three radios in a fieldset**, not three
`aria-pressed` toggles in a group. A mutually exclusive choice is a radio group;
native radios also bring arrow-key navigation and roving tabindex for nothing.
The picker's `aria-label` was replaced by `title`: the visible word was already
the accessible name, and overriding it with "Change language" broke Label in
Name for voice control in all five locales.

**The generator was rewriting more than it could write.** `live` now means "the
page exists", because a `live:true` locale with no file was fully advertised in
hreflang, sitemap and switcher while the script printed "not advertised" — the
exact outcome its own header calls worse than silence. `lastmod` no longer
claims today on every run. The entry guard no longer no-ops on any path
containing a space.

**Dead code:** 141 rules and 8 unreachable `@keyframes` removed, 11.6kB, plus
one dead line of JavaScript. Verified by pixel-diffing four sections before and
after: two are byte-identical and the two containing animations differ by
exactly their own frame-to-frame noise floor.

### Still open

1. **The hero vignette loops forever with no pause control** (WCAG 2.2.2).
   `prefers-reduced-motion` is respected, but that only covers readers who set
   it. Adding a visible control to the hero is a design decision, not a bug fix.
2. **15 pre-existing contrast failures in light mode**, 9 to 11px labels between
   3.2:1 and 4.3:1. Dark is now at 7, all of them shared and all inside the
   paper mockup.
3. **~4.9kB of overridden declarations.** 277 selectors are declared more than
   once because each pass restated a box's padding and gap instead of editing
   the earlier rule; the file carries three to seven historical values for the
   same property. Collapsing them changes no rendering.
4. **A native German and Japanese copy review**, still owed from the locale pass.

## September 15: the three open items, closed

**The vignette has a pause control.** Not a space-bar shortcut: the space bar
belongs to page scrolling, and taking it would break the keyboard readers the
criterion exists to protect. It is a real button under the figure, always
visible rather than hover-revealed, because a control a reader has to discover
by accident is not a mechanism. Its name changes with its state, so it always
says what it will do next, and it answers the space bar for free, because that
is what a focused button does. A reader's pause outranks the intersection
observer: scrolling away and back does not restart something they stopped.
The vignette gives back the 50px the control costs, so the opening still lands
exactly on the fold in all five locales.

**Contrast is zero failures in both themes**, down from 15 in light and 7 in
dark. Not fifteen patches: twelve small labels had each drifted to their own
lighter green, somewhere between 2.4:1 and 4.4:1 on paper. They now share one
token, `--quiet`, which is `--muted` with a green cast instead of a blue-grey
one at the same luminance. It was chosen as the *lightest* green that still
clears 4.55:1 on every background such a label lands on, so the labels stay
quiet instead of going heavy. The amber agent chip was its own case and got its
own value.

**The overridden declarations were the append-only habit made visible.** Each
pass restated a box's padding or gap in a new rule instead of editing the
earlier one, so the file carried up to seven historical values for the same
property: `.hero` set `padding-top` five times before the one that wins,
`.story-copy` five times before a `padding:0!important` killed them all. The
browser parsed every one of them and threw them away, and a reader had to read
all seven to know what the padding was. 244 declarations that can never win are
gone, 5.9kB. Proven by pixel-diffing six sections before and after: all six are
byte-identical, and the vignette still has 18 animations running.

The stylesheet is 84.5kB, 21.2kB over the wire, down from 98.7kB.

## September 15: written, not translated

A second pass over all four non-English locales, this time for intent rather
than words. Per language: three independent rewrites from different angles (a
copywriter, a technical writer, and a native reader hunting for tells), an
editor merging them into one change-set with a single enforced glossary, then a
hostile native reader trying to break the result. 254 strings changed in all:
85 German, 65 Japanese, 56 French, 48 Korean.

What the first pass had produced was competent and literal. The second pass
found, among much else:
- **German** was saying `schon` where German copy says `längst` for an
  already-true claim, and `Jetzt auch Ihr Wissen`, a verbless stub, where the
  image wants `Jetzt zieht Ihr Wissen nach`. The mock cursors read `Ada
  schreiben`, an infinitive after a name, which is not German; they now read
  `Ada schreibt`. `Papierdünn` is frozen in German as *flimsy*, so the descriptor
  became `Dokumentation, dünn wie Papier`.
- **Japanese** had a genuine meaning bug: the proposals paragraph had drifted
  into handing the merge to the agent. A reader with no English to compare
  against would have come away believing agents merge into pages themselves,
  which is the opposite of the product. It now says, plainly, that the one who
  reviews the diff and merges is you.
- **French** had left the two strings a visitor reads first, the hero pair and
  the lede, carrying the original translationese while the rest of the page was
  polished.
- **Korean**, which predates this work, was giving itself away with the English
  possessive (당신의, seven times), English counters and word order, and 한자어
  nominalisations sitting inside otherwise plain-spoken copy.

The adversarial readers put the result at roughly 90% native for German and
French, 80% for Japanese, with their remaining objections recorded in the run.
Structure is identical across all five pages, ids and class counts match, and
the opening still lands exactly on the fold in every locale and both themes.

## September 15: the two ends, as one object

The header and the footer were polished together, because they frame the page
and were not reading as the same thing. Three designers looked at both, an art
director merged them, and a hostile reviewer applied the patch to a copy and
measured the claims before it shipped.

Four defects, worst first:
1. **The footer was greying its own wordmark.** `.footer{color:var(--muted)}` was
   a leftover from when the footer was a one-line flex strip, and the brand
   inherited it. "Hanji" rendered at 5.52:1 at the bottom and 14.99:1 at the top.
2. **The mark had two treatments.** Framed in a rounded tile at the top, bare at
   the bottom, 114x44 against 97x35.
3. **The footer's link columns stopped 50px short** of the content edge that the
   header's settings group and the colophon both land on.
4. **A stray hairline under the language label.** `details{border-bottom}` from
   the deployment accordion also matched `.lang-picker`, in all five locales. It
   is scoped with `:not(.lang-picker)` now, because `.comparison-sources` is
   itself a `<details>` that still wants the rule.

The two ends now share three nameable things: **one lockup**, the mark in the
tile with an ink wordmark, measured identical at both ends in every locale and
at every width; **one right rail** at the content edge, where the header's
settings, the footer's links and the colophon link all now land; and **one
hairline per end**, the header's bottom rule and the footer's top rule, with the
colophon's third rule replaced by 48px of air. The theme control also gave up its
pill for an 8px radius, so the docs button, the theme control and the mark tile
are one shape family rather than three.

The Korean origin line went from 11px to 13px: 한지 and what it means is the
product's name, not fine print.

Dropped as taste without an argument: a 27 to 26px wordmark, the quote clamp and
tracking, 10 to 11px labels, 13 to 14px links, changing the group gap that had
just been settled, larger theme chips, recolouring the checked chip off `--ink`,
re-anchoring the language menu, and a full settings-shell rebuild, which is a
redesign rather than polish.

Verified after applying: zero contrast failures in both themes, the opening still
lands exactly on the fold in all five locales and both themes, the header keeps
its 96/77/70px heights, and 320px still fits.
