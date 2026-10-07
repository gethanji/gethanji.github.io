# Hanji lab website

Astro statically builds the lab, Write, and Work in English, Korean,
German, Japanese, and French. GitHub Pages remains the intended host.
Astro’s client router preserves the shared header between pages. No server runtime
or UI framework is required.

## Develop and verify

Use Node **22.12 or newer** (the tested local runtime is 22.22.2).

```sh
npm ci --ignore-scripts
npm run dev -- --port 4321
npm run build
npm test
npm run test:browser
npm run test:consistency
npm run test:tracker-hero
npm run test:controls
npm run test:theme
npm run test:header
npm run test:access
npm run preview -- --port 4321
```

`test:browser` uses an installed Chrome/Chromium. Set `BROWSER_EXECUTABLE`
if it is not in a standard macOS/Linux location. It starts its own local
server, writes screenshots to `test-results/` (or `QA_OUTPUT`), and closes
both server and browser. No test submits forms or contacts an agent.

Build output is `dist/`; never edit it. The old HTML-rewriting generator
and duplicate generated source pages have been replaced by Astro.

## Source map

- `src/data/site.ts`: project registry, languages, canonical routes.
- `src/data/locales/*.json`: stable named content keys, shared UI copy,
  metadata, and illustrative story copy. Edit values without renaming keys.
- `src/layouts/SiteLayout.astro`: page shell and product styles.
- `src/components/SiteHeader.astro`, `LanguagePicker.astro`,
  `SiteFooter.astro`, `SEO.astro`: shared chrome and metadata.
- `src/components/pages/`: actual shared Astro markup for all three pages;
  each Write locale uses the same structural component.
- `src/components/illustrations/`: original Write miniature, compact
  Work miniature, and shared story controls.
- `src/styles/`: semantic tokens, motion primitives, chrome, illustration,
  and narrowly scoped Write compatibility styles.
- `src/scripts/`: shared disclosure behavior and finite timeline controller.
- `public/assets/`: self-hosted fonts, Write CSS and preserved demo script, existing
  editorial styles, and authentic screenshots. Write CSS is frozen
  by checksum; content/attributes are compared against migration fixtures,
  excluding the explicitly tested quickstart insertion, hero CTA change,
  and shared illustration control footer.
  A source-diff test restricts demo-script changes to shared tilt/picker
  extraction, scoping arrow enhancement to main content, and transferring
  miniature pause behavior to the shared timeline and theme ownership to
  the shared page controller.

The page content was migrated once into Astro components. No regular
expression, English sentence matching, or HTML string rewriting is used to
construct pages at build time. HTML fixtures under `tests/` are comparison
baselines, not a second template system.

## URLs and language behavior

English: `/`, `/projects/write/`, `/projects/work/`.
Other locales: `/{lang}/lab/`, `/{lang}/projects/write/`,
`/{lang}/projects/work/`.

The former `/projects/knowledge/` and `/projects/tracker/` routes and their
localized equivalents remain noindex redirects with canonical links to Write
and Work. They preserve query strings and fragments. Internal data keys, CSS
hooks, source filenames, and CLI/package names retain their existing identifiers.

Legacy `/en/`, `/ko/`, `/de/`, `/ja/`, `/fr/` remain Write aliases. Their
static HTML includes a direct link; browser redirects preserve query and
fragment. The language picker retains the current page, query, and anchor.
Project navigation stays in the explicitly selected URL language. Stored
preferences never silently override it. Canonical and hreflang links come
from one route registry; aliases are excluded from the sitemap.

## Design system

Change semantic colors, typography, spacing, radii, and elevations in
`src/styles/tokens.css`. Write uses celadon; Work uses orchid purple.
The lab uses warm neutral paper and ink without gradients. Product introductions and their links retain green Write and purple Work accents
in both themes; see `lab-brand.css`.
Shared chrome reads these tokens, with product-specific light and dark palettes.
The original Write editorial layout and demo styling remain intact.

All three pages use a compact shared header: Hanji links home, Write and
Work remain direct links, and language and appearance are icon menus on the
far right. Both preferences default to System. Language follows the browser
on unprefixed entry pages; explicit localized URLs stay shareable. Choosing a
language persists the preference and preserves the current page, query, and
anchor. The brand reduces to its mark on small screens.
The head bootstrap resolves `hanji-theme` before paint; `theme.ts` owns radio
controls, live system changes, cross-tab updates, and the browser theme color.
Manual choices persist across product and language navigation. Unavailable
storage keeps the current-page controls working and defaults to System on load.
`tokens.css` defines product palettes and `theme.css` covers shared chrome and
the newer editorial panels. Write retains its original dark palette and
light paper vignette. Authentic product screenshots keep their captured colors
inside frames that follow the chosen theme.

