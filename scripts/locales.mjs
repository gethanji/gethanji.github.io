#!/usr/bin/env node
// The locale manifest, and the only writer of everything that has to agree
// with it: <html lang>, canonical, hreflang alternates, og:locale, the nav
// switcher, and sitemap.xml.
//
// Hand-maintaining those across four locales is twenty edits in five files
// every time one lands, which is exactly the kind of thing that silently
// rots. Add a locale here, set live:true when its copy actually exists, run
// `node scripts/locales.mjs`, commit.
//
// A locale with live:false is declared but NOT advertised: no hreflang, no
// sitemap row, no switcher link. Pointing hreflang at a page that does not
// exist is worse than staying quiet about the language.
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://gethanji.github.io";

export const LOCALES = [
  { code: "en", path: "/",    dir: ".",  og: "en_US", label: "EN", name: "English",  aria: "Read in English",  live: true,
    ui: { change: "Change language", theme: "Colour theme", light: "Light", dark: "Dark", system: "System" , pause: "Pause", play: "Play" } },
  { code: "ko", path: "/ko/", dir: "ko", og: "ko_KR", label: "KO", name: "한국어",    aria: "한국어로 읽기",     live: true,
    ui: { change: "언어 변경", theme: "색상 테마", light: "밝게", dark: "어둡게", system: "시스템" , pause: "일시정지", play: "재생" } },
  { code: "de", path: "/de/", dir: "de", og: "de_DE", label: "DE", name: "Deutsch",  aria: "Auf Deutsch lesen", live: true,
    ui: { change: "Sprache wechseln", theme: "Farbschema", light: "Hell", dark: "Dunkel", system: "System" , pause: "Pause", play: "Abspielen" } },
  { code: "ja", path: "/ja/", dir: "ja", og: "ja_JP", label: "JA", name: "日本語",    aria: "日本語で読む",      live: true,
    ui: { change: "言語を変更", theme: "配色", light: "ライト", dark: "ダーク", system: "システム" , pause: "停止", play: "再生" } },
  { code: "fr", path: "/fr/", dir: "fr", og: "fr_FR", label: "FR", name: "Français", aria: "Lire en français",  live: true,
    ui: { change: "Changer de langue", theme: "Thème", light: "Clair", dark: "Sombre", system: "Système" , pause: "Pause", play: "Lecture" } },
];

// Live means "advertised": in hreflang, in the sitemap, in the switcher, in
// llms.txt. A locale can only be advertised if its page exists, or we point
// readers and crawlers at a 404 — which the header above calls worse than
// staying quiet. The flag is an intent; the file on disk is the fact.
const hasPage = (l) => existsSync(join(root, l.dir, "index.html"));
const live = () => LOCALES.filter((l) => l.live && hasPage(l));

