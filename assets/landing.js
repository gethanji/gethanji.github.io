const pageCopy=(en,ko)=>document.documentElement.lang==='ko'?ko:en;

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
 tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !active; });
}
tabs.forEach((tab, index) => {
 tab.addEventListener('click', () => selectTab(tab));
 tab.addEventListener('keydown', event => { let next; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = tabs[1-index]; if (event.key === 'Home') next = tabs[0]; if (event.key === 'End') next = tabs[1]; if (next) { event.preventDefault(); selectTab(next); next.focus(); } });
});
const merge = document.getElementById('merge');
const reset = document.getElementById('reset');
function setMerged(merged) {
 document.getElementById('merged-line').hidden = !merged;
 document.getElementById('agent-added').hidden = !merged;
 document.getElementById('proposal-badge').textContent = merged ? pageCopy("Merged","반영됨") : '+1';
 document.getElementById('side-count').textContent = merged ? '0' : '1';
 document.getElementById('byline').textContent = merged ? pageCopy("Ada · merged claude’s proposal just now","Ada · 방금 claude의 제안을 반영") : pageCopy("Ada · updated today","Ada · 오늘 수정");
 document.getElementById('demo-status').textContent = merged ? pageCopy("✓ One line added. One commit.","✓ 추가된 한 줄. 커밋 하나.") : pageCopy("Interactive example · try Merge","작동 예시 · 제안을 반영해 보세요");
 merge.textContent = merged ? pageCopy("Merged ✓","반영됨 ✓") : pageCopy("Merge proposal","제안 반영");
 merge.disabled = merged;
 reset.hidden = !merged;
}
merge.addEventListener('click', () => setMerged(true));
reset.addEventListener('click', () => { setMerged(false); selectTab(tabs[0]); merge.focus(); });

