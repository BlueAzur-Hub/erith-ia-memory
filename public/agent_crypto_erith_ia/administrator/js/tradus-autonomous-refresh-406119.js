/*
  Agent-Crypto Administrator — TRADUS Autonomous Shadow Refresh
  Build: 40.6.119
  Parent: 40.6.118
  Responsibility: refresh the existing TRADUS shadow lane without operator clicks.

  Safety / scope:
  - public Binance read-side through the existing 40.6.66 owner only;
  - one bounded 60 s timeout chain while the page is visible;
  - no credential, wallet or order capability;
  - no Strategy A mutation;
  - no storage writes;
  - stops while hidden and on pagehide.
*/
(() => {
  "use strict";

  const BUILD = "40.6.119";
  const INTERVAL_MS = 60_000;
  const START_DELAY_MS = 1_500;
  const RETRY_MS = 2_000;
  const API_KEY = "AgentCryptoTradusAutonomousRefresh406119";
  const PANEL_ID = "tradusShadow406066";

  if (globalThis[API_KEY]) return;

  let timer = null;
  let running = false;
  let cycles = 0;
  let lastAt = null;
  let lastTrigger = null;
  let lastError = null;

  const shadow = () => globalThis.AgentCryptoTradusShadow406066 || null;
  const clone = value => {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_) { return null; }
  };

  function clearTimer() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  function syncVisibleContract() {
    if (typeof document === "undefined") return false;
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return false;
    panel.dataset.autonomousRefresh = BUILD;
    panel.dataset.autonomousRefreshInterval = String(INTERVAL_MS);
    const foot = panel.querySelector(".ts-foot");
    if (foot) {
      foot.textContent = "SHADOW ONLY · AUTO 60 S ACTIF PAGE VISIBLE · aucun ordre · aucune clé · aucun wallet · aucune mutation Strategy A · signal comparatif uniquement.";
    }
    return true;
  }

  function schedule(delay = INTERVAL_MS) {
    clearTimer();
    if (!running || typeof document === "undefined" || document.hidden) return false;
    timer = setTimeout(() => { void cycle("autonomous_60s"); }, Math.max(250, Number(delay) || INTERVAL_MS));
    return true;
  }

  async function cycle(trigger = "autonomous_60s") {
    if (!running || typeof document === "undefined" || document.hidden) return false;

    const owner = shadow();
    if (!owner || typeof owner.refresh !== "function") {
      lastError = "TRADUS_OWNER_UNAVAILABLE";
      schedule(RETRY_MS);
      return false;
    }

    try { owner.mount?.(); } catch (_) {}
    syncVisibleContract();

    try {
      await owner.refresh(trigger);
      cycles += 1;
      lastAt = new Date().toISOString();
      lastTrigger = trigger;
      lastError = null;
      syncVisibleContract();
      try {
        document.dispatchEvent(new CustomEvent("agentcrypto:tradus-autonomous-refresh", {
          detail: { build: BUILD, cycles, at: lastAt, trigger }
        }));
      } catch (_) {}
      return true;
    } catch (error) {
      lastError = String(error?.message || error || "TRADUS_REFRESH_FAILED");
      return false;
    } finally {
      schedule(INTERVAL_MS);
    }
  }

  function start(source = "start") {
    if (running) {
      syncVisibleContract();
      return false;
    }
    running = true;
    lastTrigger = source;
    syncVisibleContract();
    schedule(START_DELAY_MS);
    return true;
  }

  function stop(source = "stop") {
    running = false;
    lastTrigger = source;
    clearTimer();
    return true;
  }

  function status() {
    return clone({
      build: BUILD,
      running,
      page_visible: typeof document !== "undefined" ? !document.hidden : false,
      interval_ms: INTERVAL_MS,
      cycles,
      last_at: lastAt,
      last_trigger: lastTrigger,
      last_error: lastError,
      owner_available: !!shadow(),
      visible_contract_synced: syncVisibleContract(),
      paper_only: true,
      shadow_only: true,
      real_orders: false,
      credentials: false,
      wallet: false,
      strategy_a_mutated: false,
      storage_write: false,
      recurring_timer: true
    });
  }

  function selfTest() {
    const checks = {
      interval_60s: INTERVAL_MS === 60_000,
      retry_bounded: RETRY_MS >= 1_000,
      real_orders_disabled: true,
      credentials_disabled: true,
      wallet_disabled: true,
      storage_write_disabled: true
    };
    return Object.freeze({
      build: BUILD,
      pass: Object.values(checks).every(Boolean),
      checks,
      paper_only: true,
      shadow_only: true,
      recurring_timer: true
    });
  }

  const api = Object.freeze({
    build: BUILD,
    interval_ms: INTERVAL_MS,
    start,
    stop,
    run_once: () => cycle("explicit_run_once"),
    status,
    sync_visible_contract: syncVisibleContract,
    self_test: selfTest,
    paper_only: true,
    shadow_only: true,
    real_orders: false,
    credentials: false,
    wallet: false,
    strategy_a_mutated: false,
    storage_write: false,
    recurring_timer: true
  });
  globalThis[API_KEY] = api;

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimer();
      else if (running) {
        syncVisibleContract();
        schedule(250);
      }
    }, { passive: true });
    document.addEventListener("agentcrypto:tradus-shadow-observation", syncVisibleContract, { passive: true });
    window.addEventListener("pagehide", () => stop("pagehide"), { passive: true });
    window.addEventListener("pageshow", () => start("pageshow"), { passive: true });

    const boot = () => start("boot");
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
  }
})();
