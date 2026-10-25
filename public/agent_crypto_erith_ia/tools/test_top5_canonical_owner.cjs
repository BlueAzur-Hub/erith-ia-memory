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
function setup({currency="USD",outdated=false,mismatch=false}={}){
 const coins=market.map(([id,symbol,priceUsd])=>({id,symbol,name:symbol,priceUsd,
  usdUpdatedAt:outdated?"2026-10-20T00:00:00Z":observedAt}));
 // A mismatching universe ID must not be rescued by a second price on the chart dataset.
 if(mismatch){delete coins[0].priceUsd;delete coins[0].usdUpdatedAt;}
 const state={chartPeriodDays:1,coins:[],dataBroker:{comparison:{preset:"rank-5"},spotBook:{quotes:{}}}};
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
