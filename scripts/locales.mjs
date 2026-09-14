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
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://gethanji.github.io";

export const LOCALES = [
  { code: "en", path: "/",    dir: ".",  og: "en_US", label: "EN", aria: "Read in English",  live: true },
  { code: "ko", path: "/ko/", dir: "ko", og: "ko_KR", label: "KO", aria: "한국어で読む".replace("で読む","로 읽기"), live: true },
  { code: "de", path: "/de/", dir: "de", og: "de_DE", label: "DE", aria: "Auf Deutsch lesen", live: false },
  { code: "ja", path: "/ja/", dir: "ja", og: "ja_JP", label: "JA", aria: "日本語で読む",      live: false },
];

const live = () => LOCALES.filter((l) => l.live);

// Every live locale, plus x-default pointing at English.
function alternates() {
  return [
    ...live().map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE}${l.path}">`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}/">`,
  ].join("\n");
}

// All live locales appear; the current one is marked and not a link, so the
// switcher says where you are as well as where you can go.
function switcher(current) {
  return live()
    .map((l) =>
      l.code === current
        ? `<span class="language-switch is-current" lang="${l.code}" aria-current="true">${l.label}</span>`
        : `<a class="language-switch" href="${l.path}" lang="${l.code}" hreflang="${l.code}" aria-label="${l.aria}">${l.label}</a>`,
    )
    .join("");
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
  // The switcher is one contiguous run of language-switch nodes.
  s = s.replace(
    /(?:<(?:a|span) class="language-switch[^"]*"[^>]*>[^<]*<\/(?:a|span)>)+/,
    switcher(loc.code),
  );
  if (s !== before) writeFileSync(file, s);
  return { file, changed: s !== before };
}

function sitemap() {
  const alts = live()
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${SITE}${l.path}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`)
    .join("\n");
  const today = new Date().toISOString().slice(0, 10);
  const pages = live()
    .map((l) => `  <url>\n    <loc>${SITE}${l.path}</loc>\n${alts}\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`)
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

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const loc of LOCALES) {
    const r = rewrite(loc);
    console.log(`  ${loc.code}  ${r.skipped ? "no page yet (declared, not advertised)" : r.changed ? "updated" : "already in sync"}`);
  }
  sitemap();
  console.log(`sitemap: ${live().length} locale page(s) + /docs/`);
  console.log(`live: ${live().map((l) => l.code).join(", ")}  ·  declared: ${LOCALES.filter((l) => !l.live).map((l) => l.code).join(", ")}`);
}
