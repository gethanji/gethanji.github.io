import {onPage} from './page-lifecycle';
import {timeline} from './timeline';
onPage(scope=>{
// Reuse the original CSS keyframes, including the click ring. Controls own time;
// neither the illustration's drawing nor its easing is reimplemented here.
const definitions=new Map<string,Keyframe[]>();
function readRules(rules:CSSRuleList){for(const rule of rules){
 if(rule instanceof CSSImportRule&&rule.styleSheet)readRules(rule.styleSheet.cssRules);
 else if(rule instanceof CSSKeyframesRule){
  const frames:Keyframe[]=[];
  for(const frame of rule.cssRules as unknown as CSSKeyframeRule[]){
   const properties:Record<string,string>={};
   for(const name of frame.style)properties[name.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=frame.style.getPropertyValue(name);
   for(const key of frame.keyText.split(','))frames.push({...properties,offset:key.trim()==='from'?0:key.trim()==='to'?1:parseFloat(key)/100});
  }
  definitions.set(rule.name,frames.sort((a,b)=>(a.offset??0)-(b.offset??0)));
 }else if('cssRules' in rule)readRules((rule as CSSGroupingRule).cssRules);
}}
for(const sheet of document.styleSheets){try{readRules(sheet.cssRules);}catch{/* Only this site's same-origin editorial rules are needed. */}}
const specs=[
 ['.mini-written.line-one','family-line-one','linear'],['.mini-written.line-two','family-line-two','linear'],
 ['.mini-proposed','family-proposal','ease'],
 ['.mini-add.add-one i','mini-check-one','linear'],['.mini-add.add-two i','mini-check-two','linear'],['.mini-reviewed','mini-check-two','ease'],
 ['.mini-merge','mini-merge-click','ease'],['.merge-before','mini-merge-before','linear'],['.merge-after','mini-merge-after','linear'],
 ['.mini-merge','mini-click-ring','ease-out','::after'],
 ['.cursor-ada','cursor-ada','cubic-bezier(.45,0,.2,1)'],['.cursor-claude','cursor-claude','cubic-bezier(.45,0,.2,1)'],['.cursor-codex','cursor-codex','cubic-bezier(.45,0,.2,1)'],
];
for(const root of document.querySelectorAll<HTMLElement>('.mini-hanji')){
 const t=JSON.parse(root.querySelector('[data-knowledge-controls]')!.textContent!);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(specs.some(([,name])=>!definitions.has(name)))continue;
 root.dataset.managedMotion='true';
 const duration=5600,animations:Animation[]=[];
 for(const [selector,name,easing,pseudoElement] of specs){
  const el=root.querySelector(selector)!;
  const animation=el.animate(definitions.get(name)!.map(frame=>({...frame,easing})),{duration,easing:'linear',fill:'both',...(pseudoElement?{pseudoElement}:{})});
  animation.pause();animations.push(animation);
 }
 // The original last 6% fades for looping. Reduced motion settles on the
 // completed scene (90%), and manual dots show discrete, motionless snapshots.
 const clock={set currentTime(value:CSSNumberish|null){const time=Number(value??0);animations.forEach(a=>a.currentTime=reduced.matches&&time>=duration?5040:time);}};
 const steps=[...root.querySelectorAll<HTMLButtonElement>('[data-story-step]')];
 const starts=[0,1568,2968,4424,4648],samples=[1120,2700,4000,4592,5040];
 const control=timeline(root,[1568,1400,1456,224,952,0],n=>{
  root.dataset.stage=['write','propose','review','merge','complete','complete'][n];
  steps.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.storyStep)===Math.min(n,4))));
 },(running,n,resumed)=>{
  const button=root.querySelector<HTMLButtonElement>('[data-story-toggle]')!;
  const text=running?t.pause:n>=5?t.replay:resumed?t.resume:t.play;
  if(button.textContent!==text)button.textContent=text;
  if(button.getAttribute('aria-pressed')!==String(running))button.setAttribute('aria-pressed',String(running));
 },[clock],{loop:true,hold:0});
 scope.disposeWith(()=>{control.dispose();animations.forEach(a=>a.cancel());});
 steps.forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.storyStep!;control.choose(n,samples[n]-starts[n]);}));
 root.querySelector('[data-story-toggle]')!.addEventListener('click',control.toggle);
 root.querySelector('[data-story-restart]')!.addEventListener('click',()=>{if(reduced.matches)control.choose(5);else{control.choose(0);control.play();}});
}

});
