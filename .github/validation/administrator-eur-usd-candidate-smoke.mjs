/* Isolated read-only browser smoke. NOT a validation of 84 real history cases. */
import { chromium, firefox } from 'playwright';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] || 'source');
const out = resolve(process.argv[3] || 'preproduction-results');
const url = 'http://127.0.0.1:8765/public/agent_crypto_erith_ia/administrator/index.html';
const chartLib = resolve(here, 'node_modules/chart.js/dist/chart.umd.js');
const modes = { Solo:'btnChartSolo', Top3:'btnChartTop3', Top5:'btnChartTop5',
  Hausses5:'btnChartGainers', Baisses5:'btnChartLosers', Volumes5:'btnChartVolume5' };
await mkdir(out, { recursive:true });
await stat(chartLib);
const html = await readFile(join(root,'public/agent_crypto_erith_ia/administrator/index.html'),'utf8');
const refs = [];
for (const m of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
  const tag = m[0];
  const isScript = /^<script\b/i.test(tag);
  if (!isScript && !/\brel\s*=\s*["']stylesheet["']/i.test(tag)) continue;
  const value = isScript ? /\bsrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] :
    /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
  if (!value) continue;
  const u = new URL(value.replaceAll('&amp;','&'),url);
  if (u.hostname !== '127.0.0.1') continue;
  const path = resolve(root,'.' + decodeURIComponent(u.pathname));
  let found = false;
  try { await stat(path); found = true; } catch {}
  refs.push({type:isScript?'JS':'CSS',url:u.pathname,found});
}
const missing = refs.filter(x=>!x.found);
const results = {candidate:'951f8906d0a13de183c226970a85970537ed1e6d',
 scope:'static dependencies and browser boot only; NOT 84 live/historical quote scenarios',
 static_resources:refs.length,static_missing:missing,browsers:[],validated_84_real_cases:false};
for (const [name,engine] of Object.entries({chromium,firefox})) {
 const r = {name,http:null,chartjs:null,canvas:false,chart_instance:false,
    buttons:{},errors:[],local_http_errors:[],request_failures:[],screenshot:null};
 let browser;
 try {
  browser = await engine.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:900},locale:'fr-FR'});
  await context.route('**/chart.js@4.4.9/**', route=>route.fulfill({path:chartLib,contentType:'application/javascript'}));
  const page = await context.newPage();
  page.on('pageerror', e=>{if(r.errors.length<40)r.errors.push(String(e.message).slice(0,400));});
  page.on('requestfailed', req=>{if(r.request_failures.length<40)r.request_failures.push(req.url().slice(0,240));});
  page.on('response', resp=>{
    if(resp.status()>=400 && resp.url().startsWith('http://127.0.0.1:8765/') && r.local_http_errors.length<100)
      r.local_http_errors.push({status:resp.status(),url:resp.url()});
  });
  const response = await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  r.http = response?.status()||null;
  await page.waitForTimeout(12000);
  const state = await page.evaluate((ids)=>{
    const canvas = document.getElementById('mainChart');
    return {title:document.title,chartjs:globalThis.Chart?.version||null,
      canvas:canvas?.tagName==='CANVAS',
      chart_instance:Boolean(globalThis.Chart?.getChart?.(canvas)),
      buttons:Object.fromEntries(Object.entries(ids).map(([n,id])=>[n,Boolean(document.getElementById(id))])),
      build:document.documentElement.dataset.agentCryptoLoadedBuild||null};
  },modes);
  Object.assign(r,state);
  r.screenshot=name+'-administrator.png';
  await page.screenshot({path:join(out,r.screenshot),fullPage:false,timeout:20000});
  await context.close();
 } catch(e) {r.fatal=String(e.stack||e).slice(0,1400);}
 finally {if(browser)await browser.close();results.browsers.push(r);}
}
results.boot_pass=missing.length===0 && results.browsers.every(r=>
 r.http===200 && r.chartjs==='4.4.9' && r.canvas &&
 Object.keys(r.buttons).length===6 && Object.values(r.buttons).every(Boolean) &&
 !r.fatal && !r.local_http_errors.some(x=>/\.(js|css)(\?|$)/.test(x.url))
);
await writeFile(join(out,'report.json'),JSON.stringify(results,null,2)+'\n');
const summary=['# EUR/USD candidate — isolated browser smoke',
  'Candidate: '+results.candidate,
  'Referenced local scripts/styles: '+results.static_resources+'; missing: '+missing.length,
  '| Browser | HTTP | Chart.js | Canvas | Chart instance | Local HTTP errors | JS exceptions |',
  '|---|---|---|---|---|---|---|',
  ...results.browsers.map(r=>'| '+r.name+' | '+r.http+' | '+r.chartjs+' | '+r.canvas+' | '+r.chart_instance+' | '+r.local_http_errors.length+' | '+r.errors.length+' |'),
  'Browser boot: '+(results.boot_pass?'PASS':'FAIL'),
  '**84 real EUR/USD historical combinations NOT validated.**',
  'External live sources, OKX bridge and Firefox IndexedDB histories are outside this smoke test.',
  'Details and screenshots are available in report.json and *.png.'];
await writeFile(join(out,'SUMMARY.md'),summary.join('\n')+'\n');
console.log(summary.join('\n'));
if(!results.boot_pass)process.exitCode=1;
