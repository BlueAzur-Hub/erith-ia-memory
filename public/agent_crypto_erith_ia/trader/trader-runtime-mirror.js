(()=>{
"use strict";
const BUILD="40.6.607";
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
      "body.atlas-trader-runtime-mirror main.shell > :not(#accueil):not(#market-zone){display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-view-switcher{display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-advanced{display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential [data-atlas-essential-target]:not([data-atlas-essential-target='market-workspace']):not([data-atlas-essential-target='analyste']){display:none!important}",
      "body.atlas-trader-runtime-mirror #atlasMarketDomainSwitch{pointer-events:none!important;cursor:default!important}",
      "body.atlas-trader-runtime-mirror #market-zone{margin-top:12px}",
      "body.atlas-trader-runtime-mirror .shell{padding-bottom:28px}",
      "body.atlas-trader-runtime-mirror .trader-runtime-badge{white-space:nowrap}",
      "body.atlas-trader-runtime-mirror .trader-runtime-admin-link{text-decoration:none;color:inherit}"
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

  const statusStack=hero?.querySelector(".status-stack");
  if(statusStack&&!doc.getElementById("traderRuntimeBadge")){
    const badge=doc.createElement("span");
    badge.id="traderRuntimeBadge";
    badge.className="pill ok trader-runtime-badge";
    badge.textContent="TRADER · "+BUILD+" · READ ONLY";
    const engine=doc.getElementById("administratorEngineBadge");
    statusStack.insertBefore(badge,engine||statusStack.firstChild);
  }
  if(statusStack&&!doc.getElementById("traderRuntimeAdminLink")){
    const link=doc.createElement("a");
    link.id="traderRuntimeAdminLink";
    link.className="pill trader-runtime-admin-link";
    link.href="../administrator/index.html";
    link.target="_top";
    link.rel="noopener";
    link.textContent="Administrator ↗";
    const sigil=statusStack.querySelector(".sigil");
    statusStack.insertBefore(link,sigil||null);
  }

  const marketSwitch=doc.getElementById("atlasMarketDomainSwitch");
  if(marketSwitch){
    marketSwitch.setAttribute("aria-label","Marché Crypto · runtime Interface partagé");
    marketSwitch.setAttribute("title","Trader : marché Crypto partagé avec l’Interface");
    marketSwitch.disabled=true;
  }

  doc.title="ERITH.IA · Trading Desk — "+BUILD;
  try{
    win.dispatchEvent(new CustomEvent("agent-crypto:trader-runtime-mirror",{detail:{
      build:BUILD,
      administrator_runtime:true,
      filtered_presentation_only:true,
      real_orders:false
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
  real_orders:false
});
})();