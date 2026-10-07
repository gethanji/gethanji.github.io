import type {TransitionBeforeSwapEvent} from 'astro:transitions/client';
// Keep the header and its controls alive; synchronize only destination content.
function sync(current:Element,next:Element) {
 for(const attr of [...current.attributes])if(!next.hasAttribute(attr.name))current.removeAttribute(attr.name);
 for(const attr of [...next.attributes])if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);
 const old=[...current.childNodes],fresh=[...next.childNodes];
 for(let i=0;i<Math.max(old.length,fresh.length);i++){
  const a=old[i],b=fresh[i];
  if(!b){a.remove();continue;}if(!a){current.append(b.cloneNode(true));continue;}
  if(a instanceof Element&&b instanceof Element&&a.tagName===b.tagName)sync(a,b);
  else if(!(a instanceof Element)&&!(b instanceof Element)&&a.nodeType===b.nodeType){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;}
  else a.replaceWith(b.cloneNode(true));
 }
}
document.addEventListener('astro:before-swap',((event:TransitionBeforeSwapEvent)=>{
 // Use Astro for routing and persistence, with no old/new snapshot crossfade.
 event.viewTransition.ready.catch(()=>{});
 event.viewTransition.skipTransition();
 const next=event.newDocument.documentElement,current=document.documentElement;
 next.dataset.js='true';
 next.dataset.theme=current.dataset.theme!;
 next.dataset.themeChoice=current.dataset.themeChoice!;
 if(event.to.hash||event.navigationType==='traverse')next.dataset.entryStatic='true';
 else delete next.dataset.entryStatic;
 const header=document.querySelector('.site-header'),incoming=event.newDocument.querySelector('.site-header');
 if(header&&incoming)sync(header,incoming);
 document.querySelector('#main')?.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
}) as EventListener);
document.addEventListener('astro:page-load',()=>{document.documentElement.dataset.pageReady=location.pathname;});
