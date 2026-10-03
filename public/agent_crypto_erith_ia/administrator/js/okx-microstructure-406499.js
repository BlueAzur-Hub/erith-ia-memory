/* Agent-Crypto — 40.6.510 OKX ORDERBOOK CONTEXT + FRESHNESS TRUTH
   Bounded repair after independent audit:
   - validate requested asset / returned pair / EUR quote before commit;
   - require a valid, recent source timestamp;
   - keep source time distinct from receive time;
   - never relabel old levels as a newly requested asset;
   - expose FRESH / STALE / OFFLINE / UNKNOWN instead of unconditional LIVE.
   Presentation geometry from 40.6.507 is preserved.
   Read-only. No private API, no order, no wallet, no Strategy/Market Core mutation. */
(()=>{
  "use strict";
  const BUILD="40.6.510";
  const ROOT="atlasOkxMicrostructure";
  const BACKEND="http://127.0.0.1:8790";
  const LIVE_MS=2000;
  const FRESH_MAX_AGE_MS=15000;
  const FUTURE_TOLERANCE_MS=5000;
  const state={
    open:false,loading:false,asset:"BTC",requestedAsset:"BTC",loadedAsset:null,loadingAsset:null,pendingAsset:null,
    pair:"BTC/EUR",quote:"EUR",capturedAt:null,sourceObservedAt:null,receivedAt:null,sourceAgeMs:null,freshness:"UNKNOWN",
    bids:[],asks:[],tab:"book",error:null,backendVersion:null,lastLatencyMs:null,activeController:null,requestSeq:0,
    detached:false,floatX:null,floatY:null,floatW:null,floatH:null,dragging:false,dragDx:0,dragDy:0,minimized:false,maximized:false,restoreDetached:false,maxRestore:null
  };
  let liveTimer=0;
  let dockSyncTimer=0;
  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null;};
  const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("fr-FR",{maximumFractionDigits:d}):"—";
  const eur=v=>Number.isFinite(v)?v.toLocaleString("fr-FR",{maximumFractionDigits:0})+" €":"—";
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const bookError=(code,message)=>{const error=new Error(message);error.code=code;return error;};
  const parsePair=value=>{
    const match=String(value||"").trim().toUpperCase().replace(/_/g,"-").match(/^([A-Z0-9]+)[\/-]([A-Z0-9]+)$/);
    return match?{base:match[1],quote:match[2],display:`${match[1]}/${match[2]}`}:null;
  };
  const parseSourceTime=value=>{
    const raw=String(value||"").trim();
    if(!raw)return null;
    const ms=Date.parse(raw);
    return Number.isFinite(ms)?ms:null;
  };
  function classifyError(error){
    if(error?.code==="STALE_BOOK")return "STALE";
    if(error?.name==="AbortError")return "OFFLINE";
    if(error?.code==="PAIR_MISMATCH"||error?.code==="ASSET_MISMATCH"||error?.code==="QUOTE_MISMATCH"||error?.code==="SOURCE_TIME_INVALID"||error?.code==="SOURCE_TIME_FUTURE")return "UNKNOWN";
    return "OFFLINE";
  }
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
  overflow:hidden;border:1px solid rgba(87,219,232,.42);border-radius:14px;
  background:linear-gradient(180deg,rgba(2,10,17,.76),rgba(3,14,22,.70));
  box-shadow:0 20px 70px rgba(0,0,0,.56);backdrop-filter:blur(7px) saturate(.96);
  color:#e2f2f6
}
#${ROOT}.is-open{display:grid;grid-template-rows:auto auto auto 1fr}
#detailPanel.atlas-depth-active{overflow:hidden}
#detailPanel.atlas-depth-active> :not(#${ROOT}){pointer-events:none;transition:opacity .15s ease,filter .15s ease}
#detailPanel.atlas-depth-active>.detail-project-visual{opacity:.72!important;filter:saturate(.80) brightness(.78)!important}
#detailPanel.atlas-depth-active>:not(.detail-project-visual):not(#${ROOT}){opacity:.20!important;filter:saturate(.45) brightness(.58)!important}
#${ROOT}.is-detached{
  position:fixed;inset:auto;z-index:1600;
  width:420px;height:610px;min-width:340px;min-height:390px;
  max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);
  resize:both;overflow:hidden;
  background:linear-gradient(180deg,rgba(2,10,17,.92),rgba(3,14,22,.88));
  backdrop-filter:blur(12px) saturate(.98);
  box-shadow:0 28px 85px rgba(0,0,0,.68)
}
#${ROOT} .oms-head{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:12px 11px 9px;border-bottom:1px solid rgba(255,255,255,.075);user-select:none}
#${ROOT}.is-detached .oms-head{cursor:grab}
#${ROOT}.is-detached.is-dragging .oms-head{cursor:grabbing}
#${ROOT}.is-minimized{height:48px!important;min-height:48px!important;resize:none!important;overflow:hidden!important}
#${ROOT}.is-minimized .oms-tabs,#${ROOT}.is-minimized .oms-kpis,#${ROOT}.is-minimized .oms-body{display:none!important}
#${ROOT}.is-maximized{z-index:2147481800!important;resize:none!important}
#${ROOT} .oms-title{display:grid;gap:3px;min-width:0}
#${ROOT} .oms-title b{font:950 15px/1.08 system-ui,sans-serif;color:#a8f7f5;letter-spacing:.045em}
#${ROOT} .oms-title small{font:850 10.5px/1.3 ui-monospace,monospace;color:#9db5bf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${ROOT} .oms-actions{display:flex;align-items:center;gap:5px}
#${ROOT} button{min-height:30px;padding:6px 9px;border:1px solid rgba(255,255,255,.15);border-radius:999px;background:rgba(255,255,255,.055);color:#e2f0f4;font:900 10px/1 system-ui,sans-serif;cursor:pointer}
#${ROOT} button.is-active{background:rgba(81,224,229,.18);border-color:rgba(81,224,229,.55);color:#a6f8f7}
#${ROOT} .oms-live{display:inline-flex;align-items:center;gap:5px;font:900 10px/1 ui-monospace,monospace;color:#a9b9c0}
#${ROOT} .oms-live::before{content:"";width:7px;height:7px;border-radius:50%;background:#8fa0a8;box-shadow:0 0 8px rgba(143,160,168,.55)}
#${ROOT} .oms-live[data-state="FRESH"]{color:#84e6c9}
#${ROOT} .oms-live[data-state="FRESH"]::before{background:#67e0bb;box-shadow:0 0 10px rgba(103,224,187,.8)}
#${ROOT} .oms-live[data-state="STALE"]{color:#ffd27f}
#${ROOT} .oms-live[data-state="STALE"]::before{background:#e9b45a;box-shadow:0 0 10px rgba(233,180,90,.65)}
#${ROOT} .oms-live[data-state="OFFLINE"]{color:#f2a0aa}
#${ROOT} .oms-live[data-state="OFFLINE"]::before{background:#ef7184;box-shadow:0 0 10px rgba(239,113,132,.65)}
#${ROOT} .oms-live[data-state="UNKNOWN"]{color:#a9b9c0}
#${ROOT} .oms-tabs{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06)}
#${ROOT} .oms-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:9px 10px}
#${ROOT} .oms-kpis span{min-width:0;padding:8px 9px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(1,9,15,.50)}
#${ROOT} .oms-kpis small{display:block;font:900 9.5px/1.18 system-ui,sans-serif;color:#91aab5;letter-spacing:.04em}
#${ROOT} .oms-kpis b{display:block;margin-top:4px;font:950 13px/1.16 ui-monospace,monospace;color:#f0fbfd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${ROOT} .oms-body{min-height:0;overflow:auto;padding:0 10px 11px}
#${ROOT} .oms-book{display:grid;gap:5px}
#${ROOT} .oms-book-head{display:grid;grid-template-columns:1fr .8fr .8fr;padding:2px 7px 5px;color:#90aab5;font:900 9.5px/1 system-ui,sans-serif}
#${ROOT} .oms-book-head span:not(:first-child){text-align:right}
#${ROOT} .oms-level{display:grid;grid-template-columns:1fr .8fr .8fr;align-items:center;position:relative;min-height:28px;padding:0 7px;border-radius:5px;font:900 11.5px/1 ui-monospace,monospace;overflow:hidden}
#${ROOT} .oms-level .bar{position:absolute;top:1px;bottom:1px;right:0;opacity:.20;pointer-events:none}
#${ROOT} .oms-level.ask .bar{background:#ef7184}
#${ROOT} .oms-level.bid .bar{background:#49d5ad}
#${ROOT} .oms-level span{position:relative;z-index:1;text-align:right}
#${ROOT} .oms-level span:first-of-type{text-align:left}
#${ROOT} .oms-level.ask .price{color:#f3a0aa}
#${ROOT} .oms-level.bid .price{color:#88e8cd}
#${ROOT} .oms-midline{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;margin:5px 0;padding:8px 9px;border:1px solid rgba(255,215,130,.15);border-radius:7px;background:rgba(255,215,130,.05)}
#${ROOT} .oms-midline b{font:950 14px/1 ui-monospace,monospace;color:#ffe2a3}
#${ROOT} .oms-midline small{font:900 10px/1.25 system-ui,sans-serif;color:#acbdc4;text-align:right}
#${ROOT} .oms-depth{display:grid;gap:10px;padding-top:4px}
#${ROOT} .oms-depth-row{display:grid;grid-template-columns:56px 1fr 96px;align-items:center;gap:6px}
#${ROOT} .oms-depth-row label{font:950 10.5px/1 system-ui,sans-serif;color:#aabdc5}
#${ROOT} .oms-meter{height:25px;border:1px solid rgba(255,255,255,.07);border-radius:999px;overflow:hidden;background:rgba(255,255,255,.03);display:grid;grid-template-columns:1fr 1fr}
#${ROOT} .oms-meter i{display:block;height:100%}
#${ROOT} .oms-meter .bid{justify-self:end;background:linear-gradient(90deg,rgba(66,214,171,.22),rgba(66,214,171,.76))}
#${ROOT} .oms-meter .ask{justify-self:start;background:linear-gradient(90deg,rgba(239,113,132,.76),rgba(239,113,132,.22))}
#${ROOT} .oms-depth-row b{text-align:right;font:950 10.5px/1.2 ui-monospace,monospace;color:#e8f3f6}
#${ROOT} .oms-note{margin-top:8px;padding:8px;border:1px solid rgba(255,215,130,.11);border-radius:8px;background:rgba(1,9,15,.44);font:850 10px/1.4 system-ui,sans-serif;color:#aebfc6}
#${ROOT} .oms-error{padding:14px;border:1px solid rgba(239,113,132,.24);border-radius:9px;background:rgba(239,113,132,.08);color:#f4a9b2;font:900 11px/1.5 ui-monospace,monospace}
@media(max-width:1100px){
  #${ROOT} .oms-title b{font-size:13px}
  #${ROOT} .oms-level{font-size:10.5px}
  #${ROOT}.is-detached{width:min(400px,calc(100vw - 16px));height:min(560px,calc(100vh - 16px))}
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
      root.classList.add("admin-native-control-host","admin-native-tone-cyan");
      root.setAttribute("aria-label","OKX Orderbook Depth live read-only");
      root.innerHTML=`
        <div class="oms-head">
          <div class="oms-title">
            <b>OKX · CARNET D’ORDRES</b>
            <small data-oms-meta>Backend local 8790 · lecture seule</small>
          </div>
          <div class="oms-actions">
            <span class="oms-live" data-oms-live data-state="UNKNOWN">UNKNOWN</span>
          </div>
          <div class="admin-native-controls admin-native-controls-native" role="group" aria-label="Commandes fenêtre Administrator · Profondeur">
            <button type="button" class="admin-native-control admin-native-move" data-oms-move title="Détacher et déplacer Profondeur" aria-label="Détacher et déplacer Profondeur">⠿</button>
            <button type="button" class="admin-native-control admin-native-minimize" data-oms-minimize title="Réduire Profondeur" aria-label="Réduire Profondeur">—</button>
            <button type="button" class="admin-native-control admin-native-float" data-oms-detach title="Détacher Profondeur" aria-label="Détacher Profondeur">□</button>
            <button type="button" class="admin-native-control admin-native-maximize" data-oms-maximize title="Agrandir Profondeur" aria-label="Agrandir Profondeur">⤢</button>
            <button type="button" class="admin-native-control admin-native-hide" data-oms-close title="Masquer Profondeur" aria-label="Masquer Profondeur">×</button>
          </div>
        </div>
        <div class="oms-tabs">
          <button type="button" data-oms-tab="book" class="is-active">Carnet</button>
          <button type="button" data-oms-tab="depth">Profondeur</button>
        </div>
        <div class="oms-kpis" data-oms-kpis></div>
        <div class="oms-body" data-oms-body></div>`;
      document.body.appendChild(root);
      root.dataset.portalOwner="depth-40.6.506";
      root.querySelector("[data-oms-detach]").addEventListener("click",event=>{event.preventDefault();event.stopPropagation();setDetached(!state.detached);});
      root.querySelector("[data-oms-minimize]").addEventListener("click",event=>{event.preventDefault();event.stopPropagation();setMinimized(!state.minimized);});
      root.querySelector("[data-oms-maximize]").addEventListener("click",event=>{event.preventDefault();event.stopPropagation();setMaximized(!state.maximized);});
      root.querySelector("[data-oms-close]").addEventListener("click",event=>{event.preventDefault();event.stopPropagation();setOpen(false);});
      root.querySelectorAll("[data-oms-tab]").forEach(button=>button.addEventListener("click",()=>{
        state.tab=button.dataset.omsTab||"book";
        root.querySelectorAll("[data-oms-tab]").forEach(b=>b.classList.toggle("is-active",b===button));
        render();
      }));
      root.addEventListener("pointerdown",event=>event.stopPropagation());
      root.addEventListener("click",event=>event.stopPropagation());
      const move=root.querySelector("[data-oms-move]");
      move.addEventListener("pointerdown",onMoveHandleStart);
      move.addEventListener("pointermove",onDragMove);
      move.addEventListener("pointerup",onDragEnd);
      move.addEventListener("pointercancel",onDragEnd);
    }
    sync();
    return true;
  }

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function stopDockSync(){
    if(dockSyncTimer){clearInterval(dockSyncTimer);dockSyncTimer=0;}
  }
  function startDockSync(){
    stopDockSync();
    if(!state.open||state.detached||state.maximized)return;
    applyDockRect();
    dockSyncTimer=setInterval(()=>{if(state.open&&!state.detached&&!state.maximized)applyDockRect();else stopDockSync();},180);
  }
  function rememberFloatRect(){
    const root=document.getElementById(ROOT);
    if(!root||!state.detached)return;
    const r=root.getBoundingClientRect();
    state.floatX=r.left;state.floatY=r.top;state.floatW=r.width;state.floatH=r.height;
  }
  function dockRect(){
    const panel=document.getElementById("detailPanel");
    const r=panel?.getBoundingClientRect?.();
    if(!r||r.width<10||r.height<10)return null;
    return {x:r.left,y:r.top,width:r.width,height:r.height};
  }
  function applyDockRect(){
    const root=document.getElementById(ROOT);
    if(!root||state.detached)return false;
    const r=dockRect();
    if(!r)return false;
    root.classList.remove("is-detached","is-dragging");
    Object.assign(root.style,{
      position:"fixed",
      left:Math.round(r.x)+"px",
      top:Math.round(r.y)+"px",
      width:Math.round(r.width)+"px",
      height:(state.minimized?48:Math.round(r.height))+"px",
      right:"auto",
      bottom:"auto"
    });
    return true;
  }
  function applyPlacement(){
    const root=document.getElementById(ROOT),panel=document.getElementById("detailPanel");
    if(!root||!panel)return;
    if(root.parentElement!==document.body)document.body.appendChild(root);
    root.classList.toggle("is-minimized",state.minimized);
    root.classList.toggle("is-maximized",state.maximized);
    if(state.maximized){
      stopDockSync();
      panel.classList.remove("atlas-depth-active");
      root.classList.add("is-detached");
      Object.assign(root.style,{position:"fixed",left:"12px",top:"12px",width:"calc(100vw - 24px)",height:"calc(100vh - 24px)",right:"auto",bottom:"auto"});
      return;
    }
    if(state.detached){
      stopDockSync();
      root.classList.add("is-detached");
      panel.classList.remove("atlas-depth-active");
      if(!Number.isFinite(state.floatX)||!Number.isFinite(state.floatY)){
        const p=panel.getBoundingClientRect();
        const w=clamp(Math.max(380,p.width),340,480);
        const h=clamp(Math.max(500,Math.min(p.height,640)),390,Math.max(390,window.innerHeight-16));
        state.floatW=w;state.floatH=h;
        state.floatX=clamp(p.left-w-12,8,Math.max(8,window.innerWidth-w-8));
        state.floatY=clamp(p.top,8,Math.max(8,window.innerHeight-h-8));
      }
      const w=clamp(state.floatW||420,340,Math.max(340,window.innerWidth-16));
      const h=clamp(state.floatH||610,390,Math.max(390,window.innerHeight-16));
      state.floatW=w;state.floatH=h;
      state.floatX=clamp(state.floatX??8,8,Math.max(8,window.innerWidth-w-8));
      state.floatY=clamp(state.floatY??8,8,Math.max(8,window.innerHeight-h-8));
      Object.assign(root.style,{position:"fixed",left:state.floatX+"px",top:state.floatY+"px",width:w+"px",height:h+"px",right:"auto",bottom:"auto"});
    }else{
      root.classList.remove("is-detached","is-dragging");
      panel.classList.toggle("atlas-depth-active",state.open&&!state.minimized);
      applyDockRect();
      startDockSync();
    }
  }
  function setDetached(value){
    const next=!!value;
    if(next===state.detached)return state.detached;
    const root=document.getElementById(ROOT);
    if(next&&root){
      const r=root.getBoundingClientRect();
      state.floatX=r.left;state.floatY=r.top;state.floatW=r.width;state.floatH=r.height;
    }else if(!next){
      rememberFloatRect();
    }
    state.detached=next;
    applyPlacement();sync();
    return state.detached;
  }
  function setMinimized(value){
    state.minimized=!!value;
    if(state.minimized&&state.maximized)state.maximized=false;
    applyPlacement();sync();
    return state.minimized;
  }
  function setMaximized(value){
    const next=!!value;
    const root=document.getElementById(ROOT);
    if(next===state.maximized)return state.maximized;
    if(next){
      if(root){
        const r=root.getBoundingClientRect();
        state.maxRestore={x:r.left,y:r.top,width:r.width,height:r.height};
      }
      state.restoreDetached=state.detached;
      state.maximized=true;
      state.minimized=false;
      state.detached=true;
    }else{
      state.maximized=false;
      state.detached=state.restoreDetached===true;
      if(state.detached&&state.maxRestore){
        state.floatX=state.maxRestore.x;state.floatY=state.maxRestore.y;
        state.floatW=state.maxRestore.width;state.floatH=state.maxRestore.height;
      }
    }
    applyPlacement();sync();
    return state.maximized;
  }
  function onMoveHandleStart(event){
    event.stopPropagation();
    if(event.button!==0)return;
    const root=document.getElementById(ROOT);
    if(!root||state.maximized)return;
    if(state.minimized)setMinimized(false);
    if(!state.detached)setDetached(true);
    const r=root.getBoundingClientRect();
    state.dragging=true;state.dragDx=event.clientX-r.left;state.dragDy=event.clientY-r.top;
    root.classList.add("is-dragging");
    try{event.currentTarget.setPointerCapture(event.pointerId);}catch(_){}
    event.preventDefault();
  }
  function onDragMove(event){
    event.stopPropagation();
    if(!state.detached||!state.dragging)return;
    const root=document.getElementById(ROOT);
    if(!root)return;
    const r=root.getBoundingClientRect();
    const x=clamp(event.clientX-state.dragDx,8,Math.max(8,window.innerWidth-r.width-8));
    const y=clamp(event.clientY-state.dragDy,8,Math.max(8,window.innerHeight-r.height-8));
    state.floatX=x;state.floatY=y;
    root.style.left=x+"px";root.style.top=y+"px";
    event.preventDefault();
  }
  function onDragEnd(event){
    event.stopPropagation();
    if(!state.dragging)return;
    state.dragging=false;
    document.getElementById(ROOT)?.classList.remove("is-dragging");
    rememberFloatRect();
    try{event.currentTarget.releasePointerCapture(event.pointerId);}catch(_){}
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
    const root=document.getElementById(ROOT);
    root?.classList.toggle("is-open",state.open);
    const panel=document.getElementById("detailPanel");
    panel?.classList.toggle("atlas-depth-active",state.open&&!state.detached&&!state.minimized&&!state.maximized);
    const detach=root?.querySelector("[data-oms-detach]");
    if(detach){
      detach.textContent=state.detached?"▣":"□";
      detach.title=state.detached?"Raccrocher Profondeur":"Détacher Profondeur";
      detach.setAttribute("aria-label",detach.title);
    }
    const minimize=root?.querySelector("[data-oms-minimize]");
    if(minimize){
      minimize.textContent=state.minimized?"+":"—";
      minimize.title=state.minimized?"Restaurer Profondeur":"Réduire Profondeur";
      minimize.setAttribute("aria-label",minimize.title);
    }
    const maximize=root?.querySelector("[data-oms-maximize]");
    if(maximize){
      maximize.textContent=state.maximized?"↙":"⤢";
      maximize.title=state.maximized?"Restaurer la taille de Profondeur":"Agrandir Profondeur";
      maximize.setAttribute("aria-label",maximize.title);
    }
    const move=root?.querySelector("[data-oms-move]");
    if(move){
      move.title=state.detached?"Déplacer Profondeur":"Détacher et déplacer Profondeur";
      move.setAttribute("aria-label",move.title);
    }
    const b=document.getElementById(ROOT+"Toggle");
    if(b){
      b.classList.toggle("is-active",state.open);
      b.setAttribute("aria-pressed",String(state.open));
    }
  }
  function setOpen(value){
    state.open=!!value;
    mount();applyPlacement();sync();
    if(!state.open){clearLive();stopDockSync();document.getElementById("detailPanel")?.classList.remove("atlas-depth-active");return false;}
    const asset=selectedAsset();
    if(state.asset!==asset||!state.capturedAt)void refresh();
    else scheduleLive();
    return true;
  }

  function validateBookPayload(payload,requestedAsset,nowMs=Date.now()){
    const asset=String(requestedAsset||"").trim().toUpperCase();
    if(!asset)throw bookError("ASSET_MISMATCH","actif demandé absent");
    if(payload?.read_only!==true)throw bookError("CONTRACT_INVALID","contrat read-only absent");
    if(String(payload?.provider||"").toLowerCase()!=="okx")throw bookError("CONTRACT_INVALID","provider != OKX");
    if(String(payload?.status||"").toLowerCase()!=="ok")throw bookError("BACKEND_STATUS",payload?.error||("status "+payload?.status));
    const payloadAsset=String(payload?.asset||"").trim().toUpperCase();
    if(payloadAsset!==asset)throw bookError("ASSET_MISMATCH",`actif reçu ${payloadAsset||"?"} != demandé ${asset}`);
    const pair=parsePair(payload?.pair);
    if(!pair)throw bookError("PAIR_MISMATCH","paire source absente ou invalide");
    if(pair.base!==asset)throw bookError("PAIR_MISMATCH",`paire reçue ${pair.display} != actif demandé ${asset}`);
    if(pair.quote!=="EUR")throw bookError("QUOTE_MISMATCH",`devise reçue ${pair.quote} != EUR`);
    const observedMs=parseSourceTime(payload?.observed_at_utc);
    if(observedMs===null)throw bookError("SOURCE_TIME_INVALID","timestamp source absent ou invalide");
    const ageMs=nowMs-observedMs;
    if(ageMs < -FUTURE_TOLERANCE_MS)throw bookError("SOURCE_TIME_FUTURE","timestamp source dans le futur");
    if(ageMs > FRESH_MAX_AGE_MS)throw bookError("STALE_BOOK",`carnet périmé (${Math.round(ageMs/1000)} s)`);
    const bids=normalizeRows(payload?.bids).sort((a,b)=>b[0]-a[0]);
    const asks=normalizeRows(payload?.asks).sort((a,b)=>a[0]-b[0]);
    if(!bids.length||!asks.length)throw bookError("BOOK_EMPTY","carnet vide");
    if(bids[0][0]>asks[0][0])throw bookError("BOOK_CROSSED","carnet croisé");
    return {
      payload,bids,asks,asset,pair:pair.display,quote:pair.quote,
      sourceObservedAt:new Date(observedMs).toISOString(),
      receivedAt:new Date(nowMs).toISOString(),
      ageMs:Math.max(0,ageMs)
    };
  }

  function clearBookForAsset(asset){
    const next=String(asset||"BTC").trim().toUpperCase()||"BTC";
    state.asset=next;state.requestedAsset=next;state.loadedAsset=null;
    state.pair=`${next}/EUR`;state.quote="EUR";
    state.bids=[];state.asks=[];state.capturedAt=null;state.sourceObservedAt=null;state.receivedAt=null;state.sourceAgeMs=null;
    state.backendVersion=null;state.lastLatencyMs=null;state.freshness="UNKNOWN";
  }

  async function fetchBook(asset,controller=new AbortController()){
    const timer=setTimeout(()=>controller.abort(),12000);
    const started=performance.now();
    try{
      const url=new URL(BACKEND+"/orderbook");
      url.searchParams.set("asset",asset);
      url.searchParams.set("depth","100");
      const response=await fetch(url,{cache:"no-store",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!response.ok)throw bookError("BACKEND_HTTP","Backend 8790 orderbook HTTP "+response.status);
      const payload=await response.json();
      const validated=validateBookPayload(payload,asset,Date.now());
      return {...validated,latencyMs:Math.max(0,Math.round(performance.now()-started))};
    }finally{clearTimeout(timer);}
  }

  async function refresh(options={}){
    mount();
    const requested=String(options.asset||selectedAsset()||"BTC").trim().toUpperCase();
    state.asset=requested;state.requestedAsset=requested;

    if(state.loading){
      if(requested!==state.loadingAsset){
        state.pendingAsset=requested;
        if(state.loadedAsset!==requested)clearBookForAsset(requested);
        try{state.activeController?.abort();}catch(_){}
        render();
      }
      return false;
    }

    const requestAsset=requested;
    if(state.loadedAsset!==requestAsset)clearBookForAsset(requestAsset);
    const seq=++state.requestSeq;
    const controller=new AbortController();
    state.activeController=controller;state.loadingAsset=requestAsset;state.pendingAsset=null;
    state.loading=true;state.error=null;state.freshness="UNKNOWN";
    if(!options.automatic)render();

    let ok=false;
    try{
      const result=await fetchBook(requestAsset,controller);
      if(seq!==state.requestSeq||state.requestedAsset!==requestAsset){
        throw bookError("SUPERSEDED_REQUEST","réponse carnet dépassée par une nouvelle sélection");
      }
      state.bids=result.bids;state.asks=result.asks;
      state.loadedAsset=result.asset;state.asset=result.asset;state.pair=result.pair;state.quote=result.quote;
      state.backendVersion=String(result.payload?.backend_version||"?");
      state.capturedAt=result.sourceObservedAt;state.sourceObservedAt=result.sourceObservedAt;state.receivedAt=result.receivedAt;state.sourceAgeMs=result.ageMs;
      state.lastLatencyMs=result.latencyMs;state.freshness="FRESH";state.error=null;ok=true;
    }catch(error){
      const superseded=error?.code==="SUPERSEDED_REQUEST"||(error?.name==="AbortError"&&state.pendingAsset&&state.pendingAsset!==requestAsset);
      if(!superseded){
        const freshState=classifyError(error);
        const message=error?.name==="AbortError"?"Backend 8790 : timeout / annulation carnet":String(error?.message||error);
        if(state.loadedAsset!==requestAsset)clearBookForAsset(requestAsset);
        state.freshness=freshState;state.error=message;
      }
    }finally{
      state.loading=false;state.loadingAsset=null;state.activeController=null;
      const pending=state.pendingAsset;
      state.pendingAsset=null;
      render();
      if(pending&&state.open){
        queueMicrotask(()=>void refresh({automatic:true,asset:pending}));
      }else{
        scheduleLive();
      }
    }
    return ok;
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
        <div class="oms-book-head"><span>Prix</span><span>${esc(state.loadedAsset||state.requestedAsset||state.asset)}</span><span>Cumul ${esc(state.loadedAsset||state.requestedAsset||state.asset)}</span></div>
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
    const live=root?.querySelector("[data-oms-live]");
    const kpis=root?.querySelector("[data-oms-kpis]");
    const body=root?.querySelector("[data-oms-body]");
    if(!meta||!kpis||!body)return;

    const freshness=state.loading?"UNKNOWN":String(state.freshness||"UNKNOWN");
    if(live){live.dataset.state=freshness;live.textContent=freshness;}
    const sourceTime=state.sourceObservedAt?new Date(state.sourceObservedAt).toLocaleTimeString("fr-FR"):"source inconnue";
    const receivedTime=state.receivedAt?new Date(state.receivedAt).toLocaleTimeString("fr-FR"):null;
    meta.textContent=state.loading?
      `${state.requestedAsset}/EUR · actualisation…`:
      state.error?
        `${state.loadedAsset===state.requestedAsset&&state.bids.length?state.pair:state.requestedAsset+"/EUR"} · ${freshness} · ${state.error}`:
        `${state.pair} · source ${sourceTime}${receivedTime?" · reçu "+receivedTime:""} · âge ${Number.isFinite(state.sourceAgeMs)?Math.round(state.sourceAgeMs/1000)+" s":"—"} · ${state.lastLatencyMs??"—"} ms`;

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
    const now=Date.parse("2026-10-03T12:00:00Z");
    const fresh={read_only:true,provider:"okx",status:"ok",asset:"ETH",pair:"ETH-EUR",observed_at_utc:"2026-10-03T11:59:58Z",bids:[[2000,2]],asks:[[2001,3]]};
    let freshPass=false,staleRejected=false,wrongPairRejected=false,missingTimeRejected=false,wrongQuoteRejected=false;
    try{freshPass=validateBookPayload(fresh,"ETH",now).pair==="ETH/EUR";}catch(_){}
    try{validateBookPayload({...fresh,observed_at_utc:"2020-01-01T00:00:00Z"},"ETH",now);}catch(error){staleRejected=error?.code==="STALE_BOOK";}
    try{validateBookPayload({...fresh,asset:"BTC",pair:"BTC-EUR"},"ETH",now);}catch(error){wrongPairRejected=error?.code==="ASSET_MISMATCH"||error?.code==="PAIR_MISMATCH";}
    try{validateBookPayload({...fresh,observed_at_utc:""},"ETH",now);}catch(error){missingTimeRejected=error?.code==="SOURCE_TIME_INVALID";}
    try{validateBookPayload({...fresh,pair:"ETH-USDC"},"ETH",now);}catch(error){wrongQuoteRejected=error?.code==="QUOTE_MISMATCH";}
    const pass=rows.length===2&&LIVE_MS===2000&&freshPass&&staleRejected&&wrongPairRejected&&missingTimeRejected&&wrongQuoteRejected;
    return Object.freeze({build:BUILD,pass,checks:{
      lecture_technique_overlay:true,
      docked_glass_surface:true,
      independent_body_portal:true,
      graph_parent_never_moved:true,
      native_window_control_strip:true,
      exact_lecture_technique_dock_sync:true,
      detachable_floating_surface:true,
      minimizable:true,
      maximizable:true,
      detach_restores_lecture_technique:true,
      draggable_when_detached:true,
      readable_font_floor:true,
      larger_operator_typography:true,
      live_refresh_2s:LIVE_MS===2000,
      refresh_only_while_open:true,
      local_backend_orderbook:true,
      source_freshness_required:true,
      source_timestamp_not_fabricated:true,
      requested_asset_must_match_payload:true,
      eur_quote_required:true,
      dynamic_asset_units:true,
      stale_payload_rejected:staleRejected,
      wrong_pair_rejected:wrongPairRejected,
      missing_source_time_rejected:missingTimeRejected,
      wrong_quote_rejected:wrongQuoteRejected,
      no_direct_browser_okx:true,
      no_private_api:true,
      no_order:true,
      no_wallet:true
    }});
  }

  globalThis.AgentCryptoOkxMicrostructure=Object.freeze({
    build:BUILD,mount,setOpen,setDetached,setMinimized,setMaximized,refresh,
    snapshot:()=>Object.freeze({...state,bids:state.bids.slice(),asks:state.asks.slice()}),
    self_test:selfTest,
    validation_contract:Object.freeze({fresh_max_age_ms:FRESH_MAX_AGE_MS,future_tolerance_ms:FUTURE_TOLERANCE_MS,quote:"EUR"}),
    read_only:true,
    local_backend_orderbook:true,
    backend_endpoint:BACKEND+"/orderbook",
    lecture_technique_overlay:true,
    semi_transparent:true,
    detachable:true,
    independent_body_portal:true,
    graph_parent_never_moved:true,
    native_window_control_strip:true,
    exact_lecture_technique_dock_sync:true,
    minimizable:true,
    maximizable:true,
    draggable_when_detached:true,
    docked_to_lecture_technique:true,
    detach_restores_lecture_technique:true,
    underlying_detail_visible:true,
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
    window.addEventListener("resize",()=>{if(state.maximized)applyPlacement();else if(state.detached){rememberFloatRect();applyPlacement();}else applyDockRect();},{passive:true});
    window.addEventListener("scroll",()=>{if(state.open&&!state.detached)applyDockRect();},{passive:true,capture:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",()=>{
      const next=selectedAsset();
      state.requestedAsset=next;
      if(state.loadedAsset!==next)clearBookForAsset(next);
      try{state.activeController?.abort();}catch(_){}
      if(state.open)void refresh({asset:next});
    },{passive:true});
  }
})();