`test:theme` exercises all five locales at desktop, 390px, and 320px widths;
system/manual selection, keyboard controls, navigation, reload, cross-tab
sync, blocked/invalid storage, and hero playback with reduced motion. It also
checks sampled dark text contrast on the lab and Work's rendered surfaces.

`motion.css` owns durations, easing, surface entry, focus/hover/pressed,
expanded, loading, and disabled states. `site-chrome.ts` owns disclosure
coordination, outside click, focus departure, Escape, and anchor-preserving
language links. Native details and links remain usable without JavaScript.

`timeline.ts` owns a continuous playhead driving paused Web Animations,
remaining-time pause/resume, visibility interruptions, and reduced-motion
settlement. `paper-tilt.ts` and `paper-motion.css` share Write’s original
fine-pointer geometry, easing and optical edges with Work. Keyboard, touch
and reduced motion reset pointer tilt. Only outer panels tilt; inner elements
follow the story clock, avoiding competing transforms. Work supplies seven small
states: request, project, cards, three drafting tasks, and completion. Its
paper panel matches the scale of Write's miniature. Detailed real
screenshots remain lower on the page. The hero is explicitly illustrative;
no agent, project, or account is created. Reduced motion and no JavaScript
show a completed scene plus a readable story. Manual steps, replay, and
keyboard pause remain available with JavaScript.

Both illustrations autoplay and loop with the same `StoryControls.astro`
footer: five labeled stage dots, pause/resume, and a separate replay button.
`illustration-controls.css` owns their shared appearance and focus states.
Write's `knowledge-story.ts` reads the original CSS keyframes and easing
into the shared timeline, preserving its 5.6-second sequence. Stage dots seek
still snapshots; reduced motion settles on completion and keeps replay still.
`test:controls` compares Write's five snapshots against its native CSS
animation, then checks localized controls, keyboard input, mobile bounds,
autoplay, pause/replay, looping, and reduced motion on both product pages.

## GitHub Pages and separate handbook

The canonical origin is `https://hanji.ink`. Namecheap DNS points the apex and
www to GitHub Pages; mail records remain separate. Marketing metadata and
sitemap use this origin. Existing absolute handbook links are retained.

`.github/workflows/pages-build.yml` builds and tests on manual dispatch. The
`deploy` input defaults to false; set it to true on `main` to publish a reviewed
revision. Configure the marketing repository's Pages source as GitHub Actions.
The workflow uses Node 22, locked dependencies, and the official Pages artifact
and deployment actions. It does not change DNS or run on every push.

```sh
gh workflow run pages-build.yml --ref main -f deploy=true
```

The handbook is independently exported and published by `gethanji/docs`.
The marketing build deliberately emits no `dist/docs/`. The organization
custom domain also applies to that project site, which is served at
`https://hanji.ink/docs/`; old GitHub handbook URLs redirect there. Do not
copy or replace the handbook export or change its Pages source.

After publication, verify the deployment SHA, HTTPS and www redirects, all
localized project routes, canonical metadata, and the separate handbook's
HTML, stylesheet, and Markdown mirrors.

## Shared chrome boundary

Both legacy editorial stylesheets load through a low-priority `editorial`
cascade layer. Shared chrome owns typography, line height and icons. The
navbar uses the system UI font, avoiding a webfont swap between routes while
editorial content retains DM Sans and Newsreader. Language and appearance use equally sized SVG icons with accessible labels;
no nested project menu or caret is needed. Write’s
arrow enhancement is limited to `#main` and cannot rewrite header links.

Work centers a persistent canvas. Hanji, the workspace agent, chats in a
rounded overlay at the bottom; task-specific chats open at the upper right.
Four cards form a diamond: outline → invitation / feedback → publish.
The selected task receives a wording request, reply, and a completed status.
Window scale, position, opacity and stacking shift focus through the story.
The canvas stays present while cards and chats animate within that context.

The default sequence loops after a completed hold and a short fade reset.
Manual card selection, dismissal, pause and stage selection stop autoplay;
replay returns to the guided loop. Offscreen/hidden pages pause. Reduced
motion renders the completed composition without loops or depth movement,
while keeping keyboard and pointer card exploration available.

The dependency arrows are solid and measured from the four actual cards.
They retain their full geometry while the containing canvas recedes.
Focus transitions operate on windows, entrance tracks on their contents,
and shared pointer tilt on the surrounding composition. Each transform has
one owner, so those effects do not overwrite one another.

## Product onboarding

Both product heroes point to `#get-started`, rendered by `QuickStart.astro`.
The shared section identifies Write as closed beta and Work as alpha,
with an access-request form. Existing-checkout setup instructions remain in a
secondary disclosure for participants who already have access. Write keeps its original detailed setup
section and its own handbook links. Work links to its real screenshots
and development status; it does not borrow Write's handbook.

