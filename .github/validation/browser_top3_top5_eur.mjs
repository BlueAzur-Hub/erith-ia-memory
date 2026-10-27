import { chromium,firefox } from 'playwright';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.argv[2]||"eur-browser-results");
await mkdir(out,{recursive:true});
const chart=join(here,"node_modules/chart.js/dist/chart.umd.js");
await stat(chart);
const url="http://127.0.0.1:8765/public/agent_crypto_erith_ia/administrator/index.html";
const results={candidate:"test/euro-first-then-usd-integrity-20261027",scope:"Firefox/Chromium actual EUR Top3 and Top5 under public data limitations",browsers:[]};
for(const [name,engine] of Object.entries({chromium,firefox})){
 const r={name,steps:[],errors:[]};
 let browser=null;
 try{
  browser=await engine.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:1450,height:900},locale:"fr-FR"});
  await ctx.route("**/chart.js@4.4.9/**",route=>route.fulfill({path:chart,contentType:"application/javascript"}));
  const page=await ctx.newPage();
  page.on("pageerror",e=>{if(r.errors.length<15)r.errors.push(e.message)});
  r.http=(await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000}))?.status()||0;
  await page.waitForTimeout(11000);
  // The Administrator deliberately disables graph selection until Livecheck is confirmed.
  // Running it against public snapshot fixtures is required before UI comparisons.
  await page.evaluate(()=>document.getElementById("btnLivecheck")?.click());
  await page.waitForTimeout(18000);
  await page.evaluate(()=>document.getElementById("btnRefresh")?.click());
  await page.waitForTimeout(12000);
  await page.locator('[data-aqca="EUR"]').click({timeout:20000});
  await page.waitForTimeout(2000);
  for(const [preset,selector,expected] of [["Top3","#btnChartTop3",3],["Top5","#btnChartTop5",5],["Hausses5","#btnChartGainers",5]]){
   await page.locator(selector).click({timeout:20000});
   await page.waitForTimeout(preset==="Hausses5"?65000:26000);
   const obs=await page.evaluate(()=>{
     const canvas=document.getElementById("mainChart");
     const appState=typeof state==="object"&&state?state:null;
     const graph=appState?.chartEngineV2?.realChart||globalThis.Chart?.getChart?.(canvas)||null;
     const datasets=(graph?.data?.datasets||[]).filter(x=>x?.atlasCoin?.id).map(x=>({
       coinId:x.atlasCoin.id,quote:x.atlasHistoricalQuote?.currency||null,
       source:String(x.atlasHistoricalQuote?.source||""),points:Array.isArray(x.data)?x.data.length:0,
       lastRaw:Number(x.data?.[x.data.length-1]?.rawPrice)
     }));
     return {selected:globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||null,
       preset:appState?.dataBroker?.comparison?.preset||null,
       liveOk:appState?.liveOk||false, coinCount:appState?.coins?.length||0,
       chart:!!graph,datasets};
   });
   const expectedPreset={Top3:"rank-3",Top5:"rank-5",Hausses5:"gainers"}[preset];
   const proven=obs.selected==="EUR"&&obs.preset===expectedPreset&&obs.chart&&obs.datasets.length===expected
     &&obs.datasets.every(x=>x.quote==="EUR"&&x.points>=3&&Number.isFinite(x.lastRaw)&&x.lastRaw>0);
   r.steps.push({preset,expected,proven,...obs});
   await page.screenshot({path:join(out,name+"-"+preset+".png"),timeout:25000});
  }
  await ctx.close();
 }catch(e){r.fatal=String(e.stack||e).slice(0,1800)}
 finally{if(browser)await browser.close();results.browsers.push(r)}
}
results.top3EurProven=results.browsers.length===2&&results.browsers.every(r=>r.steps.find(s=>s.preset==="rank-3")?.proven);
results.top5EurProven=results.browsers.length===2&&results.browsers.every(r=>r.steps.find(s=>s.preset==="rank-5")?.proven);
results.haussesEurProven=results.browsers.length===2&&results.browsers.every(r=>r.steps.find(s=>s.preset==="gainers")?.proven);
await writeFile(join(out,"report.json"),JSON.stringify(results,null,2)+"\n");
const lines=["EUR Top3 Firefox/Chromium: "+(results.top3EurProven?"PASS":"NOT PROVEN"),
 "EUR Top5 Firefox/Chromium: "+(results.top5EurProven?"PASS":"NOT PROVEN"),
 "EUR Hausses5 Firefox/Chromium: "+(results.haussesEurProven?"PASS":"NOT PROVEN"),
 ...results.browsers.flatMap(b=>[
 b.name+" JS errors="+b.errors.length+(b.fatal?" FATAL "+b.fatal:""),
 ...b.steps.map(s=>b.name+" "+s.preset+": "+s.datasets.length+"/"+s.expected+" EUR series ("+s.datasets.map(d=>d.quote||"?").join(",")+")")
 ])];
await writeFile(join(out,"SUMMARY.md"),lines.join("\n")+"\n");console.log(lines.join("\n"));
if(!results.top3EurProven||!results.top5EurProven||!results.haussesEurProven)process.exitCode=1;
