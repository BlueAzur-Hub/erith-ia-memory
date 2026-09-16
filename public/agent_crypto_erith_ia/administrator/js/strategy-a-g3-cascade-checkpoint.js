/* Agent-Crypto @erith.IA — 40.6.197 G3 TEMPORAL CONTRACT CERTIFICATION
   Read-only evidence bridge. It certifies only a real, regular 24 h sub-window
   from the structured market-series owner. It never invents points, never
   promotes Gate 3 and never touches Strategy A business logic, orders or storage. */
(() => {
  "use strict";
  const BUILD="40.6.197", ROOT_ID="strategyAG3CascadeCheckpoint", DOSSIER_ID="strategyADossier";
  const DAY_MS=24*60*60*1000;
  const finite=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
  const ts=v=>{const n=typeof v==="number"?v:Date.parse(String(v??""));return Number.isFinite(n)?n:null;};
  const price=v=>{const n=finite(v);return n!==null&&n>0?n:null;};
  function row(x){
    if(Array.isArray(x)) return {t:ts(x[0]),p:price(x[1]),raw:x};
    if(!x||typeof x!=="object") return {t:null,p:null,raw:x};
    return {t:ts(x.t??x.ts??x.time??x.timestamp??x.at??x.date),p:price(x.p??x.price??x.value??x.close??x.y),raw:x};
  }
  const median=a=>{const b=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!b.length)return null;const m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2;};
  function source(){try{return globalThis.AgentCryptoMarketSeriesTruth?.snapshot?.()||null}catch(_){return null}}
  function certify(raw=source()){
    const blockers=[];
    if(!raw||raw.available===false){blockers.push("SOURCE_UNAVAILABLE");return result(raw,[],blockers,null);}
    if(raw.source_period_proven!==true||Number(raw.source_period_days)!==1) blockers.push("SOURCE_24H_NOT_PROVEN");
    const rows=(Array.isArray(raw.rows)?raw.rows:[]).map(row).filter(r=>r.t!==null&&r.p!==null).sort((a,b)=>a.t-b.t);
    const unique=[]; for(const r of rows){if(!unique.length||unique[unique.length-1].t!==r.t)unique.push(r);}
    if(unique.length<2){blockers.push("INSUFFICIENT_VALID_ROWS");return result(raw,unique,blockers,null);}
    const diffs=[];for(let i=1;i<unique.length;i++)diffs.push((unique[i].t-unique[i-1].t)/60000);
    const cadence=median(diffs);
    if(!(cadence>0)) blockers.push("OBSERVED_CADENCE_UNKNOWN");
    const end=unique[unique.length-1].t,target=end-DAY_MS,tol=Math.max(1000,(cadence||1)*60000*0.08);
    let startIndex=-1,best=Infinity;
    for(let i=0;i<unique.length;i++){const d=Math.abs(unique[i].t-target);if(d<best){best=d;startIndex=i;}}
    const window=startIndex>=0?unique.slice(startIndex):[];
    const span=window.length>1?(window[window.length-1].t-window[0].t)/60000:null;
    const wdiff=[];for(let i=1;i<window.length;i++)wdiff.push((window[i].t-window[i-1].t)/60000);
    const maxGap=wdiff.length?Math.max(...wdiff):null, expectedRows=cadence>0?Math.round(1440/cadence)+1:null;
    if(best>tol) blockers.push("NO_EXACT_24H_BOUNDARY");
    if(span===null||Math.abs(span-1440)>Math.max(0.25,(cadence||1)*0.08)) blockers.push("SPAN_NOT_24H");
    if(expectedRows!==null&&window.length!==expectedRows) blockers.push("ROW_COUNT_MISMATCH");
    if(cadence>0&&wdiff.some(d=>Math.abs(d-cadence)>Math.max(0.25,cadence*0.25))) blockers.push("IRREGULAR_CADENCE");
    if(cadence>0&&maxGap>cadence*1.25) blockers.push("UNEXPECTED_GAP");
    return result(raw,window,blockers,cadence,{span,maxGap,expectedRows,sourceRows:rows.length,uniqueRows:unique.length});
  }
  function result(raw,window,blockers,cadence,extra={}){
    const certified=blockers.length===0;
    return Object.freeze({schema:"agent_crypto_g3_temporal_contract_v1",build:BUILD,status:certified?"CERTIFIED":"NOT_CERTIFIED",certified,asset:String(raw?.symbol||raw?.asset_id||"BTC").toUpperCase(),source_owner:raw?.owner||"AgentCryptoMarketSeriesTruth",source_period_days:finite(raw?.source_period_days),source_period_proven:raw?.source_period_proven===true,source_points:extra.sourceRows??(Array.isArray(raw?.rows)?raw.rows.length:0),window_points:window.length,observed_cadence_min:cadence,window_span_min:extra.span??null,max_gap_min:extra.maxGap??null,expected_rows:extra.expectedRows??null,first_at:window.length?new Date(window[0].t).toISOString():null,last_at:window.length?new Date(window[window.length-1].t).toISOString():null,rows:Object.freeze(window.map(r=>Object.freeze([r.t,r.p]))),blockers:Object.freeze(blockers.slice()),paper_only:true,g3:"PENDING",g9:"LOCKED",real_order:false,fabricated_data:false,trimmed_to_real_24h_window:certified&&Number(extra.sourceRows||0)>window.length});
  }
  function self_test(){
    const base=Date.UTC(2026,8,16,0,0,0),rows=[];for(let i=0;i<300;i++)rows.push([base+i*300000,65000+i]);
    const good=certify({available:true,source_period_proven:true,source_period_days:1,rows,symbol:"BTC",owner:"TEST"});
    const badRows=rows.slice();badRows.splice(150,1);const gap=certify({available:true,source_period_proven:true,source_period_days:1,rows:badRows,symbol:"BTC",owner:"TEST"});
    return {build:BUILD,pass:good.certified===true&&good.window_points===289&&good.window_span_min===1440&&gap.certified===false,checks:{overlong_regular_source_yields_exact_real_24h:good.certified===true&&good.window_points===289,gap_fails_closed:gap.certified===false}};
  }
  function render(){
    const data=certify(); if(typeof document==="undefined")return data; const dossier=document.getElementById(DOSSIER_ID);if(!dossier)return data;
    let root=document.getElementById(ROOT_ID);if(!root){root=document.createElement("section");root.id=ROOT_ID;root.style.cssText="margin-top:9px;padding:8px;border:1px solid rgba(120,210,255,.25);border-radius:8px;background:rgba(6,24,34,.30)";dossier.appendChild(root);} root.dataset.build=BUILD;
    const esc=x=>String(x??"INCONNU").replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]));
    root.innerHTML=`<div style="font-size:8px;font-weight:950;letter-spacing:.08em;color:#85e8ff">G3 · CASCADE CHECKPOINT · ${BUILD}</div><div style="margin-top:3px;font-size:8px;color:#9bb8c3">Contrat temporel read-only · sous-fenêtre 24 h réelle · aucune promotion de Gate.</div><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin-top:7px"><div><small>ÉTAT</small><b style="display:block">${esc(data.status)}</b></div><div><small>POINTS 24H</small><b style="display:block">${esc(data.window_points)}</b></div><div><small>CADENCE OBS.</small><b style="display:block">${esc(data.observed_cadence_min)} min</b></div><div><small>SPAN</small><b style="display:block">${esc(data.window_span_min)} min</b></div><div><small>G3</small><b style="display:block">PENDING</b></div></div><div style="margin-top:6px;font-size:8px;color:#9bb8c3">${data.blockers.length?esc(data.blockers.join(" · ")):"Fenêtre temporelle certifiée pour préparer le replay; aucune rentabilité déduite."}</div>`;
    return data;
  }
  globalThis.AgentCryptoStrategyAG3CascadeCheckpoint=Object.freeze({build:BUILD,stage:"TEMPORAL_CONTRACT",snapshot:certify,render,self_test,recurring_timer:false,observer:false,storage_write:false,network:false,real_order:false,paper_only:true,g3:"PENDING",g9:"LOCKED"});
})();
