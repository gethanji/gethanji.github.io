import {pageScope} from './page-lifecycle';
/** One playhead drives the whole illustration, including in-between motion.
 * Animations remain paused WAAPI objects: time, visibility and reader controls
 * have one owner. Seeking/pausing never rebuilds elements or restarts keyframes.
 */
export function timeline(root: HTMLElement, durations: number[], render: (index: number) => void, label: (running: boolean,index: number,resumed: boolean)=>void, tracks: Array<Pick<Animation,'currentTime'>> = [], options: {loop?:boolean;hold?:number} = {}) {
 const scope=pageScope();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const starts=durations.map((_,i)=>durations.slice(0,i).reduce((a,b)=>a+b,0));
 const total=starts.at(-1)!;
 let labelState='';
 let time=reduced.matches?total:0,index=-1,frame=0,last=0,initiated=false,holdTime=0,cycles=0;
 function paint(){
  tracks.forEach(a=>{a.currentTime=time;});
  const next=time>=total?durations.length-1:starts.findLastIndex(n=>n<=time);
  if(next!==index){index=next;render(index);}
  root.dataset.playhead=String(Math.round(time));
  const resetting=String(!!frame&&!!options.loop&&time>=total&&holdTime>1800),running=String(!!frame);
  if(root.dataset.resetting!==resetting)root.dataset.resetting=resetting;
  if(root.dataset.running!==running)root.dataset.running=running;
  const state=`${running}:${index}:${time>starts[index]}`;
  if(state!==labelState){labelState=state;label(!!frame,index,time>starts[index]);}
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
 scope.listen(root,'keydown',e=>{if(e.key==='Escape')pause();});
 scope.listen(document,'visibilitychange',()=>{if(document.hidden)pause();});
 scope.listen(reduced,'change',()=>{pause();if(reduced.matches)choose(durations.length-1);});
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)pause();else if(!initiated&&!reduced.matches&&!document.hidden)play();},{threshold:.35});observer.observe(root);scope.disposeWith(()=>observer.disconnect());}
 root.dataset.enhanced='true';paint();
 return{pause,play,toggle,choose,dispose(){scope.dispose();if(frame)cancelAnimationFrame(frame);frame=0;}};
}

/** Keyframe times use the same editorial clock; no CSS transition competes. */
export function motionTrack(element: Element, keys: Array<{at:number;[key:string]:string|number}>, duration:number, easing:string) {
 const frames=keys.map(({at,...properties})=>({...properties,offset:at/duration,easing}));
 const animation=element.animate(frames as Keyframe[],{duration,fill:'both'});
 animation.pause();return animation;
}
