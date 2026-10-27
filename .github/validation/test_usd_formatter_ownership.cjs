"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const source=fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/graph-native-usd-406520.js","utf8");
function context(currency="USD"){
 const c={console,Date,Intl,Number,String,Array,Symbol,Object,
  state:{chartPeriodDays:7,dataBroker:{comparison:{preset:"rank-3"}}},
  document:{readyState:"loading",documentElement:{dataset:{}},addEventListener:()=>{},
    getElementById:()=>null,querySelector:()=>null},
  AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:currency})},
  atlasFormatEUR:n=>"ORIGINAL-EUR:"+n
 };
 c.atlasExternalChartTooltip=()=>c.atlasFormatEUR(123.45);
 c.globalThis=c;vm.createContext(c);vm.runInContext(source,c);
 c.AgentCryptoGraphNativeUsd406520.install();
 return c;
}
test("USD history render cannot temporarily replace the shared EUR formatter",()=>{
 const ctx=context("USD");
 const before=ctx.atlasFormatEUR;
 const result=ctx.atlasExternalChartTooltip({
  chart:{data:{datasets:[{atlasHistoricalQuote:{currency:"USD"},atlasCoin:{id:"bitcoin"}}]}},
  tooltip:{dataPoints:[{dataset:{atlasCoin:{id:"bitcoin"}}}]}
 });
 assert.equal(result,"ORIGINAL-EUR:123.45");
 assert.equal(ctx.atlasFormatEUR,before);
});
test("EUR historical render preserves the original EUR formatter",()=>{
 const ctx=context("EUR");const before=ctx.atlasFormatEUR;
 assert.equal(ctx.atlasExternalChartTooltip({}),"ORIGINAL-EUR:123.45");
 assert.equal(ctx.atlasFormatEUR,before);
});
test("no global text replacement or global formatter override remains in USD module",()=>{
 assert.doesNotMatch(source,/function withFmt\s*\(/);
 assert.doesNotMatch(source,/replaceAll\s*\(\s*"Prix EUR"\s*,\s*"Prix USD"/);
 assert.doesNotMatch(source,/globalThis\.atlasFormatEUR\s*=/);
});
