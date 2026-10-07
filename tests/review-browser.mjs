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
try {
 await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'light'}]);
 await p.setViewport({width:1366,height:768});
 await go('/projects/work/');
 await p.waitForFunction(()=>Number(document.querySelector('.tracker-mini').dataset.playhead)>13000,{timeout:20000});
 await p.focus('#task-chat-1 [data-close-task]');
 assert.equal(await p.$eval('.tracker-mini',e=>e.dataset.running),'false');
 const frozen=await p.$eval('.tracker-mini',e=>e.dataset.playhead);
 await wait(4000);
 assert.equal(await p.$eval('.tracker-mini',e=>e.dataset.playhead),frozen);
 assert(await p.$eval('#task-chat-1 [data-close-task]',e=>e===document.activeElement));
 await p.keyboard.press('Escape');
 assert(await p.$eval('[data-card="1"]',e=>e===document.activeElement));
 await p.click('[data-story-restart]');
 await p.waitForFunction(()=>Number(document.querySelector('.tracker-mini').dataset.playhead)>4450);
 await p.focus('[data-card="3"]');
 assert.equal(await p.$eval('.tracker-mini',e=>e.dataset.running),'false');
 assert.equal(await p.$eval('.tracker-mini',e=>e.dataset.selected),'-1');
 assert.equal(await p.$eval('[data-card="3"]',e=>getComputedStyle(e).opacity),'1');
 await p.keyboard.press('Enter');
 assert(await p.$eval('#task-chat-title-3',e=>e===document.activeElement));
 await p.keyboard.press('Escape');
 assert(await p.$eval('[data-card="3"]',e=>e===document.activeElement));
 await p.click('[data-story-restart]');
 assert.equal(await p.$eval('.tracker-mini',e=>e.dataset.running),'true');
 console.log('PASS: autoplay retains task focus; early keyboard focus reveals cards; Escape and explicit replay work');
 for (const theme of ['light','dark']) {
  await p.evaluate(theme=>localStorage.setItem('hanji-theme',theme),theme);
  for (const width of [1366,390]) {
   await p.setViewport({width,height:width===1366?768:844});
   for (const product of ['lab','knowledge','tracker']) {
    await go(route('en',product));await p.evaluate(()=>document.fonts.ready);
    if(product==='tracker')await p.click('[data-story-step="6"]');
    if(product==='knowledge')await p.click('[data-story-step="4"]');
    await p.mouse.move(0,0);await p.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});await wait(700);
    await p.screenshot({path:path.join(out,`review-${product}-${theme}-${width}.png`),fullPage:width===390});
    console.log('VIEW',JSON.stringify(await p.evaluate(({product,theme,width})=>{const hero=document.querySelector(product==='tracker'?'.tracker-mini':'.mini-hanji');return {product,theme,width,overflow:document.documentElement.scrollWidth>innerWidth,heroBottom:hero?.getBoundingClientRect().bottom,viewport:innerHeight};},{product,theme,width})));
   }
  }
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
} finally {await browser.close();await new Promise(r=>server.close(r));}
