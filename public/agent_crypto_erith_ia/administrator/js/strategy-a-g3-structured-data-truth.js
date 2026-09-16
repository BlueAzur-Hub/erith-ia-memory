/* Agent-Crypto @erith.IA — 40.6.169 G3 STRUCTURED DATA TRUTH
   Certification-facing G3 discovery reads structured owner APIs only.
   Missing structured facts stay UNKNOWN/null; visible text is never parsed as evidence.
   No backtest, no gate promotion, no timer, no observer, no storage write, no network/order path. */
(() => {
  "use strict";

  const BUILD = "40.6.169";
  const ROOT_ID = "strategyAG3StructuredTruth";
  const DOSSIER_ID = "strategyADossier";
  const CONTRACT_ID = "strategyAG3RealisticReplayContract";

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const safeCall = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };
  const finiteOrNull = value => {
    if (value === null || value === undefined || typeof value === "boolean") return null;
    if (typeof value === "string" && !value.trim()) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const integerOrNull = value => {
    const n = finiteOrNull(value);
    return n === null ? null : Math.trunc(n);
  };

  function marketOwnerSnapshot() {
    const stats = safeCall(globalThis.atlasDecisionMemoryStats, null);
    if (!stats || typeof stats !== "object") return null;
    const observations = integerOrNull(stats.canonicalCount ?? stats.distinctCount ?? stats.records?.length);
    return {
      owner: "atlasDecisionMemoryStats",
      available: true,
      observations,
      source_records: integerOrNull(stats.sourceRecordCount),
      collectors: Array.isArray(stats.collectors) ? stats.collectors.length : null,
      basis: String(stats.basis || stats.analyticalBasis || "MARKET")
    };
  }

  function retrospectiveOwnerSnapshot() {
    const api = globalThis.atlasRetrospectiveValidation;
    const data = safeCall(api?.derive, null);
    if (!data || typeof data !== "object") return null;
    const currents = Array.isArray(data.currents) ? data.currents.length : integerOrNull(data.current_count);
    const evaluable = Array.isArray(data.evaluable) ? data.evaluable.length : integerOrNull(data.evaluable_count);
    return {
      owner: "atlasRetrospectiveValidation.derive",
      available: true,
      strict_time_semantics: data.strict_time_semantics === true,
      current_total: currents,
      current_evaluable: evaluable,
      market_rows: Array.isArray(data.markets) ? data.markets.length : null
    };
  }

  function explicitSeriesOwnerSnapshot() {
    /* No DOM/text fallback is allowed. Only use an explicit structured owner if one exists. */
    const candidates = [
      ["AgentCryptoMarketSeriesTruth", globalThis.AgentCryptoMarketSeriesTruth],
      ["AgentCryptoHistoricalSeries", globalThis.AgentCryptoHistoricalSeries]
    ];
    for (const [name, api] of candidates) {
      const raw = safeCall(api?.snapshot, null);
      if (!raw || typeof raw !== "object") continue;
      const points = integerOrNull(raw.points ?? raw.point_count ?? raw.series_points);
      const median = finiteOrNull(raw.median_step_min ?? raw.cadence_min);
      const completeness = finiteOrNull(raw.completeness_pct ?? raw.completeness_percent);
      const windowLabel = raw.window ?? raw.period ?? raw.window_label ?? null;
      return {
        owner: name,
        available: true,
        window: windowLabel == null || String(windowLabel).trim() === "" ? null : String(windowLabel),
        points,
        median_step_min: median,
        completeness_pct: completeness
      };
    }
    return null;
  }

  function buildSnapshot(overrides = {}) {
    const market = Object.prototype.hasOwnProperty.call(overrides, "market") ? overrides.market : marketOwnerSnapshot();
    const retrospective = Object.prototype.hasOwnProperty.call(overrides, "retrospective") ? overrides.retrospective : retrospectiveOwnerSnapshot();
    const series = Object.prototype.hasOwnProperty.call(overrides, "series") ? overrides.series : explicitSeriesOwnerSnapshot();

    const observations = integerOrNull(market?.observations);
    const currentTotal = integerOrNull(retrospective?.current_total);
    const currentEvaluable = integerOrNull(retrospective?.current_evaluable);
    const points = integerOrNull(series?.points);
    const median = finiteOrNull(series?.median_step_min);
    const completeness = finiteOrNull(series?.completeness_pct);
    const windowLabel = series?.window == null || String(series.window).trim() === "" ? null : String(series.window);

    const structuredOwners = [market?.available ? market.owner : null, retrospective?.available ? retrospective.owner : null, series?.available ? series.owner : null].filter(Boolean);
    return {
      schema: "agent_crypto_strategy_a_g3_structured_data_truth_v1",
      build: BUILD,
      source_mode: "STRUCTURED_OWNERS_ONLY",
      visible_text_parsing: false,
      dom_text_fallback: false,
      unknown_numeric_becomes_zero: false,
      owners: structuredOwners,
      market_memory: {
        available: !!market?.available,
        observations,
        source_records: integerOrNull(market?.source_records),
        collectors: integerOrNull(market?.collectors),
        basis: market?.basis || null
      },
      retrospective: {
        available: !!retrospective?.available,
        strict_time_semantics: retrospective?.strict_time_semantics === true,
        evaluable: currentEvaluable,
        total: currentTotal,
        market_rows: integerOrNull(retrospective?.market_rows)
      },
      market_series: {
        structured_owner_available: !!series?.available,
        window: windowLabel,
        points,
        median_step_min: median,
        completeness_pct: completeness
      },
      certified_outcome_labels: false,
      certified_replay_rows: 0,
      replay_contract_ready: false,
      backtest_ready: false,
      g3_state: "PENDING",
      paper_only: true,
      real_order: false,
      fabricated_data: false,
      reason: !series?.available
        ? "Structured market-memory and retrospective owners are readable; no explicit structured owner for 24h series metadata is certified yet, so those fields stay UNKNOWN."
        : "Structured candidate facts are readable, but certified replay rows and outcome labels are still absent; G3 remains PENDING."
    };
  }

  function display(value, suffix = "") {
    return value === null || value === undefined || value === "" ? "INCONNU" : `${value}${suffix}`;
  }

  function ensureStyle() {
    if (typeof document === "undefined" || byId("strategyAG3StructuredTruthStyle")) return;
    const style = document.createElement("style");
    style.id = "strategyAG3StructuredTruthStyle";
    style.textContent = `#${ROOT_ID}{margin-top:9px;padding:8px;border:1px solid rgba(117,255,206,.22);border-radius:8px;background:rgba(5,30,24,.28)}#${ROOT_ID} .g3st-title{font-size:8px;font-weight:950;letter-spacing:.08em;color:#79ffd1;text-transform:uppercase}#${ROOT_ID} .g3st-sub{font-size:8px;color:#8fb6aa;margin-top:3px}#${ROOT_ID} .g3st-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:7px}#${ROOT_ID} .g3st-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}#${ROOT_ID} .g3st-k span{font-size:7px;color:#71998d;display:block;text-transform:uppercase}#${ROOT_ID} .g3st-k b{font-size:9px;color:#effff9;display:block;margin-top:3px}#${ROOT_ID} .g3st-note{margin-top:6px;font-size:8px;color:#99b8ae}@media(max-width:900px){#${ROOT_ID} .g3st-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    if (typeof document === "undefined") return null;
    const dossier = byId(DOSSIER_ID);
    if (!dossier) return null;
    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
      root.dataset.build = BUILD;
      const contract = byId(CONTRACT_ID);
      if (contract && contract.parentElement === dossier) contract.insertAdjacentElement("afterend", root);
      else dossier.appendChild(root);
    }
    return root;
  }

  function render() {
    const root = ensureRoot();
    const data = buildSnapshot();
    if (!root) return data;
    ensureStyle();
    const series = data.market_series;
    const retro = data.retrospective;
    const market = data.market_memory;
    root.innerHTML = `
      <div class="g3st-title">G3 · STRUCTURED DATA TRUTH · ${BUILD}</div>
      <div class="g3st-sub">Autorité de certification : APIs structurées uniquement · le texte affiché n'est jamais relu comme donnée.</div>
      <div class="g3st-grid">
        <div class="g3st-k"><span>Source G3</span><b>STRUCTURED OWNERS</b></div>
        <div class="g3st-k"><span>Observations marché</span><b>${display(market.observations)}</b></div>
        <div class="g3st-k"><span>CURRENT évaluables</span><b>${display(retro.evaluable)} / ${display(retro.total)}</b></div>
        <div class="g3st-k"><span>Série points</span><b>${display(series.points)}</b></div>
        <div class="g3st-k"><span>Fenêtre</span><b>${display(series.window)}</b></div>
        <div class="g3st-k"><span>Pas médian</span><b>${display(series.median_step_min, " min")}</b></div>
        <div class="g3st-k"><span>Complétude</span><b>${display(series.completeness_pct, " %")}</b></div>
        <div class="g3st-k"><span>Text scraping</span><b>INTERDIT</b></div>
        <div class="g3st-k"><span>UNKNOWN</span><b>≠ 0</b></div>
        <div class="g3st-k"><span>Dataset replay</span><b>NOT READY</b></div>
        <div class="g3st-k"><span>G3</span><b>PENDING</b></div>
      </div>
      <div class="g3st-note">${data.reason}</div>`;
    root.dataset.g3State = data.g3_state;
    root.dataset.visibleTextParsing = "false";
    root.dataset.unknownNumericBecomesZero = "false";
    return data;
  }

  function selfTest() {
    const missing = buildSnapshot({
      market:{available:true,owner:"mock-market",observations:483,source_records:500,collectors:2,basis:"MARKET"},
      retrospective:{available:true,owner:"mock-retro",strict_time_semantics:true,current_total:2,current_evaluable:1,market_rows:483},
      series:null
    });
    const explicit = buildSnapshot({
      market:{available:true,owner:"mock-market",observations:483},
      retrospective:{available:true,owner:"mock-retro",strict_time_semantics:true,current_total:2,current_evaluable:1},
      series:{available:true,owner:"mock-series",window:"24h",points:300,median_step_min:5,completeness_pct:100}
    });
    const pass = missing.market_series.points === null
      && missing.market_series.median_step_min === null
      && missing.market_series.completeness_pct === null
      && missing.market_memory.observations === 483
      && missing.retrospective.evaluable === 1
      && missing.retrospective.total === 2
      && missing.unknown_numeric_becomes_zero === false
      && missing.visible_text_parsing === false
      && missing.backtest_ready === false
      && missing.g3_state === "PENDING"
      && explicit.market_series.points === 300
      && explicit.market_series.median_step_min === 5
      && explicit.market_series.completeness_pct === 100;
    return {schema:"agent_crypto_strategy_a_g3_structured_data_truth_self_test_v1",build:BUILD,pass,checks:{missing_stays_null:missing.market_series.points===null&&missing.market_series.median_step_min===null&&missing.market_series.completeness_pct===null,structured_counts_preserved:missing.market_memory.observations===483&&missing.retrospective.evaluable===1&&missing.retrospective.total===2,no_text_scrape:missing.visible_text_parsing===false,unknown_not_zero:missing.unknown_numeric_becomes_zero===false,no_backtest_promotion:missing.backtest_ready===false&&missing.g3_state==="PENDING",explicit_structured_series_supported:explicit.market_series.points===300&&explicit.market_series.median_step_min===5&&explicit.market_series.completeness_pct===100}};
  }

  globalThis.AgentCryptoStrategyAG3StructuredDataTruth = Object.freeze({
    build: BUILD,
    snapshot: buildSnapshot,
    render,
    self_test: selfTest,
    visible_text_parsing: false,
    dom_text_fallback: false,
    unknown_numeric_becomes_zero: false,
    certified_replay_rows: 0,
    backtest_ready: false,
    g3: "PENDING",
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network: false,
    real_order: false,
    paper_only: true
  });

  if (typeof document !== "undefined") {
    const schedule = () => { try { requestAnimationFrame(() => render()); } catch (_) { queueMicrotask(render); } };
    document.addEventListener("agent-crypto:evidence-view-refreshed", schedule);
    document.addEventListener("agent-crypto:evidence-data-changed", schedule);
    document.addEventListener("agent-crypto:runtime-modules-ready", schedule, {once:true});
    document.addEventListener("erith:system-hydrated", schedule, {passive:true});
    window.addEventListener("pageshow", schedule);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, {once:true});
    else schedule();
  }
})();