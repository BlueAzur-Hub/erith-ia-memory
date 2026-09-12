/* Agent-Crypto @erith.IA — compatibility bootstrap retained at the historical 40.6.86 path.
   40.6.93 advances the stable generic owner to Version Truth Entry Authority V3.
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
  script.addEventListener("error", () => {
    globalThis[KEY] = false;
    const text = document.getElementById("atlasVersionTruthText");
    if (text) text.textContent = "Build ? · autorité version indisponible";
  }, { once: true });
  document.head.appendChild(script);
})();
