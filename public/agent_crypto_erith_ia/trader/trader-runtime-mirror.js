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

/* Trader-only documentary drawer: no new chart/Market owner, and no orders. */
function mountDnaCaseStudyDock(){
  if(document.getElementById("traderDnaCaseToggle"))return;
  const css=document.createElement("style");
  css.id="traderDnaCaseDockStyle";
  css.textContent=[
    "#traderDnaCaseToggle{position:fixed;right:14px;top:155px;z-index:100001;font:750 12px system-ui,sans-serif;letter-spacing:.02em;color:#eafcff;background:#0d2c36;border:1px solid #69d9d8;border-radius:11px;padding:10px 12px;box-shadow:0 4px 20px #0008;cursor:pointer}",
    "#traderDnaCaseToggle:focus-visible,#traderDnaCaseClose:focus-visible,#traderDnaCaseDock a:focus-visible{outline:3px solid #ffdc89;outline-offset:3px}",
    "#traderDnaCaseDock{position:fixed;z-index:100002;inset:55px 12px 16px auto;width:min(650px,calc(100vw - 24px));display:flex;flex-direction:column;background:#071925;color:#ecf9fb;border:1px solid #4caab4;border-radius:13px;box-shadow:0 10px 42px #000d;font:13px system-ui,sans-serif}",
    "#traderDnaCaseDock[hidden]{display:none!important}",
    "#traderDnaCaseDock header{display:flex;align-items:center;gap:10px;padding:12px;background:#11303b;border-radius:13px 13px 0 0;border-bottom:1px solid #3d6d75}",
    "#traderDnaCaseDock header strong{flex:1;min-width:0;line-height:1.4}",
    "#traderDnaCaseDock header a{color:#8ae7e8;white-space:nowrap}",
    "#traderDnaCaseClose{color:#f6ffff;background:#23404b;border:1px solid #69939a;border-radius:9px;padding:7px 11px;cursor:pointer}",
    "#traderDnaCaseFrame{width:100%;min-height:0;flex:1;display:block;border:0;background:#07121d;border-radius:0 0 13px 13px}",
    "@media(max-width:640px){#traderDnaCaseToggle{top:auto;bottom:13px;right:13px}#traderDnaCaseDock{inset:9px 8px 9px 8px;width:auto}#traderDnaCaseDock header{flex-wrap:wrap}}"
  ].join("\n");
  document.head.appendChild(css);
  const button=document.createElement("button");
  button.id="traderDnaCaseToggle";button.type="button";
  button.textContent="DNA · Cas d’école";
  button.setAttribute("aria-controls","traderDnaCaseDock");
  button.setAttribute("aria-expanded","false");
  button.title="Ouvrir le dossier PAPER DNA ; aucune sélection du marché ni ordre";
  const panel=document.createElement("aside");
  panel.id="traderDnaCaseDock";panel.hidden=true;
  panel.setAttribute("aria-label","Dossier DNA, lecture PAPER");
  const header=document.createElement("header");
  const title=document.createElement("strong");
  title.textContent="ERITH.IA · Dossier DNA · IA et humain · PAPER";
  const open=document.createElement("a");
  const caseUrl=new URL("./dna-case-study.html",document.baseURI).href;
  open.href=caseUrl;open.target="_blank";open.rel="noopener";
  open.textContent="Page dédiée ↗";
  const close=document.createElement("button");close.id="traderDnaCaseClose";close.type="button";close.textContent="Fermer";
  header.append(title,open,close);
  const content=document.createElement("iframe");content.id="traderDnaCaseFrame";
  content.title="Étude de cas DNA, observations Bitget Spot et laboratoire PAPER";
  content.loading="lazy";content.referrerPolicy="same-origin";
  panel.append(header,content);
  document.body.append(button,panel);
  let loaded=false;
  function setOpen(opened){
    panel.hidden=!opened;button.setAttribute("aria-expanded",String(opened));
    if(opened){if(!loaded){content.src=caseUrl;loaded=true;}close.focus();}
    else button.focus();
  }
  button.addEventListener("click",()=>setOpen(panel.hidden));
  close.addEventListener("click",()=>setOpen(false));
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!panel.hidden){event.preventDefault();setOpen(false);}
  });
}
mountDnaCaseStudyDock();

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