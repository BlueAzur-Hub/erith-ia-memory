/* Agent-Crypto — 40.6.553 MARKET MICROSCOPE · TECHNICAL S/R NATIVE WINDOW
   Historical core owner: 40.6.498 · New Listings reuse: 40.6.529.
   40.6.529 additive extension: New Listing external context can reuse this exact chart shell
   for Ligne + Bougies without mutating Market Core/state.coins.
   Default Market path remains OKX public and Native Prix/Base100 remains untouched.
   Fetch occurs only on explicit Bougies / interval / refresh / external-asset load. No recurring timer. */
(()=>{
  "use strict";
  const BUILD="40.6.553";
  const CORE_BUILD="40.6.498";
  const EXTENSION_BUILD="40.6.529";
  const ROOT="atlasMarketMicroscope";
  const REST="https://eea.okx.com";
  const BARS=Object.freeze({"1m":"1m","5m":"5m","15m":"15m","1h":"1H","4h":"4H","1j":"1D"});
  const state={mode:"native",bar:"15m",instrument:"BTC-EUR",rows:[],loading:false,error:null,lastLoadedAt:null,source:"OKX public candles",indicators:{ma:true,ema:false,sr:true},lastLevels:null};
  const view={start:0,count:72,dragging:false,dragX:0,dragStart:0};
  let requestToken=0;
  const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null;};
  const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("fr-FR",{maximumFractionDigits:d}):"—";
  const externalContext=()=>{try{return globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()||{active:false};}catch(_){return {active:false};}};
  const selectedSymbol=()=>{
    const ext=externalContext();if(ext.active&&ext.base)return String(ext.base).toUpperCase();
    const texts=[document.getElementById("detailCompactAsset")?.textContent,document.getElementById("selectedAssetTitle")?.textContent,document.querySelector("#top5Track .is-active")?.textContent].filter(Boolean).join(" ").toUpperCase();
    const m=texts.match(/\b(BTC|ETH|BNB|XRP|SOL|ADA|DOGE|LINK|AVAX|LTC|DOT|SUI|APT|ARB|UNI|AAVE|NEAR|TAO|RENDER|ICP|SHIB|PEPE|XMR|ZEC)\b/);
    return m?.[1]||"BTC";
  };
  const displayCurrency=()=>globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.().displayCurrency||"EUR";
  const desiredInstrument=()=>{const ext=externalContext();return ext.active&&ext.instrument?ext.instrument:`${selectedSymbol()}-${displayCurrency()==="USD"?"USDC":"EUR"}`;};
  function parseRows(data){
    return (Array.isArray(data)?data:[]).map(r=>({t:num(r?.[0]),o:num(r?.[1]),h:num(r?.[2]),l:num(r?.[3]),c:num(r?.[4]),v:num(r?.[5]),confirm:String(r?.[8]??"")})).filter(r=>[r.t,r.o,r.h,r.l,r.c].every(Number.isFinite)).sort((a,b)=>a.t-b.t);
  }
  function movingAverage(rows,n){return rows.map((r,i)=>{if(i+1<n)return null;let s=0;for(let k=i-n+1;k<=i;k++)s+=rows[k].c;return s/n;});}
  function exponentialAverage(rows,n){
    if(!Array.isArray(rows)||!rows.length||!Number.isFinite(n)||n<1)return [];
    const alpha=2/(n+1);let ema=null;
    return rows.map((r,i)=>{
      const close=Number(r?.c);
      if(!Number.isFinite(close))return null;
      if(ema===null){
        if(i+1<n)return null;
        let seed=0;
        for(let k=i-n+1;k<=i;k++)seed+=Number(rows[k]?.c)||0;
        ema=seed/n;
        return ema;
      }
      ema=close*alpha+ema*(1-alpha);
      return ema;
    });
  }
  function clusterPivots(points,tolerance){
    const sorted=(Array.isArray(points)?points:[]).filter(p=>Number.isFinite(p?.price)).slice().sort((a,b)=>a.price-b.price);
    const clusters=[];
    sorted.forEach(point=>{
      const last=clusters[clusters.length-1];
      if(last&&Math.abs(point.price-last.price)<=tolerance){
        last.points.push(point);
        last.price=last.points.reduce((sum,p)=>sum+p.price,0)/last.points.length;
        last.lastIndex=Math.max(last.lastIndex,point.index);
      }else clusters.push({price:point.price,points:[point],lastIndex:point.index});
    });
    return clusters.map(c=>({price:c.price,touches:c.points.length,lastIndex:c.lastIndex,confidence:c.points.length>=3?"fort":c.points.length>=2?"confirmé":"indicatif"}));
  }
  function supportResistance(rows){
    if(!Array.isArray(rows)||rows.length<7)return {support:null,resistance:null,current:null,tolerance:null,method:"PIVOTS_VISIBLES_W2",bar:state.bar,instrument:state.instrument};
    const current=Number(rows[rows.length-1]?.c);
    const low=Math.min(...rows.map(r=>r.l)),high=Math.max(...rows.map(r=>r.h)),range=Math.max(1e-12,high-low);
    const tolerance=Math.max(range*.02,Math.abs(current||0)*.00045);
    const lows=[],highs=[];
    for(let i=2;i<rows.length-2;i++){
      const r=rows[i];
      if(r.l<=rows[i-1].l&&r.l<=rows[i-2].l&&r.l<=rows[i+1].l&&r.l<=rows[i+2].l)lows.push({price:r.l,index:i});
      if(r.h>=rows[i-1].h&&r.h>=rows[i-2].h&&r.h>=rows[i+1].h&&r.h>=rows[i+2].h)highs.push({price:r.h,index:i});
    }
    const lowClusters=clusterPivots(lows,tolerance),highClusters=clusterPivots(highs,tolerance);
    const choose=(clusters,kind)=>{
      const side=clusters.filter(c=>kind==="support"?c.price<current:c.price>current);
      side.sort((a,b)=>{
        const da=Math.abs(a.price-current),db=Math.abs(b.price-current);
        if(a.touches!==b.touches&&Math.abs(da-db)<tolerance*2)return b.touches-a.touches;
        return da-db;
      });
      return side[0]||null;
    };
    let support=choose(lowClusters,"support"),resistance=choose(highClusters,"resistance");
    if(!support&&Number.isFinite(low)&&low<current)support={price:low,touches:1,lastIndex:rows.findIndex(r=>r.l===low),confidence:"indicatif",fallback:true};
    if(!resistance&&Number.isFinite(high)&&high>current)resistance={price:high,touches:1,lastIndex:rows.findIndex(r=>r.h===high),confidence:"indicatif",fallback:true};
    const enrich=(level,kind)=>level?Object.freeze({...level,kind,distancePct:current?((level.price-current)/current)*100:null}):null;
    return Object.freeze({support:enrich(support,"support"),resistance:enrich(resistance,"resistance"),current,tolerance,method:"PIVOTS_VISIBLES_W2",bar:state.bar,instrument:state.instrument,window:rows.length});
  }
  function barDurationMs(bar=state.bar){
    return ({"1m":60000,"5m":300000,"15m":900000,"1h":3600000,"4h":14400000,"1j":86400000})[bar]||900000;
  }
  function candleChangePct(row){
    const open=Number(row?.o),close=Number(row?.c);
    return Number.isFinite(open)&&open!==0&&Number.isFinite(close)?((close-open)/open)*100:null;
  }
  function ageLabel(ms){
    const safe=Math.max(0,Number(ms)||0);
    if(safe<60000)return `${Math.max(0,Math.round(safe/1000))} s`;
    if(safe<3600000)return `${Math.round(safe/60000)} min`;
    if(safe<86400000)return `${(safe/3600000).toFixed(safe<10800000?1:0)} h`;
    return `${(safe/86400000).toFixed(1)} j`;
  }
  function marketFreshness(){
    const last=state.rows[state.rows.length-1];
    const ts=Number(last?.t);
    if(!Number.isFinite(ts)||ts<=0)return {status:"UNKNOWN",ageMs:null,label:"horodatage inconnu"};
    const age=Math.max(0,Date.now()-ts);
    const limit=barDurationMs()*2.2;
    return {status:age<=limit?"FRESH":"STALE",ageMs:age,label:ageLabel(age)};
  }
  function priceUnit(){
    const quote=String(state.instrument||"").split("-").pop()?.toUpperCase();
    return quote||displayCurrency();
  }
  function volumeUnit(){return String(state.instrument||selectedSymbol()).split("-")[0]?.toUpperCase()||selectedSymbol();}
  function priceDigits(v){
    const a=Math.abs(Number(v));
    if(!Number.isFinite(a))return 2;
    if(a>=10000)return 1;
    if(a>=100)return 2;
    if(a>=1)return 4;
    if(a>=0.01)return 6;
    return 8;
  }
  function fmtPrice(v){
    return Number.isFinite(Number(v))?Number(v).toLocaleString("fr-FR",{maximumFractionDigits:priceDigits(v)}):"—";
  }
  function levelDistance(level){
    if(!level||!Number.isFinite(level.distancePct))return "—";
    const v=Math.abs(level.distancePct);
    return `${v.toFixed(v<1?2:1)} %`;
  }
  function technicalLevelsMarkup(levels){
    const unit=priceUnit(),s=levels?.support,r=levels?.resistance;
    const summary=`${state.instrument} · ${state.bar} · S ${s?fmtPrice(s.price):"—"} · R ${r?fmtPrice(r.price):"—"}`;
    const card=(label,level,cls)=>`<div class="${cls}"><b>${label}</b><span>${level?fmtPrice(level.price)+" "+unit:"Aucun niveau"}</span><small>${level?`${level.touches} touche${level.touches>1?"s":""} · ${level.confidence} · écart ${levelDistance(level)}`:"fenêtre insuffisante"}</small></div>`;
    return `<summary><span><b>Repères Support / Résistance</b><small>${summary}</small></span><em data-window-state>Ouvrir</em></summary><div class="atlas-detail-subwindow-body"><div class="detail-grid clean-lens-detail-grid amm-tech-native-grid">${card("Support",s,"is-support")}${card("Résistance",r,"is-resistance")}</div><p class="why-box clean-lens-why-box amm-tech-explain"><b>Support</b> : zone où le prix a récemment rebondi ou ralenti sa baisse. <b>Résistance</b> : zone où le prix a récemment bloqué ou ralenti sa hausse. <b>Touches</b> : nombre de réactions observées autour du niveau.</p></div>`;
  }
  function syncTechnicalLevelsWindow(host){
    if(!host)return;
    const stateNode=host.querySelector("[data-window-state]");
    if(stateNode)stateNode.textContent=host.open?"Réduire":"Ouvrir";
  }
  function ensureTechnicalLevelsHost(){
    if(typeof document==="undefined")return null;
    const body=document.getElementById("detailPanelBody"),anchor=document.getElementById("detailCompactStrip");if(!body||!anchor)return null;
    let host=document.getElementById("atlasCandlesTechnicalLevels406551");
    if(!host){
      host=document.createElement("details");
      host.id="atlasCandlesTechnicalLevels406551";
      host.className="atlas-detail-subwindow atlas-primary-detail-window amm-tech-levels-native";
      host.dataset.detailWindow="support-resistance";
      host.hidden=true;
      host.open=false;
      host.addEventListener("toggle",()=>syncTechnicalLevelsWindow(host));
      anchor.insertAdjacentElement("afterend",host);
    }else{
      host.className="atlas-detail-subwindow atlas-primary-detail-window amm-tech-levels-native";
      host.dataset.detailWindow="support-resistance";
    }
    return host;
  }
  function renderTechnicalLevels(levels){
    const host=ensureTechnicalLevelsHost();
    if(!host)return;
    if(!levels||state.mode!=="candles"||!state.indicators.sr){host.hidden=true;host.removeAttribute("data-signature");return;}
    const sig=[levels.instrument,levels.bar,levels.window,levels.support?.price,levels.support?.touches,levels.resistance?.price,levels.resistance?.touches].join("|");
    const wasOpen=host.open;
    if(host.dataset.signature!==sig){host.innerHTML=technicalLevelsMarkup(levels);host.dataset.signature=sig;host.open=wasOpen;syncTechnicalLevelsWindow(host);}
    host.hidden=false;syncTechnicalLevelsWindow(host);
    state.lastLevels=levels;
    if(globalThis.CustomEvent&&host.dataset.eventSignature!==sig){
      host.dataset.eventSignature=sig;
      try{window.dispatchEvent(new CustomEvent("agent-crypto:candles-technical-levels",{detail:levels}));}catch(_){}
    }
  }
  function candleTimeLabel(ts){
    const d=new Date(ts);
    if(!Number.isFinite(d.getTime()))return "Date inconnue";
    return d.toLocaleString("fr-FR",{day:"2-digit",month:"long",hour:"2-digit",minute:"2-digit"});
  }
  function inspectorMarkup(row){
    if(!row)return `<div class="amm-inspector-head"><b>BOUGIE SÉLECTIONNÉE</b><span>Survolez une bougie pour lire ses valeurs.</span></div><div class="amm-inspector-grid"><span><small>OUVERTURE</small><strong>—</strong></span><span><small>PLUS HAUT</small><strong>—</strong></span><span><small>PLUS BAS</small><strong>—</strong></span><span><small>CLÔTURE</small><strong>—</strong></span><span><small>VARIATION</small><strong>—</strong></span><span><small>VOLUME</small><strong>—</strong></span></div>`;
    const change=candleChangePct(row),changeText=Number.isFinite(change)?`${change>=0?"+":""}${change.toFixed(2)} %`:"—";
    const cls=Number.isFinite(change)?(change>0?"is-up":change<0?"is-down":"is-flat"):"is-flat";
    const unit=priceUnit(),volUnit=volumeUnit();
    return `<div class="amm-inspector-head"><b>BOUGIE SÉLECTIONNÉE</b><span>${candleTimeLabel(row.t)} · ${state.instrument} · ${state.bar}</span></div><div class="amm-inspector-grid"><span><small>OUVERTURE</small><strong>${fmtPrice(row.o)} ${unit}</strong></span><span><small>PLUS HAUT</small><strong>${fmtPrice(row.h)} ${unit}</strong></span><span><small>PLUS BAS</small><strong>${fmtPrice(row.l)} ${unit}</strong></span><span><small>CLÔTURE</small><strong>${fmtPrice(row.c)} ${unit}</strong></span><span><small>VARIATION</small><strong class="${cls}">${changeText}</strong></span><span><small>VOLUME</small><strong>${fmt(row.v,4)} ${volUnit}</strong></span></div>`;
  }
  function style(){
    if(document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";
    s.textContent=`#${ROOT}Controls{display:flex;align-items:center;gap:4px;margin-left:5px;padding-left:7px;border-left:1px solid rgba(255,211,122,.16)}#${ROOT}Controls small{font:900 7px/1 system-ui,sans-serif;letter-spacing:.12em;color:#8da2ad}#${ROOT}Controls button,#${ROOT} .amm-bar button,#${ROOT} .amm-refresh{min-height:25px;padding:5px 8px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.04);color:#c6d8df;font:900 9px/1 system-ui,sans-serif;cursor:pointer}#${ROOT}Controls button.is-active,#${ROOT} .amm-bar button.is-active{color:#07141a;background:#ffd782;border-color:#fff0bc}#${ROOT}{position:absolute;inset:0;z-index:20;display:none;background:linear-gradient(180deg,rgba(2,9,16,.992),rgba(3,15,23,.992));border:1px solid rgba(255,215,130,.12);border-radius:9px;overflow:hidden;box-sizing:border-box}#${ROOT}.is-open{display:block}#${ROOT} .amm-head{position:absolute;z-index:5;left:10px;right:10px;top:7px;display:flex;gap:10px;align-items:center;justify-content:space-between;pointer-events:auto}#${ROOT} .amm-title{display:grid;gap:3px;min-width:220px}#${ROOT} .amm-title b{font:950 11px/1 system-ui,sans-serif;color:#fff0cc;letter-spacing:.045em}#${ROOT} .amm-title small{font:850 8px/1.25 ui-monospace,monospace;color:#91aab5}#${ROOT} .amm-bar{display:flex;gap:4px;align-items:center;flex-wrap:wrap}#${ROOT} canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}#${ROOT} .amm-tip{position:absolute;z-index:4;display:block;left:12px;right:12px;top:39px;min-width:0;padding:8px 10px;border:1px solid rgba(113,220,236,.24);border-radius:9px;background:rgba(3,13,22,.92);box-shadow:0 8px 24px rgba(0,0,0,.26);color:#dceff5;pointer-events:none}#${ROOT} .amm-inspector-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:6px}#${ROOT} .amm-inspector-head b{font:950 9px/1 system-ui,sans-serif;letter-spacing:.08em;color:#fff0bc}#${ROOT} .amm-inspector-head span{font:850 9px/1.2 system-ui,sans-serif;color:#9bb4bf}#${ROOT} .amm-inspector-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px}#${ROOT} .amm-inspector-grid span{display:grid;gap:3px;min-width:0;padding:5px 7px;border:1px solid rgba(255,255,255,.075);border-radius:7px;background:rgba(255,255,255,.026)}#${ROOT} .amm-inspector-grid small{font:900 8px/1 system-ui,sans-serif;letter-spacing:.05em;color:#819ba7}#${ROOT} .amm-inspector-grid strong{font:950 11px/1.15 ui-monospace,monospace;color:#edfaff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${ROOT} .amm-inspector-grid strong.is-up{color:#73e3c7}#${ROOT} .amm-inspector-grid strong.is-down{color:#ff91a0}#${ROOT} .amm-inspector-grid strong.is-flat{color:#d8e7ec}#${ROOT} .amm-state{position:absolute;z-index:4;left:12px;bottom:8px;font:850 9px/1.3 ui-monospace,monospace;color:#9ab1bb;background:rgba(2,10,17,.82);padding:5px 8px;border:1px solid rgba(255,255,255,.055);border-radius:7px;pointer-events:none}#${ROOT} .amm-tools{display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap}#${ROOT} .amm-indicators{display:flex;align-items:center;gap:4px;padding-right:6px;border-right:1px solid rgba(255,255,255,.08)}#${ROOT} .amm-indicators small{font:900 8px/1 system-ui,sans-serif;letter-spacing:.08em;color:#8aa2ad}#${ROOT} .amm-indicators button{min-height:25px;padding:5px 8px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.04);color:#c6d8df;font:900 9px/1 system-ui,sans-serif;cursor:pointer}#${ROOT} .amm-indicators button.is-active{color:#07141a;background:#8fefff;border-color:#c8f7ff}#${ROOT} .amm-series-legend{position:absolute;z-index:4;left:14px;right:14px;top:112px;min-height:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;color:#9fb4bd;pointer-events:none}#${ROOT} .amm-series-legend[hidden]{display:none}#${ROOT} .amm-series-legend span{display:inline-flex;align-items:center;gap:5px;font:900 9px/1 ui-monospace,monospace;white-space:nowrap}#${ROOT} .amm-series-legend i{width:14px;height:3px;border-radius:999px;display:inline-block;box-shadow:0 0 5px currentColor}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div{min-height:46px!important;padding:7px!important;border-radius:8px!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div>b{font-size:7.8px!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div>span{font:900 10px/1.15 ui-monospace,monospace!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>div>small{display:block;margin-top:3px;font:800 8.5px/1.2 system-ui,sans-serif!important;color:rgba(220,234,242,.82)!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>.is-support>span{color:#78e1c4!important}
#detailPanel .amm-tech-levels-native .amm-tech-native-grid>.is-resistance>span{color:#ffac92!important}
#detailPanel .amm-tech-levels-native .amm-tech-explain{font-size:9px!important;line-height:1.4!important;color:rgba(232,242,248,.88)!important}
@media(max-width:760px){#${ROOT} .amm-head{align-items:flex-start;flex-direction:column}#${ROOT} .amm-title{min-width:0}#${ROOT} .amm-tools{width:100%;justify-content:flex-start;overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px}#${ROOT} .amm-indicators,#${ROOT} .amm-bar{flex:0 0 auto}#${ROOT} .amm-tip{top:75px;padding:7px}#${ROOT} .amm-inspector-head{align-items:flex-start;flex-direction:column;gap:3px}#${ROOT} .amm-inspector-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}#${ROOT} .amm-inspector-grid strong{font-size:10px}#${ROOT} .amm-series-legend{top:198px;gap:8px}#${ROOT} .amm-state{font-size:8px;max-width:calc(100% - 24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}`;
    document.head.appendChild(s);
  }
  function shell(){return document.querySelector("#analyste .chart-shell");}
  function controlsHost(){return document.querySelector("#analyste .chart-v2-control-deck")||document.querySelector("#analyste .chart-v2-toolbar-reading");}
  function mount(){
    if(typeof document==="undefined")return false;style();const sh=shell(),host=controlsHost();if(!sh||!host)return false;sh.style.position="relative";
    let c=document.getElementById(ROOT+"Controls");if(!c){c=document.createElement("span");c.id=ROOT+"Controls";c.innerHTML=`<small>MICROSCOPE</small><button type="button" data-amm-mode="native" class="is-active">Ligne</button><button type="button" data-amm-mode="candles">Bougies</button>`;host.appendChild(c);c.querySelectorAll("[data-amm-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.ammMode)));}
    let root=document.getElementById(ROOT);if(!root){root=document.createElement("section");root.id=ROOT;root.setAttribute("aria-label","Market Microscope Bougies OKX");root.innerHTML=`<div class="amm-head"><div class="amm-title"><b>MARKET MICROSCOPE · BOUGIES</b><small data-amm-meta>En attente</small></div><div class="amm-tools"><div class="amm-indicators"><small>INDICATEURS</small><button type="button" data-amm-indicator="ma" class="is-active">MA</button><button type="button" data-amm-indicator="ema">EMA</button><button type="button" data-amm-indicator="sr" class="is-active">S/R</button></div><div class="amm-bar">${Object.keys(BARS).map(k=>`<button type="button" data-amm-bar="${k}" class="${k===state.bar?"is-active":""}">${k}</button>`).join("")}<button type="button" class="amm-refresh" data-amm-reset title="Réinitialiser zoom">⟲</button><button type="button" class="amm-refresh" data-amm-refresh>↻</button></div></div></div><canvas data-amm-canvas></canvas><div class="amm-tip" data-amm-tip aria-live="polite">${inspectorMarkup(null)}</div><div class="amm-series-legend" data-amm-series-legend></div><div class="amm-state" data-amm-state>READ ONLY · OKX public</div>`;sh.appendChild(root);root.querySelectorAll("[data-amm-bar]").forEach(b=>b.addEventListener("click",()=>{state.bar=b.dataset.ammBar;root.querySelectorAll("[data-amm-bar]").forEach(x=>x.classList.toggle("is-active",x===b));if(state.mode==="candles")void load();}));root.querySelectorAll("[data-amm-indicator]").forEach(b=>b.addEventListener("click",()=>{const key=b.dataset.ammIndicator;if(!["ma","ema","sr"].includes(key))return;state.indicators[key]=!state.indicators[key];root.querySelectorAll("[data-amm-indicator]").forEach(x=>x.classList.toggle("is-active",!!state.indicators[x.dataset.ammIndicator]));renderSeriesLegend();if(key==="sr"&&!state.indicators.sr)renderTechnicalLevels(null);draw();}));root.querySelector("[data-amm-reset]").addEventListener("click",()=>resetView());root.querySelector("[data-amm-refresh]").addEventListener("click",()=>void load());const canvas=root.querySelector("canvas");canvas.addEventListener("wheel",onWheel,{passive:false});canvas.addEventListener("pointerdown",onPointerDown);canvas.addEventListener("pointermove",onPointer,{passive:false});canvas.addEventListener("pointerup",onPointerUp);canvas.addEventListener("pointercancel",onPointerUp);canvas.addEventListener("dblclick",()=>resetView());canvas.addEventListener("pointerleave",()=>{if(!view.dragging)draw();},{passive:true});}
    syncControls();return true;
  }
  function renderSeriesLegend(){
    const root=document.getElementById(ROOT),host=root?.querySelector("[data-amm-series-legend]");if(!host)return;
    const items=[];
    if(state.indicators.ma)items.push(["MA5","#ffd782"],["MA10","#73d8ff"],["MA20","#c99af4"]);
    if(state.indicators.ema)items.push(["EMA5","#ff9f5a"],["EMA10","#ff6fae"],["EMA20","#5ee7e7"]);
    host.innerHTML=items.map(([label,color])=>`<span><i style="background:${color};color:${color}"></i>${label}</span>`).join("");
    host.hidden=!items.length;
  }
  function syncControls(){document.querySelectorAll(`#${ROOT}Controls [data-amm-mode]`).forEach(b=>b.classList.toggle("is-active",b.dataset.ammMode===state.mode));document.querySelectorAll(`#${ROOT} [data-amm-indicator]`).forEach(b=>b.classList.toggle("is-active",!!state.indicators[b.dataset.ammIndicator]));document.getElementById(ROOT)?.classList.toggle("is-open",state.mode==="candles");renderSeriesLegend();}
  function setMode(mode){state.mode=mode==="candles"?"candles":"native";mount();syncControls();if(state.mode==="candles")void load();else renderTechnicalLevels(null);return state.mode;}
  async function fetchInstrument(inst){
    const ext=externalContext();
    if(ext.active){
      const pack=await globalThis.AgentCryptoNewListingLiveAsset?.fetchCandles?.({bar:state.bar,limit:300});
      if(!pack?.rows?.length)throw new Error(`Candles externes ${inst} indisponibles`);
      state.source=`${pack.providerLabel||ext.providerLabel||ext.provider} public candles`;
      return pack.rows.map(r=>({t:num(r.t),o:num(r.o),h:num(r.h),l:num(r.l),c:num(r.c),v:num(r.v),confirm:""})).filter(r=>[r.t,r.o,r.h,r.l,r.c].every(Number.isFinite)).sort((a,b)=>a.t-b.t);
    }
    state.source="OKX public candles";
    const url=`${REST}/api/v5/market/candles?instId=${encodeURIComponent(inst)}&bar=${encodeURIComponent(BARS[state.bar])}&limit=300`;const r=await fetch(url,{cache:"no-store"});const j=await r.json();if(!r.ok||String(j?.code)!=="0"||!Array.isArray(j?.data)||!j.data.length)throw new Error(`Candles ${inst}: HTTP ${r.status} / code ${j?.code??"?"}`);return parseRows(j.data);
  }
  async function load(){
    if(state.loading)return false;mount();const token=++requestToken;state.loading=true;state.error=null;const root=document.getElementById(ROOT),ext=externalContext();if(root)root.querySelector("[data-amm-state]").textContent=ext.active?`CHARGEMENT · ${ext.providerLabel||ext.provider} public`:"CHARGEMENT · OKX public";
    const primary=desiredInstrument();let inst=primary,rows=null;
    try{rows=await fetchInstrument(primary);}catch(error){
      if(!ext.active&&displayCurrency()==="EUR"){
        const fallback=`${selectedSymbol()}-USDC`;
        try{rows=await fetchInstrument(fallback);inst=fallback;state.error=`${primary} indisponible · fallback ${fallback} non converti en EUR`;}catch(_){state.loading=false;state.error=String(error?.message||error);renderState();return false;}
      }else{state.loading=false;state.error=String(error?.message||error);renderState();return false;}
    }
    if(token!==requestToken)return false;state.instrument=inst;state.rows=rows;state.loading=false;state.lastLoadedAt=new Date().toISOString();resetView(false);renderState();draw();return true;
  }
  function renderState(){const root=document.getElementById(ROOT);if(!root)return;const ext=externalContext(),meta=root.querySelector("[data-amm-meta]"),st=root.querySelector("[data-amm-state]"),title=root.querySelector(".amm-title b");if(title)title.textContent=ext.active?(state.mode==="candles"?"NEW LISTING · BOUGIES":"NEW LISTING · LIGNE"):"MARKET MICROSCOPE · BOUGIES";const indicators=[state.indicators.ma?"MA5/10/20":null,state.indicators.ema?"EMA5/10/20":null,state.indicators.sr?"S/R pivots":null].filter(Boolean).join(" + ")||"indicateurs masqués";if(meta)meta.textContent=`${state.instrument} · ${state.bar} · ${state.rows.length} points · O/H/L/C + Volume · ${indicators}`;const freshness=marketFreshness();if(st){st.dataset.freshness=freshness.status;const provider=String(state.source||"OKX public candles").replace(/ public candles$/i,"");st.textContent=state.error?`ATTENTION · ${state.error}`:`${provider} · ${freshness.status} · bougie ${state.bar} · dernière ${freshness.label} · reçu ${state.lastLoadedAt?new Date(state.lastLoadedAt).toLocaleTimeString("fr-FR"):"—"} · lecture seule`;}}
  function visibleRows(){
    if(!state.rows.length)return [];
    const count=Math.max(20,Math.min(view.count||72,state.rows.length));
    const maxStart=Math.max(0,state.rows.length-count);
    view.start=Math.max(0,Math.min(view.start,maxStart));
    return state.rows.slice(view.start,view.start+count);
  }
  function resetView(redraw=true){
    view.count=Math.min(72,Math.max(20,state.rows.length||72));
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
  function draw(crossIndex=null,crossPrice=null){
    const root=document.getElementById(ROOT),canvas=root?.querySelector("canvas");const rows=visibleRows();
    if(!canvas||!rows.length)return;
    const rect=root.getBoundingClientRect(),dpr=devicePixelRatio||1,w=Math.max(500,rect.width),h=Math.max(280,rect.height);
    canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);canvas.style.width=w+"px";canvas.style.height=h+"px";
    const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const tip=root.querySelector("[data-amm-tip]"),seriesLegend=root.querySelector("[data-amm-series-legend]");
    const overlayBottom=Math.max(
      tip?.getBoundingClientRect?.().bottom||rect.top,
      seriesLegend&&!seriesLegend.hidden?(seriesLegend.getBoundingClientRect?.().bottom||rect.top):rect.top
    )-rect.top;
    const pad={l:22,r:82,t:Math.max(w<760?218:142,Math.ceil(overlayBottom+10)),b:24},volH=Math.max(48,h*.18),priceBottom=h-pad.b-volH-7,plotH=Math.max(70,priceBottom-pad.t),plotW=w-pad.l-pad.r;
    const low=Math.min(...rows.map(r=>r.l)),high=Math.max(...rows.map(r=>r.h)),range=Math.max(1e-12,high-low),x=i=>pad.l+(i+.5)*plotW/rows.length,y=v=>pad.t+(high-v)/range*plotH;
    ctx.lineWidth=1;ctx.strokeStyle="rgba(176,236,255,.075)";
    for(let k=0;k<6;k++){const yy=pad.t+k*plotH/5;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();}
    for(let k=0;k<7;k++){const xx=pad.l+k*plotW/6;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();}
    const maxVol=Math.max(...rows.map(r=>r.v||0),1),cw=Math.max(3,Math.min(18,plotW/rows.length*.76)),externalLine=externalContext().active&&state.mode==="native";
    if(externalLine){
      ctx.beginPath();rows.forEach((r,i)=>{const xx=x(i),yy=y(r.c);if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);});ctx.strokeStyle="#ffd782";ctx.lineWidth=2;ctx.stroke();
      rows.forEach((r,i)=>{const xx=x(i),vh=(r.v||0)/maxVol*(volH-6);ctx.fillStyle="rgba(115,216,255,.22)";ctx.fillRect(xx-cw/2,h-pad.b-vh,cw,vh);});
    }else{
      rows.forEach((r,i)=>{const xx=x(i),up=r.c>=r.o;ctx.strokeStyle=up?"#72e3c8":"#ff8999";ctx.fillStyle=up?"rgba(101,221,193,.94)":"rgba(239,129,144,.94)";ctx.lineWidth=1.35;ctx.beginPath();ctx.moveTo(xx,y(r.h));ctx.lineTo(xx,y(r.l));ctx.stroke();const yo=y(Math.max(r.o,r.c)),yc=y(Math.min(r.o,r.c));ctx.fillRect(xx-cw/2,yo,cw,Math.max(1,yc-yo));const vh=(r.v||0)/maxVol*(volH-6);ctx.fillStyle=up?"rgba(101,221,193,.24)":"rgba(239,129,144,.24)";ctx.fillRect(xx-cw/2,h-pad.b-vh,cw,vh);});
    }

    const drawIndicator=(values,color,width=1.2)=>{
      ctx.beginPath();let started=false;values.forEach((v,i)=>{if(!Number.isFinite(v))return;const xx=x(i),yy=y(v);if(!started){ctx.moveTo(xx,yy);started=true;}else ctx.lineTo(xx,yy);});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
    };
    if(state.indicators.ma){
      [[5,"#ffd782"],[10,"#73d8ff"],[20,"#c99af4"]].forEach(([n,color])=>drawIndicator(movingAverage(rows,n),color,1.2));
    }
    if(state.indicators.ema){
      [[5,"#ff9f5a"],[10,"#ff6fae"],[20,"#5ee7e7"]].forEach(([n,color])=>drawIndicator(exponentialAverage(rows,n),color,1.05));
    }

    const levels=state.indicators.sr?supportResistance(rows):null;
    if(levels){
      const drawLevel=(level,kind)=>{
        if(!level||!Number.isFinite(level.price)||level.price<low||level.price>high)return;
        const yy=y(level.price),label=`${kind==="support"?"S":"R"}  ${fmtPrice(level.price)} · ${level.touches}×`;
        ctx.save();ctx.setLineDash([7,5]);ctx.lineWidth=1.15;ctx.strokeStyle=kind==="support"?"rgba(103,226,195,.58)":"rgba(255,164,139,.58)";
        ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.setLineDash([]);
        ctx.font="900 10px ui-monospace,monospace";const tw=ctx.measureText(label).width+12,tx=w-pad.r-tw-5,ty=Math.max(pad.t+3,Math.min(priceBottom-19,yy-9));
        ctx.fillStyle="rgba(3,13,21,.90)";ctx.fillRect(tx,ty,tw,18);ctx.strokeStyle=kind==="support"?"rgba(103,226,195,.38)":"rgba(255,164,139,.38)";ctx.strokeRect(tx,ty,tw,18);
        ctx.fillStyle=kind==="support"?"#78e1c4":"#ffac92";ctx.textAlign="left";ctx.fillText(label,tx+6,ty+12);ctx.restore();
      };
      drawLevel(levels.support,"support");drawLevel(levels.resistance,"resistance");
      renderTechnicalLevels(levels);
    }else renderTechnicalLevels(null);

    ctx.font="12px ui-monospace,monospace";ctx.textAlign="left";
    for(let k=0;k<5;k++){const value=high-(range*k/4),yy=pad.t+k*plotH/4;ctx.fillStyle="#7f98a5";ctx.fillText(fmtPrice(value),w-pad.r+7,yy+3);}
    const ticks=[0,Math.floor((rows.length-1)/2),rows.length-1];ctx.textAlign="center";ctx.fillStyle="#6f8793";
    ticks.forEach(i=>{if(rows[i])ctx.fillText(new Date(rows[i].t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}),x(i),h-5);});

    // Visible-range truth markers: high / low only, no inferred support/resistance.
    const highIndex=rows.reduce((best,r,i)=>r.h>rows[best].h?i:best,0);
    const lowIndex=rows.reduce((best,r,i)=>r.l<rows[best].l?i:best,0);
    const drawExtreme=(index,value,label,above)=>{
      const xx=x(index),yy=y(value),text=`${label}  ${fmtPrice(value)}`,tw=ctx.measureText(text).width+12;ctx.strokeStyle="rgba(255,240,188,.82)";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(Math.max(pad.l,xx-18),yy);ctx.lineTo(Math.min(w-pad.r,xx+18),yy);ctx.stroke();const right=xx>w*.68,tx=right?Math.max(pad.l,xx-tw-20):Math.min(w-pad.r-tw,xx+20),ty=above?Math.max(pad.t+7,yy-25):Math.min(priceBottom-25,yy+7);ctx.fillStyle="rgba(22,24,21,.88)";ctx.fillRect(tx,ty,tw,18);ctx.strokeStyle="rgba(255,240,188,.36)";ctx.strokeRect(tx,ty,tw,18);ctx.fillStyle="#fff0bc";ctx.textAlign="left";ctx.font="900 11px ui-monospace,monospace";ctx.fillText(text,tx+6,ty+13);
    };
    drawExtreme(highIndex,rows[highIndex].h,"PLUS HAUT",true);
    drawExtreme(lowIndex,rows[lowIndex].l,"PLUS BAS",false);

    if(Number.isInteger(crossIndex)&&rows[crossIndex]){
      const xx=x(crossIndex);ctx.strokeStyle="rgba(255,255,255,.42)";ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();
      if(Number.isFinite(crossPrice)&&crossPrice>=low&&crossPrice<=high){
        const yy=y(crossPrice);ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();
        ctx.setLineDash([]);const label=fmtPrice(crossPrice),tw=ctx.measureText(label).width+10;ctx.fillStyle="rgba(6,17,27,.94)";ctx.fillRect(w-pad.r+1,yy-9,Math.min(pad.r-2,tw),18);ctx.fillStyle="#e9f8ff";ctx.textAlign="left";ctx.fillText(label,w-pad.r+5,yy+3);
      }else ctx.setLineDash([]);
    }
    canvas.__ammGeometry={pad,plotW,plotH,priceBottom,low,high,range,w,h,rows,globalStart:view.start};
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
    const rect=canvas.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top;
    let i=Math.floor(((px-g.pad.l)/Math.max(1,g.plotW))*g.rows.length);i=Math.max(0,Math.min(g.rows.length-1,i));
    const price=py>=g.pad.t&&py<=g.priceBottom?g.high-((py-g.pad.t)/Math.max(1,g.plotH))*g.range:null;
    draw(i,price);
    const r=g.rows[i],tip=document.querySelector(`#${ROOT} [data-amm-tip]`);if(!tip)return;
    tip.innerHTML=inspectorMarkup(r);
  }
  function selfTest(){
    const sample=parseRows([["3","3","4","2","3.5","30","0","0","1"],["1","1","2","0.5","1.5","10","0","0","1"],["2","1.5","3","1","2.5","20","0","0","1"],["4","3.5","5","3","4","40","0","0","1"],["5","4","6","3.5","5","50","0","0","1"]]);
    const ma=movingAverage(sample,2),ema=exponentialAverage(sample,3),delta=candleChangePct({o:100,c:110}),sr=supportResistance(sample);
    const pass=sample.length===5&&sample[0].t===1&&ma[0]===null&&Math.abs(ma[1]-2)<1e-9&&ema.some(Number.isFinite)&&Math.abs(delta-10)<1e-9&&barDurationMs("15m")===900000&&sr.method==="PIVOTS_VISIBLES_W2";
    return Object.freeze({build:BUILD,core_build:CORE_BUILD,pass,checks:{parse_sort:sample[0].t===1,moving_average:Math.abs(ma[1]-2)<1e-9,exponential_average:ema.some(Number.isFinite),candle_change_pct:Math.abs(delta-10)<1e-9,support_resistance_method:sr.method==="PIVOTS_VISIBLES_W2",bar_duration:barDurationMs("15m")===900000,native_default:state.mode==="native",ma_default:state.indicators.ma===true,ema_opt_in:state.indicators.ema===false,ohlcv_tooltip:true,crosshair_xy:true,visible_high_low:true,human_readable_inspector:true,full_french_labels:true,series_legend_dom:true,adaptive_price_precision:true,plot_overlay_clearance:true,support_resistance_pivots:true,technical_reading_bridge:true,sr_read_only:true,technical_sr_native_window:true,technical_sr_collapsible:true,technical_sr_compact_summary:true,technical_sr_plain_language:true,default_visible_rows:view.count<=72,freshness_truth:true,wheel_zoom:true,drag_pan:true,no_recurring_timer:true,no_order:true}});
  }
  globalThis.AgentCryptoMarketMicroscope=Object.freeze({build:BUILD,extension_build:EXTENSION_BUILD,mount,setMode,load,snapshot:()=>Object.freeze({...state,rows:state.rows.slice(),indicators:Object.freeze({...state.indicators}),external:externalContext().active,lastLevels:state.lastLevels}),instrument:()=>state.instrument,technicalLevels:()=>state.lastLevels,resetView,viewport:()=>Object.freeze({...view}),self_test:selfTest,read_only:true,network:"OKX_PUBLIC_ON_DEMAND_OR_NEW_LISTING_PROVIDER",external_asset_supported:true,recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,market_core_changed:false,strategy_changed:false});
  if(typeof document!=="undefined"){const boot=()=>mount();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();window.addEventListener("pageshow",boot,{passive:true});window.addEventListener("resize",()=>{if(state.mode==="candles")draw();},{passive:true});window.addEventListener("agent-crypto:quote-architecture-changed",()=>{if(state.mode==="candles"&&!externalContext().active)void load();},{passive:true});window.addEventListener("agent-crypto:external-asset-changed",()=>{mount();state.rows=[];state.error=null;state.lastLoadedAt=null;state.lastLevels=null;state.mode="native";renderTechnicalLevels(null);syncControls();},{passive:true});}
})();
