import {onPage} from './page-lifecycle';
import {timeline,motionTrack} from './timeline';

onPage(scope=>{
 for(const root of document.querySelectorAll<HTMLElement>('.think-mini')){
  const copy=JSON.parse(root.querySelector('[data-think-copy]')!.textContent!);
  const q=(selector:string)=>root.querySelector<HTMLElement>(selector)!;
  const total=8200,tracks:Animation[]=[],ease=getComputedStyle(root).getPropertyValue('--ease-standard').trim();
  const track=(selector:string,keys:Array<{at:number;[key:string]:string|number}>)=>tracks.push(motionTrack(q(selector),keys,total,ease));
  const reveal=(selector:string,start:number)=>track(selector,[{at:0,opacity:0,transform:'translateY(7px)'},{at:start,opacity:0,transform:'translateY(7px)'},{at:start+650,opacity:1,transform:'translateY(0)'},{at:total,opacity:1,transform:'translateY(0)'}]);
  reveal('.th-question',0);
  track('.th-left',[{at:0,opacity:0,left:'16%',top:'38%',transform:'rotate(-5deg)'},{at:1200,opacity:0,left:'16%',top:'38%',transform:'rotate(-5deg)'},{at:1900,opacity:1,left:'16%',top:'36%',transform:'rotate(-5deg)'},{at:3800,opacity:1,left:'16%',top:'36%',transform:'rotate(-5deg)'},{at:5100,opacity:1,left:'9%',top:'23%',transform:'rotate(0deg)'},{at:total,opacity:1,left:'9%',top:'23%',transform:'rotate(0deg)'}]);
  track('.th-right',[{at:0,opacity:0,left:'57%',top:'30%',transform:'rotate(6deg)'},{at:1750,opacity:0,left:'57%',top:'30%',transform:'rotate(6deg)'},{at:2400,opacity:1,left:'57%',top:'28%',transform:'rotate(6deg)'},{at:4000,opacity:1,left:'57%',top:'28%',transform:'rotate(6deg)'},{at:5300,opacity:1,left:'57%',top:'23%',transform:'rotate(0deg)'},{at:total,opacity:1,left:'57%',top:'23%',transform:'rotate(0deg)'}]);
  reveal('.th-group',3700);reveal('.th-links',5000);reveal('.th-tradeoff',5000);reveal('.th-test',5300);reveal('.th-decision',7400);
  track('.th-agent',[{at:0,opacity:0,left:'30%',top:'74%'},{at:3300,opacity:0,left:'30%',top:'74%'},{at:3900,opacity:1,left:'36%',top:'48%'},{at:4700,opacity:1,left:'60%',top:'40%'},{at:5600,opacity:1,left:'66%',top:'60%'},{at:6100,opacity:0,left:'69%',top:'63%'},{at:total,opacity:0,left:'69%',top:'63%'}]);
  track('.th-person',[{at:0,opacity:0,left:'86%',top:'68%'},{at:6100,opacity:0,left:'86%',top:'68%'},{at:6700,opacity:1,left:'75%',top:'49%'},{at:7300,opacity:1,left:'70%',top:'80%'},{at:8000,opacity:0,left:'73%',top:'83%'},{at:total,opacity:0,left:'73%',top:'83%'}]);
  const steps=[...root.querySelectorAll<HTMLButtonElement>('[data-story-step]')];
  const control=timeline(root,[1800,2000,2400,2000,0],index=>{
   root.dataset.stage=['request','ideas','organize','review','done'][index];
   steps.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.storyStep)===index)));
  },(running,index,resumed)=>{
   const button=q('[data-story-toggle]'),text=running?copy.pause:index===4?copy.replay:resumed?copy.resume:copy.play;
   if(button.textContent!==text)button.textContent=text;
   button.setAttribute('aria-pressed',String(running));
  },tracks,{loop:true,hold:2400});
  steps.forEach(button=>scope.listen(button,'click',()=>control.choose(Number(button.dataset.storyStep),[900,1500,2100,1900,0][Number(button.dataset.storyStep)])));
  scope.listen(q('[data-story-toggle]'),'click',control.toggle);
  scope.listen(q('[data-story-restart]'),'click',()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)control.choose(4);else{control.choose(0);control.play();}});
  scope.disposeWith(()=>{control.dispose();tracks.forEach(animation=>animation.cancel());});
 }
});
