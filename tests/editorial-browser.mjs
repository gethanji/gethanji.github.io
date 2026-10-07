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
const route=(l,page)=>l==='en'?(page==='lab'?'/':`/projects/${page==='knowledge'?'write':'work'}/`):page==='lab'?`/${l}/lab/`:`/${l}/projects/${page==='knowledge'?'write':'work'}/`;
const out=process.env.QA_OUTPUT||'test-results';mkdirSync(out,{recursive:true});
const metrics=()=>p.evaluate(()=>{
 const groups={eyebrow:'.hero .eyebrow,.hero>.overline',title:'.hero h1',lede:'.hero .lede',primary:'.hero .button:not(.button-quiet)',secondary:'.hero .button-quiet',sectionLabel:'.section-index,#about>.overline,#views .overline',heading:'.story-head h2,.editorial h2,#views h2',prose:'.story-head .story-copy,.editorial p:not(.overline),#views .section-head>p'};
 const keys=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','borderRadius','padding','minHeight','textTransform'];
 return Object.fromEntries(Object.entries(groups).map(([name,selector])=>{const e=document.querySelector(selector);if(!e)throw new Error('Missing '+name);const s=getComputedStyle(e);return[name,Object.fromEntries(keys.filter(k=>k!=='minHeight'||['primary','secondary'].includes(name)).map(k=>[k,s[k]]))];}));
});
try{
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const width of [1366,768,390,320]){
  await p.setViewport({width,height:900});
  for(const lang of langs){
   const samples=[];
   for(const product of pages){
    await go(route(lang,product));await p.evaluate(()=>document.fonts.ready);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}/${lang}/${product} overflow`);
    samples.push(await metrics());
    const controls=await p.$$eval('.hero .button',es=>es.map(e=>e.getBoundingClientRect().height));assert(controls.every(h=>h>=44));
    for(const theme of ['light','dark']){
     await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
     assert.equal(await p.$eval('.hero .eyebrow,.hero>.overline',e=>getComputedStyle(e).color),await p.$eval('body',e=>getComputedStyle(e).color));
     const secondary=await p.$eval('.hero .button-quiet',e=>{const s=getComputedStyle(e);return {bg:s.backgroundColor,border:s.borderColor,text:s.color}});
     assert.equal(secondary.bg,'rgba(0, 0, 0, 0)');
     await p.hover('.hero .button-quiet');assert.equal(await p.$eval('.hero .button-quiet',e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
     await p.focus('.hero .button-quiet');await p.keyboard.press('Tab');await p.keyboard.down('Shift');await p.keyboard.press('Tab');await p.keyboard.up('Shift');
     assert.equal(await p.$eval('.hero .button-quiet',e=>getComputedStyle(e).outlineStyle),'solid');
     await p.evaluate(()=>document.activeElement?.blur());await p.mouse.move(0,0);
     if(lang==='en'&&[1366,390].includes(width)){await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:path.join(out,`editorial-${product}-${theme}-${width}.png`)});}
    }
   }
   assert.deepEqual(samples[0],samples[1],`${width}/${lang} Lab and Knowledge primitives`);
   assert.deepEqual(samples[2],samples[1],`${width}/${lang} Tracker and Knowledge primitives`);
  }
 }
 // Matching real entrance animations, readable no-script content, and anchor navigation.
 await p.setViewport({width:1366,height:900});
 for(const product of pages){
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
  await go(route('en',product));
  const animation=await p.$eval('.hero h1',e=>{const s=getComputedStyle(e);return[s.animationName,s.animationDuration,s.animationDelay]});
  assert.deepEqual(animation,['editorial-reveal','0.8s','0.12s']);
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).animationName),'none');
  await p.waitForFunction(()=>document.querySelectorAll('.reveal.waiting').length===0);
  await p.setJavaScriptEnabled(false);await go(route('en',product));
  assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).opacity),'1');
  assert(await p.$$eval('#main section',es=>es.every(e=>getComputedStyle(e).opacity==='1')));
  await p.setJavaScriptEnabled(true);await p.reload({waitUntil:'load'});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
  const anchor=product==='lab'?'about':product==='knowledge'?'get-started':'views';
  await go(route('en',product)+'#'+anchor);
  await p.waitForFunction(()=>document.documentElement.dataset.entryStatic==='true');
  assert.equal(await p.$eval('.hero h1',e=>getComputedStyle(e).animationName),'none');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log('PASS: shared editorial primitives match across all three pages, five languages and four widths; both themes, keyboard focus, reduced motion, anchors and no-JavaScript content verified');
}finally{await browser.close();await new Promise(r=>server.close(r));}
