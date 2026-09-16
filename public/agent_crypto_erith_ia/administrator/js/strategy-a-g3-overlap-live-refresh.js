/* Agent-Crypto @erith.IA — 40.6.209 G3 T0 OVERLAP LIVE REFRESH
   Terrain proof from 40.6.208 showed that prospective T0 capture updated the
   Experiment Ledger facade and Cascade Checkpoint, but the read-only T0/window
   overlap panel kept its pre-click snapshot. This binding refreshes that proof
   after the existing PAPER-only capture action and on Evidence lifecycle events.
   No trading logic, Gate state, market data, ledger row, timer, observer,
   network request or real-order path is changed. */
(() => {
  "use strict";

  const BUILD = "40.6.209";
  const OWNER = "strategy-a-g3-overlap-live-refresh";
  const BUTTON_ID = "strategyAG3ProspectiveT0CaptureRun";
  const HOST_ID = "strategyAEvidenceSupplements";
  const OVERLAP_ID = "strategyAG3T0WindowOverlapProof";

  let queued = false;
  let refreshCount = 0;
  let lastReceipt = null;

  const clone = value => {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_) { return null; }
  };

  function refresh(reason = "manual") {
    refreshCount += 1;
    const host = typeof document !== "undefined" ? document.getElementById(HOST_ID) : null;
    const integrator = globalThis.AgentCryptoStrategyAEvidenceDossierSupplementIntegrator || null;
    const cascade = globalThis.AgentCryptoStrategyAG3CascadeCheckpoint || null;

    try { cascade?.render?.(); } catch (_) {}

    let proof = null;
    try {
      proof = typeof integrator?.render_overlap_proof === "function"
        ? integrator.render_overlap_proof(host)
        : null;
    } catch (_) {
      proof = null;
    }

    const node = typeof document !== "undefined" ? document.getElementById(OVERLAP_ID) : null;
    if (node) {
      node.dataset.liveRefreshBuild = BUILD;
      node.dataset.liveRefreshOwner = OWNER;
      node.dataset.liveRefreshReason = String(reason);
    }

    lastReceipt = Object.freeze({
      schema: "agent_crypto_g3_overlap_live_refresh_receipt_v1",
      build: BUILD,
      owner: OWNER,
      reason: String(reason),
      refresh_count: refreshCount,
      host_present: !!host,
      overlap_panel_present: !!node,
      integrator_available: typeof integrator?.render_overlap_proof === "function",
      cascade_available: typeof cascade?.snapshot === "function",
      relation: proof?.relation || null,
      gap_min: proof?.gap_min ?? null,
      conclusion: proof?.conclusion || null,
      certified_t0: proof?.certified_t0 ?? null,
      joined_count: proof?.joined_count ?? null,
      read_only: true,
      paper_only: true,
      real_order: false,
      g3: "PENDING",
      g9: "LOCKED"
    });

    return clone(lastReceipt);
  }

  function schedule(reason) {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      refresh(reason);
    });
  }

  function onClick(event) {
    const target = event?.target;
    if (!(target instanceof Element)) return;
    if (!target.closest(`#${BUTTON_ID}`)) return;
    // The button's own listener runs before this document-level bubble listener.
    // Therefore the prospective capture + cascade refresh have already completed.
    schedule("prospective-t0-capture-click");
  }

  function snapshot() {
    return Object.freeze({
      schema: "agent_crypto_g3_overlap_live_refresh_v1",
      build: BUILD,
      owner: OWNER,
      queued,
      refresh_count: refreshCount,
      last_receipt: clone(lastReceipt),
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      real_order: false,
      paper_only: true,
      g3: "PENDING",
      g9: "LOCKED"
    });
  }

  globalThis.AgentCryptoStrategyAG3OverlapLiveRefresh = Object.freeze({
    build: BUILD,
    owner: OWNER,
    refresh,
    schedule,
    snapshot,
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
    document.addEventListener("click", onClick, false);
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"));
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {passive:true});
    window.addEventListener("pageshow", () => schedule("pageshow"), {passive:true});
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => schedule("dom-content-loaded"), {once:true});
      window.addEventListener("load", () => schedule("window-load"), {once:true});
    } else {
      schedule("module-load");
    }
  }
})();
