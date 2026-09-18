/* Agent-Crypto @erith.IA — 40.6.244
   ANALYSE & DECISION CURRENT-TRUTH RECOVERY

   Restores event-driven refresh between the already-live News Sentinel owner and
   the existing analysis/decision presentation consumers.
   No new data source, polling timer, observer, storage owner, model or order.
*/
(() => {
  "use strict";

  const BUILD="40.6.244";
  const RECOVERY_EVENT="agentcrypto:analysis-current-truth-updated";
  const DETAILS=Object.freeze([
    "news-sentinel",
    "news-market-explanation",
    "decisionIntelligenceCurrentTruthDetails406243"
  ]);
  let wrappedNewsLoad=false;
  let wrappedNewsSelect=false;
  let refreshCount=0;
  let lastEventId=null;

  function sourceSnapshot(){
    try{return globalThis.AgentCryptoNewsEventSource?.snapshot?.()||null;}
    catch(_){return null;}
  }

  function currentEvent(){
    const source=sourceSnapshot();
    return source?.current||null;
  }

  function eventId(event){
    return String(event?.event_id||event?.id||event?.fingerprint||"").trim()||null;
  }

  function refresh(reason="recovery"){
    const event=currentEvent();
    const id=eventId(event);
    try{
      if(event&&typeof globalThis.renderNewsSentinel==="function"){
        globalThis.renderNewsSentinel(event);
      }
    }catch(error){console.warn("[40.6.244] News Sentinel refresh",error);}
    try{
      if(event&&typeof globalThis.renderNewsMarketOperatorIntelligence==="function"){
        globalThis.renderNewsMarketOperatorIntelligence(event);
      }
    }catch(error){console.warn("[40.6.244] News→Market refresh",error);}
    try{globalThis.AgentCryptoDecisionIntelligenceCurrentTruth406243?.refresh?.();}
    catch(error){console.warn("[40.6.244] Decision Intelligence refresh",error);}

    refreshCount+=1;
    lastEventId=id;
    const detail=Object.freeze({
      build:BUILD,reason,event_id:id,news_status:sourceSnapshot()?.status||"unknown",
      refresh_count:refreshCount
    });
    try{document.dispatchEvent(new CustomEvent(RECOVERY_EVENT,{detail}));}catch(_){}
    return detail;
  }

  function settle(reason){
    queueMicrotask(()=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>refresh(reason)));
    });
  }

  function wrapNewsLoad(){
    if(wrappedNewsLoad)return true;
    const base=globalThis.loadNewsLiveFeed;
    if(typeof base!=="function")return false;
    if(base.__agentCryptoAnalysisRecovery406244===true){wrappedNewsLoad=true;return true;}
    const wrapped=async function loadNewsLiveFeed406244(...args){
      const result=await base.apply(this,args);
      settle("news-feed-complete");
      return result;
    };
    try{Object.defineProperty(wrapped,"__agentCryptoAnalysisRecovery406244",{value:true});}catch(_){}
    globalThis.loadNewsLiveFeed=wrapped;
    wrappedNewsLoad=true;
    return true;
  }

  function wrapNewsSelect(){
    if(wrappedNewsSelect)return true;
    const base=globalThis.newsSelectLiveEvent;
    if(typeof base!=="function")return false;
    if(base.__agentCryptoAnalysisRecovery406244===true){wrappedNewsSelect=true;return true;}
    const wrapped=function newsSelectLiveEvent406244(...args){
      const result=base.apply(this,args);
      settle("news-selection");
      return result;
    };
    try{Object.defineProperty(wrapped,"__agentCryptoAnalysisRecovery406244",{value:true});}catch(_){}
    globalThis.newsSelectLiveEvent=wrapped;
    wrappedNewsSelect=true;
    return true;
  }

  function bindDetail(id){
    const node=document.getElementById(id);
    if(!(node instanceof HTMLDetailsElement)||node.dataset.analysisRecovery406244==="1")return false;
    node.dataset.analysisRecovery406244="1";
    node.addEventListener("toggle",()=>{
      if(node.open)settle(`open:${id}`);
    });
    node.addEventListener("erith:presentation-resident",()=>{
      if(node.open)settle(`resident:${id}`);
    });
    return true;
  }

  function bind(){
    wrapNewsLoad();
    wrapNewsSelect();
    DETAILS.forEach(bindDetail);
    settle("boot-settle");
    return true;
  }

  globalThis.AgentCryptoAnalysisFamilyRecovery406244=Object.freeze({
    build:BUILD,bind,refresh,snapshot:()=>Object.freeze({
      build:BUILD,wrapped_news_load:wrappedNewsLoad,wrapped_news_select:wrappedNewsSelect,
      refresh_count:refreshCount,last_event_id:lastEventId,
      current_event_id:eventId(currentEvent()),
      new_fetch:false,new_timer:false,new_observer:false,new_storage_owner:false,
      model_changed:false,market_core_changed:false,strategy_a_changed:false,
      automatic_order:false
    })
  });

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
})();