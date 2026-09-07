/* Agent-Crypto @erith.IA — Version Truth Single Owner
   Build 40.6.1 · CHRONOS ORIGINAL LINE · VEILLE NATIVE RETURN LOCK */
(() => {
  "use strict";
  const OWNER = "version-truth-40601";
  const MANIFEST = "./build.json";
  const meta = name => String(document.querySelector(`meta[name="${name}"]`)?.content || "").trim();
  const loaded = meta("administrator-build") || meta("atlas-build") || "UNKNOWN";
  const engine = meta("atlas-engine-build") || "UNKNOWN";
  const release = meta("administrator-release") || "UNKNOWN";
  const control = document.getElementById("atlasVersionTruthControl");
  const text = document.getElementById("atlasVersionTruthText");
  const legacyControl = document.getElementById("atlasVersionControl");
  const legacyText = document.getElementById("atlasVersionControlText");

  const parts = value => String(value || "").split(".").map(v => Number.parseInt(v,10)).map(v => Number.isFinite(v)?v:0);
  function compare(a,b){
    const aa=parts(a),bb=parts(b),n=Math.max(aa.length,bb.length);
    for(let i=0;i<n;i+=1){const d=(aa[i]||0)-(bb[i]||0);if(d)return d;}
    return 0;
  }
  function validManifest(remote){
    return !!remote && typeof remote === "object" && String(remote.build||"").trim() && String(remote.engine||"").trim()===engine;
  }
  function derive(remote,error=null){
    const ok=validManifest(remote);
    const published=ok?String(remote.build).trim():loaded;
    const newer=ok && compare(published,loaded)>0;
    return Object.freeze({
      owner:OWNER, loaded, published, engine, release,
      manifest_ok:!!ok,
      manifest_error:error?String(error?.message||error):null,
      state:newer?"update-available":"current",
      false_propagation:false,
      label:newer?`Build ${loaded} · ${published} disponible`:`Build ${loaded} · Administrator`
    });
  }
  function render(remote,error=null){
    const state=derive(remote,error);
    if(text) text.textContent=state.label;
    if(control){
      control.dataset.versionTruthOwner=OWNER;
      control.dataset.loadedBuild=state.loaded;
      control.dataset.publishedBuild=state.published;
      control.dataset.versionTruthState=state.state;
      control.dataset.falsePropagation="false";
      control.setAttribute("aria-label",state.state==="update-available"
        ?`Version Agent-Crypto chargée : Build ${state.loaded}. Build ${state.published} disponible sur GitHub.`
        :`Version Agent-Crypto chargée : Build ${state.loaded}, mode Administrator.`);
      control.classList.add("ok");
      control.classList.remove("warn","bad","syncing");
    }
    document.documentElement.dataset.administratorBuild=loaded;
    document.documentElement.dataset.agentCryptoBuild=loaded;
    if(document.body) document.body.dataset.administratorRelease=release;
    document.title=`Agent-Crypto @erith.IA — Build ${loaded} · Administrator`;
    if(legacyControl){
      legacyControl.dataset.versionTruthLegacySink="true";
      legacyControl.dataset.canonicalVisibleOwner=OWNER;
    }
    if(legacyText) legacyText.dataset.versionTruthLegacySink="true";
    return state;
  }

  let lastState=render(null);
  async function refresh(reason="manual"){
    try{
      const url=`${MANIFEST}?v=${encodeURIComponent(loaded)}&truth=${encodeURIComponent(OWNER)}`;
      const response=await fetch(url,{cache:"no-store",credentials:"same-origin"});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      lastState=render(await response.json());
    }catch(error){
      lastState=render(null,error);
    }
    return Object.freeze({...lastState,reason});
  }
  if(control) control.addEventListener("click",()=>{void refresh("manual-click");});
  void refresh("startup");
  globalThis.ErithVersionTruth=Object.freeze({
    owner:OWNER,build:loaded,engine,manifest:MANIFEST,
    snapshot:()=>Object.freeze({...lastState}),refresh,
    visible_control_id:"atlasVersionTruthControl",visible_text_id:"atlasVersionTruthText",
    legacy_sink_control_id:"atlasVersionControl",legacy_sink_text_id:"atlasVersionControlText",
    single_visible_owner:true,false_propagation_lock:true,distinguishes_loaded_from_published:true,
    recurring_timer:false,observer:false,startup_network_calls:1
  });
})();
