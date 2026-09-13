/* Agent-Crypto @erith.IA — historical compatibility shim.
   The immutable Administrator documents created during the 40.6.86 era still
   reference this path. From Build 40.6.111 onward it owns no version logic.
   Its only responsibility is to load the canonical stable owner:

     js/version-truth.js

   Git carries historical implementations. No recurring timer, observer,
   storage write or business behavior. */
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
