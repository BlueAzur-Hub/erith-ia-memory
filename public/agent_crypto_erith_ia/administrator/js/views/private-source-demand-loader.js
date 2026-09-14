/* Agent-Crypto @erith.IA — stable Source Truth demand loader
   40.6.93 removes build-specific ownership from the loader.
   40.6.95 hotfix loads the Strategy A Paper proof trigger repair without a build bump.
   40.6.96+ loads the bounded post-handoff stabilization layer by immutable entry build.
   40.6.98+ loads DEX exclusion diagnostics as a read-only observability layer.
   40.6.101+ loads the fresh-CEX divergence fail-closed quality gate.
   40.6.113+ routes DEX exclusion diagnostics to the canonical unversioned owner.
   40.6.114+ loads the canonical read-only Atlas Decision Context composer.
   40.6.115+ loads the visible Strategy A ↔ TRADUS comparative intelligence owner.
   40.6.116 visual hotfix: Operator Cockpit injection removed; 40.6.115 presentation restored.
   40.6.117 bounded hotfix: loads derived Strategy A ↔ TRADUS Outcome Memory without a new panel.
   Source Truth stays in its canonical Backend / API host.
   private-backend-sources.js remains the single Source Truth runtime owner.
   No polling, observer, loader storage write, wallet or trading endpoint is introduced. */
