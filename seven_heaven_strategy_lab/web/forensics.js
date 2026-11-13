"use strict";
/* V4.4 · Aether Forensics read-only scientific trade diary. No remote JS,
   broker connection, HTML injection or writes to the owner's workspace. */
(() => {
  const $ = id => document.getElementById(id);
  const fr=(value,places=2)=>Number(value).toLocaleString("fr-FR",{maximumFractionDigits:places});
  const signed=(v,dec=2)=>(v>0?"+":"")+fr(v,dec);
  const date=t=>t===null?"Position encore ouverte":
    new Date(t*1000).toISOString().slice(0,16).replace("T"," ")+" UTC";
  const reasons={
    BUY_AND_HOLD_INITIAL_ALLOCATION:"Allocation initiale Buy & Hold",
    DCA_PERIODIC_ALLOCATION:"Achat périodique DCA",
    EMA_CROSS_UP:"EMA rapide franchit l'EMA lente vers le haut",
    EMA_CROSS_DOWN:"EMA rapide franchit l'EMA lente vers le bas",
    BOLLINGER_CLOSE_BELOW_LOWER:"Clôture sous la bande inférieure Bollinger",
    BOLLINGER_CLOSE_ABOVE_UPPER:"Clôture au-dessus de la bande supérieure Bollinger",
    RULE_EMA_CROSS_UP:"Règle personnelle : croisement EMA haussier",
    RULE_EMA_CROSS_DOWN:"Règle personnelle : croisement EMA baissier",
    RULE_PRICE_ABOVE_EMA:"Règle personnelle : prix au-dessus de l'EMA",
    RULE_PRICE_BELOW_EMA:"Règle personnelle : prix sous l'EMA",
    RULE_RSI_ABOVE:"Règle personnelle : RSI supérieur au seuil de sortie",
    FILTER_NONE:"Sans filtre supplémentaire",
    FILTER_RSI_BELOW:"Filtre d'entrée : RSI inférieur au seuil",
    FILTER_VOLUME_ABOVE:"Filtre d'entrée : volume au-dessus de sa moyenne pondérée",
    STOP_ON_PREVIOUS_CLOSE:"Stop fictif déclenché sur clôture précédente",
    TARGET_ON_PREVIOUS_CLOSE:"Objectif fictif atteint à la clôture précédente",
  };
  let token=0, last=null;
  function node(tag,cls,content){
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(content!==undefined)el.textContent=String(content);
    return el;
  }
  function decode(code){
    if(!code)return "Position conservée (pas de sortie)";
    return String(code).split("+").map(k=>reasons[k]||"Motif "+k).join(" · ");
  }
  function setText(id,value){$(id).textContent=value;}
  function evidence(fill,quote){
    const wrap=node("div","forensic-evidence");
    if(!fill)return wrap;
    const title=node("strong","forensic-evidence-head",
      (fill.side==="BUY"?"ACHAT":"VENTE")+" PAPER · "+date(fill.utc));
    wrap.append(title,node("p","",decode(fill.reason_code)));
    const detail=node("p","forensic-evidence-sub",
      "Prix supposé "+fr(fill.price,4)+" "+quote+
      " · quantité "+fr(fill.qty,8)+
      " · frais "+fr(fill.fee,4)+" "+quote);
    wrap.append(detail);
    if(fill.signal_bar_open_utc!==null){
      wrap.append(node("p","forensic-evidence-clock",
        "Décision fondée sur la bougie close ouverte le "+
        date(fill.signal_bar_open_utc)+" ; remplissage fictif à la bougie suivante."));
    }else{
      wrap.append(node("p","forensic-evidence-clock",
        "Allocation programmée, sans signal technique sur la clôture précédente."));
    }
    const context=fill.signal_context||{};
    const fields=[
      ["last_closed_price","Dernière clôture"],
      ["ema_fast","EMA rapide"],["ema_slow","EMA lente"],
      ["rsi","RSI (si disponible)"],
      ["position_entry","Prix de référence de la position"],
      ["bb_middle","Milieu Bollinger"],["bb_upper","Bande haute"],
      ["bb_lower","Bande basse"],["volume","Volume de la bougie"],
      ["volume_mean","Moyenne de volume"],
      ["stop_loss_pct","Seuil stop fictif (%)"],
      ["take_profit_pct","Objectif fictif (%)"],
    ];
    const values=fields.filter(([k])=>Number.isFinite(context[k]))
      .map(([k,label])=>label+" "+fr(context[k],4));
    if(values.length)wrap.append(node("p","forensic-evidence-numbers",values.join(" · ")));
    return wrap;
  }
  function card(position,idx,quote,base){
    const positive=position.net_pnl_quote>0.00001;
    const negative=position.net_pnl_quote<-0.00001;
    const details=node("details","forensic-position");
    const summary=node("summary","forensic-position-summary");
    const id=node("span","forensic-position-id","POSITION "+String(idx).padStart(2,"0"));
    const datePart=node("span","forensic-position-date",date(position.opened_utc)+" → "+
      (position.status==="OPEN"?"OUVERTE":date(position.closed_utc)));
    const pnl=node("strong",negative?"forensic-loss":positive?"forensic-gain":"forensic-neutral",
      signed(position.net_pnl_quote)+" "+quote);
    summary.append(id,datePart,pnl,node("span","forensic-toggle","Détails"));
    details.append(summary);
    const inside=node("div","forensic-position-body");
    const metrics=node("div","forensic-position-metrics");
    const number=(label,value,sub)=>{
      const box=node("div","forensic-position-metric");
      box.append(node("small","",label),node("strong","",value),node("span","",sub));
      return box;
    };
    metrics.append(
      number("QUANTITÉ",fr(position.quantity_base,8)+" "+base,
             position.entry_count+" achat(s)"),
      number("COÛT TOTAL DES COMMISSIONS",fr(position.total_fees_quote,4)+" "+quote,
             "Entrée(s) et sortie(s)"),
      number("RÉSULTAT NET SUR COÛT",signed(position.net_return_on_cost_pct)+" %",
             position.status==="OPEN"?"Non réalisé":"Réalisé, frais inclus"),
      number("DURÉE",fr(position.holding_bars,0)+" bougies",
             "Depuis la première entrée, jusqu'à la sortie ou dernière clôture")
    );
    inside.append(metrics);
    if(position.price_excursion){
      const excursion=node("div","forensic-excursions");
      excursion.append(
        node("span","forensic-excursion-positive",
            "MFE · Meilleure excursion observée : "+signed(position.price_excursion.max_favorable_pct)+" %"),
        node("span","forensic-excursion-negative",
            "MAE · Pire excursion observée : "+signed(position.price_excursion.max_adverse_pct)+" %")
      );
      inside.append(excursion);
    }else{
      inside.append(node("p","forensic-excursions-unavailable",
        position.entry_count>1
          ?"MFE/MAE volontairement non calculées : entrées multiples (DCA), pas de point d'entrée unique."
          :"MFE/MAE indisponibles : historique de bougies insuffisant dans la position."));
    }
    const causes=node("div","forensic-cause-box");
    causes.append(node("small","","LECTURE DES DÉCLENCHEMENTS"));
    for(const buy of position.entries)causes.append(evidence(buy,quote));
    if(position.exit)causes.append(evidence(position.exit,quote));
    else causes.append(node("p","forensic-open-note",
      "Cette position est ouverte dans le rapport : résultat évalué au dernier cours historique, pas une vente. Elle n'entre pas dans les statistiques de positions gagnantes ou perdantes."));
    inside.append(causes);
    details.append(inside);
    return details;
  }
  function filtered(p,criterion){
    if(criterion==="loss")return p.status==="CLOSED"&&p.net_pnl_quote<-.00001;
    if(criterion==="win")return p.status==="CLOSED"&&p.net_pnl_quote>.00001;
    if(criterion==="open")return p.status==="OPEN";
    return true;
  }
  function show(){
    if(!last)return;
    const quote=last.source.quote||"USDC",base=last.source.base||"BTC";
    const criterion=$("forensic-filter").value;
    const records=last.positions_latest_first||[];
    const selected=records.filter(p=>filtered(p,criterion));
    setText("forensic-count",selected.length+" position(s) affichée(s) · "+
      "dernières "+last.display_limit+" positions maximum");
    const root=$("forensic-list");root.replaceChildren();
    if(!selected.length){
      root.append(node("p","forensic-none","Aucune position correspondant à ce filtre."));
      return;
    }
    for(const [i,p] of selected.entries()){
      root.append(card(p,last.metrics.all_positions-i,quote,base));
    }
  }
  function render(payload){
    if(payload.safety?.orders_real!==0 ||
       payload.status!=="DETERMINISTIC_REPLAY_MATCHES_SAVED_PAPER_FILLS")
      throw Error("L'intégrité de la relecture PAPER n'a pas été confirmée.");
    last=payload;
    setText("forensic-source",payload.source.exchange+" · "+payload.source.pair+" · "+
      payload.timeframe+" · "+fr(payload.period.bars,0)+" bougies vérifiées");
    setText("forensic-integrity","SHA-256 "+payload.source.sha256.slice(0,24)+"… · "+
      "Horodatages et exécutions concordants");
    const total=payload.metrics;
    setText("forensic-total",fr(total.all_positions,0));
    setText("forensic-closed",fr(total.closed_positions,0));
    setText("forensic-wins",total.winning_closed_positions+" gagnante(s) / "+
      total.losing_closed_positions+" perdante(s)");
    setText("forensic-realized",signed(total.realized_net_pnl_quote)+" "+payload.source.quote);
    $("forensic-realized").className=total.realized_net_pnl_quote<0?"forensic-loss":"forensic-gain";
    setText("forensic-fills",fr(total.total_original_fills_verified,0));
    $("forensic-result").hidden=false;
    $("forensic-filter").value="all";
    show();
  }
  async function displayRun(report){
    const id=report?.id;
    const now=++token;
    $("forensic-desk").hidden=false;
    $("forensic-result").hidden=true;
    last=null;
    setText("forensic-source","Relecture déterministe du rapport PAPER…");
    setText("forensic-integrity","Vérification source et transactions en cours");
    if(!id || !/^[a-f0-9]{32}$/.test(id)){
      setText("forensic-source","Rapport historique non identifié.");
      return;
    }
    try{
      const response=await fetch("/api/trade-forensics?run_id="+id,{cache:"no-store"});
      const payload=await response.json();
      if(!response.ok)throw Error(payload.error||"Relecture impossible");
      if(now!==token)return;
      render(payload.forensics);
    }catch(err){
      if(now!==token)return;
      last=null;
      setText("forensic-source","Diagnostic indisponible : "+err.message);
      setText("forensic-integrity","Le rapport original reste inchangé.");
    }
  }
  function clear(){
    token++;
    last=null;
    $("forensic-result").hidden=true;
    $("forensic-desk").hidden=true;
  }
  $("forensic-filter").addEventListener("change",show);
  window.AetherForensics={displayRun,clear};
})();
