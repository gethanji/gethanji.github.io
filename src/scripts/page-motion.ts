import {onPage} from './page-lifecycle';
onPage(scope=>{
// Content is visible without JavaScript. Only offscreen editorial blocks wait
// for their first reveal; interactive examples own their own animation clocks.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const skipEntryForAnchor = () => {
  if (location.hash) document.documentElement.dataset.entryStatic = 'true';
};
skipEntryForAnchor();
scope.listen(window,'hashchange', skipEntryForAnchor);
scope.listen(window,'pageshow', event => {
  if (event.persisted) document.documentElement.dataset.entryStatic = 'true';
});
const sections = [...document.querySelectorAll<HTMLElement>([
  '#main .story-head', '#main .flow', '#main .permission-demo', '#main .margin-demo',
  '#main .activity-chart', '#main .no-model-grid', '#main .matrix-shell',
  '#main .run-intro', '#main .run-options', '#main .launch-heading', '#main .launch-form',
  '#main .section-head', '#main .editorial', '#main .project', '#main .feature-pair',
  '#main .product-chapter', '#main .origin', '#main .status', '#main .next-project',
].join(','))];
if ('IntersectionObserver' in window && !preference.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('waiting');
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, {threshold: 0.08});
  scope.disposeWith(()=>observer.disconnect());
  for (const section of sections) {
    section.classList.add('reveal');
    if (section.getBoundingClientRect().top > innerHeight) {
      section.classList.add('waiting');
      observer.observe(section);
    }
  }
  scope.listen(preference,'change', () => {
    if (!preference.matches) return;
    observer.disconnect();
    for (const section of sections) section.classList.remove('waiting');
  });
}

});
