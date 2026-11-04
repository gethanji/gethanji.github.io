import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync,existsSync}from'node:fs';
const read=p=>readFileSync(p,'utf8'),langs=['en','ko','de','ja','fr'];
test('the current suite has Think, Plan and Document in every language, with real product captures and a shared handbook',()=>{
 for(const lang of langs){const prefix=lang==='en'?'':`/${lang}`;
  for(const product of ['think','plan','document']){const path=`dist${prefix}/projects/${product}/index.html`;assert(existsSync(path),`${lang}/${product} exists`);const html=read(path);assert(html.includes('https://hanji.ink/docs/'));assert(html.includes('data-current-capabilities'));assert(html.includes('href="'+prefix+'/projects/think/"'));assert(!html.includes('Hanji Write')&&!html.includes('Hanji Work'));assert(html.includes('preview-'),'Uses the current product captures');}
  for(const [old,current] of [['write','document'],['work','plan'],['knowledge','document'],['tracker','plan']]){const html=read(`dist${prefix}/projects/${old}/index.html`);assert(html.includes(`href="${prefix}/projects/${current}/"`));assert(html.includes('location.search+location.hash'));}
 }
});
test('the public entry points describe invited desktop access without offering a nonexistent binary release',()=>{const html=read('dist/start/index.html'),llms=read('dist/llms.txt');assert(!/href="[^" ]+\.(zip|dmg)"/.test(html));for(const p of ['think','plan','document'])assert(llms.includes(`/projects/${p}/`));assert(!llms.includes('Work has no handbook yet'));});
