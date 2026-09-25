/* Agent-Crypto Administrator — 40.6.289 STORAGE PRIMARY TRUTH RESIDENCY
   Same application, staged residency.
   Heavy secondary runtimes wait until the consultation surface and Aether are resident.
   This prevents background Strategy/Tradus/Admin work from competing with Book consultation.
   No feature removal, no Book-lite fork, no recurring timer, no storage schema change. */
(()=>{
  "use strict";
  const BUILD="40.6.404";
  const MEMORY_MODULES=Object.freeze([
  ]);
  const STRATEGY_CORE_MODULES=Object.freeze([
    "./js/strategy-a-replay.js",
    "./js/strategy-a-canonical-spec.js",
    "./js/strategy-a-replay-acceptance.js?v=40.6.273",
    "./js/strategy-a-paper-lifecycle.js",
    "./js/strategy-a-auto-lifecycle-bridge.js",
    "./js/strategy-a-after-cost-metrics.js",
    "./js/strategy-a-durable-evidence-store.js",
    "./js/strategy-a-safety-certification.js",
    "./js/strategy-a-evidence-dossier.js",
    "./js/strategy-a-paper-after-cost-acceptance.js"
  ]);
  const SECONDARY_MODULES=Object.freeze([
    "./js/tradus-shadow-adapter.js",
    "./js/tradus-shadow-ledger.js",
    "./js/tradus-paper-shadow.js",
    "./js/tradus-paper-observability.js",
    "./js/tradus-data-ui-decoupling.js",
    "./js/atlas-heartbeat-rearm.js",
    "./js/markets-domain-contract.js",
    "./js/views/system-demand-residency.js",
    "./js/views/secondary-domain-demand-residency.js",
    "./js/views/private-source-demand-loader.js",
    "./js/views/atlas-family-demand-residency.js",
    "./js/views/analysis-aux-demand-loader.js",
    "./js/layout-repair.js?v=40.6.299",
    "./js/views/peripheral-diagnostics-loader.js",
    "./js/market-stack.js",
    "./js/parallel-markets.js",
    "./js/admin-theme-glass.js",
    "./js/event-intelligence.js",
    "./js/event-reaction-memory.js",
    "./js/event-reaction-ledger.js",
    "./js/event-semantic-enrichment.js",
    "./js/historical-analog-engine-405008.js",
    "./js/market-regime-context.js",
    "./js/event-memory.js",
    "./js/historical-analog-engine-405015.js",
    "./js/regime-qualified-analogs.js",
    "./js/horizon-calibration.js",
    "./js/capital-survival.js",
    "./js/decision-intelligence-acceptance.js",
    "./js/decision-explainability.js",
    "./js/decision-intelligence-current-truth.js",
    "./js/cross-market-owner-map.js",
    "./js/canonical-freeze.js",
    "./js/market-reading-depth.js",
    "./js/version-truth.js",
    "./js/storage-ownership-audit-406287.js",
    "./js/storage-relief-controlled-406288.js",
    "./js/storage-primary-truth-406344.js"
  ]);

  const MARKET_DEMAND_MODULES=Object.freeze([
    "./js/markets-domain-contract.js",
    "./js/market-stack.js",
    "./js/parallel-markets.js",
    "./js/cross-market-owner-map.js",
    "./js/market-reading-depth.js"
  ]);

  const state={started:false,done:false,reason:"",loaded:0,failed:[],strategyCoreStarted:false,strategyCoreReady:false,strategyCoreLoaded:0,strategyCoreFailed:[],marketDemandStarted:false,marketDemandReady:false,marketDemandReason:"",marketDemandFailed:[]};
  let marketDemandPromise=null;
  let strategyCorePromise=null;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  // 40.6.400 — cooperative bounded residency; operator input never gates progress.
  const yieldMain=(timeout=220)=>new Promise(resolve=>{
    if(typeof requestIdleCallback==="function")requestIdleCallback(()=>requestAnimationFrame(()=>resolve()),{timeout});
    else setTimeout(()=>requestAnimationFrame(()=>resolve()),Math.min(timeout,120));
  });
  const loadOne=src=>new Promise(resolve=>{
    const existing=[...document.scripts].find(s=>s.dataset.postBootSrc===src);
    if(existing){
      if(existing.dataset.loaded==="1"){resolve(true);return;}
      if(existing.dataset.loaded==="0"){resolve(false);return;}
      existing.addEventListener("load",()=>resolve(true),{once:true});
      existing.addEventListener("error",()=>resolve(false),{once:true});
      return;
    }
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.dataset.postBootSrc=src;
    script.addEventListener("load",()=>{script.dataset.loaded="1";resolve(true);},{once:true});
    script.addEventListener("error",()=>{script.dataset.loaded="0";resolve(false);},{once:true});
    document.body.appendChild(script);
  });

  async function loadMarketModulesNow(reason="operator-market-click"){
    if(globalThis.ErithDomainSkeletonMirror){
      state.marketDemandReady=true;
      return true;
    }
    if(marketDemandPromise)return marketDemandPromise;
    state.marketDemandStarted=true;
    state.marketDemandReason=String(reason||"operator-market-click");
    marketDemandPromise=(async()=>{
      const failed=[];
      for(const src of MARKET_DEMAND_MODULES){
        const ok=await loadOne(src);
        if(!ok)failed.push(src);
        try{globalThis.AgentCryptoBootProbe?.mark?.("market-demand-module",{src,ok,reason:state.marketDemandReason});}catch(_){}
        if(!ok)break;
      }
      state.marketDemandFailed=failed;
      state.marketDemandReady=failed.length===0 && !!globalThis.ErithDomainSkeletonMirror;
      try{
        window.dispatchEvent(new CustomEvent("agent-crypto:market-demand-ready",{detail:{build:BUILD,ok:state.marketDemandReady,failed:failed.slice()}}));
      }catch(_){}
      return state.marketDemandReady;
    })();
    return marketDemandPromise;
  }

  function earlyMarketDomain(button){
    const native=String(button?.dataset?.domain||"").toLowerCase();
    if(native==="metals")return "metals";
    const value=String(document.getElementById("atlasMarketDomainSwitchValue")?.textContent||"").toUpperCase();
    return value.includes("MÉTAUX")||value.includes("METAUX")?"metals":"crypto";
  }

  function onEarlyMarketSwitch(event){
    if(globalThis.ErithDomainSkeletonMirror)return;
    const button=event.target instanceof Element ? event.target.closest("#atlasMarketDomainSwitch") : null;
    if(!button)return;
    const domain=earlyMarketDomain(button);
    if(domain==="crypto"){
      void loadMarketModulesNow("first-market-click-warmup");
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    button.setAttribute("aria-busy","true");
    document.documentElement.dataset.marketLazyTransition="loading";
    void loadMarketModulesNow("metals-next-click").then(ok=>{
      button.removeAttribute("aria-busy");
      document.documentElement.dataset.marketLazyTransition=ok?"ready":"failed";
      if(ok)globalThis.ErithDomainSkeletonMirror?.go?.("indices");
    });
  }
  document.addEventListener("click",onEarlyMarketSwitch,true);

  async function loadStrategyCoreNow(reason="boot-priority"){
    if(state.strategyCoreReady)return true;
    if(strategyCorePromise)return strategyCorePromise;
    state.strategyCoreStarted=true;
    strategyCorePromise=(async()=>{
      const failed=[];
      for(let index=0; index<STRATEGY_CORE_MODULES.length; index++){
        const src=STRATEGY_CORE_MODULES[index];
        const cycleStart=performance.now();
        try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-core-module-cycle-start",{group:"strategy",src,index:index+1,total:STRATEGY_CORE_MODULES.length,reason});}catch(_){}
        await yieldMain(160); await sleep(18);
        const loadStart=performance.now();
        try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-core-module-load-start",{group:"strategy",src,index:index+1,total:STRATEGY_CORE_MODULES.length,reason});}catch(_){}
        const ok=await loadOne(src);
        const loadEnd=performance.now();
        if(ok)state.strategyCoreLoaded+=1; else failed.push(src);
        try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-core-module-load-end",{group:"strategy",src,index:index+1,total:STRATEGY_CORE_MODULES.length,ok,loaded:state.strategyCoreLoaded,reason,load_ms:Number((loadEnd-loadStart).toFixed(3)),cycle_ms:Number((loadEnd-cycleStart).toFixed(3))});}catch(_){}
        try{globalThis.AgentCryptoBootProbe?.mark?.("strategy-core-module",{src,ok,loaded:state.strategyCoreLoaded,reason,index:index+1,total:STRATEGY_CORE_MODULES.length});}catch(_){}
      }
      state.strategyCoreFailed=failed; state.strategyCoreReady=failed.length===0;
      try{globalThis.AgentCryptoBootProbe?.markOnce?.("strategy-core-ready",{loaded:state.strategyCoreLoaded,failed:failed.length,reason});}catch(_){}
      try{window.dispatchEvent(new CustomEvent("agent-crypto:strategy-core-ready",{detail:{build:BUILD,ok:state.strategyCoreReady,failed:failed.slice()}}));}catch(_){}
      return state.strategyCoreReady;
    })();
    return strategyCorePromise;
  }
  async function loadGroup(list,group){
    const pauseMs=group==="memory"?18:28, idleTimeout=group==="memory"?160:220;
    for(let index=0; index<list.length; index++){
      const src=list[index];
      const cycleStart=performance.now();
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module-cycle-start",{group,src,index:index+1,total:list.length});}catch(_){}
      await sleep(pauseMs); await yieldMain(idleTimeout);
      const loadStart=performance.now();
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module-load-start",{group,src,index:index+1,total:list.length});}catch(_){}
      const ok=await loadOne(src);
      const loadEnd=performance.now();
      state.loaded+=ok?1:0; if(!ok)state.failed.push(src);
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module-load-end",{group,src,index:index+1,total:list.length,ok,loaded:state.loaded,load_ms:Number((loadEnd-loadStart).toFixed(3)),cycle_ms:Number((loadEnd-cycleStart).toFixed(3))});}catch(_){}
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module",{group,src,ok,loaded:state.loaded,index:index+1,total:list.length});}catch(_){}
    }
  }

  async function start(reason="aether-ready"){
    if(state.started)return false;
    state.started=true; state.reason=String(reason||"unknown");
    try{globalThis.AgentCryptoBootProbe?.markOnce?.("postboot-runtime-start",{reason:state.reason});}catch(_){}
    await loadStrategyCoreNow("postboot-join");
    await loadGroup(MEMORY_MODULES,"memory");
    try{window.dispatchEvent(new CustomEvent("agent-crypto:late-memory-ready",{detail:{build:BUILD}}));}catch(_){}
    await sleep(120); await yieldMain(220);
    await loadGroup(SECONDARY_MODULES,"secondary");
    state.done=true;
    try{globalThis.AgentCryptoBootProbe?.markOnce?.("postboot-runtime-ready",{loaded:state.loaded,failed:state.failed.length});}catch(_){}
    try{window.dispatchEvent(new CustomEvent("agent-crypto:postboot-runtime-ready",{detail:{build:BUILD,loaded:state.loaded,failed:state.failed.slice()}}));}catch(_){}
    return state.failed.length===0;
  }

  function seen(name){
    try{return Number.isFinite(Number(globalThis.AgentCryptoBootProbe?.snapshot?.()?.first_ms?.[name]));}
    catch(_){return false;}
  }
  function consultationAetherReady(){
    try{return globalThis.AgentCryptoConsultationFirst406286?.snapshot?.()?.aether_state==="ready";}
    catch(_){return false;}
  }
  function scheduleAfterAether(reason){setTimeout(()=>{if(!state.started)void start(reason);},1500);}
  function onAetherReady(){window.removeEventListener("agent-crypto:aether-ready",onAetherReady);scheduleAfterAether("aether-ready+1500ms");}
  function onAetherFailed(){setTimeout(()=>{if(!state.started)void start("aether-failed-fallback+5000ms");},5000);}

  if(seen("aether-ready")||consultationAetherReady()) scheduleAfterAether("aether-ready-already+1500ms");
  else {
    window.addEventListener("agent-crypto:aether-ready",onAetherReady,{once:true,passive:true});
    window.addEventListener("agent-crypto:aether-failed",onAetherFailed,{once:true,passive:true});
  }

  const bootStrategyCore=()=>{void loadStrategyCoreNow("boot-priority");};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootStrategyCore,{once:true,passive:true});
  else queueMicrotask(bootStrategyCore);

  globalThis.AgentCryptoPostBootRuntime=Object.freeze({
    build:BUILD,
    start,
    snapshot:()=>Object.freeze({started:state.started,done:state.done,reason:state.reason,loaded:state.loaded,total:MEMORY_MODULES.length+SECONDARY_MODULES.length,failed:Object.freeze(state.failed.slice()),strategy_core_started:state.strategyCoreStarted,strategy_core_ready:state.strategyCoreReady,strategy_core_loaded:state.strategyCoreLoaded,strategy_core_total:STRATEGY_CORE_MODULES.length,strategy_core_failed:Object.freeze(state.strategyCoreFailed.slice()),memory_modules:MEMORY_MODULES.length,secondary_modules:SECONDARY_MODULES.length,backpressure:"COOPERATIVE_BOUNDED_NO_OPERATOR_QUIET_406400",operator_quiet_ms:0,background_owner:"AFTER_AETHER_READY",market_demand_started:state.marketDemandStarted,market_demand_ready:state.marketDemandReady,market_demand_reason:state.marketDemandReason,market_demand_failed:Object.freeze(state.marketDemandFailed.slice())}),
    loadMarketsNow:loadMarketModulesNow,
    loadStrategyCoreNow,
    marketDemandModules:MARKET_DEMAND_MODULES.slice(),
    market_lazy_cycle_guard:true,
    same_application:true,
    book_lite:false,
    parser_critical_path_relieved:true,
    recurring_timer:false,
    storage_schema_changed:false
  });
})();
