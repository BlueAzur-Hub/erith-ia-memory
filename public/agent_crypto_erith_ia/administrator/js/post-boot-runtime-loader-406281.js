/* Agent-Crypto Administrator — 40.6.281 P0 TRANSFORMER BOOK PARSER WALL RELIEF
   Same application, staged residency.
   Heavy secondary runtimes leave the parser critical path and are loaded in original order
   after the first market-ready mark, with a bounded fallback after startup livecheck.
   No feature removal, no Book-lite fork, no recurring timer, no storage schema change. */
(()=>{
  "use strict";
  const BUILD="40.6.281";
  const MEMORY_MODULES=Object.freeze([
    "./js/market-memory.js",
    "./js/analytical-memory.js",
    "./js/market-memory-collector.js",
    "./js/shared-memory-collector.js",
    "./js/shared-memory-reader-consistency.js",
    "./js/shared-memory-gap-aware-color.js",
    "./js/decision-board.js",
    "./js/multi-collector-concordance.js",
    "./js/aether-trust-return.js",
    "./js/aether-operator-bridge.js"
  ]);
  const SECONDARY_MODULES=Object.freeze([
    "./js/aether-role-visibility.js",
    "./js/strategy-a-replay.js",
    "./js/strategy-a-canonical-spec.js",
    "./js/strategy-a-replay-acceptance.js?v=40.6.273",
    "./js/strategy-a-paper-lifecycle.js",
    "./js/strategy-a-auto-lifecycle-bridge.js",
    "./js/strategy-a-after-cost-metrics.js",
    "./js/strategy-a-durable-evidence-store.js",
    "./js/strategy-a-safety-certification.js",
    "./js/strategy-a-evidence-dossier.js",
    "./js/strategy-a-paper-after-cost-acceptance.js",
    "./js/tradus-shadow-adapter.js",
    "./js/tradus-shadow-ledger.js",
    "./js/tradus-paper-shadow.js",
    "./js/tradus-paper-observability.js",
    "./js/aether-tradus-bridge.js",
    "./js/tradus-data-ui-decoupling.js",
    "./js/atlas-heartbeat-rearm.js",
    "./js/markets-domain-contract.js",
    "./js/views/system-demand-residency.js",
    "./js/views/secondary-domain-demand-residency.js",
    "./js/views/private-source-demand-loader.js",
    "./js/views/atlas-family-demand-residency.js",
    "./js/views/analysis-aux-demand-loader.js",
    "./js/layout-repair.js",
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
    "./js/version-truth.js"
  ]);

  const state={started:false,done:false,reason:"",loaded:0,failed:[]};
  const yieldMain=()=>new Promise(resolve=>{
    if(typeof requestIdleCallback==="function") requestIdleCallback(()=>resolve(),{timeout:500});
    else requestAnimationFrame(()=>resolve());
  });
  const loadOne=src=>new Promise(resolve=>{
    const existing=[...document.scripts].find(s=>s.dataset.postBootSrc===src);
    if(existing){resolve(existing.dataset.loaded==="1");return;}
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.dataset.postBootSrc=src;
    script.addEventListener("load",()=>{script.dataset.loaded="1";resolve(true);},{once:true});
    script.addEventListener("error",()=>{script.dataset.loaded="0";resolve(false);},{once:true});
    document.body.appendChild(script);
  });

  async function loadGroup(list,group){
    for(const src of list){
      await yieldMain();
      const ok=await loadOne(src);
      state.loaded+=ok?1:0;
      if(!ok) state.failed.push(src);
      try{globalThis.AgentCryptoBootProbe?.mark?.("postboot-module",{group,src,ok});}catch(_){}
    }
  }

  async function start(reason="market-ready"){
    if(state.started)return false;
    state.started=true; state.reason=String(reason||"unknown");
    try{globalThis.AgentCryptoBootProbe?.markOnce?.("postboot-runtime-start",{reason:state.reason});}catch(_){}
    await loadGroup(MEMORY_MODULES,"memory");
    try{window.dispatchEvent(new CustomEvent("agent-crypto:late-memory-ready",{detail:{build:BUILD}}));}catch(_){}
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
  function onMark(event){
    const name=String(event?.detail?.name||"");
    if(name==="market-ready"){window.removeEventListener("agent-crypto:boot-mark",onMark);void start("market-ready");}
    else if(name==="livecheck-start"){
      setTimeout(()=>{if(!state.started)void start("livecheck-fallback-15s");},15000);
    }
  }

  if(seen("market-ready")) void start("market-ready-already");
  else {
    window.addEventListener("agent-crypto:boot-mark",onMark);
    if(seen("livecheck-start")) setTimeout(()=>{if(!state.started)void start("livecheck-already-fallback-15s");},15000);
    window.addEventListener("load",()=>setTimeout(()=>{if(!state.started)void start("window-load-fallback-20s");},20000),{once:true,passive:true});
  }

  globalThis.AgentCryptoPostBootRuntime=Object.freeze({
    build:BUILD,
    start,
    snapshot:()=>Object.freeze({started:state.started,done:state.done,reason:state.reason,loaded:state.loaded,failed:Object.freeze(state.failed.slice()),memory_modules:MEMORY_MODULES.length,secondary_modules:SECONDARY_MODULES.length}),
    same_application:true,
    book_lite:false,
    parser_critical_path_relieved:true,
    recurring_timer:false,
    storage_schema_changed:false
  });
})();
