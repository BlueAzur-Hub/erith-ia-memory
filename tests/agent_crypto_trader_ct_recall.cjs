"use strict";
/* Execute the real request arbitration and A/B/C CT recall paths with deterministic sources. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const base=path.resolve(__dirname,"../public/agent_crypto_erith_ia/administrator");
function range(src,start,end){
  const i=src.indexOf(start),j=src.indexOf(end,i+start.length);
  assert.ok(i>=0&&j>i,"Missing source anchors "+start);
  return src.slice(i,j);
}
const native=range(fs.readFileSync(path.join(base,"js/new-listings-native-category.js"),"utf8"),
  "function beginRequest(spec){","function deactivate(");
const recall=range(fs.readFileSync(path.join(base,"app.js"),"utf8"),
  "async function atlasWorkspaceSlotRecall(slotId) {","function atlasWorkspaceSlotsRender() {");
const spec={id:"concrete",name:"Concrete",symbol:"CT",provider:"okx",providerLabel:"OKX",
  base:"CT",quote:"USDT",pair:"CT/USDT",providerSymbol:"CT-USDT"};
function newSelectHarness(){
  const pending=[],presented=[],notes=[],events=[],state={
    requestController:null,requestRevision:0,pending:null,selected:null,lastError:null,
    lastResult:null,selectionFlight:null,coinCache:new Map()
  };
  let external={active:false,id:null},loads=0;
  const api={
    snapshot:()=>external,
    load:(_input,{signal})=>{loads++;return new Promise((resolve,reject)=>pending.push({
      signal,resolve:()=>{external={active:true,id:_input.id};resolve({marketTicker:null});},
      reject
    }));},
    fetchCandles:async()=>({provider:"okx",instrument:"CT-USDT",rows:[{c:0.36,t:1,v:2}]})
  };
  const context={
    state,console,AbortController,Date,Promise,Number,Array,Math,
    upper:x=>String(x||"").toUpperCase(),displayCurrency:()=>"USD",quoteRate:()=>1,
    fetchQuoteRates:async()=>{},periodConfig:()=>({bar:"5m",limit:300}),
    coinFromSpec:s=>({id:s.id,symbol:s.symbol,name:s.name}),
    patchUniverseResolver(){},renderCategory(){},hideLegacyUx(){},
    resultFromCandles:(_s,_coin)=>({series:[[1,0.36]]}),
    patchNativeFiche(){},NOTE_ID:"selectionNote",
    window:{dispatchEvent:e=>events.push(e.type)},
    CustomEvent:class{constructor(type){this.type=type;}},
    document:{getElementById:id=>id==="selectionNote"?{set textContent(v){notes.push(v)}}:null},
    globalThis:null
  };
  context.globalThis=context;
  context.AtlasExternalChart={present:(coin)=>{presented.push(coin.id);return true;},
    state:()=>({coin_id:state.selected?.id,active:true})};
  context.AgentCryptoNewListingLiveAsset=api;
  context.AgentCryptoMarketMicroscope={setMode(){}};
  vm.createContext(context);
  vm.runInContext(native+"\nthis.select=select;",context);
  return {state,select:context.select,pending,presented,events,notes,get loads(){return loads;}};
}
function recallHarness({success=false,operatorChange=false}={}){
  const flashes=[],writes=[];
  const initial={sequence:7,market:{comparisonPreset:"rank-5",comparisonIds:["bitcoin","ethereum"]},
    traderExternalSelection:null};
  let current=initial,ready=success,release=null;
  const ticket=new Promise(resolve=>{release=resolve;});
  const ct={id:"concrete",provider:"okx",instrument:"CT-USDT",view:"line",
    presentation:{view:"price",scale:"linear"}};
  const context={
    console,Promise,Number,atlasWorkspaceSlotNormalizeId:x=>x,atlasWorkspaceSlotHydrate:async()=>{},
    atlasWorkspaceSlotRead:()=>({workspace:{traderExternalSelection:ct}}),
    atlasTraderExternalSelectionNormalize:()=>ct,atlasTraderIsRuntime:()=>true,
    atlasTraderExternalSelectionRead:()=>current.traderExternalSelection,
    atlasTraderExternalSelectionCommit:()=>{
      current={...current,sequence:current.sequence+1,traderExternalSelection:ct};return true;
    },
    atlasGraphContextV7Read:()=>current,
    atlasGraphContextV7Store:(payload,action,opts)=>{
      writes.push({action,options:opts,payload});
      current={...payload,sequence:current.sequence+1};
      return current;
    },
    atlasWorkspaceSlotFlash:(msg)=>flashes.push(msg),
    atlasWorkspaceRenderStrip(){},globalThis:null
  };
  context.globalThis=context;
  context.AgentCryptoNewListingsNativeCategory={selectById:()=>ticket};
  context.AtlasExternalChart={state:()=>ready?{active:true,coin_id:"concrete",period:1,
    loading:false,error:null}:{active:false,coin_id:"bitcoin"}};
  context.AgentCryptoNewListingLiveAsset={snapshot:()=>ready?{
    active:true,id:"concrete",provider:"okx",providerSymbol:"CT-USDT"}:{active:false}};
  vm.createContext(context);
  vm.runInContext(recall+"\nthis.recall=atlasWorkspaceSlotRecall;",context);
  return {
    recall:context.recall,flashes,writes,
    resolve(value){release(value);},
    changeOperator(){current={...current,sequence:current.sequence+1,
      traderExternalSelection:{id:"other"}};},
    current:()=>current
  };
}
(async()=>{
  const h=newSelectHarness();
  const first=h.select(spec),second=h.select(spec);
  assert.equal(first,second,"Same CT request must join, not cancel the earlier owner");
  assert.equal(h.loads,1,"Only one market loading request");
  assert.equal(h.pending[0].signal.aborted,false);
  h.pending[0].resolve();
  assert.deepEqual(await Promise.all([first,second]),[true,true]);
  assert.deepEqual(h.presented,["concrete"]);
  assert.equal(h.state.selected.id,"concrete");

  const h2=newSelectHarness();
  const old=h2.select(spec);
  const next={...spec,id:"other",base:"OTHER",providerSymbol:"OTHER-USDT"};
  const newer=h2.select(next);
  assert.equal(h2.pending[0].signal.aborted,true,"Different asset supersedes previous selection");
  h2.pending[0].resolve();
  h2.pending[1].reject(new Error("Provider offline"));
  assert.equal(await old,false);
  assert.equal(await newer,false);
  assert.equal(h2.state.selected,null,"Failed selection cannot leave a phantom CT active");

  const failed=recallHarness();
  assert.equal(await failed.recall("A"),true);
  failed.resolve(false);
  await new Promise(setImmediate);
  assert.equal(failed.current().traderExternalSelection,null,"Failed CT restore returns to market");
  assert.equal(failed.current().market.comparisonPreset,"rank-5","Top 5 memory preserved");
  assert.equal(failed.writes.length,1,"One compensating write, no repeated owners");
  assert.equal(failed.writes[0].options.system,true);

  const passed=recallHarness({success:true});
  assert.equal(await passed.recall("A"),true);
  passed.resolve(true);
  await new Promise(setImmediate);
  assert.equal(passed.current().traderExternalSelection.id,"concrete");
  assert.equal(passed.writes.length,0,"Successful CT recall never rolls back");
  assert.match(passed.flashes.at(-1),/RESTAURÉE · CT/);

  const superseded=recallHarness();
  assert.equal(await superseded.recall("A"),true);
  superseded.changeOperator();
  superseded.resolve(false);
  await new Promise(setImmediate);
  assert.equal(superseded.writes.length,0,"A later operator choice must never be rolled back");
  console.log("PASS Trader CT single-flight, failure rollback, later operator, Top 5 preserved");
})().catch(e=>{console.error(e);process.exitCode=1;});
