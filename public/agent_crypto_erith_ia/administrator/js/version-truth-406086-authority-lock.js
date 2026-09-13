/* Agent-Crypto @erith.IA — historical compatibility shim.
   The immutable Administrator documents created during the 40.6.86 era still
   reference this path. From Build 40.6.111 onward it owns no version logic.
   Its primary responsibility is to load the canonical stable owner:

     js/version-truth.js

   Build 40.6.119 also uses this bootstrap to attach one explicitly gated,
   read-side TRADUS autonomous refresh patch. It owns no trading decision.
*/
(() => {
  "use strict";

  const KEY = "__ERITH_VERSION_TRUTH_CANONICAL_LOADING__";
  const BUILD_RE = /^\d+\.\d+\.\d+$/;
  const parts = value => String(value || "").split(".").map(x => Number.parseInt(x, 10) || 0);
  const compare = (a, b) => {
    const A = parts(a), B = parts(b), n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i += 1) {
      const d = (A[i] || 0) - (B[i] || 0);
      if (d) return d;
    }
    return 0;
  };

  function activeBuild() {
    const entry = String(location.pathname || "").match(/(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i)?.[1];
    if (entry) return entry;
    const requested = String(new URLSearchParams(location.search || "").get("ac-build") || "").trim();
    if (BUILD_RE.test(requested)) return requested;
    return String(document.querySelector('meta[name="administrator-build"]')?.content || "UNKNOWN").trim();
  }

  function ensureReleasePatch() {
    const build = activeBuild();
    if (!BUILD_RE.test(build) || compare(build, "40.6.119") < 0) return false;
    if (globalThis.AgentCryptoTradusAutonomousRefresh406119) return true;
    if (document.querySelector('script[data-tradus-autonomous-refresh-406119="true"]')) return true;

    const patch = document.createElement("script");
    patch.src = `./js/tradus-autonomous-refresh-406119.js?v=${encodeURIComponent(build)}`;
    patch.async = false;
    patch.dataset.tradusAutonomousRefresh406119 = "true";
    document.head.appendChild(patch);
    return true;
  }

  if (globalThis.ErithVersionTruth?.owner === "version-truth") {
    ensureReleasePatch();
    return;
  }
  if (globalThis[KEY]) return;

  globalThis[KEY] = true;
  const script = document.createElement("script");
  script.src = "./js/version-truth.js?v=canonical-owner-2";
  script.async = false;
  script.dataset.versionTruthCompatibilityShim = "historical-406086-to-canonical";
  script.addEventListener("load", () => {
    globalThis[KEY] = false;
    ensureReleasePatch();
  }, { once: true });
  script.addEventListener("error", () => {
    globalThis[KEY] = false;
    const text = document.getElementById("atlasVersionTruthText");
    if (text) text.textContent = "Build ? · autorité version indisponible";
  }, { once: true });
  document.head.appendChild(script);
})();