(()=>{
  "use strict";
  const INSTANCE_KEY="__ERITH_PRIVATE_SOURCE_DEMAND_STABLE_BOUND__";
  if(globalThis[INSTANCE_KEY])return;
  globalThis[INSTANCE_KEY]=true;
  const metaBuild=()=>String(document.querySelector('meta[name="administrator-build"]')?.content||"").trim();
  const pathBuild=()=>String(location.pathname||"").match(/(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i)?.[1]||"";
  const BUILD=String(globalThis.ErithVersionTruth?.build||pathBuild()||metaBuild()||"runtime").trim();
  const runtimeBuild=()=>String(globalThis.ErithVersionTruth?.build||pathBuild()||new URLSearchParams(location.search||"").get("ac-build")||metaBuild()||BUILD||"runtime").trim();
  const SRC=`./js/views/private-backend-sources.js?v=administrator-build-${encodeURIComponent(BUILD)}`;
  let state="idle",promise=null,reason="",loadedAt=0,lastError="";

  const parts=value=>String(value||"").split(".").map(x=>Number.parseInt(x,10)||0);
  const atLeast=target=>{const A=parts(runtimeBuild()),B=parts(target),n=Math.max(A.length,B.length);for(let i=0;i<n;i+=1){const d=(A[i]||0)-(B[i]||0);if(d)return d>0;}return true;};

  function ensureStrategyProofHotfix(){
    if(runtimeBuild()!=="40.6.95")return false;
    if(globalThis.__ERITH_STRATEGY_A_PAPER_PROOF_HOTFIX_406095__)return true;
    if(document.querySelector('script[data-strategy-a-paper-proof-hotfix="true"]'))return true;
    const script=document.createElement("script");
    script.src="./js/strategy-a-paper-proof-hotfix.js?v=hotfix-1";
    script.async=false;
    script.dataset.strategyAPaperProofHotfix="true";
    document.head.appendChild(script);
    return true;
  }

  function ensurePostHandoff(){
    if(!atLeast("40.6.96"))return false;
    if(globalThis.__AGENT_CRYPTO_POST_HANDOFF_406096__)return true;
    if(document.querySelector('script[data-agent-crypto-post-handoff="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/agent-crypto-post-handoff-406096.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.agentCryptoPostHandoff="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureDexDiagnostics(){
    if(!atLeast("40.6.98"))return false;
    if(atLeast("40.6.113")){
      if(globalThis.AgentCryptoDexExclusionDiagnostics?.owner==="dex-exclusion-diagnostics")return true;
      if(document.querySelector('script[data-dex-exclusion-diagnostics-canonical="true"]'))return true;
      const script=document.createElement("script");
      script.src=`./js/dex-exclusion-diagnostics.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
      script.async=false;
      script.dataset.dexExclusionDiagnosticsCanonical="true";
      document.head.appendChild(script);
      return true;
    }
    if(globalThis.AgentCryptoDexExclusionDiagnostics406098)return true;
    if(document.querySelector('script[data-dex-exclusion-diagnostics="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/dex-exclusion-diagnostics-406098.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.dexExclusionDiagnostics="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureCexDivergenceGuard(){
    if(!atLeast("40.6.101"))return false;
    if(globalThis.AgentCryptoCexDivergenceGuard)return true;
    if(document.querySelector('script[data-cex-divergence-guard="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/cex-divergence-guard-406101.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.cexDivergenceGuard="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureAtlasDecisionContext(){
    if(!atLeast("40.6.114"))return false;
    if(globalThis.AgentCryptoAtlasDecisionContext?.owner==="atlas-decision-context")return true;
    if(document.querySelector('script[data-atlas-decision-context="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/atlas-decision-context.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.atlasDecisionContext="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureStrategyTradusComparative(){
    if(!atLeast("40.6.115"))return false;
    if(globalThis.AgentCryptoStrategyTradusComparativeIntelligence?.owner==="strategy-tradus-comparative-intelligence")return true;
    if(document.querySelector('script[data-strategy-tradus-comparative-intelligence="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/strategy-tradus-comparative-intelligence.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.strategyTradusComparativeIntelligence="true";
    document.head.appendChild(script);
    return true;
  }

  function ensureStrategyTradusOutcomeMemory(){
    if(!atLeast("40.6.117"))return false;
    if(globalThis.AgentCryptoStrategyTradusOutcomeMemory?.owner==="strategy-tradus-outcome-memory")return true;
    if(document.querySelector('script[data-strategy-tradus-outcome-memory="true"]'))return true;
    const script=document.createElement("script");
    script.src=`./js/strategy-tradus-outcome-memory.js?v=administrator-build-${encodeURIComponent(runtimeBuild())}`;
    script.async=false;
    script.dataset.strategyTradusOutcomeMemory="true";
    document.head.appendChild(script);
    return true;
  }

  function settleReady(){state="ready";loadedAt=Date.now();lastError="";return true;}

  function afterSourceOwners(){
    ensureDexDiagnostics();
    ensureCexDivergenceGuard();
    ensureAtlasDecisionContext();
    ensureStrategyTradusComparative();
    ensureStrategyTradusOutcomeMemory();
  }

  function ensure(why="operator"){
    reason=String(why||"operator");
    if(state==="ready"||globalThis.ErithPrivateBackendSources||globalThis.__AGENT_CRYPTO_SOURCE_INTELLIGENCE_40459__){settleReady();afterSourceOwners();return Promise.resolve(true);}
    if(promise)return promise;
    state="loading";
    promise=new Promise(resolve=>{
      const existing=document.querySelector('script[data-private-source-demand-stable="true"],script[data-private-source-demand="true"]');
      if(existing){
        if(globalThis.ErithPrivateBackendSources||existing.dataset.loaded==="true"){afterSourceOwners();resolve(settleReady());return;}
        existing.addEventListener("load",()=>{existing.dataset.loaded="true";afterSourceOwners();resolve(settleReady());},{once:true});
        existing.addEventListener("error",()=>{state="error";lastError="load-error";resolve(false);},{once:true});
        return;
      }
      const script=document.createElement("script");
      script.src=SRC;
      script.async=true;
      script.dataset.privateSourceDemandStable="true";
      script.addEventListener("load",()=>{script.dataset.loaded="true";settleReady();afterSourceOwners();try{window.dispatchEvent(new CustomEvent("erith:private-source-runtime-loaded",{detail:{build:runtimeBuild(),reason}}));}catch(_){}resolve(true);},{once:true});
      script.addEventListener("error",()=>{state="error";lastError="script-load-error";resolve(false);},{once:true});
      document.head.appendChild(script);
    }).finally(()=>{promise=null;});
    return promise;
  }

  function clickDemand(event){
    const target=event.target instanceof Element?event.target:null;
    if(!target)return;
    const sourceNav=target.closest('[data-atlas-essential-target="sources"],[aria-controls="sources"],a[href="#sources"]');
    const backend=target.closest('details[data-collapse-key="backend"] > summary,a[href="#backend"],a[href="#privateBackendV1"]');
    if(sourceNav)void ensure("sources");
    else if(backend)void ensure("backend");
  }
  document.addEventListener("click",clickDemand,true);

  const backend=document.querySelector('details[data-collapse-key="backend"]');
  backend?.addEventListener("toggle",()=>{if(backend.open)void ensure("backend-open");});
  window.addEventListener("erith:system-hydrated",event=>{if(String(event?.detail?.key||"")==="backend"&&document.querySelector('details[data-collapse-key="backend"]')?.open)void ensure("backend-hydrated");},{passive:true});

  const hash=String(location.hash||"");
  if(["#sources","#backend","#privateBackendV1","#privateSourceIntelligence"].includes(hash))void ensure("direct-hash");
  ensureStrategyProofHotfix();
  ensurePostHandoff();
  ensureDexDiagnostics();
  ensureCexDivergenceGuard();
  ensureAtlasDecisionContext();
  ensureStrategyTradusComparative();
  ensureStrategyTradusOutcomeMemory();
  queueMicrotask(()=>{ensureStrategyTradusComparative();ensureStrategyTradusOutcomeMemory();});
  window.addEventListener("load",()=>{ensureStrategyTradusComparative();ensureStrategyTradusOutcomeMemory();},{once:true,passive:true});
  window.addEventListener("pageshow",()=>{ensureStrategyTradusComparative();ensureStrategyTradusOutcomeMemory();},{passive:true});

  const API=Object.freeze({
    build:BUILD,
    active_build:runtimeBuild,
    ensure,
    ensureStrategyProofHotfix,
    ensurePostHandoff,
    ensureDexDiagnostics,
    ensureCexDivergenceGuard,
    ensureAtlasDecisionContext,
    ensureStrategyTradusComparative,
    ensureStrategyTradusOutcomeMemory,
    snapshot:()=>Object.freeze({state,reason,loaded_at:loadedAt,last_error:lastError,parser_boot_loaded:false,source:SRC,source_truth_host:"backend",active_build:runtimeBuild()}),
    stable_owner:true,
    source_truth_backend_placement_restored:true,
    sources_reparenting:false,
    strategy_paper_proof_hotfix:runtimeBuild()==="40.6.95",
    post_handoff_stabilization:atLeast("40.6.96"),
    dex_exclusion_diagnostics:atLeast("40.6.98"),
    dex_exclusion_diagnostics_canonical:atLeast("40.6.113"),
    cex_divergence_fail_closed:atLeast("40.6.101"),
    atlas_decision_context:atLeast("40.6.114"),
    strategy_tradus_comparative_intelligence:atLeast("40.6.115"),
    strategy_tradus_outcome_memory:atLeast("40.6.117"),
    operator_cockpit:false,
    new_timer:false,
    new_observer:false,
    new_storage_owner:false,
    new_network_owner:false
  });
  globalThis.ErithPrivateSourceDemand=API;
  globalThis.ErithPrivateSourceDemand40486=API;
})();
