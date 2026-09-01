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

  /* 40.4.153 R1 — SYSTEM / SIMULATION ADMIN ROLE-RESTORE VISIBILITY GUARD
     Operator evidence: on a cold application launch, Simulation can be absent while
     the sibling System disclosures are already visible; an ordinary reload restores it.
     The System presentation owner itself is byte-identical to the validated 40.4.146
     checkpoint, so this guard repairs only an asymmetric Window Manager presentation
     state after Administrator role restoration. It never forces Simulation open and
     never recreates a missing DOM shell. No timer, observer, fetch, storage write,
     engine state, Atlas pipeline or business logic owner is added. */
  const VISIBILITY_PATCH="40.4.153-R1";
  const SYSTEM_FAMILY_ID="experimentation-systeme";
  const SIMULATION_SELECTOR='details[data-collapse-key="simulation"]';
  const PEER_SELECTORS=Object.freeze([
    'details[data-collapse-key="commandes"]',
    'details[data-collapse-key="backend"]',
    'details[data-collapse-key="safety"]',
    'details[data-collapse-key="physical-security"]'
  ]);
  const visibilityState={
    checked:0,
    repaired:0,
    last_reason:"",
    last_result:"idle",
    simulation_present:false,
    simulation_suppressed:false,
    visible_peer:false
  };

  function administratorRole404153R1(){
    const role=String(document.body?.dataset?.atlasRole||document.documentElement?.dataset?.atlasRole||"").trim();
    return role==="administrator";
  }

  function managerSuppressed404153R1(node){
    if(!(node instanceof HTMLElement))return false;
    return node.classList.contains("admin-native-window-suppressed")
      || (node.style.getPropertyValue("display")==="none" && node.style.getPropertyPriority("display")==="important")
      || node.hidden===true
      || node.getAttribute("aria-hidden")==="true";
  }

  function reconcileSimulationVisibility404153R1(reason="role-restore"){
    visibilityState.checked+=1;
    visibilityState.last_reason=String(reason||"role-restore");

    const simulation=document.querySelector(SIMULATION_SELECTOR);
    visibilityState.simulation_present=simulation instanceof HTMLDetailsElement;
    if(!(simulation instanceof HTMLDetailsElement)){
      visibilityState.last_result="simulation-shell-missing";
      document.documentElement.dataset.systemSimulationVisibility404153R1="missing";
      return false;
    }
    if(!administratorRole404153R1()){
      visibilityState.last_result="non-administrator";
      document.documentElement.dataset.systemSimulationVisibility404153R1="role-skip";
      return false;
    }

    const peers=PEER_SELECTORS.map(selector=>document.querySelector(selector)).filter(node=>node instanceof HTMLDetailsElement);
    const visiblePeer=peers.some(node=>!managerSuppressed404153R1(node));
    const suppressed=managerSuppressed404153R1(simulation);
    visibilityState.visible_peer=visiblePeer;
    visibilityState.simulation_suppressed=suppressed;

    // A compact/hidden whole System family is a legitimate operator state.
    // Repair only the inconsistent case proved by the screenshots: sibling
    // System disclosures visible while Simulation alone remains suppressed.
    if(!visiblePeer||!suppressed){
      visibilityState.last_result=!visiblePeer?"family-compact-or-hidden":"already-visible";
      document.documentElement.dataset.systemSimulationVisibility404153R1=visibilityState.last_result;
      return false;
    }

    const manager=globalThis.ErithAdministratorWindows;
    try{manager?.minimize?.(SYSTEM_FAMILY_ID,false);}catch(_){}

    simulation.classList.remove("admin-native-window-suppressed");
    if(simulation.style.getPropertyValue("display")==="none" && simulation.style.getPropertyPriority("display")==="important"){
      simulation.style.removeProperty("display");
    }
    if(simulation.hidden)simulation.hidden=false;
    if(simulation.getAttribute("aria-hidden")==="true")simulation.setAttribute("aria-hidden","false");

    visibilityState.repaired+=1;
    visibilityState.simulation_suppressed=managerSuppressed404153R1(simulation);
    visibilityState.last_result=visibilityState.simulation_suppressed?"repair-incomplete":"restored";
    document.documentElement.dataset.systemSimulationVisibility404153R1=visibilityState.last_result;
    document.documentElement.dataset.systemSimulationVisibilityReason404153R1=visibilityState.last_reason;
    return !visibilityState.simulation_suppressed;
  }

  const scheduleReconcile404153R1=reason=>queueMicrotask(()=>reconcileSimulationVisibility404153R1(reason));
  document.addEventListener("erith:admin-window-persisted-presentation-restored",()=>scheduleReconcile404153R1("persisted-presentation-restored"));
  window.addEventListener("atlas:v2mode",event=>{
    if(event?.detail?.role==="administrator"||administratorRole404153R1())scheduleReconcile404153R1("atlas-v2mode-administrator");
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>scheduleReconcile404153R1("dom-ready"),{once:true});
  else scheduleReconcile404153R1("script-load");

  globalThis.ErithSystemSimulationVisibility404153R1=Object.freeze({
    build:VISIBILITY_PATCH,
    owner:"system-demand-residency.js",
    family:SYSTEM_FAMILY_ID,
    simulation_selector:SIMULATION_SELECTOR,
    asymmetric_repair_only:true,
    force_open:false,
    recreate_missing_shell:false,
    window_manager_owner_changed:false,
    timer_added:false,
    observer_added:false,
    fetch_added:false,
    storage_write_added:false,
    atlas_pipeline_changed:false,
    business_logic_changed:false,
    reconcile:reconcileSimulationVisibility404153R1,
    snapshot:()=>Object.freeze({...visibilityState})
  });
})();
