"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const app=fs.readFileSync("public/agent_crypto_erith_ia/administrator/app.js","utf8");
function source(a,b){const i=app.indexOf(a),j=app.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,a);return app.slice(i,j);}
function context(currency){
 const grid={innerHTML:""},f={console,Date,Number,String,Array,Math,Set,Intl,
  AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:currency})},
  els:{assetDetailGrid:grid,selectedAssetTitle:{}},
  setText:()=>{},atlasRenderCompactDetailSummary:()=>{},escapeHtml:v=>String(v),
  atlasChartPeriodLabel:p=>p+"j",atlasChartLabelFull:v=>String(v),
  atlasFormatNativeChartQuote:(v,c)=>c+":"+v,
  atlasSetCompactReading:()=>{},atlasEnsureSourceDock:()=>{}};
 f.globalThis=f;vm.createContext(f);vm.runInContext(
  source("function atlasHistoryQuoteProvenance(","\nfunction atlasValidateChartSeries(")+
  source("function atlasHistoricalDisplayQuote(","\nfunction atlasComparisonTooltipRows(")+
  source("function atlasChartQuoteBasis(","\nfunction atlasDetailReferenceSpot(")+
  source("function atlasExternalChartDetail(","\nfunction atlasExternalChartDraw("),f);
 return{f,grid};
}
const coin={name:"Bitcoin",id:"bitcoin",symbol:"BTC",priceEur:71000,priceUsd:80000};
const metrics=(price)=>({metrics:{lastPrice:price,lastTimestamp:Date.now(),pointCount:280,coverageHours:24}});
test("historical quote cannot be guessed from display",()=>{
 for(const selection of ["EUR","USD"]){
  const {f,grid}=context(selection);
  let result={source:"Undocumented quote",integrity:metrics(71111)};
  f.atlasExternalChartDetail(coin,1,result,"valid");
  assert.match(grid.innerHTML,/Dernier point \(devise non qualifiée\)/);
  assert.doesNotMatch(grid.innerHTML,/(?:EUR|USD):71111/);
  assert.equal(f.atlasChartQuoteBasis(result),null);
  result={source:"CoinGecko market_chart EUR",sourceFamily:"coingecko",currency:"EUR",quoteCurrency:"EUR",integrity:metrics(71111)};
  f.atlasExternalChartDetail(coin,1,result,"valid");
  assert.match(grid.innerHTML,/Dernier point \(EUR\)/);
  assert.match(grid.innerHTML,/EUR:71111/);
  assert.equal(f.atlasChartQuoteBasis(result),"EUR");
  result={source:"CoinGecko market_chart USD",sourceFamily:"coingecko",currency:"USD",quoteCurrency:"USD",integrity:metrics(80111)};
  f.atlasExternalChartDetail(coin,1,result,"valid");
  assert.match(grid.innerHTML,/Dernier point \(USD\)/);
  assert.match(grid.innerHTML,/USD:80111/);
  assert.equal(f.atlasChartQuoteBasis(result),"USD");
  result={source:"CoinGecko market_chart USD",sourceFamily:"coingecko",currency:"EUR",quoteCurrency:"EUR",integrity:metrics(71111)};
  f.atlasExternalChartDetail(coin,1,result,"valid");
  assert.match(grid.innerHTML,/Dernier point \(devise non qualifiée\)/);
  assert.doesNotMatch(grid.innerHTML,/USD:71111/);
  assert.equal(f.atlasChartQuoteBasis(result),null);
 }
});
test("scanner USD selection applies to every period, EUR can use legacy history",()=>{
 const scanner=source("function atlasScannerNativeUsdRequested(","\nfunction atlasScannerNativeUsdKey(");
 for(const currency of ["EUR","USD"]){
  const f={Number,String,Array,globalThis:null,AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:currency})}};
  f.globalThis=f;vm.createContext(f);vm.runInContext(scanner,f);
  for(const period of [1,7,30,60,90,365,36500]){
   assert.equal(f.atlasScannerNativeUsdRequested({period}),currency==="USD");
  }
 }
});
