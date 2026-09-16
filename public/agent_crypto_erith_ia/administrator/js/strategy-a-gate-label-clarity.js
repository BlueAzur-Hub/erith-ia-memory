/* Agent-Crypto @erith.IA — 40.6.184 GATE LABEL CLARITY
   Presentation-only readability layer for Strategy A Evidence Dossier.
   Visible standalone G1..G9 labels become GATE 1..GATE 9.
   Internal IDs, object keys, gate numbers, certification states and business logic are untouched.
   No timer, MutationObserver, storage, network, exchange or order path. */
(() => {
  "use strict";

  const BUILD = "40.6.184";
  const ROOT_ID = "strategyADossier";
  const LABEL_RE = /\bG([1-9])\b/g;
  let applyCount = 0;
  let replacementCount = 0;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;

  function normalizeText(text = "") {
    return String(text).replace(LABEL_RE, (_, n) => `GATE ${n}`);
  }

  function apply() {
    applyCount += 1;
    if (typeof document === "undefined") return { applied:false, reason:"NO_DOCUMENT" };
    const root = byId(ROOT_ID);
    if (!root) return { applied:false, reason:"DOSSIER_UNAVAILABLE", apply_count:applyCount };

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    let changed = 0;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(parent.tagName)) continue;
      const before = node.nodeValue || "";
      const after = normalizeText(before);
      if (after !== before) {
        node.nodeValue = after;
        changed += 1;
      }
    }

    replacementCount += changed;
    root.dataset.gateLabelClarityBuild = BUILD;
    root.dataset.gateLabelClarity = "GATE_WORD_VISIBLE_ONLY";
    return {
      applied: true,
      build: BUILD,
      changed_text_nodes: changed,
      apply_count: applyCount,
      replacement_count: replacementCount,
      internal_gate_keys_modified: false,
      ids_modified: false,
      business_logic_modified: false,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      real_order: false,
      paper_only: true
    };
  }

  function schedule() {
    try { queueMicrotask(apply); } catch (_) { apply(); }
  }

  globalThis.AgentCryptoStrategyAGateLabelClarity = Object.freeze({
    build: BUILD,
    owner: "strategy-a-gate-label-clarity",
    root_id: ROOT_ID,
    apply,
    normalize_text: normalizeText,
    snapshot: () => ({
      build: BUILD,
      root_present: !!byId(ROOT_ID),
      apply_count: applyCount,
      replacement_count: replacementCount,
      display_contract: "G1..G9 => GATE 1..GATE 9",
      internal_gate_keys_modified: false,
      ids_modified: false,
      business_logic_modified: false,
      recurring_timer: false,
      observer: false,
      storage_write: false,
      network: false,
      real_order: false,
      paper_only: true
    })
  });

  document.addEventListener("agent-crypto:evidence-view-refreshed", schedule);
  document.addEventListener("agent-crypto:evidence-data-changed", schedule);
  document.addEventListener("agent-crypto:runtime-modules-ready", schedule, { once:true });
  window.addEventListener("pageshow", schedule);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once:true });
    window.addEventListener("load", schedule, { once:true });
  } else {
    schedule();
  }
})();
