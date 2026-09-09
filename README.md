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
