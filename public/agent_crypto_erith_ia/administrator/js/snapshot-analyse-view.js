/* ERITH.IA — Snapshot Analyse inside the canonical chart header.
 * Shared Interface/Trader; small read-only strip, ONE active horizon.
 * Graph, Math Core, Technical Reading, market orders and caches remain untouched.
 */
(() => {
  "use strict";
  if (globalThis.AgentCryptoSharedSnapshotView) return;
  const ID="agentCryptoSnapshotAnalysis";
  const horizons=Object.freeze({1:"24h",7:"7j",30:"30j"});
  const $=id=>document.getElementById(id);
  const node=(tag,cls,text)=>{
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(text!==undefined)el.textContent=text;
    return el;
  };
  const number=(n,d=1)=>Number.isFinite(n)?
    new Intl.NumberFormat("fr-FR",{maximumFractionDigits:d}).format(n):"—";
  const pct=n=>Number.isFinite(n)?number(n,2)+" %":"—";
  const momentum=Object.freeze({
    "rebond observe":"rebond observé",
    "repli observe":"repli observé",
    "acceleration observee":"accélération observée",
    "ralentissement observe":"ralentissement observé",
    stable:"stable",
    indetermine:"indéterminé"
  });
  let fingerprint=null;
  function ensure(){
    let el=$(ID);
    if(el)return el;
    const shell=$("mainChart")?.closest(".chart-shell");
    // Place BEFORE the plot, never inside its canvas/overlay and never below it.
    if(!shell?.parentElement?.classList?.contains("chart-panel"))return null;
    el=node("details","atlas-snapshot-compact");
    el.id=ID;
    el.dataset.snapshotStatus="waiting";
    const summary=node("summary","atlas-snapshot-summary");
    summary.setAttribute("aria-label","Snapshot Analyse : mesures complémentaires du graphique, développer les détails");
    const title=node("strong","atlas-snapshot-name","SNAPSHOT ANALYSE");
    const period=node("span","atlas-snapshot-period","Période active —");
    const measure=(name,label)=>{
      const item=node("span","atlas-snapshot-measure");
      item.dataset.snapshotMetric=name;
      item.append(node("small","",label),node("b","","—"));
      return item;
    };
    const state=node("span","atlas-snapshot-state","En attente");
    const hint=node("span","atlas-snapshot-expand","Détails ▾");
    summary.append(title,period,
      measure("drawdown","Repli max"),
      measure("coverage","Couverture"),
      measure("momentum","Mouvement"),
      state,hint);
    const details=node("div","atlas-snapshot-detail");
    const explanation=node("p","atlas-snapshot-explanation",
      "Les mesures complémentaires attendent un graphique Solo vérifié.");
    const origin=node("p","atlas-snapshot-origin","Aucune donnée historique confirmée.");
    const glossary=node("p","atlas-snapshot-glossary",
      "Repli maximal : plus grande baisse après un sommet sur les points affichés. "+
      "Couverture : part de la durée sélectionnée effectivement observée. "+
      "Mouvement : description des variations entre deux moitiés de la période, sans prévision.");
    const caveat=node("p","atlas-snapshot-caveat",
      "Lecture historique descriptive, pas un signal d’achat/vente. "+
      "Aucune conversion automatique entre USD, USDT et USDC.");
    details.append(explanation,origin,glossary,caveat);
    el.append(summary,details);
    shell.insertAdjacentElement("beforebegin",el);
    el.addEventListener("toggle",()=>{if(el.open)render("détails ouverts");});
    return el;
  }
  function set(el,selector,value){
    const target=el?.querySelector(selector);
    if(target)target.textContent=value;
  }
  function setMeasure(el,name,value){
    const target=el?.querySelector('[data-snapshot-metric="'+name+'"] b');
    if(target)target.textContent=value;
  }
  function clear(reason="En attente d’un graphique Solo réellement publié.",period="—"){
    const el=ensure();if(!el)return false;
    fingerprint=null;
    el.dataset.snapshotStatus="waiting";
    set(el,".atlas-snapshot-period","Période active "+period);
    set(el,".atlas-snapshot-state","En attente");
    for(const key of ["drawdown","coverage","momentum"])setMeasure(el,key,"—");
    set(el,".atlas-snapshot-explanation",reason);
    set(el,".atlas-snapshot-origin","Aucune donnée de l’actif précédent n’est conservée.");
    return true;
  }
  function showError(el,source,status,note,period){
    fingerprint=null;
    el.dataset.snapshotStatus=status;
    set(el,".atlas-snapshot-period",source.symbol+" · "+period);
    set(el,".atlas-snapshot-state",
      status==="blocked"?"Intégrité non confirmée":
      status==="partial"?"Période partielle":"Mesure indisponible");
    for(const key of ["drawdown","coverage","momentum"])setMeasure(el,key,"—");
    set(el,".atlas-snapshot-explanation",note);
    set(el,".atlas-snapshot-origin","Source : "+source.provider+" · "+
      source.currency+" · "+source.series.length+" points publiés");
    return false;
  }
  function present(el,source,row,period,reason){
    const allowed=row.status==="ready"||row.status==="partial";
    if(!allowed)return showError(el,source,row.status,
      row.integrity?.warnings?.join(" · ")||"Aucune mesure historique vérifiable.",period);
    el.dataset.snapshotStatus=row.status;
    el.dataset.snapshotReason=reason;
    set(el,".atlas-snapshot-period",source.symbol+" · "+period);
    set(el,".atlas-snapshot-state",row.status==="ready"?"Historique vérifié":"Historique partiel");
    setMeasure(el,"drawdown",pct(row.metrics.maxDrawdownPct));
    setMeasure(el,"coverage",number(row.coveragePct,1)+" %");
    setMeasure(el,"momentum",momentum[row.momentumLabel]||"indéterminé");
    const trend={hausse:"haussière",baisse:"baissière",lateral:"latérale"}[row.trendLabel]||"indéterminée";
    const warning=row.status==="partial"?
      " La fenêtre est incomplète ; ne pas extrapoler à toute la période.":"";
    set(el,".atlas-snapshot-explanation",
      "Tendance "+trend+" sur les points disponibles. "+
      "Le repli maximal décrit une chute passée depuis un sommet observé ; "+
      "le mouvement compare deux portions de l’historique. "+
      "Ces mesures ne prédisent pas le prochain prix."+warning);
    set(el,".atlas-snapshot-origin",
      source.symbol+(source.instrument?" · "+source.instrument:"")+
      " · "+source.currency+" · "+source.provider+" · "+source.source+
      " · "+row.points+" points · dernière observation "+row.lastPointAt+
      (row.integrity?.warnings?.length?" · "+row.integrity.warnings.join(" ; "):""));
    return true;
  }
  function render(reason="lecture"){
    const el=ensure();if(!el)return false;
    const reader=globalThis.AgentCryptoPublishedSeries?.read;
    const calc=globalThis.AgentCryptoSnapshotAnalyse?.analyse;
    if(typeof reader!=="function"||typeof calc!=="function")
      return clear("Le lecteur canonique ou le calculateur n’est pas prêt.");
    const source=reader();
    if(!source||source.published!==true||source.integrityOk!==true||
       !Array.isArray(source.series)||source.series.length<2)
      return clear("En attente d’un graphique Solo validé.");
    const period=horizons[Number(source.periodDays)];
    if(!period)return showError(el,source,"not_available",
      "Snapshot disponible uniquement pour les périodes 24 h, 7 j et 30 j. "+
      "Aucune période de substitution n’est calculée.",String(source.periodDays)+" j");
    const row=calc(source,{timeframe:period,nowMs:Date.now(),
      expectedAssetId:source.assetId,expectedRevision:source.selectionRevision,
      expectedTimeframe:period});
    // An old response must not land after the chart owner changed selection.
    const current=reader();
    if(!current||current.assetId!==source.assetId||
       current.selectionRevision!==source.selectionRevision||
       current.periodDays!==source.periodDays||
       current.lastPointAt!==source.lastPointAt||
       current.currency!==source.currency||
       current.series?.length!==source.series.length)
      return clear("Sélection modifiée pendant l’analyse : ancienne mesure effacée.");
    fingerprint=source.assetId+"|"+source.selectionRevision+"|"+period+"|"+source.lastPointAt;
    return present(el,source,row,period,reason);
  }
  function mount(){
    if(!ensure())return false;
    const shell=$("mainChart")?.closest(".chart-shell");
    if(shell&&typeof MutationObserver==="function"){
      const observer=new MutationObserver(()=>render("publication graphique"));
      observer.observe(shell,{attributes:true,attributeFilter:["data-chart-state"]});
    }
    const legend=$("chartV2Legend");
    if(legend&&typeof MutationObserver==="function"){
      const observer=new MutationObserver(()=>render("légende graphique"));
      observer.observe(legend,{childList:true,subtree:true,characterData:true});
    }
    const refresh=$("atlasChartRefresh");
    if(refresh&&typeof MutationObserver==="function"){
      const observer=new MutationObserver(()=>render("rafraîchissement graphique"));
      observer.observe(refresh,{attributes:true,attributeFilter:["hidden","aria-hidden"]});
    }
    ["agent-crypto:graph-context-ready","agent-crypto:selected-market-changed",
      "agent-crypto:trader-line-loaded","agent-crypto:trader-selection-changed",
      "agent-crypto:external-asset-changed","agent-crypto:quote-architecture-changed"]
      .forEach(name=>window.addEventListener(name,()=>render(name),{passive:true}));
    $("market-zone")?.addEventListener("click",e=>{
      if(e.target?.closest?.(
        ".radar-native-selectable,[data-radar-id],.period-btn,.compare-btn,"+
        "[data-market-extended-toggle403116],#marketRows tr[data-crypto-id]"))
        clear("Sélection en cours : mesures effacées avant publication.");
    },true);
    render("initialisation");
    return true;
  }
  globalThis.AgentCryptoSharedSnapshotView=Object.freeze({
    mount,render,clear,
    state:()=>Object.freeze({mounted:!!$(ID),lastPublished:fingerprint,
      active_period_only:true,interface:true,trader:true,read_only:true,real_orders:false})
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();
