/* Agent-Crypto @erith.IA — historical compatibility shim.
   Immutable Administrator documents still reference this path.
   It owns no global build/version truth: that remains js/version-truth.js.

   From Build 40.6.112 onward, once the canonical Version Truth owner has
   resolved the loaded build, this shim also performs one bounded presentation
   handoff to the canonical local-dialogue presentation owner:

     js/local-dialogue-presentation.js

   No recurring timer, observer, storage write, network market request or
   business behavior is added here. Git carries historical implementations. */
(() => {
  "use strict";

  const KEY = "__ERITH_VERSION_TRUTH_CANONICAL_LOADING__";
  const PRESENTATION_KEY = "__ERITH_LOCAL_DIALOGUE_PRESENTATION_LOADING__";

  const parts = value => String(value || "").split(".").map(x => Number.parseInt(x, 10) || 0);
  const atLeast = (value, target) => {
    const A = parts(value), B = parts(target), n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i += 1) {
      const d = (A[i] || 0) - (B[i] || 0);
      if (d) return d > 0;
    }
    return true;
  };

  function ensureLocalDialoguePresentation() {
    const build = String(globalThis.ErithVersionTruth?.build || "").trim();
    if (!atLeast(build, "40.6.112")) return false;
    if (globalThis.AgentCryptoLocalDialoguePresentation?.owner === "local-dialogue-presentation") return true;
    if (globalThis[PRESENTATION_KEY] || document.querySelector('script[data-local-dialogue-presentation-canonical="true"]')) return true;

    globalThis[PRESENTATION_KEY] = true;
    const patch = document.createElement("script");
    patch.src = `./js/local-dialogue-presentation.js?v=${encodeURIComponent(build)}`;
    patch.async = false;
    patch.dataset.localDialoguePresentationCanonical = "true";
    patch.addEventListener("load", () => { globalThis[PRESENTATION_KEY] = false; }, { once: true });
    patch.addEventListener("error", () => { globalThis[PRESENTATION_KEY] = false; }, { once: true });
    document.head.appendChild(patch);
    return true;
  }

  if (globalThis.ErithVersionTruth?.owner === "version-truth") {
    ensureLocalDialoguePresentation();
    return;
  }
  if (globalThis[KEY]) return;

  globalThis[KEY] = true;
  const script = document.createElement("script");
  script.src = "./js/version-truth.js?v=canonical-owner-1";
  script.async = false;
  script.dataset.versionTruthCompatibilityShim = "historical-406086-to-canonical";
  script.addEventListener("load", () => {
    globalThis[KEY] = false;
    ensureLocalDialoguePresentation();
  }, { once: true });
  script.addEventListener("error", () => {
    globalThis[KEY] = false;
    const text = document.getElementById("atlasVersionTruthText");
    if (text) text.textContent = "Build ? · autorité version indisponible";
  }, { once: true });
  document.head.appendChild(script);
})();
