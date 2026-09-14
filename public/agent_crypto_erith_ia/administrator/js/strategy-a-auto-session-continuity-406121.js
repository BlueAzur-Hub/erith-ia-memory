/*
  Agent-Crypto Administrator — Strategy A Paper Auto continuity v2
  Build: 40.6.121
  Parent: 40.6.120

  Purpose:
  - stop requiring the operator to click ACTIVER AUTO A after every reload;
  - reuse the existing Strategy A 5-minute PAPER runner only;
  - remember an explicit STOP for the current browser session.

  Safety:
  - PAPER only;
  - no second market runner;
  - no real order, credential or wallet capability;
  - no localStorage write;
  - bounded bootstrap retry only (max ~6 s), not a recurring market timer.
*/
(() => {
  "use strict";

  const BUILD = "40.6.121";
  const API_KEY = "AgentCryptoStrategyAAutoSessionContinuity";
  const STOP_KEY = "agent_crypto_strategy_a_auto_manual_stop_v1";
  const MAX_RETRIES = 12;
  const RETRY_MS = 500;

  if (globalThis[API_KEY]) return;

  let retryTimer = null;
  let retries = 0;
  let lastAction = "boot";
  let autoClicking = false;

  const norm = value => String(value || "").replace(/\s+/g, " ").trim().toUpperCase();
  const buttons = () => Array.from(document.querySelectorAll('button,[role="button"]'));

  function manualStop() {
    try { return sessionStorage.getItem(STOP_KEY) === "1"; }
    catch (_) { return false; }
  }

  function setManualStop(enabled) {
    try {
      if (enabled) sessionStorage.setItem(STOP_KEY, "1");
      else sessionStorage.removeItem(STOP_KEY);
      document.documentElement.dataset.strategyAAutoManualStop = enabled ? "stopped" : "run";
      return true;
    } catch (_) {
      document.documentElement.dataset.strategyAAutoManualStop = "storage-unavailable";
      return false;
    }
  }

  function findPanelFrom(node) {
    let current = node instanceof Element ? node : null;
    while (current && current !== document.body) {
      const text = norm(current.textContent);
      if (text.includes("STRATÉGIE A") && text.includes("PAPER AUTOMATIQUE") && text.includes("PILOTE DE SIMULATION")) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function activateButton() {
    return buttons().find(node => norm(node.textContent) === "ACTIVER AUTO A") || null;
  }

  function activeButton() {
    return buttons().find(node => norm(node.textContent) === "AUTO A ACTIF") || null;
  }

  function state() {
    const activate = activateButton();
    const activeControl = activeButton();
    const panel = findPanelFrom(activate || activeControl);
    const text = norm(panel?.textContent);
    const active = !!activeControl || text.includes("AUTO A ACTIF") || (text.includes("PILOTE PAPER ACTIF") && !text.includes("PILOTE PAPER INACTIF"));
    return { activate, activeControl, panel, active };
  }

  function clearRetry() {
    if (retryTimer !== null) clearTimeout(retryTimer);
    retryTimer = null;
  }

  function mark(value) {
    document.documentElement.dataset.strategyAAutoContinuity = value;
  }

  function ensureActive(reason = "runtime") {
    if (document.hidden) {
      lastAction = `hidden:${reason}`;
      mark("waiting-visible");
      return false;
    }
    if (manualStop()) {
      lastAction = `manual-stop:${reason}`;
      mark("manual-stop");
      clearRetry();
      return false;
    }

    const current = state();
    if (current.active) {
      lastAction = `active:${reason}`;
      mark("active");
      clearRetry();
      return true;
    }
    if (!current.activate) {
      lastAction = `waiting-control:${reason}`;
      mark("waiting-control");
      return false;
    }

    autoClicking = true;
    try {
      lastAction = `activate-existing-runner:${reason}`;
      current.activate.click();
      mark("activation-requested");
      try {
        document.dispatchEvent(new CustomEvent("agentcrypto:strategy-a-auto-continuity-requested", {
          detail: { build: BUILD, reason, paper_only: true }
        }));
      } catch (_) {}
      return true;
    } catch (error) {
      lastAction = `error:${reason}:${String(error?.message || error)}`;
      mark("error");
      return false;
    } finally {
      queueMicrotask(() => { autoClicking = false; });
    }
  }

  function schedule(reason = "bootstrap", delay = 0) {
    clearRetry();
    if (manualStop() || document.hidden) return false;
    if (state().active) {
      mark("active");
      return true;
    }
    if (retries >= MAX_RETRIES) {
      lastAction = `retry-limit:${reason}`;
      mark("retry-limit");
      return false;
    }

    retryTimer = setTimeout(() => {
      retryTimer = null;
      retries += 1;
      ensureActive(`${reason}:${retries}`);
      if (!manualStop() && !state().active && retries < MAX_RETRIES) schedule(reason, RETRY_MS);
    }, Math.max(0, Number(delay) || 0));
    return true;
  }

  function captureOperatorIntent(event) {
    const control = event.target instanceof Element ? event.target.closest('button,[role="button"]') : null;
    if (!control) return;
    const label = norm(control.textContent);

    if (label === "STOP") {
      const panel = findPanelFrom(control);
      if (!panel) return;
      setManualStop(true);
      clearRetry();
      retries = 0;
      lastAction = "operator-stop";
      mark("manual-stop");
      return;
    }

    if (label === "ACTIVER AUTO A") {
      setManualStop(false);
      if (!autoClicking) {
        retries = 0;
        lastAction = "operator-activate";
      }
    }
  }

  document.addEventListener("click", captureOperatorIntent, true);
  document.addEventListener("erith:system-hydrated", () => {
    retries = 0;
    schedule("system-hydrated", 0);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearRetry();
    else {
      retries = 0;
      schedule("visible", 0);
    }
  }, { passive: true });

  window.addEventListener("pageshow", () => {
    retries = 0;
    schedule("pageshow", 0);
  }, { passive: true });

  const boot = () => {
    retries = 0;
    schedule("boot", 0);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  globalThis[API_KEY] = Object.freeze({
    build: BUILD,
    ensure_active: ensureActive,
    start_bootstrap: () => { retries = 0; return schedule("api", 0); },
    manual_stop: manualStop,
    clear_manual_stop: () => { const ok = setManualStop(false); retries = 0; schedule("api-clear-stop", 0); return ok; },
    snapshot: () => Object.freeze({
      build: BUILD,
      active: state().active,
      manual_stop: manualStop(),
      retries,
      retry_limit: MAX_RETRIES,
      last_action: lastAction
    }),
    contract: Object.freeze({
      paper_only: true,
      default_auto_start: true,
      explicit_stop_persists_for_session: true,
      existing_runner_reused: true,
      new_recurring_market_timer: false,
      bounded_bootstrap_retry: true,
      real_order: false,
      wallet: false,
      credentials: false,
      local_storage_write: false,
      session_storage_write: true
    })
  });
})();
