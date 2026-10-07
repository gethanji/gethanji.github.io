import {onPage,type PageScope} from './page-lifecycle';
/** Extracted from Knowledge's original miniature. One handler and one coordinate
 * system for both paper panels. Only the outer paper tilts; story elements own
 * their own motion. Keyboard, coarse pointers and reduced motion reset the pose.
 */
export function paperTilt(scene: HTMLElement, paper: HTMLElement, scope:PageScope) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const reset=()=>{for(const name of ['--tilt-x','--tilt-y','--edge-right','--edge-bottom'])paper.style.removeProperty(name);};
  scope.listen(scene,'pointermove',event=>{
    if(reduced.matches||!fine.matches||event.pointerType==='touch')return;
    const r=scene.getBoundingClientRect();
    const x=Math.max(-.5,Math.min(.5,(event.clientX-r.left)/r.width-.5));
    const y=Math.max(-.5,Math.min(.5,(event.clientY-r.top)/r.height-.5));
    paper.style.setProperty('--tilt-y',`${x*10}deg`);
    paper.style.setProperty('--tilt-x',`${-y*8}deg`);
    paper.style.setProperty('--edge-right',`${4-x*6}px`);
    paper.style.setProperty('--edge-bottom',`${5-y*6}px`);
  });
  scope.listen(scene,'pointerleave',reset);
  scope.listen(scene,'focusin',reset);
  scope.listen(document,'keydown',event=>{if(event.key==='Tab')reset();});
  scope.listen(document,'visibilitychange',()=>{if(document.hidden)reset();});
  scope.listen(reduced,'change',reset);scope.listen(fine,'change',reset);
  return reset;
}
onPage(scope=>{
for(const scene of document.querySelectorAll<HTMLElement>('.mini-hanji,.tracker-mini')){
 const paper=scene.querySelector<HTMLElement>('.mini-window,.tracker-mini-window');
 if(paper)paperTilt(scene,paper,scope);
}

});
