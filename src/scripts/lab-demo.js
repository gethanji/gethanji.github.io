import {onPage} from './page-lifecycle';
onPage(scope=>{
if(document.body.dataset.product==='knowledge')return;
// Demonstration only. No network requests or real workspace writes.
document.querySelectorAll('[data-merge]').forEach(button => {
  let state = 0;
  button.addEventListener('click', () => {
    const demo = button.closest('.demo');
    const addition = demo.querySelector('[data-addition]');
    const message = demo.querySelector('[data-message]');
    state = (state + 1) % 3;
    addition.hidden = state === 0;
    button.textContent = ['Review proposal', 'Merge example', 'Reset example'][state];
    message.textContent = ['A person reviews the change before it joins the handbook.', 'Proposed addition: clarify who shares the decision. You decide whether to merge.', 'Example merged. One small change, with the rest of the document preserved.'][state];
  });
});

// These are two views of one fictional workflow, never connected to a backend.
const sceneTabs = [...document.querySelectorAll('.scene-tabs [role="tab"]')];
function setScene(tab) {
  sceneTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
}
sceneTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => setScene(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = sceneTabs[1-index];
    if (event.key === 'Home') next = sceneTabs[0];
    if (event.key === 'End') next = sceneTabs[sceneTabs.length-1];
    if (next) { event.preventDefault(); setScene(next); next.focus(); }
  });
});
// Preserve links to the original product sections, now on Knowledge's route.
if (location.pathname === '/') {
  const legacy = new Set(['demo','writing','review','no-model','permissions','collaboration','compare','run','launch']);
  if (legacy.has(location.hash.slice(1))) location.replace('/projects/knowledge/' + location.search + location.hash);
}
const captures=[...document.querySelectorAll('.capture-tabs [role="tab"]')];
function selectCapture(tab){captures.forEach(b=>{const yes=b===tab;b.tabIndex=yes?0:-1;b.setAttribute('aria-selected',String(yes));document.getElementById(b.getAttribute('aria-controls')).hidden=!yes;});}
captures.forEach((tab,i)=>{tab.addEventListener('click',()=>selectCapture(tab));tab.addEventListener('keydown',event=>{let n;if(event.key==='ArrowRight')n=(i+1)%captures.length;if(event.key==='ArrowLeft')n=(i+captures.length-1)%captures.length;if(event.key==='Home')n=0;if(event.key==='End')n=captures.length-1;if(n!==undefined){event.preventDefault();selectCapture(captures[n]);captures[n].focus();}});});

});
