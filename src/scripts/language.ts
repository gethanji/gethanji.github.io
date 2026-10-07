// Explicit localized URLs stay shareable. System chooses the browser language
// on unprefixed entry pages and whenever the user selects System.
const picker = document.querySelector<HTMLDetailsElement>('.lang-picker');
if (picker) {
  const key = 'hanji-language';
  const supported = ['en', 'ko', 'de', 'ja', 'fr'];
  const detected = (navigator.languages || [navigator.language])
    .map(tag => tag.toLowerCase().split('-')[0]).find(lang => supported.includes(lang)) || 'en';
  let choice = 'system';
  try { const saved = localStorage.getItem(key); if (saved && ['system', ...supported].includes(saved)) choice = saved; } catch {}
  const systemLink = picker.querySelector<HTMLAnchorElement>('[data-language=system]')!;
  const detectedLink = picker.querySelector<HTMLAnchorElement>(`[data-language=${detected}]`)!;
  const withLocation = (href: string) => { const u = new URL(href); u.search = location.search; u.hash = location.hash; return u.href; };
  systemLink.href = withLocation(detectedLink.href);
  for (const link of picker.querySelectorAll<HTMLAnchorElement>('[data-language]')) {
    const selected = link.dataset.language === choice;
    link.classList.toggle('is-current', selected);
    if (selected) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    link.addEventListener('click', () => {
      try { localStorage.setItem(key, link.dataset.language!); } catch {}
      link.href = withLocation(link.href);
    });
  }
}
