const pageCopy=m=>m[document.documentElement.lang]??m.en;

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
 document.getElementById('proposal-badge').textContent = merged ? pageCopy({en:"Merged",ko:"반영됨",de:"Gemergt",ja:"マージ済み",fr:"Fusionné"}) : '+1';
 document.getElementById('side-count').textContent = merged ? '0' : '1';
 document.getElementById('byline').textContent = merged ? pageCopy({en:"Ada · merged claude’s proposal just now",ko:"Ada · 방금 claude의 제안을 반영",de:"Ada · claudes Vorschlag gerade gemergt",ja:"Ada・たった今 claude の提案をマージ",fr:"Ada · proposition de claude fusionnée à l’instant"}) : pageCopy({en:"Ada · updated today",ko:"Ada · 오늘 수정",de:"Ada · heute aktualisiert",ja:"Ada・本日更新",fr:"Ada · mis à jour aujourd’hui"});
 document.getElementById('demo-status').textContent = merged ? pageCopy({en:"✓ One line added. One commit.",ko:"✓ 추가된 한 줄. 커밋 하나.",de:"✓ Eine Zeile mehr. Ein Commit.",ja:"✓ 1行追加、コミットは1つ",fr:"✓ Une ligne ajoutée. Un commit."}) : pageCopy({en:"Interactive example · try Merge",ko:"작동 예시 · 제안을 반영해 보세요",de:"Interaktives Beispiel · Mergen testen",ja:"操作できる例・マージしてみてください",fr:"Exemple interactif · essayez Fusionner"});
 merge.textContent = merged ? pageCopy({en:"Merged ✓",ko:"반영됨 ✓",de:"Gemergt ✓",ja:"マージ済み ✓",fr:"Fusionné ✓"}) : pageCopy({en:"Merge proposal",ko:"제안 반영",de:"Vorschlag mergen",ja:"提案をマージ",fr:"Fusionner"});
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
   flight.textContent=pageCopy({en:"Give the next person a place to start.",ko:"다음 사람이 시작할 자리를 남깁니다.",de:"Der nächsten Person einen Startpunkt geben.",ja:"次の人が始められる場所を残します。",fr:"Donnez un point de départ à la personne suivante."});
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
 const status={ada:pageCopy({en:"Ada owns this workspace. All four pages are visible.",ko:"소유자인 Ada에게는 페이지 네 개가 모두 보입니다.",de:"Ada besitzt diesen Workspace. Alle vier Seiten sind sichtbar.",ja:"Ada はこのワークスペースの所有者です。4つのページがすべて見えます。",fr:"Ada est propriétaire de cet espace. Les quatre pages sont visibles."}),remy:pageCopy({en:"Remy sees three pages. Ada’s private note is absent.",ko:"Remy에게는 페이지 세 개가 보입니다. Ada의 비공개 메모는 보이지 않습니다.",de:"Remy sieht drei Seiten. Adas private Notiz fehlt.",ja:"Remy には3つのページが見えます。Ada の非公開メモは見えません。",fr:"Remy voit trois pages. La note privée d’Ada est absente."}),agent:pageCopy({en:"The agent sees two pages. Planning and private notes are absent.",ko:"에이전트에게는 페이지 두 개가 보입니다. 계획과 비공개 메모는 보이지 않습니다.",de:"Der Agent sieht zwei Seiten. Planung und private Notizen fehlen.",ja:"エージェントには2つのページが見えます。計画と非公開のメモは表示されません。",fr:"L’agent voit deux pages. Planification et notes privées sont absentes."})};
 identities.forEach(button=>button.addEventListener('click',()=>{
  const person=button.dataset.person;
  identities.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  let count=0;
  pages.forEach((page,index)=>{
   const visible=page.dataset.access.split(' ').includes(person);
   page.hidden=!visible;
   if(visible){count++;if(!reduceMotion.matches){page.getAnimations().forEach(a=>a.cancel());page.animate([{opacity:.1,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,delay:index*35,fill:'backwards'});}}
  });
  document.getElementById('visible-count').textContent=pageCopy({
   en:`${count} visible`,ko:`${count}개 표시`,de:`${count} sichtbar`,ja:`${count}件表示`,fr:`${count} visibles`});
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

// Hand over the one command. Revealing it is the feature; copying it is a
// bonus. A clipboard write can fail (permissions, an insecure context, a
// browser that simply says no) and a button whose only behaviour is an
// invisible write has no honest failure state, so the command is always put
// on screen where it can be read and selected by hand.
const agentCta = document.getElementById("agent-cta");
const agentCommand = document.getElementById("agent-command");
const agentNote = document.getElementById("agent-command-note");
if (agentCta && agentCommand) {
  let copyTimer;
  agentCta.addEventListener("click", async () => {
    clearTimeout(copyTimer);
    if (agentCommand.hidden) {
      agentCommand.hidden = false;
      // It was a disclosure for exactly one click. It is a copy button now, and
      // claiming "expanded" forever, with no way back, would be a lie.
      agentCta.removeAttribute("aria-expanded");
      agentCta.removeAttribute("aria-controls");
      agentCta.textContent = pageCopy({en:"Copy command",ko:"명령어 복사",de:"Kopieren",ja:"コマンドをコピー",fr:"Copier"});
      return;
    }
    try {
      await navigator.clipboard.writeText(document.getElementById("agent-command-text").textContent);
      agentNote.textContent = pageCopy({en:"Copied. Replace YOUR_TOKEN with your scoped token.",ko:"복사했습니다. YOUR_TOKEN을 발급받은 토큰으로 바꾸세요.",de:"Kopiert. YOUR_TOKEN durch Ihren begrenzten Token ersetzen.",ja:"コピーしました。YOUR_TOKEN を自分の範囲限定トークンに置き換えてください。",fr:"Copié. Remplacez YOUR_TOKEN par votre jeton limité."});
      agentCommand.classList.add("copied");
    } catch {
      agentNote.textContent = pageCopy({en:"Select the command above and copy it.",ko:"위 명령어를 선택해 복사하세요.",de:"Befehl oben markieren und kopieren.",ja:"上のコマンドを選択してコピーしてください。",fr:"Sélectionnez et copiez la commande ci-dessus."});
    }
    copyTimer = setTimeout(() => {
      agentNote.textContent = pageCopy({en:"Select the command, or press the button to copy.",ko:"명령어를 선택하거나 버튼을 눌러 복사하세요.",de:"Befehl markieren oder per Button kopieren.",ja:"コマンドを選択するか、ボタンを押してコピーしてください。",fr:"Sélectionnez la commande, ou cliquez sur le bouton."});
      agentCommand.classList.remove("copied");
    }, 2600);
  });
}

// Pause the decorative miniature offscreen and while the page is hidden.
(()=>{
 const mini=document.querySelector('.mini-hanji');if(!mini)return;
 let visible=true;
 const update=()=>mini.classList.toggle('is-paused',!visible||document.hidden);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:.1}).observe(mini);
 document.addEventListener('visibilitychange',update);
})();

// A small pointer-following tilt, limited to fine pointers and motion-enabled users.
(()=>{
 const scene=document.querySelector('.mini-hanji'),win=scene?.querySelector('.mini-window');if(!win)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const reset=()=>{for(const property of ['--tilt-x','--tilt-y','--edge-right','--edge-bottom'])win.style.removeProperty(property);};
 scene.addEventListener('pointermove',e=>{if(motion.matches||!fine.matches)return;const r=scene.getBoundingClientRect();const x=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)),y=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));win.style.setProperty('--tilt-y',`${x*10}deg`);win.style.setProperty('--tilt-x',`${-y*8}deg`);win.style.setProperty('--edge-right',`${4-x*6}px`);win.style.setProperty('--edge-bottom',`${5-y*6}px`);});
 scene.addEventListener('pointerleave',reset);motion.addEventListener('change',reset);fine.addEventListener('change',reset);
})();

