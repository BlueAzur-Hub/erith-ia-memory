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
