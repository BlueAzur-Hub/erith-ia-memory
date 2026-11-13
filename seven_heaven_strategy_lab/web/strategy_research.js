"use strict";
/* V4.5 Aether Research. Read-only rendering of ephemeral chronological
   experiment results. All text is assigned through textContent. */
(() => {
  const $=id=>document.getElementById(id);
  const num=(v,n=2)=>Number(v).toLocaleString("fr-FR",{maximumFractionDigits:n});
  const sign=(v,n=2)=>(v>0?"+":"")+num(v,n);
  const date=t=>new Date(t*1000).toISOString().slice(0,16).replace("T"," ")+" UTC";
  const node=(tag,cls,txt)=>{
    const e=document.createElement(tag);
    if(cls)e.className=cls;
    if(txt!==undefined)e.textContent=String(txt);
    return e;
  };
  function empty(){
    $("research-result").hidden=true;
    $("research-empty").hidden=false;
    $("research-fold-list").replaceChildren();
  }
  function metric(label,value,note,isNeg){
    const box=node("div","research-fold-metric");
    box.append(node("small","",label));
    box.append(node("strong",isNeg?"research-negative":"research-positive",value));
    box.append(node("span","",note));
    return box;
  }
  function compactReturn(label,value,maxAbs){
    const item=node("div","research-comparison-item");
    item.append(node("span","research-bar-title",label));
    const track=node("div","research-track");
    const center=node("span","research-zero");
    const bar=node("span","research-bar "+(value<0?"research-bar-negative":"research-bar-positive"));
    const width=Math.min(50,Math.abs(value)/maxAbs*47);
    bar.style.width=String(width)+"%";
    bar.style.left=value<0?String(50-width)+"%":"50%";
    track.append(center,bar);
    item.append(track,node("strong",value<0?"research-negative":"research-positive",sign(value)+" %"));
    return item;
  }
  function addFold(fold,source){
    const quote=source.quote||"USDC";
    const box=node("article","research-fold");
    const top=node("div","research-fold-top");
    const left=node("div","");
    left.append(node("small","research-overline","FENÊTRE "+
        String(fold.fold).padStart(2,"0")+" · SÉLECTION SUR LE PASSÉ"));
    left.append(node("h3","","Choix : "+fold.selection.label));
    left.append(node("p","",fold.selection.status==="NO_TRAINING_CLOSED_TRADE_RETAIN_OWNER_BASELINE"
      ?"Aucun candidat n'a clôturé une position sur l'entraînement. Ton profil d'origine est conservé : aucun gagnant n'est proclamé."
      :"Cette variante a été sélectionnée uniquement sur l'entraînement historique, avant toute lecture de la fenêtre ultérieure."));
    const tag=node("span","mini-badge research-fold-badge",fold.candidate_count+" VARIANTES");
    top.append(left,tag);
    box.append(top);
    const metrics=node("div","research-fold-metrics");
    const sel=fold.selected_verification,origin=fold.benchmarks.owner_original;
    metrics.append(
      metric("CHOIX ANTÉRIEUR · VÉRIFICATION",sign(sel.return_pct)+" %",
        date(fold.verification.first_bar_utc)+" → "+date(fold.verification.last_bar_utc),
        sel.return_pct<0),
      metric("TON PROFIL · MÊME VÉRIFICATION",sign(origin.return_pct)+" %",
        "Comparaison sur exactement "+fold.verification.bars+" bougies",origin.return_pct<0),
      metric("ÉCART ENTRE LES DEUX",sign(fold.selected_minus_owner_return_pct_points)+" pt",
        "Différence de rendement, non garantie",fold.selected_minus_owner_return_pct_points<0),
      metric("COÛTS ×2 · CHOIX ANTÉRIEUR",
        sign(fold.selected_double_cost_verification.return_pct)+" %",
        num(sel.hypothetical_fills,0)+" fills · frais "+
          num(sel.fees_paid_quote,2)+" "+quote,
        fold.selected_double_cost_verification.return_pct<0)
    );
    box.append(metrics);
    const comparison=node("div","research-bars");
    comparison.append(node("h4","","Comparaison sur le même segment historique"));
    const pairs=[
      ["Filtre retenu",sel.return_pct],
      ["Ton profil d'origine",origin.return_pct],
      ["Buy & Hold 50 %",fold.benchmarks.buy_and_hold_50.return_pct],
      ["Conserver les "+quote,fold.benchmarks.cash.return_pct],
    ];
    const maxAbs=Math.max(5,...pairs.map(p=>Math.abs(p[1])));
    for(const [name,value] of pairs)comparison.append(compactReturn(name,value,maxAbs));
    box.append(comparison);
    const details=node("details","research-details");
    const trigger=node("summary","","Examiner les "+fold.candidate_count+
      " variantes · entraînement versus vérification");
    details.append(trigger);
    const scroller=node("div","research-table-scroll");
    const table=node("table","research-table");
    const th=node("thead");
    const tr=node("tr");
    for(const title of ["VARIANTE / FILTRE","APPRENTISSAGE","VÉRIFICATION","DRAWDOWN","FRAIS","FILLS","CHOIX AVANT TEST"])
      tr.append(node("th","",title));
    th.append(tr);table.append(th);
    const body=node("tbody");
    for(const candidate of fold.candidates){
      const row=node("tr",candidate.selected_on_training?"research-selected-row":"");
      row.append(node("td","research-row-name",candidate.label));
      const addValue=(val,style)=>{
        row.append(node("td",style||"",val));
      };
      addValue(sign(candidate.training.return_pct)+" %",
        candidate.training.return_pct<0?"research-negative":"research-positive");
      addValue(sign(candidate.verification.return_pct)+" %",
        candidate.verification.return_pct<0?"research-negative":"research-positive");
      addValue(num(candidate.verification.max_drawdown_pct)+" %","research-negative");
      addValue(num(candidate.verification.fees_paid_quote,2)+" "+quote);
      addValue(num(candidate.verification.hypothetical_fills,0));
      addValue(candidate.selected_on_training?"Sélectionnée sur le passé":"Observée, non sélectionnée");
      body.append(row);
    }
    table.append(body);scroller.append(table);details.append(scroller);
    details.append(node("p","research-table-note",
      "Ces résultats ultérieurs des variantes NON sélectionnées sont affichés pour contrôle, jamais utilisés pour changer le choix du passé. "+date(fold.training.first_bar_utc)+" → "+
      date(fold.training.last_bar_utc)+" : entraînement historique antérieur."));
    box.append(details);
    return box;
  }
  function display(research){
    if(!research || research.safety?.orders_real!==0 ||
      research.status!=="NONBLIND_PREDECLARED_TRAIN_ONLY_SELECTION_INDEPENDENT_LATER_HOLDOUTS" ||
      !Array.isArray(research.folds) || !research.folds.length ||
      !research.methodology?.selection_uses_training_only)
      throw Error("Résultat de recherche non vérifié ou incohérent.");
    const source=research.source;
    const result=research.summary;
    $("research-source").textContent=source.exchange+" · "+source.pair+
      " · "+research.timeframe+" · "+num(research.total_bars,0)+
      " bougies · "+research.variant_family;
    $("research-sha").textContent="SOURCE SHA-256 "+source.sha256.slice(0,30)+"… "+
      "· CAPITAL PAR FENÊTRE : "+num(research.capital_per_window,2)+" "+source.quote;
    $("research-variants").textContent=result.variants_compared;
    $("research-folds").textContent=result.verification_windows;
    $("research-selected").textContent=sign(result.mean_selected_return_pct)+" %";
    $("research-delta").textContent=sign(result.mean_selected_minus_owner_pct_points)+" pt";
    $("research-selected").className=result.mean_selected_return_pct<0?"research-negative":"research-positive";
    $("research-delta").className=result.mean_selected_minus_owner_pct_points<0?"research-negative":"research-positive";
    const root=$("research-fold-list");root.replaceChildren();
    for(const fold of research.folds)root.append(addFold(fold,source));
    $("research-empty").hidden=true;
    $("research-result").hidden=false;
  }
  window.AetherFilterStudio={display,reset:empty};
})();
