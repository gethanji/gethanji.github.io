/** One playhead drives the whole illustration, including in-between motion.
 * Animations remain paused WAAPI objects: time, visibility and reader controls
 * have one owner. Seeking/pausing never rebuilds elements or restarts keyframes.
 */
export function timeline(root: HTMLElement, durations: number[], render: (index: number) => void, label: (running: boolean,index: number,resumed: boolean)=>void, tracks: Array<Pick<Animation,'currentTime'>> = [], options: {loop?:boolean;hold?:number} = {}) {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const starts=durations.map((_,i)=>durations.slice(0,i).reduce((a,b)=>a+b,0));
 const total=starts.at(-1)!;
 let time=reduced.matches?total:0,index=-1,frame=0,last=0,initiated=false,holdTime=0,cycles=0;
 function paint(){
  tracks.forEach(a=>{a.currentTime=time;});
  const next=time>=total?durations.length-1:starts.findLastIndex(n=>n<=time);
  if(next!==index){index=next;render(index);}
  root.dataset.playhead=String(Math.round(time));
  root.dataset.resetting=String(!!frame&&!!options.loop&&time>=total&&holdTime>1800);
  root.dataset.running=String(!!frame);
  label(!!frame,index,time>starts[index]);
 }
 function tick(now:number){
  const delta=now-last;last=now;
  if(time>=total&&options.loop&&!reduced.matches){
   holdTime+=delta;
   if(holdTime>=(options.hold??2200)){time=0;holdTime=0;index=-1;root.dataset.cycles=String(++cycles);}
  }else time=Math.min(total,time+delta);
  if(time<total||(options.loop&&!reduced.matches))frame=requestAnimationFrame(tick);else frame=0;
  paint();
 }
 function pause(){if(frame){cancelAnimationFrame(frame);frame=0;}paint();}
 function choose(next:number,offset=0){pause();initiated=true;holdTime=0;time=Math.min(total,starts[next]+offset);paint();}
 function play(){if(reduced.matches){choose(durations.length-1);return;}if(frame)return;initiated=true;if(time>=total){time=0;holdTime=0;}last=performance.now();frame=requestAnimationFrame(tick);paint();}
 function toggle(){frame?pause():play();}
 root.addEventListener('keydown',e=>{if(e.key==='Escape')pause();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 reduced.addEventListener('change',()=>{pause();if(reduced.matches)choose(durations.length-1);});
 if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)pause();else if(!initiated&&!reduced.matches&&!document.hidden)play();},{threshold:.35}).observe(root);
 root.dataset.enhanced='true';paint();
 return{pause,play,toggle,choose};
}

/** Keyframe times use the same editorial clock; no CSS transition competes. */
export function motionTrack(element: Element, keys: Array<{at:number;[key:string]:string|number}>, duration:number, easing:string) {
 const frames=keys.map(({at,...properties})=>({...properties,offset:at/duration,easing}));
 const animation=element.animate(frames as Keyframe[],{duration,fill:'both'});
 animation.pause();return animation;
}
