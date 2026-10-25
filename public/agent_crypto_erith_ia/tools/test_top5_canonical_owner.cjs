"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const app=fs.readFileSync(path.join(__dirname,"../administrator/app.js"),"utf8");
const from=app.indexOf("function atlasChartMarketUsdObservation(");
const to=app.indexOf("\nfunction atlasSetChartCaptionHtml(",from);
assert(from>0&&to>from,"The test must execute the real canonical tooltip source");
const functions=app.slice(from,to);
const observedAt="2026-10-24T22:32:49.000Z";
const NOW=Date.parse("2026-10-24T22:55:00.000Z");
const market=[
  ["bitcoin","BTC",80437.89973802774],
  ["ethereum","ETH",2341.0025931601263],
  ["binancecoin","BNB",734.1045219010529],
  ["ripple","XRP",1.2909162994725298],
  ["solana","SOL",101.46876996639266]
];
function setup({currency="USD",outdated=false,mismatch=false,preset="rank-5"}={}){
 const coins=(preset==="rank-3"?market.slice(0,3):market).map(([id,symbol,priceUsd])=>({id,symbol,name:symbol,priceUsd,
  usdUpdatedAt:outdated?"2026-10-20T00:00:00Z":observedAt}));
 // A mismatching universe ID must not be rescued by a second price on the chart dataset.
 if(mismatch){delete coins[0].priceUsd;delete coins[0].usdUpdatedAt;}
 const state={chartPeriodDays:1,coins:[],dataBroker:{comparison:{preset},spotBook:{quotes:{}}}};
 const chart={$atlasMode:"comparison",$atlasPeriod:1,$atlasQuoteCurrency:"EUR",
  data:{datasets:coins.map(coin=>({atlasCoin:coin,data:[{x:1,y:100}]}))}};
 const before=JSON.stringify(chart.data);
 const node={hidden:true,dataset:{},innerHTML:"",setAttribute(){}};
 class Clock extends Date {static now(){return NOW;}static parse(v){return Date.parse(v);}}
 const ctx={state,Intl,Date:Clock,Number,Math,JSON,Array,document:{},requestAnimationFrame:fn=>fn(),
  atlasHasPositiveQuote:v=>v!==null&&v!==undefined&&Number.isFinite(Number(v))&&Number(v)>0,
  atlasChartTooltipNode:()=>node,atlasHideChartTooltip:()=>{node.hidden=true;},
  atlasComparisonTooltipRows:()=>coins.map(coin=>({coin,rawPrice:90000,baseValue:101,color:"cyan"})),
  atlasChartPriceDatasets:()=>chart.data.datasets,atlasChartLivePresentation:()=>null,
  atlasCryptoPalette:()=>({primary:"cyan"}),atlasCryptoGradientCss:()=>"",
  atlasChartTooltipCoinMarkup:coin=>coin.symbol,atlasChartTooltipChangeMarkup:()=>"",
  atlasFormatUSD:price=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",
   minimumFractionDigits:2,maximumFractionDigits:Math.abs(price)>=1000?2:Math.abs(price)>=1?4:6}).format(price),
  atlasFormatNativeChartQuote:(n,cur)=>n+" "+cur,
  atlasChartPeriodLabel:()=>"24 h",atlasPositionChartTooltip:()=>{},
  escapeHtml:v=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")};
 ctx.globalThis=ctx;
 ctx.AgentCryptoQuoteCurrencyArchitecture={snapshot:()=>({displayCurrency:currency})};
 ctx.AtlasMarketUniverse1000={find:id=>{
  const coin=coins.find(c=>c.id===id);
  return mismatch&&id==="bitcoin"?{...coin,id:"ethereum"}:coin;
 }};
 vm.createContext(ctx);
 vm.runInContext(functions,ctx);
 const point={dataIndex:0,dataset:chart.data.datasets[0],raw:{x:1,y:100},parsed:{x:1}};
 const run=()=>ctx.atlasExternalChartTooltip({chart,tooltip:{opacity:1,dataPoints:[point]}});
 return{node,run,chart,before};
}
test("Real 22-minute-old five-coin USD archive displays prices instead of blanks",()=>{
 const {node,run,chart,before}=setup();run();
 assert.equal(node.dataset.top5UsdOwner,"canonical-app");
 assert.equal(node.dataset.usdQuotesVerified,"5");
 assert.match(node.innerHTML,/PRIX USD · VARIATION 24 h/);
 assert.doesNotMatch(node.innerHTML,/COTATIONS USD MARKET|COURBES BASE 100/);
 assert.equal((node.innerHTML.match(/différé \(22 min\)/g)||[]).length,5);
 assert.doesNotMatch(node.innerHTML,/atlas-chart-tooltip-freshness/);
 assert.equal((node.innerHTML.match(/atlas-chart-tooltip-color-bridge/g)||[]).length,5);
 assert.equal((node.innerHTML.match(/<strong title=/g)||[]).length,5);
 assert.match(node.innerHTML,/80.?437/);
 assert.doesNotMatch(node.innerHTML,/PRIX HISTORIQUE USD NON DISPONIBLE|90000 EUR/);
 assert.equal(JSON.stringify(chart.data),before);
});
test("Exact coin identity blocks a wrong-asset price without blanking other rows",()=>{
 const {node,run}=setup({mismatch:true});run();
 assert.equal(node.dataset.usdQuotesVerified,"4");
 assert.equal((node.innerHTML.match(/Aucune observation USD datée/g)||[]).length,1);
 assert.doesNotMatch(node.innerHTML,/atlas-chart-tooltip-freshness/);
 assert.equal((node.innerHTML.match(/atlas-chart-tooltip-color-bridge/g)||[]).length,5);
});
test("Very old quotes stay labelled and EUR setting retains original path",()=>{
 const old=setup({outdated:true});old.run();
 assert.equal(old.node.dataset.usdQuotesVerified,"5");
 assert.match(old.node.innerHTML,/ancien/);
 const eur=setup({currency:"EUR"});eur.run();
 assert.equal(eur.node.dataset.top5UsdOwner,undefined);
});

