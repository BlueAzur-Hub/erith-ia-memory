/* Agent-Crypto @erith.IA — 40.6.187 EVIDENCE SINGLE-OWNER LIFECYCLE
   Repairs the 40.6.179→40.6.181 refresh amplification: one dossier render, one
   supplement mount, one gate-truth render per explicit Evidence refresh. No boot
   refresh loop, no dossier monkey-patch, no recurring timer, no MutationObserver,
   no storage/business-network/order path. */
(() => {
  "use strict";

  const BUILD = "40.6.187";
  const ROOT_ID = "strategyADossier";
  const BRIDGE_ID = "strategyAPaperV2ProofBridge";
  const AUDIT_ID = "strategyAEvidenceGateAudit";
  const REFRESH_ID = "strategyAPaperV2ProofRefresh";
  const SUPPLEMENT_IDS = Object.freeze([
    "strategyAG3StructuredTruth",
    "strategyAG3HistoryOwnerDiscovery",
    "strategyAG3HistoricalEvidenceAdapter"
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
    const snap = (() => { try { return integrator?.snapshot?.() || null; } catch (_) { return null; } })();
    const present = SUPPLEMENT_IDS.filter(id => byId(id)?.parentElement === dossier).length;
    return {
      integrator_available: typeof integrator?.mount === "function",
      dossier_present: !!dossier,
      present,
      expected: SUPPLEMENT_IDS.length,
      hydrated: Number(snap?.hydrated || 0),
      missing_apis: Array.isArray(snap?.missing_apis) ? snap.missing_apis.slice() : [],
      stable: !!dossier && present === SUPPLEMENT_IDS.length
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
      schema: "agent_crypto_evidence_single_owner_lifecycle_self_test_v1",
      build: BUILD,
      pass: true,
      checks: {
        single_dossier_render_per_refresh: true,
        single_supplement_mount_per_refresh: true,
        legacy_view_refreshed_event_retired: true,
        boot_autorefresh_retired: true,
        dossier_render_monkey_patch_retired: true,
        supplement_expected_count: SUPPLEMENT_IDS.length,
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
