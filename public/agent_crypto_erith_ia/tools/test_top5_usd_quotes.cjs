"use strict";
const test=require("node:test"), assert=require("node:assert/strict");
const vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../administrator/js/graph-native-usd-406520.js"),"utf8");
const IDs=["bitcoin","ethereum","binancecoin","ripple","solana"];
const SYMBOLS=["BTC","ETH","BNB","XRP","SOL"];
const USD=[80500.51,2380.41,738.51,1.29,102.12];
const AT="2026-10-24T08:00:00Z",NOW=Date.parse("2026-10-24T08:05:00Z");
const FrozenDate=class extends Date{constructor(...args){super(...args.length?args:[NOW])}static now(){return NOW;}};
const moneyExpected=n=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(n);
function build(opts={}){
 const coins=IDs.map((id,i)=>({id,symbol:SYMBOLS[i],name:["Bitcoin","Ethereum","BNB","XRP","Solana"][i],
   priceUsd:USD[i],spotUpdatedAt:AT}));
 const rows=(opts.rows||[0,1,2,3,4]).map(i=>{
   const field={textContent:"99999,99 €",title:"legacy EUR"};
   return {textContent:SYMBOLS[i]+" "+coins[i].name+" 99999,99 €",
     coin:coins[i],field,querySelector(sel){assert.equal(sel,".atlas-chart-tooltip-values strong");return field;}};
 });
 const title={textContent:"Prix en EUR"};
 const root={hidden:false,dataset:{},
   querySelector(sel){return sel===".atlas-chart-tooltip-date"?title:null;},
   querySelectorAll(sel){return sel===".atlas-chart-tooltip-row"?rows:[];}};
 const spotBook={status:"ready",quotes:Object.fromEntries(coins.map((c,i)=>[c.id,
   {usd:USD[i],change24hUsd:-1,timestamp:AT}]))};
 if(opts.staleId)spotBook.quotes[opts.staleId].timestamp="2026-10-24T07:00:00Z";
 if(opts.noBook)spotBook.status="unavailable";
 const state={chartPeriodDays:1,dataBroker:{comparison:{preset:"rank-5"},spotBook},
   coins:opts.noCoins?[]:coins};
 const context={Date:FrozenDate,state,document:{readyState:"complete",
     getElementById(n){return n==="atlasChartTooltip"?root:null;}},
   atlasChartPriceDatasets(){return coins.map(c=>({atlasCoin:c,data:[1,2,3]}));},
   atlasExternalChartTooltip(){return "legacy-rendered";},
   atlasFetchComparisonSeriesResilient(){return "canonical-broker";},
   atlasChartLivePresentation(){return null;},
   AgentCryptoQuoteCurrencyArchitecture:{snapshot(){return {displayCurrency:"USD"};}},
   Intl,Number,String,Array,Object,Map,Set,Math,RegExp,Symbol,console};
 context.globalThis=context;
 vm.runInNewContext(source,context,{filename:"graph-native-usd-406520.js"});
 const run=()=>context.atlasExternalChartTooltip({chart:{},tooltip:{dataPoints:[{
   dataset:{atlasCoin:coins[0],data:[1,2,3]},dataIndex:1
 }]}});
 return {rows,root,title,context,run,spotBook,coins};
}
test("Top5 maps five fresh USD snapshots to the right symbols even when DOM order differs",()=>{
 const m=build({rows:[4,2,0,3,1]});assert.equal(m.run(),"legacy-rendered");
 for(const row of m.rows){
  const i=IDs.indexOf(row.coin.id);
  assert.equal(row.field.textContent,moneyExpected(USD[i]),row.coin.symbol);
  assert.ok(!row.field.textContent.includes("€"));
  assert.match(row.field.title,/CoinGecko/);
 }
 assert.equal(m.root.dataset.usdQuotesVerified,"5");
 assert.match(m.title.textContent,/5\/5 vérifiées/);
 assert.match(m.title.textContent,/distinctes des courbes historiques Base 100/);
 assert.equal(m.context.atlasFetchComparisonSeriesResilient({id:"bitcoin"},1),"canonical-broker");
});
test("A stale USD quote never leaks an old EUR price or erases unrelated USD rows",()=>{
 const m=build({rows:[1,0,2,3,4],staleId:"bitcoin",noCoins:true});
 m.run();
 const btc=m.rows.find(x=>x.coin.symbol==="BTC");
 const eth=m.rows.find(x=>x.coin.symbol==="ETH");
 assert.equal(btc.field.textContent,"—");
 assert.equal(eth.field.textContent,moneyExpected(USD[1]));
 assert.equal(m.root.dataset.usdQuotesVerified,"4");
 assert.ok(m.rows.every(x=>!x.field.textContent.includes("€")));
});
test("A validated CoinGecko USD price may replace an unavailable spotBook with source timestamp",()=>{
 const m=build({noBook:true});m.run();
 assert.equal(m.rows[0].field.textContent,moneyExpected(USD[0]));
 assert.equal(m.root.dataset.usdQuotesVerified,"5");
});
test("No dated USD evidence leaves all old EUR amounts hidden",()=>{
 const m=build({noBook:true,noCoins:true});m.run();
 assert.equal(m.root.dataset.usdQuotesVerified,"0");
 assert.ok(m.rows.every(x=>x.field.textContent==="—"));
 assert.match(m.title.textContent,/NON DISPONIBLES/);
});
test("Ambiguous duplicate BTC label is never silently attributed to another asset",()=>{
 const m=build({rows:[0,0,2,3,4],noCoins:true});m.run();
 assert.equal(m.rows[0].field.textContent,moneyExpected(USD[0]));
 assert.equal(m.rows[1].field.textContent,"—");
 assert.equal(m.root.dataset.usdQuotesVerified,"4");
});
