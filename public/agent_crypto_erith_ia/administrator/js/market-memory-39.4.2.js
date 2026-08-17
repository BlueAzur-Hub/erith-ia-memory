(() => {
  "use strict";

  /* ============================================================
     39.4.2 — MARKET MEMORY LEXICAL STATE BINDING LOCK
     Root-cause fix for 39.4.1: app.js declares `const state` in the
     global lexical environment, not as `globalThis.state`. Later classic
     scripts can resolve `state` by identifier, but `globalThis.state`
     remains undefined. This patch binds to the real lexical state.

     Responsibility: persist successful canonical market snapshots as
     MARKET observations only. CURRENT stays separate. No new fetch,
     timer, WebSocket, Atlas, NØX, Aerith, Bridge or Ollama call.
     ============================================================ */

  const MARKET_MEMORY_SCHEMA_3942 = "atlas_market_memory_v3942";

  function appState3942() {
    try {
      return typeof state !== "undefined" && state ? state : null;
    } catch (_) {
      return null;
    }
  }

  function isCurrent3942(record) {
    if (!record) return false;
    if (record.analytical_current === true) return true;
    if (String(record.record_kind || "").toUpperCase() === "CURRENT") return true;
    try {
      return typeof atlasCurrentMemoryFingerprint34 === "function" && !!atlasCurrentMemoryFingerprint34(record);
    } catch (_) {
      return false;
    }
  }

  function canonicalKey3942(record) {
    const collector = String(record?.collector_id || "local-legacy");
    let canonical = "";
    try {
      canonical = typeof atlasMemoryCanonicalSnapshotId === "function"
        ? String(atlasMemoryCanonicalSnapshotId(record) || "")
        : "";
    } catch (_) {}
    const fallback = String(
      record?.market_snapshot_id || record?.source_market_snapshot_id ||
      record?.source_time || record?.market_generated_at ||
      record?.snapshot_id || record?.id || record?.saved_at || ""
    );
    return `${collector}::${canonical || fallback}`;
  }

  function marketRecord3942() {
    const appState = appState3942();
    if (!appState?.liveOk || !Array.isArray(appState.coins) || !appState.coins.length) return null;

    const base = typeof makeAutoSnapshot === "function" ? makeAutoSnapshot() : null;
    if (!base) return null;

    const collector = String(base.collector_id || (typeof getCollectorId === "function" ? getCollectorId() : "local-legacy"));
    const canonical = String(appState.sourceLock?.snapshotId || base.market_snapshot_id || "").trim();
    const sourceTime = appState.sourceLock?.timestamp || base.market_generated_at || base.source_time || null;
    const identity = (canonical || String(sourceTime || base.saved_at || Date.now()))
      .replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 180);
    const recordId = `${collector}_market_${identity}`;

    return {
      ...base,
      schema: MARKET_MEMORY_SCHEMA_3942,
      memory_schema: MARKET_MEMORY_SCHEMA_3942,
      id: recordId,
      snapshot_id: recordId,
      collector_id: collector,
      record_kind: "MARKET",
      market_observation: true,
      analytical_current: false,
      analysis_fingerprint: null,
      current_fingerprint: null,
      market_snapshot_id: canonical || base.market_snapshot_id || null,
      market_generated_at: sourceTime || null,
      source_time: sourceTime || base.source_time || null
    };
  }

  function renderAfterCapture3942() {
    queueMicrotask(() => {
      try { renderMemoryTruth?.(); } catch (_) {}
      try { atlasMemoryIntelligenceRender?.(); } catch (_) {}
      try { atlasMultiCollectorOperatorRender?.(); } catch (_) {}
      try { renderDecisionBoard?.(); } catch (_) {}
      try { renderAutoReader?.(); } catch (_) {}
    });
  }

  function capture3942() {
    const snapshot = marketRecord3942();
    if (!snapshot) return null;

    const records = typeof readAutoMemory === "function" ? readAutoMemory() : [];
    const key = canonicalKey3942(snapshot);
    const index = records.findIndex(record => !isCurrent3942(record) && canonicalKey3942(record) === key);

    if (index >= 0) {
      const existing = records[index];
      records[index] = {
        ...existing,
        ...snapshot,
        first_saved_at: existing.first_saved_at || existing.saved_at || snapshot.saved_at,
        saved_at: existing.saved_at || snapshot.saved_at,
        last_seen_at: snapshot.saved_at,
        observation_count: Math.max(1, Number(existing.observation_count || 1)) + 1
      };
    } else {
      records.push({ ...snapshot, first_saved_at: snapshot.saved_at });
    }

    const normalized = typeof normalizeSharedRecords === "function"
      ? normalizeSharedRecords(records, snapshot.collector_id)
      : records;
    const saved = typeof writeAutoMemory === "function" ? writeAutoMemory(normalized) : normalized;
    renderAfterCapture3942();
    return saved.find(row => !isCurrent3942(row) && canonicalKey3942(row) === key) || snapshot;
  }

  if (typeof saveAutoSnapshot === "function") {
    const saveAutoSnapshotBase3942 = saveAutoSnapshot;
    saveAutoSnapshot = function saveAutoSnapshot3942() {
      try {
        const captured = capture3942();
        if (captured) return captured;
      } catch (error) {
        console.warn("Market Memory 39.4.2 capture", error);
      }
      return saveAutoSnapshotBase3942();
    };
  }

  // Capture immediately only when the already-loaded application state is valid.
  // Otherwise atlasAfterLivecheck will call the repaired save boundary after the
  // next successful canonical market refresh.
  try {
    const appState = appState3942();
    if (appState?.liveOk && Array.isArray(appState.coins) && appState.coins.length) capture3942();
  } catch (_) {}

  try {
    globalThis.__AGENT_CRYPTO_MARKET_MEMORY_3942__ = Object.freeze({
      build: "39.4.2",
      schema: MARKET_MEMORY_SCHEMA_3942,
      root_cause: "top-level const state is lexical and is not globalThis.state",
      state_binding: "lexical identifier state",
      write_boundary: "saveAutoSnapshot",
      dedupe: "collector + canonical market snapshot",
      preserves_current: true,
      starts_atlas: false,
      new_timer: false,
      new_fetch: false,
      new_websocket: false,
      storage: "existing AUTO_MEMORY_KEY"
    });
    globalThis.atlasMarketMemoryCapture3942 = capture3942;
  } catch (_) {}
})();
