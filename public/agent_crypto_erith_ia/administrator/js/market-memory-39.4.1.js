(() => {
  "use strict";

  /* ============================================================
     39.4.1 — MARKET MEMORY COLLECTION RECOVERY LOCK
     Repair the write boundary only: every successful canonical market
     refresh persists one MARKET observation in the existing Auto Memory.
     CURRENT remains separate. No new fetch, timer, WebSocket or Atlas call.
     ============================================================ */

  const MARKET_MEMORY_SCHEMA_3941 = "atlas_market_memory_v3941";

  function isCurrent3941(record) {
    if (!record) return false;
    if (record.analytical_current === true) return true;
    if (String(record.record_kind || "").toUpperCase() === "CURRENT") return true;
    try {
      return typeof atlasCurrentMemoryFingerprint34 === "function" && !!atlasCurrentMemoryFingerprint34(record);
    } catch (_) {
      return false;
    }
  }

  function canonicalKey3941(record) {
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

  function marketRecord3941() {
    if (!globalThis.state?.liveOk || !Array.isArray(globalThis.state?.coins) || !globalThis.state.coins.length) return null;
    const base = typeof makeAutoSnapshot === "function" ? makeAutoSnapshot() : null;
    if (!base) return null;

    const collector = String(base.collector_id || (typeof getCollectorId === "function" ? getCollectorId() : "local-legacy"));
    const canonical = String(globalThis.state?.sourceLock?.snapshotId || base.market_snapshot_id || "").trim();
    const sourceTime = globalThis.state?.sourceLock?.timestamp || base.market_generated_at || base.source_time || null;
    const identity = (canonical || String(sourceTime || base.saved_at || Date.now()))
      .replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 180);
    const recordId = `${collector}_market_${identity}`;

    return {
      ...base,
      schema: MARKET_MEMORY_SCHEMA_3941,
      memory_schema: MARKET_MEMORY_SCHEMA_3941,
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

  function renderAfterCapture3941() {
    queueMicrotask(() => {
      try { renderMemoryTruth?.(); } catch (_) {}
      try { atlasMemoryIntelligenceRender?.(); } catch (_) {}
      try { atlasMultiCollectorOperatorRender?.(); } catch (_) {}
      try { renderDecisionBoard?.(); } catch (_) {}
      try { renderAutoReader?.(); } catch (_) {}
    });
  }

  function capture3941() {
    const snapshot = marketRecord3941();
    if (!snapshot) return null;

    const records = typeof readAutoMemory === "function" ? readAutoMemory() : [];
    const key = canonicalKey3941(snapshot);
    const index = records.findIndex(record => !isCurrent3941(record) && canonicalKey3941(record) === key);

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
    renderAfterCapture3941();
    return saved.find(row => !isCurrent3941(row) && canonicalKey3941(row) === key) || snapshot;
  }

  if (typeof saveAutoSnapshot === "function") {
    const saveAutoSnapshotBase3941 = saveAutoSnapshot;
    saveAutoSnapshot = function saveAutoSnapshot3941() {
      try {
        const captured = capture3941();
        if (captured) return captured;
      } catch (error) {
        console.warn("Market Memory 39.4.1 capture", error);
      }
      return saveAutoSnapshotBase3941();
    };
  }

  // If a valid market is already present when this patch loads, preserve it now.
  // Otherwise the existing atlasAfterLivecheck path will invoke the repaired save
  // boundary after the startup canonical refresh. No extra polling is introduced.
  try {
    if (globalThis.state?.liveOk && Array.isArray(globalThis.state?.coins) && globalThis.state.coins.length) capture3941();
  } catch (_) {}

  try {
    globalThis.__AGENT_CRYPTO_MARKET_MEMORY_3941__ = Object.freeze({
      build: "39.4.1",
      schema: MARKET_MEMORY_SCHEMA_3941,
      write_boundary: "saveAutoSnapshot",
      dedupe: "collector + canonical market snapshot",
      preserves_current: true,
      starts_atlas: false,
      new_timer: false,
      new_fetch: false,
      new_websocket: false,
      storage: "existing AUTO_MEMORY_KEY"
    });
    globalThis.atlasMarketMemoryCapture3941 = capture3941;
  } catch (_) {}
})();
