import en from './locales/en.json';
import ko from './locales/ko.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import fr from './locales/fr.json';
export const locales = ['en', 'ko', 'de', 'ja', 'fr'] as const;
export type Locale = typeof locales[number];
export type Page = 'lab' | 'knowledge' | 'tracker';
export const languages = { en: 'English', ko: '한국어', de: 'Deutsch', ja: '日本語', fr: 'Français' };
export const localeTags = { en: 'en_US', ko: 'ko_KR', de: 'de_DE', ja: 'ja_JP', fr: 'fr_FR' };
const dictionaries = { en, ko, de, ja, fr };
export const dictionary = (lang: Locale) => dictionaries[lang];
export const projects = [
  { id: 'knowledge', name: 'Write', slug: 'write', accent: 'celadon', summary: 'knowledgeSummary', status: 'closed-beta' },
  { id: 'tracker', name: 'Work', slug: 'work', accent: 'orchid', summary: 'trackerSummary', status: 'alpha' },
] as const;
export const pages: Page[] = ['lab', ...projects.map(p => p.id)];
export function route(lang: Locale, page: Page) {
  if (page === 'lab') return lang === 'en' ? '/' : `/${lang}/lab/`;
  const slug = projects.find(p => p.id === page)!.slug;
  return `${lang === 'en' ? '' : `/${lang}`}/projects/${slug}/`;
}
export function localHref(lang: Locale, href: string) {
  const [path, hash] = href.split('#');
  const page = path === '/' ? 'lab' : (path.includes('/write/') || path.includes('/knowledge/')) ? 'knowledge' : 'tracker';
  return route(lang, page) + (hash ? `#${hash}` : '');
}
export const canonicalRoutes = locales.flatMap(lang => pages.map(page => ({ lang, page, path: route(lang, page) })));

// Preserve previously published project URLs and original language entry links.
export const legacyRoutes = locales.flatMap(lang => [
  {lang, page: 'knowledge' as Page, path: `/${lang}/`},
  ...projects.map(project => ({
    lang, page: project.id,
    path: `${lang === 'en' ? '' : `/${lang}`}/projects/${project.id}/`,
  })),
]);
