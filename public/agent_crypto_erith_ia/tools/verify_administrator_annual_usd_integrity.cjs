"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const app = fs.readFileSync(path.resolve(__dirname,"../administrator/app.js"),"utf8");
const take = name => {
  const at=app.indexOf("async function "+name+"(")>=0?app.indexOf("async function "+name+"("):app.indexOf("function "+name+"(");
  assert.notEqual(at,-1,"missing "+name);
  const found=app.slice(at).match(/^(?:async )?function [\s\S]*?\n}\n/);
  assert.ok(found,"function closure missing "+name);return found[0];
};
const nativeFunctions=["atlasAnnualUsdHistoryCandidate","atlasAnnualUsdFailureLabel","atlasFetchCanonicalAnnualUsdHistory"];
const source=nativeFunctions.map(take).join("\n");
const now=Date.now(), day=86400000;
const coin={id:"bitcoin",symbol:"BTC"};
function history(currency="USD", ageHours=2, fresh=false){
  return {series:[[now-365*day, 82000],[now-ageHours*3600000,79000]],
    blocked:false,currency,quoteCurrency:currency,sourceFamily:"coingecko",
    source:"CoinGecko market_chart "+currency+" · direct", sourceMode:"browser-cache",
    integrity:{ok:true,metrics:{firstTimestamp:now-365*day,lastTimestamp:now-ageHours*3600000}},fresh};
}
const context = ({stored=null, network=[]}={})=>{
  const traces={network:0,wait:0,spacing:0,writes:0};
  const stub={
    console,Date,globalThis:{AgentCryptoGraphNativeUsd406520:{fetchCoinGeckoUsd:async()=>{
      const value=network[traces.network++];if(value instanceof Error)throw value;
      if(value===undefined)throw Object.assign(new Error("HTTP 429"),{status:429});
      return value;
    }}},
    atlasGetStoredChartResult:(_,period,family,currency)=>{assert.equal(period,365);assert.equal(family,"coingecko");assert.equal(currency,"USD");return stored},
    atlasHistoricalDisplayQuote:result=>({currency:result?.currency||null}),
    atlasChartNeedsRefresh:result=>!result?.fresh,
    atlasChartRules:period=>({minCoverageHours:7600}),
    atlasChartAbortError:()=>Object.assign(new Error("cancelled"),{name:"AbortError"}),
    atlasComparisonAbortError:e=>e?.name==="AbortError",
    atlasComparisonRetryableError:e=>!!e&&(e.status===429||e.status>=500||e.name==="TimeoutError"),
    atlasWaitWithSignal:async()=>{traces.wait++},
    atlasRespectComparisonRequestSpacing:async()=>{traces.spacing++},
    ATLAS_COMPARISON_DIRECT_TIMEOUT_MS:24000,
    atlasStoreChartResult:()=>{traces.writes++}
  };
  vm.createContext(stub);vm.runInContext(source,stub,{timeout:2000});
  return {ctx:stub,traces};
};
(async()=>{
  {
    const x=context({stored:history("USD",0.5,true)});
    const r=await x.ctx.atlasFetchCanonicalAnnualUsdHistory(coin,365);
    assert.equal(r.source,"annual-usd-certified-cache");assert.equal(x.traces.network,0);
  }
  {
    const x=context({stored:history("EUR",0.5,true),network:[{...history("USD",0.1),integrity:{ok:true}}]});
    const r=await x.ctx.atlasFetchCanonicalAnnualUsdHistory(coin,365);
    assert.equal(r.source,"annual-usd-native-direct");assert.equal(x.traces.network,1);assert.equal(x.traces.writes,1);
  }
  {
    const rate=Object.assign(new Error("HTTP 429"),{status:429});
    const x=context({network:[rate,{...history("USD",0.1),integrity:{ok:true}}]});
    const r=await x.ctx.atlasFetchCanonicalAnnualUsdHistory(coin,365);
    assert.equal(r.source,"annual-usd-native-direct");assert.equal(r.attempts,2);
    assert.equal(x.traces.network,2);assert.equal(x.traces.wait,1);assert.equal(x.traces.spacing,2);
  }
  {
    const rate=Object.assign(new Error("HTTP 429"),{status:429});
    const x=context({stored:history("USD",2,false),network:[rate,rate]});
    const r=await x.ctx.atlasFetchCanonicalAnnualUsdHistory(coin,365);
    assert.equal(r.source,"annual-usd-delayed-certified-cache");assert.equal(r.result.currency,"USD");
    assert.match(r.result.refreshWarning,/différé/);assert.equal(x.traces.network,2);
  }
  {
    const x=context({stored:history("USD",36,false),network:[Object.assign(new Error("HTTP 401"),{status:401})]});
    const r=await x.ctx.atlasFetchCanonicalAnnualUsdHistory(coin,365);
    assert.equal(r.result.blocked,true);assert.equal(r.attempts,1);assert.equal(r.result.technicalReason,"HTTP 401");
  }
  {
    const x=context({stored:history("USDT",0.1,true),network:[Object.assign(new Error("HTTP 403"),{status:403})]});
    const r=await x.ctx.atlasFetchCanonicalAnnualUsdHistory(coin,365);
    assert.equal(r.result.blocked,true);assert.equal(x.traces.writes,0);
  }
  assert.match(app,/canonicalPresetRequest === "rank-5" && requestedCurrency === "USD" && period === 365/);
  assert.match(app,/length: annualUsdBasket \? 1 : Math\.min\(3, coins\.length\)/);
  assert.match(app,/fetched\[index\] = fetchedItem/);
  assert.match(app,/atlasComparisonCertifiedCurrency\(normalizedEntries\) === requestedCurrency/);
  assert.doesNotMatch(take("atlasFetchCanonicalAnnualUsdHistory"),/vs_currency=eur|USDT|USDC/);
  const metadata=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../administrator/build.json"),"utf8"));
  assert.equal(metadata.build,"40.6.709");assert.equal(metadata.engine,"38.15.11");
  console.log("PASS: annual USD Top5 cache-first, native-only, 429 bounded retry, delayed USD fallback, forbidden EUR/USDT, abort guards, unchanged atomic criteria");
})().catch(e=>{console.error(e);process.exitCode=1});
