import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const origin = 'https://hanji.ink';
const languages = ['en', 'ko', 'de', 'ja', 'fr'];
const route = (lang, page) => lang === 'en'
  ? page === 'lab' ? '/' : `/projects/${page==='knowledge'?'write':'work'}/`
  : page === 'lab' ? `/${lang}/lab/` : `/${lang}/projects/${page==='knowledge'?'write':'work'}/`;

test('domain release keeps metadata on hanji.ink and handbook references separate', () => {
  for (const lang of languages) for (const page of ['lab', 'knowledge', 'tracker']) {
    const path = route(lang, page);
    const html = read(`dist${path}index.html`);
    assert(html.includes(`property="og:url" content="${origin}${path}"`), path);
    if (page !== 'knowledge') continue;
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    function check(value) {
      if (value && typeof value === 'object') Object.values(value).forEach(check);
      else if (typeof value === 'string' && value.startsWith('https://gethanji.github.io'))
        assert(value.startsWith('https://gethanji.github.io/docs/'), value);
    }
    check(schema);
    const app = schema['@graph'].find(node => node['@type'] === 'SoftwareApplication');
    assert.equal(app.url, origin + path);
    assert.equal(app.softwareHelp, 'https://gethanji.github.io/docs/');
    assert(html.includes(`property="og:image" content="${origin}/assets/`));
  }
  assert(read('dist/robots.txt').includes(`Sitemap: ${origin}/sitemap.xml`));
  assert(!read('dist/sitemap.xml').includes('https://gethanji.github.io'));
  const llms = read('dist/llms.txt');
  assert(llms.includes(`${origin}/projects/work/`));
  assert(llms.includes('https://gethanji.github.io/docs/'));
});
