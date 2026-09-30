/* Agent-Crypto @erith.IA — 40.6.483 ORACLE EVIDENCE SAFE BRIDGE INGEST + COLD VERIFY
   40.6.482 remains the proven HOT/COLD foundation owner.
   This module adds only operator-triggered transport through a loopback local Bridge.
   No GitHub credential is exposed to the browser. No local Evidence is deleted. */
(()=>{
  "use strict";

  const BUILD="40.6.483";
  const BRIDGE_BASE="http://127.0.0.1:8791";
  const HEALTH_PATH="/api/oracle-evidence/health";
  const INGEST_PATH="/api/oracle-evidence/cold-ingest";
  const CHUNK_ROWS=500;
  const state={
    mounted:false,
    last_action:"IDLE",
    last_error:null,
    bridge:null,
    last_ingest:null,
    last_published_verify:null
  };

  function foundation(){
    const api=globalThis.AtlasOracleEvidenceTieredStorageFoundation406482;
    if(!api?.prepare_next_chunk||!api?.count_local_rows||!api?.verify_cold_chunk){
      throw new Error("Fondation Oracle Evidence 40.6.482 indisponible");
    }
    return api;
  }

  function setState(action,error=null){
    state.last_action=String(action||"IDLE");
    state.last_error=error?String(error?.message||error):null;
    render();
  }

  async function bridgeJson(path,options={}){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),Number(options.timeout_ms)||15000);
    try{
      const response=await fetch(BRIDGE_BASE+path,{
        method:options.method||"GET",
        mode:"cors",
        cache:"no-store",
        credentials:"omit",
        referrerPolicy:"no-referrer",
        signal:controller.signal,
        headers:{
          Accept:"application/json",
          ...(options.body?{"Content-Type":"application/json","X-Erith-Bridge-Intent":"oracle-evidence-cold-ingest"}:{})
        },
        body:options.body?JSON.stringify(options.body):undefined
      });
      let payload=null;
      try{payload=await response.json();}catch(_){payload=null;}
      if(!response.ok){
        const detail=String(payload?.error||payload?.message||("HTTP "+response.status));
        throw new Error(detail);
      }
      return payload||{};
    }finally{
      clearTimeout(timeout);
    }
  }

  async function testBridge(){
    setState("BRIDGE_HEALTH");
    try{
      const payload=await bridgeJson(HEALTH_PATH,{timeout_ms:5000});
      state.bridge=Object.freeze({
        status:String(payload.status||"unknown"),
        auth_configured:payload.github_auth_configured===true,
        auth_source:String(payload.auth_source||"none"),
        repository:String(payload.repository||""),
        branch:String(payload.branch||""),
        owner:String(payload.owner||"oracle_evidence_cold_bridge.py")
      });
      const ready=state.bridge.status==="ready"&&state.bridge.auth_configured===true;
      setState(ready?"BRIDGE_READY":"BRIDGE_NEEDS_AUTH");
      return state.bridge;
    }catch(error){
      state.bridge=null;
      setState("BRIDGE_OFFLINE",error);
      throw error;
    }
  }

  function verifiedEntryFromManifest(manifest,relativePath=null){
    const chunks=Array.isArray(manifest?.chunks)?manifest.chunks:[];
    const filtered=chunks.filter(item=>String(item?.status||"").toUpperCase()==="VERIFIED");
    if(relativePath){
      return filtered.find(item=>String(item.relative_path||"")===String(relativePath))||null;
    }
    return filtered.length?filtered[filtered.length-1]:null;
  }

  async function ingestNext500(){
    const base=foundation();
    setState("PREPARE_FOR_BRIDGE");
    try{
      const before=await base.count_local_rows();
      const bundle=await base.prepare_next_chunk({limit:CHUNK_ROWS});
      if(!bundle?.chunk||!bundle?.jsonl) throw new Error("Aucun lot Oracle Evidence à ingérer");
      setState("BRIDGE_INGESTING");
      const result=await bridgeJson(INGEST_PATH,{method:"POST",body:bundle,timeout_ms:120000});
      if(String(result?.status||"").toUpperCase()!=="VERIFIED"){
        throw new Error("Le Bridge n'a pas retourné VERIFIED");
      }
      if(String(result.relative_path||"")!==String(bundle.chunk.relative_path||"")){
        throw new Error("Le chemin vérifié ne correspond pas au lot préparé");
      }
      if(String(result.sha256||"")!==String(bundle.chunk.sha256||"")){
        throw new Error("Le SHA-256 vérifié ne correspond pas au lot préparé");
      }
      if(Number(result.row_count)!==Number(bundle.chunk.row_count)){
        throw new Error("Le row_count vérifié ne correspond pas au lot préparé");
      }
      const after=await base.count_local_rows();
      if(Number(after)<Number(before)){
        throw new Error("Invariant violé : le compteur local a diminué");
      }
      state.last_ingest=Object.freeze({
        status:"VERIFIED",
        relative_path:String(result.relative_path),
        sha256:String(result.sha256),
        row_count:Number(result.row_count),
        write_commit:String(result.write_commit||""),
        verify_commit:String(result.verify_commit||""),
        idempotent:result.idempotent===true,
        local_before:Number(before),
        local_after:Number(after)
      });
      setState("BRIDGE_INGEST_VERIFIED");
      return state.last_ingest;
    }catch(error){
      setState("BRIDGE_INGEST_ERROR",error);
      throw error;
    }
  }

  async function verifyPublishedLatest(){
    const base=foundation();
    setState("PUBLISHED_VERIFY_LOADING");
    try{
      const manifest=await base.load_manifest();
      const entry=verifiedEntryFromManifest(manifest);
      if(!entry) throw new Error("Aucun chunk VERIFIED publié dans le manifest");
      const result=await base.verify_cold_chunk(entry.relative_path,{
        sha256:entry.sha256,
        row_count:entry.row_count
      });
      if(result?.verified!==true) throw new Error("Vérification publiée échouée");
      state.last_published_verify=Object.freeze({
        relative_path:String(entry.relative_path||""),
        sha256:String(result.sha256||""),
        row_count:Number(result.row_count||0),
        verified:true
      });
      setState("PUBLISHED_VERIFY_PASS");
      return state.last_published_verify;
    }catch(error){
      state.last_published_verify=null;
      setState("PUBLISHED_VERIFY_ERROR",error);
      throw error;
    }
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      bridge_base:BRIDGE_BASE,
      last_action:state.last_action,
      last_error:state.last_error,
      bridge:state.bridge,
      last_ingest:state.last_ingest,
      last_published_verify:state.last_published_verify,
      local_retention_allowed:false,
      local_delete_api_exposed:false,
      browser_github_write:false,
      github_token_in_browser:false,
      automatic_upload:false,
      operator_triggered:true,
      storage_schema_changed:false,
      oracle_math_changed:false,
      strategy_a_changed:false,
      market_core_changed:false,
      real_order:false,
      recurring_timer:false,
      observer:false
    });
  }

  function ensurePanel(){
    if(document.getElementById("oracleEvidenceSafeBridge406483")) return true;
    const cold=document.getElementById("oracleEvidenceColdArchive406482");
    const root=document.getElementById("oracle-evidence-explorer");
    if(!cold&&!root) return false;
    const panel=document.createElement("section");
    panel.id="oracleEvidenceSafeBridge406483";
    panel.setAttribute("aria-label","Bridge sûr Oracle Evidence GitHub 40.6.483");
    panel.style.cssText="margin:8px 0 12px;padding:10px 12px;border:1px solid rgba(103,255,190,.24);border-radius:10px;background:rgba(6,24,25,.72);display:grid;gap:8px";
    panel.innerHTML=
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'+
        '<div><strong style="color:#8fffd0">BRIDGE SÛR · GITHUB COLD VERIFY · 40.6.483</strong><br>'+
        '<small>Transport local 127.0.0.1:8791 · opérateur uniquement · zéro purge locale</small></div>'+
        '<span id="oracleBridgeState406483" style="font-weight:800">IDLE</span>'+
      '</div>'+
      '<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px">'+
        '<span>Bridge <b id="oracleBridgeHealth406483">NON TESTÉ</b></span>'+
        '<span>Auth GitHub <b id="oracleBridgeAuth406483">—</b></span>'+
        '<span>Dernier ingest <b id="oracleBridgeIngest406483">—</b></span>'+
        '<span>Publication <b id="oracleBridgePublished406483">—</b></span>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<button type="button" id="btnOracleBridgeHealth406483">Tester Bridge</button>'+
        '<button type="button" id="btnOracleBridgeIngest406483">Envoyer 500 au Bridge</button>'+
        '<button type="button" id="btnOracleBridgeVerify406483">Vérifier dernier chunk publié</button>'+
      '</div>'+
      '<small id="oracleBridgeNote406483">Le token GitHub reste exclusivement dans le Bridge local. Aucune Evidence locale ne peut être supprimée par 40.6.483.</small>';
    if(cold?.parentNode) cold.parentNode.insertBefore(panel,cold.nextSibling);
    else root.prepend(panel);
    document.getElementById("btnOracleBridgeHealth406483")?.addEventListener("click",()=>void testBridge().catch(()=>{}));
    document.getElementById("btnOracleBridgeIngest406483")?.addEventListener("click",()=>void ingestNext500().catch(()=>{}));
    document.getElementById("btnOracleBridgeVerify406483")?.addEventListener("click",()=>void verifyPublishedLatest().catch(()=>{}));
    state.mounted=true;
    render();
    return true;
  }

  function render(){
    const snap=snapshot();
    const set=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=String(value);};
    set("oracleBridgeState406483",snap.last_error?"ERREUR":snap.last_action);
    set("oracleBridgeHealth406483",snap.bridge?.status?String(snap.bridge.status).toUpperCase():(snap.last_action==="BRIDGE_OFFLINE"?"OFFLINE":"NON TESTÉ"));
    set("oracleBridgeAuth406483",snap.bridge?snap.bridge.auth_configured?"PRÊTE":"ABSENTE":"—");
    set("oracleBridgeIngest406483",snap.last_ingest?(String(snap.last_ingest.row_count)+" · VERIFIED"):"—");
    set("oracleBridgePublished406483",snap.last_published_verify?.verified?"VERIFIED":"—");
    const note=document.getElementById("oracleBridgeNote406483");
    if(note){
      note.textContent=snap.last_error
        ? ("Erreur · "+snap.last_error)
        : snap.last_ingest
          ? (String(snap.last_ingest.row_count)+" Evidence · SHA-256 "+snap.last_ingest.sha256.slice(0,16)+"… · local "+String(snap.last_ingest.local_before)+" → "+String(snap.last_ingest.local_after)+" · aucune purge")
          : "Le token GitHub reste exclusivement dans le Bridge local. Aucune Evidence locale ne peut être supprimée par 40.6.483.";
    }
  }

  function mount(){return ensurePanel();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
  window.addEventListener("agent-crypto:postboot-runtime-ready",mount,{once:true});

  globalThis.AtlasOracleEvidenceSafeBridge406483=Object.freeze({
    build:BUILD,
    role:"SAFE_LOCAL_BRIDGE_INGEST_AND_COLD_VERIFY",
    bridge_base:BRIDGE_BASE,
    test_bridge:testBridge,
    ingest_next_500:ingestNext500,
    verify_published_latest:verifyPublishedLatest,
    mount,
    state:snapshot,
    local_retention_allowed:false,
    local_delete_api_exposed:false,
    browser_github_write:false,
    github_token_in_browser:false,
    automatic_upload:false,
    operator_triggered:true,
    storage_schema_changed:false,
    oracle_math_changed:false,
    strategy_a_changed:false,
    market_core_changed:false,
    real_order:false,
    recurring_timer:false,
    observer:false
  });
})();