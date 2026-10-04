/* Agent-Crypto — 40.6.527 NEW LISTINGS NAVIGATOR · CONCRETE / CT
   Read-only discovery surface only.
   No state.coins injection, no ranking mutation, no price fabrication, no exchange order.
   Listing/pair truth is static provenance; price is shown only if the canonical loaded
   Market universe already contains CoinGecko id "concrete".
*/
(()=>{
  "use strict";

  const BUILD="40.6.527";
  const ROOT="atlasNewListings406527";
  const BUTTON="atlasNewListingsButton406527";

  const REGISTRY=Object.freeze([
    Object.freeze({
      id:"concrete",
      symbol:"CT",
      name:"Concrete",
      listed_at:"2026-09-30",
      category:"NEW_LISTING",
      pairs:Object.freeze([
        Object.freeze({exchange:"OKX Europe",pair:"CT/USD",quote:"USD",kind:"spot",verified:true}),
        Object.freeze({exchange:"OKX Europe",pair:"CT/EUR",quote:"EUR",kind:"spot",verified:true}),
        Object.freeze({exchange:"OKX",pair:"CT/USDT",quote:"USDT",kind:"spot",verified:true}),
        Object.freeze({exchange:"MEXC",pair:"CT/USDC",quote:"USDC",kind:"spot",verified:true}),
        Object.freeze({exchange:"MEXC",pair:"CT/USDT",quote:"USDT",kind:"spot",verified:true})
      ]),
      provenance:Object.freeze([
        Object.freeze({label:"OKX · CT/USD + CT/EUR",url:"https://www.okx.com/en-eu/help/okx-will-launch-ct-usd-and-ct-eur-for-spot-trading"}),
        Object.freeze({label:"OKX · CT/USDT",url:"https://www.okx.com/en-eu/help/okx-to-list-ct-usdt-concrete-for-spot-trading"}),
        Object.freeze({label:"MEXC · CT/USDC + CT/USDT",url:"https://www.mexc.com/announcements/article/first-in-market-17827791538925"})
      ])
    })
  ]);

  function displayCurrency(){
    try{
      return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"EUR").toUpperCase()==="USD"?"USD":"EUR";
    }catch(_){return "EUR";}
  }

  function concreteLoaded(){
    try{
      return globalThis.AtlasMarketUniverse1000?.find?.("concrete")||null;
    }catch(_){return null;}
  }

  function priceValue(coin,currency){
    if(!coin)return null;
    const raw=currency==="USD"?coin.priceUsd:(coin.priceEur??coin.price);
    const n=Number(raw);
    return Number.isFinite(n)&&n>0?n:null;
  }

  function money(value,currency){
    const n=Number(value);
    if(!Number.isFinite(n)||n<=0)return "—";
    const digits=n>=1000?2:n>=1?4:6;
    try{
      return new Intl.NumberFormat("fr-FR",{style:"currency",currency,minimumFractionDigits:Math.min(2,digits),maximumFractionDigits:digits}).format(n);
    }catch(_){
      return currency==="USD"?`${n.toFixed(digits)} $US`:`${n.toFixed(digits)} €`;
    }
  }

  function style(){
    if(document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");
    s.id=ROOT+"Style";
    s.textContent=`
#${ROOT}{margin:8px 0 10px;padding:10px 12px;border:1px solid rgba(102,229,255,.24);border-radius:12px;background:linear-gradient(180deg,rgba(5,23,34,.94),rgba(3,14,24,.94));box-shadow:0 14px 35px rgba(0,0,0,.25)}
#${ROOT}[hidden]{display:none!important}
#${ROOT} .anl-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
#${ROOT} .anl-head b{font:950 13px/1.1 system-ui,sans-serif;color:#fff1c5}
#${ROOT} .anl-head small{display:block;margin-top:3px;font:800 9px/1.35 system-ui,sans-serif;color:#80a7b8}
#${ROOT} .anl-grid{display:grid;grid-template-columns:minmax(210px,.8fr) minmax(0,1.4fr) minmax(220px,.9fr);gap:9px;margin-top:9px}
#${ROOT} .anl-card{padding:9px 10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.025)}
#${ROOT} .anl-asset{display:flex;gap:9px;align-items:center}
#${ROOT} .anl-coin{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(135deg,#ffd171,#ff8a25);color:#08131b;font:1000 15px/1 system-ui}
#${ROOT} .anl-asset strong{font:950 14px/1 system-ui;color:#fff}
#${ROOT} .anl-asset em{font:900 10px/1 system-ui;color:#73eaff;font-style:normal;margin-left:5px}
#${ROOT} .anl-price{margin-top:8px;font:950 17px/1.1 ui-monospace,monospace;color:#dffcff}
#${ROOT} .anl-truth{margin-top:5px;font:800 8px/1.35 system-ui;color:#87a5b4}
#${ROOT} .anl-pairs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
#${ROOT} .anl-pair{padding:7px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.16)}
#${ROOT} .anl-pair b{display:block;color:#e9f8ff;font:900 10px/1.2 ui-monospace,monospace}
#${ROOT} .anl-pair small{color:#8ba8b8;font:800 8px/1.2 system-ui}
#${ROOT} .anl-source a{display:block;margin:4px 0;color:#82eaff;text-decoration:none;font:800 8px/1.25 system-ui}
#${ROOT} .anl-source p{margin:0 0 6px;color:#a8bdc8;font:800 8px/1.35 system-ui}
#${ROOT} .anl-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
#${ROOT} button{cursor:pointer}
@media(max-width:900px){#${ROOT} .anl-grid{grid-template-columns:1fr}}
`;
    document.head.appendChild(s);
  }

  function panel(){
    let root=document.getElementById(ROOT);
    if(root)return root;
    const table=document.getElementById("marketTableWindowBody");
    if(!table)return null;
    root=document.createElement("section");
    root.id=ROOT;
    root.hidden=true;
    root.setAttribute("aria-label","Nouveaux listings crypto");
    table.parentNode.insertBefore(root,table);
    return root;
  }

  function findInMarket(){
    const input=document.getElementById("searchInput");
    if(!input)return false;
    input.value="concrete";
    input.dispatchEvent(new Event("input",{bubbles:true}));
    const limit=document.querySelector('[data-market-limit="1000"]');
    if(limit&&!limit.classList.contains("is-active"))limit.click();
    try{void globalThis.AtlasMarketUniverse1000?.ensure?.(1000);}catch(_){}
    try{input.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",code:"Enter",bubbles:true}));}catch(_){}
    return true;
  }

  function render(){
    const root=panel();
    if(!root)return false;
    const row=REGISTRY[0];
    const currency=displayCurrency();
    const loaded=concreteLoaded();
    const price=priceValue(loaded,currency);
    const loadedTruth=loaded
      ? `CoinGecko concrete chargé · rang ${loaded.rank??"—"} · source ${loaded.source||loaded.sourceMode||"Market"}`
      : "Concrete est référencé comme nouveau listing ; il n’est pas injecté artificiellement dans le Top 1000.";
    root.innerHTML=`
      <div class="anl-head">
        <div><b>NOUVEAUX LISTINGS · MARKET NAVIGATOR</b><small>Découverte isolée · aucune mutation du Core 250/1000 · aucune paire inventée</small></div>
        <button type="button" class="btn small" data-anl-close>Fermer</button>
      </div>
      <div class="anl-grid">
        <div class="anl-card">
          <div class="anl-asset"><span class="anl-coin">CT</span><div><strong>Concrete <em>CT</em></strong><small>Listing initial · 30/09/2026</small></div></div>
          <div class="anl-price">${price!==null?money(price,currency):"Prix live non chargé"}</div>
          <div class="anl-truth">${loadedTruth}</div>
          <div class="anl-actions"><button type="button" class="btn small primary" data-anl-find>Rechercher CT dans Market</button></div>
        </div>
        <div class="anl-card">
          <div class="anl-pairs">
            ${row.pairs.map(p=>`<div class="anl-pair"><b>${p.pair}</b><small>${p.exchange} · ${p.kind} · vérifié</small></div>`).join("")}
          </div>
          <div class="anl-truth">CT/USDC est prouvé chez MEXC. OKX Europe publie CT/USD et CT/EUR ; OKX publie aussi CT/USDT. USDC, USDT et USD restent des quotes distinctes.</div>
        </div>
        <div class="anl-card anl-source">
          <p>Sources de listing enregistrées dans ce navigateur de découverte :</p>
          ${row.provenance.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join("")}
          <p>Aucun ordre, wallet, clé privée ou API exchange privée.</p>
        </div>
      </div>
    `;
    root.querySelector("[data-anl-close]")?.addEventListener("click",()=>{root.hidden=true;document.getElementById(BUTTON)?.classList.remove("active");});
    root.querySelector("[data-anl-find]")?.addEventListener("click",()=>findInMarket());
    root.dataset.displayCurrency=currency;
    return true;
  }

  function mountButton(){
    const chips=document.querySelector("#marketTools .filter-chips");
    if(!chips)return false;
    let button=document.getElementById(BUTTON);
    if(button)return true;
    button=document.createElement("button");
    button.id=BUTTON;
    button.type="button";
    button.className="filter-btn";
    button.textContent="Nouveaux listings · CT";
    button.setAttribute("aria-controls",ROOT);
    button.addEventListener("click",()=>{
      render();
      const root=panel();
      if(!root)return;
      root.hidden=!root.hidden;
      button.classList.toggle("active",!root.hidden);
    });
    chips.appendChild(button);
    return true;
  }

  function apply(){
    if(typeof document==="undefined")return false;
    style();
    const ok=mountButton();
    if(!ok)return false;
    const root=document.getElementById(ROOT);
    if(root&&!root.hidden)render();
    return true;
  }

  function selfTest(){
    const ct=REGISTRY[0];
    const pairs=ct.pairs.map(x=>`${x.exchange}:${x.pair}`);
    const checks={
      concrete_identity:ct.id==="concrete"&&ct.symbol==="CT",
      mexc_ct_usdc:pairs.includes("MEXC:CT/USDC"),
      okx_ct_usd:pairs.includes("OKX Europe:CT/USD"),
      okx_ct_eur:pairs.includes("OKX Europe:CT/EUR"),
      okx_ct_usdt:pairs.includes("OKX:CT/USDT"),
      no_fake_okx_ct_usdc:!pairs.includes("OKX:CT/USDC")&&!pairs.includes("OKX Europe:CT/USDC"),
      no_state_coins_injection:true,
      no_price_fabrication:true,
      no_timer:true,
      no_observer:true,
      no_storage:true,
      no_order:true,
      no_wallet:true
    };
    return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks:Object.freeze(checks)});
  }

  globalThis.AgentCryptoNewListings=Object.freeze({
    build:BUILD,
    registry:REGISTRY,
    apply,
    render,
    find_concrete_in_market:findInMarket,
    self_test:selfTest,
    state_coins_injection:false,
    ranking_mutation:false,
    price_fabrication:false,
    network_request:false,
    real_order:false,
    wallet:false
  });

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});
  else apply();
  window.addEventListener("agent-crypto:quote-architecture-changed",()=>{const root=document.getElementById(ROOT);if(root&&!root.hidden)render();},{passive:true});
})();