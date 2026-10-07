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
 await p.setRequestInterception(true);
 let mode='success',posts=[];
 p.on('request',req=>{
  if(new URL(req.url()).hostname==='formsubmit.co'){
   if(req.method()==='OPTIONS')return req.respond({status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Accept'}});
   posts.push({url:req.url(),data:JSON.parse(req.postData())});
   return req.respond({status:mode==='network-error'?500:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':origin},body:JSON.stringify(mode==='success'?{success:'true'}:{success:false})});
  }
  req.continue();
 });
 for(const width of [1366,390,320]){
  await p.setViewport({width,height:900});
  for(const lang of langs)for(const product of ['knowledge','tracker']){
   await go(route(lang,product));await p.evaluate(()=>document.fonts.ready);
   const state=await p.$eval('[data-access-form]',f=>({ready:f.dataset.ready,disabled:f.querySelector('fieldset').disabled,action:f.getAttribute('action')}));
   if(state.ready==='false'){assert(state.disabled);assert.equal(state.action,null);assert(await p.$('.access-unavailable'));}
   assert(!await p.$eval('.setup-notes',e=>e.open));
   await p.click('[data-quick-start]');assert.equal(await p.evaluate(()=>document.activeElement.id),'get-started');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}/${product}/${width}`);
   const labels=await p.$$eval('.access-form input:not([type=hidden]):not([name=_honey]),.access-form textarea',nodes=>nodes.map(n=>({labels:n.labels.length,required:n.required})));assert(labels.every(n=>n.labels===1&&n.required));
   if(lang==='en'&&width!==320)await p.screenshot({path:path.join(out,`access-${product}-${width}.png`)});
   await p.click('.setup-notes summary');assert(await p.$eval('.setup-notes',e=>e.open));
  }
 }
 await go('/projects/knowledge/');
 await p.$eval('[data-access-form]',f=>{f.dataset.ready='true';f.action='https://formsubmit.co/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';f.querySelector('fieldset').disabled=false;});
 await p.$eval('[data-access-form]',f=>f.scrollIntoView({behavior:'instant',block:'center'}));
 await p.click('.access-form button');assert.equal(posts.length,0,'Empty form never submits');
 await p.type('[name=name]','Test visitor');await p.type('.access-form [name=email]','visitor@example.test');await p.type('[name=message]','I would like to review agent notes with my team.');
 mode='provider-error';await p.click('.access-form button');await p.waitForSelector('.access-result[data-state=error]');assert.equal(await p.$eval('[name=message]',e=>e.value),'I would like to review agent notes with my team.');assert(!await p.$eval('.access-form fieldset',e=>e.disabled));
 mode='network-error';await p.click('.access-form button');await p.waitForFunction(()=>!document.querySelector('.access-form').hasAttribute('aria-busy'));assert.equal(await p.$eval('.access-result',e=>e.dataset.state),'error');
 mode='success';await p.click('.access-form button');await p.waitForSelector('.access-result[data-state=success]');assert.equal(await p.$eval('[name=message]',e=>e.value),'');assert.equal(await p.$eval('.access-result',e=>e===document.activeElement),true);assert.equal(posts.length,3);assert(posts.every(x=>x.url==='https://formsubmit.co/ajax/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'&&x.data.project==='Knowledge'&&x.data.email==='visitor@example.test'));
 await p.type('[name=name]','Bot');await p.type('.access-form [name=email]','bot@example.test');await p.type('[name=message]','This is the honeypot test message.');await p.$eval('[name=_honey]',e=>e.value='spam');await p.click('.access-form button');await wait(80);assert.equal(posts.length,3,'Honeypot never submits');
 assert.deepEqual(errors,[]);console.log('PASS: 30 localized responsive form layouts, setup disclosures, empty validation, retained input on errors, success reset/focus, honeypot; provider requests mocked');
}finally{await browser.close();await new Promise(r=>server.close(r));}
