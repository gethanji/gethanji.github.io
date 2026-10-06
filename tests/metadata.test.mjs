import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('structured metadata uses the page language and current lab/product descriptions', () => {
  for (const lang of ['en', 'ko', 'de', 'ja', 'fr']) {
    const prefix = lang === 'en' ? '' : `/${lang}`;
    const html = readFileSync(`dist${prefix}/projects/knowledge/index.html`, 'utf8');
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    const metadata = JSON.parse(readFileSync(`src/data/locales/${lang}.json`, 'utf8')).metadata;
    const website = schema['@graph'].find(node => node['@type'] === 'WebSite');
    const app = schema['@graph'].find(node => node['@type'] === 'SoftwareApplication');
    assert.equal(website.inLanguage, lang);
    assert.equal(website.description, metadata.lab.description);
    assert.equal(app.description, metadata.knowledge.description);
  }
});
