(()=>{
"use strict";
const BUILD="40.6.603";
const frame=document.getElementById("traderInterfaceRuntime");
const status=document.getElementById("traderBootstrapStatus");
if(!frame)return;

const NAV_ORDER=["market","graph","target-top","market-flow","oracle","sources","decision","aether"];

function traderAnchor(doc,key,label,icon,href){
  let node=doc.querySelector('[data-trader-nav="'+key+'"]');
  if(node)return node;
  node=doc.createElement("a");
  node.className="atlas-quick-link trader-runtime-nav-link";
  node.href=href;
  node.dataset.traderNav=key;
  node.innerHTML='<span class="atlas-quick-icon" aria-hidden="true">'+icon+'</span><span>'+label+'</span>';
  return node;
}

function ensureNavigation(doc){
  const nav=doc.querySelector("#accueil .atlas-v2-nav-essential");
  if(!nav)return false;

  const market=nav.querySelector('[data-atlas-essential-target="market-workspace"]');
  const graph=nav.querySelector('[data-atlas-essential-target="analyste"]');
  const oracle=nav.querySelector('[data-atlas-essential-target="oracle-analysis-suite"]');
  const sources=nav.querySelector('[data-atlas-essential-target="sources"]');

  if(market)market.dataset.traderNav="market";
  if(graph)graph.dataset.traderNav="graph";
  if(oracle)oracle.dataset.traderNav="oracle";
  if(sources)sources.dataset.traderNav="sources";

  const target=traderAnchor(doc,"target-top","Target Top","◎","#targetTop5Cycle");
  const flow=traderAnchor(doc,"market-flow","Market Flow","≈","#marketFlowCycle");

  let decision=doc.querySelector('[data-trader-nav="decision"]');
  if(!decision){
    decision=doc.querySelector('#atlasAdminCenterDrawer a[href="#decision-board"]');
    if(decision)decision.dataset.traderNav="decision";
  }

  const aether=doc.getElementById("atlasAetherStatusToggle");
  if(aether){
    aether.dataset.traderNav="aether";
    aether.classList.add("atlas-quick-link","trader-runtime-aether-link");
    aether.setAttribute("title","Ouvrir la synthèse Aether");
  }

  const nodes={market,graph,"target-top":target,"market-flow":flow,oracle,sources,decision,aether};
  for(const key of NAV_ORDER){
    const node=nodes[key];
    if(node)nav.appendChild(node);
  }
  nav.dataset.traderNavigation=BUILD;
  return true;
}

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
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential [data-atlas-essential-target='livecheck']{display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential [data-atlas-essential-target='atlas-local-ai-collapse']{display:none!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential .trader-runtime-nav-link{display:inline-flex!important;align-items:center!important}",
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential .trader-runtime-aether-link{display:inline-flex!important;align-items:center!important}",
      "body.atlas-trader-runtime-mirror #atlasAetherRibbon{display:none!important}",
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

  const versionText=doc.getElementById("atlasVersionTruthText");
  const versionControl=doc.getElementById("atlasVersionTruthControl");
  const releaseBadge=doc.getElementById("atlasV2ReleaseBadge");
  if(versionText)versionText.textContent="Build "+BUILD+" · Administrator";
  if(versionControl)versionControl.setAttribute("aria-label","Version Agent-Crypto chargée : Build "+BUILD+", mode Administrator");
  if(releaseBadge)releaseBadge.textContent="Agent-Crypto @erith.IA · Build "+BUILD+" · Administrator";

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

  ensureNavigation(doc);

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
      navigation:NAV_ORDER.slice(),
      real_orders:false
    }}));
  }catch(_){}

  if(status){
    status.textContent="Interface Administrator montée · menu Trader actif";
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
  navigation:Object.freeze(NAV_ORDER.slice()),
  duplicated_market_owner:false,
  duplicated_chart_owner:false,
  duplicated_math_owner:false,
  duplicated_detail_owner:false,
  real_orders:false
});
})();