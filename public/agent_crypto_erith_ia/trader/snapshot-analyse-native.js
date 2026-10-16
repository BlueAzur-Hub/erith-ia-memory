/* ERITH.IA — Snapshot Analyse, presentation inside the existing Lecture Technique.
 * Trader-only adapter: no chart ownership, network, storage, timers or order routes.
 * Facts come exclusively from Administrator's AgentCryptoPublishedSeries.read().
 */
(() => {
  "use strict";
  if (globalThis.AgentCryptoTraderSnapshotReading) return;

  const OWNER_ID="agentCryptoSnapshotAnalysis";
  const HORIZONS=Object.freeze(["24h","7j","30j"]);
  const descriptors=Object.freeze({"24h":"24 heures","7j":"7 jours","30j":"30 jours"});
  const $=id=>document.getElementById(id);
  const fmtNum=(n,d=2)=>Number.isFinite(n)?new Intl.NumberFormat("fr-FR",{maximumFractionDigits:d}).format(n):"—";
  const pct=n=>Number.isFinite(n)?(n>0?"+":"")+fmtNum(n,2)+" %":"—";
  const price=(n,ccy)=>{
    if(!Number.isFinite(n))return"—";
    const digits=n>=1000?2:n>=1?4:n>=.01?6:10;
    return fmtNum(n,digits)+" "+(ccy||"");
  };
  const safe=s=>typeof s==="string"&&s.trim()?s.trim():"—";

  let lastFingerprint=null;
  function panel() {return $("detailPanel");}
  function owner() {return globalThis.AgentCryptoPublishedSeries;}
  function calculator() {return globalThis.AgentCryptoSnapshotAnalyse;}

  function ensure() {
    const body=$("detailPanelBody"),near=$("detailSourcesWindow");
    if(!body)return null;
    let details=$(OWNER_ID);
    if(details)return details;
    details=document.createElement("details");
    details.id=OWNER_ID;
    details.className="clean-lens-disclosure atlas-detail-subwindow agent-snapshot-detail";
    details.dataset.detailWindow="snapshot-analyse";
    const summary=document.createElement("summary");
    const caption=document.createElement("span");
    caption.textContent="Snapshot Analyse";
    const state=document.createElement("small");
    state.className="agent-snapshot-state";
    state.textContent="En attente du graphique";
    summary.append(caption,state);
    const content=document.createElement("div");
    content.className="agent-snapshot-body";
    const source=document.createElement("p");
    source.className="agent-snapshot-source";
    source.textContent="Aucune série Solo certifiée à analyser.";
    content.appendChild(source);
    const grid=document.createElement("div");
    grid.className="agent-snapshot-grid";
    HORIZONS.forEach(timeframe=>{
      const card=document.createElement("section");
      card.className="agent-snapshot-card";
      card.dataset.snapshotTimeframe=timeframe;
      const heading=document.createElement("b");
      heading.textContent=descriptors[timeframe];
      const status=document.createElement("small");
      status.className="agent-snapshot-card-status";
      status.textContent="En attente";
      const line=document.createElement("p");
      line.className="agent-snapshot-card-metrics";
      line.textContent="—";
      const note=document.createElement("small");
      note.className="agent-snapshot-card-note";
      note.textContent="Sans mesure disponible";
      card.append(heading,status,line,note);
      grid.appendChild(card);
    });
    const caveat=document.createElement("p");
    caveat.className="agent-snapshot-disclaimer";
    caveat.textContent="Lecture descriptive des points échantillonnés du graphique. Ni prévision ni signal d’achat ou de vente.";
    content.append(grid,caveat);
    details.append(summary,content);
    if(near&&near.parentElement===body)body.insertBefore(details,near);
    else body.appendChild(details);
    details.addEventListener("toggle",()=>{if(details.open)render("ouvrir");});
    return details;
  }

  function statusLabel(code) {
    return {
      ready:"Observé",partial:"Période partielle",
      blocked:"Données bloquées",not_available:"Horizon indisponible"
    }[code]||"En attente";
  }

  function clear(note) {
    const host=ensure();if(!host)return;
    lastFingerprint=null;
    host.dataset.snapshotStatus="waiting";
    host.querySelector(".agent-snapshot-state").textContent="En attente";
    host.querySelector(".agent-snapshot-source").textContent=note||"Graphique Solo en attente de validation.";
    host.querySelectorAll(".agent-snapshot-card").forEach(card=>{
      card.dataset.snapshotStatus="waiting";
      card.querySelector(".agent-snapshot-card-status").textContent="En attente";
      card.querySelector(".agent-snapshot-card-metrics").textContent="—";
      card.querySelector(".agent-snapshot-card-note").textContent="Aucune donnée conservée de l’actif précédent.";
    });
  }

  function draw(source,rows,reason) {
    const host=ensure();if(!host)return false;
    const status=rows.find(r=>r.status==="ready")?"ready":
      rows.some(r=>r.status==="partial")?"partial":
      rows.some(r=>r.status==="blocked")?"blocked":"not_available";
    host.dataset.snapshotStatus=status;
    host.dataset.snapshotReason=reason;
    host.querySelector(".agent-snapshot-state").textContent=safe(source.symbol)+" · "+statusLabel(status);
    const pair=source.instrument?" · "+source.instrument:"";
    host.querySelector(".agent-snapshot-source").textContent=
      safe(source.symbol)+pair+" · "+safe(source.provider)+" · "+safe(source.currency)+
      " · source : "+safe(source.source)+" · "+source.series.length+" points publiés";
    rows.forEach((r,i)=>{
      const card=host.querySelectorAll(".agent-snapshot-card")[i];
      const v=r.metrics||{};
      card.dataset.snapshotStatus=r.status;
      card.querySelector(".agent-snapshot-card-status").textContent=statusLabel(r.status);
      const metrics=card.querySelector(".agent-snapshot-card-metrics");
      const note=card.querySelector(".agent-snapshot-card-note");
      if(r.status==="ready"||r.status==="partial"){
        metrics.textContent=price(v.priceCurrent,r.currency)+" · "+pct(v.changePeriodPct)+
          " · amplitude "+pct(v.amplitudePct);
        note.textContent=r.points+" pts · "+fmtNum(r.coveragePct,1)+" % couverts · "+
          r.trendLabel+" · "+r.momentumLabel+" · "+r.decisionLabel+
          (r.status==="partial"?" · fenêtre observée "+fmtNum(r.observedHours,1)+" h":"");
      }else{
        metrics.textContent="— Aucune métrique certifiée";
        note.textContent=r.integrity?.warnings?.join(" · ")||"Historique non disponible";
      }
    });
    return true;
  }

  function render(reason="lecture") {
    if(!ensure())return false;
    if(typeof owner()?.read!=="function"||typeof calculator()?.analyse!=="function"){
      clear("Calculateur ou accès canonique non chargé ; aucune valeur inventée.");
      return false;
    }
    // A selection click is not proof of a published graph.
    const source=owner().read();
    if(!source||source.published!==true||source.integrityOk!==true||
       !Array.isArray(source.series)||source.series.length<2){
      clear("Aucune série Solo certifiée actuellement publiée.");
      return false;
    }
    const nowMs=Date.now();
    const revision=source.selectionRevision;
    const rows=HORIZONS.map(timeframe=>calculator().analyse(source,{
      timeframe,nowMs,expectedAssetId:source.assetId,expectedRevision:revision
    }));
    // Re-check publication and revision before writing; a late series cannot
    // overwrite the active asset after a selection / timeframe change.
    const latest=owner().read();
    if(!latest||latest.assetId!==source.assetId||latest.selectionRevision!==revision||
       latest.periodDays!==source.periodDays||latest.lastPointAt!==source.lastPointAt){
      clear("Sélection ou période changée : lecture précédente invalidée.");
      return false;
    }
    lastFingerprint=source.assetId+"|"+revision+"|"+source.periodDays+"|"+source.lastPointAt;
    return draw(source,rows,reason);
  }

  function bind(){
    if(!ensure())return false;
    // The sole criterion for success remains the canonical accessor.
    // Observing existing graph-status changes is only a notification trigger.
    const chartShell=$("mainChart")?.closest(".chart-shell");
    if(chartShell&&typeof MutationObserver==="function"){
      const observer=new MutationObserver(()=>render("publication graphique"));
      observer.observe(chartShell,{attributes:true,attributeFilter:["data-chart-state"]});
    }
    const legend=$("chartV2Legend");
    if(legend&&typeof MutationObserver==="function"){
      const observer=new MutationObserver(()=>render("légende graphique"));
      observer.observe(legend,{childList:true,characterData:true,subtree:true});
    }
    const refresh=$("atlasChartRefresh");
    if(refresh&&typeof MutationObserver==="function"){
      const observer=new MutationObserver(()=>render("état du graphique"));
      observer.observe(refresh,{attributes:true,attributeFilter:["hidden","aria-hidden"]});
    }
    [
      "agent-crypto:trader-selection-changed",
      "agent-crypto:trader-line-loaded",
      "agent-crypto:external-asset-changed",
      "agent-crypto:quote-architecture-changed",
      "agent-crypto:trader-technical-levels"
    ].forEach(name=>window.addEventListener(name,()=>render(name),{passive:true}));
    const market=$("market-zone");
    if(market)market.addEventListener("click",e=>{
      if(e.target?.closest?.(".radar-native-selectable,[data-radar-id],[data-chart-period],.chart-v2-period-button"))
        clear("Nouvelle sélection : attente de la publication du graphique.");
    },true);
    // Open + manual verification always use the published series. No timer.
    render("initialisation");
    return true;
  }

  globalThis.AgentCryptoTraderSnapshotReading=Object.freeze({
    mount:bind,render,clear,
    snapshot:()=>({mounted:!!$(OWNER_ID),revision:lastFingerprint,owner:"Administrator",
      standaloneChart:false,read_only:true,real_orders:false}),
    read_only:true,real_orders:false
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
})();
