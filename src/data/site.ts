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
  { id: 'knowledge', name: 'Knowledge', accent: 'celadon', summary: 'knowledgeSummary', status: 'experimental' },
  { id: 'tracker', name: 'Tracker', accent: 'orchid', summary: 'trackerSummary', status: 'experimental' },
] as const;
export const pages: Page[] = ['lab', ...projects.map(p => p.id)];
export function route(lang: Locale, page: Page) {
  if (lang === 'en') return page === 'lab' ? '/' : `/projects/${page}/`;
  return page === 'lab' ? `/${lang}/lab/` : `/${lang}/projects/${page}/`;
}
export function localHref(lang: Locale, href: string) {
  const [path, hash] = href.split('#');
  const page = path === '/' ? 'lab' : path.includes('/knowledge/') ? 'knowledge' : 'tracker';
  return route(lang, page) + (hash ? `#${hash}` : '');
}
export const canonicalRoutes = locales.flatMap(lang => pages.map(page => ({ lang, page, path: route(lang, page) })));
