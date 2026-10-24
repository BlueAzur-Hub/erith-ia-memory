"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const source="./graph-native-usd-406520.js";
const originalGlobals={};
function setup(){
 for(const name of ["document","state","window","atlasExternalChartTooltip","atlasChartV2EffectiveView",
  "AgentCryptoQuoteCurrencyArchitecture","AtlasExternalChart","AgentCryptoNewListingsNativeCategory",
  "AgentCryptoGraphNativeUsd406520","atlasChartPriceDatasets","atlasChartLivePresentation"])originalGlobals[name]=globalThis[name];
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
  rows[0].textContent="ETH Ethereum"; // BTC attribution lost: blank BTC only, preserve independently verified assets
  s.run(point);
  assert.equal(s.tooltip.dataset.priceSource,"coingecko-native-usd-partial");
  assert.equal(rows[0].price.textContent,"—");
  assert.ok(rows.slice(1).every(r=>r.price.textContent.includes("$US")));
 }finally{cleanup()}
});
