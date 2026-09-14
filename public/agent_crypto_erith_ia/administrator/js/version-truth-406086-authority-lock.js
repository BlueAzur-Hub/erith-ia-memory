/* Agent-Crypto @erith.IA — historical compatibility shim.
   From Build 40.6.111 onward visible version semantics remain owned by
   js/version-truth.js. This shim only converges an unversioned canonical
   Administrator entry to the current published immutable build before the
   canonical owner starts. */
(() => {
  "use strict";
  const KEY = "__ERITH_VERSION_TRUTH_CANONICAL_LOADING__";
  if (globalThis.ErithVersionTruth?.owner === "version-truth" || globalThis[KEY]) return;
  globalThis[KEY] = true;

  const loadCanonicalOwner = () => {
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
  };

  const isUnversionedCanonicalEntry = () => {
    const params = new URLSearchParams(location.search || "");
    if (params.has("ac-build")) return false;
    const pathname = String(location.pathname || "");
    return /\/administrator\/(?:index\.html)?$/i.test(pathname);
  };

  const convergeCanonicalEntry = async () => {
    if (!isUnversionedCanonicalEntry()) return false;
    try {
      const response = await fetch(`./build.json?entry-convergence=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!response.ok) return false;
      const manifest = await response.json();
      const published = String(manifest?.build || "").trim();
      if (!/^\d+\.\d+\.\d+$/.test(published)) return false;

      const embedded = String(document.querySelector('meta[name="administrator-build"]')?.content || "").trim();
      if (published === embedded) return false;

      const immutable = new URL(`./index-${published}.html`, location.href);
      try {
        const probe = await fetch(`${immutable.href}?ac-probe=${published}-${Date.now()}`, {
          cache: "no-store",
          credentials: "same-origin"
        });
        if (probe.ok) {
          const html = await probe.text();
          const buildProof = new RegExp(`<meta\\s+name=["']administrator-build["']\\s+content=["']${published.replace(/\./g, "\\.")}["']`, "i").test(html);
          const engineProof = /<meta\s+name=["']atlas-engine-build["']\s+content=["']38\.15\.11["']/i.test(html);
          if (buildProof && engineProof) {
            immutable.searchParams.set("ac-refresh", `${published}-${Date.now()}`);
            location.replace(immutable.toString());
            return true;
          }
        }
      } catch (_) {}

      const fallback = new URL("./index.html", location.href);
      fallback.searchParams.set("ac-build", published);
      fallback.searchParams.set("ac-refresh", `${published}-${Date.now()}`);
      location.replace(fallback.toString());
      return true;
    } catch (_) {
      return false;
    }
  };

  void (async () => {
    if (await convergeCanonicalEntry()) return;
    loadCanonicalOwner();
  })();
})();