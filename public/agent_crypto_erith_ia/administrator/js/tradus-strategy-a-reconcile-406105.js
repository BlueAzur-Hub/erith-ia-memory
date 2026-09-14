/* Agent-Crypto @erith.IA — 40.6.105
   TRADUS ↔ Strategy A comparison truth reconciliation.
   Reproduced defect: TRADUS could retain a frozen Strategy A=OFF comparison
   while the current Strategy A lane was visibly AUTO ACTIVE / NO TRADE.
   40.6.115 hotfix: the read-side owner now follows the live Strategy A pilot
   instead of treating the replay sandbox as the primary truth scope.
   Presentation-only reconciliation. No fetch, recurring timer, observer,
   storage owner, Strategy mutation, order, wallet or credential path. */
(() => {
  "use strict";
  const PATCH = "40.6.105";
  const PANEL_ID = "tradusShadow406066";
  const MAX_COMPARISON_AGE_SECONDS = 15;

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const upper = value => String(value ?? "").trim().toUpperCase();
  const scopeText = node => String(node?.innerText || "").replace(/\u00a0/g, " ");

  function isLiveStrategyAScope(node) {
    const text = scopeText(node);
    return /STRAT[ÉE]GIE A/i.test(text)
      && /PILOTE DE SIMULATION/i.test(text)
      && /TRACE D[ÉE]CISION V2/i.test(text)
      && /EXPERIMENT LEDGER/i.test(text);
  }

  function findStrategyAScope() {
    const replay = document.getElementById("strategyAReplaySandbox");
    let node = replay;
    let boundedFallback = null;

    // The replay sandbox is inside the Strategy A workspace. Climb only its
    // ancestor chain and keep the smallest ancestor that contains the live pilot.
    for (let i = 0; node && i < 16; i += 1, node = node.parentElement) {
      const text = scopeText(node);
      if (!boundedFallback && /TRACE D[ÉE]CISION V2/i.test(text) && /EXPERIMENT LEDGER/i.test(text)) boundedFallback = node;
      if (isLiveStrategyAScope(node)) return node;
    }

    // If the replay block has not mounted yet, inspect only semantic containers.
    // No MutationObserver and no recurring scan are introduced.
    const candidates = document.querySelectorAll("section,article");
    for (const candidate of candidates) {
      if (isLiveStrategyAScope(candidate)) return candidate;
    }

    return boundedFallback || replay?.parentElement || null;
  }

  function readStrategyA() {
    const scope = findStrategyAScope();
    const text = scopeText(scope);
    const decision = text.match(/\bD[ÉE]CISION\s*(?:[:·\-]\s*)?(NO TRADE|OFF|PAPER|STOP|WAIT)\b/i)?.[1]?.trim()?.toUpperCase()
      || text.match(/\bPHASE\s+(NO TRADE|OFF|PAPER|STOP|WAIT)\b/i)?.[1]?.trim()?.toUpperCase()
      || "INCONNU";
    const phase = text.match(/\bPHASE\s+(NO TRADE|OFF|PAPER|STOP|WAIT)\b/i)?.[1]?.trim()?.toUpperCase() || null;
    const direction = text.match(/\bDIRECTION\s*(?:WAIT|PASS)?\s*(-?\d+)\s*\/\s*100\b/i)?.[1] ?? null;
    const blocker = text.match(/1er verrou\s*:\s*([^\n·]+)/i)?.[1]?.trim()
      || text.match(/Dernier verrou\s*:?\s*([^\n·]+)/i)?.[1]?.trim()
      || null;
    return Object.freeze({
      decision,
      phase,
      direction_score: direction === null ? null : Number(direction),
      blocker,
      source: scope ? "LIVE_STRATEGY_A_SCOPE" : "UNAVAILABLE"
    });
  }

  function classifyStrategyA(a) {
    const state = upper(a?.decision || a?.phase || "INCONNU");
    if (/STOP|REJECT|REFUS|BLOCK/.test(state)) return "STOP";
    if (/PAPER|SIMUL/.test(state)) return "PAPER";
    if (/^OFF$|ARR[ÊE]T[ÉE]?|INACTIF/.test(state)) return "OFF";
    if (/NO TRADE|WAIT|INCONNU/.test(state)) return "WAIT";
    return "ACTIVE";
  }

  function compare(a, signal) {
    const aState = classifyStrategyA(a);
    const bAction = upper(signal?.action || "NO_TRADE") || "NO_TRADE";
    const directional = bAction === "BUY" || bAction === "SELL";
    if (aState === "OFF") return { state:"NON COMPARABLE", text:`A OFF · TRADUS ${directional ? bAction : "attend"}` };
    if (aState === "STOP" && directional) return { state:"OPPOSITION SÉCURITÉ", text:`A STOP · TRADUS ${bAction}` };
    if (aState === "STOP") return { state:"ACCORD PRUDENT", text:"A STOP · TRADUS attend" };
    if (aState === "WAIT" && !directional) return { state:"CONVERGENCE", text:"A attend · TRADUS attend" };
    if (aState === "WAIT") return { state:"DIVERGENCE", text:`A attend · TRADUS ${bAction}` };
    if ((aState === "PAPER" || aState === "ACTIVE") && bAction === "BUY") return { state:"CONVERGENCE POTENTIELLE", text:`A ${aState === "PAPER" ? "PAPER" : "actif"} · TRADUS BUY` };
    if ((aState === "PAPER" || aState === "ACTIVE") && bAction === "SELL") return { state:"OPPOSITION", text:`A ${aState === "PAPER" ? "PAPER" : "actif"} · TRADUS SELL` };
    return { state:"COMPARAISON", text:`A ${a?.decision || "?"} · TRADUS ${bAction}` };
  }

  function observationAgeSeconds(row, now = Date.now()) {
    const at = Date.parse(String(row?.at || ""));
    return Number.isFinite(at) ? Math.max(0, (now - at) / 1000) : null;
  }

  function model(row, strategyA, now = Date.now()) {
    if (!row) return Object.freeze({ state:"NO_DATA", strategyA, comparison:{state:"EN ATTENTE", text:"TRADUS sans observation"}, age_seconds:null, stale:true });
    const age = observationAgeSeconds(row, now);
    const stale = age === null || age > MAX_COMPARISON_AGE_SECONDS || row?.ok !== true;
    if (stale) {
      const ageText = age === null ? "âge inconnu" : `${age.toFixed(1)} s`;
      return Object.freeze({
        state:"STALE",
        strategyA,
        comparison:Object.freeze({state:"À RAFRAÎCHIR", text:`TRADUS ${upper(row?.signal?.action || "NO_TRADE")} · observation ${ageText}`}),
        age_seconds:age,
        stale:true
      });
    }
    return Object.freeze({state:"FRESH", strategyA, comparison:Object.freeze(compare(strategyA,row.signal)), age_seconds:age, stale:false});
  }

  function setText(panel, key, value) {
    const node = panel?.querySelector?.(`[data-ts="${key}"]`);
    if (node) node.textContent = String(value ?? "—");
  }

  function reconcile(reason = "runtime") {
    const panel = document.getElementById(PANEL_ID);
    const api = globalThis.AgentCryptoTradusShadow406066;
    if (!panel || !api?.read) return Object.freeze({ applied:false, reason:"OWNER_NOT_READY" });
    const row = clone(api.read());
    const strategyA = readStrategyA();
    const current = model(row, strategyA);

    setText(panel,"strategyA",strategyA.decision);
    setText(panel,"compare",current.comparison.state);
    if (current.stale) {
      setText(panel,"status",`${current.comparison.text} · comparaison Strategy A suspendue tant que le carnet TRADUS n'est pas rafraîchi.`);
      panel.dataset.comparisonFreshness = "stale";
    } else {
      const suffix = row?.tick && Number.isFinite(Number(row.tick.bid)) && Number.isFinite(Number(row.tick.ask))
        ? ` · bid ${Number(row.tick.bid).toFixed(2)} / ask ${Number(row.tick.ask).toFixed(2)} €`
        : "";
      setText(panel,"status",`${current.comparison.text}${suffix}`);
      panel.dataset.comparisonFreshness = "fresh";
    }
    panel.dataset.strategyATruth406105 = strategyA.decision;
    panel.dataset.reconcileReason406105 = String(reason || "runtime");
    document.documentElement.dataset.tradusStrategyReconcile = "active";
    return Object.freeze({applied:true,reason,current,row});
  }

  function schedule(reason) {
    queueMicrotask(() => { try { reconcile(reason); } catch (_) {} });
  }

  document.addEventListener("agentcrypto:tradus-shadow-observation",() => schedule("tradus-observation"),{passive:true});
  document.addEventListener("agentcrypto:strategy-a-auto-cycle",() => schedule("strategy-a-auto-cycle"),{passive:true});
  window.addEventListener("erith:system-hydrated",() => schedule("system-hydrated"),{once:true,passive:true});
  window.addEventListener("pageshow",() => schedule("pageshow"),{passive:true});
  document.addEventListener("click",event => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    const label = upper(button?.innerText || "");
    if (/RAFRAÎCHIR TRADUS|AUTO A ACTIF|STOP AUTO|RAFRAÎCHIR MARCHÉ|RELANCER MAINTENANT/.test(label)) schedule("operator-action");
  },true);

  if (document.readyState === "complete") schedule("boot");
  else window.addEventListener("load",() => schedule("load"),{once:true,passive:true});

  function selfTest() {
    const wait = Object.freeze({decision:"NO TRADE",phase:"NO TRADE",direction_score:5});
    const off = Object.freeze({decision:"OFF",phase:"OFF",direction_score:null});
    const sell = Object.freeze({action:"SELL"});
    const fresh = {ok:true,at:new Date().toISOString(),signal:sell};
    const stale = {ok:true,at:new Date(Date.now()-60000).toISOString(),signal:sell};
    const checks = [
      compare(wait,sell).state === "DIVERGENCE",
      compare(off,sell).state === "NON COMPARABLE",
      model(fresh,wait).comparison.state === "DIVERGENCE",
      model(stale,wait).comparison.state === "À RAFRAÎCHIR"
    ];
    return Object.freeze({pass:checks.every(Boolean),checks:Object.freeze(checks),total:checks.length,passed:checks.filter(Boolean).length});
  }

  globalThis.AgentCryptoTradusStrategyReconcile = Object.freeze({
    patch:PATCH,
    max_comparison_age_seconds:MAX_COMPARISON_AGE_SECONDS,
    readStrategyA,
    compare,
    model,
    reconcile,
    selfTest,
    fetch:false,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    strategy_mutation:false,
    trading:false,
    wallet:false
  });
})();