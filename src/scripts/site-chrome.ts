// Native disclosures and real links remain functional without this enhancement.
const menus = [...document.querySelectorAll<HTMLDetailsElement>('[data-disclosure]')];
function close(menu: HTMLDetailsElement, focus = false) { menu.open = false; if (focus) menu.querySelector<HTMLElement>('summary')?.focus(); }
for (const menu of menus) {
  const summary = menu.querySelector('summary')!;
  const sync = () => summary.setAttribute('aria-expanded', String(menu.open));
  sync();
  menu.addEventListener('toggle', () => {
    sync();
    if (menu.open) for (const other of menus) if (other !== menu && !other.contains(menu) && !menu.contains(other)) close(other);
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { event.preventDefault(); event.stopPropagation(); close(menu, true); }
  });
  menu.addEventListener('focusout', event => { if (event.relatedTarget && !menu.contains(event.relatedTarget as Node)) close(menu); });
  menu.querySelector('.is-current')?.addEventListener('click', () => close(menu));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close(menu)));
}
document.addEventListener('click', event => menus.forEach(menu => { if (!menu.contains(event.target as Node)) close(menu); }));
window.addEventListener('pageshow', () => menus.forEach(menu => close(menu)));
function updateLanguageLinks() {
  document.querySelectorAll<HTMLAnchorElement>('.lang-picker a').forEach(a => { const u = new URL(a.href); u.search = location.search; u.hash = location.hash; a.href = u.href; });
}
updateLanguageLinks();window.addEventListener('hashchange', updateLanguageLinks);
for (const frame of document.querySelectorAll<HTMLElement>('.reliable-media')) {
  const img = frame.querySelector('img')!;
  const loaded = () => { if (img.naturalWidth) { frame.dataset.ready = 'true'; delete frame.dataset.failed; } };
  const failed = () => { frame.dataset.failed = 'true'; delete frame.dataset.ready; };
  img.addEventListener('load', loaded);img.addEventListener('error', failed);
  if (img.complete) img.naturalWidth ? loaded() : failed();
}
// Capture nested Escape before preserved Knowledge picker listeners handle it.
document.addEventListener('keydown', event => {
  if(event.key !== 'Escape') return;
  const inner=(event.target as Element).closest<HTMLDetailsElement>('[data-disclosure][open]');
  if(inner){event.preventDefault();event.stopImmediatePropagation();close(inner,true);}
},true);
