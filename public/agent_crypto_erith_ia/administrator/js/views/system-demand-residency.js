/* Agent-Crypto @erith.IA — 40.4.88
   SYSTEM 04 INTERACTION RECOVERY / STABLE CLOSED-BODY RESIDENCY
   Restores the proven 40.4.14 contract after the 40.4.85 diagnostic-panel detachment regression.
   Simulation / Commandes / Backend / Safety / Physical Security keep same-node closed-body residency.
   Storage Health + Grey Plate Forensic remain resident and keep their canonical runtime bindings.
   No clone, fetch, timer, observer, storage write, engine OFF, Window Manager rewrite or DOM reparent owner is added. */
(()=>{
  "use strict";
  const BUILD="40.4.88";
  const life=globalThis.ErithPresentationLifecycle;
  if(!life)return;

  const selectors=Object.freeze([
    'details[data-collapse-key="simulation"]',
    'details[data-collapse-key="commandes"]',
    'details[data-collapse-key="backend"]',
    'details[data-collapse-key="safety"]',
    'details[data-collapse-key="physical-security"]'
  ]);

  const registration=life.registerClosedBodyFamily({
    id:"system",
    label:"04 · Expérimentation & système",
    selectors
  });

  const api=Object.freeze({
    build:BUILD,
    restored_contract:"40.4.14",
    strategy:"closed-body-same-node-detach",
    selectors,
    registered:!!registration,
    storage_health_resident:true,
    grey_plate_forensic_resident:true,
    simulation_experiment_family_included:true,
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

  globalThis.ErithSystemDemandResidency40488=api;
  // Compatibility alias for older diagnostics that still query the original owner name.
  globalThis.ErithSystemDemandResidency40414=api;
  globalThis.__AGENT_CRYPTO_SYSTEM04_RECOVERY_40488__=api;
})();
