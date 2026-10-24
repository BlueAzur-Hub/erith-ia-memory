"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const source="./graph-native-usd-406520.js";
const originalGlobals={};
function setup(){
 for(const name of ["document","state","window","atlasExternalChartTooltip","atlasChartV2EffectiveView",
  "AgentCryptoQuoteCurrencyArchitecture","AtlasExternalChart","AgentCryptoNewListingsNativeCategory",
  "AgentCryptoGraphNativeUsd406520","atlasChartPriceDatasets","atlasChartLivePresentation",
  "AtlasMarketUniverse1000"])originalGlobals[name]=globalThis[name];
 const heading={textContent:"PRIX LIVE BINANCE"};
 const price={textContent:"ancien prix",title:""};
 const tooltip={hidden:false,dataset:{},
  querySelector(sel){return sel===".atlas-chart-tooltip-date"?heading:null;},
  querySelectorAll(sel){return sel===".atlas-chart-tooltip-row .atlas-chart-tooltip-values strong"?[price]:[];}
 };
 globalThis.document={readyState:"loading",addEventListener(){},documentElement:{dataset:{}},
   getElementById(id){return id==="atlasChartTooltip"?tooltip:null;},
   querySelector(sel){return sel==="#atlasChartTooltip .atlas-chart-tooltip-date"?heading:null;}};
 globalThis.state={chartPeriodDays:1,dataBroker:{comparison:{preset:"rank-5"}}};
 globalThis.AgentCryptoQuoteCurrencyArchitecture={snapshot:()=>({displayCurrency:"USD"})};
 const active={active:true,coin_id:"concrete"};
 globalThis.AtlasExternalChart={state:()=>active};
 const selected={selectedId:"concrete",selectedSymbol:"CT",selectedPair:"CT/USDT",selectedProvider:"okx"};
 const snapshot={currency:"USD",instrument:"CT/USDT",provider:"okx",
  source:"OKX CT/USDT candles · USDT/USD CoinGecko",
  series:Array.from({length:50},(_,i)=>[i*3600000,0.3+i*.001])};
 globalThis.AgentCryptoNewListingsNativeCategory={snapshot:()=>selected,mathSeriesSnapshot:()=>snapshot};
 globalThis.atlasChartV2EffectiveView=()=>"price";
 globalThis.atlasExternalChartTooltip=()=>{price.textContent="ancien prix";heading.textContent="PRIX LIVE BINANCE";return "original"};
 delete require.cache[require.resolve(source)];require(source);
 globalThis.AgentCryptoGraphNativeUsd406520.install();
 const point=(n=36,id="concrete")=>({dataIndex:n,parsed:{y:snapshot.series[n][1],x:snapshot.series[n][0]},
  dataset:{atlasCoin:{id},label:"CT"},raw:{x:snapshot.series[n][0],y:snapshot.series[n][1]}});
 return{heading,price,tooltip,active,selected,snapshot,point,
  run:(pt)=>globalThis.atlasExternalChartTooltip({chart:{},tooltip:{dataPoints:[pt]}})};
}
function cleanup(){
 for(const [k,v]of Object.entries(originalGlobals)){
  if(v===undefined)delete globalThis[k];else globalThis[k]=v;
 }
 delete require.cache[require.resolve(source)];
}
test("CT external USD-converted candles restore a real dollar tooltip despite saved Top5 preset",()=>{
 const s=setup();try{
  assert.equal(s.run(s.point()),"original");
  assert.match(s.price.textContent,/0,336/);
  assert.match(s.price.textContent,/(\$US|USD|US\$)/);
  assert.match(s.heading.textContent,/PRIX HISTORIQUE USD/);
  assert.match(s.heading.textContent,/CT\/USDT/);
  assert.equal(s.tooltip.dataset.priceSource,"exchange-candles-usd-reference");
 }finally{cleanup()}
});
test("DNA on Bitget is supported by the same exact source-pair and converted USD proof",()=>{
 const s=setup();try{
  s.active.coin_id="neosoul";s.selected.selectedId="neosoul";
  s.selected.selectedPair="DNA/USDT";s.selected.selectedProvider="bitget";s.selected.selectedSymbol="DNA";
  s.snapshot.instrument="DNA/USDT";s.snapshot.provider="bitget";
  s.snapshot.source="Bitget DNA/USDT candles · USDT/USD CoinGecko";
  s.snapshot.series[36][1]=0.258355;
  s.run(s.point(36,"neosoul"));
  assert.match(s.price.textContent,/0,258355/);
  assert.match(s.heading.textContent,/Bitget DNA\/USDT/);
 }finally{cleanup()}
});
test("Top5 native EUR history is STILL suppressed and not disguised as historical USD",()=>{
 const s=setup();try{
  s.active.active=false;
  s.run(s.point());
  assert.match(s.heading.textContent,/PRIX HISTORIQUE USD NON DISPONIBLE/);
  assert.equal(s.price.textContent,"—");
  assert.equal(s.tooltip.dataset.priceSource,"usd-history-unavailable");
 }finally{cleanup()}
});
test("Missing exchange quote conversion, identity mismatch or normalized Base100 cannot forge USD",()=>{
 for(const tamper of [
  s=>{s.snapshot.currency="USDT";},
  s=>{s.selected.selectedId="another-coin";},
  s=>{s.snapshot.series[36][1]=0.9;},
  s=>{globalThis.atlasChartV2EffectiveView=()=>"base100";}
 ]){
  const s=setup();try{
   const hovered=s.point(); // Capture the chart sample before changing its verified source.
   tamper(s);s.run(hovered);
   assert.equal(s.price.textContent,"—");
   assert.match(s.heading.textContent,/PRIX HISTORIQUE USD NON DISPONIBLE/);
  }finally{cleanup()}
 }
});

