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
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await p.setRequestInterception(true);
 const visits=[];
 p.on('request',req=>{
  if(new URL(req.url()).hostname==='formsubmit.co'){
   visits.push({url:req.url(),method:req.method(),type:req.resourceType()});
   return req.respond({status:200,contentType:'text/html',body:'<!doctype html><title>Mock hosted form</title><p>Hosted form navigation verified</p>'});
  }
  req.continue();
 });
 for(const width of [1366,390,320]){
  await p.setViewport({width,height:900});
  for(const lang of langs)for(const product of ['knowledge','tracker']){
   await go(route(lang,product));await p.evaluate(()=>document.fonts.ready);
   const link=await p.$eval('[data-access-request]',a=>({href:a.href,label:a.textContent.trim(),description:document.getElementById(a.getAttribute('aria-describedby'))?.textContent}));
   const url=new URL(link.href);
   assert.equal(url.origin,'https://formsubmit.co');assert.equal(url.pathname,'/el/xuriwu');
   assert.equal(url.searchParams.get('subject'),`Hanji ${product==='knowledge'?'Knowledge':'Tracker'} access request`);
   assert.deepEqual([...url.searchParams.keys()],['subject'],'Only project context is placed in the URL');
   assert(link.label.length>0);assert(link.description.includes('FormSubmit'));
   assert.equal(await p.$('fieldset[disabled]'),null);
   assert(!await p.$eval('.setup-notes',e=>e.open));
   await p.click('[data-quick-start]');assert.equal(await p.evaluate(()=>document.activeElement.id),'get-started');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}/${product}/${width}`);
   if(lang==='en'&&width!==320){
    await p.$eval('#get-started',e=>e.scrollIntoView({behavior:'instant',block:'start'}));
    await (await p.$('#get-started')).screenshot({path:path.join(out,`access-${product}-${width}.png`)});
   }
   await p.click('.setup-notes summary');assert(await p.$eval('.setup-notes',e=>e.open));
  }
 }
 for(const product of ['knowledge','tracker']){
  await p.setJavaScriptEnabled(false);
  await go(route('en',product));
  await p.focus('[data-access-request]');
  await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.keyboard.press('Enter')]);
  assert.equal(new URL(p.url()).searchParams.get('subject'),`Hanji ${product==='knowledge'?'Knowledge':'Tracker'} access request`);
  await p.setJavaScriptEnabled(true);
 }
 assert.equal(visits.filter(v=>v.type==='document').length,2);assert(visits.every(v=>v.method==='GET'));
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log('PASS: 30 localized responsive access sections, project-specific hosted form links, keyboard navigation without JavaScript, setup disclosures; external navigation mocked, no submissions sent');
}finally{await browser.close();await new Promise(r=>server.close(r));}
