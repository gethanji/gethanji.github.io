import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
const langs=['en','ko','de','ja','fr'], pages=['lab','knowledge','tracker'];
const route=(l,p)=>l==='en'?(p==='lab'?'/':`/projects/${p==='knowledge'?'write':'work'}/`):p==='lab'?`/${l}/lab/`:`/${l}/projects/${p==='knowledge'?'write':'work'}/`;
const read=p=>readFileSync(p,'utf8');
const dictionaries=Object.fromEntries(langs.map(l=>[l,JSON.parse(read(`src/data/locales/${l}.json`))]));
function keys(object,prefix=''){return Object.entries(object).flatMap(([k,v])=>v&&typeof v==='object'?keys(v,prefix+k+'.'):[prefix+k]).sort();}
test('five dictionaries have exactly the same stable keys',()=>{for(const l of langs)assert.deepEqual(keys(dictionaries[l]),keys(dictionaries.en),l);});
test('all 15 canonical routes have matching language, page-specific metadata and five alternates',()=>{for(const l of langs)for(const p of pages){const html=read('dist'+route(l,p)+'index.html');assert(new RegExp(`<html[^>]*\\blang="${l}"`).test(html));assert(html.includes(`rel="canonical" href="https://hanji.ink${route(l,p)}"`));for(const other of langs)assert(html.includes(`hreflang="${other}" href="https://hanji.ink${route(other,p)}"`));assert(html.includes('hreflang="x-default"'));assert(html.includes('id="main"'));}});
test('all five aliases retain query and fragment; sitemap excludes aliases',()=>{const sitemap=read('dist/sitemap.xml');for(const l of langs){const html=read(`dist/${l}/index.html`);assert(html.includes(route(l,'knowledge')));assert(html.includes('location.search+location.hash'));assert(html.includes('content="noindex"'));assert(!sitemap.includes(`<loc>https://hanji.ink/${l}/</loc>`));}});
test('local links and assets resolve; page hashes target real section IDs',()=>{
 for(const l of langs)for(const p of pages){const path=route(l,p),html=read('dist'+path+'index.html');for(const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)){let value=match[1];if(!value.startsWith('/')&&!value.startsWith('#'))continue;const u=new URL(value,'https://gethanji.github.io'+path);const target='dist'+u.pathname+(u.pathname.endsWith('/')?'index.html':'');assert(existsSync(target),`${path}: ${value}`);if(u.hash&&target.endsWith('.html'))assert(read(target).includes(`id="${u.hash.slice(1)}"`),`${path}: missing ${value}`);}}
});
test('handbook belongs to the separate docs site and never enters marketing output',()=>{assert(!existsSync('dist/docs'));for(const l of langs){assert(read('dist'+route(l,'knowledge')+'index.html').includes('https://gethanji.github.io/docs/'));for(const p of ['lab','tracker'])assert(!read('dist'+route(l,p)+'index.html').includes('href="https://gethanji.github.io/docs/'));}});
test('non-English lab and Tracker prose has no silent English fallback',()=>{for(const l of langs.filter(l=>l!=='en'))for(const p of ['lab','tracker'])for(const [k,v] of Object.entries(dictionaries[l][p])){if(k.includes('.pre.')||k.endsWith('.href')||k.endsWith('.src'))continue;if(typeof v==='string'&&v.trim().length>60)assert.notEqual(v,dictionaries.en[p][k],`${l}.${p}.${k}`);}});
test('original Knowledge CSS remains unchanged',()=>{const expected=JSON.parse(read('tests/fixtures/knowledge-assets.json'));return import('node:crypto').then(({createHash})=>{for(const [file,hash] of Object.entries(expected).filter(([file])=>file==='landing.css'))assert.equal(createHash('sha256').update(readFileSync('public/assets/'+file)).digest('hex'),hash);});});

test('Knowledge script changes are limited to shared tilt extraction, shared picker ownership, main-only arrow enhancement, shared playback controls, shared theme ownership, and shared editorial reveals',()=>{
 let expected=read('tests/fixtures/knowledge-before-extraction.js');
 let start=expected.indexOf('// A small pointer-following tilt,'),end=expected.indexOf('/* Theme.',start);
 expected=expected.slice(0,start)+'// Paper tilt is shared by Knowledge and Tracker in src/scripts/paper-tilt.ts.\n\n'+expected.slice(end);
 start=expected.indexOf('// Pause the decorative miniature');end=expected.indexOf('// Paper tilt is shared',start);
 expected=expected.slice(0,start)+'// Shared timeline controls own Knowledge miniature playback in knowledge-story.ts.\n\n'+expected.slice(end);
 expected=expected.replace("document.querySelectorAll('a, .flow-arrow, .merge')","document.querySelectorAll('#main a, #main .flow-arrow, #main .merge')");
 start=expected.indexOf('/* Every picker closes');end=expected.indexOf('\n});',start)+5;
 expected=expected.slice(0,start)+'// Shared site-chrome.ts owns the header pickers and nested keyboard behavior.\n'+expected.slice(end);
 start=expected.indexOf('/* Theme.');end=expected.indexOf('// Shared site-chrome.ts',start);
 expected=expected.slice(0,start)+'// Shared theme.ts owns the saved Light / Dark / System preference on all pages.\n\n'+expected.slice(end);
 start=expected.indexOf(" if('IntersectionObserver' in window){");end=expected.indexOf(" const progress=document.createElement('div');",start);
 expected=expected.slice(0,start)+' // Shared page-motion.ts owns editorial reveals on every page.\n'+expected.slice(end);
 assert.equal(read('public/assets/landing.js'),expected);
});

test('renamed project routes preserve every old project link and publish only canonical URLs',()=>{
 const sitemap=read('dist/sitemap.xml');
 for(const lang of langs)for(const [id,name] of [['knowledge','Write'],['tracker','Work']]){
  const destination=route(lang,id),oldPath=`${lang==='en'?'':`/${lang}`}/projects/${id}/`;
  const alias=read(`dist${oldPath}index.html`),html=read(`dist${destination}index.html`);
  assert(alias.includes(`rel="canonical" href="https://hanji.ink${destination}"`));
  assert(alias.includes(`id="legacy-destination" href="${destination}"`));
  assert(alias.includes('location.search+location.hash'));
  assert(alias.includes('content="noindex"'));
  assert(!sitemap.includes(`<loc>https://hanji.ink${oldPath}</loc>`));
  assert(sitemap.includes(`<loc>https://hanji.ink${destination}</loc>`));
  assert(html.includes(`<title>Hanji ${name} —`));
  assert(!/href="[^" ]*\/projects\/(knowledge|tracker)\//.test(html));
  assert(!html.includes('Hanji Knowledge')&&!html.includes('Hanji Tracker'));
 }
});
