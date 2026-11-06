/* ERITH.IA — V6 instant OKX order-book PAPER execution estimate.
 * Uses the already validated public book snapshot. No new request, order, key or Bridge write.
 * This is a present-time liquidity estimate, NEVER a historical backtest.
 */
(function orderBookPaperV6(){
  "use strict";
  if(globalThis.ErithMarketBookPaperV6)return;
  const ID="erithBookPaperV6",FRESH_MS=15000,FUTURE_MS=5000;
  const fail=(code,message)=>Object.freeze({ok:false,code,message,read_only:true,orders:0});
  const finite=v=>typeof v==="number"&&Number.isFinite(v);
  function validRows(rows,ascending){
    if(!Array.isArray(rows)||rows.length===0||rows.length>400)return false;
    let previous=null;
    for(const level of rows){
      if(!Array.isArray(level)||level.length<2)return false;
      const p=Number(level[0]),q=Number(level[1]);
      if(!finite(p)||!finite(q)||p<=0||q<=0)return false;
      if(previous!==null&&(ascending?p<=previous:p>=previous))return false;
      previous=p;
    }
    return true;
  }
  function simulate(book,chart,settings,nowMs=Date.now()){
    const side=settings?.side,quoteBudget=Number(settings?.quoteBudget),feePercent=Number(settings?.feePercent);
    if(!["BUY","SELL"].includes(side)||!finite(quoteBudget)||quoteBudget<10||quoteBudget>1000000
       ||!finite(feePercent)||feePercent<0||feePercent>2)return fail("SETTINGS_INVALID","Montant fictif de 10 à 1 000 000 et frais Taker de 0 à 2 %.");
    if(!finite(nowMs)||nowMs<=0)return fail("CLOCK_INVALID","Horloge invalide.");
    const instrument=String(chart?.loadedInstrument||"").toUpperCase();
    const match=/^([A-Z0-9]+)-([A-Z0-9]+)$/.exec(instrument);
    if(chart?.loading||chart?.error||chart?.archivePeriod||!match||!/^OKX\b/i.test(String(chart?.source||"")))
      return fail("CHART_UNAVAILABLE","Graphique OKX actif requis pour identifier l'instrument.");
    if(!book||book.loading||book.error||book.external||String(book.provider||"").toLowerCase()!=="okx"
       ||book.freshness!=="FRESH"||String(book.loadedAsset||"").toUpperCase()!==match[1]
       ||String(book.loadedQuote||"").toUpperCase()!==match[2]
       ||String(book.pair||"").toUpperCase().replace("/","-")!==instrument)
      return fail("BOOK_CONTEXT","Carnet OKX absent, non frais ou sur une autre paire ; aucune estimation.");
    const observedAt=Date.parse(book.sourceObservedAt||"");
    const age=nowMs-observedAt;
    if(!finite(observedAt)||age>FRESH_MS||age < -FUTURE_MS)
      return fail("BOOK_STALE","Horodatage source du carnet absent, périmé ou futur ; estimation refusée.");
    if(!validRows(book.asks,true)||!validRows(book.bids,false))
      return fail("BOOK_LEVELS","Niveaux de carnet vides, malformés ou mal triés.");
    const bestBid=Number(book.bids[0][0]),bestAsk=Number(book.asks[0][0]);
    if(bestBid>=bestAsk)return fail("BOOK_CROSSED","Carnet incohérent ou croisé.");
    const mid=(bestBid+bestAsk)/2,feeRate=feePercent/100;
    // BUY: quoteBudget is total available quote, including the modeled taker fee.
    // SELL: quoteBudget is an indicative gross reference at mid, converted to base quantity.
    const buy=side==="BUY",levels=buy?book.asks:book.bids;
    let remaining=buy?quoteBudget/(1+feeRate):quoteBudget/mid;
    let baseQuantity=0,grossQuote=0,levelsUsed=0;
    const starting=remaining;
    for(const [priceRaw,quantityRaw] of levels){
      if(remaining<=1e-10)break;
      const price=Number(priceRaw),quantity=Number(quantityRaw);
      const takeBase=buy?Math.min(quantity,remaining/price):Math.min(quantity,remaining);
      if(takeBase<=0)continue;
      baseQuantity+=takeBase;grossQuote+=price*takeBase;
      remaining-=buy?price*takeBase:takeBase;
      levelsUsed++;
    }
    const tolerance=Math.max(1e-9,starting*1e-9);
    if(remaining>tolerance)return fail("INSUFFICIENT_LIQUIDITY","Profondeur visible insuffisante : simulation refusée, pas de remplissage partiel.");
    if(!(baseQuantity>0)||!(grossQuote>0))return fail("FILL_INVALID","Remplissage fictif impossible.");
    const vwap=grossQuote/baseQuantity,feeQuote=grossQuote*feeRate;
    const totalQuote=buy?grossQuote+feeQuote:grossQuote-feeQuote;
    const impactBestBps=(buy?(vwap-bestAsk)/bestAsk:(bestBid-vwap)/bestBid)*10000;
    const deviationMidBps=(buy?(vwap-mid)/mid:(mid-vwap)/mid)*10000;
    return Object.freeze({
      ok:true,mode:"LIVE_BOOK_INSTANT_PAPER",read_only:true,orders:0,
      pair:instrument,quote:match[2],base:match[1],side,quoteBudget,feePercent,
      observedAt:book.sourceObservedAt,ageMs:Math.max(0,age),
      bestBid,bestAsk,mid,spread:bestAsk-bestBid,
      baseQuantity,grossQuote,feeQuote,totalQuote,vwap,levelsUsed,
      impactBestBps:Math.max(0,impactBestBps),deviationMidBps,
      method:"Same-time public OKX depth snapshot; volume-weighted visible-level sweep; hypothetical taker quote fee; no execution or historical inference"
    });
  }
  function el(tag,attrs={},text){
    const n=document.createElement(tag);
    for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));
    if(text!==undefined)n.textContent=text;
    return n;
  }
  function mount(){
    if(typeof document==="undefined")return false;
    const host=document.getElementById("erithStrategyOptionsPanel");
    if(!host)return false;
    if(document.getElementById(ID))return true;
    const sec=el("section",{id:ID,"aria-label":"V6 Instantané de profondeur PAPER",style:"border-top:1px solid #316b7f;margin-top:12px;padding-top:12px"});
    sec.append(el("strong",{},"V6 · Impact réel du carnet — PAPER instantané"));
    sec.append(el("p",{},"Simulation fictive sur la profondeur OKX ACTUELLE uniquement. Ne remplace pas les carnets historiques de la V5. Aucun ordre."));
    const controls=el("div",{style:"display:flex;gap:8px;flex-wrap:wrap;align-items:end"});
    const sideLabel=el("label",{},"Sens fictif");
    const side=el("select",{"data-v6":"side",style:"display:block;min-width:115px"});
    side.append(el("option",{value:"BUY"},"Acheter"),el("option",{value:"SELL"},"Vendre"));sideLabel.append(side);controls.append(sideLabel);
    for(const [key,label,value,min,max,step] of [
      ["quoteBudget","Montant fictif (cotation)",1000,10,1000000,10],
      ["feePercent","Frais Taker (%)",0.1,0,2,0.01]
    ]){
      const lb=el("label",{},label);
      lb.append(el("input",{type:"number","data-v6":key,value,min,max,step,style:"display:block;width:130px"}));controls.append(lb);
    }
    sec.append(controls);
    const button=el("button",{type:"button","data-v6-run":"true"},"Estimer sur le carnet FRESH");
    sec.append(button);
    const out=el("p",{id:"erithBookPaperV6Result",role:"status","aria-live":"polite"},"Ouvre le carnet OKX correspondant et utilise ce bouton pour un snapshot daté. Aucun ordre.");
    sec.append(out);
    button.addEventListener("click",()=>{
      const val=key=>sec.querySelector('[data-v6="'+key+'"]')?.value;
      const result=simulate(globalThis.AgentCryptoOkxMicrostructure?.snapshot?.(),globalThis.AgentCryptoMarketMicroscope?.snapshot?.(),
        {side:val("side"),quoteBudget:Number(val("quoteBudget")),feePercent:Number(val("feePercent"))});
      if(!result.ok){out.textContent="Estimation refusée : "+result.message+" ["+result.code+"]";return;}
      const fmt=(n,d=4)=>n.toLocaleString("fr-FR",{maximumFractionDigits:d});
      out.textContent=result.pair+" · "+(result.side==="BUY"?"ACHAT":"VENTE")+" fictif · snapshot OKX "+result.observedAt+
        " · budget indicatif "+fmt(result.quoteBudget,2)+" "+result.quote+
        " · prix moyen "+fmt(result.vwap,6)+" "+result.quote+"/"+result.base+
        " · "+fmt(result.baseQuantity,8)+" "+result.base+" sur "+result.levelsUsed+" niveau(x)"+
        " · coût carnet vs meilleur prix "+fmt(result.impactBestBps,4)+" bp"+
        " · écart au mid "+fmt(result.deviationMidBps,4)+" bp"+
        " · frais Taker fictifs "+fmt(result.feeQuote,5)+" "+result.quote+
        " · "+(result.side==="BUY"?"dépense totale ":"produit net ")+fmt(result.totalQuote,4)+" "+result.quote+
        ". Indication instantanée non prédictive ; aucune exécution réelle.";
    });
    const anchor=host.querySelector("#erithStrategyName")?.closest(".erith-row")?.previousElementSibling;
    if(anchor)host.insertBefore(sec,anchor);else host.append(sec);
    return true;
  }
  const api=Object.freeze({version:"2026-11-06-v6-instant-orderbook-paper",simulate,mount,read_only:true,
    orders:0,real_order:false,api_credentials:false,uses_historical_book:false});
  globalThis.ErithMarketBookPaperV6=api;
  if(typeof document!=="undefined"){
    const boot=()=>mount();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
    globalThis.addEventListener?.("pageshow",boot,{passive:true});
    globalThis.addEventListener?.("atlas:v2mode",()=>queueMicrotask(boot),{passive:true});
  }
})();
