/*
  Agent-Crypto Administrator — TRADUS Canonical Strategy Reader
  Build: 40.6.123
  Parent: 40.6.122

  Responsibility:
  Make every TRADUS shadow observation reuse the canonical Strategy A read-side
  owner introduced/repaired through 40.6.122 before the observation reaches the
  session ledger or downstream readers.

  Safety / scope:
  - read-side / observation wiring only;
  - no Strategy A mutation;
  - no market fetch, recurring timer, observer, wallet, credentials or order;
  - historical session rows are left untouched in this build;
  - UNKNOWN remains UNKNOWN / NON COMPARABLE.
*/
(() => {
  "use strict";

  const BUILD = "40.6.123";
  const API_KEY = "AgentCryptoTradusCanonicalStrategyReader406123";
  const SHADOW_KEY = "AgentCryptoTradusShadow";
  const LEDGER_KEY = "AgentCryptoTradusShadowLedger";
  const OBS_EVENT = "agentcrypto:tradus-shadow-observation";
  const SHADOW_MARK = "canonical_strategy_reader_406123";
  const LEDGER_MARK = "canonical_strategy_reader_406123";

  if (globalThis[API_KEY]) return;

  let shadowOriginal = null;
  let ledgerOriginal = null;
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
    try {
      return owner.compare(strategyA, signal) || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function canonicalizeRow(row, reason = "runtime") {
    if (!row || typeof row !== "object") return row;
    const out = clone(row) || { ...row };
    const strategyA = readCanonicalStrategyA();
    if (!strategyA) return out;

    out.strategy_a = clone(strategyA) || strategyA;
    out.comparison = clone(compareCanonical(strategyA, out.signal, out.comparison)) || out.comparison;
    out.strategy_a_reader = "AgentCryptoTradusStrategyFailClosed";
    out.strategy_a_reader_build = BUILD;
    out.strategy_a_reader_reason = String(reason || "runtime");
    canonicalized += 1;
    lastReason = String(reason || "runtime");
    return out;
  }

  function mutateObservationDetail(event) {
    const detail = event?.detail;
    if (!detail || typeof detail !== "object") return false;
    const fixed = canonicalizeRow(detail, "event_capture");
    if (!fixed || typeof fixed !== "object") return false;
    detail.strategy_a = fixed.strategy_a;
    detail.comparison = fixed.comparison;
    detail.strategy_a_reader = fixed.strategy_a_reader;
    detail.strategy_a_reader_build = fixed.strategy_a_reader_build;
    detail.strategy_a_reader_reason = fixed.strategy_a_reader_reason;
    return true;
  }

  function wrapLedger() {
    const current = globalThis[LEDGER_KEY];
    if (!current) return true;
    if (current[LEDGER_MARK] === true) {
      ledgerWrapped = true;
      return true;
    }
    if (typeof current.capture !== "function") return false;

    ledgerOriginal = current;
    const capture = current.capture.bind(current);
    const wrapper = Object.freeze({
      ...current,
      capture(row, source = "event") {
        return capture(canonicalizeRow(row, `ledger:${source}`), source);
      },
      [LEDGER_MARK]: true,
      canonical_reader_build: BUILD
    });
    globalThis[LEDGER_KEY] = wrapper;
    ledgerWrapped = true;
    return true;
  }

  function wrapShadow() {
    const current = globalThis[SHADOW_KEY];
    if (!current) return false;
    if (current[SHADOW_MARK] === true) {
      shadowWrapped = true;
      return true;
    }
    if (typeof current.refresh !== "function" || typeof current.read !== "function") return false;

    shadowOriginal = current;
    const refresh = current.refresh.bind(current);
    const read = current.read.bind(current);
    const wrapper = Object.freeze({
      ...current,
      async refresh(trigger = "manual") {
        const row = await refresh(trigger);
        return canonicalizeRow(row, `shadow-refresh:${trigger}`);
      },
      read() {
        return canonicalizeRow(read(), "shadow-read");
      },
      [SHADOW_MARK]: true,
      canonical_reader_build: BUILD
    });
    globalThis[SHADOW_KEY] = wrapper;
    shadowWrapped = true;
    return true;
  }

  function install(reason = "runtime") {
    lastReason = String(reason || "runtime");
    const ownerReady = !!canonicalOwner()?.readStrategyA && !!canonicalOwner()?.compare;
    if (!ownerReady) return false;
    const shadowOk = wrapShadow();
    const ledgerOk = wrapLedger();
    return shadowOk && ledgerOk;
  }

  function ready() {
    return install("ready-check");
  }

  function snapshot() {
    const strategyA = readCanonicalStrategyA();
    return clone({
      build: BUILD,
      ready: !!canonicalOwner() && shadowWrapped && ledgerWrapped,
      shadow_wrapped: shadowWrapped,
      ledger_wrapped: ledgerWrapped,
      canonical_strategy_a: strategyA,
      canonicalized_rows: canonicalized,
      last_reason: lastReason,
      historical_rows_rewritten: false,
      strategy_a_mutated: false,
      fetch: false,
      recurring_timer: false,
      observer: false,
      storage_owner: false,
      real_orders: false,
      credentials: false,
      wallet: false
    });
  }

  function selfTest() {
    const owner = canonicalOwner();
    const known = readCanonicalStrategyA();
    const checks = [
      !!owner && typeof owner.readStrategyA === "function",
      !!owner && typeof owner.compare === "function",
      wrapShadow() === true,
      wrapLedger() === true,
      known ? !unknown(upper(known.decision || known.phase || "")) : true
    ];
    return Object.freeze({
      build: BUILD,
      pass: checks.every(Boolean),
      total: checks.length,
      passed: checks.filter(Boolean).length,
      checks: Object.freeze(checks),
      current_strategy_known: !!known
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener(OBS_EVENT, mutateObservationDetail, true);
    document.addEventListener("agentcrypto:strategy-a-auto-cycle", () => install("strategy-a-cycle"), { passive: true });
    window.addEventListener("erith:system-hydrated", () => install("system-hydrated"), { passive: true });
    window.addEventListener("pageshow", () => install("pageshow"), { passive: true });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => install("dom-ready"), { once: true });
    } else {
      queueMicrotask(() => install("boot"));
    }
    window.addEventListener("load", () => install("load"), { once: true, passive: true });
  }

  globalThis[API_KEY] = Object.freeze({
    build: BUILD,
    ready,
    install,
    canonicalize: canonicalizeRow,
    snapshot,
    self_test: selfTest,
    canonical_strategy_owner: "AgentCryptoTradusStrategyFailClosed",
    shadow_owner: SHADOW_KEY,
    ledger_owner: LEDGER_KEY,
    historical_rows_rewritten: false,
    strategy_a_mutated: false,
    fetch: false,
    recurring_timer: false,
    observer: false,
    storage_owner: false,
    real_orders: false,
    credentials: false,
    wallet: false
  });
})();
