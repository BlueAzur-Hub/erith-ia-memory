/* Agent-Crypto @erith.IA — 40.6.252
   DECISION INTELLIGENCE CURRENT TRUTH — LIGHTWEIGHT READ-ONLY SURFACE

   Reads already-rendered DOM truth only.
   No calls to EventMemory / Analog / Regime / Calibration / Capital Survival engines.
   No fetch, no timer, no observer, no storage write, no order.
*/
(() => {
  "use strict";

  const BUILD = "40.6.252";
  const DETAILS_ID = "decisionIntelligenceCurrentTruthLite406252";
  const HOST_ID = "decisionIntelligenceCurrentTruthLiteHost406252";

  const esc = value => String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

  function text(id, fallback="—"){
    const node=document.getElementById(id);
    const value=String(node?.textContent || "").trim();
    return value || fallback;
  }

  function eventState(){
    const fact=text("newsMarketEventFact","Aucun événement principal qualifié.");
    const empty=/aucun événement principal qualifié/i.test(fact);
    return {
      status: empty ? "NO_CURRENT_EVENT" : "EVENT_VISIBLE",
      fact,
      proof:text("newsMarketEventProof", empty ? "News Sentinel en attente." : "preuve déjà rendue")
    };
  }

  function snapshot(){
    const event=eventState();
    return Object.freeze({
      build:BUILD,
      mode:"LIGHT_DOM_READ_ONLY",
      event_status:event.status,
      event_fact:event.fact,
      event_proof:event.proof,
      demand:text("newsMarketDemand","NON QUALIFIÉ"),
      market_confirmation:text("newsMarketMarketConfirmation","Marché à comparer."),
      mechanism:text("newsMarketMechanismTitle","MÉCANISME NON QUALIFIÉ"),
      timeline:text("newsMarketTimelineState","NON CALCULÉ"),
      analogues:"NON CALCULÉ · moteur lourd désactivé",
      regime:"NON CALCULÉ · moteur lourd désactivé",
      calibration:"NON CALCULÉ · moteur lourd désactivé",
      capital_survival:"LECTURE SEULE · paper uniquement",
      output:"CONSULTATION_ONLY",
      automatic_order:false,
      execution_authorized:false,
      financial_signal:false,
      storage_write:false,
      network:false,
      timer:false,
      observer:false
    });
  }

  function card(label,value,small=""){
    return `<article><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(small)}</small></article>`;
  }

  function bodyMarkup(){
    const s=snapshot();
    return `
      <section id="${HOST_ID}" class="news-sentinel" data-build="${BUILD}" data-mode="light-dom-read-only">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">DECISION INTELLIGENCE · CURRENT TRUTH · ${BUILD}</p>
            <h2>Chaîne décisionnelle observée</h2>
          </div>
          <span class="pill">LÉGER</span>
        </div>
        <div class="news-live-kpis">
          ${card("Événement",s.event_status,s.event_fact)}
          ${card("Analogues",s.analogues,"aucun recalcul historique")}
          ${card("Régime",s.regime,"aucun recalcul de régime")}
          ${card("Calibration",s.calibration,"aucun recalcul statistique")}
          ${card("Capital Survival",s.capital_survival,"aucune exécution")}
          ${card("Sortie",s.output,s.market_confirmation)}
        </div>
        <p class="private-backend-note">
          Lecture légère des informations déjà rendues · aucun moteur lourd relancé · aucune mutation · aucun ordre · aucune autorisation d’exécution.
        </p>
      </section>`;
  }

  function markup(){
    return `
      <details class="atlas-collapse glass atlas-family-member atlas-tone-analysis"
               id="${DETAILS_ID}"
               data-collapse-key="decision-intelligence-current-truth-lite"
               data-layout-family="analysis">
        <summary class="atlas-collapse-summary">
          <span class="atlas-collapse-copy">
            <span class="atlas-collapse-title">Decision Intelligence · vérité courante</span>
            <span class="atlas-collapse-subtitle">Lecture légère · informations déjà rendues · aucun recalcul lourd</span>
          </span>
          <span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span>
        </summary>
        <div class="atlas-collapse-body">${bodyMarkup()}</div>
      </details>`;
  }

  function hostAnchor(){
    return document.getElementById("news-sentinel")
      || document.getElementById("multi-horizon")
      || document.querySelector('[data-layout-family="analysis"]');
  }

  function refresh(){
    const host=document.getElementById(HOST_ID);
    if(!host) return false;
    host.outerHTML=bodyMarkup();
    return true;
  }

  function bind(details){
    if(!(details instanceof HTMLDetailsElement) || details.dataset.lightDecisionBound==="1") return false;
    details.dataset.lightDecisionBound="1";
    details.addEventListener("toggle",()=>{
      if(details.open) refresh();
    },{passive:true});
    return true;
  }

  function mount(){
    let details=document.getElementById(DETAILS_ID);
    if(details){ bind(details); return true; }
    const anchor=hostAnchor();
    if(!anchor) return false;
    anchor.insertAdjacentHTML("afterend",markup());
    details=document.getElementById(DETAILS_ID);
    bind(details);
    return !!details;
  }

  function boot(){
    mount();
  }

  globalThis.AgentCryptoDecisionIntelligenceCurrentTruthLite406252=Object.freeze({
    build:BUILD,
    mount,
    refresh,
    snapshot,
    mode:"LIGHT_DOM_READ_ONLY",
    read_only:true,
    storage_write:false,
    new_fetch:false,
    new_timer:false,
    new_observer:false,
    automatic_order:false,
    execution_authorized:false,
    financial_signal:false
  });

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();