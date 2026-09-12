/* Agent-Crypto @erith.IA — 40.6.105
   TRADUS ↔ Strategy A comparison truth reconciliation.
   Reproduced defect: TRADUS could retain a frozen Strategy A=OFF comparison
   while the current Strategy A lane was visibly AUTO ACTIVE / NO TRADE.
   Presentation-only reconciliation. No fetch, recurring timer, observer,
   storage owner, Strategy mutation, order, wallet or credential path. */
(() => {
  "use strict";
  const PATCH = "40.6.105";
  const PANEL_ID = "tradusShadow406066";
  const MAX_COMPARISON_AGE_SECONDS = 15;

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const upper = value => String(value ?? "").trim().toUpperCase();

  function findStrategyAScope() {
    const replay = document.getElementById("strategyAReplaySandbox404290");
    let node = replay;
    for (let i = 0; node && i < 7; i += 1, node = node.parentElement) {
      const text = String(node.innerText || "");
      if (text.includes("STRATÉGIE A") && text.includes("TRACE DÉCISION V2") && text.includes("EXPERIMENT LEDGER")) return node;
    }
    return replay?.parentElement || null;
  }

  function readStrategyA() {
    const text = String(findStrategyAScope()?.innerText || "").replace(/\u00a0/g, " ");
    const phase = text.match(/PHASE\s+(NO TRADE|OFF|PAPER|STOP|WAIT)/i)?.[1]?.toUpperCase() || null;
    const decision = phase || text.match(/D[ÉE]CISION\s*(NO TRADE|OFF|PAPER[^\n]*|STOP|WAIT)/i)?.[1]?.trim()?.toUpperCase() || "INCONNU";
    const direction = text.match(/DIRECTION\s*(?:WAIT|PASS)?\s*(-?\d+)\/100/i)?.[1] || null;
    return Object.freeze({ decision, phase, direction_score: direction === null ? null : Number(direction) });
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
      panel.dataset.comparisonFreshness406105 = "stale";
    } else {
      const suffix = row?.tick && Number.isFinite(Number(row.tick.bid)) && Number.isFinite(Number(row.tick.ask))
        ? ` · bid ${Number(row.tick.bid).toFixed(2)} / ask ${Number(row.tick.ask).toFixed(2)} €`
        : "";
      setText(panel,"status",`${current.comparison.text}${suffix}`);
      panel.dataset.comparisonFreshness406105 = "fresh";
    }
    panel.dataset.strategyATruth406105 = strategyA.decision;
    panel.dataset.reconcileReason406105 = String(reason || "runtime");
    document.documentElement.dataset.tradusStrategyReconcile406105 = "active";
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

  globalThis.AgentCryptoTradusStrategyReconcile406105 = Object.freeze({
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