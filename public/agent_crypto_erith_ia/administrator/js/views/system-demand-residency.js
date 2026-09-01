/* Agent-Crypto @erith.IA — 40.4.89
   SYSTEM 04 GENERIC RESIDENCY OWNER CONSOLIDATION
   Simulation keeps same-node closed-body residency.
   Commandes / Backend / Safety / Physical Security remain owned by the canonical true-lazy System presentation.
   Storage Health + Grey Plate Forensic remain resident and keep their canonical runtime bindings.
   No clone, fetch, timer, observer, storage write, engine OFF, Window Manager rewrite or DOM reparent owner is added. */
(()=>{
  "use strict";
  const BUILD="40.4.89";
  const life=globalThis.ErithPresentationLifecycle;
  if(!life)return;

  const selectors=Object.freeze([
    'details[data-collapse-key="simulation"]'
  ]);

  const registration=life.registerClosedBodyFamily({
    id:"system",
    label:"04 · Expérimentation & système",
    selectors
  });

  const api=Object.freeze({
    build:BUILD,
    restored_contract:"40.4.14-simulation-only",
    strategy:"closed-body-same-node-detach",
    selectors,
    registered:!!registration,
    storage_health_resident:true,
    grey_plate_forensic_resident:true,
    simulation_experiment_family_included:true,
    true_lazy_system_peripherals_excluded:true,
    diagnostic_placeholder_owner_removed:true,
    exact_panel_replace_with_removed:true,
    engine_state_changed:false,
    window_manager_changed:false,
    clone_used:false,
    fetch_added:false,
    timer_added:false,
    observer_added:false,
    storage_write_added:false,
    snapshot:()=>life.residencySnapshot()
  });

  globalThis.ErithSystemDemandResidency=api;
  globalThis.ErithSystemDemandResidency40489=api;
  globalThis.ErithSystemDemandResidency40488=api;
  globalThis.ErithSystemDemandResidency40414=api;
  globalThis.__AGENT_CRYPTO_SYSTEM04_RECOVERY_40488__=api;
  globalThis.__AGENT_CRYPTO_SYSTEM04_OWNER_CONSOLIDATION_40489__=api;

  /* 40.4.153 R2 — DETACHED SIMULATION MANIFEST TARGET RECOVERY
     Root cause proved by the current architecture:
       1. V2 visibility owns Simulation through manifest id "simulation" and
          target "closest-collapse".
       2. closed-body residency legitimately detaches the Simulation body while
          its <details> shell stays mounted.
       3. once detached, #simulation is no longer reachable through
          document.getElementById(), so a later Intermediate/Administrator mode
          replay cannot resolve the shell and can leave an earlier hidden state
          behind.
       4. Commandes / Backend / Safety / Physical Security do not suffer the same
          failure because their ids are permanent anchors in their <summary>.

     This bounded compatibility shim changes only target resolution for the one
     detached Simulation manifest entry. It delegates every normal lookup to the
     canonical atlasV2ManifestTarget() owner and falls back to the already-mounted
     details[data-collapse-key="simulation"] shell only when that canonical lookup
     returns null. It does not force the disclosure open, change residency, add a
     timer/observer/fetch/storage write, or touch Kraken, Atlas, Market Core or the
     Window Manager. */
  const TARGET_PATCH="40.4.153-R2";
  const originalManifestTarget=typeof globalThis.atlasV2ManifestTarget==="function"
    ? globalThis.atlasV2ManifestTarget
    : null;

  const targetState={
    installed:false,
    fallback_hits:0,
    last_mode:"",
    last_result:"idle"
  };

  function simulationShell404153R2(){
    return document.querySelector('details.atlas-collapse[data-collapse-key="simulation"]');
  }

  function currentMode404153R2(){
    try{
      if(typeof globalThis.atlasV2Mode==="function")return String(globalThis.atlasV2Mode()||"");
    }catch(_){}
    return String(document.body?.dataset?.atlasView||document.documentElement?.dataset?.atlasView||"");
  }

  function installDetachedSimulationTarget404153R2(){
    if(typeof originalManifestTarget!=="function"){
      targetState.last_result="canonical-owner-missing";
      document.documentElement.dataset.systemSimulationManifestTarget404153R2="owner-missing";
      return false;
    }
    if(globalThis.atlasV2ManifestTarget?.__erithDetachedSimulationTarget404153R2===true){
      targetState.installed=true;
      targetState.last_result="already-installed";
      return true;
    }

    const wrapped=function atlasV2ManifestTarget404153R2(entry){
      const resolved=originalManifestTarget(entry);
      if(resolved)return resolved;
      if(String(entry?.id||"")!=="simulation"||String(entry?.target||"")!=="closest-collapse")return resolved;
      const shell=simulationShell404153R2();
      if(shell){
        targetState.fallback_hits+=1;
        targetState.last_result="simulation-shell-fallback";
        document.documentElement.dataset.systemSimulationManifestTarget404153R2="fallback";
      }
      return shell||resolved;
    };
    try{Object.defineProperty(wrapped,"__erithDetachedSimulationTarget404153R2",{value:true});}catch(_){}
    globalThis.atlasV2ManifestTarget=wrapped;
    targetState.installed=globalThis.atlasV2ManifestTarget===wrapped;
    targetState.last_result=targetState.installed?"installed":"install-failed";
    document.documentElement.dataset.systemSimulationManifestTarget404153R2=targetState.last_result;
    return targetState.installed;
  }

  function replayCurrentVisibility404153R2(reason="install"){
    targetState.last_mode=currentMode404153R2();
    if(!targetState.installed){
      targetState.last_result="not-installed";
      return false;
    }
    if(typeof globalThis.atlasV2ApplySectionVisibility!=="function"){
      targetState.last_result="visibility-owner-missing";
      return false;
    }
    try{
      globalThis.atlasV2ApplySectionVisibility(targetState.last_mode||"essential");
      targetState.last_result=`replayed-${String(reason||"install")}`;
      document.documentElement.dataset.systemSimulationVisibilityReplay404153R2=targetState.last_mode||"unknown";
      return true;
    }catch(_){
      targetState.last_result="visibility-replay-failed";
      return false;
    }
  }

  const installed404153R2=installDetachedSimulationTarget404153R2();
  if(installed404153R2)queueMicrotask(()=>replayCurrentVisibility404153R2("script-load"));

  globalThis.ErithSystemSimulationTarget404153R2=Object.freeze({
    build:TARGET_PATCH,
    owner:"system-demand-residency.js compatibility shim",
    canonical_target_owner:"atlasV2ManifestTarget",
    manifest_id:"simulation",
    manifest_target:"closest-collapse",
    fallback_selector:'details.atlas-collapse[data-collapse-key="simulation"]',
    detached_body_supported:true,
    force_open:false,
    residency_changed:false,
    window_manager_changed:false,
    timer_added:false,
    observer_added:false,
    fetch_added:false,
    storage_write_added:false,
    atlas_pipeline_changed:false,
    kraken_changed:false,
    market_core_changed:false,
    replay:reason=>replayCurrentVisibility404153R2(reason||"manual-diagnostic"),
    snapshot:()=>Object.freeze({...targetState})
  });
})();
