/* Agent-Crypto 40.6.561 — Trading Desk read-only foundation. No network/order/storage owner. */
(()=>{
  "use strict";
  const BUILD="40.6.561";
  const state={pair:"BTC-USDC",marketType:"SPOT",readOnly:true,marketOpen:false};
  const formatPair=pair=>String(pair||"BTC-USDC").replace("-","/");
  function sync(){
    document.documentElement.dataset.tradingDeskPair=state.pair;
    document.querySelectorAll("[data-pair-truth]").forEach(el=>el.textContent=formatPair(state.pair));
    document.querySelectorAll("[data-panel-pair]").forEach(el=>el.textContent=`${formatPair(state.pair)} · ${state.marketType}`);
    document.querySelectorAll("[data-pair]").forEach(btn=>btn.classList.toggle("is-active",btn.dataset.pair===state.pair));
    const market=document.getElementById("deskMarket"),toggle=document.querySelector("[data-market-toggle]");
    market?.classList.toggle("is-open",state.marketOpen);
    toggle?.setAttribute("aria-expanded",state.marketOpen?"true":"false");
  }
  function selectPair(pair){
    if(!/^[A-Z0-9]+-USDC$/.test(String(pair||"")))return false;
    state.pair=String(pair);state.marketOpen=false;sync();return true;
  }
  function mount(){
    document.querySelectorAll("[data-pair]").forEach(btn=>btn.addEventListener("click",()=>selectPair(btn.dataset.pair)));
    document.querySelector("[data-market-toggle]")?.addEventListener("click",()=>{state.marketOpen=!state.marketOpen;sync();});
    sync();return true;
  }
  function selfTest(){
    const pass=BUILD==="40.6.561"&&state.pair==="BTC-USDC"&&state.marketType==="SPOT"&&state.readOnly===true;
    return Object.freeze({build:BUILD,pass,checks:{default_pair:state.pair==="BTC-USDC",spot_default:state.marketType==="SPOT",read_only:state.readOnly===true,no_network:true,no_order:true,no_storage:true,single_pair_truth:true}});
  }
  globalThis.AgentCryptoTradingDeskFoundation=Object.freeze({build:BUILD,mount,selectPair,snapshot:()=>Object.freeze({...state}),self_test:selfTest,read_only:true,network:false,storage_write:false,real_order:false,simulated_order:false});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
