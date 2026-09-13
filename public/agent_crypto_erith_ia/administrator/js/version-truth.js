/* Agent-Crypto @erith.IA — canonical Version Truth owner.
   Active canonical filename from Build 40.6.111.
   Git carries history; the active owner filename does not carry a build number.

   Loaded-build authority:
   1. immutable pathname index-X.Y.Z.html;
   2. explicit ac-build handoff on canonical index.html;
   3. embedded metadata only as legacy fallback.

   Published-build authority: build.json.
   No recurring timer. No observer. No storage write. */
(() => {
  "use strict";

  const ENGINE = "38.15.11";
  const OWNER = "version-truth";
  const MANIFEST = "./build.json";
  const REFRESH_PARAM = "ac-refresh";
  const BUILD_PARAM = "ac-build";
  const ENTRY_RE = /(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i;
  const BUILD_RE = /^\d+\.\d+\.\d+$/;
  const meta = name => String(document.querySelector(`meta[name="${name}"]`)?.content || "").trim();
  const entryMatch = String(location.pathname || "").match(ENTRY_RE);
  const params = new URLSearchParams(location.search || "");
  const requestedBuild = String(params.get(BUILD_PARAM) || "").trim();
  const embeddedBuild = meta("administrator-build") || meta("atlas-build") || "UNKNOWN";
  const BUILD = String(entryMatch?.[1] || (BUILD_RE.test(requestedBuild) ? requestedBuild : embeddedBuild) || "UNKNOWN").trim();
  const parts = value => String(value || "").split(".").map(x => Number.parseInt(x, 10) || 0);
  const compare = (a, b) => {
    const A = parts(a), B = parts(b), n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i += 1) {
      const d = (A[i] || 0) - (B[i] || 0);
      if (d) return d;
    }
    return 0;
  };
  const atLeast = target => compare(BUILD, target) >= 0;

  const forceMetaTruth = () => {
    const admin = document.querySelector('meta[name="administrator-build"]');
    const atlas = document.querySelector('meta[name="atlas-build"]');
    const engine = document.querySelector('meta[name="atlas-engine-build"]');
    if (admin) admin.content = BUILD;
    if (atlas) atlas.content = BUILD;
    if (engine && !String(engine.content || "").trim()) engine.content = ENGINE;
    if (/Build\s+\d+\.\d+\.\d+/i.test(document.title)) {
      document.title = document.title.replace(/Build\s+\d+\.\d+\.\d+/i, `Build ${BUILD}`);
    }
  };

  const syncFooterTruth = () => {
    const footer = document.getElementById("footerRelease");
    if (!footer) return false;
    const current = String(footer.textContent || "").trim();
    let next = current;
    next = next.replace(/Administrator\s+\d+\.\d+\.\d+/gi, `Administrator ${BUILD}`);
    next = next.replace(/Build\s+\d+\.\d+\.\d+/gi, `Build ${BUILD}`);
    if (next === current && !/\d+\.\d+\.\d+/.test(current)) {
      next = `Agent-Crypto @erith.IA · Administrator ${BUILD} · Market Core ${ENGINE}`;
    }
    footer.textContent = next;
    footer.dataset.versionTruthOwner = OWNER;
    footer.dataset.loadedBuild = BUILD;
    return true;
  };

  const syncMirrorTruth = () => {
    const brand = document.querySelector(".admin-mirror-brand");
    if (!brand) return false;
    brand.innerHTML = `AGENT-CRYPTO <b>${BUILD}</b> · ADMINISTRATOR`;
    brand.dataset.versionTruthOwner = OWNER;
    brand.dataset.loadedBuild = BUILD;
    return true;
  };

  const syncVisibleTruth = () => {
    forceMetaTruth();
    const footer = syncFooterTruth();
    const mirror = syncMirrorTruth();
    return footer || mirror;
  };

  const deferVisibleTruth = () => queueMicrotask(() => {
    try { syncVisibleTruth(); } catch (_) {}
  });

  const ensureSourceDemandLoader = () => {
    if (typeof globalThis.ErithPrivateSourceDemand?.ensure === "function") return true;
    if (typeof globalThis.ErithPrivateSourceDemand40486?.ensure === "function") return true;
    if (document.querySelector('script[data-version-truth-source-loader="true"]')) return true;
    const script = document.createElement("script");
    script.src = `./js/views/private-source-demand-loader.js?v=version-truth-${encodeURIComponent(BUILD)}`;
    script.async = false;
    script.dataset.versionTruthSourceLoader = "true";
    document.head.appendChild(script);
    return true;
  };

  const loadPatch = (selector, src, datasetName) => {
    if (document.querySelector(selector)) return false;
    const patch = document.createElement("script");
    patch.src = src;
    patch.async = false;
    patch.dataset[datasetName] = "true";
    document.head.appendChild(patch);
    return true;
  };

  const ensureRuntimeLayers = () => {
    // Historical compatibility layers remain readable for older immutable entries.
    if (atLeast("40.6.103") && globalThis.AgentCryptoGeneratedReportVersionTruth406103?.build !== BUILD) {
      loadPatch('script[data-generated-report-version-truth-406103="true"]', `./js/generated-report-version-truth-406103.js?v=${encodeURIComponent(BUILD)}`, "generatedReportVersionTruth406103");
    }
    if (atLeast("40.6.104") && globalThis.AgentCryptoPedagogyVersionTruth406104?.build !== BUILD) {
      loadPatch('script[data-pedagogy-version-truth-406104="true"]', `./js/pedagogy-version-truth-406104.js?v=${encodeURIComponent(BUILD)}`, "pedagogyVersionTruth406104");
    }
    if (atLeast("40.6.105") && !globalThis.AgentCryptoTradusStrategyReconcile406105) {
      loadPatch('script[data-tradus-strategy-reconcile-406105="true"]', `./js/tradus-strategy-a-reconcile-406105.js?v=${encodeURIComponent(BUILD)}`, "tradusStrategyReconcile406105");
    }
    if (atLeast("40.6.106") && !globalThis.AgentCryptoLocalAIContractConsistency406106) {
      loadPatch('script[data-local-ai-contract-consistency-406106="true"]', `./js/local-ai-contract-consistency-406106.js?v=${encodeURIComponent(BUILD)}`, "localAiContractConsistency406106");
    }
    if (atLeast("40.6.107") && !globalThis.AgentCryptoVisibleVersionSurfaceTruth406107) {
      loadPatch('script[data-visible-version-surface-truth-406107="true"]', `./js/visible-version-surface-truth-406107.js?v=${encodeURIComponent(BUILD)}`, "visibleVersionSurfaceTruth406107");
    }
    if (atLeast("40.6.108") && !globalThis.AgentCryptoLocalDialoguePresentation406108) {
      loadPatch('script[data-local-dialogue-presentation-406108="true"]', `./js/local-dialogue-presentation-406108.js?v=${encodeURIComponent(BUILD)}`, "localDialoguePresentation406108");
    }

    // Canonical functional owners from 40.6.109 onward.
    if (atLeast("40.6.109") && !globalThis.AgentCryptoLocalAIReserveTruth) {
      loadPatch('script[data-local-ai-contract-consistency="true"]', `./js/local-ai-contract-consistency.js?v=${encodeURIComponent(BUILD)}`, "localAiContractConsistency");
    }
    if (atLeast("40.6.110") && !globalThis.AgentCryptoTradusStrategyFailClosed) {
      loadPatch('script[data-tradus-strategy-a-reconcile="true"]', `./js/tradus-strategy-a-reconcile.js?v=${encodeURIComponent(BUILD)}`, "tradusStrategyAReconcile");
    }
    if (atLeast("40.6.111") && !globalThis.AgentCryptoDexFreshnessGuard) {
      loadPatch('script[data-dex-freshness-guard="true"]', `./js/dex-freshness-guard.js?v=${encodeURIComponent(BUILD)}`, "dexFreshnessGuard");
    }
  };

  forceMetaTruth();
  const previous = document.getElementById("atlasVersionTruthControl");
  const control = previous ? previous.cloneNode(true) : null;
  if (previous && control) previous.replaceWith(control);
  const text = control?.querySelector("#atlasVersionTruthText") || document.getElementById("atlasVersionTruthText");
  const legacyControl = document.getElementById("atlasVersionControl");
  const legacyText = document.getElementById("atlasVersionControlText");
  if (legacyControl) {
    legacyControl.hidden = true;
    legacyControl.setAttribute("aria-hidden", "true");
    legacyControl.style.display = "none";
    legacyControl.dataset.versionTruthLegacySink = "true";
  }
  if (legacyText) legacyText.dataset.versionTruthLegacySink = "true";

  let remote = null;
  let state = "current";
  let busy = false;
  const validRemote = value => !!value
    && typeof value === "object"
    && BUILD_RE.test(String(value.build || "").trim())
    && String(value.engine || "").trim() === ENGINE;

  function render(next = remote, error = null, mode = null) {
    remote = validRemote(next) ? next : null;
    const published = remote ? String(remote.build).trim() : BUILD;
    const newer = !!remote && compare(published, BUILD) > 0;
    state = mode || ((error && !newer) ? "failed" : newer ? "update-available" : "current");
    const label = state === "checking" ? `Build ${BUILD} · vérification…`
      : state === "applying" ? `Build ${published} · chargement…`
      : state === "update-available" ? `Build ${BUILD} · ${published} disponible`
      : state === "failed" ? `Build ${BUILD} · vérification indisponible`
      : `Build ${BUILD} · Administrator`;
    if (text) text.textContent = label;
    if (control) {
      control.dataset.versionTruthOwner = OWNER;
      control.dataset.loadedBuild = BUILD;
      control.dataset.publishedBuild = published;
      control.dataset.versionTruthState = state;
      delete control.dataset.falsePropagation;
      control.dataset.falsePropagationState = "removed";
      control.disabled = state === "checking" || state === "applying";
      control.toggleAttribute("aria-busy", control.disabled);
      control.classList.toggle("warn", state === "update-available");
      control.classList.toggle("ok", state !== "update-available");
      control.setAttribute("aria-label", state === "update-available"
        ? `Version chargée ${BUILD}. Version ${published} disponible. Cliquer pour charger.`
        : `Version Agent-Crypto chargée : Build ${BUILD}, mode Administrator.`);
      control.title = state === "update-available"
        ? `Build ${published} disponible · cliquer pour mettre à jour`
        : `Build ${BUILD} chargé · aucune mise à jour détectée`;
    }
    document.documentElement.dataset.versionTruthBuild = BUILD;
    document.documentElement.dataset.versionTruthPublished = published;
    document.documentElement.dataset.versionTruthState = state;
    document.documentElement.dataset.versionTruthAuthority = OWNER;
    syncVisibleTruth();
    return Object.freeze({ loaded: BUILD, published, state, update_available: newer });
  }

  async function fetchManifest() {
    const response = await fetch(`${MANIFEST}?v=${encodeURIComponent(BUILD)}&t=${Date.now()}`, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!validRemote(result)) throw new Error("manifest-invalide");
    return result;
  }

  async function check(show = false) {
    if (busy) return false;
    busy = true;
    if (show) render(remote, null, "checking");
    try {
      const result = await fetchManifest();
      const snapshot = render(result);
      return snapshot.update_available;
    } catch (error) {
      render(remote, error);
      return false;
    } finally {
      busy = false;
    }
  }

  const entryUrl = build => new URL(`./index-${build}.html`, location.href);
  async function probeEntry(url, build) {
    try {
      const probe = new URL(url);
      probe.searchParams.set("ac-probe", `${build}-${Date.now()}`);
      const response = await fetch(probe.toString(), { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) return false;
      const html = await response.text();
      const pathnameProof = new URL(response.url || probe.toString(), location.href).pathname.endsWith(`/index-${build}.html`);
      const engineMatch = html.match(/<meta\s+name="atlas-engine-build"\s+content="([^"]+)"/i);
      const compatibilityShimPresent = html.includes("version-truth-406086-authority-lock.js");
      return pathnameProof && String(engineMatch?.[1] || "").trim() === ENGINE && compatibilityShimPresent;
    } catch (_) {
      return false;
    }
  }

  function canonicalFallbackUrl(build) {
    const target = new URL("./index.html", location.href);
    target.searchParams.set(BUILD_PARAM, build);
    target.searchParams.set(REFRESH_PARAM, `${build}-${Date.now()}`);
    return target;
  }

  async function applyAvailableUpdate() {
    if (busy || state !== "update-available") return false;
    busy = true;
    render(remote, null, "applying");
    try {
      const result = await fetchManifest();
      const published = String(result.build || "").trim();
      if (compare(published, BUILD) <= 0) {
        render(result);
        return false;
      }
      const immutable = entryUrl(published);
      if (await probeEntry(immutable, published)) {
        immutable.searchParams.set(REFRESH_PARAM, `${published}-${Date.now()}`);
        location.replace(immutable.toString());
        return true;
      }
      location.replace(canonicalFallbackUrl(published).toString());
      return true;
    } catch (error) {
      render(remote, error);
      return false;
    } finally {
      busy = false;
    }
  }

  async function onClick(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
    if (busy) return false;
    if (state === "update-available") return applyAvailableUpdate();
    return check(true);
  }

  render();
  ensureSourceDemandLoader();
  ensureRuntimeLayers();
  control?.addEventListener("click", onClick, { capture: true });
  window.addEventListener("erith:system-hydrated", deferVisibleTruth, { passive: true });
  document.addEventListener("agentcrypto:current-finalized", deferVisibleTruth, { passive: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", deferVisibleTruth, { once: true });
  else deferVisibleTruth();
  window.addEventListener("load", deferVisibleTruth, { once: true, passive: true });
  window.addEventListener("pageshow", deferVisibleTruth, { passive: true });
  void check(false);

  globalThis.ErithVersionTruth = Object.freeze({
    owner: OWNER,
    legacy_owner_alias: "version-truth-entry-authority-v3",
    build: BUILD,
    engine: ENGINE,
    manifest: MANIFEST,
    loaded_from_immutable_entry_path: !!entryMatch,
    loaded_from_canonical_build_param: !entryMatch && BUILD_RE.test(requestedBuild),
    embedded_build: embeddedBuild,
    snapshot: () => Object.freeze({ loaded: BUILD, published: String(remote?.build || BUILD), state }),
    refresh: check,
    applyAvailableUpdate,
    syncFooterTruth,
    syncMirrorTruth,
    syncVisibleTruth,
    ensureRuntimeLayers,
    source_demand_loader_generic: true,
    source_truth_backend_placement_restored: true,
    single_visible_owner: true,
    immutable_entry_path_authority: true,
    canonical_build_param_fallback: true,
    false_propagation_state_removed: true,
    stale_listener_detached_by_node_replacement: true,
    current_click_reloads: false,
    update_available_click_reloads: true,
    canonical_active_filename: "js/version-truth.js",
    recurring_timer: false,
    observer: false,
    storage_write: false
  });
  syncVisibleTruth();
})();
