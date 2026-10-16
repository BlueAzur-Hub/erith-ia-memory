/* ERITH.IA — shared Snapshot Analyse presentation.
 * Same Administrator graph in Interface and Trader; one wide, inline read-only view.
 * Data owner: AgentCryptoPublishedSeries.read(); pure maths: AgentCryptoSnapshotAnalyse.analyse().
 * No second graph, cache, trade, network client, scroll owner or periodic task.
 */
(() => {
  "use strict";
  if(globalThis.AgentCryptoSharedSnapshotView)return;
  const ID="agentCryptoSnapshotAnalysis";
  const LABELS=Object.freeze({"24h":"24 heures","7j":"7 jours","30j":"30 jours"});
  const HORIZONS=Object.freeze(["24h","7j","30j"]);
  const $=id=>document.getElementById(id);
  const fn=(v,d=2)=>Number.isFinite(v)?new Intl.NumberFormat("fr-FR",{maximumFractionDigits:d}).format(v):"—";
  const pct=v=>Number.isFinite(v)?(v>0?"+":"")+fn(v)+" %":"—";
  const currency=(n,cur)=>{
    if(!Number.isFinite(n))return"—";
    const d=Math.abs(n)>=1000?2:Math.abs(n)>=1?4:Math.abs(n)>=.01?6:10;
    return fn(n,d)+" "+(cur||"");
  };
  const node=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;};
  const statusText={ready:"Données vérifiées",partial:"Observation partielle",
    blocked:"Lecture suspendue",not_available:"Historique insuffisant"};
  let currentFingerprint=null;

  function ensure(){
    let section=$(ID);if(section)return section;
    // Chart and Technical Reading remain independent sibling owners.
    const anchor=$("chartCaption");
    const host=anchor?.parentElement;
    if(!host||!host.classList.contains("chart-panel"))return null;
    section=node("section","atlas-snapshot-wide");
    section.id=ID;
    section.setAttribute("aria-label","Snapshot Analyse du graphique");
    const header=node("header","atlas-snapshot-heading");
    const titles=node("div","atlas-snapshot-titles");
    titles.append(node("small","atlas-snapshot-eyebrow","GRAPHIQUE · ANALYSE HISTORIQUE"),
      node("h3","", "Snapshot Analyse"),
      node("p","", "Une photographie du comportement réel des prix sur les périodes disponibles — pas une prévision."));
    const update=node("button","atlas-snapshot-update","Actualiser la lecture");
    update.type="button";
    update.setAttribute("aria-label","Relire les points actuellement affichés sur le graphique");
    update.addEventListener("click",()=>render("actualisation demandée"));
    header.append(titles,update);
    const state=node("div","atlas-snapshot-truth","En attente d’un graphique Solo réellement publié.");
    state.setAttribute("role","status");
    const grid=node("div","atlas-snapshot-horizons");
    for(const h of HORIZONS){
      const card=node("article","atlas-snapshot-horizon");
      card.dataset.horizon=h;
      card.dataset.snapshotStatus="waiting";
      const top=node("div","atlas-snapshot-horizon-head");
      top.append(node("h4","",LABELS[h]),node("span","atlas-snapshot-result","En attente"));
      const meaning=node("p","atlas-snapshot-meaning","Cette période n’a pas encore été mesurée.");
      const fields=node("div","atlas-snapshot-numbers");
      for(const [key,label] of [["move","Évolution du prix"],["amplitude","Amplitude observée"],
                                 ["drawdown","Repli maximal observé"],["coverage","Couverture réelle"]]){
        const item=node("div","atlas-snapshot-number");
        item.dataset.metric=key;
        item.append(node("small","",label),node("strong","","—"));
        fields.append(item);
      }
      const context=node("p","atlas-snapshot-context","Aucune série historique certifiée.");
      card.append(top,meaning,fields,context);
      grid.append(card);
    }
    const glossary=node("details","atlas-snapshot-glossary");
    glossary.append(node("summary","", "Comprendre les mesures : amplitude, repli, couverture"),
      node("p","", "Évolution : différence entre le premier et le dernier prix observés. Amplitude : distance entre le plus bas et le plus haut, rapportée au plus bas. Repli maximal : plus forte baisse d’un sommet vers un prix ultérieur dans les points disponibles. Couverture : part de la période réellement représentée. Aucune de ces mesures ne prédit le prix futur."));
    const limits=node("p","atlas-snapshot-limits","Les calculs portent seulement sur les points disponibles et leur devise prouvée. Aucune simulation PAPER, position ou recommandation d’achat/vente.");
    section.append(header,state,grid,glossary,limits);
    anchor.insertAdjacentElement("afterend",section);
    return section;
  }

  function setText(host,selector,value){const el=host.querySelector(selector);if(el)el.textContent=value;}
  function clear(reason="Graphique Solo non disponible ou pas encore validé."){
    const section=ensure();if(!section)return false;
    currentFingerprint=null;
    section.dataset.snapshotStatus="waiting";
    setText(section,".atlas-snapshot-truth",reason);
    section.querySelectorAll(".atlas-snapshot-horizon").forEach(card=>{
      card.dataset.snapshotStatus="waiting";
      setText(card,".atlas-snapshot-result","En attente");
      setText(card,".atlas-snapshot-meaning","Données non disponibles : aucune valeur reprise de l’actif précédent.");
      card.querySelectorAll(".atlas-snapshot-number strong").forEach(el=>el.textContent="—");
      setText(card,".atlas-snapshot-context","Sélectionne un actif Solo puis une période historique.");
    });
    return true;
  }

  function explain(row){
    if(row.status==="blocked")return "La devise, l’identité ou la publication du graphique n’est pas suffisamment prouvée.";
    if(row.status==="not_available")return "Il n’y a pas assez d’historique publié pour décrire cette période.";
    const m=row.metrics;
    const direction=row.trendLabel==="hausse"?"Le prix a progressé":
       row.trendLabel==="baisse"?"Le prix a reculé":"Le prix a évolué latéralement";
    const tail=row.status==="partial"?" Cette observation est incomplète et ne décrit pas toute la période.":"";
    return direction+" sur les points observés. Prix final "+currency(m.priceCurrent,row.currency)+
      " ; plus bas "+currency(m.low,row.currency)+" ; plus haut "+currency(m.high,row.currency)+
      ". Intensité du mouvement : "+row.rangeIntensityLabel+"."+tail;
  }

  function present(source,rows,reason){
    const section=ensure();if(!section)return false;
    const status=rows.some(r=>r.status==="ready")?"ready":
      rows.some(r=>r.status==="partial")?"partial":
      rows.some(r=>r.status==="blocked")?"blocked":"not_available";
    section.dataset.snapshotStatus=status;
    section.dataset.snapshotReason=reason;
    const pair=source.instrument?" · "+source.instrument:"";
    setText(section,".atlas-snapshot-truth",
      source.symbol+pair+" · "+source.currency+" · "+source.provider+" · "+source.source+
      " · "+source.series.length+" points publiés sur le graphique · origine "+source.origin);
    section.querySelectorAll(".atlas-snapshot-horizon").forEach((card,i)=>{
      const r=rows[i],m=r.metrics||{};
      card.dataset.snapshotStatus=r.status;
      setText(card,".atlas-snapshot-result",statusText[r.status]||"En attente");
      setText(card,".atlas-snapshot-meaning",explain(r));
      const values=[pct(m.changePeriodPct),pct(m.amplitudePct),pct(m.maxDrawdownPct),fn(r.coveragePct,1)+" %"];
      card.querySelectorAll(".atlas-snapshot-number strong").forEach((el,k)=>el.textContent=
        r.status==="ready"||r.status==="partial"?values[k]:"—");
      setText(card,".atlas-snapshot-context",
        r.status==="ready"||r.status==="partial"?
          r.points+" points observés · "+fn(r.observedHours,1)+" h couvertes · "+r.decisionLabel+
            (r.integrity.warnings.length?" · "+r.integrity.warnings.join(" ; "):"")
          :(r.integrity?.warnings?.join(" ; ")||"Série ou période indisponible"));
    });
    return true;
  }

  function render(reason="lecture"){
    if(!ensure())return false;
    const reader=globalThis.AgentCryptoPublishedSeries?.read;
    const calc=globalThis.AgentCryptoSnapshotAnalyse?.analyse;
    if(typeof reader!=="function"||typeof calc!=="function")
      return clear("Accès canonique ou calculateur non chargé : aucune donnée inventée.");
    const source=reader();
    if(!source||source.published!==true||source.integrityOk!==true||
       !Array.isArray(source.series)||source.series.length<2)
      return clear("En attente d’un graphique Solo publié et vérifié.");
    const opts={nowMs:Date.now(),expectedAssetId:source.assetId,expectedRevision:source.selectionRevision};
    const rows=HORIZONS.map(timeframe=>calc(source,{...opts,timeframe}));
    const next=reader();
    if(!next||next.assetId!==source.assetId||next.selectionRevision!==source.selectionRevision||
       next.periodDays!==source.periodDays||next.lastPointAt!==source.lastPointAt||
       next.currency!==source.currency||next.series.length!==source.series.length)
      return clear("Sélection modifiée pendant l’analyse : ancienne mesure retirée.");
    currentFingerprint=source.assetId+"|"+source.selectionRevision+"|"+source.periodDays+"|"+source.lastPointAt;
    return present(source,rows,reason);
  }

  function mount(){
    if(!ensure())return false;
    // No second data owner, no interval; only changes to existing graph surfaces.
    const graph=$("mainChart")?.closest(".chart-shell");
    if(graph&&typeof MutationObserver==="function"){
      const o=new MutationObserver(()=>render("graphique actualisé"));
      o.observe(graph,{attributes:true,attributeFilter:["data-chart-state"]});
    }
    const legend=$("chartV2Legend");
    if(legend&&typeof MutationObserver==="function"){
      const o=new MutationObserver(()=>render("légende actualisée"));
      o.observe(legend,{childList:true,subtree:true,characterData:true});
    }
    const refresh=$("atlasChartRefresh");
    if(refresh&&typeof MutationObserver==="function"){
      const o=new MutationObserver(()=>render("historique reçu"));
      o.observe(refresh,{attributes:true,attributeFilter:["hidden","aria-hidden"]});
    }
    ["agent-crypto:graph-context-ready","agent-crypto:selected-market-changed",
     "agent-crypto:trader-line-loaded","agent-crypto:trader-selection-changed",
     "agent-crypto:external-asset-changed","agent-crypto:quote-architecture-changed"]
      .forEach(name=>window.addEventListener(name,()=>render(name),{passive:true}));
    const workspace=$("market-zone");
    workspace?.addEventListener("click",e=>{
      if(e.target?.closest?.(".radar-native-selectable,[data-radar-id],.period-btn,.compare-btn,[data-market-extended-toggle403116],#marketRows tr[data-crypto-id]")){
        clear("Changement de sélection : attente du graphique réellement rendu.");
      }
    },true);
    render("initialisation");
    return true;
  }
  globalThis.AgentCryptoSharedSnapshotView=Object.freeze({
    mount,render,clear,
    state:()=>Object.freeze({mounted:!!$(ID),lastPublished:currentFingerprint,
      interface:true,trader:true,read_only:true,real_orders:false})
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();
