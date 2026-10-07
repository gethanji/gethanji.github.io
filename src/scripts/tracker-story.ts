import {onPage} from './page-lifecycle';

 import {timeline,motionTrack} from './timeline';
onPage(scope=>{
 for(const root of document.querySelectorAll<HTMLElement>('.tracker-mini')){
  const t=JSON.parse(root.querySelector('[data-story-copy]')!.textContent!);
  const q=(s:string)=>root.querySelector<HTMLElement>(s)!;
  const total=14000,easing=getComputedStyle(root).getPropertyValue('--ease-standard').trim();
  const cards=[...root.querySelectorAll<HTMLButtonElement>('[data-card]')],panels=[...root.querySelectorAll<HTMLElement>('[data-task-chat]')];
  let selected=1;
  const project=q('.tm-project'),scene=q('.tracker-mini-window'),svg=scene.querySelector<SVGSVGElement>('.tm-links')!,edge=svg.querySelector('path')!,slot=q('.tm-chat-slot');
  function point(el:HTMLElement){let x=0,y=0;for(let n:HTMLElement|null=el;n&&n!==scene;n=n.offsetParent as HTMLElement|null){x+=n.offsetLeft;y+=n.offsetTop;}return{x,y};}
  function connect(){
   svg.setAttribute('viewBox',`0 0 ${scene.clientWidth} ${scene.clientHeight}`);
   const flow=project.querySelector<SVGSVGElement>('.tm-flow')!;
   flow.setAttribute('viewBox',`0 0 ${project.clientWidth} ${project.clientHeight}`);
   flow.querySelectorAll<SVGPathElement>('.tm-flow-edge').forEach(path=>{
    const a=cards[Number(path.dataset.from)],b=cards[Number(path.dataset.to)],x1=a.offsetLeft+a.offsetWidth+2,y1=a.offsetTop+a.offsetHeight/2,x2=b.offsetLeft-4,y2=b.offsetTop+b.offsetHeight/2;
    path.setAttribute('d',`M${x1} ${y1} C${(x1+x2)/2} ${y1} ${(x1+x2)/2} ${y2} ${x2} ${y2}`);
   });
   if(selected<0){edge.setAttribute('d','');return;}
   const card=cards[selected],from=point(card),to=point(slot),x=from.x+card.offsetWidth/2,y=from.y,endX=to.x+15,endY=to.y+slot.offsetHeight;
   edge.setAttribute('d',`M${x} ${y} C${x} ${y-15} ${endX} ${endY+12} ${endX} ${endY}`);
  }
  function select(next:number,focus=false){
   selected=next;root.dataset.selected=String(next);
   cards.forEach((card,i)=>card.setAttribute('aria-expanded',String(i===next)));
   panels.forEach((panel,i)=>panel.hidden=i!==next);connect();
   if(focus&&next>=0)panels[next].querySelector<HTMLElement>('h3')!.focus({preventScroll:true});
  }
  const resize=new ResizeObserver(connect);scope.disposeWith(()=>resize.disconnect());[scene,project,...cards,slot].forEach(el=>resize.observe(el));
  const tracks:Animation[]=[];
  function reveal(el:Element,start:number,duration=650){tracks.push(motionTrack(el,[{at:0,opacity:0,transform:'translateY(4px)'},{at:start,opacity:0,transform:'translateY(4px)'},{at:start+duration,opacity:1,transform:'translateY(0)'},{at:total,opacity:1,transform:'translateY(0)'}],total,easing));}
  reveal(q('.tm-flow'),4900);
  root.querySelectorAll('.tm-builder').forEach((el,i)=>tracks.push(motionTrack(el,[{at:0,opacity:0,left:'50%',top:'18%'},{at:3100+i*250,opacity:0,left:'50%',top:'18%'},{at:3900+i*250,opacity:1,left:i?'77%':'24%',top:i?'62%':'45%'},{at:4900+i*250,opacity:1,left:i?'78%':'25%',top:i?'64%':'47%'},{at:5600,opacity:0,left:i?'78%':'25%',top:i?'64%':'47%'},{at:total,opacity:0,left:i?'78%':'25%',top:i?'64%':'47%'}],total,easing)));
  tracks.push(motionTrack(q('.tm-cursor'),[{at:0,opacity:0,left:'15%',top:'72%'},{at:5100,opacity:0,left:'15%',top:'72%'},{at:5900,opacity:1,left:'47%',top:'18%'},{at:6800,opacity:1,left:'48%',top:'20%'},{at:7300,opacity:0,left:'49%',top:'21%'},{at:total,opacity:0,left:'49%',top:'21%'}],total,easing));
  reveal(q('.tm-conductor-reply'),1200);reveal(project,2400);cards.forEach((card,i)=>reveal(card,4400+i*250));
  panels.forEach(panel=>reveal(panel.querySelector('.tm-task-reply')!,9200));
  cards.forEach(card=>reveal(card.querySelector('.tm-card-result')!,11600));
  root.querySelectorAll('.tm-complete').forEach(el=>reveal(el,11600,300));
  const steps=[...root.querySelectorAll<HTMLButtonElement>('[data-story-step]')],frames=['request','project','cards','work','work','work','done'];
  const control=timeline(root,[2200,2200,2400,2400,2400,2400,0],n=>{
   root.dataset.stage=frames[n];root.dataset.context=n<3?'workspace':'task';root.dataset.focus=n===0?'chat':n===3||n===4?'task':'canvas';
   cards.forEach((card,i)=>{card.disabled=n<2;card.dataset.reviewed=String(i===1&&n>=5);});select(n<3?-1:1);
   steps.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.storyStep)===(n>=3&&n<=5?3:n))));
  },(running,n,resumed)=>{const button=q('[data-story-toggle]'),text=running?t.pause:n===6?t.replay:resumed?t.resume:t.play;if(button.textContent!==text)button.textContent=text;button.setAttribute('aria-pressed',String(running));},tracks,{loop:true,hold:2400});
  scope.disposeWith(()=>{control.dispose();tracks.forEach(a=>a.cancel());});
  cards.forEach((card,i)=>card.addEventListener('click',()=>{control.choose(6);cards.forEach((c,j)=>c.dataset.reviewed=String(i===j));select(i,true);root.dataset.focus='task';}));
  // Keep keyboard targets present while someone explores the canvas. Playback
  // controls remain explicit commands, so focusing Pause must not toggle twice.
  root.addEventListener('focusin',event=>{
   const target=event.target as Element;
   if(!target.closest('[data-card],[data-task-chat]'))return;
   control.pause();
   // A card can receive Tab while its entrance is still transparent. Settle
   // the canvas before pausing, without opening an unrelated task window.
   if(target.closest('[data-card]')&&Number(root.dataset.playhead)<6800){
    control.choose(3);select(-1);root.dataset.focus='canvas';
   }
  });
  function dismiss(){const previous=selected;control.pause();select(-1);root.dataset.focus='canvas';if(previous>=0)cards[previous].focus({preventScroll:true});}
  root.querySelectorAll('[data-close-task]').forEach(button=>button.addEventListener('click',dismiss));
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected>=0){e.preventDefault();dismiss();}});
  steps.forEach(b=>b.addEventListener('click',()=>{control.choose(Number(b.dataset.storyStep),700);select(Number(b.dataset.storyStep)<3?-1:1);}));
  q('[data-story-toggle]').addEventListener('click',control.toggle);
  q('[data-story-restart]').addEventListener('click',()=>{control.choose(0);select(-1);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)control.play();else{control.choose(6);select(1);}});
 }

});
