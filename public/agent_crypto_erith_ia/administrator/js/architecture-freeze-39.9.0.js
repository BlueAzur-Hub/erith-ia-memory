(() => {
  "use strict";

  /* ============================================================
     39.9.0 — MEMORY ARCHITECTURE FREEZE / PREFLIGHT

     PURPOSE
     - Consolidate the validated 39.x memory architecture before 40.0.
     - Verify publication identity, runtime truth, module wiring,
       read-only contracts, script order and protected UI anchors.
     - Report data-coverage limits as WARN, never as fake code failures.

     CONTRACT
     - NO feature delta to market analysis, memory semantics or design.
     - NO automatic repair.
     - NO memory write.
     - NO network request from this module.
     - NO Atlas / NØX / Aerith / Bridge / Ollama start.
     ============================================================ */

  const BUILD_3990 = "39.9.0";
  const ENGINE_3990 = "38.15.11";
  const TOKEN_3990 = `market-core-v2.0-alpha-build-${BUILD_3990}`;
  const ROOT_ID = "atlasArchitectureFreeze3990";

  const byId = id => document.getElementById(id);
  const setText = (id, value) => {
    const node = byId(id);
    if (node) node.textContent = String(value ?? "—");
  };
  const safe = (fn, fallback = null) => {
    try { return typeof fn === "function" ? fn() : fallback; }
    catch (_) { return fallback; }
  };

  function meta(name) {
    return String(document.querySelector(`meta[name="${name}"]`)?.content || "").trim();
  }

  function scriptRows() {
    return [...document.querySelectorAll('script[src]')].map((node, index) => ({
      index,
      raw: String(node.getAttribute("src") || ""),
      src: String(node.src || node.getAttribute("src") || "")
    }));
  }

  function styleRows() {
    return [...document.querySelectorAll('link[rel="stylesheet"][href]')].map((node, index) => ({
      index,
      raw: String(node.getAttribute("href") || ""),
      href: String(node.href || node.getAttribute("href") || "")
    }));
  }

  function pathOnly(value) {
    return String(value || "").split("?")[0].split("#")[0];
  }

  function countScriptSuffix(suffix) {
    return scriptRows().filter(row => pathOnly(row.raw).endsWith(suffix)).length;
  }

  function hasScriptSuffix(suffix) {
    return countScriptSuffix(suffix) === 1;
  }

  function versionedLocalScripts() {
    const rows = scriptRows().filter(row => row.raw.startsWith("./") && row.raw.includes("?v="));
    const stale = rows.filter(row => !row.raw.includes(BUILD_3990));
    return { rows, stale };
  }

  function versionedAdminStyles() {
    const required = ["admin-windows.css", "admin-visual-assets.css", "admin-ribbons.css"];
    const rows = styleRows();
    const states = required.map(name => {
      const matches = rows.filter(row => pathOnly(row.raw).endsWith(`/${name}`) || pathOnly(row.raw).endsWith(name));
      const row = matches[0] || null;
      return {
        name,
        count: matches.length,
        current: !!row && row.raw.includes(BUILD_3990),
        raw: row?.raw || "absent"
      };
    });
    return states;
  }

  function scriptOrder() {
    const expected = [
      "./app.js",
      "./js/market-memory-39.3.js",
      "./js/analytical-memory-39.4.js",
      "./js/market-memory-39.4.4R1.js",
      "./js/decision-board-dual-memory-39.5.0.js",
      "./js/retrospective-validation-39.6.0.js",
      "./js/multi-collector-concordance-39.7.0.js",
      "./js/memory-health-audit-39.8.0R2.js",
      "./js/admin-visual-assets-39.4.5R3.js",
      "./js/core/admin-window-manager.js",
      "./js/app.js",
      "./js/architecture-freeze-39.9.0.js"
    ];
    const rows = scriptRows();
    const positions = expected.map(path => {
      const matches = rows.filter(row => pathOnly(row.raw) === path);
      return { path, count: matches.length, index: matches.length === 1 ? matches[0].index : -1 };
    });
    const unique = positions.every(row => row.count === 1);
    const ordered = unique && positions.every((row, i) => i === 0 || row.index > positions[i - 1].index);
    return { expected, positions, unique, ordered };
  }

  function check(name, ok, detail, severity = "critical") {
    return Object.freeze({ name, ok: !!ok, detail: String(detail || ""), severity });
  }

  function runtimeBuild() {
    try { return String(typeof ATLAS_BUILD !== "undefined" ? ATLAS_BUILD : "").trim(); }
    catch (_) { return ""; }
  }

  function runtimeToken() {
    try { return String(typeof ATLAS_ASSET_TOKEN !== "undefined" ? ATLAS_ASSET_TOKEN : "").trim(); }
    catch (_) { return ""; }
  }

  function runtimeTruth() {
    try {
      if (typeof atlasRuntimeTruth3813 === "function") return atlasRuntimeTruth3813();
    } catch (_) {}
    return globalThis.__AGENT_CRYPTO_RUNTIME_TRUTH__ || null;
  }

  function memoryHealth() {
    return safe(globalThis.atlasMemoryHealth3980R2?.derive, null);
  }

  function multiCollector() {
    return safe(globalThis.atlasMultiCollectorConcordance3970?.derive, null);
  }

  function readOnlyContractOk(contract) {
    if (!contract) return false;
    return contract.writes_memory === false
      && contract.new_fetch === false
      && contract.new_timer === false
      && contract.new_websocket === false
      && contract.starts_atlas === false
      && contract.starts_nox === false
      && contract.starts_aerith === false;
  }

  function derive() {
    const build = runtimeBuild();
    const token = runtimeToken();
    const truth = runtimeTruth();
    const cache = versionedLocalScripts();
    const styles = versionedAdminStyles();
    const order = scriptOrder();
    const health = memoryHealth();
    const multi = multiCollector();
    const healthContract = globalThis.__AGENT_CRYPTO_MEMORY_HEALTH_3980R2__ || null;
    const multiContract = globalThis.__AGENT_CRYPTO_MULTI_COLLECTOR_3970__ || null;
    const bodyBuild = String(document.body?.dataset?.administratorBuild || "").trim();
    const rootBuild = String(document.documentElement?.dataset?.administratorBuild || "").trim();

    const checks = [
      check("Build runtime", build === BUILD_3990, `ATLAS_BUILD=${build || "—"}`),
      check("Token runtime", token === TOKEN_3990, `ATLAS_ASSET_TOKEN=${token || "—"}`),
      check("Runtime Truth", !!truth && truth.pass === true, truth ? `pass=${String(truth.pass)} · app=${truth.app_build || "—"} · html=${truth.html_build || "—"}` : "runtime truth indisponible"),
      check("Meta atlas-build", meta("atlas-build") === BUILD_3990, `meta=${meta("atlas-build") || "—"}`),
      check("Meta administrator-build", meta("administrator-build") === BUILD_3990, `meta=${meta("administrator-build") || "—"}`),
      check("Meta asset token", meta("atlas-asset-token") === TOKEN_3990, `meta=${meta("atlas-asset-token") || "—"}`),
      check("Engine lock", meta("atlas-engine-build") === ENGINE_3990, `engine=${meta("atlas-engine-build") || "—"}`),
      check("DOM build identity", bodyBuild === BUILD_3990 || rootBuild === BUILD_3990, `body=${bodyBuild || "—"} · html=${rootBuild || "—"}`),
      check("Cache-busters JS", cache.stale.length === 0 && cache.rows.length >= 11, cache.stale.length ? `${cache.stale.length} script(s) local(aux) avec version obsolète` : `${cache.rows.length} script(s) locaux alignés`),
      check("Cache-busters CSS admin", styles.every(row => row.count === 1 && row.current), styles.map(row => `${row.name}:${row.count === 1 && row.current ? "OK" : row.raw}`).join(" · ")),
      check("Ordre des scripts", order.unique && order.ordered, order.unique ? (order.ordered ? "12/12 scripts uniques dans l’ordre canonique" : "ordre de chargement non canonique") : "script absent ou dupliqué"),
      check("Market Memory 39.4.4R1", typeof globalThis.atlasMarketMemoryStats3944R1 === "function" && hasScriptSuffix("/js/market-memory-39.4.4R1.js"), "API stats + script unique"),
      check("Core identité/temps mémoire", typeof atlasMemoryCanonicalSnapshotId === "function" && typeof atlasMemoryRecordTime === "function", "résolveurs canoniques du Core disponibles"),
      check("Analytical Memory 39.4", typeof globalThis.atlasAnalyticalMemoryStats394 === "function" && hasScriptSuffix("/js/analytical-memory-39.4.js"), "API stats + script unique"),
      check("Dual Memory 39.5", !!globalThis.atlasDecisionBoardDualMemory3950 && hasScriptSuffix("/js/decision-board-dual-memory-39.5.0.js"), "API + script unique"),
      check("Retrospective 39.6", hasScriptSuffix("/js/retrospective-validation-39.6.0.js"), "script unique · état de données non bloquant"),
      check("Multi-Collector 39.7", !!globalThis.atlasMultiCollectorConcordance3970 && hasScriptSuffix("/js/multi-collector-concordance-39.7.0.js"), "API + script unique"),
      check("Contrat Multi-Collector", readOnlyContractOk(multiContract), multiContract ? "lecture seule vérifiée" : "sentinelle absente"),
      check("Memory Health 39.8.0R2", !!globalThis.atlasMemoryHealth3980R2 && hasScriptSuffix("/js/memory-health-audit-39.8.0R2.js"), "Truth Repair API + script unique"),
      check("Contrat Memory Health", readOnlyContractOk(healthContract) && healthContract.verdicts_separated === true, healthContract ? "lecture seule + verdicts séparés" : "sentinelle absente"),
      check("Ancien Memory Health retiré", countScriptSuffix("/js/memory-health-audit-39.8.0.js") === 0, "aucun doublon du lecteur 39.8.0 initial"),
      check("Window Manager", hasScriptSuffix("/js/core/admin-window-manager.js"), "script unique"),
      check("Lecture technique", !!byId("detailPanel") && !!byId("detailPanelBody"), "ancrages DOM présents"),
      check("Near-zero glass lock", !!byId("administrator-tech-reading-near-zero-glass-39-8-0-r1") || !!document.getElementById("administrator-tech-reading-near-zero-glass-39-8-0-r1"), "verrou transparence 39.8.0R1 présent"),
      check("Workspace marché", !!byId("market-workspace") && !!byId("analyste"), "ancrages marché/graphe présents"),
      check("Freeze singleton", hasScriptSuffix("/js/architecture-freeze-39.9.0.js"), "script 39.9.0 unique")
    ];

    if (health) {
      const structure = health?.verdicts?.structure || {};
      checks.push(check(
        "État structure mémoire",
        structure.code !== "attention",
        `${structure.label || "INDISPONIBLE"} · ${structure.detail || "aucun détail"}`,
        "critical"
      ));
      const coverage = health?.verdicts?.coverage || {};
      checks.push(check(
        "Couverture mémoire",
        coverage.code === "complete",
        `${coverage.label || "INDISPONIBLE"} · ${coverage.detail || "aucun détail"}`,
        "warning"
      ));
      const continuity = health?.verdicts?.continuity || {};
      checks.push(check(
        "Continuité de collecte",
        continuity.code === "observed",
        `${continuity.label || "INDISPONIBLE"} · ${continuity.detail || "aucun détail"}`,
        "warning"
      ));
    } else {
      checks.push(check("État structure mémoire", false, "Memory Health n’a pas retourné de diagnostic", "warning"));
    }

    if (multi) {
      checks.push(check(
        "Concordance multi-collecteur disponible",
        multi?.status?.code !== "insufficient",
        `${multi?.status?.label || "INDISPONIBLE"} · ${Number(multi?.pairCount || 0)} paire(s) comparable(s)`,
        "warning"
      ));
    }

    const criticalFails = checks.filter(row => row.severity === "critical" && !row.ok);
    const warnings = checks.filter(row => row.severity === "warning" && !row.ok);
    const pass = criticalFails.length === 0;
    const label = !pass
      ? "FREEZE REFUSÉ"
      : warnings.length
        ? "FREEZE PASS · LIMITES CONNUES"
        : "FREEZE PASS";

    return {
      build: BUILD_3990,
      generatedAt: new Date().toISOString(),
      pass,
      label,
      checks,
      criticalFails,
      warnings,
      runtimeTruth: truth,
      health,
      multi,
      contract: "ARCHITECTURE GELÉE · AUCUNE MUTATION AUTOMATIQUE · 40.0 SEULEMENT APRÈS VALIDATION FIREFOX"
    };
  }

  function ensureRoot() {
    let root = byId(ROOT_ID);
    if (root) return root;
    const anchor = byId("atlasMemoryHealth3980") || byId("atlasMemoryIntelligence");
    if (!anchor) return null;

    root = document.createElement("section");
    root.id = ROOT_ID;
    root.className = "atlas-memory-intelligence";
    root.dataset.state = "waiting";
    root.setAttribute("aria-labelledby", "architectureFreezeTitle3990");
    root.innerHTML = `
      <div class="atlas-memory-intelligence-head">
        <div>
          <p class="eyebrow">ARCHITECTURE FREEZE · 39.9.0 · READ ONLY</p>
          <h5 id="architectureFreezeTitle3990">Contrôle global avant 40.0</h5>
          <p>Vérifie que les briques validées sont présentes, alignées et non contradictoires. Aucun correctif automatique.</p>
        </div>
        <span class="pill warn" id="architectureFreezeBadge3990">En attente</span>
      </div>
      <div class="atlas-memory-ledger-35">
        <article><span>Contrôles</span><b id="architectureFreezeCount3990">—</b><small>PASS réellement exécutés dans ce navigateur.</small></article>
        <article><span>Critiques</span><b id="architectureFreezeCritical3990">—</b><small>Un seul FAIL critique interdit le passage en 40.0.</small></article>
        <article><span>Limites</span><b id="architectureFreezeWarnings3990">—</b><small>Couverture ou données manquantes : visibles mais non maquillées en panne.</small></article>
        <article><span>Verdict</span><b id="architectureFreezeState3990">—</b><small>Préflight local ; validation Firefox opérateur encore requise.</small></article>
      </div>
      <div class="atlas-memory-intelligence-grid" id="architectureFreezeGrid3990"></div>
      <div class="atlas-memory-intelligence-actions">
        <button type="button" id="btnArchitectureFreezeRefresh3990">Relancer le contrôle</button>
        <button type="button" id="btnArchitectureFreezeExport3990">Exporter Freeze Audit .md</button>
      </div>
      <p id="architectureFreezeContract3990">Aucun verdict tant que le préflight n’a pas été exécuté.</p>`;

    anchor.insertAdjacentElement("afterend", root);
    byId("btnArchitectureFreezeRefresh3990")?.addEventListener("click", render);
    byId("btnArchitectureFreezeExport3990")?.addEventListener("click", exportMarkdown);
    return root;
  }

  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const data = derive();
    const passed = data.checks.filter(row => row.ok).length;
    setText("architectureFreezeCount3990", `${passed}/${data.checks.length} PASS`);
    setText("architectureFreezeCritical3990", data.criticalFails.length ? `${data.criticalFails.length} FAIL` : "0 FAIL");
    setText("architectureFreezeWarnings3990", data.warnings.length ? `${data.warnings.length} limite(s)` : "0");
    setText("architectureFreezeState3990", data.label);
    setText("architectureFreezeContract3990", data.pass
      ? "39.9.0 : architecture consolidée. Les limites de couverture restent visibles ; aucune n’est transformée en faux défaut structurel."
      : "FREEZE REFUSÉ : corriger les FAIL critiques avant toute préparation 40.0.");

    const badge = byId("architectureFreezeBadge3990");
    if (badge) {
      badge.textContent = data.label;
      badge.className = `pill ${data.pass ? (data.warnings.length ? "warn" : "ok") : "fail"}`;
    }

    const grid = byId("architectureFreezeGrid3990");
    if (grid) {
      const nodes = data.checks.map(row => {
        const article = document.createElement("article");
        const state = row.ok ? "PASS" : row.severity === "critical" ? "FAIL" : "LIMITE";
        article.dataset.state = row.ok ? "ok" : row.severity === "critical" ? "fail" : "warn";
        article.innerHTML = `<span></span><b>${state}</b><small></small>`;
        article.querySelector("span").textContent = row.name;
        article.querySelector("small").textContent = row.detail;
        return article;
      });
      grid.replaceChildren(...nodes);
    }

    root.dataset.state = data.pass ? (data.warnings.length ? "prudent" : "ready") : "fail";
    root.dataset.build = BUILD_3990;
    root.dataset.criticalFails = String(data.criticalFails.length);
    root.dataset.warnings = String(data.warnings.length);
    return data;
  }

  function markdown(data = derive()) {
    const lines = [
      "# Agent-Crypto — Architecture Freeze 39.9.0", "",
      `- Généré : ${data.generatedAt}`,
      `- Verdict : ${data.label}`,
      `- FAIL critiques : ${data.criticalFails.length}`,
      `- Limites connues : ${data.warnings.length}`, "",
      "## Contrôles", ""
    ];
    for (const row of data.checks) {
      const state = row.ok ? "PASS" : row.severity === "critical" ? "FAIL" : "LIMITE";
      lines.push(`- ${state} · ${row.name} · ${row.detail}`);
    }
    lines.push(
      "", "## Règle de passage 40.0", "",
      "- 0 FAIL critique requis.",
      "- Les limites de couverture/continuité peuvent rester visibles si elles ne sont pas des défauts structurels.",
      "- Aucune nouvelle fonction ne doit être ajoutée entre le freeze validé et 40.0.",
      "- 40.0 exige encore une validation réelle dans Firefox après publication GitHub.",
      "- Aucun ordre financier, aucune recommandation et aucune réparation automatique ne sont produits par ce module."
    );
    return lines.join("\n");
  }

  function exportMarkdown() {
    const body = markdown();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const name = `agent_crypto_architecture_freeze_${stamp}.md`;
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

  const freezeContract3990 = Object.freeze({
    build: BUILD_3990,
    role: "read-only architecture freeze preflight",
    feature_delta: false,
    repairs_automatically: false,
    writes_memory: false,
    starts_atlas: false,
    starts_nox: false,
    starts_aerith: false,
    starts_bridge: false,
    starts_ollama: false,
    new_fetch: false,
    new_timer: false,
    new_websocket: false
  });

  globalThis.__AGENT_CRYPTO_ARCHITECTURE_FREEZE_3990__ = freezeContract3990;
  globalThis.atlasArchitectureFreeze3990 = Object.freeze({ derive, render, markdown });

  queueMicrotask(() => { try { render(); } catch (_) {} });
})();
