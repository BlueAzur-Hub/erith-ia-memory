/* Agent-Crypto @erith.IA — 40.6.217 HEADER RESTORE + INLINE OPERATOR ACCESS
   Terrain 40.6.216 proved the BODY_START sticky operator strip displaced the canonical
   header visually. This repair removes the 40.6.215/216 standalone bars, restores the
   native header as the first visual navigation surface, keeps Gate-3 state inside the
   Evidence area, and adds only a compact Créatrice shortcut beside the existing Projects
   cluster when that canonical anchor is present.
   Presentation only: no Market Core, Strategy A, Atlas, Oracle, Risk, Gate, storage,
   network or order behavior is changed. */
(() => {
  "use strict";
  const BUILD = "40.6.217";
  const ROOT_ID = "administratorOperatorFocus406217";
  const SUMMARY_ID = "administratorOperatorEvidenceSummary406217";
  const CREATOR_ID = "administratorCreatorShortcut406217";
  let queued = false;

  const byId = id => typeof document !== "undefined" ? document.getElementById(id) : null;
  const esc = v => String(v ?? "—").replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[m]));

  function cleanupLegacyBars() {
    ["administratorOperatorFocus406215","administratorOperatorFocus406216"].forEach(id => byId(id)?.remove());
  }

  function ensureStyle() {
    if (byId(`${ROOT_ID}Style`)) return;
    const style = document.createElement("style");
    style.id = `${ROOT_ID}Style`;
    style.textContent = `
      #${SUMMARY_ID}{position:static!important;margin:8px 0 10px!important;padding:8px 10px!important;border:1px solid rgba(111,238,255,.20)!important;border-radius:10px!important;background:linear-gradient(135deg,rgba(5,20,31,.62),rgba(8,22,37,.44))!important;box-shadow:none!important;display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}
      #${SUMMARY_ID} .aof217-state{flex:1 1 420px;font:850 10.5px/1.35 system-ui,sans-serif;color:#dfeff6}
      #${SUMMARY_ID} .aof217-state b{color:#9fffd9}
      #${SUMMARY_ID} .aof217-actions{display:flex;gap:6px;flex-wrap:wrap}
      #${SUMMARY_ID} button,#${CREATOR_ID}{appearance:none;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.045);color:#ddecf4;padding:6px 9px;font:900 9px/1 system-ui,sans-serif;cursor:pointer}
      #${SUMMARY_ID} button:hover,#${CREATOR_ID}:hover{border-color:rgba(120,238,255,.42);background:rgba(73,192,226,.12)}
      #${CREATOR_ID}{margin-left:6px;border-color:rgba(255,176,232,.26);color:#ffd2ef;vertical-align:middle}
      #strategyAEvidenceSupplements{font-size:12px!important;line-height:1.45!important}
      #strategyAEvidenceSupplements .saesh-title{font-size:12px!important;letter-spacing:.07em!important}
      #strategyAEvidenceSupplements .saesh-sub,#strategyAEvidenceSupplements .saesh-state{font-size:10px!important}
      #strategyAG3CascadeCheckpoint,#strategyAG3DurableDecisionEvidence,#strategyAG3PostHorizonOutcome,#strategyAG3T0WindowOverlapProof{box-shadow:0 0 0 1px rgba(118,235,255,.06),0 8px 18px rgba(0,0,0,.12)}
      .aerith10-loader-card::before{background-size:contain!important;background-position:center top!important;background-repeat:no-repeat!important;background-color:rgba(7,10,20,.88)!important;min-height:160px!important;max-height:none!important}
      @media(max-width:900px){#${SUMMARY_ID}{padding:7px 8px!important}.aerith10-loader-card::before{min-height:120px!important}}
    `;
    document.head.appendChild(style);
  }

  function truth() {
    let cp = null, out = null;
    try { cp = globalThis.AgentCryptoStrategyAG3CascadeCheckpoint?.snapshot?.() || null; } catch (_) {}
    try { out = globalThis.AgentCryptoStrategyAG3PostHorizonOutcome?.snapshot?.() || null; } catch (_) {}
    const joined = Number(cp?.dataset?.joined_count ?? cp?.checkpoint?.joined_rows ?? 0);
    const replayReady = cp?.dataset?.ready === true || cp?.dataset?.status === "READY_FOR_DECISION_REPLAY" || cp?.checkpoint?.replay_dataset === "READY_FOR_DECISION_REPLAY";
    const got = Number(out?.certified_horizons || 0);
    const total = Number(out?.expected_horizons || 0);
    return {cp,out,joined,replayReady,got,total};
  }

  function humanState() {
    const t = truth();
    if (t.replayReady || t.joined > 0) {
      const suffix = t.total > 0 ? ` · résultats post-T0 ${esc(t.got)} / ${esc(t.total)}` : " · résultats post-T0 en cours";
      return `<b>Gate 3 · dataset replay prêt.</b> ${esc(t.joined)} décision(s) raccordée(s)${suffix}.`;
    }
    return `<b>Gate 3 · preuves.</b> État détaillé disponible dans le dossier ci-dessous.`;
  }

  function jump(name) {
    let target = null;
    if (name === "top") { window.scrollTo({top:0,behavior:"smooth"}); return true; }
    if (name === "creator") target = byId("aerith10-creator");
    if (name === "market") target = document.querySelector("#market-workspace,[data-window-key='market-workspace']");
    if (!target) return false;
    if (name === "creator" && "open" in target) target.open = true;
    target.scrollIntoView({behavior:"smooth",block:"start"});
    return true;
  }

  function ensureCreatorShortcut() {
    let button = byId(CREATOR_ID);
    const anchor = byId("atlasProjectsCluster");
    if (!anchor?.parentElement) return null;
    if (!button) {
      button = document.createElement("button");
      button.id = CREATOR_ID;
      button.type = "button";
      button.textContent = "Créatrice";
      button.setAttribute("aria-label","Ouvrir Aerith-10 Créatrice");
      button.addEventListener("click", () => jump("creator"));
    }
    if (button.parentElement !== anchor.parentElement || button.previousElementSibling !== anchor) anchor.insertAdjacentElement("afterend",button);
    return button;
  }

  function ensureEvidenceSummary() {
    const host = byId("strategyAEvidenceSupplements") || byId("strategyADossier");
    if (!host) return null;
    let root = byId(SUMMARY_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = SUMMARY_ID;
      root.innerHTML = `<div class="aof217-state" data-aof217-state></div><div class="aof217-actions"><button type="button" data-jump="top">↑ Haut</button><button type="button" data-jump="market">Marché</button><button type="button" data-jump="creator">Créatrice</button></div>`;
      root.addEventListener("click", event => {
        const b = event.target.closest?.("button[data-jump]");
        if (b) jump(b.dataset.jump);
      });
    }
    if (host.firstElementChild !== root) host.prepend(root);
    root.dataset.build = BUILD;
    const state = root.querySelector("[data-aof217-state]");
    if (state) state.innerHTML = humanState();
    return root;
  }

  function refresh(reason = "explicit") {
    if (typeof document === "undefined") return Object.freeze({build:BUILD,available:false});
    cleanupLegacyBars();
    ensureStyle();
    const creator = ensureCreatorShortcut();
    const summary = ensureEvidenceSummary();
    if (summary) summary.dataset.refreshReason = String(reason || "explicit");
    return Object.freeze({
      build:BUILD,
      legacy_bars_removed:!byId("administratorOperatorFocus406215")&&!byId("administratorOperatorFocus406216"),
      creator_shortcut_present:!!creator,
      evidence_summary_present:!!summary,
      body_start_owned:false,
      canonical_header_preserved:true,
      state_text:summary?.querySelector("[data-aof217-state]")?.textContent||""
    });
  }

  function schedule(reason = "event") {
    if (queued) return;
    queued = true;
    const run = () => { queued=false; refresh(reason); };
    try { requestAnimationFrame(() => requestAnimationFrame(run)); }
    catch (_) { queueMicrotask(run); }
  }

  globalThis.AgentCryptoAdministratorOperatorFocus = Object.freeze({
    build:BUILD,
    root_id:SUMMARY_ID,
    refresh,
    jump,
    truth,
    mount:"EVIDENCE_INLINE_PLUS_CREATOR_SHORTCUT",
    presentation_only:true,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    business_network_request:false,
    market_core_modified:false,
    strategy_a_business_logic_modified:false,
    real_order:false
  });

  if (typeof document !== "undefined") {
    document.addEventListener("agent-crypto:evidence-refresh-complete", () => schedule("evidence-refresh-complete"));
    document.addEventListener("agent-crypto:evidence-data-changed", () => schedule("evidence-data-changed"));
    document.addEventListener("agent-crypto:market-series-updated", () => schedule("market-series-updated"));
    document.addEventListener("agent-crypto:g3-post-horizon-mounted", () => schedule("post-horizon-mounted"));
    window.addEventListener("pageshow", () => schedule("pageshow"));
    window.addEventListener("load", () => schedule("load"), {once:true});
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => schedule("dom-ready"), {once:true});
    else schedule("script-load");
  }
})();
