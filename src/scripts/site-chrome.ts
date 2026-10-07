import {onPage} from './page-lifecycle';
onPage(scope=>{
// Native disclosures and real links remain functional without this enhancement.
const menus = [...document.querySelectorAll<HTMLDetailsElement>('[data-disclosure]')];
function close(menu: HTMLDetailsElement, focus = false) { menu.open = false; if (focus) menu.querySelector<HTMLElement>('summary')?.focus(); }
for (const menu of menus) {
  const summary = menu.querySelector('summary')!;
  const sync = () => summary.setAttribute('aria-expanded', String(menu.open));
  sync();
  scope.listen(menu,'toggle', () => {
    sync();
    if (menu.open) for (const other of menus) if (other !== menu && !other.contains(menu) && !menu.contains(other)) close(other);
  });
  scope.listen(menu,'keydown', event => {
    if (event.key === 'Escape' && menu.open) { event.preventDefault(); event.stopPropagation(); close(menu, true); }
  });
  scope.listen(menu,'focusout', event => { if (event.relatedTarget && !menu.contains(event.relatedTarget as Node)) close(menu); });
  // Current links are handled with the rest of the menu links below.
  menu.querySelectorAll('a').forEach(a => scope.listen(a,'click', () => close(menu)));
}
scope.listen(document,'click', event => menus.forEach(menu => { if (!menu.contains(event.target as Node)) close(menu); }));
scope.listen(window,'pageshow', () => menus.forEach(menu => close(menu)));
function updateLanguageLinks() {
  document.querySelectorAll<HTMLAnchorElement>('.lang-picker a').forEach(a => { const u = new URL(a.href); u.search = location.search; u.hash = location.hash; a.href = u.href; });
}
updateLanguageLinks();scope.listen(window,'hashchange', updateLanguageLinks);
for (const frame of document.querySelectorAll<HTMLElement>('.reliable-media')) {
  const img = frame.querySelector('img')!;
  const loaded = () => { if (img.naturalWidth) { frame.dataset.ready = 'true'; delete frame.dataset.failed; } };
  const failed = () => { frame.dataset.failed = 'true'; delete frame.dataset.ready; };
  scope.listen(img,'load', loaded);scope.listen(img,'error', failed);
  if (img.complete) img.naturalWidth ? loaded() : failed();
}
// Capture nested Escape before preserved Knowledge picker listeners handle it.
scope.listen(document,'keydown', event => {
  if(event.key !== 'Escape') return;
  const inner=(event.target as Element).closest<HTMLDetailsElement>('[data-disclosure][open]');
  if(inner){event.preventDefault();event.stopImmediatePropagation();close(inner,true);}
},true);

});
