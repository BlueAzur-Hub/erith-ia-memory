/* Agent-Crypto @erith.IA — 40.6.216 ADMINISTRATOR OPERATOR FOCUS REPAIR
   Terrain 40.6.215 proved the operator strip existed but was exported at the bottom
   of the document and could retain an early stale Gate-3 message. This repair mounts
   the strip at the start of <body>, recomputes status from the current checkpoint
   truth, and refreshes on existing evidence/market lifecycle events and operator
   actions. Presentation only: no Strategy A, Market Core, storage, network or order
   behavior is changed. */
(() => {
  "use strict";
  const BUILD = "40.6.216";
  const ROOT_ID = "administratorOperatorFocus406216";
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[m]));

  function ensureStyle() {
    if (typeof document === "undefined" || byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `
      #${ROOT_ID}{position:sticky;top:0;z-index:1900;margin:0;padding:8px 12px;border-bottom:1px solid rgba(111,238,255,.24);background:rgba(4,15,27,.96);backdrop-filter:blur(12px);box-shadow:0 8px 24px rgba(0,0,0,.22);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      #${ROOT_ID} .aof-state{flex:1 1 430px;min-width:260px;font:850 11px/1.35 system-ui,sans-serif;color:#e7f8ff}
      #${ROOT_ID} .aof-state b{color:#9fffd9}#${ROOT_ID} .aof-nav{display:flex;gap:6px;flex-wrap:wrap}
      #${ROOT_ID} button{appearance:none;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(255,255,255,.055);color:#ddecf4;padding:7px 10px;font:900 10px/1 system-ui,sans-serif;cursor:pointer}
      #${ROOT_ID} button:hover{border-color:rgba(120,238,255,.42);background:rgba(73,192,226,.12)}
      #${ROOT_ID} button[data-aof="creator"]{border-color:rgba(255,176,232,.25);color:#ffd2ef}
      #strategyAEvidenceSupplements{font-size:12px!important;line-height:1.45!important}
      #strategyAEvidenceSupplements .saesh-title{font-size:12px!important;letter-spacing:.07em!important}
      #strategyAEvidenceSupplements .saesh-sub,#strategyAEvidenceSupplements .saesh-state{font-size:10px!important}
      #strategyAEvidenceSupplements section [style*="font-size:8px"],#strategyAEvidenceSupplements section [style*="font-size: 8px"]{font-size:10.5px!important;line-height:1.4!important}
      #strategyAEvidenceSupplements section [style*="font-size:7px"],#strategyAEvidenceSupplements section [style*="font-size: 7px"]{font-size:9.5px!important}
      #strategyAEvidenceSupplements small{font-size:9.5px!important}
      #strategyAG3CascadeCheckpoint,#strategyAG3DurableDecisionEvidence,#strategyAG3PostHorizonOutcome,#strategyAG3T0WindowOverlapProof{box-shadow:0 0 0 1px rgba(118,235,255,.06),0 8px 18px rgba(0,0,0,.12)}
      #strategyAG3StructuredTruth,#strategyAG3HistoryOwnerDiscovery,#strategyAG3HistoricalEvidenceAdapter,#strategyAG3T0DecisionProof,#strategyAG3ReplayDataset,#strategyAG3DecisionReplay{opacity:.88}
      .aerith10-loader-card::before{background-size:contain!important;background-position:center top!important;background-repeat:no-repeat!important;background-color:rgba(7,10,20,.88)!important;min-height:160px!important;max-height:none!important}
      .aerith10-creator-quick-link[data-aof-enhanced="true"]{font-weight:950!important;outline:1px solid rgba(255,177,231,.16);outline-offset:1px}
      @media(max-width:900px){#${ROOT_ID}{padding:7px 8px}.aerith10-loader-card::before{min-height:120px!important}}
    `;
    document.head.appendChild(style);
  }

  function findSection(regex) {
    const candidates = Array.from(document.querySelectorAll("h1,h2,h3,h4,summary,.section-title,.panel-title"));
    const hit = candidates.find(n => regex.test(String(n.textContent || "").replace(/\s+/g," ").trim()));
    return hit?.closest?.("section,details,article,main") || hit || null;
  }

  function resolveTarget(name) {
    if (name === "top") return document.body;
    if (name === "evidence") return byId("strategyAEvidenceSupplements") || byId("strategyADossier");
    if (name === "creator") return byId("aerith10-creator");
    if (name === "simulation") return findSection(/Simulation micro-transactions|Pilote de simulation/i);
    if (name === "market") return findSection(/Comparaison BTC|Prix du marché des cryptomonnaies|MARKET SNAPSHOT/i);
    return null;
  }

  function jump(name) {
    if (name === "top") { window.scrollTo({top:0,behavior:"smooth"}); return true; }
    const target = resolveTarget(name);
    if (!target) return false;
    if (name === "creator" && "open" in target) target.open = true;
    target.scrollIntoView({behavior:"smooth",block:"start"});
    return true;
  }

  function truth() {
    let cp = null, out = null;
    try { cp = globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.snapshot?.() || null; } catch (_) {}
    try { out = globalThis.AgentCryptoStrategyAG3PostHorizonOutcome?.snapshot?.() || null; } catch (_) {}
    const temporalCertified = cp?.temporal?.certified === true || cp?.checkpoint?.temporal_contract === "CERTIFIED";
    const certifiedT0 = Number(cp?.t0?.certified_rows ?? cp?.checkpoint?.certified_t0 ?? 0);
    const joined = Number(cp?.dataset?.joined_count ?? cp?.checkpoint?.joined_rows ?? 0);
    const replayReady = cp?.dataset?.ready === true || cp?.dataset?.status === "READY_FOR_DECISION_REPLAY" || cp?.checkpoint?.replay_dataset === "READY_FOR_DECISION_REPLAY";
    const got = Number(out?.certified_horizons || 0);
    const total = Number(out?.expected_horizons || 0);
    return {cp,out,temporalCertified,certifiedT0,joined,replayReady,got,total};
  }

  function humanState() {
    const t = truth();
    if (t.replayReady || t.joined > 0) {
      const outcome = t.total > 0 ? ` · résultats post-T0 ${esc(t.got)} / ${esc(t.total)}` : " · résultats post-T0 en cours";
      return `<b>Gate 3 · dataset replay prêt.</b> ${esc(t.joined)} décision(s) raccordée(s)${outcome}.`;
    }
    if (t.temporalCertified && t.certifiedT0 > 0) return `<b>Gate 3.</b> Fenêtre 24 h certifiée · ${esc(t.certifiedT0)} T0 certifié(s) · attente de jointure.`;
    if (t.temporalCertified) return `<b>Gate 3.</b> Fenêtre 24 h certifiée · attente d’une décision PAPER certifiée.`;
    return `<b>Gate 3.</b> Fenêtre historique 24 h en cours de certification.`;
  }

  function ensureRoot() {
    if (typeof document === "undefined" || !document.body) return null;
    ensureStyle();
    let root = byId(ROOT_ID);
    if (!root) {
      root = document.createElement("nav");
      root.id = ROOT_ID;
      root.setAttribute("aria-label","Navigation opérateur Administrator");
      root.innerHTML = `<div class="aof-state" data-aof-state></div><div class="aof-nav"><button type="button" data-aof="top">↑ Haut</button><button type="button" data-aof="market">Marché</button><button type="button" data-aof="simulation">Simulation</button><button type="button" data-aof="evidence">Gate 3 / preuves</button><button type="button" data-aof="creator">Créatrice</button></div>`;
      root.addEventListener("click", event => {
        const b = event.target.closest?.("button[data-aof]");
        if (b) jump(b.dataset.aof);
      });
    }
    if (document.body.firstElementChild !== root) document.body.prepend(root);
    root.dataset.build = BUILD;
    root.dataset.mount = "BODY_START";
    const state = root.querySelector("[data-aof-state]");
    if (state) state.innerHTML = humanState();
    document.querySelectorAll('a[href="#aerith10-creator"]').forEach(a => a.dataset.aofEnhanced = "true");
    return root;
  }

  function refresh(reason = "explicit") {
    const root = ensureRoot();
    if (root) root.dataset.refreshReason = String(reason || "explicit");
    return Object.freeze({build:BUILD,root_present:!!root,body_first:document.body?.firstElementChild===root,creator_present:!!byId("aerith10-creator"),evidence_present:!!byId("strategyAEvidenceSupplements"),state_text:root?.querySelector("[data-aof-state]")?.textContent||""});
  }

  function schedule(reason = "event") {
    if (queued) return;
    queued = true;
    const run = () => { queued=false; refresh(reason); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  globalThis.AgentCryptoAdministratorOperatorFocus = Object.freeze({
    build:BUILD,root_id:ROOT_ID,refresh,jump,truth,
    mount:"BODY_START",presentation_only:true,recurring_timer:false,observer:false,storage_write:false,
    business_network_request:false,market_core_modified:false,strategy_a_business_logic_modified:false,real_order:false
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:evidence-refresh-complete", () => schedule("evidence-refresh-complete"));
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"));
    document.addEventListener("agent-crypto:market-series-updated", () => schedule("market-series-updated"));
    document.addEventListener("agent-crypto:g3-post-horizon-mounted", () => schedule("post-horizon-mounted"));
    document.addEventListener("erith:system-hydrated", () => schedule("system-hydrated"), {passive:true});
    document.addEventListener("agent-crypto:runtime-modules-ready", () => schedule("runtime-modules-ready"), {once:true});
    document.addEventListener("click", event => {
      const b = event?.target?.closest?.("button");
      if (b && /rafraîchir\s+marché|actualiser\s+preuves|enregistrer\s+la\s+prochaine\s+décision/i.test(String(b.textContent || ""))) schedule("operator-action");
    }, false);
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
