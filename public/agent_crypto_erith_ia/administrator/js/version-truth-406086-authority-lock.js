/* Agent-Crypto @erith.IA — historical compatibility shim.
   From Build 40.6.111 onward this file owns no version logic.
   It loads the canonical stable owner only. */
(() => {
  "use strict";
  const KEY = "__ERITH_VERSION_TRUTH_CANONICAL_LOADING__";
  if (globalThis.ErithVersionTruth?.owner === "version-truth" || globalThis[KEY]) return;
  globalThis[KEY] = true;
  const script = document.createElement("script");
  script.src = "./js/version-truth.js?v=canonical-owner-1";
  script.async = false;
  script.dataset.versionTruthCompatibilityShim = "historical-406086-to-canonical";
  script.addEventListener("load", () => { globalThis[KEY] = false; }, { once: true });
  script.addEventListener("error", () => {
    globalThis[KEY] = false;
    const text = document.getElementById("atlasVersionTruthText");
    if (text) text.textContent = "Build ? · autorité version indisponible";
  }, { once: true });
  document.head.appendChild(script);
})();
