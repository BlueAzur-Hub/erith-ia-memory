"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
// Read-only market race: CT must not publish a book or a candle batch after a
// change of market, even if the network response ignores AbortController.
const source=fs.readFileSync(path.join(__dirname,
"../public/agent_crypto_erith_ia/administrator/js/new-listings-live-asset-406529.js"),"utf8");
const pending=[];
const mockFetch=(u)=>new Promise(resolve=>pending.push({url:String(u),resolve}));
const ctx={console,URL,URLSearchParams,Date,AbortController,setTimeout,clearTimeout,
  fetch:mockFetch,window:{dispatchEvent(){}},CustomEvent:class {constructor(name,opts){this.name=name;this.detail=opts.detail;}},
  AgentCryptoMarketMicroscope:{setMode(){}},AgentCryptoOkxMicrostructure:{snapshot:()=>({open:false})}};
ctx.globalThis=ctx;
vm.runInNewContext(source,ctx,{filename:"new-listings-live-asset.js"});
const api=ctx.AgentCryptoNewListingLiveAsset;
function reply(next,payload){assert.ok(next,"A request was expected");next.resolve({ok:true,json:async()=>payload});}
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
const ticker=()=>({code:"0",data:[{last:"0.37",ts:"1792000000000"}]});
const book=()=>({code:"0",data:[{ts:"1792000000001",bids:[["0.36","20"]],asks:[["0.38","17"]]}]});
const candle=()=>({code:"0",data:[[1792000000000,"0.37","0.39","0.36","0.38","123"]]});
(async()=>{
  const loaded=api.load({id:"concrete",name:"Concrete",provider:"okx",base:"CT",quote:"USDT",providerSymbol:"CT-USDT"});
  assert.equal(pending.length,1);
  reply(pending.shift(),ticker());await loaded;
  const staleBook=api.fetchOrderBook();await flush();
  assert.match(pending[0].url,/CT-USDT/);
  api.deactivate();reply(pending.shift(),book());
  await assert.rejects(staleBook,/Contexte externe modifié/);
  const restored=api.load({id:"concrete",provider:"okx",base:"CT",quote:"USDT",providerSymbol:"CT-USDT"});
  reply(pending.shift(),ticker());await restored;
  const staleCandles=api.fetchCandles();await flush();
  api.deactivate();reply(pending.shift(),candle());
  await assert.rejects(staleCandles,/Contexte externe modifié/);
  const ready=api.load({id:"concrete",provider:"okx",base:"CT",quote:"USDT",providerSymbol:"CT-USDT"});
  reply(pending.shift(),ticker());await ready;
  const goodBook=api.fetchOrderBook();await flush();reply(pending.shift(),book());
  assert.equal((await goodBook).pair,"CT-USDT");
  const goodCandles=api.fetchCandles();await flush();reply(pending.shift(),candle());
  assert.equal((await goodCandles).instrument,"CT-USDT");
  // A reload of the SAME instrument still invalidates earlier responses.
  const previous=api.fetchOrderBook();await flush();
  const same=api.load({id:"concrete",provider:"okx",base:"CT",quote:"USDT",providerSymbol:"CT-USDT"});
  const oldReq=pending.shift(),newReq=pending.shift();
  reply(oldReq,book());reply(newReq,ticker());await same;
  await assert.rejects(previous,/Contexte externe modifié/);
  assert.equal(api.real_order,false);
  console.log("External venue request ownership: stale book, stale candles, positive reads, repeat load PASS");
})().catch(error=>{console.error(error);process.exitCode=1;});
