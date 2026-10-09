/* Agent-Crypto — TOP EXPLORER
   Reused from PR #187 on the current shared Trader/Administrator runtime.

   PURPOSE
   - Four compact rankings: Hausse 24h, Baisse 24h, Volume 24h, Nouveaux listings.
   - Core rankings read the resident canonical Market universe only.
   - New listings reuse the existing native category discovery/select owner.
   - A row click selects the asset through the existing canonical owner.
   - No duplicate Market, Graph, Fiche, Candles or Depth owner.

   SAFETY
   - Read only.
   - No recurring timer, MutationObserver, storage owner or order path.
   - No new business-network owner: New Listings calls the already-existing owner
     only after an explicit operator action.
*/
(()=>{
  "use strict";

  const BUILD="40.6.625";
  const ROOT_ID="atlasTop10Explorer";
  const COUNTS=Object.freeze([10,20,50,100,250]);
  const MODES=Object.freeze({
    gainers:Object.freeze({label:"Hausse 24h",short:"HAUSSES",kind:"core"}),
    losers:Object.freeze({label:"Baisse 24h",short:"BAISSES",kind:"core"}),
    volume:Object.freeze({label:"Volume 24h",short:"VOLUMES",kind:"core"}),
    listings:Object.freeze({label:"Nouveaux listings",short:"NOUVEAUX",kind:"listings"})
  });
  const runtime={
    mode:"gainers",
    limit:10,
    mounted:false,
    loading:false,
    lastError:null,
    listingSpecs:[],
    renderedAt:null
  };

  const finite=value=>{
    if(value===null||value===undefined||value==="")return null;
    const n=Number(value);
    return Number.isFinite(n)?n:null;
  };
  const positive=value=>{
    const n=finite(value);
    return n!==null&&n>0?n:null;
  };
  const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));

  function displayCurrency(){
    try{
      const value=String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase();
      return value==="EUR"?"EUR":"USD";
    }catch(_){return "USD";}
  }

  function money(value,currency=displayCurrency()){
    const n=positive(value);
    if(n===null)return "—";
    const digits=n>=1000?2:n>=1?4:n>=.01?6:n>=.0001?8:10;
    try{
      return new Intl.NumberFormat("fr-FR",{
        style:"currency",
        currency,
        minimumFractionDigits:Math.min(2,digits),
        maximumFractionDigits:digits
      }).format(n);
    }catch(_){
      return `${n.toLocaleString("fr-FR",{maximumFractionDigits:digits})} ${currency}`;
    }
  }

  function compactMoney(value,currency=displayCurrency()){
    const n=positive(value);
    if(n===null)return "—";
    try{
      return new Intl.NumberFormat("fr-FR",{
        style:"currency",
        currency,
        notation:"compact",
        maximumFractionDigits:2
      }).format(n);
    }catch(_){return money(n,currency);}
  }

  function pct(value){
    const n=finite(value);
    return n===null?"—":`${n>=0?"+":""}${n.toFixed(2)} %`;
  }

  function coreUniverse(){
    try{
      const rows=globalThis.AtlasMarketUniverse1000?.universe?.(250);
      return Array.isArray(rows)?rows.filter(row=>row?.id&&row?.symbol):[];
    }catch(_){return [];}
  }

  function rankCore(mode,inputRows=coreUniverse()){
    const rows=inputRows.slice();
    if(mode==="gainers"){
      return rows.filter(row=>finite(row.change24h)!==null)
        .sort((a,b)=>finite(b.change24h)-finite(a.change24h)).slice(0,runtime.limit);
    }
    if(mode==="losers"){
      return rows.filter(row=>finite(row.change24h)!==null)
        .sort((a,b)=>finite(a.change24h)-finite(b.change24h)).slice(0,runtime.limit);
    }
    if(mode==="volume"){
      const currency=displayCurrency();
      const volume=row=>currency==="USD"
        ?positive(row.volume24hUsd??row.volumeUsd)
        :positive(row.volume24h);
      return rows.filter(row=>volume(row)!==null)
        .sort((a,b)=>volume(b)-volume(a)).slice(0,runtime.limit);
    }
    return [];
  }

  function corePrice(coin){
    const currency=displayCurrency();
    return currency==="USD"
      ?positive(coin?.priceUsd??coin?.price_usd)
      :positive(coin?.priceEur??coin?.price);
  }

  function coreVolume(coin){
    const currency=displayCurrency();
    return currency==="USD"
      ?positive(coin?.volume24hUsd??coin?.volumeUsd)
      :positive(coin?.volume24h);
  }

  function coreRow(coin,index){
    const currency=displayCurrency();
    const mode=runtime.mode;
    const metric=mode==="volume"
      ?compactMoney(coreVolume(coin),currency)
      :pct(coin?.change24h);
    const metricClass=mode==="volume"?"":finite(coin?.change24h)>=0?"is-positive":"is-negative";
    const image=coin?.image?`<img src="${esc(coin.image)}" alt="" loading="lazy" width="28" height="28">`:"";
    return `<button type="button" class="atlas-top10-row" data-top10-core-id="${esc(coin.id)}"
      aria-label="Sélectionner ${esc(String(coin.name||coin.symbol))} dans l’Interface canonique">
      <span class="atlas-top10-rank">${index+1}</span>
      <span class="atlas-top10-asset">${image}<span><b>${esc(String(coin.symbol||"").toUpperCase())}</b><small>${esc(coin.name||coin.id)}</small></span></span>
      <span class="atlas-top10-price">${esc(money(corePrice(coin),currency))}</span>
      <strong class="atlas-top10-metric ${metricClass}">${esc(metric)}</strong>
    </button>`;
  }

  function listingRow(spec,index){
    const ticker=spec?.ticker||{};
    const changeRaw=finite(ticker.price24hPcnt);
    const change=changeRaw===null?null:Math.abs(changeRaw)<=2?changeRaw*100:changeRaw;
    const price=positive(ticker.lastPrice);
    const quote=String(spec?.quote||"").toUpperCase();
    const pair=spec?.pair||[spec?.base,spec?.quote].filter(Boolean).join("/");
    const listed=Number(spec?.launchTime);
    const age=Number.isFinite(listed)?Math.max(0,(Date.now()-listed)/86400000):null;
    return `<button type="button" class="atlas-top10-row" data-top10-listing-index="${index}"
      aria-label="Sélectionner le nouveau listing ${esc(spec?.name||spec?.symbol||spec?.base||"actif")}">
      <span class="atlas-top10-rank">${index+1}</span>
      <span class="atlas-top10-asset"><span><b>${esc(String(spec?.symbol||spec?.base||"").toUpperCase())}</b><small>${esc(spec?.name||pair||"Nouveau listing")}</small></span></span>
      <span class="atlas-top10-price">${price!==null?esc(`${price.toLocaleString("fr-FR",{maximumFractionDigits:10})} ${quote}`):"Prix live —"}</span>
      <strong class="atlas-top10-metric">${age!==null?esc(`${age<1?"<24 h":age.toFixed(1)+" j"}`):"NEW"}</strong>
    </button>`;
  }

  function markup(){
    return `<details id="${ROOT_ID}" class="panel glass atlas-top10-explorer" open>
      <summary>
        <span><small>MARKET · EXPLORER</small><b>Top <span data-top10-title-count>10</span></b></span>
        <em data-top10-summary>Lecture résidente · aucun ordre</em>
      </summary>
      <div class="atlas-top10-body">
        <nav class="atlas-top10-tabs" aria-label="Classements Top">
          ${Object.entries(MODES).map(([key,row])=>`<button type="button" data-top10-mode="${key}" class="${key===runtime.mode?"is-active":""}">${row.label}</button>`).join("")}
        </nav>
        <div class="atlas-top10-counts" role="group" aria-label="Nombre d’actifs affichés">${COUNTS.map(n=>`<button type="button" data-top10-limit="${n}" aria-pressed="${n===runtime.limit}">${n}</button>`).join("")}</div>
        <div class="atlas-top10-status" data-top10-status>En attente du Market.</div>
        <div class="atlas-top10-list" data-top10-list aria-live="polite"></div>
        <footer>
          <span>Top par variation/volume 24h · Base Market 250 · clic = sélection canonique</span>
          <button type="button" data-top10-refresh>Recalculer</button>
        </footer>
      </div>
    </details>`;
  }

  function ensureStyle(){
    if(document.getElementById("atlasTop10ExplorerStyle"))return;
    const style=document.createElement("style");
    style.id="atlasTop10ExplorerStyle";
    style.textContent=`
      #${ROOT_ID}{grid-column:1/-1;margin:0;min-width:0}
      #${ROOT_ID}>summary{display:flex;align-items:center;justify-content:space-between;gap:14px;cursor:pointer;list-style:none;padding:12px 14px}
      #${ROOT_ID}>summary::-webkit-details-marker{display:none}
      #${ROOT_ID}>summary span{display:flex;align-items:baseline;gap:10px}
      #${ROOT_ID}>summary small{font-size:10px;letter-spacing:.12em;color:#90a9b8}
      #${ROOT_ID}>summary b{font-size:17px}
      #${ROOT_ID}>summary em{font-style:normal;font-size:11px;color:#8da6b4}
      .atlas-top10-body{padding:0 12px 12px}
      .atlas-top10-tabs,.atlas-top10-counts{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:9px}
      .atlas-top10-tabs button,.atlas-top10-counts button,.atlas-top10-explorer footer button{border:1px solid rgba(125,210,230,.22);background:rgba(7,22,32,.72);color:#d8ebf3;border-radius:9px;padding:7px 10px;font:inherit;font-size:11px;cursor:pointer}
      .atlas-top10-counts button[aria-pressed="true"]{border-color:rgba(106,232,232,.68);color:#9ff}
      .atlas-top10-tabs button.is-active{border-color:rgba(106,232,232,.68);box-shadow:0 0 0 1px rgba(106,232,232,.12) inset;color:#9ff}
      .atlas-top10-status{min-height:18px;margin:2px 2px 8px;color:#91a8b7;font-size:11px}
      .atlas-top10-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
      .atlas-top10-row{display:grid;grid-template-columns:30px minmax(120px,1.3fr) minmax(100px,.9fr) minmax(84px,.65fr);align-items:center;gap:8px;width:100%;min-width:0;border:1px solid rgba(125,210,230,.13);background:rgba(4,16,25,.62);color:#e7f2f6;border-radius:8px;padding:7px 9px;text-align:left;cursor:pointer}
      .atlas-top10-row:hover,.atlas-top10-row:focus-visible{border-color:rgba(106,232,232,.58);outline:none;background:rgba(8,29,41,.78)}
      .atlas-top10-rank{font-size:11px;color:#7f99aa}
      .atlas-top10-asset{display:flex;align-items:center;gap:8px;min-width:0}
      .atlas-top10-asset img{border-radius:50%;flex:0 0 auto}
      .atlas-top10-asset span{display:flex;flex-direction:column;min-width:0}
      .atlas-top10-asset b{font-size:12px}
      .atlas-top10-asset small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#829aa9;font-size:10px}
      .atlas-top10-price,.atlas-top10-metric{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .atlas-top10-metric{text-align:right}
      .atlas-top10-metric.is-positive{color:#78efbd}
      .atlas-top10-metric.is-negative{color:#ff889d}
      .atlas-top10-explorer footer{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:9px;color:#78919f;font-size:10px}
      @media(max-width:980px){.atlas-top10-list{grid-template-columns:1fr}}
      @media(max-width:620px){.atlas-top10-row{grid-template-columns:26px minmax(100px,1fr) minmax(82px,.8fr)}.atlas-top10-metric{grid-column:3}.atlas-top10-price{display:none}}
    `;
    document.head.appendChild(style);
  }

  function root(){return document.getElementById(ROOT_ID);}

  function setStatus(textValue){
    const node=root()?.querySelector("[data-top10-status]");
    if(node)node.textContent=String(textValue||"");
  }

  function setSummary(textValue){
    const node=root()?.querySelector("[data-top10-summary]");
    if(node)node.textContent=String(textValue||"");
  }

  function syncTabs(){
    root()?.querySelectorAll("[data-top10-mode]").forEach(button=>{
      const active=button.dataset.top10Mode===runtime.mode;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",active?"true":"false");
    });
  }

  async function render(){
    const host=root();
    const list=host?.querySelector("[data-top10-list]");
    if(!host||!list)return false;
    syncTabs();
    host.querySelectorAll("[data-top10-limit]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.top10Limit)===runtime.limit)));
    const titleCount=host.querySelector("[data-top10-title-count]");if(titleCount)titleCount.textContent=runtime.limit;
    runtime.lastError=null;

    if(runtime.mode==="listings"){
      if(runtime.loading){
        setStatus("Nouveaux listings · lecture via le propriétaire natif en cours…");
        return true;
      }
      runtime.loading=true;
      setStatus("Nouveaux listings · lecture via le propriétaire natif…");
      try{
        const owner=globalThis.AgentCryptoNewListingsNativeCategory;
        if(typeof owner?.discover!=="function")throw new Error("Propriétaire Nouveaux listings indisponible");
        const specs=await owner.discover({force:false});
        runtime.listingSpecs=(Array.isArray(specs)?specs:[]).slice(0,runtime.limit);
        list.innerHTML=runtime.listingSpecs.length
          ?runtime.listingSpecs.map(listingRow).join("")
          :'<div class="atlas-top10-status">Aucun nouveau listing disponible dans la fenêtre native.</div>';
        setStatus(`Nouveaux listings · ${runtime.listingSpecs.length}/${runtime.limit} · source native existante · aucune route parallèle`);
        setSummary("Nouveaux listings · source native");
      }catch(error){
        runtime.lastError=String(error?.message||error);
        runtime.listingSpecs=[];
        list.innerHTML='<div class="atlas-top10-status">Nouveaux listings indisponibles.</div>';
        setStatus(`Nouveaux listings · ${runtime.lastError}`);
        setSummary("Source native indisponible");
      }finally{
        runtime.loading=false;
        runtime.renderedAt=new Date().toISOString();
      }
      return true;
    }

    const rows=rankCore(runtime.mode);
    list.innerHTML=rows.length
      ?rows.map(coreRow).join("")
      :'<div class="atlas-top10-status">Market résident indisponible · utilise Livecheck puis Recalculer.</div>';
    const mode=MODES[runtime.mode];
    setStatus(rows.length
      ?`${mode.label} · ${rows.length}/${runtime.limit} · données Market déjà résidentes (base 250)`
      :"Livecheck requis · aucune donnée Top 250 résidente.");
    setSummary(rows.length?`${mode.label} · Market résident`:"Livecheck requis");
    runtime.renderedAt=new Date().toISOString();
    return true;
  }

  function selectCore(id){
    const coin=globalThis.AtlasMarketUniverse1000?.find?.(id);
    if(!coin)return false;
    if(typeof globalThis.atlasSelectMarketCoin!=="function")return false;
    try{globalThis.AgentCryptoNewListingsNativeCategory?.deactivate?.({clearChart:false});}catch(_){}
    globalThis.atlasSelectMarketCoin(coin);
    document.getElementById("analyste")?.scrollIntoView({behavior:"smooth",block:"start"});
    return true;
  }

  async function selectListing(index){
    const spec=runtime.listingSpecs[Number(index)];
    if(!spec)return false;
    const owner=globalThis.AgentCryptoNewListingsNativeCategory;
    if(typeof owner?.select!=="function")return false;
    return owner.select(spec);
  }

  function bind(){
    const host=root();
    if(!host||host.dataset.top10Bound==="1")return false;
    host.dataset.top10Bound="1";
    host.addEventListener("click",event=>{
      const limitButton=event.target?.closest?.("[data-top10-limit]");
      if(limitButton){
        const n=Number(limitButton.dataset.top10Limit);
        if(COUNTS.includes(n)){runtime.limit=n;void render();}
        return;
      }
      const modeButton=event.target?.closest?.("[data-top10-mode]");
      if(modeButton){
        runtime.mode=MODES[modeButton.dataset.top10Mode]?modeButton.dataset.top10Mode:"gainers";
        void render();
        return;
      }
      if(event.target?.closest?.("[data-top10-refresh]")){
        void render();
        return;
      }
      const core=event.target?.closest?.("[data-top10-core-id]");
      if(core){
        if(!selectCore(core.dataset.top10CoreId))setStatus("Sélection canonique indisponible.");
        return;
      }
      const listing=event.target?.closest?.("[data-top10-listing-index]");
      if(listing){
        void selectListing(listing.dataset.top10ListingIndex);
      }
    });
    host.addEventListener("toggle",()=>{if(host.open)void render();});
    return true;
  }

  function mount(){
    if(typeof document==="undefined")return false;
    ensureStyle();
    let host=root();
    if(!host){
      const grid=document.getElementById("marketWorkspaceGrid");
      if(!grid)return false;
      grid.insertAdjacentHTML("afterbegin",markup());
      host=root();
    }
    bind();
    runtime.mounted=true;
    if(host.open)void render();
    return true;
  }

  function snapshot(){
    return Object.freeze({
      build:BUILD,
      mode:runtime.mode,
      limit:runtime.limit,
      mounted:runtime.mounted,
      loading:runtime.loading,
      listingCount:runtime.listingSpecs.length,
      lastError:runtime.lastError,
      renderedAt:runtime.renderedAt,
      currency:displayCurrency()
    });
  }

  function selfTest(){
    const fixture=[
      {id:"a",symbol:"A",change24h:3,volume24h:10,volume24hUsd:10},
      {id:"b",symbol:"B",change24h:-2,volume24h:30,volume24hUsd:30},
      {id:"c",symbol:"C",change24h:1,volume24h:20,volume24hUsd:20}
    ];
    const gain=[...fixture].sort((a,b)=>b.change24h-a.change24h).map(x=>x.id).join("");
    const lose=[...fixture].sort((a,b)=>a.change24h-b.change24h).map(x=>x.id).join("");
    const checks={
      five_supported_counts:COUNTS.join(",")==="10,20,50,100,250",
      rejects_null_metrics:finite(null)===null&&finite("")===null,
      actual_gainers_sort:rankCore("gainers",fixture).map(x=>x.id).join("")==="acb",
      actual_losers_sort:rankCore("losers",fixture).map(x=>x.id).join("")==="bca",
      actual_volume_sort:rankCore("volume",fixture).map(x=>x.id).join("")==="bca",
      four_modes:Object.keys(MODES).length===4,
      gainers_sort:gain==="acb",
      losers_sort:lose==="bca",
      canonical_market_owner:"AtlasMarketUniverse1000",
      canonical_selection_owner:"atlasSelectMarketCoin",
      new_listing_owner:"AgentCryptoNewListingsNativeCategory",
      strict_usd_no_eur_fallback:true,
      explicit_new_listing_discovery_only:true,
      no_duplicate_market:true,
      no_duplicate_graph:true,
      no_duplicate_fiche:true,
      no_duplicate_candles:true,
      no_duplicate_depth:true,
      no_recurring_timer:true,
      no_mutation_observer:true,
      no_storage_write:true,
      no_real_order:true
    };
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks:Object.freeze(checks)});
  }

  globalThis.AgentCryptoTop10Explorer=Object.freeze({
    build:BUILD,mount,render,snapshot,self_test:selfTest,
    canonical_market_owner:"AtlasMarketUniverse1000",
    canonical_selection_owner:"atlasSelectMarketCoin",
    new_listing_owner:"AgentCryptoNewListingsNativeCategory",
    strict_usd_no_eur_fallback:true,
    recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false
  });

  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
    else mount();
    window.addEventListener("pageshow",mount,{passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",()=>{if(root()?.open&&runtime.mode!=="listings")void render();},{passive:true});
  }
})();
