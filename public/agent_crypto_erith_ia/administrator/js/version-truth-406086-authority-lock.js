/* Legacy compatibility alias only.
   Historical immutable entries still reference this filename. It no longer owns,
   writes, compares or hardcodes any release truth. */
(() => {
  "use strict";
  const api = Object.freeze({
    legacy: true,
    logic_owner: false,
    authority: "build.json -> js/version-truth.js",
    ready: () => Promise.resolve(globalThis.ErithVersionTruth || null)
  });
  globalThis.AgentCryptoVersionTruthAuthority406086 = api;
})();
