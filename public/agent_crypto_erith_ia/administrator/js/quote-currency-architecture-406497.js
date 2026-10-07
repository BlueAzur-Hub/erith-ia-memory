/* Agent-Crypto — QUOTE CURRENCY ARCHITECTURE · DYNAMIC EXECUTION TRUTH
   Display currency remains an operator presentation choice.
   Execution instrument / settlement truth may be updated by the market instrument resolver.
   No recurring timer, MutationObserver, storage write, order, wallet or Strategy gate change. */
(()=>{
  "use strict";
  const BUILD="40.6.619";
  const ROOT_ID="atlasQuoteCurrencyArchitecture";
  const state={displayCurrency:"EUR",executionInstrument:"BTC-EUR",settlementAsset:"EUR",executionProvider:"legacy",executionAvailable:true};
  const validDisplay=new Set(["EUR","USD"]);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const snapshot=()=>Object.freeze({...state,build:BUILD,separation_locked:true});
  function emit(reason="operator"){
    try{window.dispatchEvent(new CustomEvent("agent-crypto:quote-architecture-changed",{detail:{...snapshot(),reason}}));}catch(_){}
  }
  function setDisplayCurrency(value,{reason="operator"}={}){
    const next=String(value||"").toUpperCase();
    if(!validDisplay.has(next))return false;
    if(state.displayCurrency===next){render();return true;}
    state.displayCurrency=next;render();emit(reason);return true;
  }
  function setExecutionInstrument(value,{reason="internal",emit:shouldEmit=true}={}){
    const next=String(value||"").trim().toUpperCase();
    if(!/^[A-Z0-9]+-[A-Z0-9]+$/.test(next))return false;
    const changed=state.executionInstrument!==next||state.executionAvailable!==true;
    state.executionInstrument=next;state.executionAvailable=true;render();if(changed&&shouldEmit)emit(reason);return true;
  }
  function setSettlementAsset(value,{reason="internal",emit:shouldEmit=true}={}){
    const next=String(value||"").trim().toUpperCase();
    if(!/^[A-Z0-9]{2,12}$/.test(next))return false;
    const changed=state.settlementAsset!==next||state.executionAvailable!==true;
    state.settlementAsset=next;state.executionAvailable=true;render();if(changed&&shouldEmit)emit(reason);return true;
  }
  function setExecutionTruth(value,{reason="internal",emit:shouldEmit=true}={}){
    const source=value&&typeof value==="object"?value:{};
    const before=JSON.stringify({i:state.executionInstrument,s:state.settlementAsset,p:state.executionProvider,a:state.executionAvailable});
    if(source.available===false){
      state.executionInstrument=null;state.settlementAsset=null;state.executionProvider=null;state.executionAvailable=false;
    }else{
      const instrument=String(source.instrument||"").trim().toUpperCase();
      const settlement=String(source.settlementAsset||source.quote||"").trim().toUpperCase();
      if(!/^[A-Z0-9]+-[A-Z0-9]+$/.test(instrument)||!/^[A-Z0-9]{2,12}$/.test(settlement))return false;
      state.executionInstrument=instrument;state.settlementAsset=settlement;state.executionProvider=String(source.provider||"").trim().toLowerCase()||null;state.executionAvailable=true;
    }
    const after=JSON.stringify({i:state.executionInstrument,s:state.settlementAsset,p:state.executionProvider,a:state.executionAvailable});
    render();if(before!==after&&shouldEmit)emit(reason);return true;
  }
  function style(){
    if(document.getElementById(ROOT_ID+"Style"))return;
    const s=document.createElement("style");s.id=ROOT_ID+"Style";
    s.textContent=`#${ROOT_ID}{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-left:5px;padding-left:7px;border-left:1px solid rgba(110,216,235,.16)}#${ROOT_ID}>small{font:900 7px/1 system-ui,sans-serif;letter-spacing:.12em;color:#7397a6}#${ROOT_ID} button{min-height:23px;padding:4px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.035);color:#b9ccd5;font:900 8px/1 system-ui,sans-serif;cursor:pointer}#${ROOT_ID} button.is-active{color:#07141a;background:#8fe9ef;border-color:#a9f8fa;box-shadow:0 0 10px rgba(100,225,238,.16)}#${ROOT_ID} .aqca-truth{color:#7f9ba7;font:800 7px/1.3 ui-monospace,monospace;white-space:nowrap}@media(max-width:900px){#${ROOT_ID} .aqca-truth{display:none}}`;
    document.head.appendChild(s);
  }
  function host(){return document.querySelector("#analyste .chart-v2-control-deck")||document.querySelector("#analyste .chart-v2-toolbar-reading");}
  function render(){
    if(typeof document==="undefined")return snapshot();
    const h=host();if(!h)return snapshot();style();
    let root=document.getElementById(ROOT_ID);
    if(!root){root=document.createElement("span");root.id=ROOT_ID;root.setAttribute("aria-label","Architecture devise d'affichage et exécution");h.appendChild(root);}
    const execLabel=state.executionAvailable&&state.executionInstrument?esc(state.executionInstrument):"INDISPONIBLE";
    const settleLabel=state.executionAvailable&&state.settlementAsset?esc(state.settlementAsset):"—";
    root.innerHTML=`<small>AFFICHAGE</small><button type="button" data-aqca="EUR" class="${state.displayCurrency==="EUR"?"is-active":""}" aria-pressed="${state.displayCurrency==="EUR"}">EUR</button><button type="button" data-aqca="USD" class="${state.displayCurrency==="USD"?"is-active":""}" aria-pressed="${state.displayCurrency==="USD"}">USD</button><span class="aqca-truth">DISPLAY ${esc(state.displayCurrency)} · EXEC ${execLabel} · SETTLE ${settleLabel}</span>`;
    root.querySelectorAll("[data-aqca]").forEach(b=>b.addEventListener("click",()=>setDisplayCurrency(b.dataset.aqca,{reason:"operator-ui"})));
    root.dataset.build=BUILD;root.dataset.executionInstrument=state.executionInstrument||"";root.dataset.settlementAsset=state.settlementAsset||"";root.dataset.executionProvider=state.executionProvider||"";root.dataset.executionAvailable=String(state.executionAvailable);
    return snapshot();
  }
  function selfTest(){
    const before={...state};
    setDisplayCurrency("USD",{reason:"self-test"});
    const separated=state.displayCurrency==="USD"&&state.executionInstrument===before.executionInstrument&&state.settlementAsset===before.settlementAsset;
    setExecutionTruth({available:true,instrument:"OKB-USDC",settlementAsset:"USDC",provider:"okx"},{reason:"self-test",emit:false});
    const dynamic=state.executionInstrument==="OKB-USDC"&&state.settlementAsset==="USDC"&&state.executionProvider==="okx"&&state.executionAvailable===true;
    setExecutionTruth({available:false,asset:"BTW"},{reason:"self-test",emit:false});
    const unavailable=state.executionAvailable===false&&state.executionInstrument===null&&state.settlementAsset===null;
    Object.assign(state,before);render();
    return Object.freeze({build:BUILD,pass:separated&&dynamic&&unavailable,checks:{display_changes_without_execution_mutation:separated,dynamic_execution_truth:dynamic,unavailable_execution_truth:unavailable,no_persistent_storage:true,no_order:true}});
  }
  globalThis.AgentCryptoQuoteCurrencyArchitecture=Object.freeze({build:BUILD,snapshot,render,setDisplayCurrency,setExecutionInstrument,setSettlementAsset,setExecutionTruth,self_test:selfTest,display_only:true,execution_truth_dynamic:true,execution_mutation_from_display:false,storage_write:false,recurring_timer:false,mutation_observer:false,real_order:false,wallet:false,market_core_changed:false,strategy_changed:false});
  if(typeof document!=="undefined"){
    const mount=()=>{try{render();}catch(_){}};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
    window.addEventListener("pageshow",mount,{passive:true});
  }
})();