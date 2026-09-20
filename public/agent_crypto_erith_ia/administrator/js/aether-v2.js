/* Agent-Crypto @erith.IA — Build 40.6.83
   AETHER WATCH V2 — FINAL CONSOLIDATED RUNTIME
   No recurring timer, no MutationObserver, no network owner, no Market Core edit. */
(() => {
  "use strict";
  const BUILD="40.6.83";
  const BACKPLATE="./assets/aether/aether-observatory-master-v2.png";
  const root=document.documentElement;
  function warmBackplate(){
    root.setAttribute('data-aether-backplate-v2','loading');
    const image=new Image(); image.decoding='async'; const src=new URL(BACKPLATE,document.baseURI).href;
    const ready=()=>{root.setAttribute('data-aether-backplate-v2','ready');root.dataset.aetherCanonicalVisualBuild=BUILD;};
    const fallback=()=>{root.setAttribute('data-aether-backplate-v2','fallback-40.6.73');root.dataset.aetherCanonicalVisualBuild='fallback';};
    image.addEventListener('load',()=>{const decoded=typeof image.decode==='function'?image.decode():Promise.resolve();Promise.resolve(decoded).then(ready).catch(fallback);},{once:true});
    image.addEventListener('error',fallback,{once:true}); image.src=src; return src;
  }

  const STRUCTURE_BUILD="40.6.293";
  function ensureStructure(){
    let panel=document.getElementById("atlasAetherStatusPanel");
    if(!panel){
      panel=document.createElement("section");
      panel.id="atlasAetherStatusPanel";
      panel.hidden=true;
      panel.dataset.aetherOperatorOpen="0";
      panel.setAttribute("aria-label","Synthèse Aether");
      document.body.appendChild(panel);
    }
    if(!panel.dataset.aetherOperatorOpen)panel.dataset.aetherOperatorOpen="0";
    if(!panel.querySelector(".atlas-aether-panel-head")){
      panel.insertAdjacentHTML("afterbegin",`<div class="atlas-aether-panel-head"><b>AETHER · ATTENTION WATCH</b><button type="button" data-aether-close aria-label="Fermer Aether">×</button></div>`);
    }
    let stage=panel.querySelector("[data-aether-component-stage-406046]");
    if(!stage){
      panel.querySelectorAll(".aether-first-glance-grid,[data-aether-component-stage-406042],.aether42-backplate,.aether42-surface").forEach(node=>node.remove());
      stage=document.createElement("div");
      stage.className="aether46-stage";
      stage.setAttribute("data-aether-component-stage-406046","1");
      stage.innerHTML=`
      <div class="aether46-system-banner">
        <div><b data-aether46="status_system">SYSTÈME OPÉRATIONNEL</b><span data-aether46="status_modules">SOURCES EN VEILLE</span></div>
        <div class="aether46-clock"><small data-aether46="status_date">—</small><strong data-aether46="status_time">—</strong></div>
      </div>
      <div class="aether46-quote" aria-hidden="true">“L’information devient clarté quand elle est reliée.”<small>Agent-Crypto @erith.IA</small></div>

      <main class="aether46-grid" aria-label="Aether Markets Observatory">
        <article class="aether46-card" data-aether-card-406046="system">
          <header><span>SYSTÈME</span><b data-aether46="system_status">—</b></header>
          <div class="aether46-system-metrics"><div><small>CPU</small><strong data-aether46="system_cpu">—</strong></div><div><small>RAM</small><strong data-aether46="system_ram">—</strong></div><div><small>GPU</small><strong data-aether46="system_gpu">—</strong></div></div>
          <footer>Backend local · lecture seule</footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="sources">
          <header><span>SOURCES</span><b data-aether46="sources_status">—</b></header>
          <div class="aether46-source-metrics"><div><small>Binance</small><strong data-aether46="sources_binance">—</strong></div><div><small>Book</small><strong data-aether46="sources_book">—</strong></div><div><small>News</small><strong data-aether46="sources_news">—</strong></div><div><small>Atlas Data</small><strong data-aether46="sources_atlas">—</strong></div></div>
          <footer>Données vérifiées et à jour</footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="atlas">
          <header><span>ATLAS</span><b data-aether46="atlas_status">—</b></header>
          <div class="aether46-atlas-main"><strong data-aether46="atlas_score">—</strong><span data-aether46="atlas_signal">—</span></div>
          <div class="aether46-atlas-sub"><b data-aether46="atlas_reports">—</b><span data-aether46="atlas_resident">—</span></div>
        </article>

        <article class="aether46-card" data-aether-card-406046="convergence">
          <header><span>CONVERGENCE</span><b data-aether46="convergence_dominant">—</b></header>
          <div class="aether46-convergence-main"><strong data-aether46="convergence_ratio">—</strong><span>couches · <b data-aether46="convergence_pct">—</b></span></div>
          <footer><span data-aether46="convergence_confirm_label">direction</span> · <b data-aether46="convergence_confirm">—</b></footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="divergence">
          <header><span>DIVERGENCE</span><b data-aether46="divergence_status">—</b></header>
          <p data-aether46="divergence_detail">—</p><footer>Contradiction · <b data-aether46="divergence_oppose">—</b></footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="market">
          <header><span>MARCHÉ</span><b data-aether46="market_status">—</b></header>
          <div class="aether46-breadth"><b><strong data-aether46="market_up">—</strong> hausses</b><b><strong data-aether46="market_down">—</strong> baisses</b><b><strong data-aether46="market_flat">—</strong> stables</b></div>
          <div class="aether46-coins">${[0,1,2,3,4].map(i=>`<span><b data-aether46="market_coin_${i}_symbol">—</b><strong data-aether46="market_coin_${i}_change">—</strong></span>`).join('')}</div>
        </article>

        <article class="aether46-card aether46-events" data-aether-card-406046="events" role="button" tabindex="0" aria-label="Ouvrir les événements récents">
          <header><span>ÉVÉNEMENTS RÉCENTS</span><b data-aether46="events_count">0/8</b></header>
          <div data-aether46-events aria-live="polite"></div><footer>Lecture partagée · ouvrir l’historique</footer>
        </article>

        <article class="aether46-card" data-aether-card-406046="oracle">
          <header><span>ORACLE</span><b data-aether46="oracle_status">—</b></header>
          <div class="aether46-oracle-metrics"><div><small>Actif</small><strong data-aether46="oracle_asset">—</strong></div><div><small>Scénario</small><strong data-aether46="oracle_scenario">—</strong></div><div><small>Régime</small><strong data-aether46="oracle_regime">—</strong></div><div><small>Confiance</small><strong data-aether46="oracle_confidence">—</strong></div></div>
        </article>

        <article class="aether46-card" data-aether-card-406046="weather">
          <header><span>MÉTÉO 5 J</span><b data-aether46="weather_status">—</b></header>
          <div class="aether46-weather-metrics"><div><small>Aujourd’hui</small><strong data-aether46="weather_today">—</strong></div><div><small>Pluie</small><strong data-aether46="weather_rain">—</strong></div><div><small>Rafales</small><strong data-aether46="weather_gust">—</strong></div></div>
          <footer data-aether46="weather_detail">—</footer>
        </article>

        <article class="aether46-core" data-aether-card-406046="core">
          <span>NIVEAU D’ATTENTION</span><strong data-aether46="attention_level">—</strong>
          <small>Cause principale</small><p data-aether46="attention_why">—</p>
          <b>À surveiller maintenant</b><p data-aether46="attention_watch">—</p>
        </article>
      </main>

      <div class="aether46-bottom-left" aria-hidden="true">MARKETS OBSERVATORY<small>L’ATTENTION ÉCLAIRE LES OPPORTUNITÉS</small></div>
      <div class="aether46-bottom-center" aria-hidden="true">MARCHÉS · ATLAS · ORACLE · SYNTHÈSE · DÉCISION</div>
      <div class="aether46-bottom-right" aria-hidden="true">AGENT-CRYPTO @ERITH.IA<small>DONNÉES AU SERVICE DU BON SENS</small></div>
      <nav class="aether46-actions" aria-label="Lectures Aether"><button type="button" data-aether46-open="history">Historique</button><button type="button" data-aether46-open="details">Détails</button></nav>`;
      panel.appendChild(stage);
    }
    panel.dataset.aetherComponentFoundation406046="1";
    delete panel.dataset.aetherComponentFoundation406042;
    panel.dataset.aetherStructuralPreseed=STRUCTURE_BUILD;
    root.dataset.aetherStructuralPreseed="ready";
    return panel;
  }

  function explainAtlas(){
    const card=document.querySelector('.aether46-card[data-aether-card-406046="atlas"]');
    const score=card?.querySelector('[data-aether46="atlas_score"]');
    if(!card||!score) return false;
    const value=String(score.textContent||"N/D").trim();
    const explanation=`${value} · score directionnel Atlas de -100 à +100 : signe = direction, amplitude = intensité relative du momentum mesuré. Ce n’est ni une probabilité ni une confiance.`;
    card.dataset.aetherAtlasScoreKind="direction";
    card.title=explanation; score.title=explanation; score.setAttribute("aria-label",explanation);
    return true;
  }

  function weatherGlyph(){
    const card=document.querySelector('.aether46-card[data-aether-card-406046="weather"]');
    if(!card) return false;
    const status=String(card.querySelector('[data-aether46="weather_status"]')?.textContent||"").toUpperCase();
    const detail=String(card.querySelector('[data-aether46="weather_detail"]')?.textContent||"").toUpperCase();
    const rainText=String(card.querySelector('[data-aether46="weather_rain"]')?.textContent||"");
    const rain=Number((rainText.match(/\d+(?:[.,]\d+)?/)||[])[0]?.replace(',','.'));
    const hour=new Date().getHours();
    const night=hour>=21||hour<6;
    let glyph=night?'☾':'☀'; let label=night?'Nuit':'Éclaircies';
    if(/ORAGE|THUNDER|ÉCLAIR/.test(`${status} ${detail}`)){glyph='⚡';label='Orage';}
    else if(Number.isFinite(rain)&&rain>=60){glyph='☂';label='Pluie';}
    else if((Number.isFinite(rain)&&rain>=25)||/NUAGE|COUVERT|PARTIEL/.test(`${status} ${detail}`)){glyph='☁';label='Nuageux';}
    card.dataset.aetherWeatherGlyph=glyph; card.dataset.aetherWeatherLabel=label;
    card.setAttribute('aria-label',`Météo 5 jours · ${label}`);
    return true;
  }

  function enhance(reason='runtime'){
    explainAtlas();
    weatherGlyph();
    root.dataset.aetherOperatorEnhancement=`${BUILD}:${reason}`;
    return true;
  }
  function afterPaint(reason){queueMicrotask(()=>requestAnimationFrame(()=>enhance(reason)));}
  function captureIntent(event){if(!(event.target instanceof Element))return;if(!event.target.closest('#atlasAetherStatusToggle'))return;afterPaint('operator-open');}
  const backplate=warmBackplate();
  const structuralPanel=ensureStructure();
  document.addEventListener('click',captureIntent,true);
  window.addEventListener('erith:administrator-mirror-ready',()=>afterPaint('manager-ready'),{once:true});
  document.addEventListener('pointerover',event=>{if(event.target instanceof Element&&event.target.closest('#atlasAetherStatusPanel'))enhance('panel-interaction');},{passive:true});
  afterPaint('load');
  globalThis.ErithAetherV2Canonical=Object.freeze({build:BUILD,structure_build:STRUCTURE_BUILD,backplate,structural_panel:structuralPanel?.id||null,geometry_owner:'ErithAdministratorWindows',legacy_migration:false,atlas_explainability:true,weather_glyph:true,recurring_timer:false,observer:false,network_owner:false,market_core_changed:false,ensureStructure,enhance});
})();
