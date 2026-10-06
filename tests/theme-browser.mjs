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
const choose=async mode=>{
 if(!await p.$eval('.theme-picker',e=>e.open))await p.click('.theme-picker summary');
 await p.click(`.theme-row:has(input[value="${mode}"])`);
 await wait(180);
};
const state=()=>p.evaluate(()=>({theme:document.documentElement.dataset.theme,choice:document.documentElement.dataset.themeChoice,checked:document.querySelector('.theme-picker input:checked')?.value,scheme:getComputedStyle(document.documentElement).colorScheme}));
const expected=(theme,choice)=>({theme,choice,checked:choice,scheme:theme});
const contrast=()=>p.evaluate(()=>{
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d',{willReadFrequently:true});
 const rgb=color=>{context.clearRect(0,0,1,1);context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].slice(0,3);};
 const luminance=color=>rgb(color).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const pairs=[['.site-header a','.site-header'],['.lede','body'],['.overline','body'],['.hero .button','.hero .button'],['.quick-start-steps p','body'],['.quick-start pre','.quick-start pre'],['.paper-sheet p','.paper-sheet'],['.photo-caption','.product-photo'],['.capture figcaption','.capture'],['.capture-tabs [aria-selected=true]','.capture-tabs [aria-selected=true]'],['.tm-card b','.tm-card'],['.tm-task-chat p','.tm-task-chat'],['.tm-conductor-reply','.tm-conductor-chat'],['.illustration-controls button','body']];
 return pairs.flatMap(([selector,background])=>[...document.querySelectorAll(selector)].filter(el=>el.getBoundingClientRect().height>0).map(el=>{const bg=el.closest(background)||document.querySelector(background),fg=getComputedStyle(el).color,bgc=getComputedStyle(bg).backgroundColor,values=[luminance(fg),luminance(bgc)].sort((a,b)=>a-b);return{selector,ratio:(values[1]+.05)/(values[0]+.05),fg,bg:bgc}}));
});
try{
 for(const width of [1366,390,320]){await p.setViewport({width,height:width===1366?768:900});for(const l of langs)for(const product of pages){
  await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'no-preference'}]);await go(route(l,product));await p.evaluate(()=>document.fonts.ready);assert.deepEqual(await state(),expected('dark','system'));
  if(product!=='lab')await p.click(`[data-story-step="${product==='tracker'?'6':'4'}"]`);
  if(product!=='knowledge'){const failures=(await contrast()).filter(v=>v.ratio<4.5);assert.deepEqual(failures,[],`${l}/${product} ${width}: dark text contrast`);}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await choose('dark');
  assert.deepEqual(await state(),expected('dark','dark'));assert.equal(await p.evaluate(()=>localStorage.getItem('hanji-theme')),'dark');
  assert(await p.$eval('.theme-menu',el=>{const r=el.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth}));
  await p.focus('.theme-picker input[value=light]');await p.keyboard.press('Space');await wait(160);assert.deepEqual(await state(),expected('light','light'));
  if(l==='en'&&width!==320){await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:path.join(out,`theme-${product}-light-${width}.png`)});}
  await choose('system');assert.deepEqual(await state(),expected('dark','system'));await p.keyboard.press('Escape');assert(await p.$eval('.theme-picker',e=>!e.open));
  if(l==='en'&&width!==320){await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:path.join(out,`theme-${product}-dark-${width}.png`)});}
  await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'light'}]);await wait(160);assert.deepEqual(await state(),expected('light','system'));
  console.log(width,l,product,'system, manual override, keyboard and menu bounds pass (dark contrast checked for lab/Tracker)');
 }}
 await p.setViewport({width:1366,height:768});await go('/');await choose('dark');await p.keyboard.press('Escape');await p.keyboard.press('Escape');
 for(const [selector,destination] of [['.family-shortcuts a[href="/projects/tracker/"]','/projects/tracker/'],['.family-shortcuts a[href="/projects/knowledge/"]','/projects/knowledge/'],['.family-brand','/']]){await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.click(selector)]);assert.equal(new URL(p.url()).pathname,destination);assert.deepEqual(await state(),expected('dark','dark'));}
 await p.click('.lang-picker summary');await Promise.all([p.waitForNavigation({waitUntil:'load'}),p.click('.lang-picker a[lang=ko]')]);assert.deepEqual(await state(),expected('dark','dark'));await p.reload({waitUntil:'load'});assert.deepEqual(await state(),expected('dark','dark'));
 await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'light'}]);assert.deepEqual(await state(),expected('dark','dark'));
 const tab=await browser.newPage();await tab.goto(origin);await tab.evaluate(()=>localStorage.setItem('hanji-theme','light'));await p.waitForFunction(()=>document.documentElement.dataset.theme==='light');await tab.evaluate(()=>localStorage.removeItem('hanji-theme'));await p.waitForFunction(()=>document.documentElement.dataset.themeChoice==='system');await tab.close();console.log('Choice persists through real page/language navigation and reload; manual beats system; tabs stay in sync');
 await p.evaluate(()=>localStorage.removeItem('hanji-language'));
 for(const product of ['knowledge','tracker']){await go(route('en',product));const root=product==='knowledge'?'.mini-hanji':'.tracker-mini';await p.$eval(root,e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForFunction(s=>document.querySelector(s).dataset.running==='true',{},root);await p.click('[data-story-toggle]');const time=await p.$eval(root,e=>e.dataset.playhead),geometry=await p.$eval(root,e=>({width:e.offsetWidth,height:e.offsetHeight}));await choose('dark');assert.equal(await p.$eval(root,e=>e.dataset.playhead),time);assert.deepEqual(await p.$eval(root,e=>({width:e.offsetWidth,height:e.offsetHeight})),geometry);await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.click('[data-story-restart]');await p.waitForFunction(s=>document.querySelector(s).dataset.running==='true',{},root);await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'reduce'}]);await p.waitForFunction(s=>document.querySelector(s).dataset.running==='false',{},root);await p.click('[data-story-restart]');assert.equal(await p.$eval(root,e=>e.dataset.running),'false');await p.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'no-preference'}]);}
 console.log('Theme changes preserve hero size/playhead; replay, autoplay and reduced motion stay functional');
 const blocked=await browser.newPage();await blocked.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'}]);await blocked.evaluateOnNewDocument(()=>{Storage.prototype.getItem=()=>{throw new Error('Storage unavailable')};Storage.prototype.setItem=()=>{throw new Error('Storage unavailable')};});await blocked.goto(origin,{waitUntil:'load'});assert.equal(await blocked.$eval('html',e=>e.dataset.theme),'dark');await blocked.click('.theme-picker summary');await blocked.click('.theme-row:has(input[value=light])');assert.equal(await blocked.$eval('html',e=>e.dataset.theme),'light');await blocked.close();
 await go('/');await p.evaluate(()=>localStorage.setItem('hanji-theme','invalid'));await p.reload({waitUntil:'load'});assert.deepEqual(await state(),expected('dark','system'));assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS: shared themes, blocked/invalid storage fallback, navigation, contrast, all locales and mobile');
}finally{await browser.close();await new Promise(r=>server.close(r));}
