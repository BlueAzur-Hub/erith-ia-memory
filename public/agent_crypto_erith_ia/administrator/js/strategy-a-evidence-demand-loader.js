/* Agent-Crypto Administrator — 40.6.274 BOOT QUIETNESS / TRUE DEMAND
   Canonical Strategy A evidence modules stay fully available, but do not wake
   merely because the page finished loading. They load in original order only
   on explicit Strategy A demand, paced one module per browser idle slice.
   No recurring timer, observer, business network request or order path. */
(() => {
  "use strict";
  if (globalThis.AgentCryptoCanonicalEvidenceWiring?.owner === "strategy-a-evidence-demand-loader.js") return;

  const BUILD = "40.6.274";
  const MODULES = Object.freeze([
    "./js/strategy-a-evidence-lifecycle-truth.js",
    "./js/strategy-a-foundation-applicability-truth.js",
    "./js/strategy-a-foundation-delegated-certification-406221.js",
    "./js/strategy-a-time-semantics-truth.js",
    "./js/strategy-a-g3-structured-data-truth.js",
    "./js/strategy-a-g3-history-owner-discovery.js",
    "./js/strategy-a-g3-historical-evidence-adapter.js",
    "./js/strategy-a-g3-t0-decision-proof.js",
    "./js/strategy-a-g3-replay-dataset.js",
    "./js/strategy-a-g3-decision-replay.js",
    "./js/strategy-a-g3-cascade-checkpoint.js",
    "./js/strategy-a-gate-canonical-truth.js",
    "./js/strategy-a-evidence-dossier-supplement-integrator.js",
    "./js/strategy-a-g3-prospective-t0-capture.js",
    "./js/strategy-a-g3-overlap-live-refresh.js",
    "./js/strategy-a-g3-post-horizon-outcome.js",
    "./js/strategy-a-g3-post-horizon-mount-repair-406216.js",
    "./js/strategy-a-g3-outcome-certification-406222.js",
    "./js/strategy-a-g3-realistic-replay-readiness-406223.js",
    "./js/strategy-a-g3-forward-evidence-bridge-406224.js",
    "./js/strategy-a-g3-current-truth-surface-406225.js",
    "./js/strategy-a-g3-strict-decision-time-truth-406226.js",
    "./js/strategy-a-g3-strict-truth-mount-proof-406227.js",
    "./js/strategy-a-g3-strict-outcome-revalidation-406228.js",
    "./js/strategy-a-g3-strict-execution-realism-rebind-406229.js"
  ]);
  const PRESENTATION = Object.freeze(["./js/administrator-operator-focus-406216.js"]);
  const PANEL_IDS = Object.freeze([
    "strategyAG3StructuredTruth",
    "strategyAG3HistoryOwnerDiscovery",
    "strategyAG3HistoricalEvidenceAdapter",
    "strategyAG3T0DecisionProof",
    "strategyAG3ReplayDataset",
    "strategyAG3DecisionReplay",
    "strategyAG3CascadeCheckpoint"
  ]);

  const loaded = new Set();
  let loading = null;
  let complete = false;
  let reasonLast = "not-started";

  const absolute = src => new URL(src, document.baseURI).href.split("?")[0];
  function present(src) {
    const wanted = absolute(src);
    return Array.from(document.scripts).some(script => {
      try { return script.src && new URL(script.src, document.baseURI).href.split("?")[0] === wanted; }
      catch (_) { return false; }
    });
  }
  function yieldBrowser(timeout=4000) {
    return new Promise(resolve => {
      if (typeof requestIdleCallback === "function") requestIdleCallback(() => resolve(), {timeout});
      else setTimeout(resolve, 48);
    });
  }
  function loadOne(src) {
    if (loaded.has(src) || present(src)) { loaded.add(src); return Promise.resolve(src); }
    return new Promise((resolve,reject) => {
      const script=document.createElement("script");
      script.src=new URL(src,document.baseURI).href;
      script.async=false;
      script.dataset.agentCryptoEvidenceDemandModule=src;
      script.addEventListener("load",()=>{loaded.add(src);resolve(src);},{once:true});
      script.addEventListener("error",()=>reject(new Error("evidence demand module failed: "+src)),{once:true});
      document.head.appendChild(script);
    });
  }
  function mountEvidence() {
    try{globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator?.mount?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAFoundationDelegatedCertification?.run?.("406274-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3ProspectiveT0Capture?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3OverlapLiveRefresh?.refresh?.("406274-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3PostHorizonOutcome?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3PostHorizonMountRepair?.mount?.("406274-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3OutcomeCertification?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3RealisticReplayReadiness?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3ForwardEvidenceBridge?.render?.();}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3CurrentTruthSurface?.render?.("406274-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3StrictDecisionTimeTruth?.render?.("406274-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3StrictTruthMountProof?.mount?.("406274-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3StrictOutcomeRevalidation?.render?.("406274-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoStrategyAG3StrictExecutionRealismRebind?.render?.("406274-demand-owner");}catch(_){}
    try{globalThis.AgentCryptoAdministratorOperatorFocus?.requestSettled?.("406274-demand-owner");}catch(_){}
  }
  async function load(reason="manual") {
    reasonLast=String(reason||"manual");
    if (complete) { mountEvidence(); return MODULES.slice(); }
    if (loading) return loading;
    loading=(async()=>{
      for (const src of [...MODULES,...PRESENTATION]) {
        await yieldBrowser();
        try { await loadOne(src); } catch (error) { console.warn("[40.6.273 evidence demand]", src, error); }
      }
      complete=true;
      mountEvidence();
      try{document.dispatchEvent(new CustomEvent("agent-crypto:runtime-modules-ready",{detail:{modules:MODULES.slice(),source:"40.6.274-demand-only"}}));}catch(_){}
      try{document.dispatchEvent(new CustomEvent("agent-crypto:evidence-data-changed",{detail:{source:"40.6.274-demand-only"}}));}catch(_){}
      return MODULES.slice();
    })();
    try { return await loading; } finally { loading=null; }
  }
  function strategyIntent(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest('[id^="strategyA"],[id*="StrategyA"],[data-collapse-key*="strategy"],[data-collapse-key*="Strategy"]')) return true;
    const anchor=target.closest('a[href*="strategyA"],a[href*="StrategyA"]');
    return !!anchor;
  }
  document.addEventListener("click",event=>{if(strategyIntent(event.target))void load("operator-strategy-demand");},true);
  if (String(location.hash||"").toLowerCase().includes("strategya")) void load("strategy-hash-demand");

  globalThis.AgentCryptoCanonicalEvidenceWiring=Object.freeze({
    build:BUILD,
    owner:"strategy-a-evidence-demand-loader.js",
    mode:"DEMAND_ONLY_PACED",
    modules:MODULES,
    presentation_modules:PRESENTATION,
    panels:PANEL_IDS,
    load,
    loaded:()=>Object.freeze(Array.from(loaded)),
    snapshot:()=>Object.freeze({
      build:BUILD,owner:"strategy-a-evidence-demand-loader.js",mode:"DEMAND_ONLY_PACED",
      loaded:loaded.size,total:MODULES.length+PRESENTATION.length,complete,reason_last:reasonLast,
      direct_parser_injection:false,idle_paced:true,automatic_background_load:false,recurring_timer:false,observer:false,
      business_network_request:false,real_order:false,paper_only:true,
      g3:"PENDING",g9:"LOCKED"
    })
  });
})();
