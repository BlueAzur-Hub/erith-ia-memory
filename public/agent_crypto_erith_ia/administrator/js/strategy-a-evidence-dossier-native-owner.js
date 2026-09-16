/* Agent-Crypto @erith.IA — 40.6.181 EVIDENCE DOSSIER NATIVE OWNER
   Makes the existing Strategy A Evidence Dossier the presentation owner for the
   three structured G3 supplemental panels. Any dossier render is followed by an
   idempotent supplement mount. No gate promotion, no timer/observer/storage/network/order. */
(() => {
  "use strict";
  const BUILD = "40.6.181";
  const DOSSIER_ID = "strategyADossier";
  const PANEL_IDS = Object.freeze([
    "strategyAG3StructuredTruth",
    "strategyAG3HistoryOwnerDiscovery",
    "strategyAG3HistoricalEvidenceAdapter"
  ]);
  const original = globalThis.AgentCryptoStrategyAEvidenceDossier || null;
  if (!original || typeof original.render !== "function") return;

  let wrapping = false;
  let renderCount = 0;

  function mountSupplements() {
    const integrator = globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator || null;
    if (typeof integrator?.mount !== "function") return null;
    try { return integrator.mount(); } catch (_) { return null; }
  }

  function dossierTruth() {
    const dossier = typeof document !== "undefined" ? document.getElementById(DOSSIER_ID) : null;
    return {
      schema: "agent_crypto_strategy_a_evidence_dossier_native_owner_truth_v1",
      build: BUILD,
      dossier_present: !!dossier,
      panels_present: PANEL_IDS.filter(id => document.getElementById(id)?.parentElement === dossier).length,
      panel_parents: PANEL_IDS.map(id => ({ id, parent: document.getElementById(id)?.parentElement?.id || null })),
      expected_panels: PANEL_IDS.length,
      render_count: renderCount,
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

  function render() {
    if (wrapping) return original.render();
    wrapping = true;
    let result = false;
    try {
      result = original.render();
      renderCount += 1;
    } finally {
      wrapping = false;
    }
    mountSupplements();
    const dossier = document.getElementById(DOSSIER_ID);
    if (dossier) {
      dossier.dataset.nativeSupplementOwnerBuild = BUILD;
      dossier.dataset.nativeSupplementExpected = String(PANEL_IDS.length);
      dossier.dataset.nativeSupplementPresent = String(PANEL_IDS.filter(id => document.getElementById(id)?.parentElement === dossier).length);
    }
    return result;
  }

  const wrapped = Object.freeze({
    ...original,
    build: BUILD,
    render,
    native_supplement_owner: true,
    native_supplement_owner_build: BUILD,
    supplement_panels: PANEL_IDS.slice(),
    supplement_truth: dossierTruth,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network: false,
    real_order: false,
    paper_only: true
  });
  globalThis.AgentCryptoStrategyAEvidenceDossier = wrapped;

  const schedule = () => {
    const run = () => { try { render(); } catch (_) {} };
    try { requestAnimationFrame(run); } catch (_) { queueMicrotask(run); }
  };
  document.addEventListener("agent-crypto:runtime-modules-ready", schedule, { once: true });
  document.addEventListener("erith:system-hydrated", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
