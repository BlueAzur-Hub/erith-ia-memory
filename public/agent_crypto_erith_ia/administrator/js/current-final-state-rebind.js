/* Agent-Crypto @erith.IA — 40.6.126
   ATLAS FINAL STATE REBIND
   Presentation convergence only after the canonical CURRENT closure path.
   Reuses existing CURRENT/REPOS and analytical-memory owners; no analytical
   mutation, timer, observer, fetch, storage, trading or wallet owner. */
(() => {
  "use strict";

  const BUILD = "40.6.126";
  const OWNER = "current-final-state-rebind";
  const WRAPPED = Symbol.for("agentcrypto.currentFinalStateRebind406126");
  let queued = false;
  let lastReason = "boot";
  let emitted = 0;

  function presentationSync(reason) {
    try {
      const api = globalThis.AgentCryptoLocalDialoguePresentation;
      if (api && typeof api.sync === "function") return api.sync(reason);
    } catch (_) {}
    return null;
  }

  function analyticalRefresh() {
    try {
      if (typeof globalThis.atlasAnalyticalMemoryRender394 === "function") {
        globalThis.atlasAnalyticalMemoryRender394();
      }
    } catch (_) {}
  }

  function canonicalCurrentUiTruth(reason) {
    try {
      if (typeof globalThis.atlasCanonicalCurrentUiTruth389 === "function") {
        globalThis.atlasCanonicalCurrentUiTruth389(`final-rebind-406126:${String(reason || "current-closed")}`);
        return true;
      }
    } catch (_) {}
    return false;
  }

  function emitFinalized(reason) {
    emitted += 1;
    const detail = Object.freeze({
      build: BUILD,
      owner: OWNER,
      reason: String(reason || "current-closed"),
      emitted_at: new Date().toISOString(),
      presentation_only: true
    });
    try { document.dispatchEvent(new CustomEvent("agentcrypto:current-finalized", { detail })); } catch (_) {}
    return detail;
  }

  function runRebind(reason) {
    queued = false;
    const uiTruth = canonicalCurrentUiTruth(reason);
    analyticalRefresh();
    presentationSync(`final-rebind-406126:${String(reason || "current-closed")}`);
    const detail = emitFinalized(reason);
    try {
      document.documentElement.dataset.currentFinalStateRebind = "converged";
      document.documentElement.dataset.currentFinalStateRebindReason = String(reason || "current-closed");
    } catch (_) {}
    return Object.freeze({ uiTruth, detail });
  }

  function schedule(reason) {
    lastReason = String(reason || "current-closed");
    if (queued) return false;
    queued = true;
    const finish = () => runRebind(lastReason);
    try {
      requestAnimationFrame(() => requestAnimationFrame(finish));
    } catch (_) {
      queueMicrotask(finish);
    }
    return true;
  }

  function wrap(name, reason, accept) {
    const current = globalThis[name];
    if (typeof current !== "function" || current[WRAPPED] === true) return false;
    const wrapped = function agentCryptoCurrentFinalStateBoundary406126(...args) {
      const result = Reflect.apply(current, this, args);
      const after = value => {
        let ok = true;
        try { ok = typeof accept === "function" ? accept(value, args) !== false : value !== false; } catch (_) {}
        if (ok) schedule(reason);
        return value;
      };
      if (result && typeof result.then === "function") return result.then(after);
      return after(result);
    };
    try { Object.defineProperty(wrapped, WRAPPED, { value: true }); } catch (_) {}
    try { Object.defineProperty(wrapped, "__agentCryptoWrappedOwner", { value: current }); } catch (_) {}
    globalThis[name] = wrapped;
    return globalThis[name] === wrapped;
  }

  const installed = Object.freeze({
    rest_status: wrap("atlasAutomation341SetRestStatus", "rest-status"),
    current_memory: wrap(
      "atlasCurrentMemoryReconcile384",
      "current-memory-reconcile",
      value => Boolean(value?.record || value?.verified === true || value?.changed === true || value?.updated === true)
    )
  });

  try {
    document.documentElement.dataset.currentFinalStateRebind = Object.values(installed).some(Boolean)
      ? "armed"
      : "boundary-unavailable";
  } catch (_) {}

  globalThis.AgentCryptoCurrentFinalStateRebind = Object.freeze({
    build: BUILD,
    owner: OWNER,
    canonical_active_filename: "js/current-final-state-rebind.js",
    installed,
    schedule,
    sync: runRebind,
    emitted: () => emitted,
    lastReason: () => lastReason,
    analytical_mutation: false,
    market_core_changed: false,
    recurring_timer: false,
    observer: false,
    fetch: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();
