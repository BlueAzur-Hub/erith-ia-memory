/*
  Agent-Crypto Administrator — TRADUS Autonomous Shadow Refresh
  Build: 40.6.119
  Parent: 40.6.118
  Responsibility: refresh the existing TRADUS shadow lane without operator clicks.

  Compatibility routes:
  - 40.6.120+ Strategy A Auto continuity chain.
  - 40.6.123+ canonical Strategy A reader is required before autonomous TRADUS
    captures can resume, so the ledger cannot receive a stale INCONNU row first.
*/
(() => {
  "use strict";
  const BUILD="40.6.119",INTERVAL_MS=60_000,START_DELAY_MS=1_500,RETRY_MS=2_000,API_KEY="AgentCryptoTradusAutonomousRefresh406119",PANEL_ID="tradusShadow406066";
  if(globalThis[API_KEY])return;
  let timer=null,running=false,cycles=0,lastAt=null,lastTrigger=null,lastError=null;
  const shadow=()=>globalThis.AgentCryptoTradusShadow406066||null;
  const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};
  function runtimeBuild(){const fromTruth=String(globalThis.ErithVersionTruth?.build||"").trim();if(fromTruth)return fromTruth;return String(document.querySelector('meta[name="administrator-build"]')?.content||"0.0.0").trim();}
  function runtimeAtLeast(target){const parts=v=>String(v||"").split(".").map(x=>Number.parseInt(x,10)||0),A=parts(runtimeBuild()),B=parts(target),n=Math.max(A.length,B.length);for(let i=0;i<n;i+=1){const d=(A[i]||0)-(B[i]||0);if(d)return d>0;}return true;}
  function ensure120(){if(!runtimeAtLeast("40.6.120"))return false;if(globalThis.AgentCryptoStrategyAAutoSessionContinuity406120)return true;if(document.querySelector('script[data-strategy-a-auto-session-continuity-406120="true"]'))return true;const script=document.createElement("script");script.src=`./js/strategy-a-auto-session-continuity-406120.js?v=${encodeURIComponent(runtimeBuild())}`;script.async=false;script.dataset.strategyAAutoSessionContinuity406120="true";document.head.appendChild(script);return true;}
  function ensure123(){if(!runtimeAtLeast("40.6.123"))return true;const api=globalThis.AgentCryptoTradusCanonicalStrategyReader406123;if(api?.ready?.()===true)return true;const existing=document.querySelector('script[data-tradus-canonical-strategy-reader-406123="true"]');if(existing)return false;const script=document.createElement("script");script.src=`./js/tradus-canonical-strategy-reader-406123.js?v=${encodeURIComponent(runtimeBuild())}`;script.async=false;script.dataset.tradusCanonicalStrategyReader406123="true";document.head.appendChild(script);return false;}
  function clearTimer(){if(timer!==null)clearTimeout(timer);timer=null;}
  function syncVisibleContract(){if(typeof document==="undefined")return false;const panel=document.getElementById(PANEL_ID);if(!panel)return false;panel.dataset.autonomousRefresh=BUILD;panel.dataset.autonomousRefreshInterval=String(INTERVAL_MS);const foot=panel.querySelector(".ts-foot");if(foot)foot.textContent="SHADOW ONLY · AUTO 60 S ACTIF PAGE VISIBLE · aucun ordre · aucune clé · aucun wallet · aucune mutation Strategy A · signal comparatif uniquement.";return true;}
  function schedule(delay=INTERVAL_MS){clearTimer();if(!running||typeof document==="undefined"||document.hidden)return false;timer=setTimeout(()=>{void cycle("autonomous_60s");},Math.max(250,Number(delay)||INTERVAL_MS));return true;}
  async function cycle(trigger="autonomous_60s"){if(!running||typeof document==="undefined"||document.hidden)return false;if(!ensure123()){lastError="TRADUS_406123_CANONICAL_READER_LOADING";schedule(RETRY_MS);return false;}const owner=shadow();if(!owner||typeof owner.refresh!=="function"){lastError="TRADUS_OWNER_UNAVAILABLE";schedule(RETRY_MS);return false;}try{owner.mount?.();}catch(_){}syncVisibleContract();try{await owner.refresh(trigger);cycles+=1;lastAt=new Date().toISOString();lastTrigger=trigger;lastError=null;syncVisibleContract();try{document.dispatchEvent(new CustomEvent("agentcrypto:tradus-autonomous-refresh",{detail:{build:BUILD,cycles,at:lastAt,trigger}}));}catch(_){}return true;}catch(error){lastError=String(error?.message||error||"TRADUS_REFRESH_FAILED");return false;}finally{schedule(INTERVAL_MS);}}
  function start(source="start"){if(running){syncVisibleContract();return false;}running=true;lastTrigger=source;ensure123();syncVisibleContract();schedule(START_DELAY_MS);return true;}
  function stop(source="stop"){running=false;lastTrigger=source;clearTimer();return true;}
  function status(){return clone({build:BUILD,running,page_visible:typeof document!=="undefined"?!document.hidden:false,interval_ms:INTERVAL_MS,cycles,last_at:lastAt,last_trigger:lastTrigger,last_error:lastError,owner_available:!!shadow(),canonical_reader_406123_ready:!runtimeAtLeast("40.6.123")||globalThis.AgentCryptoTradusCanonicalStrategyReader406123?.ready?.()===true,visible_contract_synced:syncVisibleContract(),paper_only:true,shadow_only:true,real_orders:false,credentials:false,wallet:false,strategy_a_mutated:false,storage_write:false,recurring_timer:true});}
  globalThis[API_KEY]=Object.freeze({build:BUILD,interval_ms:INTERVAL_MS,start,stop,run_once:()=>cycle("explicit_run_once"),status,sync_visible_contract:syncVisibleContract,ensure_canonical_reader_406123:ensure123,paper_only:true,shadow_only:true,real_orders:false,credentials:false,wallet:false,strategy_a_mutated:false,storage_write:false,recurring_timer:true});
  if(typeof document!=="undefined"){ensure120();ensure123();document.addEventListener("visibilitychange",()=>{if(document.hidden)clearTimer();else if(running){ensure123();syncVisibleContract();schedule(250);}},{passive:true});document.addEventListener("agentcrypto:tradus-shadow-observation",syncVisibleContract,{passive:true});window.addEventListener("pagehide",()=>stop("pagehide"),{passive:true});window.addEventListener("pageshow",()=>{ensure120();ensure123();start("pageshow");},{passive:true});const boot=()=>{ensure120();ensure123();start("boot");};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();}
})();
