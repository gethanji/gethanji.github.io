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
 const french=await browser.newPage();
 await french.evaluateOnNewDocument(()=>Object.defineProperty(navigator,'languages',{get:()=>['fr-CA','ko']}));
 await french.goto(origin+'/?entry=system#about');
 await french.waitForFunction(()=>location.pathname==='/fr/lab/');
 assert(french.url().endsWith('?entry=system#about'));
 assert.equal(await french.$eval('.lang-picker .is-current',e=>e.dataset.language),'system');
 assert.equal(await french.$eval('.theme-picker input:checked',e=>e.value),'system');
 await french.goto(origin+'/ja/projects/tracker/?entry=direct#views');
 assert.equal(await french.$eval('html',e=>e.lang),'ja','Explicit localized URLs remain shareable');
 await french.click('.lang-picker summary');
 await Promise.all([french.waitForNavigation(),french.click('[data-language=system]')]);
 assert.equal(new URL(french.url()).pathname,'/fr/projects/tracker/');
 assert(french.url().endsWith('?entry=direct#views'));
 await french.click('.lang-picker summary');
 await Promise.all([french.waitForNavigation(),french.click('[data-language=en]')]);
 assert.equal(new URL(french.url()).pathname,'/projects/tracker/');
 assert.equal(await french.evaluate(()=>localStorage.getItem('hanji-language')),'en');
 await french.reload();assert.equal(await french.$eval('html',e=>e.lang),'en');
 await french.click('.lang-picker summary');
 await Promise.all([french.waitForNavigation(),french.click('[data-language=system]')]);
 assert.equal(new URL(french.url()).pathname,'/fr/projects/tracker/');
 await french.close();
 const blocked=await browser.newPage();
 await blocked.evaluateOnNewDocument(()=>{Object.defineProperty(navigator,'languages',{get:()=>['fr']});Storage.prototype.getItem=()=>{throw new Error('Unavailable')};Storage.prototype.setItem=()=>{throw new Error('Unavailable')};});
 await blocked.goto(origin+'/');await blocked.waitForFunction(()=>location.pathname==='/fr/lab/');
 await blocked.click('.lang-picker summary');await Promise.all([blocked.waitForNavigation(),blocked.click('[data-language=en]')]);
 await wait(250);assert.equal(await blocked.$eval('html',e=>e.lang),'en','Manual language still works when storage is blocked');await blocked.close();
 await p.goto(origin+'/');await p.evaluate(()=>localStorage.clear());
 for(const width of [1366,390,320]) {
  await p.setViewport({width,height:900});
  for(const product of pages) {
   await go(route('en',product));await p.evaluate(()=>document.fonts.ready);
   assert.equal(await p.$('.family-projects'),null);assert.equal(await p.$('.family-lab'),null);
   assert.equal((await p.$$('.family-shortcuts a')).length,2);
   const bounds=await p.evaluate(()=>[...document.querySelectorAll('.family-brand,.family-shortcuts,.family-right')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right}}));
   assert(bounds.every(b=>b.left>=0&&b.right<=width));assert(bounds[0].right<=bounds[1].left);assert(bounds[1].right<=bounds[2].left);
   assert.equal(await p.$eval('.lang-picker summary',e=>e.textContent.trim()),'');
   assert.equal(await p.$eval('.theme-picker summary',e=>e.textContent.trim()),'');
   await p.click('.lang-picker summary');await p.click('.theme-picker summary');await wait(80);
   assert(await p.$eval('.lang-picker',e=>!e.open));assert(await p.$eval('.theme-picker',e=>e.open));
   await p.keyboard.press('Escape');assert(await p.$eval('.theme-picker summary',e=>e===document.activeElement));
   await p.evaluate(()=>document.activeElement.blur());
   await (await p.$('.site-header')).screenshot({path:path.join(out,`simple-header-${product}-${width}.png`)});
  }
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log('PASS: System language detection, explicit links, manual choice, persistence, sibling menus and compact header');
} finally {await browser.close();await new Promise(r=>server.close(r));}
