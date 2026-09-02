(() => {
  "use strict";

  const BUILD = "40.4.181";
  const REVISION = "V1";
  const CONTRACT = "DOMAIN_SKELETON_MIRROR_404174";
  const ORDER = Object.freeze([
    Object.freeze({ id:"crypto", label:"CRYPTO", title:"Crypto", mode:"native", native:"crypto" }),
    Object.freeze({ id:"metals", label:"MÉTAUX", title:"Métaux précieux et industriels", mode:"native", native:"metals" }),
    Object.freeze({ id:"indices", label:"INDICES", title:"Indices / Bourse", mode:"parallel" }),
    Object.freeze({ id:"energy", label:"ÉNERGIE", title:"Énergie & matières premières", mode:"parallel" }),
    Object.freeze({ id:"cross-market", label:"CROSS", title:"Cross-Market Observatory", mode:"parallel" })
  ]);

  let current = "crypto", nativeBypass = false;
  const byId = id => document.getElementById(id);
  const specFor = id => ORDER.find(x => x.id === id) || ORDER[0];
  const indexOf = id => Math.max(0, ORDER.findIndex(x => x.id === id));
  const nextOf = id => ORDER[(indexOf(id) + 1) % ORDER.length];
  const isParallel = id => specFor(id).mode === "parallel";

  function nativeDomain(){
    const b = byId("atlasMarketDomainSwitch");
    return String(b?.dataset?.domain || "crypto") === "metals" ? "metals" : "crypto";
  }

  function forceHidden(node, hidden){
    if(!node) return;
    node.classList.toggle("atlas-market-force-hidden-404168", hidden);
    if(hidden) node.setAttribute("aria-hidden", "true");
    else node.removeAttribute("aria-hidden");
  }

  function emitDomain(domain){
    try{
      document.dispatchEvent(new CustomEvent("erith:market-domain-change", { detail:{ domain, build:BUILD, contract:CONTRACT } }));
    }catch(_){}
  }

  function captureCryptoGeometry(){
    if(current !== "crypto") return;
    const shell = document.querySelector("#analyste .chart-shell");
    const rail = byId("detailPanel");
    const toolbar = document.querySelector("#analyste .chart-v2-recovery-line");
    const deck = byId("analyste");
    if(!shell || !deck) return;
    const sr = shell.getBoundingClientRect();
    const rr = rail?.getBoundingClientRect();
    const tr = toolbar?.getBoundingClientRect();
    if(sr.height > 240) deck.style.setProperty("--atlas-market-master-shell-h", `${Math.round(sr.height)}px`);
    if(rr?.height > 240) deck.style.setProperty("--atlas-market-master-rail-h", `${Math.round(rr.height)}px`);
    if(rr?.width > 220) deck.style.setProperty("--atlas-market-master-rail-w", `${Math.round(rr.width)}px`);
    if(tr?.height > 28) deck.style.setProperty("--atlas-market-master-toolbar-h", `${Math.round(tr.height)}px`);
    document.documentElement.dataset.cryptoSkeletonGeometry404174 = "captured";
  }

  function installFixedAnchor(){
    const deck = byId("analyste"), button = byId("atlasMarketDomainSwitch");
    if(!deck || !button) return false;
    let slot = byId("atlasFixedMarketAnchorSlot404168");
    if(!slot){
      slot = document.createElement("div");
      slot.id = "atlasFixedMarketAnchorSlot404168";
      slot.className = "atlas-fixed-market-anchor-slot-404168";
      slot.setAttribute("aria-label", "Sélecteur cyclique de marché");
      deck.prepend(slot);
    }
    if(button.parentElement !== slot) slot.appendChild(button);
    button.classList.add("atlas-fixed-market-anchor-button-404168");
    button.dataset.fixedMarketAnchor404168 = "locked";
    return true;
  }

  function ensureHosts(){
    const chartShell = document.querySelector("#analyste .chart-shell");
    const recovery = document.querySelector("#analyste .chart-v2-recovery-line");
    const metalsDetail = byId("atlasMetalsDetailPanel");
    if(!chartShell || !recovery || !metalsDetail || !installFixedAnchor()) return false;

    if(!byId("atlasCyclicMarketInertStage404168")){
      const stage = document.createElement("section");
      stage.id = "atlasCyclicMarketInertStage404168";
      stage.className = "atlas-cyclic-market-inert-stage-404168";
      stage.hidden = true;
      stage.innerHTML = `<div class="atlas-cyclic-market-inert-grid-404168" aria-live="polite"><div class="atlas-cyclic-market-inert-hero-404168"><small>ERITH.IA · MARKETS OBSERVATORY</small><h3 data-cyclic-market-title>Marché parallèle</h3><p data-cyclic-market-description>Chargement de la Source Truth publique.</p><div class="atlas-cyclic-market-inert-line-404168"></div></div><div class="atlas-cyclic-market-inert-gates-404168"><span><small>SOURCE TRUTH</small><b>CHARGEMENT</b></span><span><small>HISTORIQUE</small><b>VÉRIFICATION</b></span><span><small>UNITÉS</small><b>EXPLICITES</b></span><span><small>MOTEUR</small><b>OBSERVATION</b></span></div><footer><b>AUCUN PRIX INVENTÉ</b><span>Squelette Crypto miroir · contenu métier séparé.</span></footer></div>`;
      chartShell.appendChild(stage);
    }

    if(!byId("atlasCyclicMarketMirrorToolbar404168")){
      const t = document.createElement("div");
      t.id = "atlasCyclicMarketMirrorToolbar404168";
      t.className = "atlas-cyclic-market-mirror-toolbar-404168";
      t.hidden = true;
      t.innerHTML = `<span class="mirror-group"><small>VUE</small><b class="active">Base 100</b></span><span class="mirror-group"><small>PÉRIODE</small><b>24h</b><b>7j</b><b>30j</b><b>90j</b><b>1a</b></span><span class="mirror-group"><small>SECTION</small><b data-cyclic-market-toolbar-state>Source Truth publique</b></span>`;
      recovery.appendChild(t);
    }

    if(!byId("atlasCyclicMarketInertDetail404168")){
      const d = document.createElement("article");
      d.id = "atlasCyclicMarketInertDetail404168";
      d.className = "panel glass atlas-cyclic-market-inert-detail-404168";
      d.hidden = true;
      d.innerHTML = `<header><span class="eyebrow">DÉTAIL ACTIF</span><strong data-cyclic-market-detail-title>Marché parallèle</strong><small>Observation seulement · Source Truth publique</small></header><div class="atlas-cyclic-market-inert-detail-state-404168"><span><small>État</small><b>CHARGEMENT</b></span><span><small>Collecte</small><b>LECTURE PUBLIQUE</b></span></div><section><b>Intégrité</b><p>Aucune valeur inventée. Les unités, sources et historiques restent séparés.</p></section>`;
      metalsDetail.insertAdjacentElement("afterend", d);
    }
    return true;
  }

  function setParallelPlaceholder(domain){
    const s = specFor(domain);
    const stage = byId("atlasCyclicMarketInertStage404168");
    const toolbar = byId("atlasCyclicMarketMirrorToolbar404168");
    const detail = byId("atlasCyclicMarketInertDetail404168");
    const title = stage?.querySelector("[data-cyclic-market-title]");
    const desc = stage?.querySelector("[data-cyclic-market-description]");
    const state = toolbar?.querySelector("[data-cyclic-market-toolbar-state]");
    const detailTitle = detail?.querySelector("[data-cyclic-market-detail-title]");
    if(title) title.textContent = s.title;
    if(desc) desc.textContent = "Chargement du domaine public dans le squelette Crypto miroir.";
    if(state) state.textContent = `${s.label} · PUBLIC`;
    if(detailTitle) detailTitle.textContent = `Lecture ${s.title}`;
  }

  function syncPanels(domain){
    const parallel = isParallel(domain);
    const cryptoDetail = byId("detailPanel");
    const metalsDetail = byId("atlasMetalsDetailPanel");
    const parallelDetail = byId("atlasCyclicMarketInertDetail404168");
    const cryptoToolbar = document.querySelector("#analyste .chart-v2-toolbar");
    const metalsToolbar = byId("atlasMetalsUnifiedToolbar");
    const mirrorToolbar = byId("atlasCyclicMarketMirrorToolbar404168");
    const stage = byId("atlasCyclicMarketInertStage404168");

    forceHidden(cryptoDetail, domain !== "crypto");
    forceHidden(metalsDetail, domain !== "metals");
    forceHidden(cryptoToolbar, domain !== "crypto");
    forceHidden(metalsToolbar, domain !== "metals");

    if(stage) stage.hidden = !parallel;
    if(mirrorToolbar) mirrorToolbar.hidden = !parallel;
    if(parallelDetail) parallelDetail.hidden = !parallel;
    if(parallel) setParallelPlaceholder(domain);
  }

  function updateButton(domain){
    const b = byId("atlasMarketDomainSwitch"), v = byId("atlasMarketDomainSwitchValue");
    if(!b || !v) return;
    const s = specFor(domain), n = nextOf(domain);
    v.textContent = s.label;
    b.dataset.cyclicMarketDomain = s.id;
    b.dataset.marketAnchorDomain = s.id;
    b.dataset.cyclicMarketNext = n.id;
    b.setAttribute("aria-label", `Marché ${s.title}. Cliquer pour afficher ${n.title}.`);
    b.title = `Suivant : ${n.title}`;
  }

  function ensureNativeDomain(target){
    const b = byId("atlasMarketDomainSwitch");
    if(!b || !["crypto","metals"].includes(target) || nativeDomain() === target) return;
    nativeBypass = true;
    try{ b.click(); }catch(_){}
    nativeBypass = false;
  }

  function applyDomain(domain, options={}){
    const s = specFor(domain);
    current = s.id;
    const html = document.documentElement;
    html.dataset.cyclicMarketDomain = s.id;
    html.dataset.cyclicMarketMode = s.mode;
    html.dataset.cyclicMarketRevision = REVISION;
    html.dataset.marketSkeleton = "crypto-master-mirror";
    if(s.mode === "native" && !options.nativeAlreadyHandled) ensureNativeDomain(s.native);
    requestAnimationFrame(() => {
      syncPanels(s.id);
      updateButton(s.id);
      if(s.id === "crypto") captureCryptoGeometry();
      emitDomain(s.id);
    });
  }

  function onMarketSwitchClick(event){
    if(nativeBypass) return;
    const next = nextOf(current);
    if(current === "crypto") captureCryptoGeometry();
    if(current === "crypto" && next.id === "metals"){
      current = "metals";
      const html = document.documentElement;
      html.dataset.cyclicMarketDomain = "metals";
      html.dataset.cyclicMarketMode = "native";
      html.dataset.marketSkeleton = "crypto-master-mirror";
      requestAnimationFrame(() => { syncPanels("metals"); updateButton("metals"); emitDomain("metals"); });
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    applyDomain(next.id);
  }

  function init(){
    document.getElementById("atlasTrueMarketStackMetals404167R1")?.remove();
    document.getElementById("atlasMarketCascade404167")?.remove();
    if(!ensureHosts()){
      document.documentElement.dataset.domainSkeletonMirror404174 = "missing-owner";
      return;
    }
    current = nativeDomain();
    const b = byId("atlasMarketDomainSwitch");
    b.dataset.domainSkeletonMirror404174 = "bound";
    b.addEventListener("click", onMarketSwitchClick, true);
    applyDomain(current, { nativeAlreadyHandled:true });
    requestAnimationFrame(captureCryptoGeometry);
    document.documentElement.dataset.domainSkeletonMirror404174 = "ready";
    globalThis.ErithDomainSkeletonMirror404174 = Object.freeze({
      build:BUILD, revision:REVISION, contract:CONTRACT,
      order:ORDER.map(x => x.id), current:() => current,
      next:() => applyDomain(nextOf(current).id), go:d => applyDomain(specFor(d).id),
      master:"crypto", native_domains:["crypto","metals"], parallel_domains:["indices","energy","cross-market"],
      fixed_anchor:true, fixed_chart_slot:true, fixed_right_rail_slot:true, geometry_from_crypto:true,
      single_cockpit_surface:true, new_chart_engine:false, new_timer:false, new_observer:false, new_storage_owner:false
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
