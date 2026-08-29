/* Agent-Crypto @erith.IA — 40.4.99 R4
   RESIDENT ATLAS WAKE + AETHER-SHARED OPERATOR TELEMETRY

   R4 repairs the resident Atlas wake and keeps the operator telemetry inside
   the EXISTING Aether/technical row. ZERO additional header row is created.
   Weather = Maintenon, Eure-et-Loir (Open-Meteo, fixed coordinates).
   CPU/GPU/RAM are displayed only when real Bridge telemetry exists; otherwise N/D.
   No recurring timer, no polling loop, no second CURRENT controller. */
(()=>{
  "use strict";
  const BUILD="40.4.99 R4";
  const MACHINE_BUILD="40.4.99.4";

  const MARKET_PULSE_WAKEUP_R4=Object.freeze({
    build:BUILD,machine_build:MACHINE_BUILD,owner:"app.js canonical market pulse",
    eligibility:"document-visibility-only",focus_required:false,hidden_document_sleeps:true,
    deferred_install_after_app:true,new_market_timer:false,second_current_controller:false
  });

  function installMarketPulseWakeupR4(){
    const current=globalThis.atlasPulseVisible;
    if(typeof current!=="function")return false;
    if(current.__erithMarketPulseWakeup40499R4===true)return true;
    const refined=function atlasPulseVisible40499R4(){
      if(typeof document==="undefined")return true;
      return document.hidden!==true;
    };
    try{Object.defineProperty(refined,"__erithMarketPulseWakeup40499R4",{value:true});}catch(_){}
    globalThis.atlasPulseVisible=refined;
    const installed=globalThis.atlasPulseVisible===refined;
    if(installed&&document?.documentElement){
      document.documentElement.dataset.marketPulseWakeup40499R4="visibility-only";
      document.documentElement.dataset.marketPulseMachineBuild40499R4=MACHINE_BUILD;
    }
    return installed;
  }

  function r4SafeCall(name,args=[]){
    try{const fn=globalThis[name];return typeof fn==="function"?fn(...args):undefined;}catch(_){return undefined;}
  }
  function r4ProductionAuthorized(){
    try{
      const authorized=typeof globalThis.atlasAccessIsAuthorized!=="function"||globalThis.atlasAccessIsAuthorized();
      const production=typeof globalThis.atlasDeviceComputeAllowed!=="function"||globalThis.atlasDeviceComputeAllowed();
      return authorized&&production;
    }catch(_){return false;}
  }
  function r4PendingCanonicalMarket(){
    if(!r4ProductionAuthorized())return null;
    try{
      const snapshot=typeof globalThis.atlasBuildCryptoPageSnapshot==="function"?globalThis.atlasBuildCryptoPageSnapshot():null;
      if(!snapshot)return null;
      const qualification=typeof globalThis.atlasCurrentQualification==="function"?globalThis.atlasCurrentQualification(snapshot):null;
      if(qualification&&qualification.qualified!==true)return null;
      const marketId=typeof globalThis.atlasAutomation341SnapshotId==="function"?String(globalThis.atlasAutomation341SnapshotId(snapshot)||"").trim():"";
      if(!marketId)return null;
      const lastDone=typeof globalThis.atlasAutomation341ReadLastCurrentMarketId==="function"?String(globalThis.atlasAutomation341ReadLastCurrentMarketId()||"").trim():"";
      let proofMarket="";
      try{const proof=typeof globalThis.atlasCanonicalCurrentProof389==="function"?globalThis.atlasCanonicalCurrentProof389(null):null;proofMarket=String(proof?.marketId||"").trim();}catch(_){}
      if((lastDone&&marketId===lastDone)||(proofMarket&&marketId===proofMarket))return null;
      return {snapshot,qualification,marketId,lastDone,proofMarket};
    }catch(_){return null;}
  }
  function r4ResidentAtlasWake(reason="resident-r4"){
    const pending=r4PendingCanonicalMarket();
    if(!pending)return false;
    try{
      const connected=typeof atlasLocalDialogueState!=="undefined"&&atlasLocalDialogueState?.connected===true;
      if(!connected){r4SafeCall("atlasLocalBridgeAutoSync",[`r4-${String(reason)}`]);return true;}
      if(typeof globalThis.atlasCurrentPendingAutoKick4051==="function")return globalThis.atlasCurrentPendingAutoKick4051(`r4-${String(reason)}`)!==false;
      if(typeof globalThis.atlasLocalReportsScheduleAutomatic==="function"){
        try{if(typeof atlasLocalReportsState!=="undefined"&&atlasLocalReportsState?.automaticCycleClosed===true)r4SafeCall("atlasLocalReportsOpenAutomaticCycle",["r4-new-canonical-snapshot"]);}catch(_){}
        return globalThis.atlasLocalReportsScheduleAutomatic("snapshot",{delayMs:250})!==false;
      }
    }catch(_){}
    return false;
  }
  function r4WrapRuntimeOwner(name,after){
    const current=globalThis[name];
    if(typeof current!=="function"||current.__erithR4Wrapped===true)return false;
    const wrapped=function(...args){
      const result=current.apply(this,args);
      Promise.resolve(result).then(value=>{try{after?.(value,args);}catch(_){}},()=>{});
      return result;
    };
    try{Object.defineProperty(wrapped,"__erithR4Wrapped",{value:true});}catch(_){}
    globalThis[name]=wrapped;
    return globalThis[name]===wrapped;
  }

  const R4_WEATHER=Object.freeze({label:"Maintenon · Eure-et-Loir",latitude:48.5876,longitude:1.5784,timezone:"Europe/Paris",ttl_ms:15*60*1000,source:"Open-Meteo"});
  const r4OperatorState={weather:null,weatherError:"",weatherCheckedAt:0,weatherInFlight:null,telemetry:null,bridgeCheckedAt:0};
  function r4Number(value){const n=Number(value);return Number.isFinite(n)?n:null;}
  function r4Path(obj,path){let cur=obj;for(const key of String(path||"").split(".")){if(cur==null||typeof cur!=="object"||!(key in cur))return undefined;cur=cur[key];}return cur;}
  function r4Pick(obj,paths=[]){for(const path of paths){const n=r4Number(r4Path(obj,path));if(n!==null)return n;}return null;}
  function r4BytesToGb(value){const n=r4Number(value);return n!==null&&n>=0?n/1073741824:null;}
  function r4MbToGb(value){const n=r4Number(value);return n!==null&&n>=0?n/1024:null;}

  function r4CaptureBridgeTelemetry(payload){
    if(!payload||typeof payload!=="object")return false;
    const cpuPct=r4Pick(payload,["telemetry.cpu.usage_pct","telemetry.cpu.percent","system.cpu.usage_pct","system.cpu.percent","hardware.cpu.usage_pct","host.cpu.usage_pct","metrics.cpu_percent","cpu_percent","cpu_usage_pct"]);
    const cpuTemp=r4Pick(payload,["telemetry.cpu.temperature_c","telemetry.cpu.temp_c","system.cpu.temperature_c","hardware.cpu.temperature_c","metrics.cpu_temp_c","cpu_temp_c","cpu_temperature_c"]);
    const gpuPct=r4Pick(payload,["telemetry.gpu.usage_pct","telemetry.gpu.percent","system.gpu.usage_pct","system.gpu.percent","hardware.gpu.usage_pct","host.gpu.usage_pct","metrics.gpu_percent","gpu_percent","gpu_usage_pct"]);
    const gpuTemp=r4Pick(payload,["telemetry.gpu.temperature_c","telemetry.gpu.temp_c","system.gpu.temperature_c","hardware.gpu.temperature_c","metrics.gpu_temp_c","gpu_temp_c","gpu_temperature_c"]);
    let ramPct=r4Pick(payload,["telemetry.ram.usage_pct","telemetry.memory.usage_pct","system.ram.usage_pct","system.memory.usage_pct","hardware.ram.usage_pct","host.memory.usage_pct","metrics.ram_percent","memory_percent","ram_percent"]);
    let ramUsedGb=r4Pick(payload,["telemetry.ram.used_gb","telemetry.memory.used_gb","system.ram.used_gb","system.memory.used_gb","ram_used_gb","memory_used_gb"]);
    let ramTotalGb=r4Pick(payload,["telemetry.ram.total_gb","telemetry.memory.total_gb","system.ram.total_gb","system.memory.total_gb","ram_total_gb","memory_total_gb"]);
    if(ramUsedGb===null){const bytes=r4Pick(payload,["telemetry.ram.used_bytes","telemetry.memory.used_bytes","system.memory.used_bytes","ram_used_bytes","memory_used_bytes"]);if(bytes!==null)ramUsedGb=r4BytesToGb(bytes);}
    if(ramTotalGb===null){const bytes=r4Pick(payload,["telemetry.ram.total_bytes","telemetry.memory.total_bytes","system.memory.total_bytes","ram_total_bytes","memory_total_bytes"]);if(bytes!==null)ramTotalGb=r4BytesToGb(bytes);}
    if(ramUsedGb===null){const mb=r4Pick(payload,["telemetry.ram.used_mb","telemetry.memory.used_mb","system.memory.used_mb","ram_used_mb","memory_used_mb"]);if(mb!==null)ramUsedGb=r4MbToGb(mb);}
    if(ramTotalGb===null){const mb=r4Pick(payload,["telemetry.ram.total_mb","telemetry.memory.total_mb","system.memory.total_mb","ram_total_mb","memory_total_mb"]);if(mb!==null)ramTotalGb=r4MbToGb(mb);}
    if(ramPct===null&&ramUsedGb!==null&&ramTotalGb&&ramTotalGb>0)ramPct=ramUsedGb/ramTotalGb*100;
    const found=[cpuPct,cpuTemp,gpuPct,gpuTemp,ramPct,ramUsedGb,ramTotalGb].some(v=>v!==null);
    if(found){r4OperatorState.telemetry={cpuPct,cpuTemp,gpuPct,gpuTemp,ramPct,ramUsedGb,ramTotalGb};r4OperatorState.bridgeCheckedAt=Date.now();}
    return found;
  }

  function r4WeatherIcon(code){
    const c=Number(code);if(c===0)return "☀";if([1,2,3].includes(c))return "☁";if([45,48].includes(c))return "≋";
    if((c>=51&&c<=67)||(c>=80&&c<=82))return "☂";if((c>=71&&c<=77)||(c>=85&&c<=86))return "❄";if(c>=95)return "⚡";return "☁";
  }
  function r4EnsureWeather(force=false){
    const now=Date.now();
    if(r4OperatorState.weatherInFlight)return r4OperatorState.weatherInFlight;
    if(!force&&r4OperatorState.weatherCheckedAt&&now-r4OperatorState.weatherCheckedAt<R4_WEATHER.ttl_ms)return Promise.resolve(r4OperatorState.weather);
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(R4_WEATHER.latitude)}&longitude=${encodeURIComponent(R4_WEATHER.longitude)}&current=temperature_2m,weather_code&timezone=${encodeURIComponent(R4_WEATHER.timezone)}`;
    r4OperatorState.weatherInFlight=fetch(url,{cache:"no-store",headers:{Accept:"application/json"}})
      .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
      .then(payload=>{
        const temperature=r4Number(payload?.current?.temperature_2m),code=r4Number(payload?.current?.weather_code);
        if(temperature===null)throw new Error("temperature absente");
        r4OperatorState.weather={temperature,code};r4OperatorState.weatherError="";r4OperatorState.weatherCheckedAt=Date.now();r4RenderSystemRibbon();return r4OperatorState.weather;
      })
      .catch(error=>{r4OperatorState.weather=null;r4OperatorState.weatherError=String(error?.message||error||"indisponible");r4OperatorState.weatherCheckedAt=Date.now();r4RenderSystemRibbon();return null;})
      .finally(()=>{r4OperatorState.weatherInFlight=null;});
    return r4OperatorState.weatherInFlight;
  }

  function r4InstallStyles(){
    if(document.getElementById("atlasOperatorSystemRibbonR4Style"))return;
    const style=document.createElement("style");style.id="atlasOperatorSystemRibbonR4Style";
    style.textContent=`
      @keyframes atlasAetherPageAR4{0%,49%{opacity:0;visibility:hidden}50%,61%{opacity:1;visibility:visible}63%,100%{opacity:0;visibility:hidden}}
      @keyframes atlasAetherPageBR4{0%,62%{opacity:0;visibility:hidden}64%,75%{opacity:1;visibility:visible}77%,100%{opacity:0;visibility:hidden}}
      @keyframes atlasAetherSystemPageR4{0%,76%{opacity:0;visibility:hidden}78%,89%{opacity:1;visibility:visible}91%,100%{opacity:0;visibility:hidden}}
      @keyframes atlasAetherNewsReadPageBR4{0%,64%{transform:translateX(0)}75%{transform:translateX(-22vw)}77%,100%{transform:translateX(0)}}
      #atlasAetherRibbon4084 #atlasAetherRibbonAtlas4084::before{content:"▱ ";color:#b9a8ff}
      #atlasAetherRibbon4084 #atlasAetherRibbonOracle4084::before{content:"▦ ";color:#f0cf75}
      #atlasAetherRibbon4084 #atlasAetherRibbonSources4084::before{content:"▱ ";color:#76e3ed}
      #atlasAetherRibbon4084 #atlasAetherRibbonBook4084::before{content:"▱ ";color:#91d3a7}
      #atlasAetherRibbon4084 .atlas-aether-news-window-4084>i::before{content:"▱ ";color:#86a4b2}
      #atlasOperatorSystemRibbonR4{display:none}
      @media (min-width:901px) and (prefers-reduced-motion:no-preference){
        body #atlasAetherRibbon4084 .atlas-aether-ribbon-brand-4084,
        body #atlasAetherRibbon4084 #atlasAetherRibbonAtlas4084,
        body #atlasAetherRibbon4084 #atlasAetherRibbonOracle4084{animation:atlasAetherPageAR4 36s linear infinite!important}
        body #atlasAetherRibbon4084 #atlasAetherRibbonSources4084,
        body #atlasAetherRibbon4084 #atlasAetherRibbonBook4084,
        body #atlasAetherRibbon4084 .atlas-aether-news-window-4084{animation:atlasAetherPageBR4 36s linear infinite!important}
        body #atlasAetherRibbon4084 #atlasAetherRibbonNews4084[data-scroll="1"]{animation:atlasAetherNewsReadPageBR4 36s ease-in-out infinite!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4{display:flex!important;grid-column:1/-1!important;grid-row:1!important;align-self:stretch!important;align-items:center!important;justify-content:space-between!important;gap:0!important;width:100%!important;min-width:0!important;height:100%!important;min-height:0!important;margin:0!important;padding:0 6px!important;box-sizing:border-box!important;border:0!important;border-radius:0!important;background:transparent!important;overflow:hidden!important;opacity:0;visibility:hidden;animation:atlasAetherSystemPageR4 36s linear infinite!important;z-index:5!important;font:900 9.4px/1.15 system-ui,sans-serif;letter-spacing:.025em;color:#a9c6d3!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4 .r4-system-item{display:inline-flex!important;align-items:center!important;gap:5px!important;flex:1 1 auto!important;justify-content:center!important;min-width:0!important;height:100%!important;padding:0 12px!important;border:0!important;border-left:1px solid rgba(121,190,210,.14)!important;border-radius:0!important;background:transparent!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4 .r4-system-item:first-child{border-left:0!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4 .r4-system-icon{font-size:11px!important;color:#8edce9!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4 .r4-system-label{color:#7596a5!important;font-weight:900!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4 .r4-system-value{color:#c9dce4!important;font-variant-numeric:tabular-nums!important;overflow:hidden!important;text-overflow:ellipsis!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4 .r4-btc.is-positive .r4-system-value{color:#7bf2aa!important;text-shadow:0 0 7px rgba(123,242,170,.18)!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4 .r4-btc.is-negative .r4-system-value{color:#ff7895!important;text-shadow:0 0 7px rgba(255,120,149,.18)!important}
        body #atlasAetherRibbon4084 #atlasOperatorSystemRibbonR4 .r4-btc.is-flat .r4-system-value{color:#d6dce0!important}
      }
    `;
    document.head.appendChild(style);
  }

  function r4EnsureSystemRibbon(){
    const track=document.querySelector("#atlasAetherRibbon4084 .atlas-aether-ribbon-track-4085");
    if(!track)return null;
    let root=document.getElementById("atlasOperatorSystemRibbonR4");
    if(!root){
      root=document.createElement("span");root.id="atlasOperatorSystemRibbonR4";
      root.setAttribute("aria-label","État système opérateur · même ligne Aether · télémétrie locale, météo Maintenon et BTC");
      root.innerHTML=`
        <span class="r4-system-item r4-cpu" data-r4="cpu"><span class="r4-system-icon">▦</span><span class="r4-system-label">CPU</span><b class="r4-system-value">N/D</b></span>
        <span class="r4-system-item r4-gpu" data-r4="gpu"><span class="r4-system-icon">▦</span><span class="r4-system-label">GPU</span><b class="r4-system-value">N/D</b></span>
        <span class="r4-system-item r4-ram" data-r4="ram"><span class="r4-system-icon">▦</span><span class="r4-system-label">RAM</span><b class="r4-system-value">N/D</b></span>
        <span class="r4-system-item r4-weather" data-r4="weather" title="Open-Meteo · Maintenon fixe · aucune géolocalisation navigateur"><span class="r4-system-icon">☁</span><span class="r4-system-label">Maintenon</span><b class="r4-system-value">météo…</b></span>
        <span class="r4-system-item r4-btc is-flat" data-r4="btc"><span class="r4-system-icon">₿</span><span class="r4-system-label">BTC</span><b class="r4-system-value">—</b></span>`;
    }
    if(root.parentElement!==track)track.appendChild(root);
    return root;
  }
  function r4SetItem(root,key,value,{icon=null,tone=null,title=null}={}){
    const item=root?.querySelector(`[data-r4="${key}"]`);if(!item)return;
    const out=item.querySelector(".r4-system-value");if(out&&out.textContent!==String(value))out.textContent=String(value);
    if(icon){const node=item.querySelector(".r4-system-icon");if(node&&node.textContent!==icon)node.textContent=icon;}
    if(title)item.title=title;
    if(key==="btc"){item.classList.toggle("is-positive",tone==="positive");item.classList.toggle("is-negative",tone==="negative");item.classList.toggle("is-flat",!tone||tone==="flat");}
  }
  function r4Round(value,digits=0){const n=r4Number(value);if(n===null)return null;const p=10**digits;return Math.round(n*p)/p;}
  function r4TelemetryText(){
    const t=r4OperatorState.telemetry,threads=Number(navigator.hardwareConcurrency||0);
    if(!t)return {cpu:threads?`${threads}T · télémétrie N/D`:"télémétrie N/D",gpu:"télémétrie N/D",ram:"télémétrie N/D"};
    const cpu=t.cpuPct!==null?`${r4Round(t.cpuPct)} %${t.cpuTemp!==null?` · ${r4Round(t.cpuTemp)}°C`:""}`:(threads?`${threads}T · charge N/D`:"charge N/D");
    const gpu=t.gpuPct!==null?`${r4Round(t.gpuPct)} %${t.gpuTemp!==null?` · ${r4Round(t.gpuTemp)}°C`:""}`:"charge N/D";
    let ram="N/D";if(t.ramUsedGb!==null&&t.ramTotalGb!==null)ram=`${r4Round(t.ramUsedGb,1)}/${r4Round(t.ramTotalGb,1)} Go${t.ramPct!==null?` · ${r4Round(t.ramPct)} %`:""}`;else if(t.ramPct!==null)ram=`${r4Round(t.ramPct)} %`;
    return {cpu,gpu,ram};
  }
  function r4ParsePct(text){const clean=String(text||"").replace(/−/g,"-").replace(/\s/g,"").replace(",",".");const match=clean.match(/[+-]?\d+(?:\.\d+)?(?=%)/);return match?r4Number(match[0]):null;}
  function r4ReadBtcDom(){
    const item=document.querySelector('.top5-item[data-top5-id="bitcoin"]')||document.querySelector('[data-top5-id="bitcoin"]');
    const price=String(item?.querySelector?.(".top5-price")?.textContent||"").trim(),pctText=String(item?.querySelector?.(".top5-change")?.textContent||"").trim();
    return {price:price||"—",pctText:pctText||"—",pct:r4ParsePct(pctText)};
  }
  function r4RenderSystemRibbon(){
    r4InstallStyles();const root=r4EnsureSystemRibbon();if(!root)return false;
    const telemetry=r4TelemetryText();
    r4SetItem(root,"cpu",telemetry.cpu,{title:r4OperatorState.telemetry?"Télémétrie réelle reçue du Bridge local":"Bridge local : aucune télémétrie CPU publiée — aucune valeur inventée"});
    r4SetItem(root,"gpu",telemetry.gpu,{title:r4OperatorState.telemetry?"Télémétrie réelle reçue du Bridge local":"Bridge local : aucune télémétrie GPU publiée — aucune valeur inventée"});
    r4SetItem(root,"ram",telemetry.ram,{title:r4OperatorState.telemetry?"Télémétrie réelle reçue du Bridge local":"Bridge local : aucune télémétrie RAM publiée — aucune valeur inventée"});
    const weather=r4OperatorState.weather;
    r4SetItem(root,"weather",weather?`${r4Round(weather.temperature,1)}°C`:(r4OperatorState.weatherInFlight?"météo…":"indisponible"),{icon:weather?r4WeatherIcon(weather.code):"☁",title:`${R4_WEATHER.source} · ${R4_WEATHER.label} · coordonnées fixes · aucune géolocalisation navigateur`});
    const btc=r4ReadBtcDom(),tone=btc.pct===null?"flat":btc.pct>0?"positive":btc.pct<0?"negative":"flat";
    r4SetItem(root,"btc",`${btc.price} · ${btc.pctText}`,{tone,title:"Prix BTC affiché dans Agent-Crypto + variation 24 h"});
    return true;
  }

  function r4InstallRuntimeHooks(){
    installMarketPulseWakeupR4();
    r4WrapRuntimeOwner("atlasAfterLivecheck",()=>{r4ResidentAtlasWake("market-refresh");r4RenderSystemRibbon();void r4EnsureWeather(false);});
    r4WrapRuntimeOwner("atlasLocalBridgeProbe",payload=>{r4CaptureBridgeTelemetry(payload);r4RenderSystemRibbon();r4ResidentAtlasWake("bridge-health");});
    r4WrapRuntimeOwner("atlasRenderTopFiveRibbon",()=>r4RenderSystemRibbon());
    r4WrapRuntimeOwner("atlasPatchTickerSpot",()=>r4RenderSystemRibbon());
    r4InstallStyles();r4RenderSystemRibbon();void r4EnsureWeather(false);r4ResidentAtlasWake("load");
    document.addEventListener("visibilitychange",()=>{if(document.hidden)return;r4RenderSystemRibbon();void r4EnsureWeather(false);r4ResidentAtlasWake("visibility-return");},{passive:true});
    if(document?.documentElement){document.documentElement.dataset.atlasResidentWake40499R4="installed";document.documentElement.dataset.operatorSystemRibbon40499R4="aether-shared-row";}
    return true;
  }
  let r4RuntimeInstalled=false;
  function installR4AfterApp(){
    if(r4RuntimeInstalled)return true;
    if(typeof globalThis.atlasAfterLivecheck!=="function"||typeof globalThis.atlasLocalReportsScheduleAutomatic!=="function")return false;
    r4RuntimeInstalled=r4InstallRuntimeHooks();return r4RuntimeInstalled;
  }
  installMarketPulseWakeupR4();
  if(document.readyState==="complete")queueMicrotask(installR4AfterApp);else window.addEventListener("load",installR4AfterApp,{once:true});

  const DEFINITIONS=Object.freeze([
    Object.freeze({id:"projects",label:"Projet @erith.IA · Missions de vie",source:"./views/projects.html",roots:Object.freeze(["#missions-vie",'[data-collapse-key="fonds-erith"]','[data-collapse-key="association-erith"]','[data-collapse-key="aerith-enfance"]','[data-collapse-key="aerith-animaux"]','[data-collapse-key="aerith-terre-vivante"]']),risk:"low"}),
    Object.freeze({id:"operations",label:"03 · Préparation & opérations",source:"./views/operations.html",roots:Object.freeze([".atlas-layout-family-operations",'[data-collapse-key="situation"]','[data-collapse-key="questionnaire"]','[data-collapse-key="briefing"]','[data-collapse-key="planning"]']),risk:"low"}),
    Object.freeze({id:"system",label:"04 · Expérimentation & système",source:"./views/system.html",roots:Object.freeze([".atlas-layout-family-system","#atlasStorageHealth40198","#atlasGreyPlateForensic40393",'[data-collapse-key="simulation"]','[data-collapse-key="commandes"]','[data-collapse-key="backend"]','[data-collapse-key="safety"]','[data-collapse-key="physical-security"]']),risk:"medium"}),
    Object.freeze({id:"atlas",label:"02 · Intelligence, mémoire & création",source:"./views/atlas.html",roots:Object.freeze(["#atlas-local-ai-collapse",'[data-collapse-key="auto-reader"]','[data-collapse-key="shared-memory"]','[data-collapse-key="github-memory"]']),risk:"high"}),
    Object.freeze({id:"oracle",label:"Oracle · Analyse prospective & preuves",source:"./views/oracle.html",roots:Object.freeze(["#oracle-models-calibration",'[data-collapse-key="oracle-sources-runtime"]',"#oracle-evidence-explorer"]),risk:"high"})
  ]);
  const registrations=[];
  const PROTECTED_COCKPIT_SELECTORS=Object.freeze(["#analyste","#detailPanel"]);
  const protectedCockpitNode=node=>Boolean(node?.closest?.(PROTECTED_COCKPIT_SELECTORS.join(",")));
  let bridgesBound=false,loadSweepBound=false;
  const uniq=items=>[...new Set(items.filter(Boolean))];
  const nodesFor=def=>uniq(def.roots.flatMap(selector=>[...document.querySelectorAll(selector)]));
  const subtreeCount=node=>{try{return 1+node.querySelectorAll("*").length;}catch{return 1;}};
  const measurementSnapshot=()=>Object.freeze(DEFINITIONS.map(def=>{const roots=nodesFor(def);return Object.freeze({id:def.id,label:def.label,source:def.source,risk:def.risk,roots:roots.length,subtree_nodes:roots.reduce((sum,node)=>sum+subtreeCount(node),0),connected:roots.filter(node=>node.isConnected).length});}));
  const bodyNodes=detail=>{const summary=detail.querySelector(":scope > summary");return [...detail.childNodes].filter(node=>node!==summary);};
  function ensureRecord(reg,detail){let record=reg.records.find(item=>item.detail===detail);if(record)return record;record={detail,nodes:[],fragment:null,detached:false,detach_count:0,restore_count:0,last_detached_at:null,last_restored_at:null};reg.records.push(record);return record;}
  function detachRecord(record){const detail=record.detail;if(!(detail instanceof HTMLDetailsElement)||detail.open||record.detached)return false;record.nodes=bodyNodes(detail);if(!record.nodes.length)return false;const fragment=document.createDocumentFragment();record.nodes.forEach(node=>fragment.appendChild(node));record.fragment=fragment;record.detached=true;record.detach_count+=1;record.last_detached_at=new Date().toISOString();detail.dataset.presentationResidency="detached";return true;}
  function restoreRecord(record){if(!record?.detached)return false;const detail=record.detail;if(record.fragment?.childNodes?.length)detail.appendChild(record.fragment);else record.nodes.forEach(node=>detail.appendChild(node));record.detached=false;record.restore_count+=1;record.last_restored_at=new Date().toISOString();detail.dataset.presentationResidency="resident";try{detail.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:false,detail:{registration:record.registration_id||""}}));}catch(_){}return true;}
  function cachedContainsId(record,id){if(!record?.detached||!id)return false;return record.nodes.some(node=>{if(node.nodeType!==1)return false;if(node.id===id)return true;try{return [...node.querySelectorAll("[id]")].some(child=>child.id===id);}catch{return false;}});}
  function restoreForHash(hash){const id=decodeURIComponent(String(hash||"").replace(/^#/,""));if(!id)return false;const record=registrations.flatMap(reg=>reg.records).find(item=>cachedContainsId(item,id));if(!record)return false;restoreRecord(record);record.detail.open=true;return true;}
  function bindBridges(){if(bridgesBound)return;bridgesBound=true;document.addEventListener("click",event=>{const anchor=event.target?.closest?.('a[href^="#"]');if(anchor)restoreForHash(anchor.getAttribute("href"));},true);window.addEventListener("hashchange",()=>restoreForHash(location.hash));}
  function initialSweep(){registrations.forEach(reg=>reg.records.forEach(record=>{if(!record.detail.open)detachRecord(record);}));restoreForHash(location.hash);}
  function scheduleInitialSweep(){if(document.readyState==="complete"){initialSweep();return;}if(loadSweepBound)return;loadSweepBound=true;window.addEventListener("load",initialSweep,{once:true});}
  function registerClosedBodyFamily(config={}){
    const id=String(config.id||"").trim();if(!id||registrations.some(reg=>reg.id===id))return registrations.find(reg=>reg.id===id)||null;
    const selectors=Object.freeze([...(config.selectors||[])].map(String));
    const details=uniq(selectors.flatMap(selector=>[...document.querySelectorAll(selector)])).filter(node=>node instanceof HTMLDetailsElement).filter(node=>!protectedCockpitNode(node));
    const reg={id,label:String(config.label||id),selectors,details,records:[],registered_at:new Date().toISOString()};
    details.forEach(detail=>{const record=ensureRecord(reg,detail);record.registration_id=id;detail.querySelector(":scope > summary")?.addEventListener("click",()=>{if(!detail.open)restoreRecord(record);},true);detail.addEventListener("toggle",()=>{if(detail.open)restoreRecord(record);else detachRecord(record);});});
    registrations.push(reg);bindBridges();scheduleInitialSweep();restoreForHash(location.hash);return reg;
  }
  function residencySnapshot(){
    return Object.freeze(registrations.map(reg=>Object.freeze({id:reg.id,label:reg.label,selectors:reg.selectors,details:reg.details.length,records:Object.freeze(reg.records.map(record=>Object.freeze({key:String(record.detail?.dataset?.collapseKey||record.detail?.id||""),open:record.detail?.open===true,connected:record.detail?.isConnected===true,detached:record.detached===true,cached_nodes:record.nodes.reduce((sum,node)=>sum+subtreeCount(node),0),detach_count:record.detach_count,restore_count:record.restore_count,last_detached_at:record.last_detached_at,last_restored_at:record.last_restored_at})))})));
  }

  const api=Object.freeze({
    build:BUILD,machine_build:MACHINE_BUILD,mode:"resident-atlas-wake-plus-aether-shared-operator-page",definitions:DEFINITIONS,
    measurementSnapshot,residencySnapshot,registerClosedBodyFamily,restoreForHash,activeRegistrations:()=>registrations.length,
    clone_used:false,fetch_added:true,timer_added:false,observer_added:false,storage_write_added:false,engine_state_changed:false,
    technical_reading_protected:true,protected_cockpit_selectors:PROTECTED_COCKPIT_SELECTORS,market_pulse_wakeup:MARKET_PULSE_WAKEUP_R4,
    get market_pulse_wakeup_installed(){return globalThis.atlasPulseVisible?.__erithMarketPulseWakeup40499R4===true;},
    get runtime_hooks_installed(){return r4RuntimeInstalled===true;},runtime_hooks_deferred_after_app:true,resident_atlas_wake:true,atlas_panel_required:false,
    weather:Object.freeze({location:R4_WEATHER.label,source:R4_WEATHER.source,ttl_ms:R4_WEATHER.ttl_ms,browser_geolocation:false}),
    telemetry_truth:"Bridge telemetry only; absent values remain N/D",operator_row:"existing Aether row only; zero extra header line",
    new_recurring_timer:false,new_observer:false,new_storage_write:false,weather_fetch_added:true,second_current_controller:false
  });
  globalThis.ErithPresentationLifecycle=api;
  globalThis.ErithPresentationLifecycle40411=api;
  globalThis.ErithResidentAtlasWake40499R4=Object.freeze({build:BUILD,run:r4ResidentAtlasWake,pending:r4PendingCanonicalMarket});
  globalThis.ErithOperatorSystemRibbon40499R4=Object.freeze({build:BUILD,render:r4RenderSystemRibbon,refreshWeather:()=>r4EnsureWeather(true),telemetry:()=>r4OperatorState.telemetry,weather:()=>r4OperatorState.weather});
})();