/* Theme. Three choices, System by default, remembered per reader. The resolved
   theme lands on data-theme; the choice itself lands on data-theme-choice, so
   System keeps following the system after a reload instead of freezing into
   whichever value it happened to resolve to. A copy of the first two lines runs
   inline in <head> so the page never paints the wrong theme first. */
const THEME_KEY = "hanji-theme";
const THEMES = ["light", "dark", "system"];
const darkQuery = matchMedia("(prefers-color-scheme: dark)");
const themeInputs = [...document.querySelectorAll('.theme-switch input[name="theme"]')];
let themeChoice = "system";
try {
 const stored = localStorage.getItem(THEME_KEY);
 if (THEMES.includes(stored)) themeChoice = stored;   // a foreign or stale value is not a theme
} catch { /* private mode */ }

function applyTheme(choice) {
 const root = document.documentElement;
 root.dataset.theme = choice === "system" ? (darkQuery.matches ? "dark" : "light") : choice;
 root.dataset.themeChoice = choice;
 themeInputs.forEach(i => { i.checked = i.value === choice; });
 const bar = document.querySelector('meta[name="theme-color"]');
 if (bar) bar.setAttribute("content", root.dataset.theme === "dark" ? "#121715" : "#f9faf6");
}
applyTheme(themeChoice);
themeInputs.forEach(input => input.addEventListener("change", () => {
 if (!input.checked) return;
 themeChoice = input.value;
 try { localStorage.setItem(THEME_KEY, themeChoice); } catch { /* private mode */ }
 applyTheme(themeChoice);
}));
darkQuery.addEventListener("change", () => { if (themeChoice === "system") applyTheme("system"); });

/* The picker closes the way a menu is expected to: Escape, or a click outside.
   <details> gives us the rest, including the keyboard, for nothing. */
const langPicker = document.querySelector(".lang-picker");
if (langPicker) {
 document.addEventListener("click", event => {
  if (langPicker.open && !langPicker.contains(event.target)) langPicker.open = false;
 });
 document.addEventListener("keydown", event => {
  if (event.key === "Escape" && langPicker.open) {
   langPicker.open = false;
   langPicker.querySelector("summary").focus();
  }
 });
 // Tabbing past the last language used to leave a 196px menu open over the page.
 langPicker.addEventListener("focusout", event => {
  if (langPicker.open && !langPicker.contains(event.relatedTarget)) langPicker.open = false;
 });
}
