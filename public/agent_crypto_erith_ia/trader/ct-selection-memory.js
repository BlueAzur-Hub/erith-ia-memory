/* ERITH.IA — CT external-selection continuity, Trader presentation only.
 * Same canonical line graph (AtlasExternalChart), same New Listings owner.
 * Persist only identity + intended public view, NEVER quote, candles or account data.
 * The public Interface, Graph Context V7, A/B/C and Market Core are unchanged.
 */
(()=>{
"use strict";
if(document.documentElement?.dataset?.agentCryptoSurface!=="trader")return;
if(globalThis.AgentCryptoTraderCtSelectionMemory)return;

const KEY="agentCrypto.trader.selectedExternalAsset";
const ID="concrete", PAIR="CT-USDT", PROVIDER="okx";
const CONTEXT_EVENT="agent-crypto:external-asset-changed";
const owner=()=>globalThis.AgentCryptoNewListingsNativeCategory;
const external=()=>globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||null;
const lineOwner=()=>globalThis.AtlasExternalChart;
const stage=()=>document.documentElement?.dataset?.atlasGraphBootPhase;
let restoring=false,restored=false,attempted=false,lastError=null,bootWait=null;
let activeLabel=false,watcher=null,originalLabels=null;

const isCt=ctx=>Boolean(ctx?.active&&ctx.id===ID&&ctx.provider===PROVIDER
  &&ctx.providerSymbol===PAIR&&ctx.base==="CT"&&ctx.quote==="USDT"
  &&ctx.nativeMarket===true);
const validated=value=>Boolean(value&&value.id===ID&&value.provider===PROVIDER
  &&value.instrument===PAIR);
function stored(){
  try{const obj=JSON.parse(localStorage.getItem(KEY)||"null");return validated(obj)?obj:null;}
  catch(_){return null;}
}
function save(){
  try{
    localStorage.setItem(KEY,JSON.stringify({
      id:ID,provider:PROVIDER,instrument:PAIR,view:"line",periodDays:1
    }));
    lastError=null;return true;
  }catch(_){lastError="stockage local indisponible";return false;}
}
function clear(){try{localStorage.removeItem(KEY);}catch(_){}}
function isLine(){
  const x=lineOwner()?.state?.()||{};
  return Boolean(isCt(external())&&x.active&&x.coin_id===ID
    &&Number(x.period)===1&&!x.loading&&!x.error);
}
function indication(message,bad=false){
  let el=document.getElementById("traderCtRestoreState");
  if(!el){
    const host=document.querySelector("#analyste .chart-v2-control-deck")
      ||document.querySelector("#analyste .chart-v2-toolbar-reading");
    if(!host)return;
    el=document.createElement("span");el.id="traderCtRestoreState";
    el.setAttribute("role","status");el.setAttribute("aria-live","polite");
    el.style.cssText="display:inline-flex;align-items:center;max-width:240px;padding:4px 8px;margin-left:6px;border-radius:7px;border:1px solid #427b88;background:#092733;color:#b6eff3;font:600 11px/1.3 system-ui,sans-serif";
    host.appendChild(el);
  }
  el.textContent=message;el.hidden=!message;
  el.style.color=bad?"#ffce98":"#b6eff3";
  el.style.borderColor=bad?"#cd8752":"#427b88";
}
/* "Sélection vide" is the separate Top 250 / Graph Context V7 selection.
 * When the true external line owner displays CT, present that truth in the
 * existing strip, without writing V7 or pretending CT belongs to the Top 250.
 * The original canonical strip is retained and restored on external exit.
 */
function labelNodes(){
  return {
    main:document.getElementById("atlasWorkspaceReprisePrimary"),
    sub:document.getElementById("atlasWorkspaceRepriseSecondary")
  };
}
function showExternalLabel(){
  const {main,sub}=labelNodes();
  if(!main||!sub||!isLine())return;
  if(!originalLabels)originalLabels={main:main.textContent,sub:sub.textContent};
  const title="CT · Concrete · 24h · Prix USD · Ligne · Externe (hors Top 250)";
  const subtitle="Sélection CT mémorisée dans le Trader · OKX CT/USDT · données réelles rechargées · contexte V7 Top 250 séparé · A/B/C inchangés";
  if(main.textContent!==title){
    if(activeLabel)originalLabels.main=main.textContent;
    main.textContent=title;
  }
  if(sub.textContent!==subtitle){
    if(activeLabel)originalLabels.sub=sub.textContent;
    sub.textContent=subtitle;
  }
  activeLabel=true;
}
function unmountLabel(){
  watcher?.disconnect();watcher=null;
  if(activeLabel&&originalLabels){
    const {main,sub}=labelNodes();
    if(main)main.textContent=originalLabels.main;
    if(sub)sub.textContent=originalLabels.sub;
  }
  activeLabel=false;originalLabels=null;
}
function mountLabel(){
  if(!isLine()){unmountLabel();return;}
  showExternalLabel();
  if(watcher)return;
  const {main,sub}=labelNodes();
  if(!main||!sub)return;
  watcher=new MutationObserver(()=>{if(isLine())showExternalLabel();else unmountLabel();});
  watcher.observe(main,{childList:true,characterData:true,subtree:true});
  watcher.observe(sub,{childList:true,characterData:true,subtree:true});
}
function onContext(event){
  const reason=event?.detail?.reason;
  if(reason==="operator-return-market"){
    clear();unmountLabel();indication("");return;
  }
  if(reason!=="operator-load")return;
  if(isCt(external())){
    save();
    // The native new-listing owner later publishes the line; do not force candles.
    queueMicrotask(mountLabel);
  }else{clear();unmountLabel();}
}
window.addEventListener(CONTEXT_EVENT,onContext,{passive:true});
window.addEventListener("agent-crypto:new-listing-line-ready",event=>{
  if(event?.detail?.id!==ID||!isLine())return;
  if(stored())save();
  if(restoring){restored=true;lastError=null;}
  mountLabel();indication("");
},{passive:true});
document.addEventListener("click",event=>{
  if(!isCt(external()))return;
  if(event.target?.closest?.("[data-chart-view],[data-chart-scale],[data-chart-display],.period-btn[data-period]")){
    requestAnimationFrame(mountLabel);
  }
},{passive:true});

async function restore(){
  if(attempted||!stored()||document.visibilityState==="hidden")return false;
  if(!["ready","error"].includes(stage()))return false; // Wait for canonical V7 boot barrier, even in explicit storage-error state.
  if(external()?.active){attempted=true;return false;} // Never override active intent.
  const api=owner();
  if(typeof api?.selectById!=="function"||typeof lineOwner()?.present!=="function")return false;
  attempted=true;restoring=true;lastError=null;
  indication("CT · restauration du graphique Ligne 24h…");
  let ok=false;
  try{ok=await api.selectById(ID);}catch(error){lastError=String(error?.message||error);}
  restoring=false;
  if(!ok||!isLine()){
    if(!lastError)lastError=api.snapshot?.()?.lastError||"graphique Ligne CT indisponible";
    indication("CT · graphique Ligne indisponible : vérifier OKX",true);
    return false;
  }
  save();restored=true;mountLabel();indication("");
  return true;
}
function boot(){
  if(isCt(external())){
    save();mountLabel();return;
  }
  if(!stored())return;
  if(document.visibilityState!=="visible")return;
  if(["ready","error"].includes(stage()))void restore();
  else waitForCanonicalBoot();
}
function waitForCanonicalBoot(){
  if(bootWait||attempted||!stored())return;
  // Only observe the canonical boot gate, disconnect as soon as it becomes ready.
  bootWait=new MutationObserver(()=>{
    if(!["ready","error"].includes(stage()))return;
    bootWait?.disconnect();bootWait=null;
    if(document.visibilityState==="visible")void restore();
  });
  bootWait.observe(document.documentElement,{attributes:true,attributeFilter:["data-atlas-graph-boot-phase"]});
  if(["ready","error"].includes(stage())){
    bootWait.disconnect();bootWait=null;void restore();
  }
}
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible")boot();
},{passive:true});
window.addEventListener("pageshow",boot,{passive:true});
boot();

globalThis.AgentCryptoTraderCtSelectionMemory=Object.freeze({
 snapshot:()=>Object.freeze({
  selected:isCt(external()),saved:!!stored(),restoring,restored,
  view:"line",lineReady:isLine(),labelActive:activeLabel,
  lastError,identity:stored()?.instrument||null
 }),
 restore,clear,read_only:true,real_orders:false,
 interface_unchanged:true,stores_identity_only:true,
 canonical_line_owner:true,canonical_workspace_top250_untouched:true
});
})();