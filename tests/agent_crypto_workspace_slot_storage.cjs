"use strict";
/* Tests the actual A/B/C functions extracted from Administrator app.js.
   No browser storage is modified: a deterministic fake of the existing V7 IDB store. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const app=fs.readFileSync(path.join(__dirname,"../public/agent_crypto_erith_ia/administrator/app.js"),"utf8");
function segment(start,end){
  const a=app.indexOf(start),b=app.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,"Missing real source range "+start);
  return app.slice(a,b);
}
const source=[
  segment('const ATLAS_WORKSPACE_SLOT_IDS =','function atlasWorkspaceSlotSummary(snapshot) {'),
  segment('async function atlasWorkspaceSlotWrite(slotId, options = {}) {','function atlasWorkspaceSlotValidIds(saved) {'),
  segment('async function atlasWorkspaceSlotRecall(slotId) {','function atlasWorkspaceSlotsRender() {')
].join("\n");
let runtime=0;
function createHarness({idbData=new Map(),legacyData=new Map(),idbWorks=true,legacyWorks=false}={}){
  const flashes=[],errors=[],reads=[];
  let pendingError=null;
  const db={
    transaction(store,mode){
      assert.equal(store,"state");
      const tx={error:null,objectStore(){
        return {
          get(key){
            const request={result:null,error:null};
            queueMicrotask(()=>{
              request.result=idbData.get(key)||null;
              request.onsuccess?.();
            });
            return request;
          },
          put(value){
            queueMicrotask(()=>{
              if(!idbWorks){tx.error=new Error("IDB blocked");tx.onabort?.();return;}
              idbData.set(value.id,structuredClone(value));tx.oncomplete?.();
            });
          }
        };
      }};
      return tx;
    }
  };
  const localStorage={
    getItem(key){return legacyData.get(key)||null;},
    setItem(key,value){
      if(!legacyWorks){const e=new Error("Storage allocation full");e.name="QuotaExceededError";throw e;}
      legacyData.set(key,value);
    }
  };
  const external={id:"concrete",period:1,loading:false,error:null};
  const intent={id:"concrete",instrument:"CT-USDT"};
  const exchange={active:true,id:"concrete",provider:"okx",providerSymbol:"CT-USDT",nativeMarket:true};
  const context={
    console:{warn(...args){errors.push(args);},error(...args){errors.push(args);}},
    atlasGraphContextV7OpenDb:async()=>{if(!idbWorks)throw new Error("IndexedDB denied");return db;},
    ATLAS_GRAPH_CONTEXT_V7_STORE:"state",
    atlasWorkspaceReadJson(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch{return null}},
    localStorage,
    ATLAS_RELEASE:"40.6.631",
    atlasScannerTransaction:false,atlasScannerQueuedRequest:false,
    atlasWorkspaceCapture:()=>({schema:"agent_crypto_workspace_v2",displayCurrency:"USD",savedAt:new Date().toISOString(),comparisonIds:["bitcoin"]}),
    atlasWorkspaceVisibleExternal:()=>external,
    atlasTraderIsRuntime:()=>true,
    atlasTraderExternalSelectionRead:()=>intent,
    AgentCryptoNewListingLiveAsset:{snapshot:()=>exchange},
    atlasTraderExternalSelectionNormalize:s=>s?.id==="concrete"&&s?.instrument==="CT-USDT"?s:null,
    atlasExternalPresentation:()=>({view:"price",scale:"logarithmic",volume:true,legend:false,analysis:true}),
    atlasWorkspaceSlotFlash:(msg,state)=>flashes.push({msg,state}),
    atlasWorkspaceSlotsRender:()=>++runtime,
    atlasWorkspaceRenderStrip:()=>{},
    atlasTraderExternalSelectionCommit:()=>true,
    atlasTraderExternalSelectionClear:()=>true,
    AtlasExternalChart:{state:()=>({coin_id:"concrete"})},
    AgentCryptoNewListingsNativeCategory:{selectById:async()=>{reads.push("CT");return true}},
    atlasParallelMarketDomain:()=> "crypto",
    atlasGraphContextV7Read:()=>null
  };
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(source,context,{timeout:5000});
  const fn=name=>vm.runInContext(name,context);
  return {fn,flashes,errors,legacyData,idbData,reads};
}
(async()=>{
  const vault=new Map(),local=new Map();
  const main=createHarness({idbData:vault,legacyData:local,idbWorks:true,legacyWorks:false});
  assert.equal(await main.fn("atlasWorkspaceSlotWrite")("A"),true,"Quota-blocked localStorage must not prevent IDB save");
  assert.ok(vault.has("comparison_memory_slot_v1_A"),"Slot A stored as separate V7 DB row");
  assert.equal(vault.has("graph_session_context_v7"),false,"No V7 profile write");
  assert.equal(main.fn("atlasWorkspaceSlotRead")("A").workspace.traderExternalSelection.id,"concrete");
  assert.equal(main.flashes.at(-1).msg,"MÉMOIRE A ENREGISTRÉE");
  const restored=createHarness({idbData:vault,legacyData:local,idbWorks:true,legacyWorks:false});
  await restored.fn("atlasWorkspaceSlotHydrate")();
  assert.equal(restored.fn("atlasWorkspaceSlotRead")("A").workspace.traderExternalSelection.instrument,"CT-USDT");
  assert.equal(await restored.fn("atlasWorkspaceSlotRecall")("A"),true,"Recall finds persisted record");
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(restored.reads,["CT"]);
  // Old localStorage-only B must remain readable, without migration deleting it.
  const key="agent_crypto_erith_ia_comparison_memory_slot_v1_B";
  local.set(key,JSON.stringify({schema:"agent_crypto_comparison_memory_slot_v1",slot:"B",
    savedAt:"2026-10-12T08:00:00Z",workspace:{selectedCoinId:"ethereum"}}));
  const legacy=createHarness({idbData:vault,legacyData:local,idbWorks:true,legacyWorks:false});
  await legacy.fn("atlasWorkspaceSlotHydrate")();
  assert.equal(legacy.fn("atlasWorkspaceSlotRead")("B").workspace.selectedCoinId,"ethereum");
  assert.ok(local.has(key),"Legacy record must never be deleted");
  // If IDB unavailable, original localStorage is still an accepted verified fallback.
  const fallback=createHarness({idbData:new Map(),legacyData:new Map(),idbWorks:false,legacyWorks:true});
  assert.equal(await fallback.fn("atlasWorkspaceSlotWrite")("C"),true);
  assert.equal(fallback.fn("atlasWorkspaceSlotRead")("C").workspace.traderExternalSelection.id,"concrete");
  // If neither store can write, never claim success or erase existing memory.
  const failed=createHarness({idbData:new Map(),legacyData:new Map(),idbWorks:false,legacyWorks:false});
  assert.equal(await failed.fn("atlasWorkspaceSlotWrite")("A"),false);
  assert.match(failed.flashes.at(-1).msg,/STOCKAGE SATURÉ/);
  assert.equal(failed.fn("atlasWorkspaceSlotRead")("A"),null);
  console.log("PASS A/B/C IndexedDB verified write, reload, legacy preservation, fallback, double failure");
})().catch(err=>{console.error(err);process.exitCode=1;});
