"use strict";
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const path = require("node:path");
const base = path.resolve(__dirname,"../administrator");
const app = fs.readFileSync(path.join(base,"app.js"),"utf8");
const usd = fs.readFileSync(path.join(base,"js/graph-native-usd-406520.js"),"utf8");
const html = fs.readFileSync(path.join(base,"index.html"),"utf8");
const build = JSON.parse(fs.readFileSync(path.join(base,"build.json"),"utf8"));
let total = 0;
function check(name,fn){try{fn();++total;console.log("PASS",name)}catch(e){console.error("FAIL",name,e.stack);process.exitCode=1}}
function fnSlice(source,start,next) {
 const a=source.indexOf(start);const b=source.indexOf(next,a+start.length);
 assert.ok(a>=0 && b>a, "function bounds "+start);
 return source.slice(a,b);
}
new vm.Script(app,{filename:"app.js"});
new vm.Script(usd,{filename:"graph-native-usd-406520.js"});
const quotes={bitcoin:{eur:100,usd:110,change24hEur:10,change24hUsd:5,timestamp:"2026-10-29T14:00:00.000Z"}};
check("01 canonical Top3 and Top5 IDs unchanged",()=>{
 const body=fnSlice(app,"function atlasCuratedTopIds(","function atlasCuratedTopCoins(");
 const f=vm.runInNewContext("(()=>{const ATLAS_CURATED_TOP3_IDS=Object.freeze(['bitcoin','ethereum','binancecoin']);const ATLAS_CURATED_TOP5_IDS=Object.freeze(['bitcoin','ethereum','binancecoin','ripple','solana']);"+body+";return atlasCuratedTopIds})()");
 assert.deepEqual(Array.from(f(5)),["bitcoin","ethereum","binancecoin","ripple","solana"]);
 assert.deepEqual(Array.from(f(3)),["bitcoin","ethereum","binancecoin"]);
 assert.match(app,/top5: ATLAS_CURATED_TOP5_IDS,/);
});
check("02 static target stays visible across Solo mode",()=>{
 assert.match(app,/label\.textContent = "TARGET TOP 5 LIVE";/);
 assert.match(app,/symbols\.textContent = "BTC · ETH · BNB · XRP · SOL";/);
 assert.match(html,/id="targetTop5CycleLabel">TARGET TOP 5 LIVE</);
});
check("03 EUR and USD return different coherent changes",()=>{
 const merge=fnSlice(app,"function atlasMergeSpotBookIntoCoins(","function atlasBrokerCommitSpotBook(");
 const obj={coins:[{id:"bitcoin",priceUsd:103,change24h:-99}],dataBroker:{spotBook:{quotes}}};
 const box={state:obj,ATLAS_CANONICAL_MARKET_SOURCE:"CoinGecko",atlasHasPositiveQuote:x=>Number.isFinite(Number(x))&&Number(x)>0};
 vm.runInNewContext(merge+";atlasMergeSpotBookIntoCoins();",box);
 const coin=obj.coins[0];assert.equal(coin.change24h,10);assert.equal(coin.change24hUsd,5);assert.equal(coin.usdObservation.price,110);
 const usdLive=vm.runInNewContext("("+fnSlice(usd,"function live(","function wrap(").trim()+")");
 const result=usdLive(coin,1);assert.equal(result.price,110);assert.equal(result.change24h,5);
 assert.equal(usdLive({...coin,usdObservation:null},1),null);
});
check("04 canonical scoped cache key and no legacy USD wrapper",()=>{
 const keyBody=fnSlice(app,"function atlasChartStorageKey(","function atlasChartWorstFreshness(");
 const key=vm.runInNewContext("("+keyBody.trim()+")",{atlasChartPreferredSourceFamily:()=> "coingecko"});
 assert.notEqual(key({id:"bitcoin"},1,"coingecko","EUR"),key({id:"bitcoin"},1,"coingecko","USD"));
 assert.doesNotMatch(usd,/wrap\("atlasChartStorageKey"/);
});
check("05 22h temporal gap cannot certify 24h",()=>{
 const validator=fnSlice(app,"function atlasValidateChartSeries(","function atlasReadLocalChartStore(");
 const f=vm.runInNewContext("(()=>{"+validator+";return atlasValidateChartSeries})()",{
  atlasChartRules:()=>({minPoints:20,minCoverageHours:23.5}),
  atlasChartCoverageHours:ps=>(ps.at(-1)[0]-ps[0][0])/3600000,
  ATLAS_CHART_MAX_FUTURE_MS:300000,ATLAS_CHART_PRICE_GAP_WARN_PCT:2.5,
  atlasChartFreshness:()=>({level:"fresh",label:"fresh"}),Date,Math,Number
 });
 const now=Date.now()-60000,start=now-24*3600000,series=[];
 for(let i=0;i<13;i++)series.push([start+i*5*60000,100]);
 for(let i=0;i<13;i++)series.push([now-60*60000+i*5*60000,100]);
 const result=f({c:{id:"bitcoin"},days:1,prices:series,quoteCurrency:"USD"});
 assert.equal(result.ok,false);assert.match(result.reason,/discontinu/);
});
check("06 extreme sample preserved but fails provenance gate",()=>{
 const sanitizer=vm.runInNewContext("("+fnSlice(app,"function atlasSanitizeChartRows(","function atlasNormalizeChartPayload(").trim()+")");
 const raw=[[1,100],[2,101],[3,1000],[4,102]];assert.deepEqual(Array.from(sanitizer(raw),x=>x[1]),[100,101,1000,102]);
 assert.match(app,/pic extrême non qualifié/);
});
check("07 downsampling retains a high and a low",()=>{
 const f=vm.runInNewContext("("+fnSlice(app,"function atlasDownsampleNativeComparisonRows(","function atlasBuildNativeComparisonTimeline(").trim()+")");
 const series=Array.from({length:841},(_,i)=>({t:i,price:i===420?150:i===500?50:100}));
 const reduced=f(series,281);assert.ok(reduced.length<=281);assert.equal(Math.max(...reduced.map(p=>p.price)),150);assert.equal(Math.min(...reduced.map(p=>p.price)),50);
});
check("08 Solo historical endpoint remains historical",()=>{
 const body=fnSlice(app,"function atlasExternalChartTooltip(","\nfunction ");
 assert.doesNotMatch(body,/if \(atHistoricalEndpoint && !comparison\)/);
 assert.match(body,/rawPrice: Number\(point\.raw\?\.rawPrice\)/);
});
check("09 Top comparison bounded parallel reading",()=>{
 assert.match(app,/\["rank-3", "rank-5"\]\.includes\(comparisonPreset\) \? 2 : 1/);
 assert.match(app,/atlasMapComparisonWithConcurrency\(coins, parallelism/);
});
check("10 branch-only release metadata and asset bump",()=>{
 assert.equal(build.build,"40.6.650");assert.equal(build.published,false);assert.equal(build.terrain_verified,false);
 assert.match(html,/app\.js\?v=40\.6\.650/);assert.match(html,/graph-native-usd-406520\.js\?v=40\.6\.650/);
});
console.log("QUALIFIED_TARGETED_TESTS",total,"expected 10");
if(total!==10)process.exitCode=1;
