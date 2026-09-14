/* Agent-Crypto Administrator — canonical Strategy A reader for TRADUS.
   Stable runtime owner. Historical observations remain untouched; new reads and
   captures are normalized before they reach the comparative ledger. */
(() => {
  "use strict";

  const OWNER = "tradus-canonical-strategy-reader";
  const SHADOW_KEY = "AgentCryptoTradusShadow406066";
  const LEDGER_KEY = "AgentCryptoTradusShadowLedger";
  const OBS_EVENT = "agentcrypto:tradus-shadow-observation";
  const SHADOW_MARK = "agentCryptoCanonicalStrategyReader";
  const LEDGER_MARK = "agentCryptoCanonicalStrategyReader";

  if (globalThis.AgentCryptoTradusCanonicalStrategyReader) return;

  let shadowWrapped = false;
  let ledgerWrapped = false;
  let canonicalized = 0;
  let lastReason = "boot";

  const clone = value => {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_) { return null; }
  };
  const upper = value => String(value ?? "").trim().toUpperCase();
  const unknown = value => !value || value === "INCONNU" || value === "UNKNOWN" || value === "N/D" || value === "—";
  const canonicalOwner = () => globalThis.AgentCryptoTradusStrategyFailClosed || null;

  function readCanonicalStrategyA() {
    const owner = canonicalOwner();
    if (!owner || typeof owner.readStrategyA !== "function") return null;
    try {
      const value = owner.readStrategyA();
      const decision = upper(value?.decision || value?.phase || "");
      return unknown(decision) ? null : value;
    } catch (_) {
      return null;
    }
  }

  function compareCanonical(strategyA, signal, fallback = null) {
    const owner = canonicalOwner();
    if (!owner || typeof owner.compare !== "function") return fallback;
    try { return owner.compare(strategyA, signal) || fallback; }
    catch (_) { return fallback; }
  }

  function canonicalize(row, reason = "runtime") {
    if (!row || typeof row !== "object") return row;
    const out = clone(row) || { ...row };
    const strategyA = readCanonicalStrategyA();
    if (!strategyA) return out;
    out.strategy_a = clone(strategyA) || strategyA;
    out.comparison = clone(compareCanonical(strategyA, out.signal, out.comparison)) || out.comparison;
    out.strategy_a_reader = "AgentCryptoTradusStrategyFailClosed";
    out.strategy_a_reader_reason = String(reason || "runtime");
    canonicalized += 1;
    lastReason = String(reason || "runtime");
    return out;
  }

  function mutateObservationDetail(event) {
    const detail = event?.detail;
    if (!detail || typeof detail !== "object") return false;
    const fixed = canonicalize(detail, "event_capture");
    if (!fixed || typeof fixed !== "object") return false;
    detail.strategy_a = fixed.strategy_a;
    detail.comparison = fixed.comparison;
    detail.strategy_a_reader = fixed.strategy_a_reader;
    detail.strategy_a_reader_reason = fixed.strategy_a_reader_reason;
    return true;
  }

  function wrapLedger() {
    const current = globalThis[LEDGER_KEY];
    if (!current) return true;
    if (current[LEDGER_MARK] === true) { ledgerWrapped = true; return true; }
    if (typeof current.capture !== "function") return false;
    const capture = current.capture.bind(current);
    globalThis[LEDGER_KEY] = Object.freeze({
      ...current,
      capture(row, source = "event") { return capture(canonicalize(row, `ledger:${source}`), source); },
      [LEDGER_MARK]: true,
      canonical_reader: OWNER
    });
    ledgerWrapped = true;
    return true;
  }

  function wrapShadow() {
    const current = globalThis[SHADOW_KEY];
    if (!current) return false;
    if (current[SHADOW_MARK] === true) { shadowWrapped = true; return true; }
    if (typeof current.refresh !== "function" || typeof current.read !== "function") return false;
    const refresh = current.refresh.bind(current);
    const read = current.read.bind(current);
    globalThis[SHADOW_KEY] = Object.freeze({
      ...current,
      async refresh(trigger = "manual") { return canonicalize(await refresh(trigger), `shadow-refresh:${trigger}`); },
      read() { return canonicalize(read(), "shadow-read"); },
      [SHADOW_MARK]: true,
      canonical_reader: OWNER
    });
    shadowWrapped = true;
    return true;
  }

  function install(reason = "runtime") {
    lastReason = String(reason || "runtime");
    const ownerReady = !!canonicalOwner()?.readStrategyA && !!canonicalOwner()?.compare;
    if (!ownerReady) return false;
    return wrapShadow() && wrapLedger();
  }

  function ready() { return install("ready-check"); }

  function snapshot() {
    return clone({
      owner: OWNER,
      ready: !!canonicalOwner() && shadowWrapped && ledgerWrapped,
      shadow_wrapped: shadowWrapped,
      ledger_wrapped: ledgerWrapped,
      canonical_strategy_a: readCanonicalStrategyA(),
      canonicalized_rows: canonicalized,
      last_reason: lastReason,
      historical_rows_rewritten: false,
      strategy_a_mutated: false
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener(OBS_EVENT, mutateObservationDetail, true);
    document.addEventListener("agentcrypto:strategy-a-auto-cycle", () => install("strategy-a-cycle"), { passive: true });
    window.addEventListener("erith:system-hydrated", () => install("system-hydrated"), { passive: true });
    window.addEventListener("pageshow", () => install("pageshow"), { passive: true });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => install("dom-ready"), { once: true });
    else queueMicrotask(() => install("boot"));
    window.addEventListener("load", () => install("load"), { once: true, passive: true });
  }

  globalThis.AgentCryptoTradusCanonicalStrategyReader = Object.freeze({
    owner: OWNER,
    ready,
    install,
    canonicalize,
    snapshot,
    canonical_strategy_owner: "AgentCryptoTradusStrategyFailClosed",
    shadow_owner: SHADOW_KEY,
    ledger_owner: LEDGER_KEY,
    historical_rows_rewritten: false,
    strategy_a_mutated: false,
    recurring_timer: false,
    observer: false,
    storage_owner: false,
    real_orders: false,
    credentials: false,
    wallet: false
  });
})();
