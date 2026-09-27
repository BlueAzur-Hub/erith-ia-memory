/* Agent-Crypto @erith.IA — 40.6.434 STRATEGY A EXECUTION COST TRUTH
   Manual public order-book measurement for BTC/EUR on Kraken + OKX Europe.
   40.6.434: OKX EEA one-shot WebSocket recovery + public REST fallback + readable panel.
   No order, wallet, key, storage, recurring timer, observer, Strategy threshold or Oracle change. */
(() => {
  "use strict";
  const BUILD="40.6.434", ROOT="strategyAExecutionCostTruth";
  const SIZES=Object.freeze([10,25,50,100]), DEPTH_BPS=Object.freeze([5,10,25]), TIMEOUT=9000, OKX_WS_TIMEOUT=8000;
  const VENUES=Object.freeze({
    kraken:Object.freeze({
      id:"kraken",name:"Kraken Pro",pair:"BTC/EUR",maker:0.40,taker:0.80,
      fee_note:"Spot niveau 1 de référence · le taux réel dépend du compte",
      fee_source:"https://www.kraken.com/fr/features/fee-schedule",
      endpoint:"https://api.kraken.com/0/public/Depth?pair=XBTEUR&count=100"
    }),
    okx:Object.freeze({
      id:"okx",name:"OKX Europe",pair:"BTC/EUR",maker:0.10,taker:0.20,
      fee_note:"EEE Spot-only Regular · effet 25/09/2026 · le taux réel dépend du compte",
      fee_source:"https://www.okx.com/fr-fr/help/important-notice-upcoming-spot-fee-adjustment-eea",
      ws_endpoint:"wss://wseea.okx.com:8443/ws/v5/public",
      rest_endpoint:"https://www.okx.com/api/v5/market/books?instId=BTC-EUR&sz=100"
    })
  });
  let last=null,busy=false;
  const n=v=>Number.isFinite(Number(v))?Number(v):null;
  const esc=v=>String(v??"—").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pct=v=>Number.isFinite(v)?(v>=0?"+":"")+v.toFixed(4)+" %":"—";
  const eur=v=>Number.isFinite(v)?v.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})+" €":"—";
  const bp=v=>Number.isFinite(v)?v.toFixed(2)+" bp":"—";

  function oracleContext(){
    try{
      const s=globalThis.AgentCryptoStrategyAOracleCostCalibrationAudit?.snapshot?.();
      return Object.freeze({
        oracle_envelope_median_pct:n(s?.outcomes?.oracle_envelope_median_pct),
        mfe_median_pct:n(s?.outcomes?.mfe_median_pct),
        pedagogical_cost_pct:n(s?.cost_model?.aggregate_modelled_cost_pct),
        strategy_threshold_pct:n(s?.cost_model?.required_move_pct)
      });
    }catch(_){return Object.freeze({oracle_envelope_median_pct:null,mfe_median_pct:null,pedagogical_cost_pct:null,strategy_threshold_pct:null});}
  }
  function parseKraken(j){
    if(!j||!Array.isArray(j.error)||j.error.length)throw new Error("Kraken: réponse invalide");
    const book=Object.values(j.result||{})[0];
    if(!book)throw new Error("Kraken: carnet BTC/EUR absent");
    return {bids:(book.bids||[]).map(r=>[n(r[0]),n(r[1])]).filter(r=>r[0]>0&&r[1]>0),asks:(book.asks||[]).map(r=>[n(r[0]),n(r[1])]).filter(r=>r[0]>0&&r[1]>0)};
  }
  function parseOkx(j){
    if(String(j?.code)!=="0"||!j?.data?.[0])throw new Error("OKX: réponse invalide");
    const book=j.data[0];
    return {bids:(book.bids||[]).map(r=>[n(r[0]),n(r[1])]).filter(r=>r[0]>0&&r[1]>0),asks:(book.asks||[]).map(r=>[n(r[0]),n(r[1])]).filter(r=>r[0]>0&&r[1]>0)};
  }
  async function fetchJson(url){
    const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),TIMEOUT), started=performance.now();
    try{
      const res=await fetch(url,{method:"GET",mode:"cors",credentials:"omit",cache:"no-store",signal:ctl.signal,headers:{Accept:"application/json"}});
      if(!res.ok)throw new Error("HTTP "+res.status);
      return {json:await res.json(),latency_ms:Math.round(performance.now()-started)};
    }finally{clearTimeout(t);}
  }
  function okxBookFromData(data){
    if(!data)throw new Error("OKX: carnet BTC/EUR absent");
    return {bids:(data.bids||[]).map(r=>[n(r[0]),n(r[1])]).filter(r=>r[0]>0&&r[1]>0),asks:(data.asks||[]).map(r=>[n(r[0]),n(r[1])]).filter(r=>r[0]>0&&r[1]>0)};
  }
  function fetchOkxWsBook(venue){
    return new Promise((resolve,reject)=>{
      const started=performance.now();let settled=false,ws=null;
      const finish=(error,result)=>{
        if(settled)return;settled=true;clearTimeout(timer);
        try{if(ws&&ws.readyState<=1)ws.close(1000,"one-shot complete");}catch(_){}
        if(error)reject(error);else resolve(result);
      };
      const timer=setTimeout(()=>finish(new Error("WebSocket EEA : délai dépassé")),OKX_WS_TIMEOUT);
      try{ws=new WebSocket(venue.ws_endpoint);}catch(error){finish(error);return;}
      ws.addEventListener("open",()=>{
        try{ws.send(JSON.stringify({id:"ect434",op:"subscribe",args:[{channel:"books",instId:"BTC-EUR"}]}));}
        catch(error){finish(error);}
      },{once:true});
      ws.addEventListener("message",event=>{
        let payload=null;try{payload=JSON.parse(String(event.data||""));}catch(_){return;}
        if(payload?.event==="error"){finish(new Error("WebSocket EEA : "+String(payload?.msg||payload?.code||"erreur")));return;}
        if(payload?.arg?.channel!=="books"||payload?.arg?.instId!=="BTC-EUR"||!Array.isArray(payload?.data)||!payload.data[0])return;
        try{finish(null,{book:okxBookFromData(payload.data[0]),latency_ms:Math.round(performance.now()-started),endpoint:venue.ws_endpoint,transport:"WS EEA · ONE-SHOT"});}
        catch(error){finish(error);}
      });
      ws.addEventListener("error",()=>finish(new Error("WebSocket EEA : connexion impossible")),{once:true});
      ws.addEventListener("close",event=>{if(!settled&&event.code!==1000)finish(new Error("WebSocket EEA : fermeture "+event.code));},{once:true});
    });
  }
  async function fetchOkxPublicRestBook(venue){
    const r=await fetchJson(venue.rest_endpoint);
    return {book:parseOkx(r.json),latency_ms:r.latency_ms,endpoint:venue.rest_endpoint,transport:"REST PUBLIC · FALLBACK"};
  }
  function simulateBuy(asks,amount){
    let rem=amount,qty=0,cost=0;
    for(const [p,q] of asks){
      if(rem<=1e-9)break;
      const take=Math.min(q,rem/p); if(take<=0)continue;
      qty+=take; cost+=take*p; rem-=take*p;
    }
    const filled=rem<=0.01, avg=qty>0?cost/qty:null;
    return {filled,quantity_btc:qty,avg_price:avg,notional_eur:cost,remaining_eur:Math.max(0,rem)};
  }
  function simulateSell(bids,qty){
    let rem=qty,sold=0,proceeds=0;
    for(const [p,q] of bids){
      if(rem<=1e-12)break;
      const take=Math.min(q,rem); if(take<=0)continue;
      sold+=take; proceeds+=take*p; rem-=take;
    }
    const filled=rem<=1e-10, avg=sold>0?proceeds/sold:null;
    return {filled,quantity_btc:sold,avg_price:avg,proceeds_eur:proceeds,remaining_btc:Math.max(0,rem)};
  }
  function metrics(book,venue){
    const bids=book.bids.slice().sort((a,b)=>b[0]-a[0]), asks=book.asks.slice().sort((a,b)=>a[0]-b[0]);
    const bestBid=bids[0]?.[0],bestAsk=asks[0]?.[0];
    if(!(bestBid>0&&bestAsk>0))throw new Error(venue.name+": carnet vide");
    const mid=(bestBid+bestAsk)/2, spreadPct=(bestAsk-bestBid)/mid*100, spreadBp=spreadPct*100;
    const depth={};
    for(const bps of DEPTH_BPS){
      const askMax=mid*(1+bps/10000),bidMin=mid*(1-bps/10000);
      depth[String(bps)]={
        ask_eur:asks.filter(r=>r[0]<=askMax).reduce((s,r)=>s+r[0]*r[1],0),
        bid_eur:bids.filter(r=>r[0]>=bidMin).reduce((s,r)=>s+r[0]*r[1],0)
      };
    }
    const simulations=SIZES.map(amount=>{
      const buy=simulateBuy(asks,amount), sell=buy.filled?simulateSell(bids,buy.quantity_btc):{filled:false};
      const buySlip=buy.filled?(buy.avg_price/bestAsk-1)*100:null;
      const sellSlip=sell.filled?(bestBid-sell.avg_price)/bestBid*100:null;
      const bookCost=sell.filled?(1-sell.proceeds_eur/amount)*100:null;
      const marketRoundtrip=Number.isFinite(bookCost)?bookCost+2*venue.taker:null;
      return {amount_eur:amount,buy_filled:buy.filled,sell_filled:sell.filled,buy_avg_price:buy.avg_price,sell_avg_price:sell.avg_price,buy_slippage_pct:buySlip,sell_slippage_pct:sellSlip,book_roundtrip_cost_pct:bookCost,market_market_estimated_cost_pct:marketRoundtrip};
    });
    return {
      pair:venue.pair,best_bid:bestBid,best_ask:bestAsk,mid,spread_pct:spreadPct,spread_bp:spreadBp,
      depth_eur:depth,simulations,
      fee_reference:{maker_pct:venue.maker,taker_pct:venue.taker,note:venue.fee_note,source:venue.fee_source},
      post_only_post_only_fee_floor_pct:2*venue.maker,
      post_only_market_fee_floor_pct:venue.maker+venue.taker,
      post_only_fill_guaranteed:false
    };
  }
  async function oneKraken(venue){
    const started=new Date().toISOString();
    try{
      const r=await fetchJson(venue.endpoint),book=parseKraken(r.json);
      return Object.freeze({ok:true,venue:venue.name,started_at:started,measured_at:new Date().toISOString(),latency_ms:r.latency_ms,endpoint:venue.endpoint,transport:"REST PUBLIC",attempts:Object.freeze([{transport:"REST PUBLIC",ok:true}]),...metrics(book,venue)});
    }catch(e){
      return Object.freeze({ok:false,venue:venue.name,started_at:started,measured_at:new Date().toISOString(),endpoint:venue.endpoint,error:"Kraken indisponible.",diagnostic:String(e?.name==="AbortError"?"délai dépassé":e?.message||e),attempts:Object.freeze([{transport:"REST PUBLIC",ok:false,error:String(e?.message||e)}])});
    }
  }
  async function oneOkx(venue){
    const started=new Date().toISOString(),attempts=[];
    try{
      const r=await fetchOkxWsBook(venue);attempts.push({transport:r.transport,ok:true});
      return Object.freeze({ok:true,venue:venue.name,started_at:started,measured_at:new Date().toISOString(),latency_ms:r.latency_ms,endpoint:r.endpoint,transport:r.transport,attempts:Object.freeze(attempts.slice()),...metrics(r.book,venue)});
    }catch(error){
      attempts.push({transport:"WS EEA · ONE-SHOT",ok:false,error:String(error?.message||error)});
    }
    try{
      const r=await fetchOkxPublicRestBook(venue);attempts.push({transport:r.transport,ok:true});
      return Object.freeze({ok:true,venue:venue.name,started_at:started,measured_at:new Date().toISOString(),latency_ms:r.latency_ms,endpoint:r.endpoint,transport:r.transport,attempts:Object.freeze(attempts.slice()),...metrics(r.book,venue)});
    }catch(error){
      attempts.push({transport:"REST PUBLIC · FALLBACK",ok:false,error:String(error?.name==="AbortError"?"délai dépassé":error?.message||error)});
      return Object.freeze({ok:false,venue:venue.name,started_at:started,measured_at:new Date().toISOString(),endpoint:venue.ws_endpoint,error:"OKX indisponible après WebSocket EEA one-shot et REST public.",diagnostic:attempts.map(x=>x.transport+" : "+(x.ok?"OK":x.error)).join(" · "),attempts:Object.freeze(attempts.slice())});
    }
  }
  async function measure(){
    if(busy)return last;
    busy=true; render("Mesure en cours…");
    try{
      const [kraken,okx]=await Promise.all([oneKraken(VENUES.kraken),oneOkx(VENUES.okx)]);
      const okCount=[kraken,okx].filter(x=>x.ok).length;
      last=Object.freeze({
        schema:"agent_crypto_strategy_a_execution_cost_truth_v1",build:BUILD,generated_at:new Date().toISOString(),
        status:okCount===2?"MEASURED_BOTH":okCount===1?"PARTIAL":"FAILED",
        pair:"BTC/EUR",sizes_eur:SIZES.slice(),depth_bps:DEPTH_BPS.slice(),
        oracle_context:oracleContext(),venues:Object.freeze({kraken,okx}),
        assumptions:Object.freeze({
          fee_profiles_are_reference_rates:true,
          account_specific_fee_may_differ:true,
          market_roundtrip_cost_is_orderbook_simulation_plus_reference_taker_fees:true,
          post_only_cost_is_fee_floor_only_and_fill_not_guaranteed:true
        }),
        protections:Object.freeze({manual_fetch_only:true,operator_triggered_one_shot_websocket:true,persistent_websocket:false,recurring_timer:false,storage_write:false,api_key:false,wallet:false,real_order:false,thresholds_changed:false,oracle_math_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,automatic_platform_choice:false})
      });
      render(); return last;
    }finally{busy=false;}
  }
  function exportJson(){
    if(!last)return false;
    try{
      const b=new Blob([JSON.stringify(last,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");
      a.href=u;a.download="STRATEGY_A_EXECUTION_COST_TRUTH_40_6_434.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;
    }catch(_){return false;}
  }
  function style(){
    if(document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent="#"+ROOT+"{margin-top:10px;padding:13px;border:1px solid rgba(65,224,193,.34);border-radius:10px;background:rgba(5,29,31,.25)}#"+ROOT+" .ect-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}#"+ROOT+" .ect-t{font-size:12px;font-weight:950;letter-spacing:.065em;color:#82f5de;line-height:1.35}#"+ROOT+" .ect-s{font-size:10.5px;color:#9bb9b6;margin-top:4px;line-height:1.4}#"+ROOT+" .ect-actions{display:flex;gap:8px}#"+ROOT+" .ect-actions button{min-height:36px!important;font-size:11px!important;padding:8px 12px!important}#"+ROOT+" .ect-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}#"+ROOT+" .ect-card{padding:11px;border:1px solid rgba(255,255,255,.09);border-radius:8px;background:rgba(0,0,0,.13);min-width:0}#"+ROOT+" .ect-card h4{margin:0 0 8px;font-size:13px;line-height:1.35;color:#e8ffff}#"+ROOT+" .ect-k{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}#"+ROOT+" .ect-k div{padding:7px;border-radius:6px;background:rgba(255,255,255,.03);min-width:0}#"+ROOT+" .ect-k span{display:block;font-size:9.5px;line-height:1.3;color:#8ea9a6}#"+ROOT+" .ect-k b{display:block;margin-top:2px;font-size:11.5px;line-height:1.3;color:#effffd;overflow-wrap:anywhere}#"+ROOT+" table{width:100%;border-collapse:collapse;margin-top:8px;font-size:10.5px;line-height:1.35}#"+ROOT+" th,#"+ROOT+" td{padding:6px 5px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right}#"+ROOT+" th:first-child,#"+ROOT+" td:first-child{text-align:left}#"+ROOT+" .ect-note{margin-top:8px;font-size:10.5px;line-height:1.5;color:#a9c1bf}#"+ROOT+" .ect-transport{margin:0 0 8px;font-size:9.5px;line-height:1.35;color:#82bcb2}#"+ROOT+" details.ect-diagnostic{margin-top:8px;font-size:9.5px;color:#879d9b}#"+ROOT+" details.ect-diagnostic summary{cursor:pointer;color:#a3b9b6}#"+ROOT+" .bad{color:#ffaaa2}.good{color:#8ff0c1}@media(max-width:1100px){#"+ROOT+" .ect-grid{grid-template-columns:1fr}#"+ROOT+" .ect-k{grid-template-columns:repeat(2,minmax(0,1fr))}}";
    document.head.appendChild(s);
  }
  function card(v){
    if(!v)return '<div class="ect-card"><h4>—</h4><div class="ect-note">Non mesuré.</div></div>';
    if(!v.ok){
      const diagnostic=v.diagnostic?'<details class="ect-diagnostic"><summary>Diagnostic technique</summary><div>'+esc(v.diagnostic)+'</div></details>':'';
      return '<div class="ect-card"><h4>'+esc(v.venue)+'</h4><div class="ect-note bad">'+esc(v.error||"Mesure indisponible.")+'</div>'+diagnostic+'</div>';
    }
    const d=v.depth_eur||{}, rows=(v.simulations||[]).map(x=>'<tr><td>'+esc(x.amount_eur)+' €</td><td>'+esc(pct(x.buy_slippage_pct))+'</td><td>'+esc(pct(x.sell_slippage_pct))+'</td><td>'+esc(pct(x.market_market_estimated_cost_pct))+'</td></tr>').join("");
    return '<div class="ect-card"><h4>'+esc(v.venue)+' · '+esc(v.pair)+'</h4><div class="ect-transport">Carnet : '+esc(v.transport||"source publique")+' · '+esc(v.latency_ms)+' ms</div><div class="ect-k">'+
      '<div><span>Maker réf.</span><b>'+esc(pct(v.fee_reference.maker_pct))+'</b></div><div><span>Taker réf.</span><b>'+esc(pct(v.fee_reference.taker_pct))+'</b></div>'+
      '<div><span>Spread</span><b>'+esc(bp(v.spread_bp))+'</b></div><div><span>Latence</span><b>'+esc(v.latency_ms)+' ms</b></div>'+
      '<div><span>Meilleur achat</span><b>'+esc(eur(v.best_ask))+'</b></div><div><span>Meilleure vente</span><b>'+esc(eur(v.best_bid))+'</b></div>'+
      '<div><span>Profondeur ±5bp</span><b>'+esc(eur((d["5"]?.ask_eur||0)+(d["5"]?.bid_eur||0)))+'</b></div><div><span>Profondeur ±25bp</span><b>'+esc(eur((d["25"]?.ask_eur||0)+(d["25"]?.bid_eur||0)))+'</b></div></div>'+
      '<table><thead><tr><th>Montant</th><th>Gliss. achat</th><th>Gliss. vente</th><th>Coût Market→Market</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="ect-note">Post-only→Post-only : plancher frais '+esc(pct(v.post_only_post_only_fee_floor_pct))+' · exécution non garantie. Post-only→Market : plancher frais '+esc(pct(v.post_only_market_fee_floor_pct))+'.</div></div>';
  }
  function render(message){
    if(typeof document==="undefined")return last;
    const anchor=document.getElementById("strategyAOracleCostCalibrationAudit")||document.getElementById("strategyACostWaitOutcomeAudit406429")||document.getElementById("strategyADurableEvidence")||document.getElementById("strategyAExperimentLedger")||document.querySelector("#strategyAVisualConsole404269 .avc-body");
    if(!anchor)return last;
    style(); let root=document.getElementById(ROOT); if(!root){root=document.createElement("section");root.id=ROOT;}
    if(root.previousElementSibling!==anchor){try{anchor.insertAdjacentElement("afterend",root);}catch(_){}}
    const c=last?.oracle_context||oracleContext();
    root.innerHTML='<div class="ect-h"><div><div class="ect-t">STRATEGY A · EXECUTION COST TRUTH · '+BUILD+'</div><div class="ect-s">Mesure manuelle BTC/EUR · Kraken + OKX Europe · aucun ordre réel.</div></div><div class="ect-actions"><button class="btn small" id="'+ROOT+'Measure">'+(busy?"MESURE…":"MESURER KRAKEN + OKX")+'</button><button class="btn small" id="'+ROOT+'Export" '+(!last?"disabled":"")+'>EXPORTER</button></div></div>'+
      (message?'<div class="ect-note">'+esc(message)+'</div>':'')+
      '<div class="ect-grid">'+card(last?.venues?.kraken)+card(last?.venues?.okx)+'</div>'+
      '<div class="ect-note"><b>CONTEXTE :</b> enveloppe Oracle médiane '+esc(pct(c.oracle_envelope_median_pct))+' · MFE observée '+esc(pct(c.mfe_median_pct))+' · ancien coût pédagogique '+esc(pct(c.pedagogical_cost_pct))+' · seuil Strategy A '+esc(pct(c.strategy_threshold_pct))+'. Cette version mesure et compare ; elle ne choisit aucune plateforme et ne change aucun seuil.</div>';
    root.querySelector("#"+ROOT+"Measure")?.addEventListener("click",()=>void measure(),{once:true});
    root.querySelector("#"+ROOT+"Export")?.addEventListener("click",exportJson,{once:true});
    root.dataset.build=BUILD;root.dataset.readOnly="true";return last;
  }
  globalThis.AgentCryptoStrategyAExecutionCostTruth=Object.freeze({
    build:BUILD,measure,render,export_json:exportJson,snapshot:()=>last,
    manual_fetch_only:true,operator_triggered_one_shot_websocket:true,persistent_websocket:false,recurring_timer:false,storage_write:false,api_key:false,wallet:false,real_order:false,thresholds_changed:false,oracle_math_changed:false,risk_changed:false,paper_changed:false,market_core_changed:false,automatic_platform_choice:false
  });
  if(typeof document!=="undefined"){
    let mountQueued=false;
    const boot=()=>{try{render();}catch(_){}};
    const scheduleMount=()=>{
      if(mountQueued)return;
      mountQueued=true;
      const run=()=>{mountQueued=false;boot();};
      try{queueMicrotask(run);}catch(_){Promise.resolve().then(run);}
    };
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",scheduleMount,{once:true});else scheduleMount();
    document.addEventListener("agent-crypto:strategy-a-durable-evidence-ready",scheduleMount,{passive:true});
    document.addEventListener("agent-crypto:strategy-a-experiment-cycle",scheduleMount,{passive:true});
    document.addEventListener("toggle",event=>{if(event?.target?.id==="simulation"&&event.target.open===true)scheduleMount();},true);
    window.addEventListener("agent-crypto:postboot-runtime-ready",scheduleMount,{passive:true});
    window.addEventListener("pageshow",scheduleMount,{passive:true});
  }
})();