test("Top 5 USD snapshot fixes five legacy euro labels, but fails closed on coin mismatch",()=>{
 const s=setup();try{
  s.active.active=false;
  const coins=[
   {id:"bitcoin",symbol:"BTC",usd:80740.51},
   {id:"ethereum",symbol:"ETH",usd:2377.41},
   {id:"binancecoin",symbol:"BNB",usd:737.5195},
   {id:"ripple",symbol:"XRP",usd:1.2883},
   {id:"solana",symbol:"SOL",usd:102.0162}
  ];
  const at=new Date().toISOString();
  globalThis.state.dataBroker.spotBook={status:"ready",quotes:Object.fromEntries(
    coins.map(c=>[c.id,{usd:c.usd,change24hUsd:-1,timestamp:at}]))};
  const datasets=coins.map(c=>({atlasCoin:{id:c.id,symbol:c.symbol},data:[1,2]}));
  globalThis.atlasChartPriceDatasets=()=>datasets;
  globalThis.atlasChartLivePresentation=()=>null;
  const rows=coins.map(c=>{
   const price={textContent:"80 000,00 €",title:"legacy EUR"};
   return{textContent:c.symbol+" "+c.id,price,
     querySelector(sel){return sel===".atlas-chart-tooltip-values strong"?price:null}};
  });
  s.tooltip.querySelectorAll=sel=>sel===".atlas-chart-tooltip-row"?rows:
    sel===".atlas-chart-tooltip-row .atlas-chart-tooltip-values strong"?rows.map(r=>r.price):[];
  const point={dataIndex:1,dataset:datasets[0],raw:{y:50}};
  assert.equal(s.run(point),"original");
  assert.match(s.heading.textContent,/PRIX SNAPSHOT COINGECKO USD/);
  assert.equal(s.tooltip.dataset.priceSource,"coingecko-native-usd");
  for(const row of rows){
   assert.ok(["$US","USD","US$"].some(mark=>row.price.textContent.includes(mark)),row.price.textContent);
   assert.equal(row.price.textContent.includes("€"),false);
   assert.match(row.price.title,/CoinGecko USD natif/);
  }
  rows[0].textContent="ETH Ethereum"; // two ETH labels: both fail identity guard
  s.run(point);
  assert.equal(s.tooltip.dataset.priceSource,"coingecko-native-usd-partial");
  assert.equal(rows[0].price.textContent,"—");
  assert.equal(rows[1].price.textContent,"—");
  assert.ok(rows.slice(2).every(r=>r.price.textContent.includes("$US")));
 }finally{cleanup()}
});


