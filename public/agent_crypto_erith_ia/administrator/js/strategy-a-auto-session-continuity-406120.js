/*
  Agent-Crypto Administrator — Strategy A Auto session continuity
  Build: 40.6.120
  Parent: 40.6.119

  Compatibility routing:
  - runtime 40.6.121+ loads the v2 continuity owner, which defaults PAPER Auto A
    to running while preserving an explicit STOP for the browser session.
*/
(() => {
  "use strict";
  const BUILD = "40.6.120";
  const API_KEY = "AgentCryptoStrategyAAutoSessionContinuity406120";
  const SESSION_KEY = "agent_crypto_strategy_a_auto_optin_v1";
  if (globalThis[API_KEY]) return;
  let restoring = false;
  let restoredThisDocument = false;
  let lastRestore = "never";
  const norm = value => String(value || "").replace(/\s+/g, " ").trim().toUpperCase();
  function runtimeBuild() {
    const fromTruth = String(globalThis.ErithVersionTruth?.build || "").trim();
    if (fromTruth) return fromTruth;
    return String(document.querySelector('meta[name="administrator-build"]')?.content || "0.0.0").trim();
  }
  function runtimeAtLeast(target) {
    const parts = value => String(value || "").split(".").map(x => Number.parseInt(x, 10) || 0);
    const A = parts(runtimeBuild()), B = parts(target), n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i += 1) { const d = (A[i] || 0) - (B[i] || 0); if (d) return d > 0; }
    return true;
  }
  function ensureSuccessor406121() {
    if (!runtimeAtLeast("40.6.121")) return false;
    if (globalThis.AgentCryptoStrategyAAutoSessionContinuity406121) return true;
    if (document.querySelector('script[data-strategy-a-auto-session-continuity-406121="true"]')) return true;
    const script = document.createElement("script");
    script.src = `./js/strategy-a-auto-session-continuity-406121.js?v=${encodeURIComponent(runtimeBuild())}`;
    script.async = false;
    script.dataset.strategyAAutoSessionContinuity406121 = "true";
    document.head.appendChild(script);
    return true;
  }
  function optedIn() { try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (_) { return false; } }
  function setOptIn(enabled) { try { if (enabled) sessionStorage.setItem(SESSION_KEY,"1"); else sessionStorage.removeItem(SESSION_KEY); return true; } catch (_) { return false; } }
  const buttons = () => Array.from(document.querySelectorAll('button,[role="button"]'));
  const activateButton = () => buttons().find(node => norm(node.textContent) === "ACTIVER AUTO A") || null;
  function strategyPanel(activate = activateButton()) {
    if (!(activate instanceof Element)) return null;
    let node = activate.parentElement;
    while (node && node !== document.body) {
      const text = norm(node.textContent);
      if (text.includes("STRATÉGIE A") && text.includes("PAPER AUTOMATIQUE") && text.includes("PILOTE DE SIMULATION")) return node;
      node = node.parentElement;
    }
    return activate.closest("section,article") || activate.parentElement;
  }
  function state() { const activate=activateButton(), panel=strategyPanel(activate), text=norm(panel?.textContent); return {activate,panel,active:text.includes("AUTO A ACTIF")||(text.includes("PILOTE PAPER ACTIF")&&!text.includes("PILOTE PAPER INACTIF"))}; }
  function restore(reason="runtime") {
    if (restoring || restoredThisDocument || !optedIn() || document.hidden) return false;
    const current=state(); if(!current.activate){lastRestore=`waiting:${reason}`;return false;} if(current.active){restoredThisDocument=true;lastRestore=`already-active:${reason}`;return true;}
    restoring=true; try{lastRestore=`activate-existing-runner:${reason}`;current.activate.click();restoredThisDocument=true;return true;}catch(error){lastRestore=`error:${reason}:${String(error?.message||error)}`;return false;}finally{queueMicrotask(()=>{restoring=false;});}
  }
  function captureOptIn(event){const element=event.target instanceof Element?event.target.closest('button,[role="button"]'):null;if(!element)return;const label=norm(element.textContent);if(label==="ACTIVER AUTO A"){setOptIn(true);restoredThisDocument=true;lastRestore="operator-enabled";return;}if(label!=="STOP")return;const current=state();if(current.panel&&current.panel.contains(element)){setOptIn(false);restoredThisDocument=false;lastRestore="operator-stop";}}
  function scheduleRestore(reason){const run=()=>{try{requestAnimationFrame(()=>requestAnimationFrame(()=>restore(reason)));}catch(_){queueMicrotask(()=>restore(reason));}};run();}
  document.addEventListener("click",captureOptIn,true); ensureSuccessor406121();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{ensureSuccessor406121();scheduleRestore("dom-ready");},{once:true});else scheduleRestore("boot");
  window.addEventListener("load",()=>{ensureSuccessor406121();scheduleRestore("load");},{once:true,passive:true});
  window.addEventListener("pageshow",()=>{ensureSuccessor406121();scheduleRestore("pageshow");},{passive:true});
  window.addEventListener("erith:system-hydrated",()=>{ensureSuccessor406121();scheduleRestore("system-hydrated");},{passive:true});
  globalThis[API_KEY]=Object.freeze({build:BUILD,storage:"sessionStorage",key:SESSION_KEY,opted_in:optedIn,restore,clear:()=>setOptIn(false),ensure_successor_406121:ensureSuccessor406121,snapshot:()=>Object.freeze({build:BUILD,opted_in:optedIn(),active:state().active,restored_this_document:restoredThisDocument,last_restore:lastRestore,successor_406121_loaded:!!globalThis.AgentCryptoStrategyAAutoSessionContinuity406121}),contract:Object.freeze({paper_only:true,reuses_existing_runner:true,new_recurring_timer:false,new_market_fetch:false,real_order:false,wallet:false,credentials:false,local_storage_write:false,session_storage_write:true})});
})();
