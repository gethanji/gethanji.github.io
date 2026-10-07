import {onPage} from './page-lifecycle';
onPage(scope=>{
// The head bootstrap resolves the saved choice before the page can paint.
// This shared controller owns controls, system changes and other open tabs.
const key = 'hanji-theme';
const root = document.documentElement;
const system = matchMedia('(prefers-color-scheme: dark)');
const inputs = [...document.querySelectorAll<HTMLInputElement>('.theme-picker input[name="theme"]')];
const valid = (value: string | null | undefined) => ['light', 'dark', 'system'].includes(value ?? '') ? value! : 'system';
let choice = valid(root.dataset.themeChoice);

function apply() {
  root.dataset.themeChoice = choice;
  root.dataset.theme = choice === 'system' ? (system.matches ? 'dark' : 'light') : choice;
  inputs.forEach(input => { input.checked = input.value === choice; });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.body).backgroundColor);
}

inputs.forEach(input => scope.listen(input,'change', () => {
  if (!input.checked) return;
  choice = valid(input.value);
  try { localStorage.setItem(key, choice); } catch { /* A session choice still works when storage is unavailable. */ }
  apply();
}));
scope.listen(system,'change', () => { if (choice === 'system') apply(); });
scope.listen(window,'storage', event => {
  if (event.key === key || event.key === null) { choice = valid(event.newValue); apply(); }
});
apply();

});
