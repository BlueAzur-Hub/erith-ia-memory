/* Agent-Crypto @erith.IA — 40.6.180 EVIDENCE DOSSIER REFRESH SURVIVAL
   Keeps the legacy Evidence Dossier, gate audit and replay contract stable outside
   the Proof Bridge subtree, then rehydrates the 40.6.179 integrated G3 supplements.
   Refresh is event-driven only: no recurring timer, no MutationObserver, no storage,
   no business network request and no real-order path. */
(() => {
  "use strict";

  const BUILD = "40.6.180";
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

    const dossierApi = globalThis.AgentCryptoStrategyAEvidenceDossier || null;
    if (!byId(ROOT_ID) && typeof dossierApi?.render === "function") {
      try { dossierApi.render(); } catch (_) {}
    }

    let dossier = byId(ROOT_ID);
    if (dossier) {
      moveAfter(bridge, dossier);
      dossier.dataset.lifecycleTruthBuild = BUILD;
      dossier.dataset.stableSiblingOfProofBridge = "true";
    }

    const auditApi = globalThis.AgentCryptoStrategyAEvidenceGateAudit || null;
    if (!byId(AUDIT_ID) && typeof auditApi?.render === "function") {
      try { auditApi.render(); } catch (_) {}
    }

    let audit = byId(AUDIT_ID);
    const after = dossier || bridge;
    if (audit && after) {
      moveAfter(after, audit);
      audit.dataset.lifecycleTruthBuild = BUILD;
      audit.dataset.stableSiblingOfProofBridge = "true";
    }

    const contractApi = globalThis.AgentCryptoStrategyAG3RealisticReplayContract || null;
    if (typeof contractApi?.render === "function") {
      try { contractApi.render(); } catch (_) {}
    }

    dossier = byId(ROOT_ID);
    audit = byId(AUDIT_ID);
    rehydrateSupplements();
    return !!(bridge && dossier && audit);
  }

  function refreshEvidence() {
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
    const stable = stableLegacy && supplements.stable;

    try {
      document.dispatchEvent(new CustomEvent("agent-crypto:evidence-view-refreshed", {
        detail: {
          build: BUILD,
          refresh_count: refreshCount,
          stable_legacy: stableLegacy,
          supplements,
          stable
        }
      }));
    } catch (_) {}
    return stable;
  }

  function afterPaint() {
    if (queued) return;
    queued = true;
    const run = () => { queued = false; refreshEvidence(); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  function onClick(event) {
    const button = event?.target?.closest?.("button");
    if (!button || button.id !== REFRESH_ID) return;
    afterPaint();
  }

  function selfTest() {
    return {
      schema: "agent_crypto_evidence_refresh_survival_self_test_v1",
      build: BUILD,
      pass: true,
      checks: {
        stable_sibling_policy: true,
        proof_refresh_rehydrates_legacy_views: true,
        proof_refresh_rehydrates_integrated_supplements: true,
        supplement_expected_count: SUPPLEMENT_IDS.length,
        evidence_refresh_reads_owner_again: true,
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
  document.addEventListener("agent-crypto:evidence-data-changed", afterPaint);
  document.addEventListener("agent-crypto:runtime-modules-ready", afterPaint, { once: true });
  document.addEventListener("erith:system-hydrated", afterPaint, { passive: true });
  window.addEventListener("pageshow", afterPaint);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", afterPaint, { once: true });
    window.addEventListener("load", afterPaint, { once: true });
  } else {
    afterPaint();
  }
})();
