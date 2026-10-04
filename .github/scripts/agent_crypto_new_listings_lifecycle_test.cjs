/* Real listing owners in Firefox, deterministic public-data fixtures.
 * Native chart/depth APIs are boundary spies: no live trading/network/session.
 * Deliberately complete obsolete fetches even after abort to test commit guards.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const admin=path.join(process.env.REPO_ROOT||process.cwd(),'public/agent_crypto_erith_ia/administrator');
const results=[];
(async()=>{
 const browser=await firefox.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.route('**/*',r=>r.abort());
  async function setup(){
   await page.goto('about:blank');
   await page.setContent(`<button id="btnChartTop5">Top5</button><button id="btnChartReset">Reset</button><button id="btnChartClear">Clear</button><button id="btc">BTC</button><button class="period-btn" data-period="7">7j</button><button class="period-btn" data-period="30">30j</button><button id="atlasNewListingsButton406528">Listings</button><input id="searchInput"><table><tbody id="marketRows"></tbody></table><p id="tableNote"></p><div id="analyste"><div class="chart-v2-control-deck"></div></div><div id="selectedAssetTitle"></div><div id="assetDetailGrid"></div><div id="detailCompactStrip"></div><div id="detailCompactAsset"></div><div id="detailCompactPrice"></div><div id="detailCompactDecision"></div><div id="detailCompactChange"></div><div id="assetDetailWhy"></div><div id="chartCaption"><span class="chart-caption-text"></span></div>`);
   await page.evaluate(()=>{
    globalThis.pending=[];globalThis.paints=[];globalThis.mode='BTC';globalThis.events=[];globalThis.micro=[];globalThis.clearCalls=0;
    globalThis.fetch=(url,opts)=>new Promise(resolve=>pending.push({url:String(url),signal:opts?.signal,resolve:j=>resolve({ok:true,json:async()=>j})}));
    globalThis.reply=(part,data)=>{const i=pending.findIndex(x=>x.url.includes(part));if(i<0)throw Error('Missing '+part);pending.splice(i,1)[0].resolve(data)};
    globalThis.AtlasExternalChart={present(coin,days,result){paints.push({id:coin.id,days,series:result.series});mode=coin.symbol;return true},clear(){clearCalls++;mode='CLEAR'}};
    globalThis.AtlasMarketUniverse1000={find:id=>({priceUsd:1,priceEur:.9})};
    globalThis.AgentCryptoQuoteCurrencyArchitecture={snapshot:()=>({displayCurrency:'USD'})};
    globalThis.AgentCryptoMarketMicroscope={setMode:x=>micro.push(x)};
    globalThis.renderMarketTable=()=>{};
    globalThis.atlasChartSetPeriodButtons=()=>{};
    window.addEventListener('agent-crypto:external-asset-changed',e=>events.push(e.detail));
    for(const id of ['btnChartTop5','btnChartReset','btnChartClear'])document.getElementById(id).onclick=()=>{mode=id;AtlasExternalChart.clear();mode=id};
    globalThis.ct={id:'concrete',name:'Concrete',symbol:'CT',base:'CT',quote:'USDT',provider:'okx',providerLabel:'OKX',providerSymbol:'CT-USDT',pair:'CT/USDT',listedAt:'2026-09-30T10:00:00Z'};
    globalThis.mha={id:'new-listing:bitget:mhausdt',name:'MAGNE.AI',symbol:'MHA',base:'MHA',quote:'USDT',provider:'bitget',providerLabel:'Bitget',providerSymbol:'MHAUSDT',pair:'MHA/USDT',listedAt:'2026-09-30T10:00:00Z'};
   });
   for(const name of ['new-listings-live-asset-406529.js','new-listings-native-category.js'])await page.addScriptTag({path:path.join(admin,'js',name)});
  }
   async function ticker(symbol){await page.evaluate(symbol=>{
   if(symbol==='CT')reply('/ticker?',{code:'0',data:[{last:'2',ts:String(Date.now())}]});
   else reply('/tickers?',{code:'00000',data:[{lastPrice:'3',price24hPcnt:'0.01',ts:String(Date.now())}]});
  },symbol);}
  async function candles(part='candles',price=2){await page.evaluate(({part,price})=>reply(part,{code:part.includes('v3')?'00000':'0',data:[[Date.now()-600000,price,price,price,price,5],[Date.now()-300000,price+1,price+1,price+1,price+1,6]]}),{part,price});}
  // A canonical click during ticker loading must invalidate the pending intent.
  for(const id of ['btnChartTop5','btnChartReset','btnChartClear']){
   await setup();await page.evaluate(()=>{globalThis.task=AgentCryptoNewListingsNativeCategory.select(ct)});
   await page.locator('#'+id).click();await ticker('CT');
   await page.evaluate(()=>new Promise(r=>setTimeout(r,0)));
   let s=await page.evaluate(()=>({live:AgentCryptoNewListingLiveAsset.snapshot(),pending:pending.map(x=>x.url),native:AgentCryptoNewListingsNativeCategory.snapshot(),paints,mode,clearCalls}));
   assert.equal(s.live.active,false,`${id}: obsolete CT ticker restored live context`);
   assert.equal(s.native.selectedId,null);assert.equal(s.mode,id);assert.equal(s.paints.length,0);assert.equal(s.clearCalls,1,'only native handler clears');
   assert.equal(await page.evaluate(()=>task),false);results.push(id+': exit during ticker keeps native owner');
  }
  // Same race after ticker success, while candles are loading.
  await setup();await page.evaluate(()=>{globalThis.task=AgentCryptoNewListingsNativeCategory.select(ct)});await ticker('CT');
  await page.waitForFunction(()=>pending.some(x=>x.url.includes('candles')));await page.locator('#btnChartTop5').click();await candles();
  assert.equal(await page.evaluate(()=>task),false);assert.equal(await page.evaluate(()=>mode),'btnChartTop5');assert.equal(await page.evaluate(()=>paints.length),0);results.push('exit during candles rejects stale graph/Fiche write');
  // CT first, MHA second; MHA finishes first, CT arrives last.
  await setup();await page.evaluate(()=>{globalThis.first=AgentCryptoNewListingsNativeCategory.select(ct);globalThis.second=AgentCryptoNewListingsNativeCategory.select(mha)});
  await ticker('MHA');await page.waitForFunction(()=>pending.some(x=>x.url.includes('v3/market/candles')));await candles('v3/market/candles',3);assert.equal(await page.evaluate(()=>second),true);
  await ticker('CT');assert.equal(await page.evaluate(()=>first),false);
  assert.equal(await page.evaluate(()=>AgentCryptoNewListingLiveAsset.snapshot().base),'MHA');assert.equal(await page.evaluate(()=>mode),'MHA');assert.equal(await page.locator('#atlasNewListingActive529').count(),0);assert.equal(await page.locator('#detailCompactAsset').textContent(),'MHA');results.push('late CT cannot overwrite newer MHA graph/Fiche/depth context');
  // Native period intent also owns its response order.
  await page.locator('[data-period="7"]').click();await page.locator('[data-period="30"]').click();
  await candles('interval=1H',30);await page.waitForFunction(()=>paints.at(-1)?.days===30);await candles('interval=15m',7);
  await page.evaluate(()=>new Promise(r=>setTimeout(r,0)));assert.equal(await page.evaluate(()=>paints.at(-1).days),30);results.push('late 7d cannot overwrite newer 30d');
  // Absent prices/changes are unknown, never numerical zero.
  await setup();await page.evaluate(()=>AgentCryptoNewListingsNativeCategory.mount());
  await page.locator('#searchInput').fill('CT');await page.evaluate(()=>AgentCryptoNewListingsNativeCategory.mount());
  assert.match(await page.locator('#marketRows').textContent(),/Prix live indisponible/);assert.doesNotMatch(await page.locator('#marketRows').textContent(),/0,00\s*\$/);results.push('missing listing quote is unavailable, not zero USD');
  await page.close();
 }finally{await browser.close()}
 console.log(JSON.stringify({pass:true,browser:'Firefox',scope:'real listing owners; mocked public HTTP and native chart/depth API boundaries',checks:results},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
