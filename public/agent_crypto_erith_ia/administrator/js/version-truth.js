/* Agent-Crypto @erith.IA — 40.6.86
   VERSION AUTHORITY CONSOLIDATION · IMMUTABLE ENTRY LOCK
   Explicit operator check only. No recurring timer, no observer. */
(() => {
  "use strict";
  const OWNER="version-truth-406086";
  const MANIFEST="./build.json";
  const REFRESH_PARAM="ac-refresh";
  const meta=n=>String(document.querySelector(`meta[name="${n}"]`)?.content||"").trim();
  const loaded=meta("administrator-build")||meta("atlas-build")||"UNKNOWN";
  const engine=meta("atlas-engine-build")||"UNKNOWN";
  const control=document.getElementById("atlasVersionTruthControl");
  const text=document.getElementById("atlasVersionTruthText");
  const legacyControl=document.getElementById("atlasVersionControl");
  const legacyText=document.getElementById("atlasVersionControlText");
  const parts=v=>String(v||"").split(".").map(x=>Number.parseInt(x,10)||0);
  function compare(a,b){const A=parts(a),B=parts(b),n=Math.max(A.length,B.length);for(let i=0;i<n;i+=1){const d=(A[i]||0)-(B[i]||0);if(d)return d;}return 0;}
  function valid(remote){return !!remote&&typeof remote==="object"&&String(remote.build||"").trim()&&String(remote.engine||"").trim()===engine;}
  let remote=null,state="current",busy=false;
  function render(next=remote,error=null,mode=null){
    remote=valid(next)?next:null;
    const published=remote?String(remote.build).trim():loaded;
    const newer=!!remote&&compare(published,loaded)>0;
    state=mode||((error&&!newer)?"failed":newer?"update-available":"current");
    const label=state==="checking"?`Build ${loaded} · vérification…`
      :state==="applying"?`Build ${published} · chargement…`
      :state==="propagating"?`Build ${loaded} · ${published} en propagation`
      :state==="update-available"?`Build ${loaded} · ${published} disponible`
      :state==="failed"?`Build ${loaded} · vérification indisponible`
      :`Build ${loaded} · Administrator`;
    if(text)text.textContent=label;
    if(control){
      control.dataset.versionTruthOwner=OWNER;
      control.dataset.loadedBuild=loaded;
      control.dataset.publishedBuild=published;
      control.dataset.versionTruthState=state;
      control.dataset.falsePropagation="false";
      const blocked=state==="checking"||state==="applying";
      control.disabled=blocked;
      control.toggleAttribute("aria-busy",blocked);
      control.classList.toggle("warn",state==="update-available"||state==="propagating");
      control.classList.toggle("ok",state!=="update-available"&&state!=="propagating");
      control.setAttribute("aria-label",state==="update-available"
        ?`Version chargée ${loaded}. Version ${published} disponible. Cliquer pour charger.`
        :state==="propagating"
          ?`Version ${published} publiée mais entrée HTML pas encore propagée. Cliquer pour revérifier.`
          :state==="failed"
            ?`Build ${loaded} chargé. Vérification indisponible. Cliquer pour réessayer.`
            :`Version Agent-Crypto chargée : Build ${loaded}, mode Administrator. Cliquer pour vérifier GitHub.`);
      control.title=state==="update-available"
        ?`Build ${published} disponible · cliquer pour mettre à jour`
        :state==="propagating"
          ?`Build ${published} en propagation GitHub Pages · cliquer pour revérifier`
          :`Build ${loaded} chargé · aucune mise à jour détectée`;
    }
    if(legacyControl){legacyControl.dataset.versionTruthLegacySink="true";legacyControl.dataset.canonicalVisibleOwner=OWNER;}
    if(legacyText)legacyText.dataset.versionTruthLegacySink="true";
    document.documentElement.dataset.versionTruthBuild=loaded;
    document.documentElement.dataset.versionTruthPublished=published;
    document.documentElement.dataset.versionTruthState=state;
    return Object.freeze({loaded,published,state,update_available:newer});
  }
  async function fetchManifest(){
    const response=await fetch(`${MANIFEST}?v=${encodeURIComponent(loaded)}&t=${Date.now()}`,{cache:"no-store",credentials:"same-origin"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const result=await response.json();
    if(!valid(result))throw new Error("manifest-invalide");
    return result;
  }
  async function check(show=false){
    if(busy)return false;
    busy=true;
    if(show)render(remote,null,"checking");
    try{const result=await fetchManifest();const snapshot=render(result);return snapshot.update_available;}
    catch(error){render(null,error);return false;}
    finally{busy=false;}
  }
  function entryUrl(build,immutable=true){return new URL(immutable?`./index-${build}.html`:`./index.html`,location.href);}
  async function probeEntry(url,build){
    try{
      const probe=new URL(url);
      probe.searchParams.set("ac-probe",`${build}-${Date.now()}`);
      const response=await fetch(probe.toString(),{cache:"no-store",credentials:"same-origin"});
      if(!response.ok)return false;
      const html=await response.text();
      const match=html.match(/<meta\s+name="administrator-build"\s+content="([^"]+)"/i)||html.match(/<meta\s+name="atlas-build"\s+content="([^"]+)"/i);
      return String(match?.[1]||"").trim()===build;
    }catch(_){return false;}
  }
  async function applyAvailableUpdate(){
    if(busy||state!=="update-available")return false;
    busy=true;
    render(remote,null,"applying");
    try{
      const result=await fetchManifest();
      const published=String(result.build||"").trim();
      if(compare(published,loaded)<=0){render(result);return false;}
      const immutable=entryUrl(published,true);
      if(await probeEntry(immutable,published)){
        immutable.searchParams.set(REFRESH_PARAM,`${published}-${Date.now()}`);
        location.replace(immutable.toString());
        return true;
      }
      const canonical=entryUrl(published,false);
      if(await probeEntry(canonical,published)){
        canonical.searchParams.set(REFRESH_PARAM,`${published}-${Date.now()}`);
        location.replace(canonical.toString());
        return true;
      }
      render(result,null,"propagating");
      return false;
    }catch(error){render(remote,error);return false;}
    finally{busy=false;}
  }
  async function onControlClick(event){
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if(busy)return false;
    if(state==="update-available")return applyAvailableUpdate();
    return check(true);
  }
  render();
  if(control)control.addEventListener("click",onControlClick,{capture:true});
  void check(false);
  globalThis.ErithVersionTruth=Object.freeze({
    owner:OWNER,build:loaded,engine,manifest:MANIFEST,
    snapshot:()=>Object.freeze({loaded,published:String(remote?.build||loaded),state}),
    refresh:check,applyAvailableUpdate,
    single_visible_owner:true,false_propagation_lock:true,
    historical_click_contract_restored:true,
    current_click_reloads:false,update_available_click_reloads:true,
    immutable_entry_first:true,canonical_entry_requires_probe:true,
    propagation_loop_forbidden:true,
    recurring_timer:false,observer:false
  });
})();
