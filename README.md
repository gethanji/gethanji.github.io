# Hanji website

Astro builds the overview and **Think**, **Plan** and **Document** product pages
in English, Korean, German, Japanese and French. `/start/` is the English desktop
setup guide. The current app is an invited Mac preview; the public website does
not offer an unavailable binary download or imply a hosted workspace service.

## Develop and verify

Use Node 22.12 or newer and an installed Chrome/Chromium for browser checks.

```sh
npm ci --ignore-scripts
npm run dev -- --port 4321
npm run build
npm test
node tests/current-suite-browser.mjs
npm run test:browser
npm run test:think-hero
npm run test:header
npm run test:navigation
npm run test:access
```

Browser checks start and close isolated static servers, exercise desktop and
phone widths, themes, language routes, navigation and forms, and never submit a
real access request. Form provider calls are mocked. Set `BROWSER_EXECUTABLE` for
the older browser rigs when Chrome is not at its standard location. Captures from
the current suite rig go to `/tmp/hanji-public-review` or `QA_OUTPUT`.

`dist/` is generated. Never edit it. No server runtime or UI framework is required.

## Content and assets

- `src/data/site.ts` owns products, canonical routes, languages and legacy aliases.
  Internal `knowledge` and `tracker` keys remain stable for Document and Plan.
- `src/data/locales/*.json` contains the five dictionaries, metadata and current
  suite descriptions. All dictionaries have the same keys.
- `src/components/pages/` contains the overview and three product pages.
- `ThinkHero.astro` uses the shared illustration timeline, controls and paper treatment. It shows a question, an agent organizing options and a human choosing the next step, with reduced-motion and no-JavaScript fallbacks.
- `ProductExample.astro` explains a human request, an agent contribution and human review on each surface, in all five languages. The scenarios are illustrative; captures use the real interface with fictional content.
- `CurrentCapabilities.astro` labels authentic product captures separately from
  the existing interactive workflow illustrations. No illustration runs an agent
  or creates real work.
- `SuiteShared.astro` explains contextual agents, content ownership and control over contributions. It links to the deeper guides rather than showcasing settings.
- `public/assets/current/` contains captures from isolated fictional workspaces,
  plus localized social cards. No real colleague or workspace is used.
- `src/styles/current-suite.css` provides cool neutral surfaces and shared current
  product layouts. Semantic foundations remain in `tokens.css`.
- `tests/refresh-social.mjs` renders social cards from current copy and the canvas
  capture. Rebuild after refreshing them.

Product image provenance is the Hanji repository’s `docs/handbook/assets/` and
`scripts/docs-shots.mjs`. The public canvas has a deterministic paused conductor
fixture and makes no model call. The document screenshot uses Ada and Remy.

The public story and benchmark rationale are in `docs/positioning-review.md`. The homepage introduces Hanji as a research lab for clearer human–agent interaction, its personal origin and open iteration, then the current workspace experiment and its agent workflows. The homepage explains the conductor, focused mentions, task briefs and version history before directing visitors to detailed pages. Product pages and the handbook carry the deeper workflows. The earlier lab identity is preserved in the history (`f2e4973`); competitors inform presentation, not the mission. Current product stills are captured at 2× density; the fictional First mile example connects the canvas, issue and decision record.

The original Document editorial CSS remains checksum-protected. Its miniatures,
proposal and permissions demonstrations retain their own tested behavior.
`timeline.ts` owns illustration playback, `paper-tilt.ts` owns pointer tilt, and
`page-lifecycle.ts` disposes listeners and animation work between routes.

## Routes and preferences

English: `/`, `/projects/think/`, `/projects/plan/`, `/projects/document/`.
Other locales use `/{lang}/lab/` and `/{lang}/projects/{product}/`.
All previous Write, Work, Knowledge and Tracker product URLs redirect to the
current product with query strings and fragments preserved. Legacy language
entry URLs also remain redirects. Aliases are noindex and stay out of the sitemap.

The header presents Think, Plan and Document in that order. Astro’s client router
keeps the shared header alive while changing pages. Its language and theme menus
use the same geometry across products. Explicit localized URLs stay shareable;
System language detection applies to unprefixed entries. Theme and language choices
persist. The header fits 320px screens; reduced motion and no-JavaScript reading
remain supported. `/start/` is a standalone English guide with a readable native
fallback and the saved theme preference.

## Public access requests

The existing recipient-confirmed FormSubmit integration is preserved. Document
uses an inline form; Plan and Think link to the hosted recipient-provided form
with the product name in the subject. `src/data/access.ts` contains public form
identifiers only. Never commit a private activation link or recipient email.
A local mocked form test does not establish provider delivery.

The app source is currently private. Source setup instructions assume an
already-authorized checkout. Provider accounts are configured separately; the
basic products do not require a model subscription. Do not add a ZIP or DMG link
until an actual release has been approved and published.

## Publish the website

The canonical origin is `https://hanji.ink`. GitHub Pages is deployed from the
manual `.github/workflows/pages-build.yml` workflow. It builds and tests the
committed revision; `deploy` defaults to false. To publish reviewed main:

```sh
gh workflow run pages-build.yml --ref main -f deploy=true
```

After publication, verify the deployed revision, canonical metadata, localized
routes, old redirects, current images and `/start/`. DNS and mail records are
outside this workflow and are not changed by a content update.

## Keep the handbook separate

`gethanji/docs` owns `https://hanji.ink/docs/`. The marketing build must never emit
`dist/docs/`, copy over the documentation export, or change that repository’s Pages
source. The handbook now covers all three products, desktop setup, the conductor,
workspace insights, permissions and source/server setup.

In the Hanji source repository, `scripts/export-handbook.mjs` exports only
`docs/handbook` from isolated publication state. Review the artifact’s local links,
assets and Markdown mirrors, then commit and push it to the separate docs repo.
Verify the HTML, stylesheet, image assets and llms.txt after that deployment too.
