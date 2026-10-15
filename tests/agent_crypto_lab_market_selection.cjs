"use strict";
/* Lab BTC / CT / Q: the canonical owners change, or selection fails closed.
   No private OKX API, synthetic prices, extra chart or implicit scroll. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,
  "../public/agent_crypto_erith_ia/administrator/js/learning-lab.js"),"utf8");
const liveOwner=fs.readFileSync(path.join(__dirname,
  "../public/agent_crypto_erith_ia/administrator/js/new-listings-live-asset-406529.js"),"utf8");
const categorySource=fs.readFileSync(path.join(__dirname,
  "../public/agent_crypto_erith_ia/administrator/js/new-listings-native-category.js"),"utf8");
assert.match(source,/let asset="BTC", tab="synthese", follow=true/,
  "Lab follows chart by default, but allows manual pinning");
assert.match(source,/modeButton.addEventListener\("click",\(\)=>\{follow=!follow;render\(\);syncMarket\(\);\}\)/,
  "Operator can still pin a learning dossier independently");
const deactivate=categorySource.slice(categorySource.indexOf("function deactivate({clearChart=true}={})"),
  categorySource.indexOf("function sourceInfo(",categorySource.indexOf("function deactivate({clearChart=true}={})"));
assert.match(deactivate,/state.selected=null;/);
assert.match(deactivate,/renderCategory\(\);/,
  "Clearing CT state redraws ACTIF marker, even with New Listings filter still visible");
assert.doesNotMatch(liveOwner,/scrollIntoView\(/,
  "native CT selection must not scroll away from the Laboratory");

const calls=[],btc={id:"bitcoin",symbol:"BTC"},q={id:"quack-ai",symbol:"Q"};
let allowQ=true,selected=btc,external=null,selectionId=null,commitOK=true,categoryEnabled=false;
let resolveCT=null,delayCT=false,mode="candles";
const owner={
  async selectById(id){
    calls.push("new-listing:"+id);
    if(id!=="concrete")return false;
    if(delayCT)return new Promise(resolve=>{resolveCT=()=>resolve(false);});
    external={active:true,id:"concrete",provider:"okx",instrument:"CT-USDT"};
    selectionId="concrete";mode="native";
    return true;
  },
  snapshot:()=>({selectedId:selectionId,enabled:categoryEnabled}),
  deactivate(){
    calls.push("deactivate");
    selectionId=null;external=null;mode="native";
  }
};
const document={readyState:"loading",addEventListener(){},
  getElementById:id=>id==="atlasNewListingsButton406528"
    ?{click(){calls.push("filter:new");categoryEnabled=true;}}:null,
  querySelector:selector=>selector==='.filter-btn[data-filter="all"]'
    ?{click(){calls.push("filter:all");categoryEnabled=false;}}:null};
const context={document,location:{search:"?surface=trader"},URLSearchParams,console,
  AgentCryptoNewListingsNativeCategory:owner,
  AgentCryptoNewListingLiveAsset:{snapshot:()=>external},
  AgentCryptoMarketMicroscope:{snapshot:()=>({mode}),setMode(next){calls.push("mode:"+next);mode=next;}},
  atlasMarketExactTop250:id=>[btc,...(allowQ?[q]:[])].find(c=>c.id===id)||null,
  atlasSelectMarketCoin(coin){calls.push("select:"+coin.id);selected=coin;},
  getSelectedCoin:()=>selected,
  atlasTraderExternalSelectionClear(){calls.push("clear-memory");return true;},
  atlasTraderExternalSelectionCommit(spec){
    calls.push("commit:"+spec.providerSymbol);
    return commitOK;
  }
};
context.globalThis=context;
vm.runInNewContext(source,context,{filename:"learning-lab.js"});
const api=context.AgentCryptoLearningLabMarketSelection;
assert.ok(api,"the lab publishes a narrow selection adapter");
assert.equal(api.real_order,false);
(async()=>{
  assert.equal(await api.request("CT"),true);
  assert.equal(calls[0],"new-listing:concrete");
  assert.deepEqual(calls.slice(0,4),["new-listing:concrete","filter:new","mode:candles","commit:CT-USDT"]);
  assert.equal(mode,"candles");
  assert.match(api.snapshot().truth,/CT\/USDT/);
  assert.equal(await api.request("BTC"),true);
  assert.deepEqual(calls.slice(4,9),["clear-memory","deactivate","filter:all","select:bitcoin","mode:candles"]);
  assert.equal(mode,"candles");
  assert.equal(selected.id,"bitcoin");
  assert.equal(external,null);
  assert.equal(await api.request("Q"),true);
  assert.equal(selected.id,"quack-ai");
  assert.match(api.snapshot().truth,/Q · Market sélectionné/);
  allowQ=false;
  const before=calls.length;
  assert.equal(await api.request("Q"),false,"never invent a Q market owner");
  assert.equal(calls.length,before,"missing Q must not switch any existing owner");
  assert.match(api.snapshot().truth,/aucune substitution/);
  // On a quick BTC click, a previous asynchronous CT intent cannot
  // override the latest successful status.
  delayCT=true;
  const pending=api.request("CT");
  assert.equal(await api.request("BTC"),true);
  resolveCT();
  assert.equal(await pending,false);
  assert.match(api.snapshot().truth,/BTC · Market sélectionné/);
  assert.equal(api.snapshot().pending,false);
  console.log("Trader Lab canonical BTC/CT/Q selection: 6/6 PASS");
})().catch(e=>{console.error(e);process.exitCode=1;});
