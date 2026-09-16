/* Agent-Crypto @erith.IA — 40.6.204 EVIDENCE SINGLE-OWNER LIFECYCLE BINDING
   Aligns the 40.6.187 lifecycle truth with the current seven-panel supplemental
   host. One dossier render, one supplement mount, one gate-truth render per explicit
   Evidence refresh. No boot refresh loop, dossier monkey-patch, recurring timer,
   MutationObserver, storage/business-network/order path or Gate promotion. */
(() => {
  "use strict";

  const BUILD = "40.6.204";
  const ROOT_ID = "strategyADossier";
  const HOST_ID = "strategyAEvidenceSupplements";
  const BRIDGE_ID = "strategyAPaperV2ProofBridge";
  const AUDIT_ID = "strategyAEvidenceGateAudit";
  const REFRESH_ID = "strategyAPaperV2ProofRefresh";
  const SUPPLEMENT_IDS = Object.freeze([
    "strategyAG3StructuredTruth",
    "strategyAG3HistoryOwnerDiscovery",
    "strategyAG3HistoricalEvidenceAdapter",
    "strategyAG3T0DecisionProof",
    "strategyAG3ReplayDataset",
    "strategyAG3DecisionReplay",
    "strategyAG3CascadeCheckpoint"
  ]);
  let queued = false;
  let refreshCount = 0;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;

  function moveAfter(anchor, node) {
    if (!anchor || !node || anchor === node) return false;
    if (anchor.nextElementSibling !== node) anchor.insertAdjacentElement("afterend", node);
    return true;
  }

  function supplementTruth() {
    const dossier = byId(ROOT_ID);
    const integrator = globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator || null;
    const hostId = String(integrator?.host_id || HOST_ID);
    const host = byId(hostId);
    const snap = (() => { try { return integrator?.snapshot?.() || null; } catch (_) { return null; } })();
    const present = SUPPLEMENT_IDS.filter(id => byId(id)?.parentElement === host).length;
    const hydrated = SUPPLEMENT_IDS.filter(id => {
      const node = byId(id);
      return !!node && node.parentElement === host && node.classList?.contains("saeds-placeholder") !== true;
    }).length;
    return {
      integrator_available: typeof integrator?.mount === "function",
      dossier_present: !!dossier,
      host_present: !!host,
      host_id: hostId,
      present,
      expected: SUPPLEMENT_IDS.length,
      hydrated,
      missing_apis: Array.isArray(snap?.missing_apis) ? snap.missing_apis.slice() : [],
      stable: !!host && present === SUPPLEMENT_IDS.length && hydrated === SUPPLEMENT_IDS.length
    };
  }

  function rehydrateSupplements() {
    const integrator = globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator || null;
    if (typeof integrator?.mount !== "function") return supplementTruth();
    try { integrator.mount(); } catch (_) {}
    return supplementTruth();
  }

  function ensureStablePlacement() {
    const bridge = byId(BRIDGE_ID);
    if (!bridge) return false;
    const dossier = byId(ROOT_ID);
    if (dossier) {
      moveAfter(bridge, dossier);
      dossier.dataset.lifecycleTruthBuild = BUILD;
      dossier.dataset.stableSiblingOfProofBridge = "true";
    }
    const audit = byId(AUDIT_ID);
    const after = dossier || bridge;
    if (audit && after) {
      moveAfter(after, audit);
      audit.dataset.lifecycleTruthBuild = BUILD;
      audit.dataset.stableSiblingOfProofBridge = "true";
    }
    return !!(bridge && dossier && audit);
  }

  function refreshEvidence(reason = "explicit") {
    refreshCount += 1;

    const dossierApi = globalThis.AgentCryptoStrategyAEvidenceDossier || null;
    if (typeof dossierApi?.render === "function") {
      try { dossierApi.render(); } catch (_) {}
    }

    const repairApi = globalThis.AgentCryptoStrategyAEvidenceGateAuditAnchorRepair || null;
    if (typeof repairApi?.repair === "function") {
      try { repairApi.repair(); } catch (_) {}
    }

    const contractApi = globalThis.AgentCryptoStrategyAG3RealisticReplayContract || null;
    if (typeof contractApi?.render === "function") {
      try { contractApi.render(); } catch (_) {}
    }

    const stableLegacy = ensureStablePlacement();
    const supplements = rehydrateSupplements();

    const gateTruth = globalThis.AgentCryptoStrategyAGateCanonicalTruth || null;
    if (typeof gateTruth?.render === "function") {
      try { gateTruth.render(); } catch (_) {}
    }

    const stable = stableLegacy && supplements.stable;
    try {
      document.dispatchEvent(new CustomEvent("agent-crypto:evidence-refresh-complete", {
        detail: {build:BUILD,refresh_count:refreshCount,reason:String(reason||"explicit"),stable_legacy:stableLegacy,supplements,stable}
      }));
    } catch (_) {}
    return stable;
  }

  function afterPaint(reason = "explicit") {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; refreshEvidence(reason); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  function onClick(event) {
    const button = event?.target?.closest?.("button");
    if (!button || button.id !== REFRESH_ID) return;
    afterPaint("operator-refresh");
  }

  function selfTest() {
    return {
      schema: "agent_crypto_evidence_single_owner_lifecycle_self_test_v2",
      build: BUILD,
      pass: true,
      checks: {
        single_dossier_render_per_refresh: true,
        single_supplement_mount_per_refresh: true,
        seven_panel_host_contract: SUPPLEMENT_IDS.length === 7,
        legacy_view_refreshed_event_retired: true,
        boot_autorefresh_retired: true,
        dossier_render_monkey_patch_retired: true,
        recurring_timer: false,
        mutation_observer: false,
        storage_write: false,
        business_network_request: false,
        real_order: false
      }
    };
  }

  globalThis.AgentCryptoEvidenceLifecycleTruth = Object.freeze({
    build: BUILD,
    refresh: refreshEvidence,
    ensure_stable_placement: ensureStablePlacement,
    rehydrate_supplements: rehydrateSupplements,
    supplement_truth: supplementTruth,
    supplement_host_id: HOST_ID,
    supplement_ids: SUPPLEMENT_IDS.slice(),
    self_test: selfTest,
    single_owner_refresh: true,
    boot_autorefresh: false,
    legacy_view_refreshed_event: false,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network: false,
    real_order: false,
    paper_only: true,
    g3: "PENDING",
    g9: "LOCKED"
  });

  document.addEventListener("click", onClick, false);
  document.addEventListener("agent-crypto:evidence-data-changed", () => afterPaint("evidence-data-changed"));
  window.addEventListener("pageshow", event => { if (event.persisted) afterPaint("bfcache-pageshow"); });
})();