test("Top 5 reads the fresh Market universe when state.coins is stale",()=>{
 const s=setup();try{
  s.active.active=false;
  const coins=[
   {id:"bitcoin",symbol:"BTC",usd:80740.51},
   {id:"ethereum",symbol:"ETH",usd:2377.41},
   {id:"binancecoin",symbol:"BNB",usd:737.5195},
   {id:"ripple",symbol:"XRP",usd:1.2883},
   {id:"solana",symbol:"SOL",usd:102.0162}
  ];
  const at=new Date().toISOString(),outdated="2026-10-20T00:00:00Z";
  // In Firefox the Market has reloaded while the graph still owns old rows.
  globalThis.state.coins=coins.map(c=>({id:c.id,symbol:c.symbol,
    priceUsd:c.usd+500,usdUpdatedAt:outdated,lastUpdated:at}));
  globalThis.state.dataBroker.spotBook={status:"stale",quotes:{}};
  globalThis.AtlasMarketUniverse1000={find:id=>{
    const c=coins.find(item=>item.id===id);
    return c?{id:c.id,symbol:c.symbol,priceUsd:c.usd,usdUpdatedAt:at,
      lastUpdated:outdated}:null;
  }};
  const datasets=coins.map(c=>({atlasCoin:{id:c.id,symbol:c.symbol},data:[1,2]}));
  globalThis.atlasChartPriceDatasets=()=>datasets;
  const rows=coins.map(c=>{
   const price={textContent:"EUR legacy",title:""};
   return{textContent:c.symbol+" "+c.id,price,
     querySelector(sel){return sel===".atlas-chart-tooltip-values strong"?price:null}};
  });
  s.tooltip.querySelectorAll=sel=>sel===".atlas-chart-tooltip-row"?rows:
    sel===".atlas-chart-tooltip-row .atlas-chart-tooltip-values strong"?rows.map(r=>r.price):[];
  const point={dataIndex:1,dataset:datasets[0],raw:{y:50}};
  assert.equal(s.run(point),"original");
  assert.equal(s.tooltip.dataset.usdQuotesVerified,"5");
  for(let i=0;i<rows.length;i++){
   const expected=new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",
    minimumFractionDigits:2,maximumFractionDigits:Math.abs(coins[i].usd)>=1000?2:
      Math.abs(coins[i].usd)>=1?4:6}).format(coins[i].usd);
   assert.equal(rows[i].price.textContent,expected);
   assert.equal(rows[i].price.textContent.includes("€"),false);
  }
  // A different asset cannot lend a USD quote to a BTC chart row.
  const finder=globalThis.AtlasMarketUniverse1000.find;
  globalThis.AtlasMarketUniverse1000.find=id=>id==="bitcoin"?
    {id:"ethereum",priceUsd:9999,usdUpdatedAt:at}:finder(id);
  s.run(point);
  assert.equal(rows[0].price.textContent,"—");
  assert.equal(s.tooltip.dataset.usdQuotesVerified,"4");
 }finally{cleanup()}
});

