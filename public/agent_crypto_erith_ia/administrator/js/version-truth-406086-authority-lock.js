/* Agent-Crypto @erith.IA — compatibility bootstrap retained at the 40.6.86 path.
   40.6.87 repairs version ownership without rewriting the validated multi-megabyte document.
   The stable generic owner is version-truth-entry-authority-v2.js.
   No recurring timer. No observer. No storage write. */
(() => {
  "use strict";
  const KEY = "__ERITH_VERSION_TRUTH_ENTRY_AUTHORITY_V2_LOADING__";
  if (globalThis.ErithVersionTruth?.owner === "version-truth-entry-authority-v2" || globalThis[KEY]) return;
  globalThis[KEY] = true;
  const script = document.createElement("script");
  script.src = "./js/version-truth-entry-authority-v2.js?v=administrator-build-40.6.87";
  script.async = false;
  script.dataset.versionTruthCompatibilityBootstrap = "40.6.86-to-entry-authority-v2";
  script.addEventListener("load", () => { globalThis[KEY] = false; }, { once: true });
  script.addEventListener("error", () => {
    globalThis[KEY] = false;
    const text = document.getElementById("atlasVersionTruthText");
    if (text) text.textContent = "Build ? · autorité version indisponible";
  }, { once: true });
  document.head.appendChild(script);
})();