// Every live locale, plus x-default pointing at English.
function alternates() {
  return [
    ...live().map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE}${l.path}">`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}/">`,
  ].join("\n");
}

// Five flat labels in a row was fine for two and crowded at five. The picker
// is a native <details>: it opens on click and on Enter, closes on Escape, and
// works with JavaScript off, which none of a hand-built menu would. Each row
// carries the language's own name, because a reader looking for their language
// is looking for the word they call it by, not a two-letter code.
function switcher(current) {
  const here = live().find((l) => l.code === current) ?? live()[0];
  const rows = live()
    .map((l) =>
      l.code === current
        ? `<span class="lang-option is-current" lang="${l.code}" aria-current="true">${l.name}<i>${l.label}</i></span>`
        : `<a class="lang-option" href="${l.path}" lang="${l.code}" hreflang="${l.code}" aria-label="${l.aria}">${l.name}<i>${l.label}</i></a>`,
    )
    .join("");
  return `<details class="picker lang-picker"><summary title="${here.ui.change}"><span lang="${here.code}">${here.name}</span><i class="caret" aria-hidden="true"></i></summary><div class="lang-menu">${rows}</div></details>`;
}

// The theme control, shaped like the language picker: the header shows only
// what you have chosen, and the three options appear when you ask for them.
// The radios live inside the menu, so the group keeps native semantics and
// arrow-key navigation; the summary's face is chosen in CSS from
// html[data-theme-choice], which the inline <head> script sets before first
// paint, so the right mode shows with no JavaScript and no flash.
function theme(current) {
  const u = (live().find((l) => l.code === current) ?? live()[0]).ui;
  const icon = {
    light: '<circle cx="8" cy="8" r="3.1"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.2 1.2M11.6 11.6l1.2 1.2M12.8 3.2l-1.2 1.2M4.4 11.6l-1.2 1.2"/>',
    dark: '<path d="M13.4 9.7A5.9 5.9 0 0 1 6.3 2.6 5.9 5.9 0 1 0 13.4 9.7z"/>',
    system: '<rect x="1.6" y="2.6" width="12.8" height="8.8" rx="1.6"/><path d="M5.6 14h4.8"/>',
  };
  const modes = [["light", u.light], ["dark", u.dark], ["system", u.system]];
  const glyph = (m) => `<svg viewBox="0 0 16 16" aria-hidden="true">${icon[m]}</svg>`;
  const face = modes.map(([m, label]) => `<span data-mode="${m}">${glyph(m)}${label}</span>`).join("");
  const rows = modes
    .map(([m, label]) =>
      `<label class="lang-option theme-row"><input type="radio" name="theme" value="${m}"${m === "system" ? " checked" : ""}>${glyph(m)}<span>${label}</span></label>`)
    .join("");
  return `<details class="picker theme-picker"><summary title="${u.theme}"><span class="theme-now">${face}</span><i class="caret" aria-hidden="true"></i></summary><div class="lang-menu theme-menu">${rows}</div></details>`;
}

// The vignette loops for as long as the page is open. prefers-reduced-motion
// covers the readers who set it; WCAG 2.2.2 wants a control for everyone else,
// and a control is also the only honest way to answer the space bar, which
// belongs to page scrolling and must not be taken from a keyboard reader.
function motion(current) {
  const u = (live().find((l) => l.code === current) ?? live()[0]).ui;
  return `<figcaption class="mini-controls"><button type="button" class="mini-pause" data-pause data-label-pause="${u.pause}" data-label-play="${u.play}"><i aria-hidden="true"></i><span>${u.pause}</span></button></figcaption>`;
}

function rewrite(loc) {
  const file = join(root, loc.dir, "index.html");
  if (!existsSync(file)) return { file, skipped: true };
  const before = readFileSync(file, "utf8");
  let s = before;

  s = s.replace(/<html lang="[^"]*"/, `<html lang="${loc.code}"`);
  s = s.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${SITE}${loc.path}">`);
  // Replace the whole existing alternates run in one go.
  s = s.replace(/(?:<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?)+/, alternates() + "\n");
  s = s.replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${loc.og}">`);
  s = s.replace(
    /(?:<meta property="og:locale:alternate" content="[^"]*">\n?)+/,
    live().filter((l) => l.code !== loc.code)
      .map((l) => `<meta property="og:locale:alternate" content="${l.og}">`).join("\n") + "\n",
  );
  // The picker and the theme control are both single blocks, replaced whole.
  s = s.replace(/<details class="(?:picker )?lang-picker">[\s\S]*?<\/details>/, switcher(loc.code));
  s = s.replace(/<(?:(div|fieldset) class="theme-switch"[\s\S]*?<\/\1>|details class="picker theme-picker">[\s\S]*?<\/details>)/, theme(loc.code));
  s = s.replace(/<figcaption class="mini-controls">[\s\S]*?<\/figcaption>/, motion(loc.code));
  if (s !== before) writeFileSync(file, s);
  return { file, changed: s !== before };
}

// llms.txt names the languages for agents the same way the switcher does for
// people. It is the kind of list that rots quietly, so the manifest owns it.
function llms() {
  const file = join(root, "llms.txt");
  if (!existsSync(file)) return;
  const before = readFileSync(file, "utf8");
  const list = live().map((l) => `- [${l.name}](${SITE}${l.path})`).join("\n");
  const s = before.replace(/(## Languages\n)(?:- \[[^\]]*\]\([^)]*\)\n?)+/, `$1${list}\n`);
  if (s !== before) writeFileSync(file, s);
  return s !== before;
}

function sitemap() {
  const alts = live()
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${SITE}${l.path}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`)
    .join("\n");
  // lastmod is the date the page changed, not the date this script ran. Reuse
  // the date already in the sitemap unless the page file is newer, or every
  // run tells crawlers all five pages changed and the signal becomes noise.
  const prev = existsSync(join(root, "sitemap.xml")) ? readFileSync(join(root, "sitemap.xml"), "utf8") : "";
  const stamp = (l) => {
    const seen = prev.match(new RegExp(`<loc>${SITE}${l.path}</loc>[\\s\\S]*?<lastmod>([0-9-]+)</lastmod>`));
    const mtime = statSync(join(root, l.dir, "index.html")).mtime.toISOString().slice(0, 10);
    return seen && seen[1] >= mtime ? seen[1] : mtime;
  };
  const pages = live()
    .map((l) => `  <url>\n    <loc>${SITE}${l.path}</loc>\n${alts}\n    <lastmod>${stamp(l)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages}
  <url>
    <loc>${SITE}/docs/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`;
  writeFileSync(join(root, "sitemap.xml"), xml);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const loc of LOCALES) {
    const r = rewrite(loc);
    console.log(`  ${loc.code}  ${r.skipped ? "no page yet (declared, not advertised)" : r.changed ? "updated" : "already in sync"}`);
  }
  sitemap();
  llms();
  console.log(`sitemap: ${live().length} locale page(s) + /docs/`);
  console.log(`live: ${live().map((l) => l.code).join(", ")}  ·  declared: ${LOCALES.filter((l) => !l.live).map((l) => l.code).join(", ")}`);
}
