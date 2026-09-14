/*
  Agent-Crypto Administrator — Strategy A owner API auto-start
  Build: 40.6.124
  Parent: 40.6.123

  One responsibility:
  - start the existing Strategy A 5-minute PAPER runner through its canonical owner API;
  - never depend on Simulation being expanded, rendered, or on a button text/click.

  Safety:
  - reuses AgentCryptoAutoPaperRunner only;
  - no second market runner;
  - no real order, wallet or credentials;
  - explicit operator STOP remains authoritative for the current browser session.
*/
(() => {
  "use strict";

  const BUILD = "40.6.124";
  const API_KEY = "AgentCryptoStrategyAOwnerAutoStart";
  const STOP_KEY = "agent_crypto_strategy_a_auto_manual_stop_v1";
  const RETRY_MS = 250;
  const MAX_WAIT_MS = 30000;

  if (globalThis[API_KEY]) return;

  let timer = null;
  let startedAt = Date.now();
  let lastAction = "boot";
  let attempts = 0;

  const owner = () => globalThis.AgentCryptoAutoPaperRunner || null;

  function manualStop() {
    try { return sessionStorage.getItem(STOP_KEY) === "1"; }
    catch (_) { return false; }
  }

  function mark(value) {
    try { document.documentElement.dataset.strategyAOwnerAutoStart = value; }
    catch (_) {}
  }

  function clearTimer() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function snapshotOwner() {
    try { return owner()?.state?.() || null; }
    catch (_) { return null; }
  }

  function ensureActive(reason = "runtime") {
    if (manualStop()) {
      lastAction = `manual-stop:${reason}`;
      mark("manual-stop");
      clearTimer();
      return false;
    }

    const api = owner();
    if (!api || typeof api.start !== "function" || typeof api.state !== "function") {
      lastAction = `waiting-owner:${reason}`;
      mark("waiting-owner");
      return false;
    }

    const before = snapshotOwner();
    if (before?.enabled === true) {
      lastAction = `already-active:${reason}`;
      mark("active");
      clearTimer();
      return true;
    }

    try {
      lastAction = `owner-start:${reason}`;
      const result = api.start();
      const after = snapshotOwner() || result || null;
      if (after?.enabled === true) {
        mark("active");
        clearTimer();
        try {
          document.dispatchEvent(new CustomEvent("agentcrypto:strategy-a-owner-autostart", {
            detail: { build: BUILD, reason, paper_only: true, owner: "40.4.265" }
          }));
        } catch (_) {}
        return true;
      }

      lastAction = `owner-refused:${reason}:${String(after?.phase || after?.last_action || "unknown")}`;
      mark("owner-refused");
      return false;
    } catch (error) {
      lastAction = `error:${reason}:${String(error?.message || error)}`;
      mark("error");
      return false;
    }
  }

  function schedule(reason = "bootstrap", delay = 0) {
    clearTimer();
    if (manualStop()) {
      mark("manual-stop");
      return false;
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed > MAX_WAIT_MS) {
      lastAction = `timeout:${reason}`;
      mark("timeout");
      return false;
    }

    timer = setTimeout(() => {
      timer = null;
      attempts += 1;
      if (!ensureActive(`${reason}:${attempts}`)) schedule(reason, RETRY_MS);
    }, Math.max(0, Number(delay) || 0));
    return true;
  }

  function restart(reason) {
    startedAt = Date.now();
    attempts = 0;
    return schedule(reason, 0);
  }

  document.addEventListener("erith:system-hydrated", () => restart("system-hydrated"), { passive: true });
  window.addEventListener("pageshow", () => restart("pageshow"), { passive: true });

  const boot = () => restart("boot");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  globalThis[API_KEY] = Object.freeze({
    build: BUILD,
    ensure_active: ensureActive,
    restart_bootstrap: () => restart("api"),
    snapshot: () => Object.freeze({
      build: BUILD,
      owner_available: !!owner(),
      owner_state: snapshotOwner(),
      manual_stop: manualStop(),
      attempts,
      elapsed_ms: Date.now() - startedAt,
      last_action: lastAction
    }),
    contract: Object.freeze({
      paper_only: true,
      owner_api_only: true,
      ui_independent: true,
      button_click: false,
      simulation_open_required: false,
      existing_runner_reused: true,
      new_recurring_market_timer: false,
      real_order: false,
      wallet: false,
      credentials: false
    })
  });
})();
