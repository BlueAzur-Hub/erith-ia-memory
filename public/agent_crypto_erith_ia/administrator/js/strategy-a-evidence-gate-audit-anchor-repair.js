/* Agent-Crypto @erith.IA — 40.6.158 STRATEGY A AUDIT ANCHOR REPAIR
   Terrain repair for 40.6.157: build loaded in Firefox, but the audit/button could
   miss the late-mounted PAPER V2 proof bridge. Event-driven retries only.
   No timer, observer, storage owner, threshold change or order path. */
(() => {
  "use strict";

  const RELEASE = "40.6.158";
  const ROOT_ID = "strategyAEvidenceGateAudit";

  function byId(id) { return document.getElementById(id); }

  function relocate() {
    const bridge = byId("strategyAPaperV2ProofBridge");
    const root = byId(ROOT_ID);
    const list = bridge?.querySelector(".sapv2-gate-list");
    if (!bridge || !root || !list) return false;
    if (root.previousElementSibling !== list) list.insertAdjacentElement("afterend", root);
    root.dataset.anchorRepair = RELEASE;
    return true;
  }

  function repair() {
    const bridge = byId("strategyAPaperV2ProofBridge");
    const api = globalThis.AgentCryptoStrategyAEvidenceGateAudit || null;
    if (!bridge || !api || typeof api.render !== "function") return false;
    if (!byId(ROOT_ID)) {
      try { api.render(); } catch (_) { return false; }
    }
    return relocate();
  }

  function retry() {
    try { return repair(); } catch (_) { return false; }
  }

  function afterPaint() {
    try { requestAnimationFrame(() => requestAnimationFrame(retry)); }
    catch (_) { retry(); }
  }

  globalThis.AgentCryptoStrategyAEvidenceGateAuditAnchorRepair = Object.freeze({
    release: RELEASE,
    owner: "strategy-a-evidence-gate-audit-anchor-repair",
    repair,
    timer_added: false,
    observer_added: false,
    storage_write: false,
    network: false,
    paper_only: true,
    real_order: false,
    thresholds_changed: false,
    business_logic_changed: false
  });

  document.addEventListener("click", retry, true);
  document.addEventListener("focusin", retry, true);
  window.addEventListener("pageshow", retry);
  document.addEventListener("agent-crypto:runtime-modules-ready", () => { retry(); afterPaint(); }, { once: true });
  document.addEventListener("erith:system-hydrated", () => { retry(); afterPaint(); }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { retry(); afterPaint(); }, { once: true });
    window.addEventListener("load", () => { retry(); afterPaint(); }, { once: true });
  } else {
    retry();
    afterPaint();
  }
})();