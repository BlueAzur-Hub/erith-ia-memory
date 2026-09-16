/* Agent-Crypto @erith.IA — 40.6.207 G3 EIGHT-PANEL OWNER BINDING
   Terrain proof from 40.6.206 showed that the prospective T0 panel was loaded but
   not owned by the same stable Evidence lifecycle as the seven validated G3 panels.
   This release promotes it into the canonical supplemental host contract as panel 8.
   No recurring timer, MutationObserver, business network/order path or Gate promotion. */
(() => {
  "use strict";

  const BUILD = "40.6.207";
  const DOSSIER_ID = "strategyADossier";
  const AUDIT_ID = "strategyAEvidenceGateAudit";
  const BRIDGE_ID = "strategyAPaperV2ProofBridge";
  const HOST_ID = "strategyAEvidenceSupplements";
  const STATUS_ID = "strategyAEvidenceSupplementsStatus";

  const PANEL_SPECS = Object.freeze([
    Object.freeze({id:"strategyAG3StructuredTruth",api:"AgentCryptoStrategyAG3StructuredDataTruth",title:"G3 · STRUCTURED DATA TRUTH"}),
    Object.freeze({id:"strategyAG3HistoryOwnerDiscovery",api:"AgentCryptoStrategyAG3HistoryOwnerDiscovery",title:"G3 · HISTORY OWNER DISCOVERY"}),
    Object.freeze({id:"strategyAG3HistoricalEvidenceAdapter",api:"AgentCryptoStrategyAG3HistoricalEvidenceAdapter",title:"G3 · HISTORICAL EVIDENCE ADAPTER"}),
    Object.freeze({id:"strategyAG3T0DecisionProof",api:"AgentCryptoStrategyAG3T0DecisionProof",title:"G3 · T0 DECISION PROOF"}),
    Object.freeze({id:"strategyAG3ReplayDataset",api:"AgentCryptoStrategyAG3ReplayDataset",title:"G3 · IMMUTABLE REPLAY DATASET"}),
    Object.freeze({id:"strategyAG3DecisionReplay",api:"AgentCryptoStrategyAG3DecisionReplay",title:"G3 · DECISION REPLAY VERIFIER"}),
    Object.freeze({id:"strategyAG3CascadeCheckpoint",api:"AgentCryptoStrategyAG3CascadeCheckpoint",title:"G3 · CASCADE CHECKPOINT TRUTH"}),
    Object.freeze({id:"strategyAG3ProspectiveT0Capture",api:"AgentCryptoStrategyAG3ProspectiveT0Capture",title:"G3 · CAPTURE T0 PROSPECTIVE"})
  ]);

  let mountCount = 0;
  let mounting = false;
  let queued = false;
  let bootstrapBound = false;
  let bootstrapSettled = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;

  function anchor() {
    return byId(AUDIT_ID) || byId(DOSSIER_ID) || byId(BRIDGE_ID) || null;
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${HOST_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${HOST_ID}Style`;
    style.textContent = `
      #${HOST_ID}{margin-top:10px;padding:10px;border:1px solid rgba(111,255,215,.22);border-radius:10px;background:rgba(5,23,25,.42)}
      #${HOST_ID}>.saesh-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:4px}
      #${HOST_ID} .saesh-title{font-size:9px;font-weight:950;letter-spacing:.09em;color:#83ffda;text-transform:uppercase}
      #${HOST_ID} .saesh-sub{font-size:8px;color:#86aaa4;margin-top:3px}
      #${HOST_ID} .saesh-state{font-size:8px;font-weight:900;color:#dffdf5;border:1px solid rgba(111,255,215,.18);border-radius:999px;padding:4px 7px;background:rgba(111,255,215,.06)}
      #${HOST_ID}>section{margin-top:9px}
      #${HOST_ID} .saeds-placeholder{padding:8px;border:1px dashed rgba(111,255,215,.20);border-radius:8px;background:rgba(4,20,24,.22)}
      #${HOST_ID} .saeds-placeholder-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#83ffda;text-transform:uppercase}
      #${HOST_ID} .saeds-placeholder-note{margin-top:4px;font-size:8px;color:#91b7ad}
    `;
    document.head.appendChild(style);
  }

  function ensureHost() {
    if (typeof document === "undefined") return null;
    const a = anchor();
    if (!a) return null;
    ensureStyle();

    let host = byId(HOST_ID);
    if (!host) {
      host = document.createElement("section");
      host.id = HOST_ID;
      host.innerHTML = `<div class="saesh-head"><div><div class="saesh-title">STRATEGY A · G3 EVIDENCE SUPPLEMENTS · EIGHT-PANEL BOUND · ${BUILD}</div><div class="saesh-sub">Même cycle Evidence pour 8 panneaux · aucun PASS créé par ce host.</div></div><div id="${STATUS_ID}" class="saesh-state" data-saesh-state>0 / ${PANEL_SPECS.length} PANNEAUX</div></div>`;
    }
    host.dataset.build = BUILD;
    host.dataset.stableSibling = "true";
    host.dataset.lifecycleBound = "true";
    host.dataset.eightPanelContract = "true";
    const title = host.querySelector(".saesh-title");
    if (title) title.textContent = `STRATEGY A · G3 EVIDENCE SUPPLEMENTS · EIGHT-PANEL BOUND · ${BUILD}`;
    if (a.nextElementSibling !== host) a.insertAdjacentElement("afterend", host);
    return host;
  }

  function ensurePlaceholder(host, spec) {
    let root = byId(spec.id);
    if (!root) {
      root = document.createElement("section");
      root.id = spec.id;
      root.className = "saeds-placeholder";
      root.dataset.placeholderBuild = BUILD;
      root.innerHTML = `<div class="saeds-placeholder-title">${spec.title}</div><div class="saeds-placeholder-note">MODULE EN ATTENTE · aucune donnée inventée.</div>`;
    }
    if (root.parentElement !== host) host.appendChild(root);
    return root;
  }

  function renderOwners() {
    for (const spec of PANEL_SPECS) {
      const api = globalThis[spec.api];
      if (typeof api?.render !== "function") continue;
      try {
        api.render();
        const root = byId(spec.id);
        if (root) {
          root.classList?.remove("saeds-placeholder");
          root.dataset.hydratedBy = spec.api;
        }
      } catch (_) {}
    }
  }

  function movePanels(host) {
    let present = 0;
    let hydrated = 0;
    for (const spec of PANEL_SPECS) {
      const root = byId(spec.id);
      if (!root) continue;
      if (root.parentElement !== host) host.appendChild(root);
      root.dataset.lifecycleHostBuild = BUILD;
      root.dataset.outsideLegacyDossier = "true";
      root.dataset.integratedBy = BUILD;
      if (typeof globalThis[spec.api]?.render === "function" && root.classList?.contains("saeds-placeholder") !== true) hydrated += 1;
      present += 1;
    }
    return {present, hydrated};
  }

  function snapshot() {
    const host = byId(HOST_ID);
    const dossier = byId(DOSSIER_ID);
    const panels = PANEL_SPECS.map(spec => {
      const node = byId(spec.id);
      return {
        id: spec.id,
        api: spec.api,
        present: !!node,
        parent: node?.parentElement?.id || null,
        stable: !!host && node?.parentElement === host,
        hydrated: !!node && node.classList?.contains("saeds-placeholder") !== true
      };
    });
    const missingApis = PANEL_SPECS.filter(spec => typeof globalThis[spec.api]?.render !== "function").map(spec => spec.api);
    return {
      schema: "agent_crypto_strategy_a_g3_evidence_eight_panel_binding_v1",
      build: BUILD,
      dossier_present: !!dossier,
      host_present: !!host,
      lifecycle_bound: host?.dataset?.lifecycleBound === "true",
      eight_panel_contract: host?.dataset?.eightPanelContract === "true",
      mount_count: mountCount,
      mounting,
      bootstrap_bound: bootstrapBound,
      bootstrap_settled: bootstrapSettled,
      present: panels.filter(p => p.present).length,
      hydrated: panels.filter(p => p.hydrated).length,
      stable: panels.filter(p => p.stable).length,
      expected: PANEL_SPECS.length,
      missing_apis: missingApis,
      panels,
      legacy_dossier_owner_unchanged: true,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      real_order: false,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED"
    };
  }

  function clearBootstrapListeners() {
    if (!bootstrapBound || typeof document === "undefined") return;
    document.removeEventListener("click", bootstrapAttempt, true);
    document.removeEventListener("focusin", bootstrapAttempt, true);
    window.removeEventListener("pageshow", bootstrapAttempt);
    bootstrapBound = false;
  }

  function mount() {
    if (mounting) return {...snapshot(),mounted:false,reason:"MOUNT_ALREADY_ACTIVE"};
    mounting = true;
    mountCount += 1;
    try {
      if (typeof document === "undefined") return {mounted:false,reason:"NO_DOCUMENT",mount_count:mountCount};
      const host = ensureHost();
      if (!host) return {mounted:false,reason:"EVIDENCE_ANCHOR_UNAVAILABLE",mount_count:mountCount};

      PANEL_SPECS.forEach(spec => ensurePlaceholder(host,spec));
      renderOwners();
      const moved = movePanels(host);
      const state = snapshot();
      const status = host.querySelector("[data-saesh-state]");
      if (status) status.textContent = `${moved.present} / ${PANEL_SPECS.length} PANNEAUX · ${moved.hydrated} HYDRATÉ(S)` + (state.missing_apis.length ? ` · API MANQUANTE: ${state.missing_apis.length}` : "");
      host.dataset.panelsPresent = String(moved.present);
      host.dataset.panelsHydrated = String(moved.hydrated);
      host.dataset.panelsExpected = String(PANEL_SPECS.length);
      host.dataset.complete = moved.present === PANEL_SPECS.length && moved.hydrated === PANEL_SPECS.length ? "true" : "false";
      if (host.dataset.complete === "true") {
        bootstrapSettled = true;
        clearBootstrapListeners();
      }
      return {...state,mounted:true,complete:host.dataset.complete === "true"};
    } finally {
      mounting = false;
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; mount(); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  function bootstrapAttempt() {
    if (bootstrapSettled) return;
    const result = mount();
    if (result?.mounted !== true) schedule();
  }

  function bindBootstrapLifecycle() {
    if (bootstrapBound || bootstrapSettled || typeof document === "undefined") return;
    bootstrapBound = true;
    document.addEventListener("click", bootstrapAttempt, true);
    document.addEventListener("focusin", bootstrapAttempt, true);
    window.addEventListener("pageshow", bootstrapAttempt);
  }

  globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator = Object.freeze({
    build: BUILD,
    owner: "strategy-a-g3-evidence-eight-panel-binding",
    dossier_id: DOSSIER_ID,
    host_id: HOST_ID,
    status_id: STATUS_ID,
    panels: PANEL_SPECS.map(spec => spec.id),
    mount,
    snapshot,
    schedule,
    lifecycle_bound: true,
    eight_panel_contract: true,
    bounded_bootstrap_retry: true,
    dossier_hook_installed: false,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  if (typeof document !== "undefined") {
    bindBootstrapLifecycle();
    document.addEventListener("agent-crypto:evidence-data-changed", schedule);
    document.addEventListener("erith:system-hydrated", schedule,{passive:true});
    document.addEventListener("agent-crypto:runtime-modules-ready", schedule,{once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule,{once:true});
    else schedule();
    window.addEventListener("load", schedule,{once:true});
  }
})();
