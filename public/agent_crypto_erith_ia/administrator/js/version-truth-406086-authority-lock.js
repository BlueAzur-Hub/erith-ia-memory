/* Agent-Crypto @erith.IA — compatibility bootstrap retained at the historical 40.6.86 path.
   40.6.93 advances the stable generic owner to Version Truth Entry Authority V3.
   40.6.103 adds a gated generated-report truth patch after the V3 owner is ready.
   40.6.104 adds a gated pedagogy truth patch for the reproduced stale interface label.
   40.6.105 adds a gated TRADUS/Strategy A read-side comparison reconciliation.
   40.6.106 extends the existing local-AI deterministic comment truth guard.
   40.6.107 closes residual current-runtime version leaks in Auto Reader/footer surfaces.
   40.6.108 improves local Atlas/Aerith dialogue readability and separates market-snapshot time from CURRENT production time.
   40.6.109 separates price/volume evidence and requires 4/4 Math measures before rejecting a correct reserve.
   40.6.110 makes unknown Strategy A fail closed in TRADUS comparison.
   40.6.111 fail-closes stale/unknown DEX observations and verifies pending-before-REPOS Aether truth.
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
      loadPatch('script[data-generated-report-version-truth-406103="true"]',`./js/generated-report-version-truth-406103.js?v=generated-report-version-truth-${encodeURIComponent(build)}`,"generatedReportVersionTruth406103");
    }
    if (atLeast("40.6.104") && globalThis.AgentCryptoPedagogyVersionTruth406104?.build !== build) {
      loadPatch('script[data-pedagogy-version-truth-406104="true"]',`./js/pedagogy-version-truth-406104.js?v=pedagogy-version-truth-${encodeURIComponent(build)}`,"pedagogyVersionTruth406104");
    }
    if (atLeast("40.6.105") && !globalThis.AgentCryptoTradusStrategyReconcile406105) {
      loadPatch('script[data-tradus-strategy-reconcile-406105="true"]',`./js/tradus-strategy-a-reconcile-406105.js?v=tradus-strategy-reconcile-${encodeURIComponent(build)}`,"tradusStrategyReconcile406105");
    }
    if (atLeast("40.6.106") && !globalThis.AgentCryptoLocalAIContractConsistency406106) {
      loadPatch('script[data-local-ai-contract-consistency-406106="true"]',`./js/local-ai-contract-consistency-406106.js?v=local-ai-contract-consistency-${encodeURIComponent(build)}`,"localAiContractConsistency406106");
    }
    if (atLeast("40.6.107") && !globalThis.AgentCryptoVisibleVersionSurfaceTruth406107) {
      loadPatch('script[data-visible-version-surface-truth-406107="true"]',`./js/visible-version-surface-truth-406107.js?v=visible-version-surface-truth-${encodeURIComponent(build)}`,"visibleVersionSurfaceTruth406107");
    }
    if (atLeast("40.6.108") && !globalThis.AgentCryptoLocalDialoguePresentation406108) {
      loadPatch('script[data-local-dialogue-presentation-406108="true"]',`./js/local-dialogue-presentation-406108.js?v=local-dialogue-presentation-${encodeURIComponent(build)}`,"localDialoguePresentation406108");
    }
    if (atLeast("40.6.109") && !globalThis.AgentCryptoLocalAIReserveTruth406109) {
      loadPatch('script[data-local-ai-reserve-truth-406109="true"]',`./js/local-ai-reserve-truth-406109.js?v=local-ai-reserve-truth-${encodeURIComponent(build)}`,"localAiReserveTruth406109");
    }
    if (atLeast("40.6.110") && !globalThis.AgentCryptoTradusStrategyAFailClosed406110) {
      loadPatch('script[data-tradus-strategy-a-fail-closed-406110="true"]',`./js/tradus-strategy-a-fail-closed-406110.js?v=tradus-strategy-a-fail-closed-${encodeURIComponent(build)}`,"tradusStrategyAFailClosed406110");
    }
    if (atLeast("40.6.111") && !globalThis.AgentCryptoDexAetherFreshnessTruth406111) {
      loadPatch('script[data-dex-aether-freshness-truth-406111="true"]',`./js/dex-aether-freshness-truth-406111.js?v=dex-aether-freshness-truth-${encodeURIComponent(build)}`,"dexAetherFreshnessTruth406111");
    }
  }, { once: true });
  script.addEventListener("error", () => {
    globalThis[KEY] = false;
    const text = document.getElementById("atlasVersionTruthText");
    if (text) text.textContent = "Build ? · autorité version indisponible";
  }, { once: true });
  document.head.appendChild(script);
})();
