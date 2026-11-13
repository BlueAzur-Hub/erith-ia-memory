"use strict";
/* Seven Heaven Strategy Lab V2 · all API calls stay on same-origin localhost.
   No external scripts, exchange keys, account access or order endpoints. */
(() => {
  const $ = id => document.getElementById(id);
  const form = $("config");
  const print = (n, digits=2) => Number(n).toLocaleString("fr-FR", {maximumFractionDigits: digits});
  const signed = (n, digits=2) => (Number(n) > 0 ? "+" : "") + print(n, digits);
  let currency="USDT";
  const money = n => print(n,2)+" "+currency;
  const BINANCE="BINANCE_BTCUSDT_2026_01_1M";
  const whenUTC = t => new Date(t * 1000).toISOString().slice(0,16).replace("T"," ");
  const whenLocal = s => new Date(s).toLocaleString("fr-FR", {dateStyle:"short",timeStyle:"short"});
  const kinds = {
    EMA_CROSS:"Croisement EMA", BOLLINGER:"Bandes Bollinger", DCA:"DCA programmé",
    HOLD_50:"Buy & Hold 50 %", HOLD_100:"Buy & Hold 100 %", CASH:"Conserver les USDT",
    CUSTOM_RULES:"Ma stratégie personnalisée"
  };
  let profiles = [];
  let busy = false;
  let available=false;
  let binanceAvailable=false;
  let connectedSources=[];
  let selectedSourceId=BINANCE;
  let lastRenderedReport=null;

  async function api(path, data) {
    const init = data === undefined
      ? {cache:"no-store"}
      : {method:"POST", cache:"no-store", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)};
    let response;
    try { response = await fetch(path, init); }
    catch (_) { throw new Error("Le serveur local ne répond pas. Vérifie la fenêtre Python sur ta clé USB."); }
    let payload;
    try { payload = await response.json(); }
    catch (_) { throw new Error("Le serveur n'a pas renvoyé de JSON lisible."); }
    if (!response.ok) throw new Error(payload.error || "Une opération locale a échoué.");
    return payload;
  }
  function notice(message, tone="") {
    $("message").textContent = message;
    $("message").className = "notice" + (tone ? " " + tone : "");
  }
  function setBusy(working, label="Calcul en cours…") {
    busy = working;
    for (const id of ["import","okx-import","run","compare","robustness-run","filters-run","save-profile"]) {
      const b = $(id);
      if (!b.dataset.defaultText) b.dataset.defaultText = b.textContent;
      b.disabled = working || ((id === "run" || id === "compare" || id === "filters-run") && !available)
        || (id === "filters-run" && !["EMA_CROSS","CUSTOM_RULES"].includes($("kind").value));
      b.textContent = working && (id === "run" || id === "compare") ? label : b.dataset.defaultText;
    }
  }
  function number(input) {
    const text = String(input).trim().replace(",",".");
    if (!/^-?\d+(\.\d+)?$/.test(text)) throw new Error("Nombre incorrect : " + input);
    const val = Number(text);
    if (!Number.isFinite(val)) throw new Error("Nombre non fini : " + input);
    return val;
  }
  function requestParams() {
    const data = new FormData(form);
    const val = key => data.get(key);
    return {
      kind:val("kind"), timeframe:val("timeframe") || "1m",
      source_id:$("source-choice").value,
      capital:number(val("capital")), fee:number(val("fee_pct")) / 100,
      slippage:number(val("slippage_pct")) / 100,
      ema_fast:number(val("ema_fast")), ema_slow:number(val("ema_slow")),
      bb_period:number(val("bb_period")), bb_sigma:number(val("bb_sigma")),
      dca_every:number(val("dca_every")), dca_quote:number(val("dca_quote")),
      entry_rule:val("entry_rule"), filter_rule:val("filter_rule"), exit_rule:val("exit_rule"),
      rsi_period:number(val("rsi_period")), rsi_entry_max:number(val("rsi_entry_max")),
      rsi_exit_min:number(val("rsi_exit_min")),
      volume_period:number(val("volume_period")), volume_multiplier:number(val("volume_multiplier")),
      stop_loss_pct:number(val("stop_loss_pct")), take_profit_pct:number(val("take_profit_pct"))
    };
  }
  function chooseParams(p) {
    const values = {
      kind:p.kind, capital:p.capital, fee_pct:print(p.fee*100,2),
      slippage_pct:print(p.slippage*100,2), ema_fast:p.ema_fast,
      ema_slow:p.ema_slow, bb_period:p.bb_period, bb_sigma:p.bb_sigma,
      dca_every:p.dca_every, dca_quote:p.dca_quote,
      entry_rule:p.entry_rule, filter_rule:p.filter_rule, exit_rule:p.exit_rule,
      rsi_period:p.rsi_period, rsi_entry_max:p.rsi_entry_max, rsi_exit_min:p.rsi_exit_min,
      volume_period:p.volume_period, volume_multiplier:p.volume_multiplier,
      stop_loss_pct:p.stop_loss_pct, take_profit_pct:p.take_profit_pct
    };
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      if (field && value !== undefined) field.value = String(value);
    }
    if([...$("source-choice").options].some(x=>x.value===(p.source_id||BINANCE))){
      $("source-choice").value=p.source_id||BINANCE; updateSource();
    }
    const target = p.timeframe || "1m";
    const radio = form.querySelector('input[name="timeframe"][value="'+target+'"]');
    if (radio && !radio.disabled) radio.checked=true;
    showFields();
    markDraftChanged();
  }
  function updateSource(){
    const id=$("source-choice").value;
    if(id!==selectedSourceId) {
      selectedSourceId=id;
      lastRenderedReport=null;
      resetScientific();
      $("draft-status").hidden=true;
      window.AetherMicroscope.clear();
      window.AetherForensics.clear();
      $("result").hidden=true;
      $("empty-result").hidden=false;
      $("comparison-result").hidden=true;
      $("comparison-empty").hidden=false;
      $("readout-mode").textContent="SOURCE CHANGÉE · NOUVELLE SIMULATION À LANCER";
      $("readout-name").textContent="En attente de simulation";
      $("readout-equity").textContent="—";
      $("readout-performance").textContent="—";
      $("readout-summary").textContent="La source vient de changer. Aucun résultat antérieur n'est attribué à ce marché.";
    }
    const source=id===BINANCE?{
      id:BINANCE,exchange:"Binance Spot",pair:"BTC/USDT",base:"BTC",quote:"USDT",
      available_timeframes:["1m","5m","15m","1h","4h"]
    }:connectedSources.find(x=>x.id===id);
    available=!!source&&(id!==BINANCE||binanceAvailable);
    if(!source){if(!busy)setBusy(false);return;}
    currency=source.quote;
    const supported=new Set(source.available_timeframes);
    for(const radio of form.querySelectorAll('input[name="timeframe"]')){
      radio.disabled=!supported.has(radio.value);
      radio.closest("label").classList.toggle("source-disabled",radio.disabled);
    }
    const checked=form.querySelector('input[name="timeframe"]:checked');
    if(!checked||checked.disabled){
      const fallback=form.querySelector('input[name="timeframe"]:not(:disabled)');
      if(fallback)fallback.checked=true;
    }
    $("source-active-title").textContent=source.exchange+" · "+source.pair;
    $("source-active-detail").textContent=id===BINANCE
      ?"Janvier 2026 · archive V1/V2 intégralement préservée"
      :source.rows+" bougies 1h closes · fin "+source.close_boundary_utc.slice(0,16).replace("T"," ")+" UTC";
    $("source-active-hash").textContent=id===BINANCE
      ?"Empreinte de référence du coffre V2"
      :"SHA-256 "+source.sha256.slice(0,24)+"…";
    $("available-timeframe-label").textContent=id===BINANCE
      ?"sur l'archive Binance vérifiée 1m"
      :"source OKX native 1h : horizons 1h et 4h seulement";
    $("capital-unit").textContent=source.quote;
    $("dca-unit").textContent=source.quote;
    $("nav-source").textContent=source.pair+" · "+source.exchange+" · "+(id===BINANCE?"Jan 2026":source.rows+" bougies closes");
    $("okx-source-badge").textContent=id===BINANCE?"ARCHIVE V1/V2":"ARCHIVE OKX ACTIVE";
    if(!busy)setBusy(false);
  }
  async function refreshSources(prefer){
    const d=await api("/api/okx-sources");
    connectedSources=d.sources;
    $("usb-storage").textContent="Libre : "+print(d.free_bytes/1e9,2)+" Go · réserve : "+
      print(d.reserve_bytes/1e9,1)+" Go";
    $("usb-storage").classList.toggle("storage-low",d.free_bytes<d.reserve_bytes);
    const select=$("source-choice"), chosen=prefer||select.value||BINANCE;
    select.replaceChildren(new Option("Binance BTC/USDT · Janvier 2026 · 44 640 × 1m",BINANCE));
    for(const source of connectedSources) {
      select.add(new Option(source.exchange+" "+source.pair+" · "+source.rows+
        " × "+source.bar+" · "+source.close_boundary_utc.slice(0,16),source.id));
    }
    select.value=[...select.options].some(x=>x.value===chosen)?chosen:BINANCE;
    updateSource();
  }

  function resetScientific(){
    $("robustness-result").hidden=true;
    $("robustness-empty").hidden=false;
    $("scientific-fold-list").replaceChildren();
  }
  function markDraftChanged(){
    resetScientific();
    window.AetherFilterStudio.reset();
    if(lastRenderedReport && !$("result").hidden){
      $("draft-status").hidden=false;
    }
  }
  function showFields() {
    const kind = $("kind").value;
    $("ema-fields").hidden = kind !== "EMA_CROSS" && kind !== "CUSTOM_RULES";
    $("custom-fields").hidden = kind !== "CUSTOM_RULES";
    const cmpButton=$("compare");
    const cmpLabel=kind === "CUSTOM_RULES" ? "≋ Comparer ma stratégie aux 6 références" : "≋ Comparer les 6 méthodes sur cet horizon";
    cmpButton.dataset.defaultText=cmpLabel;
    if(!busy)cmpButton.textContent=cmpLabel;
    $("bb-fields").hidden = kind !== "BOLLINGER";
    $("dca-fields").hidden = kind !== "DCA";
    if(!busy)$("filters-run").disabled=!available || !["EMA_CROSS","CUSTOM_RULES"].includes(kind);
  }
  function el(tag, textValue, className) {
    const n=document.createElement(tag);
    if (textValue!==undefined) n.textContent=String(textValue);
    if (className) n.className=className;
    return n;
  }
  function tableRow(parent, columns) {
    const tr=el("tr");
    for (const col of columns) tr.append(el("td", col));
    parent.append(tr);
    return tr;
  }
  function drawChart(series) {
    const root=$("equity-chart");
    root.replaceChildren();
    if (!series || !series.length) return;
    const uri="http://www.w3.org/2000/svg";
    const add=(tag,attrs,label)=>{
      const n=document.createElementNS(uri,tag);
      for (const [name,v] of Object.entries(attrs)) n.setAttribute(name,String(v));
      if (label!==undefined) n.textContent=String(label);
      root.append(n); return n;
    };
    const values=series.map(x=>Number(x.equity));
    const min=Math.min(...values),max=Math.max(...values);
    const spread=Math.max(1,max-min);
    const low=min-spread*.12,high=max+spread*.12;
    const X0=18,X1=705,Y0=20,Y1=207;
    for(let i=0;i<5;i++){
      const y=Y0+(Y1-Y0)*i/4;
      add("line",{x1:X0,y1:y,x2:X1,y2:y,stroke:"#294859","stroke-width":1});
      const value=high+(low-high)*i/4;
      add("text",{x:X0+3,y:y-3,fill:"#7c9aab","font-size":9},print(value,0));
    }
    const coords=series.map((r,i)=>{
      const x=X0+(X1-X0)*(i/Math.max(1,series.length-1));
      const y=Y0+(high-r.equity)/(high-low)*(Y1-Y0);
      return x.toFixed(2)+","+y.toFixed(2);
    }).join(" ");
    const shade=add("polygon",{points:coords+" "+X1+","+Y1+" "+X0+","+Y1,fill:"#56d7cc","fill-opacity":".07"});
    const line=add("polyline",{points:coords,stroke:"#70ece0",fill:"none","stroke-width":2.5,"stroke-linejoin":"round","stroke-linecap":"round"});
    const last=series[series.length-1], endingY=Y0+(high-last.equity)/(high-low)*(Y1-Y0);
    add("circle",{cx:X1,cy:endingY,r:4,fill:"#f1d393",stroke:"#8bd5d1","stroke-width":1.5});
    add("text",{x:X0,y:229,fill:"#91aebe","font-size":10},whenUTC(series[0].t)+" UTC");
    add("text",{x:X1,y:229,fill:"#91aebe","font-size":10,"text-anchor":"end"},whenUTC(last.t)+" UTC");
  }
  function drawDrawdown(series) {
    const root=$("drawdown-chart");
    root.replaceChildren();
    if(!Array.isArray(series) || !series.length ||
       !series.every(x=>Number.isFinite(Number(x.drawdown_pct))))return;
    const values=series.map(x=>Math.min(0,Number(x.drawdown_pct)));
    const minimum=Math.min(...values);
    const bottom=Math.min(-1,minimum*1.08);
    const X0=20,X1=702,Y0=15,Y1=114;
    const svgNS="http://www.w3.org/2000/svg";
    const node=(tag,attrs,label)=>{
      const n=document.createElementNS(svgNS,tag);
      for(const [key,value] of Object.entries(attrs))n.setAttribute(key,String(value));
      if(label!==undefined)n.textContent=String(label);
      root.append(n);return n;
    };
    for(const fraction of [0,.5,1]){
      const y=Y0+(Y1-Y0)*fraction;
      node("line",{x1:X0,y1:y,x2:X1,y2:y,stroke:"#335467","stroke-width":1});
      node("text",{x:X0+3,y:y-3,fill:"#93b1bd","font-size":9},print(bottom*fraction,1)+" %");
    }
    const pts=values.map((v,i)=>{
      const x=X0+(X1-X0)*i/Math.max(1,values.length-1);
      const y=Y0+(Y1-Y0)*v/bottom;
      return x.toFixed(2)+","+y.toFixed(2);
    }).join(" ");
    node("polygon",{points:pts+" "+X1+","+Y0+" "+X0+","+Y0,
                    fill:"#e598ad","fill-opacity":".12"});
    node("polyline",{points:pts,stroke:"#f4a8b9",fill:"none",
                     "stroke-width":2.5,"stroke-linejoin":"round","stroke-linecap":"round"});
    const last=values[values.length-1];
    node("circle",{cx:X1,cy:Y0+(Y1-Y0)*last/bottom,r:3.5,fill:"#f1cf95"});
    node("text",{x:X0,y:139,fill:"#91adbc","font-size":10},whenUTC(series[0].t)+" UTC");
    node("text",{x:X1,y:139,fill:"#91adbc","font-size":10,"text-anchor":"end"},
         whenUTC(series[series.length-1].t)+" UTC");
  }
  function renderQuantDesk(record) {
    const a=record.run.analytics;
    const series=record.run.series;
    const root=$("quant-desk");
    if(!a || !Array.isArray(series) ||
       !series.every(x=>typeof x.drawdown_pct==="number")){
      root.hidden=true;return;
    }
    root.hidden=false;
    $("quant-closed").textContent=print(a.closed_positions,0);
    $("quant-trade-split").textContent=
      print(a.winning_positions,0)+" gagnante(s) · "+
      print(a.losing_positions,0)+" perdante(s)";
    $("quant-winrate").textContent=
      a.win_rate_pct===null?"Non calculable":print(a.win_rate_pct,1)+" %";
    $("quant-profitfactor").textContent=
      a.profit_factor!==null?print(a.profit_factor,2):
      a.profit_factor_status==="NO_CLOSED_LOSSES"?"Pas de pertes clôturées":"Non calculable";
    $("quant-exposure").textContent=print(a.time_in_position_pct,1)+" %";
    $("quant-realized").textContent=signed(a.realized_pnl_quote)+" "+currency;
    $("quant-unrealized").textContent=signed(a.unrealized_pnl_quote)+" "+currency;
    $("quant-realized").className=a.realized_pnl_quote<0?"quant-negative":"quant-positive";
    $("quant-unrealized").className=a.unrealized_pnl_quote<0?"quant-negative":"quant-positive";
    const diff=record.counterfactual?.difference_final_usdt;
    $("quant-cost-drag").textContent=Number.isFinite(diff)
      ? "ÉCART SANS FRICTIONS : "+print(diff,2)+" "+currency : "ÉCART SANS FRICTIONS : NON DISPONIBLE";
    $("quant-limits").textContent=
      "Statistiques calculées sur les positions entièrement clôturées uniquement. "+
      "Résultat latent = inventaire ouvert valorisé à la dernière clôture. "+
      "Le graphique échantillonne les bougies pour l'affichage ; le drawdown maximal est calculé sur toutes. "+
      "L'écart au scénario sans frais ni glissement n'est pas une simple addition de commissions. "+
      "Aucun carnet historique, aucune exécution garantie, aucun ordre réel.";
    drawDrawdown(series);
  }
  function updateReadout(record) {
    const r=record.run.results;
    $("readout-mode").textContent="SIMULATION TERMINÉE · "+(record.run.data.timeframe||"1m");
    $("readout-name").textContent=kinds[record.run.params.kind]||record.run.params.kind;
    $("readout-equity").textContent=money(r.equity_final);
    $("readout-performance").textContent=signed(r.return_pct)+" %";
    $("readout-performance").style.color=r.return_pct<0?"#ffabb9":"#9bf2d2";
    $("readout-summary").textContent=r.hypothetical_fills+" opérations fictives · "+
      money(r.fees_paid_usdt)+" de commissions · Drawdown "+print(r.max_drawdown_pct,2)+" %";
  }
  function renderRun(record) {
    const report=record.run,r=report.results,timeframe=report.data.timeframe||"1m";
    const source=record.source||{base:"BTC",quote:"USDT",id:BINANCE};
    if([...$("source-choice").options].some(o=>o.value===source.id)) {
      $("source-choice").value=source.id;
      updateSource();
    }
    currency=source.quote;
    $("inventory-label").textContent="INVENTAIRE "+source.base;
    $("trades-base-label").textContent=source.base;
    $("hold50-label").textContent="BUY & HOLD · 50 % "+source.base;
    $("holdcash-label").textContent="CONSERVER LES "+source.quote;
    $("empty-result").hidden=true;
    $("result").hidden=false;
    $("run-id").textContent=(kinds[report.params.kind]||report.params.kind)+" · "+timeframe;
    $("equity").textContent=money(r.equity_final);
    $("return").textContent=signed(r.return_pct)+" %";
    $("return").className="return-chip"+(r.return_pct<0?" negative":"");
    $("drawdown").textContent=print(r.max_drawdown_pct)+" %";
    $("fees").textContent=money(r.fees_paid_usdt);
    $("cash").textContent=money(r.cash_final);
    $("inventory").textContent=print(r.base_inventory_btc,8)+" "+source.base;
    $("counts").textContent=r.buy_events+" / "+r.sell_events;
    $("rejected").textContent=r.rejected_orders;
    $("chart-timeframe").textContent="BOUGIES "+timeframe+" · "+report.data.rows+" POINTS D'ENTRÉE";
    $("hold50").textContent=record.baselines?.HOLD_50?signed(record.baselines.HOLD_50.return_pct)+" %":"—";
    $("holdcash").textContent=record.baselines?.CASH?signed(record.baselines.CASH.return_pct)+" %":"—";
    $("zero-cost").textContent=record.counterfactual?
      signed(record.counterfactual.zero_friction_return_pct)+" %":"Non calculé dans V1";
    drawChart(report.series);
    renderQuantDesk(record);
    const tbody=$("trades");tbody.replaceChildren();
    if (!report.trades.length) tableRow(tbody,["Aucune opération fictive","—","—","—","—"]);
    else for (const t of report.trades.slice(-12).reverse())
      tableRow(tbody,[whenUTC(t.timestamp),t.side,print(t.qty,8),print(t.price,2),print(t.fee,4)]);
    updateReadout(record);
    lastRenderedReport=record;
    $("draft-status").hidden=true;
    window.AetherMicroscope.displayRun(record);
    window.AetherForensics.displayRun(record);
    return record;
  }
  function renderComparison(record) {
    const comparison=record.comparison;
    const source=record.source||{id:BINANCE,pair:"BTC/USDT",exchange:"Binance Spot",quote:"USDT"};
    if([...$("source-choice").options].some(o=>o.value===source.id)) {
      $("source-choice").value=source.id;
      updateSource();
    }
    currency=source.quote;
    $("comparison-empty").hidden=true;
    $("comparison-result").hidden=false;
    $("comparison-badge").textContent=comparison.rows.length+" MODÈLES · "+comparison.timeframe;
    $("compare-context").textContent=
      source.pair+" · "+source.exchange+" · "+comparison.aggregated_candles+" BOUGIES "+comparison.timeframe;
    const tbody=$("comparison-rows");tbody.replaceChildren();
    for(const row of comparison.rows){
      const tr=el("tr");
      tr.append(el("td",row.label,"strategy-label"));
      tr.append(el("td",signed(row.return_pct)+" %",row.return_pct<0?"numeric-loss":"numeric-gain"));
      tr.append(el("td",money(row.equity_final)));
      tr.append(el("td",print(row.max_drawdown_pct)+" %"));
      tr.append(el("td",money(row.fees_paid_usdt)));
      tr.append(el("td",row.hypothetical_fills));
      const cell=el("td"),button=el("button","Examiner","study-button");
      button.type="button";
      button.addEventListener("click",async()=>{
        if(busy)return;
        chooseParams({...comparison.params,kind:row.kind,timeframe:comparison.timeframe,
                      source_id:source.id});
        await runCurrent();
        $("results").scrollIntoView({behavior:"smooth",block:"start"});
      });
      cell.append(button);tr.append(cell);tbody.append(tr);
    }
  }
  async function refreshDataset() {
    const result=await api("/api/datasets");
    const ok=result.datasets[0]?.available===true;
    binanceAvailable=ok;
    $("dataset-badge").textContent=ok?"ARCHIVE AUTHENTIFIÉE":"SOURCE NON CHARGÉE";
    $("dataset-badge").className="mini-badge"+(ok?"":" gold-badge");
    $("dataset-state").textContent=ok
      ?"44 640 bougies conservées sur ta clé · SHA-256 vérifié · aucun nouveau téléchargement."
      :"Téléchargement de notre archive GitHub sur demande · pas d'accès à un compte.";
    updateSource();
    return ok;
  }
  async function refreshProfiles() {
    const d=await api("/api/profiles");profiles=d.profiles;
    const select=$("saved-profiles");
    select.replaceChildren(new Option("Choisir une configuration…",""));
    for (const profile of profiles) select.append(new Option(
      profile.name+" · "+(profile.params.timeframe||"1m"),profile.id));
  }
  async function refreshHistory() {
    const list=await api("/api/results");
    const root=$("history");root.replaceChildren();
    if(!list.runs.length){root.append(el("span","Aucune simulation enregistrée.","muted"));return;}
    for(const run of list.runs.slice(0,12)){
      const button=el("button",undefined,"history-item");
      button.type="button";
      button.append(el("span",(kinds[run.kind]||run.kind)+" · "+
        (run.timeframe||"1m")+" · "+whenLocal(run.created_utc)));
      button.append(el("strong",signed(run.results.return_pct)+" %"));
      button.addEventListener("click",async()=>{
        if(busy)return;
        try{
          const stored=await api("/api/results/"+run.id);
          renderRun(stored);
          notice("Rapport sauvegardé rechargé depuis ta clé USB. Aucun nouveau calcul.","success");
          $("results").scrollIntoView({behavior:"smooth",block:"start"});
        }catch(e){notice(e.message,"error");}
      });
      root.append(button);
    }
  }
  async function refreshComparisonHistory() {
    const list=await api("/api/comparisons");
    const root=$("comparison-history");root.replaceChildren();
    if(!list.comparisons.length){root.append(el("span","Aucune comparaison enregistrée.","muted"));return;}
    for(const cmp of list.comparisons.slice(0,12)){
      const button=el("button",undefined,"history-item");
      button.type="button";
      button.append(el("span",((cmp.rows?.length)||6)+" stratégies · "+cmp.timeframe+" · "+whenLocal(cmp.created_utc)));
      button.append(el("strong","Voir le tableau"));
      button.addEventListener("click",async()=>{
        if(busy)return;
        try {
          const stored=await api("/api/comparisons/"+cmp.id);
          renderComparison(stored);
          notice("Comparaison enregistrée rechargée depuis ta clé USB.","success");
          $("comparison").scrollIntoView({behavior:"smooth",block:"start"});
        }catch(e){notice(e.message,"error");}
      });
      root.append(button);
    }
  }
  function makeScientificMetric(label, value, note, negative=false){
    const tile=el("div",undefined,"scientific-fold-metric");
    const caption=el("small",label);
    const num=el("strong",value,negative?"scientific-negative":"scientific-positive");
    tile.append(caption,num,el("span",note));
    return tile;
  }
  function renderScientific(research) {
    if(!research || research.safety?.orders_real!==0 ||
       !Array.isArray(research.folds) || !research.folds.length)
       throw new Error("Analyse de robustesse incohérente");
    const quote=research.source.quote||"USDC";
    $("robustness-empty").hidden=true;
    $("robustness-result").hidden=false;
    $("scientific-source").textContent=research.source.exchange+" · "+
      research.source.pair+" · "+research.timeframe+" · "+
      print(research.total_bars,0)+" bougies clôturées · "+research.selected_kind;
    $("scientific-hash").textContent="SOURCE SHA-256 "+
      research.source.sha256.slice(0,27)+"… · CAPITAL PAR FENÊTRE : "+
      print(research.capital_per_independent_window,2)+" "+quote;
    const total=research.summary;
    $("scientific-folds-count").textContent=print(total.holdout_windows,0);
    $("scientific-average").textContent=signed(total.mean_holdout_return_pct)+" %";
    $("scientific-worst").textContent=signed(total.worst_holdout_return_pct)+" %";
    $("scientific-stressed").textContent=signed(total.mean_holdout_double_cost_return_pct)+" %";
    for(const [id,val] of [["scientific-average",total.mean_holdout_return_pct],
                            ["scientific-worst",total.worst_holdout_return_pct],
                            ["scientific-stressed",total.mean_holdout_double_cost_return_pct]]){
      $(id).className=val<0?"scientific-negative":"scientific-positive";
    }
    const target=$("scientific-fold-list");
    target.replaceChildren();
    for(const fold of research.folds){
      const card=el("article",undefined,"scientific-fold");
      const heading=el("div",undefined,"scientific-fold-heading");
      const left=el("div");
      left.append(el("small","FENÊTRE "+String(fold.fold).padStart(2,"0")+" · SÉLECTION SUR PASSÉ"));
      const pair=fold.selection.ema_fast+"/"+fold.selection.ema_slow;
      left.append(el("strong",research.selected_kind==="EMA_CROSS"||
        research.selected_kind==="CUSTOM_RULES"?"EMA "+pair+" · "+kinds[research.selected_kind]:
        kinds[research.selected_kind]||research.selected_kind));
      heading.append(left,el("span",fold.selection.candidates_considered+
        (fold.selection.candidates_considered>1?" CONFIGURATIONS ESSAYÉES":" CONFIGURATION CONSERVÉE"),
        "scientific-candidate-count"));
      const grid=el("div",undefined,"scientific-fold-metrics");
      grid.append(
        makeScientificMetric("APPRENTISSAGE · HISTORIQUE ANTÉRIEUR",
          signed(fold.training.metrics.return_pct)+" %",
          utcSpan(fold.training.first_bar_utc,fold.training.last_bar_utc)+
          " · "+fold.training.bars+" bougies",
          fold.training.metrics.return_pct<0),
        makeScientificMetric("VÉRIFICATION · HISTORIQUE ULTÉRIEUR",
          signed(fold.holdout.metrics.return_pct)+" %",
          utcSpan(fold.holdout.first_bar_utc,fold.holdout.last_bar_utc)+
          " · "+fold.holdout.bars+" bougies",
          fold.holdout.metrics.return_pct<0),
        makeScientificMetric("DRAWDOWN EN VÉRIFICATION",
          print(fold.holdout.metrics.max_drawdown_pct)+" %",
          print(fold.holdout.metrics.hypothetical_fills,0)+
          " fills PAPER · frais "+moneyFor(fold.holdout.metrics.fees_paid_quote,quote),
          fold.holdout.metrics.max_drawdown_pct<0),
        makeScientificMetric("FRAIS ET GLISSEMENT ×2",
          signed(fold.holdout.both_x2.return_pct)+" %",
          "Frais ×2 : "+signed(fold.holdout.fee_x2.return_pct)+
          " % · glissement ×2 : "+signed(fold.holdout.slippage_x2.return_pct)+" %",
          fold.holdout.both_x2.return_pct<0)
      );
      const foot=el("div",undefined,"scientific-fold-foot");
      foot.textContent="Références sur la même vérification : Buy & Hold 50 % "+
        signed(fold.holdout.benchmark_hold_50.return_pct)+
        " % · Conservation "+quote+" "+
        signed(fold.holdout.benchmark_cash.return_pct)+" %";
      card.append(heading,grid,foot);
      target.append(card);
    }
    $("scientific-method").textContent=research.folds.length>1?
      "Deux fenêtres de validation chronologiques distinctes. Le second entraînement réutilise les dates passées du premier test, comme une recherche walk-forward expansive.":
      "Une seule séparation entraînement/vérification : l'historique est trop court pour deux vérifications indépendantes de 60 bougies.";
  }
  function utcSpan(from,to){
    return whenUTC(from).slice(0,16)+" → "+whenUTC(to).slice(0,16)+" UTC";
  }
  function moneyFor(amount,quote){return print(amount,2)+" "+quote;}
  async function runRobustness(){
    if(busy)return;
    let params;
    try{params=requestParams();}catch(e){notice(e.message,"error");return;}
    setBusy(true,"Étude chronologique…");
    notice("Aether Scientific : séparation des dates, sélection EMA sur le passé et vérifications PAPER ultérieures…");
    resetScientific();
    try{
      const payload=await api("/api/robustness",{params});
      renderScientific(payload.research);
      notice("Robustesse calculée sur la source SHA-256 : "+
        payload.research.summary.holdout_windows+
        " fenêtre(s) de vérification. Aucun fichier ajouté à ta clé USB.","success");
      $("robustness").scrollIntoView({behavior:"smooth",block:"start"});
    }catch(e){notice(e.message,"error");}
    finally{setBusy(false);}
  }
  async function runFilterStudy(){
    if(busy)return;
    let params;
    try{params=requestParams();}catch(e){notice(e.message,"error");return;}
    if(!["EMA_CROSS","CUSTOM_RULES"].includes(params.kind)){
      notice("Aether Research compare les filtres d'entrée des stratégies EMA et personnelles. Choisis l'une de ces deux familles.","error");
      return;
    }
    setBusy(true,"Recherche comparée…");
    window.AetherFilterStudio.reset();
    notice("Aether Research V4.5 : mêmes règles, cinq filtres maximum, sélection sur le passé, vérification chronologique…");
    try {
      const payload=await api("/api/filters-study",{params});
      window.AetherFilterStudio.display(payload.research);
      const summary=payload.research.summary;
      notice("Recherche terminée : "+summary.variants_compared+
        " variantes, "+summary.verification_windows+" fenêtre(s) indépendantes. Aucun fichier USB créé.","success");
      $("strategy-research").scrollIntoView({behavior:"smooth",block:"start"});
    }catch(e){notice(e.message,"error");}
    finally{setBusy(false);}
  }
  async function runCurrent() {
    if(busy)return;
    let params;
    try {params=requestParams();}catch(e){notice(e.message,"error");return;}
    setBusy(true,"Calcul PAPER…");
    notice("Rejeu historique local du marché sélectionné et de son inventaire…");
    try {
      const d=await api("/api/run",{params});
      renderRun(d.report);
      await refreshHistory();
      notice("Simulation PAPER enregistrée : "+params.timeframe+
        " · "+(kinds[params.kind]||params.kind)+". Aucun ordre envoyé.","success");
    }catch(e){notice(e.message,"error");}
    finally{setBusy(false);}
  }
  async function compareCurrent() {
    if(busy)return;
    let params;
    try {params=requestParams();}catch(e){notice(e.message,"error");return;}
    setBusy(true,"Comparaison PAPER…");
    notice("Comparaison des stratégies sur exactement les mêmes bougies et frais…");
    try{
      const d=await api("/api/compare",{params});
      renderComparison(d.report);
      await refreshComparisonHistory();
      notice(d.report.comparison.rows.length+" méthodes comparées et rapport enregistré localement. Résultats fictifs.","success");
      $("comparison").scrollIntoView({behavior:"smooth",block:"start"});
    }catch(e){notice(e.message,"error");}
    finally {setBusy(false);}
  }
  $("kind").addEventListener("change",showFields);
  form.addEventListener("change",markDraftChanged);
  form.addEventListener("input",markDraftChanged);
  $("source-choice").addEventListener("change",updateSource);
  $("okx-import").addEventListener("click",async()=>{
    if(busy)return;
    setBusy(true,"Collecte OKX…");
    const pair=$("okx-pair").value;
    const days=Number($("okx-history-days").value);
    const endDate=$("okx-history-date").value.trim();
    notice("OKX public : "+days+" jours, contrôle Spot, bougies clôturées et cache SHA-256…");
    try {
      const result=await api("/api/okx-import",{pair,days,end_date:endDate||null});
      await refreshSources(result.source.id);
      notice("OKX "+pair+" : "+result.source.rows+" bougies 1h closes et vérifiées sur la clé. "+
             "Tu peux comparer les stratégies en 1h ou 4h. Aucun ordre réel.","success");
    }catch(e){notice(e.message,"error");}
    finally{setBusy(false);}
  });
  form.addEventListener("submit",event=>{event.preventDefault();runCurrent();});
  $("compare").addEventListener("click",compareCurrent);
  $("robustness-run").addEventListener("click",runRobustness);
  $("filters-run").addEventListener("click",runFilterStudy);
  $("saved-profiles").addEventListener("change",event=>{
    const profile=profiles.find(p=>p.id===event.target.value);
    if(profile){chooseParams(profile.params);$("profile-name").value=profile.name;}
  });
  $("import").addEventListener("click",async()=>{
    if(busy)return;
    setBusy(true,"Vérification des données…");
    notice("Chargement et vérification de l'archive publique du Coffre…");
    try {
      await api("/api/import-reference",{});
      await refreshDataset();
      notice("44 640 bougies authentifiées : le laboratoire est prêt.","success");
    }catch(e){notice(e.message,"error");}
    finally{setBusy(false);}
  });
  $("save-profile").addEventListener("click",async()=>{
    if(busy)return;
    const name=$("profile-name").value.trim();
    if(!name){notice("Choisis un nom avant de sauvegarder le profil.","error");return;}
    let params;try{params=requestParams();}catch(e){notice(e.message,"error");return;}
    setBusy(true);
    try {
      await api("/api/profiles",{name,params});
      await refreshProfiles();
      notice("Profil « "+name+" » conservé sur ton espace local.","success");
    }catch(e){notice(e.message,"error");}
    finally{setBusy(false);}
  });
  (async()=>{
    showFields();
    try {
      const health=await api("/api/health");
      if(!health.comparisons_enabled)throw new Error("Le serveur Python V2 n'est pas actif. Ferme l'ancienne instance et relance le lanceur V2.");
      if(!health.public_okx_enabled || !health.walk_forward_research_enabled || !health.paper_trade_forensics_enabled || !health.controlled_filter_research_enabled)throw new Error("Le serveur Python V4.5 n'est pas actif. Ferme l'ancien serveur puis relance le lanceur.");
      const [ok]=await Promise.all([refreshDataset(),refreshProfiles(),refreshHistory(),refreshComparisonHistory()]);
      await refreshSources();
      notice(ok?"Seven Heaven V4.5 opérationnel · Archive V1/V2 conservée · OKX public disponible.":
        "Seven Heaven V4.5 opérationnel. Charge une archive Binance ou OKX publique.","success");
    }catch(e){setBusy(false);available=false;setBusy(false);notice(e.message,"error");}
  })();
})();
