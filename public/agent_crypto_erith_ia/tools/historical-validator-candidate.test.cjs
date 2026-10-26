"use strict";
// Isolation-only candidate: transforms a copy of the existing validator in VM.
// It NEVER patches administrator/app.js or installs a browser wrapper.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.resolve(__dirname,"../administrator/app.js"),"utf8");
const start=source.indexOf("function atlasValidateChartSeries(");
const end=source.indexOf("\nconst atlasChartLocalStoreRuntime",start);
assert.ok(start>0&&end>start);
const original=source.slice(start,end);
const signature='sourceMode = "coingecko-direct" })';
const oldGap=`  let priceGapPct = null;
  if (atlasCoinPriceIsComparable(c, lastTimestamp) && Number.isFinite(Number(c.price)) && Number(c.price) > 0) {
    priceGapPct = Math.abs(lastPrice - Number(c.price)) / Number(c.price) * 100;
    if (priceGapPct > ATLAS_CHART_PRICE_GAP_WARN_PCT) warnings.push(\`écart prix/courbe : \${priceGapPct.toFixed(2)} %\`);
  }`;
const newGap=`  let priceGapPct = null;
  // The quote identity is explicit and immutable for this historical series.
  // Unknown/USDT/USDC -> skip ONLY spot parity, not historical integrity checks.
  const currency = String(quoteCurrency || "").toUpperCase();
  const spotValue = currency === "EUR" ? c?.priceEur : currency === "USD" ? c?.priceUsd : null;
  const spot = spotValue == null || spotValue === "" ? NaN : Number(spotValue);
  const sameProvider = String(historySourceFamily || "").toLowerCase() === "coingecko"
    && String(c?.source || "").toLowerCase().includes("coingecko");
  const spotAt = Date.parse(c?.spotUpdatedAt || c?.timestamp || "");
  const timeOk = Number.isFinite(spotAt) && Math.abs(spotAt - lastTimestamp) <= 20 * 60 * 1000;
  if (sameProvider && timeOk && Number.isFinite(spot) && spot > 0) {
    priceGapPct = Math.abs(lastPrice - spot) / spot * 100;
    if (priceGapPct > ATLAS_CHART_PRICE_GAP_WARN_PCT) warnings.push(\`écart prix/courbe : \${priceGapPct.toFixed(2)} %\`);
  }`;
assert.ok(original.includes(signature)&&original.includes(oldGap));
const candidate=original.replace(signature,'sourceMode = "coingecko-direct", quoteCurrency = null, historySourceFamily = null })').replace(oldGap,newGap);
function instantiate(){
 const context={
  atlasChartRules:()=>({minPoints:2,minCoverageHours:1}),
  atlasChartCoverageHours:series=>(series.at(-1)[0]-series[0][0])/3600000,
  atlasChartFreshness:()=>({level:"fresh",ageMs:0,label:"frais"}),
  atlasCoinPriceIsComparable:()=>true,
  ATLAS_CHART_MAX_FUTURE_MS:5*60*1000,
  ATLAS_CHART_PRICE_GAP_WARN_PCT:2.5,
  Math,Date,Number,Array
 };
 vm.runInNewContext(candidate+"\nthis.validate=atlasValidateChartSeries;",context,{timeout:1000});
 return context.validate;
}
const now=Date.now()-1000,points=[[now-60*60*1000,80500],[now,80159.306935]];
const coin={id:"bitcoin",source:"CoinGecko",price:71366.61,priceEur:71366.61,priceUsd:80159.31,spotUpdatedAt:new Date(now).toISOString()};
function check(opts={}){return instantiate()({c:coin,days:1,prices:points,sourceMode:"coingecko-direct",...opts});}
test("candidate preserves coverage and chronological validation",()=>{
 assert.equal(check({prices:[[now,80000]]}).ok,false);
 assert.equal(check({prices:[[now,80000],[now-60000,80010]]}).ok,false);
 assert.equal(check({prices:[[now-1000,80000],[now,80010]]}).ok,false);
});
test("candidate uses USD spot for USD historical chart, EUR for EUR chart",()=>{
 const usd=check({quoteCurrency:"USD",historySourceFamily:"coingecko"});
 assert.equal(usd.ok,true);assert.ok(usd.metrics.priceGapPct<0.01);
 const eurSeries=[[now-60*60*1000,72000],[now,71366.61]];
 const eur=check({quoteCurrency:"EUR",historySourceFamily:"coingecko",prices:eurSeries});
 assert.equal(eur.ok,true);assert.ok(eur.metrics.priceGapPct<0.01);
});
test("candidate keeps true price disparity warning in same currency",()=>{
 const wrong=check({quoteCurrency:"USD",historySourceFamily:"coingecko",c:{...coin,priceUsd:70000}});
 assert.equal(wrong.ok,true);assert.ok(wrong.metrics.priceGapPct>10);
 assert.ok(wrong.warnings.some(x=>x.includes("écart prix/courbe")));
});
test("candidate skips only parity for unknown/USDT/mismatched source, no fake EUR label",()=>{
 for(const quoteCurrency of [null,"USDT","USDC"]){const r=check({quoteCurrency,historySourceFamily:"coingecko"});assert.equal(r.ok,true);assert.equal(r.metrics.priceGapPct,null);}
 const wrongSource=check({quoteCurrency:"USD",historySourceFamily:"binance"});
 assert.equal(wrongSource.ok,true);assert.equal(wrongSource.metrics.priceGapPct,null);
 const oldSpot=check({quoteCurrency:"USD",historySourceFamily:"coingecko",c:{...coin,spotUpdatedAt:"2026-10-20T01:00:00Z"}});
 assert.equal(oldSpot.metrics.priceGapPct,null);
});
