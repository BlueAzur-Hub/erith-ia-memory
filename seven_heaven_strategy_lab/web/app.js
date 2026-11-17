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
  const BINANCE_MONTHLY="BINANCE_SPOT_BTCUSDT_1H_2020_01";
  const whenUTC = t => new Date(t * 1000).toISOString().slice(0,16).replace("T"," ");
  const whenLocal = s => new Date(s).toLocaleString("fr-FR", {dateStyle:"short",timeStyle:"short"});
  const sourceTime = value => {
    if (typeof value === "number") return whenUTC(value);
    return String(value || "").slice(0,16).replace("T"," ");
  };
  const assetName = base => ({BTC:"Bitcoin",ETH:"Ethereum",SOL:"Solana",XRP:"XRP",BNB:"BNB"})[base] || base || "Actif";
  const assetIcon = base => ({BTC:"₿",ETH:"Ξ",SOL:"◎",XRP:"✕",BNB:"◆"})[base] || "◇";
  const shortDate = value => {
    if(!value)return "—";
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return String(value).slice(0,10);
    return d.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});
  };
  const coverageLabel = source => {
    const c=source?.coverage||{};
    const first=c.first_utc||source?.first_utc, last=c.last_utc||source?.last_utc;
    if(first&&last)return shortDate(first)+" → "+shortDate(last);
    if(source?.close_boundary_utc)return "jusqu’au "+shortDate(source.close_boundary_utc);
    return "Période non précisée";
  };
  const certificationLabel = status => ({
    OFFICIAL_CHECKSUM_MATCHED_COMPLETE_MONTH:"Checksum officiel vérifié",
    SHA256_CONTIGUOUS_CLOSED_CANDLES:"Bougies closes continues · SHA-256 vérifié",
    SHA256_REFERENCE_ARCHIVE:"Archive de référence · SHA-256 vérifié",
    VERIFIED_LOCAL_SOURCE:"Source locale vérifiée"
  })[status] || String(status||"Source vérifiée").replaceAll("_"," ");
  const familyLabel = entry => entry?.family_label || ({TREND:"Suivi de tendance",MEAN_REVERSION:"Retour à la moyenne",ACCUMULATION:"Accumulation",BASELINE:"Référence",COMPOSER:"Personnalisée"})[entry?.family] || entry?.family || "Méthode";
  const kinds = {
    EMA_CROSS:"Croisement EMA", BOLLINGER:"Bandes Bollinger", DONCHIAN:"Cassure Donchian", DCA:"DCA programmé",
    HOLD_50:"Buy & Hold 50 %", HOLD_100:"Buy & Hold 100 %", CASH:"Conserver le cash",
    CUSTOM_RULES:"Ma stratégie personnalisée"
  };
  const strategyLabel = (kind, source=null) => {
    const base=source?.base || "";
    const quote=source?.quote || "";
    if(kind==="HOLD_50") return "Buy & Hold 50 %"+(base?" "+base:"");
    if(kind==="HOLD_100") return "Buy & Hold 100 %"+(base?" "+base:"");
    if(kind==="CASH") return quote?"Conserver les "+quote:"Conserver le cash";
    return kinds[kind]||kind;
  };
  let profiles = [];
  let strategySpecs = [];
  let workspaceManaged = false;
  let selectedStrategySpec = null;
  let sourceCatalog = null;
  let strategyAtlas = [];
  let emaKnowledge = null;
  let bollingerKnowledge = null;
  let donchianKnowledge = null;
  const passiveKnowledgeCache = {};
  let passiveKnowledgeCurrentId = null;
  let busy = false;
  let available=false;
  let binanceAvailable=false;
  let connectedSources=[];
  let selectedSourceId=BINANCE;
  let lastRenderedReport=null;
  let guidedAtlasApplied=false;

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
  function guidedStep(id, state, detail) {
    const node=$(id);
    if(!node)return;
    node.classList.remove("ready","active");
    if(state)node.classList.add(state);
    const small=node.querySelector("small");
    if(small)small.textContent=detail;
  }
  function syncGuidedProgress() {
    const sourceId=$("guided-source")?.value || $("source-choice")?.value || "";
    const atlasId=$("guided-atlas-template")?.value || "";
    const source=connectedSources.find(x=>x.id===sourceId);
    const atlas=strategyAtlas.find(x=>x.atlas_id===atlasId);
    guidedStep("guided-step-source", sourceId ? "ready" : "active", source ? source.pair+" · "+source.exchange : (sourceId===BINANCE ? "BTC/USDT · Binance" : "À choisir"));
    guidedStep("guided-step-atlas", atlasId ? "ready" : (sourceId ? "active" : ""), atlas ? atlas.title : "À choisir");
    guidedStep("guided-step-composer", guidedAtlasApplied ? "ready" : (atlasId ? "active" : ""), guidedAtlasApplied ? "Réglages prêts" : (atlasId ? "Prêt à préparer" : "En attente"));
    guidedStep("guided-step-spec", selectedStrategySpec ? "ready" : "", selectedStrategySpec ? selectedStrategySpec.name : "Facultative");
  }
  function setBusy(working, label="Calcul en cours…") {
    busy = working;
    for (const id of ["import","binance-monthly-import","okx-import","run","compare","robustness-run","filters-run","save-profile","save-strategy-spec","replay-strategy-spec","guided-atlas-apply"]) {
      const b = $(id);
      if (!b.dataset.defaultText) b.dataset.defaultText = b.textContent;
      b.disabled = working || ((id === "run" || id === "compare" || id === "filters-run") && !available)
        || (id === "filters-run" && !["EMA_CROSS","CUSTOM_RULES"].includes($("kind").value))
        || (id === "replay-strategy-spec" && !selectedStrategySpec)
        || (id === "guided-atlas-apply" && !$("guided-atlas-template").value);
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
      donchian_entry:number(val("donchian_entry")), donchian_exit:number(val("donchian_exit")),
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
      donchian_entry:p.donchian_entry, donchian_exit:p.donchian_exit,
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
  function renderSourceSummary(source,id){
    const legacy=id===BINANCE;
    const monthly=source.source_kind==="BINANCE_MONTHLY_CERTIFIED";
    const generic=source.source_kind==="CATALOG_REGISTERED_V1";
    $("summary-asset-icon").textContent=assetIcon(source.base);
    $("summary-market").textContent=assetName(source.base)+" · "+source.pair;
    $("summary-exchange").textContent=source.exchange+" · "+
      (legacy?"archive V1/V2":monthly?"mois public certifié":generic?"source certifiée du catalogue":"archive publique clôturée");
    if(legacy){
      $("summary-window").textContent="Janvier 2026 · mois complet";
      $("summary-window-range").textContent="2026-01-01 → 2026-02-01 UTC · borne de fin exclue";
      $("summary-coverage").textContent="44 640 bougies";
      $("summary-resolution").textContent="Résolution native : 1 minute";
      $("summary-integrity").textContent=binanceAvailable?"SHA-256 vérifié":"Archive non chargée";
      $("summary-provenance").textContent=binanceAvailable
        ?"Archive GitHub du Coffre public · V1/V2 conservée"
        :"Import explicite requis · aucune donnée inventée";
      $("dataset-badge").textContent=binanceAvailable?"V1/V2 · SHA-256 ✓":"V1/V2 · NON CHARGÉE";
      $("dataset-badge").className="mini-badge"+(binanceAvailable?"":" gold-badge");
      return;
    }
    if(generic){
      const c=source.coverage||{};
      $("summary-window").textContent=print(c.rows||source.rows,0)+" bougies · "+source.source_timeframe;
      $("summary-window-range").textContent=sourceTime(c.first_utc)+" → "+sourceTime(c.close_boundary_utc||c.last_utc)+" UTC";
      $("summary-coverage").textContent=print(c.rows||source.rows,0)+" bougies continues";
      $("summary-resolution").textContent="Résolution native : "+source.source_timeframe;
      $("summary-integrity").textContent=source.integrity.status;
      $("summary-provenance").textContent=source.exchange+" · Source Catalog v1 · SHA-256 "+source.sha256.slice(0,18)+"…";
      $("dataset-badge").textContent="CATALOGUE · SHA-256 ✓"; $("dataset-badge").className="mini-badge"; return;
    }
    if(monthly){
      $("summary-window").textContent="Janvier 2020 · mois complet";
      $("summary-window-range").textContent="2020-01-01 → 2020-02-01 UTC · borne de fin exclue";
      $("summary-coverage").textContent=print(source.rows,0)+" bougies clôturées";
      $("summary-resolution").textContent="Résolution native : 1 heure";
      $("summary-integrity").textContent="CHECKSUM officiel concordant";
      $("summary-provenance").textContent="Binance Public Data · ZIP "+
        source.source_archive_sha256.slice(0,12)+"… · CSV "+source.sha256.slice(0,12)+"…";
      $("dataset-badge").textContent="BINANCE · CHECKSUM ✓";
      $("dataset-badge").className="mini-badge";
      return;
    }
    const days=source.days||Math.round(source.rows/24);
    $("summary-window").textContent=days+" jours · "+(source.bar||"1h");
    $("summary-window-range").textContent=sourceTime(source.first_timestamp)+" → "+
      sourceTime(source.close_boundary_utc)+" UTC · borne de fin exclue";
    $("summary-coverage").textContent=print(source.rows,0)+" bougies clôturées";
    $("summary-resolution").textContent="Résolution native : 1 heure";
    $("summary-integrity").textContent="SHA-256 vérifié";
    $("summary-provenance").textContent="Archive OKX publique · "+source.sha256.slice(0,18)+"…";
    $("dataset-badge").textContent="OKX · SHA-256 ✓";
    $("dataset-badge").className="mini-badge";
  }
  function updateSource(){
    const id=$("source-choice").value;
    if(id!==selectedSourceId) {
      selectedSourceId=id;
      lastRenderedReport=null;
      resetScientific();
      window.AetherFilterStudio.reset();
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
      available_timeframes:["1m","5m","15m","1h","4h"],source_kind:"LEGACY_BINANCE_V1_V2"
    }:connectedSources.find(x=>x.id===id);
    available=!!source&&(id!==BINANCE||binanceAvailable);
    if(!source){if(!busy)setBusy(false);return;}
    currency=source.quote;
    renderSourceSummary(source,id);
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
    const monthly=source.source_kind==="BINANCE_MONTHLY_CERTIFIED";
    const generic=source.source_kind==="CATALOG_REGISTERED_V1";
    $("source-active-detail").textContent=id===BINANCE
      ?"Janvier 2026 · archive V1/V2 intégralement préservée"
      :monthly
        ?source.rows+" bougies 1h · janvier 2020 complet · CHECKSUM officiel concordant"
        :generic
          ?source.rows+" bougies "+source.source_timeframe+" · "+source.integrity.status
          :source.rows+" bougies 1h closes · fin "+source.close_boundary_utc.slice(0,16).replace("T"," ")+" UTC";
    $("source-active-hash").textContent=id===BINANCE
      ?"Empreinte de référence du coffre V2"
      :monthly
        ?"ZIP SHA-256 "+source.source_archive_sha256.slice(0,18)+"… · CSV "+source.sha256.slice(0,18)+"…"
        :generic
          ?"Source Catalog v1 · SHA-256 "+source.sha256.slice(0,24)+"…"
          :"SHA-256 "+source.sha256.slice(0,24)+"…";
    $("available-timeframe-label").textContent=id===BINANCE
      ?"sur l'archive Binance vérifiée 1m"
      :monthly
        ?"source Binance mensuelle native 1h : horizons 1h et 4h seulement"
        :generic
          ?"source cataloguée native "+source.source_timeframe+" : "+source.available_timeframes.join(", ")
          :"source OKX native 1h : horizons 1h et 4h seulement";
    $("capital-unit").textContent=source.quote;
    $("dca-unit").textContent=source.quote;
    $("nav-source").textContent=source.pair+" · "+source.exchange+" · "+
      (id===BINANCE?"Jan 2026":monthly?"Jan 2020 certifié":source.rows+" bougies closes");
    $("active-source-badge").textContent=id===BINANCE?"ARCHIVE V1/V2":
      monthly?"BINANCE CERTIFIÉ ACTIF":generic?"SOURCE CATALOGUE ACTIVE":"ARCHIVE OKX ACTIVE";
    syncGuidedProgress();
    if(!busy)setBusy(false);
  }
  function populateSelect(id, values, firstLabel="Tous") {
    const node=$(id); node.replaceChildren(new Option(firstLabel,""));
    for(const value of values||[]) node.add(new Option(value,value));
  }
  function filteredCatalogSources(){
    const asset=$("guided-asset").value, exchange=$("guided-exchange").value, tf=$("guided-timeframe").value;
    return connectedSources.filter(source => {
      if(asset && source.base!==asset)return false;
      if(exchange && source.exchange!==exchange)return false;
      if(tf && !source.available_timeframes.includes(tf))return false;
      return true;
    });
  }
  function marketSourceDescription(source){
    const c=source.coverage||{};
    const rows=c.rows||source.rows||"?";
    return `${source.pair} · ${source.exchange} · ${coverageLabel(source)} · ${rows} bougies · ${source.source_timeframe}`;
  }
  function renderMarketLibrary(){
    const list=$("market-library-list");
    if(!list)return;
    list.replaceChildren();
    const filtered=filteredCatalogSources();
    const active=$("source-choice")?.value || selectedSourceId;
    $("market-library-count").textContent=`${filtered.length} historique${filtered.length>1?"s":""} affiché${filtered.length>1?"s":""} / ${connectedSources.length}`;
    const dates=connectedSources.flatMap(source=>{
      const c=source.coverage||{}; return [c.first_utc||source.first_utc,c.last_utc||source.last_utc].filter(Boolean).map(x=>new Date(x));
    }).filter(d=>!Number.isNaN(d.getTime())).sort((a,b)=>a-b);
    $("market-library-range").textContent=dates.length
      ?`Couverture recensée : ${dates[0].toLocaleDateString("fr-FR",{month:"short",year:"numeric"})} → ${dates.at(-1).toLocaleDateString("fr-FR",{month:"short",year:"numeric"})} · périodes non nécessairement continues`
      :"Couverture historique non renseignée";
    if(!filtered.length){
      const empty=el("div","Aucun historique ne correspond à ces filtres.","market-library-empty"); list.append(empty); return;
    }
    for(const source of filtered){
      const row=el("article",undefined,"market-source-row"+(source.id===active?" active":""));
      row.setAttribute("role","listitem");
      const identity=el("div",undefined,"market-source-identity");
      const title=el("strong",`${source.pair} · ${source.exchange}`);
      const period=el("span",coverageLabel(source));
      identity.append(title,period);
      const metrics=el("div",undefined,"market-source-metrics");
      const c=source.coverage||{};
      metrics.append(
        el("span",`${c.rows||source.rows||"?"} bougies`),
        el("span",`natif ${source.source_timeframe}`),
        el("span",`disponible ${source.available_timeframes.join(" / ")}`)
      );
      const integrity=el("div",undefined,"market-source-integrity");
      integrity.append(el("span","✓ "+certificationLabel(source.integrity?.status),"integrity-ok"));
      const button=el("button",source.id===active?"Source active":"Utiliser","market-use-button");
      button.type="button"; button.dataset.sourceId=source.id; button.disabled=source.id===active;
      button.addEventListener("click",()=>selectMarketSource(source.id));
      row.append(identity,metrics,integrity,button); list.append(row);
    }
  }
  function updateSelectedSourceHelp(source){
    if(!source){
      $("guided-source-proof").textContent="Choisis un historique pour afficher sa période et sa provenance.";
      $("guided-source-tech").textContent="Aucune source sélectionnée."; return;
    }
    const c=source.coverage||{};
    $("guided-source-proof").textContent=`Source active : ${marketSourceDescription(source)} · ${certificationLabel(source.integrity?.status)}.`;
    $("guided-source-tech").textContent=`ID : ${source.id} · Type : ${source.source_kind} · SHA-256 : ${source.sha256} · Marché : ${source.market_type||"SPOT"} · Chemins absolus privés non exposés.`;
  }
  function selectMarketSource(sourceId){
    const source=connectedSources.find(x=>x.id===sourceId);
    if(!source)return;
    const guided=$("guided-source"), main=$("source-choice");
    if([...guided.options].some(x=>x.value===sourceId))guided.value=sourceId;
    if([...main.options].some(x=>x.value===sourceId))main.value=sourceId;
    selectedSourceId=sourceId;
    updateSource(); updateSelectedSourceHelp(source); renderMarketLibrary();
    notice(`Historique actif : ${source.pair} · ${source.exchange} · ${coverageLabel(source)}.`,"success");
  }
  function renderGuidedSourceOptions(){
    const select=$("guided-source");
    select.replaceChildren(new Option("Choisir une source…",""));
    for(const source of filteredCatalogSources()) select.add(new Option(marketSourceDescription(source),source.id));
    const active=$("source-choice")?.value || selectedSourceId;
    if(active && [...select.options].some(x=>x.value===active)) select.value=active;
    updateSelectedSourceHelp(connectedSources.find(x=>x.id===active)||null);
    renderMarketLibrary();
    syncGuidedProgress();
  }
  async function refreshSources(prefer){
    const d=await api("/api/sources");
    sourceCatalog=d; connectedSources=d.sources||[];
    $("catalog-schema-badge").textContent=connectedSources.length+" historiques disponibles";
    $("usb-storage").textContent="Libre : "+print(d.free_bytes/1e9,2)+" Go · réserve : "+print(d.reserve_bytes/1e9,1)+" Go";
    $("usb-storage").classList.toggle("storage-low",d.free_bytes<d.reserve_bytes);
    populateSelect("guided-asset",d.facets?.assets||[],"Toutes"); populateSelect("guided-exchange",d.facets?.exchanges||[],"Toutes"); populateSelect("guided-timeframe",d.facets?.timeframes||[],"Toutes");
    const select=$("source-choice"), chosen=prefer||select.value||BINANCE;
    select.replaceChildren(new Option("Binance BTC/USDT · Janvier 2026 · archive V1/V2",BINANCE));
    for(const source of connectedSources) {
      if(source.id===BINANCE)continue;
      const c=source.coverage||{};
      const label=marketSourceDescription(source);
      select.add(new Option(label,source.id));
    }
    select.value=[...select.options].some(x=>x.value===chosen)?chosen:BINANCE;
    renderGuidedSourceOptions(); updateSource();
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
    const cmpLabel=kind === "CUSTOM_RULES" ? "≋ Comparer ma stratégie aux 7 références" : "≋ Comparer les 7 méthodes sur cet horizon";
    cmpButton.dataset.defaultText=cmpLabel;
    if(!busy)cmpButton.textContent=cmpLabel;
    $("bb-fields").hidden = kind !== "BOLLINGER";
    $("donchian-fields").hidden = kind !== "DONCHIAN";
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
    $("readout-name").textContent=strategyLabel(record.run.params.kind,record.source);
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
    $("run-id").textContent=strategyLabel(report.params.kind,source)+" · "+timeframe;
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
    $("dataset-state").textContent=ok
      ?"Coffre V1/V2 Binance : 44 640 bougies conservées · SHA-256 vérifié · aucun téléchargement."
      :"Coffre V1/V2 Binance : téléchargement GitHub sur demande · pas d'accès à un compte.";
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
  function renderStrategySpec(payload){
    const spec=payload.strategy_spec, e=payload.explanation; selectedStrategySpec=spec;
    $("strategy-spec-explanation").hidden=false; $("strategy-spec-title").textContent=e.title+" · "+e.kind+" · "+e.timeframe;
    $("strategy-spec-intent").textContent="Objectif : "+e.intent; $("strategy-spec-execution").textContent=e.execution;
    $("strategy-spec-weakness").textContent="Limite : "+e.weakness; $("strategy-spec-fingerprint").textContent="SHA-256 "+spec.fingerprint_sha256;
    $("replay-strategy-spec").disabled=busy;
    syncGuidedProgress();
  }
  async function refreshStrategySpecs(preferId=null){
    const d=await api("/api/strategy-specs"); strategySpecs=d.strategy_specs||[]; const select=$("saved-strategy-specs");
    const current=preferId||select.value; select.replaceChildren(new Option("Choisir un StrategySpec…",""));
    for(const spec of strategySpecs) select.add(new Option(spec.name+" · "+(kinds[spec.kind]||spec.kind)+" · "+spec.timeframe,spec.id));
    if(current && strategySpecs.some(x=>x.id===current)){ select.value=current; const payload=await api("/api/strategy-specs/"+current); renderStrategySpec(payload); if(payload.params)chooseParams(payload.params); $("strategy-spec-name").value=payload.strategy_spec.name; }
  }
  function defaultsLabel(entry){
    if(!entry)return "—";
    const d=entry.defaults||{};
    if(entry.kind==="EMA_CROSS")return `EMA rapide ${d.ema_fast} / EMA lente ${d.ema_slow} bougies`;
    if(entry.kind==="DONCHIAN")return `Entrée ${d.donchian_entry} / sortie ${d.donchian_exit} bougies`;
    if(entry.kind==="BOLLINGER")return `${d.bb_period} bougies · écart ${d.bb_sigma}`;
    if(entry.kind==="DCA")return `Achat périodique · montant ${d.dca_quote}`;
    if(entry.kind==="CUSTOM_RULES")return "Réglages personnalisables dans l’Atelier";
    return "Aucun réglage de signal";
  }
  function renderAtlasEntry(entry){
    $("guided-atlas-explanation").hidden=!entry; $("guided-atlas-apply").disabled=!entry;
    if(!entry){guidedAtlasApplied=false;$("guided-atlas-knowledge").hidden=true;syncGuidedProgress();return;}
    $("guided-atlas-title").textContent=entry.title;
    $("guided-atlas-family").textContent=familyLabel(entry);
    $("guided-atlas-definition").textContent=entry.definition||entry.intent||"—";
    $("guided-atlas-how").textContent=entry.how_it_works||entry.intent||"—";
    $("guided-atlas-regime").textContent=entry.regime||"—";
    $("guided-atlas-weakness").textContent=entry.weakness||"—";
    $("guided-atlas-params").textContent=(entry.parameter_note?entry.parameter_note+" ":"")+defaultsLabel(entry);
    const knowledgeKinds=["EMA_CROSS","BOLLINGER","DONCHIAN","DCA","HOLD_50","HOLD_100","CASH"];
    $("guided-atlas-knowledge").hidden=!knowledgeKinds.includes(entry.kind);
    const knowledgeLabels={EMA_CROSS:"EMA",BOLLINGER:"Bollinger",DONCHIAN:"Donchian",DCA:"DCA",HOLD_50:"Buy & Hold 50 %",HOLD_100:"Buy & Hold 100 %",CASH:"Conservation du cash"};
    $("guided-atlas-knowledge").textContent="Ouvrir la fiche professionnelle "+(knowledgeLabels[entry.kind]||entry.title);
    syncGuidedProgress();
  }
  async function refreshStrategyAtlas(){
    const d=await api("/api/strategy-atlas"); strategyAtlas=d.entries||[]; const select=$("guided-atlas-template");
    select.replaceChildren(new Option("Choisir une méthode…",""));
    for(const entry of strategyAtlas) select.add(new Option(entry.title+" · "+familyLabel(entry),entry.atlas_id));
    syncGuidedProgress();
  }

  function durationLabel(minutes){
    const total=Math.round(minutes);
    if(total<60)return total+" min";
    const h=Math.floor(total/60), m=total%60;
    if(h<24)return h+" h"+(m?" "+m+" min":"");
    const d=Math.floor(h/24), rh=h%24;
    return d+" j"+(rh?" "+rh+" h":"");
  }
  function timeframeMinutes(tf){ return ({"1m":1,"5m":5,"15m":15,"1h":60,"4h":240})[tf]||60; }
  function fillList(id,items){
    const root=$(id); root.replaceChildren();
    for(const item of (items||[])){ const li=document.createElement("li"); li.textContent=item; root.append(li); }
  }
  function updateEmaKnowledgeNumbers(){
    if(!$("ema-knowledge-panel"))return;
    let fast=10,slow=30,tf="1h";
    try{ fast=number(form.elements.ema_fast.value); slow=number(form.elements.ema_slow.value); tf=form.querySelector('input[name="timeframe"]:checked')?.value||"1h"; }catch(_){ }
    const aFast=100*(2/(fast+1)),aSlow=100*(2/(slow+1));
    $("ema-current-weights").textContent=`EMA ${fast} : poids du prix récent ${print(aFast,2)} % · EMA ${slow} : ${print(aSlow,2)} %`;
    $("ema-fast-header").textContent="EMA "+fast; $("ema-slow-header").textContent="EMA "+slow;
    for(const [id,min] of [["1m",1],["15m",15],["1h",60],["4h",240]]){
      $("ema-tf-"+id+"-fast").textContent=durationLabel(fast*min);
      $("ema-tf-"+id+"-slow").textContent=durationLabel(slow*min);
    }
    $("ema-active-timeframe").textContent=`${tf} : EMA ${fast} couvre environ ${durationLabel(fast*timeframeMinutes(tf))} ; EMA ${slow} environ ${durationLabel(slow*timeframeMinutes(tf))}.`;
  }
  function renderEmaKnowledge(article){
    emaKnowledge=article;
    $("ema-knowledge-subtitle").textContent=article.subtitle;
    $("ema-knowledge-summary").textContent=article.summary;
    $("ema-knowledge-measure").textContent=article.what_it_measures;
    $("ema-knowledge-sma").textContent=article.sma_difference;
    $("ema-formula-alpha").textContent=article.formula.alpha;
    $("ema-formula-main").textContent=article.formula.ema;
    $("ema-formula-note").textContent=article.formula.note;
    fillList("ema-reading-list",article.reading);
    $("ema-bullish-text").textContent=article.crossover.bullish;
    $("ema-bearish-text").textContent=article.crossover.bearish;
    $("ema-crossover-warning").textContent=article.crossover.warning;
    fillList("ema-strengths-list",article.strengths); fillList("ema-limits-list",article.limits);
    $("ema-seven-entry").textContent=article.seven_engine.entry;
    $("ema-seven-exit").textContent=article.seven_engine.exit;
    $("ema-seven-execution").textContent=article.seven_engine.execution;
    $("ema-seven-position").textContent=article.seven_engine.positioning+" "+article.seven_engine.warmup;
    const checklist=$("ema-analysis-checklist"); checklist.replaceChildren();
    for(const item of article.analysis_checklist||[]){const div=document.createElement("div");div.textContent=item;checklist.append(div);}
    const refs=$("ema-reference-list"); refs.replaceChildren();
    for(const ref of article.references||[]){const row=document.createElement("div");row.className="reference-item";const strong=document.createElement("strong");strong.textContent=ref.label;const span=document.createElement("span");span.textContent=ref.scope;row.append(strong,span);refs.append(row);}
    updateEmaKnowledgeNumbers();
  }
  async function openEmaKnowledge(){
    try{
      if(!emaKnowledge){const d=await api("/api/strategy-knowledge/ema");renderEmaKnowledge(d.article);}
      const panel=$("ema-knowledge-panel");hideOtherKnowledgePanels("ema-knowledge-panel");panel.hidden=false;panel.scrollIntoView({behavior:"smooth",block:"start"});
      notice("Fiche EMA professionnelle ouverte · définition, calcul, lecture, limites et règles exactes Seven.","success");
    }catch(e){notice(e.message,"error");}
  }
  function closeEmaKnowledge(){ $("ema-knowledge-panel").hidden=true; }
  function updateBollingerKnowledgeNumbers(){
    if(!$("bollinger-knowledge-panel"))return;
    let period=20,sigma=2,tf="1h";
    try{period=number(form.elements.bb_period.value);sigma=number(form.elements.bb_sigma.value);tf=form.querySelector('input[name="timeframe"]:checked')?.value||"1h";}catch(_){ }
    $("bollinger-current-settings").textContent=`${period} bougies · ${print(sigma,2)} écart${sigma===1?"":"s"}-type${sigma===1?"":"s"}`;
    $("bollinger-active-timeframe").textContent=`${tf} : ${period} bougies couvrent environ ${durationLabel(period*timeframeMinutes(tf))}. Les bandes sont placées à ± ${print(sigma,2)} σ autour de la moyenne.`;
  }
  function renderBollingerKnowledge(article){
    bollingerKnowledge=article;
    $("bollinger-knowledge-subtitle").textContent=article.subtitle;
    $("bollinger-knowledge-summary").textContent=article.summary;
    $("bollinger-knowledge-measure").textContent=article.what_it_measures;
    $("bollinger-formula-middle").textContent=article.formula.middle;
    $("bollinger-formula-upper").textContent=article.formula.upper;
    $("bollinger-formula-lower").textContent=article.formula.lower;
    $("bollinger-formula-note").textContent=article.formula.note;
    fillList("bollinger-reading-list",article.reading);
    $("bollinger-squeeze-text").textContent=article.patterns.squeeze;
    $("bollinger-walk-text").textContent=article.patterns.walk;
    $("bollinger-pattern-warning").textContent=article.patterns.warning;
    fillList("bollinger-strengths-list",article.strengths);fillList("bollinger-limits-list",article.limits);
    $("bollinger-seven-entry").textContent=article.seven_engine.entry;
    $("bollinger-seven-exit").textContent=article.seven_engine.exit;
    $("bollinger-seven-execution").textContent=article.seven_engine.execution;
    $("bollinger-seven-position").textContent=article.seven_engine.positioning+" "+article.seven_engine.warmup;
    const checklist=$("bollinger-analysis-checklist");checklist.replaceChildren();
    for(const item of article.analysis_checklist||[]){const div=document.createElement("div");div.textContent=item;checklist.append(div);}
    const refs=$("bollinger-reference-list");refs.replaceChildren();
    for(const ref of article.references||[]){const row=document.createElement("div");row.className="reference-item";const strong=document.createElement("strong");strong.textContent=ref.label;const span=document.createElement("span");span.textContent=ref.scope;row.append(strong,span);refs.append(row);}
    updateBollingerKnowledgeNumbers();
  }
  async function openBollingerKnowledge(){
    try{
      if(!bollingerKnowledge){const d=await api("/api/strategy-knowledge/bollinger");renderBollingerKnowledge(d.article);}
      const panel=$("bollinger-knowledge-panel");hideOtherKnowledgePanels("bollinger-knowledge-panel");panel.hidden=false;panel.scrollIntoView({behavior:"smooth",block:"start"});
      notice("Fiche Bollinger professionnelle ouverte · volatilité, calcul, pièges et règles exactes Seven.","success");
    }catch(e){notice(e.message,"error");}
  }
  function closeBollingerKnowledge(){ $("bollinger-knowledge-panel").hidden=true; }
  function updateDonchianKnowledgeNumbers(){
    if(!$("donchian-knowledge-panel"))return;
    let entry=55,exit=20,tf="1h";
    try{entry=number(form.elements.donchian_entry.value);exit=number(form.elements.donchian_exit.value);tf=form.querySelector('input[name="timeframe"]:checked')?.value||"1h";}catch(_){ }
    $("donchian-current-settings").textContent=`Entrée ${entry} · sortie ${exit} bougies`;
    $("donchian-entry-header").textContent="Entrée "+entry; $("donchian-exit-header").textContent="Sortie "+exit;
    for(const [id,min] of [["1m",1],["15m",15],["1h",60],["4h",240]]){
      $("donchian-tf-"+id+"-entry").textContent=durationLabel(entry*min);
      $("donchian-tf-"+id+"-exit").textContent=durationLabel(exit*min);
    }
    $("donchian-active-timeframe").textContent=`${tf} : l'entrée regarde environ ${durationLabel(entry*timeframeMinutes(tf))} d'historique ; la sortie environ ${durationLabel(exit*timeframeMinutes(tf))}.`;
  }
  function renderDonchianKnowledge(article){
    donchianKnowledge=article;
    $("donchian-knowledge-subtitle").textContent=article.subtitle;
    $("donchian-knowledge-summary").textContent=article.summary;
    $("donchian-knowledge-measure").textContent=article.what_it_measures;
    $("donchian-formula-upper").textContent=article.formula.upper;
    $("donchian-formula-lower").textContent=article.formula.lower;
    $("donchian-formula-middle").textContent=article.formula.middle;
    $("donchian-formula-note").textContent=article.formula.note;
    fillList("donchian-reading-list",article.reading);
    $("donchian-breakout-confirmed").textContent=article.breakouts.confirmed;
    $("donchian-breakout-false").textContent=article.breakouts.false;
    $("donchian-breakout-warning").textContent=article.breakouts.warning;
    $("donchian-parameter-asymmetry").textContent=article.parameters.entry+" "+article.parameters.exit+" "+article.parameters.asymmetry;
    fillList("donchian-strengths-list",article.strengths);fillList("donchian-limits-list",article.limits);
    $("donchian-seven-entry").textContent=article.seven_engine.entry;
    $("donchian-seven-exit").textContent=article.seven_engine.exit;
    $("donchian-seven-execution").textContent=article.seven_engine.execution;
    $("donchian-seven-position").textContent=article.seven_engine.positioning+" "+article.seven_engine.warmup;
    $("donchian-evidence-warning").textContent=article.local_evidence.warning;
    const evidence=$("donchian-evidence-grid");evidence.replaceChildren();
    for(const item of article.local_evidence.items||[]){
      const card=document.createElement("div");card.className="evidence-item";
      const label=document.createElement("small");label.textContent=item.label;
      const value=document.createElement("strong");value.textContent=item.value;
      const detail=document.createElement("span");detail.textContent=item.detail;
      card.append(label,value,detail);evidence.append(card);
    }
    $("donchian-evidence-conclusion").textContent=article.local_evidence.conclusion;
    const checklist=$("donchian-analysis-checklist");checklist.replaceChildren();
    for(const item of article.analysis_checklist||[]){const div=document.createElement("div");div.textContent=item;checklist.append(div);}
    const refs=$("donchian-reference-list");refs.replaceChildren();
    for(const ref of article.references||[]){const row=document.createElement("div");row.className="reference-item";const strong=document.createElement("strong");strong.textContent=ref.label;const span=document.createElement("span");span.textContent=ref.scope;row.append(strong,span);refs.append(row);}
    updateDonchianKnowledgeNumbers();
  }
  async function openDonchianKnowledge(){
    try{
      if(!donchianKnowledge){const d=await api("/api/strategy-knowledge/donchian");renderDonchianKnowledge(d.article);}
      const panel=$("donchian-knowledge-panel");hideOtherKnowledgePanels("donchian-knowledge-panel");panel.hidden=false;panel.scrollIntoView({behavior:"smooth",block:"start"});
      notice("Fiche Donchian professionnelle ouverte · canal, cassure, 55/20, faux breakouts et règles exactes Seven.","success");
    }catch(e){notice(e.message,"error");}
  }
  function closeDonchianKnowledge(){ $("donchian-knowledge-panel").hidden=true; }
  function passiveArticleId(kind){ return ({DCA:"dca",HOLD_50:"hold_50",HOLD_100:"hold_100",CASH:"cash"})[kind] || null; }
  function hideOtherKnowledgePanels(exceptId){
    for(const id of ["ema-knowledge-panel","bollinger-knowledge-panel","donchian-knowledge-panel","passive-knowledge-panel"]){
      if(id!==exceptId && $(id))$(id).hidden=true;
    }
  }
  function passiveVisual(article){
    const invested=$("passive-track-invested"), cash=$("passive-track-cash");
    const steps=$("passive-visual-steps"); steps.replaceChildren();
    let investedPct=50, cashPct=50, label="Référence Seven", investedLabel="Exposition", cashLabel="Cash";
    if(article.id==="hold_100"){investedPct=100;cashPct=0;label="Exposition initiale complète";investedLabel="≈ 100 % actif";cashLabel="Reliquat";}
    else if(article.id==="hold_50"){label="Allocation initiale 50 / 50";investedLabel="≈ 50 % actif";cashLabel="≈ 50 % cash";}
    else if(article.id==="cash"){investedPct=0;cashPct=100;label="Baseline sans exposition";investedLabel="0 % actif";cashLabel="100 % cash";}
    else {investedPct=35;cashPct=65;label="Accumulation progressive";investedLabel="Achats successifs";cashLabel="Cash restant";}
    invested.style.width=investedPct+"%"; cash.style.width=cashPct+"%";
    $("passive-visual-label").textContent=label; $("passive-invested-label").textContent=investedLabel; $("passive-cash-label").textContent=cashLabel;
    for(const text of (article.mechanics||[]).slice(0,3)){const div=document.createElement("div");div.textContent=text;steps.append(div);}
  }
  function renderPassiveKnowledge(article){
    passiveKnowledgeCurrentId=article.id;
    $("passive-knowledge-title").textContent=article.title;
    $("passive-knowledge-subtitle").textContent=article.subtitle;
    $("passive-family-badge").textContent="Famille · "+article.family;
    $("passive-technical-badge").textContent=article.technical_name;
    $("passive-knowledge-summary").textContent=article.summary;
    $("passive-knowledge-role").textContent=article.role;
    fillList("passive-mechanics-list",article.mechanics); fillList("passive-reading-list",article.reading);
    fillList("passive-strengths-list",article.strengths); fillList("passive-limits-list",article.limits);
    const params=$("passive-parameters");params.replaceChildren();
    for(const [key,value] of Object.entries(article.parameters||{})){const row=document.createElement("div");const strong=document.createElement("strong");strong.textContent=({interval:"Intervalle",amount:"Montant",timeframe:"Timeframe",allocation:"Allocation",signals:"Signaux"})[key]||key.replaceAll("_"," ");const span=document.createElement("span");span.textContent=value;row.append(strong,span);params.append(row);}
    $("passive-seven-entry").textContent=article.seven_engine.entry; $("passive-seven-exit").textContent=article.seven_engine.exit;
    $("passive-seven-execution").textContent=article.seven_engine.execution; $("passive-seven-position").textContent=article.seven_engine.positioning;
    $("passive-seven-valuation").textContent=article.seven_engine.valuation;
    const checklist=$("passive-analysis-checklist");checklist.replaceChildren();
    for(const item of article.analysis_checklist||[]){const div=document.createElement("div");div.textContent=item;checklist.append(div);}
    const refs=$("passive-reference-list");refs.replaceChildren();
    for(const ref of article.references||[]){const row=document.createElement("div");row.className="reference-item";const strong=document.createElement("strong");strong.textContent=ref.label;const span=document.createElement("span");span.textContent=ref.scope;row.append(strong,span);refs.append(row);}
    passiveVisual(article);
  }
  async function openPassiveKnowledge(articleId){
    try{
      if(!passiveKnowledgeCache[articleId]){const d=await api("/api/strategy-knowledge/"+articleId);passiveKnowledgeCache[articleId]=d.article;}
      renderPassiveKnowledge(passiveKnowledgeCache[articleId]);hideOtherKnowledgePanels("passive-knowledge-panel");
      const panel=$("passive-knowledge-panel");panel.hidden=false;panel.scrollIntoView({behavior:"smooth",block:"start"});
      notice("Fiche professionnelle ouverte · "+passiveKnowledgeCache[articleId].title+".","success");
    }catch(e){notice(e.message,"error");}
  }
  function closePassiveKnowledge(){ $("passive-knowledge-panel").hidden=true; }
  function openSelectedKnowledge(){
    const entry=strategyAtlas.find(x=>x.atlas_id===$("guided-atlas-template").value);
    if(entry?.kind==="EMA_CROSS")return openEmaKnowledge();
    if(entry?.kind==="BOLLINGER")return openBollingerKnowledge();
    if(entry?.kind==="DONCHIAN")return openDonchianKnowledge();
    const passiveId=passiveArticleId(entry?.kind); if(passiveId)return openPassiveKnowledge(passiveId);
  }

  async function refreshHistory() {
    const list=await api("/api/results");
    const root=$("history");root.replaceChildren();
    if(!list.runs.length){root.append(el("span","Aucune simulation enregistrée.","muted"));return;}
    for(const run of list.runs.slice(0,12)){
      const button=el("button",undefined,"history-item");
      button.type="button";
      button.append(el("span",strategyLabel(run.kind,run.source)+" · "+
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
      button.append(el("span",((cmp.rows?.length)||7)+" stratégies · "+cmp.timeframe+" · "+whenLocal(cmp.created_utc)));
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
      foot.textContent="Préchauffage indicateurs : "+fold.warmup.used_bars+" bougies antérieures, 0 fill autorisé, portefeuille neuf · Références : Buy & Hold 50 % "+
        signed(fold.holdout.benchmark_hold_50.return_pct)+
        " % · Conservation "+quote+" "+
        signed(fold.holdout.benchmark_cash.return_pct)+" %";
      card.append(heading,grid,foot);
      target.append(card);
    }
    $("scientific-method").textContent=(research.folds.length>1?
      "Deux fenêtres de validation chronologiques distinctes. Le second entraînement réutilise les dates passées du premier test, comme une recherche walk-forward expansive. ":
      "Une seule séparation entraînement/vérification : l'historique est trop court pour deux vérifications indépendantes de 60 bougies. ")+
      "V4.6 précharge les indicateurs avec le passé disponible, interdit tout fill pendant ce préchauffage, puis démarre chaque test avec du cash neuf et zéro position.";
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
    notice("Aether Research V4.6 : moteur OWNER préservé, préchauffage sans transaction, cinq filtres maximum et vérification chronologique…");
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
      const persisted=d.report?.workspace_persistence?.persisted!==false;
      if(persisted)await refreshHistory();
      notice((persisted?"Simulation PAPER enregistrée : ":"Simulation PAPER exploratoire · non enregistrée : ")+params.timeframe+
        " · "+strategyLabel(params.kind,connectedSources.find(x=>x.id===params.source_id))+". Aucun ordre envoyé.","success");
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
      const persisted=d.report?.workspace_persistence?.persisted!==false;
      if(persisted)await refreshComparisonHistory();
      notice(d.report.comparison.rows.length+" méthodes comparées · "+(persisted?"rapport enregistré localement":"lecture exploratoire non enregistrée")+". Résultats fictifs.","success");
      $("comparison").scrollIntoView({behavior:"smooth",block:"start"});
    }catch(e){notice(e.message,"error");}
    finally {setBusy(false);}
  }
  $("kind").addEventListener("change",showFields);
  form.addEventListener("change",markDraftChanged);
  form.addEventListener("input",markDraftChanged);
  window.addEventListener("seven-historical-source-installed", async event=>{
    const sourceId=event.detail?.source_id; if(!sourceId)return;
    try{await refreshSources(sourceId); selectMarketSource(sourceId);
      notice("Historique long installé/sélectionné : la source locale vérifiée est prête dans l’Atelier.","success");
    }catch(e){notice(e.message,"error");}
  });
  $("source-choice").addEventListener("change",updateSource);
  $("binance-monthly-import").addEventListener("click",async()=>{
    if(busy)return;
    setBusy(true,"Certification Binance…");
    notice("Binance public data : téléchargement du mois pilote, contrôle .CHECKSUM, continuité UTC et normalisation locale…");
    try {
      const result=await api("/api/binance-monthly-import",{});
      await refreshSources(result.source.id);
      notice("Binance BTC/USDT janvier 2020 certifié : 744 bougies 1h continues. Le ZIP brut n'est pas conservé ; aucun ordre réel.","success");
    }catch(e){notice(e.message,"error");}
    finally{setBusy(false);}
  });
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
  for(const id of ["guided-asset","guided-exchange","guided-timeframe"]) $(id).addEventListener("change",renderGuidedSourceOptions);
  $("guided-source").addEventListener("change",event=>{ if(!event.target.value){syncGuidedProgress();return;} selectMarketSource(event.target.value); });
  $("guided-atlas-template").addEventListener("change",event=>{guidedAtlasApplied=false;renderAtlasEntry(strategyAtlas.find(x=>x.atlas_id===event.target.value)||null);});
  $("guided-atlas-apply").addEventListener("click",()=>{
    const entry=strategyAtlas.find(x=>x.atlas_id===$("guided-atlas-template").value); if(!entry)return;
    const current=requestParams(); chooseParams({...current,kind:entry.kind,...entry.defaults});
    guidedAtlasApplied=true; syncGuidedProgress();
    $("laboratory").scrollIntoView({behavior:"smooth",block:"start"}); notice("Méthode préparée : "+entry.title+". Vérifie les réglages dans l’Atelier avant de lancer le test.","success");
  });
  $("saved-strategy-specs").addEventListener("change",async event=>{
    if(!event.target.value){selectedStrategySpec=null;$("strategy-spec-explanation").hidden=true;$("replay-strategy-spec").disabled=true;syncGuidedProgress();return;}
    try{const payload=await api("/api/strategy-specs/"+event.target.value);renderStrategySpec(payload);chooseParams(payload.params);$("strategy-spec-name").value=payload.strategy_spec.name;}catch(e){notice(e.message,"error");}
  });
  $("save-strategy-spec").addEventListener("click",async()=>{
    const name=$("strategy-spec-name").value.trim(); if(!name){notice("Donne un nom au StrategySpec.","error");return;}
    let params; try{params=requestParams();}catch(e){notice(e.message,"error");return;} setBusy(true,"Création StrategySpec…");
    try{const payload=await api("/api/strategy-specs",{name,params});renderStrategySpec(payload);await refreshStrategySpecs(payload.strategy_spec.id);notice("StrategySpec v1 créé dans le Coffre local · PAPER uniquement.","success");}catch(e){notice(e.message,"error");}finally{setBusy(false);}
  });
  $("replay-strategy-spec").addEventListener("click",async()=>{
    if(!selectedStrategySpec)return; setBusy(true,"Replay StrategySpec…");
    try{const payload=await api("/api/strategy-spec-run",{strategy_spec_id:selectedStrategySpec.id});renderRun(payload.report);const persisted=payload.report?.workspace_persistence?.persisted!==false;if(persisted)await refreshHistory();notice("StrategySpec rejoué par le moteur Seven · "+(persisted?"rapport enregistré":"lecture exploratoire non enregistrée")+" · zéro ordre réel.","success");}catch(e){notice(e.message,"error");}finally{setBusy(false);}
  });
  $("guide-learn").addEventListener("click",()=>{
    const entry=strategyAtlas.find(x=>x.atlas_id===$("guided-atlas-template").value);
    if(!entry){$("guided-atlas-template").focus();notice("Comprendre : choisis d’abord une méthode dans la Bibliothèque de stratégies.");return;}
    renderAtlasEntry(entry);
    if(entry.kind==="EMA_CROSS"){openEmaKnowledge();return;}
    if(entry.kind==="BOLLINGER"){openBollingerKnowledge();return;}
    if(entry.kind==="DONCHIAN"){openDonchianKnowledge();return;}
    const passiveId=passiveArticleId(entry.kind); if(passiveId){openPassiveKnowledge(passiveId);return;}
    $("guided-atlas-explanation").scrollIntoView({behavior:"smooth",block:"center"});
    notice("Fiche synthétique affichée. Les fiches professionnelles complètes couvrent désormais EMA, Bollinger, Donchian, DCA, Buy & Hold et Cash.","success");
  });
  $("guide-create").addEventListener("click",()=>{
    if(!$("guided-source").value){$("market-library-list").scrollIntoView({behavior:"smooth",block:"center"});notice("Préparer l’étude : choisis d’abord un historique dans la Bibliothèque de marchés.");return;}
    if(!$("guided-atlas-template").value){$("guided-atlas-template").focus();notice("Préparer l’étude : choisis ensuite une méthode dans la Bibliothèque de stratégies.");return;}
    if(!guidedAtlasApplied){$("guided-atlas-apply").click();return;}
    $("laboratory").scrollIntoView({behavior:"smooth",block:"start"});notice("Étude prête : les réglages de départ sont dans l’Atelier. Tu peux les ajuster puis lancer la simulation PAPER.","success");
  });
  $("guide-compare").addEventListener("click",()=>{
    if(!$("guided-source").value){$("market-library-list").scrollIntoView({behavior:"smooth",block:"center"});notice("Comparer : choisis d’abord l’historique à utiliser.");return;}
    $("laboratory").scrollIntoView({behavior:"smooth",block:"start"}); $("compare").focus();
    notice("Comparer : Seven conservera la même source, le même capital et les mêmes hypothèses de coût.","success");
  });
  $("guide-paper").addEventListener("click",()=>notice("Robot PAPER Seven : étape future séparée. Aucun automate temps réel n’est activé ici."));
  $("guide-expert").addEventListener("click",()=>{document.querySelector(".source-panel").scrollIntoView({behavior:"smooth",block:"start"});notice("Atelier complet : tous les contrôles scientifiques restent disponibles sous le navigateur de recherche.","success");});
  $("guided-atlas-knowledge").addEventListener("click",openSelectedKnowledge);
  $("ema-knowledge-close").addEventListener("click",closeEmaKnowledge);
  $("bollinger-knowledge-close").addEventListener("click",closeBollingerKnowledge);
  $("donchian-knowledge-close").addEventListener("click",closeDonchianKnowledge);
  $("passive-knowledge-close").addEventListener("click",closePassiveKnowledge);
  $("ema-action-prepare").addEventListener("click",()=>{
    const ema=strategyAtlas.find(x=>x.kind==="EMA_CROSS"); if(ema){$("guided-atlas-template").value=ema.atlas_id;renderAtlasEntry(ema);$("guided-atlas-apply").click();}
  });
  $("ema-action-compare").addEventListener("click",()=>{
    const ema=strategyAtlas.find(x=>x.kind==="EMA_CROSS"); if(ema){$("guided-atlas-template").value=ema.atlas_id;renderAtlasEntry(ema);if(!guidedAtlasApplied)$("guided-atlas-apply").click();}
    setTimeout(()=>{$("laboratory").scrollIntoView({behavior:"smooth",block:"start"});$("compare").focus();notice("EMA prête. Le bouton Comparer utilise la même source, le même capital et les mêmes coûts pour les 7 modèles.","success");},120);
  });
  $("ema-action-chart").addEventListener("click",()=>{
    if(lastRenderedReport && lastRenderedReport.run?.params?.kind==="EMA_CROSS" && !$("market-microscope").hidden){$("market-microscope").scrollIntoView({behavior:"smooth",block:"start"});notice("Microscope EMA : mêmes bougies, mêmes fills PAPER et mêmes paramètres que le rapport affiché.","success");return;}
    const ema=strategyAtlas.find(x=>x.kind==="EMA_CROSS"); if(ema){$("guided-atlas-template").value=ema.atlas_id;renderAtlasEntry(ema);if(!guidedAtlasApplied)$("guided-atlas-apply").click();}
    setTimeout(()=>{$("run").focus();notice("Pour voir EMA sur le graphique du Lab, lance d’abord ce test PAPER ; Seven ouvrira ensuite le Microscope des bougies.","success");},120);
  });
  $("ema-action-results").addEventListener("click",()=>{$("vault").scrollIntoView({behavior:"smooth",block:"start"});notice("Coffre local : ouvre une simulation EMA enregistrée pour relire son résultat sans recalcul.","success");});
  $("bollinger-action-prepare").addEventListener("click",()=>{
    const bb=strategyAtlas.find(x=>x.kind==="BOLLINGER");if(bb){$("guided-atlas-template").value=bb.atlas_id;renderAtlasEntry(bb);$("guided-atlas-apply").click();}
  });
  $("bollinger-action-compare").addEventListener("click",()=>{
    const bb=strategyAtlas.find(x=>x.kind==="BOLLINGER");if(bb){$("guided-atlas-template").value=bb.atlas_id;renderAtlasEntry(bb);if(!guidedAtlasApplied)$("guided-atlas-apply").click();}
    setTimeout(()=>{$("laboratory").scrollIntoView({behavior:"smooth",block:"start"});$("compare").focus();notice("Bollinger prête. Le comparateur conserve la même source, le même capital et les mêmes coûts.","success");},120);
  });
  $("bollinger-action-chart").addEventListener("click",()=>{
    if(lastRenderedReport && lastRenderedReport.run?.params?.kind==="BOLLINGER" && !$("market-microscope").hidden){$("market-microscope").scrollIntoView({behavior:"smooth",block:"start"});notice("Microscope Bollinger : mêmes bougies et mêmes fills PAPER que le rapport affiché.","success");return;}
    const bb=strategyAtlas.find(x=>x.kind==="BOLLINGER");if(bb){$("guided-atlas-template").value=bb.atlas_id;renderAtlasEntry(bb);if(!guidedAtlasApplied)$("guided-atlas-apply").click();}
    setTimeout(()=>{$("run").focus();notice("Pour voir Bollinger sur le graphique du Lab, lance d’abord ce test PAPER ; Seven ouvrira ensuite le Microscope des bougies.","success");},120);
  });
  $("bollinger-action-results").addEventListener("click",()=>{$("vault").scrollIntoView({behavior:"smooth",block:"start"});notice("Coffre local : ouvre une simulation Bollinger enregistrée pour relire son résultat sans recalcul.","success");});
  $("donchian-action-prepare").addEventListener("click",()=>{
    const dc=strategyAtlas.find(x=>x.kind==="DONCHIAN");if(dc){$("guided-atlas-template").value=dc.atlas_id;renderAtlasEntry(dc);$("guided-atlas-apply").click();}
  });
  $("donchian-action-compare").addEventListener("click",()=>{
    const dc=strategyAtlas.find(x=>x.kind==="DONCHIAN");if(dc){$("guided-atlas-template").value=dc.atlas_id;renderAtlasEntry(dc);if(!guidedAtlasApplied)$("guided-atlas-apply").click();}
    setTimeout(()=>{$("laboratory").scrollIntoView({behavior:"smooth",block:"start"});$("compare").focus();notice("Donchian 55/20 prête. Le comparateur conserve la même source, le même capital et les mêmes coûts.","success");},120);
  });
  $("donchian-action-chart").addEventListener("click",()=>{
    if(lastRenderedReport && lastRenderedReport.run?.params?.kind==="DONCHIAN" && !$("market-microscope").hidden){$("market-microscope").scrollIntoView({behavior:"smooth",block:"start"});notice("Microscope Donchian : mêmes bougies, mêmes cassures et mêmes fills PAPER que le rapport affiché.","success");return;}
    const dc=strategyAtlas.find(x=>x.kind==="DONCHIAN");if(dc){$("guided-atlas-template").value=dc.atlas_id;renderAtlasEntry(dc);if(!guidedAtlasApplied)$("guided-atlas-apply").click();}
    setTimeout(()=>{$("run").focus();notice("Pour voir Donchian sur le graphique du Lab, lance d'abord ce test PAPER ; Seven ouvrira ensuite le Microscope des bougies.","success");},120);
  });
  $("donchian-action-results").addEventListener("click",()=>{$("vault").scrollIntoView({behavior:"smooth",block:"start"});notice("Coffre local : ouvre une simulation Donchian enregistrée pour relire son résultat sans recalcul.","success");});
  $("passive-action-prepare").addEventListener("click",()=>{
    const kind=({dca:"DCA",hold_50:"HOLD_50",hold_100:"HOLD_100",cash:"CASH"})[passiveKnowledgeCurrentId];
    const entry=strategyAtlas.find(x=>x.kind===kind); if(entry){$("guided-atlas-template").value=entry.atlas_id;renderAtlasEntry(entry);$("guided-atlas-apply").click();}
  });
  $("passive-action-compare").addEventListener("click",()=>{
    const kind=({dca:"DCA",hold_50:"HOLD_50",hold_100:"HOLD_100",cash:"CASH"})[passiveKnowledgeCurrentId];
    const entry=strategyAtlas.find(x=>x.kind===kind); if(entry){$("guided-atlas-template").value=entry.atlas_id;renderAtlasEntry(entry);if(!guidedAtlasApplied)$("guided-atlas-apply").click();}
    setTimeout(()=>{$("laboratory").scrollIntoView({behavior:"smooth",block:"start"});$("compare").focus();notice("Référence prête. Le Comparateur utilisera la même source, le même capital et les mêmes hypothèses de coût pour les 7 modèles.","success");},120);
  });
  $("passive-action-results").addEventListener("click",()=>{$("vault").scrollIntoView({behavior:"smooth",block:"start"});notice("Coffre local : relis les simulations déjà enregistrées sans recalculer.","success");});
  for(const el of [form.elements.ema_fast,form.elements.ema_slow]) el.addEventListener("input",updateEmaKnowledgeNumbers);
  for(const el of [form.elements.bb_period,form.elements.bb_sigma]) el.addEventListener("input",updateBollingerKnowledgeNumbers);
  for(const el of [form.elements.donchian_entry,form.elements.donchian_exit]) el.addEventListener("input",updateDonchianKnowledgeNumbers);
  for(const el of form.querySelectorAll('input[name="timeframe"]')) el.addEventListener("change",()=>{updateEmaKnowledgeNumbers();updateBollingerKnowledgeNumbers();updateDonchianKnowledgeNumbers();});
  const toggleGlossary = show => {
    const panel=$("glossary-panel"); panel.hidden=!show;
    $("open-glossary").setAttribute("aria-expanded",show?"true":"false");
    if(show)panel.scrollIntoView({behavior:"smooth",block:"center"});
  };
  $("open-glossary").addEventListener("click",()=>toggleGlossary($("glossary-panel").hidden));
  $("close-glossary").addEventListener("click",()=>toggleGlossary(false));

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
      workspaceManaged=health.workspace?.managed===true;
      if(workspaceManaged){
        const badge=$("workspace-mode-badge"); if(badge)badge.textContent="WORKSPACE CANONIQUE · GÉRÉ PAR SEVEN";
        const note=$("workspace-mode-note"); if(note)note.innerHTML="Le Coffre affiche les expériences canoniques reconstruites par Seven. <strong>Tes simulations et comparaisons restent exploratoires ; tes profils et StrategySpecs personnels sont sauvegardés séparément et restent modifiables.</strong>";
        $("save-profile").title="Sauvegarde personnelle séparée du corpus canonique";
        $("save-strategy-spec").title="StrategySpec personnel séparé du corpus canonique";
      }
      if(!health.comparisons_enabled)throw new Error("Le serveur Python V2 n'est pas actif. Ferme l'ancienne instance et relance le lanceur V2.");
      if(health.version!=="4.9.0-dev1" || !health.strategy_spec_v1_enabled || !health.source_catalog_v1_enabled || !health.strategy_atlas_v1_enabled || !health.guided_workflow_v1_enabled || !health.strategy_knowledge_v1_enabled || !health.historical_vault_v1_enabled || health.live_trading)throw new Error("Le serveur Seven Heaven avec Guided Workflow n'est pas actif. Relance cette version.");
      const [ok]=await Promise.all([refreshDataset(),refreshProfiles(),refreshHistory(),refreshComparisonHistory(),refreshStrategySpecs(),refreshStrategyAtlas()]);
      await refreshSources();
      notice(ok?"Seven Heaven · Guided Workflow actif · Source Catalog + Strategy Atlas + StrategySpec · moteur PAPER préservé.":
        "Seven Heaven · Guided Workflow actif. Charge ou sélectionne une source vérifiée.","success");
    }catch(e){setBusy(false);available=false;setBusy(false);notice(e.message,"error");}
  })();
})();
