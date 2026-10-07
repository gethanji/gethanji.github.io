import {navigateClick} from './navigation-helpers.mjs';
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml'};
const server=createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),file=path.join(process.cwd(),'dist',decodeURIComponent(u.pathname),u.pathname.endsWith('/')?'index.html':'');try{const body=readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const executablePath=process.env.BROWSER_EXECUTABLE||['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync);
assert(executablePath,'Set BROWSER_EXECUTABLE to an installed Chrome/Chromium.');
const browser=await puppeteer.launch({executablePath,headless:true});
const p=await browser.newPage();const errors=[],missing=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)missing.push(r.url());});
const go=route=>p.goto(origin+route,{waitUntil:'load'}),wait=ms=>new Promise(r=>setTimeout(r,ms));
const langs=['en','ko','de','ja','fr'],pages=['lab','knowledge','tracker'];
const route=(l,page)=>l==='en'?(page==='lab'?'/':`/projects/${page}/`):page==='lab'?`/${l}/lab/`:`/${l}/projects/${page}/`;
const out=process.env.QA_OUTPUT||'test-results';mkdirSync(out,{recursive:true});
try {
 await p.setViewport({width:1366,height:900});
 await p.evaluateOnNewDocument(()=>{
  window.__heroStarts=[];
  addEventListener('pagereveal',event=>window.__nativeTransition=!!event.viewTransition);
  document.addEventListener('animationstart',event=>{if(event.target.matches('.hero h1'))window.__heroStarts.push(event.animationName);},true);
 });
 // Delay the enhancement beyond first paint: CSS must not play then rewind,
 // and showing the controls must not resize or move the paper.
 let held;
 await p.setRequestInterception(true);
 p.on('request',request=>{
  if(request.url().includes('/KnowledgeHero.')&&!held)held=request;
  else request.continue();
 });
 const loading=go('/projects/knowledge/');
 await p.waitForSelector('.mini-window');
 await p.waitForFunction(()=>document.fonts.status==='loaded');
 await wait(1000);
 const initial=await p.$eval('.mini-hanji',e=>({height:e.getBoundingClientRect().height,animations:e.getAnimations({subtree:true}).filter(a=>a instanceof CSSAnimation).map(a=>({time:a.currentTime,state:a.playState}))}));
 assert(initial.animations.length>0,'The original CSS fallback is present');
 assert(initial.animations.every(a=>a.state==='paused'&&a.time===0),'CSS waits at frame zero for enhancement');
 await wait(200);
 assert(await p.$eval('.mini-hanji',e=>e.getAnimations({subtree:true}).filter(a=>a instanceof CSSAnimation).every(a=>a.currentTime===0)));
 assert(held,'Knowledge enhancement request was held');await held.continue();await loading;
 await p.waitForFunction(()=>document.querySelector('.mini-hanji').dataset.running==='true');
 assert(Math.abs((await p.$eval('.mini-hanji',e=>e.getBoundingClientRect().height))-initial.height)<1,'Controls reserve their space before enhancement');
 assert.deepEqual(await p.evaluate(()=>window.__heroStarts),['editorial-reveal'],'One entrance across delayed enhancement');
 await p.evaluate(()=>{
  window.__labelMutations=0;
  new MutationObserver(records=>window.__labelMutations+=records.length).observe(document.querySelector('[data-story-toggle]'),{childList:true,attributes:true,characterData:true,subtree:true});
 });
 await wait(450);assert((await p.evaluate(()=>window.__labelMutations))<6,'Playback does not rewrite controls every frame');
 p.removeAllListeners('request');await p.setRequestInterception(false);

 const ready=(path)=>p.waitForFunction(path=>(!path||location.pathname===path)&&document.documentElement.dataset.pageReady===location.pathname&&!document.documentElement.hasAttribute('data-astro-transition'),{},path);
 const clickRoute=async(path,selector)=>{
  await p.evaluate(()=>window.__heroStarts=[]);
  await navigateClick(p,selector||(path==='/'?'.family-brand':`.family-shortcuts a[href="${path}"]`));
  await ready(path);
 };
 await go('/');await ready();
 const prefetched=p.waitForResponse(r=>new URL(r.url()).pathname==='/projects/tracker/');
 await p.hover('.family-shortcuts a[href="/projects/tracker/"]');await prefetched;
 await p.evaluate(()=>{window.__header=document.querySelector('.site-header');window.__themeInput=document.querySelector('.theme-picker input');window.__origin=performance.timeOrigin;window.__oldScenes=[];});
 let documentRequests=0;p.on('request',r=>{if(r.isNavigationRequest()&&r.frame()===p.mainFrame())documentRequests++;});
 for(let lap=0;lap<3;lap++)for(const product of ['tracker','knowledge','lab']){
  const path=route('en',product);await clickRoute(path);
  assert(await p.evaluate(()=>window.__header===document.querySelector('.site-header')&&window.__themeInput===document.querySelector('.theme-picker input')&&window.__origin===performance.timeOrigin),'Header, controls and document persist');
  assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).animationName),'editorial-reveal');
  await wait(950);assert.deepEqual(await p.evaluate(()=>window.__heroStarts),['editorial-reveal'],'Exactly one intro on every client visit');
  assert(await p.$eval('.site-header',e=>getComputedStyle(e).backgroundColor===getComputedStyle(document.body).getPropertyValue('--color-surface').trim()||getComputedStyle(e).getPropertyValue('--color-surface').trim()===getComputedStyle(document.body).getPropertyValue('--color-surface').trim()),'Header follows the product palette');
  if(product!=='lab'){
   const scene=product==='knowledge'?'.mini-hanji':'.tracker-mini';
   await p.waitForFunction(s=>document.querySelector(s).dataset.enhanced==='true',{},scene);
   await p.click('[data-story-toggle]');assert.equal(await p.$eval(scene,e=>e.dataset.running),'false');
   await p.click('[data-story-restart]');assert.equal(await p.$eval(scene,e=>e.dataset.running),'true');
   if(product==='knowledge'){
    await p.click('#agent-cta');assert.equal(await p.$eval('#agent-command',e=>e.hidden),false);
    await p.$eval('#merge',e=>e.click());assert(await p.$eval('#merge',e=>e.disabled));await p.$eval('#reset',e=>e.click());assert(!(await p.$eval('#merge',e=>e.disabled)));
   }else{
    await p.click('[data-story-step="6"]');await p.click('[data-card="0"]');assert.equal(await p.$eval('.tracker-mini',e=>e.dataset.selected),'0');
    await p.$eval('#capture-list',e=>e.click());await p.waitForFunction(()=>document.querySelector('#capture-panel-list img').naturalWidth>0);
   }
   await p.evaluate(s=>window.__oldScenes.push(document.querySelector(s)),scene);
  }
  await p.click('.lang-picker summary');assert(await p.$eval('.lang-picker',e=>e.open));await p.keyboard.press('Escape');
  await p.click('.theme-picker summary');assert(await p.$eval('.theme-picker',e=>e.open));await p.keyboard.press('Escape');
 }
 assert.equal(documentRequests,0,'No document reloads while moving between pages');
 const stopped=await p.evaluate(()=>window.__oldScenes.map(e=>({connected:e.isConnected,time:e.dataset.playhead,animations:e.getAnimations({subtree:true}).length})));
 await wait(200);assert.deepEqual(await p.evaluate(()=>window.__oldScenes.map(e=>({connected:e.isConnected,time:e.dataset.playhead,animations:e.getAnimations({subtree:true}).length}))),stopped,'Discarded demos stop updating');
 assert(stopped.every(e=>!e.connected&&e.animations===0));
 // The form must submit once per visit after repeated client navigation.
 let posts=0;await p.setRequestInterception(true);
 const mock=request=>{
  if(new URL(request.url()).hostname!=='formsubmit.co')return request.continue();
  const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Accept','Content-Type':'application/json'};
  if(request.method()==='OPTIONS')return request.respond({status:204,headers});
  posts++;return request.respond({status:200,headers,body:JSON.stringify({success:true})});
 };p.on('request',mock);
 for(let i=0;i<2;i++){
  await clickRoute('/projects/knowledge/');
  await p.type('#access-knowledge-name','Navigation QA');await p.type('#access-knowledge-email','qa@example.test');await p.type('#access-knowledge-message','Testing the client navigation lifecycle.');
  await p.$eval('[data-access-form]',form=>form.requestSubmit());await p.waitForSelector('.access-result[data-state="success"]');
  assert.equal(posts,i+1,'Exactly one mocked submission per visit');await clickRoute('/projects/tracker/');
 }
 p.off('request',mock);await p.setRequestInterception(false);
 // A persisted header must also acquire each destination's labels and links.
 await clickRoute('/projects/knowledge/');
 await p.click('.theme-picker summary');await p.click('.theme-row:has(input[value="dark"])');await p.keyboard.press('Escape');
 await p.click('.lang-picker summary');await clickRoute('/fr/projects/knowledge/','[data-language="fr"]');
 assert.equal(await p.$eval('html',e=>e.lang),'fr');assert.equal(await p.$eval('html',e=>e.dataset.theme),'dark');
 assert.equal(await p.$eval('.family-brand',e=>new URL(e.href).pathname),'/fr/lab/');
 assert((await p.$eval('.theme-picker summary',e=>e.getAttribute('aria-label'))).length>0);
 assert(await p.evaluate(()=>window.__header===document.querySelector('.site-header')));
 await clickRoute('/fr/projects/tracker/');
 await p.goBack();await ready('/fr/projects/knowledge/');assert.equal(new URL(p.url()).pathname,'/fr/projects/knowledge/');assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).animationName),'none');
 await p.goForward();await ready('/fr/projects/tracker/');assert.equal(new URL(p.url()).pathname,'/fr/projects/tracker/');
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await clickRoute('/fr/projects/knowledge/');assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).animationName),'none');
 assert.equal(await p.$eval('.mini-hanji',e=>e.dataset.running),'false');
 // Browser without the View Transition API still uses Astro's swap fallback.
 const fallbackContext=await browser.createBrowserContext();const fallback=await fallbackContext.newPage();await fallback.evaluateOnNewDocument(()=>{document.startViewTransition=undefined;});
 await fallback.goto(origin);await fallback.waitForFunction(()=>document.documentElement.dataset.pageReady===location.pathname);
 await fallback.evaluate(()=>window.__header=document.querySelector('.site-header'));
 await navigateClick(fallback,'.family-shortcuts a[href="/projects/knowledge/"]');
 await fallback.waitForFunction(()=>document.querySelector('.mini-hanji')?.dataset.enhanced==='true');assert(await fallback.evaluate(()=>window.__header===document.querySelector('.site-header')));await fallbackContext.close();
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log('PASS: persistent document/header/controls, product palette, one intro per visit, repeated demos, disposal, language/theme/history/reduced motion and no-View-Transition fallback');
}finally{await browser.close();await new Promise(r=>server.close(r));}
