"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const path=require("node:path");
const root=path.resolve(__dirname,"../administrator");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const usd=fs.readFileSync(path.join(root,"js/graph-native-usd-406520.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const build=JSON.parse(fs.readFileSync(path.join(root,"build.json"),"utf8"));
let checks=0;
function testCase(label,fn){try{fn();checks++;console.log("PASS",label)}catch(e){console.error("FAIL",label,e.message);process.exitCode=1}}
function fn(source,name,endMarker="\nfunction "){
  const from=source.indexOf("function "+name+"(");
  if(from<0)throw Error("missing "+name);
  const to=source.indexOf(endMarker,from+11);
  if(to<0)throw Error("missing terminator "+name);
  return source.slice(from,to).trim();
}
function evaluate(functionText,env={}){
  return vm.runInNewContext("("+functionText+")",env,{timeout:2000});
}
testCase("build is isolated",()=>{
  assert.equal(build.build,"40.6.650");
  assert.equal(build.published,false);
  assert.equal(build.market_core,"38.15.11");
  assert.equal(build.terrain_verified,false);
});
testCase("Target Top 5 stays visible in HTML and renderer",()=>{
  assert.match(html,/id="targetTop5CycleLabel">TARGET TOP 5 LIVE/);
  assert.match(app,/label\.textContent = "TARGET TOP 5 LIVE"/);
  assert.match(app,/symbols\.textContent = "BTC · ETH · BNB · XRP · SOL"/);
});
testCase("Top 3 and Top 5 preserve exact canonical assets",()=>{
  assert.match(app,/const ATLAS_CURATED_TOP3_IDS = Object\.freeze\(\["bitcoin", "ethereum", "binancecoin"\]\)/);
  assert.match(app,/const ATLAS_CURATED_TOP5_IDS = Object\.freeze\(\[\s*"bitcoin", "ethereum", "binancecoin", "ripple", "solana"/);
  assert.match(app,/top5: curated\(ATLAS_CURATED_TOP5_IDS\)/);
  assert.match(app,/top3: curated\(ATLAS_CURATED_TOP3_IDS\)/);
  const curated=evaluate(fn(app,"atlasCuratedTopIds"),{ATLAS_CURATED_TOP3_IDS:["bitcoin","ethereum","binancecoin"],ATLAS_CURATED_TOP5_IDS:["bitcoin","ethereum","binancecoin","ripple","solana"]});
  assert.equal(Array.from(curated(5)).join(","),"bitcoin,ethereum,binancecoin,ripple,solana");
  assert.equal(Array.from(curated(3)).join(","),"bitcoin,ethereum,binancecoin");
});
testCase("USD price uses its own percent and observation time",()=>{
  const live=evaluate(fn(usd,"live"),{Date});
  const c={id:"bitcoin",priceUsd:110,change24h:10,change24hUsd:5,usdUpdatedAt:"2026-10-29T12:00:00Z"};
  assert.equal(live(c,1).price,110);
  assert.equal(live(c,1).change24h,5);
  assert.equal(live({...c,change24hUsd:null},1),null);
  assert.equal(live({...c,usdUpdatedAt:null,snapshotGeneratedAt:null},1),null);
});
testCase("USD cache wrapper removed and quote-key authority unchanged",()=>{
  assert.doesNotMatch(usd,/wrap\("atlasChartStorageKey"/);
  const cacheKey=evaluate(fn(app,"atlasChartStorageKey"),{});
  const c={id:"bitcoin"};
  assert.notEqual(cacheKey(c,1,"coingecko","EUR"),cacheKey(c,1,"coingecko","USD"));
  assert.match(cacheKey(c,1,"coingecko","USD"),/USD$/);
});
testCase("normalizer does not silently delete a true price peak",()=>{
  const sanitize=evaluate(fn(app,"atlasSanitizeChartRows"),{});
  const rows=sanitize([[1,100],[2,101],[3,1000],[4,102]]);
  assert.equal(rows.length,4);
  assert.equal(rows[2][1],1000);
});
const chartValidate=evaluate(fn(app,"atlasValidateChartSeries","\nconst atlasChartLocalStoreRuntime"),{
  atlasChartRules:()=>({minPoints:20,minCoverageHours:20}),
  atlasChartCoverageHours:rows=>(rows.at(-1)[0]-rows[0][0])/3600000,
  atlasChartFreshness:()=>({level:"fresh",ageMs:0,label:"fresh"}),
  ATLAS_CHART_MAX_FUTURE_MS:120000,
  ATLAS_CHART_PRICE_GAP_WARN_PCT:3,
  Date,Math,Number,Array,Set
});
function v(series){return chartValidate({c:{id:"bitcoin"},days:1,prices:series,sourceMode:"coingecko-direct",quoteCurrency:"EUR",historySourceFamily:"coingecko"})}
const now=Date.now();
const start=now-24*3600000;
testCase("22 hour gap is rejected",()=>{
  const left=Array.from({length:13},(_,i)=>[start+i*300000,100]);
  const right=Array.from({length:13},(_,i)=>[now-3600000+i*300000,101]);
  const r=v([...left,...right]);
  assert.equal(r.ok,false);
  assert.match(r.reason,/discontinu/);
});
testCase("complete native 24h sample is accepted",()=>{
  const rows=Array.from({length:289},(_,i)=>[start+i*300000,100+i/100]);
  assert.equal(v(rows).ok,true);
});
testCase("suspect jump is rejected without deleting the observation",()=>{
  const rows=Array.from({length:289},(_,i)=>[start+i*300000,i===130?1000:100]);
  assert.equal(rows[130][1],1000);
  const result=v(rows);
  assert.equal(result.ok,false);
  assert.match(result.reason,/saut de prix/);
});
testCase("downsampling keeps peaks and endpoints",()=>{
  const down=evaluate(fn(app,"atlasDownsampleNativeComparisonRows"),{Math,Number,Set});
  const rows=Array.from({length:841},(_,i)=>({t:i,price:i===435?150:100}));
  const sampled=down(rows,281);
  assert.ok(sampled.length<=281);
  assert.ok(sampled.some(row=>row.price===150));
  assert.equal(sampled[0].t,0);
  assert.equal(sampled.at(-1).t,840);
});
testCase("Solo historical tooltip is not replaced with spot",()=>{
  const t=fn(app,"atlasExternalChartTooltip");
  assert.doesNotMatch(t,/rows\s*=\s*virtual/);
  assert.doesNotMatch(t,/virtualLivePresentation: true/);
  assert.match(t,/historical-point/);
});
testCase("comparison requests bounded, preserve ordering and atomic chart",()=>{
  const t=app.slice(app.indexOf("async function renderComparisonAnalystPanel("),app.indexOf("\nfunction ",app.indexOf("async function renderComparisonAnalystPanel(")+20));
  assert.match(t,/Math\.min\(2, coins\.length\)/);
  assert.match(t,/fetched\[index\] = fetchedItem/);
  assert.match(t,/strictAtomicComparison/);
  assert.match(app,/comparison\.directRequestSpacingQueue = current\.catch/);
});
testCase("Analyse remains legacy single-percentage",()=>{
  const a=fn(app,"atlasChartOverlayComparison");
  assert.doesNotMatch(a,/MKT .*HIST/);
  assert.match(a,/Leader /);
  assert.match(a,/retard /);
  assert.match(a,/summaryHtml/);
});
console.log("Total verified checks:",checks);
if(process.exitCode)process.exit(process.exitCode);
