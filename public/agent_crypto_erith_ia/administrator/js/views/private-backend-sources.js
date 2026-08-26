/* Agent-Crypto @erith.IA — 40.4.55
   SOURCE TRUTH CEX WAVE 1 + DEX/DEFI CONTEXT WAVE 2 · PRIVATE LOCAL BACKEND V1.1
   Binance direct EUR WebSocket stays primary runtime owner.
   Kraken + Coinbase remain loopback read-only controls.
   No timer, observer, storage write, wallet, order or trading endpoint. */
(()=>{
  "use strict";
  const BUILD="40.4.55";
  const API="http://127.0.0.1:8790";
  const BACKEND_SELECTOR='details[data-collapse-key="backend"]';
  const ASSETS=Object.freeze(["BTC","ETH","BNB","XRP","SOL"]);
  const COHERENT=0.25, WATCH=0.75;
  let mounted=false,inflight=null,lastTruth=null;

  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const num=value=>(value===null||value===undefined||value==="")?null:(Number.isFinite(Number(value))?Number(value):null);
  const eur=value=>{const n=num(value);return n===null?"—":new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:n<10?4:2}).format(n);};
  const pct=value=>{const n=num(value);return n===null?"—":`${n.toFixed(3)} %`;};
  const usd=value=>{const n=num(value);if(n===null)return "—";const abs=Math.abs(n);const compact=abs>=1e9?`${(n/1e9).toFixed(2)} Md$`:abs>=1e6?`${(n/1e6).toFixed(2)} M$`:abs>=1e3?`${(n/1e3).toFixed(1)} k$`:`${n.toFixed(abs<10?4:2)} $`;return compact;};
  const backendDetails=()=>document.querySelector(BACKEND_SELECTOR);
  const backendBody=()=>backendDetails()?.querySelector(":scope > .atlas-collapse-body")||backendDetails()?.querySelector(".atlas-collapse-body")||null;

  function shell(){return `
    <section class="private-backend-v1" id="privateBackendV1" data-build="${BUILD}" aria-labelledby="privateBackendTitle4054">
      <div class="private-backend-head"><div>
        <p class="eyebrow">SOURCE TRUTH CEX · READ ONLY</p>
        <h3 id="privateBackendTitle4054">Binance + Kraken + Coinbase · concordance EUR</h3>
        <p>Binance reste la cotation LIVE primaire. Kraken et Coinbase sont deux contrôles indépendants via le backend privé local.</p>
      </div><span class="pill warn" id="privateBackendStatus4053">NON TESTÉ</span></div>
      <div class="private-backend-actions">
        <button class="btn" type="button" id="privateBackendHealth4053">Tester backend</button>
        <button class="btn primary" type="button" id="privateBackendRefresh4053">Actualiser Source Truth CEX</button>
        <span id="privateBackendDetail4053">Binance runtime + 127.0.0.1:8790 · déclenchement opérateur uniquement</span>
      </div>
      <div class="private-backend-source-grid" id="privateBackendSources4053" aria-live="polite">
        <article><span>Binance Direct</span><b>LIVE RUNTIME</b><small>Source primaire · WebSocket EUR</small></article>
        <article><span>Kraken Public</span><b>EN ATTENTE</b><small>Contrôle spot EUR</small></article>
        <article><span>Coinbase Exchange</span><b>EN ATTENTE</b><small>Contrôle market data EUR</small></article>
        <article><span>Contrat</span><b>READ ONLY</b><small>aucun prix canonique fabriqué</small></article>
      </div>
      <div class="private-backend-table-wrap"><table class="private-backend-table">
        <thead><tr><th>Actif</th><th>Binance LIVE</th><th>Kraken</th><th>Coinbase</th><th>Écart max</th><th>Verdict</th></tr></thead>
        <tbody id="privateBackendRows4053">${ASSETS.map(a=>`<tr><th>${a}</th><td>—</td><td>—</td><td>—</td><td>—</td><td>EN ATTENTE</td></tr>`).join("")}</tbody>
      </table></div>
      <p class="private-backend-note" id="privateBackendNote4053">La concordance compare des observations indépendantes ; Binance reste la source LIVE primaire d'Agent-Crypto et aucune médiane ne remplace son prix.</p>
      <section class="private-context-v2" id="privateDexDefiContext4055" aria-labelledby="privateDexDefiTitle4055">
        <div class="private-context-head"><div><p class="eyebrow">DEX / DEFI CONTEXT · READ ONLY</p><h4 id="privateDexDefiTitle4055">DEX Screener + GeckoTerminal + DefiLlama</h4><p>Contexte de liquidité et d'activité décentralisée séparé de la vérité CEX. Aucun prix DEX n'est promu prix canonique.</p></div><span class="pill warn" id="privateDexDefiStatus4055">NON LU</span></div>
        <div class="private-backend-actions"><button class="btn primary" type="button" id="privateDexDefiRefresh4055">Actualiser contexte DEX / DeFi</button><span id="privateDexDefiDetail4055">À la demande · cache local 60 s · aucune boucle</span></div>
        <div class="private-defi-grid" id="privateDefiSummary4055"><article><span>DefiLlama</span><b>EN ATTENTE</b><small>DEX volume par chaîne</small></article><article><span>DEX Screener</span><b>EN ATTENTE</b><small>pool liquide découvert</small></article><article><span>GeckoTerminal</span><b>EN ATTENTE</b><small>pool liquide recoupé</small></article></div>
        <div class="private-backend-table-wrap"><table class="private-backend-table private-context-table"><thead><tr><th>Actif</th><th>DEX Screener</th><th>Liquidité</th><th>GeckoTerminal</th><th>Réserve</th><th>Rôle</th></tr></thead><tbody id="privateDexDefiRows4055">${ASSETS.map(a=>`<tr><th>${a}</th><td>—</td><td>—</td><td>—</td><td>—</td><td>CONTEXTE</td></tr>`).join("")}</tbody></table></div>
        <p class="private-backend-note">Découverte par symbole/pool : utile pour le contexte de liquidité, mais insuffisante pour prouver l'identité d'un actif. Binance/Kraken/Coinbase restent la couche CEX.</p>
      </section>
    </section>`;}

  function setStatus(text,tone="warn",detail=""){
    const badge=document.getElementById("privateBackendStatus4053");if(badge){badge.className=`pill ${tone}`;badge.textContent=text;}
    const d=document.getElementById("privateBackendDetail4053");if(d&&detail)d.textContent=detail;
  }
  async function getJson(path){
    const controller=new AbortController(),abort=setTimeout(()=>controller.abort(),6500);
    try{
      const r=await fetch(`${API}${path}`,{method:"GET",mode:"cors",cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();
    }finally{clearTimeout(abort);}
  }
  function renderHealth(data){
    const ready=data?.status==="ready"&&data?.read_only===true;
    setStatus(ready?"LOCAL READY":"À VÉRIFIER",ready?"ok":"warn",ready?`Backend ${data.version||"?"} · READ ONLY · ${data.cache_ttl_seconds||"?"} s cache`:"Réponse locale reçue mais contrat inattendu");
    const grid=document.getElementById("privateBackendSources4053");
    if(grid&&Array.isArray(data?.sources)){
      grid.innerHTML=`<article><span>Binance Direct</span><b>LIVE RUNTIME</b><small>Source primaire · WebSocket EUR</small></article>`+
        data.sources.map(src=>`<article><span>${esc(src.label||src.id)}</span><b>${esc(String(src.mode||"READ ONLY").toUpperCase())}</b><small>${esc(src.role||"")}</small></article>`).join("")+
        `<article><span>Contrat</span><b>READ ONLY</b><small>aucun endpoint trading</small></article>`;
    }
  }
  function providerPrice(asset,provider,quotes){const hit=(quotes||[]).find(q=>q.asset===asset&&q.provider===provider&&q.status==="ok");return num(hit?.price_eur);}
  function binance(asset){try{return globalThis.ErithCexPrimary4054?.quote?.(asset)||null;}catch{return null;}}
  function consensus(prices){
    const vals=prices.map(num).filter(v=>v!==null&&v>0);if(vals.length<2)return {providers:vals.length,spread_pct:null,verdict:"insufficient"};
    const mean=vals.reduce((a,b)=>a+b,0)/vals.length;const spread=mean?((Math.max(...vals)-Math.min(...vals))/mean*100):null;
    const verdict=spread!==null&&spread<=COHERENT?"coherent":spread!==null&&spread<=WATCH?"watch":"divergent";
    return {providers:vals.length,spread_pct:spread,verdict};
  }
  function renderQuotes(data){
    const tbody=document.getElementById("privateBackendRows4053");if(!tbody)return;
    const rows=data?.assets||[];let binanceOk=0,krakenOk=0,coinbaseOk=0;
    const truthAssets=ASSETS.map(asset=>{
      const row=rows.find(r=>r.asset===asset)||{},bq=binance(asset),bp=num(bq?.price_eur),kp=providerPrice(asset,"kraken",row.quotes),cp=providerPrice(asset,"coinbase",row.quotes);
      if(bp!==null)binanceOk+=1;if(kp!==null)krakenOk+=1;if(cp!==null)coinbaseOk+=1;
      const c=consensus([bp,kp,cp]);return {asset,binance:bp,kraken:kp,coinbase:cp,consensus:c,binance_source:bq?.source||null};
    });
    tbody.innerHTML=truthAssets.map(row=>{const verdict=String(row.consensus.verdict||"insufficient").toUpperCase();const cls=verdict==="COHERENT"?"is-ok":verdict==="WATCH"?"is-watch":verdict==="DIVERGENT"?"is-bad":"is-muted";return `<tr><th>${row.asset}</th><td>${eur(row.binance)}</td><td>${eur(row.kraken)}</td><td>${eur(row.coinbase)}</td><td>${pct(row.consensus.spread_pct)}</td><td><span class="${cls}">${esc(verdict)}</span></td></tr>`;}).join("");
    const providers=[binanceOk,krakenOk,coinbaseOk].filter(n=>n>0).length;
    setStatus(providers>=2?"CEX READY":"PARTIEL",providers>=2?"ok":"warn",`Binance ${binanceOk}/5 · Kraken ${krakenOk}/5 · Coinbase ${coinbaseOk}/5 · ${providers}/3 source(s)`);
    lastTruth=Object.freeze({schema:"agent_crypto_cex_source_truth_v1",build:BUILD,observed_at_utc:data?.observed_at_utc||new Date().toISOString(),primary:"binance",controls:Object.freeze(["kraken","coinbase"]),assets:Object.freeze(truthAssets.map(x=>Object.freeze(x))),canonical_price_created:false,financial_signal:false});
    const note=document.getElementById("privateBackendNote4053");if(note)note.textContent=`Source Truth CEX · écart cohérent ≤ ${COHERENT} % · surveillance ≤ ${WATCH} % · Binance reste primaire · aucune exécution.`;
    try{document.dispatchEvent(new CustomEvent("erith:cex-source-truth",{detail:lastTruth}));}catch(_){}
  }
  function contextPoolLabel(item){
    if(!item||item.status!=="ok")return "—";
    const chain=item.chain||item.network||"?",dex=item.dex||"pool",name=item.name||`${item.base_symbol||"?"}/${item.quote_symbol||"?"}`;
    return `${chain} · ${dex} · ${name}`;
  }
  function renderContext(data){
    const tbody=document.getElementById("privateDexDefiRows4055");if(!tbody)return;
    const rows=Array.isArray(data?.assets)?data.assets:[];let dsOk=0,gtOk=0;
    tbody.innerHTML=ASSETS.map(asset=>{
      const row=rows.find(r=>r.asset===asset)||{},ds=row.dexscreener||{},gt=row.geckoterminal||{};
      if(ds.status==="ok")dsOk++;if(gt.status==="ok")gtOk++;
      return `<tr><th>${asset}</th><td>${esc(contextPoolLabel(ds))}</td><td>${esc(usd(ds.liquidity_usd))}</td><td>${esc(contextPoolLabel(gt))}</td><td>${esc(usd(gt.reserve_usd))}</td><td><span class="is-muted">CONTEXTE</span></td></tr>`;
    }).join("");
    const llama=data?.defillama||{},chains=Array.isArray(llama.chains)?llama.chains:[];
    const summary=document.getElementById("privateDefiSummary4055");
    if(summary){
      const chainCards=chains.map(c=>`<article><span>DefiLlama · ${esc(c.chain)}</span><b>${esc(usd(c.dex_volume_24h_usd))}</b><small>volume DEX 24 h · contexte</small></article>`).join("");
      summary.innerHTML=chainCards+`<article><span>DEX Screener</span><b>${dsOk}/${ASSETS.length}</b><small>pools canoniques trouvés</small></article><article><span>GeckoTerminal</span><b>${gtOk}/${ASSETS.length}</b><small>pools recoupés</small></article>`;
    }
    const status=document.getElementById("privateDexDefiStatus4055");if(status){status.className=`pill ${(dsOk||gtOk||chains.length)?"ok":"warn"}`;status.textContent=(dsOk||gtOk||chains.length)?"CONTEXT READY":"PARTIEL";}
    const detail=document.getElementById("privateDexDefiDetail4055");if(detail)detail.textContent=`DEX Screener ${dsOk}/5 · GeckoTerminal ${gtOk}/5 · DefiLlama ${chains.length}/${3} chaîne(s) · context only`;
    try{document.dispatchEvent(new CustomEvent("erith:dex-defi-context",{detail:data}));}catch(_){}
  }
  async function refreshContext(){
    const badge=document.getElementById("privateDexDefiStatus4055");if(badge){badge.className="pill warn";badge.textContent="LECTURE…";}
    try{const data=await getJson(`/context?assets=${encodeURIComponent(ASSETS.join(","))}`);renderContext(data);return data;}catch(error){if(badge){badge.className="pill warn";badge.textContent="INDISPONIBLE";}const d=document.getElementById("privateDexDefiDetail4055");if(d)d.textContent=`Contexte DEX / DeFi indisponible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`;return null;}
  }

  async function probe(){if(inflight)return inflight;setStatus("TEST…","warn","Connexion à 127.0.0.1:8790…");inflight=getJson("/health").then(data=>{renderHealth(data);return data;}).catch(error=>{setStatus("OFFLINE","warn",`Backend local indisponible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`);return null;}).finally(()=>{inflight=null;});return inflight;}
  async function refresh(){setStatus("LECTURE…","warn","Binance LIVE + Kraken + Coinbase…");try{const data=await getJson(`/quotes?assets=${encodeURIComponent(ASSETS.join(","))}`);renderQuotes(data);}catch(error){setStatus("INDISPONIBLE","warn",`Lecture sources impossible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`);}}
  function mount(){if(mounted&&document.getElementById("privateBackendV1"))return true;const body=backendBody();if(!body)return false;if(!document.getElementById("privateBackendV1"))body.insertAdjacentHTML("beforeend",shell());document.getElementById("privateBackendHealth4053")?.addEventListener("click",probe);document.getElementById("privateBackendRefresh4053")?.addEventListener("click",refresh);document.getElementById("privateDexDefiRefresh4055")?.addEventListener("click",refreshContext);mounted=true;probe();return true;}
  function bind(){const detail=backendDetails();if(!detail)return false;if(detail.dataset.privateBackend4054!=="1"){detail.dataset.privateBackend4054="1";detail.addEventListener("toggle",()=>{if(detail.open)mount();});}if(detail.open)mount();return true;}
  bind();
  // 40.4.55 canonical System true-lazy handoff: system-presentation replaces the
  // backend body only after its asynchronous hydration completes. Re-mount the
  // Source Truth panel after that owner signals the real body is resident.
  window.addEventListener("erith:system-hydrated",event=>{
    if(String(event?.detail?.key||"")!=="backend")return;
    mounted=false;
    bind();
    mount();
  });
  // Compatibility with same-node residency restoration. The lifecycle event is
  // non-bubbling, so bind directly on the backend <details> when available.
  const detail=backendDetails();
  detail?.addEventListener("erith:presentation-resident",()=>{mounted=false;bind();if(detail.open)mount();});
  globalThis.ErithPrivateBackendSources4054=Object.freeze({build:BUILD,backend_version:"1.1.0",api:API,mode:"READ_ONLY",mount,probe,refresh,refreshContext,snapshot:()=>lastTruth,system_hydration_rebind:true,new_timer:false,new_observer:false,storage_owner_added:false,trade_endpoint:false,canonical_price_created:false});
})();
