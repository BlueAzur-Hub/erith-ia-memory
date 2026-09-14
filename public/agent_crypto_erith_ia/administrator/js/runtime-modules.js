/* Agent-Crypto Administrator — stable runtime module registry.
   The release number never selects modules here. Git carries history; this file
   describes the one runtime graph that is current. */
(() => {
  "use strict";

  if (globalThis.AgentCryptoRuntimeModules) return;

  const MODULES = Object.freeze([
    "./js/views/private-source-demand-loader.js",
    "./js/generated-report-version-truth-406103.js",
    "./js/pedagogy-version-truth-406104.js",
    "./js/tradus-strategy-a-reconcile-406105.js",
    "./js/local-ai-contract-consistency-406106.js",
    "./js/visible-version-surface-truth-406107.js",
    "./js/local-dialogue-presentation-406108.js",
    "./js/local-ai-contract-consistency.js",
    "./js/tradus-strategy-a-reconcile.js",
    "./js/dex-freshness-guard.js",
    "./js/tradus-canonical-strategy-reader-406123.js",
    "./js/strategy-a-auto-owner-autostart-406124.js",
    "./js/tradus-autonomous-refresh-406119.js"
  ]);

  const loaded = new Set();
  let loading = null;

  function absolute(src) {
    return new URL(src, document.baseURI).href;
  }

  function alreadyPresent(src) {
    const wanted = absolute(src);
    return Array.from(document.scripts).some(script => {
      try { return script.src && new URL(script.src, document.baseURI).href.split("?")[0] === wanted.split("?")[0]; }
      catch (_) { return false; }
    });
  }

  function loadOne(src, token) {
    if (loaded.has(src) || alreadyPresent(src)) {
      loaded.add(src);
      return Promise.resolve(src);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const url = new URL(src, document.baseURI);
      if (token) url.searchParams.set("v", token);
      script.src = url.href;
      script.async = false;
      script.dataset.agentCryptoRuntimeModule = src;
      script.addEventListener("load", () => { loaded.add(src); resolve(src); }, { once: true });
      script.addEventListener("error", () => reject(new Error(`runtime module failed: ${src}`)), { once: true });
      document.head.appendChild(script);
    });
  }

  async function load(build = "") {
    if (loading) return loading;
    const token = build ? `administrator-build-${build}` : "administrator-runtime";
    loading = (async () => {
      for (const src of MODULES) await loadOne(src, token);
      try {
        document.dispatchEvent(new CustomEvent("agent-crypto:runtime-modules-ready", {
          detail: { build, modules: MODULES.slice() }
        }));
      } catch (_) {}
      return MODULES.slice();
    })();
    try { return await loading; }
    finally { loading = null; }
  }

  globalThis.AgentCryptoRuntimeModules = Object.freeze({
    modules: MODULES,
    load,
    loaded: () => Object.freeze(Array.from(loaded)),
    version_branching: false,
    owner: "runtime-modules"
  });
})();
