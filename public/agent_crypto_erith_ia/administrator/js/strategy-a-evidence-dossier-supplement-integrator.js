/* Agent-Crypto @erith.IA — 40.6.195 STRATEGY A EVIDENCE SINGLE-OWNER INTEGRATION
   Keeps the structured G3 evidence panels inside the existing Strategy A
   Evidence Dossier without render monkey-patches or autonomous refresh listeners.
   Hydration happens only when the canonical entry or Evidence lifecycle calls
   mount(). No recurring timer, observer, storage/network/order path or gate promotion. */
(() => {
  "use strict";

  const BUILD = "40.6.195";
  const DOSSIER_ID = "strategyADossier";
  const CONTRACT_ID = "strategyAG3RealisticReplayContract";
  const STATUS_ID = "strategyAEvidenceDossierSupplements187Status";
  const PANEL_SPECS = Object.freeze([
    Object.freeze({id:"strategyAG3StructuredTruth",api:"AgentCryptoStrategyAG3StructuredDataTruth",title:"G3 · STRUCTURED DATA TRUTH"}),
    Object.freeze({id:"strategyAG3HistoryOwnerDiscovery",api:"AgentCryptoStrategyAG3HistoryOwnerDiscovery",title:"G3 · HISTORY OWNER DISCOVERY"}),
    Object.freeze({id:"strategyAG3HistoricalEvidenceAdapter",api:"AgentCryptoStrategyAG3HistoricalEvidenceAdapter",title:"G3 · HISTORICAL EVIDENCE ADAPTER"}),
    Object.freeze({id:"strategyAG3T0DecisionProof",api:"AgentCryptoStrategyAG3T0DecisionProof",title:"G3 · T0 DECISION PROOF"}),
    Object.freeze({id:"strategyAG3ReplayDataset",api:"AgentCryptoStrategyAG3ReplayDataset",title:"G3 · IMMUTABLE REPLAY DATASET"})
  ]);

  let mountCount = 0;
  let mounting = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${STATUS_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${STATUS_ID}Style`;
    style.textContent = `
      #${STATUS_ID}{margin-top:9px;padding:7px 8px;border:1px solid rgba(111,255,215,.20);border-radius:8px;background:rgba(5,24,27,.28);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      #${STATUS_ID} .saeds-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#83ffda;text-transform:uppercase}
      #${STATUS_ID} .saeds-sub{margin-top:3px;font-size:8px;color:#8fb4aa}
      #${STATUS_ID} .saeds-state{font-size:8px;font-weight:900;color:#eafff8}
      #${DOSSIER_ID} .saeds-placeholder{margin-top:9px;padding:8px;border:1px dashed rgba(111,255,215,.20);border-radius:8px;background:rgba(4,20,24,.22)}
      #${DOSSIER_ID} .saeds-placeholder-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#83ffda;text-transform:uppercase}
      #${DOSSIER_ID} .saeds-placeholder-note{margin-top:4px;font-size:8px;color:#91b7ad}
    `;
    document.head.appendChild(style);
  }

  function ensureDossier() {
    let dossier = byId(DOSSIER_ID);
    if (dossier) return dossier;
    const api = globalThis.AgentCryptoStrategyAEvidenceDossier || null;
    if (typeof api?.render === "function") {
      try { api.render(); } catch (_) {}
    }
    return byId(DOSSIER_ID);
  }

  function ensureContract() {
    let contract = byId(CONTRACT_ID);
    if (contract) return contract;
    const api = globalThis.AgentCryptoStrategyAG3RealisticReplayContract || null;
    if (typeof api?.render === "function") {
      try { api.render(); } catch (_) {}
    }
    return byId(CONTRACT_ID);
  }

  function ensureStatus(dossier) {
    let status = byId(STATUS_ID);
    if (!status) {
      status = document.createElement("div");
      status.id = STATUS_ID;
      status.dataset.build = BUILD;
      status.innerHTML = `<div><div class="saeds-title">G3 · PREUVES STRUCTURÉES · ${BUILD}</div><div class="saeds-sub">Single-owner · montage explicite · aucune promotion de gate.</div></div><div class="saeds-state" data-saeds-state>0 / ${PANEL_SPECS.length} PANNEAUX</div>`;
    } else {
      status.dataset.build = BUILD;
      const title = status.querySelector(".saeds-title");
      if (title) title.textContent = `G3 · PREUVES STRUCTURÉES · ${BUILD}`;
    }
    if (status.parentElement !== dossier) dossier.appendChild(status);
    return status;
  }

  function ensurePlaceholder(dossier, spec) {
    let root = byId(spec.id);
    if (!root) {
      root = document.createElement("section");
      root.id = spec.id;
      root.className = "saeds-placeholder";
      root.dataset.placeholderBuild = BUILD;
      root.innerHTML = `<div class="saeds-placeholder-title">${spec.title}</div><div class="saeds-placeholder-note">MODULE EN ATTENTE · aucune donnée inventée.</div>`;
    }
    if (root.parentElement !== dossier) dossier.appendChild(root);
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
          root.dataset.integratedBy = BUILD;
        }
      } catch (_) {}
    }
  }

  function orderInsideDossier(dossier, status, roots) {
    const contract = byId(CONTRACT_ID);
    const legacyG3 = dossier.querySelector(".sad-g3");
    let anchor = contract && contract.parentElement === dossier ? contract : legacyG3;
    if (!anchor) {
      const foot = dossier.querySelector(".sad-foot");
      if (foot) dossier.insertBefore(status, foot);
      else dossier.appendChild(status);
    } else if (anchor.nextElementSibling !== status) {
      anchor.insertAdjacentElement("afterend", status);
    }

    anchor = status;
    for (const root of roots) {
      if (root.parentElement !== dossier || anchor.nextElementSibling !== root) anchor.insertAdjacentElement("afterend", root);
      anchor = root;
    }

    const foot = dossier.querySelector(".sad-foot");
    if (foot && anchor.nextElementSibling !== foot) anchor.insertAdjacentElement("afterend", foot);
  }

  function snapshot() {
    const dossier = byId(DOSSIER_ID);
    return {
      build: BUILD,
      dossier_present: !!dossier,
      mount_count: mountCount,
      mounting,
      present: PANEL_SPECS.filter(spec => byId(spec.id)?.parentElement === dossier).length,
      hydrated: PANEL_SPECS.filter(spec => {
        const node = byId(spec.id);
        return !!node && node.parentElement === dossier && node.classList?.contains("saeds-placeholder") !== true;
      }).length,
      missing_apis: PANEL_SPECS.filter(spec => typeof globalThis[spec.api]?.render !== "function").map(spec => spec.api),
      dossier_hook_installed: false,
      autonomous_refresh_listeners: false,
      single_owner_mount: true,
      g3: "PENDING",
      g9: "LOCKED",
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      real_order: false,
      paper_only: true
    };
  }

  function mount() {
    if (mounting) return {...snapshot(), mounted:false, reason:"MOUNT_ALREADY_ACTIVE"};
    mounting = true;
    mountCount += 1;
    try {
      if (typeof document === "undefined") return {mounted:false,reason:"NO_DOCUMENT",mount_count:mountCount};
      ensureStyle();
      const dossier = ensureDossier();
      if (!dossier) return {mounted:false,reason:"DOSSIER_UNAVAILABLE",mount_count:mountCount};

      ensureContract();
      const status = ensureStatus(dossier);
      let roots = PANEL_SPECS.map(spec => ensurePlaceholder(dossier, spec));
      orderInsideDossier(dossier, status, roots);
      renderOwners();
      roots = PANEL_SPECS.map(spec => byId(spec.id)).filter(Boolean);
      orderInsideDossier(dossier, status, roots);

      const state = snapshot();
      const stateNode = status.querySelector("[data-saeds-state]");
      if (stateNode) stateNode.textContent = `${state.present} / ${PANEL_SPECS.length} PANNEAUX · ${state.hydrated} HYDRATÉ(S)` + (state.missing_apis.length ? ` · API MANQUANTE: ${state.missing_apis.length}` : "");
      dossier.dataset.supplementIntegratorBuild = BUILD;
      dossier.dataset.supplementPanelsPresent = String(state.present);
      dossier.dataset.supplementPanelsHydrated = String(state.hydrated);
      dossier.dataset.supplementMissingApis = String(state.missing_apis.length);
      dossier.dataset.supplementNativeOwner = "false";
      dossier.dataset.supplementSingleOwner = "true";
      return {...state,mounted:true};
    } finally {
      mounting = false;
    }
  }

  globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator = Object.freeze({
    build: BUILD,
    owner: "strategy-a-evidence-dossier-supplement-integrator",
    dossier_id: DOSSIER_ID,
    status_id: STATUS_ID,
    panels: PANEL_SPECS.map(spec => spec.id),
    mount,
    snapshot,
    install_dossier_owner_hook: () => false,
    dossier_hook_installed: false,
    autonomous_refresh_listeners: false,
    single_owner_mount: true,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });
})();
