/* Agent-Crypto @erith.IA — 40.4.56
   SOURCE INTELLIGENCE V1 · CEX TRUTH + DEX/DEFI CONTEXT · PRIVATE LOCAL BACKEND V1.2
   Binance direct EUR WebSocket stays primary runtime owner.
   Kraken + Coinbase remain loopback read-only controls.
   No timer, observer, storage write, wallet, order or trading endpoint. */
(()=>{
  "use strict";
  const BUILD="40.4.56";
  const API="http://127.0.0.1:8790";
  const BACKEND_SELECTOR='details[data-collapse-key="backend"]';
  const ASSETS=Object.freeze(["BTC","ETH","BNB","XRP","SOL"]);
  const COHERENT=0.25, WATCH=0.75;
  let mounted=false,inflight=null,lastTruth=null,lastContext=null,lastIntelligence=null;

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
      <section class="private-intelligence-v1" id="privateSourceIntelligence4056" aria-labelledby="privateSourceIntelligenceTitle4056">
        <div class="private-context-head"><div><p class="eyebrow">SOURCE INTELLIGENCE V1 · FACT CONTRACT</p><h4 id="privateSourceIntelligenceTitle4056">Fraîcheur · provenance · concordance · contexte</h4><p>Fusion descriptive des couches déjà lues. Aucun prix canonique supplémentaire, aucune prévision, aucune exécution.</p></div><span class="pill warn" id="privateSourceIntelligenceStatus4056">EN ATTENTE</span></div>
        <div class="private-backend-actions"><button class="btn primary" type="button" id="privateSourceIntelligenceRefresh4056">Actualiser Source Intelligence</button><span id="privateSourceIntelligenceDetail4056">CEX + DEX/DeFi · contrat destiné aux consommateurs internes, Atlas non rebranché dans cette version</span></div>
        <div class="private-intelligence-grid" id="privateSourceIntelligenceGrid4056">
          <article><span>CEX</span><b>EN ATTENTE</b><small>concordance</small></article>
          <article><span>DEX</span><b>EN ATTENTE</b><small>couverture contexte</small></article>
          <article><span>DeFi</span><b>EN ATTENTE</b><small>chaînes</small></article>
          <article><span>Fraîcheur</span><b>EN ATTENTE</b><small>âge maximal mesuré</small></article>
        </div>
        <p class="private-backend-note" id="privateSourceIntelligenceNote4056">INFORMATION MANQUANTE reste information manquante. Les sources DEX/DeFi enrichissent le contexte sans devenir Source Truth CEX.</p>
      </section>
    </section>`;}

  function setStatus(text,tone="warn",detail=""){
    const badge=document.getElementById("privateBackendStatus4053");if(badge){badge.className=`pill ${tone}`;badge.textContent=text;}
    const d=document.getElementById("privateBackendDetail4053");if(d&&detail)d.textContent=detail;
  }
  async function getJson(path,timeoutMs=6500){
    const controller=new AbortController(),abort=setTimeout(()=>controller.abort(),timeoutMs);
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
  function providerQuote(asset,provider,quotes){return (quotes||[]).find(q=>q.asset===asset&&q.provider===provider&&q.status==="ok")||null;}
  function providerPrice(asset,provider,quotes){return num(providerQuote(asset,provider,quotes)?.price_eur);}
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
      const row=rows.find(r=>r.asset===asset)||{},bq=binance(asset),bp=num(bq?.price_eur),kq=providerQuote(asset,"kraken",row.quotes),cq=providerQuote(asset,"coinbase",row.quotes),kp=num(kq?.price_eur),cp=num(cq?.price_eur);
      if(bp!==null)binanceOk+=1;if(kp!==null)krakenOk+=1;if(cp!==null)coinbaseOk+=1;
      const c=consensus([bp,kp,cp]);return {asset,binance:bp,kraken:kp,coinbase:cp,consensus:c,binance_source:bq?.source||null,observed:{binance_ms:num(bq?.observed_at_ms),kraken_utc:kq?.observed_at_utc||null,coinbase_utc:cq?.observed_at_utc||null}};
    });
    tbody.innerHTML=truthAssets.map(row=>{const verdict=String(row.consensus.verdict||"insufficient").toUpperCase();const cls=verdict==="COHERENT"?"is-ok":verdict==="WATCH"?"is-watch":verdict==="DIVERGENT"?"is-bad":"is-muted";return `<tr><th>${row.asset}</th><td>${eur(row.binance)}</td><td>${eur(row.kraken)}</td><td>${eur(row.coinbase)}</td><td>${pct(row.consensus.spread_pct)}</td><td><span class="${cls}">${esc(verdict)}</span></td></tr>`;}).join("");
    const providers=[binanceOk,krakenOk,coinbaseOk].filter(n=>n>0).length;
    setStatus(providers>=2?"CEX READY":"PARTIEL",providers>=2?"ok":"warn",`Binance ${binanceOk}/5 · Kraken ${krakenOk}/5 · Coinbase ${coinbaseOk}/5 · ${providers}/3 source(s)`);
    lastTruth=Object.freeze({schema:"agent_crypto_cex_source_truth_v1",build:BUILD,observed_at_utc:data?.observed_at_utc||new Date().toISOString(),primary:"binance",controls:Object.freeze(["kraken","coinbase"]),assets:Object.freeze(truthAssets.map(x=>Object.freeze(x))),canonical_price_created:false,financial_signal:false});
    const note=document.getElementById("privateBackendNote4053");if(note)note.textContent=`Source Truth CEX · écart cohérent ≤ ${COHERENT} % · surveillance ≤ ${WATCH} % · Binance reste primaire · aucune exécution.`;
    try{document.dispatchEvent(new CustomEvent("erith:cex-source-truth",{detail:lastTruth}));}catch(_){}
    renderSourceIntelligence();
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
    lastContext=data||null;
    try{document.dispatchEvent(new CustomEvent("erith:dex-defi-context",{detail:data}));}catch(_){}
    renderSourceIntelligence();
  }
  function observedMs(value){if(value===null||value===undefined)return null;const n=Number(value);if(Number.isFinite(n)&&n>0)return n;const parsed=Date.parse(String(value));return Number.isFinite(parsed)?parsed:null;}
  function ageSeconds(value){const ms=observedMs(value);return ms===null?null:Math.max(0,Math.round((Date.now()-ms)/1000));}
  function freshnessText(seconds){if(seconds===null)return "—";if(seconds<60)return `${seconds}s`;if(seconds<3600)return `${Math.round(seconds/60)} min`;return `${(seconds/3600).toFixed(1)} h`;}
  function buildSourceIntelligence(){
    if(!lastTruth&&!lastContext)return null;
    const cexAssets=Array.isArray(lastTruth?.assets)?lastTruth.assets:[];
    const contextAssets=Array.isArray(lastContext?.assets)?lastContext.assets:[];
    const spreads=cexAssets.map(x=>num(x?.consensus?.spread_pct)).filter(x=>x!==null);
    const cexComparable=cexAssets.filter(x=>Number(x?.consensus?.providers||0)>=2).length;
    const dsOk=contextAssets.filter(x=>x?.dexscreener?.status==="ok").length;
    const gtOk=contextAssets.filter(x=>x?.geckoterminal?.status==="ok").length;
    const chains=Array.isArray(lastContext?.defillama?.chains)?lastContext.defillama.chains:[];
    const ages=[];
    cexAssets.forEach(x=>{const o=x?.observed||{};[o.binance_ms,o.kraken_utc,o.coinbase_utc].forEach(v=>{const a=ageSeconds(v);if(a!==null)ages.push(a);});});
    contextAssets.forEach(x=>{[x?.dexscreener?.observed_at_utc,x?.geckoterminal?.observed_at_utc].forEach(v=>{const a=ageSeconds(v);if(a!==null)ages.push(a);});});
    chains.forEach(x=>{const a=ageSeconds(x?.observed_at_utc);if(a!==null)ages.push(a);});
    const maxAge=ages.length?Math.max(...ages):null;
    const ready=cexComparable===ASSETS.length&&(dsOk>0||gtOk>0)&&chains.length>0;
    return Object.freeze({schema:"agent_crypto_source_intelligence_v1",build:BUILD,generated_at_utc:new Date().toISOString(),state:ready?"ready":"partial",cex:Object.freeze({primary:"binance",controls:Object.freeze(["kraken","coinbase"]),comparable_assets:cexComparable,total_assets:ASSETS.length,max_spread_pct:spreads.length?Math.max(...spreads):null}),dex:Object.freeze({dexscreener_ok:dsOk,geckoterminal_ok:gtOk,total_assets:ASSETS.length,context_only:true}),defi:Object.freeze({chains_ok:chains.length,chains:Object.freeze(chains.map(x=>x.chain))}),freshness:Object.freeze({max_age_seconds:maxAge,samples:ages.length}),provenance:Object.freeze({spot_primary:"Binance direct EUR WebSocket",cex_controls:Object.freeze(["Kraken Public","Coinbase Exchange"]),dex_context:Object.freeze(["DEX Screener","GeckoTerminal"]),defi_context:"DefiLlama"}),rules:Object.freeze({canonical_price_created:false,dex_price_promoted:false,financial_signal:false,missing_data_fabricated:false,atlas_consumer_enabled:false})});
  }
  function renderSourceIntelligence(){
    const intel=buildSourceIntelligence();if(!intel)return null;lastIntelligence=intel;
    const badge=document.getElementById("privateSourceIntelligenceStatus4056");if(badge){badge.className=`pill ${intel.state==="ready"?"ok":"warn"}`;badge.textContent=intel.state==="ready"?"INTELLIGENCE READY":"PARTIEL";}
    const grid=document.getElementById("privateSourceIntelligenceGrid4056");if(grid){grid.innerHTML=`<article><span>CEX</span><b>${intel.cex.comparable_assets}/${intel.cex.total_assets}</b><small>écart max ${pct(intel.cex.max_spread_pct)}</small></article><article><span>DEX</span><b>${intel.dex.dexscreener_ok}/${intel.dex.total_assets} + ${intel.dex.geckoterminal_ok}/${intel.dex.total_assets}</b><small>DEX Screener + GeckoTerminal</small></article><article><span>DeFi</span><b>${intel.defi.chains_ok}/3</b><small>${esc(intel.defi.chains.join(" · ")||"—")}</small></article><article><span>Fraîcheur</span><b>${freshnessText(intel.freshness.max_age_seconds)}</b><small>${intel.freshness.samples} observation(s) horodatée(s)</small></article>`;}
    const d=document.getElementById("privateSourceIntelligenceDetail4056");if(d)d.textContent=`CEX ${intel.cex.comparable_assets}/5 · DEX DS ${intel.dex.dexscreener_ok}/5 · GT ${intel.dex.geckoterminal_ok}/5 · DeFi ${intel.defi.chains_ok}/3 · aucun signal financier`;
    try{document.dispatchEvent(new CustomEvent("erith:source-intelligence",{detail:intel}));}catch(_){}
    return intel;
  }
  async function refreshAll(){await refresh();await refreshContext();return renderSourceIntelligence();}

  async function refreshContext(){
    const badge=document.getElementById("privateDexDefiStatus4055");if(badge){badge.className="pill warn";badge.textContent="LECTURE…";}
    try{const data=await getJson(`/context?assets=${encodeURIComponent(ASSETS.join(","))}`,18000);renderContext(data);return data;}catch(error){if(badge){badge.className="pill warn";badge.textContent="INDISPONIBLE";}const d=document.getElementById("privateDexDefiDetail4055");if(d)d.textContent=`Contexte DEX / DeFi indisponible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`;return null;}
  }

  async function probe(){if(inflight)return inflight;setStatus("TEST…","warn","Connexion à 127.0.0.1:8790…");inflight=getJson("/health").then(data=>{renderHealth(data);return data;}).catch(error=>{setStatus("OFFLINE","warn",`Backend local indisponible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`);return null;}).finally(()=>{inflight=null;});return inflight;}
  async function refresh(){setStatus("LECTURE…","warn","Binance LIVE + Kraken + Coinbase…");try{const data=await getJson(`/quotes?assets=${encodeURIComponent(ASSETS.join(","))}`);renderQuotes(data);return data;}catch(error){setStatus("INDISPONIBLE","warn",`Lecture sources impossible · ${error?.name==="AbortError"?"timeout":String(error?.message||error)}`);return null;}}
  function mount(){if(mounted&&document.getElementById("privateBackendV1"))return true;const body=backendBody();if(!body)return false;if(!document.getElementById("privateBackendV1"))body.insertAdjacentHTML("beforeend",shell());document.getElementById("privateBackendHealth4053")?.addEventListener("click",probe);document.getElementById("privateBackendRefresh4053")?.addEventListener("click",refresh);document.getElementById("privateDexDefiRefresh4055")?.addEventListener("click",refreshContext);document.getElementById("privateSourceIntelligenceRefresh4056")?.addEventListener("click",refreshAll);mounted=true;probe();return true;}
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
  globalThis.ErithPrivateBackendSources4054=Object.freeze({build:BUILD,backend_version:"1.2.0",api:API,mode:"READ_ONLY",mount,probe,refresh,refreshContext,refreshAll,snapshot:()=>lastTruth,contextSnapshot:()=>lastContext,sourceIntelligence:()=>lastIntelligence,system_hydration_rebind:true,new_timer:false,new_observer:false,storage_owner_added:false,trade_endpoint:false,canonical_price_created:false,atlas_consumer_enabled:false});
})();
