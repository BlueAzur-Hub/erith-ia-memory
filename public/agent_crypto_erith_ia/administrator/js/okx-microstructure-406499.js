/* Agent-Crypto — 40.6.502 OKX DEPTH / ORDERBOOK DOCK
   Replaces the operator-facing 40.6.499 microstructure overlay with a real
   order-book/depth surface backed by the already-proven local Backend 8790
   /orderbook route from 40.6.492.
   Read-only. No private API, no order, no wallet, no recurring timer,
   no Strategy/Market Core mutation. */
(()=>{
  "use strict";
  const BUILD="40.6.502";
  const ROOT="atlasOkxMicrostructure";
  const BACKEND="http://127.0.0.1:8790";
  const state={
    open:false,loading:false,asset:"BTC",pair:"BTC/EUR",capturedAt:null,
    bids:[],asks:[],tab:"book",error:null,backendVersion:null
  };
  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null;};
  const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("fr-FR",{maximumFractionDigits:d}):"—";
  const eur=v=>Number.isFinite(v)?v.toLocaleString("fr-FR",{maximumFractionDigits:0})+" €":"—";
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const selectedAsset=()=>{
    const texts=[
      document.getElementById("detailCompactAsset")?.textContent,
      document.getElementById("selectedAssetTitle")?.textContent,
      document.querySelector("#top5Track .is-active")?.textContent
    ].filter(Boolean).join(" ").toUpperCase();
    return texts.match(/\b(BTC|ETH|BNB|XRP|SOL|ADA|DOGE|LINK|AVAX|LTC|DOT|SUI|APT|ARB|UNI|AAVE|NEAR|TAO|RENDER|ICP|SHIB|PEPE|XMR|ZEC)\b/)?.[1]||"BTC";
  };
  const normalizeRows=rows=>(Array.isArray(rows)?rows:[])
    .map(r=>[n(r?.[0]),n(r?.[1])])
    .filter(r=>r[0]>0&&r[1]>0);
  function style(){
    if(document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");
    s.id=ROOT+"Style";
    s.textContent=`
#${ROOT}Toggle{margin-left:4px}
#${ROOT}{display:none;position:absolute;z-index:42;left:8px;right:8px;bottom:8px;height:min(330px,42%);overflow:hidden;border:1px solid rgba(87,219,232,.28);border-radius:12px;background:linear-gradient(180deg,rgba(2,10,17,.955),rgba(3,15,23,.925));box-shadow:0 18px 60px rgba(0,0,0,.46);backdrop-filter:blur(6px);color:#c8dce5}
#${ROOT}.is-open{display:grid;grid-template-rows:auto auto auto 1fr}
#${ROOT} .oms-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px 7px;border-bottom:1px solid rgba(255,255,255,.055)}
#${ROOT} .oms-title{display:grid;gap:2px;min-width:0}
#${ROOT} .oms-title b{font:950 10px/1 system-ui,sans-serif;color:#8fe9ef;letter-spacing:.06em}
#${ROOT} .oms-title small{font:800 7px/1.35 ui-monospace,monospace;color:#7895a4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${ROOT} button{min-height:24px;padding:4px 8px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.04);color:#d8e7ec;font:900 8px/1 system-ui,sans-serif;cursor:pointer}
#${ROOT} button.is-active{background:rgba(84,220,229,.16);border-color:rgba(84,220,229,.46);color:#9ef3f4}
#${ROOT} .oms-tabs{display:flex;align-items:center;gap:5px;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.05)}
#${ROOT} .oms-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;padding:7px 10px}
#${ROOT} .oms-kpis span{min-width:0;padding:6px 7px;border:1px solid rgba(255,255,255,.055);border-radius:8px;background:rgba(255,255,255,.025)}
#${ROOT} .oms-kpis small{display:block;font:850 6.5px/1.2 system-ui,sans-serif;color:#75919e;letter-spacing:.04em}
#${ROOT} .oms-kpis b{display:block;margin-top:3px;font:900 9px/1.2 ui-monospace,monospace;color:#e9f7fa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${ROOT} .oms-body{min-height:0;overflow:auto;padding:0 10px 10px}
#${ROOT} .oms-book-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;min-height:0}
#${ROOT} .oms-side{min-width:0;border:1px solid rgba(255,255,255,.05);border-radius:9px;overflow:hidden;background:rgba(0,0,0,.10)}
#${ROOT} .oms-side h4{margin:0;padding:6px 8px;font:950 8px/1 system-ui,sans-serif;letter-spacing:.06em;border-bottom:1px solid rgba(255,255,255,.05)}
#${ROOT} .oms-side.bid h4{color:#76e2c5}#${ROOT} .oms-side.ask h4{color:#f08b9a}
#${ROOT} .oms-level-head,#${ROOT} .oms-level{display:grid;grid-template-columns:1fr .8fr .8fr;align-items:center;position:relative;min-height:20px;padding:0 7px;font:800 7.5px/1 ui-monospace,monospace}
#${ROOT} .oms-level-head{color:#708895;border-bottom:1px solid rgba(255,255,255,.04)}
#${ROOT} .oms-level{border-bottom:1px solid rgba(255,255,255,.025)}
#${ROOT} .oms-level:last-child{border-bottom:0}
#${ROOT} .oms-level .bar{position:absolute;top:1px;bottom:1px;opacity:.16;pointer-events:none}
#${ROOT} .oms-side.bid .bar{right:0;background:#49d5ad}
#${ROOT} .oms-side.ask .bar{left:0;background:#ef7184}
#${ROOT} .oms-level span{position:relative;z-index:1;text-align:right}
#${ROOT} .oms-level span:first-of-type,#${ROOT} .oms-level-head span:first-child{text-align:left}
#${ROOT} .oms-side.bid .price{color:#78e2c6}#${ROOT} .oms-side.ask .price{color:#ef93a0}
#${ROOT} .oms-depth{display:grid;gap:8px}
#${ROOT} .oms-depth-row{display:grid;grid-template-columns:78px 1fr 90px;align-items:center;gap:8px}
#${ROOT} .oms-depth-row label{font:900 7px/1 system-ui,sans-serif;color:#8ba4af}
#${ROOT} .oms-meter{height:18px;border:1px solid rgba(255,255,255,.055);border-radius:999px;overflow:hidden;background:rgba(255,255,255,.025);display:grid;grid-template-columns:1fr 1fr}
#${ROOT} .oms-meter i{display:block;height:100%}
#${ROOT} .oms-meter .bid{justify-self:end;background:linear-gradient(90deg,rgba(66,214,171,.22),rgba(66,214,171,.70))}
#${ROOT} .oms-meter .ask{justify-self:start;background:linear-gradient(90deg,rgba(239,113,132,.70),rgba(239,113,132,.22))}
#${ROOT} .oms-depth-row b{text-align:right;font:900 7.5px/1.2 ui-monospace,monospace;color:#d8e7ec}
#${ROOT} .oms-note{margin-top:8px;padding:6px 8px;border:1px solid rgba(255,215,130,.10);border-radius:8px;background:rgba(255,215,130,.025);font:800 7px/1.35 system-ui,sans-serif;color:#8ca3ae}
#${ROOT} .oms-error{padding:14px;border:1px solid rgba(239,113,132,.22);border-radius:9px;background:rgba(239,113,132,.055);color:#f0a4ae;font:850 8px/1.4 ui-monospace,monospace}
@media(max-width:900px){
  #${ROOT}{height:min(360px,48%)}
  #${ROOT} .oms-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(max-width:700px){
  #${ROOT}{left:5px;right:5px;bottom:5px;height:50%}
  #${ROOT} .oms-book-grid{grid-template-columns:1fr}
  #${ROOT} .oms-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;
    document.head.appendChild(s);
  }
  function mount(){
    if(typeof document==="undefined")return false;
    style();
    const group=[...document.querySelectorAll("#analyste .chart-v2-toggle-group")]
      .find(x=>/Afficher/i.test(x.textContent||""))||document.querySelector("#analyste .chart-v2-control-deck");
    const panel=document.querySelector("#analyste .chart-shell");
    if(!group||!panel)return false;
    panel.style.position="relative";
    let btn=document.getElementById(ROOT+"Toggle");
    if(!btn){
      btn=document.createElement("button");
      btn.id=ROOT+"Toggle";
      btn.type="button";
      btn.className="chart-v2-toggle";
      btn.textContent="Profondeur";
      btn.setAttribute("aria-pressed","false");
      btn.addEventListener("click",()=>setOpen(!state.open));
      group.appendChild(btn);
    }
    let root=document.getElementById(ROOT);
    if(!root){
      root=document.createElement("section");
      root.id=ROOT;
      root.setAttribute("aria-label","OKX Orderbook Depth read-only");
      root.innerHTML=`
        <div class="oms-head">
          <div class="oms-title">
            <b>OKX · CARNET D’ORDRES / PROFONDEUR</b>
            <small data-oms-meta>EXECUTION VIEW · BTC/EUR · Backend local 8790</small>
          </div>
          <button type="button" data-oms-refresh>Rafraîchir</button>
        </div>
        <div class="oms-tabs">
          <button type="button" data-oms-tab="book" class="is-active">Carnet d’ordres</button>
          <button type="button" data-oms-tab="depth">Profondeur</button>
        </div>
        <div class="oms-kpis" data-oms-kpis></div>
        <div class="oms-body" data-oms-body></div>`;
      panel.appendChild(root);
      root.querySelector("[data-oms-refresh]").addEventListener("click",()=>void refresh());
      root.querySelectorAll("[data-oms-tab]").forEach(button=>button.addEventListener("click",()=>{
        state.tab=button.dataset.omsTab||"book";
        root.querySelectorAll("[data-oms-tab]").forEach(b=>b.classList.toggle("is-active",b===button));
        render();
      }));
    }
    sync();
    return true;
  }
  function sync(){
    document.getElementById(ROOT)?.classList.toggle("is-open",state.open);
    const b=document.getElementById(ROOT+"Toggle");
    if(b){
      b.classList.toggle("is-active",state.open);
      b.setAttribute("aria-pressed",String(state.open));
    }
  }
  function setOpen(value){
    state.open=!!value;
    mount();sync();
    const asset=selectedAsset();
    if(state.open&&(state.asset!==asset||!state.capturedAt))void refresh();
    return state.open;
  }
  async function fetchBook(asset){
    const ctl=new AbortController();
    const timer=setTimeout(()=>ctl.abort(),12000);
    try{
      const url=new URL(BACKEND+"/orderbook");
      url.searchParams.set("asset",asset);
      url.searchParams.set("depth","100");
      const response=await fetch(url,{cache:"no-store",signal:ctl.signal,headers:{Accept:"application/json"}});
      if(!response.ok)throw new Error("Backend 8790 orderbook HTTP "+response.status);
      const payload=await response.json();
      if(payload?.read_only!==true)throw new Error("contrat read-only absent");
      if(String(payload?.provider||"").toLowerCase()!=="okx")throw new Error("provider != OKX");
      if(String(payload?.status||"").toLowerCase()!=="ok")throw new Error(payload?.error||("status "+payload?.status));
      const bids=normalizeRows(payload?.bids).sort((a,b)=>b[0]-a[0]);
      const asks=normalizeRows(payload?.asks).sort((a,b)=>a[0]-b[0]);
      if(!bids.length||!asks.length)throw new Error("carnet vide");
      if(bids[0][0]>asks[0][0])throw new Error("carnet croisé");
      return {payload,bids,asks};
    }finally{clearTimeout(timer);}
  }
  async function refresh(){
    if(state.loading)return false;
    mount();
    state.loading=true;state.error=null;state.asset=selectedAsset();render();
    try{
      const result=await fetchBook(state.asset);
      state.bids=result.bids;
      state.asks=result.asks;
      state.pair=String(result.payload?.pair||state.asset+"/EUR");
      state.backendVersion=String(result.payload?.backend_version||"?");
      state.capturedAt=String(result.payload?.observed_at_utc||new Date().toISOString());
    }catch(error){
      state.error=error?.name==="AbortError"?"Backend 8790 : timeout carnet":String(error?.message||error);
      state.bids=[];state.asks=[];
    }finally{
      state.loading=false;render();
    }
    return !state.error;
  }
  function metrics(){
    const bid=state.bids[0]?.[0],ask=state.asks[0]?.[0];
    const mid=Number.isFinite(bid)&&Number.isFinite(ask)?(bid+ask)/2:null;
    const spread=Number.isFinite(bid)&&Number.isFinite(ask)?ask-bid:null;
    const spreadBp=Number.isFinite(spread)&&Number.isFinite(mid)&&mid?spread/mid*10000:null;
    const sumNotional=rows=>rows.slice(0,20).reduce((sum,[p,q])=>sum+p*q,0);
    return {
      bid,ask,mid,spread,spreadBp,
      bid20:sumNotional(state.bids),
      ask20:sumNotional(state.asks)
    };
  }
  function levelRows(rows,side){
    const visible=rows.slice(0,14);
    let cumulative=0;
    const cumulativeRows=visible.map(([price,qty])=>{
      cumulative+=qty;
      return {price,qty,cumulative,notional:price*qty};
    });
    const max=Math.max(...cumulativeRows.map(r=>r.cumulative),1e-12);
    const ordered=side==="ask"?cumulativeRows.slice().reverse():cumulativeRows;
    return ordered.map(r=>`
      <div class="oms-level">
        <i class="bar" style="width:${Math.max(2,r.cumulative/max*100).toFixed(1)}%"></i>
        <span class="price">${fmt(r.price,2)}</span>
        <span>${fmt(r.qty,6)}</span>
        <span>${fmt(r.cumulative,6)}</span>
      </div>`).join("");
  }
  function depthAtBps(rows,side,mid,bps){
    if(!Number.isFinite(mid))return 0;
    const limit=side==="bid"?mid*(1-bps/10000):mid*(1+bps/10000);
    return rows.reduce((sum,[p,q])=>{
      const inside=side==="bid"?p>=limit:p<=limit;
      return inside?sum+p*q:sum;
    },0);
  }
  function renderBook(body){
    body.innerHTML=`
      <div class="oms-book-grid">
        <section class="oms-side bid">
          <h4>BID · ACHATS</h4>
          <div class="oms-level-head"><span>Prix</span><span>BTC</span><span>Cumul BTC</span></div>
          ${levelRows(state.bids,"bid")}
        </section>
        <section class="oms-side ask">
          <h4>ASK · VENTES</h4>
          <div class="oms-level-head"><span>Prix</span><span>BTC</span><span>Cumul BTC</span></div>
          ${levelRows(state.asks,"ask")}
        </section>
      </div>
      <div class="oms-note">Vue exécution : carnet OKX public multi-niveaux via Backend local 8790. Les barres montrent la quantité cumulée visible dans les premiers niveaux. Aucune exécution.</div>`;
  }
  function renderDepth(body,m){
    const bands=[5,10,25];
    const rows=bands.map(bps=>{
      const bid=depthAtBps(state.bids,"bid",m.mid,bps);
      const ask=depthAtBps(state.asks,"ask",m.mid,bps);
      const max=Math.max(bid,ask,1);
      return `
        <div class="oms-depth-row">
          <label>± ${bps} bp</label>
          <div class="oms-meter">
            <i class="bid" style="width:${(bid/max*100).toFixed(1)}%"></i>
            <i class="ask" style="width:${(ask/max*100).toFixed(1)}%"></i>
          </div>
          <b>${eur(bid)} / ${eur(ask)}</b>
        </div>`;
    }).join("");
    body.innerHTML=`
      <div class="oms-depth">${rows}</div>
      <div class="oms-note">Gauche = profondeur BID (achats) · droite = profondeur ASK (ventes), cumulées autour du mid-price. Mesure read-only sur le carnet courant ; ce n’est ni une prédiction ni un signal de trading.</div>`;
  }
  function render(){
    const root=document.getElementById(ROOT);
    const meta=root?.querySelector("[data-oms-meta]");
    const kpis=root?.querySelector("[data-oms-kpis]");
    const body=root?.querySelector("[data-oms-body]");
    if(!meta||!kpis||!body)return;
    meta.textContent=state.loading?
      `${state.asset} · CHARGEMENT · Backend 8790 /orderbook`:
      state.error?
        `${state.asset} · ERREUR · ${state.error}`:
        `${state.pair} · ${state.capturedAt?new Date(state.capturedAt).toLocaleTimeString("fr-FR"):"en attente"} · Backend ${state.backendVersion||"?"}`;
    if(state.loading){
      kpis.innerHTML="";
      body.innerHTML='<div class="oms-note">Lecture du carnet OKX en cours…</div>';
      return;
    }
    if(state.error){
      kpis.innerHTML="";
      body.innerHTML=`<div class="oms-error">${esc(state.error)}<br><small>Le graphique reste utilisable. Vérifier seulement le Backend local 8790 si cette erreur persiste.</small></div>`;
      return;
    }
    if(!state.bids.length||!state.asks.length){
      kpis.innerHTML="";
      body.innerHTML='<div class="oms-note">Ouvrez Profondeur ou cliquez Rafraîchir pour lire le carnet.</div>';
      return;
    }
    const m=metrics();
    kpis.innerHTML=`
      <span><small>BEST BID</small><b>${fmt(m.bid,2)}</b></span>
      <span><small>BEST ASK</small><b>${fmt(m.ask,2)}</b></span>
      <span><small>SPREAD</small><b>${fmt(m.spread,2)} · ${fmt(m.spreadBp,2)} bp</b></span>
      <span><small>MID</small><b>${fmt(m.mid,2)}</b></span>
      <span><small>BID TOP20</small><b>${eur(m.bid20)}</b></span>
      <span><small>ASK TOP20</small><b>${eur(m.ask20)}</b></span>`;
    if(state.tab==="depth")renderDepth(body,m);else renderBook(body);
  }
  function selfTest(){
    const rows=normalizeRows([["10","2"],["9","1"],["x","1"]]);
    const mid=10;
    const pass=rows.length===2&&depthAtBps([[10,1],[9.99,2]],"bid",mid,10)>0;
    return Object.freeze({build:BUILD,pass,checks:{
      normalize_rows:rows.length===2,
      depth_bands:true,
      local_backend_orderbook:true,
      no_direct_browser_okx:true,
      no_private_api:true,
      no_order:true,
      no_wallet:true,
      no_recurring_timer:true
    }});
  }
  globalThis.AgentCryptoOkxMicrostructure=Object.freeze({
    build:BUILD,mount,setOpen,refresh,
    snapshot:()=>Object.freeze({...state,bids:state.bids.slice(),asks:state.asks.slice()}),
    self_test:selfTest,
    read_only:true,
    local_backend_orderbook:true,
    backend_endpoint:BACKEND+"/orderbook",
    depth_bottom_dock:true,
    real_order:false,private_api:false,wallet:false,
    recurring_timer:false,mutation_observer:false,storage_write:false,
    market_core_changed:false,strategy_changed:false
  });
  if(typeof document!=="undefined"){
    const boot=()=>mount();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
    window.addEventListener("pageshow",boot,{passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",()=>{state.capturedAt=null;state.bids=[];state.asks=[];render();},{passive:true});
  }
})();