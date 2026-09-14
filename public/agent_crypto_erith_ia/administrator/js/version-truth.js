/* Agent-Crypto Administrator — canonical Version Truth owner.
   build.json is the only release authority. The runtime graph is stable and is
   loaded by runtime-modules.js; no historical release comparison lives here. */
(() => {
  "use strict";

  const OWNER = "version-truth";
  const MANIFEST = "./build.json";
  const RUNTIME_REGISTRY = "./js/runtime-modules.js";
  const BUILD_RE = /^\d+\.\d+\.\d+$/;
  const MARKET_CORE = "38.15.11";

  const meta = name => String(document.querySelector(`meta[name="${name}"]`)?.content || "").trim();
  const setMeta = (name, value) => {
    let node = document.querySelector(`meta[name="${name}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.name = name;
      document.head.appendChild(node);
    }
    node.content = String(value ?? "");
  };
  const initialBuild = meta("agent-crypto-boot-build") || meta("administrator-build") || "UNKNOWN";
  let truth = null;
  let state = "booting";
  let busy = false;
  let runtimePromise = null;

  function validateManifest(value) {
    const build = String(value?.build || "").trim();
    const engine = String(value?.engine || value?.market_core_build || value?.market_core || "").trim();
    if (!BUILD_RE.test(build)) throw new Error("manifest build invalide");
    if (engine !== MARKET_CORE) throw new Error(`Market Core inattendu: ${engine || "absent"}`);
    return Object.freeze({ ...value, build, engine });
  }

  async function fetchManifest() {
    const response = await fetch(`${MANIFEST}?t=${Date.now()}`, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error(`build.json HTTP ${response.status}`);
    return validateManifest(await response.json());
  }

  function syncFooter(build, engine) {
    const footer = document.getElementById("footerRelease");
    if (!footer) return false;
    const current = String(footer.textContent || "").trim();
    let next = current
      .replace(/Administrator\s+\d+\.\d+\.\d+/gi, `Administrator ${build}`)
      .replace(/Build\s+\d+\.\d+\.\d+/gi, `Build ${build}`);
    if (next === current && !/\d+\.\d+\.\d+/.test(current)) next = `Agent-Crypto @erith.IA · Administrator ${build} · Market Core ${engine}`;
    footer.textContent = next;
    footer.dataset.versionTruthOwner = OWNER;
    footer.dataset.loadedBuild = build;
    return true;
  }

  function syncMirror(build) {
    const brand = document.querySelector(".admin-mirror-brand");
    if (!brand) return false;
    brand.innerHTML = `AGENT-CRYPTO <b>${build}</b> · ADMINISTRATOR`;
    brand.dataset.versionTruthOwner = OWNER;
    brand.dataset.loadedBuild = build;
    return true;
  }

  function applyTruth(value) {
    truth = validateManifest(value);
    const { build, engine } = truth;
    const release = String(truth.release || truth.release_status || "Administrator").trim();

    setMeta("administrator-build", build);
    setMeta("atlas-build", build);
    setMeta("atlas-engine-build", engine);
    setMeta("administrator-release", release);
    setMeta("agent-crypto-version-owner", "build.json");
    document.title = `Agent-Crypto @erith.IA — Build ${build} · Administrator`;

    globalThis.AGENT_CRYPTO_EMBEDDED_BUILD = initialBuild;
    globalThis.AGENT_CRYPTO_EFFECTIVE_BUILD = build;
    globalThis.AGENT_CRYPTO_BUILD = build;
    globalThis.ATLAS_ENGINE_BUILD = engine;

    document.documentElement.dataset.versionTruthBuild = build;
    document.documentElement.dataset.versionTruthPublished = build;
    document.documentElement.dataset.versionTruthState = state;
    document.documentElement.dataset.versionTruthAuthority = OWNER;
    document.documentElement.dataset.versionTruthSource = "build.json";
    syncFooter(build, engine);
    syncMirror(build);
    return truth;
  }

  function renderControl(mode = state, error = null) {
    const build = truth?.build || initialBuild;
    const control = document.getElementById("atlasVersionTruthControl");
    const text = control?.querySelector("#atlasVersionTruthText") || document.getElementById("atlasVersionTruthText");
    const label = mode === "checking" ? `Build ${build} · vérification…`
      : mode === "failed" ? `Build ${build} · vérité indisponible`
      : `Build ${build} · Administrator`;
    if (text) text.textContent = label;
    if (control) {
      control.dataset.versionTruthOwner = OWNER;
      control.dataset.loadedBuild = build;
      control.dataset.publishedBuild = truth?.build || build;
      control.dataset.versionTruthState = mode;
      control.disabled = mode === "checking";
      control.toggleAttribute("aria-busy", control.disabled);
      control.classList.toggle("warn", mode === "failed");
      control.classList.toggle("ok", mode !== "failed");
      control.title = error ? String(error?.message || error) : `Build ${build} · source build.json`;
    }
    document.documentElement.dataset.versionTruthState = mode;
  }

  function ensureRegistryScript() {
    if (globalThis.AgentCryptoRuntimeModules?.load) return Promise.resolve(globalThis.AgentCryptoRuntimeModules);
    if (runtimePromise) return runtimePromise;
    runtimePromise = new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find(script => {
        try { return script.src && new URL(script.src, document.baseURI).pathname.endsWith("/js/runtime-modules.js"); }
        catch (_) { return false; }
      });
      if (existing) {
        if (globalThis.AgentCryptoRuntimeModules?.load) return resolve(globalThis.AgentCryptoRuntimeModules);
        existing.addEventListener("load", () => resolve(globalThis.AgentCryptoRuntimeModules), { once: true });
        existing.addEventListener("error", () => reject(new Error("runtime-modules.js indisponible")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = RUNTIME_REGISTRY;
      script.async = false;
      script.dataset.agentCryptoRuntimeRegistry = "true";
      script.addEventListener("load", () => resolve(globalThis.AgentCryptoRuntimeModules), { once: true });
      script.addEventListener("error", () => reject(new Error("runtime-modules.js indisponible")), { once: true });
      document.head.appendChild(script);
    });
    return runtimePromise;
  }

  async function ensureRuntimeLayers() {
    const registry = await ensureRegistryScript();
    if (!registry?.load) throw new Error("registre runtime invalide");
    return registry.load(truth?.build || initialBuild);
  }

  async function check(show = false) {
    if (busy) return false;
    busy = true;
    if (show) { state = "checking"; renderControl(state); }
    try {
      const next = await fetchManifest();
      const changed = !!truth && next.build !== truth.build;
      state = "current";
      applyTruth(next);
      renderControl(state);
      if (changed) location.reload();
      return changed;
    } catch (error) {
      state = "failed";
      renderControl(state, error);
      console.error("[Version Truth]", error);
      return false;
    } finally {
      busy = false;
    }
  }

  async function init() {
    try {
      state = "checking";
      const manifest = await fetchManifest();
      state = "current";
      applyTruth(manifest);
      renderControl(state);
      await ensureRuntimeLayers();
      try {
        document.dispatchEvent(new CustomEvent("agent-crypto:version-truth-ready", { detail: { build: truth.build, engine: truth.engine } }));
        document.dispatchEvent(new CustomEvent("agent-crypto:runtime-layers-ready", { detail: { build: truth.build } }));
      } catch (_) {}
    } catch (error) {
      state = "failed";
      renderControl(state, error);
      console.error("[Version Truth init]", error);
    }
  }

  const control = document.getElementById("atlasVersionTruthControl");
  control?.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    void check(true);
  }, { capture: true });

  const syncVisibleTruth = () => {
    if (!truth) return false;
    syncFooter(truth.build, truth.engine);
    syncMirror(truth.build);
    return true;
  };
  const deferVisibleTruth = () => queueMicrotask(() => { try { syncVisibleTruth(); } catch (_) {} });
  window.addEventListener("erith:system-hydrated", deferVisibleTruth, { passive: true });
  document.addEventListener("agentcrypto:current-finalized", deferVisibleTruth, { passive: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", deferVisibleTruth, { once: true });
  window.addEventListener("load", deferVisibleTruth, { once: true, passive: true });
  window.addEventListener("pageshow", deferVisibleTruth, { passive: true });

  globalThis.ErithVersionTruth = Object.freeze({
    owner: OWNER,
    legacy_owner_alias: "version-truth-entry-authority-v3",
    get build() { return truth?.build || initialBuild; },
    engine: MARKET_CORE,
    manifest: MANIFEST,
    snapshot: () => Object.freeze({ loaded: truth?.build || initialBuild, published: truth?.build || initialBuild, state }),
    refresh: check,
    applyAvailableUpdate: async () => check(true),
    syncFooterTruth: () => truth ? syncFooter(truth.build, truth.engine) : false,
    syncMirrorTruth: () => truth ? syncMirror(truth.build) : false,
    syncVisibleTruth,
    ensureRuntimeLayers,
    source_demand_loader_generic: true,
    single_visible_owner: true,
    build_json_authority: true,
    version_branching: false,
    canonical_active_filename: "js/version-truth.js",
    recurring_timer: false,
    observer: false,
    storage_write: false
  });

  void init();
})();
