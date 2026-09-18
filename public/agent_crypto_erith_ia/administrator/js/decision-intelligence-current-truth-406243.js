/* Agent-Crypto @erith.IA — 40.6.243 + 40.6.248 + 40.6.249
   DECISION INTELLIGENCE CURRENT TRUTH SURFACE
   40.6.248 repaired stale startup truth on explicit open/residency restore.
   40.6.249 makes that refresh non-destructive: the <details> owner is never recreated by its own toggle.

   Presentation-only integration over existing read-only owners:
   Event Intelligence -> Event Memory -> Historical Analogs -> Regime -> Calibration -> Capital Survival.
   No model mutation, no network, no storage write, no timer, no observer, no order.
*/
(() => {
  "use strict";

  const BUILD = "40.6.249";
  const HOST_ID = "decisionIntelligenceCurrentTruth406243";
  const DETAILS_ID = "decisionIntelligenceCurrentTruthDetails406243";

  const esc = v => String(v ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");

  function api(name){ return globalThis[name] || null; }
  function safe(fn){ try { return typeof fn === "function" ? fn() : null; } catch(e){ return {__error:String(e?.message||e)}; } }
  function finite(v){ const n=Number(v); return Number.isFinite(n)?n:null; }

  function snapshot(){
    const acceptance = safe(api("AtlasDecisionIntelligenceAcceptance")?.matrix);
    const memory = safe(api("AtlasEventMemory")?.current);
    const analog = safe(api("AtlasHistoricalAnalogEngine405015")?.current);
    const regime = safe(api("AtlasRegimeQualifiedAnalogs")?.current);
    const calibration = safe(api("AtlasHorizonCalibration")?.current);
    const survival = safe(api("AtlasCapitalSurvival")?.current);
    const explain = safe(api("AtlasDecisionExplainability")?.current);

    const h24 = calibration?.horizons?.["+24h"] || null;
    const h48 = calibration?.horizons?.["+48h"] || null;

    return Object.freeze({
      build: BUILD,
      acceptance: acceptance?.status || "UNKNOWN",
      current_event: memory?.event_label || memory?.event_family || null,
      event_status: memory?.status || "NO_CURRENT_EVENT",
      event_id: memory?.event_id || null,
      analog_status: analog?.status || "NO_OUTPUT",
      analog_count: finite(analog?.distribution?.count) ?? 0,
      regime_status: regime?.status || "NO_OUTPUT",
      regime_count: finite(regime?.distribution?.count) ?? 0,
      calibration_status: calibration?.status || "NO_OUTPUT",
      calibration_24h_n: finite(h24?.sample_size) ?? 0,
      calibration_48h_n: finite(h48?.sample_size) ?? 0,
      capital_gate: survival?.risk_gate || survival?.status || "NO_OUTPUT",
      explain_status: explain?.status || "NO_OUTPUT",
      operator_action: explain?.operator_action || "CONSULTATION_ONLY",
      automatic_order: false,
      execution_authorized: false,
      financial_signal: false,
      storage_write: false,
      network: false,
      timer: false,
      observer: false
    });
  }

  function card(label,value,small=""){
    return `<article><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(small)}</small></article>`;
  }

  function surfaceMarkup(){
    const s=snapshot();
    return `
      <section id="${HOST_ID}" class="news-sentinel" data-build="${BUILD}">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">DECISION INTELLIGENCE · CURRENT TRUTH · ${BUILD}</p>
            <h2>Chaîne décisionnelle observée</h2>
          </div>
          <span class="pill">${esc(s.acceptance)}</span>
        </div>
        <div class="news-live-kpis">
          ${card("Événement", s.event_status, s.current_event || "aucun événement courant")}
          ${card("Analogues", s.analog_status, `${s.analog_count} observé(s)`)}
          ${card("Régime", s.regime_status, `${s.regime_count} analogue(s) qualifié(s)`)}
          ${card("Calibration", s.calibration_status, `24h n=${s.calibration_24h_n} · 48h n=${s.calibration_48h_n}`)}
          ${card("Capital Survival", s.capital_gate, "simulation uniquement")}
          ${card("Sortie", s.explain_status, s.operator_action)}
        </div>
        <p class="private-backend-note">
          Lecture descriptive uniquement · aucune mutation des modèles · aucun ordre · aucune autorisation d’exécution.
        </p>
      </section>`;
  }

  function markup(){
    return `
      <details class="atlas-collapse glass atlas-family-member atlas-tone-analysis"
               id="${DETAILS_ID}" data-collapse-key="decision-intelligence-current-truth"
               data-layout-family="analysis">
        <summary class="atlas-collapse-summary">
          <span class="atlas-collapse-copy">
            <span class="atlas-collapse-title">Decision Intelligence · vérité courante</span>
            <span class="atlas-collapse-subtitle">Event → mémoire → analogues → régime → calibration → survie capital</span>
          </span>
          <span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span>
        </summary>
        <div class="atlas-collapse-body">
          ${surfaceMarkup()}
        </div>
      </details>`;
  }

  function hostAnchor(){
    return document.getElementById("news-sentinel")
      || document.getElementById("multi-horizon")
      || document.querySelector('[data-layout-family="analysis"]');
  }

  function bindDetails(detail){
    if(!(detail instanceof HTMLDetailsElement)||detail.dataset.decisionTruthRefresh406248==="1") return false;
    detail.dataset.decisionTruthRefresh406248="1";
    detail.addEventListener("toggle",()=>{
      if(detail.open) queueMicrotask(refresh);
    });
    detail.addEventListener("erith:presentation-resident",()=>{
      if(detail.open) queueMicrotask(refresh);
    });
    return true;
  }

  function mount(){
    const existing=document.getElementById(DETAILS_ID);
    if(existing){ bindDetails(existing); return true; }
    const anchor=hostAnchor();
    if(!anchor) return false;
    anchor.insertAdjacentHTML("afterend", markup());
    bindDetails(document.getElementById(DETAILS_ID));
    return true;
  }

  function refresh(){
    const details=document.getElementById(DETAILS_ID);
    if(!details) return mount();

    const host=document.getElementById(HOST_ID);
    if(host){
      host.outerHTML=surfaceMarkup();
      return true;
    }

    const body=details.querySelector(".atlas-collapse-body");
    if(!body) return false;
    body.innerHTML=surfaceMarkup();
    return true;
  }

  function bind(){
    mount();
    bindDetails(document.getElementById(DETAILS_ID));
    document.addEventListener("erith:aether-news-open",()=>queueMicrotask(refresh),{passive:true});
    document.addEventListener("agentcrypto:current-finalized",()=>queueMicrotask(refresh),{passive:true});
    window.addEventListener("pageshow",()=>queueMicrotask(refresh),{passive:true});
  }

  globalThis.AgentCryptoDecisionIntelligenceCurrentTruth406243=Object.freeze({
    build:BUILD,mount,refresh,snapshot,
    read_only:true,storage_write:false,new_fetch:false,new_timer:false,new_observer:false,
    automatic_order:false,execution_authorized:false,financial_signal:false
  });

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
})();