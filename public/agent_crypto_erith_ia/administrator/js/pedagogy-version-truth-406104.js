/* Agent-Crypto @erith.IA — 40.6.104
   Pedagogy Version Truth.
   Reconciles the one reproduced stale interface build label inside the
   pedagogical journey without rewriting pedagogy business logic.
   One-shot/event-bounded only: no timer, observer, network, storage, trading or wallet. */
(() => {
  "use strict";
  const PATCH = "40.6.104";
  const ENTRY_RE = /(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i;
  const BUILD_RE = /^\d+\.\d+\.\d+$/;
  const params = new URLSearchParams(location.search || "");
  const entryBuild = String(location.pathname || "").match(ENTRY_RE)?.[1] || "";
  const requestedBuild = String(params.get("ac-build") || "").trim();
  const metaBuild = String(document.querySelector('meta[name="administrator-build"]')?.content || "").trim();
  const BUILD = String(globalThis.ErithVersionTruth?.build || entryBuild || (BUILD_RE.test(requestedBuild) ? requestedBuild : metaBuild) || "UNKNOWN").trim();
  const PEDAGOGY_RE = /Parcours pédagogique 28\.3\.44 actif · Interface \d+\.\d+\.\d+/g;
  const EXPECTED = BUILD_RE.test(BUILD) ? `Parcours pédagogique 28.3.44 actif · Interface ${BUILD}` : "";

  function normalizeText(value) {
    if (!EXPECTED || typeof value !== "string" || !value.includes("Parcours pédagogique 28.3.44 actif · Interface")) return value;
    return value.replace(PEDAGOGY_RE, EXPECTED);
  }

  function reconcile(root = document.body) {
    if (!root || !EXPECTED) return Object.freeze({ build: BUILD, matches: 0, changed: 0 });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let matches = 0;
    let changed = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const current = String(node.nodeValue || "");
      if (!current.includes("Parcours pédagogique 28.3.44 actif · Interface")) continue;
      matches += 1;
      const next = normalizeText(current);
      if (next !== current) {
        node.nodeValue = next;
        changed += 1;
      }
    }
    document.documentElement.dataset.pedagogyVersionTruth406104 = matches ? "active" : "not-found";
    document.documentElement.dataset.pedagogyVersionTruthBuild406104 = BUILD;
    document.documentElement.dataset.pedagogyVersionTruthMatches406104 = String(matches);
    document.documentElement.dataset.pedagogyVersionTruthChanged406104 = String(changed);
    return Object.freeze({ build: BUILD, matches, changed });
  }

  const run = () => { try { reconcile(); } catch (_) {} };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else queueMicrotask(run);
  window.addEventListener("erith:system-hydrated", run, { once: true, passive: true });
  window.addEventListener("load", run, { once: true, passive: true });

  globalThis.AgentCryptoPedagogyVersionTruth406104 = Object.freeze({
    patch: PATCH,
    build: BUILD,
    expected: EXPECTED,
    reconcile,
    normalizeText,
    recurring_timer: false,
    observer: false,
    network_owner: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();