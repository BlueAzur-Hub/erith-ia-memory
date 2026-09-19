/* Agent-Crypto @erith.IA — Strategy A Durable Evidence Continuity
   Build 40.6.268.
   Purpose: preserve factual PAPER evidence across reloads without changing Strategy A decisions.
   IndexedDB only; no network, no recurring timer, no order, no threshold change.
   Existing runtime owners remain authoritative for business decisions. */
(() => {
  "use strict";

  const BUILD="40.6.268";
  const DB_NAME="agent_crypto_strategy_a_durable_evidence_v1";
  const DB_VERSION=1;
  const STORE_CYCLES="cycles";
  const STORE_AFTER="after_cost";
  const STORE_PAPER="paper_states";
  const STORE_GAPS="runtime_gaps";
  const STORE_META="meta";
  const LEGACY_G3_KEY="agent_crypto_erith_ia_strategy_a_g3_prospective_t0_40_6_205";
  const PANEL_ID="strategyADurableEvidence406268";
  const STYLE_ID=PANEL_ID+"Style";

  const cache={
    cycles:new Map(),
    after_cost:new Map(),
    paper_states:new Map(),
    runtime_gaps:new Map()
  };

  let dbPromise=null;
  let hydrated=false;
  let dbReady=false;
  let lastError=null;
  let lastCaptureAt=null;
  let writeChain=Promise.resolve();
  let ledgerBase=null;
  let ledgerFacade=null;
  let afterBase=null;
  let afterFacade=null;
  let activeVisibilityGapId=null;

  const clone=value=>{try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}};
  const nowIso=()=>new Date().toISOString();
  const text=value=>String(value??"").trim();
  const hash=value=>{
    let h=2166136261;
    for(const c of String(value??"")){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
    return (h>>>0).toString(16).padStart(8,"0");
  };
  const safeCall=(fn,fallback,...args)=>{
    try{return typeof fn==="function"?fn(...args):fallback;}
    catch(_){return fallback;}
  };

  function cycleId(row){
    const direct=text(row?.cycle_id||row?.decision_id||row?.proposal_id||row?.id);
    if(direct)return direct;
    const basis=JSON.stringify({
      at:row?.captured_at||row?.at||row?.timestamp||null,
      phase:row?.phase||null,
      decision:row?.decision||row?.proposal_status||null,
      market:row?.market||null,
      oracle:row?.oracle||null
    });
    return basis&&basis!=="{}"?"cycle-"+hash(basis):null;
  }

  function afterId(row){
    const direct=text(row?.reconciliation_id||row?.execution_id||row?.trade_id||row?.identity);
    if(direct)return direct;
    const basis=JSON.stringify({
      at:row?.at||row?.closed_at||null,
      symbol:row?.symbol||null,
      net:row?.net_pnl_eur??row?.authoritative_net_pnl_eur??null
    });
    return basis&&basis!=="{}"?"after-"+hash(basis):null;
  }

  function paperId(row){
    const direct=text(row?.execution_id||row?.trade_id||row?.reconciliation_id);
    if(direct)return direct;
    const basis=JSON.stringify({opened_at:row?.opened_at||null,status:row?.status||null,envelope:row?.envelope||null});
    return basis&&basis!=="{}"?"paper-"+hash(basis):null;
  }

  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!globalThis.indexedDB){reject(new Error("INDEXEDDB_UNAVAILABLE"));return;}
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        for(const name of [STORE_CYCLES,STORE_AFTER,STORE_PAPER,STORE_GAPS,STORE_META]){
          if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:"id"});
        }
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error("INDEXEDDB_OPEN_FAILED"));
      req.onblocked=()=>{lastError="INDEXEDDB_BLOCKED";};
    }).then(db=>{dbReady=true;return db;}).catch(error=>{
      dbReady=false;
      lastError=String(error?.message||error);
      throw error;
    });
    return dbPromise;
  }

  function txDone(tx){
    return new Promise((resolve,reject)=>{
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>reject(tx.error||new Error("INDEXEDDB_TX_FAILED"));
      tx.onabort=()=>reject(tx.error||new Error("INDEXEDDB_TX_ABORTED"));
    });
  }

  async function readStore(name){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(name,"readonly");
      const req=tx.objectStore(name).getAll();
      req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);
      req.onerror=()=>reject(req.error||new Error("INDEXEDDB_READ_FAILED"));
    });
  }

  async function putEntries(name,entries){
    if(!entries.length)return 0;
    const db=await openDb();
    const tx=db.transaction(name,"readwrite");
    const store=tx.objectStore(name);
    for(const entry of entries)store.put(entry);
    await txDone(tx);
    return entries.length;
  }

  function cacheFor(name){
    if(name===STORE_CYCLES)return cache.cycles;
    if(name===STORE_AFTER)return cache.after_cost;
    if(name===STORE_PAPER)return cache.paper_states;
    if(name===STORE_GAPS)return cache.runtime_gaps;
    return null;
  }

  async function hydrateStore(name){
    const rows=await readStore(name);
    const target=cacheFor(name);
    if(target){
      target.clear();
      for(const row of rows)if(row?.id)target.set(String(row.id),row);
    }
    return rows.length;
  }

  function enqueue(task){
    writeChain=writeChain.then(task,task).catch(error=>{
      lastError=String(error?.message||error);
      render();
      return false;
    });
    return writeChain;
  }

  async function persistRows(name,rows,idFn,source){
    const target=cacheFor(name);
    const entries=[];
    for(const row of Array.isArray(rows)?rows:[]){
      if(!row||typeof row!=="object")continue;
      const id=idFn(row);
      if(!id)continue;
      const entry={
        id:String(id),
        source:String(source||"runtime"),
        captured_at:nowIso(),
        payload:clone(row)
      };
      const existing=target?.get(entry.id);
      if(existing&&JSON.stringify(existing.payload)===JSON.stringify(entry.payload))continue;
      entries.push(entry);
      target?.set(entry.id,entry);
    }
    if(entries.length)await putEntries(name,entries);
    return entries.length;
  }

  function mergedPayloads(name,liveRows=[]){
    const target=cacheFor(name);
    const map=new Map();
    for(const entry of target?.values?.()||[])if(entry?.id&&entry?.payload)map.set(String(entry.id),clone(entry.payload));
    const idFn=name===STORE_CYCLES?cycleId:name===STORE_AFTER?afterId:paperId;
    for(const row of Array.isArray(liveRows)?liveRows:[]){
      const id=idFn(row);
      if(id)map.set(String(id),clone(row));
    }
    return [...map.values()];
  }

  function liveLedgerRows(){
    const owner=ledgerBase||globalThis.AgentCryptoStrategyAExperimentLedger;
    const value=safeCall(owner?.read,[]);
    return Array.isArray(value)?value:[];
  }

  function liveAfterRows(){
    const owner=afterBase||globalThis.AgentCryptoStrategyAAfterCostMetrics;
    const value=safeCall(owner?.read,[]);
    return Array.isArray(value)?value:[];
  }

  function livePaperRows(){
    const owner=globalThis.AgentCryptoStrategyAAutoLifecycleBridge;
    const value=safeCall(owner?.read,[]);
    return Array.isArray(value)?value:[];
  }

  function installLedgerFacade(){
    const current=globalThis.AgentCryptoStrategyAExperimentLedger;
    if(!current||current===ledgerFacade||current?.durable_evidence_facade_406268===true)return !!current;
    ledgerBase=current;
    const readMerged=()=>mergedPayloads(STORE_CYCLES,safeCall(ledgerBase?.read,[])||[]);
    const summaryMerged=()=>{
      const live=safeCall(ledgerBase?.summary,{})||{};
      const rows=readMerged();
      return Object.freeze({
        ...live,
        cycles:rows.length,
        rows:rows.length,
        durable_cycles:cache.cycles.size,
        merged_rows:rows.length,
        durable_store_build:BUILD
      });
    };
    ledgerFacade=Object.freeze({
      ...current,
      read:readMerged,
      summary:summaryMerged,
      durable_read:()=>mergedPayloads(STORE_CYCLES,[]),
      durable_evidence_facade_406268:true,
      durable_store_build:BUILD
    });
    try{globalThis.AgentCryptoStrategyAExperimentLedger=ledgerFacade;}catch(_){}
    return globalThis.AgentCryptoStrategyAExperimentLedger===ledgerFacade;
  }

  function patchAfterPanel(){
    if(typeof document==="undefined")return false;
    const panel=document.getElementById("strategyAAfterCost");
    const owner=globalThis.AgentCryptoStrategyAAfterCostMetrics;
    const s=safeCall(owner?.summary,null);
    if(!panel||!s)return false;
    const set=(k,v)=>{const n=panel.querySelector(`[data-sam="${k}"]`);if(n)n.textContent=String(v);};
    const eur=v=>typeof v==="number"&&Number.isFinite(v)?`${v.toFixed(2)} €`:"UNKNOWN";
    set("trades",s.trades??0);
    set("complete",`${s.complete_cost_trades??0}/${s.trades??0}`);
    set("gross",eur(s.reference_gross_pnl_eur));
    set("costs",eur(s.known_costs_eur));
    set("net",eur(s.net_pnl_eur));
    set("sample",s.sample_state||"INSUFFICIENT_SAMPLE");
    return true;
  }

  function installAfterFacade(){
    const current=globalThis.AgentCryptoStrategyAAfterCostMetrics;
    if(!current||current===afterFacade||current?.durable_evidence_facade_406268===true)return !!current;
    afterBase=current;
    const readMerged=()=>mergedPayloads(STORE_AFTER,safeCall(afterBase?.read,[])||[]);
    const summaryMerged=rows=>{
      const source=Array.isArray(rows)?rows:readMerged();
      const value=safeCall(afterBase?.summary,{},source)||{};
      return Object.freeze({...value,durable_rows:cache.after_cost.size,merged_rows:source.length,durable_store_build:BUILD});
    };
    const persistResult=result=>{
      if(result?.ok&&result?.row)enqueue(async()=>{
        await persistRows(STORE_AFTER,[result.row],afterId,"AFTER_COST_RUNTIME");
        lastCaptureAt=nowIso();
        render();
      });
      return result;
    };
    afterFacade=Object.freeze({
      ...current,
      read:readMerged,
      summary:summaryMerged,
      from_reconciliation:row=>persistResult(afterBase.from_reconciliation(row)),
      record_from_reconciliation:row=>persistResult(afterBase.record_from_reconciliation?afterBase.record_from_reconciliation(row):afterBase.from_reconciliation(row)),
      render:()=>{const value=safeCall(afterBase?.render,false);queueMicrotask(()=>{patchAfterPanel();render();});return value;},
      durable_read:()=>mergedPayloads(STORE_AFTER,[]),
      durable_evidence_facade_406268:true,
      durable_store_build:BUILD
    });
    try{globalThis.AgentCryptoStrategyAAfterCostMetrics=afterFacade;}catch(_){}
    return globalThis.AgentCryptoStrategyAAfterCostMetrics===afterFacade;
  }

  function ensureFacades(){
    installLedgerFacade();
    installAfterFacade();
  }

  async function importLegacyProspective(){
    let rows=[];
    try{
      const raw=JSON.parse(localStorage.getItem(LEGACY_G3_KEY)||"[]");
      if(Array.isArray(raw))rows=raw;
    }catch(_){}
    return persistRows(STORE_CYCLES,rows,cycleId,"LEGACY_G3_PROSPECTIVE");
  }

  function unresolvedDurablePaper(){
    const rows=mergedPayloads(STORE_PAPER,[]);
    return rows.filter(row=>String(row?.status||"").toUpperCase()==="OPEN_SYNCED");
  }

  async function captureRuntime(reason="runtime"){
    ensureFacades();
    const cycles=liveLedgerRows();
    const after=liveAfterRows();
    const paper=livePaperRows();
    const counts=await Promise.all([
      persistRows(STORE_CYCLES,cycles,cycleId,`RUNTIME:${reason}`),
      persistRows(STORE_AFTER,after,afterId,`RUNTIME:${reason}`),
      persistRows(STORE_PAPER,paper,paperId,`RUNTIME:${reason}`)
    ]);
    lastCaptureAt=nowIso();
    try{
      const db=await openDb();
      const tx=db.transaction(STORE_META,"readwrite");
      tx.objectStore(STORE_META).put({
        id:"last_capture",
        at:lastCaptureAt,
        reason:String(reason),
        counts:{
          cycles:cache.cycles.size,
          after_cost:cache.after_cost.size,
          paper_states:cache.paper_states.size
        }
      });
      await txDone(tx);
    }catch(error){lastError=String(error?.message||error);}
    render();
    try{
      document.dispatchEvent(new CustomEvent("agent-crypto:strategy-a-durable-evidence-updated",{
        detail:snapshot()
      }));
    }catch(_){}
    return {cycles:counts[0],after_cost:counts[1],paper_states:counts[2]};
  }

  function gapEntry(id,kind,startedAt,endedAt=null,detail=null){
    return {
      id,
      kind,
      started_at:startedAt,
      ended_at:endedAt,
      duration_ms:endedAt?Math.max(0,Date.parse(endedAt)-Date.parse(startedAt)):null,
      detail:clone(detail),
      source:"BROWSER_RUNTIME",
      build:BUILD
    };
  }

  function persistGap(entry){
    cache.runtime_gaps.set(entry.id,entry);
    return enqueue(async()=>{
      await putEntries(STORE_GAPS,[entry]);
      render();
      return true;
    });
  }

  function openVisibilityGap(kind="TAB_HIDDEN"){
    if(activeVisibilityGapId)return activeVisibilityGapId;
    const started=nowIso();
    const id=`gap-${hash(kind+"|"+started)}`;
    activeVisibilityGapId=id;
    persistGap(gapEntry(id,kind,started,null,{document_hidden:document.hidden===true}));
    return id;
  }

  function closeVisibilityGap(reason="VISIBLE_AGAIN"){
    if(!activeVisibilityGapId)return false;
    const existing=cache.runtime_gaps.get(activeVisibilityGapId);
    const id=activeVisibilityGapId;
    activeVisibilityGapId=null;
    if(!existing)return false;
    const closed={...existing,ended_at:nowIso(),detail:{...(existing.detail||{}),closed_reason:reason}};
    closed.duration_ms=Math.max(0,Date.parse(closed.ended_at)-Date.parse(closed.started_at));
    persistGap(closed);
    return true;
  }

  function snapshot(){
    const openPaper=unresolvedDurablePaper();
    const gaps=[...cache.runtime_gaps.values()];
    return Object.freeze({
      schema:"agent_crypto_strategy_a_durable_evidence_v1",
      build:BUILD,
      hydrated,
      indexeddb_ready:dbReady,
      database:DB_NAME,
      cycles:cache.cycles.size,
      after_cost:cache.after_cost.size,
      paper_states:cache.paper_states.size,
      unresolved_open_paper:openPaper.length,
      review_required:openPaper.length>0,
      runtime_gaps:gaps.length,
      open_runtime_gaps:gaps.filter(g=>!g.ended_at).length,
      last_capture_at:lastCaptureAt,
      last_error:lastError,
      thresholds_changed:false,
      strategy_logic_changed:false,
      recurring_timer:false,
      network:false,
      real_orders:false,
      backfill_fabricated:false
    });
  }

  function ensureStyle(){
    if(typeof document==="undefined"||document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      #${PANEL_ID}{margin-top:9px;padding:9px;border:1px solid rgba(105,220,255,.22);border-radius:10px;background:rgba(4,18,28,.50)}
      #${PANEL_ID} .de-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap}
      #${PANEL_ID} .de-title{font-size:9px;font-weight:950;letter-spacing:.08em;color:#92edff;text-transform:uppercase}
      #${PANEL_ID} .de-state{font-size:8px;font-weight:900}
      #${PANEL_ID} .de-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin-top:7px}
      #${PANEL_ID} .de-k{padding:6px;border:1px solid rgba(255,255,255,.06);border-radius:7px}
      #${PANEL_ID} .de-k span{display:block;font-size:7px;color:#7795a0;text-transform:uppercase}
      #${PANEL_ID} .de-k b{display:block;margin-top:3px;font-size:9px;color:#eafcff}
      #${PANEL_ID} .de-note{margin-top:7px;font-size:8px;line-height:1.35;color:#8ba6af}
      @media(max-width:950px){#${PANEL_ID} .de-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      }
    `;
    document.head.appendChild(style);
  }

  function render(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    const anchor=document.getElementById("strategyAAfterCost")||document.getElementById("strategyAExperimentLedger");
    if(!anchor)return false;
    let panel=document.getElementById(PANEL_ID);
    if(!panel){
      panel=document.createElement("section");
      panel.id=PANEL_ID;
      anchor.insertAdjacentElement("afterend",panel);
    }
    const s=snapshot();
    panel.dataset.state=s.review_required?"review":s.indexeddb_ready?"ready":"pending";
    panel.innerHTML=`
      <div class="de-head">
        <div><div class="de-title">STRATEGY A · DURABLE EVIDENCE · ${BUILD}</div><div class="de-note">IndexedDB local · aucune décision Strategy A modifiée · aucun backfill inventé.</div></div>
        <div class="de-state">${s.review_required?"REVIEW REQUIRED":s.indexeddb_ready?"DURABLE READY":"INITIALISATION"}</div>
      </div>
      <div class="de-grid">
        <div class="de-k"><span>Cycles durables</span><b>${s.cycles}</b></div>
        <div class="de-k"><span>After-cost</span><b>${s.after_cost}</b></div>
        <div class="de-k"><span>États PAPER</span><b>${s.paper_states}</b></div>
        <div class="de-k"><span>PAPER ouverts restaurés</span><b>${s.unresolved_open_paper}</b></div>
        <div class="de-k"><span>Gaps runtime</span><b>${s.runtime_gaps}</b></div>
        <div class="de-k"><span>Dernière capture</span><b>${s.last_capture_at?new Date(s.last_capture_at).toLocaleTimeString("fr-FR"):"—"}</b></div>
      </div>
      <div class="de-note">${s.last_error?`ERREUR · ${String(s.last_error)}`:"Un reload conserve les preuves déjà capturées. Un ancien PAPER resté OPEN ne sera jamais présenté comme clos : REVIEW REQUIRED."}</div>
    `;
    patchAfterPanel();
    return true;
  }

  async function init(){
    try{
      await Promise.all([
        hydrateStore(STORE_CYCLES),
        hydrateStore(STORE_AFTER),
        hydrateStore(STORE_PAPER),
        hydrateStore(STORE_GAPS)
      ]);
      // Close any browser visibility gap left open by a previous unloaded page.
      const now=nowIso();
      for(const entry of [...cache.runtime_gaps.values()]){
        if(entry?.ended_at)continue;
        const closed={...entry,ended_at:now,detail:{...(entry.detail||{}),closed_reason:"PAGE_RESTORE"}};
        closed.duration_ms=Math.max(0,Date.parse(closed.ended_at)-Date.parse(closed.started_at));
        cache.runtime_gaps.set(closed.id,closed);
        await putEntries(STORE_GAPS,[closed]);
      }
      await importLegacyProspective();
      hydrated=true;
      ensureFacades();
      await captureRuntime("init");
      render();
      try{document.dispatchEvent(new CustomEvent("agent-crypto:strategy-a-durable-evidence-ready",{detail:snapshot()}));}catch(_){}
      return true;
    }catch(error){
      lastError=String(error?.message||error);
      hydrated=true;
      render();
      return false;
    }
  }

  function scheduleCapture(reason){
    queueMicrotask(()=>{enqueue(()=>captureRuntime(reason));});
  }

  if(typeof document!=="undefined"){
    const events=[
      "agentcrypto:current-finalized",
      "agent-crypto:evidence-data-changed",
      "agent-crypto:evidence-refresh-complete",
      "agent-crypto:market-series-updated",
      "agentcrypto:strategy-a-owner-autostart",
      "erith:system-hydrated"
    ];
    for(const name of events)document.addEventListener(name,()=>scheduleCapture(name),{passive:true});

    document.addEventListener("visibilitychange",()=>{
      if(document.hidden){
        openVisibilityGap("TAB_HIDDEN");
        scheduleCapture("visibility-hidden");
      }else{
        closeVisibilityGap("VISIBLE_AGAIN");
        ensureFacades();
        scheduleCapture("visibility-visible");
      }
    },{passive:true});

    window.addEventListener("pageshow",()=>{
      closeVisibilityGap("PAGESHOW");
      ensureFacades();
      scheduleCapture("pageshow");
    },{passive:true});

    window.addEventListener("pagehide",()=>{
      openVisibilityGap("PAGEHIDE");
      scheduleCapture("pagehide");
    },{passive:true});

    window.addEventListener("load",()=>{
      ensureFacades();
      scheduleCapture("load");
    },{once:true});

    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{ensureFacades();void init();},{once:true});
    else {ensureFacades();void init();}
  }

  globalThis.AgentCryptoStrategyADurableEvidence=Object.freeze({
    build:BUILD,
    database:DB_NAME,
    snapshot,
    capture:reason=>enqueue(()=>captureRuntime(reason||"api")),
    read_cycles:()=>mergedPayloads(STORE_CYCLES,[]),
    read_after_cost:()=>mergedPayloads(STORE_AFTER,[]),
    read_paper_states:()=>mergedPayloads(STORE_PAPER,[]),
    read_runtime_gaps:()=>[...cache.runtime_gaps.values()].map(clone),
    ensure_facades:ensureFacades,
    render,
    paper_only:true,
    real_orders:false,
    network:false,
    thresholds_changed:false,
    strategy_logic_changed:false,
    historical_backfill:false,
    recurring_timer:false,
    observer:false,
    indexeddb:true
  });
})();