test("USD Market prices for Hausses 5, Baisses 5 and Volumes 5 never inherit EUR historical prices",()=>{
 for(const preset of ["gainers","losers","volume"]){
  const {node,run,chart,before}=setup({preset});
  run();
  assert.equal(node.dataset.top5UsdOwner,"canonical-app",preset);
  assert.equal(node.dataset.displayCurrency,"USD",preset);
  assert.equal(node.dataset.usdQuotesVerified,"5",preset);
  assert.match(node.innerHTML,/PRIX USD · VARIATION 24 h/,preset);
  assert.doesNotMatch(node.innerHTML,/90000 EUR|90.?000 €|PRIX HISTORIQUE/,preset);
  assert.match(node.innerHTML,/80.?437/,preset);
  assert.equal(JSON.stringify(chart.data),before,"Historical Base100 curves must not be rewritten");
 }
});
test("EUR display keeps original historical price path for scanner presets",()=>{
 for(const preset of ["gainers","losers","volume"]){
  const {node,run}=setup({currency:"EUR",preset});
  run();
  assert.equal(node.dataset.top5UsdOwner,undefined,preset);
  assert.match(node.innerHTML,/PRIX HISTORIQUE/,preset);
  assert.match(node.innerHTML,/90000 EUR/,preset);
 }
});

test("Top 3 uses three explicit USD Market quotes, without converting EUR historical points",()=>{
 const {node,run,chart,before}=setup({preset:"rank-3"});
 run();
 assert.equal(node.dataset.top5UsdOwner,"canonical-app");
 assert.equal(node.dataset.displayCurrency,"USD");
 assert.equal(node.dataset.usdQuotesVerified,"3");
 assert.match(node.innerHTML,/PRIX USD · VARIATION 24 h/);
 assert.equal((node.innerHTML.match(/<strong title=/g)||[]).length,3);
 assert.doesNotMatch(node.innerHTML,/90000 EUR|PRIX HISTORIQUE/);
 assert.equal(JSON.stringify(chart.data),before);
});
test("Top 3 EUR switch retains historical EUR presentation",()=>{
 const {node,run}=setup({preset:"rank-3",currency:"EUR"});
 run();
 assert.equal(node.dataset.top5UsdOwner,undefined);
 assert.match(node.innerHTML,/PRIX HISTORIQUE/);
 assert.equal((node.innerHTML.match(/90000 EUR/g)||[]).length,3);
});

