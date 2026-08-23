(() => {
  "use strict";

  const BUILD = "40.3.46";
  const DB_NAME = "agent_crypto_visual_cache_v1";
  const DB_VERSION = 1;
  const STORE = "assets";
  const GENERATION = "administrator-visuals-2026-08-23-v1";
  const CHART_OFFICE = "./assets/visual/admin-chart-office.png";
  const objectUrls = new Map();
  const stats = { memory: 0, indexeddb: 0, network: 0, miss: 0, error: 0 };

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
      } catch (_) {
        /* Cache persistence is an optimization. A failed write must never block the interface. */
      }
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
    document.documentElement.style.setProperty("--agent-crypto-chart-office-cached", `url("${String(url).replaceAll('"', '%22')}")`);
    document.documentElement.dataset.visualChartSource = source || "unknown";
    return true;
  }

  function scheduleNetwork(task) {
    const run = () => { try { void task(); } catch (_) {} };
    if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: 1400 });
    else requestAnimationFrame(run);
  }

  async function bootChartBackground() {
    try {
      const local = await resolve(CHART_OFFICE, { allowNetwork: false });
      if (local?.url) {
        setChartBackground(local.url, local.source);
        return;
      }
    } catch (_) {}
    scheduleNetwork(async () => {
      try {
        const resolved = await resolve(CHART_OFFICE, { allowNetwork: true });
        if (resolved?.url) setChartBackground(resolved.url, resolved.source);
      } catch (_) {
        /* Last-resort direct URL. The graph remains usable even if the decorative background fails. */
        setChartBackground(CHART_OFFICE, "direct-fallback");
      }
    });
  }

  globalThis.AgentCryptoVisualCache40326 = Object.freeze({
    build: BUILD,
    database: DB_NAME,
    generation: GENERATION,
    resolve,
    has,
    clear,
    stats: () => Object.freeze({ ...stats }),
    chart_asset: CHART_OFFICE,
    persistent_blob_cache: true,
    network_on_cache_miss_only: true,
    preloads_full_library: false
  });

  document.documentElement.dataset.visualCacheBuild = BUILD;
  void bootChartBackground();
})();

/* ==========================================================================
   40.3.42 — NATIVE SCROLL RESTORE

   The 40.3.33 -> 40.3.38 offscreen sleep/prewake experiment is intentionally
   retired. No scroll/wheel/touch/key listener, IntersectionObserver,
   getBoundingClientRect paint polling, wake corridor, idle sleep timer or
   visibility:hidden paint class is owned by this file anymore.

   Persistent IndexedDB visual caching from 40.3.26 remains active above.
   ========================================================================== */
