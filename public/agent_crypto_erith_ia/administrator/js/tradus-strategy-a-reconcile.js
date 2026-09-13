/* Agent-Crypto @erith.IA — canonical TRADUS / Strategy A reconciliation owner.
   Introduced as the active canonical filename in Build 40.6.110.
   Git carries history; the active functional filename does not carry a build number.

   40.6.110 contract:
   - UNKNOWN is not WAIT;
   - UNKNOWN cannot yield CONVERGENCE or DIVERGENCE;
   - a known NO TRADE remains a legitimate WAIT state;
   - presentation/read-side only: no fetch, timer, observer, storage, strategy mutation,
     order, wallet or credential path. */
(() => {
  "use strict";

  const RELEASE = "40.6.110";
  const PANEL_ID = "tradusShadow406066";
  const upper = value => String(value ?? "").trim().toUpperCase();
  const prior = globalThis.AgentCryptoTradusStrategyReconcile406105;

  function stateOf(a) {
    const value = upper(a?.decision || a?.phase || "");
    if (!value || value === "INCONNU" || value === "UNKNOWN" || value === "N/D" || value === "—") return "UNKNOWN";
    if (/STOP|REJECT|REFUS|BLOCK/.test(value)) return "STOP";
    if (/PAPER|SIMUL/.test(value)) return "PAPER";
    if (/^OFF$|ARR[ÊE]T[ÉE]?|INACTIF/.test(value)) return "OFF";
    if (/NO TRADE|WAIT/.test(value)) return "WAIT";
    return "ACTIVE";
  }

  function compareFailClosed(a, signal) {
    const state = stateOf(a);
    const action = upper(signal?.action || "NO_TRADE") || "NO_TRADE";
    if (state === "UNKNOWN") {
      return Object.freeze({
        state: "NON COMPARABLE",
        text: `Strategy A inconnue · TRADUS ${action}`,
        fail_closed: true
      });
    }
    return prior?.compare
      ? Object.freeze({ ...prior.compare(a, signal), fail_closed: false })
      : Object.freeze({ state: "NON COMPARABLE", text: "Comparaison indisponible", fail_closed: true });
  }

  function setText(panel, key, value) {
    const node = panel?.querySelector?.(`[data-ts="${key}"]`);
    if (node) node.textContent = String(value ?? "—");
  }

  function enforce(reason = "runtime") {
    const panel = document.getElementById(PANEL_ID);
    const shadow = globalThis.AgentCryptoTradusShadow406066;
    if (!panel || !shadow?.read || !prior?.readStrategyA) {
      return Object.freeze({ applied: false, reason: "OWNER_NOT_READY" });
    }
    const a = prior.readStrategyA();
    const row = shadow.read?.() || null;
    const comparison = compareFailClosed(a, row?.signal);
    if (stateOf(a) !== "UNKNOWN") {
      return Object.freeze({ applied: false, reason: "KNOWN_STRATEGY_STATE", comparison });
    }
    setText(panel, "strategyA", "INCONNU");
    setText(panel, "compare", "NON COMPARABLE");
    setText(panel, "status", `${comparison.text} · comparaison suspendue tant que Strategy A n'a pas d'état déterministe lisible.`);
    panel.dataset.strategyAFailClosed = "unknown";
    panel.dataset.reconcileReason = String(reason || "runtime");
    document.documentElement.dataset.tradusStrategyAFailClosed = "active";
    return Object.freeze({ applied: true, reason, comparison });
  }

  function schedule(reason) {
    queueMicrotask(() => { try { enforce(reason); } catch (_) {} });
  }

  document.addEventListener("agentcrypto:tradus-shadow-observation", () => schedule("tradus-observation"), { passive: true });
  document.addEventListener("agentcrypto:strategy-a-auto-cycle", () => schedule("strategy-a-auto-cycle"), { passive: true });
  window.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), { once: true, passive: true });
  window.addEventListener("pageshow", () => schedule("pageshow"), { passive: true });
  if (document.readyState === "complete") schedule("boot");
  else window.addEventListener("load", () => schedule("load"), { once: true, passive: true });

  function selfTest() {
    const checks = [
      compareFailClosed({ decision: "INCONNU" }, { action: "NO_TRADE" }).state === "NON COMPARABLE",
      compareFailClosed({ decision: "INCONNU" }, { action: "BUY" }).state === "NON COMPARABLE",
      stateOf({ decision: "NO TRADE" }) === "WAIT",
      stateOf({ decision: "OFF" }) === "OFF"
    ];
    return Object.freeze({
      pass: checks.every(Boolean),
      total: checks.length,
      passed: checks.filter(Boolean).length,
      checks: Object.freeze(checks)
    });
  }

  globalThis.AgentCryptoTradusStrategyFailClosed = Object.freeze({
    release: RELEASE,
    active: Boolean(prior),
    canonical_file: "js/tradus-strategy-a-reconcile.js",
    stateOf,
    compare: compareFailClosed,
    enforce,
    selfTest,
    unknown_is_wait: false,
    unknown_can_converge: false,
    fetch: false,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    strategy_mutation: false,
    trading: false,
    wallet: false
  });
})();
