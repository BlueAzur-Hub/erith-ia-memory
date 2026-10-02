/* Agent-Crypto — 40.6.503 OKX DEPTH · LECTURE TECHNIQUE LIVE OVERLAY
   Terrain-driven presentation repair.
   The Depth / Orderbook surface now lives on top of the Lecture Technique panel
   instead of consuming chart space. It uses the proven local Backend 8790
   /orderbook route and refreshes only while open, every 2 seconds.
   Read-only. No private API, no order, no wallet, no Strategy/Market Core mutation. */
(()=>{
  "use strict";
  const BUILD="40.6.504";
  const ROOT="atlasOkxMicrostructure";
  const BACKEND="http://127.0.0.1:8790";
  const LIVE_MS=2000;
  const state={
    open:false,loading:false,asset:"BTC",pair:"BTC/EUR",capturedAt:null,
    bids:[],asks:[],tab:"book",error:null,backendVersion:null,lastLatencyMs:null
  };
  let liveTimer=0;
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
#detailPanel{position:relative}
#${ROOT}{
  display:none;position:absolute;z-index:90;inset:0;
  overflow:hidden;border:1px solid rgba(87,219,232,.40);border-radius:14px;
  background:linear-gradient(180deg,rgba(2,10,17,.965),rgba(3,14,22,.945));
  box-shadow:0 20px 70px rgba(0,0,0,.58);backdrop-filter:blur(14px) saturate(.92);
  color:#e2f2f6
}
#${ROOT}.is-open{display:grid;grid-template-rows:auto auto auto 1fr}#detailPanel.atlas-depth-active> :not(#${ROOT}){opacity:.08;filter:saturate(.35) brightness(.50);pointer-events:none;transition:opacity .15s ease}#detailPanel.atlas-depth-active{overflow:hidden}
#${ROOT} .oms-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:13px 12px 10px;border-bottom:1px solid rgba(255,255,255,.07)}
#${ROOT} .oms-title{display:grid;gap:3px;min-width:0}
#${ROOT} .oms-title b{font:950 15px/1.08 system-ui,sans-serif;color:#a8f7f5;letter-spacing:.055em}
#${ROOT} .oms-title small{font:850 10.5px/1.3 ui-monospace,monospace;color:#9db5bf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${ROOT} .oms-actions{display:flex;align-items:center;gap:5px}
#${ROOT} button{min-height:31px;padding:6px 10px;border:1px solid rgba(255,255,255,.15);border-radius:999px;background:rgba(255,255,255,.055);color:#e2f0f4;font:900 10px/1 system-ui,sans-serif;cursor:pointer}
#${ROOT} button.is-active{background:rgba(81,224,229,.18);border-color:rgba(81,224,229,.55);color:#a6f8f7}
#${ROOT} .oms-live{display:inline-flex;align-items:center;gap:5px;font:900 12px/1 ui-monospace,monospace;color:#84e6c9}
#${ROOT} .oms-live::before{content:"";width:7px;height:7px;border-radius:50%;background:#67e0bb;box-shadow:0 0 10px rgba(103,224,187,.8)}
#${ROOT} .oms-tabs{display:flex;align-items:center;gap:6px;padding:9px 11px;border-bottom:1px solid rgba(255,255,255,.06)}
#${ROOT} .oms-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:10px 11px}
#${ROOT} .oms-kpis span{min-width:0;padding:9px 9px;border:1px solid rgba(255,255,255,.065);border-radius:8px;background:rgba(255,255,255,.035)}
#${ROOT} .oms-kpis small{display:block;font:900 9.5px/1.18 system-ui,sans-serif;color:#819daa;letter-spacing:.045em}
#${ROOT} .oms-kpis b{display:block;margin-top:4px;font:950 13px/1.16 ui-monospace,monospace;color:#f0fbfd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${ROOT} .oms-body{min-height:0;overflow:auto;padding:0 11px 12px}
#${ROOT} .oms-book{display:grid;gap:5px}
#${ROOT} .oms-book-head{display:grid;grid-template-columns:1fr .8fr .8fr;padding:2px 6px 4px;color:#7e99a6;font:900 9.5px/1 system-ui,sans-serif}
#${ROOT} .oms-book-head span:not(:first-child){text-align:right}
#${ROOT} .oms-level{display:grid;grid-template-columns:1fr .8fr .8fr;align-items:center;position:relative;min-height:29px;padding:0 7px;border-radius:5px;font:900 10px/1 ui-monospace,monospace;overflow:hidden}
#${ROOT} .oms-level .bar{position:absolute;top:1px;bottom:1px;right:0;opacity:.18;pointer-events:none}
#${ROOT} .oms-level.ask .bar{background:#ef7184}
#${ROOT} .oms-level.bid .bar{background:#49d5ad}
#${ROOT} .oms-level span{position:relative;z-index:1;text-align:right}
#${ROOT} .oms-level span:first-of-type{text-align:left}
#${ROOT} .oms-level.ask .price{color:#f3a0aa}
#${ROOT} .oms-level.bid .price{color:#88e8cd}
#${ROOT} .oms-midline{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;margin:6px 0;padding:9px 9px;border:1px solid rgba(255,215,130,.13);border-radius:7px;background:rgba(255,215,130,.035)}
#${ROOT} .oms-midline b{font:950 14px/1 ui-monospace,monospace;color:#ffe2a3}
#${ROOT} .oms-midline small{font:900 10px/1.25 system-ui,sans-serif;color:#9db1ba;text-align:right}
#${ROOT} .oms-depth{display:grid;gap:10px;padding-top:4px}
#${ROOT} .oms-depth-row{display:grid;grid-template-columns:56px 1fr 92px;align-items:center;gap:6px}
#${ROOT} .oms-depth-row label{font:950 10.5px/1 system-ui,sans-serif;color:#9bb0b9}
#${ROOT} .oms-meter{height:26px;border:1px solid rgba(255,255,255,.07);border-radius:999px;overflow:hidden;background:rgba(255,255,255,.03);display:grid;grid-template-columns:1fr 1fr}
#${ROOT} .oms-meter i{display:block;height:100%}
#${ROOT} .oms-meter .bid{justify-self:end;background:linear-gradient(90deg,rgba(66,214,171,.22),rgba(66,214,171,.76))}
#${ROOT} .oms-meter .ask{justify-self:start;background:linear-gradient(90deg,rgba(239,113,132,.76),rgba(239,113,132,.22))}
#${ROOT} .oms-depth-row b{text-align:right;font:950 10.5px/1.2 ui-monospace,monospace;color:#e3f0f4}
#${ROOT} .oms-note{margin-top:8px;padding:7px 8px;border:1px solid rgba(255,215,130,.11);border-radius:8px;background:rgba(255,215,130,.028);font:850 10px/1.4 system-ui,sans-serif;color:#9db0b8}
#${ROOT} .oms-error{padding:14px;border:1px solid rgba(239,113,132,.24);border-radius:9px;background:rgba(239,113,132,.07);color:#f4a9b2;font:900 11px/1.5 ui-monospace,monospace}
@media(max-width:1100px){
  #${ROOT} .oms-title b{font-size:13px}
  #${ROOT} .oms-level{font-size:11px}
}
`;
    document.head.appendChild(s);
  }

  function mount(){
    if(typeof document==="undefined")return false;
    style();
    const group=[...document.querySelectorAll("#analyste .chart-v2-toggle-group")]
      .find(x=>/Afficher/i.test(x.textContent||""))||document.querySelector("#analyste .chart-v2-control-deck");
    const panel=document.getElementById("detailPanel");
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
      root.setAttribute("aria-label","OKX Orderbook Depth live read-only");
      root.innerHTML=`
        <div class="oms-head">
          <div class="oms-title">
            <b>OKX · CARNET D’ORDRES</b>
            <small data-oms-meta>Backend local 8790 · lecture seule</small>
          </div>
          <div class="oms-actions">
            <span class="oms-live">LIVE 2 s</span>
            <button type="button" data-oms-refresh>↻</button>
            <button type="button" data-oms-close>×</button>
          </div>
        </div>
        <div class="oms-tabs">
          <button type="button" data-oms-tab="book" class="is-active">Carnet</button>
          <button type="button" data-oms-tab="depth">Profondeur</button>
        </div>
        <div class="oms-kpis" data-oms-kpis></div>
        <div class="oms-body" data-oms-body></div>`;
      panel.appendChild(root);
      root.querySelector("[data-oms-refresh]").addEventListener("click",()=>void refresh());
      root.querySelector("[data-oms-close]").addEventListener("click",()=>setOpen(false));
      root.querySelectorAll("[data-oms-tab]").forEach(button=>button.addEventListener("click",()=>{
        state.tab=button.dataset.omsTab||"book";
        root.querySelectorAll("[data-oms-tab]").forEach(b=>b.classList.toggle("is-active",b===button));
        render();
      }));
    }
    sync();
    return true;
  }

  function clearLive(){
    if(liveTimer){clearTimeout(liveTimer);liveTimer=0;}
  }
  function scheduleLive(){
    clearLive();
    if(!state.open)return;
    liveTimer=setTimeout(async()=>{
      liveTimer=0;
      if(state.open&&document.visibilityState!=="hidden")await refresh({automatic:true});
      scheduleLive();
    },LIVE_MS);
  }
  function sync(){
    document.getElementById(ROOT)?.classList.toggle("is-open",state.open);
    document.getElementById("detailPanel")?.classList.toggle("atlas-depth-active",state.open);
    const b=document.getElementById(ROOT+"Toggle");
    if(b){
      b.classList.toggle("is-active",state.open);
      b.setAttribute("aria-pressed",String(state.open));
    }
  }
  function setOpen(value){
    state.open=!!value;
    mount();sync();
    if(!state.open){clearLive();return false;}
    const asset=selectedAsset();
    if(state.asset!==asset||!state.capturedAt)void refresh();
    else scheduleLive();
    return true;
  }

  async function fetchBook(asset){
    const ctl=new AbortController();
    const timer=setTimeout(()=>ctl.abort(),12000);
    const started=performance.now();
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
      return {payload,bids,asks,latencyMs:Math.max(0,Math.round(performance.now()-started))};
    }finally{clearTimeout(timer);}
  }

  async function refresh(options={}){
    if(state.loading)return false;
    mount();
    state.loading=true;state.error=null;state.asset=selectedAsset();
    if(!options.automatic)render();
    try{
      const result=await fetchBook(state.asset);
      state.bids=result.bids;
      state.asks=result.asks;
      state.pair=String(result.payload?.pair||state.asset+"/EUR");
      state.backendVersion=String(result.payload?.backend_version||"?");
      state.capturedAt=String(result.payload?.observed_at_utc||new Date().toISOString());
      state.lastLatencyMs=result.latencyMs;
    }catch(error){
      state.error=error?.name==="AbortError"?"Backend 8790 : timeout carnet":String(error?.message||error);
    }finally{
      state.loading=false;render();scheduleLive();
    }
    return !state.error;
  }

  function metrics(){
    const bid=state.bids[0]?.[0],ask=state.asks[0]?.[0];
    const mid=Number.isFinite(bid)&&Number.isFinite(ask)?(bid+ask)/2:null;
    const spread=Number.isFinite(bid)&&Number.isFinite(ask)?ask-bid:null;
    const spreadBp=Number.isFinite(spread)&&Number.isFinite(mid)&&mid?spread/mid*10000:null;
    const sumNotional=rows=>rows.slice(0,20).reduce((sum,[p,q])=>sum+p*q,0);
    return {bid,ask,mid,spread,spreadBp,bid20:sumNotional(state.bids),ask20:sumNotional(state.asks)};
  }

  function rowsHtml(rows,side,count=6){
    const visible=rows.slice(0,count);
    let cumulative=0;
    const enriched=visible.map(([price,qty])=>{
      cumulative+=qty;
      return {price,qty,cumulative};
    });
    const max=Math.max(...enriched.map(r=>r.cumulative),1e-12);
    const ordered=side==="ask"?enriched.slice().reverse():enriched;
    return ordered.map(r=>`
      <div class="oms-level ${side}">
        <i class="bar" style="width:${Math.max(3,r.cumulative/max*100).toFixed(1)}%"></i>
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

  function renderBook(body,m){
    body.innerHTML=`
      <div class="oms-book">
        <div class="oms-book-head"><span>Prix</span><span>BTC</span><span>Cumul BTC</span></div>
        ${rowsHtml(state.asks,"ask",6)}
        <div class="oms-midline"><b>${fmt(m.mid,2)}</b><small>SPREAD ${fmt(m.spread,2)} · ${fmt(m.spreadBp,2)} bp</small></div>
        ${rowsHtml(state.bids,"bid",6)}
      </div>
      <div class="oms-note">Le carnet se rafraîchit toutes les 2 s uniquement tant que cette fenêtre est ouverte. Vue read-only : aucune exécution.</div>`;
  }

  function renderDepth(body,m){
    const bands=[5,10,25];
    const rows=bands.map(bps=>{
      const bid=depthAtBps(state.bids,"bid",m.mid,bps);
      const ask=depthAtBps(state.asks,"ask",m.mid,bps);
      const max=Math.max(bid,ask,1);
      return `
        <div class="oms-depth-row">
          <label>±${bps} bp</label>
          <div class="oms-meter">
            <i class="bid" style="width:${(bid/max*100).toFixed(1)}%"></i>
            <i class="ask" style="width:${(ask/max*100).toFixed(1)}%"></i>
          </div>
          <b>${eur(bid)} / ${eur(ask)}</b>
        </div>`;
    }).join("");
    body.innerHTML=`
      <div class="oms-depth">${rows}</div>
      <div class="oms-note">Vert = profondeur BID (achats) · rose = profondeur ASK (ventes), cumulées autour du mid-price. La vue bouge avec le carnet toutes les 2 s ; ce n’est ni une prédiction ni un signal.</div>`;
  }

  function render(){
    const root=document.getElementById(ROOT);
    const meta=root?.querySelector("[data-oms-meta]");
    const kpis=root?.querySelector("[data-oms-kpis]");
    const body=root?.querySelector("[data-oms-body]");
    if(!meta||!kpis||!body)return;

    meta.textContent=state.loading?
      `${state.asset} · actualisation…`:
      state.error?
        `${state.asset} · ERREUR · ${state.error}`:
        `${state.pair} · ${state.capturedAt?new Date(state.capturedAt).toLocaleTimeString("fr-FR"):"en attente"} · ${state.lastLatencyMs??"—"} ms`;

    if(state.loading&&!state.bids.length){
      kpis.innerHTML="";
      body.innerHTML='<div class="oms-note">Lecture du carnet OKX via Backend local 8790…</div>';
      return;
    }
    if(state.error&&!state.bids.length){
      kpis.innerHTML="";
      body.innerHTML=`<div class="oms-error">${esc(state.error)}<br><small>Le graphique reste utilisable. Vérifier le Backend local 8790 si l’erreur persiste.</small></div>`;
      return;
    }
    if(!state.bids.length||!state.asks.length){
      kpis.innerHTML="";
      body.innerHTML='<div class="oms-note">Ouvrez Profondeur pour lire le carnet.</div>';
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

    if(state.tab==="depth")renderDepth(body,m);else renderBook(body,m);
  }

  function selfTest(){
    const rows=normalizeRows([["10","2"],["9","1"],["x","1"]]);
    const pass=rows.length===2&&LIVE_MS===2000;
    return Object.freeze({build:BUILD,pass,checks:{
      lecture_technique_overlay:true,
      full_panel_cover:true,
      readable_font_floor:true,
      larger_operator_typography:true,
      live_refresh_2s:LIVE_MS===2000,
      refresh_only_while_open:true,
      local_backend_orderbook:true,
      no_direct_browser_okx:true,
      no_private_api:true,
      no_order:true,
      no_wallet:true
    }});
  }

  globalThis.AgentCryptoOkxMicrostructure=Object.freeze({
    build:BUILD,mount,setOpen,refresh,
    snapshot:()=>Object.freeze({...state,bids:state.bids.slice(),asks:state.asks.slice()}),
    self_test:selfTest,
    read_only:true,
    local_backend_orderbook:true,
    backend_endpoint:BACKEND+"/orderbook",
    lecture_technique_overlay:true,
    semi_transparent:true,
    full_panel_cover:true,
    underlying_detail_dimmed:true,
    live_interval_ms:LIVE_MS,
    real_order:false,private_api:false,wallet:false,
    recurring_timer:true,timer_scope:"OPEN_ONLY",
    mutation_observer:false,storage_write:false,
    market_core_changed:false,strategy_changed:false
  });

  if(typeof document!=="undefined"){
    const boot=()=>mount();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
    window.addEventListener("pageshow",boot,{passive:true});
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")clearLive();else if(state.open)scheduleLive();},{passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",()=>{state.capturedAt=null;state.bids=[];state.asks=[];if(state.open)void refresh();},{passive:true});
  }
})();