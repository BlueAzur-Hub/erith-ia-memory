"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const live=read("administrator/js/new-listings-live-asset-406529.js");
const native=read("administrator/js/new-listings-native-category.js");
const micro=read("administrator/js/okx-microstructure-406499.js");
test("public Bitget API preserves a verified MHA after 30 days but not as NEW",async()=>{
 const now=Date.now(), ms=days=>String(now-days*86400000);
 const data=[
  {baseCoin:"DNA",quoteCoin:"USDT",symbol:"DNAUSDT",launchTime:ms(2),status:"online",symbolType:"crypto",isRwa:"NO"},
  {baseCoin:"MHA",quoteCoin:"USDT",symbol:"MHAUSDT",launchTime:ms(31),status:"online",symbolType:"crypto",isRwa:"NO"},
  {baseCoin:"BAD",quoteCoin:"USDT",symbol:"BADUSDT",launchTime:ms(35),status:"offline",symbolType:"crypto",isRwa:"NO"},
  {baseCoin:"OLDA",quoteCoin:"USDT",symbol:"OLDAUSDT",launchTime:ms(31),status:"online",symbolType:"crypto",isRwa:"NO"}
 ];
 const ctx={URL,Date,AbortController,setTimeout,clearTimeout,console,
  document:{getElementById:()=>null,readyState:"loading",addEventListener:()=>{}},
  window:{addEventListener:()=>{}},
  fetch:async()=>({ok:true,status:200,json:async()=>({code:"00000",data})})};
 vm.runInNewContext(live,ctx,{filename:"new-listings-live-asset.js"});
 const recent=await ctx.AgentCryptoNewListingLiveAsset.discoverBitget({days:30});
 const followed=ctx.AgentCryptoNewListingLiveAsset.trackedInstruments();
 assert.deepEqual(Array.from(recent,x=>x.providerSymbol),["DNAUSDT"]);
 assert.deepEqual(Array.from(followed,x=>x.providerSymbol),["MHAUSDT"]);
 assert.equal(followed[0].status,"DISCOVERED_LIVE");
 assert.equal(followed[0].ageDays>30,true);
});
test("archive row cannot offer Solo without Bitget verification",()=>{
 assert.match(native,/function fallbackMhaSpec\(/);
 assert.match(native,/historicalOnly:true,ticker:null/);
 assert.match(native,/historique|Historique/);
 assert.match(native,/const rows=\[\.\.\.state\.specs,\.\.\.state\.followedSpecs\]/);
 assert.match(native,/if\(spec\?\.historicalOnly\)\{sourceInfo\(spec\);return;\}/);
 assert.match(native,/trackedInstruments\?\.\(\)/);
 assert.match(native,/historicOnly\?"":/);
 assert.match(native,/SUIVI/);
});
test("graph orderbook owner refuses missing canonical external identity",()=>{
 assert.match(micro,/graphId\.startsWith\("new-listing:"\)/);
 assert.match(micro,/graphId===String\(ext\.id\|\|""\)/);
 assert.match(micro,/graphId===String\(listing\?\.selectedId\|\|""\)/);
 assert.match(micro,/clearBookForAsset\(visible\|\|normalizeSelectedAsset\(listing\?\.selectedSymbol\)/);
 assert.match(micro,/visibleGraphConflict\(\)/);
 assert.match(micro,/if\(!next\|\|visibleGraphConflict\(\)\)/);
 assert.match(micro,/state\.provider!==String\(ext\.provider\|\|""\)/);
 assert.doesNotMatch(micro,/placeOrder\(|sendOrder\(|private\/trade/);
});

test("native Market listing filters classify exact documented tokenized instruments only",()=>{
 const ctx={Date,URL,AbortController,setTimeout,clearTimeout,console};
 vm.runInNewContext(native,ctx,{filename:"new-listings-native-category.js"});
 const result=ctx.AgentCryptoNewListingsNativeCategory?.self_test?.();
 assert.equal(result?.pass,true,JSON.stringify(result?.checks));
 assert.equal(result.checks.market_segment_filters,true);
 assert.equal(result.checks.tokenized_requires_documented_instrument,true);
 assert.equal(result.checks.provenance_grouping_verified,true);
 assert.equal(result.checks.readable_market_categories,true);
 assert.equal(result.checks.okx_spot_quote_freshness_and_exact_id,true);
 assert.match(native,/activeSegment:"quoted"/);
 assert.match(native,/function groupListingSpecs\(/);
 assert.match(native,/function quotedVenueLabel\(/);
 assert.match(native,/function mountSegmentToolbar\(/);
 assert.match(native,/function refreshSegmentToolbar\(/);
 assert.match(native,/DOCUMENTED_TOKENIZED_OKX_SPOT/);
 assert.doesNotMatch(native,/new MutationObserver\(/);
});

test("published public new listings feed uses RAW GitHub, not excluded Pages /data/",async()=>{
 assert.match(native,/const PUBLIC_DATA_RAW="https:\/\/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory\/main\/public\/agent_crypto_erith_ia\/administrator\/data\/"/);
 assert.match(native,/const WATCH_FEED_URL=PUBLIC_DATA_RAW\+"new-listings-public-feed\.json"/);
 assert.match(native,/const IDENTITY_REGISTRY_URL=PUBLIC_DATA_RAW\+"new-listings-identities\.json"/);
 const now=Date.now();
 const fakeRow=(base,quote,minutes)=>({
   provider:"okx",instrument_type:"SPOT",base,quote,
   providerSymbol:base+"-"+quote,pair:base+"/"+quote,
   listedAt:new Date(now-minutes*60000).toISOString(),state:"live",stale:false
 });
 const feed={
   schema:"erith.seven.public-spot-listings-feed.v1",
   captured_at_utc:new Date(now).toISOString(),read_only:true,trade_permission:false,
   real_orders:0,watch_sources:{okx:{status:"OK"}},
   entries:[fakeRow("XWDC","USDC",5),fakeRow("XNFLX","USDC",20),fakeRow("XDP","USDC",30)]
 };
 const requested=[];
 const ctx={Date,URL,AbortController,setTimeout,clearTimeout,console,
   document:{getElementById:()=>null,readyState:"loading",addEventListener:()=>{}},
   window:{addEventListener:()=>{}},
   AgentCryptoNewListingLiveAsset:{discoverBitget:async()=>[],trackedInstruments:()=>[]},
   fetch:async url=>{
     const u=String(url);requested.push(u);
     if(u.includes("new-listings-public-feed.json"))return {ok:true,json:async()=>feed};
     if(u.includes("new-listings-identities.json"))
       return {ok:true,json:async()=>({schema:"agent_crypto_new_listings_identity_registry_v1",identities:{}})};
     if(u.includes("/market/tickers"))return {ok:true,json:async()=>({code:"00000",data:[]})};
     if(u.includes("/simple/price"))return {ok:true,json:async()=>({tether:{usd:1,eur:1},"usd-coin":{usd:1,eur:1}})};
     throw new Error("Unexpected URL "+u);
   }
 };
 vm.runInNewContext(native,ctx,{filename:"new-listings-native-category.js"});
 await ctx.AgentCryptoNewListingsNativeCategory.discover();
 const snapshot=ctx.AgentCryptoNewListingsNativeCategory.snapshot();
 assert.equal(snapshot.discovered,3);
 assert.equal(snapshot.watchStatus.okxCount,3);
 assert.equal(snapshot.documentedTokenizedSpotCount,2);
 assert.equal(snapshot.watchStatus.status,"OK");
 assert.equal(snapshot.datedOkxQuotesCount,0,"Feed without quotes stays unpriced");
 assert.equal(requested.filter(u=>u.includes("raw.githubusercontent.com")).length,2);
 assert.equal(requested.some(u=>u.startsWith("./data/")),false);
});


test("dated OKX SPOT prices: exact-pair only, stale and mismatched quotes blocked",async()=>{
 const now=Date.now();
 const row=(base,quote)=>({
   provider:"okx",instrument_type:"SPOT",base,quote,providerSymbol:base+"-"+quote,
   pair:base+"/"+quote,listedAt:new Date(now-3600000).toISOString(),
   state:"live",stale:false,quote_snapshot:null
 });
 const valid=row("XDP","USDC");
 valid.quote_snapshot={instId:"XDP-USDC",quote:"USDC",last:"0.21",
   open24h:"0.20",volCcy24h:"90000",observed_at_utc:new Date(now-60000).toISOString(),
   account_spot_access_verified:false,executable_price_verified:false};
 const stale=row("TEST002","USDT");
 stale.quote_snapshot={...valid.quote_snapshot,instId:"TEST002-USDT",quote:"USDT",
   observed_at_utc:new Date(now-3*3600000).toISOString()};
 const wrong=row("XWDC","USDC");
 wrong.quote_snapshot={...valid.quote_snapshot,instId:"WRONG-USDC"};
 const feed={schema:"erith.seven.public-spot-listings-feed.v1",
   captured_at_utc:new Date(now).toISOString(),read_only:true,trade_permission:false,
   real_orders:0,watch_sources:{okx:{status:"OK"},okx_prices:{status:"OK",count:1}},
   entries:[valid,stale,wrong]};
 const ctx={Date,URL,AbortController,setTimeout,clearTimeout,console,
   document:{getElementById:()=>null,readyState:"loading",addEventListener:()=>{}},
   window:{addEventListener:()=>{}},
   AgentCryptoNewListingLiveAsset:{discoverBitget:async()=>[],trackedInstruments:()=>[]},
   fetch:async url=>{
     const u=String(url);
     if(u.includes("new-listings-public-feed.json"))return {ok:true,json:async()=>feed};
     if(u.includes("new-listings-identities.json"))return {ok:true,json:async()=>({identities:{}})};
     if(u.includes("/market/tickers"))return {ok:true,json:async()=>({code:"00000",data:[]})};
     if(u.includes("/simple/price"))return {ok:true,json:async()=>({tether:{usd:1,eur:1},"usd-coin":{usd:1,eur:1}})};
     throw new Error("Unexpected URL "+u);
   }
 };
 vm.runInNewContext(native,ctx,{filename:"new-listings-native-category.js"});
 await ctx.AgentCryptoNewListingsNativeCategory.discover();
 const snap=ctx.AgentCryptoNewListingsNativeCategory.snapshot();
 assert.equal(snap.datedOkxQuotesCount,1);
 assert.equal(snap.watchStatus.pricedCount,1);
 assert.equal(snap.documentedTokenizedSpotCount,1);
 assert.equal(snap.watchStatus.okxCount,3);
});
