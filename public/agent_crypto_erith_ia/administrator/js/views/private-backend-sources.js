/* Agent-Crypto @erith.IA — 40.4.53
   PRIVATE LOCAL BACKEND V1 · READ-ONLY SOURCE MATRIX
   Owner: presentation/probe only. No timer, observer, storage write, exchange action or trading endpoint. */
(()=>{
  "use strict";
  const BUILD="40.4.53";
  const API="http://127.0.0.1:8790";
  const BACKEND_SELECTOR='details[data-collapse-key="backend"]';
  const ASSETS=Object.freeze(["BTC","ETH","BNB","XRP","SOL"]);
  let mounted=false;
  let inflight=null;

  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const num=value=>Number.isFinite(Number(value))?Number(value):null;
  const eur=value=>{
    const n=num(value); if(n===null)return "—";
    return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:n<10?4:2}).format(n);
  };
  const pct=value=>{
    const n=num(value); return n===null?"—":`${n.toFixed(3)} %`;
  };
  const backendDetails=()=>document.querySelector(BACKEND_SELECTOR);
  const backendBody=()=>backendDetails()?.querySelector(":scope > .atlas-collapse-body")||backendDetails()?.querySelector(".atlas-collapse-body")||null;

  function shell(){
    return `
      <section class="private-backend-v1" id="privateBackendV1" data-build="${BUILD}" aria-labelledby="privateBackendTitle4053">
        <div class="private-backend-head">
          <div>
            <p class="eyebrow">BACKEND PRIVÉ LOCAL · READ ONLY</p>
            <h3 id="privateBackendTitle4053">Source Matrix · contrôle multi-source</h3>
            <p>Backend séparé du Bridge IA. Lecture publique uniquement ; aucune clé, aucun wallet, aucun ordre.</p>
          </div>
          <span class="pill warn" id="privateBackendStatus4053">NON TESTÉ</span>
        </div>
        <div class="private-backend-actions">
          <button class="btn" type="button" id="privateBackendHealth4053">Tester backend</button>
          <button class="btn primary" type="button" id="privateBackendRefresh4053">Actualiser Kraken + Coinbase</button>
          <span id="privateBackendDetail4053">127.0.0.1:8790 · déclenchement opérateur uniquement</span>
        </div>
        <div class="private-backend-source-grid" id="privateBackendSources4053" aria-live="polite">
          <article><span>Kraken Public</span><b>EN ATTENTE</b><small>Spot EUR · contrôle indépendant</small></article>
          <article><span>Coinbase Exchange</span><b>EN ATTENTE</b><small>Market Data public · contrôle indépendant</small></article>
          <article><span>Contrat</span><b>READ ONLY</b><small>GET/HEAD/OPTIONS uniquement</small></article>
        </div>
        <div class="private-backend-table-wrap">
          <table class="private-backend-table">
            <thead><tr><th>Actif</th><th>Kraken</th><th>Coinbase</th><th>Écart</th><th>Verdict</th></tr></thead>
            <tbody id="privateBackendRows4053">${ASSETS.map(a=>`<tr><th>${a}</th><td>—</td><td>—</td><td>—</td><td>EN ATTENTE</td></tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="private-backend-note" id="privateBackendNote4053">La concordance mesure seulement l’écart entre observations disponibles ; elle ne fabrique pas un « vrai prix » et ne constitue pas un signal.</p>
      </section>`;
  }

  function setStatus(text,tone="warn",detail=""){
    const badge=document.getElementById("privateBackendStatus4053");
    if(badge){badge.className=`pill ${tone}`;badge.textContent=text;}
    const d=document.getElementById("privateBackendDetail4053");
    if(d&&detail)d.textContent=detail;
  }

  async function getJson(path){
    const controller=new AbortController();
    const abort=setTimeout(()=>controller.abort(),6500);
    try{
      const r=await fetch(`${API}${path}`,{method:"GET",cache:"no-store",credentials:"omit",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      return await r.json();
    }finally{clearTimeout(abort);}
  }

  function renderHealth(data){
    const ready=data?.status==="ready"&&data?.read_only===true;
    setStatus(ready?"LOCAL READY":"À VÉRIFIER",ready?"ok":"warn",ready?`Backend ${data.version||"?"} · READ ONLY · ${data.cache_ttl_seconds||"?"} s cache`:`Réponse locale reçue mais contrat inattendu`);
    const grid=document.getElementById("privateBackendSources4053");
    if(grid&&Array.isArray(data?.sources)){
      grid.innerHTML=data.sources.map(src=>`<article><span>${esc(src.label||src.id)}</span><b>${esc(String(src.mode||"READ ONLY").toUpperCase())}</b><small>${esc(src.role||"")}</small></article>`).join("")+`<article><span>Contrat</span><b>READ ONLY</b><small>aucun endpoint trading</small></article>`;
    }
  }

  function providerPrice(asset,provider,quotes){
    const hit=(quotes||[]).find(q=>q.asset===asset&&q.provider===provider&&q.status==="ok");
    return hit?.price_eur??null;
  }

  function renderQuotes(data){
    const tbody=document.getElementById("privateBackendRows4053");
    if(!tbody)return;
    const rows=data?.assets||[];
    tbody.innerHTML=ASSETS.map(asset=>{
      const row=rows.find(r=>r.asset===asset)||{};
      const kp=providerPrice(asset,"kraken",row.quotes);
      const cp=providerPrice(asset,"coinbase",row.quotes);
      const verdict=String(row?.consensus?.verdict||"insufficient").toUpperCase();
      const cls=verdict==="COHERENT"?"is-ok":verdict==="WATCH"?"is-watch":verdict==="DIVERGENT"?"is-bad":"is-muted";
      return `<tr><th>${asset}</th><td>${eur(kp)}</td><td>${eur(cp)}</td><td>${pct(row?.consensus?.spread_pct)}</td><td><span class="${cls}">${esc(verdict)}</span></td></tr>`;
    }).join("");
    const ok=(data?.summary?.providers_ok??0)>0;
    setStatus(ok?"SOURCES READY":"PARTIEL",ok?"ok":"warn",`${data?.summary?.quotes_ok ?? 0} cotation(s) · ${data?.summary?.providers_ok ?? 0} source(s) disponible(s) · ${data?.cache?.state||"fresh"}`);
    const note=document.getElementById("privateBackendNote4053");
    if(note)note.textContent=`Observation locale ${data?.observed_at_utc||"—"} · seuil cohérent ≤ ${data?.thresholds?.coherent_pct??0.25} % · surveillance ≤ ${data?.thresholds?.watch_pct??0.75} % · aucune action exchange.`;
  }

  async function probe(){
    if(inflight)return inflight;
    setStatus("TEST…","warn","Connexion à 127.0.0.1:8790…");
    inflight=getJson("/health").then(data=>{renderHealth(data);return data;}).catch(error=>{setStatus("OFFLINE","warn",`Backend local indisponible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`);return null;}).finally(()=>{inflight=null;});
    return inflight;
  }

  async function refresh(){
    setStatus("LECTURE…","warn","Kraken + Coinbase · requêtes publiques bornées…");
    try{
      const data=await getJson(`/quotes?assets=${encodeURIComponent(ASSETS.join(","))}`);
      renderQuotes(data);
    }catch(error){
      setStatus("INDISPONIBLE","warn",`Lecture sources impossible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`);
    }
  }

  function mount(){
    if(mounted&&document.getElementById("privateBackendV1"))return true;
    const body=backendBody();
    if(!body)return false;
    if(!document.getElementById("privateBackendV1"))body.insertAdjacentHTML("beforeend",shell());
    document.getElementById("privateBackendHealth4053")?.addEventListener("click",probe);
    document.getElementById("privateBackendRefresh4053")?.addEventListener("click",refresh);
    mounted=true;
    probe();
    return true;
  }

  function bind(){
    const detail=backendDetails();
    if(!detail)return false;
    if(detail.dataset.privateBackend4053!=="1"){
      detail.dataset.privateBackend4053="1";
      detail.addEventListener("toggle",()=>{if(detail.open)mount();});
    }
    if(detail.open)mount();
    return true;
  }

  bind();
  document.addEventListener("erith:presentation-resident",event=>{
    const family=String(event?.detail?.family||"");
    const key=String(event?.detail?.key||"");
    if(family==="system"||key.includes("backend"))bind();
  });
  globalThis.ErithPrivateBackendSources4053=Object.freeze({build:BUILD,api:API,mode:"READ_ONLY",mount,probe,refresh,new_timer:false,new_observer:false,storage_owner_added:false,trade_endpoint:false});
})();
