/*
  Agent-Crypto Administrator — Aether runtime
  Responsibility: Aether status synthesis + read-only system/weather/BTC values.
  Presentation/animation belongs to admin-ribbons.css.
  Build: 40.4.101
  Revision: Aether priority Veille + telemetry truth — reads News Sentinel state only; no news fetch/timer.
*/
(() => {
  "use strict";
  function aetherText4084(id,fallback="—"){const n=document.getElementById(id);const v=String(n?.textContent||"").replace(/\s+/g," ").trim();return v||fallback;}
  function aetherCurrent4084(){try{return typeof atlasCurrentStateRead==="function"?(atlasCurrentStateRead()||null):null;}catch(_){return null;}}
  const AETHER_VEILLE_TOP_4087=5;
  const aetherVeilleState4087={index:0,fingerprint:"",last:null};
  const aetherVeilleNumber4087=value=>{const n=Number(value);return Number.isFinite(n)?n:0;};
  function aetherVeilleTimestamp4087(event){
    try{if(typeof newsFeedEventTimestamp==="function")return Number(newsFeedEventTimestamp(event)||0);}catch(_){}
    const parsed=Date.parse(event?.event_time||event?.published_at||event?.updated_at||event?.last_seen_at||"");
    return Number.isFinite(parsed)?parsed:0;
  }
  function aetherVeilleFreshnessWeight4087(event){
    const ts=aetherVeilleTimestamp4087(event);if(!ts)return 0;
    const hours=Math.max(0,(Date.now()-ts)/3600000);
    if(hours<2)return 90;if(hours<12)return 70;if(hours<48)return 50;if(hours<168)return 20;return 0;
  }
  function aetherVeilleDecisionWeight4087(event){
    const action=String(event?.decision?.action||"").toLowerCase(),tone=String(event?.decision?.tone||"").toLowerCase();
    let score=/alerte prioritaire/.test(action)?500:/surveillance renforc/.test(action)?360:/attendre.*source|vérifier|verifier/.test(action)?300:/archiver/.test(action)?60:140;
    if(tone==="danger")score+=120;else if(tone==="warn")score+=60;else if(tone==="ok")score+=20;
    return score;
  }
  function aetherVeilleContextWeight4087(event){
    const assets=(Array.isArray(event?.assets)?event.assets:[]).map(v=>String(v||"").toUpperCase());
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").toLowerCase());
    const active=`${aetherText4084("selectedAssetTitle","")} ${aetherText4084("atlasOracleAsset","")}`.toUpperCase();
    const top5=new Set(["BTC","ETH","BNB","XRP","SOL"]);
    let score=assets.some(symbol=>symbol&&active.includes(symbol))?80:0;
    if(assets.some(symbol=>top5.has(symbol)))score+=40;
    if(sectors.some(value=>value.includes("marché global")||value.includes("marche global")))score+=35;
    return score;
  }
  function aetherVeilleRank4087(event){
    return aetherVeilleDecisionWeight4087(event)
      +aetherVeilleNumber4087(event?.impact?.score)*10
      +aetherVeilleNumber4087(event?.evidence?.score)*2
      +Math.min(30,Math.max(0,aetherVeilleNumber4087(event?.source_count))*5)
      +aetherVeilleFreshnessWeight4087(event)
      +aetherVeilleContextWeight4087(event);
  }
  function aetherVeilleEvents4087(){
    let events=[];try{if(typeof newsFeedState!=="undefined"&&Array.isArray(newsFeedState?.events))events=newsFeedState.events.slice();}catch(_){}
    return events.map((event,order)=>({event,order,rank:aetherVeilleRank4087(event),time:aetherVeilleTimestamp4087(event)}))
      .sort((a,b)=>b.rank-a.rank||b.time-a.time||a.order-b.order).slice(0,AETHER_VEILLE_TOP_4087).map(row=>row.event);
  }
  function aetherVeilleScope4087(event){
    const assets=(Array.isArray(event?.assets)?event.assets:[]).map(v=>String(v||"").trim()).filter(Boolean);
    if(assets.length)return assets.slice(0,3).join("/");
    const sectors=(Array.isArray(event?.sectors)?event.sectors:[]).map(v=>String(v||"").trim()).filter(Boolean);
    return sectors[0]||"GLOBAL";
  }
  function aetherVeilleStatus4087(){
    let status="idle",payload=null,events=[];try{if(typeof newsFeedState!=="undefined"){status=String(newsFeedState.status||"idle");payload=newsFeedState.payload||null;events=Array.isArray(newsFeedState.events)?newsFeedState.events:[];}}catch(_){}
    let stats={events24:0,priority24:0,critical24:0};try{if(typeof newsFeedUniqueStats==="function")stats=newsFeedUniqueStats()||stats;}catch(_){}
    const decision=String(payload?.summary?.decision||"").trim();
    if((status==="idle"||status==="loading")&&!events.length)return{label:"EN ATTENTE",text:"Veille non chargée · News Sentinel en attente",tone:"neutral",events:[],stats,status,decision};
    if(status==="error"&&!events.length)return{label:"INDISPONIBLE",text:"Archive News Sentinel indisponible · aucune actualité inventée",tone:"danger",events:[],stats,status,decision};
    if(!events.length)return{label:"0 PRIORITAIRE",text:status==="ok"?"Archive chargée · aucun événement prioritaire":"Archive partielle · aucun événement exploitable",tone:status==="partial"?"warn":"ok",events:[],stats,status,decision};
    const ranked=aetherVeilleEvents4087();
    const globalTone=stats.critical24>0?"danger":stats.priority24>0||status==="partial"?"warn":"ok";
    return{label:`${stats.priority24||0} PRIORITAIRE${stats.priority24>1?"S":""}`,text:decision||"Surveillance",tone:globalTone,events:ranked,stats,status,decision};
  }
  function aetherVeilleCurrent4087(){
    const snapshot=aetherVeilleStatus4087(),events=snapshot.events||[];
    if(!events.length)return{...snapshot,index:0,total:0,event:null,meta:snapshot.label,detail:snapshot.text};
    aetherVeilleState4087.index=((aetherVeilleState4087.index%events.length)+events.length)%events.length;
    const event=events[aetherVeilleState4087.index],impactLevel=String(event?.impact?.level||"Impact").toUpperCase(),impact=Math.round(aetherVeilleNumber4087(event?.impact?.score));
    const scope=aetherVeilleScope4087(event),evidence=Math.round(aetherVeilleNumber4087(event?.evidence?.score));
    const action=String(event?.decision?.action||snapshot.decision||"Surveillance").trim();
    const source=String(event?.source_host||event?.source_name||event?.source_class||"").replace(/^www\./,"").trim();
    const freshness=String(event?.freshness?.label||"").trim();
    const headline=String(event?.headline||event?.event_label||"Événement à qualifier").replace(/\s+/g," ").trim();
    const meta=`${aetherVeilleState4087.index+1}/${events.length} · ${impactLevel} ${impact}/100 · ${scope}`;
    const detail=[snapshot.label,snapshot.decision,headline,evidence?`preuve ${evidence}/100`:null,action,freshness,source].filter(Boolean).join(" · ");
    return{...snapshot,index:aetherVeilleState4087.index,total:events.length,event,meta,detail};
  }
  function renderAetherVeille4087(){
    const host=document.getElementById("atlasAetherVeille4087"),meta=document.getElementById("atlasAetherVeilleMeta4087"),viewport=document.getElementById("atlasAetherVeilleViewport4087");
    if(!host||!meta||!viewport)return null;
    const current=aetherVeilleCurrent4087(),copies=host.querySelectorAll("[data-aether-veille-copy-4087]");
    if(meta.textContent!==current.meta)meta.textContent=current.meta;
    host.dataset.tone=current.tone||"neutral";
    const fingerprint=`${current.meta}|${current.detail}`;
    if(aetherVeilleState4087.fingerprint!==fingerprint){
      copies.forEach(node=>{if(node.textContent!==current.detail)node.textContent=current.detail;});
      aetherVeilleState4087.fingerprint=fingerprint;
      host.dataset.scroll="0";
      requestAnimationFrame(()=>{
        const first=host.querySelector("[data-aether-veille-copy-4087]:not([aria-hidden])");
        const shouldScroll=Boolean(first&&viewport&&first.scrollWidth>viewport.clientWidth+8);
        host.dataset.scroll=shouldScroll?"1":"0";
      });
    }
    aetherVeilleState4087.last=current;
    return current;
  }
  function aetherVeilleAdvance4087(){
    const ranked=aetherVeilleEvents4087();if(!ranked.length){aetherVeilleState4087.index=0;return renderAetherVeille4087();}
    aetherVeilleState4087.index=(aetherVeilleState4087.index+1)%ranked.length;aetherVeilleState4087.fingerprint="";return renderAetherVeille4087();
  }
  function aetherSnapshot4084(){
    const current=aetherCurrent4084();
    const reports=Array.isArray(current?.reports)?current.reports.length:0;
    const currentStatus=String(current?.status||"").trim().toUpperCase();
    const atlas=`${currentStatus||"VEILLE"}${reports?` · ${reports}/4`:""}${current?.aerith||current?.conclusion?" · Aerith disponible":""}`;
    const oracleAsset=aetherText4084("atlasOracleAsset","—");
    const oracleBias=aetherText4084("atlasOracleBias","ATTENTE");
    const oracleConfidence=aetherText4084("atlasOracleConfidence","");
    const oracle=[oracleAsset&&!/attente/i.test(oracleAsset)?oracleAsset:null,oracleBias&&!/livecheck requis/i.test(oracleBias)?oracleBias:null,oracleConfidence&&!/—$/.test(oracleConfidence)?oracleConfidence:null].filter(Boolean).join(" · ")||"ATTENTE";
    const sources=aetherText4084("sourceName","Aucune source");
    let book="APRÈS AUTH";try{if(typeof atlasBookMirrorBridgeState40377!=="undefined"){book=atlasBookMirrorBridgeState40377.credentialReady===true?"PRÊT":atlasBookMirrorBridgeState40377.credentialReady===false?"CREDENTIAL REQUIS":"EN VEILLE";}}catch(_){}
    const veille=aetherVeilleCurrent4087();
    const news=veille.detail||veille.text||"Veille non chargée";
    const graphTop5=document.getElementById("btnChartTop5")?.classList?.contains("active")===true;
    const graphTitle=aetherText4084("selectedAssetTitle","Aucune sélection");
    const graph=graphTop5?"TOP 5":graphTitle;
    return {current,reports,currentStatus,atlas,oracle,sources,book,news,graph};
  }
  function aetherPanelEnsure4084(){
    let panel=document.getElementById("atlasAetherStatusPanel4084");if(panel)return panel;
    panel=document.createElement("section");panel.id="atlasAetherStatusPanel4084";panel.hidden=true;panel.setAttribute("aria-label","Synthèse Aether");
    panel.innerHTML=`<div class="atlas-aether-panel-head-4084"><b>♥ AETHER · SYNTHÈSE PASSIVE</b><button type="button" data-aether-close-4084 aria-label="Fermer">×</button></div><div class="atlas-aether-panel-grid-4084"><article><span>Atlas</span><b data-aether-row-4084="atlas">—</b></article><article><span>Oracle</span><b data-aether-row-4084="oracle">—</b></article><article><span>Sources</span><b data-aether-row-4084="sources">—</b></article><article><span>Dernière veille</span><b data-aether-row-4084="news">—</b></article></div>`;
    document.body.appendChild(panel);panel.querySelector("[data-aether-close-4084]")?.addEventListener("click",()=>aetherPanelSet4084(false));return panel;
  }
  function aetherPanelSet4084(open){const button=document.getElementById("atlasAetherStatusToggle4084");const panel=open?aetherPanelEnsure4084():document.getElementById("atlasAetherStatusPanel4084");if(panel)panel.hidden=!open;if(button)button.setAttribute("aria-expanded",open?"true":"false");if(open)renderAether4084();}
  function renderAether4084(){
    const s=aetherSnapshot4084();
    const put=(id,value)=>{const n=document.getElementById(id);if(n&&n.textContent!==value)n.textContent=value;};
    put("atlasAetherRibbonAtlas4084",`Atlas · ${s.atlas}`);put("atlasAetherRibbonOracle4084",`Oracle · ${s.oracle}`);put("atlasAetherRibbonSources4084",`Sources · ${s.sources}`);put("atlasAetherRibbonBook4084",`Book · ${s.book}`);
    renderAetherVeille4087();
    let stateLabel="VEILLE";if(/open|running|active|produ/i.test(s.currentStatus))stateLabel="CURRENT";else if(s.reports>=4)stateLabel="ATLAS 4/4";else if(s.oracle&&!/ATTENTE/.test(s.oracle))stateLabel="ORACLE";try{if(aetherVeilleCurrent4087().tone==="danger")stateLabel="ATTENTION";}catch(_){}put("atlasAetherStatusLabel4084",`Aether · ${stateLabel}`);
    const panel=document.getElementById("atlasAetherStatusPanel4084");if(panel&&!panel.hidden){const row=(k,v)=>{const n=panel.querySelector(`[data-aether-row-4084="${k}"]`);if(n)n.textContent=v;};row("atlas",`${s.atlas} · Graphe ${s.graph}`);row("oracle",s.oracle);row("sources",`${s.sources} · Book ${s.book}`);row("news",s.news);}
  }

  const AETHER_SYSTEM_BACKEND_4086="http://127.0.0.1:8790/system";
  const AETHER_WEATHER_4086=Object.freeze({latitude:48.5876,longitude:1.5784,timezone:"Europe/Paris",ttl:15*60*1000,label:"Maintenon"});
  const aetherSystemState4086={system:null,systemAt:0,systemInflight:null,weather:null,weatherAt:0,weatherInflight:null,weatherStale:false};
  const aetherSystemNumber4086=value=>{
    if(value===null||value===undefined)return null;
    if(typeof value==="string"&&!value.trim())return null;
    const n=Number(value);
    return Number.isFinite(n)?n:null;
  };
  const aetherSystemPercent4086=value=>{const n=aetherSystemNumber4086(value);return n!==null&&n>=0&&n<=100?n:null;};
  const aetherSystemTemperature4086=value=>{const n=aetherSystemNumber4086(value);return n!==null&&n>0&&n<150?n:null;};
  function aetherSystemSet4086(key,value,{icon=null,tone=null,title=null}={}){
    const item=document.querySelector(`#atlasAetherSystem4086 [data-aether-system-4086="${key}"]`);if(!item)return;
    const out=item.querySelector(".atlas-aether-system-value-4086");if(out&&out.textContent!==String(value))out.textContent=String(value);
    if(icon){const node=item.querySelector(".atlas-aether-system-icon-4086");if(node&&node.textContent!==icon)node.textContent=icon;}
    if(title)item.title=title;
    if(key==="btc")item.dataset.tone=tone||"flat";
  }
  function aetherWeatherIcon4086(code){const c=aetherSystemNumber4086(code);if(c===null)return"·";if(c===0)return"☀";if([1,2,3].includes(c))return"☁";if([45,48].includes(c))return"≋";if((c>=51&&c<=67)||(c>=80&&c<=82))return"☂";if((c>=71&&c<=77)||(c>=85&&c<=86))return"❄";if(c>=95)return"⚡";return"☁";}
  function aetherBtc4086(){
    try{
      const coin=(typeof state!=="undefined"&&Array.isArray(state?.coins))?state.coins.find(row=>String(row?.symbol||"").toUpperCase()==="BTC"||row?.id==="bitcoin"):null;
      const price=aetherSystemNumber4086(coin?.price),change=aetherSystemNumber4086(coin?.change24h);
      if(price===null||price<=0)return{value:"—",tone:"flat",title:"BTC live indisponible"};
      const priceText=new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:price>=1000?0:2}).format(price);
      const changeText=change===null?"":` · ${change>=0?"+":""}${change.toFixed(2)} %`;
      return{value:`${priceText}${changeText}`,tone:change>0?"positive":change<0?"negative":"flat",title:"Bitcoin · prix live Agent-Crypto"};
    }catch(_){return{value:"—",tone:"flat",title:"BTC live indisponible"};}
  }
  function renderAetherSystem4086(){
    const sys=aetherSystemState4086.system||{};
    const cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),cpuTemp=aetherSystemTemperature4086(sys?.cpu?.temperature_c);
    const gpuStatus=String(sys?.gpu?.status||"").trim().toLowerCase();
    const gpu=gpuStatus&&gpuStatus!=="ok"?null:aetherSystemPercent4086(sys?.gpu?.usage_pct);
    const gpuTemp=gpuStatus&&gpuStatus!=="ok"?null:aetherSystemTemperature4086(sys?.gpu?.temperature_c);
    const ram=aetherSystemPercent4086(sys?.memory?.usage_pct),used=aetherSystemNumber4086(sys?.memory?.used_gb),total=aetherSystemNumber4086(sys?.memory?.total_gb);
    aetherSystemSet4086("cpu",cpu===null?"N/D":`${Math.round(cpu)} %${cpuTemp===null?"":` · ${Math.round(cpuTemp)}°`}`,{title:sys?.cpu?.name||"CPU Windows · backend local 8790"});
    aetherSystemSet4086("gpu",gpu===null?"N/D":`${Math.round(gpu)} %${gpuTemp===null?"":` · ${Math.round(gpuTemp)}°`}`,{title:sys?.gpu?.name||"GPU · backend local 8790"});
    const ramDetail=used!==null&&total!==null&&total>0&&used>=0&&used<=total?` · ${used.toFixed(1)}/${total.toFixed(1)} Go`:"";
    aetherSystemSet4086("ram",ram===null?"N/D":`${Math.round(ram)} %${ramDetail}`,{title:"RAM Windows · backend local 8790"});
    const weather=aetherSystemState4086.weather;
    const weatherTemp=aetherSystemNumber4086(weather?.temperature_c);
    aetherSystemSet4086("weather",weatherTemp!==null&&weatherTemp>=-80&&weatherTemp<=60?`${Math.round(weatherTemp)} °C${aetherSystemState4086.weatherStale?" · cache":""}`:"N/D",{icon:aetherWeatherIcon4086(weather?.weather_code),title:`Maintenon · Eure-et-Loir · Open-Meteo${aetherSystemState4086.weatherStale?" · dernière valeur valide conservée":""}`});
    const btc=aetherBtc4086();aetherSystemSet4086("btc",btc.value,{tone:btc.tone,title:btc.title});
  }
  function aetherSystemBackend4086(force=false){
    const now=Date.now();if(aetherSystemState4086.systemInflight)return aetherSystemState4086.systemInflight;
    if(!force&&now-aetherSystemState4086.systemAt<15000){renderAetherSystem4086();return Promise.resolve(aetherSystemState4086.system);}
    const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),1800);
    aetherSystemState4086.systemInflight=fetch(AETHER_SYSTEM_BACKEND_4086,{cache:"no-store",headers:{Accept:"application/json"},signal:controller.signal})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{aetherSystemState4086.system=payload&&payload.read_only===true?payload:null;aetherSystemState4086.systemAt=Date.now();return aetherSystemState4086.system;})
      .catch(()=>{aetherSystemState4086.system=null;aetherSystemState4086.systemAt=Date.now();return null;})
      .finally(()=>{window.clearTimeout(timeout);aetherSystemState4086.systemInflight=null;renderAetherSystem4086();});
    return aetherSystemState4086.systemInflight;
  }
  function aetherSystemWeather4086(force=false){
    const now=Date.now();if(aetherSystemState4086.weatherInflight)return aetherSystemState4086.weatherInflight;
    if(!force&&now-aetherSystemState4086.weatherAt<AETHER_WEATHER_4086.ttl){renderAetherSystem4086();return Promise.resolve(aetherSystemState4086.weather);}
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${AETHER_WEATHER_4086.latitude}&longitude=${AETHER_WEATHER_4086.longitude}&current=temperature_2m,weather_code&timezone=${encodeURIComponent(AETHER_WEATHER_4086.timezone)}`;
    aetherSystemState4086.weatherInflight=fetch(url,{cache:"no-store",headers:{Accept:"application/json"}})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{const t=aetherSystemNumber4086(payload?.current?.temperature_2m),code=aetherSystemNumber4086(payload?.current?.weather_code);aetherSystemState4086.weather=t===null?null:{temperature_c:t,weather_code:code};aetherSystemState4086.weatherStale=false;aetherSystemState4086.weatherAt=Date.now();return aetherSystemState4086.weather;})
      .catch(()=>{aetherSystemState4086.weatherStale=Boolean(aetherSystemState4086.weather);aetherSystemState4086.weatherAt=Date.now();return aetherSystemState4086.weather;})
      .finally(()=>{aetherSystemState4086.weatherInflight=null;renderAetherSystem4086();});
    return aetherSystemState4086.weatherInflight;
  }
  function aetherSystemRefresh4086({force=false}={}){
    renderAetherSystem4086();
    if(document.hidden)return Promise.resolve(false);
    return Promise.allSettled([aetherSystemBackend4086(force),aetherSystemWeather4086(force)]);
  }

  function aetherBindMarketCompletion4086(){
    if(globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__===true)return true;
    try{
      if(typeof atlasAfterLivecheck!=="function")return false;
      const base=atlasAfterLivecheck;
      atlasAfterLivecheck=function atlasAfterLivecheckAether4086(options={}){
        const result=base.apply(this,arguments);
        queueMicrotask(()=>{try{renderAether4084();renderAetherSystem4086();}catch(_){}});
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__=true;
      return true;
    }catch(_){return false;}
  }


  function refreshAether({force=false}={}){
    renderAether4084();
    renderAetherVeille4087();
    return aetherSystemRefresh4086({force});
  }

  function bindAether(){
    const button=document.getElementById("atlasAetherStatusToggle4084");
    if(button&&button.dataset.aetherBound!=="1"){
      button.dataset.aetherBound="1";
      button.addEventListener("click",()=>aetherPanelSet4084(button.getAttribute("aria-expanded")!=="true"));
    }
    window.addEventListener("erith:operator-priority-release",()=>{renderAether4084();renderAetherSystem4086();renderAetherVeille4087();},{passive:true});
    const ribbon=document.getElementById("atlasAetherRibbon4084");
    if(ribbon&&ribbon.dataset.aetherVeilleCycleBound!=="1"){
      ribbon.dataset.aetherVeilleCycleBound="1";
      ribbon.addEventListener("animationiteration",event=>{if(event.target===ribbon&&event.animationName==="atlasAetherBandPhase")aetherVeilleAdvance4087();},{passive:true});
    }
    aetherBindMarketCompletion4086();
    refreshAether({force:true});
  }

  const api=Object.freeze({
    build:"40.4.101",
    backend:AETHER_SYSTEM_BACKEND_4086,
    weather:"Maintenon · Eure-et-Loir",
    refresh:refreshAether,
    pulse:()=>refreshAether(),
    snapshot:()=>Object.freeze({
      status:aetherSnapshot4084(),
      system:aetherSystemState4086.system,
      weather:aetherSystemState4086.weather,
      system_at:aetherSystemState4086.systemAt,
      weather_at:aetherSystemState4086.weatherAt,
      veille:aetherVeilleState4087.last||aetherVeilleCurrent4087()
    }),
    single_lane:true,
    presentation_owner:"admin-ribbons.css",
    new_recurring_timer:false,
    bridge_telemetry_owner:false,
    telemetry_null_is_zero:false,
    market_completion_refresh:true,
    veille_owner:"News Sentinel state (read-only)",
    veille_top:AETHER_VEILLE_TOP_4087,
    veille_new_timer:false,
    veille_new_fetch:false
  });
  globalThis.AgentCryptoAether=api;
  /* Compatibility read-only alias for diagnostics that knew the R6/R7 object. */
  globalThis.AgentCryptoAetherSystem4086=api;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindAether,{once:true});
  else bindAether();
})();