Public source access at the advertised GitHub URL returned 404 on October 6,
2026. Neither guide advertises a working public clone or install package.
Work's `init`, `project new`, `new` and `ls` commands were exercised against
the local CLI in a fresh temporary workspace. A fresh-machine install and
model-authenticated session are still unvalidated. The setup instructions
are intended for existing development checkouts.
The existing Work dependencies were compiled for Node 20; a Node 22 run
hit a native SQLite ABI mismatch. Install dependencies with the Node version
you intend to run. This is not an application or dependency change.

Narrative evidence: `hanji-wt-tracker/packages/tracker/src/sessions.ts`
(`isConductor`, `openSession`) and `packages/tracker-host/src/host.ts` /
`conductor.ts` distinguish workspace and task sessions. The illustration
shows a person switching context, not autonomous delegation. Setup commands
come from `packages/tracker/src/cli.ts` and the root package scripts.

## Copy revision

The Lab, Write, and Work copy uses concrete product descriptions and
explicit availability language across all five locales. Metadata descriptions
follow the localized hero copy. The Hanji agent is described as a research goal;
current Claude and Codex capabilities remain distinct.

The Write browser fixture checks original structure, attributes, and links
while allowing the reviewed prose to change. It does not compare literal text.
The header stays compact on narrow screens. Commands and destination URLs
remain unchanged by this editorial pass.

Work copy was checked against `hanji-wt-tracker` revision `75dd1ad` and
the as-built sections of the October 6 build-asks and sessions/setup specs.
Ongoing Claude/Codex sessions are implemented in developer builds; live-provider
approval, deny, stop/resume and build checks remain open. Session state uses a
local database. The hero remains a concept illustration, not proof of an
automated project-creation flow or a supported public release.

## Lab mission and access requests

Hanji is a thin surface between people and agents, adapting to different
interactions. The lab story moves from knowledge sharing to managing work.
All five locales include explicit closed-beta and alpha maturity labels.

Write uses an inline FormSubmit form with a recipient-confirmed public
invisible-email ID in `src/data/access.ts`. Name, reply email, project and message
are submitted through the AJAX endpoint, with native POST as the no-JavaScript
fallback. Validation, a honeypot and duplicate-submit prevention protect the
flow; failed requests retain the message and successful requests reset the form.
Work uses the recipient-provided hosted `/el/` form with its project name
prefilled in the subject. Both paths identify FormSubmit as the processor.
Never commit a recipient email or private activation link. Recipient changes
happen with the provider. Browser tests mock submissions and do not prove email
delivery; delivery needs a recipient-confirmed end-to-end check.

## Shared editorial system

`src/styles/editorial-system.css` owns the common hero typography, dot eyebrows,
primary and quiet buttons, text links, section headings, spacing and focus states.
All pages load the same self-hosted fonts from `fonts.css`, including Latin
extensions and locale-specific fallbacks. Product colors remain semantic tokens.
`LinkArrow.astro` gives newer content the same arrow geometry as Write.

`page-motion.ts` and `motion.css` share the soft opening and one-time section
reveals. Anchor navigation skips the opening; reduced motion disables effects,
and content stays readable without JavaScript. Illustrative product timelines
retain their independent pause, replay and focus behavior.

Run `npm run test:editorial` after changing shared primitives. It compares all
three pages across five languages and four widths, plus both themes, keyboard
focus, anchor navigation, reduced motion and no-JavaScript reading.


## Loading and navigation

Astro builds and minifies the legacy CSS imports and page scripts. Page-specific
styles are linked as hashed assets; the Work illustration CSS only loads on
Work. Keep CSS imports in the build pipeline rather than public wrappers.
Below-the-fold screenshots use native lazy loading, including inactive tabs.

Astro's `ClientRouter` prefetches and swaps page content without reloading the
document. `SiteHeader.astro` uses `transition:persist`: the navbar and its controls
retain their DOM identity. `navigation.ts` synchronizes destination links, labels
and active state before each swap; colors inherit the active product and theme.
Browser snapshot animations are skipped, so old and new page content never fade
through one another. Each forward visit gets one soft editorial intro; anchors,
history restoration and reduced motion skip that intro.

`page-lifecycle.ts` initializes each page once and tears down listeners, timers,
observers and animation loops before a swap. Modules loaded on later visits use
the same lifecycle, including legacy Write examples and inline forms. The
original public assets remain fixtures; the shipped demo controllers now live
in `src/scripts`. Theme state is carried through swaps before the next paint.

Write reserves control geometry before initialization and pauses its CSS
fallback at frame zero until the shared timeline takes over. Visible editorial
content is never hidden again by a late initialization. Playback labels update
only when their state changes.

Run `npm run test:navigation` for delayed script loading, a single hero entrance,
stable control geometry, actual header/document persistence, repeated demos and
mocked form submissions, locale/theme changes, history, and router fallback.
