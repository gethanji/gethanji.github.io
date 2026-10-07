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
 // Intent prefetch, real document navigation, controls and history still work.
 await go('/');
 const prefetched=p.waitForResponse(r=>new URL(r.url()).pathname==='/projects/tracker/');
 await p.hover('.family-shortcuts a[href="/projects/tracker/"]');await prefetched;
 await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.click('.family-shortcuts a[href="/projects/tracker/"]')]);
 assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).animationName),'none','Navigation does not replay the page entrance');
 assert.equal(await p.evaluate(()=>window.__nativeTransition),false,'Navigation must not overlay old and new page snapshots');
 await p.waitForFunction(()=>document.querySelector('.tracker-mini').dataset.running==='true');
 await p.click('[data-story-toggle]');assert.equal(await p.$eval('.tracker-mini',e=>e.dataset.running),'false');
 assert.equal(await p.$eval('#capture-panel-list img',e=>e.complete),false,'Hidden screenshots are deferred');
 await p.click('#capture-list');await p.waitForFunction(()=>document.querySelector('#capture-panel-list img').naturalWidth>0);
 await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.click('.family-shortcuts a[href="/projects/knowledge/"]')]);
 assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).animationName),'none');
 await p.click('[data-story-toggle]');await p.click('[data-story-restart]');
 assert.equal(await p.$eval('.mini-hanji',e=>e.dataset.running),'true');
 await p.goBack({waitUntil:'load'});assert.equal(new URL(p.url()).pathname,'/projects/tracker/');
 await p.click('.theme-picker summary');assert(await p.$eval('.theme-picker',e=>e.open));
 await p.goForward({waitUntil:'load'});assert.equal(new URL(p.url()).pathname,'/projects/knowledge/');
 await p.click('[data-story-restart]');assert.equal(await p.$eval('.mini-hanji',e=>e.dataset.running),'true');
 // Real link clicks: header stays identical from the first rendered frame,
 // without masking the result behind a transition-settling delay.
 const header=()=>p.$eval('.site-header',e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect(),mark=getComputedStyle(e.querySelector('.family-brand>span'));return {bg:s.backgroundColor,color:s.color,border:s.borderBottomColor,height:r.height,width:r.width,mark:mark.backgroundColor};});
 for(const width of [1366,390])for(const theme of ['light','dark']){
  await p.setViewport({width,height:900});
  await p.evaluate(theme=>localStorage.setItem('hanji-theme',theme),theme);
  await go('/');const expected=await header();
  for(const path of ['/projects/knowledge/','/projects/tracker/','/']){
   const selector=path==='/'?'.family-brand':`.family-shortcuts a[href="${path}"]`;
   await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.click(selector)]);
   assert.equal(await p.evaluate(()=>window.__nativeTransition),false);
   assert.deepEqual(await header(),expected,`${width}/${theme}/${path} header palette and geometry`);
   assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).animationName),'none');
   const frames=await p.evaluate(()=>new Promise(resolve=>{
    const frames=[];function sample(){const h=document.querySelector('.site-header'),s=getComputedStyle(h);frames.push({opacity:s.opacity,bg:s.backgroundColor,overlap:document.documentElement.matches(':active-view-transition')});if(frames.length<12)requestAnimationFrame(sample);else resolve(frames);}requestAnimationFrame(sample);
   }));
   assert(frames.every(f=>f.opacity==='1'&&f.bg===expected.bg&&!f.overlap),'No header fade, recoloring or overlapping page snapshots');
  }
 }
 for(const product of pages){
  await go(route('en',product));
  const imports=await p.evaluate(()=>[...document.styleSheets].flatMap(s=>[...s.cssRules]).filter(r=>r instanceof CSSImportRule).length);
  assert.equal(imports,0,'No runtime stylesheet import waterfall');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log('PASS: delayed Knowledge enhancement has one entrance and stable geometry; low control churn, intent prefetch, snapshot-free navigation, neutral header in both themes, lazy screenshots and history interactions verified');
}finally{await browser.close();await new Promise(r=>server.close(r));}