// Small, progressive enhancements. The writing remains visible without JavaScript.
(() => {
 const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const icon = (direction = 'diagonal') => {
  const paths = {diagonal:'M5 11 11 5M5 5h6v6',right:'M3 8h10M8 3l5 5-5 5',down:'M8 3v10M3 8l5 5 5-5',up:'M8 13V3M3 8l5-5 5 5'};
  const span = document.createElement('span');
  span.className = 'link-arrow'; span.setAttribute('aria-hidden','true');
  span.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[direction]}"/></svg>`;
  return span;
 };
 // One stroke weight, optical size and alignment for every directional cue.
 document.querySelectorAll('.arrow').forEach(el => {el.textContent='';el.append(icon().firstElementChild);});
 document.querySelectorAll('a, .flow-arrow, .merge').forEach(el => {
  const walker = document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
   const match=node.textContent.match(/([↗→↓↑])\s*$/); if(!match)return;
   node.textContent=node.textContent.replace(/[↗→↓↑]\s*$/,'').trimEnd();
   node.after(icon({'↗':'diagonal','→':'right','↓':'down','↑':'up'}[match[1]]));
  });
 });

 const comparisonPicker=document.getElementById('compare-tool');
 comparisonPicker.addEventListener('change',()=>{
  document.querySelectorAll('.fit-matrix [data-tool]').forEach(cell=>{
   cell.dataset.active=String(cell.dataset.tool===comparisonPicker.value);
   if(cell.dataset.active==='true' && !reduceMotion.matches){
    cell.getAnimations().forEach(animation=>animation.cancel());
    cell.animate([{opacity:.2,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.2,.8,.2,1)'});
   }
  });
 });

 // A column of light follows the comparison, without moving the table itself.
 const matrix=document.querySelector('.fit-matrix');
 let readingTool=null;
 function lightColumn(tool){
  if(tool===readingTool)return;
  readingTool=tool;
  matrix.querySelectorAll('[data-tool]').forEach(cell=>{
   cell.classList.toggle('column-reading',cell.dataset.tool===tool);
  });
 }
 if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  matrix.addEventListener('pointerover',event=>lightColumn(event.target.closest('[data-tool]')?.dataset.tool || null));
  matrix.addEventListener('pointerleave',()=>lightColumn(null));
 }

 // The seal gives a single, slight nod when approached, never an idle loop.
 document.querySelectorAll('.brand').forEach(brand=>{
  const mark=brand.querySelector('img');
  if(!mark)return;
  const nod=()=>{
   if(reduceMotion.matches)return;
   mark.getAnimations().forEach(animation=>animation.cancel());
   mark.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-2px) rotate(-9deg)',offset:.4},{transform:'translateY(0) rotate(0)'}],{duration:600,easing:'cubic-bezier(.2,.8,.2,1)'});
  };
  brand.addEventListener('pointerenter',nod);
  brand.addEventListener('focus',nod);
 });

 const stage=document.querySelector('.product-stage');
 const mergeButton=document.getElementById('merge');
 // The existing handler commits the example synchronously. Capture the source
 // before that update, then animate a duplicate into the newly rendered sentence.
 mergeButton.addEventListener('click', () => {
  if(reduceMotion.matches)return;
  const source=document.querySelector('.addition');
  const from=source.getBoundingClientRect();
  requestAnimationFrame(() => {
   const target=document.querySelector('#merged-line mark');
   const to=target.getBoundingClientRect();
   if(!to.width)return;
   const flight=document.createElement('div');
   flight.className='merge-flight';flight.setAttribute('aria-hidden','true');
   flight.textContent=pageCopy("Give the next person a place to start.","다음 사람이 시작할 자리를 남깁니다.");
   Object.assign(flight.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`});
   document.body.append(flight); stage.classList.add('merging');
   const distanceX=to.left-from.left, distanceY=to.top-from.top;
   const animation=flight.animate([
    {transform:'translate(0,0) scale(1)',opacity:1},
    {transform:`translate(${distanceX*.48}px,${distanceY*.48-28}px) scale(.97)`,opacity:1,offset:.5},
    {transform:`translate(${distanceX}px,${distanceY}px) scale(.93)`,opacity:0}
   ],{duration:720,easing:'cubic-bezier(.3,.1,.2,1)'});
   target.animate([{backgroundColor:'#accfae'},{backgroundColor:'transparent'}],{duration:1600,delay:500});
   const cleanFlight=()=>{flight.remove();stage.classList.remove('merging');};
   animation.finished.then(cleanFlight,cleanFlight);
  });
 },true);

 const identities=[...document.querySelectorAll('[data-person]')];
 const pages=[...document.querySelectorAll('[data-access]')];
 const status={ada:pageCopy("Ada owns this workspace. All four pages are visible.","소유자인 Ada에게는 페이지 네 개가 모두 보입니다."),remy:pageCopy("Remy sees three pages. Ada’s private note is absent.","Remy에게는 페이지 세 개가 보입니다. Ada의 비공개 메모는 보이지 않습니다."),agent:pageCopy("The agent sees two pages. Planning and private notes are absent.","에이전트에게는 페이지 두 개가 보입니다. 계획과 비공개 메모는 보이지 않습니다.")};
 identities.forEach(button=>button.addEventListener('click',()=>{
  const person=button.dataset.person;
  identities.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  let count=0;
  pages.forEach((page,index)=>{
   const visible=page.dataset.access.split(' ').includes(person);
   page.hidden=!visible;
   if(visible){count++;if(!reduceMotion.matches)page.animate([{opacity:.1,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,delay:index*35,fill:'backwards'});}
  });
  document.getElementById('visible-count').textContent=`${count}${document.documentElement.lang==='ko'?'개 표시':' visible'}`;
  document.getElementById('permission-status').textContent=status[person];
 }));

 const commentTrigger=document.getElementById('comment-trigger');
 function showComment(open){
  commentTrigger.setAttribute('aria-expanded',String(open));
  document.getElementById('margin-thread').hidden=!open;
  document.getElementById('margin-idle').hidden=open;
 }
 commentTrigger.addEventListener('click',()=>showComment(commentTrigger.getAttribute('aria-expanded')!=='true'));
 document.getElementById('close-comment').addEventListener('click',()=>{showComment(false);commentTrigger.focus();});
 document.getElementById('margin-thread').addEventListener('keydown',event=>{if(event.key==='Escape'){showComment(false);commentTrigger.focus();}});

 // Deterministic illustrative activity, not a live usage claim.
 const bars=document.getElementById('activity-bars');
 for(let day=0;day<56;day++){
  const weekend=day%7>4;
  const human=weekend ? (day%3)*3 : 9+((day*17+11)%47);
  const agent=weekend ? (day%4)*2 : 13+((day*23+5)%54);
  const bar=document.createElement('span');bar.className='activity-day';
  bar.style.setProperty('--human',`${human}px`);bar.style.setProperty('--agent',`${agent}px`);bar.style.setProperty('--delay',`${day*9}ms`);
  bar.innerHTML='<i></i><i></i>';bars.append(bar);
 }

 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.remove('waiting');entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.08});
  document.querySelectorAll('.story-head,.flow,.permission-demo,.margin-demo,.activity-chart,.no-model-grid,.matrix-shell,.run-intro,.run-options,.launch-heading,.launch-form').forEach(el=>{
   el.classList.add('reveal');
   if(!reduceMotion.matches && el.getBoundingClientRect().top>innerHeight)el.classList.add('waiting');
   observer.observe(el);
  });
 }
 const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 let scheduled=false;
 const updateProgress=()=>{const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${range>0?Math.min(1,Math.max(0,scrollY/range)):0})`;scheduled=false;};
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});
 addEventListener('resize',updateProgress);updateProgress();
 const darkPanel=document.querySelector('.no-model');
 if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  darkPanel.addEventListener('pointermove',event=>{if(reduceMotion.matches)return;const r=darkPanel.getBoundingClientRect();darkPanel.style.setProperty('--pointer-x',`${event.clientX-r.left}px`);darkPanel.style.setProperty('--pointer-y',`${event.clientY-r.top}px`);});
 }
 // Also honor a preference changed while this page is open.
 reduceMotion.addEventListener('change',()=>{
  if(!reduceMotion.matches)return;
  document.getAnimations().forEach(animation=>animation.cancel());
  document.querySelectorAll('.reveal.waiting').forEach(el=>el.classList.remove('waiting'));
  document.querySelectorAll('.merge-flight').forEach(el=>el.remove());
 });
})();
