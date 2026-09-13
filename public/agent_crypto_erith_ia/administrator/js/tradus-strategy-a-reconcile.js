/* Agent-Crypto @erith.IA — canonical TRADUS / Strategy A reconciliation owner.
   Introduced as the active canonical filename in Build 40.6.110.
   40.6.115 terrain repair: the current visible Strategy A pilot is the runtime read-side truth
   when the historical 40.6.105 DOM scope is stale, absent or contradictory.
   40.6.117 R3: preserve innerText when usable, then fall back to textContent so collapsed
   Strategy A truth cannot silently fall through to historical OFF / UNKNOWN state.
   Git carries history; the active functional filename does not carry a build number.

   Contract:
   - UNKNOWN is not WAIT;
   - UNKNOWN cannot yield CONVERGENCE or DIVERGENCE;
   - a known NO TRADE remains a legitimate WAIT state;
   - visible current Strategy A truth wins over historical/frozen OFF state;
   - presentation/read-side only: no fetch, timer, observer, storage, strategy mutation,
     order, wallet or credential path. */
(() => {
  "use strict";

  const RELEASE = "40.6.117-r3";
  const PANEL_ID = "tradusShadow406066";
  const MAX_COMPARISON_AGE_SECONDS = 15;
  const upper = value => String(value ?? "").trim().toUpperCase();
  const prior = globalThis.AgentCryptoTradusStrategyReconcile406105;

  function stateOf(a) {
    const value = upper(a?.decision || a?.phase || "");
    if (!value || value === "INCONNU" || value === "UNKNOWN" || value === "N/D" || value === "—") return "UNKNOWN";
    if (/STOP|REJECT|REFUS|BLOCK/.test(value)) return "STOP";
    if (/PAPER|SIMUL/.test(value)) return "PAPER";
    if (/^OFF$|ARR[ÊE]T[ÉE]?|INACTIF/.test(value)) return "OFF";
    if (/NO TRADE|WAIT/.test(value)) return "WAIT";
    return "ACTIVE";
  }

  function sliceStrategyAText(body) {
    const source = String(body || "").replace(/\u00a0/g, " ");
    if (!source) return "";
    const normalized = upper(source);
    const markers = ["STRATÉGIE A · PAPER AUTOMATIQUE", "STRATEGIE A · PAPER AUTOMATIQUE"];
    let start = -1;
    for (const marker of markers) {
      start = normalized.indexOf(marker);
      if (start >= 0) break;
    }
    if (start < 0) return "";
    const ends = ["TRADUS / YOHAN", "MULTI-STRATEGY SHADOW LEDGER"]
      .map(marker => normalized.indexOf(marker, start + 1))
      .filter(index => index > start);
    const end = ends.length ? Math.min(...ends) : Math.min(source.length, start + 14000);
    return source.slice(start, end);
  }

  function visibleStrategyAText() {
    const visible = sliceStrategyAText(document.body?.innerText || "");
    if (/D[ÉE]CISION\s*(NO TRADE|OFF|PAPER|STOP|WAIT)|PHASE\s+(NO TRADE|OFF|PAPER|STOP|WAIT)/i.test(visible)) return visible;
    const complete = sliceStrategyAText(document.body?.textContent || "");
    return complete || visible;
  }

  function parseVisibleStrategyA(text) {
    const source = String(text || "").replace(/\u00a0/g, " ");
    const decision = source.match(/D[ÉE]CISION\s*(NO TRADE|OFF|PAPER|STOP|WAIT)/i)?.[1]?.trim()?.toUpperCase() || null;
    const phase = source.match(/PHASE\s+(NO TRADE|OFF|PAPER|STOP|WAIT)/i)?.[1]?.trim()?.toUpperCase() || null;
    const directionRaw = source.match(/DIRECTION\s*(?:WAIT|PASS)?\s*([+-]?\d+)\s*\/\s*100/i)?.[1] || null;
    const blocker = source.match(/1er verrou\s*:\s*([^\n·]+)/i)?.[1]?.trim()
      || source.match(/Dernier verrou\s*([^\n·]+)/i)?.[1]?.trim()
      || null;
    const reason = source.match(/Lecture\s*([^\n]+)/i)?.[1]?.trim() || null;
    const resolvedDecision = decision || phase || "INCONNU";
    return Object.freeze({
      decision: resolvedDecision,
      phase: phase || decision || null,
      direction_score: directionRaw === null ? null : Number(directionRaw),
      blocker,
      reason,
      auto_active: /AUTO A ACTIF/i.test(source),
      source: resolvedDecision === "INCONNU" ? "VISIBLE_STRATEGY_A_UNRESOLVED" : "VISIBLE_STRATEGY_A_PILOT"
    });
  }

  function readStrategyA() {
    const visible = parseVisibleStrategyA(visibleStrategyAText());
    if (stateOf(visible) !== "UNKNOWN") return visible;

    let historical = null;
    try { historical = prior?.readStrategyA?.() || null; } catch (_) { historical = null; }
    if (stateOf(historical) !== "UNKNOWN") {
      return Object.freeze({
        decision: String(historical?.decision || "INCONNU"),
        phase: historical?.phase || null,
        direction_score: Number.isFinite(Number(historical?.direction_score)) ? Number(historical.direction_score) : null,
        blocker: null,
        reason: null,
        auto_active: false,
        source: "HISTORICAL_RECONCILE_FALLBACK"
      });
    }

    return Object.freeze({
      decision: "INCONNU",
      phase: null,
      direction_score: null,
      blocker: null,
      reason: null,
      auto_active: false,
      source: "NO_STRATEGY_A_TRUTH"
    });
  }

  function compareFailClosed(a, signal) {
    const state = stateOf(a);
    const action = upper(signal?.action || "NO_TRADE") || "NO_TRADE";
    if (state === "UNKNOWN") {
      return Object.freeze({
        state: "NON COMPARABLE",
        text: `Strategy A inconnue · TRADUS ${action}`,
        fail_closed: true
      });
    }
    if (prior?.compare) {
      try { return Object.freeze({ ...prior.compare(a, signal), fail_closed: false }); } catch (_) {}
    }
    const directional = action === "BUY" || action === "SELL";
    if (state === "OFF") return Object.freeze({ state:"NON COMPARABLE", text:`A OFF · TRADUS ${directional ? action : "attend"}`, fail_closed:false });
    if (state === "STOP" && directional) return Object.freeze({ state:"OPPOSITION SÉCURITÉ", text:`A STOP · TRADUS ${action}`, fail_closed:false });
    if (state === "STOP") return Object.freeze({ state:"ACCORD PRUDENT", text:"A STOP · TRADUS attend", fail_closed:false });
    if (state === "WAIT" && !directional) return Object.freeze({ state:"CONVERGENCE", text:"A attend · TRADUS attend", fail_closed:false });
    if (state === "WAIT") return Object.freeze({ state:"DIVERGENCE", text:`A attend · TRADUS ${action}`, fail_closed:false });
    if ((state === "PAPER" || state === "ACTIVE") && action === "BUY") return Object.freeze({ state:"CONVERGENCE POTENTIELLE", text:`A ${state === "PAPER" ? "PAPER" : "actif"} · TRADUS BUY`, fail_closed:false });
    if ((state === "PAPER" || state === "ACTIVE") && action === "SELL") return Object.freeze({ state:"OPPOSITION", text:`A ${state === "PAPER" ? "PAPER" : "actif"} · TRADUS SELL`, fail_closed:false });
    return Object.freeze({ state:"COMPARAISON", text:`A ${a?.decision || "?"} · TRADUS ${action}`, fail_closed:false });
  }

  function observationAgeSeconds(row) {
    const at = Date.parse(String(row?.at || ""));
    return Number.isFinite(at) ? Math.max(0, (Date.now() - at) / 1000) : null;
  }

  function setText(panel, key, value) {
    const node = panel?.querySelector?.(`[data-ts="${key}"]`);
    if (node) node.textContent = String(value ?? "—");
  }

  function enforce(reason = "runtime") {
    const panel = document.getElementById(PANEL_ID);
    const shadow = globalThis.AgentCryptoTradusShadow406066;
    if (!panel || !shadow?.read) {
      return Object.freeze({ applied: false, reason: "OWNER_NOT_READY" });
    }

    const a = readStrategyA();
    const row = shadow.read?.() || null;
    const age = observationAgeSeconds(row);
    const stale = !row || row?.ok !== true || age === null || age > MAX_COMPARISON_AGE_SECONDS;
    const comparison = stale
      ? Object.freeze({state:"À RAFRAÎCHIR", text:`TRADUS ${upper(row?.signal?.action || "NO_TRADE")} · ${age === null ? "âge inconnu" : `observation ${age.toFixed(1)} s`}`, fail_closed:true})
      : compareFailClosed(a, row?.signal);

    setText(panel, "strategyA", a.decision);
    setText(panel, "compare", comparison.state);

    if (stale) {
      setText(panel, "status", `${comparison.text} · comparaison Strategy A suspendue tant que le carnet TRADUS n'est pas rafraîchi.`);
      panel.dataset.comparisonFreshness406105 = "stale";
    } else {
      const suffix = row?.tick && Number.isFinite(Number(row.tick.bid)) && Number.isFinite(Number(row.tick.ask))
        ? ` · bid ${Number(row.tick.bid).toFixed(2)} / ask ${Number(row.tick.ask).toFixed(2)} €`
        : "";
      setText(panel, "status", `${comparison.text}${suffix}`);
      panel.dataset.comparisonFreshness406105 = "fresh";
    }

    panel.dataset.strategyATruth406105 = a.decision;
    panel.dataset.strategyATruthSource406115 = a.source;
    panel.dataset.reconcileReason = String(reason || "runtime");
    document.documentElement.dataset.tradusStrategyAFailClosed = stateOf(a) === "UNKNOWN" ? "active" : "resolved";
    document.documentElement.dataset.strategyATruth406115 = a.decision.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return Object.freeze({ applied: true, reason, strategyA:a, comparison, stale, age_seconds:age });
  }

  function schedule(reason) {
    queueMicrotask(() => { try { enforce(reason); } catch (_) {} });
  }

  document.addEventListener("agentcrypto:tradus-shadow-observation", () => schedule("tradus-observation"), { passive: true });
  document.addEventListener("agentcrypto:strategy-a-auto-cycle", () => schedule("strategy-a-auto-cycle"), { passive: true });
  window.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), { once: true, passive: true });
  window.addEventListener("pageshow", () => schedule("pageshow"), { passive: true });
  document.addEventListener("click", event => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    const label = upper(button?.innerText || "");
    if (/RAFRAÎCHIR TRADUS|AUTO A ACTIF|STOP AUTO|RAFRAÎCHIR MARCHÉ|RELANCER MAINTENANT/.test(label)) schedule("operator-action");
  }, true);
  if (document.readyState === "complete") schedule("boot");
  else window.addEventListener("load", () => schedule("load"), { once: true, passive: true });

  function selfTest() {
    const parsed = parseVisibleStrategyA("STRATÉGIE A · PAPER AUTOMATIQUE\nPilote de simulation\nAUTO A ACTIF\nDécision NO TRADE\nTRACE DÉCISION V2 · LECTURE SEULE\nPHASE NO TRADE · PROPOSAL NO_TRADE · 1er verrou : DIRECTION\nDIRECTION WAIT\n-6/100");
    const checks = [
      parsed.decision === "NO TRADE" && parsed.direction_score === -6 && parsed.blocker === "DIRECTION" && parsed.auto_active === true,
      compareFailClosed({ decision: "INCONNU" }, { action: "SELL" }).state === "NON COMPARABLE",
      stateOf({ decision: "NO TRADE" }) === "WAIT",
      compareFailClosed({ decision: "NO TRADE" }, { action: "SELL" }).state === "DIVERGENCE",
      stateOf({ decision: "OFF" }) === "OFF"
    ];
    return Object.freeze({
      pass: checks.every(Boolean),
      total: checks.length,
      passed: checks.filter(Boolean).length,
      checks: Object.freeze(checks)
    });
  }

  globalThis.AgentCryptoTradusStrategyFailClosed = Object.freeze({
    release: RELEASE,
    active: true,
    canonical_file: "js/tradus-strategy-a-reconcile.js",
    readStrategyA,
    parseVisibleStrategyA,
    stateOf,
    compare: compareFailClosed,
    enforce,
    selfTest,
    visible_runtime_truth_preferred: true,
    hidden_runtime_truth_fallback: true,
    unknown_is_wait: false,
    unknown_can_converge: false,
    fetch: false,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    strategy_mutation: false,
    trading: false,
    wallet: false
  });
})();