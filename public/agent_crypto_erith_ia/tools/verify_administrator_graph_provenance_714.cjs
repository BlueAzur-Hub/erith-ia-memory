"use strict";
// The production app owns all chart data; this isolated VM reads only the
// extracted pure 40.6.714 comparison helpers and preserves time/source guards.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..","administrator");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const build=JSON.parse(fs.readFileSync(path.join(root,"build.json"),"utf8"));
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert.equal(build.build,"40.6.714");
assert.equal(build.engine,"38.15.11");
assert.equal(build.terrain_verified,false);
assert.ok(html.includes("40.6.714"));
for(const owner of ["atlasScannerCommit","atlasScannerMarketBasis","atlasComparisonCurveChange","atlasHistoricalDisplayQuote"])
  assert.ok(app.includes("function "+owner+"("));
assert.ok(app.includes("globalThis.AgentCryptoGraphProvenance406714"));
assert.ok(app.includes("Preuve spot/historique"));
const from=app.indexOf("// 40.6.714 — An archived");
const to=app.indexOf("const atlasChartLocalStoreRuntime",from);
assert.ok(from>0 && to>from);
const ctx={
  Date,ATLAS_CHART_MAX_FUTURE_MS:300000,ATLAS_CHART_PRICE_GAP_WARN_PCT:2.5,
  atlasChartRules:()=>({minPoints:3,minCoverageHours:23.5}),
  atlasChartCoverageHours:rows=>(rows.at(-1)[0]-rows[0][0])/3600000,
  atlasChartFreshness:()=>({level:"fresh",label:"fresh"}),
  atlasHistoricalDisplayQuote:r=>({currency:r.currency,source:r.source}),
  atlasComparisonCurveChange:e=>e.data.at(-1).y-100,
  atlasMarketSnapshotSurface:c=>({change24h:c.change24h??null,observedBasis:"market"}),
  state:{coins:[],chartPeriodDays:1,dataBroker:{}},
  atlasRequestedHistoricalCurrency:()=> "USD"
};
vm.createContext(ctx);vm.runInContext(app.slice(from,to),ctx,{timeout:2000});
const at=Date.now()-60000;
const coin={id:"bitcoin",symbol:"BTC",priceUsd:100,priceEur:90,source:"CoinGecko",
  lastUpdated:new Date(at).toISOString(),changeQuoteCurrency:"USD",change24h:0.7};
const probe=(extra={})=>ctx.atlasGraphSpotComparisonTruth({
  c:coin,quoteCurrency:"USD",historySourceFamily:"coingecko",
  lastTimestamp:at,lastPrice:100,now:Date.now(),...extra});
assert.equal(probe().status,"PRIX_PROCHES");
assert.equal(probe().marketChangeCurrency,"USD");
assert.equal(probe({lastPrice:120}).status,"ECART_A_VERIFIER");
assert.equal(probe({quoteCurrency:"USDT"}).status,"NON_COMPARABLE");
assert.equal(probe({historySourceFamily:"binance"}).status,"NON_COMPARABLE");
assert.equal(probe({c:{...coin,source:"Other"}}).status,"NON_COMPARABLE");
assert.equal(probe({lastTimestamp:at-30*60000}).status,"NON_COMPARABLE");
assert.equal(probe({c:{...coin,priceUsd:null}}).status,"NON_COMPARABLE");
assert.equal(probe({c:{...coin,lastUpdated:null}}).status,"NON_COMPARABLE");
assert.equal(ctx.atlasGraphProvenanceMarketCurrency({}),"NON QUALIFIÉE");
const entry={coin,result:{currency:"EUR",source:"CoinGecko",
  integrity:{metrics:{firstTimestamp:at-86400000,lastTimestamp:at,
  spotComparison:{status:"PRIX_PROCHES"}}}},data:[{y:100},{y:100.5}]};
const provenance=ctx.atlasGraphProvenanceComparisonRows([entry])[0];
assert.equal(provenance.coinId,"bitcoin");
assert.equal(provenance.historyCurrency,"EUR");
assert.equal(provenance.marketChangeCurrency,"USD");
assert.equal(provenance.historyChangePct,.5);
const points=Array.from({length:25},(_,i)=>[at-86400000+i*3600000,100]);
const args={c:coin,days:1,prices:points,quoteCurrency:"USD",
  historySourceFamily:"coingecko"};
const valid=ctx.atlasValidateChartSeries(args);
assert.equal(valid.ok,true);
assert.equal(valid.metrics.spotComparison.status,"PRIX_PROCHES");
const warn=ctx.atlasValidateChartSeries({...args,
  prices:points.map((v,i)=>i===24?[v[0],110]:v)});
assert.equal(warn.ok,true);
assert.equal(warn.metrics.spotComparison.status,"ECART_A_VERIFIER");
assert.ok(warn.warnings.some(x=>x.includes("vérification requise")));
const diffProvider=ctx.atlasValidateChartSeries({...args,historySourceFamily:"binance"});
assert.equal(diffProvider.ok,true);
assert.equal(diffProvider.metrics.priceGapPct,null);
assert.equal(diffProvider.metrics.spotComparison.status,"NON_COMPARABLE");
const gap=ctx.atlasValidateChartSeries({...args,prices:points.filter((v,i)=>i<10||i>14)});
assert.equal(gap.ok,false);
assert.ok(gap.reason.includes("trou temporel"));
console.log("ADMIN 40.6.714 GRAPH TRUTH PASS · EUR/USD, source, time, warnings, gaps, Top5 invariants");
