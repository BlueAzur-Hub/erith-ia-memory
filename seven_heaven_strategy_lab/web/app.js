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
    HOLD_50:"Buy & Hold 50 %", HOLD_100:"Buy & Hold 100 %", CASH:"Conserver les USDT"
  };
  let profiles = [];
  let busy = false;
  let available=false;
  let binanceAvailable=false;
  let connectedSources=[];

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
    for (const id of ["import","okx-import","run","compare","save-profile"]) {
      const b = $(id);
      if (!b.dataset.defaultText) b.dataset.defaultText = b.textContent;
      b.disabled = working || ((id === "run" || id === "compare") && !available);
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
      dca_every:number(val("dca_every")), dca_quote:number(val("dca_quote"))
    };
  }
  function chooseParams(p) {
    const values = {
      kind:p.kind, capital:p.capital, fee_pct:print(p.fee*100,2),
      slippage_pct:print(p.slippage*100,2), ema_fast:p.ema_fast,
      ema_slow:p.ema_slow, bb_period:p.bb_period, bb_sigma:p.bb_sigma,
      dca_every:p.dca_every, dca_quote:p.dca_quote
    };
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      if (field && value !== undefined) field.value = String(value);
    }
    if(p.source_id && [...$("source-choice").options].some(x=>x.value===p.source_id)){
      $("source-choice").value=p.source_id; updateSource();
    }
    const target = p.timeframe || "1m";
    const radio = form.querySelector('input[name="timeframe"][value="'+target+'"]');
    if (radio && !radio.disabled) radio.checked=true;
    showFields();
  }
  function updateSource(){
    const id=$("source-choice").value;
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
      :"240 bougies 1h closes · fin "+source.close_boundary_utc.slice(0,16).replace("T"," ")+" UTC";
    $("source-active-hash").textContent=id===BINANCE
      ?"Empreinte de référence du coffre V2"
      :"SHA-256 "+source.sha256.slice(0,24)+"…";
    $("available-timeframe-label").textContent=id===BINANCE
      ?"sur l'archive Binance vérifiée 1m"
      :"source OKX native 1h : horizons 1h et 4h seulement";
    $("capital-unit").textContent=source.quote;
    $("dca-unit").textContent=source.quote;
    $("nav-source").textContent=source.pair+" · "+source.exchange+" · "+(id===BINANCE?"Jan 2026":"240 bougies closes");
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

  function showFields() {
    const kind = $("kind").value;
    $("ema-fields").hidden = kind !== "EMA_CROSS";
    $("bb-fields").hidden = kind !== "BOLLINGER";
    $("dca-fields").hidden = kind !== "DCA";
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
    $("empty-result").hidden=true;
    $("result").hidden=false;
    $("run-id").textContent=(kinds[report.params.kind]||report.params.kind)+" · "+timeframe;
    $("equity").textContent=money(r.equity_final);
    $("return").textContent=signed(r.return_pct)+" %";
    $("return").className="return-chip"+(r.return_pct<0?" negative":"");
    $("drawdown").textContent=print(r.max_drawdown_pct)+" %";
    $("fees").textContent=money(r.fees_paid_usdt);
    $("cash").textContent=money(r.cash_final);
    $("inventory").textContent=print(r.base_inventory_btc,8)+" BTC";
    $("counts").textContent=r.buy_events+" / "+r.sell_events;
    $("rejected").textContent=r.rejected_orders;
    $("chart-timeframe").textContent="BOUGIES "+timeframe+" · "+report.data.rows+" POINTS D'ENTRÉE";
    $("hold50").textContent=record.baselines?.HOLD_50?signed(record.baselines.HOLD_50.return_pct)+" %":"—";
    $("holdcash").textContent=record.baselines?.CASH?signed(record.baselines.CASH.return_pct)+" %":"—";
    $("zero-cost").textContent=record.counterfactual?
      signed(record.counterfactual.zero_friction_return_pct)+" %":"Non calculé dans V1";
    drawChart(report.series);
    const tbody=$("trades");tbody.replaceChildren();
    if (!report.trades.length) tableRow(tbody,["Aucune opération fictive","—","—","—","—"]);
    else for (const t of report.trades.slice(-12).reverse())
      tableRow(tbody,[whenUTC(t.timestamp),t.side,print(t.qty,8),print(t.price,2),print(t.fee,4)]);
    updateReadout(record);
    return record;
  }
  function renderComparison(record) {
    const comparison=record.comparison;
    $("comparison-empty").hidden=true;
    $("comparison-result").hidden=false;
    $("comparison-badge").textContent="6 MODÈLES · "+comparison.timeframe;
    $("compare-context").textContent=
      "BTC/USDT · JANVIER 2026 · "+comparison.aggregated_candles+" BOUGIES "+comparison.timeframe;
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
        chooseParams({...comparison.params,kind:row.kind,timeframe:comparison.timeframe});
        await runCurrent();
        $("results").scrollIntoView({behavior:"smooth",block:"start"});
      });
      cell.append(button);tr.append(cell);tbody.append(tr);
    }
  }
  async function refreshDataset() {
    const result=await api("/api/datasets");
    const ok=result.datasets[0]?.available===true;
    available=ok;
    $("dataset-badge").textContent=ok?"ARCHIVE AUTHENTIFIÉE":"SOURCE NON CHARGÉE";
    $("dataset-badge").className="mini-badge"+(ok?"":" gold-badge");
    $("dataset-state").textContent=ok
      ?"44 640 bougies conservées sur ta clé · SHA-256 vérifié · aucun nouveau téléchargement."
      :"Téléchargement de notre archive GitHub sur demande · pas d'accès à un compte.";
    if (!busy) setBusy(false);
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
      button.append(el("span","Six stratégies · "+cmp.timeframe+" · "+whenLocal(cmp.created_utc)));
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
  async function runCurrent() {
    if(busy)return;
    let params;
    try {params=requestParams();}catch(e){notice(e.message,"error");return;}
    setBusy(true,"Calcul PAPER…");
    notice("Rejeu local des bougies, frais et inventaire BTC en cours…");
    try {
      const d=await api("/api/run",{params});
      renderRun(d.report);
      await refreshHistory();
      notice("Simulation V2 enregistrée : "+params.timeframe+
        " · "+(kinds[params.kind]||params.kind)+". Aucun ordre envoyé.","success");
    }catch(e){notice(e.message,"error");}
    finally{setBusy(false);}
  }
  async function compareCurrent() {
    if(busy)return;
    let params;
    try {params=requestParams();}catch(e){notice(e.message,"error");return;}
    setBusy(true,"Comparaison PAPER…");
    notice("Comparaison des six stratégies sur exactement les mêmes bougies et frais…");
    try{
      const d=await api("/api/compare",{params});
      renderComparison(d.report);
      await refreshComparisonHistory();
      notice("Six méthodes comparées et rapport enregistré localement. Résultats fictifs.","success");
      $("comparison").scrollIntoView({behavior:"smooth",block:"start"});
    }catch(e){notice(e.message,"error");}
    finally {setBusy(false);}
  }
  $("kind").addEventListener("change",showFields);
  form.addEventListener("submit",event=>{event.preventDefault();runCurrent();});
  $("compare").addEventListener("click",compareCurrent);
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
      const [ok]=await Promise.all([refreshDataset(),refreshProfiles(),refreshHistory(),refreshComparisonHistory()]);
      notice(ok?"Seven Heaven V2 opérationnel · Archive vérifiée · PAPER uniquement.":
        "Seven Heaven V2 opérationnel. Charge l'archive historique vérifiée pour commencer.","success");
    }catch(e){setBusy(false);available=false;setBusy(false);notice(e.message,"error");}
  })();
})();
