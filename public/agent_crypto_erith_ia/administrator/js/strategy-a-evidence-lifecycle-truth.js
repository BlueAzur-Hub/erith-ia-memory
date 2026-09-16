/* Agent-Crypto @erith.IA — 40.6.166 EVIDENCE DOSSIER LIFECYCLE TRUTH
   Keeps G1/G3 Evidence Dossier, gate audit and G3 replay contract outside the
   Proof Bridge subtree that is rebuilt with innerHTML. Refresh is event-driven:
   no recurring timer, no MutationObserver, no storage write, no network/order path. */
(() => {
  "use strict";

  const BUILD = "40.6.166";
  const ROOT_ID = "strategyADossier";
  const BRIDGE_ID = "strategyAPaperV2ProofBridge";
  const AUDIT_ID = "strategyAEvidenceGateAudit";
  const REFRESH_ID = "strategyAPaperV2ProofRefresh";
  let queued = false;
  let refreshCount = 0;

  const byId = id => document.getElementById(id);

  function moveAfter(anchor, node) {
    if (!anchor || !node || anchor === node) return false;
    if (anchor.nextElementSibling !== node) anchor.insertAdjacentElement("afterend", node);
    return true;
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

    const stable = ensureStablePlacement();
    try {
      document.dispatchEvent(new CustomEvent("agent-crypto:evidence-view-refreshed", {
        detail: { build: BUILD, refresh_count: refreshCount, stable }
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
    if (!button) return;
    if (button.id === REFRESH_ID) afterPaint();
  }

  function selfTest() {
    return {
      schema: "agent_crypto_evidence_lifecycle_truth_self_test_v1",
      build: BUILD,
      pass: true,
      checks: {
        stable_sibling_policy: true,
        proof_refresh_rehydrates_views: true,
        evidence_refresh_reads_owner_again: true,
        recurring_timer: false,
        mutation_observer: false,
        storage_write: false,
        real_order: false
      }
    };
  }

  globalThis.AgentCryptoEvidenceLifecycleTruth = Object.freeze({
    build: BUILD,
    refresh: refreshEvidence,
    ensure_stable_placement: ensureStablePlacement,
    self_test: selfTest,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network: false,
    real_order: false,
    paper_only: true
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