test("Top 3 USD comparison stores the SAME canonical key used by the overlay",()=>{
 const start=app.indexOf("async function renderComparisonAnalystPanel(");
 const stop=app.indexOf("\nfunction atlasNormalizeSparkline(",start);
 assert.ok(start>0 && stop>start,"Real comparison owner must be present");
 const section=app.slice(start,stop);
 const expression=section.match(/const chartKey = ([^;\n]+);/);
 assert.ok(expression,"Chart owner must have a context key");
 assert.equal(expression[1],"atlasExpectedChartContextKey(ids, period)");
 const actual=new Function("ids","period","atlasExpectedChartContextKey",`return (${expression[1]});`);
 const ids=["bitcoin","ethereum","binancecoin"];
 for(const currency of ["USD","EUR"]){
  for(const preset of ["rank-3","rank-5","gainers","losers","volume"]){
   const expected=(xs,p)=>`comparison:${xs.join(",")}:${p}`+
    (currency==="USD"&&preset!=="rank-5"?":USD":"");
   assert.equal(actual(ids,1,expected),expected(ids,1),preset+" "+currency);
  }
 }
});

test("Scanner keeps exactly the first five Market candidates (runtime function)",()=>{
 const start=app.indexOf("function atlasScannerStart(");
 const end=app.indexOf("\nfunction atlasHandleGainersClickV286(",start);
 assert.ok(start>0 && end>start,"Real scanner start owner is present");
 const coins=Array.from({length:8},(_,i)=>({id:"coin-"+i,symbol:"C"+i}));
 let captured=null;
 const ctx={
  console,AbortController,ATLAS_SCANNER_TARGET:5,
  ATLAS_SCANNER_PRESETS:new Set(["gainers","losers","volume"]),
  atlasScannerSequence:0,atlasScannerTransaction:null,atlasScannerQueuedRequest:null,
  state:{liveOk:true,coins,chartPeriodDays:1,sourceLock:{mode:"direct"},
    dataBroker:{market:{mode:"direct"}}},
  atlasScannerCancel:()=>{},atlasScannerInvalidateChartWork:()=>{},
  atlasScannerStateSnapshot:()=>({}),atlasScannerPool:()=>coins,
  atlasCurrentMarketFrame:()=>({id:"frame-test",mode:"direct",fingerprint:"f",
    validatedAssets:250,requestedAssets:250,timestamp:"2026-10-25T00:00:00Z"}),
  atlasScannerMarketMetricLabel:()=> "Market 24 h",
  atlasScannerLabel:preset=>preset,
  atlasScannerSetTransactionFlag:()=>{},atlasScannerSetUiState:()=>{},
  atlasMarketFrameShortId:()=> "Frame test",atlasScannerProgress:()=>{},
  atlasRenderComparisonControls:()=>{},
  atlasScannerVisibleFailure:()=>false,
  atlasScannerRun:tx=>{captured=tx;return Promise.resolve(true);}
 };
 ctx.globalThis=ctx;
 vm.createContext(ctx);
 vm.runInContext(app.slice(start,end),ctx);
 for(const preset of ["gainers","losers","volume"]){
  assert.equal(ctx.atlasScannerStart(preset,5),true,preset);
  assert.deepEqual([...captured.candidateIds],coins.slice(0,5).map(c=>c.id),
    preset+" must never backfill from positions 6-32");
 }
});
test("Scanner refuses incomplete/wrong-order graph and refreshes dated caches",()=>{
 const begin=app.indexOf("function atlasScannerCommit(");
 const end=app.indexOf("\nfunction atlasScannerStoredHistory(",begin);
 assert.ok(begin>0 && end>begin);
 const commit=app.slice(begin,end);
 assert.match(commit,/prevalidated\.length !== ATLAS_SCANNER_TARGET/);
 assert.match(commit,/entry\.coin\?\.id !== tx\.candidateIds\[index\]/);
 const runStart=app.indexOf("async function atlasScannerRun(");
 const runEnd=app.indexOf("\nfunction atlasScannerStart(",runStart);
 assert.ok(runStart>0 && runEnd>runStart);
 const run=app.slice(runStart,runEnd);
 assert.match(run,/!atlasChartNeedsRefresh\(stored, tx\.period\)/);
 assert.match(run,/const queued = new Set\(networkQueue\.map\(coin => coin\.id\)\)/);
 assert.match(run,/if \(existing >= 0\) accepted\[existing\] = refreshed/);
 assert.match(run,/if \(finalEntries\.length === ATLAS_SCANNER_TARGET\)/);
 assert.doesNotMatch(run,/if \(finalEntries\.length >= 1\)/);
 assert.match(run,/Séries non affichées/);
});
