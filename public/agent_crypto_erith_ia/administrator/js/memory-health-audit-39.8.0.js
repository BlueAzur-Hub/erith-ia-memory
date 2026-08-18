(() => {
  "use strict";

  /* ============================================================
     39.8.0 — MEMORY HEALTH / AUDIT READ-ONLY LOCK

     CONTRACT
     - Read Market Memory 39.4.4R1, Analytical Memory 39.4 and
       Multi-Collector Concordance 39.7.0 through public read APIs.
     - Diagnose structure, continuity and payload health only.
     - NEVER repair, delete, merge, rewrite or fabricate memory.
     - NEVER launch Atlas, NØX, Aerith, Bridge or Ollama.
     - NO fetch, timer, WebSocket or storage write.
     ============================================================ */

  const BUILD_3980 = "39.8.0";
  const ROOT_ID = "atlasMemoryHealth3980";
  const TOP5 = Object.freeze(["BTC", "ETH", "BNB", "XRP", "SOL"]);

  const byId = id => document.getElementById(id);
  const safeCall = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };
  const asArray = value => Array.isArray(value) ? value : [];
  const setText = (id, value) => { const node = byId(id); if (node) node.textContent = String(value ?? "—"); };

  function parseTime(value) {
    const parsed = Date.parse(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function recordTime(record) {
    return parseTime(
      record?.market_generated_at ||
      record?.source_time ||
      record?.snapshot?.market_snapshot?.source_time ||
      record?.saved_at ||
      record?.last_seen_at
    );
  }

  function canonicalId(record) {
    return String(
      record?.market_snapshot_id ||
      record?.snapshot?.market_snapshot?.snapshot_id ||
      ""
    ).trim();
  }

  function collectorId(record) {
    return String(record?.collector_id || "local-legacy").trim() || "local-legacy";
  }

  function assets(record) {
    if (Array.isArray(record?.assets)) return record.assets;
    if (Array.isArray(record?.snapshot?.market_snapshot?.assets)) return record.snapshot.market_snapshot.assets;
    return [];
  }

  function canonicalRows(stats) {
    if (Array.isArray(stats?.canonicalRecords)) return stats.canonicalRecords;
    if (Array.isArray(stats?.records)) return stats.records;
    return [];
  }

  function sourceRows(stats) {
    if (Array.isArray(stats?.marketRecords)) return stats.marketRecords;
    if (Array.isArray(stats?.rawRecords)) return stats.rawRecords;
    return [];
  }

  function median(values) {
    const rows = values.filter(value => Number.isFinite(value) && value > 0).slice().sort((a, b) => a - b);
    if (!rows.length) return null;
    const middle = Math.floor(rows.length / 2);
    return rows.length % 2 ? rows[middle] : (rows[middle - 1] + rows[middle]) / 2;
  }

  function duration(ms) {
    if (!Number.isFinite(ms) || ms < 0) return "—";
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }

  function localTime(value) {
    const t = typeof value === "number" ? value : parseTime(value);
    return t ? new Date(t).toLocaleString("fr-FR") : "—";
  }

  function derive() {
    const market = safeCall(globalThis.atlasMarketMemoryStats3944R1, {}) || {};
    const intelligence = safeCall(globalThis.atlasMemoryIntelligenceCompute, {}) || {};
    const analytical = safeCall(globalThis.atlasAnalyticalMemoryStats394, {}) || {};
    const multi = safeCall(globalThis.atlasMultiCollectorConcordance3970?.derive, {}) || {};

    const source = sourceRows(market);
    const canonical = canonicalRows(market);
    const collectors = Array.isArray(market.collectors)
      ? market.collectors.map(String)
      : [...new Set(source.map(collectorId))];

    const missingCanonical = source.filter(row => !canonicalId(row));
    const missingPayload = canonical.filter(row => {
      const rows = assets(row);
      const symbols = new Set(rows.map(asset => String(asset?.symbol || "").toUpperCase()));
      return TOP5.filter(symbol => symbols.has(symbol)).length < 3;
    });
    const invalidTime = source.filter(row => !recordTime(row));

    const seen = new Map();
    let duplicateIdentityExtras = 0;
    for (const row of source) {
      const id = canonicalId(row);
      if (!id) continue;
      const key = `${collectorId(row)}::${id}`;
      const count = (seen.get(key) || 0) + 1;
      seen.set(key, count);
      if (count > 1) duplicateIdentityExtras += 1;
    }

    const timeline = canonical
      .map(recordTime)
      .filter(Boolean)
      .sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < timeline.length; i += 1) gaps.push(timeline[i] - timeline[i - 1]);
    const medianGap = median(gaps);
    const adaptiveGapThreshold = medianGap ? medianGap * 3 : null;
    const largeGaps = adaptiveGapThreshold
      ? gaps.filter(value => value > adaptiveGapThreshold)
      : [];
    const largestGap = gaps.length ? Math.max(...gaps) : null;

    const neutralizedRepeats = Math.max(0, Number(market.duplicateObservations || 0));
    const crossCollectorCopies = Math.max(0, Number(market.crossCollectorCopies || 0));
    const journalOnly = Number(analytical.journalOnlyCount || 0);
    const currentCount = Number(analytical.count || 0);
    const verifiedCount = Number(analytical.verifiedCount || 0);
    const journalCount = Number(analytical.journalCount || 0);

    const localGithub = intelligence?.local_github || {};
    const localGithubAvailable = !!(localGithub?.ready || localGithub?.available || localGithub?.comparable);
    const indexedDbApi = typeof globalThis.atlasCollectorInitializeStorage === "function"
      && typeof globalThis.readCollectorMemory === "function";
    const memoryRoot = byId("atlasMemoryIntelligence");
    const indexedDbDeclaredVerified = /IndexedDB Collector vérifié/i.test(String(byId("atlasMemoryIntelligenceStatus")?.textContent || ""));

    const structuralDefects = missingCanonical.length + missingPayload.length + invalidTime.length + duplicateIdentityExtras;
    let code = "ok";
    let label = "OK";
    let detail = "Aucune incohérence structurelle détectée dans les enregistrements lisibles.";
    if (!canonical.length && !source.length) {
      code = "waiting";
      label = "EN ATTENTE";
      detail = "Aucune Market Memory lisible pour établir un diagnostic.";
    } else if (structuralDefects > 0) {
      code = "attention";
      label = "ATTENTION";
      detail = `${structuralDefects} anomalie(s) structurelle(s) lisible(s) ; diagnostic uniquement, aucune réparation automatique.`;
    } else if (journalOnly > 0 || largeGaps.length > 0 || multi?.status?.code === "insufficient" || !localGithubAvailable) {
      code = "prudent";
      label = "PRUDENTE";
      detail = "Structure cohérente ; certaines preuves historiques ou comparaisons restent partielles/indisponibles.";
    }

    return {
      build: BUILD_3980,
      generatedAt: new Date().toISOString(),
      status: { code, label, detail },
      market: {
        canonicalCount: Number(market.canonicalCount ?? market.distinctCount ?? canonical.length),
        sourceCount: Number(market.sourceRecordCount ?? source.length),
        collectors: collectors.length,
        neutralizedRepeats,
        crossCollectorCopies,
        missingCanonical: missingCanonical.length,
        missingPayload: missingPayload.length,
        invalidTime: invalidTime.length,
        duplicateIdentityExtras,
        latestAt: intelligence?.latest_at || (timeline.length ? new Date(timeline[timeline.length - 1]).toISOString() : null)
      },
      analytical: { currentCount, verifiedCount, journalCount, journalOnly },
      continuity: {
        intervals: gaps.length,
        medianGap,
        adaptiveGapThreshold,
        largeGaps: largeGaps.length,
        largestGap
      },
      storage: {
        collectorApi: indexedDbApi,
        indexedDbDeclaredVerified,
        basis: indexedDbDeclaredVerified ? "IndexedDB Collector vérifié par la couche Market Memory" : indexedDbApi ? "API Collector disponible" : "API Collector indisponible"
      },
      multi: {
        knownCollectors: Number(multi?.knownCollectors?.length || collectors.length),
        recentCollectors: Number(multi?.recentCollectors?.length || 0),
        pairCount: Number(multi?.pairCount || 0),
        status: multi?.status?.label || "INDISPONIBLE"
      },
      localGithub: {
        available: localGithubAvailable,
        label: localGithubAvailable ? "COMPARABLE" : "INDISPONIBLE"
      },
      contract: "DIAGNOSTIC ≠ RÉPARATION · MARKET ≠ CURRENT"
    };
  }

  function ensureRoot() {
    let root = byId(ROOT_ID);
    if (root) return root;
    const anchor = byId("atlasMultiCollector3970") || byId("atlasAnalyticalMemory394") || byId("atlasMemoryIntelligence");
    if (!anchor) return null;
    root = document.createElement("section");
    root.id = ROOT_ID;
    root.className = "atlas-memory-intelligence";
    root.dataset.state = "waiting";
    root.setAttribute("aria-labelledby", "atlasMemoryHealthTitle3980");
    root.innerHTML = `
      <div class="atlas-memory-intelligence-head">
        <div>
          <p class="eyebrow">MEMORY HEALTH / AUDIT · 39.8.0 · READ ONLY</p>
          <h5 id="atlasMemoryHealthTitle3980">Santé, cohérence et trous de mémoire</h5>
          <p>Diagnostic structurel des mémoires déjà présentes. Aucune réparation automatique, aucune reconstruction du passé.</p>
        </div>
        <span class="pill warn" id="atlasMemoryHealthBadge3980">En attente</span>
      </div>
      <div class="atlas-memory-ledger-35" aria-label="Compteurs Memory Health">
        <article><span>Market Memory</span><b id="memoryHealthMarket3980">—</b><small id="memoryHealthMarketDetail3980">Snapshots canoniques / relevés source.</small></article>
        <article><span>Collecteurs</span><b id="memoryHealthCollectors3980">—</b><small id="memoryHealthCollectorsDetail3980">Connus / récents / paires comparables.</small></article>
        <article><span>Analytical Memory</span><b id="memoryHealthCurrent3980">—</b><small id="memoryHealthCurrentDetail3980">CURRENT détaillés / journal historique.</small></article>
        <article><span>Stockage</span><b id="memoryHealthStorage3980">—</b><small id="memoryHealthStorageDetail3980">Lecture seule du backend existant.</small></article>
      </div>
      <div class="atlas-memory-intelligence-grid">
        <article><span>Identités canoniques</span><b id="memoryHealthIdentity3980">—</b><small id="memoryHealthIdentityDetail3980">collector_id + market_snapshot_id.</small></article>
        <article><span>Répétitions neutralisées</span><b id="memoryHealthDuplicates3980">—</b><small id="memoryHealthDuplicatesDetail3980">F5 répétés ≠ nouveaux snapshots.</small></article>
        <article><span>Chronologie</span><b id="memoryHealthTimeline3980">—</b><small id="memoryHealthTimelineDetail3980">Trous adaptatifs, sans cadence inventée.</small></article>
        <article><span>Payload marché</span><b id="memoryHealthPayload3980">—</b><small id="memoryHealthPayloadDetail3980">Présence de prix TOP5 réellement lisibles.</small></article>
        <article><span>Multi-Collector</span><b id="memoryHealthMulti3980">—</b><small id="memoryHealthMultiDetail3980">Concordance séparée de l’indépendance des sources.</small></article>
        <article><span>Local ↔ GitHub</span><b id="memoryHealthLocalGithub3980">—</b><small id="memoryHealthLocalGithubDetail3980">Indisponible reste indisponible.</small></article>
        <article class="decision-memory-v2-action"><span>Contrat</span><b id="memoryHealthContract3980">DIAGNOSTIC ≠ RÉPARATION</b><small>Aucune suppression, fusion, correction ou fabrication de mémoire.</small></article>
      </div>
      <div class="atlas-memory-intelligence-actions">
        <button type="button" id="btnMemoryHealthRefresh3980">Actualiser Memory Health</button>
        <button type="button" id="btnMemoryHealthExport3980">Exporter Memory Health .md</button>
      </div>
      <p id="memoryHealthStatus3980">Diagnostic en attente.</p>`;
    anchor.insertAdjacentElement("afterend", root);
    byId("btnMemoryHealthRefresh3980")?.addEventListener("click", render);
    byId("btnMemoryHealthExport3980")?.addEventListener("click", exportMarkdown);
    return root;
  }

  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const data = derive();
    const market = data.market;
    const analytical = data.analytical;

    setText("atlasMemoryHealthBadge3980", data.status.label);
    const badge = byId("atlasMemoryHealthBadge3980");
    if (badge) badge.className = `pill ${data.status.code === "ok" ? "ok" : "warn"}`;

    setText("memoryHealthMarket3980", `${market.canonicalCount} canonique(s) · ${market.sourceCount} source`);
    setText("memoryHealthMarketDetail3980", `Dernier marché : ${localTime(market.latestAt)}.`);
    setText("memoryHealthCollectors3980", `${data.multi.knownCollectors} connu(s) · ${data.multi.recentCollectors} récent(s)`);
    setText("memoryHealthCollectorsDetail3980", `${data.multi.pairCount} paire(s) comparable(s) · concordance ${data.multi.status}.`);
    setText("memoryHealthCurrent3980", `${analytical.currentCount} CURRENT · ${analytical.verifiedCount} vérifié(s)`);
    setText("memoryHealthCurrentDetail3980", `Journal fermé ${analytical.journalCount} · ${analytical.journalOnly} ancien(s) sans payload détaillé, non fabriqué(s).`);
    setText("memoryHealthStorage3980", data.storage.indexedDbDeclaredVerified ? "IndexedDB vérifié" : data.storage.collectorApi ? "API disponible" : "Indisponible");
    setText("memoryHealthStorageDetail3980", data.storage.basis);

    setText("memoryHealthIdentity3980", market.missingCanonical || market.duplicateIdentityExtras ? "À VÉRIFIER" : "OK");
    setText("memoryHealthIdentityDetail3980", `${market.missingCanonical} identité(s) canonique(s) manquante(s) · ${market.duplicateIdentityExtras} doublon(s) collector+snapshot résiduel(s).`);
    setText("memoryHealthDuplicates3980", `${market.neutralizedRepeats} répétition(s)`);
    setText("memoryHealthDuplicatesDetail3980", `${market.crossCollectorCopies} autre(s) origine(s) du même état marché · compteur distinct des répétitions F5.`);
    setText("memoryHealthTimeline3980", data.continuity.largeGaps ? `${data.continuity.largeGaps} trou(s) adaptatif(s)` : "Aucun trou adaptatif");
    setText("memoryHealthTimelineDetail3980", data.continuity.intervals
      ? `Pas médian ${duration(data.continuity.medianGap)} · seuil diagnostic ×3 ${duration(data.continuity.adaptiveGapThreshold)} · plus grand écart ${duration(data.continuity.largestGap)}.`
      : "Pas assez d’intervalles pour mesurer les trous.");
    setText("memoryHealthPayload3980", market.missingPayload ? `${market.missingPayload} partiel(s)` : "OK");
    setText("memoryHealthPayloadDetail3980", `${market.invalidTime} timestamp(s) invalide(s) · au moins 3 prix TOP5 requis pour qualifier un payload comparable.`);
    setText("memoryHealthMulti3980", data.multi.status);
    setText("memoryHealthMultiDetail3980", `${data.multi.knownCollectors} collecteur(s) connu(s) · ${data.multi.recentCollectors} récent(s) · ${data.multi.pairCount} paire(s) comparable(s).`);
    setText("memoryHealthLocalGithub3980", data.localGithub.label);
    setText("memoryHealthLocalGithubDetail3980", data.localGithub.available
      ? "Les deux côtés nécessaires sont lisibles par la couche mémoire."
      : "Une mémoire locale et une mémoire GitHub comparables sont nécessaires ; aucune conclusion inventée.");
    setText("memoryHealthContract3980", data.contract);
    setText("memoryHealthStatus3980", `${data.status.label} · ${data.status.detail}`);

    root.dataset.state = data.status.code;
    root.dataset.build = BUILD_3980;
    root.dataset.readOnly = "true";
    return data;
  }

  function markdown(data = derive()) {
    return [
      "# Agent-Crypto — Memory Health / Audit", "",
      `- Build : ${BUILD_3980}`,
      `- Généré : ${data.generatedAt}`,
      `- État : ${data.status.label}`,
      `- Lecture : ${data.status.detail}`, "",
      "## Market Memory", "",
      `- Snapshots canoniques : ${data.market.canonicalCount}`,
      `- Relevés source : ${data.market.sourceCount}`,
      `- Collecteurs connus : ${data.market.collectors}`,
      `- Identités canoniques manquantes : ${data.market.missingCanonical}`,
      `- Doublons collector+snapshot résiduels : ${data.market.duplicateIdentityExtras}`,
      `- Répétitions neutralisées : ${data.market.neutralizedRepeats}`,
      `- Autres origines du même état : ${data.market.crossCollectorCopies}`,
      `- Payloads TOP5 partiels : ${data.market.missingPayload}`,
      `- Timestamps invalides : ${data.market.invalidTime}`,
      `- Dernier marché : ${data.market.latestAt || "—"}`, "",
      "## Chronologie", "",
      `- Intervalles : ${data.continuity.intervals}`,
      `- Pas médian : ${duration(data.continuity.medianGap)}`,
      `- Seuil de trou adaptatif (médiane ×3) : ${duration(data.continuity.adaptiveGapThreshold)}`,
      `- Trous détectés : ${data.continuity.largeGaps}`,
      `- Plus grand écart : ${duration(data.continuity.largestGap)}`, "",
      "## Analytical Memory", "",
      `- CURRENT détaillés : ${data.analytical.currentCount}`,
      `- CURRENT vérifiés : ${data.analytical.verifiedCount}`,
      `- Journal fermé : ${data.analytical.journalCount}`,
      `- Journal sans payload détaillé : ${data.analytical.journalOnly}`, "",
      "## Multi-Collector / stockage", "",
      `- Concordance : ${data.multi.status}`,
      `- Collecteurs récents : ${data.multi.recentCollectors}`,
      `- Paires comparables : ${data.multi.pairCount}`,
      `- IndexedDB : ${data.storage.basis}`,
      `- Local ↔ GitHub : ${data.localGithub.label}`, "",
      "## Contrat", "",
      "- DIAGNOSTIC ≠ RÉPARATION.",
      "- MARKET ≠ CURRENT.",
      "- Aucun ancien payload n’est reconstruit artificiellement.",
      "- Aucune suppression, fusion, correction ou écriture mémoire.",
      "- Aucun fetch, timer, WebSocket, Atlas, NØX, Aerith, Bridge ou Ollama."
    ].join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const name = `agent_crypto_memory_health_${stamp}.md`;
    if (typeof globalThis.downloadTextFile === "function") {
      globalThis.downloadTextFile(name, "text/markdown;charset=utf-8", body);
      return body;
    }
    try {
      const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
    return body;
  }

  const baseMemoryRender = typeof globalThis.atlasMemoryIntelligenceRender === "function"
    ? globalThis.atlasMemoryIntelligenceRender
    : null;
  if (baseMemoryRender) {
    globalThis.atlasMemoryIntelligenceRender = function atlasMemoryIntelligenceRender3980(...args) {
      const result = baseMemoryRender.apply(this, args);
      try { render(); } catch (_) {}
      return result;
    };
  }

  globalThis.__AGENT_CRYPTO_MEMORY_HEALTH_3980__ = Object.freeze({
    build: BUILD_3980,
    role: "read-only memory health audit",
    repairs_memory: false,
    fabricates_history: false,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    writes_memory: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false
  });
  globalThis.atlasMemoryHealth3980 = Object.freeze({ derive, render, markdown });

  queueMicrotask(() => { try { render(); } catch (_) {} });
})();
