/* 40.6.649 — Analyse legacy UI restoration; finance/scanner source remains intact. */
"use strict";
const fs=require("node:fs"), vm=require("node:vm"), assert=require("node:assert/strict");
const root="public/agent_crypto_erith_ia/administrator/";
const app=fs.readFileSync(root+"app.js","utf8");
const index=fs.readFileSync(root+"index.html","utf8");
const meta=JSON.parse(fs.readFileSync(root+"build.json","utf8"));
assert.equal(meta.build,"40.6.649");
assert.equal(meta.parent_build,"40.6.648");
assert.equal(meta.market_core_modified,false);
assert.equal(meta.analysis_visual_restore_406649.firefox_verified,false);
assert.ok(index.includes('id="atlasVersionTruthText">Build 40.6.649'));
assert.ok(index.includes('./app.js?v=40.6.649'));
assert.ok(app.includes("function atlasScannerSeriesCoversWindow("));
assert.ok(app.includes("baselineAnchorDirection"));
assert.ok(app.includes("marketChange: typeof entry?.atlasMarketMetric"));
new vm.Script(app,{filename:"app.js"});
const beg=app.indexOf("function atlasChartOverlayComparison(chart, period, options = {}) {");
const end=app.indexOf("\nfunction ",beg+20);
assert.ok(beg>=0&&end>beg);
const renderer=app.slice(beg,end);
assert.doesNotMatch(renderer,/MKT \$\{|HIST \$\{|showsMarketAndHistory|Leader historique|retard historique/);
assert.match(renderer,/text: `Leader \$/);
assert.match(renderer,/text: `retard \$/);
assert.match(renderer,/summaryHtml,\n    options\.preserved/);
const captured=[];
const ctx={
 state:{coins:[],dataBroker:{comparison:{preset:"gainers"}},chartPeriodDays:1},
 Number,Math,Array,Date,Set,NumberFormat:Intl.NumberFormat,
 fmtCompactEUR:{format:v=>String(v)},fmtPct:v=>(v>=0?"+":"")+v.toFixed(2)+" %",
 atlasChartOverlayOrderedEntries:r=>r.entries,
 atlasComparisonIds:()=>["btc","eth","bnb","xrp","sol"],
 atlasChartPeriodLabel:()=>"24h",
 atlasChartOverlayTruth:()=>({label:"direct"}),
 atlasChartV2EffectiveScale:()=>"normal",
 atlasComparisonCurveChange:e=>e.returnPct,
 atlasChartOverlayCoinHtml:(r,i,v)=>r.symbol+" "+v+" | ",
 atlasExactTimestampLabel:()=>"31/08/2026 12:05",
 atlasChartOverlayPointCoverage:()=>"300 pts/série",
 atlasChartProviderLabel:()=>"CoinGecko",
 atlasHistoricalDisplayQuote:()=>({currency:"EUR"}),
 atlasManualCanonicalTop5Drift:()=>null,
 atlasChartOverlayModeLabel:()=>"TOP 5",
 atlasChartOverlayTitleHtml:(a,b)=>a+" "+b,
 atlasChartOverlaySet:(...v)=>captured.push(v),
 escapeHtml:v=>String(v)
};
vm.createContext(ctx);
vm.runInContext(renderer,ctx);
const changes=[0.17,-0.79,-1.45,-1.76,-2.08];
const entries=["BTC","ETH","BNB","XRP","SOL"].map((symbol,i)=>({
 coin:{id:symbol.toLowerCase(),symbol},returnPct:changes[i],atlasMarketMetric:50+i,
 result:{series:[[1,1]],integrity:{metrics:{lastTimestamp:1,pointCount:300}}}
}));
function check(preset){captured.length=0;vm.runInContext('atlasChartOverlayComparison',ctx)({result:{entries},},1,{preset,selectedCount:5});const [,series,summary]=captured[0];assert.ok(series.includes("BTC +0.17 %"));assert.ok(!series.includes("MKT")&&!series.includes("HIST"));assert.ok(summary.includes("Leader BTC +0.17 %"));assert.ok(summary.includes("retard SOL -2.08 %"));assert.ok(summary.includes("écart 2.25 pt"));assert.ok(summary.includes("300 pts/série"));assert.ok(summary.includes("31/08/2026 12:05"));}
check("gainers");check("losers");check("manual");
console.log("PASS: historic single percentage, Leader / retard / écart / coverage / oldest; finance logic retained");
