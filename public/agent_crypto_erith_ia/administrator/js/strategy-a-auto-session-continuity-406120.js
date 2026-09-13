/*
  Agent-Crypto Administrator — Strategy A Auto session continuity
  Build: 40.6.120
  Parent: 40.6.119

  Responsibility:
  Preserve the operator's explicit Auto A opt-in across same-origin reloads and
  version transitions for the current browser session only.

  Safety / ownership:
  - reuses the existing ACTIVER AUTO A control and existing 5-minute runner;
  - never creates a second recurring runner or market fetch;
  - STOP in the Strategy A panel clears the session opt-in;
  - no localStorage write, credential, wallet or real-order capability.
*/
(() => {
  "use strict";

  const BUILD = "40.6.120";
  const API_KEY = "AgentCryptoStrategyAAutoSessionContinuity406120";
  const SESSION_KEY = "agent_crypto_strategy_a_auto_optin_v1";

  if (globalThis[API_KEY]) return;

  let restoring = false;
  let restoredThisDocument = false;
  let lastRestore = "never";

  const norm = value => String(value || "").replace(/\s+/g, " ").trim().toUpperCase();

  function optedIn() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; }
    catch (_) { return false; }
  }

  function setOptIn(enabled) {
    try {
      if (enabled) sessionStorage.setItem(SESSION_KEY, "1");
      else sessionStorage.removeItem(SESSION_KEY);
      document.documentElement.dataset.strategyAAutoSessionOptin406120 = enabled ? "enabled" : "disabled";
      return true;
    } catch (_) {
      document.documentElement.dataset.strategyAAutoSessionOptin406120 = "storage-unavailable";
      return false;
    }
  }

  const buttons = () => Array.from(document.querySelectorAll('button,[role="button"]'));

  function activateButton() {
    return buttons().find(node => norm(node.textContent) === "ACTIVER AUTO A") || null;
  }

  function strategyPanel(activate = activateButton()) {
    if (!(activate instanceof Element)) return null;
    let node = activate.parentElement;
    while (node && node !== document.body) {
      const text = norm(node.textContent);
      if (text.includes("STRATÉGIE A") && text.includes("PAPER AUTOMATIQUE") && text.includes("PILOTE DE SIMULATION")) {
        return node;
      }
      node = node.parentElement;
    }
    return activate.closest("section,article") || activate.parentElement;
  }

  function state() {
    const activate = activateButton();
    const panel = strategyPanel(activate);
    const text = norm(panel?.textContent);
    const active = text.includes("AUTO A ACTIF") || (text.includes("PILOTE PAPER ACTIF") && !text.includes("PILOTE PAPER INACTIF"));
    return { activate, panel, active };
  }

  function restore(reason = "runtime") {
    if (restoring || restoredThisDocument || !optedIn() || document.hidden) return false;
    const current = state();
    if (!current.activate) {
      lastRestore = `waiting:${reason}`;
      return false;
    }
    if (current.active) {
      restoredThisDocument = true;
      lastRestore = `already-active:${reason}`;
      document.documentElement.dataset.strategyAAutoSessionContinuity406120 = "already-active";
      return true;
    }

    restoring = true;
    try {
      lastRestore = `activate-existing-runner:${reason}`;
      current.activate.click();
      restoredThisDocument = true;
      document.documentElement.dataset.strategyAAutoSessionContinuity406120 = "restored";
      try {
        document.dispatchEvent(new CustomEvent("agentcrypto:strategy-a-auto-session-restored", {
          detail: { build: BUILD, reason, session_only: true }
        }));
      } catch (_) {}
      return true;
    } catch (error) {
      lastRestore = `error:${reason}:${String(error?.message || error)}`;
      document.documentElement.dataset.strategyAAutoSessionContinuity406120 = "error";
      return false;
    } finally {
      queueMicrotask(() => { restoring = false; });
    }
  }

  function captureOptIn(event) {
    const element = event.target instanceof Element ? event.target.closest('button,[role="button"]') : null;
    if (!element) return;
    const label = norm(element.textContent);

    if (label === "ACTIVER AUTO A") {
      setOptIn(true);
      restoredThisDocument = true;
      lastRestore = "operator-enabled";
      return;
    }

    if (label !== "STOP") return;
    const current = state();
    if (current.panel && current.panel.contains(element)) {
      setOptIn(false);
      restoredThisDocument = false;
      lastRestore = "operator-stop";
      document.documentElement.dataset.strategyAAutoSessionContinuity406120 = "stopped";
    }
  }

  function scheduleRestore(reason) {
    const run = () => {
      try { requestAnimationFrame(() => requestAnimationFrame(() => restore(reason))); }
      catch (_) { queueMicrotask(() => restore(reason)); }
    };
    run();
  }

  document.addEventListener("click", captureOptIn, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => scheduleRestore("dom-ready"), { once: true });
  } else {
    scheduleRestore("boot");
  }
  window.addEventListener("load", () => scheduleRestore("load"), { once: true, passive: true });
  window.addEventListener("pageshow", () => scheduleRestore("pageshow"), { passive: true });
  window.addEventListener("erith:system-hydrated", () => scheduleRestore("system-hydrated"), { passive: true });

  globalThis[API_KEY] = Object.freeze({
    build: BUILD,
    storage: "sessionStorage",
    key: SESSION_KEY,
    opted_in: optedIn,
    restore,
    clear: () => setOptIn(false),
    snapshot: () => Object.freeze({
      build: BUILD,
      opted_in: optedIn(),
      active: state().active,
      restored_this_document: restoredThisDocument,
      last_restore: lastRestore
    }),
    contract: Object.freeze({
      paper_only: true,
      reuses_existing_runner: true,
      new_recurring_timer: false,
      new_market_fetch: false,
      real_order: false,
      wallet: false,
      credentials: false,
      local_storage_write: false,
      session_storage_write: true
    })
  });
})();
