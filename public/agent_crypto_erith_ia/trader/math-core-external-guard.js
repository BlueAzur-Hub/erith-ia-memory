/* Trader-only Math Core venue identity guard.
   The Administrator's internal Math owner is bound to its canonical Market,
   while a Trader external asset (CT/Q) owns a separate chart. Never display
   the previous BTC score as if it described an external instrument. */
(() => {
  "use strict";
  const STYLE_ID="traderMathExternalStyle";
  const GUARD_ID="traderMathExternalGuard";
  const activeTrader=()=>document.documentElement?.dataset?.agentCryptoSurface==="trader";
  const math=()=>document.getElementById("math");
  const external=()=>{try{return globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||null;}catch(_){return null;}};
  const microscope=()=>{try{return globalThis.AgentCryptoMarketMicroscope?.snapshot?.()||null;}catch(_){return null;}};
  const number=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);
  function verifiedSeries(ctx){
    const snap=microscope(),pair=String(ctx.instrument||"").toUpperCase();
    if(!snap?.external||snap.loading||String(snap.loadedInstrument||"").toUpperCase()!==pair)return null;
    if(!Array.isArray(snap.rows))return null;
    const points=snap.rows.map(row=>[number(row?.t),number(row?.c)])
      .filter(row=>row[0]!==null&&row[0]>0&&row[1]!==null&&row[1]>0)
      .sort((a,b)=>a[0]-b[0]);
    if(points.length<21)return null;
    if(points.some((row,i)=>i>0&&row[0]<=points[i-1][0]))return null;
    const returns=[];
    for(let i=1;i<points.length;i++){
      const change=Math.log(points[i][1]/points[i-1][1]);
      if(!Number.isFinite(change))return null;
      returns.push(change);
    }
    const average=returns.reduce((a,b)=>a+b,0)/returns.length;
    const std=Math.sqrt(returns.reduce((s,v)=>s+(v-average)**2,0)/(returns.length-1));
    let peak=points[0][1],drawdown=0;
    for(const [,price] of points){peak=Math.max(peak,price);drawdown=Math.min(drawdown,(price/peak)-1);}
    return {points:points.length,volatility:std*Math.sqrt(returns.length)*100,
      drawdown:Math.abs(drawdown)*100,source:String(snap.source||"Bougies externes")};
  }
  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const node=document.createElement("style");node.id=STYLE_ID;
    node.textContent='html[data-agent-crypto-surface="trader"] #math.trader-math-external > :not(.atlas-math-dock-head):not(.atlas-math-rail-trigger):not(#traderMathExternalGuard){display:none!important}' +
      '#traderMathExternalGuard{padding:16px;border:1px solid rgba(118,216,236,.35);border-radius:12px;background:rgba(3,20,32,.8);color:#e9f7ff;line-height:1.65}' +
      '#traderMathExternalGuard strong{color:#8be9f6}' +
      '#math.trader-math-external #atlasMathRailScore{font-size:0!important}' +
      '#math.trader-math-external #atlasMathRailScore:after{content:attr(data-external-symbol);font-size:16px}';
    document.head.appendChild(node);
  }
  function ensureGuard(root){
    let node=document.getElementById(GUARD_ID);
    if(node)return node;
    node=document.createElement("section");node.id=GUARD_ID;
    node.setAttribute("role","status");
    node.setAttribute("aria-live","polite");
    root.appendChild(node);
    return node;
  }
  function render(){
    if(!activeTrader())return false;
    const root=math();if(!root)return false;
    const ctx=external();
    if(!ctx?.active||!ctx?.instrument||!ctx?.base){
      root.classList.remove("trader-math-external");
      delete root.dataset.mathExternalInstrument;
      const old=document.getElementById(GUARD_ID);if(old)old.hidden=true;
      const rail=document.getElementById("atlasMathRailScore");if(rail)delete rail.dataset.externalSymbol;
      return true;
    }
    ensureStyle();
    const node=ensureGuard(root);
    node.hidden=false;
    root.classList.add("trader-math-external");
    root.dataset.mathExternalInstrument=ctx.instrument;
    const rail=document.getElementById("atlasMathRailScore");if(rail)rail.dataset.externalSymbol=String(ctx.base).toUpperCase();
    const title=document.createElement("strong");
    title.textContent="Math Core · "+String(ctx.base).toUpperCase()+"/"+String(ctx.quote).toUpperCase();
    const detail=document.createElement("div");
    const m=verifiedSeries(ctx);
    detail.textContent=m
      ? String(m.points)+" bougies "+String(ctx.providerLabel||ctx.provider||"exchange")+
        " · volatilité de la fenêtre "+m.volatility.toFixed(2)+" %"+
        " · drawdown historique "+m.drawdown.toFixed(2)+" %. "+
        "Calcul descriptif partiel de "+String(ctx.instrument)+" ; pas de score de trading."
      : "Contexte externe "+String(ctx.instrument)+" · bougies de cette paire non vérifiées. "+
        "Mesures suspendues ; aucune statistique BTC substituée.";
    node.replaceChildren(title,detail);
    return true;
  }
  function queue(){
    queueMicrotask(()=>{if(typeof requestAnimationFrame==="function")requestAnimationFrame(render);else render();});
  }
  function start(){
    if(!activeTrader())return;
    const events=["agent-crypto:external-asset-changed","agent-crypto:trader-selection-changed",
      "agent-crypto:candles-technical-levels","agent-crypto:graph-context-ready",
      "agent-crypto:workspace-restored","agent-crypto:selected-market-changed","pageshow"];
    for(const event of events)window.addEventListener(event,queue,{passive:true});
    render();
  }
  globalThis.AgentCryptoTraderExternalMathGuard=Object.freeze({
    render,snapshot:()=>Object.freeze({active:!!math()?.classList?.contains("trader-math-external"),
      instrument:math()?.dataset?.mathExternalInstrument||null,read_only:true}),
    real_orders:false,recurring_timer:false,math_core_replaced:false
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
