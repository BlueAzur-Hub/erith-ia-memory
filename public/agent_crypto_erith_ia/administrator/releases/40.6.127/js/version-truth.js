/* Agent-Crypto Administrator — update control, not runtime authority.
   Loaded build = immutable release entry.
   Published build = build.json.
   The checker never rewrites the loaded build and never reloads a current build. */
(() => {
  "use strict";

  const OWNER = "version-truth";
  const RUNTIME_REGISTRY = "./js/runtime-modules.js";
  const BUILD_RE = /^\d+\.\d+\.\d+$/;

  const meta = name => String(document.querySelector(`meta[name="${name}"]`)?.content || "").trim();
  const bootTruth = globalThis.AgentCryptoBootTruth || {};
  const loadedBuild = String(bootTruth.loaded_build || bootTruth.build || meta("agent-crypto-loaded-build") || meta("agent-crypto-boot-build") || "").trim();
  const engine = String(bootTruth.engine || meta("atlas-engine-build") || "").trim();
  const MANIFEST = meta("agent-crypto-published-manifest") || "./build.json";

  let publishedTruth = null;
  let state = "checking";
  let busy = false;
  let runtimePromise = null;

  function assertLoadedBuild() {
    if (!BUILD_RE.test(loadedBuild)) throw new Error("loaded build invalide");
    return loadedBuild;
  }

  function validateManifest(value) {
    const build = String(value?.build || "").trim();
    if (!BUILD_RE.test(build)) throw new Error("published build invalide");
    return Object.freeze({ ...value, build });
  }

  function buildTuple(value) {
    return String(value).split(".").map(n => Number.parseInt(n, 10));
  }

  function compareBuilds(a, b) {
    const aa = buildTuple(a);
    const bb = buildTuple(b);
    for (let i = 0; i < Math.max(aa.length, bb.length); i += 1) {
      const x = aa[i] || 0;
      const y = bb[i] || 0;
      if (x > y) return 1;
      if (x < y) return -1;
    }
    return 0;
  }

  async function fetchManifest() {
    const separator = MANIFEST.includes("?") ? "&" : "?";
    const response = await fetch(`${MANIFEST}${separator}t=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!response.ok) throw new Error(`build.json HTTP ${response.status}`);
    return validateManifest(await response.json());
  }

  function versionControl() {
    return document.getElementById("atlasVersionTruthControl");
  }

  function versionText() {
    return document.getElementById("atlasVersionTruthText");
  }

  function render() {
    const control = versionControl();
    const text = versionText();
    const publishedBuild = publishedTruth?.build || "";
    const available = state === "available" && BUILD_RE.test(publishedBuild);

    if (text) {
      text.textContent = available
        ? `Build ${loadedBuild} · ${publishedBuild} disponible`
        : `Build ${loadedBuild} · Administrator`;
    }

    if (control) {
      control.dataset.versionTruthOwner = OWNER;
      control.dataset.loadedBuild = loadedBuild;
      control.dataset.publishedBuild = publishedBuild;
      control.dataset.versionTruthState = state;
      control.disabled = !available;
      control.toggleAttribute("aria-busy", state === "checking");
      control.classList.toggle("warn", available);
      control.classList.toggle("ok", !available);
      control.setAttribute("aria-label", available
        ? `Build ${loadedBuild} chargée. Build ${publishedBuild} disponible. Cliquer pour mettre à jour.`
        : `Build ${loadedBuild} chargée.`);
      control.title = available
        ? `Nouvelle version disponible : ${publishedBuild}`
        : state === "check-failed"
          ? `Build ${loadedBuild} chargée · contrôle de mise à jour indisponible`
          : `Build ${loadedBuild} chargée`;
    }

    document.documentElement.dataset.versionTruthBuild = loadedBuild;
    document.documentElement.dataset.versionTruthPublished = publishedBuild;
    document.documentElement.dataset.versionTruthState = state;
    document.documentElement.dataset.versionTruthAuthority = OWNER;
    document.documentElement.dataset.versionTruthSource = "release-entry+build.json";
    document.documentElement.dataset.versionLoadedBuild = loadedBuild;
    document.documentElement.dataset.versionPublishedBuild = publishedBuild;
    document.documentElement.dataset.versionUpdateState = state;
  }

  function manifestBaseUrl() {
    return new URL(MANIFEST, document.baseURI);
  }

  function publishedEntry(manifest) {
    const explicit = String(manifest?.entry || manifest?.published_entry || manifest?.release_entry || "").trim();
    const base = manifestBaseUrl();
    if (explicit) return new URL(explicit, base);

    /* From the next genuine release onward, immutable releases live under
       administrator/releases/<build>/. build.json is flipped only after that
       directory is fully published and verified. */
    return new URL(`./releases/${manifest.build}/`, base);
  }

  async function preflightRelease(manifest) {
    const target = publishedEntry(manifest);
    target.searchParams.set("preflight", String(Date.now()));
    const response = await fetch(target.href, {
      cache: "no-store",
      credentials: "same-origin",
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`release ${manifest.build} indisponible: HTTP ${response.status}`);
    return publishedEntry(manifest);
  }

  async function navigateToPublished() {
    if (busy || state !== "available" || !publishedTruth) return false;
    busy = true;
    const control = versionControl();
    control?.setAttribute("aria-busy", "true");
    try {
      const target = await preflightRelease(publishedTruth);
      target.searchParams.set("from", loadedBuild);
      target.searchParams.set("t", String(Date.now()));
      location.assign(target.href);
      return true;
    } catch (error) {
      console.error("[Version Update]", error);
      state = "check-failed";
      render();
      return false;
    } finally {
      busy = false;
      control?.removeAttribute("aria-busy");
    }
  }

  async function refresh() {
    if (busy) return false;
    busy = true;
    try {
      const next = await fetchManifest();
      publishedTruth = next;
      state = compareBuilds(next.build, loadedBuild) > 0 ? "available" : "current";
      render();
      return state === "available";
    } catch (error) {
      console.error("[Version Update]", error);
      state = "check-failed";
      render();
      return false;
    } finally {
      busy = false;
    }
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
      script.src = `${RUNTIME_REGISTRY}?release=${encodeURIComponent(loadedBuild)}&t=${Date.now()}`;
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
    return registry.load();
  }

  function startRuntimeIndependently() {
    void ensureRuntimeLayers().then(() => {
      try {
        document.dispatchEvent(new CustomEvent("agent-crypto:runtime-layers-ready", {
          detail: { modules: globalThis.AgentCryptoRuntimeModules?.modules || [] }
        }));
      } catch (_) {}
    }).catch(error => console.error("[Runtime Layers]", error));
  }

  function init() {
    assertLoadedBuild();

    /* Loaded identity is fixed before any update check. Update failure cannot
       block the application and cannot turn into a fake build number. */
    globalThis.AGENT_CRYPTO_EMBEDDED_BUILD = loadedBuild;
    globalThis.AGENT_CRYPTO_EFFECTIVE_BUILD = loadedBuild;
    globalThis.AGENT_CRYPTO_BUILD = loadedBuild;
    if (engine) globalThis.ATLAS_ENGINE_BUILD = engine;

    render();
    startRuntimeIndependently();
    void refresh().finally(() => {
      try {
        document.dispatchEvent(new CustomEvent("agent-crypto:version-truth-ready", {
          detail: {
            build: loadedBuild,
            loaded: loadedBuild,
            published: publishedTruth?.build || null,
            engine,
            state
          }
        }));
      } catch (_) {}
    });
  }

  versionControl()?.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    if (state === "available") void navigateToPublished();
  }, { capture: true });

  const noWriteCompatibilitySync = () => true;

  globalThis.ErithVersionTruth = Object.freeze({
    owner: OWNER,
    get build() { return loadedBuild; },
    get publishedBuild() { return publishedTruth?.build || null; },
    engine,
    manifest: MANIFEST,
    snapshot: () => Object.freeze({
      loaded: loadedBuild,
      published: publishedTruth?.build || null,
      state
    }),
    refresh,
    navigateToPublished,
    ensureRuntimeLayers,
    syncFooterTruth: noWriteCompatibilitySync,
    syncMirrorTruth: noWriteCompatibilitySync,
    syncVisibleTruth: noWriteCompatibilitySync,
    single_visible_owner: true,
    build_json_authority: false,
    version_branching: false,
    versioned_runtime_filenames: false,
    canonical_active_filename: "js/version-truth.js",
    loaded_build_authority: "release-entry",
    published_build_authority: "build.json",
    reload_current_build: false,
    recurring_timer: false,
    observer: false,
    storage_write: false
  });

  try { init(); }
  catch (error) {
    console.error("[Version Update init]", error);
    state = "check-failed";
    render();
    startRuntimeIndependently();
  }
})();
