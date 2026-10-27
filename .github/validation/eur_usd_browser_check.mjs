import {chromium,firefox} from 'playwright';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const chartJs=join(here,'node_modules/chart.js/dist/chart.umd.js');
const out=resolve(process.argv[2]||'browser-results');
await mkdir(out,{recursive:true});await stat(chartJs);
const url='http://127.0.0.1:8765/public/agent_crypto_erith_ia/administrator/index.html';
const data={purpose:'Inspect actual historical dataset quotes after UI switch, not merely active button state',
 branch:'test/eur-usd-unified-historical-quotes',browsers:[],validated_84_real_cases:false};
for(const [name,engine] of Object.entries({chromium,firefox})){
 const result={name,errors:[],requestFailures:[],transitions:[]};let browser;
 try{
  browser=await engine.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:1400,height:850},locale:'fr-FR'});
  await ctx.route('**/chart.js@4.4.9/**',route=>route.fulfill({path:chartJs,contentType:'application/javascript'}));
  const page=await ctx.newPage();
  page.on('pageerror',err=>{if(result.errors.length<30)result.errors.push(String(err.message))});
  page.on('requestfailed',req=>{if(result.requestFailures.length<45)result.requestFailures.push(req.url())});
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  result.http=response?.status()||null;
  async function observe(label){
   const v=await page.evaluate(()=>{
    const currency=globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||null;
    const el=document.getElementById('mainChart'),c=globalThis.Chart?.getChart?.(el)||null;
    const quotes=(c?.data?.datasets||[]).filter(d=>d.atlasCoin?.id).map(d=>({
      id:String(d.atlasCoin.id),quote:d.atlasHistoricalQuote?.currency||null,
      source:String(d.atlasHistoricalQuote?.source||''),
      points:Array.isArray(d.data)?d.data.length:0,
      lastPrice:Array.isArray(d.data)&&d.data.length?Number(d.data[d.data.length-1]?.rawPrice):null
    }));
    return {currency,chart_present:!!c,period:c?.$atlasPeriod||null,quotes,
      chartType:c?.config?.type||null,
      buttonEUR:document.querySelector('[data-aqca="EUR"]')?.getAttribute('aria-pressed')||null,
      buttonUSD:document.querySelector('[data-aqca="USD"]')?.getAttribute('aria-pressed')||null};
   });
   const mismatches=v.quotes.filter(q=>q.quote&&q.quote!==v.currency);
   const unknown=v.quotes.filter(q=>q.quote==null);
   result.transitions.push({label,...v,mismatches,unknown,
     verified:v.chart_present&&v.quotes.length>0&&mismatches.length===0&&unknown.length===0});
  }
  await page.waitForTimeout(30000);
  await observe('initial USD');
  for(const currency of ['EUR','USD']){
   await page.locator('[data-aqca="'+currency+'"]').click({timeout:20000});
   await page.waitForTimeout(30000);
   await observe('selected '+currency);
  }
  result.chartjs=await page.evaluate(()=>globalThis.Chart?.version||null);
  result.screenshot=name+'-quote-modes.png';
  await page.screenshot({path:join(out,result.screenshot),timeout:30000});
  await ctx.close();
 }catch(err){result.fatal=String(err.stack||err).slice(0,1500)}
 finally{if(browser)await browser.close();data.browsers.push(result)}
}
data.boot_pass=data.browsers.length===2&&data.browsers.every(r=>r.http===200&&r.chartjs==='4.4.9'&&r.errors.length===0&&!r.fatal);
data.currency_transitions_proven=data.boot_pass&&data.browsers.every(r=>r.transitions.length===3&&
 r.transitions[0].currency==='USD'&&r.transitions[1].currency==='EUR'&&r.transitions[2].currency==='USD'&&
 r.transitions.every(t=>t.verified));
await writeFile(join(out,'report.json'),JSON.stringify(data,null,2)+'\n');
const lines=['# EUR/USD full Administrator browser quote provenance','Boot: '+(data.boot_pass?'PASS':'FAIL'),
 'Three transitions with verified historical quote: '+(data.currency_transitions_proven?'PASS':'NOT PROVEN'),
 ...data.browsers.flatMap(r=>[r.name+' JS errors: '+r.errors.length+(r.fatal?' | FATAL '+r.fatal:''),
  ...r.transitions.map(t=>r.name+' '+t.label+' '+t.currency+' : '+t.quotes.length+' chart series · historical quotes '+[...new Set(t.quotes.map(q=>q.quote||'?'))].join(',')+' · mismatch='+t.mismatches.length+' · unknown='+t.unknown.length)]),
 '84 actual historical combinations: NOT TESTED; live sources can fail from rate limits.'];
await writeFile(join(out,'SUMMARY.md'),lines.join('\n')+'\n');console.log(lines.join('\n'));
if(!data.currency_transitions_proven)process.exitCode=1;
