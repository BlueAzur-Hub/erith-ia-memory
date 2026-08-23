(() => {
  "use strict";

  /*
    40.3.29 is a presentation/cache hotfix layered on the canonical 40.3.26
    application. Do not rewrite the canonical app build meta at runtime: doing
    so created the false CACHE/VERSION INCOHERENTS banner in 40.3.27/28.
  */
  const PATCH_BUILD = "40.3.29";
  const RELEASE = "PARKER LEWIS CAN'T LOSE · BALANCED FIREFOX PAINT BUDGET + PERSISTENT VISUAL CACHE";
  const BASE_BUILD = String(document.querySelector('meta[name="administrator-build"]')?.content || document.querySelector('meta[name="atlas-build"]')?.content || "40.3.26").trim();

  const DB_NAME = "agent_crypto_visual_cache_v1";
  const DB_VERSION = 1;
  const STORE = "assets";
  const GENERATION = "administrator-visuals-2026-08-23-v1";
  const CHART_OFFICE = "./assets/visual/admin-chart-office.png";

  const VIEW_STORAGE_KEY = "erith_admin_view_mode_40327";
  const VALID_VIEWS = new Set(["basic", "intermediate", "admin"]);
  const DEFAULT_VIEW = "intermediate";

  const objectUrls = new Map();
  const stats = { memory: 0, indexeddb: 0, network: 0, miss: 0, error: 0 };

  function normalizeView(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "administrator" || raw === "administration" || raw === "advanced") return "admin";
    return VALID_VIEWS.has(raw) ? raw : DEFAULT_VIEW;
  }

  function readView() {
    try { return normalizeView(localStorage.getItem(VIEW_STORAGE_KEY) || DEFAULT_VIEW); }
    catch (_) { return DEFAULT_VIEW; }
  }

  function persistView(mode) {
    try { localStorage.setItem(VIEW_STORAGE_KEY, normalizeView(mode)); } catch (_) {}
  }

  function setRuntimeView(mode, persist = false) {
    const next = normalizeView(mode);
    document.documentElement.dataset.atlasViewRuntime = next;
    document.documentElement.dataset.atlasViewBudgetBuild = PATCH_BUILD;
    if (persist) persistView(next);
    return next;
  }

  /* Runs in <head>, before the large Administrator body is parsed. */
  let runtimeView = setRuntimeView(readView(), false);

  function absolute(input) {
    try { return new URL(String(input || ""), document.baseURI).href; }
    catch (_) { return String(input || ""); }
  }

  function isCacheable(url) {
    try {
      const u = new URL(url, document.baseURI);
      if (u.origin !== location.origin) return false;
      return /\/assets\/(?:visual|images)\//.test(u.pathname) && /\.(?:png|jpe?g|webp|avif)$/i.test(u.pathname);
    } catch (_) { return false; }
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) return reject(new Error("IndexedDB unavailable"));
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("Visual cache DB open failed"));
    });
  }

  async function read(id) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error("Visual cache read failed"));
      });
    } finally { db.close(); }
  }

  async function write(record) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("Visual cache write failed"));
        tx.objectStore(STORE).put(record);
      });
    } finally { db.close(); }
  }

  function objectUrlFor(key, blob) {
    const existing = objectUrls.get(key);
    if (existing) {
      stats.memory += 1;
      return existing;
    }
    const url = URL.createObjectURL(blob);
    objectUrls.set(key, url);
    return url;
  }

  async function resolve(input, { allowNetwork = true } = {}) {
    const id = absolute(input);
    if (!isCacheable(id)) return { url: id, source: "direct", cached: false };

    const memoryUrl = objectUrls.get(id);
    if (memoryUrl) {
      stats.memory += 1;
      return { url: memoryUrl, source: "memory", cached: true };
    }

    try {
      const record = await read(id);
      if (record?.generation === GENERATION && record?.blob instanceof Blob && record.blob.size > 0) {
        stats.indexeddb += 1;
        return { url: objectUrlFor(id, record.blob), source: "indexeddb", cached: true, bytes: record.blob.size };
      }
    } catch (_) {
      stats.error += 1;
    }

    if (!allowNetwork) {
      stats.miss += 1;
      return null;
    }

    try {
      const response = await fetch(id, { cache: "force-cache", credentials: "same-origin" });
      if (!response.ok) throw new Error(`visual fetch ${response.status}`);
      const blob = await response.blob();
      if (!blob || !blob.size || (blob.type && !blob.type.startsWith("image/"))) throw new Error("invalid visual blob");
      try {
        await write({ id, generation: GENERATION, blob, mime: blob.type || "", bytes: blob.size, cached_at: Date.now() });
      } catch (_) {}
      stats.network += 1;
      return { url: objectUrlFor(id, blob), source: "network", cached: false, bytes: blob.size };
    } catch (error) {
      stats.error += 1;
      throw error;
    }
  }

  async function has(input) {
    const id = absolute(input);
    if (objectUrls.has(id)) return true;
    try {
      const record = await read(id);
      return Boolean(record?.generation === GENERATION && record?.blob instanceof Blob && record.blob.size > 0);
    } catch (_) { return false; }
  }

  async function clear() {
    for (const url of objectUrls.values()) {
      try { URL.revokeObjectURL(url); } catch (_) {}
    }
    objectUrls.clear();
    return await new Promise((resolve) => {
      try {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
        req.onblocked = () => resolve(false);
      } catch (_) { resolve(false); }
    });
  }

  function setChartBackground(url, source) {
    if (!url) return false;
    document.documentElement.style.setProperty(
      "--agent-crypto-chart-office-cached",
      `url("${String(url).replaceAll('"', "%22")}")`
    );
    document.documentElement.dataset.visualChartSource = source || "unknown";
    return true;
  }

  function scheduleIdle(task, timeout = 2200) {
    const run = () => { try { void task(); } catch (_) {} };
    if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout });
    else setTimeout(run, 32);
  }

  async function bootChartBackground() {
    /* Fast path: cached blob only. Never wait for network before first paint. */
    try {
      const local = await resolve(CHART_OFFICE, { allowNetwork: false });
      if (local?.url) {
        setChartBackground(local.url, local.source);
        return;
      }
    } catch (_) {}

    /* Cold-cache network work is deliberately deferred. */
    scheduleIdle(async () => {
      try {
        const resolved = await resolve(CHART_OFFICE, { allowNetwork: true });
        if (resolved?.url) setChartBackground(resolved.url, resolved.source);
      } catch (_) {
        setChartBackground(CHART_OFFICE, "direct-fallback");
      }
    }, 2800);
  }

  function markProjectNavigation() {
    const candidates = document.querySelectorAll("header button, header a, nav button, nav a, .topbar button, .topbar a");
    for (const node of candidates) {
      const text = String(node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (!text) continue;
      if (text.includes("projet") || text.includes("création") || text.includes("creation") || text.includes("mission")) {
        node.classList.add("atlas-admin-project-nav-40327");
      }
    }
  }

  function bindViewButtons() {
    const buttons = [...document.querySelectorAll("[data-atlas-view-mode]")];

    for (const button of buttons) {
      if (!(button instanceof HTMLElement)) continue;
      button.addEventListener("click", () => {
        runtimeView = setRuntimeView(button.dataset.atlasViewMode || DEFAULT_VIEW, true);
      }, true);
    }

    /* Do not synchronously target.click() during DOMContentLoaded. In 40.3.27/28
       that could ask the native manager to traverse the enormous document while
       Firefox was still parsing/painting. The early dataset already enforces the
       daily paint budget; native mode restoration is deferred until idle. */
    scheduleIdle(() => {
      const desired = normalizeView(readView());
      runtimeView = setRuntimeView(desired, false);
      const target = buttons.find(btn => normalizeView(btn.dataset.atlasViewMode) === desired);
      if (target instanceof HTMLElement && target.getAttribute("aria-pressed") !== "true") {
        try { target.click(); } catch (_) {}
      }
      runtimeView = setRuntimeView(desired, false);
    }, 1600);
  }

  function bootViewBudget() {
    document.documentElement.classList.add("atlas-view-budget-40327", "atlas-view-budget-40329");
    markProjectNavigation();
    bindViewButtons();

    /* Preserve canonical app identity to avoid the false 40.3.26/40.3.28 cache
       mismatch. Patch identity is diagnostic-only and never replaces app meta. */
    document.documentElement.dataset.administratorBuildRuntime = BASE_BUILD;
    document.documentElement.dataset.visualCachePatchBuild = PATCH_BUILD;
    document.documentElement.dataset.firefoxPaintPolicy = "sectional-progressive";
    document.documentElement.dataset.lazyPaintBlanking = "bounded-subsections";
  }

  const api = Object.freeze({
    build: BASE_BUILD,
    patch_build: PATCH_BUILD,
    release: RELEASE,
    database: DB_NAME,
    generation: GENERATION,
    resolve,
    has,
    clear,
    stats: () => Object.freeze({ ...stats }),
    chart_asset: CHART_OFFICE,
    persistent_blob_cache: true,
    cache_generation_reused_from_40326: true,
    network_on_cache_miss_only: true,
    preloads_full_library: false,
    default_view: DEFAULT_VIEW,
    get_view: () => runtimeView,
    set_view: mode => {
      runtimeView = setRuntimeView(mode, true);
      return runtimeView;
    },
    dom_reparenting: false,
    project_series_in_intermediate: false,
    firefox_paint_policy: "progressive-bounded-subsections"
  });

  globalThis.AgentCryptoVisualCache40329 = api;
  globalThis.AgentCryptoVisualCache40328 = api;
  globalThis.AgentCryptoVisualCache40327 = api;
  globalThis.AgentCryptoVisualCache40326 = api;

  document.documentElement.dataset.visualCacheBuild = PATCH_BUILD;
  void bootChartBackground();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootViewBudget, { once: true });
  } else {
    bootViewBudget();
  }
})();
