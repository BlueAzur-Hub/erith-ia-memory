/* Agent-Crypto @erith.IA — Operator bridge
   Build 40.6.424 · SINGLE PHASE OWNER COMPATIBILITY.
   Manual native-menu requests are delegated to the canonical Aether phase state machine.
   This bridge no longer writes animation/opacity/visibility/pointer-events and never forces layout
   to restart phase clocks. Cold-boot warm start remains a one-shot reuse of the canonical Livecheck button. */
(() => {
  "use strict";
  const BUILD = "40.6.424";
  const HOLD_KEY = "aetherManualNative406424";
  const BOOT_KEY = "aetherColdBoot";

  function text406424(id){return String(document.getElementById(id)?.textContent||"").replace(/\s+/g," ").trim();}
  function phaseApi(){return globalThis.ErithAether||globalThis.AgentCryptoAether||null;}

  function holdNative406424(reason="operator-bridge"){
    const bar=document.getElementById("livecheck");if(!bar)return false;
    const api=phaseApi();
    try{
      if(typeof api?.phase_hold_native==="function")api.phase_hold_native(reason);
      else window.dispatchEvent(new CustomEvent("erith:aether-native-hold",{detail:{reason}}));
    }catch(_){try{window.dispatchEvent(new CustomEvent("erith:aether-native-hold",{detail:{reason}}));}catch(__){}}
    bar.dataset[HOLD_KEY]="native";
    return true;
  }

  function releaseNative406424(reason="operator-bridge"){
    const bar=document.getElementById("livecheck");if(!bar)return false;
    const api=phaseApi();
    try{
      if(typeof api?.phase_resume_automatic==="function")api.phase_resume_automatic(reason);
      else window.dispatchEvent(new CustomEvent("erith:aether-native-resume",{detail:{reason}}));
    }catch(_){try{window.dispatchEvent(new CustomEvent("erith:aether-native-resume",{detail:{reason}}));}catch(__){}}
    delete bar.dataset[HOLD_KEY];
    return true;
  }

  function bindVeilleEscape(){
    const feed=document.getElementById("atlasAetherVeille");
    const brand=feed?.querySelector(".atlas-aether-veille-brand");
    if(!feed||!brand||brand.dataset.aetherNativeBound==="1")return false;
    brand.dataset.aetherNativeBound="1";
    brand.setAttribute("role","button");brand.setAttribute("tabindex","0");
    brand.setAttribute("aria-label","Revenir au menu normal");brand.setAttribute("title","Revenir au menu normal");
    brand.style.setProperty("pointer-events","auto","important");brand.style.cursor="pointer";
    const escape=event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();holdNative406424("veille-brand");};
    brand.addEventListener("click",escape,true);
    brand.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" ")escape(event);},true);
    const toggle=document.getElementById("atlasAetherStatusToggle");
    if(toggle&&toggle.dataset.aetherResumeBound!=="1"){
      toggle.dataset.aetherResumeBound="1";
      toggle.addEventListener("click",()=>{if(document.getElementById("livecheck")?.dataset?.[HOLD_KEY]==="native")releaseNative406424("aether-toggle");},true);
    }
    return true;
  }

  function isColdBootEmpty(){
    const live=text406424("liveStatus"),decision=text406424("tableDecision"),source=text406424("sourceName");
    const chart=text406424("chartStatus")||text406424("analysisSummary");
    const explicitEmpty=/livecheck requis/i.test(live)||/refus[eé] avant livecheck/i.test(decision)||/aucune source consult[eé]e/i.test(source);
    const alreadyWarm=/livecheck ok|binance|coingecko|kraken|websocket|5\/5/i.test(`${live} ${decision} ${source} ${chart}`)&&!/aucune source consult[eé]e/i.test(source);
    return explicitEmpty&&!alreadyWarm;
  }

  function warmColdBootOnce406424(){
    const bar=document.getElementById("livecheck"),button=document.getElementById("btnLivecheck");
    if(!bar||!button||document.hidden||bar.dataset[BOOT_KEY]==="attempted"||!isColdBootEmpty())return false;
    bar.dataset[BOOT_KEY]="attempted";button.dataset.aetherColdBoot="1";button.click();return true;
  }

  function bind406424(){bindVeilleEscape();requestAnimationFrame(()=>requestAnimationFrame(()=>warmColdBootOnce406424()));return true;}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind406424,{once:true});else bind406424();

  globalThis.ErithAetherOperatorBridge=Object.freeze({
    build:BUILD,holdNative:holdNative406424,releaseNative:releaseNative406424,warmColdBootOnce:warmColdBootOnce406424,
    canonical_phase_owner:"aether.js 40.6.424",direct_visibility_write:false,forced_animation_restart:false,
    cold_boot_attempts_max:1,veille_escape_persistent_until_resume_or_reload:true,recurring_timer:false,observer:false,
    fetch_owner:false,storage_write:false,trading_state_write:false,market_algorithm_changed:false
  });
})();
