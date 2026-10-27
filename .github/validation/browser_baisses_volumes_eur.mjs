import { chromium, firefox } from "playwright";
import { mkdir,writeFile,stat } from "node:fs/promises";
import { join,dirname,resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root=dirname(fileURLToPath(import.meta.url)),out=resolve(process.argv[2]||"eur-scanners-results");
await mkdir(out,{recursive:true});
const chart=join(root,"node_modules/chart.js/dist/chart.umd.js");
await stat(chart);
const url="http://127.0.0.1:8765/public/agent_crypto_erith_ia/administrator/index.html";
const report={scope:"EUR Baisses5 / Volumes5 24h; real chart and raw EUR prices; Firefox & Chromium",browsers:[]};
for(const [name,engine] of Object.entries({chromium,firefox})){
 const entry={name,steps:[],errors:[]};let browser;
 try{
  browser=await engine.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:1450,height:900},locale:"fr-FR"});
  await ctx.route("**/chart.js@4.4.9/**",route=>route.fulfill({path:chart,contentType:"application/javascript"}));
  const page=await ctx.newPage();
  page.on("pageerror",err=>{if(entry.errors.length<20)entry.errors.push(err.message)});
  entry.http=(await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000}))?.status()||0;
  await page.waitForTimeout(11000);
  await page.evaluate(()=>document.getElementById("btnLivecheck")?.click());
  await page.waitForTimeout(18000);
  await page.evaluate(()=>document.getElementById("btnRefresh")?.click());
  await page.waitForTimeout(12000);
  await page.locator('[data-aqca="EUR"]').click({timeout:20000});
  await page.waitForTimeout(2000);
  for(const [label,selector,preset] of [
    ["Baisses5","#btnChartLosers","losers"],["Volumes5","#btnChartVolume5","volume"]
  ]){
    await page.locator(selector).click({timeout:20000});
    await page.waitForTimeout(70000);
    const data=await page.evaluate(()=>{
      const canvas=document.getElementById("mainChart"),s=typeof state==="object"?state:null;
      const g=s?.chartEngineV2?.realChart||globalThis.Chart?.getChart?.(canvas)||null;
      const datasets=(g?.data?.datasets||[]).filter(d=>d?.atlasCoin?.id).map(d=>({
        id:d.atlasCoin.id,quote:d.atlasHistoricalQuote?.currency||null,
        source:String(d.atlasHistoricalQuote?.source||""),
        points:Array.isArray(d.data)?d.data.length:0,
        firstPrice:Number(d.data?.[0]?.rawPrice),
        lastPrice:Number(d.data?.[d.data.length-1]?.rawPrice),
      }));
      return {displayCurrency:globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||null,
        preset:s?.dataBroker?.comparison?.preset||null,liveOk:s?.liveOk||false,
        chart:!!g,datasets};
    });
    const unique=new Set(data.datasets.map(d=>d.id)).size===5;
    const sourceValid=data.datasets.every(d=>d.quote==="EUR"&&d.source.length>0&&d.points>=3
      &&Number.isFinite(d.firstPrice)&&d.firstPrice>0&&Number.isFinite(d.lastPrice)&&d.lastPrice>0);
    const passed=data.displayCurrency==="EUR"&&data.preset===preset&&data.chart&&data.datasets.length===5
      &&unique&&sourceValid;
    entry.steps.push({label,passed,unique,sourceValid,...data});
    await page.screenshot({path:join(out,name+"-"+label+".png"),timeout:25000});
  }
  await ctx.close();
 }catch(err){entry.fatal=String(err.stack||err).slice(0,1800)}
 finally{if(browser)await browser.close();report.browsers.push(entry)}
}
const both=report.browsers.length===2&&report.browsers.every(b=>!b.fatal&&b.errors.length===0);
report.baisses5=both&&report.browsers.every(b=>b.steps.find(s=>s.label==="Baisses5")?.passed===true);
report.volumes5=both&&report.browsers.every(b=>b.steps.find(s=>s.label==="Volumes5")?.passed===true);
await writeFile(join(out,"report.json"),JSON.stringify(report,null,2)+"\n");
const lines=["Baisses 5 EUR 24h: "+(report.baisses5?"PASS":"NOT PROVEN"),
 "Volumes 5 EUR 24h: "+(report.volumes5?"PASS":"NOT PROVEN"),
 ...report.browsers.flatMap(b=>[
 b.name+" JS errors="+b.errors.length+(b.fatal?" FATAL "+b.fatal:""),
 ...b.steps.map(s=>b.name+" "+s.label+": "+s.datasets.length+"/5 "+s.displayCurrency+" quote="+s.datasets.map(d=>d.quote||"?").join(",")+" raw-valid="+s.sourceValid)
 ])];
await writeFile(join(out,"SUMMARY.md"),lines.join("\n")+"\n");
console.log(lines.join("\n"));
if(!report.baisses5||!report.volumes5)process.exitCode=1;
