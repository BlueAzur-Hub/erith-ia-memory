(()=>{
"use strict";
const BUILD="40.6.605";
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

  if(market){market.dataset.traderNav="market";market.classList.add("trader-runtime-nav-link");}
  if(graph){graph.dataset.traderNav="graph";graph.classList.add("trader-runtime-nav-link");}
  if(oracle){oracle.dataset.traderNav="oracle";oracle.classList.add("trader-runtime-nav-link");}
  if(sources){
    sources.dataset.traderNav="sources";
    sources.classList.add("trader-runtime-nav-link");
    sources.setAttribute("aria-controls","source-dock");
    sources.setAttribute("aria-label","Ouvrir les Sources du Trader dans la Lecture technique");
  }

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

function clearFocusedRoute(doc){
  doc.body.classList.remove("trader-route-decision");
  doc.querySelectorAll("[data-trader-route-open-before]").forEach(node=>{
    if(node instanceof HTMLDetailsElement)node.open=node.dataset.traderRouteOpenBefore==="1";
    delete node.dataset.traderRouteOpenBefore;
  });
  doc.querySelectorAll("[data-trader-route-path],[data-trader-route-surface]").forEach(node=>{
    delete node.dataset.traderRoutePath;
    delete node.dataset.traderRouteSurface;
  });
}

function focusExistingSurface(doc,targetId){
  clearFocusedRoute(doc);
  const target=doc.getElementById(targetId);
  if(!(target instanceof HTMLElement))return false;

  const route="decision";
  if(target instanceof HTMLDetailsElement){
    target.dataset.traderRouteOpenBefore=target.open?"1":"0";
    target.open=true;
  }
  target.dataset.traderRouteSurface=route;

  let node=target.parentElement;
  while(node&&node!==doc.body&&!node.matches("main.shell")){
    node.dataset.traderRoutePath=route;
    if(node instanceof HTMLDetailsElement){
      node.dataset.traderRouteOpenBefore=node.open?"1":"0";
      node.open=true;
    }
    node=node.parentElement;
  }

  doc.body.classList.add("trader-route-decision");
  try{target.scrollIntoView({block:"start",behavior:"smooth"});}catch(_){try{target.scrollIntoView();}catch(__){}}
  return true;
}

function openTraderSources(doc){
  clearFocusedRoute(doc);
  const deck=doc.getElementById("analyste");
  const toggle=doc.getElementById("detailPanelToggle");
  if(deck?.classList.contains("detail-collapsed")&&toggle instanceof HTMLElement){
    try{toggle.click();}catch(_){}
  }
  const sourceDock=doc.getElementById("source-dock");
  const sourceState=doc.getElementById("detailSourcesWindow");
  if(sourceDock instanceof HTMLDetailsElement)sourceDock.open=true;
  if(sourceState instanceof HTMLDetailsElement)sourceState.open=true;
  const target=sourceDock||sourceState||doc.getElementById("detailPanel");
  if(target instanceof HTMLElement){
    try{target.scrollIntoView({block:"center",behavior:"smooth"});}catch(_){try{target.scrollIntoView();}catch(__){}}
    return true;
  }
  return false;
}

function alignAetherBelowGraphToolbar(win,doc){
  const panel=doc.getElementById("atlasAetherStatusPanel");
  if(!(panel instanceof HTMLElement)||panel.dataset.aetherOperatorOpen!=="1")return false;
  const toolbar=doc.querySelector("#analyste .chart-v2-toolbar");
  const accueil=doc.getElementById("accueil");
  const anchorRect=(toolbar||accueil)?.getBoundingClientRect?.();
  const current=panel.getBoundingClientRect?.();
  const vw=Math.max(doc.documentElement.clientWidth,win.innerWidth||0);
  const vh=Math.max(doc.documentElement.clientHeight,win.innerHeight||0);
  if(!current||vw<1||vh<1)return false;

  const top=Math.max(12,Math.ceil((anchorRect?.bottom||0)+10));
  const available=Math.max(280,vh-top-12);
  const targetHeight=Math.min(current.height||available,available);
  const targetWidth=Math.min(current.width||targetHeight*16/9,Math.max(420,vw-24),targetHeight*16/9);
  const targetLeft=Math.max(12,Math.min(current.left||12,vw-targetWidth-12));

  panel.style.setProperty("left",Math.round(targetLeft)+"px","important");
  panel.style.setProperty("right","auto","important");
  panel.style.setProperty("top",Math.round(top)+"px","important");
  panel.style.setProperty("bottom","auto","important");
  panel.style.setProperty("width",Math.round(targetWidth)+"px","important");
  panel.style.setProperty("height",Math.round(targetHeight)+"px","important");
  panel.dataset.traderAetherBelowToolbar=BUILD;
  return true;
}

function emitRouteAudit(win,doc,route,before=contextSnapshot(win,doc)){
  try{
    win.requestAnimationFrame(()=>win.requestAnimationFrame(()=>{
      const after=contextSnapshot(win,doc);
      const stable=contextStable(before,after);
      doc.documentElement.dataset.traderRouteFidelity=stable?"stable":"context-changed";
      try{
        win.dispatchEvent(new CustomEvent("agent-crypto:trader-route-check",{detail:{
          build:BUILD,route,before,after,stable,mutated:false
        }}));
      }catch(_){}
    }));
  }catch(_){}
}

function bindFunctionalRoutes(win,doc){
  const nav=doc.querySelector("#accueil .atlas-v2-nav-essential");
  if(!nav||nav.dataset.traderFunctionalRoutes==="1")return false;
  nav.dataset.traderFunctionalRoutes="1";
  nav.addEventListener("click",event=>{
    const item=event.target?.closest?.("[data-trader-nav]");
    if(!item||!nav.contains(item))return;
    const route=String(item.dataset.traderNav||"");
    const before=contextSnapshot(win,doc);

    if(route==="sources"){
      event.preventDefault();
      event.stopImmediatePropagation();
      openTraderSources(doc);
      emitRouteAudit(win,doc,route,before);
      return;
    }
    if(route==="decision"){
      event.preventDefault();
      event.stopImmediatePropagation();
      focusExistingSurface(doc,"atlasDecisionBoardDetails");
      emitRouteAudit(win,doc,route,before);
      return;
    }

    if(route!=="decision")clearFocusedRoute(doc);
    if(route==="aether"){
      try{
        win.requestAnimationFrame(()=>win.requestAnimationFrame(()=>alignAetherBelowGraphToolbar(win,doc)));
      }catch(_){}
    }
  },true);
  return true;
}

function contextSnapshot(win,doc){
  let selected=null,quote=null,microscope=null,graph=null;
  try{selected=win.getSelectedCoin?.()||null;}catch(_){}
  try{quote=win.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()||null;}catch(_){}
  try{microscope=win.AgentCryptoMarketMicroscope?.snapshot?.()||null;}catch(_){}
  try{graph=win.AgentCryptoGraphNativeUsd?.snapshot?.()||null;}catch(_){}
  const value=v=>v===undefined||v===null||v===""?null:String(v);
  return Object.freeze({
    asset:value(selected?.symbol||selected?.id||microscope?.instrument),
    display_currency:value(quote?.displayCurrency),
    candle_instrument:value(microscope?.instrument),
    candle_bar:value(microscope?.bar),
    graph_period:value(graph?.period||graph?.range||graph?.window)
  });
}

function contextStable(before,after){
  for(const key of ["asset","display_currency","candle_instrument","candle_bar","graph_period"]){
    if(before[key]!==null&&after[key]!==null&&before[key]!==after[key])return false;
  }
  return true;
}

function navigationAudit(doc){
  const nav=doc.querySelector("#accueil .atlas-v2-nav-essential");
  const found={};
  for(const key of NAV_ORDER)found[key]=!!nav?.querySelector('[data-trader-nav="'+key+'"]');
  return Object.freeze(found);
}

function bindNavigationFidelity(win,doc){
  const nav=doc.querySelector("#accueil .atlas-v2-nav-essential");
  if(!nav||nav.dataset.traderFidelityBound==="1")return false;
  nav.dataset.traderFidelityBound="1";
  nav.addEventListener("click",event=>{
    const item=event.target?.closest?.("[data-trader-nav]");
    if(!item||!nav.contains(item))return;
    const route=String(item.dataset.traderNav||"");
    if(route==="sources"||route==="decision")return;
    const before=contextSnapshot(win,doc);
    doc.documentElement.dataset.traderRouteLast=route;
    emitRouteAudit(win,doc,route,before);
  },{passive:true});
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
      "body.atlas-trader-runtime-mirror #accueil .atlas-v2-nav-essential [data-trader-nav='oracle']{display:inline-flex!important;align-items:center!important}",
      "body.atlas-trader-runtime-mirror #atlasAetherRibbon{display:none!important}",
      "body.atlas-trader-runtime-mirror.trader-route-decision main.shell > :not(#accueil):not([data-trader-route-path='decision']){display:none!important}",
      "body.atlas-trader-runtime-mirror.trader-route-decision [data-trader-route-path='decision']{display:block!important}",
      "body.atlas-trader-runtime-mirror.trader-route-decision [data-trader-route-path='decision'] > :not([data-trader-route-path='decision']):not([data-trader-route-surface='decision']){display:none!important}",
      "body.atlas-trader-runtime-mirror.trader-route-decision [data-trader-route-surface='decision']{display:block!important}",
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
  bindFunctionalRoutes(win,doc);
  bindNavigationFidelity(win,doc);
  doc.documentElement.dataset.traderRouteFidelity="ready";

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
    status.textContent="Interface Administrator montée · navigation Trader réparée";
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
  context_snapshot:()=>{try{const win=frame.contentWindow,doc=frame.contentDocument||win?.document;return win&&doc?contextSnapshot(win,doc):null;}catch(_){return null;}},
  navigation_audit:()=>{try{const doc=frame.contentDocument||frame.contentWindow?.document;return doc?navigationAudit(doc):null;}catch(_){return null;}},
  route_fidelity_read_only:true,
  sources_route_owner:"existing Source Dock + Sources status window",
  decision_route_owner:"existing atlasDecisionBoardDetails",
  oracle_nav_restored:true,
  aether_toolbar_clearance:true,
  duplicated_market_owner:false,
  duplicated_chart_owner:false,
  duplicated_math_owner:false,
  duplicated_detail_owner:false,
  real_orders:false
});
})();