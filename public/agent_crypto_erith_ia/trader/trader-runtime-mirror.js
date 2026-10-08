(()=>{
"use strict";
const BUILD="40.6.624";
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

  // Inject only a standalone, read-only R9 viewer into the SAME runtime.
  if(!doc.getElementById("traderHistoricalPanelScript")){
    const script=doc.createElement("script");
    script.id="traderHistoricalPanelScript";
    script.src=new URL("../trader/trader-historical-panel.js?v=40.6.625",doc.baseURI).href;
    doc.head.appendChild(script);
  }
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
      okb_case_study:true,
      okb_case_study_owner:"administrator/index.html#traderOkbCaseStudy"
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
  okb_case_study:true,
  okb_case_study_owner:"administrator/index.html#traderOkbCaseStudy"
});
})();