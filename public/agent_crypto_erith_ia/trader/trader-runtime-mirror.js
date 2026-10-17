(()=>{
"use strict";
const BUILD="40.6.640";
const frame=document.getElementById("traderInterfaceRuntime");
const status=document.getElementById("traderBootstrapStatus");
if(!frame)return;

function mount(){
  let win,doc;
  try{win=frame.contentWindow;doc=frame.contentDocument||win?.document;}catch(_){return false;}
  if(!doc?.documentElement||!doc?.body)return false;

  doc.documentElement.dataset.agentCryptoSurface="trader";
  doc.body.classList.add("atlas-trader-runtime-mirror");
  doc.body.dataset.traderRuntimeMirror=BUILD;

  if(!doc.getElementById("agentCryptoTraderRuntimeMirrorStyle")){
    const style=doc.createElement("style");
    style.id="agentCryptoTraderRuntimeMirrorStyle";
    style.textContent=[
      "body.atlas-trader-runtime-mirror main.shell > :not(#accueil):not(#livecheck):not(#market-zone){display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-view-switcher{display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential [data-atlas-essential-target]:not([data-atlas-essential-target='livecheck']):not([data-atlas-essential-target='market-workspace']):not([data-atlas-essential-target='analyste']){display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-advanced.atlas-admin-dock{display:flex!important;flex:0 0 auto!important;margin-left:auto!important;width:auto!important;min-width:max-content!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-advanced .atlas-admin-command-bar{display:flex!important;align-items:center!important;width:auto!important;min-width:0!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-advanced .atlas-admin-command-shortcuts,body.atlas-trader-runtime-mirror #accueil #atlasAdminGraphToggle,body.atlas-trader-runtime-mirror #accueil #atlasAdminCenterToggle,body.atlas-trader-runtime-mirror #accueil #atlasAdminCenterDrawer{display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil #atlasAetherStatusToggle{display:inline-flex!important}",
      "body.atlas-trader-runtime-mirror #atlasMarketDomainSwitch{pointer-events:none!important;cursor:default!important}",
      "body.atlas-trader-runtime-mirror #market-zone{margin-top:12px}",
      "body.atlas-trader-runtime-mirror .shell{padding-bottom:28px}"
    ].join("\n");
    doc.head.appendChild(style);
  }

  const hero=doc.getElementById("accueil");
  const eyebrow=hero?.querySelector(".title-block > .eyebrow");
  const brand=hero?.querySelector(".brandline");
  if(eyebrow)eyebrow.textContent="ERITH.IA · TRADING DESK";
  if(brand){
    const left=brand.querySelector("span"),right=brand.querySelector("strong");
    if(left)left.textContent="Agent-Crypto";
    if(right)right.textContent="· Trader";
  }

  const adminLink=doc.getElementById("traderSurfaceAdminLink");
  if(adminLink){
    adminLink.href="../administrator/index.html";
    adminLink.target="_top";
    adminLink.rel="noopener";
    adminLink.setAttribute("aria-label","Ouvrir Administrator");
    adminLink.setAttribute("title","Ouvrir Administrator");
  }

  const marketSwitch=doc.getElementById("atlasMarketDomainSwitch");
  if(marketSwitch){
    marketSwitch.setAttribute("aria-label","Marché Crypto · runtime Interface partagé");
    marketSwitch.setAttribute("title","Trader : marché Crypto partagé avec l’Interface");
    marketSwitch.disabled=true;
  }

  // Trader-only read surfaces mounted inside the SAME Administrator runtime.
  // No duplicated market/chart owner and no real order route.
  if(!doc.getElementById("traderOkxAccountScript")){
    const script=doc.createElement("script");
    script.id="traderOkxAccountScript";
    script.src=new URL("../trader/trader-okx-account.js?feature=okx-position-fr-fix",doc.baseURI).href;
    doc.head.appendChild(script);
  }
  if(!doc.getElementById("traderHistoricalPanelScript")){
    const script=doc.createElement("script");
    script.id="traderHistoricalPanelScript";
    script.src=new URL("../trader/trader-historical-panel.js?reader=visible-coffre",doc.baseURI).href;
    doc.head.appendChild(script);
  }
  // Trader-only CT/USDT one-minute watch. Reuses the canonical candle owner:
  // one request per minute, visible tab only, no Administrator mutation or order.
  if(!win.AgentCryptoMarketMinuteRefresh&&!doc.getElementById("traderCtMinuteWatchScript")){
    const script=doc.createElement("script");
    script.id="traderCtMinuteWatchScript";
    script.src=new URL("../trader/trader-candles-minute-watch.js",doc.baseURI).href;
    script.onerror=()=>{
      if(status){status.textContent="Suivi minute CT indisponible";status.dataset.state="error";}
    };
    doc.head.appendChild(script);
  }
  // Native Trader-only module. Contract and panel execute in the iframe that
  // owns the navigation, sessionStorage and private OKX read surface.
  if(!doc.getElementById("traderAiCtContractScript")){
    const contract=doc.createElement("script");
    contract.id="traderAiCtContractScript";
    contract.src=new URL("../trader/ai-ct-contract.js?scope=native",doc.baseURI).href;
    const reportFailure=()=>{
      if(status){status.textContent="Passerelle IA CT indisponible (script non chargé)";status.dataset.state="error";}
    };
    contract.onerror=reportFailure;
    contract.onload=()=>{
      if(!win.AgentCryptoAiCtContract){reportFailure();return;}
      if(doc.getElementById("traderAiCtPanelScript"))return;
      const panel=doc.createElement("script");
      panel.id="traderAiCtPanelScript";
      panel.src=new URL("../trader/ai-ct-panel.js?scope=native",doc.baseURI).href;
      panel.onerror=reportFailure;
      doc.head.appendChild(panel);
    };
    doc.head.appendChild(contract);
  }
  // Visible PAPER laboratory. Its arithmetic is isolated and it only consumes
  // canonical publicly loaded BTC/CT series. Never inherits Bridge credentials.
  if(!doc.getElementById("traderPaperLabCoreScript")){
    const script=doc.createElement("script");
    script.id="traderPaperLabCoreScript";
    script.src=new URL("../trader/trader-paper-lab-core.js",doc.baseURI).href;
    script.onload=()=>{
      if(!win.AgentCryptoPaperLabCore){
        if(status){status.textContent="Laboratoire PAPER non chargé";status.dataset.state="error";}
        return;
      }
      if(doc.getElementById("traderPaperLabViewScript"))return;
      const view=doc.createElement("script");
      view.id="traderPaperLabViewScript";
      view.src=new URL("../trader/trader-paper-lab-view.js",doc.baseURI).href;
      view.onerror=()=>{
        if(status){status.textContent="Vue laboratoire PAPER indisponible";status.dataset.state="error";}
      };
      doc.head.appendChild(view);
    };
    script.onerror=()=>{
      if(status){status.textContent="Moteur de simulation PAPER indisponible";status.dataset.state="error";}
    };
    doc.head.appendChild(script);
  }
  // Trader-only continuity, deliberately not loaded in the public Interface.
  if(!doc.getElementById("traderCtSelectionMemoryScript")){
    const script=doc.createElement("script");
    script.id="traderCtSelectionMemoryScript";
    script.src=new URL("../trader/ct-selection-memory.js",doc.baseURI).href;
    script.onerror=()=>{
      if(status){status.textContent="Mémoire CT du Trader indisponible";status.dataset.state="error";}
    };
    doc.head.appendChild(script);
  }
  mountNativeDnaCase(win,doc);
  doc.title="ERITH.IA · Trading Desk — "+BUILD;
  try{
    win.dispatchEvent(new CustomEvent("agent-crypto:trader-runtime-mirror",{detail:{
      build:BUILD,
      administrator_runtime:true,
      filtered_presentation_only:true,
      real_orders:false,
      native_header:true,
      header_injection:false,
  minimum_nav:true,
  minimum_nav_items:Object.freeze(["Livecheck","Marché","Graphique","Aether"]),
      minimum_nav:true,
      minimum_nav_items:["Livecheck","Marché","Graphique","Aether"],
      btc_case_study:true,
      btc_case_study_owner:"administrator/index.html#traderOkbCaseStudy",
      okx_private_read:true,
      okx_account_owner:"trader/trader-okx-account.js",
      okx_bridge:"127.0.0.1:8787"
    }}));
  }catch(_){}

  if(status){
    status.textContent="Interface Administrator montée · filtrage Trader actif";
    status.dataset.state="ready";
  }
  frame.dataset.ready="true";
  return true;
}


frame.addEventListener("load",()=>{
  if(!mount()&&status){
    status.textContent="Interface chargée mais filtrage Trader indisponible";
    status.dataset.state="error";
  }
},{once:false});



/* Trader-only Cas d'école: reuse the ONE existing Administrator report slot.
   No floating buttons, no second report, no new Market/chart owner. */
function mountNativeDnaCase(win,doc){
  const host=doc.getElementById("traderOkbCaseStudy");
  if(!host||host.dataset.dnaCaseMounted==="1")return;
  const summary=host.querySelector("summary");
  const title=summary?.querySelector(".okb-case-title");
  const metrics=summary?.querySelector(".okb-case-summary-metrics");
  const originalBody=host.querySelector(".okb-case-body");
  if(!summary||!title||!metrics||!originalBody)return;
  host.dataset.dnaCaseMounted="1";
  const initialTitle=title.textContent,initialLabel=host.getAttribute("aria-label");
  const dnaMetrics=doc.createElement("span");
  dnaMetrics.className="okb-case-summary-metrics";
  dnaMetrics.textContent="DNA · Bitget Spot · PAPER · sources vérifiées";
  dnaMetrics.hidden=true;
  summary.insertBefore(dnaMetrics,summary.querySelector(".okb-case-chevron"));
  const dnaBody=doc.createElement("div");
  dnaBody.className="okb-case-body";
  dnaBody.hidden=true;
  // Real native content INSIDE the canonical Cas d'école.
  // No embedded website, second frame, floating control or independent owner.
  const grid=doc.createElement("div");
  grid.className="okb-case-grid";
  const makeCard=(heading)=>{
    const article=doc.createElement("article");
    article.className="okb-case-card";
    const h=doc.createElement("h3");h.textContent=heading;
    const p=doc.createElement("p");p.textContent="Lecture des preuves en attente…";
    article.append(h,p);grid.appendChild(article);
    return p;
  };
  const provenance=makeCard("1 · Provenance et identité");
  const carnet=makeCard("2 · Dernier carnet Spot Bitget");
  const paper=makeCard("3 · Portefeuilles PAPER · 10 / 25 / 100 USDC");
  const decisions=makeCard("4 · Décision et limites");
  const links=doc.createElement("nav");
  links.className="okb-case-sources";
  links.setAttribute("aria-label","Sources du Cas d'école DNA");
  const addLink=(label,relative)=>{
    const a=doc.createElement("a");a.textContent=label;
    a.href=new URL(relative,doc.baseURI).href;
    a.target="_blank";a.rel="noopener";links.appendChild(a);
  };
  addLink("Dossier complet · IA et humain","../trader/dna-case-study.html");
  addLink("Laboratoire DNA PAPER","../laboratoire/dna-paper.html");
  addLink("JSON source canonique","https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/trader_flux/dna_paper/state.json");
  const foot=doc.createElement("p");foot.className="okb-case-foot";
  foot.textContent="Dossier en lecture seule : Bitget DNA/USDT Spot ≠ OKX DNAUSD UM X-Perp Futures. Aucune transaction, aucun prix de sortie garanti.";
  dnaBody.append(grid,links,foot);
  host.appendChild(dnaBody);
  let loadedAt=0,busy=false;
  const fmt=(value,precision=5)=>Number.isFinite(value)?
    Number(value).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:precision}):"indisponible";
  const showData=async()=>{
    if(!host.open||host.dataset.dnaCaseActive!=="1"||busy)return;
    if(loadedAt && Date.now()-loadedAt<240000)return;
    busy=true;
    provenance.textContent="Vérification des relevés GitHub…";
    try{
      const url=new URL("../data/trader_flux/dna_paper/state.json?reader=trader-native-case",doc.baseURI);
      const response=await win.fetch(url.href,{cache:"no-store"});
      if(!response.ok)throw Error("Archive HTTP "+response.status);
      const state=await response.json();
      if(state.schema!=="erith.dna.paper.48h.v1"||state.mode!=="PAPER"||
         state.market!=="DNAUSDT"||state.venue!=="Bitget"||state.type!=="SPOT"||
         state.quote!=="USDT"||state.executed_order!==false||
         state.private_account_access!==false||state.order_permissions!==false||
         state.token?.contract!=="0xA991F61940095AEA0724ef54077223B048c5CF7b"||
         !Array.isArray(state.observations)||!Array.isArray(state.scenarios)||
         state.scenarios.length!==3)throw Error("Identité ou politique PAPER non vérifiée");
      const last=state.observations.at(-1);
      if(last&&(!Number.isFinite(last.dna_bid)||!Number.isFinite(last.dna_ask)||
         last.dna_bid<=0||last.dna_ask<=last.dna_bid||
         !Number.isFinite(Date.parse(last.observed_at))))throw Error("Carnet invalidé");
      const when=t=>t?new Date(t).toLocaleString("fr-FR",{
        timeZone:"Europe/Paris",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"
      }):"—";
      if(host.dataset.dnaCaseActive!=="1")return;
      provenance.textContent="NeoSoul DNA · Bitget DNAUSDT Spot · BNB Chain. T0 : "+
        when(state.started_at)+" · "+state.observations.length+" relevés archivés.";
      carnet.textContent=last?
        "Relevé : "+when(last.observed_at)+" · Bid "+fmt(last.dna_bid,8)+
        " USDT · Ask "+fmt(last.dna_ask,8)+" USDT · Spread "+fmt(last.dna_spread_pct,3)+" %.":
        "Aucun carnet confirmé dans l'archive.";
      paper.textContent=last?state.scenarios.map((sc,i)=>{
        const p=last.scenarios?.[i];
        return sc.capital_usdc+" USDC : "+(p?.status==="valued"?
          fmt(p.pnl_usdc,4)+" USDC ("+fmt(p.pnl_pct,2)+" %)":
          "valorisation indisponible");
      }).join(" · "):"Pas encore de valorisation.";
      decisions.textContent="Seuils observés a posteriori : alerte perte −3 %, alerte gain +1 %. "+
        "Impossible de garantir leur exécution entre deux relevés. "+
        "Carnet Futures, liquidation et financement OKX non évalués. Aucun ordre.";
      loadedAt=Date.now();
    }catch(error){
      if(host.dataset.dnaCaseActive!=="1")return;
      provenance.textContent="Source indisponible ou non validée : "+String(error.message||error);
      carnet.textContent="Aucun prix présenté sans archive valide.";
      paper.textContent="Résultats suspendus.";
      decisions.textContent="Aucune décision de marché ; consulter la source canonique.";
      loadedAt=0;
    }finally{busy=false;}
  };
  const update=()=>{
    // The public New Listings selection AND canonical active line chart must
    // both identify NeoSoul, or BTC/CT keeps the original Cas d'école.
    const selection=win.AgentCryptoNewListingsNativeCategory?.snapshot?.();
    const chart=win.AtlasExternalChart?.state?.();
    const dna=selection?.selectedId==="neosoul"&&selection?.selectedSymbol==="DNA"
      &&chart?.active===true&&chart?.coin_id==="neosoul"
      &&chart?.loading!==true&&!chart?.error;
    if(dna===(host.dataset.dnaCaseActive==="1")){void showData();return;}
    host.dataset.dnaCaseActive=dna?"1":"0";
    originalBody.hidden=dna;
    dnaBody.hidden=!dna;
    title.textContent=dna?"DNA · NeoSoul · étude Spot PAPER, vérité terrain":initialTitle;
    metrics.hidden=dna;dnaMetrics.hidden=!dna;
    if(dna)host.setAttribute("aria-label","Cas d'école DNA · étude PAPER, sources Bitget Spot");
    else if(initialLabel!==null)host.setAttribute("aria-label",initialLabel);
    void showData();
  };
  const deferred=()=>{
    win.setTimeout(update,0);
    win.setTimeout(update,350);
  };
  win.addEventListener("agent-crypto:new-listing-line-ready",deferred,{passive:true});
  win.addEventListener("agent-crypto:external-asset-changed",deferred,{passive:true});
  win.addEventListener("agent-crypto:graph-context-ready",deferred,{passive:true});
  win.addEventListener("agent-crypto:workspace-restored",deferred,{passive:true});
  win.addEventListener("pageshow",deferred,{passive:true});
  doc.addEventListener("click",deferred,{capture:true,passive:true});
  host.addEventListener("toggle",()=>{void showData();});
  update();
}

globalThis.AgentCryptoTraderRuntimeMirror=Object.freeze({
  build:BUILD,
  mount,
  frame:()=>frame,
  administrator_runtime:true,
  filtered_presentation_only:true,
  duplicated_market_owner:false,
  duplicated_chart_owner:false,
  duplicated_math_owner:false,
  duplicated_detail_owner:false,
  real_orders:false,
  native_header:true,
  header_injection:false,
  btc_case_study:true,
  btc_case_study_owner:"administrator/index.html#traderOkbCaseStudy",
  okx_private_read:true,
  okx_account_owner:"trader/trader-okx-account.js",
  okx_bridge:"127.0.0.1:8787"
});
})();