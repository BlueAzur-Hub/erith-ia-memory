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
  const frame=doc.createElement("iframe");
  frame.title="Cas d'école DNA : observation, carnet Bitget Spot et résultats PAPER";
  frame.loading="lazy";
  frame.referrerPolicy="same-origin";
  frame.style.cssText="display:block;width:100%;min-height:850px;border:0;background:#07121d;border-radius:9px";
  dnaBody.appendChild(frame);
  host.appendChild(dnaBody);
  let loaded=false;
  const showFrame=()=>{
    if(host.open&&!loaded&&host.dataset.dnaCaseActive==="1"){
      frame.src=new URL("../trader/dna-case-study.html",doc.baseURI).href;
      loaded=true;
    }
  };
  const update=()=>{
    // The public New Listings selection AND canonical active line chart must
    // both identify NeoSoul, or BTC/CT keeps the original Cas d'école.
    const selection=win.AgentCryptoNewListingsNativeCategory?.snapshot?.();
    const chart=win.AtlasExternalChart?.state?.();
    const dna=selection?.selectedId==="neosoul"&&selection?.selectedSymbol==="DNA"
      &&chart?.active===true&&chart?.coin_id==="neosoul"
      &&chart?.loading!==true&&!chart?.error;
    if(dna===(host.dataset.dnaCaseActive==="1")){showFrame();return;}
    host.dataset.dnaCaseActive=dna?"1":"0";
    originalBody.hidden=dna;
    dnaBody.hidden=!dna;
    title.textContent=dna?"DNA · NeoSoul · étude Spot PAPER, vérité terrain":initialTitle;
    metrics.hidden=dna;dnaMetrics.hidden=!dna;
    if(dna)host.setAttribute("aria-label","Cas d'école DNA · étude PAPER, sources Bitget Spot");
    else if(initialLabel!==null)host.setAttribute("aria-label",initialLabel);
    showFrame();
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
  host.addEventListener("toggle",showFrame);
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