test("Original app.js canonical Top5: archived 22-minute USD quotes remain visible",()=>{
 const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
 const app=fs.readFileSync(path.resolve(__dirname,"../app.js"),"utf8");
 const begin=app.indexOf("function atlasChartMarketUsdObservation(");
 const end=app.indexOf("\nfunction atlasSetChartCaptionHtml(",begin);
 assert.ok(begin>0&&end>begin,"canonical owner exists in original app.js");
 const observedAt="2026-10-24T22:32:49.000Z";
 const now=Date.parse("2026-10-24T22:55:00Z");
 const coins=[
  {id:"bitcoin",symbol:"BTC",priceUsd:80437.89973802774},
  {id:"ethereum",symbol:"ETH",priceUsd:2341.0025931601263},
  {id:"binancecoin",symbol:"BNB",priceUsd:734.1045219010529},
  {id:"ripple",symbol:"XRP",priceUsd:1.2909162994725298},
  {id:"solana",symbol:"SOL",priceUsd:101.46876996639266}
 ].map(c=>({...c,usdUpdatedAt:observedAt}));
 const state={chartPeriodDays:1,coins:[],dataBroker:{comparison:{preset:"rank-5"},spotBook:{status:"stale",quotes:{}}}};
 const datasets=coins.map(c=>({atlasCoin:c,data:[{x:1,y:100,rawPrice:70000}]}));
 const chart={$atlasMode:"comparison",$atlasPeriod:1,$atlasQuoteCurrency:"EUR",data:{datasets}};
 const copy=JSON.stringify(chart.data);
 const tooltip={hidden:true,dataset:{},innerHTML:"",setAttribute(){}};
 const env={state,Intl,Number,Math,Array,JSON,
  globalThis:null,
  document:{getElementById(id){return id==="atlasChartTooltip"?tooltip:null}},
  escapeHtml:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"),
  atlasHasPositiveQuote:x=>x!=null&&x!==""&&Number(x)>0,
  atlasChartTooltipNode:()=>tooltip,atlasHideChartTooltip:()=>{tooltip.hidden=true;},
  atlasComparisonTooltipRows:()=>datasets.map(d=>({coin:d.atlasCoin,rawPrice:70000,baseValue:100,color:"red"})),
  atlasChartPriceDatasets:()=>datasets,atlasChartLivePresentation:()=>null,
  atlasCryptoPalette:()=>({primary:"#fff"}),atlasCryptoGradientCss:()=>"none",
  atlasChartTooltipCoinMarkup:c=>"<span>"+c.symbol+"</span>",
  atlasChartTooltipChangeMarkup:()=>"<small>Base100</small>",
  atlasFormatUSD:n=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",
   minimumFractionDigits:2,maximumFractionDigits:Math.abs(n)>=1000?2:4}).format(n),
  atlasFormatNativeChartQuote:()=> "70000 €",
  atlasChartPeriodLabel:()=> "24h",atlasPositionChartTooltip:()=>{},
  requestAnimationFrame:fn=>fn()
 };
 class FrozenDate extends Date {static now(){return now;}static parse(x){return Date.parse(x);}}
 env.Date=FrozenDate;env.globalThis=env;
 env.AgentCryptoQuoteCurrencyArchitecture={snapshot:()=>({displayCurrency:"USD"})};
 env.AtlasMarketUniverse1000={find:id=>coins.find(c=>c.id===id)||null};
 vm.createContext(env);
 vm.runInContext(app.slice(begin,end),env,{filename:"administrator/app.js:canonical-tooltip"});
 env.atlasExternalChartTooltip({chart,tooltip:{opacity:1,dataPoints:[{dataset:datasets[0],dataIndex:0,parsed:{x:1},raw:{x:1}}]}});
 assert.equal(tooltip.dataset.top5UsdOwner,"canonical-app");
 assert.equal(tooltip.dataset.usdQuotesVerified,"5");
 assert.match(tooltip.innerHTML,/5 différée\\(s\\)/);
 assert.equal((tooltip.innerHTML.match(/différé · 22 min/g)||[]).length,5);
 for(const c of coins)assert.ok(tooltip.innerHTML.includes(env.atlasFormatUSD(c.priceUsd)),c.id);
 assert.doesNotMatch(tooltip.innerHTML,/70000 €|PRIX HISTORIQUE USD NON DISPONIBLE/);
 assert.equal(JSON.stringify(chart.data),copy,"Base100 untouched");
});
