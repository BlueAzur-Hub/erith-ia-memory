"use strict";
/* Workspace chip and A/B/C: displayed chart wins over hidden Market subprofile.
   Node only, read-only fixture: no live market, browser writes, wallet or orders. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const app=fs.readFileSync(path.resolve(__dirname,"../public/agent_crypto_erith_ia/administrator/app.js"),"utf8");
function section(a,b){
  const i=app.indexOf(a),j=app.indexOf(b,i);
  assert(i>=0&&j>i,"missing "+a+" / "+b);
  return app.slice(i,j);
}
const chip=section("function atlasWorkspaceVisibleExternal(){","// Repaint the chip only");
const slotWrite=section("function atlasWorkspaceSlotWrite(slotId, options = {}) {","function atlasWorkspaceSlotValidIds(");
const slotRecall=section("function atlasWorkspaceSlotRecall(slotId) {","function atlasWorkspaceSlotsRender()");
const CT={id:"concrete",provider:"okx",instrument:"CT-USDT",view:"line",presentation:{view:"price",scale:"linear",volume:true}};
const chart={active:true,coin_id:"concrete",symbol:"CT",period:1,loading:false,error:null,
  presentation:{view:"price",scale:"linear",volume:true}};
const snapshot={active:true,id:"concrete",provider:"okx",providerSymbol:"CT-USDT",nativeMarket:true};
const elements=Object.fromEntries(["atlasWorkspaceReprise","atlasWorkspaceRepriseKicker","atlasWorkspaceReprisePrimary","atlasWorkspaceRepriseSecondary"].map(k=>[k,{dataset:{},textContent:""}]));
let savedIntent=null,renderCount=0;
const context={
  document:{getElementById:id=>elements[id]||null},
  globalThis:{
    AtlasExternalChart:{state:()=>chart},
    __atlasExternalChartContext:{coin:{id:"concrete",name:"Concrete",symbol:"CT"},result:{currency:"USD"}},
    AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:"USD"})},
    AgentCryptoNewListingLiveAsset:{snapshot:()=>snapshot}
  },
  atlasParallelMarketDomain:()=> "crypto",
  atlasTraderExternalSelectionRead:()=>savedIntent,
  atlasExternalPresentation:()=>chart.presentation,
  atlasChartPeriodLabel:n=>Number(n)===1?"24h":n+"j",
  atlasWorkspaceSlotsRender:()=>{renderCount++},
};
vm.runInNewContext(chip+"\nthis.visible=atlasWorkspaceVisibleExternal;this.render=atlasWorkspaceRenderStrip;",context);
context.render();
assert.match(elements.atlasWorkspaceReprisePrimary.textContent,/CT · Concrete · 24h · Prix USD/);
assert.doesNotMatch(elements.atlasWorkspaceReprisePrimary.textContent,/BTC|Bitcoin|Solo/);
assert.equal(elements.atlasWorkspaceRepriseKicker.textContent,"VUE EXTERNE ACTIVE","Admin does not claim unsaved CT restart state");
assert.match(elements.atlasWorkspaceRepriseSecondary.textContent,/profil Marché V7 conservé séparément/);
savedIntent=CT;
context.render();
assert.equal(elements.atlasWorkspaceRepriseKicker.textContent,"ESPACE MÉMORISÉ","Trader V7 saved CT is displayed as memorized");
chart.loading=true;context.render();
assert.match(elements.atlasWorkspaceRepriseSecondary.textContent,/en attente de chargement/);
chart.loading=false;

let wrote=null,flashed=null;
const store={
  ...context,
  atlasWorkspaceSlotNormalizeId: s=>s,
  atlasScannerTransaction:false,atlasScannerQueuedRequest:false,
  atlasWorkspaceCapture:()=>({selectedCoinId:"bitcoin",comparisonPreset:"solo",displayCurrency:"USD"}),
  atlasTraderIsRuntime:()=>false,
  atlasTraderExternalSelectionNormalize:raw=>raw.id==="concrete"&&raw.instrument==="CT-USDT"?raw:null,
  atlasWorkspaceSlotStorageKey:s=>s,
  localStorage:{setItem:(key,value)=>{wrote={key,payload:JSON.parse(value)}}},
  atlasWorkspaceSlotFlash:(msg)=>{flashed=msg},
  ATLAS_RELEASE:"test",
  Date,JSON
};
vm.runInNewContext(slotWrite+"\nthis.write=atlasWorkspaceSlotWrite;",store);
assert.equal(store.write("A",{overwrite:true}),true);
assert.equal(wrote.payload.workspace.traderExternalSelection.id,"concrete","Administrator A must store CT, never BTC under CT view");
assert.equal(wrote.payload.workspace.displayCurrency,"USD");
wrote=null;chart.loading=true;
assert.equal(store.write("A",{overwrite:true}),false,"No overwrite on unfinished CT chart");
assert.equal(wrote,null,"Existing slot intact if CT not ready");
chart.loading=false;

assert.match(slotRecall,/if\(trader&&!atlasTraderExternalSelectionCommit/,"Only Trader commits V7 when recalling CT");
assert.match(slotRecall,/globalThis.AgentCryptoNewListingsNativeCategory\?\.deactivate/,"BTC slot must deactivate external CT before market draw");
assert.match(slotRecall,/atlasTraderExternalSelectionClear\(\)/,"Trader removes CT V7 selection on explicit Market slot");
assert.match(app,/function atlasWorkspaceSlotSummary\(snapshot\)[\s\S]*?devise non mémorisée/,"Old slot currency must not be invented");
assert.match(app,/window.addEventListener\("agent-crypto:new-listing-line-ready",\(\)=>atlasWorkspaceRenderStrip\(\)/,
  "The chip must refresh when the externally sourced CT line becomes visible");
console.log("PASS workspace chip CT both surfaces, BTC V7 isolation, Admin slot CT, fail-closed save, market return, no synthetic FX.");
