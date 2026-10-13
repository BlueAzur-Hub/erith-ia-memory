/* ERITH.IA — continuité CT, Trader uniquement.
 * Mémorise une identité de sélection, jamais des cours, des bougies ou des secrets.
 * Restaure les données depuis les propriétaires publics existants, sans ordre.
 */
(()=>{
  "use strict";
  if(document.documentElement?.dataset?.agentCryptoSurface!=="trader")return;
  if(globalThis.AgentCryptoTraderCtSelectionMemory)return;

  const KEY="agentCrypto.trader.selectedExternalAsset";
  const ID="concrete", PAIR="CT-USDT", PROVIDER="okx";
  const EVENT="agent-crypto:external-asset-changed";
  const owner=()=>globalThis.AgentCryptoNewListingsNativeCategory;
  const external=()=>globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||null;
  const microscope=()=>globalThis.AgentCryptoMarketMicroscope;
  let restoring=false,restored=false,lastError=null;
  let restoreAttempted=false;

  const isCt=ctx=>Boolean(ctx?.active&&ctx.id===ID
    &&ctx.provider===PROVIDER&&ctx.providerSymbol===PAIR
    &&ctx.base==="CT"&&ctx.quote==="USDT"&&ctx.nativeMarket===true);
  const validSaved=value=>Boolean(value&&value.id===ID
    &&value.provider===PROVIDER&&value.instrument===PAIR);
  function stored(){
    try{
      const raw=localStorage.getItem(KEY);
      const parsed=raw?JSON.parse(raw):null;
      return validSaved(parsed)?parsed:null;
    }catch(_){return null;}
  }
  function save(){
    try{
      localStorage.setItem(KEY,JSON.stringify({id:ID,provider:PROVIDER,instrument:PAIR,view:"candles"}));
      return true;
    }catch(_){lastError="Sauvegarde locale refusée par Firefox";return false;}
  }
  function clear(){
    try{localStorage.removeItem(KEY);}catch(_){}
  }
  function signal(message,error=false){
    let node=document.getElementById("traderCtRestoreState");
    if(!node){
      const host=document.querySelector("#analyste .chart-v2-control-deck")
        ||document.querySelector("#analyste .chart-v2-toolbar-reading");
      if(!host)return;
      node=document.createElement("span");
      node.id="traderCtRestoreState";
      node.setAttribute("role","status");
      node.setAttribute("aria-live","polite");
      node.style.cssText="display:inline-flex;align-items:center;max-width:240px;padding:4px 8px;margin-left:6px;border-radius:7px;border:1px solid #427b88;background:#092733;color:#b6eff3;font:600 11px/1.3 system-ui,sans-serif;white-space:normal";
      host.appendChild(node);
    }
    node.textContent=message;
    node.style.borderColor=error?"#cd8752":"#427b88";
    node.style.color=error?"#ffce98":"#b6eff3";
    node.hidden=!message;
  }
  function recordCurrent(){
    const ctx=external();
    if(isCt(ctx)){save();return;}
    if(!ctx?.active)clear();
    else clear(); // Switching to another new listing ends CT continuity.
  }
  function onContext(event){
    const reason=event?.detail?.reason;
    if(reason==="operator-return-market"){clear();return;}
    if(reason==="operator-load"){recordCurrent();}
  }
  window.addEventListener(EVENT,onContext,{passive:true});
  // Canonical exits clear the public external context and are observed above.
  // Do not write shared Interface storage or override its saved core universe.

  function loadedCandles(){
    const s=microscope()?.snapshot?.();
    return Boolean(s?.mode==="candles"&&s.loadedInstrument===PAIR
      &&Array.isArray(s.rows)&&s.rows.length>0&&!s.loading&&!s.error);
  }
  window.addEventListener("agent-crypto:candles-technical-levels",()=>{
    if(!isCt(external()))return;
    if(loadedCandles()){
      if(restoring){restoring=false;restored=true;lastError=null;}
      signal("");
    }
  },{passive:true});

  async function restore(){
    if(restoreAttempted||!stored())return false;
    if(document.visibilityState==="hidden")return false;
    restoreAttempted=true;
    const active=external();
    if(active?.active)return false; // Never overwrite another live operator selection.
    const api=owner();
    if(typeof api?.selectById!=="function"){lastError="Module Nouveaux listings indisponible";signal("CT · restauration impossible : module absent",true);return false;}
    restoring=true;
    signal("CT · restauration de la sélection…");
    let ok=false;
    try{ok=await api.selectById(ID);}
    catch(error){lastError=String(error?.message||error);}
    if(!ok){
      restoring=false;
      if(!lastError)lastError=api.snapshot?.()?.lastError||"source CT indisponible";
      signal("CT · restauration impossible : vérifier OKX et réessayer",true);
      return false;
    }
    if(!isCt(external())){
      restoring=false;lastError="Contexte CT non confirmé";
      signal("CT · vérification de la paire impossible",true);
      return false;
    }
    const chart=microscope();
    if(typeof chart?.setMode!=="function"){
      restoring=false;lastError="Moteur de bougies indisponible";
      signal("CT sélectionné · module Bougies indisponible",true);
      return false;
    }
    signal("CT · actualisation des bougies OKX…");
    chart.setMode("candles"); // Existing owner fetches fresh candles at saved interval.
    // One-shot verification, no repeating timer or stale-price display.
    setTimeout(()=>{
      if(!isCt(external())){restoring=false;signal("");return;}
      if(loadedCandles()){restoring=false;restored=true;lastError=null;signal("");return;}
      restoring=false;
      lastError=chart.snapshot?.()?.error||"bougies non chargées";
      signal("CT · bougies indisponibles, utiliser ↻",true);
    },16000);
    return true;
  }

  // If already selected on first load, seed the preference without changing the graph.
  if(isCt(external()))save();
  else if(stored())void restore();
  // On an initially backgrounded tab, resume once visible without a polling loop.
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible"&&!restoreAttempted&&stored())void restore();
  },{passive:true});

  globalThis.AgentCryptoTraderCtSelectionMemory=Object.freeze({
    snapshot:()=>Object.freeze({saved:!!stored(),restoring,restored,lastError,identity:stored()?.instrument||null}),
    restore,clear,read_only:true,real_orders:false,
    interface_unchanged:true,stores_identity_only:true
  });
})();