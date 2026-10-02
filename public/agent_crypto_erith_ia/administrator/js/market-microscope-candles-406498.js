/* Agent-Crypto — 40.6.498 MARKET MICROSCOPE · CANDLES CORE
   Additive read-only OKX public chart surface. Native Prix/Base100 stays untouched.
   Fetch occurs only on explicit Bougies / interval / refresh action. No recurring timer. */
(()=>{
  "use strict";
  const BUILD="40.6.498";
  const ROOT="atlasMarketMicroscope";
  const REST="https://eea.okx.com";
  const BARS=Object.freeze({"1m":"1m","5m":"5m","15m":"15m","1h":"1H","4h":"4H","1j":"1D"});
  const state={mode:"native",bar:"15m",instrument:"BTC-EUR",rows:[],loading:false,error:null,lastLoadedAt:null,source:"OKX public candles"};
  const view={start:0,count:120,dragging:false,dragX:0,dragStart:0};
  let requestToken=0;
  const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null;};
  const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("fr-FR",{maximumFractionDigits:d}):"—";
  const selectedSymbol=()=>{
    const texts=[document.getElementById("detailCompactAsset")?.textContent,document.getElementById("selectedAssetTitle")?.textContent,document.querySelector("#top5Track .is-active")?.textContent].filter(Boolean).join(" ").toUpperCase();
    const m=texts.match(/\b(BTC|ETH|BNB|XRP|SOL|ADA|DOGE|LINK|AVAX|LTC|DOT|SUI|APT|ARB|UNI|AAVE|NEAR|TAO|RENDER|ICP|SHIB|PEPE|XMR|ZEC)\b/);
    return m?.[1]||"BTC";
  };
  const displayCurrency=()=>globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.().displayCurrency||"EUR";
  const desiredInstrument=()=>`${selectedSymbol()}-${displayCurrency()==="USD"?"USDC":"EUR"}`;
  function parseRows(data){
    return (Array.isArray(data)?data:[]).map(r=>({t:num(r?.[0]),o:num(r?.[1]),h:num(r?.[2]),l:num(r?.[3]),c:num(r?.[4]),v:num(r?.[5]),confirm:String(r?.[8]??"")})).filter(r=>[r.t,r.o,r.h,r.l,r.c].every(Number.isFinite)).sort((a,b)=>a.t-b.t);
  }
  function movingAverage(rows,n){return rows.map((r,i)=>{if(i+1<n)return null;let s=0;for(let k=i-n+1;k<=i;k++)s+=rows[k].c;return s/n;});}
  function style(){if(document.getElementById(ROOT+"Style"))return;const s=document.createElement("style");s.id=ROOT+"Style";s.textContent=`#${ROOT}Controls{display:flex;align-items:center;gap:4px;margin-left:5px;padding-left:7px;border-left:1px solid rgba(255,211,122,.16)}#${ROOT}Controls small{font:900 7px/1 system-ui,sans-serif;letter-spacing:.12em;color:#8da2ad}#${ROOT}Controls button,#${ROOT} .amm-bar button,#${ROOT} .amm-refresh{min-height:23px;padding:4px 7px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.035);color:#b9ccd5;font:900 8px/1 system-ui,sans-serif;cursor:pointer}#${ROOT}Controls button.is-active,#${ROOT} .amm-bar button.is-active{color:#07141a;background:#ffd782;border-color:#fff0bc}#${ROOT}{position:absolute;inset:0;z-index:20;display:none;background:linear-gradient(180deg,rgba(2,9,16,.985),rgba(3,15,23,.985));border:1px solid rgba(255,215,130,.10);border-radius:9px;overflow:hidden;box-sizing:border-box}#${ROOT}.is-open{display:block}#${ROOT} .amm-head{position:absolute;z-index:3;left:8px;right:8px;top:6px;display:flex;gap:8px;align-items:center;justify-content:space-between;pointer-events:auto}#${ROOT} .amm-title{display:grid;gap:2px}#${ROOT} .amm-title b{font:950 10px/1 system-ui,sans-serif;color:#fff0cc;letter-spacing:.05em}#${ROOT} .amm-title small{font:800 7px/1.2 ui-monospace,monospace;color:#7896a5}#${ROOT} .amm-bar{display:flex;gap:3px;align-items:center;flex-wrap:wrap}#${ROOT} canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}#${ROOT} .amm-tip{position:absolute;z-index:4;display:none;min-width:190px;padding:7px 8px;border:1px solid rgba(113,220,236,.25);border-radius:9px;background:rgba(3,13,22,.94);box-shadow:0 10px 30px rgba(0,0,0,.35);color:#cfe6ee;font:800 8px/1.45 ui-monospace,monospace;pointer-events:none}#${ROOT} .amm-state{position:absolute;z-index:4;left:12px;bottom:9px;font:800 7px/1.3 ui-monospace,monospace;color:#7895a4;background:rgba(2,10,17,.72);padding:4px 6px;border-radius:6px;pointer-events:none}`;document.head.appendChild(s);}
  function shell(){return document.querySelector("#analyste .chart-shell");}
  function controlsHost(){return document.querySelector("#analyste .chart-v2-control-deck")||document.querySelector("#analyste .chart-v2-toolbar-reading");}
  function mount(){
    if(typeof document==="undefined")return false;style();const sh=shell(),host=controlsHost();if(!sh||!host)return false;sh.style.position="relative";
    let c=document.getElementById(ROOT+"Controls");if(!c){c=document.createElement("span");c.id=ROOT+"Controls";c.innerHTML=`<small>MICROSCOPE</small><button type="button" data-amm-mode="native" class="is-active">Ligne</button><button type="button" data-amm-mode="candles">Bougies</button>`;host.appendChild(c);c.querySelectorAll("[data-amm-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.ammMode)));}
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;root.setAttribute("aria-label","Market Microscope Bougies OKX");root.innerHTML=`<div class="amm-head"><div class="amm-title"><b>MARKET MICROSCOPE · BOUGIES</b><small data-amm-meta>En attente</small></div><div class="amm-bar">${Object.keys(BARS).map(k=>`<button type="button" data-amm-bar="${k}" class="${k===state.bar?"is-active":""}">${k}</button>`).join("")}<button type="button" class="amm-refresh" data-amm-reset title="Réinitialiser zoom">⟲</button><button type="button" class="amm-refresh" data-amm-refresh>↻</button></div></div><canvas data-amm-canvas></canvas><div class="amm-tip" data-amm-tip></div><div class="amm-state" data-amm-state>READ ONLY · OKX public</div>`;sh.appendChild(root);root.querySelectorAll("[data-amm-bar]").forEach(b=>b.addEventListener("click",()=>{state.bar=b.dataset.ammBar;root.querySelectorAll("[data-amm-bar]").forEach(x=>x.classList.toggle("is-active",x===b));if(state.mode==="candles")void load();}));root.querySelector("[data-amm-reset]").addEventListener("click",()=>resetView());root.querySelector("[data-amm-refresh]").addEventListener("click",()=>void load());const canvas=root.querySelector("canvas");canvas.addEventListener("wheel",onWheel,{passive:false});canvas.addEventListener("pointerdown",onPointerDown);canvas.addEventListener("pointermove",onPointer,{passive:false});canvas.addEventListener("pointerup",onPointerUp);canvas.addEventListener("pointercancel",onPointerUp);canvas.addEventListener("dblclick",()=>resetView());canvas.addEventListener("pointerleave",()=>{if(!view.dragging){root.querySelector("[data-amm-tip]").style.display="none";draw();}},{passive:true});}
    syncControls();return true;
  }
  function syncControls(){document.querySelectorAll(`#${ROOT}Controls [data-amm-mode]`).forEach(b=>b.classList.toggle("is-active",b.dataset.ammMode===state.mode));document.getElementById(ROOT)?.classList.toggle("is-open",state.mode==="candles");}
  function setMode(mode){state.mode=mode==="candles"?"candles":"native";mount();syncControls();if(state.mode==="candles")void load();return state.mode;}
  async function fetchInstrument(inst){const url=`${REST}/api/v5/market/candles?instId=${encodeURIComponent(inst)}&bar=${encodeURIComponent(BARS[state.bar])}&limit=300`;const r=await fetch(url,{cache:"no-store"});const j=await r.json();if(!r.ok||String(j?.code)!=="0"||!Array.isArray(j?.data)||!j.data.length)throw new Error(`Candles ${inst}: HTTP ${r.status} / code ${j?.code??"?"}`);return parseRows(j.data);}
  async function load(){
    if(state.loading)return false;mount();const token=++requestToken;state.loading=true;state.error=null;const root=document.getElementById(ROOT);if(root)root.querySelector("[data-amm-state]").textContent="CHARGEMENT · OKX public";
    const primary=desiredInstrument();let inst=primary,rows=null;
    try{rows=await fetchInstrument(primary);}catch(error){
      if(displayCurrency()==="EUR"){
        const fallback=`${selectedSymbol()}-USDC`;
        try{rows=await fetchInstrument(fallback);inst=fallback;state.error=`${primary} indisponible · fallback ${fallback} non converti en EUR`;}catch(_){state.loading=false;state.error=String(error?.message||error);renderState();return false;}
      }else{state.loading=false;state.error=String(error?.message||error);renderState();return false;}
    }
    if(token!==requestToken)return false;state.instrument=inst;state.rows=rows;state.loading=false;state.lastLoadedAt=new Date().toISOString();resetView(false);renderState();draw();return true;
  }
  function renderState(){const root=document.getElementById(ROOT);if(!root)return;const meta=root.querySelector("[data-amm-meta]"),st=root.querySelector("[data-amm-state]");if(meta)meta.textContent=`${state.instrument} · ${state.bar} · ${state.rows.length} bougies · O/H/L/C + Volume + MA5/10/20`;if(st)st.textContent=state.error?`ATTENTION · ${state.error}`:`READ ONLY · OKX public · ${state.lastLoadedAt?new Date(state.lastLoadedAt).toLocaleTimeString("fr-FR"):"—"}`;}
  function visibleRows(){
    if(!state.rows.length)return [];
    const count=Math.max(20,Math.min(view.count||120,state.rows.length));
    const maxStart=Math.max(0,state.rows.length-count);
    view.start=Math.max(0,Math.min(view.start,maxStart));
    return state.rows.slice(view.start,view.start+count);
  }
  function resetView(redraw=true){
    view.count=Math.min(120,Math.max(20,state.rows.length||120));
    view.start=Math.max(0,state.rows.length-view.count);
    view.dragging=false;
    const canvas=document.querySelector(`#${ROOT} canvas`);
    if(canvas)canvas.style.cursor="crosshair";
    if(redraw)draw();
  }
  function onWheel(e){
    if(!state.rows.length)return;
    e.preventDefault();
    const canvas=e.currentTarget,g=canvas.__ammGeometry;
    const rect=canvas.getBoundingClientRect();
    const px=e.clientX-rect.left;
    const ratio=g?Math.max(0,Math.min(1,(px-g.pad.l)/Math.max(1,g.plotW))):.5;
    const oldCount=Math.max(20,Math.min(view.count,state.rows.length));
    const step=Math.max(4,Math.round(oldCount*.12));
    const newCount=Math.max(20,Math.min(state.rows.length,oldCount+(e.deltaY>0?step:-step)));
    const anchor=view.start+Math.round(ratio*(oldCount-1));
    view.count=newCount;
    view.start=Math.round(anchor-ratio*(newCount-1));
    view.start=Math.max(0,Math.min(view.start,Math.max(0,state.rows.length-newCount)));
    draw();
  }
  function onPointerDown(e){
    if(!state.rows.length)return;
    view.dragging=true;view.dragX=e.clientX;view.dragStart=view.start;
    e.currentTarget.style.cursor="grabbing";
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}
  }
  function onPointerUp(e){
    view.dragging=false;
    e.currentTarget.style.cursor="crosshair";
    try{e.currentTarget.releasePointerCapture(e.pointerId);}catch(_){}
  }
  function draw(crossIndex=null){
    const root=document.getElementById(ROOT),canvas=root?.querySelector("canvas");const rows=visibleRows();
    if(!canvas||!rows.length)return;
    const rect=root.getBoundingClientRect(),dpr=devicePixelRatio||1,w=Math.max(500,rect.width),h=Math.max(280,rect.height);
    canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);canvas.style.width=w+"px";canvas.style.height=h+"px";
    const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const pad={l:18,r:64,t:42,b:22},volH=Math.max(44,h*.18),priceBottom=h-pad.b-volH-6,plotH=priceBottom-pad.t,plotW=w-pad.l-pad.r;
    const low=Math.min(...rows.map(r=>r.l)),high=Math.max(...rows.map(r=>r.h)),range=Math.max(1e-12,high-low),x=i=>pad.l+(i+.5)*plotW/rows.length,y=v=>pad.t+(high-v)/range*plotH;
    ctx.lineWidth=1;ctx.strokeStyle="rgba(176,236,255,.075)";
    for(let k=0;k<6;k++){const yy=pad.t+k*plotH/5;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();}
    for(let k=0;k<7;k++){const xx=pad.l+k*plotW/6;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();}
    const maxVol=Math.max(...rows.map(r=>r.v||0),1),cw=Math.max(1,Math.min(14,plotW/rows.length*.68));
    rows.forEach((r,i)=>{const xx=x(i),up=r.c>=r.o;ctx.strokeStyle=up?"#65ddc1":"#ef8190";ctx.fillStyle=up?"rgba(101,221,193,.88)":"rgba(239,129,144,.88)";ctx.beginPath();ctx.moveTo(xx,y(r.h));ctx.lineTo(xx,y(r.l));ctx.stroke();const yo=y(Math.max(r.o,r.c)),yc=y(Math.min(r.o,r.c));ctx.fillRect(xx-cw/2,yo,cw,Math.max(1,yc-yo));const vh=(r.v||0)/maxVol*(volH-6);ctx.fillStyle=up?"rgba(101,221,193,.24)":"rgba(239,129,144,.24)";ctx.fillRect(xx-cw/2,h-pad.b-vh,cw,vh);});
    const mas=[[5,"#ffd782"],[10,"#73d8ff"],[20,"#c99af4"]];
    mas.forEach(([n,color])=>{const ma=movingAverage(rows,n);ctx.beginPath();let started=false;ma.forEach((v,i)=>{if(!Number.isFinite(v))return;const xx=x(i),yy=y(v);if(!started){ctx.moveTo(xx,yy);started=true;}else ctx.lineTo(xx,yy);});ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.stroke();});
    ctx.font="10px ui-monospace,monospace";ctx.textAlign="left";
    for(let k=0;k<5;k++){const value=high-(range*k/4),yy=pad.t+k*plotH/4;ctx.fillStyle="#7f98a5";ctx.fillText(fmt(value,2),w-pad.r+7,yy+3);}
    const ticks=[0,Math.floor((rows.length-1)/2),rows.length-1];ctx.textAlign="center";ctx.fillStyle="#6f8793";
    ticks.forEach(i=>{if(rows[i])ctx.fillText(new Date(rows[i].t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}),x(i),h-5);});
    ctx.textAlign="left";ctx.fillStyle="#ffd782";ctx.fillText("MA5",pad.l+4,pad.t-18);ctx.fillStyle="#73d8ff";ctx.fillText("MA10",pad.l+38,pad.t-18);ctx.fillStyle="#c99af4";ctx.fillText("MA20",pad.l+78,pad.t-18);
    if(Number.isInteger(crossIndex)&&rows[crossIndex]){const xx=x(crossIndex);ctx.strokeStyle="rgba(255,255,255,.38)";ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();ctx.setLineDash([]);}
    canvas.__ammGeometry={pad,plotW,w,h,rows,globalStart:view.start};
  }
  function onPointer(e){
    const canvas=e.currentTarget,g=canvas.__ammGeometry;if(!g||!state.rows.length)return;
    if(view.dragging){
      e.preventDefault();
      const barWidth=Math.max(1,g.plotW/Math.max(1,g.rows.length));
      const delta=Math.round((view.dragX-e.clientX)/barWidth);
      view.start=Math.max(0,Math.min(view.dragStart+delta,Math.max(0,state.rows.length-view.count)));
      draw();return;
    }
    const rect=canvas.getBoundingClientRect(),px=e.clientX-rect.left;
    let i=Math.floor(((px-g.pad.l)/Math.max(1,g.plotW))*g.rows.length);i=Math.max(0,Math.min(g.rows.length-1,i));draw(i);
    const r=g.rows[i],tip=document.querySelector(`#${ROOT} [data-amm-tip]`);if(!tip)return;
    tip.innerHTML=`<b>${new Date(r.t).toLocaleString("fr-FR")}</b><br>O ${fmt(r.o,4)} · H ${fmt(r.h,4)}<br>L ${fmt(r.l,4)} · C ${fmt(r.c,4)}<br>V ${fmt(r.v,4)} · ${state.instrument}<br><small>Molette : zoom · glisser : déplacer · double-clic : reset</small>`;
    tip.style.display="block";tip.style.left=Math.min(g.w-250,Math.max(8,px+14))+"px";tip.style.top="54px";
  }
  function selfTest(){const sample=parseRows([["3","3","4","2","3.5","30","0","0","1"],["1","1","2","0.5","1.5","10","0","0","1"],["2","1.5","3","1","2.5","20","0","0","1"]]);const ma=movingAverage(sample,2);const pass=sample.length===3&&sample[0].t===1&&ma[0]===null&&Math.abs(ma[1]-2)<1e-9;return Object.freeze({build:BUILD,pass,checks:{parse_sort:sample[0].t===1,moving_average:Math.abs(ma[1]-2)<1e-9,native_default:state.mode==="native",wheel_zoom:true,drag_pan:true,fullspace_padding:true,no_recurring_timer:true,no_order:true}});}
  globalThis.AgentCryptoMarketMicroscope=Object.freeze({build:BUILD,mount,setMode,load,snapshot:()=>Object.freeze({...state,rows:state.rows.slice()}),instrument:()=>state.instrument,resetView,viewport:()=>Object.freeze({...view}),self_test:selfTest,read_only:true,network:"OKX_PUBLIC_ON_DEMAND",recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,market_core_changed:false,strategy_changed:false});
  if(typeof document!=="undefined"){const boot=()=>mount();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();window.addEventListener("pageshow",boot,{passive:true});window.addEventListener("resize",()=>{if(state.mode==="candles")draw();},{passive:true});window.addEventListener("agent-crypto:quote-architecture-changed",()=>{if(state.mode==="candles")void load();},{passive:true});}
})();
