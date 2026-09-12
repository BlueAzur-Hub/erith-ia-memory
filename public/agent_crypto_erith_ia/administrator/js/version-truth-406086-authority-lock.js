/* Agent-Crypto @erith.IA — compatibility bootstrap retained at the historical 40.6.86 path.
   40.6.93 advances the stable generic owner to Version Truth Entry Authority V3.
   40.6.103 adds a gated generated-report truth patch after the V3 owner is ready.
   40.6.104 adds a gated pedagogy truth patch for the reproduced stale interface label.
   40.6.105 adds a gated TRADUS/Strategy A read-side comparison reconciliation.
   The path stays stable so validated index entries do not need document rewrites.
   No recurring timer. No observer. No storage write. */
(() => {
  "use strict";
  const KEY = "__ERITH_VERSION_TRUTH_ENTRY_AUTHORITY_V3_LOADING__";
  if (globalThis.ErithVersionTruth?.owner === "version-truth-entry-authority-v3" || globalThis[KEY]) return;
  globalThis[KEY] = true;
  const script = document.createElement("script");
  script.src = "./js/version-truth-entry-authority-v3.js?v=entry-authority-v3-1";
  script.async = false;
  script.dataset.versionTruthCompatibilityBootstrap = "40.6.86-to-entry-authority-v3";
  script.addEventListener("load", () => { globalThis[KEY] = false; }, { once: true });
  script.addEventListener("load", () => {
    const build = String(globalThis.ErithVersionTruth?.build || "").trim();
    const parts = value => String(value || "").split(".").map(part => Number.parseInt(part, 10) || 0);
    const atLeast = target => {
      const a = parts(build), b = parts(target), n = Math.max(a.length, b.length);
      for (let i = 0; i < n; i += 1) {
        const delta = (a[i] || 0) - (b[i] || 0);
        if (delta) return delta > 0;
      }
      return true;
    };

    const loadPatch = (selector, src, datasetName) => {
      if (document.querySelector(selector)) return;
      const patch = document.createElement("script");
      patch.src = src;
      patch.async = false;
      patch.dataset[datasetName] = "true";
      document.head.appendChild(patch);
    };

    if (atLeast("40.6.103") && globalThis.AgentCryptoGeneratedReportVersionTruth406103?.build !== build) {
      loadPatch(
        'script[data-generated-report-version-truth-406103="true"]',
        `./js/generated-report-version-truth-406103.js?v=generated-report-version-truth-${encodeURIComponent(build)}`,
        "generatedReportVersionTruth406103"
      );
    }

    if (atLeast("40.6.104") && globalThis.AgentCryptoPedagogyVersionTruth406104?.build !== build) {
      loadPatch(
        'script[data-pedagogy-version-truth-406104="true"]',
        `./js/pedagogy-version-truth-406104.js?v=pedagogy-version-truth-${encodeURIComponent(build)}`,
        "pedagogyVersionTruth406104"
      );
    }

    if (atLeast("40.6.105") && !globalThis.AgentCryptoTradusStrategyReconcile406105) {
      loadPatch(
        'script[data-tradus-strategy-reconcile-406105="true"]',
        `./js/tradus-strategy-a-reconcile-406105.js?v=tradus-strategy-reconcile-${encodeURIComponent(build)}`,
        "tradusStrategyReconcile406105"
      );
    }
  }, { once: true });
  script.addEventListener("error", () => {
    globalThis[KEY] = false;
    const text = document.getElementById("atlasVersionTruthText");
    if (text) text.textContent = "Build ? · autorité version indisponible";
  }, { once: true });
  document.head.appendChild(script);
})();