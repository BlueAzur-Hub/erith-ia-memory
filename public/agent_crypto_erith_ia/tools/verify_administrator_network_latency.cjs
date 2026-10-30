"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../administrator/app.js"),"utf8");
const take=name=>{
  const at=src.indexOf("function "+name+"(");
  assert.ok(at>=0,"missing "+name);
  const pos=src.slice(Math.max(0,at-6),at)==="async "?at-6:at;
  const part=src.slice(pos).match(/^(?:async )?function [\s\S]*?\n}\n/);
  assert.ok(part,"incomplete "+name);return part[0];
};
const funcs=["atlasNetworkAbortError","atlasNetworkPump","atlasAcquireNetwork",
  "atlasReleaseNetwork","atlasNetworkBusy","atlasFetchJson"].map(take).join("\n");
const state={networkGovernor:{active:[],queue:[],sequence:0}};
const ctx={state,Date,DOMException,AbortController,setTimeout,clearTimeout,queueMicrotask,
  ATLAS_NETWORK_PRIORITY:{market:1,chart:2,spot:3,usd:4,source:5},
  ATLAS_NETWORK_MAX_CHART:2,ATLAS_NETWORK_MAX_OTHER:1,
  ATLAS_NETWORK_WAIT_TIMEOUT_MS:1000,ATLAS_CHART_DIRECT_TIMEOUT_MS:100,
  atlasChartAbortError:()=>Object.assign(new Error("aborted"),{name:"AbortError"}),
  fetch:async()=>({ok:true,json:async()=>({ok:true})})};
vm.createContext(ctx);vm.runInContext(funcs,ctx);
const soon=()=>new Promise(resolve=>setImmediate(resolve));
async function testNetwork(){
 const c1=await ctx.atlasAcquireNetwork("chart");
 const c2=await ctx.atlasAcquireNetwork("chart");
 assert.equal(state.networkGovernor.active.length,2);
 let thirdSettled=false;
 const c3Promise=ctx.atlasAcquireNetwork("chart").then(v=>(thirdSettled=true,v));
 const market=await ctx.atlasAcquireNetwork("market");
 assert.equal(state.networkGovernor.active.length,3,"market retains dedicated lane");
 await soon();assert.equal(thirdSettled,false,"third chart stays queued");
 ctx.atlasReleaseNetwork(c1);const c3=await c3Promise;
 assert.equal(state.networkGovernor.active.length,3);
 ctx.atlasReleaseNetwork(c2);ctx.atlasReleaseNetwork(c3);ctx.atlasReleaseNetwork(market);
 await soon();assert.equal(state.networkGovernor.active.length,0);
 assert.equal(ctx.atlasNetworkBusy(),false);
 const a=await ctx.atlasAcquireNetwork("chart"),b=await ctx.atlasAcquireNetwork("chart");
 const abort=new AbortController();
 const blocked=ctx.atlasAcquireNetwork("chart",abort.signal);
 abort.abort();await assert.rejects(blocked,/annul/i);
 ctx.atlasReleaseNetwork(a);ctx.atlasReleaseNetwork(b);await soon();
 assert.equal(state.networkGovernor.active.length,0);
 const h1=await ctx.atlasAcquireNetwork("chart"),h2=await ctx.atlasAcquireNetwork("chart");
 let resolveFetch;
 ctx.fetch=()=>new Promise(resolve=>{resolveFetch=resolve});
 const p=ctx.atlasFetchJson("https://example.invalid/price",{timeoutMs:100});
 await new Promise(resolve=>setTimeout(resolve,125));
 ctx.atlasReleaseNetwork(h1);
 await soon();
 resolveFetch({ok:true,json:async()=>({ok:true})});
 assert.equal((await p).ok,true,"HTTP timeout starts AFTER queue grant");
 ctx.atlasReleaseNetwork(h2);await soon();
 assert.equal(state.networkGovernor.active.length,0);
 assert.match(src,/state\.networkGovernor = \{\s*active: \[\]/);
 assert.match(src,/function atlasComparisonRequiresFullSelection/);
 assert.match(src,/atlasComparisonCertifiedCurrency\(normalizedEntries\) === requestedCurrency/);
 console.log("PASS: two bounded chart lanes, market slot, abort, HTTP timeout after permit");
}
async function testNativeCache(){
 const n=fs.readFileSync(path.join(__dirname,"../administrator/js/graph-native-usd-406520.js"),"utf8");
 const at=n.indexOf("async function cmp(c,p,opt={}){");
 const end=n.indexOf("\nasync function scan(",at);
 assert.ok(at>=0&&end>at,"actual native USD comparison function missing");
 let requests=0,storedCurrency="USD",stale=false,lookups=[];
 const usd={currency:"USD",series:[[100,40],[200,42]],integrity:{ok:true}};
 const context={
  atlasGetStoredChartResult:(coin,period,family,currency)=>{
    lookups.push([coin.id,period,family,currency]);
    return{...usd,currency:storedCurrency};
  },
  historicalUsdCertified:r=>r?.currency==="USD"&&r.integrity?.ok===true,
  atlasChartNeedsRefresh:()=>stale,
  atlasRespectComparisonRequestSpacing:async()=>{},
  fetchUsd:async()=>{requests++;return usd},
  atlasStoreChartResult:()=>{},
  atlasComparisonAbortError:e=>e?.name==="AbortError",
  ATLAS_COMPARISON_DIRECT_TIMEOUT_MS:24000
 };
 vm.createContext(context);vm.runInContext(n.slice(at,end),context);
 const coin={id:"bitcoin"};
 const hit=await context.cmp(coin,60,{});
 assert.equal(hit.attempts,0);assert.equal(requests,0,"fresh native USD cache must avoid HTTP");
 assert.deepEqual(lookups[0],["bitcoin",60,"coingecko","USD"]);
 stale=true;
 const refresh=await context.cmp(coin,60,{});
 assert.equal(refresh.attempts,1);assert.equal(requests,1);
 stale=false;storedCurrency="EUR";
 const wrong=await context.cmp(coin,60,{});
 assert.equal(wrong.attempts,1);assert.equal(requests,2,"never substitute EUR for USD");
 console.log("PASS: native USD fresh cache-first, stale refresh, EUR refusal");
}
(async()=>{await testNetwork();await testNativeCache()})().catch(e=>{
 console.error(e);process.exitCode=1
});
