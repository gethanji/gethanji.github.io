/** Every page gets one setup and one teardown, including repeat client visits. */
export function pageScope() {
 const controller=new AbortController(),disposers:Array<()=>void>=[],frames=new Set<number>(),timers=new Set<number>();
 type Events=WindowEventMap & DocumentEventMap & HTMLElementEventMap;
 return {
  signal:controller.signal,
  listen<K extends keyof Events>(target:EventTarget,type:K,listener:(event:Events[K])=>void,options:AddEventListenerOptions|boolean={}) {
   target.addEventListener(type,listener as EventListener,{...(typeof options==='boolean'?{capture:options}:options),signal:controller.signal});
  },
  disposeWith(callback:()=>void){disposers.push(callback);},
  frame(callback:FrameRequestCallback){const id=requestAnimationFrame(time=>{frames.delete(id);if(!controller.signal.aborted)callback(time);});frames.add(id);return id;},
  timeout(callback:()=>void,delay:number){const id=window.setTimeout(()=>{timers.delete(id);if(!controller.signal.aborted)callback();},delay);timers.add(id);return id;},
  dispose(){controller.abort();frames.forEach(cancelAnimationFrame);timers.forEach(clearTimeout);disposers.splice(0).forEach(fn=>fn());},
 };
}
export type PageScope=ReturnType<typeof pageScope>;
export function onPage(setup:(scope:PageScope)=>void) {
 let mounted:Element|null=null,scope:PageScope|undefined;
 const mount=()=>{const main=document.querySelector('#main');if(!main||mounted===main)return;scope?.dispose();mounted=main;scope=pageScope();setup(scope);};
 document.addEventListener('astro:before-swap',()=>{scope?.dispose();scope=undefined;mounted=null;});
 document.addEventListener('astro:page-load',mount);
 mount();
}
